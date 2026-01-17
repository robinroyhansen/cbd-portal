/**
 * Scanner V2 Query Builder
 *
 * Loads scanner configuration from research_scanner_config table
 * and builds source-specific queries for each data source.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Types for scanner configuration
export interface ScannerConfigItem {
  id: string;
  category: 'cannabinoid' | 'condition' | 'study_type' | 'blacklist' | 'journal';
  term_key: string;
  display_name: string;
  synonyms: string[];
  enabled: boolean;
  sort_order: number;
}

export interface ScannerConfig {
  cannabinoids: ScannerConfigItem[];
  conditions: ScannerConfigItem[];
  studyTypes: ScannerConfigItem[];
  blacklist: ScannerConfigItem[];
  journals: ScannerConfigItem[];
  loadedAt: number;
}

// Cache for scanner configuration
let configCache: ScannerConfig | null = null;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load scanner configuration from database
 */
export async function loadScannerConfig(supabase: SupabaseClient, forceRefresh = false): Promise<ScannerConfig> {
  // Return cached config if still valid
  if (!forceRefresh && configCache && Date.now() - configCache.loadedAt < CONFIG_CACHE_TTL) {
    return configCache;
  }

  console.log('[QueryBuilder] Loading scanner configuration from database...');

  const { data, error } = await supabase
    .from('research_scanner_config')
    .select('*')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[QueryBuilder] Failed to load config:', error);
    // Return cached config or empty config as fallback
    if (configCache) return configCache;
    return {
      cannabinoids: [],
      conditions: [],
      studyTypes: [],
      blacklist: [],
      journals: [],
      loadedAt: Date.now(),
    };
  }

  // Group by category
  const config: ScannerConfig = {
    cannabinoids: [],
    conditions: [],
    studyTypes: [],
    blacklist: [],
    journals: [],
    loadedAt: Date.now(),
  };

  for (const item of data || []) {
    switch (item.category) {
      case 'cannabinoid':
        config.cannabinoids.push(item);
        break;
      case 'condition':
        config.conditions.push(item);
        break;
      case 'study_type':
        config.studyTypes.push(item);
        break;
      case 'blacklist':
        config.blacklist.push(item);
        break;
      case 'journal':
        config.journals.push(item);
        break;
    }
  }

  configCache = config;
  console.log(`[QueryBuilder] Loaded config: ${config.cannabinoids.length} cannabinoids, ${config.conditions.length} conditions, ${config.studyTypes.length} study types, ${config.blacklist.length} blacklist, ${config.journals.length} journals`);

  return config;
}

/**
 * Get all synonyms for a category (flattened array)
 */
export function getAllSynonyms(items: ScannerConfigItem[]): string[] {
  const synonyms: string[] = [];
  for (const item of items) {
    synonyms.push(...item.synonyms);
  }
  return [...new Set(synonyms)]; // Deduplicate
}

/**
 * Get all blacklist terms for matching
 */
export function getBlacklistTerms(config: ScannerConfig): string[] {
  return getAllSynonyms(config.blacklist);
}

/**
 * Get journal names for scoring
 */
export function getCannabisJournals(config: ScannerConfig): string[] {
  return getAllSynonyms(config.journals);
}

// Source-specific query builders

/**
 * Build PubMed/PMC query
 * Uses MeSH terms and boolean operators
 */
export function buildPubMedQuery(cannabinoidTerms: string[], conditionTerms: string[]): string {
  // PubMed uses quotes for phrases and OR/AND for boolean
  const cannabinoidPart = cannabinoidTerms
    .map(term => term.includes(' ') ? `"${term}"` : term)
    .join(' OR ');

  if (conditionTerms.length === 0) {
    return `(${cannabinoidPart})`;
  }

  const conditionPart = conditionTerms
    .map(term => term.includes(' ') ? `"${term}"` : term)
    .join(' OR ');

  return `(${cannabinoidPart}) AND (${conditionPart})`;
}

/**
 * Build ClinicalTrials.gov query
 * Uses AREA syntax for conditions
 */
