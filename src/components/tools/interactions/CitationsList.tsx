'use client';

import type { Citation } from '@/types/drug-interactions';

interface CitationsListProps {
  citations: Citation[];
}

export function CitationsList({ citations }: CitationsListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        References
      </h4>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div
            key={citation.id || index}
            className="text-sm bg-gray-50 rounded-lg p-3"
          >
            <p className="text-gray-900 font-medium">{citation.title}</p>
            <p className="text-gray-600 mt-1">
              {citation.authors}
              {citation.journal && (
                <>
                  {' '}
                  <span className="italic">{citation.journal}</span>
                </>
              )}
              {citation.year && <> ({citation.year})</>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {citation.pmid && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  PubMed
                </a>
              )}
              {citation.doi && (
                <a
                  href={`https://doi.org/${citation.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  DOI
                </a>
              )}
              {citation.url && !citation.doi && !citation.pmid && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  View Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
