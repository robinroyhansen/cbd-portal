'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GlossaryTooltipProps {
  term: string;
  slug: string;
  definition: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, slug, definition, children }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="border-b border-dotted border-green-500 cursor-help text-green-700">
        {children}
      </span>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50">
          <div className="font-semibold mb-1">{term}</div>
          <p className="text-gray-300 text-xs mb-2 line-clamp-3">{definition}</p>
          <Link
            href={`/glossary/${slug}`}
            className="text-green-400 hover:text-green-300 text-xs"
          >
            Learn more →
          </Link>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}