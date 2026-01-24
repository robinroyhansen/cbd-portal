/**
 * Expand Related Studies to More Articles
 *
 * Adds Related Studies section based on keyword matching
 * Works for all article types, not just condition articles
 *
 * Usage:
 *   node scripts/expand-related-studies.mjs --dry-run
 *   node scripts/expand-related-studies.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const VERBOSE = args.includes('--verbose');

// Keywords to search for in studies (extracted from article slug/title)
const KEYWORD_MAP = {
  // Conditions
  'anxiety': ['anxiety', 'anxiolytic', 'anxious', 'GAD', 'social anxiety'],
  'depression': ['depression', 'depressive', 'antidepressant', 'mood'],
  'sleep': ['sleep', 'insomnia', 'circadian', 'sedative'],
  'pain': ['pain', 'analgesic', 'nociceptive', 'chronic pain'],
  'epilepsy': ['epilepsy', 'seizure', 'anticonvulsant', 'Dravet', 'Lennox'],
  'inflammation': ['inflammation', 'inflammatory', 'anti-inflammatory', 'cytokine'],
  'cancer': ['cancer', 'tumor', 'oncology', 'carcinoma', 'apoptosis'],
  'arthritis': ['arthritis', 'rheumatoid', 'joint', 'osteoarthritis'],
  'alzheimer': ['alzheimer', 'dementia', 'cognitive', 'neurodegeneration'],
  'parkinson': ['parkinson', 'dopamine', 'motor'],
  'diabetes': ['diabetes', 'glucose', 'insulin', 'glycemic'],
  'stress': ['stress', 'cortisol', 'HPA axis'],
  'nausea': ['nausea', 'vomiting', 'antiemetic', 'emesis'],
  'addiction': ['addiction', 'withdrawal', 'dependence', 'substance'],
  'ptsd': ['PTSD', 'trauma', 'post-traumatic'],
  'schizophrenia': ['schizophrenia', 'psychosis', 'antipsychotic'],
  'skin': ['skin', 'derma', 'acne', 'psoriasis', 'eczema', 'atopic'],
  'heart': ['heart', 'cardiac', 'cardiovascular', 'blood pressure', 'hypertension'],
  'ibs': ['IBS', 'irritable bowel', 'gut', 'intestinal'],
  'neuropathy': ['neuropathy', 'neuropathic', 'nerve'],
  'migraine': ['migraine', 'headache'],
  'fibromyalgia': ['fibromyalgia'],
  'multiple sclerosis': ['multiple sclerosis', 'MS', 'demyelinating'],
  'autism': ['autism', 'ASD', 'autistic'],
  'adhd': ['ADHD', 'attention deficit', 'hyperactivity'],
  'glaucoma': ['glaucoma', 'intraocular pressure', 'IOP'],
  'obesity': ['obesity', 'weight', 'metabolic', 'adipose'],

  // General terms
  'bioavailability': ['bioavailability', 'absorption', 'pharmacokinetic'],
  'receptor': ['receptor', 'CB1', 'CB2', 'binding'],
  'terpene': ['terpene', 'myrcene', 'limonene', 'linalool', 'pinene'],
  'cannabinoid': ['cannabinoid', 'CBD', 'THC', 'CBG', 'CBN'],
  'endocannabinoid': ['endocannabinoid', 'ECS', 'anandamide', '2-AG'],
  'pet': ['veterinary', 'canine', 'feline', 'dog', 'cat', 'animal'],
  'athlete': ['athlete', 'sport', 'exercise', 'recovery', 'performance'],
};

/**
 * Check if article already has Related Studies
 */
function hasRelatedStudies(content) {
  return (
    content.includes('## Related Studies') ||
    content.includes('/research/study/')
  );
}

/**
 * Extract keywords from article slug and title
 */
function extractKeywords(article) {
  const text = `${article.slug} ${article.title || ''}`.toLowerCase();
  const keywords = [];

  for (const [key, terms] of Object.entries(KEYWORD_MAP)) {
    if (text.includes(key.toLowerCase())) {
      keywords.push(...terms);
    }
  }

  // If no matches, try broader extraction
  if (keywords.length === 0) {
    // Extract key terms from slug
    const slugWords = article.slug.split('-').filter(w => w.length > 3);
    keywords.push(...slugWords);
  }

  return [...new Set(keywords)]; // Deduplicate
}

/**
 * Search for relevant studies by keywords
 */
