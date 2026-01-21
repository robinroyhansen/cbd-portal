'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Category configuration
const CATEGORY_CONFIG: Record<string, {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate stats
  const totalConditions = conditions.length;
  const totalResearch = conditions.reduce((sum, c) => sum + (c.research_count || 0), 0);
  const categories = Object.keys(CATEGORY_CONFIG);

  // Get featured conditions (top researched)
  const featuredConditions = useMemo(() => {
    return [...conditions]
      .filter(c => c.is_featured || c.research_count > 20)
      .sort((a, b) => (b.research_count || 0) - (a.research_count || 0))
      .slice(0, 9);
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
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
          <span>🏥</span>
          Health Conditions Encyclopedia
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          CBD & Health Conditions
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore research-backed information on how CBD may help with {totalConditions.toLocaleString('de-DE')} health conditions.
          Each condition page includes scientific evidence, dosage guidance, and related studies.
        </p>
      </section>

      {/* Trust Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{totalConditions.toLocaleString('de-DE')}</p>
          <p className="text-sm text-gray-600">Health Conditions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalStudies.toLocaleString('de-DE')}+</p>
          <p className="text-sm text-gray-600">Research Studies</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{Object.keys(categoryCounts).length}</p>
          <p className="text-sm text-gray-600">Body Systems</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">7</p>
          <p className="text-sm text-gray-600">Research Sources</p>
        </div>
      </section>

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

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              A-Z List
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !selectedCategory
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({totalConditions})
          </button>
          {categories.map(cat => {
            const config = CATEGORY_CONFIG[cat];
            const count = categoryCounts[cat] || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                  selectedCategory === cat
                    ? `${config.bgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{config.icon}</span>
                {config.name}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredConditions.length} of {totalConditions} conditions
            {selectedCategory && ` in ${CATEGORY_CONFIG[selectedCategory]?.name}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </section>

      {/* A-Z Quick Navigation (for list view) */}
      {viewMode === 'list' && (
        <section className="sticky top-20 z-10 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex flex-wrap justify-center gap-1">
            {ALPHABET.map(letter => {
              const hasConditions = availableLetters.includes(letter);
              return (
                <a
                  key={letter}
                  href={hasConditions ? `#letter-${letter}` : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition ${
                    hasConditions
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
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

      {/* Featured Conditions */}
      {!searchQuery && !selectedCategory && featuredConditions.length > 0 && (
        <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 -mx-4 px-4 py-10 sm:-mx-6 sm:px-6 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Researched Conditions</h2>
            <p className="text-gray-600">
              These conditions have the most scientific evidence for CBD&apos;s potential benefits
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredConditions.map(condition => {
              const config = CATEGORY_CONFIG[condition.category] || CATEGORY_CONFIG.other;
              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.slug}`}
                  className="bg-white rounded-xl border-2 border-white p-5 hover:border-green-300 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-2xl p-2 rounded-lg ${config.bgColor}`}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {condition.display_name || condition.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {condition.short_description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        {condition.research_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            {condition.research_count} studies
                          </span>
                        )}
                      </div>
                    </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Body System</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const config = CATEGORY_CONFIG[cat];
              const count = categoryCounts[cat] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
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
        </section>
      )}

      {/* Conditions Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <section>
          {selectedCategory ? (
            /* Single category view */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{CATEGORY_CONFIG[selectedCategory]?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {CATEGORY_CONFIG[selectedCategory]?.name}
                  </h2>
                  <p className="text-gray-600">{filteredConditions.length} conditions</p>
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
                Search Results ({filteredConditions.length})
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
                        <span className="text-sm text-gray-500">({catConditions.length})</span>
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
            <div key={letter} id={`letter-${letter}`}>
              <h2 className="text-2xl font-bold text-green-600 mb-4 pb-2 border-b border-gray-200">
                {letter}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groupedByLetter[letter].map(condition => (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-lg">
                      {CATEGORY_CONFIG[condition.category]?.icon || '🏥'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {condition.display_name || condition.name}
                      </span>
                      {condition.research_count > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({condition.research_count} studies)
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No conditions found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Explore the Research</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Dive deeper into the science behind CBD with our comprehensive research database
          featuring {totalStudies.toLocaleString('de-DE')}+ peer-reviewed studies.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/research"
            className="px-6 py-3 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
          >
            Research Database
          </Link>
          <Link
            href="/tools/dosage-calculator"
            className="px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
          >
            Dosage Calculator
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="p-6 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Medical Disclaimer</p>
        <p>
          The information provided on this page is for educational purposes only and is not intended as medical advice.
          CBD research is ongoing, and results may vary. Always consult with a healthcare professional before starting
          any new supplement regimen, especially if you have a medical condition or are taking medications.
        </p>
      </section>
    </div>
  );
}

// Condition Card Component
function ConditionCard({ condition, showCategory = false }: { condition: Condition; showCategory?: boolean }) {
  const config = CATEGORY_CONFIG[condition.category] || CATEGORY_CONFIG.other;

  return (
    <Link
      href={`/conditions/${condition.slug}`}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-all group"
    >
      <span className={`text-xl p-2 rounded-lg ${config.bgColor}`}>{config.icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors truncate">
          {condition.display_name || condition.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {condition.research_count > 0 && (
            <span>{condition.research_count} studies</span>
          )}
          {showCategory && (
            <>
              <span>•</span>
              <span>{config.name}</span>
            </>
          )}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
