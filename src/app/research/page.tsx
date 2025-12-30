import { createClient } from '@/lib/supabase/server';
import { ResearchTabs } from '@/components/ResearchTabs';

export const metadata = {
  title: 'Research Database | CBD & Cannabis Studies',
  description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources. Updated daily with the latest scientific evidence.',
  openGraph: {
    title: 'Research Database | CBD & Cannabis Studies',
    description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources.',
  },
};

export const revalidate = 3600; // Revalidate every hour

// Helper function to categorize research based on content
function categorizeResearch(research: any[]) {
  return research.map(item => {
    // Use existing categories if available, otherwise categorize based on content
    if (item.categories && Array.isArray(item.categories)) {
      return item;
    }

    const text = `${item.title || ''} ${item.abstract || ''}`.toLowerCase();
    const categories = [];

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

    return { ...item, categories: [...new Set(categories)] };
  });
}

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site?: string;
  source_type: 'research_queue' | 'citation';
  categories: string[];
  relevant_topics?: string[];
  relevance_score?: number;
}

export default async function ResearchPage() {
  const supabase = await createClient();

  // Fetch both sources in parallel
  let allResearch: ResearchItem[] = [];

  try {
    // Get approved research from queue AND all citations
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

    // Normalize research queue items
    const normalizedResearch: ResearchItem[] = (researchResult.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      authors: item.authors || 'Unknown',
      publication: item.publication || 'Unknown',
      year: item.year || new Date().getFullYear(),
      abstract: item.abstract,
      url: item.url,
      doi: item.doi,
      source_site: item.source_site,
      source_type: 'research_queue' as const,
      categories: item.categories || [],
      relevant_topics: item.relevant_topics,
      relevance_score: item.relevance_score
    }));

    // Normalize citations
    const normalizedCitations: ResearchItem[] = (citationsResult.data || []).map((item: any) => ({
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
      source_type: 'citation' as const,
      categories: [],
      relevant_topics: []
    }));

    // Combine and deduplicate by URL (research queue items have priority)
    const seenUrls = new Set<string>();

    // Add research queue items first (they have more metadata)
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

    // Sort by year descending
    allResearch.sort((a, b) => (b.year || 0) - (a.year || 0));

  } catch (error) {
    console.error('Database error, using fallback:', error);
  }

  // Use fallback data if no research or error
  if (!allResearch || allResearch.length === 0) {
    allResearch = [
      {
        id: '1',
        title: 'Cannabidiol in Anxiety and Sleep: A Large Case Series',
        authors: 'Shannon S, Lewis N, Lee H, Hughes S',
        publication: 'The Permanente Journal',
        year: 2019,
        url: 'https://pubmed.ncbi.nlm.nih.gov/30624194/',
        doi: '10.7812/TPP/18-041',
        source_site: 'PubMed',
        source_type: 'research_queue' as const,
        relevant_topics: ['anxiety', 'sleep'],
        relevance_score: 92,
        abstract: 'This large case series examined the effects of cannabidiol on anxiety and sleep in 72 adults presenting to a psychiatric clinic.',
        categories: ['cbd', 'medical-cannabis']
      },
      {
        id: '2',
        title: 'Cannabidiol for the treatment of cannabis use disorder: a phase 2a trial',
        authors: 'Freeman TP, Hindocha C, Baio G, et al.',
        publication: 'The Lancet Psychiatry',
        year: 2020,
        url: 'https://pubmed.ncbi.nlm.nih.gov/33035453/',
        doi: '10.1016/S2215-0366(20)30290-X',
        source_site: 'PubMed',
        source_type: 'research_queue' as const,
        relevant_topics: ['addiction', 'clinical trial'],
        relevance_score: 89,
        abstract: 'This randomised, double-blind, placebo-controlled trial investigated cannabidiol as a treatment for cannabis use disorder.',
        categories: ['cbd', 'cannabis', 'medical-cannabis']
      },
      {
        id: '3',
        title: 'Trial of Cannabidiol for Drug-Resistant Seizures in the Dravet Syndrome',
        authors: 'Devinsky O, Cross JH, Laux L, et al.',
        publication: 'New England Journal of Medicine',
        year: 2017,
        url: 'https://pubmed.ncbi.nlm.nih.gov/28538134/',
        doi: '10.1056/NEJMoa1611618',
        source_site: 'PubMed',
        source_type: 'research_queue' as const,
        relevant_topics: ['epilepsy', 'clinical trial'],
        relevance_score: 95,
        abstract: 'This double-blind, placebo-controlled trial evaluated cannabidiol for drug-resistant seizures in patients with Dravet syndrome.',
        categories: ['cbd', 'medical-cannabis']
      }
    ];
  }

  // Categorize all research (adds categories if missing)
  const categorizedResearch = categorizeResearch(allResearch);

  // Separate research by categories
  const cbdResearch = categorizedResearch.filter(r =>
    r.categories?.includes('cbd')
  );

  const cannabisResearch = categorizedResearch.filter(r =>
    r.categories?.includes('cannabis')
  );

  const medicalCannabisResearch = categorizedResearch.filter(r =>
    r.categories?.includes('medical-cannabis')
  );

  // Count sources
  const queueCount = categorizedResearch.filter(r => r.source_type === 'research_queue').length;
  const citationCount = categorizedResearch.filter(r => r.source_type === 'citation').length;

  // Stats per category
  const stats = {
    total: categorizedResearch.length,
    cbd: cbdResearch.length,
    cannabis: cannabisResearch.length,
    medicalCannabis: medicalCannabisResearch.length,
    fromQueue: queueCount,
    fromCitations: citationCount
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Research Database</h1>
      <p className="text-xl text-gray-600 mb-2">
        Peer-reviewed studies on CBD and cannabis from authoritative medical sources
      </p>
      <p className="text-sm text-gray-500 mb-8">
        {stats.total} studies from PubMed, PMC, ClinicalTrials.gov, and peer-reviewed journals
        {stats.fromQueue > 0 && stats.fromCitations > 0 &&
          ` (${stats.fromQueue} curated research + ${stats.fromCitations} article citations)`
        }
      </p>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-50 p-5 rounded-lg text-center">
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Studies</div>
        </div>
        <div className="bg-green-50 p-5 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-700">{stats.cbd}</div>
          <div className="text-sm text-green-600">CBD Studies</div>
        </div>
        <div className="bg-blue-50 p-5 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-700">{stats.cannabis}</div>
          <div className="text-sm text-blue-600">Cannabis Studies</div>
        </div>
        <div className="bg-purple-50 p-5 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-700">{stats.medicalCannabis}</div>
          <div className="text-sm text-purple-600">Medical Cannabis</div>
        </div>
      </div>

      {/* Tabbed Content */}
      <ResearchTabs
        cbdResearch={cbdResearch}
        cannabisResearch={cannabisResearch}
        medicalCannabisResearch={medicalCannabisResearch}
      />
    </div>
  );
}