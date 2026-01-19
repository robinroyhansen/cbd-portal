#!/usr/bin/env node

/**
 * Populate citations for ALL articles (not just science)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Parse a reference line into structured citation
function parseReference(refText) {
  const citation = {
    title: '',
    authors: '',
    publication: '',
    year: null,
    url: null,
    doi: null,
    pmid: null
  };

  // Extract year
  const yearMatch = refText.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    citation.year = parseInt(yearMatch[0]);
  }

  // Extract URL
  const urlMatch = refText.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) {
    citation.url = urlMatch[0].replace(/[.,;]$/, '');
    // Extract PMID from PubMed URL
    const pmidMatch = citation.url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
    if (pmidMatch) citation.pmid = pmidMatch[1];
  }

  // Extract DOI
  const doiMatch = refText.match(/10\.\d{4,}\/[^\s;]+/);
  if (doiMatch) {
    citation.doi = doiMatch[0].replace(/[.,;]$/, '');
  }

  // Extract journal from italics
  const journalMatch = refText.match(/\*([^*]+)\*/);
  if (journalMatch) {
    citation.publication = journalMatch[1].trim();
  }

  // Extract authors
  const cleanedRef = refText.replace(/^\d+\.\s*/, '');
  const authorEndMatch = cleanedRef.match(/^([^.]+(?:\s+et\s+al)?)\./i);
  if (authorEndMatch) {
    citation.authors = authorEndMatch[1].trim();
  }

  // Extract title
  const titleMatch = cleanedRef.match(/\.\s+([^*]+?)\s*\*/);
  if (titleMatch) {
    citation.title = titleMatch[1].trim().replace(/\.$/, '');
  } else {
    citation.title = cleanedRef
      .replace(/\*[^*]+\*\.?/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/;\d+.*$/, '')
      .replace(/^\d+\.\s*/, '')
      .trim()
      .substring(0, 250);
  }

  return citation;
}

// Extract references section from markdown
function extractReferences(content) {
  const refMatch = content.match(/##\s*(?:References|Sources|Citations)\s*\n([\s\S]*?)(?=\n##[^#]|\n---|\n\*Written|\n\*Last|$)/i);
  if (!refMatch) return [];

  const refSection = refMatch[1];
  const items = refSection.split(/\n\d+\.\s+/).filter(item => item.trim().length > 20);

  return items.map(item => item.trim().replace(/\n/g, ' ')).filter(r => r.length > 20);
}

async function populateCitationsForArticle(article) {
  // Check existing citations
  const { data: existing } = await supabase
    .from('kb_citations')
    .select('id')
    .eq('article_id', article.id);

  if (existing && existing.length > 0) {
    return { added: 0, skipped: true, existing: existing.length };
  }

  // Extract references from content
  const references = extractReferences(article.content || '');
  if (references.length === 0) {
    return { added: 0, skipped: false, existing: 0 };
  }

  let added = 0;
  for (const refText of references) {
    const citation = parseReference(refText);
    if (!citation.title || citation.title.length < 10) continue;

    const { error } = await supabase
      .from('kb_citations')
      .insert({
        article_id: article.id,
        title: citation.title,
        authors: citation.authors || 'Unknown',
        publication: citation.publication || 'Unknown',
        year: citation.year,
        url: citation.url,
        doi: citation.doi,
        pmid: citation.pmid
      });

    if (!error) added++;
  }

  return { added, skipped: false, existing: 0 };
}

async function main() {
  console.log('📚 POPULATING CITATIONS FOR ALL ARTICLES');
  console.log('='.repeat(55));

  // Get ALL published articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content, category:kb_categories(name)')
    .eq('status', 'published')
    .order('title');

  if (error) {
    console.error('Error fetching articles:', error.message);
    return;
  }

  console.log(`Found ${articles.length} published articles\n`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalNoRefs = 0;

  for (const article of articles) {
    const categoryName = article.category?.name || 'Unknown';
    process.stdout.write(`[${categoryName}] ${article.title.substring(0, 40)}... `);

    const result = await populateCitationsForArticle(article);

    if (result.skipped) {
      console.log(`⏭️ has ${result.existing}`);
      totalSkipped++;
    } else if (result.added > 0) {
      console.log(`✅ +${result.added}`);
      totalAdded += result.added;
    } else {
      console.log(`⚠️ no refs`);
      totalNoRefs++;
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log(`   Articles processed: ${articles.length}`);
  console.log(`   Already had citations: ${totalSkipped}`);
  console.log(`   No references found: ${totalNoRefs}`);
  console.log(`   Citations added: ${totalAdded}`);
}

main().catch(console.error);
