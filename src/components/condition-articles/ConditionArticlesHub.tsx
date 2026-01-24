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

// Body system/subcategory configuration based on master plan
const CONDITION_SUBCATEGORIES: Record<string, {
  icon: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  plannedCount: number;
  keywords: string[];
}> = {
  'mental-health': {
    icon: '🧠',
    name: 'Mental Health',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    plannedCount: 80,
    keywords: ['anxiety', 'depression', 'ptsd', 'stress', 'mood', 'bipolar', 'ocd', 'panic', 'phobia', 'mental', 'psychiatric', 'schizophrenia', 'psychosis', 'adhd', 'add', 'autism', 'focus', 'concentration', 'burnout', 'calm', 'relaxation', 'nervousness', 'irritability', 'anger', 'social anxiety', 'generalized anxiety', 'overthinking', 'worry', 'fear'],
  },
  'sleep': {
    icon: '😴',
    name: 'Sleep',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    plannedCount: 15,
    keywords: ['sleep', 'insomnia', 'circadian', 'rest', 'jet lag', 'night terror', 'nightmare', 'rem', 'snoring', 'apnea'],
  },
  'pain': {
    icon: '💪',
    name: 'Pain',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    plannedCount: 35,
    keywords: ['pain', 'chronic pain', 'back pain', 'neck pain', 'joint pain', 'muscle pain', 'nerve pain', 'neuropathic', 'headache', 'migraine', 'sciatica', 'cramp', 'tmj', 'toothache', 'dental', 'surgery', 'plantar', 'carpal', 'tennis elbow', 'doms', 'soreness'],
  },
  'inflammation': {
    icon: '🔥',
    name: 'Inflammation & Autoimmune',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    plannedCount: 25,
    keywords: ['inflammation', 'autoimmune', 'arthritis', 'rheumatoid', 'osteoarthritis', 'gout', 'lupus', 'crohn', 'colitis', 'ibd', 'ibs', 'celiac', 'hashimoto', 'graves', 'bursitis', 'tendonitis', 'immune'],
  },
  'neurological': {
    icon: '⚡',
    name: 'Neurological',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    plannedCount: 25,
    keywords: ['epilepsy', 'seizure', 'dravet', 'lennox', 'parkinson', 'alzheimer', 'dementia', 'als', 'huntington', 'tremor', 'neuropathy', 'tourette', 'tic', 'brain', 'neuroprotect', 'memory', 'cognitive', 'concussion', 'trigeminal'],
  },
  'skin': {
    icon: '✨',
    name: 'Skin',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    plannedCount: 22,
    keywords: ['skin', 'acne', 'eczema', 'psoriasis', 'dermatitis', 'rosacea', 'dry skin', 'oily skin', 'aging', 'wrinkle', 'wound', 'burn', 'sunburn', 'itch', 'hives', 'vitiligo'],
  },
  'hair-scalp': {
    icon: '💇',
    name: 'Hair & Scalp',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    plannedCount: 8,
    keywords: ['hair', 'alopecia', 'scalp', 'dandruff', 'hair loss', 'hair growth'],
  },
  'digestive': {
    icon: '🍃',
    name: 'Digestive Health',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    plannedCount: 18,
    keywords: ['digestive', 'nausea', 'vomiting', 'appetite', 'bloating', 'gas', 'gerd', 'acid reflux', 'heartburn', 'stomach', 'gut', 'constipation', 'diarrhea', 'gastritis'],
  },
  'cardiovascular': {
    icon: '❤️',
    name: 'Cardiovascular',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    plannedCount: 12,
    keywords: ['heart', 'blood pressure', 'cardiovascular', 'hypertension', 'circulation', 'cholesterol', 'palpitation', 'arrhythmia', 'varicose', 'stroke'],
  },
  'respiratory': {
    icon: '🌬️',
    name: 'Respiratory',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    plannedCount: 10,
    keywords: ['respiratory', 'asthma', 'copd', 'bronchitis', 'sinusitis', 'allergy', 'hay fever', 'breath', 'cough', 'lung'],
  },
  'womens-health': {
    icon: '♀️',
    name: "Women's Health",
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    plannedCount: 18,
    keywords: ['women', 'menopause', 'perimenopause', 'pms', 'pmdd', 'pcos', 'endometriosis', 'hormonal', 'hot flash', 'night sweat', 'fertility', 'pregnancy', 'breastfeeding', 'postpartum', 'pelvic'],
  },
  'mens-health': {
    icon: '♂️',
    name: "Men's Health",
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    plannedCount: 12,
    keywords: ['men', 'erectile', 'testosterone', 'prostate', 'bph', 'libido', 'male', 'performance anxiety'],
  },
  'sexual-health': {
    icon: '💕',
    name: 'Sexual Health',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    plannedCount: 8,
    keywords: ['sexual', 'libido', 'sex', 'intimacy', 'arousal', 'orgasm', 'lubricant'],
  },
  'eye-ear': {
    icon: '👁️',
    name: 'Eye & Ear',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    plannedCount: 12,
    keywords: ['eye', 'glaucoma', 'vision', 'tinnitus', 'hearing', 'vertigo', 'dry eye', 'macular', 'cataracts'],
  },
  'oral-health': {
    icon: '🦷',
    name: 'Oral Health',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    plannedCount: 8,
    keywords: ['oral', 'gum', 'gingivitis', 'periodontitis', 'bruxism', 'breath', 'mouth ulcer'],
  },
  'bone-joint': {
    icon: '🦴',
    name: 'Bone & Joint',
    color: 'text-stone-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    plannedCount: 8,
    keywords: ['bone', 'osteoporosis', 'osteopenia', 'density', 'fracture', 'disc', 'degenerative'],
  },
  'cancer': {
    icon: '🎗️',
    name: 'Cancer Support',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    plannedCount: 10,
    keywords: ['cancer', 'chemotherapy', 'radiation', 'oncology', 'tumor', 'palliative', 'terminal', 'cachexia', 'end-of-life'],
  },
  'addiction': {
    icon: '🔗',
    name: 'Addiction & Substance',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    plannedCount: 10,
    keywords: ['addiction', 'withdrawal', 'alcohol', 'opioid', 'smoking', 'nicotine', 'drug', 'substance', 'cannabis use disorder'],
  },
  'metabolic': {
    icon: '⚖️',
    name: 'Metabolic & Diabetes',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    plannedCount: 10,
    keywords: ['diabetes', 'blood sugar', 'insulin', 'metabolic', 'weight', 'obesity', 'metabolism'],
  },
  'aging': {
    icon: '🧓',
    name: 'Aging & Longevity',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    plannedCount: 8,
    keywords: ['aging', 'longevity', 'cognitive decline', 'frailty', 'sarcopenia', 'anti-aging', 'cellular'],
  },
  'sports': {
    icon: '🏃',
    name: 'Sports & Recovery',
    color: 'text-lime-700',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    plannedCount: 25,
    keywords: ['sport', 'recovery', 'exercise', 'athletic', 'endurance', 'workout', 'injury', 'sprain', 'strain', 'runner', 'shin splint', 'muscle tension', 'joint health', 'mobility', 'cyclist', 'weightlift', 'yoga', 'gym', 'training', 'performance'],
  },
  'children': {
    icon: '👶',
    name: 'Children & Pediatric',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    plannedCount: 8,
    keywords: ['children', 'pediatric', 'child', 'kid'],
  },
  'pets': {
    icon: '🐾',
    name: 'Pets & Animals',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    plannedCount: 40,
    keywords: ['dog', 'cat', 'pet', 'horse', 'equine', 'bird', 'parrot', 'ferret', 'rabbit', 'guinea pig', 'hamster', 'feline', 'canine', 'animal', 'feather pluck', 'cushing'],
  },
  'lifestyle': {
    icon: '👥',
    name: 'Lifestyle & Demographics',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    plannedCount: 50,
    keywords: ['beginner', 'first-time', 'first time', 'over 50', 'over 60', 'senior', 'artist', 'musician', 'creative', 'nurse', 'healthcare worker', 'construction', 'shift worker', 'travel', 'flying', 'frequent flyer', 'vegan', 'keto', 'fasting', 'intermittent', 'new mother', 'caregiver', 'student', 'professional', 'sensitive people', 'hsp'],
  },
  'other': {
    icon: '🏥',
    name: 'Other Topics',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    plannedCount: 30,
    keywords: ['fatigue', 'fibromyalgia', 'lyme', 'long covid', 'thyroid', 'hypothyroid', 'hyperthyroid', 'sickle cell', 'energy', 'hangover', 'sauna', 'coffee', 'caffeine', 'dopamine', 'nervous system', 'liver', 'hormone', 'acupuncture', 'multiple sclerosis', 'ms', 'covid', 'neurological'],
  },
};

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string;
}

