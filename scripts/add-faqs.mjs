/**
 * Add FAQ Sections to Articles
 *
 * Generates relevant FAQs using AI based on article content
 *
 * Usage:
 *   node scripts/add-faqs.mjs --dry-run              # Preview
 *   node scripts/add-faqs.mjs                        # Apply
 *   node scripts/add-faqs.mjs --limit=50             # Limit
 *   node scripts/add-faqs.mjs --type=educational     # Specific type
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const ARTICLE_TYPE = args.find(a => a.startsWith('--type='))?.split('=')[1] || null;
const VERBOSE = args.includes('--verbose');

/**
 * Check if article already has FAQ section
 */
function hasFAQ(content) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes('## frequently asked questions') ||
    lower.includes('## faq') ||
    lower.includes('### frequently asked questions') ||
    lower.includes('### faq') ||
    lower.includes('## common questions')
  );
}

/**
 * Extract topic from article
 */
function extractTopic(article) {
  if (article.title) {
    return article.title
      .replace(/^(What is |How to |The |A Guide to |Understanding |CBD and )/i, '')
      .replace(/: .+$/, '')
      .trim();
  }
  return article.slug.replace(/-/g, ' ');
}

/**
 * Generate FAQ section using Claude
 */
async function generateFAQ(anthropic, article) {
  const topic = extractTopic(article);
  const contentPreview = article.content?.substring(0, 1500) || '';
  const articleType = article.article_type || 'educational';

  const prompt = `Generate a FAQ section for a CBD Portal article about: ${topic}

Article type: ${articleType}
Article excerpt:
${contentPreview}...

Create 4-5 frequently asked questions that:
1. Are questions real users would search for
2. Don't repeat information already covered in the main article
3. Add value with practical, specific answers
4. Include relevant details (dosages, timeframes, etc. where appropriate)

Format EXACTLY like this (markdown):

## Frequently Asked Questions

### [Question 1]?

[Answer in 2-3 sentences. Be specific and practical.]

### [Question 2]?

[Answer in 2-3 sentences.]

### [Question 3]?

[Answer in 2-3 sentences.]

### [Question 4]?

[Answer in 2-3 sentences.]

IMPORTANT:
- Questions should be natural, like what someone would type in Google
- Answers should be direct and helpful
- Include specific details when relevant (not vague generalities)
- Don't start answers with "Yes," or "No," - just provide the information
- Keep each answer under 75 words
- NO intro text before "## Frequently Asked Questions"`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    let response = message.content[0].text.trim();

    // Ensure proper heading
    if (!response.startsWith('## Frequently Asked Questions')) {
      response = '## Frequently Asked Questions\n\n' + response.replace(/^#+\s*(Frequently Asked Questions|FAQ)\s*/i, '');
    }

    return response;
  } catch (error) {
    if (error.message?.includes('rate') || error.message?.includes('credit')) {
      console.log(`  ⏳ Rate limited, waiting 10s...`);
      await sleep(10000);
      return generateFAQ(anthropic, article);
    }
    console.error(`  Error:`, error.message);
    return null;
  }
}

/**
 * Add FAQ section to article content
 */
function addFAQ(content, faqMarkdown) {
  // Insert before References, Related Studies, My Take (at end), or Disclaimer
  const insertPoints = [
    /\n## References\b/i,
    /\n## Related Studies\b/i,
    /\n## Related Articles\b/i,
    /\n---\s*\n+\*\*(?:Medical )?Disclaimer/i,
  ];

  for (const pattern of insertPoints) {
    const match = content.match(pattern);
    if (match) {
      const insertPos = content.indexOf(match[0]);
      return content.substring(0, insertPos) + '\n\n' + faqMarkdown + '\n' + content.substring(insertPos);
    }
  }

  // Fallback: add at end
  return content.trimEnd() + '\n\n' + faqMarkdown;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n❓ Add FAQ Sections to Articles\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN' : '✏️  APPLY CHANGES'}`);
  if (ARTICLE_TYPE) console.log(`  Type filter: ${ARTICLE_TYPE}`);
  console.log(`  Limit: ${LIMIT}`);
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Fetch articles
  let query = supabase
    .from('kb_articles')
    .select('id, title, slug, article_type, content')
    .not('content', 'is', null);

  if (ARTICLE_TYPE) {
    query = query.eq('article_type', ARTICLE_TYPE);
  }

  query = query.order('article_type').order('slug').limit(LIMIT);

  const { data: articles, error } = await query;

  if (error) {
    console.error('Failed to fetch:', error.message);
    process.exit(1);
  }

  // Filter to those without FAQ
  const needFAQ = articles.filter(a => !hasFAQ(a.content));
  const alreadyHas = articles.length - needFAQ.length;

  console.log(`📚 Found ${articles.length} articles`);
  console.log(`   Already have FAQ: ${alreadyHas}`);
  console.log(`   Need FAQ: ${needFAQ.length}\n`);

  if (needFAQ.length === 0) {
    console.log('✅ All articles already have FAQ sections!');
    return;
  }

  let added = 0, errors = 0;
  let currentType = '';

  for (let i = 0; i < needFAQ.length; i++) {
    const article = needFAQ[i];

    // Type header
    if (article.article_type !== currentType) {
      currentType = article.article_type;
      console.log(`\n📁 ${currentType?.toUpperCase() || 'UNKNOWN'}`);
    }

    if (DRY_RUN) {
      if (VERBOSE) console.log(`  📝 ${article.slug}`);
      added++;
    } else {
      process.stdout.write(`  🤖 ${article.slug.substring(0, 45).padEnd(45)}...`);

      const faqMarkdown = await generateFAQ(anthropic, article);

      if (!faqMarkdown) {
        console.log(' ❌');
        errors++;
        continue;
      }

      const updatedContent = addFAQ(article.content, faqMarkdown);

      const { error: updateError } = await supabase
        .from('kb_articles')
        .update({ content: updatedContent, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.log(' ❌');
        errors++;
      } else {
        console.log(' ✅');
        added++;
      }

      // Rate limiting
      await sleep(700);
    }

    // Progress
    if ((i + 1) % 25 === 0) {
      console.log(`\n  --- Progress: ${i + 1}/${needFAQ.length} ---\n`);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Already had FAQ: ${alreadyHas}`);
  console.log(`  FAQs ${DRY_RUN ? 'would be ' : ''}added: ${added}`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (!DRY_RUN && added > 0) {
    console.log(`\n✅ Added FAQ sections to ${added} articles`);
  }

  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

main().catch(console.error);
