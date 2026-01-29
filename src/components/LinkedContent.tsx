'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  markGlossaryTerms,
  parseMarkedText,
  GlossaryTerm,
} from '@/lib/utils/glossary-autolink';

interface LinkedContentProps {
  /** The text content to process */
  content: string;
  /** Array of glossary terms to link */
  glossaryTerms: GlossaryTerm[];
  /** Optional map of English slug → translated slug for localized URLs */
  translatedSlugs?: Record<string, string>;
  /** Optional className for the wrapper */
  className?: string;
  /** Render as a specific element (default: span) */
  as?: 'span' | 'p' | 'div';
}

/**
 * LinkedContent Component
 *
 * Renders text with glossary terms automatically linked.
 * Only links the first occurrence of each term.
 * Uses dotted underline styling to indicate definitions.
 */
export function LinkedContent({
  content,
  glossaryTerms,
  translatedSlugs,
  className,
  as: Component = 'span',
}: LinkedContentProps) {
  const segments = useMemo(() => {
    if (!content) return [];
    const markedText = markGlossaryTerms(content, glossaryTerms);
    return parseMarkedText(markedText);
  }, [content, glossaryTerms]);

  if (!content) return null;

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'link' && segment.slug) {
          const localizedSlug = translatedSlugs?.[segment.slug] || segment.slug;
          return (
            <Link
              key={index}
              href={`/glossary/${localizedSlug}`}
              className="text-green-700 hover:text-green-800 underline decoration-dotted underline-offset-2 transition-colors"
              title={`View definition: ${segment.content}`}
            >
              {segment.content}
            </Link>
          );
        }
        return <span key={index}>{segment.content}</span>;
      })}
    </Component>
  );
}

/**
 * LinkedParagraph Component
 *
 * Same as LinkedContent but renders as a <p> element
 */
export function LinkedParagraph(
  props: Omit<LinkedContentProps, 'as'>
) {
  return <LinkedContent {...props} as="p" />;
}
