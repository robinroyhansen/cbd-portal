/**
 * Add "My Take" Sections to ALL Article Types
 *
 * Generates personalized author perspective for:
 * - Product guides (product-guide, guide, terpene-profile)
 * - Educational articles (educational-guide, educational)
 * - Comparison articles
 * - Cannabinoid profiles
 *
 * Usage:
 *   node scripts/add-my-take-all.mjs --dry-run              # Preview changes
 *   node scripts/add-my-take-all.mjs                        # Apply changes
 *   node scripts/add-my-take-all.mjs --type=product-guide   # Specific type only
 *   node scripts/add-my-take-all.mjs --limit=10             # Limit articles
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

// Article types to process
const TARGET_TYPES = [
  'product-guide',
  'guide',
  'terpene-profile',
  'educational-guide',
  'educational',
  'comparison',
  'cannabinoid-profile',
  'basics',
  'application-guide',
];

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Check if article already has a My Take section
 */
function hasMyTake(content) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return (
    lower.includes('## my take') ||
    lower.includes('### my take') ||
    lower.includes("here's my honest assessment") ||
    lower.includes('my honest take') ||
    lower.includes('my perspective on')
  );
}

/**
 * Extract topic from article title/slug
 */
function extractTopic(article) {
  const title = article.title || '';
  const slug = article.slug || '';

  // Clean up for display
  if (title) {
    return title
      .replace(/^(What is |How to |The |A Guide to |Understanding )/i, '')
      .replace(/: .+$/, '')
      .trim();
  }

  return slug.replace(/-/g, ' ');
}

/**
 * Get prompt based on article type
 */
function getPromptForType(article, topic) {
  const type = article.article_type;
  const contentPreview = article.content?.substring(0, 800) || '';

  const baseContext = `You are Robin Roy Krigslund-Hansen, founder of CBD Portal with 12+ years in the CBD industry. You've tested hundreds of CBD products and reviewed over 700 studies.`;

  const prompts = {
    'product-guide': `${baseContext}

Write a "My Take" section for a PRODUCT GUIDE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- Your hands-on experience with this product type over the years
- What you look for when evaluating quality
- Common mistakes consumers make
- Who this product type is best suited for

Format:
## My Take

[3-4 paragraphs of genuine insights from your experience. Be specific about what you've learned testing products. Mention quality indicators. Give practical advice.]

Keep it under 180 words. Be direct and helpful, not salesy.`,

    'guide': `${baseContext}

Write a "My Take" section for an EDUCATIONAL GUIDE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- What you've learned about this topic through industry experience
- Common misconceptions you've encountered
- Practical insights for readers

Format:
## My Take

[2-3 paragraphs sharing your genuine perspective. Draw from your decade of industry experience. Be helpful and honest.]

Keep it under 150 words.`,

    'terpene-profile': `${baseContext}

Write a "My Take" section for a TERPENE PROFILE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- Your experience with products containing this terpene
- What you've noticed about its effects (be honest about subjectivity)
- How important terpene profiles are in your view

Format:
## My Take

[2-3 paragraphs with genuine insights. You can mention products you've tried with this terpene. Be honest that effects can be subjective.]

Keep it under 150 words.`,

    'educational-guide': `${baseContext}

Write a "My Take" section for an EDUCATIONAL GUIDE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should include:
- Insights from your 12+ years in the CBD industry
- What you wish more people understood about this topic
- Practical advice based on your experience

Format:
## My Take

[2-3 paragraphs of genuine author perspective. Be informative and draw from real experience.]

Keep it under 150 words.`,

    'educational': `${baseContext}

Write a "My Take" section for an EDUCATIONAL ARTICLE about: ${topic}

Article excerpt:
${contentPreview}...

Share your perspective on:
- What you've learned about this topic
- Common questions you get asked
- Helpful context from your industry experience

Format:
## My Take

[2-3 paragraphs with your honest perspective. Be educational and helpful.]

Keep it under 150 words.`,

    'comparison': `${baseContext}

Write a "My Take" section for a COMPARISON ARTICLE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- Your experience with both/all options being compared
- Which you tend to recommend and why (be honest)
- When each option makes sense

Format:
## My Take

[2-3 paragraphs comparing from your personal experience. Be specific about what you've observed. It's okay to have a preference.]

Keep it under 150 words.`,

    'cannabinoid-profile': `${baseContext}

Write a "My Take" section for a CANNABINOID PROFILE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- Your experience with products containing this cannabinoid
- How it compares to CBD in your observation
- The current state of research/availability

Format:
## My Take

[2-3 paragraphs with genuine insights. Be honest about what's known vs unknown. Share your experience with products containing this cannabinoid.]

Keep it under 150 words.`,

    'basics': `${baseContext}

Write a "My Take" section for a CBD BASICS ARTICLE about: ${topic}

Article excerpt:
${contentPreview}...

Share your perspective on:
- Why this question matters to beginners
- What you wish you knew when starting out
- Common misconceptions

Format:
## My Take

[2 paragraphs with helpful beginner-friendly perspective from your experience.]

Keep it under 120 words.`,

    'application-guide': `${baseContext}

Write a "My Take" section for an APPLICATION GUIDE about: ${topic}

Article excerpt:
${contentPreview}...

Your perspective should cover:
- Your experience using CBD/terpenes for this purpose
- What has worked well in your observation
- Realistic expectations

Format:
## My Take

[2-3 paragraphs with practical insights from experience. Be honest about what works and what's overhyped.]

Keep it under 150 words.`,
  };

  return prompts[type] || prompts['educational'];
}

