/**
 * Deep Audit of Research Database
 *
 * Reads titles AND abstracts to find misclassified studies
 *
 * Run with: node scripts/deep-audit.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
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

// ================================================================
// REJECTION PATTERNS - Studies that should NOT be approved
// ================================================================

const REJECTION_PATTERNS = {
  extraction: {
    strong: [
      /\b(hplc|gc-ms|lc-ms|mass spectrometry|chromatograph|spectroscop)/i,
      /\b(extraction method|extraction technique|extraction process|solvent extraction)/i,
      /\b(supercritical co2|supercritical fluid|supercritical carbon)/i,
      /\b(purification method|purification technique|purification of cannabinoid)/i,
      /\b(analytical method|analytical technique|analytical validation)/i,
      /\b(quantification method|quantitative analysis|quantitative determination)/i,
      /\b(isolation of|isolating cannabinoid|isolated from cannabis)/i,
    ],
    context: [
      /\b(optimize extraction|optimizing extraction|optimization of extraction)/i,
      /\b(extract preparation|preparing extract|extraction yield)/i,
      /\b(detection limit|limit of detection|calibration curve)/i,
    ]
  },

  agriculture: {
    strong: [
      /\b(hemp cultivation|cannabis cultivation|cultivar|cultivated hemp)/i,
      /\b(crop yield|crop production|agricultural|farming practice)/i,
      /\b(germination|seedling|plant growth|growing condition)/i,
      /\b(hemp fiber|fiber production|textile|biomass production)/i,
      /\b(phytoremediation|soil contamination|heavy metal accumulation)/i,
      /\b(hemp seed oil|seed production|seed yield)/i,
    ],
    context: [
      /\b(fertilizer|irrigation|harvest|planting)/i,
      /\b(outdoor cultivation|indoor cultivation|greenhouse)/i,
    ]
  },

  policy: {
    strong: [
      /\b(legalization|decriminalization|cannabis policy|drug policy)/i,
      /\b(legislation|regulatory framework|legal status|legal implication)/i,
      /\b(law enforcement|criminal justice|prosecution|incarceration)/i,
      /\b(policy reform|policy change|policy implication|policy analysis)/i,
    ],
    context: [
      /\b(legal market|illegal market|black market)/i,
      /\b(regulatory|regulation of cannabis)/i,
    ]
  },

  market: {
    strong: [
      /\b(market analysis|market size|market growth|market trend)/i,
      /\b(cannabis industry|marijuana industry|dispensary sale|retail sale)/i,
      /\b(economic impact|economic analysis|tax revenue|consumer spending)/i,
      /\b(sales data|purchasing pattern|consumer preference)/i,
      /\b(price analysis|pricing|commercial cannabis)/i,
    ],
    context: [
      /\b(business model|investment|entrepreneur)/i,
    ]
  },

  recreational: {
    strong: [
      /\b(recreational use pattern|recreational cannabis use pattern)/i,
      /\b(prevalence of use|frequency of use|patterns of use among)/i,
      /\b(survey of cannabis user|survey of marijuana user)/i,
      /\b(who use cannabis|who use marijuana|cannabis user demographic)/i,
    ],
    context: [
      /\b(motivations for use|reasons for use|why people use)/i,
    ]
  },

  driving: {
    strong: [
      /\b(driving impairment|impaired driving|drugged driving)/i,
      /\b(driving performance|driving simulator|driving under the influence)/i,
      /\b(traffic safety|road safety|motor vehicle)/i,
      /\b(field sobriety|roadside test|driving test)/i,
    ],
    context: []
  },

  detection: {
    strong: [
      /\b(urine test|blood test|saliva test|hair test) for (cannabis|marijuana|thc|cannabinoid)/i,
      /\b(drug testing|drug screen|workplace testing)/i,
      /\b(forensic analysis|forensic detection|forensic identification)/i,
      /\b(detect cannabis|detecting marijuana|detection of thc)/i,
    ],
    context: [
      /\b(cut-off|cutoff|positive test|test result)/i,
    ]
  },

  thc_only: {
    strong: [
      /\bthc\b(?!.*\bcbd\b)(?!.*\bcannabidiol\b)/i, // THC without CBD mention
    ],
    context: []
  },

  environmental: {
    strong: [
      /\b(water contamination|soil pollution|environmental impact of cannabis)/i,
      /\b(wastewater|runoff|effluent)/i,
    ],
    context: []
  }
};

// ================================================================
// APPROVAL PATTERNS - Studies that SHOULD be approved
// ================================================================

const APPROVAL_PATTERNS = {
  clinical: {
    strong: [
      /\b(clinical trial|randomized controlled|double-blind|placebo-controlled)/i,
      /\b(patient|participants|subjects) (with|diagnosed|suffering)/i,
      /\b(treatment of|therapy for|treating|therapeutic)/i,
      /\b(efficacy|effectiveness|safety|tolerability)/i,
      /\b(symptom relief|symptom reduction|symptom improvement)/i,
    ]
  },

  mechanism: {
    strong: [
      /\b(mechanism of action|molecular mechanism|signaling pathway)/i,
      /\b(receptor|endocannabinoid system|cb1|cb2)/i,
      /\b(anti-inflammatory|antioxidant|neuroprotective|anxiolytic)/i,
      /\b(apoptosis|cell death|cytotoxic|antiproliferative)/i,
    ]
  },

  pharmacology: {
    strong: [
      /\b(pharmacokinetic|pharmacodynamic|bioavailability)/i,
      /\b(absorption|distribution|metabolism|excretion)/i,
      /\b(dose-response|dosing|dose finding)/i,
      /\b(half-life|plasma concentration|serum level)/i,
    ]
  },

  condition_specific: {
    strong: [
      /\b(pain|anxiety|depression|epilepsy|seizure|cancer|tumor|inflammation)/i,
      /\b(sleep|insomnia|nausea|vomiting|spasticity|multiple sclerosis)/i,
      /\b(parkinson|alzheimer|dementia|autism|adhd|schizophrenia|psychosis)/i,
      /\b(arthritis|fibromyalgia|migraine|crohn|colitis|diabetes)/i,
    ]
  },

  safety: {
    strong: [
      /\b(adverse event|side effect|adverse reaction|safety profile)/i,
      /\b(drug interaction|contraindication)/i,
    ]
  },

  review: {
    strong: [
      /\b(systematic review|meta-analysis|cochrane)/i,
      /\b(review of (clinical|therapeutic|medical))/i,
    ]
  }
};

// ================================================================
// CLASSIFICATION FUNCTION
// ================================================================

function classifyStudy(title, abstract) {
  const text = `${title || ''} ${abstract || ''}`.toLowerCase();
  const titleLower = (title || '').toLowerCase();

  const result = {
    shouldReject: false,
    shouldApprove: false,
    rejectReason: null,
    approveReason: null,
    rejectScore: 0,
    approveScore: 0,
    details: []
  };

  // Check for CBD/cannabidiol mention (basic relevance)
  const hasCBD = /\bcbd\b|cannabidiol/i.test(text);
  const hasCannabinoid = /cannabinoid|cannabis|hemp/i.test(text);

  // Check rejection patterns
  for (const [category, patterns] of Object.entries(REJECTION_PATTERNS)) {
    let categoryScore = 0;

    for (const pattern of patterns.strong) {
      if (pattern.test(text)) {
        categoryScore += 3;
        // Extra weight if in title
        if (pattern.test(titleLower)) {
          categoryScore += 2;
        }
      }
    }

    for (const pattern of patterns.context || []) {
      if (pattern.test(text)) {
        categoryScore += 1;
      }
    }

    if (categoryScore >= 3) {
      result.rejectScore += categoryScore;
      result.details.push(`${category}: score ${categoryScore}`);
      if (!result.rejectReason) {
        result.rejectReason = category;
      }
    }
  }

  // Check approval patterns
  for (const [category, patterns] of Object.entries(APPROVAL_PATTERNS)) {
    let categoryScore = 0;

    for (const pattern of patterns.strong) {
      if (pattern.test(text)) {
        categoryScore += 2;
      }
    }

    if (categoryScore >= 2) {
      result.approveScore += categoryScore;
      if (!result.approveReason) {
        result.approveReason = category;
      }
    }
  }

  // Decision logic
  // Strong rejection signals override approval unless very strong approval signals
  if (result.rejectScore >= 5 && result.approveScore < 8) {
    result.shouldReject = true;
  } else if (result.approveScore >= 4 && result.rejectScore < 8) {
    result.shouldApprove = true;
  } else if (result.rejectScore >= 3 && result.approveScore < 4) {
    result.shouldReject = true;
  }

  // Special case: if no CBD focus and has rejection signals
  if (!hasCBD && result.rejectScore >= 3) {
    result.shouldReject = true;
    result.details.push('no_cbd_focus');
  }

  return result;
}

// ================================================================
// MAIN AUDIT FUNCTION
// ================================================================

async function fetchStudies(status) {
  let allStudies = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, abstract, relevant_topics, relevance_score')
      .eq('status', status)
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
  console.log('  DEEP AUDIT OF RESEARCH DATABASE');
  console.log('='.repeat(70));
  console.log('\nThis audit reads BOTH titles AND abstracts for accuracy.');
  console.log('Starting systematic review...\n');

  const report = {
    approved: {
      total: 0,
      misclassified: [],
      byReason: {}
    },
    rejected: {
      total: 0,
      wronglyRejected: [],
      byReason: {}
    }
  };

  // ================================================================
  // PART 1: AUDIT APPROVED STUDIES
  // ================================================================
  console.log('='.repeat(70));
  console.log('  PART 1: AUDITING APPROVED STUDIES');
  console.log('='.repeat(70));

  const approvedStudies = await fetchStudies('approved');
  report.approved.total = approvedStudies.length;
  console.log(`\nTotal approved studies to audit: ${approvedStudies.length}`);

  const BATCH_SIZE = 200;
  let batchNum = 0;

  for (let i = 0; i < approvedStudies.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = approvedStudies.slice(i, i + BATCH_SIZE);
    let batchMisclassified = 0;

    for (const study of batch) {
      const result = classifyStudy(study.title, study.abstract);

      if (result.shouldReject) {
        batchMisclassified++;
        report.approved.misclassified.push({
          id: study.id,
          title: study.title,
          reason: result.rejectReason,
          details: result.details,
          rejectScore: result.rejectScore,
          approveScore: result.approveScore
        });

        report.approved.byReason[result.rejectReason] =
          (report.approved.byReason[result.rejectReason] || 0) + 1;
      }
    }

    console.log(`Batch ${batchNum} (${i + 1}-${Math.min(i + BATCH_SIZE, approvedStudies.length)}): ${batchMisclassified} misclassified`);
  }

  // ================================================================
  // PART 2: AUDIT REJECTED STUDIES
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  PART 2: AUDITING REJECTED STUDIES');
  console.log('='.repeat(70));

  const rejectedStudies = await fetchStudies('rejected');
  report.rejected.total = rejectedStudies.length;
  console.log(`\nTotal rejected studies to audit: ${rejectedStudies.length}`);

  batchNum = 0;

  for (let i = 0; i < rejectedStudies.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = rejectedStudies.slice(i, i + BATCH_SIZE);
    let batchWronglyRejected = 0;

    for (const study of batch) {
      const result = classifyStudy(study.title, study.abstract);

      // Check if this should actually be approved
      if (result.shouldApprove && !result.shouldReject) {
        batchWronglyRejected++;
        report.rejected.wronglyRejected.push({
          id: study.id,
          title: study.title,
          reason: result.approveReason,
          approveScore: result.approveScore,
          rejectScore: result.rejectScore
        });

        report.rejected.byReason[result.approveReason] =
          (report.rejected.byReason[result.approveReason] || 0) + 1;
      }
    }

    console.log(`Batch ${batchNum} (${i + 1}-${Math.min(i + BATCH_SIZE, rejectedStudies.length)}): ${batchWronglyRejected} wrongly rejected`);
  }

  // ================================================================
  // SUMMARY REPORT
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('  AUDIT SUMMARY');
  console.log('='.repeat(70));

  const approvedMisclassifiedPct = ((report.approved.misclassified.length / report.approved.total) * 100).toFixed(1);
  const rejectedWrongPct = ((report.rejected.wronglyRejected.length / report.rejected.total) * 100).toFixed(1);

  console.log('\n1. SUMMARY STATISTICS');
  console.log('---------------------');
  console.log(`Total approved studies audited: ${report.approved.total}`);
  console.log(`Approved that should be rejected: ${report.approved.misclassified.length} (${approvedMisclassifiedPct}%)`);
  console.log(`\nTotal rejected studies audited: ${report.rejected.total}`);
  console.log(`Rejected that should be approved: ${report.rejected.wronglyRejected.length} (${rejectedWrongPct}%)`);

  console.log('\n2. MISCLASSIFIED APPROVED STUDIES BY REASON');
  console.log('-------------------------------------------');
  for (const [reason, count] of Object.entries(report.approved.byReason).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }

  console.log('\n3. WRONGLY REJECTED STUDIES BY REASON');
  console.log('-------------------------------------');
  for (const [reason, count] of Object.entries(report.rejected.byReason).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count}`);
  }

  // Sample misclassified approved
  console.log('\n4. SAMPLE MISCLASSIFIED APPROVED STUDIES (first 20)');
  console.log('---------------------------------------------------');
  report.approved.misclassified.slice(0, 20).forEach((s, i) => {
    console.log(`${i + 1}. [${s.reason}] ${s.title?.substring(0, 65)}...`);
    console.log(`   ID: ${s.id}`);
  });

  // Sample wrongly rejected
  console.log('\n5. SAMPLE WRONGLY REJECTED STUDIES (first 20)');
  console.log('---------------------------------------------');
  report.rejected.wronglyRejected.slice(0, 20).forEach((s, i) => {
    console.log(`${i + 1}. [${s.reason}] ${s.title?.substring(0, 65)}...`);
    console.log(`   ID: ${s.id}`);
  });

  // Save full report to file
  const fullReport = {
    summary: {
      approvedTotal: report.approved.total,
      approvedMisclassified: report.approved.misclassified.length,
      approvedMisclassifiedPct: approvedMisclassifiedPct,
      rejectedTotal: report.rejected.total,
      rejectedWrongly: report.rejected.wronglyRejected.length,
      rejectedWronglyPct: rejectedWrongPct
    },
    approvedByReason: report.approved.byReason,
    rejectedByReason: report.rejected.byReason,
    misclassifiedApproved: report.approved.misclassified,
    wronglyRejected: report.rejected.wronglyRejected
  };

  const reportPath = join(__dirname, 'audit-report.json');
  writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`\n\nFull report saved to: ${reportPath}`);

  // Print IDs for easy copying
  console.log('\n' + '='.repeat(70));
  console.log('  IDS FOR STATUS CHANGES');
  console.log('='.repeat(70));

  console.log('\nApproved → Should Reject (IDs):');
  console.log(report.approved.misclassified.map(s => s.id).join('\n'));

  console.log('\nRejected → Should Approve (IDs):');
  console.log(report.rejected.wronglyRejected.map(s => s.id).join('\n'));

  console.log('\n' + '='.repeat(70));
  console.log('  AUDIT COMPLETE - NO CHANGES MADE');
  console.log('='.repeat(70));
}

main().catch(console.error);
