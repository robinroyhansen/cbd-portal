import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';
import { resolveStudyConditions, resolveAllPendingStudies } from '@/lib/scanner/term-resolver';

/**
 * Test endpoint for the Condition Intelligence System term resolver
 *
 * GET: Run resolver on 10 studies with raw terms and return detailed results
 * POST: Run batch resolver on all pending studies
 */

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find 10 studies that have raw terms
    const { data: studiesWithTerms, error: fetchError } = await supabase
      .from('study_raw_terms')
      .select('study_id, kb_research_queue!inner(id, title, status)')
      .eq('kb_research_queue.status', 'approved')
      .limit(100);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!studiesWithTerms || studiesWithTerms.length === 0) {
      return NextResponse.json({
        message: 'No studies with raw terms found',
        hint: 'Run a scan with OpenAlex, ClinicalTrials.gov, or Europe PMC to capture raw terms'
      });
    }

    // Get unique study IDs
    const uniqueStudyIds = [...new Set(studiesWithTerms.map(s => s.study_id))].slice(0, 10);

    const results: Array<{
      studyId: string;
      title: string;
      rawTermsCount: number;
      mappedConditions: Array<{
        name: string;
        relevance: string;
        confidence: number;
        sources: string[];
      }>;
      unmappedTerms: string[];
    }> = [];

    for (const studyId of uniqueStudyIds) {
      // Get study details
      const { data: study } = await supabase
        .from('kb_research_queue')
        .select('title')
        .eq('id', studyId)
        .single();

      // Get raw terms count
      const { count: rawTermsCount } = await supabase
        .from('study_raw_terms')
        .select('*', { count: 'exact', head: true })
        .eq('study_id', studyId);

      // Run resolver
      const result = await resolveStudyConditions(supabase, studyId);

      // Get condition names for mapped conditions
      const mappedWithNames = [];
      for (const mapped of result.mapped) {
        const { data: condition } = await supabase
          .from('condition_taxonomy')
          .select('name')
          .eq('id', mapped.conditionId)
          .single();

        mappedWithNames.push({
          name: condition?.name || 'Unknown',
          relevance: mapped.relevance,
          confidence: mapped.confidence,
          sources: mapped.sources
        });
      }

      results.push({
        studyId,
        title: study?.title || 'Unknown',
        rawTermsCount: rawTermsCount || 0,
        mappedConditions: mappedWithNames,
        unmappedTerms: result.unmapped.slice(0, 10) // Limit to 10
      });
    }

    // Get summary stats
    const totalMapped = results.reduce((sum, r) => sum + r.mappedConditions.length, 0);
    const totalUnmapped = results.reduce((sum, r) => sum + r.unmappedTerms.length, 0);

    // Get condition distribution
    const conditionCounts = new Map<string, number>();
    for (const result of results) {
      for (const condition of result.mappedConditions) {
        conditionCounts.set(condition.name, (conditionCounts.get(condition.name) || 0) + 1);
      }
    }

    const topConditions = Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      summary: {
        studiesProcessed: results.length,
        totalMappedConditions: totalMapped,
        totalUnmappedTerms: totalUnmapped,
        avgConditionsPerStudy: (totalMapped / results.length).toFixed(1)
      },
      topConditions,
      results
    });

  } catch (error) {
    console.error('[TestResolver] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Run batch resolver
    const result = await resolveAllPendingStudies(supabase, 50);

    return NextResponse.json({
      message: 'Batch resolution complete',
      ...result
    });

  } catch (error) {
    console.error('[TestResolver] Batch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
