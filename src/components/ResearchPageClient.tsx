'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  slug?: string;
  country?: string;
  display_title?: string;
}

// Country code to flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪',
  'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'CH': '🇨🇭',
  'IL': '🇮🇱', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷', 'IN': '🇮🇳',
  'KR': '🇰🇷', 'SE': '🇸🇪', 'DK': '🇩🇰', 'NO': '🇳🇴', 'FI': '🇫🇮',
  'PL': '🇵🇱', 'CZ': '🇨🇿', 'AT': '🇦🇹', 'BE': '🇧🇪', 'PT': '🇵🇹',
  'IE': '🇮🇪', 'NZ': '🇳🇿', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CO': '🇨🇴',
  'ZA': '🇿🇦', 'TR': '🇹🇷', 'RU': '🇷🇺', 'GR': '🇬🇷', 'HU': '🇭🇺', 'RO': '🇷🇴'
};

function getCountryFlag(countryCode?: string): string | null {
  if (!countryCode) return null;
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || null;
}

// Truncate text to max length with ellipsis
function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  // Try to break at sentence boundary
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength * 0.6) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated.trim() + '...';
}

interface ResearchPageClientProps {
  initialResearch: ResearchItem[];
  condition?: string;
}

type SortOption = 'quality' | 'year' | 'title' | 'relevance';
type ViewMode = 'cards' | 'table' | 'timeline';
type StudyCategory = 'all' | 'cbd' | 'cannabinoids' | 'cannabis' | 'medical-cannabis';
type SubjectType = 'all' | 'human' | 'animal';

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
    keywords: ['addiction', 'substance abuse', 'substance use disorder', 'cannabis use disorder', 'opioid use disorder', 'alcohol use disorder', 'drug abuse', 'cocaine addiction', 'heroin addiction', 'relapse prevention', 'cannabis withdrawal'],
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
    keywords: ['chronic pain', 'persistent pain', 'long-term pain', 'pain syndrome', 'intractable pain', 'opioid-sparing'],
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
    keywords: ['arthritis', 'osteoarthritis', 'rheumatoid arthritis', 'rheumatoid disease', 'synovitis', 'arthritic'],
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
    keywords: ['multiple sclerosis', 'sativex', 'nabiximols', 'relapsing-remitting ms', 'rrms', 'ppms', 'spms', 'ms spasticity', 'ms patients'],
    icon: '🧬',
    color: 'orange',
    category: 'Pain & Inflammation',
    description: 'Studies on CBD for MS symptoms and spasticity'
  },
  inflammation: {
    label: 'Inflammation',
    keywords: ['anti-inflammatory effect', 'inflammatory disease', 'inflammation treatment', 'reduce inflammation', 'inflammatory condition', 'chronic inflammation'],
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
    keywords: ['eczema', 'dermatitis', 'atopic dermatitis', 'atopic eczema', 'skin rash'],
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
    keywords: ['obesity', 'weight loss', 'overweight', 'body mass index', 'weight management', 'weight reduction'],
    icon: '⚖️',
    color: 'emerald',
    category: 'Other',
    description: 'Studies on CBD and weight management'
  },
  athletic: {
    label: 'Athletic Performance',
    keywords: ['athlete', 'athletic performance', 'sports medicine', 'exercise recovery', 'sports injury', 'wada'],
    icon: '🏃',
    color: 'green',
    category: 'Other',
    description: 'Research on CBD for athletic performance and recovery'
  },
  veterinary: {
    label: 'Veterinary & Pets',
    keywords: ['veterinary', 'canine cbd', 'feline cbd', 'dogs with', 'cats with', 'pet cbd', 'equine cbd', 'companion animal'],
    icon: '🐕',
    color: 'amber',
    category: 'Other',
    description: 'Studies on CBD for pets and animals'
  }
} as const;

export type ConditionKey = keyof typeof CONDITIONS;

// ============================================================================
// CANNABINOID DEFINITIONS
// ============================================================================

