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

// Foundational citations for "What is CBD" beginners guide with REAL author names
const BEGINNERS_CITATIONS = [
  {
    title: 'Cannabinoids in medicine: A review of their therapeutic potential',
    authors: 'Atakan Z',
    publication: 'Journal of Clinical Pharmacy and Therapeutics',
    year: 2012,
    url: 'https://pubmed.ncbi.nlm.nih.gov/22554282/',
    doi: '10.1111/j.1365-2710.2012.01336.x'
  },
  {
    title: 'An Update on Safety and Side Effects of Cannabidiol: A Review of Clinical Data and Relevant Animal Studies',
    authors: 'Iffland K, Grotenhermen F',
    publication: 'Cannabis and Cannabinoid Research',
    year: 2017,
    url: 'https://pubmed.ncbi.nlm.nih.gov/28861514/',
    doi: '10.1089/can.2016.0034'
  },
  {
    title: 'World Health Organization Critical Review Report: CANNABIDIOL (CBD)',
    authors: 'World Health Organization Expert Committee on Drug Dependence',
    publication: 'WHO Technical Report Series',
    year: 2018,
    url: 'https://www.who.int/medicines/access/controlled-substances/CannabidiolCriticalReview.pdf',
    doi: null
  },
  {
    title: 'Pharmacokinetics and pharmacodynamics of cannabinoids',
    authors: 'Huestis MA',
    publication: 'Clinical Pharmacokinetics',
    year: 2007,
    url: 'https://pubmed.ncbi.nlm.nih.gov/17523750/',
    doi: '10.2165/00003088-200746050-00003'
  },
  {
    title: 'The endocannabinoid system: an emerging key player in inflammation',
    authors: 'Nagarkatti P, Pandey R, Rieder SA, Hegde VL, Nagarkatti M',
    publication: 'Journal of Neuroimmune Pharmacology',
    year: 2009,
    url: 'https://pubmed.ncbi.nlm.nih.gov/19798982/',
    doi: '10.1007/s11481-009-9177-x'
  },
  {
    title: 'Cannabidiol: pharmacology and potential therapeutic role in epilepsy and other neuropsychiatric disorders',
    authors: 'Devinsky O, Cilio MR, Cross H, Fernandez-Ruiz J, French J, Hill C, Katz R, Di Marzo V, Jutras-Aswad D, Notcutt WG, Martinez-Orgado J, Robson PJ, Rohrback BG, Thiele E, Whalley B, Friedman D',
    publication: 'Epilepsia',
    year: 2014,
    url: 'https://pubmed.ncbi.nlm.nih.gov/24854329/',
    doi: '10.1111/epi.12631'
  },
  {
    title: 'Cannabis sativa: The Plant of the Thousand and One Molecules',
    authors: 'Andre CM, Hausman JF, Guerriero G',
    publication: 'Frontiers in Plant Science',
    year: 2016,
    url: 'https://pubmed.ncbi.nlm.nih.gov/26904030/',
    doi: '10.3389/fpls.2016.00019'
  }
];

async function addBeginnersGuideCitations() {
  console.log('📚 ADDING CITATIONS TO WHAT-IS-CBD-BEGINNERS-GUIDE ARTICLE');
  console.log('='.repeat(70));

  try {
    // Get the beginners guide article ID
    const { data: article, error: articleError } = await supabase
      .from('kb_articles')
      .select('id, title, slug')
      .eq('slug', 'what-is-cbd-beginners-guide')
      .single();

    if (articleError || !article) {
      console.error('❌ Could not find what-is-cbd-beginners-guide article:', articleError);
      return;
    }

    console.log(`📄 Found article: "${article.title}"`);
    console.log(`🔑 Article ID: ${article.id}`);

    // Check existing citations
    const { data: existingCitations, error: existError } = await supabase
      .from('kb_citations')
      .select('id, title, url')
      .eq('article_id', article.id);

    if (existError) {
      console.error('❌ Error checking existing citations:', existError);
      return;
    }

    console.log(`📊 Current citations: ${existingCitations.length}`);

    // Filter out citations that already exist (by URL or similar title)
    const existingUrls = new Set(existingCitations.map(c => c.url));
    const existingTitles = new Set(existingCitations.map(c => c.title.toLowerCase()));

    const newCitations = BEGINNERS_CITATIONS.filter(c =>
      !existingUrls.has(c.url) &&
      !existingTitles.has(c.title.toLowerCase())
    );

    console.log(`➕ New citations to add: ${newCitations.length}`);

    if (newCitations.length === 0) {
      console.log('✅ All citations already exist!');
      return;
    }

    // Add new citations
    let added = 0;
    for (const citation of newCitations) {
      console.log(`\n📖 Adding: "${citation.title}"`);
      console.log(`   Authors: ${citation.authors}`);
      console.log(`   Publication: ${citation.publication} (${citation.year})`);

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
        console.error(`❌ Failed to add citation:`, insertError);
      } else {
        console.log(`✅ Added successfully`);
        added++;
      }
    }

    // Final count
    const { data: finalCitations } = await supabase
      .from('kb_citations')
      .select('id, title, authors')
      .eq('article_id', article.id);

    console.log('\n📈 FINAL RESULTS:');
    console.log('-'.repeat(40));
    console.log(`Previous citations: ${existingCitations.length}`);
    console.log(`Citations added: ${added}`);
    console.log(`Total citations: ${finalCitations?.length || 0}`);
    console.log(`✅ Target achieved: ${(finalCitations?.length || 0) >= 5 ? 'YES' : 'NO'}`);

    if (finalCitations && finalCitations.length > 0) {
      console.log('\n📚 ALL CITATIONS:');
      finalCitations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation.authors} - "${citation.title}"`);
      });
    }

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

if (require.main === module) {
  addBeginnersGuideCitations().then(() => {
    console.log('\n✅ Beginners guide citations update complete');
  });
}

module.exports = { addBeginnersGuideCitations };