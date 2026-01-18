/**
 * Reject Problematic Approved Studies
 *
 * 1. Reject: duplicates, irrelevant, veterinary, low relevance
 * 2. From no-topics: keep PK/mechanism, reject rest
 *
 * Run with: node scripts/reject-problematic-approved.mjs
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

// Keywords to keep from "no topics" studies
const KEEP_KEYWORDS = [
  'pharmacokinetic', 'pharmacokinetics', 'bioavailability', 'half-life', 'absorption', 'metabolism',
  'mechanism', 'receptor', 'pathway', 'endocannabinoid system'
];

// Irrelevant keywords
const IRRELEVANT_KEYWORDS = {
  extraction: ['extraction', 'chromatography', 'purification', 'enrichment'],
  agriculture: ['cultivation', 'agricultural', 'hemp fiber', 'soil', 'crop'],
  policy: ['policy', 'regulation', 'legalization', 'legal status'],
  economic: ['economic impact', 'market analysis']
};

// Topic keywords for veterinary detection
const VETERINARY_KEYWORDS = ['veterinary', 'canine', 'feline', 'dog', 'cat', 'pet', 'animal', 'equine', 'horse'];

function detectTopics(title, abstract) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  const topics = [];

  // Check for veterinary
  for (const kw of VETERINARY_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      topics.push('veterinary');
      break;
    }
  }

  return topics;
}

function checkIrrelevant(title) {
  const titleLower = (title || '').toLowerCase();
  for (const [category, keywords] of Object.entries(IRRELEVANT_KEYWORDS)) {
    for (const kw of keywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }
  return null;
}

function shouldKeepNoTopicStudy(title, abstract) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  for (const kw of KEEP_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) {
      return true;
    }
  }
  return false;
}

async function rejectStudy(id, reason) {
  const { data, error } = await supabase
    .from('kb_research_queue')
    .update({
      status: 'rejected',
      rejection_reason: reason
    })
    .eq('id', id)
    .select('id');

  return data && data.length > 0;
}

async function fetchAllApprovedStudies() {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, relevant_topics, relevance_score')
      .eq('status', 'approved')
      .range(offset, offset + 999);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allStudies = allStudies.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  return allStudies;
}

async function main() {
  console.log('='.repeat(70));
  console.log('  REJECT PROBLEMATIC APPROVED STUDIES');
  console.log('='.repeat(70));

  const studies = await fetchAllApprovedStudies();
  console.log(`\nTotal approved studies: ${studies.length}`);

  const results = {
    duplicates: { count: 0, rejected: 0 },
    irrelevant: { count: 0, rejected: 0 },
    veterinary: { count: 0, rejected: 0 },
    low_relevance: { count: 0, rejected: 0 },
    no_topics_rejected: { count: 0, rejected: 0 },
    no_topics_kept: { count: 0, titles: [] }
  };

  // Track processed IDs to avoid double-counting
  const processedIds = new Set();

  // ================================================================
  // 1. FIND AND REJECT DUPLICATES
  // ================================================================
  console.log('\n--- Processing Duplicates ---');
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

  for (const [title, dupes] of Object.entries(titleMap)) {
    if (dupes.length > 1) {
      // Keep first, reject rest
      for (let i = 1; i < dupes.length; i++) {
        results.duplicates.count++;
        if (await rejectStudy(dupes[i].id, 'Duplicate study')) {
          results.duplicates.rejected++;
          processedIds.add(dupes[i].id);
        }
      }
    }
  }
  console.log(`  Duplicates rejected: ${results.duplicates.rejected}`);

  // ================================================================
  // 2. FIND AND REJECT IRRELEVANT CONTENT
  // ================================================================
  console.log('\n--- Processing Irrelevant Content ---');
  for (const study of studies) {
    if (processedIds.has(study.id)) continue;

    const category = checkIrrelevant(study.title);
    if (category) {
      results.irrelevant.count++;
      const reason = `Irrelevant content: ${category}`;
      if (await rejectStudy(study.id, reason)) {
        results.irrelevant.rejected++;
        processedIds.add(study.id);
      }
    }
  }
  console.log(`  Irrelevant rejected: ${results.irrelevant.rejected}`);

  // ================================================================
  // 3. FIND AND REJECT VETERINARY
  // ================================================================
  console.log('\n--- Processing Veterinary ---');
  for (const study of studies) {
    if (processedIds.has(study.id)) continue;

    if (study.relevant_topics && study.relevant_topics.includes('veterinary')) {
      results.veterinary.count++;
      if (await rejectStudy(study.id, 'Veterinary study')) {
        results.veterinary.rejected++;
        processedIds.add(study.id);
      }
    }
  }
  console.log(`  Veterinary rejected: ${results.veterinary.rejected}`);

  // ================================================================
  // 4. FIND AND REJECT LOW RELEVANCE
  // ================================================================
  console.log('\n--- Processing Low Relevance (<40) ---');
  for (const study of studies) {
    if (processedIds.has(study.id)) continue;

    if ((study.relevance_score || 0) < 40) {
      results.low_relevance.count++;
      const reason = `Low relevance score: ${study.relevance_score || 0}`;
      if (await rejectStudy(study.id, reason)) {
        results.low_relevance.rejected++;
        processedIds.add(study.id);
      }
    }
  }
  console.log(`  Low relevance rejected: ${results.low_relevance.rejected}`);

  // ================================================================
  // 5. PROCESS NO-TOPICS STUDIES
  // ================================================================
  console.log('\n--- Processing No-Topics Studies ---');
  const noTopicsStudies = studies.filter(s =>
    !processedIds.has(s.id) &&
    (!s.relevant_topics || s.relevant_topics.length === 0)
  );

  console.log(`  No-topics studies to process: ${noTopicsStudies.length}`);

  for (const study of noTopicsStudies) {
    if (shouldKeepNoTopicStudy(study.title, study.abstract)) {
      results.no_topics_kept.count++;
      results.no_topics_kept.titles.push(study.title?.substring(0, 60));
    } else {
      results.no_topics_rejected.count++;
      if (await rejectStudy(study.id, 'General cannabis research - not condition-specific')) {
        results.no_topics_rejected.rejected++;
        processedIds.add(study.id);
      }
    }
  }
  console.log(`  No-topics kept (PK/mechanism): ${results.no_topics_kept.count}`);
  console.log(`  No-topics rejected: ${results.no_topics_rejected.rejected}`);

  // ================================================================
  // FINAL REPORT
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  FINAL REPORT');
  console.log('='.repeat(70));

  console.log('\n| Category | Rejected |');
  console.log('|----------|----------|');
  console.log(`| Duplicates | ${results.duplicates.rejected} |`);
  console.log(`| Irrelevant content | ${results.irrelevant.rejected} |`);
  console.log(`| Veterinary | ${results.veterinary.rejected} |`);
  console.log(`| Low relevance (<40) | ${results.low_relevance.rejected} |`);
  console.log(`| No topics (general cannabis) | ${results.no_topics_rejected.rejected} |`);
  console.log(`| **Total rejected** | **${results.duplicates.rejected + results.irrelevant.rejected + results.veterinary.rejected + results.low_relevance.rejected + results.no_topics_rejected.rejected}** |`);

  console.log(`\nNo-topics studies KEPT (PK/mechanism): ${results.no_topics_kept.count}`);
  if (results.no_topics_kept.count > 0) {
    console.log('\nSample kept studies:');
    results.no_topics_kept.titles.slice(0, 10).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t}...`);
    });
  }

  // Get final counts
  const { count: finalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: totalRejected } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const { count: totalPending } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  console.log('\n' + '='.repeat(70));
  console.log('  FINAL DATABASE STATE');
  console.log('='.repeat(70));
  console.log(`  Approved: ${finalApproved}`);
  console.log(`  Pending: ${totalPending}`);
  console.log(`  Rejected: ${totalRejected}`);
  console.log('='.repeat(70));
}

main().catch(console.error);
