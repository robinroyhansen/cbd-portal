/**
 * Execute database corrections in batches of 100
 * Usage: node scripts/validation/execute-corrections.mjs [startFrom]
 *
 * startFrom: "approved" (default) or "rejected" to continue from a specific phase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });
  return envVars;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const BATCH_SIZE = 100;

// Load corrections
const corrections = JSON.parse(readFileSync(join(__dirname, 'corrections-needed.json'), 'utf8'));

// Initialize or load log
const logPath = join(__dirname, 'correction-log.json');
let log = {
  started_at: new Date().toISOString(),
  approved_to_reject: {
    total: corrections.approved_to_reject.length,
    completed: 0,
    success: [],
    errors: []
  },
  rejected_to_approve: {
    total: corrections.rejected_to_approve.length,
    completed: 0,
    success: [],
    errors: []
  },
  last_updated: new Date().toISOString()
};

if (existsSync(logPath)) {
  log = JSON.parse(readFileSync(logPath, 'utf8'));
}

function saveLog() {
  log.last_updated = new Date().toISOString();
  writeFileSync(logPath, JSON.stringify(log, null, 2));
}

async function correctBatch(ids, newStatus, rejectionReason) {
  const results = { success: [], errors: [] };

  for (const id of ids) {
    const updateData = { status: newStatus };
    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else {
      updateData.rejection_reason = null;
    }

    const { error } = await supabase
      .from('kb_research_queue')
      .update(updateData)
      .eq('id', id);

    if (error) {
      results.errors.push({ id, error: error.message });
    } else {
      results.success.push(id);
    }
  }

  return results;
}

async function reportProgress(totalApprovedDone, totalRejectedDone) {
  const totalDone = totalApprovedDone + totalRejectedDone;
  console.log(`\n=== Progress Report (${totalDone} total) ===`);
  console.log(`Approved → Rejected: ${totalApprovedDone}/${corrections.approved_to_reject.length}`);
  console.log(`Rejected → Approved: ${totalRejectedDone}/${corrections.rejected_to_approve.length}`);
  console.log(`Errors: ${log.approved_to_reject.errors.length + log.rejected_to_approve.errors.length}`);
}

async function main() {
  const startFrom = process.argv[2] || 'approved';

  console.log('=== CBD Portal Database Corrections ===');
  console.log(`Total approved → rejected: ${corrections.approved_to_reject.length}`);
  console.log(`Total rejected → approved: ${corrections.rejected_to_approve.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log('');

  // Phase 1: Approved → Rejected
  if (startFrom === 'approved') {
    console.log('\n--- Phase 1: Approved → Rejected ---\n');

    const startIndex = log.approved_to_reject.completed;
    const ids = corrections.approved_to_reject.map(c => c.id);

    for (let i = startIndex; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

      console.log(`Batch ${batchNum}/${totalBatches}: Processing ${batch.length} studies (${i + 1}-${Math.min(i + batch.length, ids.length)})`);

      const results = await correctBatch(batch, 'rejected', 'Validation review: Not CBD health research');

      log.approved_to_reject.success.push(...results.success);
      log.approved_to_reject.errors.push(...results.errors);
      log.approved_to_reject.completed = i + batch.length;
      saveLog();

      console.log(`  ✓ Success: ${results.success.length}, Errors: ${results.errors.length}`);

      // Progress report every 500
      if ((i + batch.length) % 500 === 0 || i + batch.length >= ids.length) {
        await reportProgress(log.approved_to_reject.completed, log.rejected_to_approve.completed);
      }
    }

    console.log(`\n✓ Phase 1 complete: ${log.approved_to_reject.completed} studies changed to rejected`);
  }

  // Phase 2: Rejected → Approved
  console.log('\n--- Phase 2: Rejected → Approved ---\n');

  const startIndex2 = log.rejected_to_approve.completed;
  const ids2 = corrections.rejected_to_approve.map(c => c.id);

  for (let i = startIndex2; i < ids2.length; i += BATCH_SIZE) {
    const batch = ids2.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(ids2.length / BATCH_SIZE);

    console.log(`Batch ${batchNum}/${totalBatches}: Processing ${batch.length} studies (${i + 1}-${Math.min(i + batch.length, ids2.length)})`);

    const results = await correctBatch(batch, 'approved', null);

    log.rejected_to_approve.success.push(...results.success);
    log.rejected_to_approve.errors.push(...results.errors);
    log.rejected_to_approve.completed = i + batch.length;
    saveLog();

    console.log(`  ✓ Success: ${results.success.length}, Errors: ${results.errors.length}`);

    // Progress report every 500
    if ((i + batch.length) % 500 === 0 || i + batch.length >= ids2.length) {
      await reportProgress(log.approved_to_reject.completed, log.rejected_to_approve.completed);
    }
  }

  console.log(`\n✓ Phase 2 complete: ${log.rejected_to_approve.completed} studies changed to approved`);

  // Final summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Approved → Rejected: ${log.approved_to_reject.success.length} success, ${log.approved_to_reject.errors.length} errors`);
  console.log(`Rejected → Approved: ${log.rejected_to_approve.success.length} success, ${log.rejected_to_approve.errors.length} errors`);
  console.log(`Total corrections: ${log.approved_to_reject.success.length + log.rejected_to_approve.success.length}`);

  // Verify final counts
  console.log('\nVerifying final database counts...');
  const { count: approved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: rejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const { count: total } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true });

  console.log(`\nFinal database state:`);
  console.log(`  Approved: ${approved}`);
  console.log(`  Rejected: ${rejected}`);
  console.log(`  Total: ${total}`);

  log.final_counts = { approved, rejected, total };
  log.completed_at = new Date().toISOString();
  saveLog();

  console.log('\nLog saved to correction-log.json');
}

main().catch(console.error);