export function buildClinicalTrialsQuery(cannabinoidTerms: string[], conditionTerms: string[]): {
  term: string;
  conditionFilter?: string;
} {
  // ClinicalTrials.gov v2 API uses query.term for general search
  const term = cannabinoidTerms.join(' OR ');

  // Use condition filter if we have specific conditions
  const conditionFilter = conditionTerms.length > 0
    ? conditionTerms.join(' OR ')
    : undefined;

  return { term, conditionFilter };
}

/**
 * Build OpenAlex query
 * Simple keyword search with filters
 */
export function buildOpenAlexQuery(cannabinoidTerms: string[], conditionTerms: string[]): string {
  // OpenAlex uses simple search terms
  const allTerms = [...cannabinoidTerms];

  // Add top conditions for more specific results
  if (conditionTerms.length > 0) {
    allTerms.push(...conditionTerms.slice(0, 3));
  }

  return allTerms.join(' ');
}

/**
 * Build Semantic Scholar query
 */
export function buildSemanticScholarQuery(cannabinoidTerms: string[], conditionTerms: string[]): string {
  // Semantic Scholar works best with simple queries
  const primary = cannabinoidTerms[0] || 'cannabidiol';

  if (conditionTerms.length > 0) {
    return `${primary} ${conditionTerms[0]}`;
  }

  return primary;
}

/**
 * Build Europe PMC query
 */
export function buildEuropePMCQuery(cannabinoidTerms: string[], conditionTerms: string[]): string {
  // Europe PMC uses similar syntax to PubMed
  const cannabinoidPart = cannabinoidTerms
    .map(term => term.includes(' ') ? `"${term}"` : term)
    .join(' OR ');

  if (conditionTerms.length === 0) {
    return cannabinoidPart;
  }

  const conditionPart = conditionTerms
    .slice(0, 3)
    .map(term => term.includes(' ') ? `"${term}"` : term)
    .join(' OR ');

  return `(${cannabinoidPart}) AND (${conditionPart})`;
}

/**
 * Keywords for bioRxiv/medRxiv filtering (post-fetch)
 */
export function getBioRxivFilterKeywords(cannabinoidTerms: string[]): string[] {
  return cannabinoidTerms.map(t => t.toLowerCase());
}

// Query generation strategies

export type QueryStrategy = 'comprehensive' | 'condition_focused' | 'cannabinoid_focused' | 'custom';

export interface QueryGenerationOptions {
  strategy: QueryStrategy;
  customCannabinoids?: string[];
  customConditions?: string[];
  maxQueriesPerSource?: number;
}

/**
 * Generate queries for a specific source
 */