export const CANNABINOIDS = {
  CBD: {
    label: 'CBD',
    fullName: 'Cannabidiol',
    patterns: ['cannabidiol', 'cbd'],
    color: 'green'
  },
  THC: {
    label: 'THC',
    fullName: 'Tetrahydrocannabinol',
    patterns: ['tetrahydrocannabinol', 'thc', 'Δ9-thc', 'delta-9-thc', 'delta-9 thc', 'Δ-9-thc'],
    color: 'purple'
  },
  CBG: {
    label: 'CBG',
    fullName: 'Cannabigerol',
    patterns: ['cannabigerol', 'cbg'],
    color: 'blue'
  },
  CBN: {
    label: 'CBN',
    fullName: 'Cannabinol',
    patterns: ['cannabinol', 'cbn'],
    color: 'amber'
  },
  CBC: {
    label: 'CBC',
    fullName: 'Cannabichromene',
    patterns: ['cannabichromene', 'cbc'],
    color: 'cyan'
  },
  THCV: {
    label: 'THCV',
    fullName: 'Tetrahydrocannabivarin',
    patterns: ['tetrahydrocannabivarin', 'thcv'],
    color: 'orange'
  },
  CBDV: {
    label: 'CBDV',
    fullName: 'Cannabidivarin',
    patterns: ['cannabidivarin', 'cbdv'],
    color: 'teal'
  },
  'Delta-8': {
    label: 'Delta-8 THC',
    fullName: 'Delta-8-Tetrahydrocannabinol',
    patterns: ['delta-8-thc', 'delta-8 thc', 'Δ8-thc', 'Δ-8-thc', 'delta-8-tetrahydrocannabinol'],
    color: 'pink'
  },
  THCA: {
    label: 'THCA',
    fullName: 'Tetrahydrocannabinolic acid',
    patterns: ['tetrahydrocannabinolic acid', 'thca'],
    color: 'indigo'
  },
  CBDA: {
    label: 'CBDA',
    fullName: 'Cannabidiolic acid',
    patterns: ['cannabidiolic acid', 'cbda'],
    color: 'lime'
  }
} as const;

export type CannabinoidKey = keyof typeof CANNABINOIDS;

// Detect cannabinoids from title and abstract
export function detectCannabinoids(title: string, abstract?: string): CannabinoidKey[] {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  const detected: CannabinoidKey[] = [];

  for (const [key, cannabinoid] of Object.entries(CANNABINOIDS)) {
    for (const pattern of cannabinoid.patterns) {
      // Use word boundary check
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        detected.push(key as CannabinoidKey);
        break;
      }
    }
  }

  return detected;
}

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
  selectedCannabinoids: CannabinoidKey[];
  yearRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
  subjectType: SubjectType;
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
        // Future tense patterns for clinical trials
        /(?:will|to)\s+(?:enroll|recruit|include|randomize)\s+(?:up\s+to\s+)?(\d+)/gi,
        /(?:up\s+to|approximately|about|target|targeting)\s+(\d+)\s*(?:patient|participant|subject|volunteer|adult|individual)/gi,
        /enroll(?:ment|ing)?\s+(?:of\s+)?(?:up\s+to\s+)?(\d+)/gi,
        /sample\s+size\s+(?:of\s+)?(\d+)/gi,
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
    if (/\b(dogs?|canines?|beagles?)\b/i.test(lowerText)) {
      return { size: maxSize, subjectType: 'dogs', label: `${maxSize} dogs` };
    }
    if (/\b(cats?|felines?)\b/i.test(lowerText)) {
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

// Study outcome detection from abstract text
type StudyOutcome = 'positive' | 'mixed' | 'negative' | 'ongoing' | null;

function extractStudyOutcome(text: string, status?: string): StudyOutcome {
  if (!text) return null;
  const lowerText = text.toLowerCase();

  // Check for ongoing/recruiting status first
  if (status === 'recruiting' || status === 'ongoing' ||
      lowerText.includes('recruiting') || lowerText.includes('in progress') ||
      lowerText.includes('ongoing') || lowerText.includes('currently enrolling')) {
    return 'ongoing';
  }

  // Positive indicators
  const positivePatterns = [
    'significant improvement', 'significantly improved', 'significantly reduced',
    'effective', 'efficacious', 'beneficial effect', 'positive effect',
    'demonstrated efficacy', 'showed efficacy', 'therapeutic effect',
    'well tolerated', 'safe and effective', 'promising results',
    'statistically significant', 'clinically significant',
  ];

  // Negative indicators
  const negativePatterns = [
    'no significant', 'not significant', 'no effect', 'ineffective',
    'no improvement', 'no difference', 'failed to demonstrate',
    'did not improve', 'no therapeutic', 'no benefit',
  ];

  // Mixed indicators
  const mixedPatterns = [
    'mixed results', 'partial improvement', 'some improvement',
    'modest effect', 'marginal', 'inconclusive', 'variable response',
    'limited effect', 'weak effect', 'some patients',
  ];

  const hasPositive = positivePatterns.some(p => lowerText.includes(p));
  const hasNegative = negativePatterns.some(p => lowerText.includes(p));
  const hasMixed = mixedPatterns.some(p => lowerText.includes(p));

  if (hasMixed) return 'mixed';
  if (hasPositive && hasNegative) return 'mixed';
  if (hasPositive) return 'positive';
  if (hasNegative) return 'negative';

  return null;
}

// Circular quality score indicator component
function CircularQualityScore({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Color based on score
  const getColor = (s: number) => {
    if (s >= 70) return { stroke: '#22c55e', bg: '#dcfce7', text: '#166534' }; // green
    if (s >= 40) return { stroke: '#eab308', bg: '#fef9c3', text: '#854d0e' }; // yellow
    return { stroke: '#ef4444', bg: '#fee2e2', text: '#991b1b' }; // red
  };

  const colors = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-300"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-sm"
        style={{ color: colors.text }}
      >
        {score}
      </div>
    </div>
  );
}

// Source logo/icon component
function SourceIcon({ source }: { source: string }) {
  const lowerSource = source?.toLowerCase() || '';

  if (lowerSource.includes('clinicaltrials')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-600" title="ClinicalTrials.gov">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span>ClinicalTrials.gov</span>
      </span>
    );
  }

  if (lowerSource.includes('pubmed') || lowerSource.includes('pmc') || lowerSource.includes('ncbi')) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600" title="PubMed">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>PubMed</span>
      </span>
    );
  }

  // Default source display
  return (
    <span className="text-xs text-gray-500">{source}</span>
  );
}

