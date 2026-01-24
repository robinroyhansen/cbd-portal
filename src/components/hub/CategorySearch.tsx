'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface CategorySearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  accentColor?: string;
  className?: string;
}

export function CategorySearch({
  placeholder = 'Search articles...',
  onSearch,
  accentColor = 'focus:ring-emerald-500 focus:border-emerald-500',
  className = '',
}: CategorySearchProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  // Call onSearch when debounced value changes
  useMemo(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={`relative ${className}`}>
      {/* Search icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 ${accentColor} focus:ring-2 focus:ring-offset-0 focus:outline-none hub-body-text`}
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* Keyboard hint */}
      <div className="absolute inset-y-0 right-0 pr-4 hidden lg:flex items-center pointer-events-none">
        {!query && (
          <kbd className="px-2 py-1 bg-gray-100 text-gray-400 text-xs font-mono rounded">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}

// Hook for filtering articles with search
export function useArticleSearch<T extends { title: string; excerpt?: string | null }>(
  articles: T[],
  searchQuery: string
): T[] {
  return useMemo(() => {
    if (!searchQuery.trim()) return articles;

    const query = searchQuery.toLowerCase();
    return articles.filter((article) => {
      const titleMatch = article.title.toLowerCase().includes(query);
      const excerptMatch = article.excerpt?.toLowerCase().includes(query);
      return titleMatch || excerptMatch;
    });
  }, [articles, searchQuery]);
}
