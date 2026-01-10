import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  country?: string;
}

// Country code mapping for common institution patterns
const COUNTRY_PATTERNS: Record<string, RegExp[]> = {
  'US': [/united states/i, /\busa\b/i, /\bu\.s\.a?\b/i, /\bamerican\b/i],
  'UK': [/united kingdom/i, /\buk\b/i, /\bengland\b/i, /\bscotland\b/i, /\bwales\b/i, /\bbritish\b/i],
  'CA': [/\bcanada\b/i, /\bcanadian\b/i],
  'AU': [/\baustralia\b/i, /\baustralian\b/i],
  'DE': [/\bgermany\b/i, /\bgerman\b/i, /deutschland/i],
  'FR': [/\bfrance\b/i, /\bfrench\b/i],
  'IT': [/\bitaly\b/i, /\bitalian\b/i],
  'ES': [/\bspain\b/i, /\bspanish\b/i],
  'NL': [/netherlands/i, /\bdutch\b/i, /holland/i],
  'CH': [/switzerland/i, /\bswiss\b/i],
  'IL': [/\bisrael\b/i, /\bisraeli\b/i],
  'JP': [/\bjapan\b/i, /\bjapanese\b/i],
  'CN': [/\bchina\b/i, /\bchinese\b/i],
  'BR': [/\bbrazil\b/i, /\bbrazilian\b/i],
  'IN': [/\bindia\b/i, /\bindian\b/i],
  'KR': [/\bsouth korea\b/i, /\bkorea\b/i, /\bkorean\b/i],
  'SE': [/\bsweden\b/i, /\bswedish\b/i],
  'DK': [/\bdenmark\b/i, /\bdanish\b/i],
  'NO': [/\bnorway\b/i, /\bnorwegian\b/i],
  'FI': [/\bfinland\b/i, /\bfinnish\b/i],
  'PL': [/\bpoland\b/i, /\bpolish\b/i],
  'CZ': [/\bczech\b/i, /czechia/i],
  'AT': [/\baustria\b/i, /\baustrian\b/i],
  'BE': [/\bbelgium\b/i, /\bbelgian\b/i],
  'PT': [/\bportugal\b/i, /\bportuguese\b/i],
  'IE': [/\bireland\b/i, /\birish\b/i],
  'NZ': [/new zealand/i, /\bnz\b/i],
  'MX': [/\bmexico\b/i, /\bmexican\b/i],
  'AR': [/\bargentina\b/i, /\bargentine\b/i],
  'CO': [/\bcolombia\b/i, /\bcolombian\b/i],
  'ZA': [/south africa/i],
  'TR': [/\bturkey\b/i, /\bturkish\b/i],
  'RU': [/\brussia\b/i, /\brussian\b/i],
  'GR': [/\bgreece\b/i, /\bgreek\b/i],
  'HU': [/\bhungary\b/i, /\bhungarian\b/i],
  'RO': [/\bromania\b/i, /\bromanian\b/i],
};

// Extract country from author affiliations
function extractCountryFromAuthors(authors: string | undefined): string | undefined {
  if (!authors) return undefined;

  for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
    if (patterns.some(p => p.test(authors))) {
      return code;
    }
  }
  return undefined;
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Calculate title similarity (0-100%)
function titleSimilarity(title1: string, title2: string): number {
  const t1 = title1.toLowerCase().trim();
  const t2 = title2.toLowerCase().trim();

  if (t1 === t2) return 100;

  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(t1, t2);
  return Math.round((1 - distance / maxLen) * 100);
}

// Normalize title for comparison (remove punctuation, extra spaces, etc.)
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
}

export interface ScanJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_source: string | null;
  sources_completed: string[];
  sources_total: string[];
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  scan_depth: string;
  custom_keywords: string[] | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Create a new scan job
