'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getLocalizedSlug } from '@/lib/utils/locale-href';

interface GlossaryTooltipProps {
  term: string;
  slug: string;
  translatedSlug?: string | null;
  definition: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, slug, translatedSlug, definition, children }: GlossaryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending hide timeout
  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Show tooltip immediately
  const showTooltip = useCallback(() => {
    clearHideTimeout();
    setIsVisible(true);
  }, [clearHideTimeout]);

  // Hide tooltip with a delay (allows mouse to move to tooltip)
  const hideTooltip = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 150); // 150ms delay gives time to move to tooltip
  }, [clearHideTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearHideTimeout();
  }, [clearHideTimeout]);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      setPosition(spaceAbove < 150 ? 'bottom' : 'top');
    }
  }, [isVisible]);

  const positionClasses = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2';

  const arrowClasses = position === 'top'
    ? 'bottom-[-6px] border-b border-r'
    : 'top-[-6px] border-t border-l';

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="glossary-term border-b border-dotted border-green-500 text-green-700 cursor-help hover:text-green-800 hover:border-green-700 transition-colors"
      >
        {children}
      </span>

      {isVisible && (
        <div
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          className={`absolute z-50 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm ${positionClasses} left-1/2 -translate-x-1/2`}
        >
          {/* Arrow */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-gray-200 transform rotate-45 ${arrowClasses}`}
          />

          {/* Content */}
          <div className="relative">
            <div className="font-semibold text-gray-900 mb-1 flex items-center justify-between">
              <span>{term}</span>
              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Glossary</span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed mb-2">
              {definition}
            </p>
            <Link
              href={`/glossary/${getLocalizedSlug({ slug, translated_slug: translatedSlug })}`}
              className="text-xs text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </span>
  );
}
