/**
 * SEO-Friendly Slug Generator for Research Studies
 *
 * Generates short, readable slugs in the format:
 * cbd-[topic]-[author-lastname]-[year]
 *
 * Examples:
 * - cbd-anxiety-simon-2026
 * - cbd-chronic-pain-johnson-2024
 * - cbd-epilepsy-devinsky-2023
 */

/**
 * Extract the last name from an author string
 *
 * Handles formats like:
 * - "Simon N, Blessing E" → "simon"
 * - "Naomi Simon, MD" → "simon"
 * - "Dr. John Smith PhD" → "smith"
 * - "Smith JA" → "smith"
 */
export function extractLastName(authors: string | null): string | null {
  if (!authors) return null;

  // Get first author (before first comma or semicolon that separates authors)
  const firstAuthor = authors.split(/[,;]/)[0].trim();

  // Remove titles and degrees
  const cleaned = firstAuthor
    .replace(/\b(MD|PhD|Dr|Prof|MS|MPH|BSc|MSc|RN|DO|PharmD)\.?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into parts
  const parts = cleaned.split(/\s+/).filter(p => p.length > 0);

  if (parts.length === 0) return null;

  // If last part looks like initials (1-2 chars), use second-to-last
  // e.g., "Smith JA" → "Smith"
  let lastName = parts[parts.length - 1];
  if (lastName.length <= 2 && parts.length > 1) {
    lastName = parts[parts.length - 2];
  }

  // Clean and return
  return lastName
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, 15) || null;
}

/**
 * Clean a topic string for use in slug
 */
function cleanTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 25);
}

/**
 * Generate an SEO-friendly slug for a research study
 *
 * @param title - The study title (used as fallback)
 * @param topics - Array of topics/conditions
 * @param authors - Author string
 * @param year - Publication year
 * @returns Slug like "cbd-anxiety-simon-2026"
 */
export function generateStudySlug(
  title: string,
  topics: string[] | null,
  authors: string | null,
  year: number | null
): string {
  // Get primary topic
  let topic = 'research';
  if (topics && topics.length > 0 && topics[0]) {
    topic = cleanTopic(topics[0]);
  }

  // If topic is empty or too short, try to extract from title
  if (topic.length < 3) {
    // Look for common conditions in title
    const conditions = [
      'anxiety', 'pain', 'epilepsy', 'sleep', 'depression',
      'cancer', 'inflammation', 'nausea', 'ptsd', 'arthritis',
      'autism', 'schizophrenia', 'parkinson', 'alzheimer',
      'diabetes', 'obesity', 'addiction', 'seizure'
    ];
    const titleLower = title.toLowerCase();
    for (const condition of conditions) {
      if (titleLower.includes(condition)) {
        topic = condition;
        break;
      }
    }
    if (topic.length < 3) {
      topic = 'study';
    }
  }

  // Get author last name
  const authorName = extractLastName(authors) || 'research';

  // Get year
  const yearPart = year ? String(year) : 'nd';

  // Build base slug
  const baseSlug = `cbd-${topic}-${authorName}-${yearPart}`;

  // Clean and limit length
  return baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/**
 * Check if a slug looks like an old-style slug (long with hash)
 */
export function isOldStyleSlug(slug: string): boolean {
  if (!slug) return true;

  // Old slugs are very long (80+ chars)
  if (slug.length > 80) return true;

  // Old slugs often end with a hash like -4139b08b
  if (/-[a-f0-9]{6,}$/i.test(slug)) return true;

  // Old slugs contain lots of hyphens (scientific title)
  const hyphenCount = (slug.match(/-/g) || []).length;
  if (hyphenCount > 10) return true;

  return false;
}
