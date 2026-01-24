/**
 * Add Research Snapshots to Articles
 *
 * Adds "Research Snapshot" boxes to condition articles with:
 * - Study counts by type
 * - Links to internal study pages
 * - Evidence strength indicator
 *
 * Usage:
 *   node scripts/add-research-snapshots.mjs --dry-run          # Preview changes
 *   node scripts/add-research-snapshots.mjs                    # Apply changes
 *   node scripts/add-research-snapshots.mjs --limit=10         # Limit articles
 *   node scripts/add-research-snapshots.mjs --slug=cbd-and-anxiety  # Single article
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

// Map article slugs to research database topics (from kb_research_queue.relevant_topics)
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
  'cbd-and-fibromyalgia': ['fibromyalgia', 'pain'],
  'cbd-and-migraines': ['migraines', 'pain'],
  'cbd-and-diabetes': ['diabetes'],
  'cbd-and-heart-health': ['cardiovascular'],
  'cbd-and-blood-pressure': ['cardiovascular', 'blood_pressure'],
  'cbd-and-ibs': ['ibs', 'digestive'],
  'cbd-and-crohns': ['crohns', 'ibs', 'inflammation'],
  'cbd-and-nausea': ['nausea'],
  'cbd-and-stress': ['stress', 'anxiety'],
  'cbd-and-weight': ['obesity', 'metabolism'],
  'cbd-and-adhd': ['adhd'],
  'cbd-and-autism': ['autism'],
  'cbd-and-tourettes': ['tourettes'],
  'cbd-and-glaucoma': ['glaucoma', 'eye'],
  'cbd-and-eye-health': ['eye', 'glaucoma'],
  'cbd-and-athletic-recovery': ['athletic', 'inflammation', 'pain'],
  'cbd-and-womens-health': ['womens_health'],
  'cbd-and-healthy-aging': ['aging', 'neurological'],
  'cbd-and-neurological-health': ['neurological'],
  'cbd-and-covid': ['covid', 'inflammation'],

  // Pet articles
  'cbd-for-pets': ['pets'],
  'cbd-for-dogs': ['pets', 'dogs'],
  'cbd-for-cats': ['pets', 'cats'],
  'cbd-for-horses': ['pets', 'horses'],
  'cbd-for-birds': ['pets'],
  'cbd-for-small-pets': ['pets'],
  'cbd-and-pets-research': ['pets'],

  // Educational articles about specific uses
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
 * Check if article already has a Research Snapshot
 */
function hasResearchSnapshot(content) {
  return (
    content.includes('RESEARCH SNAPSHOT') ||
    content.includes('📊 Research Snapshot') ||
    content.includes('## Research Snapshot') ||
    content.includes('**Research Snapshot**') ||
    content.includes('Studies reviewed:')
  );
}

/**
 * Get study statistics for given topics
 */
async function getStudyStats(supabase, topics) {
  // Use primary topic for query
  const primaryTopic = topics[0];

  // Query all approved studies matching these topics using contains
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, slug, title, study_type, study_subject, sample_size, quality_score')
    .eq('status', 'approved')
    .contains('relevant_topics', [primaryTopic]);

  if (error) {
    console.error('Error fetching studies:', error.message);
    return null;
  }

  if (!studies || studies.length === 0) {
    return null;
  }

  // Calculate statistics
  const stats = {
    total: studies.length,
    humanTrials: 0,
    reviews: 0,
    animalStudies: 0,
    inVitro: 0,
    totalParticipants: 0,
    topStudies: [],
  };

  for (const study of studies) {
    // Count by study subject
    if (study.study_subject === 'human') {
      stats.humanTrials++;
      if (study.sample_size) {
        stats.totalParticipants += study.sample_size;
      }
    } else if (study.study_subject === 'review') {
      stats.reviews++;
    } else if (study.study_subject === 'animal') {
      stats.animalStudies++;
    } else if (study.study_subject === 'in_vitro') {
      stats.inVitro++;
    }
  }

  // Get top studies (highest quality human studies)
  stats.topStudies = studies
    .filter(s => s.study_subject === 'human' || s.study_subject === 'review')
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 5)
    .map(s => ({
      slug: s.slug,
      title: s.title?.substring(0, 60) + (s.title?.length > 60 ? '...' : ''),
    }));

  // Calculate evidence strength
  if (stats.total >= 20 && (stats.humanTrials >= 3 || stats.reviews >= 1)) {
    stats.evidenceStrength = 'Strong';
    stats.evidenceIcon = '●●●●○';
  } else if (stats.total >= 10 && (stats.humanTrials >= 1 || stats.reviews >= 1)) {
    stats.evidenceStrength = 'Moderate';
    stats.evidenceIcon = '●●●○○';
  } else if (stats.total >= 5) {
    stats.evidenceStrength = 'Limited';
    stats.evidenceIcon = '●●○○○';
  } else {
    stats.evidenceStrength = 'Emerging';
    stats.evidenceIcon = '●○○○○';
  }

  return stats;
}

