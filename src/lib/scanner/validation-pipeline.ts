/**
 * Scanner V2 Validation Pipeline
 *
 * Multi-stage validation to ensure research quality:
 * Stage 1: Blacklist filtering (reject known false positives)
 * Stage 2: Confirmation scoring (verify cannabinoid context)
 * Stage 3: Relevance scoring (health topic matching)
 * Stage 4: Deduplication
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  loadScannerConfig,
  matchesBlacklistFromConfig,
  getAllSynonyms,
  getCannabisJournals,
  ScannerConfig,
} from './query-builder';

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  stage: 'blacklist' | 'confirmation' | 'relevance' | 'duplicate' | 'passed';
  rejectionReason?: string;
  confirmationScore?: number;
  confirmationBreakdown?: ConfirmationBreakdown;
  relevanceScore?: number;
  relevanceSignals?: string[];
  matchedCannabinoids?: string[];
  matchedConditions?: string[];
  studyType?: string;
  species?: string;
}

export interface ConfirmationBreakdown {
  unambiguousCannabinoid: number;  // 0-40: Full name (cannabidiol) vs abbreviation
  cannabisContext: number;          // 0-25: Context words prove it's about cannabis
  dosingPattern: number;            // 0-25: mg, dosage patterns indicate real research
  journalMatch: number;             // 0-40: Published in cannabis-focused journal
  total: number;
}

// Study input for validation
export interface StudyInput {
  title: string;
  abstract?: string;
  authors?: string;
  publication?: string;
  year?: number;
  url?: string;
  doi?: string;
}

// Confirmation scoring constants (threshold: 50)
const CONFIRMATION_THRESHOLD = 50;

// Unambiguous cannabinoid terms (spelled out, not abbreviations)
const UNAMBIGUOUS_CANNABINOIDS = [
  'cannabidiol',
  'tetrahydrocannabinol',
  'cannabigerol',
  'cannabinol',
  'cannabichromene',
  'cannabidiolic acid',
  'tetrahydrocannabinolic acid',
  'cannabigerolic acid',
  'epidiolex',
  'sativex',
  'nabiximols',
  'dronabinol',
  'nabilone',
  'marinol',
  'cesamet',
];

// Cannabis context words (prove "CBD" means cannabidiol)
const CANNABIS_CONTEXT_WORDS = [
  'cannabis',
  'cannabis sativa',
  'cannabis indica',
  'marijuana',
  'hemp',
  'cannabinoid',
  'cannabinoids',
  'phytocannabinoid',
  'endocannabinoid',
  'endocannabinoid system',
  'cb1 receptor',
  'cb2 receptor',
  'terpene',
  'entourage effect',
  'full spectrum',
  'full-spectrum',
  'broad spectrum',
  'broad-spectrum',
  'cannabis extract',
  'hemp extract',
  'hemp oil',
  'cannabis oil',
];

// Dosing/concentration patterns (regex)
const DOSING_PATTERNS = [
  /\b\d+\s*mg(?:\/(?:kg|ml|day|dose))?\b/i,          // 100mg, 10mg/kg
  /\b\d+\.?\d*\s*%\s*(?:cbd|thc|cannabidiol)/i,      // 5% CBD
  /\bdose[sd]?\s*(?:of\s*)?\d+/i,                     // doses of 300
  /\b(?:low|high|medium)\s*dose/i,                    // low dose, high dose
  /\b(?:oral|sublingual|topical)\s*(?:administration|application)/i,
  /\b\d+\s*(?:mg\/ml|μg\/ml|ng\/ml)/i,               // concentrations
  /\btitrat(?:e|ion|ed)/i,                            // titration
  /\b(?:twice|once|three times)\s*daily/i,           // dosing frequency
];

/**
 * Normalize text for matching (lowercase, normalize unicode)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stage 1: Blacklist Filter
 * Rejects studies matching known false positive terms
 */
export async function stage1Blacklist(
  study: StudyInput,
  config: ScannerConfig
): Promise<{ passed: boolean; matchedTerm?: string }> {
  const text = `${study.title || ''} ${study.abstract || ''}`;
  const matchedTerm = matchesBlacklistFromConfig(text, config);

  if (matchedTerm) {
    return { passed: false, matchedTerm };
  }

  return { passed: true };
}

/**
 * Stage 2: Confirmation Scoring
 * Calculates confidence that the study is genuinely about cannabinoids
 */
