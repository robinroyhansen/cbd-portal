#!/usr/bin/env node

/**
 * Import citations as studies in kb_research_queue
 *
 * Creates internal study pages for citations that don't have matching studies,
 * enabling the [Summary] link in the hybrid citation model
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

// Generate a slug from title and year
function generateSlug(title, year, authors) {
  const firstAuthor = authors?.split(/[,;]/)[0]?.split(' ')[0]?.toLowerCase() || 'unknown';
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 4)
    .join('-');

  return `${titleWords}-${firstAuthor}-${year || 'nd'}`;
}

async function main() {
  console.log('📥 IMPORTING CITATIONS AS STUDY PAGES');
  console.log('='.repeat(55));

  // Get citations with PMIDs but no slug (not yet linked to a study)
  const { data: citations, error: citError } = await supabase
    .from('kb_citations')
    .select('id, title, authors, publication, year, pmid, doi, url, slug')
    .not('pmid', 'is', null)
    .is('slug', null);

  if (citError) {
    console.error('Error fetching citations:', citError.message);
    return;
  }

  console.log(`Found ${citations.length} citations to import as studies\n`);

  // Check existing PMIDs to avoid duplicates
  const { data: existingStudies } = await supabase
    .from('kb_research_queue')
    .select('pmid')
    .not('pmid', 'is', null);

  const existingPmids = new Set(existingStudies?.map(s => s.pmid) || []);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const citation of citations) {
    // Skip if PMID already exists in research queue
    if (existingPmids.has(citation.pmid)) {
      console.log(`⏭️  PMID ${citation.pmid} already exists in queue`);
      skipped++;
      continue;
    }

    const slug = generateSlug(citation.title, citation.year, citation.authors);

    // Create study entry with minimal required fields
    const studyData = {
      title: citation.title,
      authors: citation.authors,
      year: citation.year,
      pmid: citation.pmid,
      doi: citation.doi,
      slug: slug,
      status: 'approved',
      source: 'citation_import',
      publication: citation.publication,
      url: citation.url || `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`,
      relevance_score: 80,
      quality_score: 70,
      relevant_topics: ['general'],
      plain_summary: `This study "${citation.title}" was cited in CBD Portal articles and has been imported for reference.`
    };

    const { data: newStudy, error: insertError } = await supabase
      .from('kb_research_queue')
      .insert(studyData)
      .select('id, slug')
      .single();

    if (insertError) {
      // Try with a modified slug if duplicate
      if (insertError.code === '23505') {
        studyData.slug = slug + '-' + citation.pmid;
        const { data: retryStudy, error: retryError } = await supabase
          .from('kb_research_queue')
          .insert(studyData)
          .select('id, slug')
          .single();

        if (retryError) {
          console.log(`❌ Failed: ${citation.pmid} - ${retryError.message}`);
          failed++;
          continue;
        }

        // Update citation with new study slug
        await supabase
          .from('kb_citations')
          .update({ slug: retryStudy.slug })
          .eq('id', citation.id);

        console.log(`✅ Imported (retry): ${retryStudy.slug}`);
        imported++;
      } else {
        console.log(`❌ Failed: ${citation.pmid} - ${insertError.message}`);
        failed++;
      }
    } else {
      // Update citation with new study slug
      await supabase
        .from('kb_citations')
        .update({ slug: newStudy.slug })
        .eq('id', citation.id);

      console.log(`✅ Imported: ${newStudy.slug}`);
      imported++;
      existingPmids.add(citation.pmid);
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log(`   Citations processed: ${citations.length}`);
  console.log(`   Studies imported: ${imported}`);
  console.log(`   Already existed: ${skipped}`);
  console.log(`   Failed: ${failed}`);

  if (imported > 0) {
    console.log(`\n✅ ${imported} new study pages created!`);
    console.log('   Citations now have [Summary] links to internal pages.');
  }
}

main().catch(console.error);