export function generateQueriesForSource(
  source: string,
  config: ScannerConfig,
  options: QueryGenerationOptions = { strategy: 'comprehensive' }
): string[] {
  const queries: string[] = [];
  const maxQueries = options.maxQueriesPerSource || 20;

  // Get cannabinoid and condition terms based on strategy
  let cannabinoidTerms: string[];
  let conditionTerms: string[];

  switch (options.strategy) {
    case 'cannabinoid_focused':
      cannabinoidTerms = getAllSynonyms(config.cannabinoids);
      conditionTerms = [];
      break;

    case 'condition_focused':
      // Use primary cannabinoid terms only
      cannabinoidTerms = ['cannabidiol', 'CBD', 'cannabis', 'cannabinoid'];
      conditionTerms = getAllSynonyms(config.conditions);
      break;

    case 'custom':
      cannabinoidTerms = options.customCannabinoids || ['cannabidiol'];
      conditionTerms = options.customConditions || [];
      break;

    case 'comprehensive':
    default:
      cannabinoidTerms = getAllSynonyms(config.cannabinoids);
      conditionTerms = getAllSynonyms(config.conditions);
      break;
  }

  switch (source) {
    case 'pubmed':
    case 'pmc':
      // For PubMed/PMC, generate individual queries per condition for better coverage
      if (options.strategy === 'condition_focused' || options.strategy === 'comprehensive') {
        // Generate queries: each condition paired with primary cannabinoid terms
        for (const condition of config.conditions) {
          if (queries.length >= maxQueries) break;
          const query = buildPubMedQuery(
            ['cannabidiol', 'CBD', 'medical cannabis'],
            condition.synonyms.slice(0, 3)
          );
          queries.push(query);
        }
      }
      // Also add general cannabinoid queries
      if (queries.length < maxQueries) {
        queries.push(buildPubMedQuery(cannabinoidTerms.slice(0, 5), []));
      }
      break;

    case 'clinicaltrials':
      // For ClinicalTrials.gov, use primary cannabinoid terms
      for (const cannabinoid of ['cannabidiol', 'CBD', 'cannabis', 'medical cannabis']) {
        if (queries.length >= maxQueries) break;
        queries.push(cannabinoid);
      }
      break;

    case 'openalex':
      // OpenAlex: combine cannabinoids with top conditions
      for (const condition of config.conditions.slice(0, 10)) {
        if (queries.length >= maxQueries) break;
        queries.push(buildOpenAlexQuery(['cannabidiol'], condition.synonyms.slice(0, 2)));
      }
      // Add general queries
      if (queries.length < maxQueries) {
        queries.push('cannabidiol clinical trial');
        queries.push('CBD treatment');
        queries.push('medical cannabis');
      }
      break;

    case 'semanticscholar':
      // Semantic Scholar: focused queries
      for (const condition of config.conditions.slice(0, 5)) {
        if (queries.length >= maxQueries) break;
        queries.push(buildSemanticScholarQuery(['cannabidiol'], [condition.display_name]));
      }
      queries.push('cannabidiol');
      queries.push('CBD therapy');
      queries.push('medical cannabis clinical trial');
      break;

    case 'europepmc':
      // Europe PMC: similar to PubMed
      for (const condition of config.conditions.slice(0, 8)) {
        if (queries.length >= maxQueries) break;
        queries.push(buildEuropePMCQuery(['cannabidiol', 'CBD'], condition.synonyms.slice(0, 2)));
      }
      break;

    case 'biorxiv':
    case 'crossref':
      // These sources use post-fetch filtering, return filter keywords
      queries.push(...getBioRxivFilterKeywords(cannabinoidTerms.slice(0, 10)));
      break;

    default:
      // Default: simple term list
      queries.push(...cannabinoidTerms.slice(0, maxQueries));
  }

  return queries.slice(0, maxQueries);
}

/**
 * Generate all search queries based on configuration
 * Returns a map of source -> queries
 */
export async function generateAllQueries(
  supabase: SupabaseClient,
  sources: string[],
  options: QueryGenerationOptions = { strategy: 'comprehensive' }
): Promise<Map<string, string[]>> {
  const config = await loadScannerConfig(supabase);
  const queryMap = new Map<string, string[]>();

  for (const source of sources) {
    const queries = generateQueriesForSource(source, config, options);
    queryMap.set(source, queries);
    console.log(`[QueryBuilder] Generated ${queries.length} queries for ${source}`);
  }

  return queryMap;
}

/**
 * Get the effective search terms for a source (for backwards compatibility)
 */
export async function getSearchTermsForSource(
  supabase: SupabaseClient,
  source: string,
  customKeywords?: string[]
): Promise<string[]> {
  // If custom keywords provided, use those
  if (customKeywords && customKeywords.length > 0) {
    return customKeywords;
  }

  const config = await loadScannerConfig(supabase);
  return generateQueriesForSource(source, config, { strategy: 'comprehensive' });
}

/**
 * Clear the configuration cache (useful for testing or after config updates)
 */
export function clearConfigCache(): void {
  configCache = null;
  console.log('[QueryBuilder] Config cache cleared');
}

/**
 * Check if a text matches any blacklist term
 */
export function matchesBlacklistFromConfig(text: string, config: ScannerConfig): string | null {
  const normalizedText = text
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

  for (const bl of config.blacklist) {
    for (const term of bl.synonyms) {
      const normalizedTerm = term
        .toLowerCase()
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

      if (normalizedText.includes(normalizedTerm)) {
        return term;
      }
    }
  }

  return null;
}

// Export config types for use elsewhere
export type { ScannerConfig, ScannerConfigItem };
