#!/usr/bin/env npx tsx
/**
 * Comprehensive Orphan Fix Script
 *
 * Aggressively adds internal links to eliminate orphan pages:
 * 1. Links all remaining orphan conditions from relevant articles
 * 2. Links orphan articles from any article that mentions related topics
 * 3. Adds glossary terms that aren't being matched
 *
 * Usage: npx tsx scripts/fix-all-orphans.ts [--dry-run]
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
}

interface Condition {
  slug: string;
  name: string;
}

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if content already has a link to a URL
function hasLinkTo(content: string, url: string): boolean {
  return content.includes(`](${url})`) || content.includes(`](${url} `) || content.includes(`](${url}#`);
}

// Generate search keywords from a slug/name
function generateKeywords(slug: string, name: string): string[] {
  const keywords: string[] = [];

  // Add the name
  keywords.push(name.toLowerCase());

  // Add slug parts
  const slugParts = slug.split('-').filter(p => p.length > 2);
  keywords.push(...slugParts);

  // Add common variations
  if (name.toLowerCase().includes('pain')) keywords.push('pain', 'painful', 'ache', 'hurt');
  if (name.toLowerCase().includes('anxiety')) keywords.push('anxiety', 'anxious', 'stress', 'nervous');
  if (name.toLowerCase().includes('sleep')) keywords.push('sleep', 'insomnia', 'rest', 'tired');
  if (name.toLowerCase().includes('inflammation')) keywords.push('inflam', 'swelling', 'swollen');
  if (name.toLowerCase().includes('depression')) keywords.push('depress', 'mood', 'sad');
  if (name.toLowerCase().includes('arthritis')) keywords.push('arthrit', 'joint');
  if (name.toLowerCase().includes('skin')) keywords.push('skin', 'acne', 'eczema', 'psoriasis', 'dermat');

  return [...new Set(keywords)];
}

// Find the best place in content to add a "See also" link
function findInsertPosition(content: string): number | null {
  // Look for end of a paragraph in the middle of the article
  const lines = content.split('\n');
  const totalLength = content.length;
  let currentPos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentPos += line.length + 1;

    // Skip if too early or too late
    if (currentPos < totalLength * 0.4) continue;
    if (currentPos > totalLength * 0.6) break;

    // Look for paragraph end (empty line followed by text)
    if (line.trim() === '' && i < lines.length - 1 && lines[i + 1].trim() !== '' &&
        !lines[i + 1].startsWith('#') && !lines[i + 1].startsWith('-') &&
        !lines[i + 1].startsWith('*') && !lines[i + 1].startsWith('>')) {
      return currentPos;
    }
  }

  return null;
}

// Add inline link to an article
function addInlineLink(
  content: string,
  targetSlug: string,
  targetTitle: string,
  linkType: 'condition' | 'article'
): { content: string; added: boolean } {
  const url = linkType === 'condition' ? `/conditions/${targetSlug}` : `/articles/${targetSlug}`;

  if (hasLinkTo(content, url)) {
    return { content, added: false };
  }

  const insertPos = findInsertPosition(content);
  if (!insertPos) {
    return { content, added: false };
  }

  const linkText = `\n> For more information, see our guide on [${targetTitle}](${url}).\n`;

  return {
    content: content.slice(0, insertPos) + linkText + content.slice(insertPos),
    added: true
  };
}

// Find articles that should link to a target
function findRelevantArticles(
  targetSlug: string,
  targetName: string,
  articles: Article[]
): Article[] {
  const keywords = generateKeywords(targetSlug, targetName);
  const relevant: { article: Article; score: number }[] = [];

  for (const article of articles) {
    const contentLower = article.content.toLowerCase();
    const slugLower = article.slug.toLowerCase();

    // Count keyword matches
    let score = 0;
    for (const keyword of keywords) {
      if (contentLower.includes(keyword)) score++;
      if (slugLower.includes(keyword)) score += 2;
    }

    if (score >= 2) {
      relevant.push({ article, score });
    }
  }

  return relevant
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.article);
}

async function fixAllOrphans() {
  console.log('Comprehensive Orphan Fix Script');
  console.log('='.repeat(50));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (updating database)'}\n`);

  // Load orphan data
  let orphanData;
  try {
    orphanData = await import('./orphan-pages.json');
  } catch {
    console.error('Run detect-orphan-pages.ts first to generate orphan-pages.json');
    return;
  }

  const orphanConditions = orphanData.default.filter((p: any) => p.type === 'condition');
  const orphanArticles = orphanData.default.filter((p: any) => p.type === 'article');

  console.log(`Orphan conditions: ${orphanConditions.length}`);
  console.log(`Orphan articles: ${orphanArticles.length}\n`);

  // Fetch articles and conditions
  const [
    { data: articles },
    { data: conditions }
  ] = await Promise.all([
    supabase.from('kb_articles')
      .select('id, slug, title, content')
      .eq('status', 'published')
      .eq('language', 'en'),
    supabase.from('kb_conditions')
      .select('slug, name')
  ]);

  if (!articles || !conditions) {
    console.error('Failed to fetch data');
    return;
  }

  // Track modifications
  const modifiedArticles = new Map<string, { id: string; content: string }>();

  // Stats
  let conditionLinksAdded = 0;
  let articleLinksAdded = 0;

  // Phase 1: Link orphan conditions
  console.log('Phase 1: Linking orphan conditions...');
  for (const orphan of orphanConditions) {
    const condition = conditions.find(c => c.slug === orphan.slug);
    if (!condition) continue;

    const relevantArticles = findRelevantArticles(condition.slug, condition.name, articles);

    for (const article of relevantArticles) {
      // Get current content (possibly modified)
      const existing = modifiedArticles.get(article.id);
      const currentContent = existing ? existing.content : article.content;

      const { content: newContent, added } = addInlineLink(
        currentContent,
        condition.slug,
        condition.name,
        'condition'
      );

      if (added) {
        modifiedArticles.set(article.id, { id: article.id, content: newContent });
        conditionLinksAdded++;
        if (conditionLinksAdded <= 20) {
          console.log(`  ${article.slug} → /conditions/${condition.slug}`);
        }
        break; // One link per orphan is enough
      }
    }
  }

  if (conditionLinksAdded > 20) {
    console.log(`  ... and ${conditionLinksAdded - 20} more`);
  }

  // Phase 2: Link orphan articles
  console.log('\nPhase 2: Linking orphan articles...');
  for (const orphan of orphanArticles.slice(0, 200)) { // Limit to first 200
    const orphanArticle = articles.find(a => a.slug === orphan.slug);
    if (!orphanArticle) continue;

    // Find articles that should link to this one
    const relevantArticles = findRelevantArticles(
      orphanArticle.slug,
      orphanArticle.title,
      articles.filter(a => a.slug !== orphanArticle.slug)
    );

    for (const article of relevantArticles) {
      // Get current content
      const existing = modifiedArticles.get(article.id);
      const currentContent = existing ? existing.content : article.content;

      const { content: newContent, added } = addInlineLink(
        currentContent,
        orphanArticle.slug,
        orphanArticle.title,
        'article'
      );

      if (added) {
        modifiedArticles.set(article.id, { id: article.id, content: newContent });
        articleLinksAdded++;
        if (articleLinksAdded <= 20) {
          console.log(`  ${article.slug} → /articles/${orphanArticle.slug}`);
        }
        break;
      }
    }
  }

  if (articleLinksAdded > 20) {
    console.log(`  ... and ${articleLinksAdded - 20} more`);
  }

  // Apply changes
  if (!DRY_RUN && modifiedArticles.size > 0) {
    console.log(`\nApplying ${modifiedArticles.size} article updates...`);

    let updated = 0;
    for (const [, { id, content }] of modifiedArticles) {
      const { error } = await supabase
        .from('kb_articles')
        .update({ content })
        .eq('id', id);

      if (!error) updated++;
    }

    console.log(`Successfully updated ${updated} articles.`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Condition links added: ${conditionLinksAdded}`);
  console.log(`Article links added: ${articleLinksAdded}`);
  console.log(`Articles modified: ${modifiedArticles.size}`);

  if (DRY_RUN) {
    console.log('\nThis was a DRY RUN. Run without --dry-run to apply changes.');
  }
}

fixAllOrphans().catch(console.error);
