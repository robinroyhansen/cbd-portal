/**
 * Add Key Numbers Boxes to Articles
 *
 * Adds statistics/data highlight boxes to condition and health articles
 * Uses Claude AI to extract relevant numbers from article content
 *
 * Usage:
 *   node scripts/add-key-numbers.mjs --dry-run
 *   node scripts/add-key-numbers.mjs
 *   node scripts/add-key-numbers.mjs --limit=50
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '500', 10);
const VERBOSE = args.includes('--verbose');

const anthropic = new Anthropic();

/**
 * Check if article already has Key Numbers
 */
function hasKeyNumbers(content) {
  return content.includes('## Key Numbers') || content.includes('Key Numbers:');
}

/**
 * Check if article could benefit from Key Numbers
 * Now accepts all articles - let the AI decide if there are meaningful stats
 */
function isEligibleForKeyNumbers(article) {
  // All articles are eligible - the AI will skip if no stats found
  return true;
}

/**
 * Generate Key Numbers using Claude AI
 */
async function generateKeyNumbers(article) {
  const prompt = `Extract 3-5 key statistics or numbers from this CBD article to create a "Key Numbers" box.

Article Title: ${article.title}
Article Type: ${article.article_type}

Content:
${article.content.substring(0, 4000)}

Create a markdown table with key statistics. Focus on:
- Research statistics (number of studies, participant counts, success rates)
- Dosage information (common ranges, recommendations)
- Timing data (onset, duration, peak effects)
- Prevalence statistics (how many people affected by condition)
- Efficacy percentages from studies

Format as a markdown table like this:
## Key Numbers: [Topic]

| Metric | Value |
|--------|-------|
| [Stat name] | [Value] |
| [Stat name] | [Value] |
| [Stat name] | [Value] |

[One sentence of context about these numbers]

Rules:
- Only include numbers/statistics that appear in or can be reasonably inferred from the article
- If no concrete numbers exist, use ranges from CBD research (e.g., "10-50mg typical dose")
- Keep the table to 3-5 rows maximum
- Make the topic name specific (e.g., "CBD for Anxiety Research" not just "Key Numbers")
- Add a brief 1-2 sentence note after the table for context

Return ONLY the markdown for the Key Numbers section, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0]?.text?.trim();

    // Validate response has a table
    if (!content || !content.includes('|') || !content.includes('Key Numbers')) {
      return null;
    }

    return content;
  } catch (error) {
    if (VERBOSE) console.log(`    API Error: ${error.message}`);
    return null;
  }
}

/**
 * Insert Key Numbers section into article content
 */
function insertKeyNumbers(content, keyNumbers) {
  // Insert after the first major section (after intro, before main content)
  // Look for the second ## heading
  const headingMatches = [...content.matchAll(/\n## [^\n]+/g)];

  if (headingMatches.length >= 2) {
    // Insert before the second heading
    const insertPos = headingMatches[1].index;
    return content.substring(0, insertPos) + '\n' + keyNumbers + '\n' + content.substring(insertPos);
  }

  // Alternative: Insert after first paragraph block
  const firstParaEnd = content.indexOf('\n\n', content.indexOf('\n\n') + 2);
  if (firstParaEnd > 0 && firstParaEnd < 1000) {
    return content.substring(0, firstParaEnd) + '\n\n' + keyNumbers + content.substring(firstParaEnd);
  }

  // Fallback: Insert near beginning after any frontmatter
  const contentStart = content.indexOf('\n\n');
  if (contentStart > 0) {
    return content.substring(0, contentStart + 2) + keyNumbers + '\n\n' + content.substring(contentStart + 2);
  }

  return keyNumbers + '\n\n' + content;
}

async function main() {
  console.log('\n📊 Add Key Numbers to Articles\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}`);
  console.log(`Limit: ${LIMIT}\n`);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Fetch articles
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

  // Filter to health articles without Key Numbers
  const candidates = articles.filter(a =>
    !hasKeyNumbers(a.content) && isEligibleForKeyNumbers(a)
  );

  const alreadyHas = articles.filter(a => hasKeyNumbers(a.content)).length;

  console.log(`📚 Total articles: ${articles.length}`);
  console.log(`   Already have Key Numbers: ${alreadyHas}`);
  console.log(`   Health articles needing Key Numbers: ${candidates.length}\n`);

  if (candidates.length === 0) {
    console.log('No articles need Key Numbers boxes.');
    return;
  }

  let updated = 0;
  let failed = 0;
  let currentType = '';

  for (let i = 0; i < candidates.length; i++) {
    const article = candidates[i];

    // Type header
    if (article.article_type !== currentType) {
      currentType = article.article_type;
      console.log(`\n📁 ${currentType?.toUpperCase() || 'UNKNOWN'}`);
    }

    process.stdout.write(`  🤖 ${article.slug.padEnd(45)} ...`);

    if (DRY_RUN) {
      console.log(' [would generate]');
      updated++;
      continue;
    }

    // Generate Key Numbers
    const keyNumbers = await generateKeyNumbers(article);

    if (!keyNumbers) {
      console.log(' ⏭️  (no numbers found)');
      failed++;
      continue;
    }

    // Insert into content
    const updatedContent = insertKeyNumbers(article.content, keyNumbers);

    // Save to database
    const { error: updateError } = await supabase
      .from('kb_articles')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id);

    if (updateError) {
      console.log(' ❌');
      failed++;
    } else {
      console.log(' ✅');
      updated++;
    }

    // Progress marker
    if ((i + 1) % 25 === 0) {
      console.log(`\n  --- Progress: ${i + 1}/${candidates.length} ---\n`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Key Numbers ${DRY_RUN ? 'would be ' : ''}added: ${updated}`);
  console.log(`  Skipped/Failed: ${failed}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && updated > 0) {
    console.log(`\n✅ Added Key Numbers to ${updated} articles`);
  }
}

main().catch(console.error);
