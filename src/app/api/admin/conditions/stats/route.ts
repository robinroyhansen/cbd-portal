import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/conditions/stats
 * Get mapping health statistics
 */
export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get total raw terms
    const { count: totalRawTerms } = await supabase
      .from('study_raw_terms')
      .select('*', { count: 'exact', head: true })
      .eq('is_health_related', true);

    // Get unique raw terms
    const { data: uniqueTermsData } = await supabase
      .from('study_raw_terms')
      .select('term')
      .eq('is_health_related', true);

    const uniqueTerms = new Set((uniqueTermsData || []).map(t => t.term.toLowerCase()));

    // Get term mappings count
    const { count: termMappingsCount } = await supabase
      .from('term_mappings')
      .select('*', { count: 'exact', head: true });

    // Get mapped terms (terms that have a mapping)
    const { data: mappings } = await supabase
      .from('term_mappings')
      .select('source_term');

    const mappedTerms = new Set((mappings || []).map(m => m.source_term.toLowerCase()));

    // Calculate unmapped unique terms
    let unmappedCount = 0;
    for (const term of uniqueTerms) {
      if (!mappedTerms.has(term)) {
        unmappedCount++;
      }
    }

    // Get conditions with studies
    const { count: conditionsWithStudies } = await supabase
      .from('condition_taxonomy')
      .select('*', { count: 'exact', head: true })
      .gt('study_count', 0)
      .eq('enabled', true);

    // Get total conditions
    const { count: totalConditions } = await supabase
      .from('condition_taxonomy')
      .select('*', { count: 'exact', head: true })
      .eq('enabled', true);

    // Get study resolution stats
    const { count: totalApprovedStudies } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { data: studiesWithConditions } = await supabase
      .from('study_conditions')
      .select('study_id');

    const resolvedStudyIds = new Set((studiesWithConditions || []).map(s => s.study_id));

    // Get pending unmapped terms count
    const { count: pendingUnmapped } = await supabase
      .from('suggested_mappings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get top conditions by study count
    const { data: topConditions } = await supabase
      .from('condition_taxonomy')
      .select('name, study_count, human_study_count')
      .eq('enabled', true)
      .gt('study_count', 0)
      .order('study_count', { ascending: false })
      .limit(10);

    const mappedCount = uniqueTerms.size - unmappedCount;
    const mappedPercentage = uniqueTerms.size > 0
      ? Math.round((mappedCount / uniqueTerms.size) * 100)
      : 0;

    const resolvedPercentage = (totalApprovedStudies || 0) > 0
      ? Math.round((resolvedStudyIds.size / (totalApprovedStudies || 1)) * 100)
      : 0;

    return NextResponse.json({
      terms: {
        totalRawTerms: totalRawTerms || 0,
        uniqueTerms: uniqueTerms.size,
        mappedTerms: mappedCount,
        unmappedTerms: unmappedCount,
        mappedPercentage,
        termMappingsCount: termMappingsCount || 0
      },
      conditions: {
        total: totalConditions || 0,
        withStudies: conditionsWithStudies || 0,
        topConditions: topConditions || []
      },
      studies: {
        totalApproved: totalApprovedStudies || 0,
        resolved: resolvedStudyIds.size,
        resolvedPercentage,
        pendingUnmapped: pendingUnmapped || 0
      }
    });

  } catch (error) {
    console.error('[Stats API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
