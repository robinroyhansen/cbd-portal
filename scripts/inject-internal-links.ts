#!/usr/bin/env npx tsx
/**
 * Internal Link Injection Script
 *
 * Adds internal links to article content to improve SEO and reduce orphan pages:
 * 1. Links condition names to their condition pages
 * 2. Adds related article sections
 * 3. Links research references to study pages
 *
 * Usage: npx tsx scripts/inject-internal-links.ts [--dry-run]
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const DRY_RUN = process.argv.includes('--dry-run');

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  category_id: string | null;
}

interface Condition {
  slug: string;
  name: string;
}

interface RelatedArticle {
  slug: string;
  title: string;
}

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if text already contains a link to a URL
function hasLinkTo(content: string, url: string): boolean {
  const urlPattern = escapeRegex(url);
  return new RegExp(`\\]\\(${urlPattern}\\)`, 'i').test(content);
}

// Add condition links to content
function addConditionLinks(
  content: string,
  conditions: Condition[],
  currentSlug: string
): { content: string; linksAdded: string[] } {
  let result = content;
  const linksAdded: string[] = [];

  // Sort by name length (longest first) to avoid partial matches
  const sortedConditions = [...conditions].sort((a, b) => b.name.length - a.name.length);

  for (const condition of sortedConditions) {
    // Skip if this is the current article's condition
    if (currentSlug.includes(condition.slug)) continue;

    const url = `/conditions/${condition.slug}`;

    // Skip if already linked
    if (hasLinkTo(result, url)) continue;

    // Create pattern to match condition name (case insensitive, word boundary)
    // Only match plain text, not already inside a link or heading
    const namePattern = escapeRegex(condition.name);
    const regex = new RegExp(
      // Negative lookbehind for [ or ( (inside a link) or # (heading)
      `(?<![\\[\\(#])\\b(${namePattern})\\b(?![\\]\\)])`,
      'i'
    );

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      // Only link first occurrence
      const before = result.slice(0, match.index);
      const after = result.slice(match.index + match[0].length);
      const linkedText = `[${match[1]}](${url})`;
      result = before + linkedText + after;
      linksAdded.push(condition.name);
    }
  }

  return { content: result, linksAdded };
}

// Add related articles section if not present
function addRelatedArticlesSection(
  content: string,
  relatedArticles: RelatedArticle[],
  currentSlug: string
): { content: string; articlesAdded: number } {
  // Check if already has a related articles section
  if (/##\s*(?:Related|See Also|Further Reading)/i.test(content)) {
    return { content, articlesAdded: 0 };
  }

  // Filter out current article
  const filtered = relatedArticles.filter(a => a.slug !== currentSlug).slice(0, 4);
  if (filtered.length === 0) {
    return { content, articlesAdded: 0 };
  }

  // Build related articles section
  const section = `\n\n## Related Articles\n\n${filtered.map(a =>
    `- [${a.title}](/articles/${a.slug})`
  ).join('\n')}\n`;

  // Insert before disclaimer or at end
  const disclaimerMatch = content.match(/\n---\s*\n/);
  if (disclaimerMatch && disclaimerMatch.index) {
    const before = content.slice(0, disclaimerMatch.index);
    const after = content.slice(disclaimerMatch.index);
    return { content: before + section + after, articlesAdded: filtered.length };
  }

  return { content: content + section, articlesAdded: filtered.length };
}

// Find related articles based on category and topic overlap
async function findRelatedArticles(
  article: Article,
  allArticles: Article[]
): Promise<RelatedArticle[]> {
  const related: RelatedArticle[] = [];

  // Extract topic from slug (e.g., 'cbd-and-anxiety' -> 'anxiety')
  const topic = article.slug
    .replace(/^cbd[-\s](?:and|for|oil[-\s]for)[-\s]/i, '')
    .replace(/[-\s]guide$/i, '')
    .toLowerCase();

  // Find articles with similar topics
  for (const other of allArticles) {
    if (other.slug === article.slug) continue;

    const otherTopic = other.slug
      .replace(/^cbd[-\s](?:and|for|oil[-\s]for)[-\s]/i, '')
      .replace(/[-\s]guide$/i, '')
      .toLowerCase();

    // Match by category
    if (article.category_id && other.category_id === article.category_id) {
      related.push({ slug: other.slug, title: other.title });
      continue;
    }

    // Match by topic similarity
    if (topic && otherTopic) {
      if (topic.includes(otherTopic) || otherTopic.includes(topic)) {
        related.push({ slug: other.slug, title: other.title });
      }
    }
  }

  return related.slice(0, 6);
}

// Main function
async function injectInternalLinks() {
  console.log('Internal Link Injection Script');
  console.log('='.repeat(50));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (updating database)'}\n`);

  // Fetch all data
  console.log('Fetching data...');

  const [
    { data: articles, error: articlesError },
    { data: conditions, error: conditionsError }
  ] = await Promise.all([
    supabase.from('kb_articles')
      .select('id, slug, title, content, category_id')
      .eq('status', 'published')
      .eq('language', 'en'),
    supabase.from('kb_conditions')
      .select('slug, name')
  ]);

  if (articlesError || conditionsError) {
    console.error('Error fetching data:', articlesError || conditionsError);
    return;
  }

  console.log(`  Articles: ${articles?.length || 0}`);
  console.log(`  Conditions: ${conditions?.length || 0}\n`);

  // Stats
  let articlesUpdated = 0;
  let totalConditionLinks = 0;
  let totalRelatedSections = 0;

  // Process each article
  console.log('Processing articles...\n');

  for (const article of articles || []) {
    let content = article.content;
    let modified = false;
    const changes: string[] = [];

    // 1. Add condition links
    const { content: withConditions, linksAdded } = addConditionLinks(
      content,
      conditions || [],
      article.slug
    );
    if (linksAdded.length > 0) {
      content = withConditions;
      modified = true;
      totalConditionLinks += linksAdded.length;
      changes.push(`+${linksAdded.length} condition links`);
    }

    // 2. Find and add related articles
    const relatedArticles = await findRelatedArticles(article, articles || []);
    const { content: withRelated, articlesAdded } = addRelatedArticlesSection(
      content,
      relatedArticles,
      article.slug
    );
    if (articlesAdded > 0) {
      content = withRelated;
      modified = true;
      totalRelatedSections++;
      changes.push(`+related section (${articlesAdded} articles)`);
    }

    // Update if modified
    if (modified) {
      articlesUpdated++;

      if (!DRY_RUN) {
        const { error } = await supabase
          .from('kb_articles')
          .update({ content })
          .eq('id', article.id);

        if (error) {
          console.error(`  Error updating ${article.slug}:`, error.message);
        }
      }

      // Log first 20 updates
      if (articlesUpdated <= 20) {
        console.log(`  ${article.slug}: ${changes.join(', ')}`);
      }
    }
  }

  if (articlesUpdated > 20) {
    console.log(`  ... and ${articlesUpdated - 20} more articles`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Articles processed: ${articles?.length || 0}`);
  console.log(`Articles updated: ${articlesUpdated}`);
  console.log(`Condition links added: ${totalConditionLinks}`);
  console.log(`Related article sections added: ${totalRelatedSections}`);

  if (DRY_RUN) {
    console.log('\nThis was a DRY RUN. Run without --dry-run to apply changes.');
  } else {
    console.log('\nChanges applied to database.');
  }
}

injectInternalLinks().catch(console.error);