export function stage2Confirmation(
  study: StudyInput,
  config: ScannerConfig
): { passed: boolean; score: number; breakdown: ConfirmationBreakdown } {
  const text = normalizeText(`${study.title || ''} ${study.abstract || ''}`);
  const title = normalizeText(study.title || '');
  const publication = normalizeText(study.publication || '');

  const breakdown: ConfirmationBreakdown = {
    unambiguousCannabinoid: 0,
    cannabisContext: 0,
    dosingPattern: 0,
    journalMatch: 0,
    total: 0,
  };

  // Check for unambiguous cannabinoid terms (40 points max)
  for (const term of UNAMBIGUOUS_CANNABINOIDS) {
    if (text.includes(term.toLowerCase())) {
      breakdown.unambiguousCannabinoid = 40;
      break;
    }
  }

  // If no unambiguous term, check for cannabis context words (25 points)
  if (breakdown.unambiguousCannabinoid === 0) {
    let contextMatches = 0;
    for (const word of CANNABIS_CONTEXT_WORDS) {
      if (text.includes(word.toLowerCase())) {
        contextMatches++;
        if (contextMatches >= 2) break; // Cap at 2 matches
      }
    }
    breakdown.cannabisContext = contextMatches >= 2 ? 25 : (contextMatches === 1 ? 15 : 0);
  }

  // Check for dosing/concentration patterns (25 points)
  for (const pattern of DOSING_PATTERNS) {
    if (pattern.test(text)) {
      breakdown.dosingPattern = 25;
      break;
    }
  }

  // Check for cannabis-focused journal (40 points - increased from 30)
  const cannabisJournals = getCannabisJournals(config);
  for (const journal of cannabisJournals) {
    if (publication.includes(journal.toLowerCase())) {
      breakdown.journalMatch = 40;
      break;
    }
  }

  // Calculate total
  breakdown.total = Math.min(
    100,
    breakdown.unambiguousCannabinoid +
    breakdown.cannabisContext +
    breakdown.dosingPattern +
    breakdown.journalMatch
  );

  return {
    passed: breakdown.total >= CONFIRMATION_THRESHOLD,
    score: breakdown.total,
    breakdown,
  };
}

/**
 * Stage 3: Relevance Scoring
 * Evaluates how relevant the study is to CBD health topics
 */
