/**
 * Add Research Snapshots to Articles
 *
 * Generates research summary boxes with real data from kb_research_queue
 * Shows study counts, participant numbers, and evidence strength
 *
 * Usage:
 *   node scripts/add-research-snapshots.mjs --dry-run
 *   node scripts/add-research-snapshots.mjs
 *   node scripts/add-research-snapshots.mjs --limit=100
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const VERBOSE = args.includes('--verbose');

// Topic mapping from article slugs to research topics
const TOPIC_KEYWORDS = {
  'anxiety': ['anxiety', 'anxious', 'stress', 'panic', 'social-anxiety', 'gad'],
  'depression': ['depression', 'depressive', 'mood', 'sad', 'bipolar'],
  'sleep': ['sleep', 'insomnia', 'circadian', 'rest'],
  'pain': ['pain', 'ache', 'chronic-pain', 'neuropathic', 'nerve', 'back-pain', 'arthritis', 'joint'],
  'epilepsy': ['epilepsy', 'seizure', 'convulsion'],
  'inflammation': ['inflammation', 'inflammatory', 'anti-inflammatory', 'autoimmune', 'arthritis'],
  'nausea': ['nausea', 'vomiting', 'antiemetic'],
  'skin': ['skin', 'acne', 'psoriasis', 'eczema', 'derma'],
  'cancer': ['cancer', 'tumor', 'oncology', 'chemotherapy'],
  'ptsd': ['ptsd', 'trauma', 'post-traumatic'],
  'addiction': ['addiction', 'withdrawal', 'opioid', 'smoking', 'alcohol'],
  'diabetes': ['diabetes', 'glucose', 'insulin'],
  'heart': ['heart', 'cardiac', 'cardiovascular', 'blood-pressure'],
  'ibs': ['ibs', 'bowel', 'digestive', 'gut', 'crohn', 'colitis'],
  'migraine': ['migraine', 'headache'],
  'ms': ['multiple-sclerosis', 'ms', 'sclerosis'],
  'autism': ['autism', 'asd', 'autistic'],
  'adhd': ['adhd', 'attention', 'hyperactivity'],
  'schizophrenia': ['schizophrenia', 'psychosis'],
  'glaucoma': ['glaucoma', 'eye', 'intraocular'],
  'obesity': ['obesity', 'weight', 'metabolic'],
  'neuroprotection': ['neuroprotection', 'alzheimer', 'parkinson', 'dementia'],
};

/**
 * Check if article already has Research Snapshot
 */
function hasResearchSnapshot(content) {
  return (
    content.includes('RESEARCH SNAPSHOT') ||
    content.includes('Research Snapshot') ||
    content.includes('Studies reviewed:') ||
    content.includes('| Studies reviewed |')
  );
}

/**
 * Extract topic from article slug/title
 */
function extractTopic(article) {
  const text = (article.slug + ' ' + (article.title || '')).toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.replace(/-/g, ''))) {
        return topic;
      }
    }
  }

  return null;
}

/**
 * Get research statistics for a topic
 */
async function getResearchStats(supabase, topic) {
  // Get studies for this topic
  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, study_subject, sample_size, year, quality_score')
    .eq('status', 'approved')
    .or('primary_topic.eq.' + topic + ',relevant_topics.cs.{' + topic + '}');

  if (error || !studies || studies.length === 0) {
    // Try broader search using title/abstract
    const searchTerm = topic.replace(/_/g, ' ');
    const { data: broader } = await supabase
      .from('kb_research_queue')
      .select('id, study_subject, sample_size, year, quality_score')
      .eq('status', 'approved')
      .or('title.ilike.%' + searchTerm + '%,abstract.ilike.%' + searchTerm + '%')
      .limit(100);

    if (!broader || broader.length < 3) return null;
    return calculateStats(broader, topic);
  }

  return calculateStats(studies, topic);
}

/**
 * Calculate statistics from studies
 */
function calculateStats(studies, topic) {
  const total = studies.length;
  if (total < 3) return null;

  const human = studies.filter(s => s.study_subject === 'human').length;
  const reviews = studies.filter(s => s.study_subject === 'review').length;
  const animal = studies.filter(s => s.study_subject === 'animal').length;

  // Calculate total participants (from human studies with sample_size)
  const participants = studies
    .filter(s => s.study_subject === 'human' && s.sample_size)
    .reduce((sum, s) => sum + (s.sample_size || 0), 0);

  // Evidence strength based on study quality
  let strength;
  if (human >= 10 && reviews >= 2) {
    strength = { rating: 4, label: 'Strong', dots: '●●●●○' };
  } else if (human >= 5 || (human >= 3 && reviews >= 1)) {
    strength = { rating: 3, label: 'Moderate', dots: '●●●○○' };
  } else if (human >= 2 || total >= 10) {
    strength = { rating: 2, label: 'Limited', dots: '●●○○○' };
  } else {
    strength = { rating: 1, label: 'Preliminary', dots: '●○○○○' };
  }

  return {
    total,
    human,
    reviews,
    animal,
    participants,
    strength,
    topic
  };
}

