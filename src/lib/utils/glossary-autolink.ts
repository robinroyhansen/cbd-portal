/**
 * Glossary Auto-Link Utility
 * Automatically links glossary terms in text content
 */

export interface GlossaryTerm {
  term: string;
  slug: string;
  synonyms?: string[];
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate plural/singular variants of a term
 */
function getTermVariants(term: string): string[] {
  const variants = [term];
  const termLower = term.toLowerCase();

  // Add plural forms
  if (termLower.endsWith('y') && !['ay', 'ey', 'oy', 'uy'].some(e => termLower.endsWith(e))) {
    // terpene-y -> terpene-ies (but not for day, key, etc.)
    variants.push(term.slice(0, -1) + 'ies');
  } else if (termLower.endsWith('s') || termLower.endsWith('x') || termLower.endsWith('ch') || termLower.endsWith('sh')) {
    variants.push(term + 'es');
  } else if (!termLower.endsWith('s')) {
    variants.push(term + 's');
  }

  // Add singular forms (if term ends in s/es/ies)
  if (termLower.endsWith('ies')) {
    variants.push(term.slice(0, -3) + 'y');
  } else if (termLower.endsWith('es') && (termLower.endsWith('ses') || termLower.endsWith('xes') || termLower.endsWith('ches') || termLower.endsWith('shes'))) {
    variants.push(term.slice(0, -2));
  } else if (termLower.endsWith('s') && !termLower.endsWith('ss')) {
    variants.push(term.slice(0, -1));
  }

  return [...new Set(variants)];
}

/**
 * Build a map of all term variants to their slugs
 */
function buildTermMap(glossaryTerms: GlossaryTerm[]): Map<string, { slug: string; originalTerm: string }> {
  const termMap = new Map<string, { slug: string; originalTerm: string }>();

  for (const { term, slug, synonyms } of glossaryTerms) {
    // Add main term and variants
    for (const variant of getTermVariants(term)) {
      const key = variant.toLowerCase();
      if (!termMap.has(key)) {
        termMap.set(key, { slug, originalTerm: term });
      }
    }

    // Add synonyms and their variants
    if (synonyms && synonyms.length > 0) {
      for (const synonym of synonyms) {
        for (const variant of getTermVariants(synonym)) {
          const key = variant.toLowerCase();
          if (!termMap.has(key)) {
            termMap.set(key, { slug, originalTerm: term });
          }
        }
      }
    }
  }

  return termMap;
}

/**
 * Process text and mark glossary terms for linking
 * Returns text with {{LINK:slug:text}} markers
 *
 * Rules:
 * 1. Only link first occurrence of each term (and its variants/synonyms)
 * 2. Match longer terms first
 * 3. Case-insensitive matching
 * 4. Word boundary matching only
 * 5. Include synonyms and plural/singular variants
 */
export function markGlossaryTerms(
  text: string,
  glossaryTerms: GlossaryTerm[]
): string {
  if (!text || !glossaryTerms || glossaryTerms.length === 0) {
    return text;
  }

  let result = text;
  const linkedSlugs = new Set<string>(); // Track linked slugs to avoid duplicates
  const termMap = buildTermMap(glossaryTerms);

  // Get all terms sorted by length (longest first)
  const allTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);

  for (const termKey of allTerms) {
    const { slug, originalTerm } = termMap.get(termKey)!;

    // Skip if we've already linked this glossary entry
    if (linkedSlugs.has(slug)) continue;

    // Create regex for word boundary matching, case-insensitive
    const escapedTerm = escapeRegex(termKey);
    const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');

    // Check if term exists in the text (not in an existing link marker)
    const testText = result.replace(/{{LINK:[^}]+}}/g, ''); // Remove existing markers for testing
    if (regex.test(testText)) {
      // Replace only the first occurrence (reset regex)
      const firstMatchRegex = new RegExp(`\\b(${escapedTerm})\\b`, 'i');
      result = result.replace(firstMatchRegex, `{{LINK:${slug}:$1}}`);
      linkedSlugs.add(slug);
    }
  }

  return result;
}

/**
 * Parse marked text into segments for rendering
 * Returns array of { type: 'text' | 'link', content, slug? }
 */
export interface TextSegment {
  type: 'text' | 'link';
  content: string;
  slug?: string;
}

export function parseMarkedText(markedText: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const parts = markedText.split(/({{LINK:[^}]+}})/g);

  for (const part of parts) {
    if (!part) continue;

    const match = part.match(/{{LINK:([^:]+):([^}]+)}}/);
    if (match) {
      segments.push({
        type: 'link',
        content: match[2],
        slug: match[1],
      });
    } else {
      segments.push({
        type: 'text',
        content: part,
      });
    }
  }

  return segments;
}

/**
 * Convert marked text to plain markdown links
 * Useful for server-side rendering or static content
 */
export function markedTextToMarkdown(markedText: string): string {
  return markedText.replace(
    /{{LINK:([^:]+):([^}]+)}}/g,
    '[$2](/glossary/$1)'
  );
}
