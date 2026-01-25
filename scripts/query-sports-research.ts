import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Query for sports/activity relevant research
  const { data, error } = await supabase
    .from('kb_research_queue')
    .select('id, title, year, study_type, study_subject, sample_size, quality_score, abstract, plain_summary, doi, pmid, slug, relevant_topics, search_term_matched, key_findings')
    .eq('status', 'approved')
    .order('quality_score', { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Filter for relevant topics
  const relevantKeywords = ['pain', 'inflammation', 'arthritis', 'joint', 'muscle', 'recovery', 'exercise', 'analgesic', 'anti-inflammatory', 'neuropathic', 'fibromyalgia', 'chronic pain', 'musculoskeletal', 'tendon', 'ligament', 'bone', 'cartilage', 'osteo', 'bursitis', 'thermal', 'cold', 'heat', 'hydrotherapy'];

  const filtered = data.filter(study => {
    const searchTerm = (study.search_term_matched || '').toLowerCase();
    const title = (study.title || '').toLowerCase();
    const abstract = (study.abstract || '').toLowerCase();
    const topics = (study.relevant_topics || []).join(' ').toLowerCase();
    const combined = searchTerm + ' ' + title + ' ' + abstract + ' ' + topics;

    return relevantKeywords.some(keyword => combined.includes(keyword));
  });

  console.log('Total approved studies:', data.length);
  console.log('Relevant for sports/activity:', filtered.length);
  console.log('\nTop studies by quality:\n');

  filtered.slice(0, 50).forEach((study, i) => {
    const num = i + 1;
    const quality = study.quality_score || 'N/A';
    const studyType = study.study_type || 'N/A';
    const subject = study.study_subject || 'N/A';
    const sample = study.sample_size || 'N/A';

    console.log(num + '. [' + study.year + '] ' + study.title);
    console.log('   Quality: ' + quality + ', Type: ' + studyType + ', Subject: ' + subject + ', Sample: ' + sample);
    console.log('   Topics: ' + study.search_term_matched);
    console.log('   PMID: ' + (study.pmid || 'N/A') + ', DOI: ' + (study.doi || 'N/A'));
    console.log('   Slug: ' + study.slug);
    console.log('');
  });

  // Output full data for top studies
  console.log('\n\n--- FULL DATA FOR TOP STUDIES ---\n');
  console.log(JSON.stringify(filtered.slice(0, 40), null, 2));
}

main();
