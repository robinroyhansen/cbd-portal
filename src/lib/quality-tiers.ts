/**
 * CBD Research Quality Assessment System
 *
 * This module implements a comprehensive 5-tier quality assessment system
 * for CBD research studies, evaluating methodology, sample size, publication
 * quality, and relevance to provide objective quality classifications.
 *
 * @version 2.0
 * @author CBD Portal Research Team
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ResearchStudy {
  id: string;
  title: string;
  abstract?: string;
  authors?: string;
  publication?: string;
  year?: number;
  url?: string;
  doi?: string;
  relevance_score?: number;
  relevant_topics?: string[] | string;
}

export interface QualityAssessment {
  tier: QualityTier;
  score: number;
  studyType: StudyType;
  reasoning: string[];
  strengths: string[];
  limitations: string[];
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export enum QualityTier {
  GOLD_STANDARD = 'Gold Standard',
  HIGH_QUALITY = 'High Quality',
  MODERATE_QUALITY = 'Moderate Quality',
  LIMITED_EVIDENCE = 'Limited Evidence',
  PRELIMINARY = 'Preliminary'
}

export enum StudyType {
  SYSTEMATIC_REVIEW = 'Systematic Review',
  META_ANALYSIS = 'Meta-Analysis',
  RANDOMIZED_CONTROLLED_TRIAL = 'Randomized Controlled Trial',
  CONTROLLED_TRIAL = 'Controlled Trial',
  COHORT_STUDY = 'Cohort Study',
  CASE_CONTROL_STUDY = 'Case-Control Study',
  CROSS_SECTIONAL_STUDY = 'Cross-Sectional Study',
  CASE_SERIES = 'Case Series',
  CASE_REPORT = 'Case Report',
  ANIMAL_STUDY = 'Animal Study',
  IN_VITRO_STUDY = 'In Vitro Study',
  REVIEW_ARTICLE = 'Review Article',
  SURVEY_STUDY = 'Survey Study',
  PILOT_STUDY = 'Pilot Study',
  UNKNOWN = 'Unknown'
}

// Quality tier scoring ranges
export const QUALITY_SCORE_RANGES = {
  [QualityTier.GOLD_STANDARD]: { min: 90, max: 100 },
  [QualityTier.HIGH_QUALITY]: { min: 70, max: 89 },
  [QualityTier.MODERATE_QUALITY]: { min: 50, max: 69 },
  [QualityTier.LIMITED_EVIDENCE]: { min: 30, max: 49 },
  [QualityTier.PRELIMINARY]: { min: 0, max: 29 }
};

// ============================================================================
// STUDY TYPE DETECTION
// ============================================================================

/**
 * Detects the study type based on title, abstract, and publication patterns
 */
