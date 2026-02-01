'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { ReactNode } from 'react';

interface GlossaryTerm {
  term: string;
  display_name?: string;
  slug: string;
  synonyms?: string[];
}

interface TermMatch {
  text: string;
  slug: string;
  displayName: string;
}

/**
 * Builds a lookup map from term/synonym strings to their slugs
 * Sorted by length (longest first) to avoid partial matches
 */
function buildTermLookup(terms: GlossaryTerm[], excludeSlug?: string): Map<string, { slug: string; displayName: string }> {
  const lookup = new Map<string, { slug: string; displayName: string }>();

  for (const term of terms) {
    // Skip the current term to avoid self-linking
    if (excludeSlug && term.slug === excludeSlug) continue;

    const displayName = term.display_name || term.term;

    // Add the main term
    lookup.set(term.term.toLowerCase(), { slug: term.slug, displayName });

    // Add display_name if different from term
    if (term.display_name && term.display_name.toLowerCase() !== term.term.toLowerCase()) {
      lookup.set(term.display_name.toLowerCase(), { slug: term.slug, displayName });
    }

    // Add synonyms
    if (term.synonyms) {
      for (const synonym of term.synonyms) {
        if (synonym && !lookup.has(synonym.toLowerCase())) {
          lookup.set(synonym.toLowerCase(), { slug: term.slug, displayName });
        }
      }
    }
  }

  return lookup;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Processes a definition text and returns React elements with glossary term links
 *
 * @param definition - The raw definition text
 * @param allTerms - All glossary terms to link to
 * @param currentSlug - The slug of the current term (to exclude from linking)
 * @returns Array of React nodes (strings and Link components)
 */
export function linkGlossaryTerms(
  definition: string,
  allTerms: GlossaryTerm[],
  currentSlug?: string
): ReactNode[] {
  if (!definition || !allTerms.length) {
    return [definition];
  }

  const lookup = buildTermLookup(allTerms, currentSlug);

  // Sort keys by length (longest first) to match longer terms before shorter ones
  // This prevents "CBD" from matching inside "CBDA"
  const sortedKeys = Array.from(lookup.keys()).sort((a, b) => b.length - a.length);

  // Track which slugs we've already linked (only link first occurrence)
  const linkedSlugs = new Set<string>();

  // Build regex pattern for all terms
  // Use word boundaries to avoid partial matches
  const pattern = sortedKeys
    .map(key => `\\b${escapeRegex(key)}\\b`)
    .join('|');

  if (!pattern) {
    return [definition];
  }

  const regex = new RegExp(`(${pattern})`, 'gi');

  // Split the definition by matches
  const parts = definition.split(regex);

  const result: ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const lowerPart = part.toLowerCase();
    const termInfo = lookup.get(lowerPart);

    if (termInfo && !linkedSlugs.has(termInfo.slug)) {
      // This is a glossary term - create a link
      linkedSlugs.add(termInfo.slug);
      result.push(
        <Link
          key={`${termInfo.slug}-${i}`}
          href={`/glossary/${termInfo.slug}`}
          className="text-green-600 hover:text-green-700 hover:underline font-medium"
          title={`View definition: ${termInfo.displayName}`}
        >
          {part}
        </Link>
      );
    } else {
      // Regular text or already linked term
      result.push(part);
    }
  }

  return result;
}

/**
 * Component wrapper for linked definitions
 */
export function LinkedDefinition({
  definition,
  allTerms,
  currentSlug,
  className = '',
}: {
  definition: string;
  allTerms: GlossaryTerm[];
  currentSlug?: string;
  className?: string;
}) {
  const linkedContent = linkGlossaryTerms(definition, allTerms, currentSlug);

  return <span className={className}>{linkedContent}</span>;
}
