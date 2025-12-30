const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jgivzyszbpyuvqfmldin.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function categorizeResearch(research) {
  return research.map(item => {
    // Use existing categories if available and not empty
    if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
      return item;
    }

    const text = `${item.title || ''} ${item.abstract || ''}`.toLowerCase();
    const categories = [];

    // CBD category
    if (
      text.includes('cannabidiol') ||
      text.includes('cbd') ||
      text.includes('epidiolex') ||
      text.includes('high-cannabidiol') ||
      text.includes('full-spectrum')
    ) {
      categories.push('cbd');
    }

    // Cannabis category
    if (
      text.includes('cannabis') ||
      text.includes('marijuana') ||
      text.includes('hemp') ||
      text.includes('thc') ||
      text.includes('tetrahydrocannabinol')
    ) {
      categories.push('cannabis');
    }

    // Medical Cannabis category
    if (
      text.includes('medical cannabis') ||
      text.includes('medicinal cannabis') ||
      text.includes('medical marijuana') ||
      text.includes('therapeutic') ||
      text.includes('patient') ||
      text.includes('treatment') ||
      text.includes('clinical trial') ||
      text.includes('randomized') ||
      text.includes('efficacy')
    ) {
      categories.push('medical-cannabis');
    }

    // Default to CBD if no category matched
    if (categories.length === 0) {
      categories.push('cbd');
    }

    return { ...item, categories: [...new Set(categories)] };
  });
}

async function simulateResearchPage() {
  console.log('🔍 SIMULATING FULL RESEARCH PAGE LOGIC');
  console.log('='.repeat(60));

  try {
    // Fetch both sources in parallel
    let allResearch = [];

    const [researchResult, citationsResult] = await Promise.all([
      supabase
        .from('kb_research_queue')
        .select('*')
        .eq('status', 'approved')
        .order('year', { ascending: false }),
      supabase
        .from('kb_citations')
        .select('*')
        .order('year', { ascending: false })
    ]);

    console.log('📊 RAW DATA:');
    console.log(`   Research Queue: ${researchResult.data?.length || 0} items`);
    console.log(`   Citations: ${citationsResult.data?.length || 0} items`);

    // Normalize research queue items
    const normalizedResearch = (researchResult.data || []).map(item => ({
      id: item.id,
      title: item.title,
      authors: item.authors || 'Unknown',
      publication: item.publication || 'Unknown',
      year: item.year || new Date().getFullYear(),
      abstract: item.abstract,
      url: item.url,
      doi: item.doi,
      source_site: item.source_site,
      source_type: 'research_queue',
      categories: item.categories || [],
      relevant_topics: item.relevant_topics,
      relevance_score: item.relevance_score
    }));

    // Normalize citations
    const normalizedCitations = (citationsResult.data || []).map(item => ({
      id: `citation-${item.id}`,
      title: item.title,
      authors: item.authors || 'Unknown',
      publication: item.publication || 'Unknown',
      year: item.year || new Date().getFullYear(),
      abstract: undefined,
      url: item.url,
      doi: item.doi,
      source_site: item.url?.includes('pubmed') ? 'PubMed' :
                  item.url?.includes('pmc') ? 'PMC' :
                  item.url?.includes('clinicaltrials') ? 'ClinicalTrials.gov' :
                  'Journal',
      source_type: 'citation',
      categories: [],
      relevant_topics: []
    }));

    console.log('\n📊 NORMALIZED DATA:');
    console.log(`   Normalized Research: ${normalizedResearch.length} items`);
    console.log(`   Normalized Citations: ${normalizedCitations.length} items`);

    // Combine and deduplicate by URL
    const seenUrls = new Set();

    // Add research queue items first
    for (const item of normalizedResearch) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        allResearch.push(item);
      }
    }

    // Add citations that aren't duplicates
    for (const item of normalizedCitations) {
      if (item.url && !seenUrls.has(item.url)) {
        seenUrls.add(item.url);
        allResearch.push(item);
      }
    }

    console.log(`\n📊 COMBINED DATA: ${allResearch.length} unique items`);

    // Sort by year
    allResearch.sort((a, b) => (b.year || 0) - (a.year || 0));

    console.log('\n🏷️ TESTING CATEGORIZATION:');

    // Check categories before categorization
    const preCategorization = {
      withCategories: allResearch.filter(r => r.categories && r.categories.length > 0).length,
      emptyCategories: allResearch.filter(r => !r.categories || r.categories.length === 0).length
    };

    console.log(`   Items with existing categories: ${preCategorization.withCategories}`);
    console.log(`   Items needing categorization: ${preCategorization.emptyCategories}`);

    // Test categorization on first 10 items
    console.log('\n📝 SAMPLE CATEGORIZATION TEST:');
    const sampleItems = allResearch.slice(0, 10);
    sampleItems.forEach((item, i) => {
      const text = `${item.title || ''} ${item.abstract || ''}`.toLowerCase();
      console.log(`${i + 1}. ${item.title.substring(0, 60)}...`);
      console.log(`   Contains 'cbd': ${text.includes('cbd')}`);
      console.log(`   Contains 'cannabis': ${text.includes('cannabis')}`);
      console.log(`   Contains 'therapeutic': ${text.includes('therapeutic')}`);
      console.log('');
    });

    // Apply categorization
    const categorizedResearch = categorizeResearch(allResearch);

    console.log('\n📈 POST-CATEGORIZATION RESULTS:');

    // Filter by categories
    const cbdResearch = categorizedResearch.filter(r => r.categories?.includes('cbd'));
    const cannabisResearch = categorizedResearch.filter(r => r.categories?.includes('cannabis'));
    const medicalCannabisResearch = categorizedResearch.filter(r => r.categories?.includes('medical-cannabis'));

    console.log(`   CBD Studies: ${cbdResearch.length}`);
    console.log(`   Cannabis Studies: ${cannabisResearch.length}`);
    console.log(`   Medical Cannabis Studies: ${medicalCannabisResearch.length}`);

  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

simulateResearchPage();