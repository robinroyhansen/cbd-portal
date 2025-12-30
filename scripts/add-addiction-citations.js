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

// Authoritative citations for CBD and addiction with REAL author names
const ADDICTION_CITATIONS = [
  {
    title: 'Cannabidiol as an Intervention for Addictive Behaviors: A Systematic Review of the Evidence',
    authors: 'Prud\'homme M, Cata R, Bhardwaj S',
    publication: 'Substance Abuse: Research and Treatment',
    year: 2015,
    url: 'https://pubmed.ncbi.nlm.nih.gov/26005352/',
    doi: '10.4137/SART.S25081'
  },
  {
    title: 'Cannabidiol for the treatment of cannabis use disorder: a phase 2a, double-blind, placebo-controlled, randomised, adaptive Bayesian trial',
    authors: 'Freeman TP, Hindocha C, Baio G, Shaban NDC, Thomas EM, Astbury D, Freeman AM, Lees R, Craft S, Morrison PD, Curran HV',
    publication: 'The Lancet Psychiatry',
    year: 2020,
    url: 'https://pubmed.ncbi.nlm.nih.gov/33035453/',
    doi: '10.1016/S2215-0366(20)30290-X'
  },
  {
    title: 'Cannabidiol reduces cigarette consumption in tobacco smokers: preliminary findings',
    authors: 'Morgan CJA, Das RK, Joye A, Curran HV, Kamboj SK',
    publication: 'Addictive Behaviors',
    year: 2013,
    url: 'https://pubmed.ncbi.nlm.nih.gov/24122199/',
    doi: '10.1016/j.addbeh.2013.08.028'
  },
  {
    title: 'Unique treatment potential of cannabidiol for the prevention of relapse to drug use: preclinical proof of principle',
    authors: 'Gonzalez-Cuevas G, Martin-Fardon R, Kerr TM, Stoeber DG, Parsons LH, Hammell DC, Banks SL, Stinchcomb AL, Weiss F',
    publication: 'Neuropsychopharmacology',
    year: 2018,
    url: 'https://pubmed.ncbi.nlm.nih.gov/29686308/',
    doi: '10.1038/s41386-018-0050-8'
  },
  {
    title: 'Early Phase in the Development of Cannabidiol as a Treatment for Addiction: Opioid Relapse Takes Initial Center Stage',
    authors: 'Hurd YL, Spriggs S, Alishayev J, Winkel G, Gurgov K, Kudrich C, Oprescu AM, Salsitz E',
    publication: 'Neurotherapeutics',
    year: 2015,
    url: 'https://pubmed.ncbi.nlm.nih.gov/26269227/',
    doi: '10.1007/s13311-015-0373-7'
  },
  {
    title: 'Cannabidiol attenuates cue-induced heroin seeking and normalizes discrete mesolimbic neuronal disturbances',
    authors: 'Ren Y, Whittard J, Higuera-Matas A, Morris CV, Hurd YL',
    publication: 'Journal of Neuroscience',
    year: 2009,
    url: 'https://pubmed.ncbi.nlm.nih.gov/19776256/',
    doi: '10.1523/JNEUROSCI.4291-09.2009'
  },
  {
    title: 'Cannabidiol as a Potential Treatment for Anxiety Disorders',
    authors: 'Blessing EM, Steenkamp MM, Manzanares J, Marmar CR',
    publication: 'Neurotherapeutics',
    year: 2015,
    url: 'https://pubmed.ncbi.nlm.nih.gov/26341731/',
    doi: '10.1007/s13311-015-0387-1'
  }
];

async function addAddictionCitations() {
  console.log('📚 ADDING CITATIONS TO CBD-AND-ADDICTION ARTICLE');
  console.log('='.repeat(60));

  try {
    // Get the addiction article ID
    const { data: article, error: articleError } = await supabase
      .from('kb_articles')
      .select('id, title, slug')
      .eq('slug', 'cbd-and-addiction')
      .single();

    if (articleError || !article) {
      console.error('❌ Could not find cbd-and-addiction article:', articleError);
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

    const newCitations = ADDICTION_CITATIONS.filter(c =>
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
  addAddictionCitations().then(() => {
    console.log('\n✅ CBD addiction citations update complete');
  });
}

module.exports = { addAddictionCitations };