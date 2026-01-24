/**
 * Add Glossary Links to Articles
 *
 * Links CBD terms to /glossary/[slug] pages (first mention only)
 *
 * Usage:
 *   node scripts/add-glossary-links.mjs --dry-run
 *   node scripts/add-glossary-links.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

// High-value terms to auto-link (term -> slug)
const GLOSSARY_TERMS = {
  // Core CBD terms
  'CBD': 'cbd',
  'cannabidiol': 'cannabidiol',
  'THC': 'thc',
  'tetrahydrocannabinol': 'thc',
  'cannabinoid': 'cannabinoid',
  'cannabinoids': 'cannabinoid',
  'hemp': 'hemp',
  'cannabis': 'cannabis',

  // Endocannabinoid system
  'endocannabinoid system': 'endocannabinoid-system',
  'ECS': 'endocannabinoid-system',
  'CB1': 'cb1-receptor',
  'CB1 receptor': 'cb1-receptor',
  'CB1 receptors': 'cb1-receptor',
  'CB2': 'cb2-receptor',
  'CB2 receptor': 'cb2-receptor',
  'CB2 receptors': 'cb2-receptor',
  'anandamide': 'anandamide',
  '2-AG': '2-ag',

  // Product types
  'full-spectrum': 'full-spectrum',
  'full spectrum': 'full-spectrum',
  'broad-spectrum': 'broad-spectrum',
  'broad spectrum': 'broad-spectrum',
  'CBD isolate': 'cbd-isolate',
  'isolate': 'cbd-isolate',
  'CBD oil': 'cbd-oil',
  'tincture': 'tincture',
  'edibles': 'edibles',
  'topicals': 'topicals',
  'capsules': 'capsules',

  // Terpenes
  'terpenes': 'terpenes',
  'terpene': 'terpenes',
  'myrcene': 'myrcene',
  'limonene': 'limonene',
  'linalool': 'linalool',
  'pinene': 'pinene',
  'caryophyllene': 'caryophyllene',
  'humulene': 'humulene',

  // Other cannabinoids
  'CBG': 'cbg',
  'cannabigerol': 'cbg',
  'CBN': 'cbn',
  'cannabinol': 'cbn',
  'CBC': 'cbc',
  'CBDA': 'cbda',
  'THCA': 'thca',
  'delta-8': 'delta-8-thc',
  'delta-9': 'delta-9-thc',

  // Science terms
  'bioavailability': 'bioavailability',
  'entourage effect': 'entourage-effect',
  'half-life': 'half-life',
  'first-pass metabolism': 'first-pass-metabolism',
  'sublingual': 'sublingual',
  'decarboxylation': 'decarboxylation',
  'pharmacokinetics': 'pharmacokinetics',

  // Quality/testing
  'certificate of analysis': 'certificate-of-analysis',
  'COA': 'certificate-of-analysis',
  'third-party testing': 'third-party-testing',
  'lab testing': 'lab-testing',
  'MCT oil': 'mct-oil',

  // Regulation
  'Novel Food': 'novel-food',
  'Novel Food Regulation': 'novel-food',
  'FDA': 'fda',
  'Farm Bill': 'farm-bill',
};

/**
 * Check if article already has glossary links
 */
function hasGlossaryLinks(content) {
  return content.includes('/glossary/');
}

/**
 * Check if term is in a heading
 */
function isInHeading(content, position) {
  const beforePos = content.substring(0, position);
  const lineStart = beforePos.lastIndexOf('\n') + 1;
  const line = content.substring(lineStart, content.indexOf('\n', position) || content.length);
  return line.trim().startsWith('#');
}

/**
 * Add glossary links to content
 */
function addGlossaryLinks(content) {
  let updatedContent = content;
  const linkedTerms = new Set();
  let linksAdded = 0;

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = Object.entries(GLOSSARY_TERMS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [term, slug] of sortedTerms) {
    // Skip if we already linked this term or a variant
    if (linkedTerms.has(slug)) continue;

    // Skip if term is already linked in content
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const alreadyLinkedPattern = new RegExp(`\\[${escapedTerm}\\]\\(/glossary/`, 'i');
    if (alreadyLinkedPattern.test(updatedContent)) {
      linkedTerms.add(slug);
      continue;
    }

    // Find first occurrence not in heading, link, or already processed
    // Match term with word boundaries, not inside existing links
    const pattern = new RegExp(
      `(?<!\\[|/|\\w)\\b(${escapedTerm})\\b(?![^\\[]*\\]|[^(]*\\))`,
      'i'
    );

    const match = updatedContent.match(pattern);
    if (match && match.index !== undefined) {
      // Skip if in heading
      if (isInHeading(updatedContent, match.index)) {
        // Try to find next occurrence
        const afterHeading = updatedContent.substring(match.index + match[0].length);
        const nextMatch = afterHeading.match(pattern);
        if (nextMatch && nextMatch.index !== undefined) {
          const actualIndex = match.index + match[0].length + nextMatch.index;
          if (!isInHeading(updatedContent, actualIndex)) {
            const before = updatedContent.substring(0, actualIndex);
            const after = updatedContent.substring(actualIndex + nextMatch[0].length);
            updatedContent = before + `[${nextMatch[1]}](/glossary/${slug})` + after;
            linkedTerms.add(slug);
            linksAdded++;
          }
        }
      } else {
        // Link this occurrence
        const before = updatedContent.substring(0, match.index);
        const after = updatedContent.substring(match.index + match[0].length);
        updatedContent = before + `[${match[1]}](/glossary/${slug})` + after;
        linkedTerms.add(slug);
        linksAdded++;
      }
    }
  }

  return { content: updatedContent, linksAdded };
}

async function main() {
  console.log('\n🔗 Add Glossary Links to Articles\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch articles without glossary links
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, content')
    .not('content', 'is', null);

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  // Filter to those without glossary links
  const needLinks = articles.filter(a => !hasGlossaryLinks(a.content));
  const alreadyHas = articles.length - needLinks.length;

  console.log(`📚 Total articles: ${articles.length}`);
  console.log(`   Already have glossary links: ${alreadyHas}`);
  console.log(`   Need glossary links: ${needLinks.length}\n`);

  let updated = 0;
  let totalLinksAdded = 0;

  for (const article of needLinks) {
    const { content: updatedContent, linksAdded } = addGlossaryLinks(article.content);

    if (linksAdded > 0) {
      updated++;
      totalLinksAdded += linksAdded;

      if (VERBOSE) {
        console.log(`  ${article.slug}: +${linksAdded} links`);
      }

      if (!DRY_RUN) {
        await supabase
          .from('kb_articles')
          .update({ content: updatedContent, updated_at: new Date().toISOString() })
          .eq('id', article.id);
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles ${DRY_RUN ? 'would be ' : ''}updated: ${updated}`);
  console.log(`  Glossary links ${DRY_RUN ? 'would be ' : ''}added: ${totalLinksAdded}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && updated > 0) {
    console.log(`\n✅ Added ${totalLinksAdded} glossary links to ${updated} articles`);
  }
}

main().catch(console.error);
