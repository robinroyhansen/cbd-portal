#!/usr/bin/env node

/**
 * Setup and populate citations for CBD Science category articles
 *
 * This script:
 * 1. Adds pmid and slug columns to kb_citations (if not exist)
 * 2. Fetches all science category articles
 * 3. Parses references from markdown content
 * 4. Inserts properly formatted citations into kb_citations
 */

const { createClient } = require('@supabase/supabase-js');

// Load env vars from .env.local manually if not set
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (e) {
    // .env.local might not exist, that's ok
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Extract PMID from PubMed URL
function extractPMID(url) {
  if (!url) return null;
  const match = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
  return match ? match[1] : null;
}

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
    citation.pmid = extractPMID(citation.url);
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

  // Extract authors - text before year or first period
  const cleanedRef = refText.replace(/^\d+\.\s*/, '');
  const authorEndMatch = cleanedRef.match(/^([^.]+(?:\s+et\s+al)?)\./i);
  if (authorEndMatch) {
    citation.authors = authorEndMatch[1].trim();
  }

  // Extract title - between author period and journal/year
  const titleMatch = cleanedRef.match(/\.\s+([^*]+?)\s*\*/);
  if (titleMatch) {
    citation.title = titleMatch[1].trim().replace(/\.$/, '');
  } else {
    // Fallback: use cleaned reference as title
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
  const references = [];

  // Split by numbered list
  const items = refSection.split(/\n\d+\.\s+/).filter(item => item.trim().length > 20);

  for (const item of items) {
    const cleaned = item.trim().replace(/\n/g, ' ');
    if (cleaned.length > 20) {
      references.push(cleaned);
    }
  }

  return references;
}

async function testColumnExists() {
  // Try to select pmid column - if it fails, column doesn't exist
  const { error } = await supabase
    .from('kb_citations')
    .select('pmid')
    .limit(1);

  return !error || !error.message.includes('pmid');
}

async function populateCitationsForArticle(article) {
  console.log(`\n📄 ${article.title}`);
  console.log(`   Slug: ${article.slug}`);

  // Check existing citations
  const { data: existing } = await supabase
    .from('kb_citations')
    .select('id')
    .eq('article_id', article.id);

  if (existing && existing.length > 0) {
    console.log(`   ⏭️  Already has ${existing.length} citations - skipping`);
    return { added: 0, existing: existing.length };
  }

  // Extract references from content
  const references = extractReferences(article.content);

  if (references.length === 0) {
    console.log(`   ⚠️  No references found in content`);
    return { added: 0, existing: 0 };
  }

  console.log(`   📚 Found ${references.length} references`);

  let added = 0;
  for (const refText of references) {
    const citation = parseReference(refText);

    if (!citation.title || citation.title.length < 10) {
      continue;
    }

    const insertData = {
      article_id: article.id,
      title: citation.title,
      authors: citation.authors || 'Unknown',
      publication: citation.publication || 'Unknown',
      year: citation.year,
      url: citation.url,
      doi: citation.doi
    };

    // Only add pmid if column exists
    if (citation.pmid) {
      insertData.pmid = citation.pmid;
    }

    const { error } = await supabase
      .from('kb_citations')
      .insert(insertData);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      added++;
    }
  }

  console.log(`   ✅ Added ${added} citations`);
  return { added, existing: 0 };
}

async function main() {
  console.log('🔬 SETTING UP SCIENCE ARTICLE CITATIONS');
  console.log('='.repeat(55));

  // Check if pmid column exists
  const hasNewColumns = await testColumnExists();
  if (!hasNewColumns) {
    console.log('\n⚠️  The pmid/slug columns need to be added to kb_citations.');
    console.log('   Please run this SQL in Supabase Dashboard:\n');
    console.log('   ALTER TABLE kb_citations ADD COLUMN IF NOT EXISTS pmid TEXT;');
    console.log('   ALTER TABLE kb_citations ADD COLUMN IF NOT EXISTS slug TEXT;\n');
    console.log('   Continuing without pmid/slug fields...\n');
  }

  // Get science category
  const { data: category, error: catError } = await supabase
    .from('kb_categories')
    .select('id, name')
    .eq('slug', 'science')
    .single();

  if (catError || !category) {
    console.error('❌ Could not find science category');
    process.exit(1);
  }

  console.log(`\n📁 Category: ${category.name}`);

  // Get all science articles
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

  console.log(`📰 Found ${articles.length} science articles`);

  let totalAdded = 0;
  let totalExisting = 0;

  for (const article of articles) {
    const result = await populateCitationsForArticle(article);
    totalAdded += result.added;
    totalExisting += result.existing;
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log(`   Articles: ${articles.length}`);
  console.log(`   Citations added: ${totalAdded}`);
  console.log(`   Already existed: ${totalExisting}`);
  console.log('='.repeat(55));
}

main().catch(console.error);
