import { createClient } from '../../../lib/supabase/server';
import { ResearchPageClient } from '../../../components/ResearchPageClient';
import { CONDITIONS, ConditionKey } from '../../../lib/research-conditions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Force dynamic rendering to ensure fresh data and proper condition matching
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ condition: string }>;
}

// Generate metadata for each condition page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { condition } = await params;

  if (!(condition in CONDITIONS)) {
    return {
      title: 'Not Found | CBD Portal',
    };
  }

  const conditionData = CONDITIONS[condition as ConditionKey];

  return {
    title: `CBD Research: ${conditionData.label} | CBD Portal`,
    description: conditionData.description,
    alternates: {
      canonical: `/research/${condition}`,
    },
    openGraph: {
      title: `CBD Research for ${conditionData.label}`,
      description: `Browse peer-reviewed studies on CBD and cannabis for ${conditionData.label.toLowerCase()}. ${conditionData.description}`,
    },
  };
}

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

export default async function ConditionResearchPage({ params }: PageProps) {
  const { condition } = await params;

  // Check if condition is valid
  if (!(condition in CONDITIONS)) {
    notFound();
  }

  const conditionData = CONDITIONS[condition as ConditionKey];
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
      slug: item.slug
    }));

    console.log(`[Research Page] Loaded ${allResearch.length} approved studies for condition: ${condition}`);

  } catch (error) {
    console.error('Research page error:', error);
    allResearch = [];
  }

  // Filter studies by condition keywords
  const filteredResearch = allResearch.filter(study => {
    const searchText = `${study.title || ''} ${study.abstract || ''} ${
      Array.isArray(study.relevant_topics) ? study.relevant_topics.join(' ') : study.relevant_topics || ''
    }`.toLowerCase();

    return conditionData.keywords.some(keyword =>
      searchText.includes(keyword.toLowerCase())
    );
  });

  // Calculate statistics
  const stats = {
    total: filteredResearch.length,
    recentStudies: filteredResearch.filter(r => (r.year || 0) >= 2020).length,
    highRelevance: filteredResearch.filter(r => (r.relevance_score || 0) >= 80).length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <span className="text-5xl" aria-hidden="true">{conditionData.icon}</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">
          CBD Research: {conditionData.label}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {conditionData.description}
        </p>
        <p className="text-sm text-gray-500">
          {stats.total} peer-reviewed studies • {stats.recentStudies} since 2020
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          <div className="text-xs text-blue-600">Total Studies</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border border-green-200">
          <div className="text-2xl font-bold text-green-700">{stats.recentStudies}</div>
          <div className="text-xs text-green-600">Since 2020</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{stats.highRelevance}</div>
          <div className="text-xs text-purple-600">High Quality</div>
        </div>
      </div>

      {/* Research keywords info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Search Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {conditionData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Research Interface */}
      <ResearchPageClient initialResearch={filteredResearch} condition={condition} />

      {/* Schema.org structured data for the condition page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: `CBD Research for ${conditionData.label}`,
            description: conditionData.description,
            mainContentOfPage: {
              '@type': 'WebPageElement',
              cssSelector: 'article'
            },
            specialty: {
              '@type': 'MedicalSpecialty',
              name: 'Alternative Medicine'
            },
            about: {
              '@type': 'MedicalCondition',
              name: conditionData.label,
              alternateName: conditionData.keywords
            }
          })
        }}
      />
    </div>
  );
}