/**
 * Generate Research Snapshot markdown
 */
function generateSnapshot(stats) {
  const topicDisplay = stats.topic
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const lines = [
    '',
    '---',
    '',
    '## Research Snapshot',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    '| Studies reviewed | ' + stats.total + ' |',
  ];

  if (stats.human > 0) {
    lines.push('| Human clinical trials | ' + stats.human + ' |');
  }
  if (stats.reviews > 0) {
    lines.push('| Systematic reviews | ' + stats.reviews + ' |');
  }
  if (stats.animal > 0) {
    lines.push('| Preclinical studies | ' + stats.animal + ' |');
  }
  if (stats.participants > 0) {
    lines.push('| Total participants | ' + stats.participants.toLocaleString() + '+ |');
  }
  lines.push('| Evidence strength | ' + stats.strength.dots + ' ' + stats.strength.label + ' |');

  lines.push('');
  lines.push('*Research on CBD and ' + topicDisplay.toLowerCase() + ' continues to evolve. [Browse all studies](/research)*');
  lines.push('');

  return lines.join('\n');
}

/**
 * Insert Research Snapshot into article
 */
function insertSnapshot(content, snapshot) {
  // Insert after the first heading/intro section
  // Look for first ## heading
  const firstHeading = content.indexOf('\n## ');

  if (firstHeading > 0 && firstHeading < 2000) {
    return content.substring(0, firstHeading) + snapshot + content.substring(firstHeading);
  }

  // Insert after first paragraph
  const firstParaEnd = content.indexOf('\n\n', 200);
  if (firstParaEnd > 0 && firstParaEnd < 1500) {
    return content.substring(0, firstParaEnd) + snapshot + content.substring(firstParaEnd);
  }

  // Fallback: insert at beginning after any frontmatter
  return snapshot + '\n' + content;
}

async function main() {
  console.log('\n📊 Add Research Snapshots to Articles\n');
  console.log('Mode: ' + (DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'));
  console.log('Limit: ' + LIMIT + '\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch articles
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, article_type, content')
    .not('content', 'is', null)
    .in('article_type', ['pillar', 'educational', 'science', 'comparison'])
    .order('article_type')
    .limit(LIMIT);

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  // Filter to articles without snapshots that have identifiable topics
  const candidates = articles.filter(a =>
    !hasResearchSnapshot(a.content) && extractTopic(a)
  );

  const alreadyHas = articles.filter(a => hasResearchSnapshot(a.content)).length;

  console.log('📚 Total articles checked: ' + articles.length);
  console.log('   Already have Research Snapshot: ' + alreadyHas);
  console.log('   Candidates with identifiable topics: ' + candidates.length + '\n');

  if (candidates.length === 0) {
    console.log('No articles need Research Snapshots.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let currentType = '';

  // Cache for research stats by topic
  const statsCache = new Map();

  for (let i = 0; i < candidates.length; i++) {
    const article = candidates[i];
    const topic = extractTopic(article);

    // Type header
    if (article.article_type !== currentType) {
      currentType = article.article_type;
      console.log('\n📁 ' + (currentType ? currentType.toUpperCase() : 'UNKNOWN'));
    }

    // Get or fetch stats for topic
    let stats = statsCache.get(topic);
    if (!stats) {
      stats = await getResearchStats(supabase, topic);
      if (stats) statsCache.set(topic, stats);
    }

    if (!stats) {
      if (VERBOSE) console.log('  ⏭️  ' + article.slug + ': No research data for "' + topic + '"');
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log('  📝 ' + article.slug + ': ' + stats.total + ' studies (' + stats.strength.label + ')');
      updated++;
      continue;
    }

    // Generate and insert snapshot
    const snapshot = generateSnapshot(stats);
    const updatedContent = insertSnapshot(article.content, snapshot);

    const { error: updateError } = await supabase
      .from('kb_articles')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id);

    if (updateError) {
      console.log('  ❌ ' + article.slug);
      skipped++;
    } else {
      console.log('  ✅ ' + article.slug + ': ' + stats.total + ' studies (' + stats.strength.label + ')');
      updated++;
    }

    // Progress marker
    if ((i + 1) % 50 === 0) {
      console.log('\n  --- Progress: ' + (i + 1) + '/' + candidates.length + ' ---\n');
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Research Snapshots ' + (DRY_RUN ? 'would be ' : '') + 'added: ' + updated);
  console.log('  Skipped (no research data): ' + skipped);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && updated > 0) {
    console.log('\n✅ Added Research Snapshots to ' + updated + ' articles');
  }
}

main().catch(console.error);
