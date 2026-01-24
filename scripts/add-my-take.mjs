/**
 * Add "My Take" Sections to Articles
 *
 * Generates personalized author perspective sections using AI:
 * - Based on evidence level (study count, types)
 * - Honest assessment matching Robin's voice
 * - E-E-A-T signal for Google
 *
 * Usage:
 *   node scripts/add-my-take.mjs --dry-run              # Preview changes
 *   node scripts/add-my-take.mjs                        # Apply changes
 *   node scripts/add-my-take.mjs --limit=10             # Limit articles
 *   node scripts/add-my-take.mjs --slug=cbd-and-anxiety # Single article
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
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
  'cbd-and-chemotherapy': ['cancer', 'chemo_side_effects'],
  'cbd-and-acne': ['acne'],
  'cbd-and-psoriasis': ['psoriasis'],
  'cbd-and-eczema': ['eczema'],
  'cbd-and-addiction': ['addiction'],
  'cbd-and-ptsd': ['ptsd'],
  'cbd-and-schizophrenia': ['schizophrenia'],
  'cbd-and-alzheimers': ['alzheimers'],
  'cbd-and-parkinsons': ['parkinsons'],
  'cbd-and-multiple-sclerosis': ['ms'],
  'cbd-and-fibromyalgia': ['fibromyalgia'],
  'cbd-and-migraines': ['migraines'],
  'cbd-and-diabetes': ['diabetes'],
  'cbd-and-heart-health': ['heart'],
  'cbd-and-blood-pressure': ['blood_pressure', 'heart'],
  'cbd-and-ibs': ['ibs'],
  'cbd-and-crohns': ['crohns'],
  'cbd-and-nausea': ['nausea'],
  'cbd-and-stress': ['stress'],
  'cbd-and-weight': ['obesity'],
  'cbd-and-adhd': ['adhd'],
  'cbd-and-autism': ['autism'],
  'cbd-and-tourettes': ['tourettes'],
  'cbd-and-glaucoma': ['glaucoma'],
  'cbd-and-eye-health': ['glaucoma'],
  'cbd-and-athletic-recovery': ['athletic'],
  'cbd-and-womens-health': ['womens'],
  'cbd-and-healthy-aging': ['aging'],
  'cbd-and-neurological-health': ['neurological'],
  'cbd-and-covid': ['covid'],

  // Pet articles
  'cbd-for-pets': ['veterinary'],
  'cbd-for-dogs': ['veterinary'],
  'cbd-for-cats': ['veterinary'],
  'cbd-and-pets-research': ['veterinary'],
};

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Check if article already has a My Take section
 */
function hasMyTake(content) {
  return (
    content.includes('## My Take') ||
    content.includes('## My take') ||
    content.includes('### My Take') ||
    content.includes("Here's my honest assessment") ||
    content.includes("here's my honest assessment") ||
    content.includes('my honest take') ||
    content.includes('My honest take')
  );
}

/**
 * Get study statistics for given topics
 */
async function getStudyStats(supabase, topics) {
  const primaryTopic = topics[0];

  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, study_subject, sample_size, quality_score')
    .eq('status', 'approved')
    .contains('relevant_topics', [primaryTopic]);

  if (error || !studies) {
    return null;
  }

  const stats = {
    total: studies.length,
    humanTrials: studies.filter(s => s.study_subject === 'human').length,
    reviews: studies.filter(s => s.study_subject === 'review').length,
    animalStudies: studies.filter(s => s.study_subject === 'animal').length,
    totalParticipants: studies
      .filter(s => s.study_subject === 'human' && s.sample_size)
      .reduce((sum, s) => sum + (s.sample_size || 0), 0),
  };

  // Determine evidence level
  if (stats.total >= 20 && (stats.humanTrials >= 3 || stats.reviews >= 1)) {
    stats.evidenceLevel = 'strong';
  } else if (stats.total >= 10 && (stats.humanTrials >= 1 || stats.reviews >= 1)) {
    stats.evidenceLevel = 'moderate';
  } else if (stats.total >= 5) {
    stats.evidenceLevel = 'limited';
  } else {
    stats.evidenceLevel = 'insufficient';
  }

  return stats;
}

