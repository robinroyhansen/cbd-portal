#!/usr/bin/env npx tsx
/**
 * Orphan Page Detection Script
 *
 * Identifies pages that have no internal links pointing to them.
 * These "orphan pages" are harder for search engines to discover.
 *
 * Usage: npx tsx scripts/detect-orphan-pages.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface Page {
  type: 'article' | 'condition' | 'glossary' | 'research';
  slug: string;
  title: string;
  url: string;
  inboundLinks: number;
  linkedFrom: string[];
}

interface LinkReference {
  from: string;
  to: string;
}

async function detectOrphanPages() {
  console.log('Orphan Page Detection\n' + '='.repeat(50) + '\n');

  // Fetch all content types
  const [
    { data: articles },
    { data: conditions },
    { data: glossary },
    { data: research }
  ] = await Promise.all([
    supabase.from('kb_articles').select('slug, title, content').eq('status', 'published').eq('language', 'en'),
    supabase.from('kb_conditions').select('slug, name'),
    supabase.from('kb_glossary').select('slug, term'),
    supabase.from('kb_research_queue').select('slug, title').eq('status', 'approved')
  ]);

  // Build page registry
  const pages: Map<string, Page> = new Map();

  // Add articles
  (articles || []).forEach(a => {
    pages.set(`/articles/${a.slug}`, {
      type: 'article',
      slug: a.slug,
      title: a.title,
      url: `/articles/${a.slug}`,
      inboundLinks: 0,
      linkedFrom: []
    });
  });

  // Add conditions
  (conditions || []).forEach(c => {
    pages.set(`/conditions/${c.slug}`, {
      type: 'condition',
      slug: c.slug,
      title: c.name,
      url: `/conditions/${c.slug}`,
      inboundLinks: 0,
      linkedFrom: []
    });
  });

  // Add glossary
  (glossary || []).forEach(g => {
    pages.set(`/glossary/${g.slug}`, {
      type: 'glossary',
      slug: g.slug,
      title: g.term,
      url: `/glossary/${g.slug}`,
      inboundLinks: 0,
      linkedFrom: []
    });
  });

  // Add research pages
  (research || []).forEach(r => {
    if (r.slug) {
      pages.set(`/research/study/${r.slug}`, {
        type: 'research',
        slug: r.slug,
        title: r.title,
        url: `/research/study/${r.slug}`,
        inboundLinks: 0,
        linkedFrom: []
      });
    }
  });

  console.log(`Total pages indexed: ${pages.size}`);
  console.log(`  - Articles: ${(articles || []).length}`);
  console.log(`  - Conditions: ${(conditions || []).length}`);
  console.log(`  - Glossary: ${(glossary || []).length}`);
  console.log(`  - Research: ${(research || []).filter(r => r.slug).length}`);
  console.log();

  // Analyze internal links from article content
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const internalLinkPattern = /^(?:\/|https?:\/\/cbd-portal\.vercel\.app)/;

  let totalLinksFound = 0;

  for (const article of articles || []) {
    if (!article.content) continue;

    const matches = article.content.matchAll(linkPattern);
    const sourceUrl = `/articles/${article.slug}`;

    for (const match of matches) {
      let targetUrl = match[2];

      // Skip external links
      if (!internalLinkPattern.test(targetUrl)) continue;

      // Normalize URL
      targetUrl = targetUrl
        .replace('https://cbd-portal.vercel.app', '')
        .replace(/\/$/, '')
        .split('#')[0]
        .split('?')[0];

      // Find target page
      const targetPage = pages.get(targetUrl);
      if (targetPage) {
        targetPage.inboundLinks++;
        if (!targetPage.linkedFrom.includes(sourceUrl)) {
          targetPage.linkedFrom.push(sourceUrl);
        }
        totalLinksFound++;
      }
    }
  }

  console.log(`Internal links found in articles: ${totalLinksFound}\n`);

  // Navigation links (always linked from nav/footer)
  const navigationPages = [
    '/articles', '/conditions', '/glossary', '/research',
    '/about', '/contact', '/tools', '/pets'
  ];

  // Categorize pages
  const orphanPages: Page[] = [];
  const lowLinkPages: Page[] = [];
  const wellLinkedPages: Page[] = [];

  for (const page of pages.values()) {
    // Skip navigation pages
    if (navigationPages.some(nav => page.url.startsWith(nav) && page.url === nav)) {
      continue;
    }

    if (page.inboundLinks === 0) {
      orphanPages.push(page);
    } else if (page.inboundLinks <= 2) {
      lowLinkPages.push(page);
    } else {
      wellLinkedPages.push(page);
    }
  }

  // Report results
  console.log('ORPHAN PAGES (0 internal links)');
  console.log('-'.repeat(50));
  console.log(`Found ${orphanPages.length} orphan pages\n`);

  // Group by type
  const orphanByType: Record<string, Page[]> = {};
  for (const page of orphanPages) {
    if (!orphanByType[page.type]) orphanByType[page.type] = [];
    orphanByType[page.type].push(page);
  }

  for (const [type, typePages] of Object.entries(orphanByType)) {
    console.log(`\n${type.toUpperCase()} (${typePages.length} orphans):`);
    // Show first 10
    typePages.slice(0, 10).forEach(p => {
      console.log(`  ${p.url}`);
      console.log(`    Title: ${p.title.substring(0, 60)}${p.title.length > 60 ? '...' : ''}`);
    });
    if (typePages.length > 10) {
      console.log(`  ... and ${typePages.length - 10} more`);
    }
  }

  console.log('\n\nLOW-LINK PAGES (1-2 internal links)');
  console.log('-'.repeat(50));
  console.log(`Found ${lowLinkPages.length} low-link pages\n`);

  // Group by type
  const lowByType: Record<string, Page[]> = {};
  for (const page of lowLinkPages) {
    if (!lowByType[page.type]) lowByType[page.type] = [];
    lowByType[page.type].push(page);
  }

  for (const [type, typePages] of Object.entries(lowByType)) {
    console.log(`  ${type}: ${typePages.length} pages`);
  }

  console.log('\n\nSUMMARY');
  console.log('-'.repeat(50));
  console.log(`Orphan pages: ${orphanPages.length} (${((orphanPages.length / pages.size) * 100).toFixed(1)}%)`);
  console.log(`Low-link pages: ${lowLinkPages.length} (${((lowLinkPages.length / pages.size) * 100).toFixed(1)}%)`);
  console.log(`Well-linked pages: ${wellLinkedPages.length} (${((wellLinkedPages.length / pages.size) * 100).toFixed(1)}%)`);

  // Recommendations
  console.log('\n\nRECOMMENDATIONS');
  console.log('-'.repeat(50));

  if (orphanByType['article']?.length > 0) {
    console.log(`\n1. Add RelatedArticles to ${orphanByType['article'].length} orphan articles`);
    console.log('   These articles have no internal links pointing to them.');
  }

  if (orphanByType['condition']?.length > 0) {
    console.log(`\n2. Link ${orphanByType['condition'].length} orphan conditions from related articles`);
    console.log('   Write articles for these conditions or add them to existing content.');
  }

  if (orphanByType['glossary']?.length > 0) {
    console.log(`\n3. Use ${orphanByType['glossary'].length} orphan glossary terms in article content`);
    console.log('   The glossary auto-linker will create links automatically.');
  }

  if (orphanByType['research']?.length > 0) {
    console.log(`\n4. Cite ${orphanByType['research'].length} orphan research studies in articles`);
    console.log('   Add these studies to relevant condition articles.');
  }

  // Export orphan list
  const orphanList = orphanPages.map(p => ({
    type: p.type,
    url: p.url,
    title: p.title,
    slug: p.slug
  }));

  console.log('\n\nExporting orphan page list to scripts/orphan-pages.json...');
  const fs = await import('fs');
  fs.writeFileSync(
    'scripts/orphan-pages.json',
    JSON.stringify(orphanList, null, 2)
  );
  console.log('Done!');
}

detectOrphanPages().catch(console.error);
