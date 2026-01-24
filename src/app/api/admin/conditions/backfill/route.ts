import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/conditions/backfill
 * Run the batch resolver on all studies with raw terms
 *
 * GET /api/admin/conditions/backfill
 * Check backfill status and database health
 */

export async function GET(request: NextRequest) {
  try {
  const authError = requireAdminAuth(request);
  if (authError) return authError;
const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check all tables exist
    const tableChecks = await Promise.all([
      checkTable(supabase, 'condition_taxonomy'),
      checkTable(supabase, 'study_raw_terms'),
      checkTable(supabase, 'term_mappings'),
      checkTable(supabase, 'study_conditions'),
      checkTable(supabase, 'suggested_mappings')
    ]);

    const tables = {
      condition_taxonomy: tableChecks[0],
      study_raw_terms: tableChecks[1],
      term_mappings: tableChecks[2],
      study_conditions: tableChecks[3],
      suggested_mappings: tableChecks[4]
    };

    // Get counts
    const { count: rawTermsCount } = await supabase
      .from('study_raw_terms')
      .select('*', { count: 'exact', head: true });

    const { count: conditionsCount } = await supabase
      .from('condition_taxonomy')
      .select('*', { count: 'exact', head: true });

    const { count: mappingsCount } = await supabase
      .from('term_mappings')
      .select('*', { count: 'exact', head: true });

    const { count: studyConditionsCount } = await supabase
      .from('study_conditions')
      .select('*', { count: 'exact', head: true });

    const { count: approvedStudies } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Get unique studies with raw terms
    const { data: studiesWithTerms } = await supabase
      .from('study_raw_terms')
      .select('study_id');

    const uniqueStudiesWithTerms = new Set((studiesWithTerms || []).map(s => s.study_id));

    // Get unique studies with conditions
    const { data: studiesWithConditions } = await supabase
      .from('study_conditions')
      .select('study_id');

    const uniqueStudiesWithConditions = new Set((studiesWithConditions || []).map(s => s.study_id));

    // Calculate pending
    const pendingStudies = [...uniqueStudiesWithTerms].filter(id => !uniqueStudiesWithConditions.has(id));

    return NextResponse.json({
      tables,
      counts: {
        conditions: conditionsCount || 0,
        termMappings: mappingsCount || 0,
        rawTerms: rawTermsCount || 0,
        studyConditions: studyConditionsCount || 0,
        approvedStudies: approvedStudies || 0
      },
      backfill: {
        studiesWithRawTerms: uniqueStudiesWithTerms.size,
        studiesResolved: uniqueStudiesWithConditions.size,
        pendingStudies: pendingStudies.length,
        resolutionRate: uniqueStudiesWithTerms.size > 0
          ? Math.round((uniqueStudiesWithConditions.size / uniqueStudiesWithTerms.size) * 100)
          : 0
      }
    });

  } catch (error) {
    console.error('[Backfill Status] Error:', error);
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get studies with raw terms that don't have conditions yet
    const { data: studiesWithTerms } = await supabase
      .from('study_raw_terms')
      .select('study_id')
      .limit(10000);

    if (!studiesWithTerms || studiesWithTerms.length === 0) {
      return NextResponse.json({
        message: 'No studies with raw terms found',
        resolved: 0,
        pending: 0
      });
    }

    const uniqueStudyIds = [...new Set(studiesWithTerms.map(s => s.study_id))];

    // Find which ones already have conditions
    const { data: alreadyResolved } = await supabase
      .from('study_conditions')
      .select('study_id')
      .in('study_id', uniqueStudyIds.slice(0, 1000));

    const resolvedSet = new Set((alreadyResolved || []).map(s => s.study_id));
    const pendingIds = uniqueStudyIds.filter(id => !resolvedSet.has(id)).slice(0, limit);

    if (pendingIds.length === 0) {
      return NextResponse.json({
        message: 'All studies already resolved',
        resolved: resolvedSet.size,
        pending: 0
      });
    }

    // Process studies
    let resolved = 0;
    let failed = 0;
    const allUnmapped: string[] = [];
    const conditionHits = new Map<string, number>();

    for (const studyId of pendingIds) {
      try {
        const result = await resolveStudy(supabase, studyId);
        if (result.mapped.length > 0) {
          resolved++;
          for (const m of result.mapped) {
            conditionHits.set(m.conditionName, (conditionHits.get(m.conditionName) || 0) + 1);
          }
        }
        allUnmapped.push(...result.unmapped);
      } catch (error) {
        failed++;
      }
    }

    // Aggregate unmapped terms
    const termCounts = new Map<string, number>();
    for (const term of allUnmapped) {
      const lower = term.toLowerCase();
      termCounts.set(lower, (termCounts.get(lower) || 0) + 1);
    }

    const topUnmapped = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([term, count]) => ({ term, count }));

    const topConditions = Array.from(conditionHits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      message: 'Backfill complete',
      stats: {
        processed: pendingIds.length,
        resolved,
        failed,
        remaining: uniqueStudyIds.length - resolvedSet.size - resolved
      },
      topConditions,
      topUnmapped
    });

  } catch (error) {
    console.error('[Backfill] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function checkTable(supabase: any, tableName: string): Promise<{ exists: boolean; count: number }> {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  return {
    exists: !error || error.code !== '42P01',
    count: count || 0
  };
}

