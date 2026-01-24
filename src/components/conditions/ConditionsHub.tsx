'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Category configuration - matches database category values
const CATEGORY_CONFIG: Record<string, {
  icon: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
}> = {
  'mental_health': {
    icon: '🧠',
    name: 'Mental Health',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-indigo-500',
    description: 'Anxiety, depression, PTSD, stress, and mood disorders',
  },
  'pain': {
    icon: '💪',
    name: 'Pain & Discomfort',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-orange-500',
    description: 'Chronic pain, arthritis, fibromyalgia, and neuropathy',
  },
  'neurological': {
    icon: '⚡',
    name: 'Neurological',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-500',
    description: 'Epilepsy, Parkinson\'s, MS, and brain health',
  },
  'skin': {
    icon: '✨',
    name: 'Skin Conditions',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-500',
    description: 'Acne, eczema, psoriasis, and dermatitis',
  },
  'gastrointestinal': {
    icon: '🍃',
    name: 'Digestive Health',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    description: 'IBS, Crohn\'s, nausea, and gut health',
  },
  'cardiovascular': {
    icon: '❤️',
    name: 'Cardiovascular',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-red-500',
    description: 'Heart health, blood pressure, and circulation',
  },
  'cancer': {
    icon: '🎗️',
    name: 'Cancer & Oncology',
    color: 'text-fuchsia-700',
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-200',
    gradientFrom: 'from-fuchsia-500',
    gradientTo: 'to-pink-500',
    description: 'Cancer research and chemotherapy support',
  },
  'metabolic': {
    icon: '⚖️',
    name: 'Metabolic Health',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    description: 'Diabetes, obesity, and metabolic conditions',
  },
  'other': {
    icon: '🏥',
    name: 'Other Conditions',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    gradientFrom: 'from-slate-500',
    gradientTo: 'to-gray-500',
    description: 'Additional health conditions and wellness topics',
  },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface Condition {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  short_description: string;
  category: string;
  research_count: number;
  is_featured: boolean;
}

interface ConditionsHubProps {
  conditions: Condition[];
  totalStudies: number;
}

export function ConditionsHub({ conditions, totalStudies }: ConditionsHubProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFromUrl = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state with URL parameter changes
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  // Update URL when category changes
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      router.push(`/conditions?category=${category}`, { scroll: false });
    } else {
      router.push('/conditions', { scroll: false });
    }
  };

  // Calculate stats
  const totalConditions = conditions.length;
  const categories = Object.keys(CATEGORY_CONFIG);

  // Get featured conditions (top researched)
  const featuredConditions = useMemo(() => {
    return [...conditions]
      .filter(c => c.is_featured || c.research_count > 20)
      .sort((a, b) => (b.research_count || 0) - (a.research_count || 0))
      .slice(0, 6);
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

    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }

    return result.sort((a, b) =>
      (a.display_name || a.name).localeCompare(b.display_name || b.name)
    );
  }, [conditions, searchQuery, selectedCategory]);

  // Group by first letter for A-Z view
  const groupedByLetter = useMemo(() => {
    const groups: Record<string, Condition[]> = {};
    filteredConditions.forEach(c => {
      const letter = (c.display_name || c.name).charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return groups;
  }, [filteredConditions]);

  // Get available letters
  const availableLetters = Object.keys(groupedByLetter).sort();

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Condition[]> = {};
    filteredConditions.forEach(c => {
      const cat = c.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [filteredConditions]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    conditions.forEach(c => {
      const cat = c.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [conditions]);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero Section - Modern gradient design */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-8 md:p-12 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Research-Backed Information
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                CBD & Health Conditions
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                Explore evidence-based research on how CBD may help with {totalConditions} health conditions.
                Each topic includes scientific studies, dosage guidance, and expert insights.
              </p>
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/20">
                <p className="text-3xl md:text-4xl font-bold">{totalConditions}</p>
                <p className="text-sm text-white/70">Conditions</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-center border border-white/20">
                <p className="text-3xl md:text-4xl font-bold">{totalStudies.toLocaleString()}+</p>
                <p className="text-sm text-white/70">Studies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search conditions (e.g., anxiety, pain, sleep)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 md:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base md:text-lg bg-gray-50 focus:bg-white transition-colors"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              A-Z
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Conditions
          </button>
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const count = categoryCounts[cat] || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(selectedCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ${config.borderColor}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{config.icon}</span>
                <span className="hidden sm:inline">{config.name}</span>
                <span className="text-xs opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredConditions.length}</span> of {totalConditions} conditions
              {selectedCategory && <> in <span className="font-medium">{CATEGORY_CONFIG[selectedCategory]?.name}</span></>}
              {searchQuery && <> matching &quot;<span className="font-medium">{searchQuery}</span>&quot;</>}
            </span>
            <button
              onClick={() => { setSearchQuery(''); handleCategoryChange(null); }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* A-Z Quick Navigation (for list view) */}
      {viewMode === 'list' && (
        <section className="sticky top-20 z-10 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200 p-3 shadow-lg">
          <div className="flex flex-wrap justify-center gap-1">
            {ALPHABET.map(letter => {
              const hasConditions = availableLetters.includes(letter);
              return (
                <a
                  key={letter}
                  href={hasConditions ? `#letter-${letter}` : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    hasConditions
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-110'
                      : 'bg-gray-50 text-gray-300 cursor-default'
                  }`}
                >
                  {letter}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Conditions - Enhanced design */}
      {!searchQuery && !selectedCategory && featuredConditions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Most Researched</h2>
              <p className="text-gray-500 text-sm">Conditions with the strongest scientific evidence</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredConditions.map((condition, index) => {
              const config = CATEGORY_CONFIG[condition.category] || CATEGORY_CONFIG.other;
              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.slug}`}
                  className="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`} />

                  <div className="flex items-start gap-4">
                    <div className={`text-2xl p-3 rounded-xl ${config.bgColor} group-hover:scale-110 transition-transform`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                        {condition.display_name || condition.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {condition.short_description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          {condition.research_count} studies
                        </span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Body Systems Overview (when no filter) */}
      {!searchQuery && !selectedCategory && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Browse by Body System</h2>
              <p className="text-gray-500 text-sm">Find conditions organized by affected area</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat];
              const count = categoryCounts[cat] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg group ${config.bgColor} ${config.borderColor} hover:border-current`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{config.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${config.color}`}>{config.name}</h3>
                      <p className="text-sm text-gray-600">{count} conditions</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-current group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">{config.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Conditions Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <section>
          {selectedCategory ? (
            /* Single category view */
            <div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <span className="text-4xl">{CATEGORY_CONFIG[selectedCategory]?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {CATEGORY_CONFIG[selectedCategory]?.name}
                  </h2>
                  <p className="text-gray-500">{filteredConditions.length} conditions • {CATEGORY_CONFIG[selectedCategory]?.description}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredConditions.map(condition => (
                  <ConditionCard key={condition.id} condition={condition} />
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            /* Search results */
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Search Results
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredConditions.map(condition => (
                  <ConditionCard key={condition.id} condition={condition} showCategory />
                ))}
              </div>
            </div>
          ) : (
            /* All conditions by category */
            <div className="space-y-10">
              {Object.entries(groupedByCategory)
                .sort((a, b) => b[1].length - a[1].length)
                .map(([cat, catConditions]) => {
                  const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                  return (
                    <div key={cat} id={`category-${cat}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{config.icon}</span>
                        <h2 className="text-xl font-bold text-gray-900">{config.name}</h2>
                        <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{catConditions.length}</span>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catConditions.map(condition => (
                          <ConditionCard key={condition.id} condition={condition} />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      ) : (
        /* A-Z List View */
        <section className="space-y-8">
          {availableLetters.map(letter => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
              <h2 className="text-3xl font-bold text-green-600 mb-4 pb-2 border-b-2 border-green-100">
                {letter}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupedByLetter[letter].map(condition => (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-200"
                  >
                    <span className="text-xl shrink-0">
                      {CATEGORY_CONFIG[condition.category]?.icon || '🏥'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {condition.display_name || condition.name}
                      </span>
                      {condition.research_count > 0 && (
                        <span className="ml-2 text-xs text-gray-400">
                          {condition.research_count} studies
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* No Results */}
      {filteredConditions.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No conditions found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn&apos;t find any conditions matching your search. Try different keywords or browse by category.
          </p>
          <button
            onClick={() => { setSearchQuery(''); handleCategoryChange(null); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset filters
          </button>
        </div>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 text-white">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }} />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Dive Deeper into the Research</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Access our comprehensive database of {totalStudies.toLocaleString()}+ peer-reviewed studies,
            each quality-scored and summarized in plain language.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Browse Research
            </Link>
            <Link
              href="/tools/dosage-calculator"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculate Dosage
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
        <div className="flex gap-4">
          <div className="shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-amber-800 mb-1">Medical Disclaimer</p>
            <p className="text-sm text-amber-700">
              The information provided is for educational purposes only and is not intended as medical advice.
              CBD research is ongoing, and individual results may vary. Always consult with a healthcare professional
              before starting any new supplement, especially if you have a medical condition or take medications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Condition Card Component - Enhanced design
function ConditionCard({ condition, showCategory = false }: { condition: Condition; showCategory?: boolean }) {
  const config = CATEGORY_CONFIG[condition.category] || CATEGORY_CONFIG.other;

  return (
    <Link
      href={`/conditions/${condition.slug}`}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
    >
      <div className={`text-xl p-2.5 rounded-xl ${config.bgColor} group-hover:scale-110 transition-transform shrink-0`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors truncate">
          {condition.display_name || condition.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {condition.research_count > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {condition.research_count} studies
            </span>
          )}
          {showCategory && (
            <>
              <span className="text-gray-300">•</span>
              <span>{config.name}</span>
            </>
          )}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
