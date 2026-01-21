'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  HubHero,
  HubQuickStats,
  HubSection,
  HubArticleGrid,
  HubCTA,
  HubEmptyState,
} from '@/components/hub';

// Body system configuration - mirrors ConditionsHub categories
const BODY_SYSTEM_CONFIG: Record<string, {
  icon: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  'mental-health': {
    icon: '🧠',
    name: 'Mental Health',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Anxiety, depression, PTSD, stress, and mood disorders',
  },
  'pain': {
    icon: '💪',
    name: 'Pain & Discomfort',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Chronic pain, arthritis, fibromyalgia, and neuropathy',
  },
  'sleep': {
    icon: '😴',
    name: 'Sleep Disorders',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Insomnia, sleep quality, and circadian rhythm',
  },
  'neurological': {
    icon: '⚡',
    name: 'Neurological',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Epilepsy, Parkinson\'s, MS, and brain health',
  },
  'inflammation': {
    icon: '🔥',
    name: 'Inflammation & Autoimmune',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Autoimmune conditions and inflammatory diseases',
  },
  'skin': {
    icon: '✨',
    name: 'Skin Conditions',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Acne, eczema, psoriasis, and dermatitis',
  },
  'digestive': {
    icon: '🍃',
    name: 'Digestive Health',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'IBS, Crohn\'s, nausea, and gut health',
  },
  'cardiovascular': {
    icon: '❤️',
    name: 'Cardiovascular',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Heart health, blood pressure, and circulation',
  },
  'immune': {
    icon: '🛡️',
    name: 'Immune System',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Immune function and defense mechanisms',
  },
  'other': {
    icon: '🏥',
    name: 'Other Conditions',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Additional health conditions and wellness topics',
  },
};

// Evidence level configuration based on research count
function getEvidenceLevel(researchCount: number): {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  dots: number;
} {
  if (researchCount >= 20) {
    return { level: 'strong', label: 'Strong Evidence', color: 'text-green-700', bgColor: 'bg-green-50', dots: 5 };
  } else if (researchCount >= 10) {
    return { level: 'moderate', label: 'Moderate Evidence', color: 'text-blue-700', bgColor: 'bg-blue-50', dots: 3 };
  } else if (researchCount >= 5) {
    return { level: 'limited', label: 'Limited Evidence', color: 'text-amber-700', bgColor: 'bg-amber-50', dots: 2 };
  } else {
    return { level: 'emerging', label: 'Emerging Research', color: 'text-gray-600', bgColor: 'bg-gray-50', dots: 1 };
  }
}

interface Condition {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  short_description: string | null;
  category: string | null;
  research_count: number | null;
  is_featured: boolean | null;
  description: string | null;
  updated_at: string | null;
}

interface ConditionArticlesHubProps {
  conditions: Condition[];
  totalStudies: number;
}

