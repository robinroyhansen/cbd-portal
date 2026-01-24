/**
 * Batch Article Fix Script
 *
 * Adds missing:
 * - Author bylines (where not present)
 * - Disclaimers (where not present - careful not to duplicate)
 * - Glossary links (for common terms, first mention only)
 *
 * Usage:
 *   node scripts/batch-fix-articles.mjs --dry-run          # Preview changes
 *   node scripts/batch-fix-articles.mjs                    # Apply changes
 *   node scripts/batch-fix-articles.mjs --type=educational # Fix specific type only
 *   node scripts/batch-fix-articles.mjs --limit=10         # Limit number of articles
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ARTICLE_TYPE = args.find(a => a.startsWith('--type='))?.split('=')[1] || null;
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const VERBOSE = args.includes('--verbose');

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTHOR_BYLINE = `By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Last updated: January 2026`;

const DISCLAIMER_TEXT = `---

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.`;

// Glossary terms to auto-link (term -> slug)
// Only link these high-value terms
const GLOSSARY_TERMS = {
  'CBD': 'cannabidiol',
  'cannabidiol': 'cannabidiol',
  'THC': 'thc',
  'tetrahydrocannabinol': 'thc',
  'endocannabinoid system': 'endocannabinoid-system',
  'ECS': 'endocannabinoid-system',
  'CB1': 'cb1-receptor',
  'CB1 receptor': 'cb1-receptor',
  'CB2': 'cb2-receptor',
  'CB2 receptor': 'cb2-receptor',
  'full-spectrum': 'full-spectrum',
  'full spectrum': 'full-spectrum',
  'broad-spectrum': 'broad-spectrum',
  'broad spectrum': 'broad-spectrum',
  'CBD isolate': 'cbd-isolate',
  'isolate': 'cbd-isolate',
  'terpenes': 'terpenes',
  'terpene': 'terpenes',
  'bioavailability': 'bioavailability',
  'entourage effect': 'entourage-effect',
  'anandamide': 'anandamide',
  '2-AG': '2-ag',
  'Novel Food': 'novel-food',
  'Novel Food Regulation': 'novel-food',
  'certificate of analysis': 'certificate-of-analysis',
  'COA': 'certificate-of-analysis',
  'third-party testing': 'third-party-testing',
  'MCT oil': 'mct-oil',
  'sublingual': 'sublingual',
  'half-life': 'half-life',
  'first-pass metabolism': 'first-pass-metabolism',
  'decarboxylation': 'decarboxylation',
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Check if article already has an author byline
 */
function hasByline(content) {
  const first600 = content.substring(0, 600);
  return (
    first600.match(/By Robin/i) ||
    first600.match(/Robin Roy Krigslund/i) ||
    first600.match(/\d+\+ years in CBD/i) ||
    first600.match(/^By [A-Z][a-z]+ [A-Z]/m)
  );
}

/**
 * Check if article already has a disclaimer
 * Be thorough to avoid duplicates
 */
function hasDisclaimer(content) {
  const lowerContent = content.toLowerCase();
  return (
    lowerContent.includes('medical disclaimer') ||
    lowerContent.includes('**disclaimer:**') ||
    lowerContent.includes('**disclaimer**') ||
    lowerContent.includes('this article is for informational purposes only') ||
    lowerContent.includes('does not constitute medical advice') ||
    lowerContent.includes('consult a healthcare professional before') ||
    lowerContent.includes('not intended as medical advice') ||
    lowerContent.includes('seek professional medical advice') ||
    lowerContent.includes('this content is not medical advice') ||
    (lowerContent.includes('informational purposes') && lowerContent.includes('not medical advice'))
  );
}

/**
 * Check if a term is already linked in the content
 */
function isTermLinked(content, term) {
  // Check if term appears inside a markdown link already
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linkedPattern = new RegExp(`\\[${escapedTerm}\\]\\(/glossary/`, 'i');
  return linkedPattern.test(content);
}

/**
 * Check if term appears in a heading (don't link in headings)
 */
function isInHeading(content, position) {
  // Find the line containing this position
  const beforePos = content.substring(0, position);
  const lineStart = beforePos.lastIndexOf('\n') + 1;
  const line = content.substring(lineStart, content.indexOf('\n', position) || content.length);
  return line.trim().startsWith('#');
}

// ============================================================================
// FIX FUNCTIONS
// ============================================================================

/**
 * Add author byline after the H1 title
 */
