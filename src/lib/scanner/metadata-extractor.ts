/**
 * Scanner V2 Metadata Extractor
 *
 * Extracts and validates metadata from research studies:
 * - Year validation (from DOI patterns, text)
 * - Country extraction from author affiliations
 * - Quality score calculation
 * - Title/abstract cleanup
 */

import { ScannerConfig } from './query-builder';

// Study metadata interface
export interface ExtractedMetadata {
  year?: number;
  yearSource?: 'doi' | 'text' | 'provided';
  yearValid: boolean;
  country?: string;
  countrySource?: 'affiliation' | 'location' | 'unknown';
  cleanedTitle: string;
  cleanedAbstract?: string;
  qualityScore: number;
  qualityBreakdown: QualityBreakdown;
  estimatedSampleSize?: number;
}

export interface QualityBreakdown {
  studyDesign: number;        // 0-35: Study type (RCT > cohort > case report)
  methodologyQuality: number; // 0-25: Double-blind, placebo-controlled, etc.
  relevance: number;          // 0-20: CBD-specificity + topics
  sampleSize: number;         // 0-10: Based on sample size
  recency: number;            // 0-10: Based on publication year
}

// Country code mapping from institution patterns
const COUNTRY_PATTERNS: Record<string, RegExp[]> = {
  'US': [/united states/i, /\busa\b/i, /\bu\.s\.a?\b/i, /\bamerican\b/i],
  'UK': [/united kingdom/i, /\buk\b/i, /\bengland\b/i, /\bscotland\b/i, /\bwales\b/i, /\bbritish\b/i],
  'CA': [/\bcanada\b/i, /\bcanadian\b/i],
  'AU': [/\baustralia\b/i, /\baustralian\b/i],
  'DE': [/\bgermany\b/i, /\bgerman\b/i, /deutschland/i],
  'FR': [/\bfrance\b/i, /\bfrench\b/i],
  'IT': [/\bitaly\b/i, /\bitalian\b/i],
  'ES': [/\bspain\b/i, /\bspanish\b/i],
  'NL': [/netherlands/i, /\bdutch\b/i, /holland/i],
  'CH': [/switzerland/i, /\bswiss\b/i],
  'IL': [/\bisrael\b/i, /\bisraeli\b/i],
  'JP': [/\bjapan\b/i, /\bjapanese\b/i],
  'CN': [/\bchina\b/i, /\bchinese\b/i],
  'BR': [/\bbrazil\b/i, /\bbrazilian\b/i],
  'IN': [/\bindia\b/i, /\bindian\b/i],
  'KR': [/\bsouth korea\b/i, /\bkorea\b/i, /\bkorean\b/i],
  'SE': [/\bsweden\b/i, /\bswedish\b/i],
  'DK': [/\bdenmark\b/i, /\bdanish\b/i],
  'NO': [/\bnorway\b/i, /\bnorwegian\b/i],
  'FI': [/\bfinland\b/i, /\bfinnish\b/i],
  'PL': [/\bpoland\b/i, /\bpolish\b/i],
  'CZ': [/\bczech\b/i, /czechia/i],
  'AT': [/\baustria\b/i, /\baustrian\b/i],
  'BE': [/\bbelgium\b/i, /\bbelgian\b/i],
  'PT': [/\bportugal\b/i, /\bportuguese\b/i],
  'IE': [/\bireland\b/i, /\birish\b/i],
  'NZ': [/new zealand/i, /\bnz\b/i],
  'MX': [/\bmexico\b/i, /\bmexican\b/i],
  'AR': [/\bargentina\b/i, /\bargentine\b/i],
  'CO': [/\bcolombia\b/i, /\bcolombian\b/i],
  'ZA': [/south africa/i],
  'TR': [/\bturkey\b/i, /\bturkish\b/i],
  'RU': [/\brussia\b/i, /\brussian\b/i],
  'GR': [/\bgreece\b/i, /\bgreek\b/i],
  'HU': [/\bhungary\b/i, /\bhungarian\b/i],
  'RO': [/\bromania\b/i, /\bromanian\b/i],
};

/**
 * Clean up HTML entities and formatting in text
 */
