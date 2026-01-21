'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  HubHero,
  HubQuickStats,
  HubSection,
  HubArticleCard,
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
  keywords: string[];
}> = {
  'mental-health': {
    icon: '🧠',
    name: 'Mental Health',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    keywords: ['anxiety', 'depression', 'ptsd', 'stress', 'mood', 'bipolar', 'ocd', 'panic', 'phobia', 'mental', 'psychiatric', 'schizophrenia', 'psychosis'],
  },
  'pain': {
    icon: '💪',
    name: 'Pain & Discomfort',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    keywords: ['pain', 'arthritis', 'fibromyalgia', 'neuropathy', 'chronic pain', 'headache', 'migraine', 'back pain', 'joint', 'muscle'],
  },
  'sleep': {
    icon: '😴',
    name: 'Sleep Disorders',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    keywords: ['sleep', 'insomnia', 'circadian', 'rest', 'fatigue'],
  },
  'neurological': {
    icon: '⚡',
    name: 'Neurological',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    keywords: ['epilepsy', 'seizure', 'parkinson', 'multiple sclerosis', 'ms', 'alzheimer', 'dementia', 'neuroprotect', 'brain', 'neurological', 'tremor'],
  },
  'inflammation': {
    icon: '🔥',
    name: 'Inflammation & Autoimmune',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    keywords: ['inflammation', 'autoimmune', 'lupus', 'rheumatoid', 'crohn', 'colitis', 'ibd'],
  },
  'skin': {
    icon: '✨',
    name: 'Skin Conditions',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    keywords: ['acne', 'eczema', 'psoriasis', 'dermatitis', 'skin', 'rash', 'itching'],
  },
  'digestive': {
    icon: '🍃',
    name: 'Digestive Health',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    keywords: ['ibs', 'digestive', 'gut', 'nausea', 'appetite', 'stomach', 'bowel', 'gastrointestinal'],
  },
  'cardiovascular': {
    icon: '❤️',
    name: 'Cardiovascular',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    keywords: ['heart', 'blood pressure', 'cardiovascular', 'hypertension', 'cholesterol', 'circulation'],
  },
  'cancer': {
    icon: '🎗️',
    name: 'Cancer & Oncology',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    keywords: ['cancer', 'tumor', 'oncology', 'chemotherapy', 'palliative', 'nausea'],
  },
  'metabolic': {
    icon: '⚖️',
    name: 'Metabolic & Hormonal',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    keywords: ['diabetes', 'obesity', 'weight', 'metabolic', 'thyroid', 'hormone', 'insulin'],
  },
  'respiratory': {
    icon: '🌬️',
    name: 'Respiratory',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    keywords: ['asthma', 'copd', 'respiratory', 'lung', 'breathing'],
  },
  'addiction': {
    icon: '🔗',
    name: 'Addiction & Withdrawal',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    keywords: ['addiction', 'withdrawal', 'substance', 'opioid', 'alcohol', 'smoking', 'cannabis use disorder'],
  },
  'other': {
    icon: '🏥',
    name: 'Other Conditions',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    keywords: [],
  },
};

// Evidence level configuration
const EVIDENCE_LEVELS: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dots: number;
}> = {
  'strong': {
    label: 'Strong Evidence',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    dots: 5,
  },
  'moderate': {
    label: 'Moderate Evidence',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    dots: 3,
  },
  'limited': {
    label: 'Limited Evidence',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    dots: 2,
  },
  'insufficient': {
    label: 'Emerging Research',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    dots: 1,
  },
};

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time: number | null;
  updated_at: string;
  condition_slug?: string | null;
  research_count?: number | null;
  evidence_level?: string | null;
}

interface ConditionArticlesHubProps {
  articles: Article[];
  totalStudies: number;
  conditionsCount: number;
}

// Categorize article by body system based on title keywords
function categorizeArticle(article: Article): string {
  const titleLower = article.title.toLowerCase();

  for (const [systemId, config] of Object.entries(BODY_SYSTEM_CONFIG)) {
    if (systemId === 'other') continue;
    if (config.keywords.some(kw => titleLower.includes(kw))) {
      return systemId;
    }
  }

  return 'other';
}

