/**
 * Term Resolver - Phase 3 of Condition Intelligence System
 *
 * Maps raw terms from professional taxonomies (MeSH, OpenAlex, ClinicalTrials.gov)
 * to the condition taxonomy, creating study-condition relationships.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Types
interface RawTerm {
  id: string;
  study_id: string;
  source: string;
  term: string;
  term_id: string | null;
  confidence: number;
  is_health_related: boolean;
  metadata: Record<string, unknown> | null;
}

interface TermMapping {
  id: string;
  source_type: string;
  source_term: string;
  source_id: string | null;
  maps_to: string;
  confidence: number;
  is_primary: boolean;
}

interface ConditionTaxonomy {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  level: number;
  path: string[];
  mesh_ids: string[] | null;
  openalex_ids: string[] | null;
  synonyms: string[] | null;
}

interface MappedCondition {
  conditionId: string;
  relevance: 'primary' | 'secondary' | 'mentioned' | 'inherited';
  confidence: number;
  sources: string[];
}

interface ResolveResult {
  mapped: MappedCondition[];
  unmapped: string[];
}

interface BatchResolveResult {
  resolved: number;
  failed: number;
  unmappedTerms: { term: string; count: number }[];
}

/**
 * Resolve a single study's raw terms to condition taxonomy
 */
