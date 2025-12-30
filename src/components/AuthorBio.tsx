import React from 'react';

interface AuthorBioProps {
  className?: string;
}

export function AuthorBio({ className = '' }: AuthorBioProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">About the Author</h3>

      <div className="flex flex-col space-y-3">
        <div>
          <p className="font-medium text-gray-900 text-base">Robin Roy Krigslund-Hansen</p>
          <p className="text-sm text-gray-600">CEO & Co-founder, Formula Swiss AG</p>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            Robin has worked in the CBD and cannabis industry since 2013. Based in Switzerland,
            he focuses on translating clinical research into accessible information for consumers.
            His approach prioritises peer-reviewed evidence and regulatory developments across European markets.
          </p>
        </div>

        <div className="flex items-center text-xs text-gray-500 pt-2">
          <span className="inline-flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Switzerland
          </span>
          <span className="mx-2">•</span>
          <span className="inline-flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            10+ years CBD industry experience
          </span>
        </div>
      </div>
    </div>
  );
}

// Also export a simplified byline component for the article header
export function AuthorByline({ className = '' }: { className?: string }) {
  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      Written by{' '}
      <span className="font-medium text-gray-900">Robin Roy Krigslund-Hansen</span>
      <span className="mx-1">•</span>
      <span>CEO & Co-founder, Formula Swiss AG</span>
      <span className="mx-1">•</span>
      <span>10+ years CBD industry experience</span>
    </div>
  );
}

export default AuthorBio;