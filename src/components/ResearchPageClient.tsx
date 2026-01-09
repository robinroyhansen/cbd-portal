'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  QualityTier,
  StudyType,
  detectStudyType,
  calculateQualityScore,
  classifyQualityTier,
  assessStudyQuality,
  sortStudiesByQuality,
  filterStudiesByQuality
} from '../lib/quality-tiers';
import { QualityBadge, QualityScoreBadge, QualityIndicator } from './QualityBadge';
import { StudyTypeBadge, StudyTypeBadgeSimple, EvidenceLevelIndicator, StudyTypeFilter } from './StudyTypeBadge';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  abstract?: string;
  plain_summary?: string;
  url: string;
  doi?: string;
  source_site?: string;
  source_type: 'research_queue' | 'citation';
  relevant_topics?: string[] | string;
  relevance_score?: number;
}

interface ResearchPageClientProps {
  initialResearch: ResearchItem[];
  condition?: string;
}

type SortOption = 'quality' | 'year' | 'title' | 'relevance';
type ViewMode = 'cards' | 'table' | 'timeline';
type StudyCategory = 'all' | 'cbd' | 'cannabinoids' | 'cannabis' | 'medical-cannabis';

// ============================================================================
// CONDITION/TOPIC DEFINITIONS - Organized by Category
// ============================================================================

// Condition category groupings for UI organization
export const CONDITION_CATEGORIES = {
  'Neurological & Mental Health': ['anxiety', 'depression', 'ptsd', 'sleep', 'epilepsy', 'parkinsons', 'alzheimers', 'autism', 'adhd', 'schizophrenia', 'addiction', 'tourettes'],
  'Pain & Inflammation': ['chronic_pain', 'neuropathic_pain', 'arthritis', 'fibromyalgia', 'ms', 'inflammation', 'migraines'],
  'Gastrointestinal': ['crohns', 'ibs', 'nausea'],
  'Cancer': ['cancer', 'chemo_side_effects'],
  'Skin': ['acne', 'psoriasis', 'eczema'],
  'Cardiovascular': ['heart', 'blood_pressure'],
  'Other': ['diabetes', 'obesity', 'athletic', 'veterinary']
} as const;

