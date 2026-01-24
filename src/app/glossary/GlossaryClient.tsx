'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface GlossaryTerm {
  id: string;
  term: string;
  display_name: string;
  slug: string;
  short_definition: string;
  category: string;
  synonyms: string[];
  pronunciation?: string;
}

interface Category {
  key: string;
  label: string;
  icon: string;
  description: string;
}

interface GlossaryClientProps {
  initialTerms: GlossaryTerm[];
  popularTerms: GlossaryTerm[];
  categoryCounts: Record<string, number>;
  availableLetters: string[];
  totalTerms: number;
  categories: Category[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cannabinoids: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  terpenes: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  products: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  extraction: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  science: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  research: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  'side-effects': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  conditions: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  testing: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  legal: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  dosing: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  plant: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
  medical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GlossaryClient({
  initialTerms,
  popularTerms,
  categoryCounts,
  availableLetters,
  totalTerms,
  categories,
}: GlossaryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [selectedLetter, setSelectedLetter] = useState<string | null>(
    searchParams.get('letter')
  );
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update URL when filters change
  const updateUrl = useCallback((category: string | null, letter: string | null, query: string) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (letter) params.set('letter', letter);
    if (query) params.set('q', query);
    const newUrl = params.toString() ? `/glossary?${params.toString()}` : '/glossary';
    router.push(newUrl, { scroll: false });
  }, [router]);

  // Filter terms based on current state
  const filteredTerms = useMemo(() => {
    let result = initialTerms;

    if (selectedCategory) {
      result = result.filter(term => term.category === selectedCategory);
    }

    if (selectedLetter) {
      result = result.filter(term =>
        term.term.charAt(0).toUpperCase() === selectedLetter
      );
    }

    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      result = result.filter(term =>
        term.term.toLowerCase().includes(query) ||
        (term.display_name && term.display_name.toLowerCase().includes(query)) ||
        term.short_definition.toLowerCase().includes(query) ||
        (term.synonyms && term.synonyms.some(s => s.toLowerCase().includes(query)))
      );
    }

    return result;
  }, [initialTerms, selectedCategory, selectedLetter, searchQuery]);

  // Generate autocomplete suggestions
  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const matches: { term: GlossaryTerm; matchType: 'term' | 'synonym' }[] = [];
    const seen = new Set<string>();

    for (const term of initialTerms) {
      if (matches.length >= 8) break;

      const termLower = term.term.toLowerCase();
      const displayLower = (term.display_name || term.term).toLowerCase();

      if (termLower.includes(query) || displayLower.includes(query)) {
        if (!seen.has(term.slug)) {
          seen.add(term.slug);
          matches.push({ term, matchType: 'term' });
        }
        continue;
      }

      if (term.synonyms && term.synonyms.length > 0) {
        const matchedSynonym = term.synonyms.find(s => s.toLowerCase().includes(query));
        if (matchedSynonym && !seen.has(term.slug)) {
          seen.add(term.slug);
          matches.push({ term, matchType: 'synonym' });
        }
      }
    }