// Evidence dots display component
function EvidenceDots({ count }: { count: number }) {
  const evidence = getEvidenceLevel(count);
  return (
    <div className={`flex items-center gap-0.5 ${evidence.color}`} title={evidence.label}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= evidence.dots ? 'bg-current' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export function ConditionArticlesHub({ conditions, totalStudies }: ConditionArticlesHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  // Calculate stats
  const totalConditions = conditions.length;
  const conditionsWithArticles = conditions.filter(c => c.description && c.description.length > 100).length;
  const totalResearch = conditions.reduce((sum, c) => sum + (c.research_count || 0), 0);

  // System counts
  const systemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conditions.forEach(condition => {
      const cat = condition.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [conditions]);

  // Evidence level counts
  const evidenceCounts = useMemo(() => {
    const counts: Record<string, number> = { strong: 0, moderate: 0, limited: 0, emerging: 0 };
    conditions.forEach(condition => {
      const evidence = getEvidenceLevel(condition.research_count || 0);
      counts[evidence.level] = (counts[evidence.level] || 0) + 1;
    });
    return counts;
  }, [conditions]);

  // Filter conditions
  const filteredConditions = useMemo(() => {
    let result = conditions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.display_name?.toLowerCase().includes(query) ||
        c.short_description?.toLowerCase().includes(query)
      );
    }

    if (selectedSystem) {
      result = result.filter(c => (c.category || 'other') === selectedSystem);
    }

    if (selectedEvidence) {
      result = result.filter(c => {
        const evidence = getEvidenceLevel(c.research_count || 0);
        return evidence.level === selectedEvidence;
      });
    }

    return result.sort((a, b) =>
      (a.display_name || a.name).localeCompare(b.display_name || b.name)
    );
  }, [conditions, searchQuery, selectedSystem, selectedEvidence]);

  // Group by body system
  const groupedBySystem = useMemo(() => {
    const groups: Record<string, Condition[]> = {};
    filteredConditions.forEach(condition => {
      const cat = condition.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(condition);
    });
    return groups;
  }, [filteredConditions]);

  // Featured conditions (most researched)
  const featuredConditions = useMemo(() => {
    return [...conditions]
      .filter(c => c.is_featured || (c.research_count && c.research_count > 20))
      .sort((a, b) => (b.research_count || 0) - (a.research_count || 0))
      .slice(0, 6);
  }, [conditions]);

  // Active systems (with conditions)
  const activeSystems = Object.keys(systemCounts).filter(s => systemCounts[s] > 0);
  const bodySystems = Object.keys(BODY_SYSTEM_CONFIG).filter(s => s !== 'other' && systemCounts[s] > 0);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🏥"
        title="CBD & Health Conditions"
        subtitle="Evidence-Based Articles on CBD for Medical Conditions"
        description={`Explore ${totalConditions.toLocaleString('de-DE')} in-depth condition articles examining how CBD may help with various health conditions. Each article is backed by research from our database of ${totalStudies.toLocaleString('de-DE')}+ peer-reviewed studies.`}
        badgeText="Condition Research Library"
        badgeColor="bg-green-100 text-green-700"
        gradientFrom="from-green-50"
        gradientTo="to-emerald-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: totalConditions.toLocaleString('de-DE'), label: 'Health Conditions', color: 'text-green-600' },
          { value: conditionsWithArticles.toLocaleString('de-DE'), label: 'Full Articles', color: 'text-blue-600' },
          { value: totalStudies.toLocaleString('de-DE') + '+', label: 'Research Studies', color: 'text-purple-600' },
          { value: activeSystems.length.toString(), label: 'Body Systems', color: 'text-amber-600' },
        ]}
      />

      {/* Research Approach Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">📊</span>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Our Research-First Approach</h3>
            <p className="text-blue-700 text-sm">
              Every condition article is built on top of actual research. We analyze all approved studies for a condition
              before writing, so article depth reflects evidence depth. Articles range from 600-2,400 words based on
              available research — we don&apos;t pad thin evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Clear Filters Button */}
          {(selectedSystem || selectedEvidence || searchQuery) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedSystem(null); setSelectedEvidence(null); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Body System Filter Pills */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 font-medium">Filter by body system:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSystem(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedSystem
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Systems ({totalConditions})
            </button>
            {bodySystems.map(system => {
              const config = BODY_SYSTEM_CONFIG[system];
              const count = systemCounts[system] || 0;
              return (
                <button
                  key={system}
                  onClick={() => setSelectedSystem(selectedSystem === system ? null : system)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                    selectedSystem === system
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{config.icon}</span>
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence Level Filter */}
        <div>
          <p className="text-sm text-gray-600 mb-2 font-medium">Filter by evidence strength:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedEvidence(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !selectedEvidence
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Levels
            </button>
            {[
              { level: 'strong', label: 'Strong (20+ studies)', color: 'text-green-700', bgColor: 'bg-green-50' },
              { level: 'moderate', label: 'Moderate (10-19)', color: 'text-blue-700', bgColor: 'bg-blue-50' },
              { level: 'limited', label: 'Limited (5-9)', color: 'text-amber-700', bgColor: 'bg-amber-50' },
              { level: 'emerging', label: 'Emerging (<5)', color: 'text-gray-600', bgColor: 'bg-gray-50' },
            ].map(({ level, label, color, bgColor }) => {
              const count = evidenceCounts[level] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedEvidence(selectedEvidence === level ? null : level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    selectedEvidence === level
                      ? `${bgColor} ${color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || selectedSystem || selectedEvidence) && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            Showing {filteredConditions.length.toLocaleString('de-DE')} of {totalConditions.toLocaleString('de-DE')} conditions
            {selectedSystem && ` in ${BODY_SYSTEM_CONFIG[selectedSystem]?.name}`}
            {selectedEvidence && ` with ${selectedEvidence} evidence`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </section>

      {/* Featured Conditions (when no filters) */}
      {!searchQuery && !selectedSystem && !selectedEvidence && featuredConditions.length > 0 && (
        <HubSection
          title="Most Researched Conditions"
          description="Conditions with the strongest research support"
          icon="⭐"
        >
          <HubArticleGrid columns={3}>
            {featuredConditions.map(condition => (
              <ConditionCard key={condition.id} condition={condition} showEvidence />
            ))}
          </HubArticleGrid>
        </HubSection>
      )}

      {/* Body Systems Overview (when no filter) */}
      {!searchQuery && !selectedSystem && !selectedEvidence && (
        <HubSection
          title="Browse by Body System"
          description="Explore conditions organized by body system"
          icon="🔬"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodySystems.map(system => {
              const config = BODY_SYSTEM_CONFIG[system];
              const count = systemCounts[system] || 0;
              return (
                <button
                  key={system}
                  onClick={() => setSelectedSystem(system)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-md ${config.bgColor} ${config.borderColor} hover:border-current`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h3 className={`font-bold ${config.color}`}>{config.name}</h3>
                      <span className="text-sm text-gray-600">{count} conditions</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </button>
              );
            })}
          </div>
        </HubSection>
      )}

      {/* Conditions Display */}
      {filteredConditions.length > 0 ? (
        selectedSystem || searchQuery || selectedEvidence ? (
          /* Filtered view - flat list */
          <HubSection
            title={selectedSystem ? BODY_SYSTEM_CONFIG[selectedSystem]?.name : 'Search Results'}
            icon={selectedSystem ? BODY_SYSTEM_CONFIG[selectedSystem]?.icon : '🔍'}
            headerRight={
              <span className="text-sm text-gray-500">
                {filteredConditions.length.toLocaleString('de-DE')} conditions
              </span>
            }
          >
            <HubArticleGrid columns={3}>
              {filteredConditions.map(condition => (
                <ConditionCard key={condition.id} condition={condition} showEvidence showSystem={!selectedSystem} />
              ))}
            </HubArticleGrid>
          </HubSection>
        ) : (
          /* Default view - grouped by body system */
          <div className="space-y-10">
            {Object.entries(groupedBySystem)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([system, systemConditions]) => {
                const config = BODY_SYSTEM_CONFIG[system] || BODY_SYSTEM_CONFIG.other;
                return (
                  <HubSection
                    key={system}
                    title={config.name}
                    icon={config.icon}
                    headerRight={
                      <button
                        onClick={() => setSelectedSystem(system)}
                        className={`text-sm ${config.color} hover:underline font-medium`}
                      >
                        View all {systemConditions.length} →
                      </button>
                    }
                  >
                    <HubArticleGrid columns={3}>
                      {systemConditions.slice(0, 6).map(condition => (
                        <ConditionCard key={condition.id} condition={condition} showEvidence />
                      ))}
                    </HubArticleGrid>
                  </HubSection>
                );
              })}
          </div>
        )
      ) : (
        <HubEmptyState
          icon="🔍"
          title="No Conditions Found"
          description="Try adjusting your search or filter criteria"
          actionLabel="Clear all filters"
          onAction={() => { setSearchQuery(''); setSelectedSystem(null); setSelectedEvidence(null); }}
        />
      )}

      {/* CTA */}
      <HubCTA
        title="Explore Our Research Database"
        description="Access our comprehensive database of peer-reviewed CBD studies. Filter by condition, study type, or evidence strength."
        gradientFrom="from-green-600"
        gradientTo="to-emerald-600"
        buttons={[
          { label: 'Research Database', href: '/research' },
          { label: 'Dosage Calculator', href: '/tools/dosage-calculator', variant: 'secondary' },
        ]}
      />

      {/* Disclaimer */}
      <div className="p-6 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Medical Disclaimer</p>
        <p>
          The information provided in these articles is for educational purposes only and is not intended as medical advice.
          CBD research is ongoing, and results may vary. Always consult with a healthcare professional before starting
          any new supplement regimen, especially if you have a medical condition or are taking medications.
        </p>
      </div>
    </div>
  );
}

// Condition Card Component
function ConditionCard({
  condition,
  showEvidence = false,
  showSystem = false
}: {
  condition: Condition;
  showEvidence?: boolean;
  showSystem?: boolean;
}) {
  const systemConfig = BODY_SYSTEM_CONFIG[condition.category || 'other'] || BODY_SYSTEM_CONFIG.other;
  const evidence = getEvidenceLevel(condition.research_count || 0);
  const hasArticle = condition.description && condition.description.length > 100;

  return (
    <Link
      href={`/conditions/${condition.slug}`}
      className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-lg transition-all group h-full"
    >
      <div className="flex-1">
        {/* Header with icon and badges */}
        <div className="flex items-start gap-3 mb-3">
          <span className={`text-2xl p-2 rounded-lg ${systemConfig.bgColor}`}>{systemConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {condition.display_name || condition.name}
            </h3>
            {showSystem && (
              <span className="text-xs text-gray-500">{systemConfig.name}</span>
            )}
          </div>
        </div>

        {/* Description */}
        {condition.short_description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {condition.short_description}
          </p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {showEvidence && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${evidence.bgColor} ${evidence.color} text-xs font-medium rounded`}>
              <EvidenceDots count={condition.research_count || 0} />
              {evidence.label}
            </span>
          )}
          {!hasArticle && (
            <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
        <span className="text-green-600 font-medium">
          {condition.research_count || 0} studies
        </span>
        {condition.updated_at && (
          <span>
            {new Date(condition.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  );
}
