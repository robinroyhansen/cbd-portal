'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Static article data for search functionality
const ARTICLES = [
  {
    id: '1',
    title: 'CBD and Anxiety: A Comprehensive Guide to Natural Relief (2025)',
    slug: 'cbd-and-anxiety',
    description: 'Explore the latest research on CBD for anxiety disorders, including clinical evidence, dosing guidelines, and safety considerations.',
    category: 'Mental Health',
    tags: ['anxiety', 'mental health', 'stress', 'clinical studies'],
  },
  {
    id: '2',
    title: 'CBD and Sleep: What the Latest Research Reveals (2025)',
    slug: 'cbd-and-sleep',
    description: 'Discover how CBD affects sleep quality, the optimal dosing for sleep disorders, and comparisons with traditional sleep medications.',
    category: 'Sleep',
    tags: ['sleep', 'insomnia', 'sleep disorders', 'circadian rhythm'],
  },
  {
    id: '3',
    title: 'CBD and Pain: Evidence-Based Analysis of Analgesic Potential (2025)',
    slug: 'cbd-and-pain',
    description: 'A critical review of CBD for pain management, examining clinical trials, mechanisms of action, and realistic expectations.',
    category: 'Pain Management',
    tags: ['pain', 'chronic pain', 'inflammation', 'analgesic'],
  },
  {
    id: '4',
    title: 'CBD and Depression: Current Evidence and Future Prospects (2025)',
    slug: 'cbd-and-depression',
    description: 'Understanding CBD\'s potential role in depression treatment, including neurobiological mechanisms and ongoing clinical trials.',
    category: 'Mental Health',
    tags: ['depression', 'mood disorders', 'serotonin', 'mental health'],
  },
  {
    id: '5',
    title: 'CBD and Inflammation: From Molecular Mechanisms to Clinical Applications (2025)',
    slug: 'cbd-and-inflammation',
    description: 'Comprehensive analysis of CBD\'s anti-inflammatory properties, immune system modulation, and therapeutic applications.',
    category: 'Inflammation',
    tags: ['inflammation', 'immune system', 'cytokines', 'autoimmune'],
  },
  {
    id: '6',
    title: 'CBD and Arthritis: Joint Relief or Just Hype? (2025 Evidence Review)',
    slug: 'cbd-and-arthritis',
    description: 'Evidence-based review of CBD for arthritis, comparing topical vs oral administration and real-world patient outcomes.',
    category: 'Pain Management',
    tags: ['arthritis', 'joint pain', 'osteoarthritis', 'rheumatoid arthritis'],
  },
  {
    id: '7',
    title: 'CBD and Stress: Cortisol, Adaptation, and Real-World Applications (2025)',
    slug: 'cbd-and-stress',
    description: 'How CBD modulates stress responses, affects cortisol levels, and compares to traditional stress management approaches.',
    category: 'Mental Health',
    tags: ['stress', 'cortisol', 'HPA axis', 'adaptation'],
  },
  {
    id: '8',
    title: 'CBD and Epilepsy: From Epidiolex to Real-World Evidence (2025 Update)',
    slug: 'cbd-and-epilepsy',
    description: 'Comprehensive review of CBD for epilepsy, including FDA-approved treatments, pediatric use, and latest clinical data.',
    category: 'Neurological',
    tags: ['epilepsy', 'seizures', 'Epidiolex', 'neurological'],
  },
  {
    id: '9',
    title: 'CBD and PTSD: Emerging Evidence for Trauma Recovery (2025)',
    slug: 'cbd-and-ptsd',
    description: 'Examining CBD\'s potential in PTSD treatment, from neurobiological mechanisms to ongoing veteran clinical trials.',
    category: 'Mental Health',
    tags: ['PTSD', 'trauma', 'veterans', 'therapy'],
  },
  {
    id: '10',
    title: 'CBD and Fibromyalgia: Hope, Hype, and Clinical Reality (2025)',
    slug: 'cbd-and-fibromyalgia',
    description: 'Critical analysis of CBD for fibromyalgia, including the disconnect between patient experiences and clinical trial results.',
    category: 'Pain Management',
    tags: ['fibromyalgia', 'chronic pain', 'fatigue', 'clinical trials'],
  },
];

export default function SearchPage() {
  const [filteredArticles, setFilteredArticles] = useState(ARTICLES);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (!query.trim()) {
      setFilteredArticles([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = ARTICLES.filter((article) => {
      return (
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.category.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });

    setFilteredArticles(filtered);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Search Results
        </h1>
        {query && (
          <p className="mt-2 text-lg text-gray-600">
            Showing results for: <span className="font-semibold">{query}</span>
          </p>
        )}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {query
              ? `Try adjusting your search terms or browse our articles.`
              : 'Enter a search term to find articles.'}
          </p>
          <div className="mt-6">
            <a
              href="/articles"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Browse All Articles
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-primary-700">
                  {article.category}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                <a
                  href={`/articles/${article.slug}`}
                  className="hover:text-primary-600"
                >
                  {article.title}
                </a>
              </h2>
              <p className="mb-4 text-gray-600 line-clamp-3">
                {article.description}
              </p>
              <a
                href={`/articles/${article.slug}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Read more →
              </a>
            </article>
          ))}
        </div>
      )}

      {/* Related searches */}
      {query && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Related Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {['CBD Oil', 'Anxiety', 'Pain Relief', 'Sleep', 'Dosage', 'Research', 'Benefits'].map(
              (term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {term}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}