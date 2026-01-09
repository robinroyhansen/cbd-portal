import { createClient } from '../../lib/supabase/server';
import { ResearchPageClient, CONDITIONS, ConditionKey } from '../../components/ResearchPageClient';
import Link from 'next/link';

export const metadata = {
  title: 'CBD Research Database | Evidence-Based Studies | CBD Portal',
  description: 'Browse 200+ peer-reviewed CBD and cannabis research studies. Filter by condition (anxiety, pain, sleep, epilepsy), study type, and quality score. Features schema.org structured data.',
  alternates: {
    canonical: '/research',
  },
  keywords: ['CBD research', 'cannabidiol studies', 'medical cannabis research', 'CBD clinical trials', 'cannabis science'],
  openGraph: {
    title: 'CBD Research Database | Peer-Reviewed Studies',
    description: 'Explore our comprehensive database of peer-reviewed CBD and cannabis research from PubMed, ClinicalTrials.gov, and other authoritative sources. Filter by condition, study type, and quality assessment.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBD Research Database',
    description: 'Browse peer-reviewed CBD research studies with advanced quality assessment and filtering.',
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
  plain_summary?: string;
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
      plain_summary: item.plain_summary,
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
  // CBD-specific: title/abstract contains "cannabidiol" or "CBD" (not just any cannabis term)
  const cbdSpecific = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return text.includes('cannabidiol') || /\bcbd\b/.test(text);
  }).length;

  const stats = {
    total: allResearch.length,
    cbdSpecific,
    recentStudies: allResearch.filter(r => (r.year || 0) >= 2020).length,
    highRelevance: allResearch.filter(r => (r.relevance_score || 0) >= 80).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">CBD Research Database</h1>
        <p className="text-xl text-gray-600 mb-4">
          Evidence-based research with advanced quality assessment and classification
        </p>
        <p className="text-sm text-gray-500">
          {stats.total} peer-reviewed studies from PubMed, PMC, ClinicalTrials.gov, and authoritative medical journals
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-xs text-blue-600">Total Studies</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.cbdSpecific}</div>
          <div className="text-xs text-green-600">CBD-Specific</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">{stats.recentStudies}</div>
          <div className="text-xs text-orange-600">Since 2020</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{stats.highRelevance}</div>
          <div className="text-xs text-purple-600">High Quality</div>
        </div>
      </div>

      {/* Condition Quick Links */}
      <nav aria-label="Research by condition" className="mb-10">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 text-center">Browse by Condition</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.entries(CONDITIONS) as [ConditionKey, typeof CONDITIONS[ConditionKey]][]).slice(0, 8).map(([key, cond]) => (
            <Link
              key={key}
              href={`/research/${key}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <span aria-hidden="true">{cond.icon}</span>
              <span>{cond.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Research Interface */}
      <ResearchPageClient initialResearch={allResearch} />

      {/* Schema.org JSON-LD for the main page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://cbdportal.com/research',
            name: 'CBD Research Database',
            description: 'Comprehensive database of peer-reviewed CBD and cannabis research studies',
            isPartOf: {
              '@type': 'WebSite',
              name: 'CBD Portal',
              url: 'https://cbdportal.com'
            },
            mainEntity: {
              '@type': 'Dataset',
              name: 'CBD Research Studies Database',
              description: 'Collection of peer-reviewed CBD and cannabis research from PubMed, PMC, ClinicalTrials.gov',
              size: `${stats.total} studies`,
              variableMeasured: ['Study Quality Score', 'Study Type', 'Publication Year', 'Medical Condition']
            }
          })
        }}
      />
    </div>
  );
}