export const CONDITIONS = {
  // === NEUROLOGICAL & MENTAL HEALTH ===
  anxiety: {
    label: 'Anxiety',
    keywords: ['anxiety', 'anxiolytic', 'gad', 'generalized anxiety', 'social anxiety', 'panic disorder', 'panic attack', 'anxious'],
    icon: '😰',
    color: 'purple',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for anxiety disorders and stress relief'
  },
  depression: {
    label: 'Depression',
    keywords: ['depression', 'depressive', 'antidepressant', 'mdd', 'major depressive', 'mood disorder', 'dysthymia'],
    icon: '😔',
    color: 'blue',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for depression and mood disorders'
  },
  ptsd: {
    label: 'PTSD',
    keywords: ['ptsd', 'post-traumatic', 'posttraumatic', 'trauma', 'traumatic stress', 'combat veteran', 'flashback'],
    icon: '🎖️',
    color: 'slate',
    category: 'Neurological & Mental Health',
    description: 'Studies on CBD for PTSD and trauma-related disorders'
  },
  sleep: {
    label: 'Sleep & Insomnia',
    keywords: ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'somnolence', 'sleep latency', 'rem sleep'],
    icon: '😴',
    color: 'indigo',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD effects on sleep quality and insomnia'
  },
  epilepsy: {
    label: 'Epilepsy & Seizures',
    keywords: ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'anticonvulsant', 'epidiolex', 'convulsion', 'ictal', 'intractable epilepsy'],
    icon: '⚡',
    color: 'yellow',
    category: 'Neurological & Mental Health',
    description: 'Clinical studies on CBD for epilepsy and seizure disorders'
  },
  parkinsons: {
    label: "Parkinson's",
    keywords: ['parkinson', 'parkinsonian', 'dopamine', 'tremor', 'bradykinesia', 'dyskinesia', 'lewy body'],
    icon: '🧠',
    color: 'teal',
    category: 'Neurological & Mental Health',
    description: "Research on CBD for Parkinson's disease symptoms"
  },
  alzheimers: {
    label: "Alzheimer's & Dementia",
    keywords: ['alzheimer', 'dementia', 'cognitive decline', 'memory loss', 'amyloid', 'tau protein', 'neurodegeneration', 'cognitive impairment'],
    icon: '🧓',
    color: 'gray',
    category: 'Neurological & Mental Health',
    description: "Studies on CBD for Alzheimer's and dementia"
  },
  autism: {
    label: 'Autism & ASD',
    keywords: ['autism', 'asd', 'autistic', 'asperger', 'spectrum disorder', 'developmental disorder', 'neurodevelopmental'],
    icon: '🧩',
    color: 'cyan',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for autism spectrum disorders'
  },
  adhd: {
    label: 'ADHD',
    keywords: ['adhd', 'attention deficit', 'hyperactivity', 'add', 'inattention', 'impulsivity', 'executive function'],
    icon: '🎯',
    color: 'orange',
    category: 'Neurological & Mental Health',
    description: 'Studies on CBD for ADHD and attention disorders'
  },
  schizophrenia: {
    label: 'Schizophrenia',
    keywords: ['schizophrenia', 'psychosis', 'psychotic', 'antipsychotic', 'hallucination', 'delusion', 'negative symptoms'],
    icon: '🌀',
    color: 'violet',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD antipsychotic effects'
  },
  addiction: {
    label: 'Addiction',
    keywords: ['addiction', 'substance abuse', 'substance use disorder', 'cannabis use disorder', 'cud', 'opioid use', 'withdrawal symptoms', 'dependence', 'alcohol use disorder', 'drug abuse', 'cocaine', 'heroin', 'relapse prevention', 'discontinuing cannabis', 'quit cannabis', 'cannabis withdrawal'],
    icon: '🔄',
    color: 'green',
    category: 'Neurological & Mental Health',
    description: 'Research on CBD for addiction treatment and withdrawal'
  },
  tourettes: {
    label: "Tourette's",
    keywords: ['tourette', 'tic disorder', 'tics', 'motor tic', 'vocal tic', 'coprolalia'],
    icon: '💬',
    color: 'lime',
    category: 'Neurological & Mental Health',
    description: "Studies on CBD for Tourette's syndrome"
  },

  // === PAIN & INFLAMMATION ===
  chronic_pain: {
    label: 'Chronic Pain',
    keywords: ['chronic pain', 'persistent pain', 'long-term pain', 'pain management', 'analgesic', 'pain relief', 'opioid-sparing'],
    icon: '💪',
    color: 'red',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for chronic pain management'
  },
  neuropathic_pain: {
    label: 'Neuropathic Pain',
    keywords: ['neuropathic', 'neuropathy', 'nerve pain', 'peripheral neuropathy', 'diabetic neuropathy', 'neuralgia', 'allodynia'],
    icon: '⚡',
    color: 'amber',
    category: 'Pain & Inflammation',
    description: 'Research on CBD for nerve-related pain'
  },
  arthritis: {
    label: 'Arthritis',
    keywords: ['arthritis', 'osteoarthritis', 'rheumatoid', 'joint pain', 'joint inflammation', 'synovitis', 'articular'],
    icon: '🦴',
    color: 'stone',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for arthritis and joint conditions'
  },
  fibromyalgia: {
    label: 'Fibromyalgia',
    keywords: ['fibromyalgia', 'fibro', 'widespread pain', 'tender points', 'central sensitization'],
    icon: '🌡️',
    color: 'fuchsia',
    category: 'Pain & Inflammation',
    description: 'Research on CBD for fibromyalgia'
  },
  ms: {
    label: 'Multiple Sclerosis',
    keywords: ['multiple sclerosis', 'demyelinating', 'demyelination', 'spasticity', 'sativex', 'nabiximols', 'relapsing-remitting', 'rrms', 'ppms', 'spms'],
    icon: '🧬',
    color: 'orange',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for MS symptoms and spasticity'
  },
  inflammation: {
    label: 'Inflammation',
    keywords: ['inflammation', 'inflammatory', 'anti-inflammatory', 'cytokine', 'tnf-alpha', 'interleukin', 'nf-kb', 'cox-2', 'prostaglandin'],
    icon: '🔥',
    color: 'orange',
    category: 'Pain & Inflammation',
    description: 'Research on CBD anti-inflammatory effects'
  },
  migraines: {
    label: 'Migraines & Headaches',
    keywords: ['migraine', 'headache', 'cephalalgia', 'cluster headache', 'tension headache', 'aura'],
    icon: '🤕',
    color: 'red',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for migraines and headaches'
  },

  // === GASTROINTESTINAL ===
  crohns: {
    label: "Crohn's Disease",
    keywords: ['crohn', 'inflammatory bowel', 'ibd', 'intestinal inflammation', 'colitis', 'ulcerative colitis'],
    icon: '🫃',
    color: 'amber',
    category: 'Gastrointestinal',
    description: "Research on CBD for Crohn's and IBD"
  },
  ibs: {
    label: 'IBS',
    keywords: ['ibs', 'irritable bowel', 'functional gastrointestinal', 'abdominal pain', 'bowel dysfunction'],
    icon: '🌀',
    color: 'yellow',
    category: 'Gastrointestinal',
    description: 'Studies on CBD for irritable bowel syndrome'
  },
  nausea: {
    label: 'Nausea & Vomiting',
    keywords: ['nausea', 'vomiting', 'emesis', 'antiemetic', 'chemotherapy-induced nausea', 'cinv', 'morning sickness'],
    icon: '🤢',
    color: 'green',
    category: 'Gastrointestinal',
    description: 'Research on CBD antiemetic effects'
  },

  // === CANCER ===
  cancer: {
    label: 'Cancer',
    keywords: ['cancer', 'tumor', 'tumour', 'oncology', 'carcinoma', 'malignant', 'metastasis', 'apoptosis', 'antitumor'],
    icon: '🎗️',
    color: 'pink',
    category: 'Cancer',
    description: 'Research on CBD in cancer treatment'
  },
  chemo_side_effects: {
    label: 'Chemotherapy Side Effects',
    keywords: ['chemotherapy', 'chemo-induced', 'chemotherapy-induced', 'palliative', 'cancer pain', 'cachexia', 'wasting syndrome'],
    icon: '💊',
    color: 'rose',
    category: 'Cancer',
    description: 'Studies on CBD for chemotherapy side effects'
  },

  // === SKIN ===
  acne: {
    label: 'Acne',
    keywords: ['acne', 'sebaceous', 'sebum', 'comedone', 'pimple', 'sebocyte'],
    icon: '✨',
    color: 'sky',
    category: 'Skin',
    description: 'Research on CBD for acne treatment'
  },
  psoriasis: {
    label: 'Psoriasis',
    keywords: ['psoriasis', 'psoriatic', 'plaque psoriasis', 'scalp psoriasis', 'keratinocyte'],
    icon: '🧴',
    color: 'rose',
    category: 'Skin',
    description: 'Studies on CBD for psoriasis'
  },
  eczema: {
    label: 'Eczema & Dermatitis',
    keywords: ['eczema', 'dermatitis', 'atopic', 'pruritus', 'itching', 'skin inflammation', 'topical'],
    icon: '🩹',
    color: 'pink',
    category: 'Skin',
    description: 'Research on CBD for eczema and skin conditions'
  },

  // === CARDIOVASCULAR ===
  heart: {
    label: 'Heart Health',
    keywords: ['cardiovascular', 'cardiac', 'heart disease', 'cardioprotective', 'myocardial', 'arrhythmia', 'heart failure'],
    icon: '❤️',
    color: 'red',
    category: 'Cardiovascular',
    description: 'Research on CBD cardiovascular effects'
  },
  blood_pressure: {
    label: 'Blood Pressure',
    keywords: ['blood pressure', 'hypertension', 'hypotension', 'vascular', 'vasorelaxation', 'vasodilation', 'arterial'],
    icon: '🩺',
    color: 'red',
    category: 'Cardiovascular',
    description: 'Studies on CBD blood pressure effects'
  },

  // === OTHER ===
  diabetes: {
    label: 'Diabetes',
    keywords: ['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'metabolic syndrome', 'type 2 diabetes'],
    icon: '🩸',
    color: 'blue',
    category: 'Other',
    description: 'Research on CBD for diabetes management'
  },
  obesity: {
    label: 'Obesity & Weight',
    keywords: ['obesity', 'weight loss', 'appetite', 'metabolic', 'bmi', 'adipose', 'fat tissue', 'overweight'],
    icon: '⚖️',
    color: 'emerald',
    category: 'Other',
    description: 'Studies on CBD and weight management'
  },
  athletic: {
    label: 'Athletic Performance',
    keywords: ['athletic', 'sport', 'exercise', 'recovery', 'muscle', 'performance', 'endurance', 'wada', 'athlete'],
    icon: '🏃',
    color: 'green',
    category: 'Other',
    description: 'Research on CBD for athletic performance and recovery'
  },
  veterinary: {
    label: 'Veterinary & Pets',
    keywords: ['veterinary', 'canine', 'feline', 'dog', 'cat', 'pet', 'animal', 'equine', 'horse'],
    icon: '🐕',
    color: 'amber',
    category: 'Other',
    description: 'Studies on CBD for pets and animals'
  }
} as const;

export type ConditionKey = keyof typeof CONDITIONS;

// ============================================================================
// FILTER PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'cbd-research-filters';

interface SavedFilters {
  searchQuery: string;
  activeCategory: StudyCategory;
  selectedQualityTiers: QualityTier[];
  selectedStudyTypes: StudyType[];
  selectedConditions: ConditionKey[];
  yearRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
  showHumanStudiesOnly: boolean;
  sortBy: SortOption;
  viewMode: ViewMode;
}

function loadSavedFilters(): Partial<SavedFilters> | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveFilters(filters: SavedFilters) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

type SubjectType = 'humans' | 'mice' | 'rats' | 'animals' | 'cells' | 'dogs' | 'cats' | 'unknown';

interface SampleInfo {
  size: number;
  subjectType: SubjectType;
  label: string; // e.g., "225 patients", "60 mice", "In vitro"
}

