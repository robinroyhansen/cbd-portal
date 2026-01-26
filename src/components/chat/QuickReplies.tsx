'use client';

/**
 * QuickReplies Component
 * Displays clickable pill buttons for suggested follow-up questions
 */

interface QuickRepliesProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
