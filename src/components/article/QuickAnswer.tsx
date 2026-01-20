'use client';

interface QuickAnswerProps {
  answer: string;
  className?: string;
}

export function QuickAnswer({ answer, className = '' }: QuickAnswerProps) {
  return (
    <blockquote className={`my-6 border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 text-green-600 font-bold text-sm uppercase tracking-wide">
          TL;DR
        </span>
        <p className="text-gray-700 text-base leading-relaxed m-0">
          {answer}
        </p>
      </div>
    </blockquote>
  );
}

// Extract Quick Answer from markdown content
export function extractQuickAnswer(content: string): { answer: string | null; content: string } {
  // Match blockquote starting with **Quick Answer:** or **TL;DR:**
  const patterns = [
    /^>\s*\*{0,2}(?:Quick Answer|TL;DR|The Short Answer|Bottom Line):?\*{0,2}:?\s*(.+?)(?=\n\n|\n[^>]|$)/im,
    /^>\s*\*{0,2}(?:Quick Answer|TL;DR|The Short Answer|Bottom Line):?\*{0,2}:?\s*([\s\S]+?)(?=\n\n[^>]|\n[^>\s]|$)/im,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const answer = match[1].replace(/\n>\s*/g, ' ').trim();
      const cleanedContent = content.replace(match[0], '').trim();
      return { answer, content: cleanedContent };
    }
  }

  return { answer: null, content };
}
