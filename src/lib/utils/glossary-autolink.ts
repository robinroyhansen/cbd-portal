/**
 * Glossary Auto-Link Utility
 * Automatically links glossary terms in text content
 */

export interface GlossaryTerm {
  term: string;
  slug: string;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process text and mark glossary terms for linking
 * Returns text with {{LINK:slug:text}} markers
 *
 * Rules:
 * 1. Only link first occurrence of each term
 * 2. Match longer terms first
 * 3. Case-insensitive matching
 * 4. Word boundary matching only
 */
export function markGlossaryTerms(
  text: string,
  glossaryTerms: GlossaryTerm[]
): string {
  if (!text || !glossaryTerms || glossaryTerms.length === 0) {
    return text;
  }

  let result = text;
  const linkedTerms = new Set<string>();

  // Sort by term length descending (match longer terms first)
  const sortedTerms = [...glossaryTerms].sort(
    (a, b) => b.term.length - a.term.length
  );

  for (const { term, slug } of sortedTerms) {
    const termLower = term.toLowerCase();

    // Skip if already linked this term
    if (linkedTerms.has(termLower)) continue;

    // Create regex for word boundary matching, case-insensitive
    // Handle terms that might start/end with special characters
    const escapedTerm = escapeRegex(term);
    const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'i');

    // Check if term exists in the remaining result
    const match = result.match(regex);
    if (match) {
      // Replace only the first occurrence
      result = result.replace(regex, `{{LINK:${slug}:$1}}`);
      linkedTerms.add(termLower);
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
