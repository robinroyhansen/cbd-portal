#!/usr/bin/env node

/**
 * Populate citations for CBD Science category articles
 *
 * This script:
 * 1. Fetches all science category articles
 * 2. Parses references from markdown content
 * 3. Extracts PMIDs from PubMed URLs
 * 4. Inserts properly formatted citations into kb_citations
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/populate-science-citations.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgivzyszbpyuvqfmldin.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Extract PMID from PubMed URL
function extractPMID(url) {
  if (!url) return null;
  const match = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
  return match ? match[1] : null;
}

// Extract DOI from URL or text
function extractDOI(text) {
  if (!text) return null;
  // Match DOI patterns
  const match = text.match(/10\.\d{4,}\/[^\s]+/);
  return match ? match[0].replace(/[.,;]$/, '') : null;
}

// Parse a reference line into structured citation
function parseReference(refText) {
  // Common patterns:
  // 1. Author et al. Title. *Journal*. Year;Volume:Pages.
  // 2. Author (Year). Title. Journal, Volume(Issue), Pages.

  const citation = {
    title: '',
    authors: '',
    publication: '',
    year: null,
    url: null,
    doi: null,
    pmid: null
  };

  // Extract year (4-digit number, usually 19xx or 20xx)
  const yearMatch = refText.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    citation.year = parseInt(yearMatch[0]);
  }

  // Extract URL
  const urlMatch = refText.match(/https?:\/\/[^\s)]+/);
  if (urlMatch) {
    citation.url = urlMatch[0].replace(/[.,;]$/, '');
    citation.pmid = extractPMID(citation.url);
  }

  // Extract DOI
  citation.doi = extractDOI(refText);

  // Try to extract authors (text before the year or title)
  // Pattern: Authors. Title. *Journal*.
  const authorMatch = refText.match(/^(\d+\.\s*)?([^.]+(?:\s+et\s+al\.)?)/i);
  if (authorMatch) {
    citation.authors = authorMatch[2].trim();
  }

  // Extract journal from italics (*Journal*) or similar
  const journalMatch = refText.match(/\*([^*]+)\*/);
  if (journalMatch) {
    citation.publication = journalMatch[1].trim();
  }

  // Extract title - typically after authors, before journal
  // This is tricky, so we'll use the full text if we can't parse it
  const parts = refText.split(/\*[^*]+\*/);
  if (parts.length > 0) {
    // Clean up the first part to get title
    let titlePart = parts[0]
      .replace(/^\d+\.\s*/, '') // Remove leading number
      .replace(/^[^.]+\.\s*/, '') // Remove authors section
      .replace(/\s*\(\d{4}\)\s*/, '') // Remove year in parens
      .trim();

    if (titlePart && titlePart.length > 10) {
      citation.title = titlePart;
    }
  }

  // If we couldn't parse title well, use a cleaned version of the full reference
  if (!citation.title || citation.title.length < 10) {
    citation.title = refText
      .replace(/^\d+\.\s*/, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/DOI:\s*[\d.\/\-]+/gi, '')
      .trim()
      .substring(0, 200);
  }

  return citation;
}

// Extract references section from markdown content
function extractReferences(content) {
  // Find References or Sources section
  const refMatch = content.match(/##\s*(?:References|Sources|Citations)\s*\n([\s\S]*?)(?=\n##[^#]|\n---|\n\*Written|\n\*Last|$)/i);

  if (!refMatch) {
    return [];
  }

  const refSection = refMatch[1];
  const references = [];

  // Split by numbered list items
  const items = refSection.split(/\n\d+\.\s+/).filter(item => item.trim().length > 20);

  for (const item of items) {
    const cleaned = item.trim().replace(/\n/g, ' ');
    if (cleaned.length > 20) {
      references.push(cleaned);
    }
  }

  return references;
}

async function populateCitationsForArticle(article) {
  console.log(`\n📄 Processing: "${article.title}" (${article.slug})`);

  // Check existing citations
  const { data: existingCitations, error: checkError } = await supabase
    .from('kb_citations')
    .select('id, title')
    .eq('article_id', article.id);

  if (checkError) {
    console.error(`  ❌ Error checking existing citations:`, checkError.message);
    return { added: 0, skipped: 0, existing: 0 };
  }

  if (existingCitations && existingCitations.length > 0) {
    console.log(`  ℹ️  Already has ${existingCitations.length} citations - skipping`);
    return { added: 0, skipped: 1, existing: existingCitations.length };
  }

  // Extract references from content
  const references = extractReferences(article.content);

  if (references.length === 0) {
    console.log(`  ⚠️  No references section found in content`);
    return { added: 0, skipped: 0, existing: 0 };
  }

  console.log(`  📚 Found ${references.length} references to parse`);

  let added = 0;
  for (const refText of references) {
    const citation = parseReference(refText);

    if (!citation.title || citation.title.length < 10) {
      console.log(`  ⚠️  Skipping malformed reference`);
      continue;
    }

    const { error: insertError } = await supabase
      .from('kb_citations')
      .insert({
        article_id: article.id,
        title: citation.title,
        authors: citation.authors || 'Unknown',
        publication: citation.publication || 'Unknown',
        year: citation.year,
        url: citation.url,
        doi: citation.doi,
        pmid: citation.pmid,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error(`  ❌ Failed to insert citation:`, insertError.message);
    } else {
      console.log(`  ✅ Added: ${citation.authors?.substring(0, 30)}... (${citation.year || 'n/a'})`);
      added++;
    }
  }

  return { added, skipped: 0, existing: 0 };
}

async function main() {
  console.log('🔬 POPULATING CITATIONS FOR SCIENCE ARTICLES');
  console.log('='.repeat(55));

  // Get science category
  const { data: category, error: catError } = await supabase
    .from('kb_categories')
    .select('id, name, slug')
    .eq('slug', 'science')
    .single();

  if (catError || !category) {
    console.error('❌ Could not find science category:', catError?.message);
    process.exit(1);
  }

  console.log(`📁 Found category: ${category.name} (${category.id})`);

  // Get all published articles in science category
  const { data: articles, error: articlesError } = await supabase
    .from('kb_articles')
    .select('id, title, slug, content')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('title');

  if (articlesError) {
    console.error('❌ Error fetching articles:', articlesError.message);
    process.exit(1);
  }

  console.log(`📰 Found ${articles.length} science articles\n`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalExisting = 0;

  for (const article of articles) {
    const result = await populateCitationsForArticle(article);
    totalAdded += result.added;
    totalSkipped += result.skipped;
    totalExisting += result.existing;
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log('='.repeat(55));
  console.log(`Articles processed: ${articles.length}`);
  console.log(`Articles skipped (had citations): ${totalSkipped}`);
  console.log(`Citations added: ${totalAdded}`);
  console.log(`Existing citations: ${totalExisting}`);
  console.log('\n✅ Done!');
}

main().catch(console.error);
