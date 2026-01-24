/**
 * Add Related Studies Links to Articles
 *
 * Adds a "Related Studies" section with links to internal study pages:
 * - Top quality studies for the article's topic
 * - Direct links to /research/study/[slug]
 * - "View all X studies" link
 *
 * Usage:
 *   node scripts/add-study-links.mjs --dry-run          # Preview changes
 *   node scripts/add-study-links.mjs                    # Apply changes
 *   node scripts/add-study-links.mjs --limit=10         # Limit articles
 *   node scripts/add-study-links.mjs --slug=cbd-and-anxiety  # Single article
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const SINGLE_SLUG = args.find(a => a.startsWith('--slug='))?.split('=')[1] || null;
const VERBOSE = args.includes('--verbose');

// ============================================================================
// ARTICLE → TOPIC MAPPING
// ============================================================================

const ARTICLE_TO_TOPICS = {
  // Pillar condition articles
  'cbd-and-anxiety': ['anxiety'],
  'cbd-and-depression': ['depression'],
  'cbd-and-sleep': ['sleep'],
  'cbd-and-epilepsy': ['epilepsy'],
  'cbd-and-pain': ['chronic_pain', 'neuropathic_pain'],
  'cbd-and-chronic-pain': ['chronic_pain'],
  'cbd-and-neuropathic-pain': ['neuropathic_pain'],
  'cbd-and-arthritis': ['arthritis', 'inflammation'],
  'cbd-and-inflammation': ['inflammation'],
  'cbd-and-cancer': ['cancer'],
  'cbd-and-chemotherapy': ['cancer', 'nausea'],
  'cbd-and-acne': ['acne', 'skin'],
  'cbd-and-psoriasis': ['psoriasis', 'skin'],
  'cbd-and-eczema': ['eczema', 'skin'],
  'cbd-and-addiction': ['addiction'],
  'cbd-and-ptsd': ['ptsd', 'anxiety'],
  'cbd-and-schizophrenia': ['schizophrenia'],
  'cbd-and-alzheimers': ['alzheimers', 'neurological'],
  'cbd-and-parkinsons': ['parkinsons', 'neurological'],
  'cbd-and-multiple-sclerosis': ['ms', 'neurological'],
  'cbd-and-fibromyalgia': ['fibromyalgia'],
  'cbd-and-migraines': ['migraines'],
  'cbd-and-diabetes': ['diabetes'],
  'cbd-and-heart-health': ['heart'],
  'cbd-and-blood-pressure': ['heart', 'blood_pressure'],
  'cbd-and-ibs': ['ibs'],
  'cbd-and-crohns': ['crohns', 'ibs', 'inflammation'],
  'cbd-and-nausea': ['nausea'],
  'cbd-and-stress': ['stress', 'anxiety'],
  'cbd-and-weight': ['obesity', 'metabolism'],
  'cbd-and-adhd': ['adhd'],
  'cbd-and-autism': ['autism'],
  'cbd-and-tourettes': ['tourettes'],
  'cbd-and-glaucoma': ['glaucoma'],
  'cbd-and-eye-health': ['glaucoma'],
  'cbd-and-athletic-recovery': ['athletic', 'inflammation'],
  'cbd-and-womens-health': ['womens'],
  'cbd-and-healthy-aging': ['aging', 'neurological'],
  'cbd-and-neurological-health': ['neurological'],
  'cbd-and-covid': ['covid', 'inflammation'],

  // Pet articles
  'cbd-for-pets': ['veterinary'],
  'cbd-for-dogs': ['veterinary'],
  'cbd-for-cats': ['veterinary'],

  // Educational articles
  'best-terpenes-for-anxiety': ['anxiety'],
  'best-terpenes-for-sleep': ['sleep'],
  'best-terpenes-for-pain': ['chronic_pain'],
  'best-cbd-oil-for-anxiety-comparison': ['anxiety'],
  'best-cbd-oil-for-sleep-comparison': ['sleep'],
  'best-cbd-oil-for-pain-comparison': ['chronic_pain'],
};

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Check if article already has a Related Studies section
 */
function hasRelatedStudies(content) {
  return (
    content.includes('## Related Studies') ||
    content.includes('## Studies to Explore') ||
    content.includes('## Research Studies') ||
    content.includes('### Related Studies') ||
    content.includes('View all studies') ||
    content.includes('/research/study/')
  );
}

/**
 * Get top studies for given topics
 */
async function getTopStudies(supabase, topics, limit = 5) {
  // Use primary topic for query (most specific)
  const primaryTopic = topics[0];

  // Query top approved studies matching the primary topic using contains
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, slug, title, year, study_subject, sample_size, quality_score')
    .eq('status', 'approved')
    .not('slug', 'is', null)
    .contains('relevant_topics', [primaryTopic])
    .order('quality_score', { ascending: false })
    .limit(50); // Get more to filter

  if (error) {
    console.error('Error fetching studies:', error.message);
    return { studies: [], totalCount: 0 };
  }

  if (!studies || studies.length === 0) {
    return { studies: [], totalCount: 0 };
  }

  // Prioritize human studies and reviews
  const prioritized = studies
    .filter(s => s.slug) // Must have a slug
    .sort((a, b) => {
      // Human/review first
      const aScore = a.study_subject === 'human' ? 100 : a.study_subject === 'review' ? 90 : 0;
      const bScore = b.study_subject === 'human' ? 100 : b.study_subject === 'review' ? 90 : 0;
      if (aScore !== bScore) return bScore - aScore;
      // Then by quality
      return (b.quality_score || 0) - (a.quality_score || 0);
    })
    .slice(0, limit);

  // Get total count
  const { count } = await supabase
    .from('kb_research_queue')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .contains('relevant_topics', [primaryTopic]);

  return {
    studies: prioritized,
    totalCount: count || studies.length,
  };
}