    return matches;
  }, [searchQuery, initialTerms]);

  // Group terms by first letter
  const termsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach(term => {
      const letter = term.term.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(term);
    });
    return grouped;
  }, [filteredTerms]);

  // Handle keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          router.push(`/glossary/${suggestions[selectedSuggestionIndex].term.slug}`);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    updateUrl(category, selectedLetter, searchQuery);
  };

  const handleLetterChange = (letter: string | null) => {
    setSelectedLetter(letter);
    updateUrl(selectedCategory, letter, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedLetter(null);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
    // Debounce URL update for search
    if (query.length >= 2 || query.length === 0) {
      updateUrl(selectedCategory, null, query);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedLetter(null);
    router.push('/glossary', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - breadcrumbs rendered above in server component */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white pt-4 pb-16">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            Knowledge Base
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            CBD & Cannabis
            <span className="block text-green-200">Glossary</span>
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-xl leading-relaxed">
            {totalTerms} terms explained — from cannabinoids and terpenes to legal terminology and product types.
          </p>

          {/* Search Box with Autocomplete */}
          <div className="relative max-w-xl">
            <label htmlFor="glossary-search" className="sr-only">Search glossary terms</label>
            <input
              id="glossary-search"
              ref={searchInputRef}
              type="text"
              placeholder="Search terms, synonyms..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full px-5 py-4 pl-12 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions && suggestions.length > 0}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>

            {/* Autocomplete Dropdown */}
            {searchQuery.length >= 2 && suggestions.length > 0 && showSuggestions && (
              <div
                id="search-suggestions"
                ref={suggestionsRef}
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[100]"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                  {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
                </div>
                {suggestions.map((suggestion, index) => {
                  const categoryInfo = categories.find(c => c.key === suggestion.term.category);
                  const isSelected = index === selectedSuggestionIndex;
                  return (
                    <Link
                      key={suggestion.term.slug}
                      href={`/glossary/${suggestion.term.slug}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-green-100' : ''
                      }`}
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {suggestion.term.display_name || suggestion.term.term}
                        </div>
                        {suggestion.matchType === 'synonym' && (
                          <div className="text-xs text-gray-500">Matched synonym</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{categoryInfo?.label}</span>
                        <span className="text-lg" aria-hidden="true">{categoryInfo?.icon}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Popular Terms Section */}
          {popularTerms.length > 0 && !searchQuery && !selectedCategory && !selectedLetter && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                  </svg>
                </span>
                Most Popular Terms
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
                {popularTerms.map(term => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-lg md:rounded-xl p-3 md:p-4 transition-all duration-300"
                  >
                    <div className="font-semibold text-white text-sm md:text-base group-hover:text-green-100 transition-colors line-clamp-1">
                      {term.display_name || term.term}
                    </div>
                    <div className="text-[11px] md:text-xs text-green-200/80 line-clamp-2 mt-1 md:mt-1.5 leading-relaxed">
                      {term.short_definition}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* Alphabet Navigation */}
          <nav className="py-2 md:py-3 flex items-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1" aria-label="Filter by letter">
            <button
              onClick={() => handleLetterChange(null)}
              className={`px-2.5 md:px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all shrink-0 ${
                !selectedLetter
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-pressed={!selectedLetter}
            >
              All
            </button>
            {ALPHABET.map(letter => {
              const hasTerms = availableLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && handleLetterChange(selectedLetter === letter ? null : letter)}
                  disabled={!hasTerms}
                  aria-pressed={selectedLetter === letter}
                  className={`w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm font-semibold rounded-md md:rounded-lg transition-all shrink-0 ${
                    selectedLetter === letter
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : hasTerms
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-green-700'
                        : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </nav>

          {/* Category Filter and View Toggle */}
          <div className="py-3 border-t border-gray-100">
            {/* Mobile: Dropdown selector */}
            <div className="md:hidden flex items-center gap-3">
              <label htmlFor="category-select" className="sr-only">Filter by category</label>
              <select
                id="category-select"
                value={selectedCategory || ''}
                onChange={(e) => handleCategoryChange(e.target.value || null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories ({totalTerms})</option>
                {categories.map(cat => {
                  const count = categoryCounts[cat.key] || 0;
                  return (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* View Toggle - Mobile */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('cards')}
                  aria-pressed={viewMode === 'cards'}
                  className={`p-2 rounded ${
                    viewMode === 'cards'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Card view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="sr-only">Card view</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  className={`p-2 rounded ${
                    viewMode === 'table'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="sr-only">Table view</span>
                </button>
              </div>
            </div>

            {/* Desktop: Grid of category pills */}
            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
              <button
                onClick={() => handleCategoryChange(null)}
                aria-pressed={!selectedCategory}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !selectedCategory
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories ({totalTerms})
              </button>

              {categories.map(cat => {
                const count = categoryCounts[cat.key] || 0;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(isSelected ? null : cat.key)}
                    aria-pressed={isSelected}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span aria-hidden="true">{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-green-500 text-green-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* View Toggle - Desktop */}
              <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('cards')}
                  aria-pressed={viewMode === 'cards'}
                  className={`p-2 rounded ${
                    viewMode === 'cards'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Card view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="sr-only">Card view</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  aria-pressed={viewMode === 'table'}
                  className={`p-2 rounded ${
                    viewMode === 'table'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="sr-only">Table view</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4" aria-hidden="true">📚</div>
            <h2 className="text-lg font-medium text-gray-900">No terms found</h2>
            <p className="text-gray-600 mt-1">
              {searchQuery ? `No results for "${searchQuery}"` : 'No glossary terms match your filters'}
            </p>
            {(searchQuery || selectedCategory || selectedLetter) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <TableView terms={filteredTerms} categories={categories} />
        ) : (
          <CardView
            terms={filteredTerms}
            termsByLetter={termsByLetter}
            categories={categories}
            isFiltered={!!(selectedLetter || searchQuery)}
          />
        )}
      </main>
    </div>
  );
}

function TableView({ terms, categories }: { terms: GlossaryTerm[]; categories: Category[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="text-left px-4 py-3 text-sm font-medium text-gray-600">Term</th>
            <th scope="col" className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Category</th>
            <th scope="col" className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Definition</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {terms.map(term => {
            const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
            const categoryInfo = categories.find(c => c.key === term.category);

            return (
              <tr key={term.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/glossary/${term.slug}`} className="block group">
                    <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {term.display_name || term.term}
                    </div>
                    {term.pronunciation && (
                      <div className="text-xs text-gray-400 font-mono">/{term.pronunciation}/</div>
                    )}
                    {term.synonyms && term.synonyms.length > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Also: {term.synonyms.slice(0, 2).join(', ')}
                        {term.synonyms.length > 2 && '...'}
                      </div>
                    )}
                    <div className="md:hidden mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                        <span aria-hidden="true">{categoryInfo?.icon}</span> {categoryInfo?.label}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                    <span aria-hidden="true">{categoryInfo?.icon}</span> {categoryInfo?.label}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-sm text-gray-600 line-clamp-2">{term.short_definition}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CardView({
  terms,
  termsByLetter,
  categories,
  isFiltered,
}: {
  terms: GlossaryTerm[];
  termsByLetter: Record<string, GlossaryTerm[]>;
  categories: Category[];
  isFiltered: boolean;
}) {
  if (isFiltered) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terms.map(term => (
          <TermCard key={term.id} term={term} categories={categories} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(termsByLetter)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([letter, letterTerms]) => (
          <section key={letter} id={`letter-${letter}`} aria-labelledby={`heading-${letter}`}>
            <h2
              id={`heading-${letter}`}
              className="text-2xl font-bold text-gray-900 mb-4 sticky top-[120px] bg-gray-50 py-2 z-30"
            >
              {letter}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({letterTerms.length} {letterTerms.length === 1 ? 'term' : 'terms'})
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {letterTerms.map(term => (
                <TermCard key={term.id} term={term} categories={categories} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function TermCard({ term, categories }: { term: GlossaryTerm; categories: Category[] }) {
  const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
  const categoryInfo = categories.find(c => c.key === term.category);

  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-300 overflow-hidden"
    >
      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <article className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
              {term.display_name || term.term}
            </h3>
            {term.pronunciation && (
              <span className="text-xs text-gray-400 font-mono mt-0.5 block">/{term.pronunciation}/</span>
            )}
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
            <span aria-hidden="true">{categoryInfo?.icon}</span>
            <span className="hidden sm:inline">{categoryInfo?.label}</span>
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{term.short_definition}</p>

        <div className="flex items-center justify-between">
          {term.synonyms && term.synonyms.length > 0 ? (
            <div className="text-xs text-gray-500">
              Also: {term.synonyms.slice(0, 2).join(', ')}
              {term.synonyms.length > 2 && '...'}
            </div>
          ) : (
            <div />
          )}
          <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  );
}
