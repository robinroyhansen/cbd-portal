import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'CBD Research Database | Evidence-Based Cannabis Studies',
  description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources. Updated daily with the latest scientific evidence.',
  openGraph: {
    title: 'CBD Research Database | Evidence-Based Cannabis Studies',
    description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources.',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function ResearchPage() {
  const supabase = createClient();

  // Fallback to sample data if database is not available
  let research = null;
  let totalStudies = 0;
  let uniqueTopics: string[] = [];
  let uniqueSources: string[] = [];

  try {
    // Get ALL approved research
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'approved')
      .order('year', { ascending: false })
      .order('relevance_score', { ascending: false });

    if (!error && data) {
      research = data;

      // Get statistics
      const { count } = await supabase
        .from('kb_research_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      totalStudies = count || 0;

      // Get unique topics
      const allTopics = research.flatMap(r => r.relevant_topics || []) || [];
      uniqueTopics = [...new Set(allTopics)];

      // Get unique sources
      const allSources = research.map(r => r.source_site) || [];
      uniqueSources = [...new Set(allSources)];
    }
  } catch (error) {
    console.error('Database error, using fallback:', error);
  }

  // Use fallback data if no research or error
  if (!research || research.length === 0) {
    research = [
      {
        id: 1,
        title: 'Cannabidiol in Anxiety and Sleep: A Large Case Series',
        authors: 'Shannon S, Lewis N, Lee H, Hughes S',
        publication: 'The Permanente Journal',
        year: 2019,
        url: 'https://pubmed.ncbi.nlm.nih.gov/30624194/',
        doi: '10.7812/TPP/18-041',
        source_site: 'PubMed',
        relevant_topics: ['anxiety', 'sleep'],
        relevance_score: 92,
        discovered_at: '2024-01-15T10:30:00Z',
        abstract: 'This large case series examined the effects of cannabidiol on anxiety and sleep in 72 adults presenting to a psychiatric clinic.'
      },
      {
        id: 2,
        title: 'Cannabidiol for the treatment of cannabis use disorder: a phase 2a trial',
        authors: 'Freeman TP, Hindocha C, Baio G, et al.',
        publication: 'The Lancet Psychiatry',
        year: 2020,
        url: 'https://pubmed.ncbi.nlm.nih.gov/33035453/',
        doi: '10.1016/S2215-0366(20)30290-X',
        source_site: 'PubMed',
        relevant_topics: ['addiction', 'clinical trial'],
        relevance_score: 89,
        discovered_at: '2024-01-12T14:20:00Z',
        abstract: 'This randomised, double-blind, placebo-controlled trial investigated cannabidiol as a treatment for cannabis use disorder.'
      },
      {
        id: 3,
        title: 'Trial of Cannabidiol for Drug-Resistant Seizures in the Dravet Syndrome',
        authors: 'Devinsky O, Cross JH, Laux L, et al.',
        publication: 'New England Journal of Medicine',
        year: 2017,
        url: 'https://pubmed.ncbi.nlm.nih.gov/28538134/',
        doi: '10.1056/NEJMoa1611618',
        source_site: 'PubMed',
        relevant_topics: ['epilepsy', 'clinical trial'],
        relevance_score: 95,
        discovered_at: '2024-01-10T09:15:00Z',
        abstract: 'This double-blind, placebo-controlled trial evaluated cannabidiol for drug-resistant seizures in patients with Dravet syndrome.'
      }
    ];
    totalStudies = 3;
    uniqueTopics = ['anxiety', 'sleep', 'addiction', 'clinical trial', 'epilepsy'];
    uniqueSources = ['PubMed'];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">CBD Research Database</h1>
      <p className="text-xl text-gray-600 mb-8">
        Peer-reviewed studies on cannabidiol and cannabis from authoritative medical sources
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold text-green-700">{totalStudies || 0}</div>
          <div className="text-gray-600">Research Studies</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold text-blue-700">{uniqueTopics.length}</div>
          <div className="text-gray-600">Health Topics</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-4xl font-bold text-purple-700">{uniqueSources.length}</div>
          <div className="text-gray-600">Sources</div>
        </div>
      </div>

      {/* Topic filters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Filter by Topic</h2>
        <div className="flex flex-wrap gap-2">
          {uniqueTopics.map(topic => (
            <span key={topic} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Research list */}
      <div className="space-y-6">
        {research?.map((item) => (
          <div key={item.id} className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {item.authors} • {item.publication} • {item.year}
            </p>
            {item.abstract && (
              <p className="text-gray-700 text-sm mb-3 line-clamp-3">{item.abstract}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {item.relevant_topics?.map(topic => (
                  <span key={topic} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                    {topic}
                  </span>
                ))}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm"
              >
                View on {item.source_site} →
              </a>
            </div>
          </div>
        ))}

        {(!research || research.length === 0) && (
          <p className="text-gray-500 text-center py-12">
            No approved research yet. Check back soon as we review new studies daily.
          </p>
        )}
      </div>
    </div>
  );
}