#!/usr/bin/env node

/**
 * Enrich citations with PubMed IDs and DOIs
 *
 * Uses NCBI E-utilities API to search for citations and extract metadata
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

// Rate limit: NCBI allows 3 requests/second without API key
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function searchPubMed(title, author, year) {
  // Build search query
  const authorFirst = author.split(/[,\s]/)[0];
  const titleWords = title.split(' ').slice(0, 5).join(' ');
  const query = encodeURIComponent(`${titleWords}[Title] AND ${authorFirst}[Author] AND ${year}[Date - Publication]`);

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=1`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.esearchresult?.idlist?.length > 0) {
      return data.esearchresult.idlist[0];
    }
  } catch (e) {
    console.log(`    Search error: ${e.message}`);
  }

  return null;
}

async function getPubMedDetails(pmid) {
  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`;

  try {
    const response = await fetch(summaryUrl);
    const data = await response.json();

    const result = data.result?.[pmid];
    if (result) {
      // Extract DOI from articleids
      const doiObj = result.articleids?.find(a => a.idtype === 'doi');
      return {
        pmid: pmid,
        doi: doiObj?.value || null,
        title: result.title
      };
    }
  } catch (e) {
    console.log(`    Details error: ${e.message}`);
  }

  return null;
}

async function main() {
  console.log('🔬 ENRICHING CITATIONS WITH PUBMED DATA');
  console.log('='.repeat(55));

  // Get all citations missing pmid
  const { data: citations, error } = await supabase
    .from('kb_citations')
    .select('id, title, authors, year, pmid, doi')
    .is('pmid', null)
    .order('created_at');

  if (error) {
    console.error('Error fetching citations:', error.message);
    return;
  }

  console.log(`Found ${citations.length} citations to enrich\n`);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < citations.length; i++) {
    const c = citations[i];
    console.log(`[${i + 1}/${citations.length}] ${c.authors?.split(',')[0] || 'Unknown'} (${c.year})`);
    console.log(`    "${c.title.substring(0, 50)}..."`);

    // Search PubMed
    const pmid = await searchPubMed(c.title, c.authors || '', c.year);

    if (pmid) {
      await delay(400); // Rate limit
      const details = await getPubMedDetails(pmid);

      if (details) {
        const { error: updateError } = await supabase
          .from('kb_citations')
          .update({
            pmid: details.pmid,
            doi: details.doi || c.doi,
            url: `https://pubmed.ncbi.nlm.nih.gov/${details.pmid}/`
          })
          .eq('id', c.id);

        if (!updateError) {
          console.log(`    ✅ PMID: ${details.pmid}, DOI: ${details.doi || 'N/A'}`);
          updated++;
        } else {
          console.log(`    ❌ Update failed: ${updateError.message}`);
        }
      }
    } else {
      console.log(`    ⚠️ Not found in PubMed`);
      notFound++;
    }

    await delay(400); // Rate limit between requests
  }

  console.log('\n' + '='.repeat(55));
  console.log('📊 SUMMARY');
  console.log(`   Citations processed: ${citations.length}`);
  console.log(`   Successfully enriched: ${updated}`);
  console.log(`   Not found in PubMed: ${notFound}`);
}

main().catch(console.error);
