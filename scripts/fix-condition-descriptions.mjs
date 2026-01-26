/**
 * Fix Condition Descriptions in kb_conditions
 *
 * The `description` field currently contains full article HTML instead of short
 * plain-text descriptions. This script generates proper short descriptions
 * (1-2 sentences, 100-150 chars) for SEO and display purposes.
 *
 * Usage:
 *   node scripts/fix-condition-descriptions.mjs --dry-run              # Preview count
 *   node scripts/fix-condition-descriptions.mjs                        # Apply all
 *   node scripts/fix-condition-descriptions.mjs --limit=10             # Process first 10
 *   node scripts/fix-condition-descriptions.mjs --batch-size=20        # Custom batch size
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000', 10);
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '10', 10);
const VERBOSE = args.includes('--verbose');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if description looks like HTML/long article content
 */
function needsFix(description) {
  if (!description) return true;
  // If it contains HTML tags, it needs fixing
  if (/<[^>]+>/.test(description)) return true;
  // If it's too long (more than 300 chars), it's probably article content
  if (description.length > 300) return true;
  return false;
}

/**
 * Generate a proper short description for a condition
 */
async function generateDescription(anthropic, condition) {
  const prompt = `Generate a short SEO description for a CBD research portal page about: ${condition.display_name || condition.name}

Context:
- This is for a medical/health information website about CBD research
- The description will be used in meta tags and card displays
- It should describe what the condition IS and mention CBD research context

Requirements:
- 1-2 sentences only
- 100-150 characters total (strict limit)
- Plain text only (no HTML, no markdown)
- Describe what the condition is briefly
- Mention CBD research exploration
- Factual, informative tone

Example format:
"Anxiety is a common mental health condition characterized by persistent worry. Research is exploring how CBD may help manage anxiety symptoms."

Now generate for: ${condition.display_name || condition.name}

Return ONLY the description text, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    let response = message.content[0].text.trim();

    // Remove any quotes if the model wrapped it
    response = response.replace(/^["']|["']$/g, '');

    // Ensure it doesn't exceed ~200 chars (giving some buffer)
    if (response.length > 200) {
      // Try to cut at a sentence boundary
      const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length > 0) {
        let result = '';
        for (const sentence of sentences) {
          if ((result + sentence).length <= 200) {
            result += sentence;
          } else {
            break;
          }
        }
        response = result.trim() || sentences[0].trim();
      }
    }

    return response;
  } catch (error) {
    if (error.message?.includes('rate') || error.message?.includes('credit')) {
      console.log(`  Rate limited, waiting 10s...`);
      await sleep(10000);
      return generateDescription(anthropic, condition);
    }
    console.error(`  Error generating for ${condition.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n========================================');
  console.log('Fix Condition Descriptions');
  console.log('========================================\n');
  console.log('Configuration:');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`);
  console.log(`  Limit: ${LIMIT}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log('');

  // Initialize clients
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Fetch all conditions
  console.log('Fetching conditions from kb_conditions...\n');

  const { data: conditions, error, count } = await supabase
    .from('kb_conditions')
    .select('id, name, display_name, slug, description, short_description, category', { count: 'exact' })
    .order('category')
    .order('name')
    .limit(LIMIT);

  if (error) {
    console.error('Failed to fetch conditions:', error.message);
    process.exit(1);
  }

  console.log(`Total conditions in database: ${count || conditions.length}`);
  console.log(`Fetched: ${conditions.length} conditions\n`);

  // Analyze which need fixing
  const needsFixing = conditions.filter(c => needsFix(c.description));
  const alreadyGood = conditions.length - needsFixing.length;

  console.log(`Analysis:`);
  console.log(`  Already have good descriptions: ${alreadyGood}`);
  console.log(`  Need fixing: ${needsFixing.length}\n`);

  if (needsFixing.length === 0) {
    console.log('All conditions already have proper descriptions!');
    return;
  }

  // Show sample of what needs fixing
  if (VERBOSE || DRY_RUN) {
    console.log('Sample conditions needing fixes:');
    needsFixing.slice(0, 5).forEach(c => {
      const descPreview = c.description
        ? (c.description.length > 80 ? c.description.substring(0, 80) + '...' : c.description)
        : '(empty)';
      console.log(`  - ${c.name}: ${descPreview}`);
    });
    console.log('');
  }

  if (DRY_RUN) {
    console.log(`\nDry run complete. Would fix ${needsFixing.length} conditions.`);
    console.log('Run without --dry-run to apply changes.\n');
    return;
  }

  // Process in batches
  let updated = 0;
  let errors = 0;
  let currentCategory = '';

  console.log('Processing conditions...\n');

  for (let i = 0; i < needsFixing.length; i++) {
    const condition = needsFixing[i];

    // Category header
    if (condition.category !== currentCategory) {
      currentCategory = condition.category;
      console.log(`\n[${currentCategory?.toUpperCase() || 'OTHER'}]`);
    }

    process.stdout.write(`  ${(i + 1).toString().padStart(3)}/${needsFixing.length} ${condition.name.padEnd(35)}...`);

    const newDescription = await generateDescription(anthropic, condition);

    if (!newDescription) {
      console.log(' FAILED');
      errors++;
      continue;
    }

    // Update the database
    const { error: updateError } = await supabase
      .from('kb_conditions')
      .update({
        description: newDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', condition.id);

    if (updateError) {
      console.log(` ERROR: ${updateError.message}`);
      errors++;
    } else {
      console.log(` OK (${newDescription.length} chars)`);
      updated++;
    }

    // Rate limiting - be gentle with Claude API
    await sleep(500);

    // Progress update every batch
    if ((i + 1) % BATCH_SIZE === 0) {
      console.log(`\n  --- Batch complete: ${i + 1}/${needsFixing.length} processed ---\n`);
    }
  }

  // Final summary
  console.log('\n');
  console.log('========================================');
  console.log('RESULTS');
  console.log('========================================');
  console.log(`  Total conditions: ${conditions.length}`);
  console.log(`  Already good: ${alreadyGood}`);
  console.log(`  Updated: ${updated}`);
  if (errors > 0) {
    console.log(`  Errors: ${errors}`);
  }
  console.log('========================================\n');

  if (updated > 0) {
    console.log(`Successfully updated ${updated} condition descriptions.\n`);
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