export function cleanText(text: string): string {
  if (!text) return '';

  return text
    // HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Numeric entities
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Extract year from DOI pattern
 * DOIs often contain publication year: 10.1234/journal.2023.xxx
 */
export function extractYearFromDoi(doi?: string): number | undefined {
  if (!doi) return undefined;

  // Common DOI year patterns
  const patterns = [
    /\.(\d{4})\./,           // journal.2023.
    /\/(\d{4})[.-]/,         // /2023. or /2023-
    /(\d{4})$/,              // ends with year
    /s(\d{4})-/,             // s2023-
    /j\.(\d{4})/,            // j.2023
  ];

  for (const pattern of patterns) {
    const match = doi.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1990 && year <= new Date().getFullYear() + 1) {
        return year;
      }
    }
  }

  return undefined;
}

/**
 * Validate and normalize year
 */
export function validateYear(
  providedYear?: number,
  doi?: string
): { year?: number; source?: 'doi' | 'text' | 'provided'; valid: boolean } {
  const currentYear = new Date().getFullYear();
  const minYear = 1990;
  const maxYear = currentYear + 1; // Allow next year for advance publications

  // Try DOI first
  const doiYear = extractYearFromDoi(doi);
  if (doiYear && doiYear >= minYear && doiYear <= maxYear) {
    return { year: doiYear, source: 'doi', valid: true };
  }

  // Use provided year if valid
  if (providedYear && providedYear >= minYear && providedYear <= maxYear) {
    return { year: providedYear, source: 'provided', valid: true };
  }

  // If provided year is out of range, still return it but mark invalid
  if (providedYear) {
    return { year: providedYear, source: 'provided', valid: false };
  }

  return { valid: false };
}

/**
 * Extract country from author affiliations
 */
export function extractCountry(authors?: string, location?: string): { country?: string; source?: string } {
  // Try location first (more specific)
  if (location) {
    for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
      if (patterns.some(p => p.test(location))) {
        return { country: code, source: 'location' };
      }
    }
  }

  // Then try authors/affiliations
  if (authors) {
    for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
      if (patterns.some(p => p.test(authors))) {
        return { country: code, source: 'affiliation' };
      }
    }
  }

  return {};
}

/**
 * Extract sample size from text
 */
export function extractSampleSize(text: string): number | undefined {
  const patterns = [
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|individual|volunteer)s?/gi,
    /\bn\s*=\s*(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /(\d{1,3}(?:,\d{3})*|\d+)\s+(?:were\s+)?(?:enrolled|recruited|randomized|randomised)/gi,
    /sample\s+(?:size\s+)?(?:of\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /total\s+of\s+(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject)/gi,
  ];

  let maxSample = 0;

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr, 10);
      // Reasonable range for medical studies
      if (num >= 5 && num < 100000 && num > maxSample) {
        maxSample = num;
      }
    }
  }

  return maxSample > 0 ? maxSample : undefined;
}

/**
 * Calculate quality score based on study characteristics
 */
