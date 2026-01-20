/**
 * Table of Contents utilities
 * Extract headers from markdown and count words
 */

export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
  children?: TOCItem[];
}

/**
 * Slugify text to match rehype-slug output
 * Converts "How CBD Works" → "how-cbd-works"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/-+/g, '-')       // Multiple hyphens to single
    .replace(/^-|-$/g, '');    // Trim hyphens from ends
}

/**
 * Extract H2 and H3 headers from markdown content
 * Returns flat array with level info for nesting
 */
export function extractTOCFromMarkdown(markdown: string): TOCItem[] {
  const items: TOCItem[] = [];

  // Match ## and ### headers (not inside code blocks)
  // Skip headers that are part of code blocks by checking for ``` boundaries
  const lines = markdown.split('\n');
  let inCodeBlock = false;

  for (const line of lines) {
    // Track code block state
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // Match H2 headers (## Header)
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      const text = h2Match[1].trim();
      // Skip common non-content headers
      if (shouldIncludeHeader(text)) {
        items.push({
          id: slugify(text),
          text: cleanHeaderText(text),
          level: 2,
        });
      }
      continue;
    }

    // Match H3 headers (### Header)
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      const text = h3Match[1].trim();
      if (shouldIncludeHeader(text)) {
        items.push({
          id: slugify(text),
          text: cleanHeaderText(text),
          level: 3,
        });
      }
    }
  }

  return items;
}

/**
 * Build nested TOC structure (H3s as children of preceding H2)
 */
export function buildNestedTOC(items: TOCItem[]): TOCItem[] {
  const nested: TOCItem[] = [];
  let currentH2: TOCItem | null = null;

  for (const item of items) {
    if (item.level === 2) {
      currentH2 = { ...item, children: [] };
      nested.push(currentH2);
    } else if (item.level === 3 && currentH2) {
      currentH2.children = currentH2.children || [];
      currentH2.children.push(item);
    } else if (item.level === 3) {
      // H3 without parent H2, add as top-level
      nested.push(item);
    }
  }

  return nested;
}

/**
 * Check if header should be included in TOC
 */
function shouldIncludeHeader(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Skip common structural headers that aren't content
  const skipPatterns = [
    'references',
    'sources',
    'disclaimer',
    'related articles',
    'comments',
    'share this',
    'table of contents',
  ];

  return !skipPatterns.some(pattern => lowerText.includes(pattern));
}

/**
 * Clean header text (remove markdown formatting)
 */
function cleanHeaderText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1')     // Remove italic
    .replace(/`(.+?)`/g, '$1')       // Remove code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .trim();
}

/**
 * Count words in text (for 1000+ word threshold)
 */
export function countWords(text: string): number {
  // Remove markdown formatting
  const plainText = text
    .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
    .replace(/`[^`]+`/g, '')          // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links to text
    .replace(/[#*_~`>-]/g, '')        // Remove markdown chars
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();

  if (!plainText) return 0;

  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Check if article should show TOC (1000+ words and 3+ headers)
 */
export function shouldShowTOC(markdown: string): boolean {
  const wordCount = countWords(markdown);
  const headers = extractTOCFromMarkdown(markdown);

  // Show TOC if article has 1000+ words AND at least 3 headers
  return wordCount >= 1000 && headers.length >= 3;
}