async function resolveStudy(supabase: any, studyId: string): Promise<{
  mapped: { conditionId: string; conditionName: string }[];
  unmapped: string[];
}> {
  const mapped: { conditionId: string; conditionName: string }[] = [];
  const unmapped: string[] = [];

  // Get raw terms
  const { data: rawTerms } = await supabase
    .from('study_raw_terms')
    .select('*')
    .eq('study_id', studyId)
    .eq('is_health_related', true);

  if (!rawTerms || rawTerms.length === 0) {
    return { mapped, unmapped };
  }

  // Get term mappings
  const { data: termMappings } = await supabase
    .from('term_mappings')
    .select('*');

  // Get conditions
  const { data: conditions } = await supabase
    .from('condition_taxonomy')
    .select('*')
    .eq('enabled', true);

  if (!conditions) return { mapped, unmapped };

  // Build lookup maps
  const mappingsByTerm = new Map<string, any>();
  for (const m of termMappings || []) {
    mappingsByTerm.set(m.source_term.toLowerCase(), m);
  }

  const conditionsById = new Map<string, any>();
  const conditionsBySynonym = new Map<string, any>();

  for (const c of conditions) {
    conditionsById.set(c.id, c);
    if (c.synonyms) {
      for (const s of c.synonyms) {
        conditionsBySynonym.set(s.toLowerCase(), c);
      }
    }
  }

  // Process terms
  const matchedConditions = new Map<string, { condition: any; confidence: number; sources: string[] }>();

  for (const rawTerm of rawTerms) {
    const termLower = rawTerm.term.toLowerCase();
    let matchedCondition: any = null;
    let confidence = rawTerm.confidence || 1.0;

    // Check mappings
    const mapping = mappingsByTerm.get(termLower);
    if (mapping) {
      matchedCondition = conditionsById.get(mapping.maps_to);
      confidence = Math.min(confidence, mapping.confidence);
    }

    // Check synonyms
    if (!matchedCondition) {
      matchedCondition = conditionsBySynonym.get(termLower);
    }

    if (matchedCondition) {
      const existing = matchedConditions.get(matchedCondition.id);
      if (existing) {
        existing.confidence = Math.max(existing.confidence, confidence);
        if (!existing.sources.includes(rawTerm.source)) {
          existing.sources.push(rawTerm.source);
        }
      } else {
        matchedConditions.set(matchedCondition.id, {
          condition: matchedCondition,
          confidence,
          sources: [rawTerm.source]
        });
      }
    } else if (!isSkipTerm(termLower)) {
      unmapped.push(rawTerm.term);
    }
  }

  // Save to study_conditions
  if (matchedConditions.size > 0) {
    const rows = Array.from(matchedConditions.entries()).map(([conditionId, data]) => ({
      study_id: studyId,
      condition_id: conditionId,
      relevance: data.sources.length >= 2 ? 'primary' : 'secondary',
      confidence: data.confidence,
      source_count: data.sources.length,
      sources: data.sources
    }));

    await supabase
      .from('study_conditions')
      .upsert(rows, { onConflict: 'study_id,condition_id' });

    for (const [conditionId, data] of matchedConditions) {
      mapped.push({ conditionId, conditionName: data.condition.name });

      // Update count
      const { count } = await supabase
        .from('study_conditions')
        .select('*', { count: 'exact', head: true })
        .eq('condition_id', conditionId);

      await supabase
        .from('condition_taxonomy')
        .update({ study_count: count || 0, updated_at: new Date().toISOString() })
        .eq('id', conditionId);
    }
  }

  // Record unmapped
  for (const term of [...new Set(unmapped)]) {
    const termLower = term.toLowerCase();
    const { data: existing } = await supabase
      .from('suggested_mappings')
      .select('id, study_count')
      .eq('term', termLower)
      .single();

    if (existing) {
      await supabase
        .from('suggested_mappings')
        .update({ study_count: existing.study_count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('suggested_mappings')
        .insert({ term: termLower, original_term: term, study_count: 1, status: 'pending' });
    }
  }

  return { mapped, unmapped };
}

function isSkipTerm(term: string): boolean {
  const skip = ['research', 'study', 'trial', 'clinical', 'treatment', 'therapy',
    'cannabidiol', 'cbd', 'cannabis', 'thc', 'cannabinoid', 'hemp',
    'dose', 'dosage', 'safety', 'efficacy', 'effect', 'effects', 'human', 'animal'];
  return term.length < 4 || skip.some(s => term === s || term.includes(s));
}
