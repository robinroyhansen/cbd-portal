/**
 * Reject Low-Quality Studies from Queue
 *
 * Categories:
 * 1. Duplicates - keep highest relevance_score
 * 2. Irrelevant - extraction/processing/agriculture/policy/economic
 * 3. Veterinary studies
 *
 * Run with: node scripts/reject-low-quality.mjs
 * Dry run:  node scripts/reject-low-quality.mjs --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');

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

// Keywords for irrelevant studies
const EXTRACTION_KEYWORDS = [
  'extraction', 'chromatography', 'hplc', 'gc-ms', 'spectroscopy',
  'quantification method', 'analytical method', 'mass spectrometry',
  'supercritical co2', 'solvent extraction'
];

const AGRICULTURE_KEYWORDS = [
  'cultivation', 'hemp seed', 'fiber', 'crop', 'farming', 'agricultural',
  'phytoremediation', 'soil', 'harvest', 'germination', 'yield optimization',
  'textile', 'biomass production'
];

const POLICY_KEYWORDS = [
  'policy', 'legalization', 'legislation', 'regulation', 'law enforcement',
  'drug policy', 'decriminalization', 'prohibition', 'legal status'
];

const ECONOMIC_KEYWORDS = [
  'market analysis', 'economic impact', 'cannabis industry', 'market size',
  'dispensary business', 'retail sales', 'tax revenue', 'investment',
  'supply chain', 'price analysis'
];

const VETERINARY_KEYWORDS = [
  'veterinary', 'canine', 'feline', 'equine', 'bovine', 'dogs', 'cats',
  'horses', 'cattle', 'pets', 'companion animal'
];

async function fetchAllPendingStudies() {
  console.log('Fetching all pending studies...');
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, relevance_score, quality_score')
      .eq('status', 'pending')
      .range(offset, offset + 999);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  console.log(`Fetched ${allStudies.length} pending studies`);
  return allStudies;
}

function findDuplicates(studies) {
  const titleMap = {};

  for (const study of studies) {
    const normalizedTitle = (study.title || '').toLowerCase().trim();
    if (normalizedTitle.length > 10) {
      if (!titleMap[normalizedTitle]) {
        titleMap[normalizedTitle] = [];
      }
      titleMap[normalizedTitle].push(study);
    }
  }

  const toReject = [];

  for (const [title, duplicates] of Object.entries(titleMap)) {
    if (duplicates.length > 1) {
      // Sort by relevance_score DESC, keep highest
      duplicates.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      // Reject all except the first (highest score)
      for (let i = 1; i < duplicates.length; i++) {
        toReject.push({
          id: duplicates[i].id,
          title: duplicates[i].title,
          reason: 'duplicate'
        });
      }
    }
  }

  return toReject;
}

function matchesKeywords(title, keywords) {
  const titleLower = (title || '').toLowerCase();
  return keywords.some(kw => titleLower.includes(kw.toLowerCase()));
}

function findIrrelevant(studies) {
  const toReject = [];

  for (const study of studies) {
    const title = study.title || '';

    if (matchesKeywords(title, EXTRACTION_KEYWORDS)) {
      toReject.push({ id: study.id, title, reason: 'extraction/processing' });
    } else if (matchesKeywords(title, AGRICULTURE_KEYWORDS)) {
      toReject.push({ id: study.id, title, reason: 'agriculture' });
    } else if (matchesKeywords(title, POLICY_KEYWORDS)) {
      toReject.push({ id: study.id, title, reason: 'policy/legal' });
    } else if (matchesKeywords(title, ECONOMIC_KEYWORDS)) {
      toReject.push({ id: study.id, title, reason: 'economic/market' });
    }
  }

  return toReject;
}

function findVeterinary(studies) {
  const toReject = [];

  for (const study of studies) {
    const title = study.title || '';
    if (matchesKeywords(title, VETERINARY_KEYWORDS)) {
      toReject.push({ id: study.id, title, reason: 'veterinary' });
    }
  }

  return toReject;
}

async function rejectStudies(studies, reason) {
  if (studies.length === 0) return 0;
  if (dryRun) return studies.length;

  const ids = studies.map(s => s.id);

  // Update in batches of 500
  for (let i = 0; i < ids.length; i += 500) {
    const batch = ids.slice(i, i + 500);
    const { error } = await supabase
      .from('kb_research_queue')
      .update({ status: 'rejected' })
      .in('id', batch);

    if (error) {
      console.error(`Error rejecting batch:`, error);
      throw error;
    }
  }

  return ids.length;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  REJECT LOW-QUALITY STUDIES');
  console.log('  Mode:', dryRun ? 'DRY RUN (no changes)' : 'LIVE (will make changes)');
  console.log('='.repeat(70));

  const studies = await fetchAllPendingStudies();

  // Track which IDs we've already marked for rejection to avoid double-counting
  const rejectedIds = new Set();

  // 1. Find duplicates
  console.log('\n--- 1. DUPLICATES ---');
  const duplicates = findDuplicates(studies);
  const uniqueDuplicates = duplicates.filter(d => !rejectedIds.has(d.id));
  uniqueDuplicates.forEach(d => rejectedIds.add(d.id));
  console.log(`Found ${uniqueDuplicates.length} duplicate studies to reject`);
  if (uniqueDuplicates.length > 0) {
    console.log('Sample duplicates:');
    uniqueDuplicates.slice(0, 5).forEach(d => {
      console.log(`  - ${d.title?.substring(0, 60)}...`);
    });
  }

  // 2. Find irrelevant (exclude already rejected)
  console.log('\n--- 2. IRRELEVANT STUDIES ---');
  const remainingStudies = studies.filter(s => !rejectedIds.has(s.id));
  const irrelevant = findIrrelevant(remainingStudies);
  const uniqueIrrelevant = irrelevant.filter(i => !rejectedIds.has(i.id));
  uniqueIrrelevant.forEach(i => rejectedIds.add(i.id));

  // Group by reason
  const byReason = {};
  uniqueIrrelevant.forEach(i => {
    byReason[i.reason] = (byReason[i.reason] || 0) + 1;
  });
  console.log(`Found ${uniqueIrrelevant.length} irrelevant studies:`);
  Object.entries(byReason).forEach(([reason, count]) => {
    console.log(`  - ${reason}: ${count}`);
  });

  // 3. Find veterinary (exclude already rejected)
  console.log('\n--- 3. VETERINARY STUDIES ---');
  const remaining2 = studies.filter(s => !rejectedIds.has(s.id));
  const veterinary = findVeterinary(remaining2);
  const uniqueVeterinary = veterinary.filter(v => !rejectedIds.has(v.id));
  uniqueVeterinary.forEach(v => rejectedIds.add(v.id));
  console.log(`Found ${uniqueVeterinary.length} veterinary studies`);
  if (uniqueVeterinary.length > 0) {
    console.log('Sample veterinary:');
    uniqueVeterinary.slice(0, 5).forEach(v => {
      console.log(`  - ${v.title?.substring(0, 60)}...`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total pending before: ${studies.length}`);
  console.log(`Duplicates to reject: ${uniqueDuplicates.length}`);
  console.log(`Irrelevant to reject: ${uniqueIrrelevant.length}`);
  console.log(`Veterinary to reject: ${uniqueVeterinary.length}`);
  console.log(`TOTAL TO REJECT: ${rejectedIds.size}`);
  console.log(`Remaining after: ${studies.length - rejectedIds.size}`);

  if (dryRun) {
    console.log('\n[DRY RUN] No changes made. Run without --dry-run to apply.');
    return;
  }

  // Execute rejections
  console.log('\n--- EXECUTING REJECTIONS ---');

  let rejected = 0;
  rejected += await rejectStudies(uniqueDuplicates, 'duplicate study');
  console.log(`Rejected ${uniqueDuplicates.length} duplicates`);

  rejected += await rejectStudies(uniqueIrrelevant, 'irrelevant content');
  console.log(`Rejected ${uniqueIrrelevant.length} irrelevant studies`);

  rejected += await rejectStudies(uniqueVeterinary, 'veterinary study');
  console.log(`Rejected ${uniqueVeterinary.length} veterinary studies`);

  // Verify final count
  const { count: finalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: finalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  console.log('\n--- FINAL COUNTS ---');
  console.log(`Pending: ${finalPending}`);
  console.log(`Rejected: ${finalRejected}`);
  console.log(`Total rejected this run: ${rejected}`);
}

main().catch(console.error);