// Evidence dots display component
function EvidenceDots({ level }: { level: string }) {
  const config = EVIDENCE_LEVELS[level] || EVIDENCE_LEVELS.insufficient;
  return (
    <div className="flex items-center gap-0.5" title={config.label}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= config.dots ? 'bg-current' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export function ConditionArticlesHub({ articles, totalStudies, conditionsCount }: ConditionArticlesHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  // Categorize all articles
  const categorizedArticles = useMemo(() => {
    return articles.map(article => ({
      ...article,
      bodySystem: categorizeArticle(article),
    }));
  }, [articles]);

  // Calculate stats
  const totalArticles = articles.length;
  const bodySystems = Object.keys(BODY_SYSTEM_CONFIG).filter(s => s !== 'other');

  // System counts
  const systemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categorizedArticles.forEach(article => {
      counts[article.bodySystem] = (counts[article.bodySystem] || 0) + 1;
    });
    return counts;
  }, [categorizedArticles]);

  // Evidence level counts
  const evidenceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(article => {
      const level = article.evidence_level || 'insufficient';
      counts[level] = (counts[level] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = categorizedArticles;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt?.toLowerCase().includes(query)
      );
    }

    if (selectedSystem) {
      result = result.filter(a => a.bodySystem === selectedSystem);
    }

    if (selectedEvidence) {
      result = result.filter(a => (a.evidence_level || 'insufficient') === selectedEvidence);
    }

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [categorizedArticles, searchQuery, selectedSystem, selectedEvidence]);

  // Group by body system
  const groupedBySystem = useMemo(() => {
    const groups: Record<string, typeof filteredArticles> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.bodySystem]) groups[article.bodySystem] = [];
      groups[article.bodySystem].push(article);
    });
    return groups;
  }, [filteredArticles]);

  // Featured articles (strong evidence, most research)
  const featuredArticles = useMemo(() => {
    return [...articles]
      .filter(a => a.evidence_level === 'strong' || (a.research_count && a.research_count > 20))
      .sort((a, b) => (b.research_count || 0) - (a.research_count || 0))
      .slice(0, 6);
  }, [articles]);

  // Active systems (with articles)
  const activeSystems = Object.keys(systemCounts).filter(s => systemCounts[s] > 0);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🏥"
        title="CBD & Health Conditions"
        subtitle="Evidence-Based Articles on CBD for Medical Conditions"
        description={`Explore ${totalArticles.toLocaleString('de-DE')} in-depth articles examining how CBD may help with various health conditions. Each article is backed by research from our database of ${totalStudies.toLocaleString('de-DE')}+ peer-reviewed studies.`}
        badgeText="Condition Research Library"
        badgeColor="bg-green-100 text-green-700"
        gradientFrom="from-green-50"
        gradientTo="to-emerald-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: totalArticles.toLocaleString('de-DE'), label: 'Condition Articles', color: 'text-green-600' },
          { value: conditionsCount.toLocaleString('de-DE'), label: 'Conditions Covered', color: 'text-blue-600' },
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
              placeholder="Search condition articles..."
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
              All Systems ({totalArticles})
            </button>
            {bodySystems.map(system => {
              const config = BODY_SYSTEM_CONFIG[system];
              const count = systemCounts[system] || 0;
              if (count === 0) return null;
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
            {Object.entries(EVIDENCE_LEVELS).map(([level, config]) => {
              const count = evidenceCounts[level] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={level}
                  onClick={() => setSelectedEvidence(selectedEvidence === level ? null : level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    selectedEvidence === level
                      ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <EvidenceDots level={level} />
                  <span>{config.label}</span>
                  <span className="text-xs opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || selectedSystem || selectedEvidence) && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            Showing {filteredArticles.length.toLocaleString('de-DE')} of {totalArticles.toLocaleString('de-DE')} articles
            {selectedSystem && ` in ${BODY_SYSTEM_CONFIG[selectedSystem]?.name}`}
            {selectedEvidence && ` with ${EVIDENCE_LEVELS[selectedEvidence]?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </section>

      {/* Featured Articles (when no filters) */}
      {!searchQuery && !selectedSystem && !selectedEvidence && featuredArticles.length > 0 && (
        <HubSection
          title="Strongest Evidence"
          description="Conditions with the most robust research support"
          icon="⭐"
        >
          <HubArticleGrid columns={3}>
            {featuredArticles.map(article => (
              <ArticleCard key={article.slug} article={article} showEvidence />
            ))}
          </HubArticleGrid>
        </HubSection>
      )}

      {/* Body Systems Overview (when no filter) */}
      {!searchQuery && !selectedSystem && !selectedEvidence && (
        <HubSection
          title="Browse by Body System"
          description="Explore condition articles organized by body system"
          icon="🔬"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodySystems.map(system => {
              const config = BODY_SYSTEM_CONFIG[system];
              const count = systemCounts[system] || 0;
              if (count === 0) return null;
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
                      <span className="text-sm text-gray-600">{count} articles</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </HubSection>
      )}

      {/* Articles Display */}
      {filteredArticles.length > 0 ? (
        selectedSystem || searchQuery || selectedEvidence ? (
          /* Filtered view - flat list */
          <HubSection
            title={selectedSystem ? BODY_SYSTEM_CONFIG[selectedSystem]?.name : 'Search Results'}
            icon={selectedSystem ? BODY_SYSTEM_CONFIG[selectedSystem]?.icon : '🔍'}
            headerRight={
              <span className="text-sm text-gray-500">
                {filteredArticles.length.toLocaleString('de-DE')} articles
              </span>
            }
          >
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <ArticleCard key={article.slug} article={article} showEvidence showSystem={!selectedSystem} />
              ))}
            </HubArticleGrid>
          </HubSection>
        ) : (
          /* Default view - grouped by body system */
          <div className="space-y-10">
            {Object.entries(groupedBySystem)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([system, systemArticles]) => {
                const config = BODY_SYSTEM_CONFIG[system];
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
                        View all {systemArticles.length} →
                      </button>
                    }
                  >
                    <HubArticleGrid columns={3}>
                      {systemArticles.slice(0, 6).map(article => (
                        <ArticleCard key={article.slug} article={article} showEvidence />
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
          title="No Articles Found"
          description="Try adjusting your search or filter criteria"
          actionLabel="Clear all filters"
          onAction={() => { setSearchQuery(''); setSelectedSystem(null); setSelectedEvidence(null); }}
        />
      )}

      {/* Link to Conditions Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Looking for Condition Overview Pages?</h3>
            <p className="text-gray-600">
              Each condition has a dedicated overview page with research summaries, related studies,
              and links to in-depth articles. Browse all {conditionsCount} conditions we cover.
            </p>
          </div>
          <Link
            href="/conditions"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Browse All Conditions
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

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

// Article Card Component
function ArticleCard({
  article,
  showEvidence = false,
  showSystem = false
}: {
  article: Article & { bodySystem?: string };
  showEvidence?: boolean;
  showSystem?: boolean;
}) {
  const systemConfig = BODY_SYSTEM_CONFIG[article.bodySystem || 'other'];
  const evidenceConfig = EVIDENCE_LEVELS[article.evidence_level || 'insufficient'];

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-lg transition-all group h-full"
    >
      <div className="flex-1">
        {/* Badges row */}
        {(showEvidence || showSystem) && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {showSystem && article.bodySystem && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${systemConfig.bgColor} ${systemConfig.color} text-xs font-medium rounded`}>
                {systemConfig.icon} {systemConfig.name}
              </span>
            )}
            {showEvidence && article.evidence_level && (
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${evidenceConfig.bgColor} ${evidenceConfig.color} text-xs font-medium rounded`}>
                <EvidenceDots level={article.evidence_level} />
                {evidenceConfig.label}
              </span>
            )}
          </div>
        )}

        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
        {article.reading_time && <span>{article.reading_time} min read</span>}
        {article.research_count && article.research_count > 0 && (
          <>
            <span>•</span>
            <span className="text-green-600">{article.research_count} studies</span>
          </>
        )}
        <span className="ml-auto">
          {new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}
