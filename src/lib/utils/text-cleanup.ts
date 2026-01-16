/**
 * Text Cleanup Utilities for Research Scanner
 *
 * Handles:
 * - HTML tag stripping
 * - HTML entity decoding
 * - Whitespace normalization
 */

// HTML entity map for common entities
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&hellip;': '...',
  '&copy;': '(c)',
  '&reg;': '(R)',
  '&trade;': '(TM)',
  '&deg;': ' degrees',
  '&plusmn;': '+/-',
  '&times;': 'x',
  '&divide;': '/',
  '&frac12;': '1/2',
  '&frac14;': '1/4',
  '&frac34;': '3/4',
  '&alpha;': 'alpha',
  '&beta;': 'beta',
  '&gamma;': 'gamma',
  '&delta;': 'delta',
  '&epsilon;': 'epsilon',
  '&micro;': 'u',
  '&pi;': 'pi',
  '&sigma;': 'sigma',
  '&omega;': 'omega',
  '&Prime;': '"',
  '&prime;': "'",
  '&le;': '<=',
  '&ge;': '>=',
  '&ne;': '!=',
  '&asymp;': '~=',
  '&infin;': 'infinity',
  '&sum;': 'sum',
  '&prod;': 'product',
  '&radic;': 'sqrt',
  '&part;': 'partial',
  '&int;': 'integral',
  '&forall;': 'for all',
  '&exist;': 'exists',
  '&empty;': 'empty set',
  '&isin;': 'in',
  '&notin;': 'not in',
  '&sub;': 'subset of',
  '&sup;': 'superset of',
  '&and;': 'and',
  '&or;': 'or',
  '&cap;': 'intersection',
  '&cup;': 'union',
};

/**
 * Decode HTML entities in a string
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  let result = text;

  // Decode named entities
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    result = result.replace(new RegExp(entity, 'gi'), char);
  }

  // Decode numeric entities (decimal)
  result = result.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code, 10);
    return num > 0 && num < 65536 ? String.fromCharCode(num) : '';
  });

  // Decode numeric entities (hex)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    const num = parseInt(code, 16);
    return num > 0 && num < 65536 ? String.fromCharCode(num) : '';
  });

  return result;
}

/**
 * Strip HTML tags from a string, preserving text content
 */
export function stripHtmlTags(text: string): string {
  if (!text) return text;

  // First, handle self-closing tags and common inline tags that might affect spacing
  let result = text
    // Replace <br>, <br/>, <br /> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    // Replace </p>, </div>, </li> with newlines for proper paragraph breaks
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    // Replace <li> with bullet points
    .replace(/<li[^>]*>/gi, '• ')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '');

  return result;
}

/**
 * Normalize whitespace in a string
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return text;

  return text
    // Replace multiple spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with double newline (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Trim overall
    .trim();
}

/**
 * Clean text by stripping HTML and decoding entities
 * Use this for titles, abstracts, and other text fields
 */
export function cleanText(text: string | null | undefined): string | null {
  if (!text) return null;

  let result = text;

  // First decode HTML entities (including double-encoded like &amp;lt;)
  // Run twice to handle double-encoding
  result = decodeHtmlEntities(result);
  result = decodeHtmlEntities(result);

  // Strip HTML tags
  result = stripHtmlTags(result);

  // Normalize whitespace
  result = normalizeWhitespace(result);

  // Return null if empty after cleaning
  return result.length > 0 ? result : null;
}

/**
 * Clean a title specifically - more aggressive cleaning
 */
export function cleanTitle(title: string | null | undefined): string | null {
  if (!title) return null;

  let result = cleanText(title);
  if (!result) return null;

  // Remove any remaining newlines from titles
  result = result.replace(/\n/g, ' ');

  // Normalize multiple spaces again after newline removal
  result = result.replace(/\s+/g, ' ').trim();

  // Remove trailing periods if title ends with multiple
  result = result.replace(/\.{2,}$/, '.');

  return result;
}

/**
 * Clean an abstract specifically
 */
export function cleanAbstract(abstract: string | null | undefined): string | null {
  if (!abstract) return null;

  let result = cleanText(abstract);
  if (!result) return null;

  // Convert single newlines to spaces (keep paragraph breaks as double newlines)
  result = result
    .split('\n\n')
    .map(para => para.replace(/\n/g, ' '))
    .join('\n\n');

  // Normalize spaces
  result = result.replace(/  +/g, ' ');

  return result;
}

/**
 * Extract year from DOI if available
 * DOI format often includes year: 10.xxxx/journal.year.xxxxx
 * or in the metadata
 */
export function extractYearFromDoi(doi: string | null | undefined): number | null {
  if (!doi) return null;

  // Common patterns in DOIs that contain years
  // Pattern 1: 10.xxxx/s12345-2024-xxxxx (year after hyphen)
  // Pattern 2: 10.xxxx/journal.2024.xxxxx (year as segment)
  // Pattern 3: 10.1007/7854_2024_551 (year with underscore)

  const patterns = [
    /[._-](20[0-2]\d)[._-]/,      // 2000-2029 surrounded by separators
    /[._-](19[89]\d)[._-]/,       // 1980-1999 surrounded by separators
    /\.(20[0-2]\d)\./,            // 2000-2029 between dots
    /_(20[0-2]\d)_/,              // 2000-2029 between underscores
    /-(20[0-2]\d)-/,              // 2000-2029 between hyphens
  ];

  for (const pattern of patterns) {
    const match = doi.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      // Validate year is reasonable (not in the future beyond current year + 1)
      const currentYear = new Date().getFullYear();
      if (year >= 1900 && year <= currentYear + 1) {
        return year;
      }
    }
  }

  return null;
}

/**
 * Validate and correct year based on available data
 */
export function validateYear(
  reportedYear: number | null | undefined,
  doi: string | null | undefined,
  publicationDate: string | null | undefined
): number | null {
  const currentYear = new Date().getFullYear();

  // Extract year from DOI as reference
  const doiYear = extractYearFromDoi(doi);

  // Extract year from publication date if available
  let pubDateYear: number | null = null;
  if (publicationDate) {
    const match = publicationDate.match(/(19|20)\d{2}/);
    if (match) {
      pubDateYear = parseInt(match[0], 10);
    }
  }

  // If reported year is clearly wrong (in the future or too old), try to correct
  if (reportedYear) {
    // If year is in the future (beyond next year), it's likely wrong
    if (reportedYear > currentYear + 1) {
      // Use DOI year or publication date year as correction
      return doiYear || pubDateYear || null;
    }

    // If DOI year is available and different by more than 1 year, DOI is likely more accurate
    if (doiYear && Math.abs(reportedYear - doiYear) > 1) {
      return doiYear;
    }

    return reportedYear;
  }

  // No reported year - use DOI or publication date
  return doiYear || pubDateYear || null;
}

/**
 * Clean all text fields in a research item
 */
export function cleanResearchItem(item: {
  title?: string | null;
  abstract?: string | null;
  authors?: string | null;
  publication?: string | null;
  year?: number | null;
  doi?: string | null;
}): {
  title: string | null;
  abstract: string | null;
  authors: string | null;
  publication: string | null;
  year: number | null;
} {
  return {
    title: cleanTitle(item.title),
    abstract: cleanAbstract(item.abstract),
    authors: cleanText(item.authors),
    publication: cleanText(item.publication),
    year: validateYear(item.year, item.doi, null),
  };
}
