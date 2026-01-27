'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';

interface SearchResult {
  type: 'condition' | 'glossary' | 'research' | 'article';
  title: string;
  slug: string;
  description?: string;
}

export function SearchBar() {
  const router = useRouter();
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const paths: Record<string, string> = {
      condition: `/research/${result.slug}`,
      glossary: `/glossary/${result.slug}`,
      research: `/research/study/${result.slug}`,
      article: `/articles/${result.slug}`,
    };
    router.push(paths[result.type] || `/search?q=${encodeURIComponent(result.title)}`);
    setIsOpen(false);
    setQuery('');
  };

  const typeIcons: Record<string, string> = {
    condition: '🏥',
    glossary: '📖',
    research: '🔬',
    article: '📄',
  };

  const typeLabels: Record<string, string> = {
    condition: 'Condition',
    glossary: 'Glossary',
    research: 'Study',
    article: 'Article',
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={t('common.searchConditions')}
            className="w-full px-4 py-3 pl-10 md:px-5 md:py-4 md:pl-12 text-base md:text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none shadow-sm bg-white"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.slug}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
            >
              <span className="text-lg">{typeIcons[result.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{result.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                    {typeLabels[result.type]}
                  </span>
                </div>
                {result.description && (
                  <p className="text-sm text-gray-500 truncate">{result.description}</p>
                )}
              </div>
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 text-center text-green-600 hover:bg-green-50 font-medium border-t border-gray-100"
          >
            {t('searchBar.viewAllResults').replace('{{query}}', query)}
          </button>
        </div>
      )}
    </div>
  );
}
