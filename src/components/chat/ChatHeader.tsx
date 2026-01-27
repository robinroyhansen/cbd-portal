'use client';

/**
 * ChatHeader Component
 * Header with title and close button
 */

import { useLocale } from '@/components/LocaleProvider';

interface ChatHeaderProps {
  onClose: () => void;
  onReset?: () => void;
}

export function ChatHeader({ onClose, onReset }: ChatHeaderProps) {
  const { t } = useLocale();

  return (
    <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
      <div className="flex items-center gap-2">
        {/* Leaf icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 11.672 1.5 1.5 0 01-2.137-2.09c1.249-1.281 2.418-2.837 2.418-4.837 0-3.728-3.022-6.75-6.75-6.75-2 0-3.556 1.169-4.837 2.418a1.5 1.5 0 01-2.09-2.137 8.174 8.174 0 011.724-1.276z"
            clipRule="evenodd"
          />
        </svg>
        <h2 className="font-semibold">{t('chat.assistant') || 'CBD Portal Assistant'}</h2>
      </div>
      <div className="flex items-center gap-1">
        {/* Reset button */}
        {onReset && (
          <button
            onClick={onReset}
            aria-label={t('chat.resetConversation') || 'Reset conversation'}
            className="rounded-lg p-2 hover:bg-emerald-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        )}
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label={t('chat.closeChat') || 'Close chat'}
          className="rounded-lg p-2 hover:bg-emerald-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