export async function createScanJob(
  supabase: SupabaseClient,
  sources: string[],
  scanDepth: string,
  customKeywords: string[]
): Promise<string> {
  const { data, error } = await supabase
    .from('kb_scan_jobs')
    .insert({
      status: 'pending',
      sources_total: sources,
      sources_completed: [],
      scan_depth: scanDepth,
      custom_keywords: customKeywords.length > 0 ? customKeywords : null
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create scan job: ${error.message}`);
  return data.id;
}

// Update scan job progress
export async function updateScanJobProgress(
  supabase: SupabaseClient,
  jobId: string,
  updates: Partial<ScanJob>
): Promise<void> {
  const { error } = await supabase
    .from('kb_scan_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId);

  if (error) console.error('Failed to update scan job:', error);
}

// Get scan job status
export async function getScanJob(supabase: SupabaseClient, jobId: string): Promise<ScanJob | null> {
  const { data, error } = await supabase
    .from('kb_scan_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) return null;
  return data;
}

// Maximum time a scan job can run before being considered stuck (in minutes)
const SCAN_TIMEOUT_MINUTES = 30;

// Clean up stuck scan jobs (jobs running longer than timeout)
export async function cleanupStuckJobs(supabase: SupabaseClient): Promise<{ cleaned: number; jobs: string[] }> {
  const timeoutThreshold = new Date(Date.now() - SCAN_TIMEOUT_MINUTES * 60 * 1000).toISOString();

  // Find jobs that are "running" or "pending" but started more than SCAN_TIMEOUT_MINUTES ago
  const { data: stuckJobs, error: fetchError } = await supabase
    .from('kb_scan_jobs')
    .select('id, status, started_at, created_at')
    .in('status', ['pending', 'running'])
    .or(`started_at.lt.${timeoutThreshold},and(started_at.is.null,created_at.lt.${timeoutThreshold})`);

  if (fetchError || !stuckJobs || stuckJobs.length === 0) {
    return { cleaned: 0, jobs: [] };
  }

  const cleanedJobIds: string[] = [];

  for (const job of stuckJobs) {
    const { error: updateError } = await supabase
      .from('kb_scan_jobs')
      .update({
        status: 'failed',
        error_message: `Job timed out after ${SCAN_TIMEOUT_MINUTES} minutes (auto-cleanup)`,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (!updateError) {
      cleanedJobIds.push(job.id);
      console.log(`[Scanner] Auto-cleaned stuck job ${job.id} (was ${job.status} since ${job.started_at || job.created_at})`);
    }
  }

  return { cleaned: cleanedJobIds.length, jobs: cleanedJobIds };
}

// Get active scan job (if any) - also cleans up stuck jobs first
export async function getActiveScanJob(supabase: SupabaseClient): Promise<ScanJob | null> {
  // First, clean up any stuck jobs
  await cleanupStuckJobs(supabase);

  const { data, error } = await supabase
    .from('kb_scan_jobs')
    .select('*')
    .in('status', ['pending', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
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
  // === NEUROLOGICAL & MENTAL HEALTH ===
  'anxiety': ['anxiety', 'anxiolytic', 'GAD', 'social anxiety', 'panic disorder', 'generalized anxiety', 'anxiety disorder', 'panic attack', 'anxious'],
  'depression': ['depression', 'antidepressant', 'mood disorder', 'MDD', 'major depressive', 'dysthymia', 'depressive'],
  'ptsd': ['PTSD', 'trauma', 'post-traumatic', 'posttraumatic', 'veteran', 'traumatic stress', 'stress disorder', 'flashback', 'combat'],
  'sleep': ['sleep', 'insomnia', 'circadian', 'sedative', 'sleep quality', 'sleep disorder', 'sleep disturbance', 'somnolence', 'sleep latency', 'REM sleep'],
  'epilepsy': ['epilepsy', 'seizure', 'Dravet', 'Lennox-Gastaut', 'anticonvulsant', 'Epidiolex', 'refractory epilepsy', 'convulsion', 'ictal', 'intractable epilepsy'],
  'parkinsons': ['Parkinson', 'parkinsonian', 'dopamine', 'tremor', 'bradykinesia', 'dyskinesia', 'Lewy body'],
  'alzheimers': ['Alzheimer', 'dementia', 'cognitive decline', 'memory loss', 'amyloid', 'tau protein', 'neurodegeneration', 'cognitive impairment'],
  'autism': ['autism', 'ASD', 'autistic', 'Asperger', 'spectrum disorder', 'developmental disorder', 'neurodevelopmental'],
  'adhd': ['ADHD', 'attention deficit', 'hyperactivity', 'ADD', 'inattention', 'impulsivity', 'executive function'],
  'schizophrenia': ['schizophrenia', 'psychosis', 'psychotic', 'antipsychotic', 'hallucination', 'delusion', 'negative symptoms'],
  'addiction': ['addiction', 'substance use disorder', 'cannabis use disorder', 'cud', 'opioid use', 'withdrawal symptoms', 'dependence', 'alcohol use disorder', 'drug abuse', 'cocaine', 'heroin', 'relapse prevention', 'discontinuing cannabis', 'quit cannabis', 'cannabis withdrawal'],
  'tourettes': ['Tourette', 'tic disorder', 'tics', 'motor tic', 'vocal tic', 'coprolalia'],

  // === PAIN & INFLAMMATION ===
  'chronic_pain': ['chronic pain', 'persistent pain', 'long-term pain', 'pain management', 'analgesic', 'pain relief', 'opioid-sparing'],
  'neuropathic_pain': ['neuropathic', 'neuropathy', 'nerve pain', 'peripheral neuropathy', 'diabetic neuropathy', 'neuralgia', 'allodynia'],
  'arthritis': ['arthritis', 'rheumatoid', 'osteoarthritis', 'joint pain', 'joint inflammation', 'RA', 'synovitis', 'articular'],
  'fibromyalgia': ['fibromyalgia', 'fibro', 'widespread pain', 'tender points', 'central sensitization'],
  'ms': ['multiple sclerosis', 'demyelinating', 'demyelination', 'spasticity', 'Sativex', 'nabiximols', 'relapsing-remitting', 'rrms', 'ppms', 'spms'],
  'inflammation': ['inflammation', 'anti-inflammatory', 'cytokine', 'TNF-alpha', 'interleukin', 'NF-kB', 'COX-2', 'prostaglandin', 'inflammatory'],
  'migraines': ['migraine', 'headache', 'cephalalgia', 'cluster headache', 'tension headache', 'aura'],

  // === GASTROINTESTINAL ===
  'crohns': ['Crohn', 'IBD', 'inflammatory bowel', 'colitis', 'ulcerative colitis', 'intestinal inflammation'],
  'ibs': ['IBS', 'irritable bowel', 'functional gastrointestinal', 'abdominal pain', 'bowel dysfunction'],
  'nausea': ['nausea', 'vomiting', 'emesis', 'antiemetic', 'chemotherapy-induced nausea', 'CINV', 'morning sickness'],

  // === CANCER ===
  'cancer': ['cancer', 'tumor', 'tumour', 'oncology', 'carcinoma', 'malignant', 'metastasis', 'apoptosis', 'antitumor'],
  'chemo_side_effects': ['chemotherapy', 'chemo-induced', 'chemotherapy-induced', 'palliative', 'cancer pain', 'cachexia', 'wasting syndrome'],

  // === SKIN ===
  'acne': ['acne', 'sebaceous', 'sebum', 'comedone', 'pimple', 'sebocyte'],
  'psoriasis': ['psoriasis', 'psoriatic', 'plaque psoriasis', 'scalp psoriasis', 'keratinocyte'],
  'eczema': ['eczema', 'dermatitis', 'atopic', 'pruritus', 'itching', 'skin inflammation', 'topical'],

  // === CARDIOVASCULAR ===
  'heart': ['cardiovascular', 'cardiac', 'heart disease', 'cardioprotective', 'myocardial', 'arrhythmia', 'heart failure'],
  'blood_pressure': ['blood pressure', 'hypertension', 'hypotension', 'vascular', 'vasorelaxation', 'vasodilation', 'arterial'],

  // === OTHER ===
  'diabetes': ['diabetes', 'diabetic', 'glucose', 'insulin', 'glycemic', 'blood sugar', 'metabolic syndrome', 'type 2 diabetes'],
  'obesity': ['obesity', 'weight loss', 'appetite', 'metabolic', 'BMI', 'adipose', 'fat tissue', 'overweight'],
  'athletic': ['athletic', 'sport', 'exercise', 'recovery', 'muscle', 'performance', 'endurance', 'WADA', 'athlete'],
  'veterinary': ['veterinary', 'canine', 'feline', 'dog', 'cat', 'pet', 'animal', 'equine', 'horse'],

  // Legacy compatibility (kept for backwards compatibility with existing data)
  'stress': ['stress', 'cortisol', 'HPA axis', 'stress response', 'stress relief', 'chronic stress'],
  'neurological': ['neuroprotective', 'neurodegeneration', 'ALS', 'Huntington'],
  'glaucoma': ['glaucoma', 'intraocular pressure', 'eye pressure', 'ocular'],
  'covid': ['COVID', 'coronavirus', 'SARS-CoV-2', 'pandemic', 'viral infection'],
  'aging': ['aging', 'elderly', 'geriatric', 'age-related', 'longevity'],
  'womens': ['women', 'menstrual', 'pregnancy', 'menopause', 'gynecological']
};

// VALIDATION FUNCTION - Must pass to be added
function isRelevantToCannabis(study: ResearchItem): boolean {
  const text = `${study.title || ''} ${study.abstract || ''}`.toLowerCase();
  const title = (study.title || '').toLowerCase();

  // Must contain at least one required keyword
  const hasRequiredKeyword = REQUIRED_KEYWORDS.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  if (!hasRequiredKeyword) {
    console.log(`REJECTED (no cannabis keyword): ${study.title?.substring(0, 50)}`);
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
    'forensic',
    'survey of attitudes',
    'public opinion',
    'legalization debate',
    'recreational use patterns',
    'prevalence of use',
    'youth cannabis use',
    'adolescent marijuana use'
  ];

  const isNonTherapeutic = nonTherapeuticKeywords.some(kw =>
    text.includes(kw) && !text.includes('therapeutic') && !text.includes('treatment') && !text.includes('patient')
  );

  if (isNonTherapeutic) {
    console.log(`REJECTED (non-therapeutic): ${study.title?.substring(0, 50)}`);
    return false;
  }

  // Quality filters - reject low-quality or non-research content
  const lowQualityIndicators = [
    'letter to the editor',
    'erratum',
    'corrigendum',
    'retraction notice',
    'author correction',
    'commentary on',
    'response to',
    'reply to',
    'book review'
  ];

  const isLowQuality = lowQualityIndicators.some(indicator =>
    title.includes(indicator)
  );

  if (isLowQuality) {
    console.log(`REJECTED (low quality): ${study.title?.substring(0, 50)}`);
    return false;
  }

  // Reject studies that are primarily about cannabis harms without therapeutic focus
  const harmsOnlyKeywords = [
    'cannabis-induced psychosis',
    'marijuana-related emergency',
    'cannabis use disorder prevalence',
    'driving under influence',
    'impaired driving',
    'drugged driving'
  ];

  const isHarmsOnly = harmsOnlyKeywords.some(kw =>
    text.includes(kw)
  ) && !text.includes('treatment') && !text.includes('therapy') && !text.includes('intervention');

  if (isHarmsOnly) {
    console.log(`REJECTED (harms only, no treatment): ${study.title?.substring(0, 50)}`);
    return false;
  }

  // Reject very short titles (likely incomplete data)
  if ((study.title?.length || 0) < 20) {
    console.log(`REJECTED (title too short): ${study.title}`);
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

export async function scanPubMed(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const dateFilter = getDateRangeFilter(scanDepth);
  const resultLimit = getResultLimit(scanDepth);

  // Use custom keywords if provided, otherwise use default search terms
  const searchTerms = customKeywords.length > 0 ? customKeywords : SEARCH_TERMS;

  console.log(`[PubMed] Starting scan with ${searchTerms.length} search terms, depth: ${scanDepth}`);

  for (const term of searchTerms) {
    try {
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: `${term} ${dateFilter}`,
        retmax: String(Math.min(resultLimit, 100)), // PubMed API limit
        retmode: 'json',
        sort: 'date'
      });

      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`;
      console.log(`[PubMed] Searching: "${term}"`);

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        console.error(`[PubMed] Search API error: ${searchResponse.status} ${searchResponse.statusText}`);
        continue;
      }

      const searchData = await searchResponse.json();

      if (searchData.esearchresult?.idlist?.length > 0) {
        const ids = searchData.esearchresult.idlist.join(',');
        console.log(`[PubMed] Found ${searchData.esearchresult.idlist.length} results for "${term}"`);

        const summaryParams = new URLSearchParams({
          db: 'pubmed',
          id: ids,
          retmode: 'json'
        });

        const summaryResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
        );

        if (!summaryResponse.ok) {
          console.error(`[PubMed] Summary API error: ${summaryResponse.status} ${summaryResponse.statusText}`);
          continue;
        }

        const summaryData = await summaryResponse.json();

        for (const id of searchData.esearchresult.idlist) {
          const article = summaryData.result?.[id];
          if (article && article.title) {
            results.push({
              title: article.title,
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
      } else {
        console.log(`[PubMed] No results for "${term}"`);
      }

      // Rate limiting - be nice to NCBI (required: max 3 requests/second without API key)
      await new Promise(resolve => setTimeout(resolve, 400));

    } catch (error) {
      console.error(`[PubMed] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[PubMed] Scan complete. Total results: ${results.length}`);
  return results;
}

export async function scanClinicalTrials(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const resultLimit = Math.min(getResultLimit(scanDepth), 100); // ClinicalTrials.gov API limit

  // Use custom keywords if provided, otherwise use default search terms
  const defaultTerms = ['cannabidiol', 'CBD', 'cannabis', 'medical cannabis', 'medical marijuana', 'cannabinoid'];
  const searchTerms = customKeywords.length > 0 ? customKeywords : defaultTerms;

  console.log(`[ClinicalTrials] Starting scan with ${searchTerms.length} search terms`);

  for (const term of searchTerms) {
    try {
      const url = 'https://clinicaltrials.gov/api/v2/studies?' + new URLSearchParams({
        'query.term': term,
        'filter.overallStatus': 'COMPLETED',
        'sort': 'LastUpdatePostDate:desc',
        'pageSize': String(Math.min(resultLimit, 100))
      });

      console.log(`[ClinicalTrials] Searching: "${term}"`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[ClinicalTrials] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const studyCount = data.studies?.length || 0;
      console.log(`[ClinicalTrials] Found ${studyCount} studies for "${term}"`);

      for (const study of data.studies || []) {
        const protocol = study.protocolSection;
        const title = protocol?.identificationModule?.officialTitle || protocol?.identificationModule?.briefTitle;

        if (title) {
          const nctId = protocol?.identificationModule?.nctId;

          // Extract country from ClinicalTrials.gov location data
          let country: string | undefined;
          const locations = protocol?.contactsLocationsModule?.locations;
          if (locations && locations.length > 0) {
            // Use the first location's country
            country = locations[0]?.country;
            // Convert to ISO code if it's a full name
            if (country) {
              for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
                if (patterns.some(p => p.test(country!))) {
                  country = code;
                  break;
                }
              }
            }
          }

          results.push({
            title,
            authors: protocol?.contactsLocationsModule?.overallOfficials?.map((o: any) => o.name).join(', '),
            publication: 'ClinicalTrials.gov',
            year: new Date(protocol?.statusModule?.lastUpdatePostDateStruct?.date).getFullYear() || new Date().getFullYear(),
            abstract: protocol?.descriptionModule?.briefSummary,
            url: `https://clinicaltrials.gov/study/${nctId}`,
            source_site: 'ClinicalTrials.gov',
            search_term_matched: term,
            country
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`[ClinicalTrials] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[ClinicalTrials] Scan complete. Total results: ${results.length}`);
  return results;
}

export async function scanPMC(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const dateFilter = getDateRangeFilter(scanDepth);
  const resultLimit = getResultLimit(scanDepth);

  // Use custom keywords if provided, otherwise use default search terms
  const defaultTerms = [
    'cannabidiol clinical',
    'medical cannabis trial',
    'cannabis therapeutic efficacy',
    'CBD randomized trial',
    'cannabinoid therapy'
  ];
  const searchTerms = customKeywords.length > 0 ? customKeywords : defaultTerms;

  console.log(`[PMC] Starting scan with ${searchTerms.length} search terms, depth: ${scanDepth}`);

  for (const term of searchTerms) {
    try {
      const searchParams = new URLSearchParams({
        db: 'pmc',
        term: `${term} ${dateFilter}`,
        retmax: String(Math.min(resultLimit, 100)), // PMC API limit
        retmode: 'json'
      });

      console.log(`[PMC] Searching: "${term}"`);

      const searchResponse = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${searchParams}`
      );

      if (!searchResponse.ok) {
        console.error(`[PMC] Search API error: ${searchResponse.status} ${searchResponse.statusText}`);
        continue;
      }

      const searchData = await searchResponse.json();

      if (searchData.esearchresult?.idlist?.length > 0) {
        const ids = searchData.esearchresult.idlist.join(',');
        console.log(`[PMC] Found ${searchData.esearchresult.idlist.length} results for "${term}"`);

        const summaryParams = new URLSearchParams({
          db: 'pmc',
          id: ids,
          retmode: 'json'
        });

        const summaryResponse = await fetch(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?${summaryParams}`
        );

        if (!summaryResponse.ok) {
          console.error(`[PMC] Summary API error: ${summaryResponse.status} ${summaryResponse.statusText}`);
          continue;
        }

        const summaryData = await summaryResponse.json();

        for (const id of searchData.esearchresult.idlist) {
          const article = summaryData.result?.[id];
          if (article && article.title) {
            results.push({
              title: article.title,
              authors: article.authors?.map((a: any) => a.name).join(', '),
              publication: article.source || 'PMC',
              year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
              url: `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}/`,
              source_site: 'PMC',
              search_term_matched: term
            });
          }
        }
      } else {
        console.log(`[PMC] No results for "${term}"`);
      }

      // Rate limiting - be nice to NCBI
      await new Promise(resolve => setTimeout(resolve, 400));

    } catch (error) {
      console.error(`[PMC] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[PMC] Scan complete. Total results: ${results.length}`);
  return results;
}

// Europe PMC Scanner
export async function scanEuropePMC(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const resultLimit = getResultLimit(scanDepth);

  const defaultTerms = ['cannabidiol', 'CBD therapy', 'medical cannabis', 'cannabis clinical trial'];
  const searchTerms = customKeywords.length > 0 ? customKeywords.slice(0, 5) : defaultTerms;

  console.log(`[EuropePMC] Starting scan with ${searchTerms.length} search terms`);

  for (const term of searchTerms) {
    try {
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(term)}&format=json&pageSize=${Math.min(resultLimit, 25)}&sort=DATE_CREATED desc`;

      console.log(`[EuropePMC] Searching: "${term}"`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[EuropePMC] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const articles = data.resultList?.result || [];
      console.log(`[EuropePMC] Found ${articles.length} results for "${term}"`);

      for (const article of articles) {
        if (article.title) {
          results.push({
            title: article.title,
            authors: article.authorString,
            publication: article.journalTitle || 'Europe PMC',
            year: parseInt(article.pubYear) || new Date().getFullYear(),
            abstract: article.abstractText,
            url: article.doi ? `https://doi.org/${article.doi}` : `https://europepmc.org/article/${article.source}/${article.id}`,
            doi: article.doi,
            source_site: 'Europe PMC',
            search_term_matched: term
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`[EuropePMC] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[EuropePMC] Scan complete. Total results: ${results.length}`);
  return results;
}

// bioRxiv/medRxiv Preprint Scanner
export async function scanBioRxiv(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  // bioRxiv API uses date ranges
  const now = new Date();
  let startDate: Date;

  switch (scanDepth) {
    case 'quick':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'standard':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  }

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = now.toISOString().split('T')[0];

  console.log(`[bioRxiv] Starting scan from ${startStr} to ${endStr}`);

  // Search both bioRxiv and medRxiv
  for (const server of ['biorxiv', 'medrxiv']) {
    try {
      // bioRxiv API: search for cannabis/CBD related preprints
      const url = `https://api.biorxiv.org/details/${server}/${startStr}/${endStr}/0/50`;

      console.log(`[bioRxiv] Fetching from ${server}...`);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`[bioRxiv] ${server} API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const articles = data.collection || [];

      // Filter for cannabis/CBD related
      const cannabisKeywords = ['cannabis', 'cannabidiol', 'cbd', 'cannabinoid', 'thc', 'marijuana', 'hemp'];
      const filtered = articles.filter((article: any) => {
        const text = `${article.title || ''} ${article.abstract || ''}`.toLowerCase();
        return cannabisKeywords.some(kw => text.includes(kw));
      });

      console.log(`[bioRxiv] Found ${filtered.length} cannabis-related preprints in ${server}`);

      for (const article of filtered) {
        results.push({
          title: article.title,
          authors: article.authors,
          publication: server === 'medrxiv' ? 'medRxiv' : 'bioRxiv',
          year: new Date(article.date).getFullYear(),
          abstract: article.abstract,
          url: `https://doi.org/${article.doi}`,
          doi: article.doi,
          source_site: server === 'medrxiv' ? 'medRxiv' : 'bioRxiv',
          search_term_matched: 'preprint search'
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[bioRxiv] Error scanning ${server}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[bioRxiv] Scan complete. Total results: ${results.length}`);
  return results;
}

// Semantic Scholar Scanner
export async function scanSemanticScholar(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const resultLimit = getResultLimit(scanDepth);

  const defaultTerms = ['cannabidiol', 'CBD therapy', 'medical cannabis clinical trial'];
  const searchTerms = customKeywords.length > 0 ? customKeywords.slice(0, 3) : defaultTerms;

  console.log(`[SemanticScholar] Starting scan with ${searchTerms.length} search terms`);

  for (const term of searchTerms) {
    try {
      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(term)}&limit=${Math.min(resultLimit, 50)}&fields=title,authors,year,abstract,externalIds,url,venue`;

      console.log(`[SemanticScholar] Searching: "${term}"`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`[SemanticScholar] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const papers = data.data || [];
      console.log(`[SemanticScholar] Found ${papers.length} results for "${term}"`);

      for (const paper of papers) {
        if (paper.title) {
          const doi = paper.externalIds?.DOI;
          const pmid = paper.externalIds?.PubMed;
          results.push({
            title: paper.title,
            authors: paper.authors?.map((a: any) => a.name).join(', '),
            publication: paper.venue || 'Semantic Scholar',
            year: paper.year || new Date().getFullYear(),
            abstract: paper.abstract,
            url: doi ? `https://doi.org/${doi}` : (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : paper.url),
            doi: doi,
            source_site: 'Semantic Scholar',
            search_term_matched: term
          });
        }
      }

      // Semantic Scholar rate limit: 100 requests per 5 minutes
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[SemanticScholar] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[SemanticScholar] Scan complete. Total results: ${results.length}`);
  return results;
}

// CrossRef Scanner (DOI metadata)
export async function scanCrossRef(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const resultLimit = getResultLimit(scanDepth);

  const defaultTerms = ['cannabidiol', 'medical cannabis', 'CBD clinical'];
  const searchTerms = customKeywords.length > 0 ? customKeywords.slice(0, 3) : defaultTerms;

  console.log(`[CrossRef] Starting scan with ${searchTerms.length} search terms`);

  for (const term of searchTerms) {
    try {
      const url = `https://api.crossref.org/works?query=${encodeURIComponent(term)}&rows=${Math.min(resultLimit, 50)}&sort=published&order=desc&filter=type:journal-article`;

      console.log(`[CrossRef] Searching: "${term}"`);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CBD-Portal/1.0 (https://cbdportal.com; mailto:contact@cbdportal.com)'
        }
      });

      if (!response.ok) {
        console.error(`[CrossRef] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const works = data.message?.items || [];
      console.log(`[CrossRef] Found ${works.length} results for "${term}"`);

      for (const work of works) {
        if (work.title?.[0]) {
          const year = work.published?.['date-parts']?.[0]?.[0] ||
                       work['published-print']?.['date-parts']?.[0]?.[0] ||
                       work['published-online']?.['date-parts']?.[0]?.[0] ||
                       new Date().getFullYear();

          results.push({
            title: work.title[0],
            authors: work.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(', '),
            publication: work['container-title']?.[0] || 'CrossRef',
            year: year,
            abstract: work.abstract?.replace(/<[^>]*>/g, ''), // Strip HTML tags
            url: work.URL || `https://doi.org/${work.DOI}`,
            doi: work.DOI,
            source_site: 'CrossRef',
            search_term_matched: term
          });
        }
      }

      // CrossRef polite rate limit
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[CrossRef] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[CrossRef] Scan complete. Total results: ${results.length}`);
  return results;
}

// OpenAlex Scanner (open research database)
export async function scanOpenAlex(scanDepth: string = 'standard', customKeywords: string[] = []): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];
  const resultLimit = getResultLimit(scanDepth);

  const defaultTerms = ['cannabidiol', 'medical cannabis', 'CBD treatment'];
  const searchTerms = customKeywords.length > 0 ? customKeywords.slice(0, 3) : defaultTerms;

  console.log(`[OpenAlex] Starting scan with ${searchTerms.length} search terms`);

  for (const term of searchTerms) {
    try {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(term)}&per-page=${Math.min(resultLimit, 50)}&sort=publication_date:desc&filter=type:article`;

      console.log(`[OpenAlex] Searching: "${term}"`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CBD-Portal/1.0 (mailto:contact@cbdportal.com)'
        }
      });

      if (!response.ok) {
        console.error(`[OpenAlex] API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const works = data.results || [];
      console.log(`[OpenAlex] Found ${works.length} results for "${term}"`);

      for (const work of works) {
        if (work.title) {
          const doi = work.doi?.replace('https://doi.org/', '');
          results.push({
            title: work.title,
            authors: work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean).join(', '),
            publication: work.primary_location?.source?.display_name || 'OpenAlex',
            year: work.publication_year || new Date().getFullYear(),
            abstract: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : undefined,
            url: work.doi || work.id,
            doi: doi,
            source_site: 'OpenAlex',
            search_term_matched: term
          });
        }
      }

      // OpenAlex rate limit: 100K requests/day, 10 requests/second
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`[OpenAlex] Error scanning for "${term}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`[OpenAlex] Scan complete. Total results: ${results.length}`);
  return results;
}

// Helper to reconstruct abstract from OpenAlex inverted index format
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
  if (!invertedIndex) return '';

  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }

  words.sort((a, b) => a[1] - b[1]);
  return words.map(w => w[0]).join(' ');
}

// Check if a scan job has been cancelled
async function isJobCancelled(supabase: SupabaseClient, jobId: string): Promise<boolean> {
  const { data } = await supabase
    .from('kb_scan_jobs')
    .select('status')
    .eq('id', jobId)
    .single();

  return data?.status === 'cancelled';
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

// Helper function to get date range filter based on scan depth
function getDateRangeFilter(scanDepth: string): string {
  const now = new Date();
  let startDate: Date;

  switch (scanDepth) {
    case 'quick':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
      break;
    case '6months':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months
      break;
    case 'standard':
    case 'deep':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // 6 months (legacy)
      break;
    case '1year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year
      break;
    case '2years':
      startDate = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years
      break;
    case '5years':
      startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
      break;
    case 'historical':
    case 'comprehensive':
      // Historical: go back 20 years to capture landmark studies
      startDate = new Date(now.getTime() - 20 * 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); // default to 6 months
  }

  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');

  return `AND ("${year}/${month}/${day}"[PDat] : "3000"[PDat])`;
}

// Helper function to get result limit based on scan depth
function getResultLimit(scanDepth: string): number {
  switch (scanDepth) {
    case 'quick': return 20;
    case '6months': return 50;
    case 'standard': return 50;
    case 'deep': return 50;
    case '1year': return 100;
    case '2years': return 200;
    case '5years': return 500;
    case 'historical':
    case 'comprehensive': return 1000;
    default: return 50;
  }
}

// Update the main scan function
export async function runDailyResearchScan(
  includeExtended = false,
  scanDepth: 'quick' | 'standard' | 'deep' | '1year' | '2years' | '5years' | 'comprehensive' = 'standard',
  customKeywords: string[] = [],
  selectedSources: string[] = ['pubmed', 'clinicaltrials', 'pmc']
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`Starting research scan with STRICT cannabis filtering (depth: ${scanDepth}, sources: ${selectedSources.join(', ')})...`);

  let allResults: ResearchItem[] = [];

  // Scan selected sources based on user selection
  if (selectedSources.includes('pubmed')) {
    console.log('📚 Scanning PubMed...');
    const pubmedResults = await scanPubMed(scanDepth, customKeywords);
    allResults.push(...pubmedResults);
  }

  if (selectedSources.includes('clinicaltrials')) {
    console.log('🧪 Scanning ClinicalTrials.gov...');
    const clinicalTrialsResults = await scanClinicalTrials(scanDepth, customKeywords);
    allResults.push(...clinicalTrialsResults);
  }

  if (selectedSources.includes('pmc')) {
    console.log('📖 Scanning PMC...');
    const pmcResults = await scanPMC(scanDepth, customKeywords);
    allResults.push(...pmcResults);
  }

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
        status: 'pending'
      });

    if (error) {
      console.error(`[Scanner] Failed to insert study: ${error.message}`);
    } else {
      added++;
    }
  }

  console.log(`[Scanner] Scan complete. Added: ${added}, Skipped: ${skipped}, Rejected: ${rejected}`);

  return { added, skipped, rejected, total: uniqueResults.length };
}