/**
 * Format study title for display
 */
function formatStudyTitle(title, maxLength = 80) {
  if (!title) return 'Untitled Study';

  // Clean up title
  let clean = title
    .replace(/\.$/, '') // Remove trailing period
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  // Truncate if needed
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + '...';
  }

  return clean;
}

/**
 * Generate Related Studies markdown
 */
function generateRelatedStudiesMarkdown(studies, totalCount, topic) {
  const lines = [
    '',
    '---',
    '',
    '## Related Studies',
    '',
    `Explore the research behind this article:`,
    '',
  ];

  for (const study of studies) {
    const title = formatStudyTitle(study.title);
    const year = study.year ? ` (${study.year})` : '';
    const type = study.study_subject === 'human' ? ' - Human Trial' :
                 study.study_subject === 'review' ? ' - Review' : '';

    lines.push(`- [${title}${year}](/research/study/${study.slug})${type}`);
  }

  lines.push('');
  lines.push(`[View all ${totalCount} studies on this topic →](/research?topic=${topic})`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Add Related Studies section to article content
 */
function addRelatedStudies(content, studiesMarkdown) {
  // Find the best place to insert (before References or Disclaimer)

  // Try before References section
  const referencesMatch = content.match(/\n## References\b/i);
  if (referencesMatch) {
    const insertPos = content.indexOf(referencesMatch[0]);
    return content.substring(0, insertPos) + studiesMarkdown + content.substring(insertPos);
  }

  // Try before disclaimer
  const disclaimerMatch = content.match(/\n---\s*\n+\*\*(?:Medical )?Disclaimer/i);
  if (disclaimerMatch) {
    const insertPos = content.indexOf(disclaimerMatch[0]);
    return content.substring(0, insertPos) + studiesMarkdown + content.substring(insertPos);
  }

  // Try before FAQ
  const faqMatch = content.match(/\n## (?:Frequently Asked Questions|FAQ)/i);
  if (faqMatch) {
    const insertPos = content.indexOf(faqMatch[0]);
    return content.substring(0, insertPos) + studiesMarkdown + content.substring(insertPos);
  }

  // Fallback: append at end
  return content.trimEnd() + studiesMarkdown;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('\n🔗 Add Related Studies Links to Articles\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}`);
  if (SINGLE_SLUG) console.log(`  Single article: ${SINGLE_SLUG}`);
  console.log(`  Limit: ${LIMIT} articles`);
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Build query for articles
  let query = supabase
    .from('kb_articles')
    .select('id, title, slug, article_type, content')
    .not('content', 'is', null);

  if (SINGLE_SLUG) {
    query = query.eq('slug', SINGLE_SLUG);
  } else {
    // Only process articles that have topic mappings
    query = query.in('slug', Object.keys(ARTICLE_TO_TOPICS));
  }

  query = query.order('slug').limit(LIMIT);

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch articles:', error.message);
    process.exit(1);
  }

  console.log(`📚 Found ${articles.length} articles with topic mappings\n`);

  const stats = {
    processed: 0,
    linksAdded: 0,
    alreadyHasLinks: 0,
    noStudiesFound: 0,
    errors: 0,
  };

  const changes = [];

  for (const article of articles) {
    stats.processed++;

    const topics = ARTICLE_TO_TOPICS[article.slug];
    if (!topics) {
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: No topic mapping`);
      continue;
    }

    // Check if already has related studies
    if (hasRelatedStudies(article.content)) {
      stats.alreadyHasLinks++;
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: Already has study links`);
      continue;
    }

    // Get top studies
    const { studies, totalCount } = await getTopStudies(supabase, topics);

    if (studies.length === 0) {
      stats.noStudiesFound++;
      if (VERBOSE) console.log(`  ⚠️  ${article.slug}: No studies found for topics: ${topics.join(', ')}`);
      continue;
    }

    // Generate markdown
    const studiesMarkdown = generateRelatedStudiesMarkdown(studies, totalCount, topics[0]);

    // Add to content
    const updatedContent = addRelatedStudies(article.content, studiesMarkdown);

    changes.push({
      slug: article.slug,
      title: article.title?.substring(0, 40),
      studyCount: studies.length,
      totalStudies: totalCount,
    });

    if (!DRY_RUN) {
      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Failed to update ${article.slug}:`, updateError.message);
        stats.errors++;
      } else {
        stats.linksAdded++;
        if (VERBOSE) console.log(`  ✅ ${article.slug}: Added ${studies.length} study links (${totalCount} total)`);
      }
    } else {
      stats.linksAdded++;
    }

    // Progress indicator
    if (stats.processed % 10 === 0) {
      process.stdout.write(`  Processed ${stats.processed}/${articles.length}...\r`);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles processed: ${stats.processed}`);
  console.log(`  Study links ${DRY_RUN ? 'would be ' : ''}added: ${stats.linksAdded}`);
  console.log(`  Already had links: ${stats.alreadyHasLinks}`);
  console.log(`  No studies found: ${stats.noStudiesFound}`);
  if (stats.errors > 0) console.log(`  Errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN && changes.length > 0) {
    console.log('\n📝 Study links that would be added:\n');
    changes.slice(0, 30).forEach(c => {
      console.log(`  ${c.slug}`);
      console.log(`    Links: ${c.studyCount} studies | Total available: ${c.totalStudies}`);
    });
    if (changes.length > 30) {
      console.log(`  ... and ${changes.length - 30} more articles`);
    }
    console.log('\n💡 Run without --dry-run to apply changes');
  }

  if (!DRY_RUN && stats.linksAdded > 0) {
    console.log(`\n✅ Successfully added study links to ${stats.linksAdded} articles`);
  }
}

main().catch(console.error);
