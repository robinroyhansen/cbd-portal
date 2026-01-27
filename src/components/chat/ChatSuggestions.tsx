'use client';

/**
 * ChatSuggestions Component
 * Quick question chips for starting conversations
 */

import { useLocale } from '@/components/LocaleProvider';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  const { t } = useLocale();

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t('chat.tryAsking') || 'Try asking:'}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSelect(suggestion)}
            className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm text-emerald-700 transition-colors hover:bg-emerald-50 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
