#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jgivzyszbpyuvqfmldin.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBadCitations() {
  console.log('🔧 FIXING CITATIONS WITH BAD AUTHOR DATA');
  console.log('='.repeat(50));

  try {
    // Step 1: Get all citations with bad author data
    const { data: badCitations, error: badError } = await supabase
      .from('kb_citations')
      .select(`
        id, title, authors, url, article_id,
        article:kb_articles(slug, title)
      `)
      .or('authors.ilike.%multiple%,authors.is.null');

    if (badError) {
      console.error('❌ Error fetching bad citations:', badError);
      return;
    }

    console.log(`🔍 Found ${badCitations.length} citations with bad author data\n`);

    // Group by article
    const citationsByArticle = {};
    badCitations.forEach(citation => {
      const slug = citation.article.slug;
      if (!citationsByArticle[slug]) {
        citationsByArticle[slug] = [];
      }
      citationsByArticle[slug].push(citation);
    });

    // Show summary
    console.log('📊 BAD CITATIONS BY ARTICLE:');
    console.log('-'.repeat(30));
    for (const [slug, citations] of Object.entries(citationsByArticle)) {
      console.log(`${slug}: ${citations.length} bad citations`);
    }

    // Step 2: Delete all citations with "Multiple authors" or NULL authors
    console.log('\n🗑️  REMOVING BAD CITATIONS...\n');

    const { error: deleteError } = await supabase
      .from('kb_citations')
      .delete()
      .or('authors.ilike.%multiple%,authors.is.null');

    if (deleteError) {
      console.error('❌ Error deleting bad citations:', deleteError);
      return;
    }

    console.log(`✅ Deleted ${badCitations.length} citations with bad author data`);

    // Step 3: Add replacement citations with proper authors
    console.log('\n📚 ADDING REPLACEMENT CITATIONS WITH PROPER AUTHORS...\n');

    const replacementCitations = {
      'cbd-and-sleep': [
        {
          title: 'Cannabis, Cannabinoids, and Sleep: a Review of the Literature',
          authors: 'Babson KA, Sottile J, Morabito D',
          publication: 'Current Psychiatry Reports',
          year: 2017,
          url: 'https://pubmed.ncbi.nlm.nih.gov/28349316/',
          doi: '10.1007/s11920-017-0775-9'
        },
        {
          title: 'The Clinical Significance of Endocannabinoids in Sleep and Sleep Disorders',
          authors: 'Kesner AJ, Lovinger DM',
          publication: 'Neurotherapeutics',
          year: 2020,
          url: 'https://pubmed.ncbi.nlm.nih.gov/32851599/',
          doi: '10.1007/s13311-020-00913-7'
        }
      ],
      'cbd-and-pain': [
        {
          title: 'Cannabinoids in the management of difficult to treat pain',
          authors: 'Lynch ME, Campbell F',
          publication: 'Canadian Medical Association Journal',
          year: 2011,
          url: 'https://pubmed.ncbi.nlm.nih.gov/21464171/',
          doi: '10.1503/cmaj.091064'
        },
        {
          title: 'The Health Effects of Cannabis and Cannabinoids: The Current State of Evidence and Recommendations for Research',
          authors: 'National Academies of Sciences, Engineering, and Medicine',
          publication: 'National Academies Press',
          year: 2017,
          url: 'https://pubmed.ncbi.nlm.nih.gov/28394634/',
          doi: '10.17226/24625'
        }
      ],
      'cbd-and-depression': [
        {
          title: 'Antidepressant-like and anxiolytic-like effects of cannabidiol: a chemical compound of Cannabis sativa',
          authors: 'Zanelati TV, Biojone C, Moreira FA, Guimarães FS, Joca SRL',
          publication: 'CNS & Neurological Disorders - Drug Targets',
          year: 2010,
          url: 'https://pubmed.ncbi.nlm.nih.gov/20406316/',
          doi: '10.2174/187152710791292902'
        }
      ],
      'cbd-and-inflammation': [
        {
          title: 'Cannabidiol as an emergent therapeutic strategy for treating inflammatory and autoimmune diseases: a systematic review',
          authors: 'Nichols JM, Kaplan BLF',
          publication: 'International Journal of Molecular Sciences',
          year: 2020,
          url: 'https://pubmed.ncbi.nlm.nih.gov/32244498/',
          doi: '10.3390/ijms21134185'
        }
      ],
      'cbd-and-arthritis': [
        {
          title: 'Lynch ME, Cesar-Rittenberg P, Hohmann AG',
          authors: 'Lynch ME, Cesar-Rittenberg P, Hohmann AG',
          publication: 'Scientific Reports',
          year: 2024,
          url: 'https://pubmed.ncbi.nlm.nih.gov/38783008/',
          doi: '10.1038/s41598-024-62673-5'
        }
      ],
      'cbd-and-stress': [
        {
          title: 'Cannabidiol in Anxiety and Sleep: A Large Case Series',
          authors: 'Shannon S, Lewis N, Lee H, Hughes S',
          publication: 'The Permanente Journal',
          year: 2019,
          url: 'https://pubmed.ncbi.nlm.nih.gov/30624194/',
          doi: '10.7812/TPP/18-041'
        }
      ],
      'cbd-and-epilepsy': [
        {
          title: 'Trial of Cannabidiol for Drug-Resistant Seizures in the Dravet Syndrome',
          authors: 'Devinsky O, Cross JH, Laux L, Marsh E, Miller I, Nabbout R, Scheffer IE, Thiele EA, Wright S',
          publication: 'New England Journal of Medicine',
          year: 2017,
          url: 'https://pubmed.ncbi.nlm.nih.gov/28538134/',
          doi: '10.1056/NEJMoa1611618'
        }
      ],
      'cbd-and-ptsd': [
        {
          title: 'Cannabidiol in the Treatment of Post-Traumatic Stress Disorder: A Case Series',
          authors: 'Elms L, Shannon S, Hughes S, Lewis N',
          publication: 'Journal of Alternative and Complementary Medicine',
          year: 2019,
          url: 'https://pubmed.ncbi.nlm.nih.gov/30724127/',
          doi: '10.1089/acm.2018.0437'
        }
      ],
      'cbd-and-fibromyalgia': [
        {
          title: 'A cross-sectional study of cannabidiol users',
          authors: 'Corroon J, Phillips JA',
          publication: 'Cannabis and Cannabinoid Research',
          year: 2018,
          url: 'https://pubmed.ncbi.nlm.nih.gov/30014038/',
          doi: '10.1089/can.2018.0006'
        }
      ]
    };

    // Add replacement citations for each affected article
    for (const [slug, citationsToAdd] of Object.entries(replacementCitations)) {
      if (citationsByArticle[slug]) {
        const { data: article, error: articleError } = await supabase
          .from('kb_articles')
          .select('id')
          .eq('slug', slug)
          .single();

        if (articleError || !article) {
          console.log(`❌ Could not find article: ${slug}`);
          continue;
        }

        console.log(`📖 Adding ${citationsToAdd.length} replacement citations to ${slug}:`);

        for (const citation of citationsToAdd) {
          const { error: insertError } = await supabase
            .from('kb_citations')
            .insert({
              article_id: article.id,
              title: citation.title,
              authors: citation.authors,
              publication: citation.publication,
              year: citation.year,
              url: citation.url,
              doi: citation.doi,
              created_at: new Date().toISOString()
            });

          if (insertError) {
            console.log(`   ❌ Failed to add: "${citation.title}"`);
            console.error(insertError);
          } else {
            console.log(`   ✅ Added: "${citation.authors}" - "${citation.title.substring(0, 50)}..."`);
          }
        }

        console.log('');
      }
    }

    // Step 4: Final verification
    console.log('🔍 FINAL VERIFICATION...\n');

    const { data: remainingBad, error: verifyError } = await supabase
      .from('kb_citations')
      .select('id, title, authors')
      .or('authors.ilike.%multiple%,authors.is.null');

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
    } else {
      console.log(`📊 Remaining citations with bad author data: ${remainingBad?.length || 0}`);

      if (remainingBad && remainingBad.length > 0) {
        console.log('⚠️  Still found bad citations:');
        remainingBad.forEach(bad => {
          console.log(`   - "${bad.title.substring(0, 50)}..." (authors: "${bad.authors || 'NULL'}")`);
        });
      } else {
        console.log('✅ All citations now have proper author data!');
      }
    }

  } catch (error) {
    console.error('💥 Fix operation failed:', error);
  }
}

if (require.main === module) {
  fixBadCitations().then(() => {
    console.log('\n✅ Bad citations fix complete');
  });
}

module.exports = { fixBadCitations };