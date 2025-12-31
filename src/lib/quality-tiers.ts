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
  PRECLINICAL = 'Preclinical'
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
  [QualityTier.PRECLINICAL]: { min: 0, max: 29 }
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
  if (text.includes('meta-analysis') || text.includes('meta analysis')) {
    return StudyType.META_ANALYSIS;
  }

  if (text.includes('systematic review') ||
      (text.includes('systematic') && text.includes('review'))) {
    return StudyType.SYSTEMATIC_REVIEW;
  }

  // RCT detection
  if (text.includes('randomized controlled trial') ||
      text.includes('randomised controlled trial') ||
      text.includes('rct') ||
      (text.includes('randomized') && text.includes('trial')) ||
      (text.includes('randomised') && text.includes('trial')) ||
      (text.includes('double-blind') && text.includes('placebo'))) {
    return StudyType.RANDOMIZED_CONTROLLED_TRIAL;
  }

  // Other controlled trials
  if (text.includes('controlled trial') ||
      text.includes('controlled study') ||
      text.includes('control group')) {
    return StudyType.CONTROLLED_TRIAL;
  }

  // Animal studies
  if (text.includes('animal model') ||
      text.includes('rodent') ||
      text.includes('mice') ||
      text.includes('mouse') ||
      text.includes('rat') ||
      text.includes('rats') ||
      text.includes('in vivo') ||
      text.includes('preclinical')) {
    return StudyType.ANIMAL_STUDY;
  }

  // In vitro studies
  if (text.includes('in vitro') ||
      text.includes('cell culture') ||
      text.includes('cell line') ||
      text.includes('laboratory study')) {
    return StudyType.IN_VITRO_STUDY;
  }

  // Cohort studies
  if (text.includes('cohort') ||
      text.includes('longitudinal') ||
      text.includes('prospective study') ||
      text.includes('follow-up study')) {
    return StudyType.COHORT_STUDY;
  }

  // Case-control studies
  if (text.includes('case-control') ||
      text.includes('case control') ||
      text.includes('retrospective study')) {
    return StudyType.CASE_CONTROL_STUDY;
  }

  // Cross-sectional studies
  if (text.includes('cross-sectional') ||
      text.includes('cross sectional') ||
      text.includes('survey study') ||
      text.includes('questionnaire study')) {
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

  // Pilot studies
  if (text.includes('pilot') ||
      text.includes('preliminary') ||
      text.includes('feasibility study')) {
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
 * Advanced quality scoring algorithm that evaluates multiple factors
 */
export function calculateQualityScore(study: ResearchStudy): number {
  let score = 0;
  const factors: string[] = [];

  const studyType = detectStudyType(study);
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  const publication = study.publication?.toLowerCase() || '';

  // ========== STUDY TYPE BASE SCORE (0-40 points) ==========
  const studyTypeScores = {
    [StudyType.META_ANALYSIS]: 40,
    [StudyType.SYSTEMATIC_REVIEW]: 38,
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: 35,
    [StudyType.CONTROLLED_TRIAL]: 25,
    [StudyType.COHORT_STUDY]: 20,
    [StudyType.CASE_CONTROL_STUDY]: 18,
    [StudyType.CROSS_SECTIONAL_STUDY]: 15,
    [StudyType.CASE_SERIES]: 12,
    [StudyType.CASE_REPORT]: 8,
    [StudyType.REVIEW_ARTICLE]: 10,
    [StudyType.PILOT_STUDY]: 15,
    [StudyType.SURVEY_STUDY]: 12,
    [StudyType.ANIMAL_STUDY]: 5,
    [StudyType.IN_VITRO_STUDY]: 3,
    [StudyType.UNKNOWN]: 10
  };

  score += studyTypeScores[studyType];
  factors.push(`Study type: ${studyType} (+${studyTypeScores[studyType]} points)`);

  // ========== SAMPLE SIZE AND RIGOR (0-25 points) ==========

  // Large scale indicators
  if (text.includes('multicenter') || text.includes('multi-center') ||
      text.includes('multisite') || text.includes('multi-site')) {
    score += 8;
    factors.push('Multicenter study (+8 points)');
  }

  // Sample size indicators (extract numbers)
  const sampleMatches = text.match(/(\d+)\s*(participant|patient|subject|individual)/g);
  if (sampleMatches) {
    const numbers = sampleMatches.map(match => {
      const num = match.match(/\d+/);
      return num ? parseInt(num[0]) : 0;
    });
    const maxSample = Math.max(...numbers);

    if (maxSample >= 500) {
      score += 15;
      factors.push(`Large sample size (${maxSample}+) (+15 points)`);
    } else if (maxSample >= 100) {
      score += 10;
      factors.push(`Good sample size (${maxSample}) (+10 points)`);
    } else if (maxSample >= 30) {
      score += 5;
      factors.push(`Adequate sample size (${maxSample}) (+5 points)`);
    }
  }

  // Blinding and controls
  if (text.includes('double-blind') || text.includes('double blind')) {
    score += 8;
    factors.push('Double-blind design (+8 points)');
  } else if (text.includes('single-blind') || text.includes('blind')) {
    score += 4;
    factors.push('Blinded design (+4 points)');
  }

  if (text.includes('placebo-controlled') || text.includes('placebo controlled')) {
    score += 6;
    factors.push('Placebo-controlled (+6 points)');
  }

  // ========== PUBLICATION QUALITY (0-20 points) ==========

  // High-impact journals
  const highImpactJournals = [
    'nature', 'science', 'cell', 'lancet', 'new england journal',
    'jama', 'bmj', 'plos medicine', 'brain', 'neurology',
    'pain', 'clinical pharmacology', 'british journal',
    'american journal', 'journal of clinical', 'cochrane'
  ];

  if (highImpactJournals.some(journal => publication.includes(journal))) {
    score += 15;
    factors.push('High-impact journal (+15 points)');
  } else if (publication.includes('journal') || publication.includes('review')) {
    score += 8;
    factors.push('Peer-reviewed journal (+8 points)');
  }

  // Publication year (recent studies are more relevant)
  if (study.year && study.year >= 2020) {
    score += 5;
    factors.push('Recent publication (2020+) (+5 points)');
  } else if (study.year && study.year >= 2015) {
    score += 3;
    factors.push('Recent publication (2015+) (+3 points)');
  }

  // ========== CBD SPECIFICITY AND RELEVANCE (0-15 points) ==========

  // CBD-specific focus
  if (text.includes('cannabidiol') || text.includes('cbd')) {
    score += 8;
    factors.push('CBD-specific study (+8 points)');
  } else if (text.includes('cannabis') || text.includes('cannabinoid')) {
    score += 5;
    factors.push('Cannabis/cannabinoid focus (+5 points)');
  }

  // Clinical relevance
  const clinicalTerms = ['efficacy', 'effectiveness', 'therapeutic', 'treatment', 'clinical trial'];
  if (clinicalTerms.some(term => text.includes(term))) {
    score += 4;
    factors.push('Clinical relevance (+4 points)');
  }

  // Human studies bonus
  if (text.includes('human') || text.includes('patient') || text.includes('participant')) {
    score += 3;
    factors.push('Human study (+3 points)');
  }

  // Ensure score is within bounds
  return Math.min(100, Math.max(0, score));
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
  return QualityTier.PRECLINICAL;
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
    case QualityTier.PRECLINICAL:
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
    case QualityTier.PRECLINICAL:
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
    QualityTier.PRECLINICAL
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