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
  country?: string;
  display_title?: string;
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
      relevance_score: item.relevance_score || 50,
      slug: item.slug,
      country: item.country,
      display_title: item.display_title
    }));

    console.log(`[Research Page] Loaded ${allResearch.length} approved studies from database`);

  } catch (error) {
    console.error('Research page error:', error);
    // Return empty array on error - no static fallback
    allResearch = [];
  }

  // Get last updated date from most recent study
  let lastUpdated: string | null = null;
  try {
    const { data: latestStudy } = await supabase
      .from('kb_research_queue')
      .select('reviewed_at')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false })
      .limit(1)
      .single();

    if (latestStudy?.reviewed_at) {
      lastUpdated = new Date(latestStudy.reviewed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) {
    // Ignore errors, lastUpdated will remain null
  }

  // Calculate study type statistics for hero cards
  const studyStats = {
    total: allResearch.length,
    human: 0,
    preclinical: 0
  };

  // Animal/preclinical keywords
  const preclinicalPatterns = /\b(mice|mouse|rat|rats|rodent|animal model|in vivo|in vitro|cell culture|cell line|preclinical|murine)\b/i;

  allResearch.forEach(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    if (preclinicalPatterns.test(text)) {
      studyStats.preclinical++;
    } else {
      studyStats.human++;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">CBD Research Database</h1>
        <p className="text-xl text-gray-600 mb-4">
          Evidence-based research with advanced quality assessment and classification
        </p>
        <p className="text-sm text-gray-500">
          {studyStats.total} peer-reviewed studies from PubMed, PMC, ClinicalTrials.gov, and authoritative medical journals
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2">
            Database last updated: {lastUpdated}
          </p>
        )}
      </header>

      {/* Study Statistics - 3 Simple Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        <Link
          href="/research"
          className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-5 rounded-xl text-center border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-3xl font-bold text-slate-700">{studyStats.total}</div>
          <div className="text-sm text-slate-600 font-medium mt-1">Total Studies</div>
        </Link>
        <Link
          href="/research?subject=human"
          className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-5 rounded-xl text-center border border-green-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">👥</span>
            <span className="text-3xl font-bold text-green-700">{studyStats.human}</span>
          </div>
          <div className="text-sm text-green-600 font-medium mt-1">Human Studies</div>
        </Link>
        <Link
          href="/research?subject=animal"
          className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-5 rounded-xl text-center border border-purple-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🧪</span>
            <span className="text-3xl font-bold text-purple-700">{studyStats.preclinical}</span>
          </div>
          <div className="text-sm text-purple-600 font-medium mt-1">Preclinical</div>
        </Link>
      </div>

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
              size: `${studyStats.total} studies`,
              variableMeasured: ['Study Quality Score', 'Study Type', 'Publication Year', 'Medical Condition']
            }
          })
        }}
      />
    </div>
  );
}