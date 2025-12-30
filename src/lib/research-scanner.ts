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

// Comprehensive search terms covering CBD, cannabis, and medical cannabis
const SEARCH_TERMS = [
  // CBD specific
  'cannabidiol clinical trial',
  'cannabidiol randomized controlled trial',
  'cannabidiol therapeutic',
  'cannabidiol human study',
  'CBD efficacy',
  'CBD safety profile',
  'CBD dose finding',
  'CBD pharmacokinetics',

  // Cannabis general
  'cannabis clinical trial',
  'cannabis therapeutic',
  'cannabis medical use',
  'cannabis randomized trial',
  'cannabis human study',
  'cannabis safety',

  // Medical cannabis
  'medical cannabis clinical trial',
  'medical cannabis efficacy',
  'medical cannabis therapy',
  'medical marijuana clinical',
  'medicinal cannabis study',
  'medical cannabis patient outcomes',
  'medical cannabis dosing',

  // Cannabinoids
  'cannabinoid therapy',
  'cannabinoid clinical trial',
  'phytocannabinoid study',
  'endocannabinoid system therapy',
  'cannabinoid medicine',

  // Specific conditions + CBD/cannabis
  'cannabidiol anxiety disorder',
  'cannabidiol chronic pain',
  'cannabidiol sleep disorder',
  'cannabidiol epilepsy',
  'cannabidiol inflammation',
  'cannabidiol depression',
  'cannabidiol PTSD',
  'cannabidiol arthritis',
  'cannabidiol cancer',
  'cannabidiol neuroprotective',
  'cannabidiol multiple sclerosis',
  'cannabidiol Parkinson',
  'cannabidiol Alzheimer',
  'cannabidiol fibromyalgia',
  'cannabidiol migraine',
  'cannabidiol IBS',
  'cannabidiol Crohn',
  'cannabidiol diabetes',
  'cannabidiol addiction',
  'cannabidiol ADHD',

  'cannabis pain management',
  'cannabis anxiety treatment',
  'cannabis sleep',
  'cannabis epilepsy',
  'cannabis chemotherapy',
  'cannabis palliative care',
  'cannabis opioid alternative',
  'cannabis nausea',
  'cannabis spasticity',
  'cannabis glaucoma',

  'medical cannabis chronic pain',
  'medical cannabis cancer pain',
  'medical cannabis neuropathy',
  'medical cannabis PTSD veteran',
  'medical cannabis quality of life',

  // Specific products/formulations
  'Epidiolex study',
  'Sativex clinical trial',
  'nabiximols efficacy',
  'dronabinol study',
  'full spectrum cannabis extract',
  'CBD oil clinical trial',
  'hemp extract study',

  // Safety and pharmacology
  'cannabidiol drug interaction',
  'cannabidiol pharmacokinetics',
  'cannabis adverse effects clinical',
  'cannabidiol long term safety',
  'medical cannabis dosing',
  'CBD liver safety',
  'cannabidiol cytochrome',

  // Recent research focuses
  'cannabidiol COVID',
  'cannabis neurodegenerative',
  'CBD aging',
  'cannabis microbiome',
  'cannabidiol gut health',
  'medical cannabis veterans',
  'CBD sports medicine',
  'cannabis womens health'
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

export async function runDailyResearchScan() {
  console.log('🔍 Starting daily research scan...');

  // Verify environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  console.log('✅ Environment variables verified');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`📚 Scanning ${SEARCH_TERMS.length} search terms across multiple sources...`);

  // Gather from all sources in parallel for better performance
  console.log('🌐 Starting external API scans...');
  const [pubmedResults, clinicalTrialsResults, pmcResults] = await Promise.allSettled([
    scanPubMed(),
    scanClinicalTrials(),
    scanPMC()
  ]);

  const pubmed = pubmedResults.status === 'fulfilled' ? pubmedResults.value : [];
  const clinical = clinicalTrialsResults.status === 'fulfilled' ? clinicalTrialsResults.value : [];
  const pmc = pmcResults.status === 'fulfilled' ? pmcResults.value : [];

  // Log any failures
  if (pubmedResults.status === 'rejected') {
    console.error('PubMed scan failed:', pubmedResults.reason);
  }
  if (clinicalTrialsResults.status === 'rejected') {
    console.error('ClinicalTrials scan failed:', clinicalTrialsResults.reason);
  }
  if (pmcResults.status === 'rejected') {
    console.error('PMC scan failed:', pmcResults.reason);
  }

  console.log(`📊 Results: PubMed: ${pubmed.length}, ClinicalTrials: ${clinical.length}, PMC: ${pmc.length}`);

  const allResults = [...pubmed, ...clinical, ...pmc];

  // Deduplicate by URL
  const uniqueResults = allResults.filter((item, index, self) =>
    index === self.findIndex(t => t.url === item.url)
  );

  console.log(`🎯 Total unique results: ${uniqueResults.length}`);

  let added = 0;
  let skipped = 0;
  let relevant = 0;

  for (const study of uniqueResults) {
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

    // Only add if relevant (score >= 15 for human studies)
    if (score < 15) {
      skipped++;
      continue;
    }

    relevant++;

    // Insert into queue
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
        status: 'pending'
      });

    if (!error) {
      added++;
    } else {
      console.error('❌ Insert error:', error);
    }
  }

  console.log(`✅ Research scan complete!`);
  console.log(`📈 Summary: ${added} added, ${skipped} skipped, ${relevant} relevant, ${uniqueResults.length} total`);

  return { added, skipped, total: uniqueResults.length, relevant };
}