export function calculateQualityScore(
  study: {
    title: string;
    abstract?: string;
    year?: number;
    publication?: string;
  },
  config?: ScannerConfig
): { score: number; breakdown: QualityBreakdown } {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  const breakdown: QualityBreakdown = {
    studyDesign: 0,
    methodologyQuality: 0,
    relevance: 0,
    sampleSize: 0,
    recency: 0,
  };

  // === 1. STUDY DESIGN (0-35 points) - MUTUALLY EXCLUSIVE ===
  const studyTypeScores: { pattern: RegExp; score: number }[] = [
    { pattern: /meta[\s-]?analysis|systematic review|cochrane/i, score: 35 },
    { pattern: /randomized.*controlled|randomised.*controlled|\brct\b|double[\s-]?blind.*placebo/i, score: 30 },
    { pattern: /randomized|randomised|controlled trial/i, score: 25 },
    { pattern: /cohort|longitudinal|prospective/i, score: 20 },
    { pattern: /observational|cross[\s-]?sectional/i, score: 15 },
    { pattern: /case[\s-]?control|retrospective/i, score: 12 },
    { pattern: /pilot|preliminary|feasibility/i, score: 10 },
    { pattern: /case report|case series/i, score: 8 },
    { pattern: /in[\s-]?vitro|cell culture|cell line|preclinical/i, score: 5 },
    { pattern: /review|overview/i, score: 3 },
  ];

  for (const st of studyTypeScores) {
    if (st.pattern.test(text)) {
      breakdown.studyDesign = st.score;
      break;
    }
  }

  // === 2. METHODOLOGY QUALITY (0-25 points) ===
  let methodologyScore = 0;
  if (/double[\s-]?blind/i.test(text)) methodologyScore += 8;
  if (/placebo[\s-]?controlled|placebo group|vs\.?\s*placebo/i.test(text)) methodologyScore += 7;
  if (/multi[\s-]?cent(?:er|re)|multi[\s-]?site/i.test(text)) methodologyScore += 5;
  if (/phase\s*[23]|phase\s*(?:ii|iii)\b/i.test(text)) methodologyScore += 5;
  breakdown.methodologyQuality = Math.min(methodologyScore, 25);

  // === 3. RELEVANCE (0-20 points) ===
  let relevanceScore = 0;

  // CBD in title
  if (/\bcbd\b|cannabidiol/i.test(study.title || '')) {
    relevanceScore += 10;
  } else if (/\bcbd\b|cannabidiol/i.test(study.abstract || '')) {
    relevanceScore += 5;
  }

  // Specific products
  if (/epidiolex|sativex|nabiximols/i.test(text)) {
    relevanceScore += 3;
  }

  // Health conditions (bonus for matching)
  const conditionPatterns = [
    'anxiety', 'pain', 'epilepsy', 'seizure', 'sleep', 'depression',
    'inflammation', 'cancer', 'nausea', 'ptsd', 'autism', 'arthritis'
  ];
  const conditionMatches = conditionPatterns.filter(c => text.includes(c));
  relevanceScore += Math.min(conditionMatches.length * 2, 7);

  breakdown.relevance = Math.min(relevanceScore, 20);

  // === 4. SAMPLE SIZE (0-10 points) ===
  const sampleSize = extractSampleSize(text);
  if (sampleSize) {
    if (sampleSize >= 1000) breakdown.sampleSize = 10;
    else if (sampleSize >= 500) breakdown.sampleSize = 8;
    else if (sampleSize >= 100) breakdown.sampleSize = 6;
    else if (sampleSize >= 50) breakdown.sampleSize = 4;
    else if (sampleSize >= 20) breakdown.sampleSize = 2;
  }

  // === 5. RECENCY (0-10 points) ===
  const year = study.year || 2000;
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1) breakdown.recency = 10;
  else if (age <= 2) breakdown.recency = 8;
  else if (age <= 3) breakdown.recency = 6;
  else if (age <= 5) breakdown.recency = 4;
  else if (age <= 10) breakdown.recency = 2;

  // Total score (max 100)
  const totalScore =
    breakdown.studyDesign +
    breakdown.methodologyQuality +
    breakdown.relevance +
    breakdown.sampleSize +
    breakdown.recency;

  return { score: totalScore, breakdown };
}

/**
 * Extract all metadata for a study
 */
export function extractMetadata(
  study: {
    title: string;
    abstract?: string;
    authors?: string;
    publication?: string;
    year?: number;
    doi?: string;
    location?: string;
  },
  config?: ScannerConfig
): ExtractedMetadata {
  // Clean text
  const cleanedTitle = cleanText(study.title);
  const cleanedAbstract = study.abstract ? cleanText(study.abstract) : undefined;

  // Validate year
  const yearResult = validateYear(study.year, study.doi);

  // Extract country
  const countryResult = extractCountry(study.authors, study.location);

  // Calculate quality
  const { score: qualityScore, breakdown: qualityBreakdown } = calculateQualityScore(
    { ...study, title: cleanedTitle, abstract: cleanedAbstract },
    config
  );

  // Extract sample size
  const text = `${cleanedTitle} ${cleanedAbstract || ''}`;
  const estimatedSampleSize = extractSampleSize(text);

  return {
    year: yearResult.year,
    yearSource: yearResult.source,
    yearValid: yearResult.valid,
    country: countryResult.country,
    countrySource: countryResult.source as 'affiliation' | 'location' | 'unknown' | undefined,
    cleanedTitle,
    cleanedAbstract,
    qualityScore,
    qualityBreakdown,
    estimatedSampleSize,
  };
}

/**
 * Normalize title for duplicate detection
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Calculate title similarity using Levenshtein distance
 */
export function titleSimilarity(title1: string, title2: string): number {
  const t1 = normalizeTitle(title1);
  const t2 = normalizeTitle(title2);

  if (t1 === t2) return 100;

  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return 100;

  // Calculate Levenshtein distance
  const m = t1.length;
  const n = t2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (t1[i - 1] === t2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  return Math.round((1 - distance / maxLen) * 100);
}