export function detectStudyType(study: ResearchStudy): StudyType {
  const text = `${study.title || ''} ${study.abstract || ''} ${study.publication || ''}`.toLowerCase();

  // Meta-analysis and systematic review detection (highest priority)
  if (text.includes('meta-analysis') ||
      text.includes('meta analysis') ||
      text.includes('pooled analysis') ||
      /meta[\s-]?analytic/i.test(text)) {
    return StudyType.META_ANALYSIS;
  }

  if (text.includes('systematic review') ||
      (text.includes('systematic') && text.includes('review')) ||
      text.includes('cochrane review') ||
      text.includes('prisma')) {
    return StudyType.SYSTEMATIC_REVIEW;
  }

  // RCT detection - expanded patterns
  if (text.includes('randomized controlled trial') ||
      text.includes('randomised controlled trial') ||
      /\brct\b/.test(text) ||
      /\brcts\b/.test(text) ||
      (text.includes('randomized') && text.includes('trial')) ||
      (text.includes('randomised') && text.includes('trial')) ||
      (text.includes('double-blind') && text.includes('placebo')) ||
      /phase\s*[234]|phase\s*(?:ii|iii|iv)\b/i.test(text) ||
      /random(?:ly)?\s+(?:assigned|allocated|divided)/i.test(text) ||
      /\brandomization\b|\brandomisation\b/i.test(text) ||
      text.includes('parallel-group') ||
      text.includes('parallel group') ||
      /crossover\s+(?:trial|study|design)/i.test(text) ||
      /cross-over\s+(?:trial|study|design)/i.test(text)) {
    return StudyType.RANDOMIZED_CONTROLLED_TRIAL;
  }

  // Other controlled trials - expanded patterns
  if (text.includes('controlled trial') ||
      text.includes('controlled study') ||
      text.includes('control group') ||
      text.includes('open-label') ||
      text.includes('open label') ||
      text.includes('single-arm') ||
      text.includes('single arm') ||
      text.includes('comparative study') ||
      text.includes('comparative trial') ||
      /phase\s*[1i]\b/i.test(text) ||
      text.includes('non-randomized') ||
      text.includes('nonrandomized') ||
      text.includes('non-randomised') ||
      text.includes('nonrandomised')) {
    return StudyType.CONTROLLED_TRIAL;
  }

  // Animal studies
  if (text.includes('animal model') ||
      text.includes('rodent') ||
      /\bmice\b/.test(text) ||
      /\bmouse\b/.test(text) ||
      /\brat\b/.test(text) ||
      /\brats\b/.test(text) ||
      text.includes('in vivo') ||
      text.includes('preclinical') ||
      text.includes('murine') ||
      /\bzebrafish\b/.test(text) ||
      /\bprimate\b/.test(text) ||
      /\bcanine\b/.test(text) ||
      /\bporcine\b/.test(text)) {
    return StudyType.ANIMAL_STUDY;
  }

  // In vitro studies
  if (text.includes('in vitro') ||
      text.includes('cell culture') ||
      text.includes('cell line') ||
      text.includes('laboratory study') ||
      /\bhela\b/.test(text) ||
      text.includes('cultured cells') ||
      text.includes('primary cells')) {
    return StudyType.IN_VITRO_STUDY;
  }

  // Cohort studies - expanded patterns
  if (text.includes('cohort') ||
      text.includes('longitudinal') ||
      text.includes('prospective study') ||
      text.includes('follow-up study') ||
      text.includes('observational study') ||
      text.includes('observational cohort') ||
      text.includes('registry study') ||
      text.includes('real-world') ||
      text.includes('real world')) {
    return StudyType.COHORT_STUDY;
  }

  // Case-control studies - expanded patterns
  if (text.includes('case-control') ||
      text.includes('case control') ||
      text.includes('retrospective study') ||
      text.includes('retrospective analysis') ||
      text.includes('retrospective cohort') ||
      text.includes('chart review') ||
      text.includes('medical record review')) {
    return StudyType.CASE_CONTROL_STUDY;
  }

  // Cross-sectional studies
  if (text.includes('cross-sectional') ||
      text.includes('cross sectional') ||
      text.includes('survey study') ||
      text.includes('questionnaire study') ||
      text.includes('prevalence study')) {
    return StudyType.CROSS_SECTIONAL_STUDY;
  }

  // Case series and reports
  if (text.includes('case series') ||
      text.includes('case report') ||
      text.includes('case study')) {
    return text.includes('series') ? StudyType.CASE_SERIES : StudyType.CASE_REPORT;
  }

  // Review articles
  if (text.includes('review') && !text.includes('systematic')) {
    return StudyType.REVIEW_ARTICLE;
  }

  // Pilot studies - expanded patterns
  if (text.includes('pilot study') ||
      text.includes('pilot trial') ||
      text.includes('feasibility study') ||
      text.includes('feasibility trial') ||
      text.includes('preliminary study') ||
      text.includes('preliminary trial') ||
      text.includes('proof-of-concept') ||
      text.includes('proof of concept') ||
      text.includes('exploratory study') ||
      text.includes('exploratory trial')) {
    return StudyType.PILOT_STUDY;
  }

  // Survey studies
  if (text.includes('survey') ||
      text.includes('questionnaire')) {
    return StudyType.SURVEY_STUDY;
  }

  return StudyType.UNKNOWN;
}

// ============================================================================
// QUALITY SCORING ALGORITHM
// ============================================================================

/**
 * Quality scoring algorithm - totals exactly 100 points maximum
 *
 * STUDY DESIGN:  50 points max
 * METHODOLOGY:   25 points max
 * SAMPLE SIZE:   15 points max
 * RELEVANCE:     10 points max
 * ─────────────────────────────
 * TOTAL:        100 points max
 */
export function calculateQualityScore(study: ResearchStudy): number {
  return calculateQualityScoreWithBreakdown(study).total;
}

/**
 * Score breakdown interface for detailed scoring transparency
 */
export interface ScoreBreakdown {
  total: number;
  studyDesign: {
    score: number;
    studyType: StudyType;
  };
  methodology: {
    score: number;
    doubleBlind: boolean;
    placeboControlled: boolean;
    multicenter: boolean;
    singleBlind: boolean;
  };
  sampleSize: {
    score: number;
    extractedSize: number;
  };
  relevance: {
    score: number;
    humanStudy: boolean;
    cbdSpecific: boolean;
  };
}