/**
 * Generate My Take section using Claude
 */
async function generateMyTake(anthropic, article) {
  const topic = extractTopic(article);
  const prompt = getPromptForType(article, topic);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    let response = message.content[0].text.trim();

    // Ensure it starts with ## My Take
    if (!response.startsWith('## My Take')) {
      response = '## My Take\n\n' + response.replace(/^#+ My Take\s*/i, '');
    }

    return response;
  } catch (error) {
    if (error.message?.includes('rate')) {
      console.log(`  ⏳ Rate limited, waiting 10s...`);
      await sleep(10000);
      return generateMyTake(anthropic, article); // Retry
    }
    console.error(`  Error generating My Take:`, error.message);
    return null;
  }
}

/**
 * Add My Take section to article content
 */
function addMyTake(content, myTakeMarkdown) {
  // Find the best place to insert
  const insertPoints = [
    /\n## (?:Frequently Asked Questions|FAQ)\b/i,
    /\n## Related Studies\b/i,
    /\n## References\b/i,
    /\n## Related Articles\b/i,
    /\n## See Also\b/i,
    /\n---\s*\n+\*\*(?:Medical )?Disclaimer/i,
  ];

  for (const pattern of insertPoints) {
    const match = content.match(pattern);
    if (match) {
      const insertPos = content.indexOf(match[0]);
      return content.substring(0, insertPos) + '\n\n' + myTakeMarkdown + '\n' + content.substring(insertPos);
    }
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
  console.log('\n💭 Add "My Take" Sections to All Article Types\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '✏️  APPLY CHANGES'}`);
  console.log(`  Types: ${ARTICLE_TYPE || TARGET_TYPES.join(', ')}`);
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

  if (ARTICLE_TYPE) {
    query = query.eq('article_type', ARTICLE_TYPE);
  } else {
    query = query.in('article_type', TARGET_TYPES);
  }

  query = query.order('article_type').order('slug').limit(LIMIT);

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Failed to fetch articles:', error.message);
    process.exit(1);
  }

  // Filter out articles that already have My Take
  const articlesToProcess = articles.filter(a => !hasMyTake(a.content));
  const alreadyHave = articles.length - articlesToProcess.length;

  console.log(`📚 Found ${articles.length} articles`);
  console.log(`   Already have My Take: ${alreadyHave}`);
  console.log(`   Need My Take: ${articlesToProcess.length}\n`);

  if (articlesToProcess.length === 0) {
    console.log('✅ All articles already have My Take sections!');
    return;
  }

  const stats = {
    processed: 0,
    added: 0,
    errors: 0,
  };

  const changes = [];
  let currentType = '';

  for (const article of articlesToProcess) {
    // Print type header
    if (article.article_type !== currentType) {
      currentType = article.article_type;
      console.log(`\n📁 ${currentType.toUpperCase()}`);
    }

    stats.processed++;

    if (DRY_RUN) {
      changes.push({
        slug: article.slug,
        type: article.article_type,
        title: article.title?.substring(0, 40),
      });
      stats.added++;
      if (VERBOSE) console.log(`  📝 ${article.slug}`);
    } else {
      process.stdout.write(`  🤖 ${article.slug.substring(0, 40)}...`);

      const myTakeMarkdown = await generateMyTake(anthropic, article);

      if (!myTakeMarkdown) {
        console.log(' ❌');
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
        console.log(' ❌');
        stats.errors++;
      } else {
        console.log(' ✅');
        stats.added++;
        changes.push({ slug: article.slug, type: article.article_type });
      }

      // Rate limiting
      await sleep(800);
    }

    // Progress
    if (stats.processed % 20 === 0 && !DRY_RUN) {
      console.log(`\n  --- Progress: ${stats.processed}/${articlesToProcess.length} ---\n`);
    }
  }

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RESULTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Articles processed: ${stats.processed}`);
  console.log(`  My Take ${DRY_RUN ? 'would be ' : ''}added: ${stats.added}`);
  console.log(`  Already had My Take: ${alreadyHave}`);
  if (stats.errors > 0) console.log(`  Errors: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (DRY_RUN && changes.length > 0) {
    console.log('\n📝 Articles that would get My Take:\n');

    // Group by type
    const byType = {};
    changes.forEach(c => {
      if (!byType[c.type]) byType[c.type] = [];
      byType[c.type].push(c);
    });

    for (const [type, items] of Object.entries(byType)) {
      console.log(`  ${type} (${items.length}):`);
      items.slice(0, 5).forEach(c => console.log(`    - ${c.slug}`));
      if (items.length > 5) console.log(`    ... and ${items.length - 5} more`);
    }

    console.log('\n💡 Run without --dry-run to apply changes');
  }

  if (!DRY_RUN && stats.added > 0) {
    console.log(`\n✅ Successfully added My Take to ${stats.added} articles`);
  }
}

main().catch(console.error);