export function stage3Relevance(
  study: StudyInput,
  config: ScannerConfig
): {
  score: number;
  signals: string[];
  matchedCannabinoids: string[];
  matchedConditions: string[];
  category: 'high' | 'medium' | 'low' | 'irrelevant';
} {
  const text = normalizeText(`${study.title || ''} ${study.abstract || ''}`);
  const title = normalizeText(study.title || '');
  const signals: string[] = [];
  let score = 50; // Start neutral

  // Match cannabinoids from config
  const matchedCannabinoids: string[] = [];
  for (const item of config.cannabinoids) {
    for (const synonym of item.synonyms) {
      const normalizedSynonym = normalizeText(synonym);
      if (text.includes(normalizedSynonym)) {
        if (!matchedCannabinoids.includes(item.term_key)) {
          matchedCannabinoids.push(item.term_key);
        }
        break;
      }
    }
  }

  // Match conditions from config
  const matchedConditions: string[] = [];
  for (const item of config.conditions) {
    for (const synonym of item.synonyms) {
      const normalizedSynonym = normalizeText(synonym);
      // Use word boundary matching to avoid partial matches
      const regex = new RegExp(`\\b${normalizedSynonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (regex.test(text)) {
        if (!matchedConditions.includes(item.term_key)) {
          matchedConditions.push(item.term_key);
        }
        break;
      }
    }
  }

  // === POSITIVE SIGNALS ===

  // CBD/Cannabidiol in title (strong signal)
  if (/\b(cbd|cannabidiol)\b/.test(title)) {
    score += 25;
    signals.push('CBD/Cannabidiol in title');
  }

  // Multiple cannabinoid matches
  if (matchedCannabinoids.length >= 2) {
    score += 10;
    signals.push(`Multiple cannabinoids: ${matchedCannabinoids.slice(0, 3).join(', ')}`);
  }

  // Health conditions matched
  if (matchedConditions.length > 0) {
    score += Math.min(matchedConditions.length * 5, 20);
    signals.push(`Health conditions: ${matchedConditions.slice(0, 4).join(', ')}`);
  }

  // Therapeutic/Treatment context
  if (/\b(treatment|therapy|therapeutic|efficacy|effectiveness|intervention)\b/.test(text)) {
    score += 15;
    signals.push('Treatment/therapeutic context');
  }

  // Clinical/Medical context
  if (/\b(patients|clinical trial|medical|symptoms|disorder|disease|diagnosis)\b/.test(text)) {
    score += 10;
    signals.push('Clinical/medical context');
  }

  // Human study indicators
  if (/\b(participants|human subjects|volunteers|randomized|placebo|double.?blind)\b/.test(text)) {
    score += 10;
    signals.push('Human study indicators');
  }

  // === NEGATIVE SIGNALS ===

  // Policy/Legal without medical context
  if (/\b(policy|legislation|legalization|regulatory|legal framework)\b/.test(text)) {
    if (!/\b(patient|treatment|medical|therapeutic|clinical)\b/.test(text)) {
      score -= 35;
      signals.push('Policy/legal focus without medical context');
    }
  }

  // Economic/Market analysis
  if (/\b(market|industry|retail|economic|business|commerce|sales|consumer)\b/.test(text)) {
    score -= 30;
    signals.push('Economic/market focus');
  }

  // Agricultural focus
  if (/\b(cultivation|agriculture|farming|crop|harvest|hemp fiber|biofuel)\b/.test(text)) {
    if (!/\b(cbd|cannabidiol|therapeutic|treatment)\b/.test(text)) {
      score -= 30;
      signals.push('Agricultural focus');
    }
  }

  // Recreational focus
  if (/\b(recreational|adult.?use|getting high|intoxication)\b/.test(text)) {
    if (!/\b(disorder|addiction|treatment)\b/.test(text)) {
      score -= 25;
      signals.push('Recreational focus');
    }
  }

  // Drug testing/Forensic
  if (/\b(drug test|detection|screening|forensic|workplace testing)\b/.test(text)) {
    if (!/\b(treatment|therapeutic)\b/.test(text)) {
      score -= 20;
      signals.push('Drug testing/forensic focus');
    }
  }

  // Single CBD mention (tangential)
  const cbdMentions = (text.match(/\b(cbd|cannabidiol)\b/g) || []).length;
  if (cbdMentions === 1) {
    score -= 15;
    signals.push('CBD mentioned only once (tangential?)');
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine category
  let category: 'high' | 'medium' | 'low' | 'irrelevant';
  if (score >= 70) category = 'high';
  else if (score >= 40) category = 'medium';
  else if (score >= 20) category = 'low';
  else category = 'irrelevant';

  return {
    score,
    signals,
    matchedCannabinoids,
    matchedConditions,
    category,
  };
}

/**
 * Detect study type from text
 */
export function detectStudyType(study: StudyInput, config: ScannerConfig): string | undefined {
  const text = normalizeText(`${study.title || ''} ${study.abstract || ''}`);

  // Check study types in order of specificity
  for (const item of config.studyTypes) {
    for (const synonym of item.synonyms) {
      const normalizedSynonym = normalizeText(synonym);
      if (text.includes(normalizedSynonym)) {
        return item.term_key;
      }
    }
  }

  return undefined;
}

/**
 * Detect species from text
 */
export function detectSpecies(study: StudyInput): 'human' | 'animal' | 'in_vitro' | 'mixed' | 'unknown' {
  const text = normalizeText(`${study.title || ''} ${study.abstract || ''}`);

  const humanIndicators = /\b(patients|participants|human subjects|volunteers|adults|children|men|women|clinical trial)\b/;
  const animalIndicators = /\b(mice|mouse|rats?|rodent|murine|animal model|in vivo|canine|feline|dog|cat|rabbit)\b/;
  const inVitroIndicators = /\b(in vitro|cell line|cell culture|cultured cells|hek293|hela|jurkat)\b/;

  const hasHuman = humanIndicators.test(text);
  const hasAnimal = animalIndicators.test(text);
  const hasInVitro = inVitroIndicators.test(text);

  if (hasHuman && hasAnimal) return 'mixed';
  if (hasHuman) return 'human';
  if (hasAnimal) return 'animal';
  if (hasInVitro) return 'in_vitro';

  return 'unknown';
}

/**
 * Extract sample size from text
 */
export function extractSampleSize(study: StudyInput): number | undefined {
  const text = `${study.title || ''} ${study.abstract || ''}`;

  const patterns = [
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|individual|volunteer)s?/gi,
    /\bn\s*=\s*(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /(\d{1,3}(?:,\d{3})*|\d+)\s+(?:were\s+)?(?:enrolled|recruited|randomized|randomised)/gi,
    /sample\s+(?:size\s+)?(?:of\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
  ];

  let maxSample = 0;

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr, 10);
      if (num >= 5 && num < 100000 && num > maxSample) {
        maxSample = num;
      }
    }
  }

  return maxSample > 0 ? maxSample : undefined;
}

/**
 * Run full validation pipeline
 */
export async function runValidationPipeline(
  supabase: SupabaseClient,
  study: StudyInput
): Promise<ValidationResult> {
  const config = await loadScannerConfig(supabase);

  // Stage 1: Blacklist
  const blacklistResult = await stage1Blacklist(study, config);
  if (!blacklistResult.passed) {
    return {
      isValid: false,
      stage: 'blacklist',
      rejectionReason: `Matched blacklist term: "${blacklistResult.matchedTerm}"`,
    };
  }

  // Stage 2: Confirmation
  const confirmationResult = stage2Confirmation(study, config);
  if (!confirmationResult.passed) {
    return {
      isValid: false,
      stage: 'confirmation',
      rejectionReason: `Confirmation score ${confirmationResult.score} below threshold ${CONFIRMATION_THRESHOLD}`,
      confirmationScore: confirmationResult.score,
      confirmationBreakdown: confirmationResult.breakdown,
    };
  }

  // Stage 3: Relevance
  const relevanceResult = stage3Relevance(study, config);
  if (relevanceResult.category === 'irrelevant') {
    return {
      isValid: false,
      stage: 'relevance',
      rejectionReason: `Relevance score ${relevanceResult.score} too low (category: irrelevant)`,
      confirmationScore: confirmationResult.score,
      confirmationBreakdown: confirmationResult.breakdown,
      relevanceScore: relevanceResult.score,
      relevanceSignals: relevanceResult.signals,
      matchedCannabinoids: relevanceResult.matchedCannabinoids,
      matchedConditions: relevanceResult.matchedConditions,
    };
  }

  // Extract additional metadata
  const studyType = detectStudyType(study, config);
  const species = detectSpecies(study);

  return {
    isValid: true,
    stage: 'passed',
    confirmationScore: confirmationResult.score,
    confirmationBreakdown: confirmationResult.breakdown,
    relevanceScore: relevanceResult.score,
    relevanceSignals: relevanceResult.signals,
    matchedCannabinoids: relevanceResult.matchedCannabinoids,
    matchedConditions: relevanceResult.matchedConditions,
    studyType,
    species,
  };
}

/**
 * Batch validate studies (with deduplication against existing)
 */
export async function validateAndFilterStudies(
  supabase: SupabaseClient,
  studies: StudyInput[],
  existingUrls: Set<string>,
  existingDois: Set<string>
): Promise<{
  valid: Array<StudyInput & ValidationResult>;
  rejected: Array<{ study: StudyInput; reason: string }>;
  duplicates: StudyInput[];
}> {
  const valid: Array<StudyInput & ValidationResult> = [];
  const rejected: Array<{ study: StudyInput; reason: string }> = [];
  const duplicates: StudyInput[] = [];

  const config = await loadScannerConfig(supabase);

  for (const study of studies) {
    // Stage 4: Deduplication (check URL and DOI)
    if (study.url && existingUrls.has(study.url)) {
      duplicates.push(study);
      continue;
    }
    if (study.doi && existingDois.has(study.doi)) {
      duplicates.push(study);
      continue;
    }

    // Run validation pipeline
    const result = await runValidationPipeline(supabase, study);

    if (result.isValid) {
      valid.push({ ...study, ...result });
      // Add to tracking sets
      if (study.url) existingUrls.add(study.url);
      if (study.doi) existingDois.add(study.doi);
    } else {
      rejected.push({
        study,
        reason: result.rejectionReason || `Failed at stage: ${result.stage}`,
      });
    }
  }

  return { valid, rejected, duplicates };
}

// Export constants for external use
export { CONFIRMATION_THRESHOLD };
