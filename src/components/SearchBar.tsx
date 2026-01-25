'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/hooks/useLocale';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  type: 'article' | 'category' | 'study' | 'glossary';
}

export function SearchBar() {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const supabase = createClient();

      try {
        // Search articles
        const { data: articles } = await supabase
          .from('kb_articles')
          .select('slug, title, excerpt')
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(4);

        // Search categories
        const { data: categories } = await supabase
          .from('kb_categories')
          .select('slug, name, description')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(2);

        // Search research studies
        const { data: studies } = await supabase
          .from('research_queue')
          .select('slug, title, authors, publication')
          .eq('status', 'approved')
          .or(`title.ilike.%${query}%,authors.ilike.%${query}%,abstract.ilike.%${query}%`)
          .limit(3);

        // Search glossary terms
        const { data: glossary } = await supabase
          .from('glossary_terms')
          .select('slug, term, short_definition')
          .or(`term.ilike.%${query}%,short_definition.ilike.%${query}%`)
          .limit(3);

        const articleResults: SearchResult[] = (articles || []).map(a => ({
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt || '',
          type: 'article' as const
        }));

        const categoryResults: SearchResult[] = (categories || []).map(c => ({
          slug: c.slug,
          title: c.name,
          excerpt: c.description || '',
          type: 'category' as const
        }));

        const studyResults: SearchResult[] = (studies || []).map(s => ({
          slug: s.slug,
          title: s.title,
          excerpt: `${s.authors} • ${s.publication}`,
          type: 'study' as const
        }));

        const glossaryResults: SearchResult[] = (glossary || []).map(g => ({
          slug: g.slug,
          title: g.term,
          excerpt: g.short_definition || '',
          type: 'glossary' as const
        }));

        setResults([...categoryResults, ...studyResults, ...glossaryResults, ...articleResults]);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const urls: Record<SearchResult['type'], string> = {
      article: `/articles/${result.slug}`,
      category: `/categories/${result.slug}`,
      study: `/research/study/${result.slug}`,
      glossary: `/glossary/${result.slug}`
    };
    router.push(urls[result.type]);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={t('searchBar.placeholder')}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {/* Results dropdown */}
      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-w-full"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {t('searchBar.searching')}
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.slug}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      result.type === 'category'
                        ? 'bg-purple-100 text-purple-700'
                        : result.type === 'study'
                        ? 'bg-blue-100 text-blue-700'
                        : result.type === 'glossary'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {result.type === 'category' ? t('searchBar.category') : result.type === 'study' ? t('searchBar.study') : result.type === 'glossary' ? t('searchBar.term') : t('searchBar.article')}
                    </span>
                    <span className="font-medium text-gray-900 line-clamp-1">{result.title}</span>
                  </div>
                  {result.excerpt && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{result.excerpt}</p>
                  )}
                </button>
              ))}

              {query.length >= 2 && (
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 text-green-600 hover:bg-gray-100 font-medium"
                >
                  {t('searchBar.viewAllResults').replace('{{query}}', query)} →
                </button>
              )}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              {t('searchBar.noResults').replace('{{query}}', query)}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}