// Save results from a single source to the database incrementally
async function saveSourceResults(
  supabase: SupabaseClient,
  results: ResearchItem[],
  jobId?: string
): Promise<{ added: number; skipped: number; rejected: number; cancelled: boolean }> {
  let added = 0;
  let skipped = 0;
  let rejected = 0;

  console.log(`[SaveResults] Processing ${results.length} results...`);

  for (const study of results) {
    // Check for cancellation every 10 items to allow quick stop
    if (jobId && (added + skipped + rejected) % 10 === 0) {
      if (await isJobCancelled(supabase, jobId)) {
        console.log(`[SaveResults] Scan cancelled, stopping early`);
        return { added, skipped, rejected, cancelled: true };
      }
    }

    const titleShort = study.title?.substring(0, 50) || 'Untitled';

    // STRICT VALIDATION - Must be about cannabis/CBD
    if (!isRelevantToCannabis(study)) {
      rejected++;
      continue;
    }

    // DEDUPLICATION CHECK 1: Exact URL match (including approved/rejected)
    const { data: urlMatch } = await supabase
      .from('kb_research_queue')
      .select('id, title, status')
      .eq('url', study.url)
      .single();

    if (urlMatch) {
      const statusNote = urlMatch.status === 'approved' ? ' (already approved)' :
                        urlMatch.status === 'rejected' ? ' (already rejected)' : '';
      console.log(`[Duplicate] URL match: "${titleShort}..."${statusNote}`);
      skipped++;
      continue;
    }

    // DEDUPLICATION CHECK 2: Exact DOI match (if DOI exists)
    if (study.doi && study.doi.trim()) {
      const { data: doiMatch } = await supabase
        .from('kb_research_queue')
        .select('id, title, status')
        .eq('doi', study.doi)
        .single();

      if (doiMatch) {
        const statusNote = doiMatch.status === 'approved' ? ' (already approved)' :
                          doiMatch.status === 'rejected' ? ' (already rejected)' : '';
        console.log(`[Duplicate] DOI match: "${titleShort}..." (DOI: ${study.doi})${statusNote}`);
        skipped++;
        continue;
      }
    }

    // DEDUPLICATION CHECK 3: Similar title match (90%+ similarity) - check approved/rejected too
    if (study.title && study.title.length > 20) {
      const normalizedNewTitle = normalizeTitle(study.title);

      // Query ALL items (including approved/rejected) for title comparison
      const { data: potentialMatches } = await supabase
        .from('kb_research_queue')
        .select('id, title, year, status')
        .order('discovered_at', { ascending: false })
        .limit(500);

      if (potentialMatches) {
        let foundSimilar = false;
        for (const existing of potentialMatches) {
          if (!existing.title) continue;

          const normalizedExisting = normalizeTitle(existing.title);
          const similarity = titleSimilarity(normalizedNewTitle, normalizedExisting);

          if (similarity >= 90) {
            const statusNote = existing.status === 'approved' ? ' (already approved)' :
                              existing.status === 'rejected' ? ' (already rejected)' : '';
            console.log(`[Duplicate] Title ${similarity}% similar: "${titleShort}..."${statusNote}`);
            skipped++;
            foundSimilar = true;
            break;
          }
        }
        if (foundSimilar) continue;
      }
    }

    // Calculate relevance
    const { score, topics } = calculateRelevance(study);

    // Must have reasonable relevance score
    if (score < 20) {
      rejected++;
      continue;
    }

    // Try to extract country from authors if not already set
    const country = study.country || extractCountryFromAuthors(study.authors);

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
        country: country,
        status: 'pending'
      });

    if (error) {
      // Check if it's a duplicate constraint violation
      if (error.code === '23505') {
        console.log(`[Duplicate] DB constraint: "${titleShort}..." already exists (${error.message})`);
        skipped++;
      } else {
        console.error(`[SaveResults] Failed to insert "${titleShort}...":`, error.message, error.code);
      }
    } else {
      added++;
      console.log(`[SaveResults] Added: "${study.title?.substring(0, 60)}..." (score: ${score}${country ? `, country: ${country}` : ''})`);
    }
  }

  console.log(`[SaveResults] Batch complete: added=${added}, skipped=${skipped} (duplicates), rejected=${rejected} (not relevant)`);
  return { added, skipped, rejected, cancelled: false };
}

