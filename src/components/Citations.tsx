'use client';

import React from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';

interface Citation {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  url?: string;
  doi?: string;
  pmid?: string;
  slug?: string; // Internal study summary slug
}

interface CitationsProps {
  citations: Citation[];
  className?: string;
  topic?: string; // For "View all studies" link
  studyCount?: number; // Total studies reviewed (may be more than citations shown)
}

// Format authors: "Smith J, Jones A, Brown B" -> "Smith J, et al."
function formatAuthors(authors: string): string {
  if (!authors) return 'Unknown';

  // Check if already has "et al"
  if (authors.toLowerCase().includes('et al')) {
    return authors;
  }

  // Split by common separators
  const authorList = authors.split(/[,;]/).map(a => a.trim()).filter(Boolean);

  if (authorList.length <= 1) {
    return authors;
  }

  // Return first author + et al.
  return `${authorList[0]}, et al.`;
}

export function Citations({ citations, className = '', topic, studyCount }: CitationsProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  const displayCount = studyCount || citations.length;

  return (
    <div className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">References</h2>

      <p className="text-sm text-gray-600 mb-6">
        I reviewed {displayCount} {displayCount === 1 ? 'study' : 'studies'} for this article. Key sources:
      </p>

      <ol className="space-y-5 list-decimal list-outside ml-5">
        {citations.map((cite) => {
          const hasLinks = cite.slug || cite.pmid || cite.doi;

          return (
            <li key={cite.id} className="text-sm text-gray-700 leading-relaxed pl-2">
              {/* Citation text */}
              <p className="mb-1">
                <span className="font-semibold">{formatAuthors(cite.authors)}</span>
                <span> ({cite.year || 'n.d.'}). </span>
                <span>{cite.title}. </span>
                <span className="italic">{cite.publication}</span>
                <span>.</span>
              </p>

              {/* Links on separate line per spec */}
              {hasLinks && (
                <p className="text-xs text-gray-600">
                  {cite.slug && (
                    <>
                      <Link
                        href={`/research/study/${cite.slug}`}
                        className="text-green-600 hover:text-green-700 hover:underline"
                      >
                        [Summary]
                      </Link>
                      {(cite.pmid || cite.doi) && <span> • </span>}
                    </>
                  )}
                  {cite.pmid && (
                    <>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${cite.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 hover:underline"
                      >
                        [PubMed]
                      </a>
                      {cite.doi && <span> • </span>}
                    </>
                  )}
                  {cite.doi && (
                    <span>
                      DOI: {cite.doi}
                    </span>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {topic && (
        <div className="mt-8">
          <Link
            href={`/research?topic=${topic}`}
            className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
          >
            [View all {displayCount} studies on CBD and {topic.replace(/_/g, ' ')} →]
          </Link>
        </div>
      )}
    </div>
  );
}

// Simple citation count display for article headers
export function CitationCount({ count, className = '' }: { count: number; className?: string }) {
  if (count === 0) return null;

  return (
    <span className={`inline-flex items-center text-xs text-gray-500 ${className}`}>
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {count} scientific reference{count !== 1 ? 's' : ''}
    </span>
  );
}

export default Citations;