export async function resolveStudyConditions(
  supabase: SupabaseClient,
  studyId: string
): Promise<ResolveResult> {
  const mapped = new Map<string, MappedCondition>();
  const unmapped: string[] = [];

  // 1. Fetch raw terms for this study
  const { data: rawTerms, error: rawError } = await supabase
    .from('study_raw_terms')
    .select('*')
    .eq('study_id', studyId)
    .eq('is_health_related', true);

  if (rawError || !rawTerms || rawTerms.length === 0) {
    return { mapped: [], unmapped: [] };
  }

  // 2. Fetch term mappings (cached query)
  const { data: termMappings } = await supabase
    .from('term_mappings')
    .select('*');

  // 3. Fetch condition taxonomy
  const { data: conditions } = await supabase
    .from('condition_taxonomy')
    .select('*')
    .eq('enabled', true);

  if (!conditions) {
    return { mapped: [], unmapped: rawTerms.map(t => t.term) };
  }

  // Build lookup maps for efficient matching
  const mappingsByTerm = new Map<string, TermMapping[]>();
  const mappingsById = new Map<string, TermMapping[]>();

  for (const mapping of termMappings || []) {
    const termLower = mapping.source_term.toLowerCase();
    if (!mappingsByTerm.has(termLower)) {
      mappingsByTerm.set(termLower, []);
    }
    mappingsByTerm.get(termLower)!.push(mapping);

    if (mapping.source_id) {
      if (!mappingsById.has(mapping.source_id)) {
        mappingsById.set(mapping.source_id, []);
      }
      mappingsById.get(mapping.source_id)!.push(mapping);
    }
  }

  const conditionsById = new Map<string, ConditionTaxonomy>();
  const conditionsByMeshId = new Map<string, ConditionTaxonomy>();
  const conditionsByOpenAlexId = new Map<string, ConditionTaxonomy>();
  const conditionsBySynonym = new Map<string, ConditionTaxonomy>();

  for (const condition of conditions) {
    conditionsById.set(condition.id, condition);

    // Index by MeSH IDs
    if (condition.mesh_ids) {
      for (const meshId of condition.mesh_ids) {
        conditionsByMeshId.set(meshId, condition);
      }
    }

    // Index by OpenAlex IDs
    if (condition.openalex_ids) {
      for (const oaId of condition.openalex_ids) {
        conditionsByOpenAlexId.set(oaId, condition);
      }
    }

    // Index by synonyms (lowercase)
    if (condition.synonyms) {
      for (const synonym of condition.synonyms) {
        conditionsBySynonym.set(synonym.toLowerCase(), condition);
      }
    }
  }

  // 4. Process each raw term
  for (const rawTerm of rawTerms as RawTerm[]) {
    const termLower = rawTerm.term.toLowerCase();
    let matchedCondition: ConditionTaxonomy | null = null;
    let matchConfidence = rawTerm.confidence;
    let matchSource = rawTerm.source;

    // 4a. Check term_mappings for exact match (highest priority)
    const termMappingMatches = mappingsByTerm.get(termLower);
    if (termMappingMatches && termMappingMatches.length > 0) {
      // Use the first primary mapping, or any mapping
      const primaryMapping = termMappingMatches.find(m => m.is_primary) || termMappingMatches[0];
      matchedCondition = conditionsById.get(primaryMapping.maps_to) || null;
      matchConfidence = Math.min(rawTerm.confidence, primaryMapping.confidence);
    }

    // 4b. Check by external ID (MeSH ID, OpenAlex ID)
    if (!matchedCondition && rawTerm.term_id) {
      // Check term_mappings by ID
      const idMappingMatches = mappingsById.get(rawTerm.term_id);
      if (idMappingMatches && idMappingMatches.length > 0) {
        const primaryMapping = idMappingMatches.find(m => m.is_primary) || idMappingMatches[0];
        matchedCondition = conditionsById.get(primaryMapping.maps_to) || null;
        matchConfidence = Math.min(rawTerm.confidence, primaryMapping.confidence);
      }

      // Check condition taxonomy directly by MeSH/OpenAlex ID
      if (!matchedCondition) {
        if (rawTerm.source === 'mesh') {
          matchedCondition = conditionsByMeshId.get(rawTerm.term_id) || null;
        } else if (rawTerm.source === 'openalex') {
          matchedCondition = conditionsByOpenAlexId.get(rawTerm.term_id) || null;
        }
      }
    }

    // 4c. Check condition_taxonomy.synonyms
    if (!matchedCondition) {
      matchedCondition = conditionsBySynonym.get(termLower) || null;
    }

    // 4d. Fuzzy match on condition name (simple contains check)
    if (!matchedCondition) {
      for (const condition of conditions) {
        if (condition.name.toLowerCase().includes(termLower) ||
            termLower.includes(condition.name.toLowerCase())) {
          matchedCondition = condition;
          matchConfidence *= 0.8; // Lower confidence for fuzzy match
          break;
        }
      }
    }

    // 5. Record match or add to unmapped
    if (matchedCondition) {
      addMappedCondition(mapped, matchedCondition.id, matchConfidence, matchSource);
    } else {
      // Only add to unmapped if it looks like a health condition
      if (looksLikeHealthCondition(rawTerm.term)) {
        unmapped.push(rawTerm.term);
      }
    }
  }

  // 6. Inherit parent conditions
  await inheritParentConditions(mapped, conditionsById);

  // 7. Calculate relevance (primary/secondary/mentioned)
  calculateRelevance(mapped);

  // 8. Save to study_conditions table
  await saveStudyConditions(supabase, studyId, mapped);

  // 9. Update condition study counts
  await updateConditionStudyCounts(supabase, Array.from(mapped.keys()));

  // 10. Record unmapped terms for auto-suggestion
  if (unmapped.length > 0) {
    await recordUnmappedTerms(supabase, studyId, unmapped);
  }

  return {
    mapped: Array.from(mapped.values()),
    unmapped: [...new Set(unmapped)]
  };
}

/**
 * Add or update a mapped condition
 */
function addMappedCondition(
  mapped: Map<string, MappedCondition>,
  conditionId: string,
  confidence: number,
  source: string
): void {
  const existing = mapped.get(conditionId);
  if (existing) {
    // Aggregate confidence using max
    existing.confidence = Math.max(existing.confidence, confidence);
    if (!existing.sources.includes(source)) {
      existing.sources.push(source);
    }
  } else {
    mapped.set(conditionId, {
      conditionId,
      relevance: 'primary', // Will be recalculated
      confidence,
      sources: [source]
    });
  }
}

/**
 * Inherit parent conditions (e.g., if "Dravet" matched, also link "Epilepsy" and "Neurological")
 */
