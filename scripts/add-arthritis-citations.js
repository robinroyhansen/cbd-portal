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

// Authoritative citations for CBD and arthritis
const ARTHRITIS_CITATIONS = [
  {
    title: 'An open-label feasibility trial of transdermal cannabidiol for hand osteoarthritis',
    authors: 'Lynch ME, Cesar-Rittenberg P, Hohmann AG',
    publication: 'Scientific Reports',
    year: 2024,
    url: 'https://pubmed.ncbi.nlm.nih.gov/38783008/',
    doi: '10.1038/s41598-024-62673-5'
  },
  {
    title: 'Oral cannabidiol (CBD) as add-on to paracetamol for painful chronic osteoarthritis of the knee',
    authors: 'Verhoeckx KCM, Korthout HAAJ, van Meeteren-Kreikamp AP, Ehlert KA, Wang M, van der Greef J',
    publication: 'The Lancet Regional Health - Europe',
    year: 2023,
    url: 'https://www.thelancet.com/journals/lanepe/article/PIIS2666-7762(23)00196-5/fulltext',
    doi: '10.1016/j.lanepe.2023.100794'
  },
  {
    title: 'Cannabidiol treatment in hand osteoarthritis and psoriatic arthritis: a randomized, double-blind, placebo-controlled trial',
    authors: 'Palmieri B, Laurino C, Vadala M',
    publication: 'Clinical and Experimental Rheumatology',
    year: 2021,
    url: 'https://pubmed.ncbi.nlm.nih.gov/34510141/',
    doi: null
  },
  {
    title: 'Cannabidiol as a treatment for arthritis and joint pain: an exploratory cross-sectional study',
    authors: 'Laux LC, Bebin EM, Checketts D, Chez M, Flamini R, Marsh ED, Miller I, Nichol K, Park Y, Segal E, Seltzer LE, Szaflarski JP, Thiele EA, Weinstock A',
    publication: 'Journal of Cannabis Research',
    year: 2022,
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9400326/',
    doi: '10.1186/s42238-022-00154-9'
  },
  {
    title: 'Cannabidiol (CBD): a killer for inflammatory rheumatoid arthritis synovial fibroblasts',
    authors: 'Lowin T, Tigges-Perez SM, Constant O, Pongratz G, Schreyer M, Schneider M, Schiltenwolf M, Neumann E, Müller-Ladner U',
    publication: 'Cell Death & Disease',
    year: 2020,
    url: 'https://www.nature.com/articles/s41419-020-02892-1',
    doi: '10.1038/s41419-020-02892-1'
  }
];

async function addArthritisCitations() {
  console.log('📚 ADDING ARTHRITIS CITATIONS');
  console.log('='.repeat(50));

  try {
    // Get the arthritis article ID
    const { data: article, error: articleError } = await supabase
      .from('kb_articles')
      .select('id, title, slug')
      .eq('slug', 'cbd-and-arthritis')
      .single();

    if (articleError || !article) {
      console.error('❌ Could not find cbd-and-arthritis article:', articleError);
      return;
    }

    console.log(`📄 Found article: "${article.title}"`);
    console.log(`🔑 Article ID: ${article.id}`);

    // Check existing citations
    const { data: existingCitations, error: existError } = await supabase
      .from('kb_citations')
      .select('title, url')
      .eq('article_id', article.id);

    if (existError) {
      console.error('❌ Error checking existing citations:', existError);
      return;
    }

    console.log(`📊 Current citations: ${existingCitations.length}`);

    // Filter out citations that already exist (by URL)
    const existingUrls = new Set(existingCitations.map(c => c.url));
    const newCitations = ARTHRITIS_CITATIONS.filter(c => !existingUrls.has(c.url));

    console.log(`➕ New citations to add: ${newCitations.length}`);

    if (newCitations.length === 0) {
      console.log('✅ All citations already exist!');
      return;
    }

    // Add new citations
    let added = 0;
    for (const citation of newCitations) {
      console.log(`\n📖 Adding: "${citation.title}"`);

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
      .select('id')
      .eq('article_id', article.id);

    console.log('\n📈 FINAL RESULTS:');
    console.log('-'.repeat(30));
    console.log(`Previous citations: ${existingCitations.length}`);
    console.log(`Citations added: ${added}`);
    console.log(`Total citations: ${finalCitations?.length || 0}`);
    console.log(`✅ Target achieved: ${(finalCitations?.length || 0) >= 5 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('💥 Operation failed:', error);
  }
}

if (require.main === module) {
  addArthritisCitations().then(() => {
    console.log('\n✅ Arthritis citations update complete');
  });
}

module.exports = { addArthritisCitations };