async function findRelevantStudies(supabase, keywords, limit = 5) {
  if (keywords.length === 0) return [];

  // Build search query - search in title and abstract
  const searchTerms = keywords.slice(0, 5).join(' | '); // Use OR search

  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, slug, title, year, study_subject, quality_score')
    .eq('status', 'approved')
    .not('slug', 'is', null)
    .or(`title.ilike.%${keywords[0]}%,abstract.ilike.%${keywords[0]}%`)
    .order('quality_score', { ascending: false })
    .limit(30);

  if (error || !studies || studies.length === 0) {
    return [];
  }

  // Score and rank studies by keyword matches
  const scored = studies.map(study => {
    let score = study.quality_score || 0;
    const titleLower = (study.title || '').toLowerCase();

    // Boost for keyword matches
    for (const kw of keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        score += 10;
      }
    }

    // Boost for human studies
    if (study.study_subject === 'human') score += 20;
    if (study.study_subject === 'review') score += 15;

    return { ...study, matchScore: score };
  });

  // Sort by match score and return top results
  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/**
 * Generate Related Studies markdown
 */
function generateRelatedStudiesMarkdown(studies, keywords) {
  const lines = [
    '',
    '---',
    '',
    '## Related Studies',
    '',
    'Research related to this topic:',
    '',
  ];

  for (const study of studies) {
    const title = (study.title || 'Untitled')
      .replace(/\.$/, '')
      .substring(0, 80);
    const suffix = study.title?.length > 80 ? '...' : '';
    const year = study.year ? ` (${study.year})` : '';
    const type = study.study_subject === 'human' ? ' - Human Trial' :
                 study.study_subject === 'review' ? ' - Review' : '';

    lines.push(`- [${title}${suffix}${year}](/research/study/${study.slug})${type}`);
  }

  lines.push('');
  lines.push(`[Browse all CBD research →](/research)`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Add Related Studies section to article
 */
function addRelatedStudies(content, markdown) {
  // Insert before References, FAQ, or Disclaimer
  const patterns = [
    /\n## References\b/i,
    /\n## Frequently Asked Questions\b/i,
    /\n## FAQ\b/i,
    /\n---\s*\n+\*\*(?:Medical )?Disclaimer/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const pos = content.indexOf(match[0]);
      return content.substring(0, pos) + markdown + content.substring(pos);
    }
  }

  return content.trimEnd() + markdown;
}

async function main() {
  console.log('\n🔬 Expand Related Studies to Articles\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}`);
  console.log(`Limit: ${LIMIT}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch articles without Related Studies
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, article_type, content')
    .not('content', 'is', null)
    .order('article_type')
    .limit(LIMIT);

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  const needStudies = articles.filter(a => !hasRelatedStudies(a.content));
  const alreadyHas = articles.length - needStudies.length;

  console.log(`📚 Total articles: ${articles.length}`);
  console.log(`   Already have Related Studies: ${alreadyHas}`);
  console.log(`   Need Related Studies: ${needStudies.length}\n`);

  let updated = 0;
  let noMatches = 0;
  let currentType = '';

  for (let i = 0; i < needStudies.length; i++) {
    const article = needStudies[i];

    // Type header
    if (article.article_type !== currentType) {
      currentType = article.article_type;
      console.log(`\n📁 ${currentType?.toUpperCase() || 'UNKNOWN'}`);
    }

    // Extract keywords and find studies
    const keywords = extractKeywords(article);

    if (keywords.length === 0) {
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: No keywords`);
      noMatches++;
      continue;
    }

    const studies = await findRelevantStudies(supabase, keywords);

    if (studies.length === 0) {
      if (VERBOSE) console.log(`  ⏭️  ${article.slug}: No matching studies`);
      noMatches++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  📝 ${article.slug}: ${studies.length} studies`);
      updated++;
    } else {
      const markdown = generateRelatedStudiesMarkdown(studies, keywords);
      const updatedContent = addRelatedStudies(article.content, markdown);

      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.log(`  ❌ ${article.slug}`);
      } else {
        console.log(`  ✅ ${article.slug}: +${studies.length} studies`);
        updated++;
      }
    }

    // Progress
    if ((i + 1) % 50 === 0) {
      console.log(`\n  --- Progress: ${i + 1}/${needStudies.length} ---\n`);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles ${DRY_RUN ? 'would be ' : ''}updated: ${updated}`);
  console.log(`  No matching studies: ${noMatches}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && updated > 0) {
    console.log(`\n✅ Added Related Studies to ${updated} articles`);
  }
}

main().catch(console.error);
