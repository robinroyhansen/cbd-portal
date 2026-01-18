/**
 * Condition Intelligence System - Phase 5: Backfill Script
 *
 * This script:
 * 1. Applies pending migrations
 * 2. Runs the batch resolver on all studies
 * 3. Reports statistics
 *
 * Run with: npx tsx scripts/backfill-conditions.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration(filename: string): Promise<boolean> {
  const migrationPath = path.join(process.cwd(), 'supabase/migrations', filename);

  if (!fs.existsSync(migrationPath)) {
    console.log(`Migration file not found: ${filename}`);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\nApplying ${filename} (${statements.length} statements)...`);

  for (const statement of statements) {
    if (statement.trim()) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).maybeSingle();
      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
        console.log(`  Warning: ${error.message.substring(0, 100)}...`);
      }
    }
  }

  return true;
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  return !error || error.code !== '42P01';
}

async function runBackfill(): Promise<void> {
  console.log('\n========================================');
  console.log('CONDITION INTELLIGENCE SYSTEM - BACKFILL');
  console.log('========================================\n');

  // Step 1: Check if tables exist
  console.log('Checking database tables...');

  const tables = [
    'condition_taxonomy',
    'study_raw_terms',
    'term_mappings',
    'study_conditions',
    'suggested_mappings'
  ];

  for (const table of tables) {
    const exists = await checkTableExists(table);
    console.log(`  ${table}: ${exists ? '✓ exists' : '✗ missing'}`);
  }

  // Step 2: Get current stats before backfill
  console.log('\n--- BEFORE BACKFILL ---');
  await printStats();

  // Step 3: Run the resolver on studies with raw terms
  console.log('\n--- RUNNING BACKFILL ---');

  // Get studies with raw terms that don't have conditions yet
  const { data: studiesWithTerms } = await supabase
    .from('study_raw_terms')
    .select('study_id')
    .limit(10000);

  if (!studiesWithTerms || studiesWithTerms.length === 0) {
    console.log('No studies with raw terms found.');
    console.log('Raw terms are captured when scanning from OpenAlex, ClinicalTrials.gov, or Europe PMC.');
    return;
  }

  const uniqueStudyIds = [...new Set(studiesWithTerms.map(s => s.study_id))];
  console.log(`Found ${uniqueStudyIds.length} studies with raw terms`);

  // Check which already have conditions
  const { data: alreadyResolved } = await supabase
    .from('study_conditions')
    .select('study_id')
    .in('study_id', uniqueStudyIds.slice(0, 1000));

  const resolvedSet = new Set((alreadyResolved || []).map(s => s.study_id));
  const pendingIds = uniqueStudyIds.filter(id => !resolvedSet.has(id));

  console.log(`${resolvedSet.size} already resolved, ${pendingIds.length} pending`);

  if (pendingIds.length === 0) {
    console.log('All studies already resolved!');
  } else {
    // Process in batches
    const BATCH_SIZE = 50;
    let resolved = 0;
    let failed = 0;
    const allUnmapped: string[] = [];

    for (let i = 0; i < Math.min(pendingIds.length, 500); i += BATCH_SIZE) {
      const batch = pendingIds.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(Math.min(pendingIds.length, 500) / BATCH_SIZE)}...`);

      for (const studyId of batch) {
        try {
          const result = await resolveStudyConditions(studyId);
          if (result.mapped.length > 0) {
            resolved++;
          }
          allUnmapped.push(...result.unmapped);
        } catch (error) {
          failed++;
        }
      }
    }

    console.log(`\nBackfill complete: ${resolved} resolved, ${failed} failed`);

    // Report top unmapped terms
    const termCounts = new Map<string, number>();
    for (const term of allUnmapped) {
      const lower = term.toLowerCase();
      termCounts.set(lower, (termCounts.get(lower) || 0) + 1);
    }

    const topUnmapped = Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (topUnmapped.length > 0) {
      console.log('\nTop 10 Unmapped Terms:');
      topUnmapped.forEach(([term, count], i) => {
        console.log(`  ${i + 1}. "${term}" (${count} occurrences)`);
      });
    }
  }

  // Step 4: Print final stats
  console.log('\n--- AFTER BACKFILL ---');
  await printStats();

  // Step 5: Show conditions ready for pages
  console.log('\n--- CONDITIONS READY FOR PAGES ---');
  const { data: readyForPages } = await supabase
    .from('condition_taxonomy')
    .select('name, slug, study_count, human_study_count, has_page')
    .gte('study_count', 10)
    .eq('has_page', false)
    .eq('enabled', true)
    .order('study_count', { ascending: false })
    .limit(10);

  if (readyForPages && readyForPages.length > 0) {
    console.log('Conditions with 10+ studies that need pages:');
    readyForPages.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (${c.study_count} studies, ${c.human_study_count} human)`);
    });
  } else {
    console.log('No conditions ready for pages yet.');
  }

  // Step 6: Show unmapped terms with 10+ studies
  console.log('\n--- UNMAPPED TERMS (10+ STUDIES) ---');
  const { data: highVolumeUnmapped } = await supabase
    .from('suggested_mappings')
    .select('term, study_count, sample_titles')
    .eq('status', 'pending')
    .gte('study_count', 10)
    .order('study_count', { ascending: false })
    .limit(20);

  if (highVolumeUnmapped && highVolumeUnmapped.length > 0) {
    console.log('Unmapped terms with 10+ studies (candidates for new conditions):');
    highVolumeUnmapped.forEach((t, i) => {
      console.log(`  ${i + 1}. "${t.term}" (${t.study_count} studies)`);
      if (t.sample_titles?.[0]) {
        console.log(`      Example: "${t.sample_titles[0].substring(0, 60)}..."`);
      }
    });
  } else {
    console.log('No high-volume unmapped terms found.');
  }
}

async function printStats(): Promise<void> {
  // Get total raw terms
  const { count: totalRawTerms } = await supabase
    .from('study_raw_terms')
    .select('*', { count: 'exact', head: true });

  // Get studies with conditions
  const { data: studiesWithConditions } = await supabase
    .from('study_conditions')
    .select('study_id');

  const uniqueStudiesWithConditions = new Set((studiesWithConditions || []).map(s => s.study_id));

  // Get active conditions
  const { count: activeConditions } = await supabase
    .from('condition_taxonomy')
    .select('*', { count: 'exact', head: true })
    .gt('study_count', 0);

  // Get term mappings count
  const { count: termMappings } = await supabase
    .from('term_mappings')
    .select('*', { count: 'exact', head: true });

  // Get total approved studies
  const { count: totalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  console.log('Mapping Health:');
  console.log(`  Total raw terms: ${totalRawTerms || 0}`);
  console.log(`  Term mappings: ${termMappings || 0}`);
  console.log(`  Studies with conditions: ${uniqueStudiesWithConditions.size}`);
  console.log(`  Active conditions: ${activeConditions || 0}`);
  console.log(`  Total approved studies: ${totalApproved || 0}`);

  if (totalApproved && totalApproved > 0) {
    const percentage = Math.round((uniqueStudiesWithConditions.size / totalApproved) * 100);
    console.log(`  Resolution rate: ${percentage}%`);
  }

  // Top conditions by study count
  const { data: topConditions } = await supabase
    .from('condition_taxonomy')
    .select('name, study_count')
    .gt('study_count', 0)
    .order('study_count', { ascending: false })
    .limit(10);

  if (topConditions && topConditions.length > 0) {
    console.log('\nTop 10 Conditions by Study Count:');
    topConditions.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}: ${c.study_count} studies`);
    });
  }
}

// Simplified resolver for backfill (inline version)
async function resolveStudyConditions(studyId: string): Promise<{ mapped: any[]; unmapped: string[] }> {
  const mapped: any[] = [];
  const unmapped: string[] = [];

  // Get raw terms for this study
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

  if (!conditions) {
    return { mapped, unmapped: rawTerms.map(t => t.term) };
  }

  // Build lookup maps
  const mappingsByTerm = new Map<string, any>();
  for (const mapping of termMappings || []) {
    mappingsByTerm.set(mapping.source_term.toLowerCase(), mapping);
  }

  const conditionsById = new Map<string, any>();
  const conditionsBySynonym = new Map<string, any>();

  for (const condition of conditions) {
    conditionsById.set(condition.id, condition);
    if (condition.synonyms) {
      for (const synonym of condition.synonyms) {
        conditionsBySynonym.set(synonym.toLowerCase(), condition);
      }
    }
  }

  // Process each term
  const matchedConditions = new Map<string, { confidence: number; sources: string[] }>();

  for (const rawTerm of rawTerms) {
    const termLower = rawTerm.term.toLowerCase();
    let matchedCondition: any = null;
    let confidence = rawTerm.confidence || 1.0;

    // Check term_mappings
    const mapping = mappingsByTerm.get(termLower);
    if (mapping) {
      matchedCondition = conditionsById.get(mapping.maps_to);
      confidence = Math.min(confidence, mapping.confidence);
    }

    // Check synonyms
    if (!matchedCondition) {
      matchedCondition = conditionsBySynonym.get(termLower);
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
          confidence,
          sources: [rawTerm.source]
        });
      }
    } else {
      // Check if it looks like a health condition
      if (termLower.length > 3 && !isCommonTerm(termLower)) {
        unmapped.push(rawTerm.term);
      }
    }
  }

  // Save study_conditions
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

    mapped.push(...rows);

    // Update condition study counts
    for (const conditionId of matchedConditions.keys()) {
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

  // Record unmapped terms
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
        .update({
          study_count: existing.study_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('suggested_mappings')
        .insert({
          term: termLower,
          original_term: term,
          study_count: 1,
          status: 'pending'
        });
    }
  }

  return { mapped, unmapped };
}

function isCommonTerm(term: string): boolean {
  const skipTerms = [
    'research', 'study', 'trial', 'analysis', 'review', 'method',
    'human', 'animal', 'cell', 'clinical', 'treatment', 'therapy',
    'cannabidiol', 'cbd', 'cannabis', 'thc', 'cannabinoid', 'hemp',
    'dose', 'dosage', 'safety', 'efficacy', 'effect', 'effects'
  ];
  return skipTerms.some(skip => term === skip || term.includes(skip));
}

// Run the backfill
runBackfill().catch(console.error);