async function inheritParentConditions(
  mapped: Map<string, MappedCondition>,
  conditionsById: Map<string, ConditionTaxonomy>
): Promise<void> {
  const toAdd: { id: string; confidence: number }[] = [];

  for (const [conditionId, mappedCondition] of mapped) {
    const condition = conditionsById.get(conditionId);
    if (!condition) continue;

    // Walk up the parent chain
    let parentId = condition.parent_id;
    let inheritConfidence = mappedCondition.confidence * 0.9; // Slightly lower for inherited

    while (parentId) {
      const parent = conditionsById.get(parentId);
      if (!parent) break;

      // Only inherit if not already mapped with higher confidence
      const existingParent = mapped.get(parentId);
      if (!existingParent || existingParent.confidence < inheritConfidence) {
        toAdd.push({ id: parentId, confidence: inheritConfidence });
      }

      parentId = parent.parent_id;
      inheritConfidence *= 0.9; // Decrease confidence for each level up
    }
  }

  // Add inherited conditions
  for (const { id, confidence } of toAdd) {
    const existing = mapped.get(id);
    if (existing) {
      // Mark as also having inherited relevance
      if (existing.relevance !== 'primary') {
        existing.relevance = 'inherited';
      }
    } else {
      mapped.set(id, {
        conditionId: id,
        relevance: 'inherited',
        confidence,
        sources: ['inherited']
      });
    }
  }
}

/**
 * Calculate relevance based on confidence scores and source count
 */
function calculateRelevance(mapped: Map<string, MappedCondition>): void {
  const conditions = Array.from(mapped.values());

  // Sort by confidence
  conditions.sort((a, b) => b.confidence - a.confidence);

  // Top conditions (confidence >= 0.7 and multiple sources) are primary
  // Medium confidence (0.4-0.7) or single source are secondary
  // Lower confidence are mentioned
  // Inherited keep their relevance

  for (const condition of conditions) {
    if (condition.relevance === 'inherited') continue;

    if (condition.confidence >= 0.7 && condition.sources.length >= 2) {
      condition.relevance = 'primary';
    } else if (condition.confidence >= 0.7 || condition.sources.length >= 2) {
      condition.relevance = 'secondary';
    } else if (condition.confidence >= 0.4) {
      condition.relevance = 'secondary';
    } else {
      condition.relevance = 'mentioned';
    }
  }
}

/**
 * Save study-condition relationships to database
 */
async function saveStudyConditions(
  supabase: SupabaseClient,
  studyId: string,
  mapped: Map<string, MappedCondition>
): Promise<void> {
  if (mapped.size === 0) return;

  const rows = Array.from(mapped.values()).map(m => ({
    study_id: studyId,
    condition_id: m.conditionId,
    relevance: m.relevance,
    confidence: m.confidence,
    source_count: m.sources.length,
    sources: m.sources
  }));

  // Upsert to handle re-resolution
  const { error } = await supabase
    .from('study_conditions')
    .upsert(rows, {
      onConflict: 'study_id,condition_id'
    });

  if (error) {
    console.error(`[TermResolver] Failed to save study_conditions for ${studyId}:`, error.message);
  }
}

/**
 * Update study_count on affected conditions
 */
