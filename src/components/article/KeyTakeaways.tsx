'use client';

import { useState } from 'react';

interface KeyTakeawaysProps {
  takeaways: string[];
  defaultExpanded?: boolean;
  title?: string;
  className?: string;
}

export function KeyTakeaways({
  takeaways,
  defaultExpanded = true,
  title = 'Key Takeaways',
  className = ''
}: KeyTakeawaysProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!takeaways || takeaways.length === 0) {
    return null;
  }

  return (
    <div className={`my-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-emerald-100/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="key-takeaways-content"
      >
        <div className="flex items-center gap-3">
          {/* Lightbulb Icon */}
          <svg
            className="w-6 h-6 text-emerald-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-emerald-800 m-0">
            {title}
          </h3>
        </div>
        {/* Chevron Icon */}
        <svg
          className={`w-5 h-5 text-emerald-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        id="key-takeaways-content"
        className={`transition-all duration-200 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <ul className="px-4 pb-4 pt-0 m-0 space-y-2 list-none">
          {takeaways.map((takeaway, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700"
            >
              <svg
                className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="leading-relaxed">{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Extract Key Takeaways from markdown content
export function extractKeyTakeaways(content: string): { takeaways: string[] | null; content: string } {
  // Match a Key Takeaways section with bullet points
  const patterns = [
    // Match ## Key Takeaways header followed by bullet list
    /^##\s*(?:Key Takeaways|Key Points|Main Takeaways|Summary Points)\s*\n+((?:[-*]\s+.+\n?)+)/im,
    // Match **Key Takeaways:** followed by bullet list
    /^\*{2}(?:Key Takeaways|Key Points|Main Takeaways):?\*{2}\s*\n+((?:[-*]\s+.+\n?)+)/im,
    // Match Key Takeaways: followed by bullet list
    /^(?:Key Takeaways|Key Points|Main Takeaways):?\s*\n+((?:[-*]\s+.+\n?)+)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const bulletList = match[1];
      const takeaways = bulletList
        .split('\n')
        .map(line => line.replace(/^[-*]\s+/, '').trim())
        .filter(line => line.length > 0);

      if (takeaways.length > 0) {
        const cleanedContent = content.replace(match[0], '').trim();
        return { takeaways, content: cleanedContent };
      }
    }
  }

  return { takeaways: null, content };
}
