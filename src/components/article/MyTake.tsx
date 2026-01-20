'use client';

interface MyTakeProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
  className?: string;
}

export function MyTake({
  content,
  authorName = 'Robin Roy Krigslund-Hansen',
  authorTitle = '12+ years in CBD industry',
  className = ''
}: MyTakeProps) {
  return (
    <aside className={`my-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2 m-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          My Take
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
            <span className="text-amber-700 font-bold text-lg">R</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed m-0 mb-3 italic">
              "{content}"
            </p>
            <p className="text-sm text-gray-500 m-0">
              <span className="font-medium text-gray-700">{authorName}</span>
              {authorTitle && <span className="text-gray-400"> — {authorTitle}</span>}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Extract My Take from markdown content
export function extractMyTake(content: string): { take: string | null; content: string } {
  // Match various My Take formats
  const patterns = [
    /##\s*(?:My Take|Author's Take|Expert Take|Personal Experience)\s*\n\n([\s\S]+?)(?=\n##[^#]|\n---|\n\*\*References|$)/i,
    /\*\*(?:My Take|Author's Take|Expert Take):?\*\*\s*\n\n?([\s\S]+?)(?=\n##|\n---|\n\*\*References|$)/i,
    />\s*\*\*(?:My Take|Author's Take):?\*\*\s*([\s\S]+?)(?=\n\n[^>]|\n[^>\s]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      // Clean up the extracted text
      let take = match[1]
        .replace(/^>\s*/gm, '') // Remove blockquote markers
        .replace(/\n+/g, ' ')   // Replace newlines with spaces
        .replace(/\s+/g, ' ')   // Normalize whitespace
        .trim();

      // Remove surrounding quotes if present
      take = take.replace(/^["'](.+)["']$/, '$1');

      const cleanedContent = content.replace(match[0], '').trim();
      return { take, content: cleanedContent };
    }
  }

  return { take: null, content };
}