async function updateConditionStudyCounts(
  supabase: SupabaseClient,
  conditionIds: string[]
): Promise<void> {
  // For each condition, count studies
  for (const conditionId of conditionIds) {
    const { count } = await supabase
      .from('study_conditions')
      .select('*', { count: 'exact', head: true })
      .eq('condition_id', conditionId);

    // Also count human studies
    const { data: humanStudies } = await supabase
      .from('study_conditions')
      .select('study_id, kb_research_queue!inner(study_subject)')
      .eq('condition_id', conditionId)
      .eq('kb_research_queue.study_subject', 'human');

    await supabase
      .from('condition_taxonomy')
      .update({
        study_count: count || 0,
        human_study_count: humanStudies?.length || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', conditionId);
  }
}

/**
 * Record unmapped terms for auto-suggestion
 */
async function recordUnmappedTerms(
  supabase: SupabaseClient,
  studyId: string,
  terms: string[]
): Promise<void> {
  // Get study title for sample
  const { data: study } = await supabase
    .from('kb_research_queue')
    .select('title')
    .eq('id', studyId)
    .single();

  const title = study?.title || 'Unknown';

  for (const term of terms) {
    const termLower = term.toLowerCase();

    // Check if already in suggested_mappings
    const { data: existing } = await supabase
      .from('suggested_mappings')
      .select('id, study_count, sample_titles')
      .eq('term', termLower)
      .single();

    if (existing) {
      // Update count and add sample title
      const sampleTitles = existing.sample_titles || [];
      if (sampleTitles.length < 3 && !sampleTitles.includes(title)) {
        sampleTitles.push(title);
      }

      await supabase
        .from('suggested_mappings')
        .update({
          study_count: existing.study_count + 1,
          sample_titles: sampleTitles,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new suggested mapping
      await supabase
        .from('suggested_mappings')
        .insert({
          term: termLower,
          original_term: term,
          study_count: 1,
          sample_titles: [title]
        });
    }
  }
}

/**
 * Check if a term looks like a health condition (simple heuristic)
 */
function looksLikeHealthCondition(term: string): boolean {
  const termLower = term.toLowerCase();

  // Skip common non-health terms
  const skipTerms = [
    'research', 'study', 'trial', 'analysis', 'review', 'method',
    'human', 'animal', 'cell', 'in vitro', 'clinical',
    'treatment', 'therapy', 'intervention', 'placebo',
    'cannabidiol', 'cbd', 'cannabis', 'thc', 'cannabinoid', 'hemp',
    'dose', 'dosage', 'pharmacokinetics', 'pharmacology',
    'safety', 'efficacy', 'adverse', 'effect'
  ];

  if (skipTerms.some(skip => termLower === skip || termLower.includes(skip))) {
    return false;
  }

  // Skip very short terms
  if (term.length < 4) return false;

  // Skip terms that are just numbers or special characters
  if (/^[\d\s\-]+$/.test(term)) return false;

  return true;
}

/**
 * Resolve all studies that have raw terms but no study_conditions
 */
export async function resolveAllPendingStudies(
  supabase: SupabaseClient,
  limit: number = 100
): Promise<BatchResolveResult> {
  // Find studies with raw terms but no resolved conditions
  const { data: studiesWithTerms } = await supabase
    .from('study_raw_terms')
    .select('study_id')
    .limit(limit * 10); // Get more to account for duplicates

  if (!studiesWithTerms || studiesWithTerms.length === 0) {
    return { resolved: 0, failed: 0, unmappedTerms: [] };
  }

  // Get unique study IDs
  const studyIds = [...new Set(studiesWithTerms.map(s => s.study_id))];

  // Find which ones already have conditions resolved
  const { data: alreadyResolved } = await supabase
    .from('study_conditions')
    .select('study_id')
    .in('study_id', studyIds);

  const resolvedSet = new Set((alreadyResolved || []).map(s => s.study_id));
  const pendingIds = studyIds.filter(id => !resolvedSet.has(id)).slice(0, limit);

  let resolved = 0;
  let failed = 0;
  const allUnmapped: string[] = [];

  for (const studyId of pendingIds) {
    try {
      const result = await resolveStudyConditions(supabase, studyId);
      if (result.mapped.length > 0) {
        resolved++;
      }
      allUnmapped.push(...result.unmapped);
    } catch (error) {
      console.error(`[TermResolver] Failed to resolve study ${studyId}:`, error);
      failed++;
    }
  }

  // Aggregate unmapped terms
  const termCounts = new Map<string, number>();
  for (const term of allUnmapped) {
    const lower = term.toLowerCase();
    termCounts.set(lower, (termCounts.get(lower) || 0) + 1);
  }

  const unmappedTerms = Array.from(termCounts.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return { resolved, failed, unmappedTerms };
}

/**
 * Resolve a specific study by ID (for use after scanner inserts)
 */
export async function resolveStudyById(
  supabase: SupabaseClient,
  studyId: string
): Promise<{ success: boolean; mappedCount: number; unmappedCount: number }> {
  try {
    const result = await resolveStudyConditions(supabase, studyId);
    return {
      success: true,
      mappedCount: result.mapped.length,
      unmappedCount: result.unmapped.length
    };
  } catch (error) {
    console.error(`[TermResolver] Failed to resolve study ${studyId}:`, error);
    return { success: false, mappedCount: 0, unmappedCount: 0 };
  }
}