// Study outcome badge component
function OutcomeBadge({ outcome }: { outcome: StudyOutcome }) {
  if (!outcome) return null;

  const config = {
    positive: { icon: '✅', label: 'Positive results', className: 'bg-green-50 text-green-700 border-green-200' },
    mixed: { icon: '⚠️', label: 'Mixed results', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    negative: { icon: '❌', label: 'No effect', className: 'bg-red-50 text-red-700 border-red-200' },
    ongoing: { icon: '⏳', label: 'Ongoing', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  }[outcome];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

// Top conditions summary component
function TopConditionsSummary({
  conditionStats,
  onConditionClick,
  selectedConditions
}: {
  conditionStats: Record<ConditionKey, number>;
  onConditionClick: (condition: ConditionKey) => void;
  selectedConditions: ConditionKey[];
}) {
  // Get top 6 conditions by count
  const topConditions = Object.entries(conditionStats)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6) as [ConditionKey, number][];

  if (topConditions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-500 font-medium">Most researched:</span>
      {topConditions.map(([key, count], index) => {
        const condition = CONDITIONS[key];
        const isSelected = selectedConditions.includes(key);
        return (
          <button
            key={key}
            onClick={() => onConditionClick(key)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={`Filter by ${condition.label}`}
          >
            <span aria-hidden="true">{condition.icon}</span>
            <span>{condition.label}</span>
            <span className={`ml-1 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>({count})</span>
          </button>
        );
      })}
    </div>
  );
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
  // Only match based on title and abstract - NOT relevant_topics (which has bad data)
  const searchText = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  return condition.keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ResearchPageClient({ initialResearch, condition }: ResearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [selectedCannabinoids, setSelectedCannabinoids] = useState<CannabinoidKey[]>([]);
  const [yearRange, setYearRange] = useState<{ min: number; max: number }>(dataYearRange);
  const [qualityRange, setQualityRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState<SortOption>('quality');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [subjectType, setSubjectType] = useState<SubjectType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [urlInitialized, setUrlInitialized] = useState(false);
  const itemsPerPage = 20;

  // Load filters from URL - runs on mount and when URL changes
  useEffect(() => {
    // Skip if condition is set (coming from condition page)
    if (condition) return;

    const urlCategory = searchParams.get('category') as StudyCategory;
    const urlCondition = searchParams.get('condition');
    const urlQuality = searchParams.get('quality');
    const urlYear = searchParams.get('year');
    const urlSearch = searchParams.get('q');
    const urlType = searchParams.get('type');
    const urlSubject = searchParams.get('subject');
    const urlHuman = searchParams.get('human');
    const urlCannabinoids = searchParams.get('cannabinoids');

    // Check if we have any URL params
    const hasUrlFilters = !!(urlCategory || urlCondition || urlQuality || urlYear || urlSearch || urlType || urlSubject || urlHuman || urlCannabinoids);

    if (hasUrlFilters) {
      // Apply URL params - reset to defaults first for clean state
      setActiveCategory(urlCategory && ['all', 'cbd', 'cannabinoids', 'cannabis', 'medical-cannabis'].includes(urlCategory) ? urlCategory : 'all');
      setSelectedConditions(urlCondition && urlCondition in CONDITIONS ? [urlCondition as ConditionKey] : []);
      setQualityRange(urlQuality ? { min: parseInt(urlQuality) || 0, max: 100 } : { min: 0, max: 100 });
      setYearRange(urlYear ? { min: parseInt(urlYear) || dataYearRange.min, max: dataYearRange.max } : dataYearRange);
      setSearchQuery(urlSearch || '');
      setSelectedStudyTypes(urlType === 'rct' ? [StudyType.RANDOMIZED_CONTROLLED_TRIAL] : []);

      // Handle cannabinoids from URL
      if (urlCannabinoids) {
        const cannabinoidKeys = urlCannabinoids.split(',').filter(c => c in CANNABINOIDS) as CannabinoidKey[];
        setSelectedCannabinoids(cannabinoidKeys);
      } else {
        setSelectedCannabinoids([]);
      }

      // Handle subject type
      if (urlSubject === 'human' || urlSubject === 'animal') {
        setSubjectType(urlSubject);
      } else if (urlHuman === '1') {
        setSubjectType('human');
      } else {
        setSubjectType('all');
      }

      setCurrentPage(1);
    } else if (!urlInitialized) {
      // Only load from localStorage on first mount with no URL params
      const saved = loadSavedFilters();
      if (saved) {
        if (saved.searchQuery) setSearchQuery(saved.searchQuery);
        if (saved.activeCategory) setActiveCategory(saved.activeCategory);
        if (saved.selectedQualityTiers) setSelectedQualityTiers(saved.selectedQualityTiers);
        if (saved.selectedStudyTypes) setSelectedStudyTypes(saved.selectedStudyTypes);
        if (saved.selectedConditions) setSelectedConditions(saved.selectedConditions);
        if (saved.selectedCannabinoids) setSelectedCannabinoids(saved.selectedCannabinoids);
        if (saved.yearRange) setYearRange(saved.yearRange);
        if (saved.qualityRange) setQualityRange(saved.qualityRange);
        if (saved.subjectType) setSubjectType(saved.subjectType);
        if (saved.sortBy) setSortBy(saved.sortBy);
        if (saved.viewMode) setViewMode(saved.viewMode);
      }
    }

    setUrlInitialized(true);
  }, [searchParams, condition, dataYearRange.min, dataYearRange.max]);

  // Update URL when filters change
  useEffect(() => {
    if (!urlInitialized || condition) return;

    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (selectedConditions.length === 1) params.set('condition', selectedConditions[0]);
    if (qualityRange.min > 0) params.set('quality', qualityRange.min.toString());
    if (yearRange.min > dataYearRange.min) params.set('year', yearRange.min.toString());
    if (searchQuery) params.set('q', searchQuery);
    if (selectedStudyTypes.length === 1 && selectedStudyTypes[0] === StudyType.RANDOMIZED_CONTROLLED_TRIAL) {
      params.set('type', 'rct');
    }
    if (subjectType !== 'all') params.set('subject', subjectType);
    if (selectedCannabinoids.length > 0) params.set('cannabinoids', selectedCannabinoids.join(','));

    const newUrl = params.toString() ? `/research?${params.toString()}` : '/research';
    window.history.replaceState({}, '', newUrl);
  }, [activeCategory, selectedConditions, qualityRange, yearRange, searchQuery, urlInitialized, condition, dataYearRange.min, selectedStudyTypes, subjectType, selectedCannabinoids]);

  // Save filters when they change
  useEffect(() => {
    const filters: SavedFilters = {
      searchQuery,
      activeCategory,
      selectedQualityTiers,
      selectedStudyTypes,
      selectedConditions,
      selectedCannabinoids,
      yearRange,
      qualityRange,
      subjectType,
      sortBy,
      viewMode
    };
    saveFilters(filters);
  }, [searchQuery, activeCategory, selectedQualityTiers, selectedStudyTypes, selectedConditions, selectedCannabinoids, yearRange, qualityRange, subjectType, sortBy, viewMode]);

  // Calculate quality metrics for all studies
  const studiesWithQuality = useMemo(() => {
    return initialResearch.map(study => {
      const assessment = assessStudyQuality(study);
      const text = `${study.title || ''} ${study.abstract || ''}`;
      const sampleInfo = extractSampleInfo(text, assessment.studyType);
      const treatment = extractTreatment(text);
      const studyStatus = extractStudyStatus(text, study.url);
      const primaryCondition = getPrimaryCondition(study);
      const outcome = extractStudyOutcome(text, studyStatus || undefined);
      const cannabinoids = detectCannabinoids(study.title, study.abstract);

      return {
        ...study,
        qualityTier: assessment.tier,
        qualityScore: assessment.score,
        studyType: assessment.studyType,
        assessment: assessment,
        sampleInfo,
        treatment,
        studyStatus,
        primaryCondition,
        outcome,
        cannabinoids
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
      [QualityTier.PRELIMINARY]: 0
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

  // Cannabinoid statistics - counts based on filtered studies (respects other filters)
  const cannabinoidStats = useMemo(() => {
    const stats: Record<CannabinoidKey, number> = {} as Record<CannabinoidKey, number>;

    for (const key of Object.keys(CANNABINOIDS) as CannabinoidKey[]) {
      stats[key] = studiesWithQuality.filter(s =>
        s.cannabinoids && s.cannabinoids.includes(key)
      ).length;
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

    // Cannabinoid filter (OR logic - show studies with ANY selected cannabinoid)
    if (selectedCannabinoids.length > 0) {
      filtered = filtered.filter(study =>
        study.cannabinoids && study.cannabinoids.some((c: CannabinoidKey) => selectedCannabinoids.includes(c))
      );
    }

    // Year range filter
    filtered = filtered.filter(study =>
      study.year >= yearRange.min && study.year <= yearRange.max
    );

    // Quality score range filter
    filtered = filtered.filter(study =>
      study.qualityScore >= qualityRange.min && study.qualityScore <= qualityRange.max
    );

    // Subject type filter (human/animal/all)
    if (subjectType === 'human') {
      filtered = filtered.filter(study =>
        study.studyType !== StudyType.ANIMAL_STUDY &&
        study.studyType !== StudyType.IN_VITRO_STUDY
      );
    } else if (subjectType === 'animal') {
      filtered = filtered.filter(study =>
        study.studyType === StudyType.ANIMAL_STUDY ||
        study.studyType === StudyType.IN_VITRO_STUDY
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
  }, [studiesWithQuality, activeCategory, selectedConditions, selectedCannabinoids, searchQuery, selectedQualityTiers, selectedStudyTypes, yearRange, qualityRange, sortBy, subjectType]);

  // Pagination
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate topic statistics for research context
  const topicStatsMap = useMemo(() => {
    const statsMap = new Map<string, { total: number; studyRanks: Map<string, number> }>();

    // Group studies by primary condition
    studiesWithQuality.forEach(study => {
      if (study.primaryCondition?.key) {
        const key = study.primaryCondition.key;
        if (!statsMap.has(key)) {
          statsMap.set(key, { total: 0, studyRanks: new Map() });
        }
        statsMap.get(key)!.total++;
      }
    });

    // Calculate quality rank within each topic
    Object.keys(CONDITIONS).forEach(condKey => {
      const topicStudies = studiesWithQuality
        .filter(s => s.primaryCondition?.key === condKey)
        .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

      topicStudies.forEach((study, index) => {
        if (statsMap.has(condKey)) {
          statsMap.get(condKey)!.studyRanks.set(study.id, index + 1);
        }
      });
    });

    return statsMap;
  }, [studiesWithQuality]);

  // Helper to get topic stats for a study
  const getTopicStats = (study: any): { total: number; rank: number } | undefined => {
    if (!study.primaryCondition?.key) return undefined;
    const stats = topicStatsMap.get(study.primaryCondition.key);
    if (!stats) return undefined;
    return {
      total: stats.total,
      rank: stats.studyRanks.get(study.id) || 0
    };
  };

  // Handler functions
  const toggleQualityTier = (tier: QualityTier) => {
    setSelectedQualityTiers(prev =>
      prev.includes(tier)
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    );
    setCurrentPage(1);
  };

  const toggleCannabinoid = (cannabinoid: CannabinoidKey) => {
    setSelectedCannabinoids(prev =>
      prev.includes(cannabinoid)
        ? prev.filter(c => c !== cannabinoid)
        : [...prev, cannabinoid]
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
    setSelectedCannabinoids([]);
    setYearRange(dataYearRange);
    setQualityRange({ min: 0, max: 100 });
    setSubjectType('all');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    activeCategory !== 'all' ? 1 : 0,
    selectedQualityTiers.length,
    selectedStudyTypes.length,
    selectedConditions.length,
    selectedCannabinoids.length,
    (yearRange.min !== dataYearRange.min || yearRange.max !== dataYearRange.max) ? 1 : 0,
    (qualityRange.min !== 0 || qualityRange.max !== 100) ? 1 : 0,
    subjectType !== 'all' ? 1 : 0
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
    if (subjectType === 'human') labels.push('Human only');
    if (subjectType === 'animal') labels.push('Animal only');
    return labels;
  }, [activeCategory, selectedConditions, yearRange, qualityRange, subjectType, dataYearRange]);

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
                subjectType={subjectType}
                setSubjectType={setSubjectType}
                selectedCannabinoids={selectedCannabinoids}
                toggleCannabinoid={toggleCannabinoid}
                cannabinoidStats={cannabinoidStats}
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
              subjectType={subjectType}
              setSubjectType={setSubjectType}
              selectedCannabinoids={selectedCannabinoids}
              toggleCannabinoid={toggleCannabinoid}
              cannabinoidStats={cannabinoidStats}
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

          {/* Top Conditions Quick Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <TopConditionsSummary
              conditionStats={conditionStats}
              selectedConditions={selectedConditions}
              onConditionClick={(condKey) => {
                if (selectedConditions.includes(condKey)) {
                  setSelectedConditions(selectedConditions.filter(c => c !== condKey));
                } else {
                  setSelectedConditions([condKey]);
                }
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Research Results */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Research studies">
              {paginatedStudies.map((study) => (
                <ResearchCard
                  key={study.id}
                  study={study}
                  topicStats={getTopicStats(study)}
                  onConditionClick={(condKey) => {
                    setSelectedConditions([condKey]);
                    setCurrentPage(1);
                  }}
                />
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

          {/* Informational Footer Section */}
          <ResearchInfoFooter />
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// RESEARCH INFO FOOTER COMPONENT
// ============================================================================

function ResearchInfoFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <section className="mt-12 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <h2 className="sr-only">Research Database Information</h2>

      {/* Understanding Quality Scores */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('quality')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-800">Understanding Quality Scores</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'quality' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSection === 'quality' && (
          <div className="px-6 pb-6 space-y-4 text-sm text-gray-600">
            <p className="text-gray-700">
              Each study is scored on a 100-point scale based on four key factors:
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-800">Study Design (up to 50 points)</h4>
                <p>
                  The foundation of the score. Meta-analyses and systematic reviews score highest (45-50),
                  followed by randomized controlled trials (40), controlled trials (30), and cohort studies (25).
                  Animal and in-vitro studies score lower as they're less applicable to human use.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">Methodology (up to 25 points)</h4>
                <p>Bonus points for rigorous study design:</p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li>Double-blind design: +10</li>
                  <li>Placebo-controlled: +8</li>
                  <li>Multicenter study: +7</li>
                  <li>Single-blind design: +5</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">Sample Size (up to 15 points)</h4>
                <p>Larger studies provide more reliable results:</p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li>1,000+ participants: +15</li>
                  <li>500-999 participants: +14</li>
                  <li>200-499 participants: +12</li>
                  <li>100-199 participants: +10</li>
                  <li>50-99 participants: +8</li>
                  <li>30-49 participants: +6</li>
                  <li>20-29 participants: +5</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">Relevance (up to 10 points)</h4>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                  <li>Human study: +7</li>
                  <li>CBD-specific research: +3</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Score ranges:</strong> Gold Standard (90-100) • High Quality (70-89) • Moderate (50-69) • Limited (30-49) • Preliminary (0-29)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* About This Database */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('about')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-800">About This Database</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'about' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSection === 'about' && (
          <div className="px-6 pb-6 text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>We curate peer-reviewed research from PubMed, PMC, and ClinicalTrials.gov</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Studies are automatically scored and categorized using our quality assessment algorithm</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Our team reviews and approves studies for inclusion in the database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>The database is updated regularly with new research as it becomes available</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* How to Use This Page */}
      <div>
        <button
          onClick={() => toggleSection('howto')}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-800">How to Use This Page</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${openSection === 'howto' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openSection === 'howto' && (
          <div className="px-6 pb-6 text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">1.</span>
                <span>Use the filters in the sidebar to find studies relevant to your condition of interest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">2.</span>
                <span>Click on any study card to expand and view the full abstract and quality assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">3.</span>
                <span>Higher quality scores indicate more rigorous methodology and stronger evidence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-medium">4.</span>
                <span>Click "View Full Study" to read the complete paper at the original source</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              Tip: Use the Subject Type filter to show only human studies, or the quality slider to focus on high-quality evidence.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// FILTER SIDEBAR CONTENT COMPONENT
// ============================================================================

interface FilterSidebarContentProps {
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
  subjectType: SubjectType;
  setSubjectType: (type: SubjectType) => void;
  selectedCannabinoids: CannabinoidKey[];
  toggleCannabinoid: (cannabinoid: CannabinoidKey) => void;
  cannabinoidStats: Record<CannabinoidKey, number>;
  clearAllFilters: () => void;
  setCurrentPage: (page: number) => void;
}

function FilterSidebarContent({
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
  subjectType,
  setSubjectType,
  selectedCannabinoids,
  toggleCannabinoid,
  cannabinoidStats,
  clearAllFilters,
  setCurrentPage,
}: FilterSidebarContentProps) {
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  return (
    <>
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
          {(showAllConditions
            ? (Object.keys(CONDITIONS) as ConditionKey[]).sort((a, b) => CONDITIONS[a].label.localeCompare(CONDITIONS[b].label))
            : TOP_CONDITIONS
          ).map((key) => {
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

      {/* Subject Type Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject Type</h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => { setSubjectType('all'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              subjectType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setSubjectType('human'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              subjectType === 'human'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Human
          </button>
          <button
            onClick={() => { setSubjectType('animal'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              subjectType === 'animal'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Animal
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
            {/* Cannabinoids */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Cannabinoids</label>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {(Object.keys(CANNABINOIDS) as CannabinoidKey[]).map((key) => {
                  const cannabinoid = CANNABINOIDS[key];
                  const count = cannabinoidStats[key] || 0;
                  const isSelected = selectedCannabinoids.includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-center justify-between gap-2 cursor-pointer p-1.5 rounded transition-all ${
                        isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCannabinoid(key)}
                          className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className={`text-xs ${isSelected ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                          {cannabinoid.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({cannabinoid.fullName})
                        </span>
                      </div>
                      <span className={`text-xs ${count > 0 ? 'text-gray-500' : 'text-gray-300'}`}>
                        {count}
                      </span>
                    </label>
                  );
                })}
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
  // Determine back link - if on condition page, go to research; if on research, go to home
  const backLink = condition ? { href: '/research', label: 'Research' } : { href: '/', label: 'Home' };

  return (
    <>
      {/* Mobile: Simple back link */}
      <nav aria-label="Back" className="sm:hidden text-sm mb-4">
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-green-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLink.label}
        </Link>
      </nav>

      {/* Desktop: Full breadcrumb path */}
      <nav aria-label="Breadcrumb" className="hidden sm:block text-sm mb-6">
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
    </>
  );
}

// ============================================================================
// RESEARCH CARD COMPONENT - Redesigned with better hierarchy
// ============================================================================

interface ResearchCardProps {
  study: any;
  onConditionClick?: (condition: ConditionKey) => void;
  topicStats?: { total: number; rank: number };
}

function ResearchCard({ study, onConditionClick, topicStats }: ResearchCardProps) {
  // Status badge config
  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
    ongoing: { label: 'Ongoing', bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳' },
    recruiting: { label: 'Recruiting', bg: 'bg-amber-100', text: 'text-amber-700', icon: '📢' }
  };

  const conditionColors = study.primaryCondition
    ? CONDITION_COLORS[study.primaryCondition.key] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    : null;

  // Get country flag
  const countryFlag = getCountryFlag(study.country);

  // Check if high quality (top 15% = score >= 70)
  const isHighQuality = study.qualityScore >= 70;
  const isPreclinical = study.studyType === StudyType.ANIMAL_STUDY || study.studyType === StudyType.IN_VITRO_STUDY;

  // Get display title or generate from title
  const displayTitle = study.display_title || study.title;

  // Get first author last name
  const firstAuthor = study.authors?.split(',')[0]?.trim()?.split(' ').pop() || 'Unknown';

  // Truncate summary
  const truncatedSummary = study.plain_summary
    ? truncateText(study.plain_summary, 150)
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

      {/* Row 1: Title with flag and Quality Score */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" itemProp="name">
            {countryFlag && <span className="mr-1.5" title={study.country}>{countryFlag}</span>}
            {study.slug ? (
              <Link href={`/research/study/${study.slug}`} className="hover:text-green-600 transition-colors">
                {displayTitle}
              </Link>
            ) : (
              displayTitle
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>{firstAuthor}</span>
            <span>•</span>
            <span>{study.year}</span>
            <span>•</span>
            <span>{study.studyType}</span>
            {isHighQuality && !isPreclinical && (
              <>
                <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">
                  TOP 15% ⭐
                </span>
              </>
            )}
          </p>
        </div>
        <div className="shrink-0">
          {isPreclinical ? (
            <div className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-purple-100 border-2 border-purple-200" title="Preclinical Study">
              <span className="text-base">🧪</span>
              <span className="text-[8px] font-semibold text-purple-700 -mt-0.5">PRE</span>
            </div>
          ) : (
            <div title={`Quality Score: ${study.qualityScore}/100`}>
              <CircularQualityScore score={study.qualityScore} size={44} />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Key Info Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {/* Primary Condition Badge - Clickable */}
        {study.primaryCondition && conditionColors && (
          <button
            onClick={() => onConditionClick?.(study.primaryCondition.key)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${conditionColors.bg} ${conditionColors.text} border ${conditionColors.border} hover:opacity-80 transition-opacity cursor-pointer`}
            title={`Filter by ${study.primaryCondition.data.label}`}
          >
            <span aria-hidden="true">{study.primaryCondition.data.icon}</span>
            {study.primaryCondition.data.label}
          </button>
        )}

        {/* Sample Size Badge with Subject Type */}
        {study.sampleInfo && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
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
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig[study.studyStatus].bg} ${statusConfig[study.studyStatus].text}`}>
            <span aria-hidden="true">{statusConfig[study.studyStatus].icon}</span>
            {statusConfig[study.studyStatus].label}
          </span>
        )}

        {/* Treatment/Dose Badge */}
        {study.treatment && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            💊 {study.treatment.length > 20 ? study.treatment.slice(0, 20) + '...' : study.treatment}
          </span>
        )}
      </div>

      {/* Row 3: Truncated Summary */}
      {truncatedSummary && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {truncatedSummary}
        </p>
      )}

      {/* Row 4: Research Context + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {/* Research Context */}
        {topicStats && study.primaryCondition && (
          <p className="text-xs text-gray-400">
            📊 1 of {topicStats.total} {study.primaryCondition.data.label.toLowerCase()} studies
            {topicStats.rank > 0 && !isPreclinical && ` • Ranks #${topicStats.rank} for quality`}
          </p>
        )}
        {!topicStats && <div />}

        {/* Single CTA Button */}
        {study.slug ? (
          <Link
            href={`/research/study/${study.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            View Study
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <a
            href={study.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            View Study
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
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
                  {study.studyType === StudyType.ANIMAL_STUDY || study.studyType === StudyType.IN_VITRO_STUDY ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      🧪 Preclinical
                    </span>
                  ) : (
                    <>
                      <QualityIndicator tier={study.qualityTier} />
                      <div className="text-xs text-gray-500 mt-1">{study.qualityScore}/100</div>
                    </>
                  )}
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
