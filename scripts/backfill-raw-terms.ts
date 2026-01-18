/**
 * Backfill Raw Terms Script
 *
 * Fetches raw terms from original sources for all existing studies
 * and resolves them to conditions.
 *
 * Run with: npx tsx scripts/backfill-raw-terms.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
function loadEnv(): Record<string, string> {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars: Record<string, string> = {};
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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface RawTerm {
  source: 'mesh' | 'openalex' | 'ctgov' | 'keyword' | 'title' | 'ai' | 'semantic_scholar';
  term: string;
  termId?: string;
  confidence?: number;
  isHealthRelated?: boolean;
  metadata?: Record<string, unknown>;
}

interface Study {
  id: string;
  doi: string | null;
  pmid: string | null;
  source: string;
  title: string;
}

interface ProcessResult {
  studyId: string;
  success: boolean;
  termsFound: number;
  error?: string;
}

// ==================== API FETCHERS ====================

async function fetchPubMedMeSH(pmid: string): Promise<RawTerm[]> {
  const terms: RawTerm[] = [];
  try {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
    const response = await fetch(url);
    if (!response.ok) return terms;

    const xml = await response.text();

    // Extract MeSH terms
    const meshMatches = xml.matchAll(/<MeshHeading>[\s\S]*?<DescriptorName[^>]*>([^<]+)<\/DescriptorName>[\s\S]*?<\/MeshHeading>/g);
    for (const match of meshMatches) {
      const term = match[1].trim();
      if (term && isHealthRelated(term)) {
        terms.push({
          source: 'mesh',
          term,
          isHealthRelated: true,
          confidence: 0.95
        });
      }
    }

    // Extract keywords
    const keywordMatches = xml.matchAll(/<Keyword[^>]*>([^<]+)<\/Keyword>/g);
    for (const match of keywordMatches) {
      const term = match[1].trim();
      if (term && isHealthRelated(term)) {
        terms.push({
          source: 'keyword',
          term,
          isHealthRelated: true,
          confidence: 0.8
        });
      }
    }
  } catch (error) {
    // Silently fail
  }
  return terms;
}

async function fetchEuropePMC(pmid?: string, doi?: string): Promise<RawTerm[]> {
  const terms: RawTerm[] = [];
  try {
    let query = '';
    if (pmid) {
      query = `ext_id:${pmid}`;
    } else if (doi) {
      query = `DOI:"${doi}"`;
    } else {
      return terms;
    }

    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core`;
    const response = await fetch(url);
    if (!response.ok) return terms;

    const data = await response.json();
    const article = data.resultList?.result?.[0];
    if (!article) return terms;

    // MeSH terms
    if (article.meshHeadingList?.meshHeading) {
      for (const mesh of article.meshHeadingList.meshHeading) {
        const term = mesh.descriptorName;
        if (term && isHealthRelated(term)) {
          terms.push({
            source: 'mesh',
            term,
            termId: mesh.meshId,
            isHealthRelated: true,
            confidence: 0.95
          });
        }
      }
    }

    // Chemicals
    if (article.chemicalList?.chemical) {
      for (const chem of article.chemicalList.chemical) {
        const term = chem.name;
        if (term && isHealthRelated(term)) {
          terms.push({
            source: 'mesh',
            term,
            isHealthRelated: true,
            confidence: 0.85
          });
        }
      }
    }

    // Keywords
    if (article.keywordList?.keyword) {
      for (const kw of article.keywordList.keyword) {
        if (kw && isHealthRelated(kw)) {
          terms.push({
            source: 'keyword',
            term: kw,
            isHealthRelated: true,
            confidence: 0.8
          });
        }
      }
    }
  } catch (error) {
    // Silently fail
  }
  return terms;
}

async function fetchOpenAlex(doi?: string, pmid?: string): Promise<RawTerm[]> {
  const terms: RawTerm[] = [];
  try {
    let url = '';
    if (doi) {
      url = `https://api.openalex.org/works/doi:${doi}`;
    } else if (pmid) {
      url = `https://api.openalex.org/works/pmid:${pmid}`;
    } else {
      return terms;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'CBD-Portal/1.0 (mailto:contact@example.com)' }
    });
    if (!response.ok) return terms;

    const data = await response.json();

    // Topics (newer OpenAlex)
    if (data.topics) {
      for (const topic of data.topics) {
        const term = topic.display_name;
        if (term && isHealthRelated(term)) {
          terms.push({
            source: 'openalex',
            term,
            termId: topic.id,
            isHealthRelated: true,
            confidence: topic.score || 0.9
          });
        }
      }
    }

    // Concepts (legacy OpenAlex)
    if (data.concepts) {
      for (const concept of data.concepts) {
        const term = concept.display_name;
        // Filter for health-related domains
        const healthDomains = ['Medicine', 'Biology', 'Psychology', 'Neuroscience', 'Pharmacology'];
        const isHealth = healthDomains.some(d =>
          concept.display_name?.includes(d) ||
          (concept.ancestors || []).some((a: any) => a.display_name?.includes(d))
        );

        if (term && (isHealth || isHealthRelated(term))) {
          terms.push({
            source: 'openalex',
            term,
            termId: concept.id,
            isHealthRelated: true,
            confidence: concept.score || 0.85
          });
        }
      }
    }
  } catch (error) {
    // Silently fail
  }
  return terms;
}

async function fetchClinicalTrials(nctId: string): Promise<RawTerm[]> {
  const terms: RawTerm[] = [];
  try {
    const url = `https://clinicaltrials.gov/api/v2/studies/${nctId}`;
    const response = await fetch(url);
    if (!response.ok) return terms;

    const data = await response.json();
    const protocol = data.protocolSection;

    // Conditions
    const conditions = protocol?.conditionsModule?.conditions || [];
    for (const condition of conditions) {
      if (condition && isHealthRelated(condition)) {
        terms.push({
          source: 'ctgov',
          term: condition,
          isHealthRelated: true,
          confidence: 0.95
        });
      }
    }

    // Keywords
    const keywords = protocol?.conditionsModule?.keywords || [];
    for (const kw of keywords) {
      if (kw && isHealthRelated(kw)) {
        terms.push({
          source: 'keyword',
          term: kw,
          isHealthRelated: true,
          confidence: 0.85
        });
      }
    }

    // Browse conditions (MeSH)
    const browseConditions = data.derivedSection?.conditionBrowseModule?.meshes || [];
    for (const mesh of browseConditions) {
      if (mesh.term && isHealthRelated(mesh.term)) {
        terms.push({
          source: 'mesh',
          term: mesh.term,
          termId: mesh.id,
          isHealthRelated: true,
          confidence: 0.95
        });
      }
    }
  } catch (error) {
    // Silently fail
  }
  return terms;
}

async function fetchSemanticScholar(doi?: string, pmid?: string): Promise<RawTerm[]> {
  const terms: RawTerm[] = [];
  try {
    let paperId = '';
    if (doi) {
      paperId = `DOI:${doi}`;
    } else if (pmid) {
      paperId = `PMID:${pmid}`;
    } else {
      return terms;
    }

    const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}?fields=s2FieldsOfStudy,tldr`;
    const response = await fetch(url);
    if (!response.ok) return terms;

    const data = await response.json();

    // Fields of study / topics
    if (data.s2FieldsOfStudy) {
      for (const field of data.s2FieldsOfStudy) {
        const term = field.category;
        if (term && isHealthRelated(term)) {
          terms.push({
            source: 'semantic_scholar',
            term,
            isHealthRelated: true,
            confidence: 0.85
          });
        }
      }
    }
  } catch (error) {
    // Silently fail
  }
  return terms;
}

// ==================== HEALTH FILTER ====================

function isHealthRelated(term: string): boolean {
  const termLower = term.toLowerCase();

  // Skip common non-health terms
  const skipTerms = [
    'research', 'study', 'analysis', 'review', 'method', 'methodology',
    'human', 'animal', 'cell', 'in vitro', 'in vivo',
    'dose', 'dosage', 'pharmacokinetics', 'bioavailability',
    'randomized', 'double-blind', 'placebo', 'controlled',
    'male', 'female', 'adult', 'aged', 'young',
    'cannabis', 'cannabidiol', 'cbd', 'thc', 'cannabinoid', 'hemp', 'marijuana'
  ];

  if (skipTerms.some(skip => termLower === skip)) {
    return false;
  }

  // Health-related patterns
  const healthPatterns = [
    /disease/i, /disorder/i, /syndrome/i, /condition/i,
    /pain/i, /ache/i, /inflammation/i, /infection/i,
    /cancer/i, /tumor/i, /carcinoma/i, /leukemia/i, /lymphoma/i,
    /epilepsy/i, /seizure/i, /anxiety/i, /depression/i,
    /arthritis/i, /diabetes/i, /hypertension/i,
    /alzheimer/i, /parkinson/i, /sclerosis/i,
    /autism/i, /adhd/i, /schizophrenia/i,
    /insomnia/i, /sleep/i, /fatigue/i,
    /nausea/i, /vomiting/i, /appetite/i,
    /obesity/i, /weight/i,
    /ptsd/i, /trauma/i, /stress/i,
    /addiction/i, /dependence/i, /withdrawal/i,
    /neuropathy/i, /neuralgia/i,
    /glaucoma/i, /macular/i,
    /crohn/i, /colitis/i, /ibs/i,
    /fibromyalgia/i, /lupus/i,
    /eczema/i, /psoriasis/i, /dermatitis/i,
    /migraine/i, /headache/i,
    /asthma/i, /copd/i, /respiratory/i,
    /cardiovascular/i, /heart/i, /stroke/i,
    /hepat/i, /liver/i, /kidney/i, /renal/i,
    /immune/i, /autoimmune/i,
    /cognitive/i, /memory/i, /dementia/i,
    /spastic/i, /dystonia/i, /tremor/i,
    /palliative/i, /chronic/i, /acute/i,
    /pediatric/i, /geriatric/i,
    /therapy/i, /therapeutic/i, /treatment/i
  ];

  return healthPatterns.some(pattern => pattern.test(termLower));
}

function isSkipTerm(term: string): boolean {
  const lower = term.toLowerCase();
  const skip = ['research', 'study', 'trial', 'clinical', 'treatment', 'therapy',
    'cannabidiol', 'cbd', 'cannabis', 'thc', 'cannabinoid', 'hemp',
    'dose', 'dosage', 'safety', 'efficacy', 'effect', 'effects', 'human', 'animal'];
  return lower.length < 4 || skip.some(s => lower === s || lower.includes(s));
}

// ==================== TERM RESOLVER ====================

async function resolveStudyConditions(supabase: SupabaseClient, studyId: string): Promise<{
  mapped: { conditionId: string; conditionName: string }[];
  unmapped: string[];
}> {
  const mapped: { conditionId: string; conditionName: string }[] = [];
  const unmapped: string[] = [];

  // Get raw terms
  const { data: rawTerms } = await supabase
    .from('study_raw_terms')
    .select('*')
    .eq('study_id', studyId)
    .eq('is_health_related', true);

  if (!rawTerms || rawTerms.length === 0) {
    return { mapped, unmapped };
  }

  // Get term mappings
  const { data: termMappings } = await supabase
    .from('term_mappings')
    .select('*');

  // Get conditions
  const { data: conditions } = await supabase
    .from('condition_taxonomy')
    .select('*')
    .eq('enabled', true);

  if (!conditions) return { mapped, unmapped };

  // Build lookup maps
  const mappingsByTerm = new Map<string, any>();
  for (const m of termMappings || []) {
    mappingsByTerm.set(m.source_term.toLowerCase(), m);
  }

  const conditionsById = new Map<string, any>();
  const conditionsBySynonym = new Map<string, any>();
  const conditionsByName = new Map<string, any>();

  for (const c of conditions) {
    conditionsById.set(c.id, c);
    conditionsByName.set(c.name.toLowerCase(), c);
    if (c.synonyms) {
      for (const s of c.synonyms) {
        conditionsBySynonym.set(s.toLowerCase(), c);
      }
    }
  }

  // Process terms
  const matchedConditions = new Map<string, { condition: any; confidence: number; sources: string[] }>();

  for (const rawTerm of rawTerms) {
    const termLower = rawTerm.term.toLowerCase();
    let matchedCondition: any = null;
    let confidence = rawTerm.confidence || 1.0;

    // Check mappings
    const mapping = mappingsByTerm.get(termLower);
    if (mapping) {
      matchedCondition = conditionsById.get(mapping.maps_to);
      confidence = Math.min(confidence, mapping.confidence);
    }

    // Check exact name match
    if (!matchedCondition) {
      matchedCondition = conditionsByName.get(termLower);
    }

    // Check synonyms
    if (!matchedCondition) {
      matchedCondition = conditionsBySynonym.get(termLower);
    }

    // Fuzzy match - check if term contains condition name
    if (!matchedCondition) {
      for (const [name, cond] of conditionsByName) {
        if (termLower.includes(name) || name.includes(termLower)) {
          matchedCondition = cond;
          confidence = Math.min(confidence, 0.7);
          break;
        }
      }
    }

    if (matchedCondition) {
      const existing = matchedConditions.get(matchedCondition.id);
      if (existing) {
        existing.confidence = Math.max(existing.confidence, confidence);
        if (!existing.sources.includes(rawTerm.source)) {
          existing.sources.push(rawTerm.source);
        }
      } else {
        matchedConditions.set(matchedCondition.id, {
          condition: matchedCondition,
          confidence,
          sources: [rawTerm.source]
        });
      }
    } else if (!isSkipTerm(termLower)) {
      unmapped.push(rawTerm.term);
    }
  }

  // Save to study_conditions
  if (matchedConditions.size > 0) {
    const rows = Array.from(matchedConditions.entries()).map(([conditionId, data]) => ({
      study_id: studyId,
      condition_id: conditionId,
      relevance: data.sources.length >= 2 ? 'primary' : 'secondary',
      confidence: data.confidence,
      source_count: data.sources.length,
      sources: data.sources
    }));

    await supabase
      .from('study_conditions')
      .upsert(rows, { onConflict: 'study_id,condition_id' });

    for (const [conditionId, data] of matchedConditions) {
      mapped.push({ conditionId, conditionName: data.condition.name });

      // Update count
      const { count } = await supabase
        .from('study_conditions')
        .select('*', { count: 'exact', head: true })
        .eq('condition_id', conditionId);

      await supabase
        .from('condition_taxonomy')
        .update({ study_count: count || 0, updated_at: new Date().toISOString() })
        .eq('id', conditionId);
    }
  }

  // Record unmapped
  for (const term of [...new Set(unmapped)]) {
    const termLower = term.toLowerCase();
    const { data: existing } = await supabase
      .from('suggested_mappings')
      .select('id, study_count')
      .eq('term', termLower)
      .single();

    if (existing) {
      await supabase
        .from('suggested_mappings')
        .update({ study_count: existing.study_count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('suggested_mappings')
        .insert({ term: termLower, original_term: term, study_count: 1, status: 'pending' });
    }
  }

  return { mapped, unmapped };
}

// ==================== MAIN BACKFILL ====================

async function processStudy(study: Study): Promise<ProcessResult> {
  const result: ProcessResult = {
    studyId: study.id,
    success: false,
    termsFound: 0
  };

  try {
    let terms: RawTerm[] = [];
    const source = study.source?.toLowerCase() || '';

    // Fetch based on source
    if (source === 'pubmed' || source === 'pmc') {
      if (study.pmid) {
        terms = await fetchPubMedMeSH(study.pmid);
      }
    } else if (source === 'europepmc') {
      terms = await fetchEuropePMC(study.pmid || undefined, study.doi || undefined);
    } else if (source === 'openalex') {
      terms = await fetchOpenAlex(study.doi || undefined, study.pmid || undefined);
    } else if (source === 'clinicaltrials' || source === 'ctgov') {
      // Extract NCT ID from DOI or study info
      const nctMatch = study.doi?.match(/NCT\d+/i) || study.title?.match(/NCT\d+/i);
      if (nctMatch) {
        terms = await fetchClinicalTrials(nctMatch[0]);
      }
    } else if (source === 'semantic_scholar') {
      terms = await fetchSemanticScholar(study.doi || undefined, study.pmid || undefined);
    } else if (source === 'biorxiv' || source === 'medrxiv') {
      // Lookup via OpenAlex
      terms = await fetchOpenAlex(study.doi || undefined, study.pmid || undefined);
    } else {
      // Default: try multiple sources
      if (study.pmid) {
        terms = await fetchPubMedMeSH(study.pmid);
      }
      if (terms.length === 0 && (study.doi || study.pmid)) {
        terms = await fetchEuropePMC(study.pmid || undefined, study.doi || undefined);
      }
      if (terms.length === 0 && (study.doi || study.pmid)) {
        terms = await fetchOpenAlex(study.doi || undefined, study.pmid || undefined);
      }
    }

    // Store raw terms
    if (terms.length > 0) {
      const rows = terms.map(t => ({
        study_id: study.id,
        term: t.term,
        source: t.source,
        term_id: t.termId || null,
        confidence: t.confidence || 0.8,
        is_health_related: t.isHealthRelated !== false,
        metadata: t.metadata || null
      }));

      // Upsert to avoid duplicates
      for (const row of rows) {
        await supabase
          .from('study_raw_terms')
          .upsert(row, { onConflict: 'study_id,term,source' })
          .select();
      }

      result.termsFound = terms.length;

      // Resolve conditions
      await resolveStudyConditions(supabase, study.id);
    }

    result.success = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return result;
}

async function main() {
  console.log('===========================================');
  console.log('  RAW TERMS BACKFILL - Starting');
  console.log('===========================================\n');

  // Get studies that need processing
  const { data: allStudiesWithTerms } = await supabase
    .from('study_raw_terms')
    .select('study_id');

  const studiesWithTerms = new Set((allStudiesWithTerms || []).map(s => s.study_id));

  const { data: studies, error } = await supabase
    .from('kb_research_queue')
    .select('id, doi, pmid, source, title')
    .in('status', ['pending', 'approved', 'integrated'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching studies:', error);
    process.exit(1);
  }

  // Filter out studies that already have raw terms
  const pendingStudies = (studies || []).filter(s => !studiesWithTerms.has(s.id));

  console.log(`Total studies in queue: ${studies?.length || 0}`);
  console.log(`Already have raw terms: ${studiesWithTerms.size}`);
  console.log(`Need processing: ${pendingStudies.length}\n`);

  if (pendingStudies.length === 0) {
    console.log('All studies already have raw terms!');
    await printFinalStats();
    return;
  }

  // Process in batches
  const BATCH_SIZE = 50;
  const results: ProcessResult[] = [];
  let processed = 0;

  for (let i = 0; i < pendingStudies.length; i += BATCH_SIZE) {
    const batch = pendingStudies.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pendingStudies.length / BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatches} (${processed}/${pendingStudies.length} studies)...`);

    for (const study of batch) {
      const result = await processStudy(study);
      results.push(result);
      processed++;
    }

    // Rate limit between batches
    if (i + BATCH_SIZE < pendingStudies.length) {
      await delay(1000);
    }
  }

  console.log(`\nProcessed ${processed}/${pendingStudies.length} studies\n`);

  // Calculate stats
  const successful = results.filter(r => r.success);
  const withTerms = results.filter(r => r.termsFound > 0);
  const failed = results.filter(r => !r.success);

  console.log('===========================================');
  console.log('  BACKFILL COMPLETE - Results');
  console.log('===========================================\n');

  console.log(`Studies processed: ${results.length}`);
  console.log(`Successful API lookups: ${successful.length}`);
  console.log(`Studies with raw terms: ${withTerms.length}`);
  console.log(`Failed lookups: ${failed.length}`);

  if (failed.length > 0 && failed.length <= 20) {
    console.log('\nFailed studies:');
    for (const f of failed.slice(0, 20)) {
      console.log(`  - ${f.studyId}: ${f.error}`);
    }
  }

  await printFinalStats();
}

async function printFinalStats() {
  console.log('\n===========================================');
  console.log('  DATABASE STATUS');
  console.log('===========================================\n');

  // Raw terms count
  const { count: rawTermsCount } = await supabase
    .from('study_raw_terms')
    .select('*', { count: 'exact', head: true });

  // Studies with raw terms
  const { data: studiesWithTermsData } = await supabase
    .from('study_raw_terms')
    .select('study_id');
  const uniqueStudiesWithTerms = new Set((studiesWithTermsData || []).map(s => s.study_id));

  // Studies with conditions
  const { data: studiesWithConditionsData } = await supabase
    .from('study_conditions')
    .select('study_id');
  const uniqueStudiesWithConditions = new Set((studiesWithConditionsData || []).map(s => s.study_id));

  // Total studies
  const { count: totalStudies } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'approved', 'integrated']);

  console.log('Counts:');
  console.log(`  Total studies: ${totalStudies || 0}`);
  console.log(`  Studies with raw terms: ${uniqueStudiesWithTerms.size}`);
  console.log(`  Studies with conditions: ${uniqueStudiesWithConditions.size}`);
  console.log(`  Total raw terms: ${rawTermsCount || 0}`);

  const mappingRate = totalStudies && totalStudies > 0
    ? Math.round((uniqueStudiesWithConditions.size / totalStudies) * 100)
    : 0;
  console.log(`  Overall mapping rate: ${mappingRate}%`);

  // Top 20 conditions
  const { data: topConditions } = await supabase
    .from('condition_taxonomy')
    .select('name, study_count')
    .gt('study_count', 0)
    .order('study_count', { ascending: false })
    .limit(20);

  if (topConditions && topConditions.length > 0) {
    console.log('\nTop 20 Conditions by Study Count:');
    topConditions.forEach((c, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${c.name}: ${c.study_count} studies`);
    });
  }

  // Top 20 unmapped terms
  const { data: topUnmapped } = await supabase
    .from('suggested_mappings')
    .select('term, study_count')
    .eq('status', 'pending')
    .order('study_count', { ascending: false })
    .limit(20);

  if (topUnmapped && topUnmapped.length > 0) {
    console.log('\nTop 20 Unmapped Terms (candidates for new conditions):');
    topUnmapped.forEach((t, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. "${t.term}": ${t.study_count} studies`);
    });
  }

  console.log('\n===========================================');
}

// Run
main().catch(console.error);