/**
 * Quality scoring with detailed breakdown
 */
export function calculateQualityScoreWithBreakdown(study: ResearchStudy): ScoreBreakdown {
  const studyType = detectStudyType(study);
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  // ========== STUDY DESIGN (0-50 points) ==========
  const studyTypeScores: Record<StudyType, number> = {
    [StudyType.META_ANALYSIS]: 50,
    [StudyType.SYSTEMATIC_REVIEW]: 45,
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: 40,
    [StudyType.CONTROLLED_TRIAL]: 30,
    [StudyType.COHORT_STUDY]: 25,
    [StudyType.CASE_CONTROL_STUDY]: 20,
    [StudyType.PILOT_STUDY]: 18,
    [StudyType.CROSS_SECTIONAL_STUDY]: 15,
    [StudyType.CASE_SERIES]: 12,
    [StudyType.REVIEW_ARTICLE]: 10,
    [StudyType.CASE_REPORT]: 8,
    [StudyType.SURVEY_STUDY]: 12,
    [StudyType.ANIMAL_STUDY]: 6,
    [StudyType.IN_VITRO_STUDY]: 4,
    [StudyType.UNKNOWN]: 10
  };

  const studyDesignScore = studyTypeScores[studyType];

  // ========== METHODOLOGY (0-25 points) ==========
  let methodologyScore = 0;

  // Double-blind: +10 (expanded patterns)
  const isDoubleBlind = text.includes('double-blind') ||
    text.includes('double blind') ||
    text.includes('doubleblind') ||
    text.includes('double-blinded') ||
    text.includes('double blinded') ||
    text.includes('double-masked') ||
    text.includes('double masked') ||
    /participant[s]?[\s-]?blind/i.test(text) ||
    /investigator[\s-]?blind/i.test(text);

  if (isDoubleBlind) {
    methodologyScore += 10;
  }

  // Single-blind: +5 (if not already double-blind)
  const isSingleBlind = !isDoubleBlind && (
    text.includes('single-blind') ||
    text.includes('single blind') ||
    text.includes('single-blinded') ||
    text.includes('single blinded') ||
    text.includes('single-masked') ||
    text.includes('assessor-blind') ||
    text.includes('assessor blind') ||
    text.includes('observer-blind') ||
    text.includes('rater-blind'));

  if (isSingleBlind) {
    methodologyScore += 5;
  }

  // Placebo-controlled: +8 (expanded patterns)
  const isPlaceboControlled = text.includes('placebo-controlled') ||
    text.includes('placebo controlled') ||
    text.includes('placebo group') ||
    text.includes('versus placebo') ||
    text.includes('vs placebo') ||
    text.includes('vs. placebo') ||
    text.includes('compared to placebo') ||
    text.includes('compared with placebo') ||
    text.includes('against placebo') ||
    /placebo[\s-]?arm/i.test(text) ||
    /received\s+(?:a\s+)?placebo/i.test(text);

  if (isPlaceboControlled) {
    methodologyScore += 8;
  }

  // Multicenter: +7 (expanded patterns)
  const isMulticenter = text.includes('multicenter') ||
    text.includes('multi-center') ||
    text.includes('multisite') ||
    text.includes('multi-site') ||
    text.includes('multicentre') ||
    text.includes('multi-centre') ||
    text.includes('multiple sites') ||
    text.includes('multiple centers') ||
    text.includes('multiple centres') ||
    /\d+\s+(?:sites?|centers?|centres?|hospitals?|clinics?)/i.test(text) ||
    /(?:across|at)\s+\d+\s+(?:sites?|centers?|centres?)/i.test(text) ||
    text.includes('international') ||
    text.includes('multinational');

  if (isMulticenter) {
    methodologyScore += 7;
  }

  // ========== SAMPLE SIZE (0-15 points) ==========
  const samplePatterns = [
    // Standard participant patterns with various subject terms
    /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|individual|volunteer|adult|child|children|people|person|men|women|male|female)s?/gi,
    // N = X patterns (with flexible spacing)
    /\bn\s*=\s*(\d{1,3}(?:,\d{3})*|\d+)/gi,
    // Enrollment patterns
    /(?:will|to)\s+(?:enroll|recruit|include)\s+(?:up\s+to\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /(?:up\s+to|approximately|about|total of|a total of)\s+(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|people|individual)?s?/gi,
    // Sample size patterns
    /sample\s+(?:size\s+)?(?:of\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
    /enroll(?:ed|ment|ing)?\s+(?:of\s+)?(?:up\s+to\s+)?(\d{1,3}(?:,\d{3})*|\d+)/gi,
    // Action patterns (enrolled, recruited, etc.)
    /(\d{1,3}(?:,\d{3})*|\d+)\s+(?:were\s+)?(?:enrolled|recruited|included|randomized|randomised|assigned|completed|analyzed|analysed)/gi,
    // Study included/involved patterns
    /(?:study\s+)?(?:included|involved|comprised|consisted of)\s+(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|people|individual)?s?/gi,
    // Between X and Y participants
    /between\s+\d+\s+and\s+(\d{1,3}(?:,\d{3})*|\d+)\s*(?:participant|patient|subject|people)?s?/gi,
    // Total of X
    /total\s+of\s+(\d{1,3}(?:,\d{3})*|\d+)/gi,
    // X human subjects
    /(\d{1,3}(?:,\d{3})*|\d+)\s+human\s+subjects?/gi,
    // Studies/trials in meta-analysis
    /(\d{1,3}(?:,\d{3})*|\d+)\s+(?:studies|trials|articles|papers)/gi,
  ];

  let maxSample = 0;
  for (const pattern of samplePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      // Remove commas from numbers like "1,000"
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr);
      if (num >= 5 && num < 100000 && num > maxSample) {
        maxSample = num;
      }
    }
  }

  let sampleSizeScore = 0;
  if (maxSample >= 1000) {
    sampleSizeScore = 15;
  } else if (maxSample >= 500) {
    sampleSizeScore = 14;
  } else if (maxSample >= 200) {
    sampleSizeScore = 12;
  } else if (maxSample >= 100) {
    sampleSizeScore = 10;
  } else if (maxSample >= 50) {
    sampleSizeScore = 8;
  } else if (maxSample >= 30) {
    sampleSizeScore = 6;
  } else if (maxSample >= 20) {
    sampleSizeScore = 5;
  } else if (maxSample >= 10) {
    sampleSizeScore = 3;
  }

  // ========== RELEVANCE (0-10 points) ==========
  let relevanceScore = 0;

  // Human study: +7
  const isHumanStudy = text.includes('human') ||
    text.includes('patient') ||
    text.includes('participant') ||
    text.includes('volunteer') ||
    /\bsubjects?\b/.test(text) ||
    /\badults?\b/.test(text) ||
    /\bchildren\b/.test(text) ||
    /\bchild\b/.test(text) ||
    /\bmen\b/.test(text) ||
    /\bwomen\b/.test(text) ||
    /\bmale\b/.test(text) ||
    /\bfemale\b/.test(text) ||
    /\bpeople\b/.test(text) ||
    /\bindividuals?\b/.test(text);

  if (isHumanStudy) {
    relevanceScore += 7;
  }

  // CBD-specific: +3
  const isCbdSpecific = text.includes('cannabidiol') || /\bcbd\b/.test(text);
  if (isCbdSpecific) {
    relevanceScore += 3;
  }

  // Calculate total
  const total = Math.min(100, Math.max(0,
    studyDesignScore + methodologyScore + sampleSizeScore + relevanceScore
  ));

  return {
    total,
    studyDesign: {
      score: studyDesignScore,
      studyType
    },
    methodology: {
      score: methodologyScore,
      doubleBlind: isDoubleBlind,
      placeboControlled: isPlaceboControlled,
      multicenter: isMulticenter,
      singleBlind: isSingleBlind
    },
    sampleSize: {
      score: sampleSizeScore,
      extractedSize: maxSample
    },
    relevance: {
      score: relevanceScore,
      humanStudy: isHumanStudy,
      cbdSpecific: isCbdSpecific
    }
  };
}

