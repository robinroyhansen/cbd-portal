'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  short_definition: string;
  category: string;
  difficulty: string;
  synonyms: string[];
  related_terms: string[];
  related_terms_details?: { term: string; slug: string; short_definition: string; category: string }[];
  related_research_details?: { id: string; title: string; url: string; year: number }[];
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

const DIFFICULTY_COLORS = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700' }
};

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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [expandedTermData, setExpandedTermData] = useState<GlossaryTerm | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  const fetchTermDetails = async (slug: string) => {
    try {
      const res = await fetch(`/api/glossary?slug=${slug}`);
      const data = await res.json();
      if (data.term) {
        setExpandedTermData(data.term);
      }
    } catch (err) {
      console.error('Error fetching term details:', err);
    }
  };

  const handleTermClick = (term: GlossaryTerm) => {
    if (expandedTerm === term.id) {
      setExpandedTerm(null);
      setExpandedTermData(null);
    } else {
      setExpandedTerm(term.id);
      fetchTermDetails(term.slug);
    }
  };

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
            {totalTerms} terms explained - from cannabinoids to legal terminology
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedLetter(null);
              }}
              className="w-full px-5 py-3 pl-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
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

          {/* Category Tabs and View Toggle */}
          <div className="py-2 flex items-center gap-2 overflow-x-auto border-t border-gray-100">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories ({totalTerms})
            </button>
            {CATEGORIES.map(cat => {
              const count = categoryCounts[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap flex items-center gap-1 ${
                    selectedCategory === cat.key
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}

            {/* View Toggle */}
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${
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
                className={`p-1.5 rounded ${
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
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden sm:table-cell">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terms.map(term => {
                  const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
                  const difficultyColors = DIFFICULTY_COLORS[term.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner;
                  const categoryInfo = CATEGORIES.find(c => c.key === term.category);
                  const isExpanded = expandedTerm === term.id;

                  return (
                    <tr
                      key={term.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-green-50' : ''}`}
                      onClick={() => handleTermClick(term)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{term.term}</div>
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
                        {/* Expanded content for table view */}
                        {isExpanded && expandedTermData && (
                          <div className="mt-3 pt-3 border-t border-gray-200" onClick={e => e.stopPropagation()}>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                              {expandedTermData.definition}
                            </div>
                            {expandedTermData.synonyms && expandedTermData.synonyms.length > 0 && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Also known as:</span> {expandedTermData.synonyms.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                          {categoryInfo?.icon} {categoryInfo?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-sm text-gray-600 line-clamp-2">{term.short_definition}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors.bg} ${difficultyColors.text}`}>
                          {term.difficulty}
                        </span>
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
                  <TermCard
                    key={term.id}
                    term={term}
                    isExpanded={expandedTerm === term.id}
                    expandedData={expandedTerm === term.id ? expandedTermData : null}
                    onClick={() => handleTermClick(term)}
                  />
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
                      <TermCard
                        key={term.id}
                        term={term}
                        isExpanded={expandedTerm === term.id}
                        expandedData={expandedTerm === term.id ? expandedTermData : null}
                        onClick={() => handleTermClick(term)}
                      />
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

function TermCard({
  term,
  isExpanded,
  expandedData,
  onClick
}: {
  term: GlossaryTerm;
  isExpanded: boolean;
  expandedData: GlossaryTerm | null;
  onClick: () => void;
}) {
  const categoryColors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.cannabinoids;
  const difficultyColors = DIFFICULTY_COLORS[term.difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.beginner;
  const categoryInfo = CATEGORIES.find(c => c.key === term.category);

  return (
    <div
      className={`bg-white rounded-lg border transition-all cursor-pointer ${
        isExpanded ? 'col-span-full border-green-300 shadow-lg' : 'border-gray-200 hover:shadow-md hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{term.term}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
              {categoryInfo?.icon} {categoryInfo?.label}
            </span>
          </div>
        </div>

        {/* Short Definition */}
        <p className="text-gray-600 text-sm mb-3">{term.short_definition}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${difficultyColors.bg} ${difficultyColors.text}`}>
            {term.difficulty}
          </span>
          {term.synonyms && term.synonyms.length > 0 && (
            <span className="text-gray-500">
              Also: {term.synonyms.slice(0, 2).join(', ')}
              {term.synonyms.length > 2 && '...'}
            </span>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && expandedData && (
          <div className="mt-4 pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
            {/* Full Definition */}
            <div className="prose prose-sm max-w-none mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Definition</h4>
              <div className="text-gray-700 whitespace-pre-wrap">{expandedData.definition}</div>
            </div>

            {/* Related Terms */}
            {expandedData.related_terms_details && expandedData.related_terms_details.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Terms</h4>
                <div className="flex flex-wrap gap-2">
                  {expandedData.related_terms_details.map(related => (
                    <Link
                      key={related.slug}
                      href={`/glossary?q=${encodeURIComponent(related.term)}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                    >
                      {related.term}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Research */}
            {expandedData.related_research_details && expandedData.related_research_details.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Research</h4>
                <ul className="space-y-1">
                  {expandedData.related_research_details.map(research => (
                    <li key={research.id}>
                      <Link
                        href={research.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {research.title} ({research.year})
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Synonyms */}
            {expandedData.synonyms && expandedData.synonyms.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Also Known As</h4>
                <p className="text-sm text-gray-600">{expandedData.synonyms.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expand Indicator */}
      <div className={`px-4 py-2 border-t border-gray-100 text-center text-xs text-gray-500 ${
        isExpanded ? 'bg-green-50' : 'bg-gray-50'
      }`}>
        {isExpanded ? 'Click to collapse' : 'Click to expand'}
      </div>
    </div>
  );
}
