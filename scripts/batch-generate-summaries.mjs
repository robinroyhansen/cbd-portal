#!/usr/bin/env node
/**
 * Batch Summary Generator for Research Studies
 *
 * Generates plain-language summaries for all approved studies missing summaries.
 * Runs in small batches with delays to avoid timeouts and rate limits.
 *
 * Progress is saved to a file so the script can be resumed if interrupted.
 *
 * Usage:
 *   node scripts/batch-generate-summaries.mjs
 *   node scripts/batch-generate-summaries.mjs --batch-size 5
 *   node scripts/batch-generate-summaries.mjs --resume
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuration
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '10');
const DELAY_BETWEEN_STUDIES = 1200; // 1.2 seconds between each study
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches
const PROGRESS_FILE = path.join(process.cwd(), 'scripts', '.summary-progress.json');

// System prompt for summary generation
const SYSTEM_PROMPT = `You are a science writer who translates complex medical research into simple, accessible language for an 18-year-old audience.

Your task is to write plain-language summaries of CBD/cannabis research studies.

RULES:
1. Maximum 100 words
2. No medical jargon - use simple terms (e.g., "CBD oil" not "cannabidiol oral solution")
3. Structure: What was tested → Who participated → How it was done → What they found
4. If results aren't available or the study is ongoing, say "Results pending" or "Study in progress"
5. Be accurate - don't overstate findings
6. Use active voice and short sentences

EXAMPLES:
- Instead of "randomized double-blind placebo-controlled trial" say "a carefully designed study where neither patients nor doctors knew who got CBD"
- Instead of "statistically significant reduction in anxiety symptoms" say "noticeable improvement in anxiety"
- Instead of "participants" say "people in the study" or just give the number`;

async function generateSummary(study) {
  const studyContext = buildStudyContext(study);

  if (!studyContext) {
    return { success: false, error: 'Insufficient study data' };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Write a plain-language summary (max 100 words) for this research study:\n\n${studyContext}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Handle rate limiting
      if (response.status === 429) {
        return { success: false, error: 'RATE_LIMITED', retryable: true };
      }

      return { success: false, error: `API error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim();

    if (!summary) {
      return { success: false, error: 'No summary in response' };
    }

    return { success: true, summary };

  } catch (error) {
    return { success: false, error: error.message, retryable: true };
  }
}

function buildStudyContext(study) {
  const parts = [];

  if (study.title) parts.push(`TITLE: ${study.title}`);
  if (study.abstract) parts.push(`ABSTRACT: ${study.abstract}`);
  if (study.authors) parts.push(`AUTHORS: ${study.authors}`);
  if (study.year) parts.push(`YEAR: ${study.year}`);
  if (study.publication) parts.push(`PUBLICATION: ${study.publication}`);

  if (!study.title || (!study.abstract && parts.length < 3)) {
    return null;
  }

  return parts.join('\n\n');
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.log('Could not load progress file, starting fresh');
  }
  return { processed: [], failed: [], startedAt: new Date().toISOString() };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function getStudiesNeedingSummaries(excludeIds = []) {
  let query = supabase
    .from('kb_research_queue')
    .select('id, title, abstract, authors, year, publication, url, source_site')
    .eq('status', 'approved')
    .is('plain_summary', null)
    .order('year', { ascending: false })
    .limit(BATCH_SIZE);

  // Exclude already processed IDs
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch studies: ${error.message}`);
  }

  return data || [];
}

async function getTotalMissing() {
  const { count, error } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .is('plain_summary', null);

  if (error) throw error;
  return count || 0;
}

async function saveSummary(studyId, summary) {
  const { error } = await supabase
    .from('kb_research_queue')
    .update({ plain_summary: summary })
    .eq('id', studyId);

  if (error) {
    throw new Error(`Failed to save summary: ${error.message}`);
  }
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

async function main() {
  console.log('\n========================================');
  console.log('  Research Study Summary Generator');
  console.log('========================================\n');

  const progress = loadProgress();
  const totalMissing = await getTotalMissing();

  console.log(`Studies needing summaries: ${totalMissing}`);
  console.log(`Already processed this run: ${progress.processed.length}`);
  console.log(`Failed this run: ${progress.failed.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Delay between studies: ${DELAY_BETWEEN_STUDIES}ms`);
  console.log('');

  if (totalMissing === 0) {
    console.log('All studies have summaries! Nothing to do.');
    return;
  }

  const estimatedTime = totalMissing * (DELAY_BETWEEN_STUDIES + 500); // 500ms avg API time
  console.log(`Estimated time remaining: ${formatTime(estimatedTime)}`);
  console.log('');
  console.log('Starting in 3 seconds... (Ctrl+C to cancel)');
  await new Promise(r => setTimeout(r, 3000));

  let batchNumber = 0;
  let totalProcessed = progress.processed.length;
  let totalSucceeded = 0;
  let totalFailed = progress.failed.length;
  const startTime = Date.now();

  while (true) {
    batchNumber++;

    // Get next batch of studies
    const studies = await getStudiesNeedingSummaries([...progress.processed, ...progress.failed]);

    if (studies.length === 0) {
      console.log('\nNo more studies to process!');
      break;
    }

    console.log(`\n--- Batch ${batchNumber} (${studies.length} studies) ---`);

    for (let i = 0; i < studies.length; i++) {
      const study = studies[i];
      const shortTitle = study.title?.substring(0, 50) + (study.title?.length > 50 ? '...' : '');

      process.stdout.write(`  [${totalProcessed + 1}] ${shortTitle}... `);

      // Generate summary
      let result = await generateSummary(study);

      // Retry once if rate limited
      if (result.retryable) {
        console.log('retrying in 10s...');
        await new Promise(r => setTimeout(r, 10000));
        result = await generateSummary(study);
      }

      if (result.success) {
        // Save to database
        try {
          await saveSummary(study.id, result.summary);
          console.log('OK');
          progress.processed.push(study.id);
          totalSucceeded++;
        } catch (saveError) {
          console.log(`SAVE FAILED: ${saveError.message}`);
          progress.failed.push(study.id);
          totalFailed++;
        }
      } else {
        console.log(`FAILED: ${result.error}`);
        progress.failed.push(study.id);
        totalFailed++;
      }

      totalProcessed++;

      // Save progress after each study
      progress.lastUpdated = new Date().toISOString();
      saveProgress(progress);

      // Delay between studies
      if (i < studies.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_STUDIES));
      }
    }

    // Progress summary
    const elapsed = Date.now() - startTime;
    const rate = totalSucceeded / (elapsed / 1000 / 60); // per minute
    const remaining = totalMissing - totalProcessed;
    const eta = remaining > 0 ? formatTime((remaining / rate) * 60 * 1000) : '0s';

    console.log(`\nProgress: ${totalProcessed}/${totalMissing + progress.processed.length} | Success: ${totalSucceeded} | Failed: ${totalFailed} | Rate: ${rate.toFixed(1)}/min | ETA: ${eta}`);

    // Check if we're done
    if (remaining <= 0) {
      break;
    }

    // Delay between batches
    console.log(`\nWaiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
  }

  // Final summary
  const totalTime = Date.now() - startTime;
  console.log('\n========================================');
  console.log('  Generation Complete!');
  console.log('========================================');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Succeeded: ${totalSucceeded}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Time elapsed: ${formatTime(totalTime)}`);
  console.log(`Progress file: ${PROGRESS_FILE}`);
  console.log('');

  // Clean up progress file if all succeeded
  if (totalFailed === 0) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('Progress file cleaned up.');
  } else {
    console.log(`${totalFailed} studies failed. Re-run the script to retry.`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nInterrupted! Progress has been saved.');
  console.log(`Resume by running: node scripts/batch-generate-summaries.mjs`);
  process.exit(0);
});

main().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});