/**
 * Generate Research Snapshot markdown
 */
function generateSnapshotMarkdown(stats, topics) {
  const lines = [
    '> **📊 Research Snapshot**',
    '>',
    `> **Studies reviewed:** ${stats.total}`,
  ];

  if (stats.humanTrials > 0) {
    lines.push(`> **Human clinical trials:** ${stats.humanTrials}`);
  }
  if (stats.reviews > 0) {
    lines.push(`> **Systematic reviews:** ${stats.reviews}`);
  }
  if (stats.totalParticipants > 0) {
    lines.push(`> **Total participants studied:** ${stats.totalParticipants.toLocaleString()}`);
  }

  lines.push(`> **Evidence strength:** ${stats.evidenceIcon} ${stats.evidenceStrength}`);
  lines.push('>');

  // Add link to view all studies
  const topicParam = topics[0];
  lines.push(`> [View all ${stats.total} studies →](/research?topic=${topicParam})`);

  return lines.join('\n');
}

/**
 * Add Research Snapshot to article content
 */
function addResearchSnapshot(content, snapshotMarkdown) {
  // Find the best place to insert:
  // 1. After "The Short Answer" section
  // 2. After the author byline
  // 3. After the H1 title

  // Try to find "The Short Answer" or similar intro section
  const shortAnswerMatch = content.match(/^(.*?(?:##?\s*(?:The Short Answer|Overview|Introduction|Summary)[^\n]*\n+(?:[^\n#]+\n)*?))/is);

  if (shortAnswerMatch && shortAnswerMatch[1].length < content.length * 0.4) {
    const insertPos = shortAnswerMatch[1].length;
    return content.substring(0, insertPos) + '\n' + snapshotMarkdown + '\n\n' + content.substring(insertPos);
  }

  // Try to find after author byline
  const bylineMatch = content.match(/^(.*?By Robin[^\n]*\n(?:.*?(?:January|February|March|April|May|June|July|August|September|October|November|December)[^\n]*\n)?)/is);

  if (bylineMatch) {
    const insertPos = bylineMatch[1].length;
    return content.substring(0, insertPos) + '\n' + snapshotMarkdown + '\n\n' + content.substring(insertPos);
  }

  // Fallback: after H1 title
  const h1Match = content.match(/^(# [^\n]+\n+)/);
  if (h1Match) {
    const insertPos = h1Match[1].length;
    return content.substring(0, insertPos) + snapshotMarkdown + '\n\n' + content.substring(insertPos);
  }

  // Last resort: at the beginning
  return snapshotMarkdown + '\n\n' + content;
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('\n📊 Add Research Snapshots to Articles\n');
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
    snapshotsAdded: 0,
    alreadyHasSnapshot: 0,
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

    // Check if already has snapshot
    if (hasResearchSnapshot(article.content)) {
      stats.alreadyHasSnapshot++;
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: Already has snapshot`);
      continue;
    }

    // Get study statistics
    const studyStats = await getStudyStats(supabase, topics);

    if (!studyStats) {
      stats.noStudiesFound++;
      if (VERBOSE) console.log(`  ⚠️  ${article.slug}: No studies found for topics: ${topics.join(', ')}`);
      continue;
    }

    // Generate snapshot markdown
    const snapshotMarkdown = generateSnapshotMarkdown(studyStats, topics);

    // Add to content
    const updatedContent = addResearchSnapshot(article.content, snapshotMarkdown);

    changes.push({
      slug: article.slug,
      title: article.title?.substring(0, 40),
      topics: topics.join(', '),
      studyCount: studyStats.total,
      evidence: studyStats.evidenceStrength,
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
        stats.snapshotsAdded++;
        if (VERBOSE) console.log(`  ✅ ${article.slug}: Added snapshot (${studyStats.total} studies, ${studyStats.evidenceStrength})`);
      }
    } else {
      stats.snapshotsAdded++;
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
  console.log(`  Snapshots ${DRY_RUN ? 'would be ' : ''}added: ${stats.snapshotsAdded}`);
  console.log(`  Already had snapshot: ${stats.alreadyHasSnapshot}`);
  console.log(`  No studies found: ${stats.noStudiesFound}`);
  if (stats.errors > 0) console.log(`  Errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN && changes.length > 0) {
    console.log('\n📝 Snapshots that would be added:\n');
    changes.forEach(c => {
      console.log(`  ${c.slug}`);
      console.log(`    Topics: ${c.topics} | Studies: ${c.studyCount} | Evidence: ${c.evidence}`);
    });
    console.log('\n💡 Run without --dry-run to apply changes');
  }

  if (!DRY_RUN && stats.snapshotsAdded > 0) {
    console.log(`\n✅ Successfully added ${stats.snapshotsAdded} Research Snapshots`);
  }
}

main().catch(console.error);
