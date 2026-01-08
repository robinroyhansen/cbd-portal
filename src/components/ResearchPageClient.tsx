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
// CONDITION/TOPIC DEFINITIONS
// ============================================================================

export const CONDITIONS = {
  anxiety: {
    label: 'Anxiety & Stress',
    keywords: ['anxiety', 'anxiolytic', 'gad', 'social anxiety', 'panic', 'stress', 'ptsd', 'trauma'],
    icon: '🧠',
    color: 'purple',
    description: 'Research on CBD for anxiety disorders, stress relief, and PTSD'
  },
  pain: {
    label: 'Pain Management',
    keywords: ['pain', 'analgesic', 'neuropathic', 'chronic pain', 'fibromyalgia', 'arthritis', 'inflammation'],
    icon: '💪',
    color: 'red',
    description: 'Studies on CBD for chronic pain, neuropathy, and inflammatory conditions'
  },
  sleep: {
    label: 'Sleep & Insomnia',
    keywords: ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder'],
    icon: '😴',
    color: 'indigo',
    description: 'Research on CBD effects on sleep quality and insomnia treatment'
  },
  epilepsy: {
    label: 'Epilepsy & Seizures',
    keywords: ['epilepsy', 'seizure', 'dravet', 'lennox-gastaut', 'anticonvulsant', 'epidiolex'],
    icon: '⚡',
    color: 'yellow',
    description: 'Clinical studies on CBD for epilepsy and seizure disorders'
  },
  depression: {
    label: 'Depression & Mood',
    keywords: ['depression', 'antidepressant', 'mood', 'bipolar', 'mdd'],
    icon: '🌤️',
    color: 'blue',
    description: 'Research on CBD for depression and mood disorders'
  },
  inflammation: {
    label: 'Inflammation & Immune',
    keywords: ['inflammation', 'anti-inflammatory', 'cytokine', 'immune', 'autoimmune', 'tnf'],
    icon: '🔥',
    color: 'orange',
    description: 'Studies on CBD anti-inflammatory and immunomodulatory effects'
  },
  cancer: {
    label: 'Cancer & Oncology',
    keywords: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'palliative', 'antiemetic', 'nausea'],
    icon: '🎗️',
    color: 'pink',
    description: 'Research on CBD in cancer treatment and symptom management'
  },
  neurological: {
    label: 'Neurological Disorders',
    keywords: ['parkinson', 'alzheimer', 'multiple sclerosis', 'neuroprotective', 'neurodegeneration', 'huntington', 'als'],
    icon: '🧬',
    color: 'teal',
    description: 'Studies on CBD for neurodegenerative diseases'
  },
  addiction: {
    label: 'Addiction & Substance Use',
    keywords: ['addiction', 'substance use', 'opioid', 'withdrawal', 'dependence', 'alcohol'],
    icon: '🔄',
    color: 'green',
    description: 'Research on CBD for addiction treatment and withdrawal'
  },
  skin: {
    label: 'Skin Conditions',
    keywords: ['eczema', 'psoriasis', 'dermatitis', 'skin', 'topical', 'acne'],
    icon: '🧴',
    color: 'rose',
    description: 'Studies on CBD for dermatological conditions'
  },
  heart: {
    label: 'Cardiovascular Health',
    keywords: ['cardiovascular', 'heart', 'blood pressure', 'hypertension', 'cardiac'],
    icon: '❤️',
    color: 'red',
    description: 'Research on CBD cardiovascular effects'
  },
  digestive: {
    label: 'Digestive Health',
    keywords: ['ibs', 'irritable bowel', 'crohn', 'ibd', 'colitis', 'gut', 'digestive'],
    icon: '🫃',
    color: 'amber',
    description: 'Studies on CBD for GI disorders'
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

function extractSampleSize(text: string): number | null {
  const patterns = [
    /\bn\s*=\s*(\d+)/gi,
    /\bN\s*=\s*(\d+)/gi,
    /(\d+)\s*(?:participant|patient|subject|individual|adult|child|volunteer|people|person|case|sample)s?\b/gi,
    /(?:enrolled|recruited|included|randomized|studied)\s+(\d+)/gi,
    /(?:total of|sample of|population of)\s+(\d+)/gi,
    /(\d+)\s+(?:were|was)\s+(?:enrolled|recruited|included|randomized)/gi,
  ];

  let maxSize = 0;
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const num = parseInt(match[1]);
      if (num > maxSize && num < 50000 && num >= 5) maxSize = num;
    }
  }

  return maxSize > 0 ? maxSize : null;
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

  // CBD-specific patterns
  const cbdPatterns = [
    /(?:oral|sublingual|topical)?\s*(?:cbd|cannabidiol)\s*(?:\d+\s*mg)?/gi,
    /(?:epidiolex|sativex|nabiximols)/gi,
    /cbd\s*(?:oil|extract|isolate|tincture|capsule)/gi,
    /(?:full|broad)[- ]spectrum\s*(?:cbd|hemp|cannabis)/gi,
  ];

  for (const pattern of cbdPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up and capitalize
      let treatment = match[0].trim();
      // Standardize common terms
      if (treatment.toLowerCase().includes('epidiolex')) return 'Epidiolex (CBD)';
      if (treatment.toLowerCase().includes('sativex')) return 'Sativex (THC:CBD)';
      if (treatment.toLowerCase().includes('nabiximols')) return 'Nabiximols';
      // Return cleaned treatment
      return treatment.charAt(0).toUpperCase() + treatment.slice(1).toLowerCase();
    }
  }

  // Dose patterns
  const dosePattern = /(\d+)\s*(?:mg|milligram)s?\s*(?:of\s*)?(?:cbd|cannabidiol)/gi;
  const doseMatch = text.match(dosePattern);
  if (doseMatch) {
    return doseMatch[0].replace(/\s+/g, ' ').trim();
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

  // Priority order for conditions
  const conditionPriority: ConditionKey[] = [
    'epilepsy', 'cancer', 'neurological', 'pain', 'anxiety',
    'sleep', 'depression', 'inflammation', 'addiction', 'skin', 'heart', 'digestive'
  ];

  for (const key of conditionPriority) {
    const cond = CONDITIONS[key];
    if (cond.keywords.some(kw => text.includes(kw.toLowerCase()))) {
      return { key, data: cond };
    }
  }

  return null;
}

