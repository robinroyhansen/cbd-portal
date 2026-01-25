#!/usr/bin/env npx tsx
/**
 * Condition Article Generator Script
 *
 * Usage: npx tsx scripts/generate-condition-articles.ts
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  console.log('Run: export \$(grep -v "^#" .env.local | xargs)');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CONDITIONS = [
  { slug: 'burnout', searchTerms: ['fatigue', 'stress', 'anxiety', 'sleep', 'exhaustion', 'chronic_fatigue'] },
  { slug: 'surgery-recovery', searchTerms: ['pain', 'inflammation', 'wound', 'healing', 'post-operative', 'recovery'] },
  { slug: 'workout-recovery', searchTerms: ['muscle', 'exercise', 'inflammation', 'pain', 'recovery', 'sports'] },
  { slug: 'athletic-recovery', searchTerms: ['sports', 'exercise', 'muscle', 'inflammation', 'performance', 'recovery'] },
  { slug: 'physical-therapy', searchTerms: ['rehabilitation', 'pain', 'muscle', 'mobility', 'recovery', 'chronic_pain'] },
  { slug: 'sports-injuries', searchTerms: ['injury', 'pain', 'inflammation', 'muscle', 'sports', 'trauma'] },
  { slug: 'overuse-injuries', searchTerms: ['repetitive', 'chronic_pain', 'inflammation', 'tendon', 'strain'] },
  { slug: 'muscle-tension', searchTerms: ['muscle', 'spasm', 'pain', 'relaxation', 'spasticity', 'tension'] },
  { slug: 'chronic-fatigue', searchTerms: ['fatigue', 'chronic_fatigue', 'energy', 'sleep', 'fibromyalgia'] },
  { slug: 'better-rest', searchTerms: ['sleep', 'insomnia', 'relaxation', 'anxiety', 'rest'] },
  { slug: 'immune-health', searchTerms: ['immune', 'inflammation', 'autoimmune', 'immunity', 'health'] },
  { slug: 'circulation', searchTerms: ['cardiovascular', 'blood', 'heart', 'vascular', 'circulation'] },
];

interface Study {
  id: string;
  title: string;
  year: number;
  study_type: string;
  study_subject: string;
  sample_size: number | null;
  quality_score: number | null;
  abstract: string | null;
  plain_summary: string | null;
  doi: string | null;
  pmid: string | null;
  slug: string;
  primary_topic: string | null;
  relevant_topics: string[] | null;
}

interface EvidenceAnalysis {
  totalStudies: number;
  humanStudies: number;
  animalStudies: number;
  inVitroStudies: number;
  rctCount: number;
  reviewCount: number;
  metaAnalysisCount: number;
  totalParticipants: number;
  positiveStudies: number;
  highQualityCount: number;
  mediumQualityCount: number;
  lowQualityCount: number;
  yearRange: { min: number; max: number };
  evidenceLevel: 'Strong' | 'Moderate' | 'Limited' | 'Insufficient';
  targetWordCount: { min: number; max: number };
  keyStudies: Study[];
}

async function queryStudiesForCondition(searchTerms: string[]): Promise<Study[]> {
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, slug, primary_topic, relevant_topics')
    .eq('status', 'approved')
    .order('quality_score', { ascending: false });

  if (error) {
    console.error('Error querying studies:', error);
    return [];
  }

  return (data || []).filter((study: Study) => {
    const primaryMatch = study.primary_topic && searchTerms.some(term =>
      study.primary_topic!.toLowerCase().includes(term.toLowerCase())
    );
    const topicsMatch = study.relevant_topics && study.relevant_topics.some(topic =>
      searchTerms.some(term => topic.toLowerCase().includes(term.toLowerCase()))
    );
    const titleMatch = study.title && searchTerms.some(term =>
      study.title.toLowerCase().includes(term.toLowerCase())
    );
    return primaryMatch || topicsMatch || titleMatch;
  });
}

function analyzeEvidence(studies: Study[]): EvidenceAnalysis {
  const analysis: EvidenceAnalysis = {
    totalStudies: studies.length,
    humanStudies: 0, animalStudies: 0, inVitroStudies: 0,
    rctCount: 0, reviewCount: 0, metaAnalysisCount: 0,
    totalParticipants: 0, positiveStudies: 0,
    highQualityCount: 0, mediumQualityCount: 0, lowQualityCount: 0,
    yearRange: { min: 9999, max: 0 },
    evidenceLevel: 'Insufficient',
    targetWordCount: { min: 600, max: 900 },
    keyStudies: [],
  };

  for (const study of studies) {
    if (study.study_subject === 'human' || study.study_subject === 'review') {
      analysis.humanStudies++;
      if (study.sample_size) analysis.totalParticipants += study.sample_size;
    } else if (study.study_subject === 'animal') {
      analysis.animalStudies++;
    } else if (study.study_subject === 'in_vitro') {
      analysis.inVitroStudies++;
    }

    const studyType = study.study_type?.toLowerCase() || '';
    if (studyType.includes('rct') || studyType.includes('randomized')) analysis.rctCount++;
    if (studyType.includes('review') || studyType.includes('systematic')) analysis.reviewCount++;
    if (studyType.includes('meta')) analysis.metaAnalysisCount++;

    const quality = study.quality_score || 0;
    if (quality >= 70) analysis.highQualityCount++;
    else if (quality >= 50) analysis.mediumQualityCount++;
    else analysis.lowQualityCount++;

    if (study.year < analysis.yearRange.min) analysis.yearRange.min = study.year;
    if (study.year > analysis.yearRange.max) analysis.yearRange.max = study.year;
    analysis.positiveStudies++;
  }

  if (analysis.totalStudies >= 20 && (analysis.rctCount >= 3 || analysis.metaAnalysisCount >= 1) && analysis.totalParticipants >= 200) {
    analysis.evidenceLevel = 'Strong';
    analysis.targetWordCount = { min: 1800, max: 2400 };
  } else if (analysis.totalStudies >= 10 && (analysis.rctCount >= 1 || analysis.reviewCount >= 3) && analysis.humanStudies >= 5) {
    analysis.evidenceLevel = 'Moderate';
    analysis.targetWordCount = { min: 1300, max: 1800 };
  } else if (analysis.totalStudies >= 5) {
    analysis.evidenceLevel = 'Limited';
    analysis.targetWordCount = { min: 900, max: 1300 };
  }

  analysis.keyStudies = studies
    .filter(s => s.study_subject === 'human' || s.study_subject === 'review')
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 4);

  return analysis;
}

function formatConditionName(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getEvidenceIndicator(level: string): string {
  const indicators: Record<string, string> = {
    'Strong': String.fromCharCode(9679,9679,9679,9679,9675),
    'Moderate': String.fromCharCode(9679,9679,9679,9675,9675),
    'Limited': String.fromCharCode(9679,9679,9675,9675,9675),
    'Insufficient': String.fromCharCode(9679,9675,9675,9675,9675)
  };
  return indicators[level] || indicators['Insufficient'];
}

console.log('Script loaded successfully. Run with: export \$(grep -v "^#" .env.local | xargs) && npx tsx scripts/generate-condition-articles.ts');
