'use client';

import React from 'react';

interface Citation {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  url: string;
  doi?: string;
}

interface CitationsProps {
  citations: Citation[];
  className?: string;
}

export function Citations({ citations, className = '' }: CitationsProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`mt-12 pt-8 border-t border-gray-200 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">References</h2>

      <ol className="space-y-4 list-decimal list-inside">
        {citations.map((cite, index) => (
          <li key={cite.id} className="text-sm text-gray-700 leading-relaxed">
            <div className="inline">
              <span className="font-medium">{cite.authors}</span>
              <span> ({cite.year}). </span>
              <span className="italic">{cite.title}. </span>
              <span className="font-medium">{cite.publication}</span>
              {cite.doi && (
                <>
                  <span>. DOI: </span>
                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {cite.doi}
                  </span>
                </>
              )}
              <span>. </span>
              {cite.url && (
                <a
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 hover:underline font-medium inline-flex items-center gap-1"
                >
                  View Study
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Research Note:</span>{' '}
          These citations represent peer-reviewed scientific literature supporting the information
          presented in this article. Always consult with healthcare professionals before making
          medical decisions based on research findings.
        </p>
      </div>
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