// ============================================================================
// TIER CLASSIFICATION
// ============================================================================

/**
 * Classifies a study into quality tier based on score
 */
export function classifyQualityTier(score: number): QualityTier {
  if (score >= 90) return QualityTier.GOLD_STANDARD;
  if (score >= 70) return QualityTier.HIGH_QUALITY;
  if (score >= 50) return QualityTier.MODERATE_QUALITY;
  if (score >= 30) return QualityTier.LIMITED_EVIDENCE;
  return QualityTier.PRELIMINARY;
}

// ============================================================================
// COMPREHENSIVE ASSESSMENT
// ============================================================================

/**
 * Performs comprehensive quality assessment of a research study
 */
export function assessStudyQuality(study: ResearchStudy): QualityAssessment {
  const score = calculateQualityScore(study);
  const tier = classifyQualityTier(score);
  const studyType = detectStudyType(study);

  // Generate reasoning based on scoring factors
  const reasoning: string[] = [];
  const strengths: string[] = [];
  const limitations: string[] = [];

  // Study type reasoning
  reasoning.push(`Classified as ${studyType}`);

  if ([StudyType.META_ANALYSIS, StudyType.SYSTEMATIC_REVIEW].includes(studyType)) {
    strengths.push('Highest level of evidence - synthesizes multiple studies');
  } else if (studyType === StudyType.RANDOMIZED_CONTROLLED_TRIAL) {
    strengths.push('Gold standard methodology for clinical research');
  } else if ([StudyType.ANIMAL_STUDY, StudyType.IN_VITRO_STUDY].includes(studyType)) {
    limitations.push('Preclinical evidence - limited direct human relevance');
  }

  // Publication quality
  const publication = study.publication?.toLowerCase() || '';
  if (publication.includes('journal')) {
    strengths.push('Published in peer-reviewed journal');
  }

  // Recency
  if (study.year && study.year >= 2020) {
    strengths.push('Recent research with current relevance');
  } else if (study.year && study.year < 2010) {
    limitations.push('Older study - may not reflect current understanding');
  }

  // CBD specificity
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  if (text.includes('cannabidiol') || text.includes('cbd')) {
    strengths.push('Specifically focuses on CBD');
  } else {
    limitations.push('General cannabis research - CBD specificity unclear');
  }

  return {
    tier,
    score,
    studyType,
    reasoning,
    strengths,
    limitations
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets display color for quality tier
 */
export function getQualityTierColor(tier: QualityTier): string {
  switch (tier) {
    case QualityTier.GOLD_STANDARD:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case QualityTier.HIGH_QUALITY:
      return 'bg-green-100 text-green-800 border-green-300';
    case QualityTier.MODERATE_QUALITY:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case QualityTier.LIMITED_EVIDENCE:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case QualityTier.PRELIMINARY:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Gets display color for study type
 */
export function getStudyTypeColor(studyType: StudyType): string {
  switch (studyType) {
    case StudyType.META_ANALYSIS:
    case StudyType.SYSTEMATIC_REVIEW:
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case StudyType.RANDOMIZED_CONTROLLED_TRIAL:
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case StudyType.CONTROLLED_TRIAL:
    case StudyType.COHORT_STUDY:
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case StudyType.ANIMAL_STUDY:
    case StudyType.IN_VITRO_STUDY:
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

/**
 * Gets quality tier description
 */
export function getQualityTierDescription(tier: QualityTier): string {
  switch (tier) {
    case QualityTier.GOLD_STANDARD:
      return 'Highest quality evidence from well-designed RCTs or comprehensive meta-analyses';
    case QualityTier.HIGH_QUALITY:
      return 'Strong evidence from good quality controlled studies';
    case QualityTier.MODERATE_QUALITY:
      return 'Moderate evidence with some limitations in methodology or scope';
    case QualityTier.LIMITED_EVIDENCE:
      return 'Preliminary evidence requiring further validation';
    case QualityTier.PRELIMINARY:
      return 'Early-stage evidence from laboratory or animal studies';
  }
}

/**
 * Filters studies by quality tier
 */
export function filterStudiesByQuality(
  studies: ResearchStudy[],
  minTier: QualityTier
): ResearchStudy[] {
  const tierOrder = [
    QualityTier.GOLD_STANDARD,
    QualityTier.HIGH_QUALITY,
    QualityTier.MODERATE_QUALITY,
    QualityTier.LIMITED_EVIDENCE,
    QualityTier.PRELIMINARY
  ];

  const minIndex = tierOrder.indexOf(minTier);

  return studies.filter(study => {
    const assessment = assessStudyQuality(study);
    const studyIndex = tierOrder.indexOf(assessment.tier);
    return studyIndex <= minIndex;
  });
}

/**
 * Sorts studies by quality score (descending)
 */
export function sortStudiesByQuality(studies: ResearchStudy[]): ResearchStudy[] {
  return [...studies].sort((a, b) => {
    const scoreA = calculateQualityScore(a);
    const scoreB = calculateQualityScore(b);
    return scoreB - scoreA;
  });
}