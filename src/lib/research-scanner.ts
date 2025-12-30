import { createClient } from '@supabase/supabase-js';

interface ResearchItem {
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site: string;
  search_term_matched?: string;
}

// REQUIRED KEYWORDS - Study MUST contain at least one of these
const REQUIRED_KEYWORDS = [
  'cannabidiol',
  'cbd',
  'cannabis',
  'cannabinoid',
  'cannabinoids',
  'marijuana',
  'hemp',
  'thc',
  'tetrahydrocannabinol',
  'endocannabinoid',
  'phytocannabinoid',
  'cb1',
  'cb2',
  'epidiolex',
  'sativex',
  'nabiximols',
  'dronabinol',
  'nabilone'
];

// Search terms - more focused
const SEARCH_TERMS = [
  // Primary CBD terms
  'cannabidiol clinical trial',
  'cannabidiol therapy',
  'CBD treatment study',
  'cannabidiol randomized',

  // Cannabis medical
  'medical cannabis clinical',
  'cannabis therapy trial',
  'medicinal cannabis study',

  // Specific conditions + CBD
  'cannabidiol anxiety',
  'cannabidiol pain',
  'cannabidiol epilepsy',
  'cannabidiol sleep',
  'cannabidiol depression',
  'cannabidiol inflammation',
  'cannabidiol addiction',
  'cannabidiol PTSD',
  'cannabidiol arthritis',
  'cannabidiol cancer',
  'cannabidiol neuroprotective',

  // Products
  'Epidiolex',
  'Sativex clinical',
  'nabiximols trial'
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'anxiety': ['anxiety', 'anxiolytic', 'GAD', 'social anxiety', 'panic disorder', 'generalized anxiety', 'anxiety disorder'],
  'sleep': ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'sleep disturbance'],
  'pain': ['pain', 'analgesic', 'neuropathic', 'chronic pain', 'fibromyalgia', 'pain management', 'pain relief', 'nociceptive'],
  'epilepsy': ['epilepsy', 'seizure', 'Dravet', 'Lennox-Gastaut', 'anticonvulsant', 'Epidiolex', 'refractory epilepsy'],
  'depression': ['depression', 'antidepressant', 'mood disorder', 'MDD', 'major depressive', 'bipolar', 'mood'],
  'inflammation': ['inflammation', 'anti-inflammatory', 'cytokine', 'immune', 'inflammatory', 'TNF', 'IL-6'],
  'arthritis': ['arthritis', 'rheumatoid', 'osteoarthritis', 'joint pain', 'joint inflammation', 'RA'],
  'ptsd': ['PTSD', 'trauma', 'post-traumatic', 'veteran', 'traumatic stress', 'stress disorder'],
  'stress': ['stress', 'cortisol', 'HPA axis', 'stress response', 'stress relief', 'chronic stress'],
  'cancer': ['cancer', 'tumor', 'oncology', 'chemotherapy', 'palliative', 'cancer pain', 'nausea', 'tumor'],
  'neurological': ['Parkinson', 'Alzheimer', 'multiple sclerosis', 'neuroprotective', 'neurodegeneration', 'MS', 'ALS', 'Huntington'],
  'addiction': ['addiction', 'substance use', 'opioid', 'withdrawal', 'dependence', 'substance abuse', 'addiction recovery'],
  'adhd': ['ADHD', 'attention deficit', 'hyperactivity', 'attention disorder'],
  'ibs': ['IBS', 'irritable bowel', 'digestive', 'gastrointestinal', 'gut', 'bowel syndrome'],
  'crohns': ['Crohn', 'IBD', 'inflammatory bowel', 'colitis', 'ulcerative colitis'],
  'diabetes': ['diabetes', 'glucose', 'insulin', 'metabolic', 'blood sugar', 'diabetic'],
  'migraine': ['migraine', 'headache', 'cluster headache', 'chronic headache'],
  'glaucoma': ['glaucoma', 'intraocular pressure', 'eye pressure', 'ocular'],
  'skin': ['eczema', 'psoriasis', 'dermatitis', 'skin condition', 'topical', 'atopic dermatitis'],
  'heart': ['cardiovascular', 'heart', 'blood pressure', 'hypertension', 'cardiac', 'arrhythmia'],
  'nausea': ['nausea', 'vomiting', 'antiemetic', 'chemotherapy-induced', 'CINV'],
  'covid': ['COVID', 'coronavirus', 'SARS-CoV-2', 'pandemic', 'viral infection'],
  'aging': ['aging', 'elderly', 'geriatric', 'age-related', 'longevity'],
  'sports': ['sports', 'athletic', 'exercise', 'recovery', 'performance'],
  'womens': ['women', 'menstrual', 'pregnancy', 'menopause', 'gynecological']
};