function extractSampleInfo(text: string, studyType?: string): SampleInfo | null {
  const lowerText = text.toLowerCase();

  // Check for in vitro / cell studies first
  if (lowerText.includes('in vitro') || lowerText.includes('cell line') || lowerText.includes('cell culture') ||
      lowerText.includes('cultured cells') || lowerText.includes('hela cells') || lowerText.includes('cell viability')) {
    return { size: 0, subjectType: 'cells', label: 'In vitro' };
  }

  // Subject type detection patterns - all human studies use "humans" for consistency
  const subjectPatterns: { type: SubjectType; patterns: RegExp[]; label: string }[] = [
    {
      type: 'humans',
      patterns: [
        /(\d+)\s*(?:patient|patients)/gi,
        /(?:patient|patients)\s*(?:\()?n\s*=\s*(\d+)/gi,
        /(\d+)\s*(?:participant|participants|subject|subjects|volunteer|volunteers|adult|adults|individual|individuals|people|person|persons)/gi,
        /(\d+)\s*(?:healthy|human)\s+(?:volunteer|subject|participant|adult)/gi,
        /(?:enrolled|recruited|randomized|included)\s+(\d+)\s*(?:participant|subject|patient|adult|individual|volunteer)/gi,
        /(?:participant|subject|volunteer|adult|individual)s?\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'humans'
    },
    {
      type: 'mice',
      patterns: [
        /(\d+)\s*(?:mice|mouse)/gi,
        /(?:mice|mouse)\s*(?:\()?n\s*=\s*(\d+)/gi,
        /(\d+)\s*(?:c57bl|balb\/c|cd-1|nude mice|transgenic mice)/gi,
      ],
      label: 'mice'
    },
    {
      type: 'rats',
      patterns: [
        /(\d+)\s*(?:rats?|wistar|sprague[- ]dawley)/gi,
        /(?:rat|rats)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'rats'
    },
    {
      type: 'dogs',
      patterns: [
        /(\d+)\s*(?:dogs?|canines?|beagles?)/gi,
        /(?:dog|dogs|canine)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'dogs'
    },
    {
      type: 'cats',
      patterns: [
        /(\d+)\s*(?:cats?|felines?)/gi,
        /(?:cat|cats|feline)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'cats'
    },
    {
      type: 'animals',
      patterns: [
        /(\d+)\s*(?:animal|animals|rabbits?|guinea pigs?|primates?|monkeys?|pigs?|piglets?)/gi,
        /(?:animal|rabbit|guinea pig)\s*(?:\()?n\s*=\s*(\d+)/gi,
      ],
      label: 'animals'
    },
  ];

  // Try to match subject-specific patterns first
  for (const { type, patterns, label } of subjectPatterns) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0; // Reset regex
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const num = parseInt(match[1] || match[2]);
        if (num >= 5 && num < 50000) {
          return { size: num, subjectType: type, label: `${num} ${label}` };
        }
      }
    }
  }

  // Fallback: generic n= patterns
  const genericPatterns = [
    /\bn\s*=\s*(\d+)/gi,
    /\bN\s*=\s*(\d+)/gi,
    /(?:total of|sample of|population of)\s+(\d+)/gi,
    /(\d+)\s+(?:were|was)\s+(?:enrolled|recruited|included|randomized)/gi,
  ];

  let maxSize = 0;
  for (const pattern of genericPatterns) {
    pattern.lastIndex = 0;
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const num = parseInt(match[1]);
      if (num > maxSize && num < 50000 && num >= 5) maxSize = num;
    }
  }

  if (maxSize > 0) {
    // Try to infer subject type from context
    if (lowerText.includes('mice') || lowerText.includes('mouse') || lowerText.includes('murine')) {
      return { size: maxSize, subjectType: 'mice', label: `${maxSize} mice` };
    }
    if (lowerText.includes('rats') || lowerText.includes('rat ') || lowerText.includes('wistar') || lowerText.includes('sprague')) {
      return { size: maxSize, subjectType: 'rats', label: `${maxSize} rats` };
    }
    if (lowerText.includes('dog') || lowerText.includes('canine')) {
      return { size: maxSize, subjectType: 'dogs', label: `${maxSize} dogs` };
    }
    if (lowerText.includes('cat') || lowerText.includes('feline')) {
      return { size: maxSize, subjectType: 'cats', label: `${maxSize} cats` };
    }
    if (lowerText.includes('animal') || lowerText.includes('preclinical')) {
      return { size: maxSize, subjectType: 'animals', label: `${maxSize} animals` };
    }
    // Default to humans for clinical studies
    if (lowerText.includes('patient') || lowerText.includes('clinical') || lowerText.includes('trial') ||
        lowerText.includes('participant') || lowerText.includes('subject')) {
      return { size: maxSize, subjectType: 'humans', label: `${maxSize} humans` };
    }
    return { size: maxSize, subjectType: 'humans', label: `${maxSize} humans` };
  }

  return null;
}

// Extract study status from text
function extractStudyStatus(text: string, url: string): 'completed' | 'ongoing' | 'recruiting' | null {
  const lowerText = text.toLowerCase();
  const lowerUrl = url?.toLowerCase() || '';

  // Check URL first for clinical trials
  if (lowerUrl.includes('clinicaltrials.gov')) {
    if (lowerText.includes('recruiting') && !lowerText.includes('not recruiting')) {
      return 'recruiting';
    }
    if (lowerText.includes('active') || lowerText.includes('enrolling')) {
      return 'ongoing';
    }
  }

  // Check text content
  if (lowerText.includes('completed study') || lowerText.includes('study was completed') ||
      lowerText.includes('trial completed') || lowerText.includes('results show') ||
      lowerText.includes('we found') || lowerText.includes('our results') ||
      lowerText.includes('in conclusion') || lowerText.includes('data suggest')) {
    return 'completed';
  }

  if (lowerText.includes('currently recruiting') || lowerText.includes('now recruiting') ||
      lowerText.includes('seeking participants')) {
    return 'recruiting';
  }

  if (lowerText.includes('ongoing') || lowerText.includes('in progress') ||
      lowerText.includes('currently underway')) {
    return 'ongoing';
  }

  // Default to completed for published studies
  return 'completed';
}

// Extract treatment/intervention from abstract
function extractTreatment(text: string): string | null {
  const lowerText = text.toLowerCase();

  // Helper to normalize CBD terminology
  const normalizeCBD = (str: string): string => {
    return str
      // Normalize cannabidiol to CBD
      .replace(/cannabidiol/gi, 'CBD')
      // Ensure CBD is always uppercase
      .replace(/\bcbd\b/gi, 'CBD')
      // Fix common patterns
      .replace(/CBD\s+oil/gi, 'CBD Oil')
      .replace(/CBD\s+extract/gi, 'CBD Extract')
      .replace(/CBD\s+isolate/gi, 'CBD Isolate')
      .replace(/CBD\s+tincture/gi, 'CBD Tincture')
      .replace(/CBD\s+capsule/gi, 'CBD Capsule')
      .replace(/oral\s+CBD/gi, 'Oral CBD')
      .replace(/sublingual\s+CBD/gi, 'Sublingual CBD')
      .replace(/topical\s+CBD/gi, 'Topical CBD')
      .replace(/full[- ]spectrum/gi, 'Full-Spectrum')
      .replace(/broad[- ]spectrum/gi, 'Broad-Spectrum')
      .trim();
  };

  // CBD-specific patterns
  const cbdPatterns = [
    /(?:oral|sublingual|topical)?\s*(?:cbd|cannabidiol)\s*(?:\d+\s*mg)?/gi,
    /(?:epidiolex|sativex|nabiximols)/gi,
    /(?:cbd|cannabidiol)\s*(?:oil|extract|isolate|tincture|capsule)/gi,
    /(?:full|broad)[- ]spectrum\s*(?:cbd|hemp|cannabis)/gi,
  ];

  for (const pattern of cbdPatterns) {
    const match = text.match(pattern);
    if (match) {
      let treatment = match[0].trim();
      // Standardize branded products
      if (treatment.toLowerCase().includes('epidiolex')) return 'Epidiolex (CBD)';
      if (treatment.toLowerCase().includes('sativex')) return 'Sativex (THC:CBD)';
      if (treatment.toLowerCase().includes('nabiximols')) return 'Nabiximols (THC:CBD)';
      // Normalize and return
      return normalizeCBD(treatment);
    }
  }

  // Dose patterns
  const dosePattern = /(\d+)\s*(?:mg|milligram)s?\s*(?:of\s*)?(?:cbd|cannabidiol)/gi;
  const doseMatch = text.match(dosePattern);
  if (doseMatch) {
    return normalizeCBD(doseMatch[0].replace(/\s+/g, ' ').trim());
  }

  // Generic intervention patterns
  if (lowerText.includes('placebo-controlled') || lowerText.includes('placebo controlled')) {
    if (lowerText.includes('cbd') || lowerText.includes('cannabidiol')) {
      return 'CBD vs Placebo';
    }
  }

  return null;
}

// Get primary condition from study
function getPrimaryCondition(study: any): { key: ConditionKey; data: typeof CONDITIONS[ConditionKey] } | null {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  // Priority order for conditions (most specific/clinical first)
  const conditionPriority: ConditionKey[] = [
    // High-priority clinical conditions (FDA-approved uses first)
    'epilepsy', 'cancer', 'chemo_side_effects',
    // Addiction should be checked early (before MS due to spasticity overlap)
    'addiction',
    // Neurological conditions
    'parkinsons', 'alzheimers', 'ms', 'schizophrenia', 'autism', 'tourettes',
    // Mental health
    'anxiety', 'ptsd', 'depression', 'adhd',
    // Pain conditions
    'chronic_pain', 'neuropathic_pain', 'fibromyalgia', 'arthritis', 'migraines',
    // Sleep
    'sleep',
    // Gastrointestinal
    'crohns', 'ibs', 'nausea',
    // Skin
    'psoriasis', 'eczema', 'acne',
    // Cardiovascular
    'heart', 'blood_pressure',
    // Other
    'diabetes', 'obesity', 'athletic', 'veterinary',
    // General (last resort)
    'inflammation'
  ];

  for (const key of conditionPriority) {
    const cond = CONDITIONS[key];
    if (cond && cond.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return { key, data: cond };
    }
  }

  return null;
}

// Condition badge colors (Tailwind classes)
const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Neurological & Mental Health
  anxiety: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  depression: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  ptsd: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' },
  sleep: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  epilepsy: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  parkinsons: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  alzheimers: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  autism: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
  adhd: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  schizophrenia: { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200' },
  addiction: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  tourettes: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' },
  // Pain & Inflammation
  chronic_pain: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  neuropathic_pain: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  arthritis: { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-200' },
  fibromyalgia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  ms: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  inflammation: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  migraines: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  // Gastrointestinal
  crohns: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  ibs: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  nausea: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  // Cancer
  cancer: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  chemo_side_effects: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  // Skin
  acne: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  psoriasis: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  eczema: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  // Cardiovascular
  heart: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  blood_pressure: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  // Other
  diabetes: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  obesity: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  athletic: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  veterinary: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
};

function matchesCondition(study: any, conditionKey: ConditionKey): boolean {
  const condition = CONDITIONS[conditionKey];
  const searchText = `${study.title || ''} ${study.abstract || ''} ${
    Array.isArray(study.relevant_topics) ? study.relevant_topics.join(' ') : study.relevant_topics || ''
  }`.toLowerCase();

  return condition.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ResearchPageClient({ initialResearch, condition }: ResearchPageClientProps) {
  const currentYear = new Date().getFullYear();

  // Calculate year range from data
  const dataYearRange = useMemo(() => {
    const years = initialResearch.map(s => s.year).filter(y => y > 1900 && y <= currentYear);
    return {
      min: Math.min(...years, 2000),
      max: Math.max(...years, currentYear)
    };
  }, [initialResearch, currentYear]);

  // State management with saved filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<StudyCategory>('all');
  const [selectedQualityTiers, setSelectedQualityTiers] = useState<QualityTier[]>([]);
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<StudyType[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<ConditionKey[]>(
    condition && condition in CONDITIONS ? [condition as ConditionKey] : []
  );
  const [yearRange, setYearRange] = useState<{ min: number; max: number }>(dataYearRange);
  const [qualityRange, setQualityRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState<SortOption>('quality');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showHumanStudiesOnly, setShowHumanStudiesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load saved filters on mount
  useEffect(() => {
    const saved = loadSavedFilters();
    if (saved && !condition) {
      if (saved.searchQuery) setSearchQuery(saved.searchQuery);
      if (saved.activeCategory) setActiveCategory(saved.activeCategory);
      if (saved.selectedQualityTiers) setSelectedQualityTiers(saved.selectedQualityTiers);
      if (saved.selectedStudyTypes) setSelectedStudyTypes(saved.selectedStudyTypes);
      if (saved.selectedConditions) setSelectedConditions(saved.selectedConditions);
      if (saved.yearRange) setYearRange(saved.yearRange);
      if (saved.qualityRange) setQualityRange(saved.qualityRange);
      if (saved.showHumanStudiesOnly !== undefined) setShowHumanStudiesOnly(saved.showHumanStudiesOnly);
      if (saved.sortBy) setSortBy(saved.sortBy);
      if (saved.viewMode) setViewMode(saved.viewMode);
    }
  }, [condition]);

  // Save filters when they change
  useEffect(() => {
    const filters: SavedFilters = {
      searchQuery,
      activeCategory,
      selectedQualityTiers,
      selectedStudyTypes,
      selectedConditions,
      yearRange,
      qualityRange,
      showHumanStudiesOnly,
      sortBy,
      viewMode
    };
    saveFilters(filters);
  }, [searchQuery, activeCategory, selectedQualityTiers, selectedStudyTypes, selectedConditions, yearRange, qualityRange, showHumanStudiesOnly, sortBy, viewMode]);

  // Calculate quality metrics for all studies
  const studiesWithQuality = useMemo(() => {
    return initialResearch.map(study => {
      const assessment = assessStudyQuality(study);
      const text = `${study.title || ''} ${study.abstract || ''}`;
      const sampleInfo = extractSampleInfo(text, assessment.studyType);
      const treatment = extractTreatment(text);
      const studyStatus = extractStudyStatus(text, study.url);
      const primaryCondition = getPrimaryCondition(study);

      return {
        ...study,
        qualityTier: assessment.tier,
        qualityScore: assessment.score,
        studyType: assessment.studyType,
        assessment: assessment,
        sampleInfo,
        treatment,
        studyStatus,
        primaryCondition
      };
    });
  }, [initialResearch]);

  // Quality tier statistics
  const qualityStats = useMemo(() => {
    const stats = {
      [QualityTier.GOLD_STANDARD]: 0,
      [QualityTier.HIGH_QUALITY]: 0,
      [QualityTier.MODERATE_QUALITY]: 0,
      [QualityTier.LIMITED_EVIDENCE]: 0,
      [QualityTier.PRECLINICAL]: 0
    };

    studiesWithQuality.forEach(study => {
      stats[study.qualityTier]++;
    });

    return stats;
  }, [studiesWithQuality]);

  // Study type statistics
  const studyTypeStats = useMemo(() => {
    const stats: Record<StudyType, number> = {} as Record<StudyType, number>;

    studiesWithQuality.forEach(study => {
      stats[study.studyType] = (stats[study.studyType] || 0) + 1;
    });

    return stats;
  }, [studiesWithQuality]);

  // Condition statistics
  const conditionStats = useMemo(() => {
    const stats: Record<ConditionKey, number> = {} as Record<ConditionKey, number>;

    for (const key of Object.keys(CONDITIONS) as ConditionKey[]) {
      stats[key] = studiesWithQuality.filter(s => matchesCondition(s, key)).length;
    }

    return stats;
  }, [studiesWithQuality]);

  // Year distribution for timeline
  const yearDistribution = useMemo(() => {
    const dist: Record<number, number> = {};
    studiesWithQuality.forEach(study => {
      if (study.year >= 2000 && study.year <= currentYear) {
        dist[study.year] = (dist[study.year] || 0) + 1;
      }
    });
    return dist;
  }, [studiesWithQuality, currentYear]);

  // Categorize studies by content type
  const categorizeStudy = (study: any): StudyCategory[] => {
    const searchContent = [
      study.title,
      study.authors,
      study.publication,
      study.abstract,
      Array.isArray(study.relevant_topics) ? study.relevant_topics.join(' ') : study.relevant_topics || ''
    ].join(' ').toLowerCase();

    const categories: StudyCategory[] = [];

    if (searchContent.match(/\b(cbd|cannabidiol)\b/)) {
      categories.push('cbd');
    }

    if (searchContent.match(/\b(cannabinoids?|thc|cbg|cbn|cbc|cannabichromene|cannabigerol|cannabinol|tetrahydrocannabinol)\b/) && !categories.includes('cbd')) {
      categories.push('cannabinoids');
    }

    if (searchContent.match(/\b(medical cannabis|medical marijuana|medicinal cannabis|medicinal marijuana|cannabis therapy|cannabis treatment|pharmaceutical cannabis)\b/)) {
      categories.push('medical-cannabis');
    }

    if (searchContent.match(/\b(cannabis|marijuana|hemp)\b/) && !categories.includes('medical-cannabis') && !categories.includes('cbd')) {
      categories.push('cannabis');
    }

    if (categories.length === 0 && searchContent.match(/\b(cannabis|marijuana|hemp|cannabinoids?|cbd|thc)\b/)) {
      categories.push('cannabis');
    }

    return categories;
  };

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats = {
      all: studiesWithQuality.length,
      cbd: 0,
      cannabinoids: 0,
      cannabis: 0,
      'medical-cannabis': 0
    };

    studiesWithQuality.forEach(study => {
      const categories = categorizeStudy(study);
      categories.forEach(category => {
        stats[category]++;
      });
    });

    return stats;
  }, [studiesWithQuality]);

  // Available study types and quality tiers
  const availableStudyTypes = useMemo(() => {
    return [...new Set(studiesWithQuality.map(s => s.studyType))];
  }, [studiesWithQuality]);

  const availableQualityTiers = useMemo(() => {
    return [...new Set(studiesWithQuality.map(s => s.qualityTier))];
  }, [studiesWithQuality]);

  // Filtered and sorted studies
  const filteredStudies = useMemo(() => {
    let filtered = studiesWithQuality;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(study => {
        const categories = categorizeStudy(study);
        return categories.includes(activeCategory);
      });
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      filtered = filtered.filter(study =>
        selectedConditions.some(cond => matchesCondition(study, cond))
      );
    }

    // Search filter (full-text)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const terms = query.split(/\s+/).filter(t => t.length > 0);

      filtered = filtered.filter(study => {
        const searchContent = `${study.title} ${study.authors} ${study.publication} ${study.abstract || ''} ${
          Array.isArray(study.relevant_topics) ? study.relevant_topics.join(' ') : study.relevant_topics || ''
        }`.toLowerCase();

        return terms.every(term => searchContent.includes(term));
      });
    }

    // Quality tier filter
    if (selectedQualityTiers.length > 0) {
      filtered = filtered.filter(study => selectedQualityTiers.includes(study.qualityTier));
    }

    // Study type filter
    if (selectedStudyTypes.length > 0) {
      filtered = filtered.filter(study => selectedStudyTypes.includes(study.studyType));
    }

    // Year range filter
    filtered = filtered.filter(study =>
      study.year >= yearRange.min && study.year <= yearRange.max
    );

    // Quality score range filter
    filtered = filtered.filter(study =>
      study.qualityScore >= qualityRange.min && study.qualityScore <= qualityRange.max
    );

    // Human studies filter
    if (showHumanStudiesOnly) {
      filtered = filtered.filter(study =>
        study.studyType !== StudyType.ANIMAL_STUDY &&
        study.studyType !== StudyType.IN_VITRO_STUDY
      );
    }

    // Sort
    switch (sortBy) {
      case 'quality':
        filtered.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
        filtered.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
        break;
    }

    return filtered;
  }, [studiesWithQuality, activeCategory, selectedConditions, searchQuery, selectedQualityTiers, selectedStudyTypes, yearRange, qualityRange, sortBy, showHumanStudiesOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler functions
  const toggleQualityTier = (tier: QualityTier) => {
    setSelectedQualityTiers(prev =>
      prev.includes(tier)
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
    setCurrentPage(1);
  };

  const toggleStudyType = (type: StudyType) => {
    setSelectedStudyTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleCondition = (cond: ConditionKey) => {
    setSelectedConditions(prev =>
      prev.includes(cond)
        ? prev.filter(c => c !== cond)
        : [...prev, cond]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSelectedQualityTiers([]);
    setSelectedStudyTypes([]);
    setSelectedConditions([]);
    setYearRange(dataYearRange);
    setQualityRange({ min: 0, max: 100 });
    setShowHumanStudiesOnly(false);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    activeCategory !== 'all' ? 1 : 0,
    selectedQualityTiers.length,
    selectedStudyTypes.length,
    selectedConditions.length,
    (yearRange.min !== dataYearRange.min || yearRange.max !== dataYearRange.max) ? 1 : 0,
    (qualityRange.min !== 0 || qualityRange.max !== 100) ? 1 : 0,
    showHumanStudiesOnly ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Top 8 most relevant conditions for collapsed view
  const TOP_CONDITIONS: ConditionKey[] = ['anxiety', 'chronic_pain', 'sleep', 'epilepsy', 'depression', 'cancer', 'inflammation', 'addiction'];
  const [showAllConditions, setShowAllConditions] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get active filter labels for display
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (activeCategory !== 'all') {
      const catLabels: Record<StudyCategory, string> = {
        all: 'All', cbd: 'CBD', cannabinoids: 'Cannabinoids',
        cannabis: 'Cannabis', 'medical-cannabis': 'Medical Cannabis'
      };
      labels.push(catLabels[activeCategory]);
    }
    selectedConditions.forEach(c => labels.push(CONDITIONS[c].label));
    if (yearRange.min !== dataYearRange.min || yearRange.max !== dataYearRange.max) {
      labels.push(`${yearRange.min}-${yearRange.max}`);
    }
    if (qualityRange.min > 0 || qualityRange.max < 100) {
      labels.push(`Quality ${qualityRange.min}-${qualityRange.max}`);
    }
    if (showHumanStudiesOnly) labels.push('Human only');
    return labels;
  }, [activeCategory, selectedConditions, yearRange, qualityRange, showHumanStudiesOnly, dataYearRange]);

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs condition={condition} />

      {/* Schema.org JSON-LD for the collection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: condition ? `CBD Research: ${CONDITIONS[condition as ConditionKey]?.label}` : 'CBD Research Database',
            description: condition
              ? CONDITIONS[condition as ConditionKey]?.description
              : 'Comprehensive database of peer-reviewed CBD and cannabis research studies',
            numberOfItems: filteredStudies.length,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: filteredStudies.length,
              itemListElement: paginatedStudies.slice(0, 10).map((study, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'ScholarlyArticle',
                  name: study.title,
                  author: study.authors,
                  datePublished: study.year?.toString(),
                  url: study.url,
                  identifier: study.doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: study.doi } : undefined
                }
              }))
            }
          })
        }}
      />

      {/* Search Bar - Always visible at top */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
        <div className="relative">
          <label htmlFor="research-search" className="sr-only">Search research studies</label>
          <input
            id="research-search"
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, authors, abstract, condition..."
            className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search research studies"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Button - Only visible on mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <FilterSidebarContent
                activeCategory={activeCategory}
                setActiveCategory={(cat) => { setActiveCategory(cat); setCurrentPage(1); }}
                categoryStats={categoryStats}
                selectedConditions={selectedConditions}
                toggleCondition={toggleCondition}
                conditionStats={conditionStats}
                showAllConditions={showAllConditions}
                setShowAllConditions={setShowAllConditions}
                TOP_CONDITIONS={TOP_CONDITIONS}
                yearRange={yearRange}
                setYearRange={setYearRange}
                dataYearRange={dataYearRange}
                qualityRange={qualityRange}
                setQualityRange={setQualityRange}
                selectedQualityTiers={selectedQualityTiers}
                toggleQualityTier={toggleQualityTier}
                qualityStats={qualityStats}
                selectedStudyTypes={selectedStudyTypes}
                toggleStudyType={toggleStudyType}
                availableStudyTypes={availableStudyTypes}
                showHumanStudiesOnly={showHumanStudiesOnly}
                setShowHumanStudiesOnly={setShowHumanStudiesOnly}
                clearAllFilters={clearAllFilters}
                setCurrentPage={setCurrentPage}
              />
            </div>
            {/* Drawer Footer */}
            <div className="border-t px-4 py-3 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Show {filteredStudies.length} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout: Sidebar + Main Content */}
      <div className="lg:flex lg:gap-6">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0">
          <div className="sticky top-4 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto pb-4">
            <FilterSidebarContent
              activeCategory={activeCategory}
              setActiveCategory={(cat) => { setActiveCategory(cat); setCurrentPage(1); }}
              categoryStats={categoryStats}
              selectedConditions={selectedConditions}
              toggleCondition={toggleCondition}
              conditionStats={conditionStats}
              showAllConditions={showAllConditions}
              setShowAllConditions={setShowAllConditions}
              TOP_CONDITIONS={TOP_CONDITIONS}
              yearRange={yearRange}
              setYearRange={setYearRange}
              dataYearRange={dataYearRange}
              qualityRange={qualityRange}
              setQualityRange={setQualityRange}
              selectedQualityTiers={selectedQualityTiers}
              toggleQualityTier={toggleQualityTier}
              qualityStats={qualityStats}
              selectedStudyTypes={selectedStudyTypes}
              toggleStudyType={toggleStudyType}
              availableStudyTypes={availableStudyTypes}
              showHumanStudiesOnly={showHumanStudiesOnly}
              setShowHumanStudiesOnly={setShowHumanStudiesOnly}
              clearAllFilters={clearAllFilters}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Sticky Results Bar */}
          <div className="sticky top-0 z-10 bg-gray-50 -mx-4 px-4 py-3 lg:mx-0 lg:px-0 lg:bg-transparent">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Results count and active filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {filteredStudies.length} studies
                  </span>
                  {activeFilterLabels.length > 0 && (
                    <>
                      <span className="text-gray-400">|</span>
                      <div className="flex flex-wrap gap-1">
                        {activeFilterLabels.slice(0, 3).map((label, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {label}
                          </span>
                        ))}
                        {activeFilterLabels.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{activeFilterLabels.length - 3} more
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
                {/* Sort and View Controls */}
                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Sort by"
                  >
                    <option value="quality">Quality</option>
                    <option value="year">Year</option>
                    <option value="title">Title</option>
                    <option value="relevance">Relevance</option>
                  </select>
                  <div className="hidden sm:flex items-center border border-gray-300 rounded overflow-hidden">
                    <button
                      onClick={() => setViewMode('cards')}
                      aria-pressed={viewMode === 'cards'}
                      className={`p-1.5 ${viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      title="Card view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      aria-pressed={viewMode === 'table'}
                      className={`p-1.5 ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      title="Table view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('timeline')}
                      aria-pressed={viewMode === 'timeline'}
                      className={`p-1.5 ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      title="Timeline view"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Research Results */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Research studies">
              {paginatedStudies.map((study) => (
                <ResearchCard key={study.id} study={study} />
              ))}
            </div>
          )}

          {viewMode === 'table' && (
            <ResearchTable studies={paginatedStudies} />
          )}

          {viewMode === 'timeline' && (
            <ResearchTimeline
              studies={filteredStudies}
              yearDistribution={yearDistribution}
              dataYearRange={dataYearRange}
            />
          )}

          {/* No Results */}
          {filteredStudies.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg" role="status">
              <p className="text-gray-500 mb-4">No studies match your current filters.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && filteredStudies.length > 0 && (
            <nav aria-label="Pagination" className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                aria-label="First page"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className="px-4 py-1.5 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                aria-label="Next page"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                aria-label="Last page"
              >
                Last
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// FILTER SIDEBAR CONTENT COMPONENT
// ============================================================================

interface FilterSidebarContentProps {
  activeCategory: StudyCategory;
  setActiveCategory: (cat: StudyCategory) => void;
  categoryStats: Record<StudyCategory, number>;
  selectedConditions: ConditionKey[];
  toggleCondition: (cond: ConditionKey) => void;
  conditionStats: Record<ConditionKey, number>;
  showAllConditions: boolean;
  setShowAllConditions: (show: boolean) => void;
  TOP_CONDITIONS: ConditionKey[];
  yearRange: { min: number; max: number };
  setYearRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  dataYearRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
  setQualityRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  selectedQualityTiers: QualityTier[];
  toggleQualityTier: (tier: QualityTier) => void;
  qualityStats: Record<QualityTier, number>;
  selectedStudyTypes: StudyType[];
  toggleStudyType: (type: StudyType) => void;
  availableStudyTypes: StudyType[];
  showHumanStudiesOnly: boolean;
  setShowHumanStudiesOnly: (show: boolean) => void;
  clearAllFilters: () => void;
  setCurrentPage: (page: number) => void;
}

function FilterSidebarContent({
  activeCategory,
  setActiveCategory,
  categoryStats,
  selectedConditions,
  toggleCondition,
  conditionStats,
  showAllConditions,
  setShowAllConditions,
  TOP_CONDITIONS,
  yearRange,
  setYearRange,
  dataYearRange,
  qualityRange,
  setQualityRange,
  selectedQualityTiers,
  toggleQualityTier,
  qualityStats,
  selectedStudyTypes,
  toggleStudyType,
  availableStudyTypes,
  showHumanStudiesOnly,
  setShowHumanStudiesOnly,
  clearAllFilters,
  setCurrentPage,
}: FilterSidebarContentProps) {
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const categories: { key: StudyCategory; label: string; color: string }[] = [
    { key: 'all', label: 'All Studies', color: 'gray' },
    { key: 'cbd', label: 'CBD', color: 'green' },
    { key: 'cannabinoids', label: 'Cannabinoids', color: 'purple' },
    { key: 'medical-cannabis', label: 'Medical', color: 'blue' },
    { key: 'cannabis', label: 'Cannabis', color: 'emerald' },
  ];

  return (
    <>
      {/* Category Filter - Compact Pills */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(({ key, label, color }) => {
            const isActive = activeCategory === key;
            const count = categoryStats[key];
            const colorClasses: Record<string, string> = {
              gray: isActive ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
              purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
              blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
              emerald: isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
            };
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${colorClasses[color]}`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Filter - Top 8 with expand */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</h3>
          {selectedConditions.length > 0 && (
            <button
              onClick={() => {
                selectedConditions.forEach(c => toggleCondition(c));
              }}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(showAllConditions ? Object.keys(CONDITIONS) as ConditionKey[] : TOP_CONDITIONS).map((key) => {
            const cond = CONDITIONS[key];
            const colors = CONDITION_COLORS[key] || { bg: 'bg-gray-100', text: 'text-gray-700' };
            const isSelected = selectedConditions.includes(key);
            const count = conditionStats[key] || 0;
            return (
              <button
                key={key}
                onClick={() => toggleCondition(key)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? `${colors.bg} ${colors.text} ring-2 ring-blue-500`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{cond.icon}</span>
                <span>{cond.label}</span>
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        {!showAllConditions && (
          <button
            onClick={() => setShowAllConditions(true)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Show all {Object.keys(CONDITIONS).length} conditions...
          </button>
        )}
        {showAllConditions && (
          <button
            onClick={() => setShowAllConditions(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Show less
          </button>
        )}
      </div>

      {/* Year Range */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Publication Year</h3>
        <div className="flex items-center gap-2">
          <select
            value={yearRange.min}
            onChange={(e) => {
              const newMin = parseInt(e.target.value);
              setYearRange(prev => ({ min: newMin, max: Math.max(newMin, prev.max) }));
              setCurrentPage(1);
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: dataYearRange.max - dataYearRange.min + 1 }, (_, i) => dataYearRange.min + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className="text-gray-400">-</span>
          <select
            value={yearRange.max}
            onChange={(e) => {
              const newMax = parseInt(e.target.value);
              setYearRange(prev => ({ min: Math.min(prev.min, newMax), max: newMax }));
              setCurrentPage(1);
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: dataYearRange.max - dataYearRange.min + 1 }, (_, i) => dataYearRange.min + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quality Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quality Score</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              qualityRange.min >= 70 ? 'bg-green-500' : qualityRange.min >= 40 ? 'bg-yellow-500' : 'bg-red-400'
            }`} />
            <input
              type="number"
              min={0}
              max={100}
              value={qualityRange.min}
              onChange={(e) => {
                const newMin = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setQualityRange(prev => ({ min: newMin, max: Math.max(newMin, prev.max) }));
                setCurrentPage(1);
              }}
              className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              value={qualityRange.max}
              onChange={(e) => {
                const newMax = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                setQualityRange(prev => ({ min: Math.min(prev.min, newMax), max: newMax }));
                setCurrentPage(1);
              }}
              className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:ring-blue-500 focus:border-blue-500"
            />
            <span className={`w-2.5 h-2.5 rounded-full ${
              qualityRange.max >= 70 ? 'bg-green-500' : qualityRange.max >= 40 ? 'bg-yellow-500' : 'bg-red-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Filters</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHumanStudiesOnly}
              onChange={(e) => { setShowHumanStudiesOnly(e.target.checked); setCurrentPage(1); }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">Human studies only</span>
          </label>
          <button
            onClick={() => {
              setYearRange({ min: 2020, max: dataYearRange.max });
              setCurrentPage(1);
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded border ${
              yearRange.min === 2020 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            Recent studies (2020+)
          </button>
          <button
            onClick={() => {
              setQualityRange({ min: 70, max: 100 });
              setCurrentPage(1);
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded border ${
              qualityRange.min === 70 ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            High quality (70+)
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Advanced</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${advancedExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {advancedExpanded && (
          <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
            {/* Quality Tiers */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Quality Tiers</label>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(qualityStats).map(([tier, count]) => (
                  <button
                    key={tier}
                    onClick={() => toggleQualityTier(tier as QualityTier)}
                    className={`p-1.5 rounded text-xs text-center transition-all ${
                      selectedQualityTiers.includes(tier as QualityTier)
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{count}</div>
                    <div className="truncate text-[10px]">{tier}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Study Types */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Study Types</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableStudyTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudyTypes.includes(type)}
                      onChange={() => toggleStudyType(type)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700 truncate">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear All */}
      <button
        onClick={clearAllFilters}
        className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-gray-200 font-medium"
      >
        Clear All Filters
      </button>
    </>
  );
}

// ============================================================================
// BREADCRUMBS COMPONENT
// ============================================================================

function Breadcrumbs({ condition }: { condition?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" itemProp="item" className="text-gray-500 hover:text-gray-700">
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        <li className="text-gray-400" aria-hidden="true">/</li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          {condition ? (
            <Link href="/research" itemProp="item" className="text-gray-500 hover:text-gray-700">
              <span itemProp="name">Research</span>
            </Link>
          ) : (
            <span itemProp="name" className="text-gray-900 font-medium" aria-current="page">Research</span>
          )}
          <meta itemProp="position" content="2" />
        </li>
        {condition && CONDITIONS[condition as ConditionKey] && (
          <>
            <li className="text-gray-400" aria-hidden="true">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-gray-900 font-medium" aria-current="page">
                {CONDITIONS[condition as ConditionKey].label}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

// ============================================================================
// RESEARCH CARD COMPONENT - Compact Design
// ============================================================================

function ResearchCard({ study }: { study: any }) {
  const [expanded, setExpanded] = useState(false);

  // Study type icon mapping
  const studyTypeIcon = {
    [StudyType.META_ANALYSIS]: '📊',
    [StudyType.SYSTEMATIC_REVIEW]: '📚',
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: '🎯',
    [StudyType.CONTROLLED_TRIAL]: '🔬',
    [StudyType.COHORT_STUDY]: '👥',
    [StudyType.CASE_CONTROL_STUDY]: '🔄',
    [StudyType.CROSS_SECTIONAL_STUDY]: '📈',
    [StudyType.CASE_SERIES]: '📋',
    [StudyType.CASE_REPORT]: '📝',
    [StudyType.ANIMAL_STUDY]: '🐁',
    [StudyType.IN_VITRO_STUDY]: '🧫',
    [StudyType.REVIEW_ARTICLE]: '📖',
    [StudyType.SURVEY_STUDY]: '📊',
    [StudyType.PILOT_STUDY]: '🚀',
    [StudyType.UNKNOWN]: '📄'
  }[study.studyType] || '📄';

  // Status badge config
  const statusConfig = {
    completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
    ongoing: { label: 'Ongoing', bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳' },
    recruiting: { label: 'Recruiting', bg: 'bg-amber-100', text: 'text-amber-700', icon: '📢' }
  };

  const conditionColors = study.primaryCondition
    ? CONDITION_COLORS[study.primaryCondition.key] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    : null;

  return (
    <article
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/ScholarlyArticle"
      role="listitem"
    >
      {/* Hidden Schema.org metadata */}
      <meta itemProp="datePublished" content={study.year?.toString()} />
      {study.doi && <meta itemProp="identifier" content={study.doi} />}
      {study.abstract && <meta itemProp="abstract" content={study.abstract} />}

      {/* Row 1: Title and Quality Score */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-lg shrink-0" aria-hidden="true" title={study.studyType}>{studyTypeIcon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" itemProp="name">
            {study.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {study.authors?.split(',').slice(0, 2).join(', ')}{study.authors?.split(',').length > 2 ? ' et al.' : ''} • {study.year}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold text-gray-900">{study.qualityScore}</div>
          <div className="text-xs text-gray-500">score</div>
        </div>
      </div>

      {/* Row 2: Key Info Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Primary Condition Badge */}
        {study.primaryCondition && conditionColors && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${conditionColors.bg} ${conditionColors.text} border ${conditionColors.border}`}>
            <span aria-hidden="true">{study.primaryCondition.data.icon}</span>
            {study.primaryCondition.data.label}
          </span>
        )}

        {/* Sample Size Badge with Subject Type */}
        {study.sampleInfo && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            study.sampleInfo.subjectType === 'cells' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            study.sampleInfo.subjectType === 'mice' || study.sampleInfo.subjectType === 'rats' || study.sampleInfo.subjectType === 'animals' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            study.sampleInfo.subjectType === 'dogs' || study.sampleInfo.subjectType === 'cats' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
            'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <span aria-hidden="true">
              {study.sampleInfo.subjectType === 'cells' ? '🧫' :
               study.sampleInfo.subjectType === 'mice' ? '🐁' :
               study.sampleInfo.subjectType === 'rats' ? '🐀' :
               study.sampleInfo.subjectType === 'dogs' ? '🐕' :
               study.sampleInfo.subjectType === 'cats' ? '🐈' :
               study.sampleInfo.subjectType === 'animals' ? '🐾' : '👥'}
            </span>
            {study.sampleInfo.label}
          </span>
        )}

        {/* Study Status Badge */}
        {study.studyStatus && statusConfig[study.studyStatus] && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig[study.studyStatus].bg} ${statusConfig[study.studyStatus].text}`}>
            <span aria-hidden="true">{statusConfig[study.studyStatus].icon}</span>
            {statusConfig[study.studyStatus].label}
          </span>
        )}

        {/* Study Type Badge */}
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
          {study.studyType}
        </span>
      </div>

      {/* Row 3: Treatment/Intervention */}
      {study.treatment && (
        <div className="mb-3">
          <span className="text-xs text-gray-500">Treatment: </span>
          <span className="text-xs font-medium text-gray-800">{study.treatment}</span>
        </div>
      )}

      {/* Row 4: Expandable Details */}
      <div className="border-t pt-3 mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          aria-expanded={expanded}
          aria-controls={`details-${study.id}`}
        >
          <span className="font-medium">{expanded ? 'Hide Details' : 'View Details'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div id={`details-${study.id}`} className="mt-3 space-y-3">
            {/* Plain Language Summary (AI-generated) */}
            {study.plain_summary && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                  <span>✨</span> Plain Language Summary
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed">{study.plain_summary}</p>
              </div>
            )}

            {/* Full Abstract */}
            {study.abstract && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">
                  {study.plain_summary ? 'Original Abstract' : 'Abstract'}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {study.plain_summary
                    ? study.abstract
                    : study.abstract.length > 500
                      ? study.abstract.slice(0, 500) + '...'
                      : study.abstract
                  }
                </p>
              </div>
            )}

            {/* Study Strengths */}
            {study.assessment?.strengths?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-green-700 mb-1">Study Strengths</h4>
                <ul className="text-xs text-green-600 space-y-0.5">
                  {study.assessment.strengths.map((strength: string, index: number) => (
                    <li key={index}>✓ {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Study Limitations */}
            {study.assessment?.limitations?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-orange-700 mb-1">Limitations</h4>
                <ul className="text-xs text-orange-600 space-y-0.5">
                  {study.assessment.limitations.map((limitation: string, index: number) => (
                    <li key={index}>• {limitation}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 pt-2 border-t">
              <span>Source: {study.source_site}</span>
              {study.doi && <span>DOI: {study.doi}</span>}
              <span>Publication: {study.publication}</span>
            </div>

            {/* View Full Study Button */}
            <a
              href={study.url}
              itemProp="url"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Full Study
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// TABLE VIEW COMPONENT
// ============================================================================

function ResearchTable({ studies }: { studies: any[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Study</th>
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Quality</th>
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Type</th>
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Year</th>
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Sample</th>
              <th scope="col" className="px-4 py-3 text-sm font-medium text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studies.map((study) => (
              <tr key={study.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    <h4 className="font-medium text-sm line-clamp-2">{study.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{study.authors?.slice(0, 50)}...</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <QualityIndicator tier={study.qualityTier} />
                  <div className="text-xs text-gray-500 mt-1">{study.qualityScore}/100</div>
                </td>
                <td className="px-4 py-3">
                  <StudyTypeBadgeSimple studyType={study.studyType} />
                </td>
                <td className="px-4 py-3 text-sm">{study.year}</td>
                <td className="px-4 py-3 text-sm">
                  {study.sampleInfo ? study.sampleInfo.label : '-'}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:underline"
                  >
                    View →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE VIEW COMPONENT
// ============================================================================

function ResearchTimeline({
  studies,
  yearDistribution,
  dataYearRange
}: {
  studies: any[];
  yearDistribution: Record<number, number>;
  dataYearRange: { min: number; max: number };
}) {
  const maxCount = Math.max(...Object.values(yearDistribution), 1);
  const years = Array.from(
    { length: dataYearRange.max - dataYearRange.min + 1 },
    (_, i) => dataYearRange.max - i
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Research Timeline</h3>

      {/* Bar chart */}
      <div className="mb-8">
        <div className="flex items-end gap-1 h-32" aria-label="Research publications by year">
          {years.slice(0, 20).reverse().map(year => {
            const count = yearDistribution[year] || 0;
            const height = count > 0 ? Math.max((count / maxCount) * 100, 5) : 0;

            return (
              <div key={year} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${year}: ${count} studies`}
                  role="img"
                  aria-label={`${year}: ${count} studies`}
                />
                <span className="text-xs text-gray-500 mt-1 -rotate-45 origin-top-left">
                  {year % 2 === 0 ? year : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Studies grouped by year */}
      <div className="space-y-6">
        {years.slice(0, 10).map(year => {
          const yearStudies = studies.filter(s => s.year === year);
          if (yearStudies.length === 0) return null;

          return (
            <div key={year} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {year} <span className="text-sm font-normal text-gray-500">({yearStudies.length} studies)</span>
              </h4>
              <ul className="space-y-2">
                {yearStudies.slice(0, 5).map(study => (
                  <li key={study.id} className="text-sm">
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-blue-600 line-clamp-1"
                    >
                      {study.title}
                    </a>
                    <span className="text-xs text-gray-400 ml-2">
                      <StudyTypeBadgeSimple studyType={study.studyType} />
                    </span>
                  </li>
                ))}
                {yearStudies.length > 5 && (
                  <li className="text-xs text-gray-500">
                    +{yearStudies.length - 5} more studies
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResearchPageClient;