// Condition badge colors (Tailwind classes)
const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  anxiety: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  pain: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  sleep: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  epilepsy: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  depression: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  inflammation: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  cancer: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  neurological: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
  addiction: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  skin: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  heart: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  digestive: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
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
  const [filtersExpanded, setFiltersExpanded] = useState(false);
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
      const sampleSize = extractSampleSize(text);
      const treatment = extractTreatment(text);
      const studyStatus = extractStudyStatus(text, study.url);
      const primaryCondition = getPrimaryCondition(study);

      return {
        ...study,
        qualityTier: assessment.tier,
        qualityScore: assessment.score,
        studyType: assessment.studyType,
        assessment: assessment,
        sampleSize,
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

  return (
    <div className="space-y-6">
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

      {/* Search Bar - Prominent */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <label htmlFor="research-search" className="sr-only">Search research studies</label>
          <input
            id="research-search"
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, authors, abstract, condition..."
            className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search research studies"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Condition Quick Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>Filter by Condition</span>
          {selectedConditions.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {selectedConditions.length} selected
            </span>
          )}
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Condition filters">
          {(Object.entries(CONDITIONS) as [ConditionKey, typeof CONDITIONS[ConditionKey]][]).map(([key, cond]) => (
            <button
              key={key}
              onClick={() => toggleCondition(key)}
              aria-pressed={selectedConditions.includes(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedConditions.includes(key)
                  ? `bg-${cond.color}-100 text-${cond.color}-800 ring-2 ring-${cond.color}-500`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span aria-hidden="true">{cond.icon}</span>
              <span>{cond.label}</span>
              <span className="text-xs opacity-75">({conditionStats[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          aria-expanded={filtersExpanded}
          aria-controls="advanced-filters"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersExpanded && (
          <div id="advanced-filters" className="p-4 border-t border-gray-200 space-y-6">
            {/* Year Range Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Year: {yearRange.min} - {yearRange.max}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={dataYearRange.min}
                  max={dataYearRange.max}
                  value={yearRange.min}
                  onChange={(e) => setYearRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Minimum year"
                />
                <input
                  type="range"
                  min={dataYearRange.min}
                  max={dataYearRange.max}
                  value={yearRange.max}
                  onChange={(e) => setYearRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Maximum year"
                />
              </div>
            </div>

            {/* Quality Score Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Score: {qualityRange.min} - {qualityRange.max}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={qualityRange.min}
                  onChange={(e) => setQualityRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Minimum quality score"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={qualityRange.max}
                  onChange={(e) => setQualityRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Maximum quality score"
                />
              </div>
            </div>

            {/* Quality Tiers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Tiers
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2" role="group" aria-label="Quality tier filters">
                {Object.entries(qualityStats).map(([tier, count]) => (
                  <button
                    key={tier}
                    onClick={() => toggleQualityTier(tier as QualityTier)}
                    aria-pressed={selectedQualityTiers.includes(tier as QualityTier)}
                    className={`p-2 rounded-lg border-2 text-center transition-all text-sm ${
                      selectedQualityTiers.includes(tier as QualityTier)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <QualityIndicator tier={tier as QualityTier} className="mx-auto mb-1" />
                    <div className="font-medium">{count}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{tier}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Study Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Study Types ({selectedStudyTypes.length} selected)
              </label>
              <StudyTypeFilter
                selectedTypes={selectedStudyTypes}
                onToggleType={toggleStudyType}
                availableTypes={availableStudyTypes}
                className="max-h-32 overflow-y-auto"
              />
            </div>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHumanStudiesOnly}
                  onChange={(e) => setShowHumanStudiesOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Human studies only</span>
              </label>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm font-medium">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="quality">Quality Score</option>
                  <option value="year">Publication Year</option>
                  <option value="title">Title</option>
                  <option value="relevance">Relevance Score</option>
                </select>
              </div>

              <div className="flex items-center gap-2" role="group" aria-label="View mode">
                <label className="text-sm font-medium">View:</label>
                <button
                  onClick={() => setViewMode('cards')}
                  aria-pressed={viewMode === 'cards'}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  aria-pressed={viewMode === 'timeline'}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'timeline' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Timeline
                </button>
              </div>

              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
        <div className="text-gray-600">
          Showing <strong>{paginatedStudies.length}</strong> of <strong>{filteredStudies.length}</strong> studies
          {filteredStudies.length !== studiesWithQuality.length && (
            <span> (filtered from {studiesWithQuality.length} total)</span>
          )}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm" aria-current="page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </div>

      {/* Research Results */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-label="Research studies">
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
        <nav aria-label="Bottom pagination" className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            aria-label="First page"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="px-4 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            aria-label="Next page"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
            aria-label="Last page"
          >
            Last
          </button>
        </nav>
      )}
    </div>
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

        {/* Sample Size Badge */}
        {study.sampleSize && (
          <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
            👥 n={study.sampleSize.toLocaleString()}
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
            {/* Full Abstract */}
            {study.abstract && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Abstract</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{study.abstract}</p>
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
                  {study.sampleSize ? `n=${study.sampleSize}` : '-'}
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