interface ConditionArticlesHubProps {
  articles: Article[];
  totalStudies: number;
  conditionsCount: number;
  plannedArticleCount: number;
}

// Categorize article by subcategory based on title keywords
function categorizeArticle(article: Article): string {
  const titleLower = article.title.toLowerCase();

  for (const [catId, config] of Object.entries(CONDITION_SUBCATEGORIES)) {
    if (catId === 'other') continue;
    if (config.keywords.some(kw => titleLower.includes(kw))) {
      return catId;
    }
  }

  return 'other';
}

export function ConditionArticlesHub({
  articles,
  totalStudies,
  conditionsCount,
  plannedArticleCount
}: ConditionArticlesHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorize all articles
  const categorizedArticles = useMemo(() => {
    return articles.map(article => ({
      ...article,
      subcategory: categorizeArticle(article),
    }));
  }, [articles]);

  // Calculate stats
  const totalArticles = articles.length;
  const progressPercent = Math.round((totalArticles / plannedArticleCount) * 100);

  // Category counts (actual articles)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categorizedArticles.forEach(article => {
      counts[article.subcategory] = (counts[article.subcategory] || 0) + 1;
    });
    return counts;
  }, [categorizedArticles]);

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

    if (selectedCategory) {
      result = result.filter(a => a.subcategory === selectedCategory);
    }

    return result.sort((a, b) => a.title.localeCompare(b.title));
  }, [categorizedArticles, searchQuery, selectedCategory]);

  // Group by subcategory
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof filteredArticles> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.subcategory]) groups[article.subcategory] = [];
      groups[article.subcategory].push(article);
    });
    return groups;
  }, [filteredArticles]);

  // Active categories (with articles)
  const activeCategories = Object.keys(categoryCounts).filter(c => categoryCounts[c] > 0);

  // All categories sorted by planned count
  const allCategories = Object.entries(CONDITION_SUBCATEGORIES)
    .sort((a, b) => b[1].plannedCount - a[1].plannedCount)
    .map(([id]) => id);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <HubHero
        icon="🏥"
        title="CBD & Health Conditions"
        subtitle="Evidence-Based Articles on CBD for Medical Conditions"
        description={`Explore our growing library of condition articles examining how CBD may help with various health conditions. Each article is research-backed with citations from our database of ${totalStudies.toLocaleString('de-DE')}+ peer-reviewed studies.`}
        badgeText="Condition Research Library"
        badgeColor="bg-green-100 text-green-700"
        gradientFrom="from-green-50"
        gradientTo="to-emerald-50"
      />

      {/* Quick Stats */}
      <HubQuickStats
        stats={[
          { value: totalArticles.toLocaleString('de-DE'), label: 'Articles Published', color: 'text-green-600' },
          { value: plannedArticleCount.toLocaleString('de-DE'), label: 'Articles Planned', color: 'text-blue-600' },
          { value: totalStudies.toLocaleString('de-DE') + '+', label: 'Research Studies', color: 'text-purple-600' },
          { value: conditionsCount.toLocaleString('de-DE'), label: 'Conditions Covered', color: 'text-amber-600' },
        ]}
      />

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Content Production Progress</h3>
          <span className="text-sm text-gray-600">{progressPercent}% complete</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {totalArticles} of {plannedArticleCount} condition articles published.
          New articles are added regularly based on research availability.
        </p>
      </div>

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
          {(selectedCategory || searchQuery) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div>
          <p className="text-sm text-gray-600 mb-2 font-medium">Filter by health area:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedCategory
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Areas ({totalArticles})
            </button>
            {activeCategories.map(catId => {
              const config = CONDITION_SUBCATEGORIES[catId];
              const count = categoryCounts[catId] || 0;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(selectedCategory === catId ? null : catId)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                    selectedCategory === catId
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

        {/* Results Count */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            Showing {filteredArticles.length.toLocaleString('de-DE')} of {totalArticles.toLocaleString('de-DE')} articles
            {selectedCategory && ` in ${CONDITION_SUBCATEGORIES[selectedCategory]?.name}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </section>

      {/* Category Overview (when no filter) */}
      {!searchQuery && !selectedCategory && (
        <HubSection
          title="Browse by Health Area"
          description={`${plannedArticleCount} articles planned across ${Object.keys(CONDITION_SUBCATEGORIES).length} health areas`}
          icon="🔬"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allCategories.map(catId => {
              const config = CONDITION_SUBCATEGORIES[catId];
              const count = categoryCounts[catId] || 0;
              const hasArticles = count > 0;

              return (
                <button
                  key={catId}
                  onClick={() => hasArticles && setSelectedCategory(catId)}
                  disabled={!hasArticles}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    hasArticles
                      ? `${config.bgColor} ${config.borderColor} hover:shadow-md hover:border-current cursor-pointer`
                      : 'bg-gray-50 border-gray-200 opacity-60 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className={`font-semibold ${hasArticles ? config.color : 'text-gray-500'}`}>
                      {config.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={hasArticles ? 'text-gray-600' : 'text-gray-400'}>
                      {count} / {config.plannedCount} articles
                    </span>
                    {!hasArticles && (
                      <span className="text-amber-600 font-medium">Coming Soon</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </HubSection>
      )}

      {/* Articles Display */}
      {filteredArticles.length > 0 ? (
        selectedCategory || searchQuery ? (
          /* Filtered view - flat list */
          <HubSection
            title={selectedCategory ? CONDITION_SUBCATEGORIES[selectedCategory]?.name : 'Search Results'}
            icon={selectedCategory ? CONDITION_SUBCATEGORIES[selectedCategory]?.icon : '🔍'}
            headerRight={
              <span className="text-sm text-gray-500">
                {filteredArticles.length.toLocaleString('de-DE')} articles
              </span>
            }
          >
            <HubArticleGrid columns={3}>
              {filteredArticles.map(article => (
                <ArticleCard key={article.slug} article={article} showCategory={!selectedCategory} />
              ))}
            </HubArticleGrid>
          </HubSection>
        ) : (
          /* Default view - grouped by category */
          <div className="space-y-10">
            {Object.entries(groupedByCategory)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([catId, catArticles]) => {
                const config = CONDITION_SUBCATEGORIES[catId] || CONDITION_SUBCATEGORIES.other;
                return (
                  <HubSection
                    key={catId}
                    title={config.name}
                    icon={config.icon}
                    headerRight={
                      <button
                        onClick={() => setSelectedCategory(catId)}
                        className={`text-sm ${config.color} hover:underline font-medium`}
                      >
                        View all {catArticles.length} →
                      </button>
                    }
                  >
                    <HubArticleGrid columns={3}>
                      {catArticles.slice(0, 6).map(article => (
                        <ArticleCard key={article.slug} article={article} />
                      ))}
                    </HubArticleGrid>
                  </HubSection>
                );
              })}
          </div>
        )
      ) : searchQuery || selectedCategory ? (
        <HubEmptyState
          icon="🔍"
          title="No Articles Found"
          description="Try adjusting your search or filter criteria"
          actionLabel="Clear all filters"
          onAction={() => { setSearchQuery(''); setSelectedCategory(null); }}
        />
      ) : (
        <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-5xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-amber-800 mb-2">Content Production In Progress</h3>
          <p className="text-amber-700 max-w-xl mx-auto mb-6">
            We&apos;re building our comprehensive library of {plannedArticleCount} evidence-based condition articles.
            Each article requires analyzing research studies before writing.
          </p>
          <Link
            href="/conditions"
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            Browse Condition Overview Pages
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Link to Conditions Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Looking for Condition Overview Pages?</h3>
            <p className="text-gray-600">
              Each condition has a dedicated overview page with research summaries and related studies.
              Browse all {conditionsCount} conditions we cover, including those still awaiting detailed articles.
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
  showCategory = false
}: {
  article: Article & { subcategory?: string };
  showCategory?: boolean;
}) {
  const categoryConfig = CONDITION_SUBCATEGORIES[article.subcategory || 'other'] || CONDITION_SUBCATEGORIES.other;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-lg transition-all group h-full"
    >
      <div className="flex-1">
        {/* Category badge */}
        {showCategory && article.subcategory && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${categoryConfig.bgColor} ${categoryConfig.color} text-xs font-medium rounded mb-3`}>
            {categoryConfig.icon} {categoryConfig.name}
          </span>
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

      {/* Footer with stats */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
        {article.reading_time && <span>{article.reading_time} min read</span>}
        {article.updated_at && (
          <>
            {article.reading_time && <span>•</span>}
            <span>
              {new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