// VALIDATION FUNCTION - Must pass to be added
function isRelevantToCannabis(study: ResearchItem): boolean {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();

  // Must contain at least one required keyword
  const hasRequiredKeyword = REQUIRED_KEYWORDS.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  if (!hasRequiredKeyword) {
    console.log(`REJECTED (no cannabis keyword): ${study.title}`);
    return false;
  }

  // Reject if it's about cannabis but not therapeutic
  // (e.g., agricultural studies, policy studies without medical focus)
  const nonTherapeuticKeywords = [
    'agricultural',
    'cultivation only',
    'fiber production',
    'textile',
    'policy analysis',
    'legal framework',
    'drug testing',
    'detection method',
    'forensic'
  ];

  const isNonTherapeutic = nonTherapeuticKeywords.some(kw =>
    text.includes(kw) && !text.includes('therapeutic') && !text.includes('treatment') && !text.includes('patient')
  );

  if (isNonTherapeutic) {
    console.log(`REJECTED (non-therapeutic): ${study.title}`);
    return false;
  }

  return true;
}

// Category assignment function
function assignCategories(study: ResearchItem): string[] {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  const categories: string[] = [];

  // CBD category
  if (
    text.includes('cannabidiol') ||
    text.includes('cbd') ||
    text.includes('epidiolex')
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

  return [...new Set(categories)];
}

export async function scanPubMed(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of SEARCH_TERMS) {
    try {
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: `${term} AND ("last 30 days"[PDat])`,
        retmax: '10',
        retmode: 'json',
        sort: 'date'
      });

      const searchResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`
      );
      const searchData = await searchResponse.json();

      if (searchData.esearchresult?.idlist?.length > 0) {
        const ids = searchData.esearchresult.idlist.join(',');

        const summaryParams = new URLSearchParams({
          db: 'pubmed',
          id: ids,
          retmode: 'json'
        });

        const summaryResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
        );
        const summaryData = await summaryResponse.json();

        for (const id of searchData.esearchresult.idlist) {
          const article = summaryData.result?.[id];
          if (article) {
            results.push({
              title: article.title || 'No title available',
              authors: article.authors?.map((a: any) => a.name).join(', '),
              publication: article.source,
              year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
              url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
              doi: article.elocationid?.replace('doi: ', ''),
              source_site: 'PubMed',
              search_term_matched: term
            });
          }
        }
      }

      // Rate limiting - be nice to NCBI
      await new Promise(resolve => setTimeout(resolve, 400));

    } catch (error) {
      console.error(`Error scanning PubMed for "${term}":`, error);
    }
  }

  return results;
}

export async function scanClinicalTrials(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const searchTerms = ['cannabidiol', 'CBD', 'cannabis', 'medical cannabis', 'medical marijuana', 'cannabinoid'];

  for (const term of searchTerms) {
    try {
      const response = await fetch(
        'https://clinicaltrials.gov/api/v2/studies?' + new URLSearchParams({
          'query.term': term,
          'filter.overallStatus': 'COMPLETED',
          'sort': 'LastUpdatePostDate:desc',
          'pageSize': '15'
        })
      );

      const data = await response.json();

      for (const study of data.studies || []) {
        const protocol = study.protocolSection;
        const title = protocol?.identificationModule?.officialTitle || protocol?.identificationModule?.briefTitle;

        if (title) {
          results.push({
            title,
            authors: protocol?.contactsLocationsModule?.overallOfficials?.map((o: any) => o.name).join(', '),
            publication: 'ClinicalTrials.gov',
            year: new Date(protocol?.statusModule?.lastUpdatePostDateStruct?.date).getFullYear(),
            abstract: protocol?.descriptionModule?.briefSummary,
            url: `https://clinicaltrials.gov/study/${protocol?.identificationModule?.nctId}`,
            source_site: 'ClinicalTrials.gov',
            search_term_matched: term
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`Error scanning ClinicalTrials.gov for "${term}":`, error);
    }
  }

  return results;
}

