import { createClient } from '../../lib/supabase/server';
import { ResearchPageClient } from '../../components/ResearchPageClient';

export const metadata = {
  title: 'CBD Research Database | CBD Portal',
  description: 'Browse peer-reviewed CBD research studies with advanced quality assessment and filtering.',
  alternates: {
    canonical: '/research',
  },
  openGraph: {
    title: 'Research Database | CBD & Cannabis Studies',
    description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources. Features advanced quality assessment and evidence-based classification.',
  },
};

export const revalidate = 0; // Disable cache for real-time data

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
  relevant_topics?: string[] | string;
  relevance_score?: number;
}

export default async function ResearchPage() {
  const supabase = await createClient();

  let allResearch: ResearchItem[] = [];

  try {
    // Query approved research from kb_research_queue
    const { data: researchData, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'approved')
      .order('year', { ascending: false });

    if (researchError) {
      console.error('Error fetching research:', researchError);
      throw researchError;
    }

    // Map database results to ResearchItem format
    allResearch = (researchData || []).map((item: any) => ({
      id: item.id,
      title: item.title || 'Untitled Study',
      authors: item.authors || 'Unknown Authors',
      publication: item.publication || 'Unknown Publication',
      year: item.year || new Date().getFullYear(),
      abstract: item.abstract,
      url: item.url,
      doi: item.doi,
      source_site: item.source_site || 'Research Database',
      source_type: 'research_queue' as const,
      relevant_topics: item.relevant_topics || [],
      relevance_score: item.relevance_score || 50
    }));

    console.log(`[Research Page] Loaded ${allResearch.length} approved studies from database`);

  } catch (error) {
    console.error('Research page error:', error);
    // Return empty array on error - no static fallback
    allResearch = [];
  }

  // Calculate database statistics
  const stats = {
    total: allResearch.length,
    fromQueue: allResearch.filter(r => r.source_type === 'research_queue').length,
    fromCitations: allResearch.filter(r => r.source_type === 'citation').length,
    recentStudies: allResearch.filter(r => (r.year || 0) >= 2020).length,
    highRelevance: allResearch.filter(r => (r.relevance_score || 0) >= 80).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">CBD Research Database</h1>
        <p className="text-xl text-gray-600 mb-4">
          Evidence-based research with advanced quality assessment and classification
        </p>
        <p className="text-sm text-gray-500">
          {stats.total} peer-reviewed studies from PubMed, PMC, ClinicalTrials.gov, and authoritative medical journals
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-xs text-blue-600">Total Studies</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.fromQueue}</div>
          <div className="text-xs text-green-600">Curated Research</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{stats.fromCitations}</div>
          <div className="text-xs text-purple-600">Article Citations</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.recentStudies}</div>
          <div className="text-xs text-orange-600">Since 2020</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{stats.highRelevance}</div>
          <div className="text-xs text-yellow-600">High Quality</div>
        </div>
      </div>

      {/* Research Interface */}
      <ResearchPageClient initialResearch={allResearch} />
    </div>
  );
}