/**
 * Extract condition name from article title or slug
 */
function extractCondition(article) {
  // Try to get from title first
  if (article.title) {
    const match = article.title.match(/CBD (?:and|for) (.+?)(?::|$| -)/i);
    if (match) return match[1].trim();
  }

  // Fall back to slug
  const slug = article.slug;
  if (slug.startsWith('cbd-and-')) {
    return slug.replace('cbd-and-', '').replace(/-/g, ' ');
  }
  if (slug.startsWith('cbd-for-')) {
    return slug.replace('cbd-for-', '').replace(/-/g, ' ');
  }

  return slug.replace(/-/g, ' ');
}

/**
 * Generate My Take section using Claude
 */
async function generateMyTake(anthropic, article, stats, condition) {
  const prompt = `You are Robin Roy Krigslund-Hansen, founder of CBD Portal with 12+ years in the CBD industry. You've personally reviewed over 700 CBD studies.

Write a "My Take" section for an article about CBD and ${condition}.

Research data for this condition:
- Total studies reviewed: ${stats.total}
- Human clinical trials: ${stats.humanTrials}
- Systematic reviews: ${stats.reviews}
- Animal/preclinical studies: ${stats.animalStudies}
- Total human participants across studies: ${stats.totalParticipants}
- Evidence level: ${stats.evidenceLevel.toUpperCase()}

Article excerpt (first 500 chars for context):
${article.content?.substring(0, 500)}...

Write the My Take section following this EXACT format:

## My Take

Having reviewed ${stats.total} studies on CBD and ${condition} — and worked in the CBD industry for over a decade — here's my honest assessment:

[2-3 sentences on your overall impression of the evidence - be specific about what the research shows]

[2 sentences on what's most promising OR most concerning about the research]

[2 sentences of practical advice for someone considering CBD for this condition]

[1 sentence on what future research you're watching for]

IMPORTANT GUIDELINES:
- Evidence level is ${stats.evidenceLevel.toUpperCase()} - match your tone accordingly:
  - STRONG: Be confident and supportive, research genuinely supports trying CBD
  - MODERATE: Be cautiously optimistic, promising but not conclusive
  - LIMITED: Be honest about gaps, note this is early-stage research
  - INSUFFICIENT: Clearly state you can't recommend based on current research
- Be genuine and direct - no corporate speak
- Reference specific aspects when possible (e.g., "the anxiety trials using 300mg doses")
- Always recommend consulting a doctor, especially with medications
- Don't oversell - if evidence is weak, say so
- Keep it under 200 words total
- NO intro text before "## My Take"
- NO closing remarks after the section`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0].text.trim();
  } catch (error) {
    console.error(`  Error generating My Take:`, error.message);
    return null;
  }
}

/**
 * Add My Take section to article content
 */
