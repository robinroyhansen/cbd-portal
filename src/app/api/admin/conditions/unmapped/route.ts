import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface UnmappedTerm {
  id: string;
  term: string;
  originalTerm: string;
  studyCount: number;
  sources: string[];
  sampleTitles: string[];
  suggestedConditionId: string | null;
  suggestedConditionName: string | null;
  status: string;
}

/**
 * GET /api/admin/conditions/unmapped
 * Returns unmapped terms sorted by study count
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'pending';

    // First try suggested_mappings table
    const { data: suggestedMappings, error: suggestedError } = await supabase
      .from('suggested_mappings')
      .select(`
        *,
        condition_taxonomy:suggested_condition_id (name)
      `)
      .eq('status', status)
      .order('study_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (suggestedError && suggestedError.code !== '42P01') {
      // If table doesn't exist, we'll fall back to raw terms view
      console.error('[Unmapped API] Error fetching suggested_mappings:', suggestedError.message);
    }

    // If we have suggested mappings data, use it
    if (suggestedMappings && suggestedMappings.length > 0) {
      const terms: UnmappedTerm[] = suggestedMappings.map(sm => ({
        id: sm.id,
        term: sm.term,
        originalTerm: sm.original_term || sm.term,
        studyCount: sm.study_count || 0,
        sources: [], // Will be populated from raw terms if needed
        sampleTitles: sm.sample_titles || [],
        suggestedConditionId: sm.suggested_condition_id,
        suggestedConditionName: sm.condition_taxonomy?.name || null,
        status: sm.status
      }));

      // Get total count
      const { count } = await supabase
        .from('suggested_mappings')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      return NextResponse.json({
        terms,
        total: count || 0,
        offset,
        limit
      });
    }

    // Fallback: Use the unmapped_terms_ranked view
    const { data: rawUnmapped, error: viewError } = await supabase
      .from('unmapped_terms_ranked')
      .select('*')
      .order('study_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (viewError) {
      // View might not exist yet
      if (viewError.code === '42P01') {
        return NextResponse.json({
          terms: [],
          total: 0,
          offset,
          limit,
          message: 'No unmapped terms table/view found. Run migrations first.'
        });
      }
      return NextResponse.json({ error: viewError.message }, { status: 500 });
    }

    const terms: UnmappedTerm[] = (rawUnmapped || []).map(rt => ({
      id: rt.term, // Use term as ID for now
      term: rt.term,
      originalTerm: rt.term,
      studyCount: rt.study_count || 0,
      sources: rt.sources || [],
      sampleTitles: [], // Not available from view
      suggestedConditionId: null,
      suggestedConditionName: null,
      status: 'pending'
    }));

    return NextResponse.json({
      terms,
      total: terms.length,
      offset,
      limit
    });

  } catch (error) {
    console.error('[Unmapped API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
