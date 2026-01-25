#!/usr/bin/env npx tsx
/**
 * Article Cross-Link Injection Script
 *
 * Adds links between related articles to reduce orphan pages.
 * Uses topic similarity and content analysis to find relevant links.
 *
 * Usage: npx tsx scripts/inject-article-crosslinks.ts [--dry-run]
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

// Topic keywords for matching
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'pain': ['pain', 'ache', 'discomfort', 'chronic', 'acute', 'relief', 'soreness'],
  'anxiety': ['anxiety', 'anxious', 'worry', 'stress', 'nervous', 'panic', 'calm'],
  'sleep': ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'melatonin', 'circadian'],
  'inflammation': ['inflammation', 'inflammatory', 'swelling', 'inflamed', 'anti-inflammatory'],
  'skin': ['skin', 'acne', 'eczema', 'psoriasis', 'dermatitis', 'topical', 'cream'],
  'depression': ['depression', 'depressed', 'mood', 'sad', 'mental health'],
  'epilepsy': ['epilepsy', 'seizure', 'convulsion', 'dravet', 'lennox'],
  'arthritis': ['arthritis', 'joint', 'rheumatoid', 'osteoarthritis'],
  'pets': ['pet', 'dog', 'cat', 'horse', 'animal', 'veterinary', 'canine', 'feline'],
  'dosage': ['dose', 'dosage', 'mg', 'milligram', 'how much', 'serving'],
  'legal': ['legal', 'law', 'regulation', 'thc limit', 'compliance'],
  'products': ['oil', 'tincture', 'gummy', 'capsule', 'topical', 'vape', 'edible'],
};

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check if content already has a link to a URL
function hasLinkTo(content: string, url: string): boolean {
  return content.includes(`](${url})`) || content.includes(`](${url} `);
}

// Extract topics from article content
function extractTopics(content: string, slug: string): string[] {
  const topics: string[] = [];
  const contentLower = content.toLowerCase();
  const slugLower = slug.toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matchCount = keywords.filter(kw =>
      contentLower.includes(kw) || slugLower.includes(kw)
    ).length;
    if (matchCount >= 2) {
      topics.push(topic);
    }
  }

  return topics;
}

// Find the best paragraph to insert a link
function findBestInsertPoint(content: string, targetTitle: string): number | null {
  // Look for paragraphs that mention related topics
  const paragraphs = content.split('\n\n');
  let bestIndex = -1;
  let totalLength = 0;

  // Look for a paragraph in the middle of the article
  const middleStart = content.length * 0.3;
  const middleEnd = content.length * 0.7;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    totalLength += para.length + 2; // +2 for \n\n

    // Skip if too early or too late in the article
    if (totalLength < middleStart) continue;
    if (totalLength > middleEnd) break;

    // Skip headings, lists, code blocks
    if (para.startsWith('#') || para.startsWith('-') || para.startsWith('*') ||
        para.startsWith('```') || para.startsWith('>')) continue;

    // Skip short paragraphs
    if (para.length < 100) continue;

    // Found a good paragraph
    bestIndex = totalLength - para.length - 2;
    break;
  }

  return bestIndex > 0 ? bestIndex : null;
}

// Add a contextual link to another article
function addArticleLink(
  content: string,
  targetSlug: string,
  targetTitle: string
): string | null {
  const url = `/articles/${targetSlug}`;

  // Skip if already linked
  if (hasLinkTo(content, url)) return null;

  // Find a good place to add the link
  const insertPoint = findBestInsertPoint(content, targetTitle);
  if (!insertPoint) return null;

  // Create the link text
  const linkText = `\n\n> **Related:** [${targetTitle}](${url})\n\n`;

  // Insert the link
  return content.slice(0, insertPoint) + linkText + content.slice(insertPoint);
}

// Find related articles for a given article
function findRelatedArticles(
  article: Article,
  allArticles: Article[],
  limit: number = 3
): Article[] {
  const topics = extractTopics(article.content, article.slug);
  const related: { article: Article; score: number }[] = [];

  for (const other of allArticles) {
    if (other.slug === article.slug) continue;

    // Score based on shared topics
    const otherTopics = extractTopics(other.content, other.slug);
    const sharedTopics = topics.filter(t => otherTopics.includes(t));

    if (sharedTopics.length > 0) {
      related.push({ article: other, score: sharedTopics.length });
    }
  }

  // Sort by score and return top matches
  return related
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.article);
}

async function injectArticleCrosslinks() {
  console.log('Article Cross-Link Injection Script');
  console.log('='.repeat(50));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE (updating database)'}\n`);

  // Fetch orphan articles
  const orphanData = await import('./orphan-pages.json');
  const orphanSlugs = new Set(
    orphanData.default
      .filter((p: any) => p.type === 'article')
      .map((p: any) => p.slug)
  );

  console.log(`Orphan articles to process: ${orphanSlugs.size}`);

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, content, category_id')
    .eq('status', 'published')
    .eq('language', 'en');

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  console.log(`Total articles: ${articles?.length || 0}\n`);

  // Process each orphan article
  let linksAdded = 0;
  let articlesUpdated = 0;

  for (const article of articles || []) {
    if (!orphanSlugs.has(article.slug)) continue;

    // Find related articles that HAVE links (not orphans)
    const wellLinkedArticles = (articles || []).filter(a =>
      !orphanSlugs.has(a.slug) && a.slug !== article.slug
    );

    const related = findRelatedArticles(article, wellLinkedArticles, 2);

    if (related.length === 0) continue;

    // Add link from a well-linked article TO this orphan
    for (const relatedArticle of related) {
      const newContent = addArticleLink(
        relatedArticle.content,
        article.slug,
        article.title
      );

      if (newContent) {
        if (!DRY_RUN) {
          await supabase
            .from('kb_articles')
            .update({ content: newContent })
            .eq('id', relatedArticle.id);
        }

        linksAdded++;
        if (linksAdded <= 30) {
          console.log(`  ${relatedArticle.slug} → ${article.slug}`);
        }
        break; // One link is enough per orphan
      }
    }

    articlesUpdated++;
  }

  if (linksAdded > 30) {
    console.log(`  ... and ${linksAdded - 30} more links`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Orphan articles processed: ${articlesUpdated}`);
  console.log(`Cross-links added: ${linksAdded}`);

  if (DRY_RUN) {
    console.log('\nThis was a DRY RUN. Run without --dry-run to apply changes.');
  } else {
    console.log('\nChanges applied to database.');
  }
}

injectArticleCrosslinks().catch(console.error);
