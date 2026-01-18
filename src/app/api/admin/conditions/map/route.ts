import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/conditions/map
 * Map a term to a condition in the taxonomy
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { term, conditionId, sourceType = 'keyword', isPrimary = true } = body;

    if (!term || !conditionId) {
      return NextResponse.json(
        { error: 'term and conditionId are required' },
        { status: 400 }
      );
    }

    // 1. Create the term mapping
    const { error: mappingError } = await supabase
      .from('term_mappings')
      .upsert({
        source_type: sourceType,
        source_term: term.toLowerCase(),
        maps_to: conditionId,
        confidence: 1.0,
        is_primary: isPrimary,
        created_by: 'admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'source_type,source_term'
      });

    if (mappingError) {
      return NextResponse.json({ error: mappingError.message }, { status: 500 });
    }

    // 2. Update suggested_mappings status to 'mapped'
    await supabase
      .from('suggested_mappings')
      .update({
        status: 'mapped',
        suggested_condition_id: conditionId,
        reviewed_by: 'admin',
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('term', term.toLowerCase());

    // 3. Re-resolve studies that have this term
    const { data: affectedStudies } = await supabase
      .from('study_raw_terms')
      .select('study_id')
      .ilike('term', term);

    const affectedStudyIds = [...new Set((affectedStudies || []).map(s => s.study_id))];

    // Update study_conditions for affected studies
    for (const studyId of affectedStudyIds.slice(0, 100)) { // Limit to 100 for performance
      await supabase
        .from('study_conditions')
        .upsert({
          study_id: studyId,
          condition_id: conditionId,
          relevance: 'primary',
          confidence: 1.0,
          source_count: 1,
          sources: ['admin_mapping'],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'study_id,condition_id'
        });
    }

    // 4. Update condition study count
    const { count } = await supabase
      .from('study_conditions')
      .select('*', { count: 'exact', head: true })
      .eq('condition_id', conditionId);

    await supabase
      .from('condition_taxonomy')
      .update({
        study_count: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', conditionId);

    return NextResponse.json({
      success: true,
      message: `Mapped "${term}" to condition`,
      affectedStudies: affectedStudyIds.length
    });

  } catch (error) {
    console.error('[Map API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