export async function scanPMC(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const keyTerms = [
    'cannabidiol clinical',
    'medical cannabis trial',
    'cannabis therapeutic efficacy',
    'CBD randomized trial',
    'cannabinoid therapy'
  ];

  for (const term of keyTerms) {
    try {
      const searchParams = new URLSearchParams({
        db: 'pmc',
        term: `${term} AND ("last 30 days"[PDat])`,
        retmax: '10',
        retmode: 'json'
      });

      const searchResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`
      );
      const searchData = await searchResponse.json();

      if (searchData.esearchresult?.idlist?.length > 0) {
        const ids = searchData.esearchresult.idlist.join(',');

        const summaryParams = new URLSearchParams({
          db: 'pmc',
          id: ids,
          retmode: 'json'
        });

        const summaryResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
        );
        const summaryData = await summaryResponse.json();

        for (const id of searchData.esearchresult.idlist) {
          const article = summaryData.result?.[id];
          if (article) {
            results.push({
              title: article.title || `PMC Article ${id}`,
              authors: article.authors?.map((a: any) => a.name).join(', '),
              publication: article.source || 'PMC',
              year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
              url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}/`,
              source_site: 'PMC',
              search_term_matched: term
            });
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 400));

    } catch (error) {
      console.error(`Error scanning PMC for "${term}":`, error);
    }
  }

  return results;
}

export function calculateRelevance(study: ResearchItem): { score: number; topics: string[] } {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  const topics: string[] = [];
  let score = 0;

  // Check for topic relevance
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!topics.includes(topic)) {
          topics.push(topic);
          score += 10;
        }
      }
    }
  }

  // Boost for study quality indicators
  if (text.includes('randomized') || text.includes('randomised')) score += 20;
  if (text.includes('controlled trial') || text.includes('rct')) score += 20;
  if (text.includes('double-blind') || text.includes('double blind')) score += 15;
  if (text.includes('placebo-controlled') || text.includes('placebo controlled')) score += 15;
  if (text.includes('meta-analysis') || text.includes('meta analysis')) score += 25;
  if (text.includes('systematic review')) score += 20;
  if (text.includes('cochrane')) score += 25;
  if (text.includes('human') || text.includes('patients') || text.includes('participants')) score += 10;
  if (text.includes('multicenter') || text.includes('multicentre')) score += 10;

  // Boost for specific cannabinoid mentions
  if (text.includes('cannabidiol') || text.includes('cbd')) score += 5;
  if (text.includes('medical cannabis') || text.includes('medicinal cannabis')) score += 5;
  if (text.includes('epidiolex') || text.includes('sativex')) score += 10;
  if (text.includes('full spectrum') || text.includes('broad spectrum')) score += 5;

  // Boost for recent/large studies
  if (study.year && study.year >= new Date().getFullYear() - 1) score += 5;
  if (text.includes('phase 2') || text.includes('phase ii')) score += 10;
  if (text.includes('phase 3') || text.includes('phase iii')) score += 15;

  // Lower score for preclinical
  if (text.includes('mice') || text.includes('rats') || text.includes('mouse') || text.includes('rat model')) score -= 15;
  if (text.includes('in vitro') || text.includes('cell culture') || text.includes('cell line')) score -= 20;
  if (text.includes('animal model') || text.includes('preclinical')) score -= 10;

  return { score: Math.max(0, score), topics: [...new Set(topics)] };
}

// Update the main scan function
export async function runDailyResearchScan() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('Starting daily research scan with STRICT cannabis filtering...');

  const pubmedResults = await scanPubMed();
  const clinicalTrialsResults = await scanClinicalTrials();

  const allResults = [...pubmedResults, ...clinicalTrialsResults];

  // Deduplicate
  const uniqueResults = allResults.filter((item, index, self) =>
    index === self.findIndex(t => t.url === item.url)
  );

  console.log(`Found ${uniqueResults.length} unique results, filtering for relevance...`);

  let added = 0;
  let skipped = 0;
  let rejected = 0;

  for (const study of uniqueResults) {
    // STRICT VALIDATION - Must be about cannabis/CBD
    if (!isRelevantToCannabis(study)) {
      rejected++;
      continue;
    }

    // Check if already exists
    const { data: existing } = await supabase
      .from('kb_research_queue')
      .select('id')
      .eq('url', study.url)
      .single();

    if (existing) {
      skipped++;
      continue;
    }

    // Calculate relevance
    const { score, topics } = calculateRelevance(study);

    // Must have reasonable relevance score
    if (score < 20) {
      rejected++;
      continue;
    }

    // Assign categories
    const categories = assignCategories(study);

    // Insert
    const { error } = await supabase
      .from('kb_research_queue')
      .insert({
        title: study.title,
        authors: study.authors,
        publication: study.publication,
        year: study.year,
        abstract: study.abstract,
        url: study.url,
        doi: study.doi,
        source_site: study.source_site,
        search_term_matched: study.search_term_matched,
        relevance_score: score,
        relevant_topics: topics,
        categories: categories,
        status: 'pending'
      });

    if (!error) added++;
  }

  console.log(`Scan complete. Added: ${added}, Skipped: ${skipped}, Rejected: ${rejected}`);

  return { added, skipped, rejected, total: uniqueResults.length };
}