function addByline(content) {
  // Find the H1 title line
  const h1Match = content.match(/^# .+$/m);
  if (!h1Match) {
    // No H1 found, add at very beginning
    return AUTHOR_BYLINE + '\n\n---\n\n' + content;
  }

  const h1End = content.indexOf(h1Match[0]) + h1Match[0].length;
  const afterH1 = content.substring(h1End);

  // Check if there's already content right after H1
  const beforeContent = content.substring(0, h1End);

  return beforeContent + '\n\n' + AUTHOR_BYLINE + '\n' + afterH1;
}

/**
 * Add disclaimer at the end of article
 */
function addDisclaimer(content) {
  // Check if content ends with references or sources section
  const trimmedContent = content.trimEnd();

  // Add disclaimer at the very end
  return trimmedContent + '\n\n' + DISCLAIMER_TEXT;
}

/**
 * Add glossary links for first mention of terms
 */
function addGlossaryLinks(content) {
  let updatedContent = content;
  const linkedTerms = new Set();

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = Object.entries(GLOSSARY_TERMS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [term, slug] of sortedTerms) {
    // Skip if already linked
    if (isTermLinked(updatedContent, term)) {
      linkedTerms.add(term.toLowerCase());
      continue;
    }

    // Skip if we already linked a variant of this term
    if (linkedTerms.has(term.toLowerCase())) continue;

    // Find first occurrence that's not in a heading or already linked
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match term with word boundaries, case insensitive
    // But not if it's already inside a link [...] or after a /
    const pattern = new RegExp(
      `(?<!\\[|\\/)\\b(${escapedTerm})\\b(?![^\\[]*\\]|[^\\(]*\\))`,
      'i'
    );

    const match = updatedContent.match(pattern);
    if (match && match.index !== undefined) {
      // Check if in heading
      if (isInHeading(updatedContent, match.index)) {
        // Find next occurrence
        const afterHeading = updatedContent.substring(match.index + match[0].length);
        const nextMatch = afterHeading.match(pattern);
        if (nextMatch && nextMatch.index !== undefined) {
          const actualIndex = match.index + match[0].length + nextMatch.index;
          const before = updatedContent.substring(0, actualIndex);
          const after = updatedContent.substring(actualIndex + nextMatch[0].length);
          updatedContent = before + `[${nextMatch[1]}](/glossary/${slug})` + after;
          linkedTerms.add(term.toLowerCase());
        }
      } else {
        // Link this occurrence
        const before = updatedContent.substring(0, match.index);
        const after = updatedContent.substring(match.index + match[0].length);
        updatedContent = before + `[${match[1]}](/glossary/${slug})` + after;
        linkedTerms.add(term.toLowerCase());
      }
    }
  }

  return updatedContent;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('\n🔧 CBD Portal Article Batch Fixer\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}`);
  console.log(`  Article type filter: ${ARTICLE_TYPE || 'All types'}`);
  console.log(`  Limit: ${LIMIT} articles`);
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Build query
  let query = supabase
    .from('kb_articles')
    .select('id, title, slug, article_type, content')
    .not('content', 'is', null);

  if (ARTICLE_TYPE) {
    query = query.eq('article_type', ARTICLE_TYPE);
  }

  query = query.order('created_at', { ascending: false }).limit(LIMIT);

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch articles:', error.message);
    process.exit(1);
  }

  console.log(`📚 Found ${articles.length} articles to process\n`);

  const stats = {
    processed: 0,
    bylineAdded: 0,
    disclaimerAdded: 0,
    glossaryLinksAdded: 0,
    unchanged: 0,
    errors: 0,
  };

  const changes = [];

  for (const article of articles) {
    stats.processed++;

    let content = article.content;
    let modified = false;
    const articleChanges = [];

    // 1. Check and add byline
    if (!hasByline(content)) {
      content = addByline(content);
      modified = true;
      stats.bylineAdded++;
      articleChanges.push('+ byline');
    }

    // 2. Check and add disclaimer
    if (!hasDisclaimer(content)) {
      content = addDisclaimer(content);
      modified = true;
      stats.disclaimerAdded++;
      articleChanges.push('+ disclaimer');
    }

    // 3. Add glossary links
    const beforeGlossary = content;
    content = addGlossaryLinks(content);
    if (content !== beforeGlossary) {
      modified = true;
      const linkCount = (content.match(/\[.+?\]\(\/glossary\//g) || []).length -
                       (beforeGlossary.match(/\[.+?\]\(\/glossary\//g) || []).length;
      if (linkCount > 0) {
        stats.glossaryLinksAdded += linkCount;
        articleChanges.push(`+ ${linkCount} glossary links`);
      }
    }

    if (modified) {
      changes.push({
        id: article.id,
        title: article.title?.substring(0, 50),
        type: article.article_type,
        changes: articleChanges,
      });

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('kb_articles')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', article.id);

        if (updateError) {
          console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
          stats.errors++;
        } else if (VERBOSE) {
          console.log(`✅ Updated: ${article.title?.substring(0, 50)}...`);
        }
      }
    } else {
      stats.unchanged++;
    }

    // Progress indicator
    if (stats.processed % 50 === 0) {
      process.stdout.write(`  Processed ${stats.processed}/${articles.length}...\r`);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles processed: ${stats.processed}`);
  console.log(`  Bylines added: ${stats.bylineAdded}`);
  console.log(`  Disclaimers added: ${stats.disclaimerAdded}`);
  console.log(`  Glossary links added: ${stats.glossaryLinksAdded}`);
  console.log(`  Unchanged: ${stats.unchanged}`);
  if (stats.errors > 0) console.log(`  Errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN && changes.length > 0) {
    console.log('\n📝 Changes that would be made:\n');
    changes.slice(0, 30).forEach(c => {
      console.log(`  [${c.type}] ${c.title}...`);
      console.log(`    ${c.changes.join(', ')}`);
    });
    if (changes.length > 30) {
      console.log(`  ... and ${changes.length - 30} more articles`);
    }
    console.log('\n💡 Run without --dry-run to apply changes');
  }

  if (!DRY_RUN && changes.length > 0) {
    console.log(`\n✅ Successfully updated ${changes.length} articles`);
  }
}

main().catch(console.error);
