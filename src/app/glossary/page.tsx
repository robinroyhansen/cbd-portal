'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';

interface GlossaryTerm {
  id: string;
  term: string;
  display_name: string;
  slug: string;
  definition: string;
  short_definition: string;
  category: string;
  synonyms: string[];
  pronunciation?: string;
}

interface AutocompleteSuggestion {
  term: string;
  display_name: string;
  slug: string;
  category: string;
  matchType: 'term' | 'synonym';
}

const CATEGORIES = [
  { key: 'cannabinoids', label: 'Cannabinoids', icon: '🧬', color: 'green' },
  { key: 'terpenes', label: 'Terpenes', icon: '🌿', color: 'emerald' },
  { key: 'products', label: 'Products', icon: '📦', color: 'blue' },
  { key: 'extraction', label: 'Extraction', icon: '🔬', color: 'purple' },
  { key: 'medical', label: 'Medical', icon: '⚕️', color: 'red' },
  { key: 'conditions', label: 'Conditions', icon: '🩺', color: 'orange' },
  { key: 'legal', label: 'Legal', icon: '⚖️', color: 'slate' },
  { key: 'dosing', label: 'Dosing', icon: '💊', color: 'cyan' }
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cannabinoids: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  terpenes: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  products: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  extraction: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  medical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  conditions: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  legal: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  dosing: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' }
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [allTermsForSearch, setAllTermsForSearch] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [totalAllTerms, setTotalAllTerms] = useState(0);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all terms for search autocomplete (once)
  useEffect(() => {
    const fetchAllTerms = async () => {
      try {
        const res = await fetch('/api/glossary?all=true');
        const data = await res.json();
        const allTerms = data.terms || [];
        setAllTermsForSearch(allTerms);
        setTotalAllTerms(allTerms.length);
      } catch (err) {
        console.error('Error fetching all terms:', err);
      }
    };
    fetchAllTerms();
  }, []);

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLetter) params.set('letter', selectedLetter);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/glossary?${params.toString()}`);
      const data = await res.json();

      setTerms(data.terms || []);
      setCategoryCounts(data.categoryCounts || {});
      setAvailableLetters(data.availableLetters || []);
    } catch (err) {
      console.error('Error fetching glossary:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLetter, searchQuery]);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  // Generate autocomplete suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: AutocompleteSuggestion[] = [];
    const seen = new Set<string>();

    for (const term of allTermsForSearch) {
      if (matches.length >= 8) break;

      const termLower = term.term.toLowerCase();
      const displayLower = (term.display_name || term.term).toLowerCase();

      // Check term/display_name match
      if (termLower.includes(query) || displayLower.includes(query)) {
        if (!seen.has(term.slug)) {
          seen.add(term.slug);
          matches.push({
            term: term.term,
            display_name: term.display_name || term.term,
            slug: term.slug,
            category: term.category,
            matchType: 'term'
          });
        }
        continue;
      }

      // Check synonyms
      if (term.synonyms && term.synonyms.length > 0) {
        const matchedSynonym = term.synonyms.find(s => s.toLowerCase().includes(query));
        if (matchedSynonym && !seen.has(term.slug)) {
          seen.add(term.slug);
          matches.push({
            term: term.term,
            display_name: term.display_name || term.term,
            slug: term.slug,
            category: term.category,
            matchType: 'synonym'
          });
        }
      }
    }

    setSuggestions(matches);
  }, [searchQuery, allTermsForSearch]);

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
          window.location.href = `/glossary/${suggestions[selectedSuggestionIndex].slug}`;
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

  const totalTerms = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  // Group terms by first letter
  const termsByLetter = useMemo(() => {
    const grouped: Record<string, GlossaryTerm[]> = {};
    terms.forEach(term => {
      const letter = term.term.charAt(0).toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(term);
    });
    return grouped;
  }, [terms]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">CBD & Cannabis Glossary</h1>
          <p className="text-xl text-green-100 mb-6">
            {totalAllTerms} terms explained - from cannabinoids to legal terminology
          </p>

          {/* Search Box with Autocomplete */}
          <div className="relative max-w-xl">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search terms, synonyms..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLetter(null);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full px-5 py-3 pl-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>

            {/* Autocomplete Dropdown */}
            {searchQuery.length >= 2 && suggestions.length > 0 && showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden z-[100]"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
                </div>
                {suggestions.map((suggestion, index) => {
                  const categoryInfo = CATEGORIES.find(c => c.key === suggestion.category);
                  const isSelected = index === selectedSuggestionIndex;
                  return (
                    <Link
                      key={suggestion.slug}
                      href={`/glossary/${suggestion.slug}`}
                      className={`flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        isSelected ? 'bg-green-100' : ''
                      }`}
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{suggestion.display_name}</div>
                        {suggestion.matchType === 'synonym' && (
                          <div className="text-xs text-gray-500">Matched synonym</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{categoryInfo?.label}</span>
                        <span className="text-lg">{categoryInfo?.icon}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* Alphabet Navigation */}
          <div className="py-3 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-2 py-1 text-sm font-medium rounded ${
                !selectedLetter
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {ALPHABET.map(letter => {
              const hasTerms = availableLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && setSelectedLetter(selectedLetter === letter ? null : letter)}
                  disabled={!hasTerms}
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
          </div>

          {/* Category Filter and View Toggle */}
          <div className="py-3 border-t border-gray-100">
            {/* Mobile: Dropdown selector */}
            <div className="md:hidden flex items-center gap-3">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories ({totalTerms})</option>
                {CATEGORIES.map(cat => {
                  const count = categoryCounts[cat.key] || 0;
                  return (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* View Toggle - Mobile */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded ${
                    viewMode === 'cards'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Card view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${
                    viewMode === 'table'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop: Grid of category pills */}
            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
              {/* All Categories button */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !selectedCategory
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories ({totalTerms})
              </button>

              {/* Category pills */}
              {CATEGORIES.map(cat => {
                const count = categoryCounts[cat.key] || 0;
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
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
              <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded ${
                    viewMode === 'cards'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Card view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded ${
                    viewMode === 'table'
                      ? 'bg-white shadow text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : terms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900">No terms found</h3>
            <p className="text-gray-600 mt-1">
              {searchQuery ? `No results for "${searchQuery}"` : 'No glossary terms available'}
            </p>
            {(searchQuery || selectedCategory || selectedLetter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedLetter(null);
                }}
                className="mt-4 px-4 py-2 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          // Table View
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Term</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Definition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terms.map(term => {
                  const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
                  const categoryInfo = CATEGORIES.find(c => c.key === term.category);

                  return (
                    <tr
                      key={term.id}
                      className="hover:bg-gray-50"
                    >
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
                          {/* Mobile category badge */}
                          <div className="md:hidden mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                              {categoryInfo?.icon} {categoryInfo?.label}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                          {categoryInfo?.icon} {categoryInfo?.label}
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
        ) : (
          // Card View
          <div className="space-y-8">
            {selectedLetter || searchQuery ? (
              // Show flat list when filtering
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {terms.map(term => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>
            ) : (
              // Show grouped by letter
              Object.entries(termsByLetter).sort(([a], [b]) => a.localeCompare(b)).map(([letter, letterTerms]) => (
                <div key={letter} id={`letter-${letter}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 sticky top-[120px] bg-gray-50 py-2 z-30">
                    {letter}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({letterTerms.length} {letterTerms.length === 1 ? 'term' : 'terms'})
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {letterTerms.map(term => (
                      <TermCard key={term.id} term={term} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TermCard({ term }: { term: GlossaryTerm }) {
  const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
  const categoryInfo = CATEGORIES.find(c => c.key === term.category);

  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="block bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 transition-all group"
    >
      <div className="p-4">
        {/* Header */}
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
            {categoryInfo?.icon} {categoryInfo?.label}
          </span>
        </div>

        {/* Short Definition */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{term.short_definition}</p>

        {/* Synonyms */}
        {term.synonyms && term.synonyms.length > 0 && (
          <div className="text-xs text-gray-500">
            Also: {term.synonyms.slice(0, 2).join(', ')}
            {term.synonyms.length > 2 && '...'}
          </div>
        )}
      </div>

      {/* View More Indicator */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
        View full definition →
      </div>
    </Link>
  );
}