// Run scan with job tracking (background-compatible)
export async function runBackgroundScan(jobId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Get the job details
    const job = await getScanJob(supabase, jobId);
    if (!job) throw new Error('Job not found');

    const sources = job.sources_total;
    const scanDepth = job.scan_depth;
    const customKeywords = job.custom_keywords || [];

    // Mark job as running
    await updateScanJobProgress(supabase, jobId, {
      status: 'running',
      started_at: new Date().toISOString()
    });

    console.log(`[Job ${jobId}] Starting background scan (depth: ${scanDepth}, sources: ${sources.join(', ')})...`);

    let totalAdded = 0;
    let totalSkipped = 0;
    let totalRejected = 0;
    let totalFound = 0;
    const completedSources: string[] = [];
    let wasCancelled = false;

    // Process each source
    for (const source of sources) {
      // Check if job was cancelled before starting this source
      if (await isJobCancelled(supabase, jobId)) {
        console.log(`[Job ${jobId}] Scan cancelled by user`);
        wasCancelled = true;
        break;
      }

      // Update current source
      await updateScanJobProgress(supabase, jobId, {
        current_source: source
      });

      console.log(`[Job ${jobId}] Scanning ${source}...`);

      let results: ResearchItem[] = [];

      try {
        switch (source) {
          case 'pubmed':
            results = await scanPubMed(scanDepth, customKeywords);
            break;
          case 'clinicaltrials':
            results = await scanClinicalTrials(scanDepth, customKeywords);
            break;
          case 'pmc':
            results = await scanPMC(scanDepth, customKeywords);
            break;
          case 'europepmc':
            results = await scanEuropePMC(scanDepth, customKeywords);
            break;
          case 'biorxiv':
            results = await scanBioRxiv(scanDepth, customKeywords);
            break;
          case 'semanticscholar':
            results = await scanSemanticScholar(scanDepth, customKeywords);
            break;
          case 'crossref':
            results = await scanCrossRef(scanDepth, customKeywords);
            break;
          case 'openalex':
            results = await scanOpenAlex(scanDepth, customKeywords);
            break;
          default:
            console.log(`[Job ${jobId}] Unknown source: ${source}, skipping`);
        }
      } catch (error) {
        console.error(`[Job ${jobId}] Error scanning ${source}:`, error);
      }

      // Check cancellation after source scan (before processing results)
      if (await isJobCancelled(supabase, jobId)) {
        console.log(`[Job ${jobId}] Scan cancelled after ${source} fetch`);
        wasCancelled = true;
        break;
      }

      // Deduplicate results from this source
      const uniqueResults = results.filter((item, index, self) =>
        index === self.findIndex(t => t.url === item.url)
      );

      totalFound += uniqueResults.length;

      // Save results incrementally (also checks for cancellation during save)
      const { added, skipped, rejected, cancelled } = await saveSourceResults(supabase, uniqueResults, jobId);
      totalAdded += added;
      totalSkipped += skipped;
      totalRejected += rejected;

      if (cancelled) {
        console.log(`[Job ${jobId}] Scan cancelled during ${source} save`);
        wasCancelled = true;
        // Still mark this source as completed since we saved partial results
        completedSources.push(source);
        await updateScanJobProgress(supabase, jobId, {
          sources_completed: completedSources,
          items_found: totalFound,
          items_added: totalAdded,
          items_skipped: totalSkipped,
          items_rejected: totalRejected
        });
        break;
      }

      // Mark source as completed
      completedSources.push(source);

      // Update job progress
      await updateScanJobProgress(supabase, jobId, {
        sources_completed: completedSources,
        items_found: totalFound,
        items_added: totalAdded,
        items_skipped: totalSkipped,
        items_rejected: totalRejected,
        current_source: null
      });

      console.log(`[Job ${jobId}] ${source} complete. Found: ${uniqueResults.length}, Added: ${added}`);
    }

    // Mark job as completed or cancelled
    if (wasCancelled) {
      await updateScanJobProgress(supabase, jobId, {
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        current_source: null
      });
      console.log(`[Job ${jobId}] Scan cancelled. Total added before stop: ${totalAdded}`);
    } else {
      await updateScanJobProgress(supabase, jobId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      console.log(`[Job ${jobId}] Scan complete. Total added: ${totalAdded}, skipped: ${totalSkipped}, rejected: ${totalRejected}`);
    }

  } catch (error) {
    console.error(`[Job ${jobId}] Scan failed:`, error);
    await updateScanJobProgress(supabase, jobId, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      completed_at: new Date().toISOString()
    });
  }
}