'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';

export interface KeyNumber {
  label: string;
  value: string;
  source?: string;
  sourceUrl?: string;
}

interface KeyNumbersProps {
  numbers: KeyNumber[];
  title?: string;
  className?: string;
}

export function KeyNumbers({ numbers, title = 'Key Numbers', className = '' }: KeyNumbersProps) {
  if (numbers.length === 0) return null;

  return (
    <div className={`my-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 overflow-hidden ${className}`}>
      <div className="bg-blue-600 px-4 py-2">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2 m-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {numbers.map((num, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 m-0">{num.value}</p>
                <p className="text-sm text-gray-600 m-0">{num.label}</p>
                {num.source && (
                  <p className="text-xs text-gray-400 mt-1 m-0">
                    {num.sourceUrl ? (
                      <Link href={num.sourceUrl} className="hover:text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        Source: {num.source}
                      </Link>
                    ) : (
                      <>Source: {num.source}</>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Extract Key Numbers from markdown content
export function extractKeyNumbers(content: string): { numbers: KeyNumber[]; content: string } {
  const numbers: KeyNumber[] = [];

  // Match Key Numbers/Key Stats/Research Numbers table or list section
  const sectionPatterns = [
    /##\s*(?:Key Numbers|Key Stats|Research Numbers|By the Numbers)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*Written|\n\*\*References|$)/i,
    /\*\*(?:Key Numbers|Key Stats|Research Numbers):?\*\*\s*\n([\s\S]+?)(?=\n##|\n---|\n\*Written|\n\*\*References|$)/i,
  ];

  let matchedSection = '';
  let cleanedContent = content;

  for (const pattern of sectionPatterns) {
    const match = content.match(pattern);
    if (match) {
      matchedSection = match[1];
      cleanedContent = content.replace(match[0], '').trim();
      break;
    }
  }

  if (matchedSection) {
    // Parse table format: | Value | Label | Source |
    const tableRowPattern = /\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)?\s*\|/g;
    let tableMatch;
    while ((tableMatch = tableRowPattern.exec(matchedSection)) !== null) {
      // Skip header row
      if (tableMatch[1].includes('---') || tableMatch[1].toLowerCase() === 'value' || tableMatch[1].toLowerCase() === 'stat') continue;

      numbers.push({
        value: tableMatch[1].trim(),
        label: tableMatch[2].trim(),
        source: tableMatch[3]?.trim() || undefined,
      });
    }

    // Parse list format: - **Value**: Label (Source)
    const listPattern = /[-*]\s*\*{0,2}(.+?)\*{0,2}:\s*(.+?)(?:\(([^)]+)\))?$/gm;
    let listMatch;
    while ((listMatch = listPattern.exec(matchedSection)) !== null) {
      numbers.push({
        value: listMatch[1].trim(),
        label: listMatch[2].trim(),
        source: listMatch[3]?.trim() || undefined,
      });
    }
  }

  return { numbers, content: cleanedContent };
}
