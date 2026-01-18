/**
 * Execute Audit Corrections
 *
 * Step 1: Reject misclassified approved studies (excluding thc_only)
 * Step 2: Approve wrongly rejected studies
 * Step 3: Final summary
 *
 * Run with: node scripts/execute-audit-corrections.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
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

// Load audit report
const auditReport = JSON.parse(readFileSync(join(__dirname, 'audit-report.json'), 'utf8'));

// Rejection reasons by category
const REJECTION_REASONS = {
  extraction: 'Not health research - extraction/lab methods',
  recreational: 'Not health research - recreational use study',
  policy: 'Not health research - policy/legal/regulation study',
  agriculture: 'Not health research - agriculture/cultivation study',
  driving: 'Not health research - driving/traffic impairment study',
  detection: 'Not health research - drug detection/testing methods',
  market: 'Not health research - market/economic analysis',
  environmental: 'Not health research - environmental study'
};

// Categories to reject (excluding thc_only)
const CATEGORIES_TO_REJECT = [
  'extraction', 'recreational', 'policy', 'agriculture',
  'driving', 'detection', 'market', 'environmental'
];

// Categories to approve
const CATEGORIES_TO_APPROVE = [
  'clinical', 'mechanism', 'pharmacology', 'condition_specific', 'safety'
];

async function rejectStudies(ids, reason) {
  let rejected = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .update({ status: 'rejected', rejection_reason: reason })
      .in('id', batch)
      .select('id');

    if (data) rejected += data.length;
    if (error) console.log('Reject error:', error.message);
  }
  return rejected;
}

async function approveStudies(ids) {
  let approved = 0;
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .update({ status: 'approved', rejection_reason: null })
      .in('id', batch)
      .select('id');

    if (data) approved += data.length;
    if (error) console.log('Approve error:', error.message);
  }
  return approved;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  EXECUTE AUDIT CORRECTIONS');
  console.log('='.repeat(70));

  // Get initial counts
  const { count: initialApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: initialRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const { count: initialPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  console.log('\nInitial counts:');
  console.log(`  Approved: ${initialApproved}`);
  console.log(`  Rejected: ${initialRejected}`);
  console.log(`  Pending: ${initialPending}`);

  // ================================================================
  // STEP 1: REJECT MISCLASSIFIED APPROVED STUDIES (excluding thc_only)
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 1: REJECT MISCLASSIFIED APPROVED STUDIES');
  console.log('  (Keeping 160 thc_only studies approved)');
  console.log('='.repeat(70));

  // Group misclassified approved studies by reason
  const misclassifiedByReason = {};
  for (const study of auditReport.misclassifiedApproved) {
    const reason = study.reason;
    if (!misclassifiedByReason[reason]) {
      misclassifiedByReason[reason] = [];
    }
    misclassifiedByReason[reason].push(study);
  }

  const rejectionResults = {};
  let totalRejected = 0;

  for (const category of CATEGORIES_TO_REJECT) {
    const studies = misclassifiedByReason[category] || [];
    if (studies.length === 0) {
      rejectionResults[category] = 0;
      continue;
    }

    const ids = studies.map(s => s.id);
    const reason = REJECTION_REASONS[category];
    const count = await rejectStudies(ids, reason);
    rejectionResults[category] = count;
    totalRejected += count;
    console.log(`  ${category}: ${count} rejected`);
  }

  console.log('\n| Category | Rejected |');
  console.log('|----------|----------|');
  for (const [cat, count] of Object.entries(rejectionResults)) {
    console.log(`| ${cat.padEnd(15)} | ${String(count).padStart(8)} |`);
  }
  console.log(`| **TOTAL** | **${totalRejected}** |`);

  console.log('\n(thc_only: 160 studies kept approved as requested)');

  // ================================================================
  // STEP 2: APPROVE WRONGLY REJECTED STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 2: APPROVE WRONGLY REJECTED STUDIES');
  console.log('='.repeat(70));

  // Group wrongly rejected studies by reason
  const wronglyRejectedByReason = {};
  for (const study of auditReport.wronglyRejected) {
    const reason = study.reason;
    if (!wronglyRejectedByReason[reason]) {
      wronglyRejectedByReason[reason] = [];
    }
    wronglyRejectedByReason[reason].push(study);
  }

  const approvalResults = {};
  let totalApproved = 0;

  for (const category of CATEGORIES_TO_APPROVE) {
    const studies = wronglyRejectedByReason[category] || [];
    if (studies.length === 0) {
      approvalResults[category] = 0;
      continue;
    }

    const ids = studies.map(s => s.id);
    const count = await approveStudies(ids);
    approvalResults[category] = count;
    totalApproved += count;
    console.log(`  ${category}: ${count} approved`);
  }

  console.log('\n| Category | Approved |');
  console.log('|----------|----------|');
  for (const [cat, count] of Object.entries(approvalResults)) {
    console.log(`| ${cat.padEnd(18)} | ${String(count).padStart(8)} |`);
  }
  console.log(`| **TOTAL** | **${totalApproved}** |`);

  // ================================================================
  // STEP 3: FINAL SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 3: FINAL SUMMARY');
  console.log('='.repeat(70));

  // Get final counts
  const { count: finalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: finalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const { count: finalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const netChange = finalApproved - initialApproved;

  console.log('\n| Metric | Before | After | Change |');
  console.log('|--------|--------|-------|--------|');
  console.log(`| Approved | ${initialApproved} | ${finalApproved} | ${netChange >= 0 ? '+' : ''}${netChange} |`);
  console.log(`| Rejected | ${initialRejected} | ${finalRejected} | +${finalRejected - initialRejected} |`);
  console.log(`| Pending | ${initialPending} | ${finalPending} | ${finalPending - initialPending} |`);
  console.log(`| **Total** | **${initialApproved + initialRejected + initialPending}** | **${finalApproved + finalRejected + finalPending}** | - |`);

  console.log('\n--- Actions Taken ---');
  console.log(`  Rejected (from approved): ${totalRejected}`);
  console.log(`  Approved (from rejected): ${totalApproved}`);
  console.log(`  Net change in approved: ${netChange >= 0 ? '+' : ''}${netChange}`);

  console.log('\n' + '='.repeat(70));
  console.log('  CORRECTIONS COMPLETE');
  console.log('='.repeat(70));
}

main().catch(console.error);