function addMyTake(content, myTakeMarkdown) {
  // Find the best place to insert (before FAQ, References, or Disclaimer)

  // Try before FAQ
  const faqMatch = content.match(/\n## (?:Frequently Asked Questions|FAQ)\b/i);
  if (faqMatch) {
    const insertPos = content.indexOf(faqMatch[0]);
    return content.substring(0, insertPos) + '\n' + myTakeMarkdown + '\n' + content.substring(insertPos);
  }

  // Try before Related Studies
  const studiesMatch = content.match(/\n## Related Studies\b/i);
  if (studiesMatch) {
    const insertPos = content.indexOf(studiesMatch[0]);
    return content.substring(0, insertPos) + '\n' + myTakeMarkdown + '\n' + content.substring(insertPos);
  }

  // Try before References
  const referencesMatch = content.match(/\n## References\b/i);
  if (referencesMatch) {
    const insertPos = content.indexOf(referencesMatch[0]);
    return content.substring(0, insertPos) + '\n' + myTakeMarkdown + '\n' + content.substring(insertPos);
  }

  // Try before disclaimer
  const disclaimerMatch = content.match(/\n---\s*\n+\*\*(?:Medical )?Disclaimer/i);
  if (disclaimerMatch) {
    const insertPos = content.indexOf(disclaimerMatch[0]);
    return content.substring(0, insertPos) + '\n' + myTakeMarkdown + '\n' + content.substring(insertPos);
  }

  // Fallback: append at end
  return content.trimEnd() + '\n\n' + myTakeMarkdown;
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('\n💭 Add "My Take" Sections to Articles\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}`);
  if (SINGLE_SLUG) console.log(`  Single article: ${SINGLE_SLUG}`);
  console.log(`  Limit: ${LIMIT} articles`);
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

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
    myTakeAdded: 0,
    alreadyHasMyTake: 0,
    noStudiesFound: 0,
    errors: 0,
  };

  const changes = [];

  for (const article of articles) {
    stats.processed++;

    const topics = ARTICLE_TO_TOPICS[article.slug];
    if (!topics) {
      continue;
    }

    // Check if already has My Take
    if (hasMyTake(article.content)) {
      stats.alreadyHasMyTake++;
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: Already has My Take`);
      continue;
    }

    // Get study statistics
    const studyStats = await getStudyStats(supabase, topics);

    if (!studyStats || studyStats.total === 0) {
      stats.noStudiesFound++;
      if (VERBOSE) console.log(`  ⚠️  ${article.slug}: No studies found`);
      continue;
    }

    const condition = extractCondition(article);

    if (DRY_RUN) {
      // In dry run, just report what would be done
      changes.push({
        slug: article.slug,
        condition,
        studies: studyStats.total,
        evidence: studyStats.evidenceLevel,
      });
      stats.myTakeAdded++;
      console.log(`  📝 ${article.slug}: Would add My Take (${studyStats.total} studies, ${studyStats.evidenceLevel})`);
    } else {
      // Generate My Take using Claude
      console.log(`  🤖 ${article.slug}: Generating My Take...`);

      const myTakeMarkdown = await generateMyTake(anthropic, article, studyStats, condition);

      if (!myTakeMarkdown) {
        stats.errors++;
        continue;
      }

      // Add to content
      const updatedContent = addMyTake(article.content, myTakeMarkdown);

      // Save to database
      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.error(`  ❌ Failed to update ${article.slug}:`, updateError.message);
        stats.errors++;
      } else {
        stats.myTakeAdded++;
        changes.push({
          slug: article.slug,
          condition,
          studies: studyStats.total,
          evidence: studyStats.evidenceLevel,
        });
        console.log(`  ✅ ${article.slug}: Added My Take (${studyStats.evidenceLevel})`);
      }

      // Rate limiting - wait between API calls
      await sleep(1000);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles processed: ${stats.processed}`);
  console.log(`  My Take ${DRY_RUN ? 'would be ' : ''}added: ${stats.myTakeAdded}`);
  console.log(`  Already had My Take: ${stats.alreadyHasMyTake}`);
  console.log(`  No studies found: ${stats.noStudiesFound}`);
  if (stats.errors > 0) console.log(`  Errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN && changes.length > 0) {
    console.log('\n📝 My Take sections that would be added:\n');

    // Group by evidence level
    const byLevel = { strong: [], moderate: [], limited: [], insufficient: [] };
    changes.forEach(c => byLevel[c.evidence].push(c));

    for (const [level, items] of Object.entries(byLevel)) {
      if (items.length > 0) {
        console.log(`  ${level.toUpperCase()} evidence (${items.length}):`);
        items.forEach(c => console.log(`    - ${c.slug} (${c.studies} studies)`));
      }
    }

    console.log('\n💡 Run without --dry-run to apply changes');
  }

  if (!DRY_RUN && stats.myTakeAdded > 0) {
    console.log(`\n✅ Successfully added My Take to ${stats.myTakeAdded} articles`);
  }
}

main().catch(console.error);
