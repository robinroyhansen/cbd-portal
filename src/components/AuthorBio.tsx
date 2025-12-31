'use client';

import React from 'react';

interface AuthorBioProps {
  className?: string;
}

export function AuthorBio({ className = '' }: AuthorBioProps) {
  return (
    <div className={`bg-gray-50 rounded-lg p-6 mt-12 border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">About the Author</h3>
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-green-700 text-2xl">👤</span>
        </div>
        <div>
          <p className="font-semibold text-lg">Robin Roy Krigslund-Hansen</p>
          <p className="text-sm text-green-700 mb-3">CBD Expert & Industry Veteran</p>

          <p className="text-gray-700 text-sm mb-3">
            Robin brings over 12 years of hands-on experience in the CBD and cannabis industry,
            having developed hundreds of CBD-based products sold to more than 100,000 customers
            across 60+ countries worldwide. Based in Switzerland, he focuses on translating
            complex clinical research into clear, accessible information for consumers. His
            approach prioritises peer-reviewed scientific evidence and stays current with
            regulatory developments across European and international markets.
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>🇨🇭 Switzerland</span>
            <span>•</span>
            <span>12+ years CBD industry experience</span>
            <span>•</span>
            <span>100,000+ customers served globally</span>
          </div>

          <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">
            <strong>Disclaimer:</strong> The views and opinions expressed in these articles are
            Robin's personal expert opinions based on his extensive industry experience and
            independent research. They do not represent the official position of Formula Swiss AG
            or any other organisation.
          </p>
        </div>
      </div>
    </div>
  );
}

// Also export a simplified byline component for the article header
export function AuthorByline({ date, className = '' }: { date?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <span className="text-green-700">👤</span>
      </div>
      <div>
        <p className="font-medium text-gray-900">Robin Roy Krigslund-Hansen</p>
        <p className="text-xs text-gray-500">
          CBD Expert • 12+ years industry experience
        </p>
      </div>
      {date && (
        <>
          <span className="text-gray-300 ml-2">•</span>
          <span className="text-xs">{new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</span>
        </>
      )}
    </div>
  );
}

export default AuthorBio;