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
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white pt-4 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">CBD & Cannabis Glossary</h1>
          <p className="text-xl text-green-100 mb-6">
            {totalTerms} terms explained - from cannabinoids to legal terminology
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
              className="w-full px-5 py-3 pl-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
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
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden z-[100]"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
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

          {/* Recently Updated Terms Section */}
          {popularTerms.length > 0 && !searchQuery && !selectedCategory && !selectedLetter && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-green-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recently Updated
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {popularTerms.map(term => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-colors group"
                  >
                    <div className="font-medium text-white group-hover:text-green-100 transition-colors">
                      {term.display_name || term.term}
                    </div>
                    <div className="text-xs text-green-200 line-clamp-2 mt-1">
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
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* Alphabet Navigation */}
          <nav className="py-3 flex items-center gap-1 overflow-x-auto" aria-label="Filter by letter">
            <button
              onClick={() => handleLetterChange(null)}
              className={`px-2 py-1 text-sm font-medium rounded ${
                !selectedLetter
                  ? 'bg-green-600 text-white'
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
                  className={`w-8 h-8 text-sm font-medium rounded ${
                    selectedLetter === letter
                      ? 'bg-green-600 text-white'
                      : hasTerms
                        ? 'text-gray-600 hover:bg-gray-100'
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
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 transition-all group"
    >
      <article className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors">
              {term.display_name || term.term}
            </h3>
            {term.pronunciation && (
              <span className="text-xs text-gray-400 font-mono">/{term.pronunciation}/</span>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
            <span aria-hidden="true">{categoryInfo?.icon}</span> {categoryInfo?.label}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{term.short_definition}</p>

        {term.synonyms && term.synonyms.length > 0 && (
          <div className="text-xs text-gray-500">
            Also: {term.synonyms.slice(0, 2).join(', ')}
            {term.synonyms.length > 2 && '...'}
          </div>
        )}
      </article>
    </Link>
  );
}
