/**
 * Cross-Source Deduplication for Research Scanner
 *
 * This module provides functions to detect duplicate research items across multiple sources.
 * It uses a hierarchical matching strategy:
 * 1. DOI (most reliable)
 * 2. PMID (PubMed ID)
 * 3. PMC ID (PubMed Central ID)
 * 4. Fuzzy title matching (fallback)
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface IncomingStudy {
  title: string;
  doi?: string | null;
  pmid?: string | null;
  pmcId?: string | null;
  year?: number | null;
  source: string; // 'pubmed', 'pmc', 'europepmc', 'semantic_scholar', etc.
  sourceId?: string; // The ID in the source system
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingId?: string;
  existingStatus?: string;
  matchType?: 'doi' | 'pmid' | 'pmc_id' | 'url' | 'title_fuzzy';
  similarity?: number;
}

export interface ExistingRecord {
  id: string;
  status: string;
  title?: string;
}

/**
 * Normalize a DOI for comparison
 * Removes common prefixes and converts to lowercase
 */
export function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;

  return doi
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/^dx\.doi\.org\//i, '');
}

/**
 * Normalize a PMID for comparison
 * Strips any prefix and ensures it's just the numeric ID
 */
export function normalizePmid(pmid: string | null | undefined): string | null {
  if (!pmid) return null;

  const match = pmid.match(/\d+/);
  return match ? match[0] : null;
}

/**
 * Normalize a PMC ID for comparison
 * Ensures consistent PMC prefix format
 */
export function normalizePmcId(pmcId: string | null | undefined): string | null {
  if (!pmcId) return null;

  const match = pmcId.match(/\d+/);
  if (!match) return null;

  return `PMC${match[0]}`;
}

/**
 * Normalize title for fuzzy matching
 * Removes punctuation, extra whitespace, and converts to lowercase
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

/**
 * Calculate Jaccard similarity between two sets of words
 */
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(normalizeTitle(str1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(normalizeTitle(str2).split(' ').filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if a study is a duplicate using hierarchical matching
 * Returns match details including the type of match found
 */
export async function isDuplicate(
  supabase: SupabaseClient,
  study: IncomingStudy
): Promise<DuplicateCheckResult> {

  // 1. Check DOI (most reliable)
  const normalizedDoi = normalizeDoi(study.doi);
  if (normalizedDoi) {
    const { data: doiMatch } = await supabase
      .from('kb_research_queue')
      .select('id, status')
      .eq('doi', normalizedDoi)
      .single();

    if (doiMatch) {
      return {
        isDuplicate: true,
        existingId: doiMatch.id,
        existingStatus: doiMatch.status,
        matchType: 'doi'
      };
    }
  }

  // 2. Check PMID
  const normalizedPmid = normalizePmid(study.pmid);
  if (normalizedPmid) {
    const { data: pmidMatch } = await supabase
      .from('kb_research_queue')
      .select('id, status')
      .eq('pmid', normalizedPmid)
      .single();

    if (pmidMatch) {
      return {
        isDuplicate: true,
        existingId: pmidMatch.id,
        existingStatus: pmidMatch.status,
        matchType: 'pmid'
      };
    }
  }

  // 3. Check PMC ID
  const normalizedPmcId = normalizePmcId(study.pmcId);
  if (normalizedPmcId) {
    const { data: pmcMatch } = await supabase
      .from('kb_research_queue')
      .select('id, status')
      .eq('pmc_id', normalizedPmcId)
      .single();

    if (pmcMatch) {
      return {
        isDuplicate: true,
        existingId: pmcMatch.id,
        existingStatus: pmcMatch.status,
        matchType: 'pmc_id'
      };
    }
  }

  // 4. Fuzzy title match (fallback for papers without standard IDs)
  // Only use if we have a title and year
  if (study.title && study.title.length > 20) {
    // Use database function for similarity if available
    try {
      const { data: similarMatches } = await supabase
        .rpc('find_similar_research', {
          p_title: study.title,
          p_year: study.year || null,
          p_threshold: 0.85
        });

      if (similarMatches && similarMatches.length > 0) {
        const bestMatch = similarMatches[0];
        return {
          isDuplicate: true,
          existingId: bestMatch.id,
          matchType: 'title_fuzzy',
          similarity: bestMatch.similarity
        };
      }
    } catch {
      // Function might not exist, fall back to simple check
      // Get potential matches from same year range
      const yearFilter = study.year
        ? { gte: study.year - 1, lte: study.year + 1 }
        : null;

      let query = supabase
        .from('kb_research_queue')
        .select('id, title, status');

      if (yearFilter) {
        query = query.gte('year', yearFilter.gte).lte('year', yearFilter.lte);
      }

      const { data: potentialMatches } = await query.limit(100);

      if (potentialMatches) {
        for (const match of potentialMatches) {
          const similarity = calculateJaccardSimilarity(study.title, match.title);
          if (similarity > 0.85) {
            return {
              isDuplicate: true,
              existingId: match.id,
              existingStatus: match.status,
              matchType: 'title_fuzzy',
              similarity
            };
          }
        }
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Check if a URL already exists in the database
 * This is a quick check before doing full deduplication
 */
export async function isUrlDuplicate(
  supabase: SupabaseClient,
  url: string
): Promise<DuplicateCheckResult> {
  const { data: existing } = await supabase
    .from('kb_research_queue')
    .select('id, status')
    .eq('url', url)
    .single();

  if (existing) {
    return {
      isDuplicate: true,
      existingId: existing.id,
      existingStatus: existing.status,
      matchType: 'url'
    };
  }

  return { isDuplicate: false };
}

/**
 * Update an existing record with additional source IDs
 * Called when we find a duplicate from a different source
 */
export async function updateSourceIds(
  supabase: SupabaseClient,
  existingId: string,
  newSourceIds: Record<string, string>
): Promise<void> {
  // Get current source_ids
  const { data: current } = await supabase
    .from('kb_research_queue')
    .select('source_ids')
    .eq('id', existingId)
    .single();

  const currentSourceIds = (current?.source_ids || {}) as Record<string, string>;

  // Merge with new source IDs
  const mergedSourceIds = { ...currentSourceIds, ...newSourceIds };

  // Update the record
  await supabase
    .from('kb_research_queue')
    .update({ source_ids: mergedSourceIds })
    .eq('id', existingId);
}

/**
 * Build source_ids object from available identifiers
 */
export function buildSourceIds(
  source: string,
  sourceId: string | null | undefined,
  pmid: string | null | undefined,
  pmcId: string | null | undefined,
  doi: string | null | undefined
): Record<string, string> {
  const sourceIds: Record<string, string> = {};

  if (sourceId) {
    sourceIds[source] = sourceId;
  }

  if (pmid) {
    sourceIds['pubmed'] = normalizePmid(pmid) || pmid;
  }

  if (pmcId) {
    sourceIds['pmc'] = normalizePmcId(pmcId) || pmcId;
  }

  if (doi) {
    sourceIds['doi'] = normalizeDoi(doi) || doi;
  }

  return sourceIds;
}
