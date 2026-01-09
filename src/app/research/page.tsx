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

  // Calculate database statistics
  // CBD-specific: title/abstract contains "cannabidiol" or "CBD" (not just any cannabis term)
  const cbdSpecific = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return text.includes('cannabidiol') || /\bcbd\b/.test(text);
  }).length;

  // Count RCTs (human randomized controlled trials)
  const rctCount = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return (text.includes('randomized') || text.includes('randomised')) &&
           text.includes('controlled') &&
           text.includes('trial') &&
           !text.includes('mice') && !text.includes('rats') && !text.includes('animal');
  }).length;

  // Count condition-specific studies
  const anxietyCount = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return text.includes('anxiety') || text.includes('anxiolytic') || text.includes('anxious');
  }).length;

  const painCount = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return text.includes('pain') || text.includes('analgesic') || text.includes('nociceptive');
  }).length;

  const epilepsyCount = allResearch.filter(r => {
    const text = `${r.title || ''} ${r.abstract || ''}`.toLowerCase();
    return text.includes('epilepsy') || text.includes('seizure') || text.includes('dravet') || text.includes('lennox');
  }).length;

  const stats = {
    total: allResearch.length,
    cbdSpecific,
    recentStudies: allResearch.filter(r => (r.year || 0) >= 2020).length,
    highQuality: allResearch.filter(r => (r.relevance_score || 0) >= 80).length,
    rctCount,
    anxietyCount,
    painCount,
    epilepsyCount
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
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2">
            Database last updated: {lastUpdated}
          </p>
        )}
      </header>

      {/* Quick Stats - Clickable Filters */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-8">
        <Link
          href="/research"
          className="bg-gradient-to-br from-blue-50 to-blue-100 px-2 py-3 rounded-lg text-center border border-blue-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-blue-700">{stats.total}</div>
          <div className="text-[10px] text-blue-600 leading-tight">All Studies</div>
        </Link>
        <Link
          href="/research?category=cbd"
          className="bg-gradient-to-br from-green-50 to-green-100 px-2 py-3 rounded-lg text-center border border-green-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-green-700">{stats.cbdSpecific}</div>
          <div className="text-[10px] text-green-600 leading-tight">CBD-Specific</div>
        </Link>
        <Link
          href="/research?year=2020"
          className="bg-gradient-to-br from-orange-50 to-orange-100 px-2 py-3 rounded-lg text-center border border-orange-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-orange-700">{stats.recentStudies}</div>
          <div className="text-[10px] text-orange-600 leading-tight">Since 2020</div>
        </Link>
        <Link
          href="/research?quality=70"
          className="bg-gradient-to-br from-purple-50 to-purple-100 px-2 py-3 rounded-lg text-center border border-purple-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-purple-700">{stats.highQuality}</div>
          <div className="text-[10px] text-purple-600 leading-tight">High Quality</div>
        </Link>
        <Link
          href="/research?type=rct&human=1"
          className="bg-gradient-to-br from-teal-50 to-teal-100 px-2 py-3 rounded-lg text-center border border-teal-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-teal-700">{stats.rctCount}</div>
          <div className="text-[10px] text-teal-600 leading-tight">Human RCTs</div>
        </Link>
        <Link
          href="/research?condition=anxiety"
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 px-2 py-3 rounded-lg text-center border border-indigo-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-indigo-700">{stats.anxietyCount}</div>
          <div className="text-[10px] text-indigo-600 leading-tight">Anxiety</div>
        </Link>
        <Link
          href="/research?condition=chronic_pain"
          className="bg-gradient-to-br from-red-50 to-red-100 px-2 py-3 rounded-lg text-center border border-red-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-red-700">{stats.painCount}</div>
          <div className="text-[10px] text-red-600 leading-tight">Pain</div>
        </Link>
        <Link
          href="/research?condition=epilepsy"
          className="bg-gradient-to-br from-amber-50 to-amber-100 px-2 py-3 rounded-lg text-center border border-amber-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-lg font-bold text-amber-700">{stats.epilepsyCount}</div>
          <div className="text-[10px] text-amber-600 leading-tight">Epilepsy</div>
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
              size: `${stats.total} studies`,
              variableMeasured: ['Study Quality Score', 'Study Type', 'Publication Year', 'Medical Condition']
            }
          })
        }}
      />
    </div>
  );
}