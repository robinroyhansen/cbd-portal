#!/usr/bin/env node

/**
 * Link citations to internal study pages
 *
 * Matches citations to kb_research_queue studies by PMID
 * to enable the [Summary] link in the hybrid citation model
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔗 LINKING CITATIONS TO INTERNAL STUDY PAGES');
  console.log('='.repeat(55));

  // Get all citations with PMIDs but no slug
  const { data: citations, error: citError } = await supabase
    .from('kb_citations')
    .select('id, title, pmid, doi, slug')
    .not('pmid', 'is', null)
    .is('slug', null);

  if (citError) {
    console.error('Error fetching citations:', citError.message);
    return;
  }

  console.log(`Found ${citations.length} citations with PMIDs to match\n`);

  // Get all approved studies with slugs
  const { data: studies, error: studyError } = await supabase
    .from('kb_research_queue')
    .select('slug, pmid, doi, title')
    .eq('status', 'approved')
    .not('slug', 'is', null);

  if (studyError) {
    console.error('Error fetching studies:', studyError.message);
    return;
  }

  console.log(`Found ${studies.length} studies to match against\n`);

  // Build lookup maps
  const studyByPmid = new Map();
  const studyByDoi = new Map();

  studies.forEach(s => {
    if (s.pmid) studyByPmid.set(s.pmid, s);
    if (s.doi) studyByDoi.set(s.doi.toLowerCase(), s);
  });

  let matched = 0;
  let notFound = 0;

  for (const citation of citations) {
    // Try to match by PMID first, then DOI
    let study = studyByPmid.get(citation.pmid);

    if (!study && citation.doi) {
      study = studyByDoi.get(citation.doi.toLowerCase());
    }

    if (study) {
      const { error: updateError } = await supabase
        .from('kb_citations')
        .update({ slug: study.slug })
        .eq('id', citation.id);

      if (!updateError) {
        console.log(`✅ Matched: ${citation.pmid} → ${study.slug}`);
        matched++;
      } else {
        console.log(`❌ Update failed for ${citation.pmid}: ${updateError.message}`);
      }
    } else {
      notFound++;
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log(`   Citations processed: ${citations.length}`);
  console.log(`   Matched to studies: ${matched}`);
  console.log(`   No matching study: ${notFound}`);

  if (notFound > 0) {
    console.log(`\n⚠️  ${notFound} citations have PMIDs but no matching study in kb_research_queue.`);
    console.log('   Consider importing these studies to enable [Summary] links.');
  }
}

main().catch(console.error);
