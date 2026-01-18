/**
 * Process Pending Studies - Final Cleanup
 *
 * Step 1: Reject policy/extraction/market studies
 * Step 2: Reject low relevance (<40)
 * Step 3: Approve high relevance (>=50)
 * Step 4: Summary
 *
 * Run with: node scripts/process-pending-final.mjs
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

// Keywords for cleanup rejection
const CLEANUP_KEYWORDS = [
  // Extraction/analytical
  'extraction', 'chromatography', 'purification', 'analytical method',
  // Policy/legal
  'policy', 'regulation', 'legalization', 'legislation', 'legal status',
  // Market/economic
  'market', 'sales', 'retail', 'dispensary', 'economic',
  // Driving/impairment
  'driving', 'impairment', 'traffic',
  // Survey/prevalence
  'survey of use', 'patterns of use', 'prevalence'
];

function shouldRejectForCleanup(title) {
  const titleLower = (title || '').toLowerCase();
  for (const kw of CLEANUP_KEYWORDS) {
    if (titleLower.includes(kw.toLowerCase())) {
      return true;
    }
  }
  return false;
}

async function fetchAllPendingStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevant_topics, relevance_score')
      .eq('status', 'pending')
      .range(offset, offset + 999);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  return allStudies;
}

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
      .update({ status: 'approved' })
      .in('id', batch)
      .select('id');

    if (data) approved += data.length;
    if (error) console.log('Approve error:', error.message);
  }
  return approved;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  PROCESS PENDING STUDIES - FINAL CLEANUP');
  console.log('='.repeat(70));

  // ================================================================
  // STEP 1: CLEAN ALL PENDING STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 1: CLEAN ALL PENDING STUDIES');
  console.log('='.repeat(70));

  let studies = await fetchAllPendingStudies();
  console.log(`\nTotal pending studies: ${studies.length}`);

  const toRejectCleanup = [];
  for (const study of studies) {
    if (shouldRejectForCleanup(study.title)) {
      toRejectCleanup.push(study.id);
    }
  }

  console.log(`\nStudies matching cleanup keywords: ${toRejectCleanup.length}`);

  const cleanupRejected = await rejectStudies(
    toRejectCleanup,
    'Not health research (policy/extraction/market study)'
  );

  console.log(`Rejected in cleanup: ${cleanupRejected}`);

  // ================================================================
  // STEP 2: REJECT LOW RELEVANCE
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 2: REJECT LOW RELEVANCE (<40)');
  console.log('='.repeat(70));

  // Re-fetch remaining pending
  studies = await fetchAllPendingStudies();
  console.log(`\nRemaining pending: ${studies.length}`);

  const toRejectLowRelevance = [];
  for (const study of studies) {
    if ((study.relevance_score || 0) < 40) {
      toRejectLowRelevance.push(study.id);
    }
  }

  console.log(`Studies with relevance < 40: ${toRejectLowRelevance.length}`);

  const lowRelevanceRejected = await rejectStudies(
    toRejectLowRelevance,
    'Low relevance - not condition-focused health research'
  );

  console.log(`Rejected for low relevance: ${lowRelevanceRejected}`);

  // ================================================================
  // STEP 3: APPROVE HIGH RELEVANCE
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 3: APPROVE HIGH RELEVANCE (>=50)');
  console.log('='.repeat(70));

  // Re-fetch remaining pending
  studies = await fetchAllPendingStudies();
  console.log(`\nRemaining pending: ${studies.length}`);

  const toApprove = [];
  for (const study of studies) {
    if ((study.relevance_score || 0) >= 50) {
      toApprove.push(study.id);
    }
  }

  console.log(`Studies with relevance >= 50: ${toApprove.length}`);

  const approved = await approveStudies(toApprove);

  console.log(`Approved: ${approved}`);

  // ================================================================
  // STEP 4: SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  STEP 4: FINAL SUMMARY');
  console.log('='.repeat(70));

  // Get final counts
  const { count: finalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: finalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: finalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  console.log('\n| Status | Count |');
  console.log('|--------|-------|');
  console.log(`| **Approved** | **${finalApproved}** |`);
  console.log(`| Pending (40-49, manual review) | ${finalPending} |`);
  console.log(`| Rejected | ${finalRejected} |`);
  console.log(`| **Total** | **${finalApproved + finalPending + finalRejected}** |`);

  // Topic distribution of ALL approved studies
  console.log('\n--- Topic Distribution of All Approved Studies (Top 15) ---');

  let approvedStudies = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('relevant_topics')
      .eq('status', 'approved')
      .not('relevant_topics', 'is', null)
      .range(offset, offset + 999);

    if (!data || data.length === 0) break;
    approvedStudies = approvedStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  const topicCounts = {};
  for (const study of approvedStudies) {
    for (const topic of (study.relevant_topics || [])) {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }

  console.log('\n| # | Topic | Count |');
  console.log('|---|-------|-------|');
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([topic, count], i) => {
      console.log(`| ${i + 1} | ${topic} | ${count} |`);
    });

  console.log('\n' + '='.repeat(70));
  console.log('  PROCESSING COMPLETE');
  console.log('='.repeat(70));
}

main().catch(console.error);
