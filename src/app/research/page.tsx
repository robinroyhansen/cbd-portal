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
    // Note: Supabase defaults to 1000 row limit, so we need to specify a higher limit
    const { data: researchData, error: researchError } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'approved')
      .order('year', { ascending: false })
      .limit(10000);

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

  // Get accurate stats from study_subject column
  let studyStats = {
    total: 0,
    human: 0,
    reviews: 0,
    preclinical: 0
  };

  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Get human studies count
    const { count: humanCount } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('study_subject', 'human');

    // Get review count
    const { count: reviewCount } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('study_subject', 'review');

    // Get preclinical count (animal + in_vitro)
    const { count: animalCount } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .in('study_subject', ['animal', 'in_vitro']);

    studyStats = {
      total: totalCount || allResearch.length,
      human: humanCount || 0,
      reviews: reviewCount || 0,
      preclinical: animalCount || 0
    };
  } catch (e) {
    // Fallback to array length if count queries fail
    studyStats.total = allResearch.length;
  }

  // Get year distribution for publication trends chart
  // Paginate through all results since Supabase has a 1000 row limit
  let yearDistribution: Record<number, number> = {};
  try {
    let offset = 0;
    const pageSize = 1000;

    while (true) {
      const { data: yearData, error } = await supabase
        .from('kb_research_queue')
        .select('year')
        .eq('status', 'approved')
        .gte('year', 2000)
        .range(offset, offset + pageSize - 1);

      if (error || !yearData || yearData.length === 0) break;

      yearData.forEach((item: { year: number }) => {
        if (item.year) {
          yearDistribution[item.year] = (yearDistribution[item.year] || 0) + 1;
        }
      });

      if (yearData.length < pageSize) break;
      offset += pageSize;
    }
  } catch (e) {
    // Ignore errors
  }

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

      {/* Study Statistics - 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
        <Link
          href="/research"
          className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-4 rounded-xl text-center border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="text-2xl md:text-3xl font-bold text-slate-700">{studyStats.total}</div>
          <div className="text-xs md:text-sm text-slate-600 font-medium mt-1">Total Studies</div>
        </Link>
        <Link
          href="/research?subject=human"
          className="bg-gradient-to-br from-green-50 to-green-100 px-4 py-4 rounded-xl text-center border border-green-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-lg">👥</span>
            <span className="text-2xl md:text-3xl font-bold text-green-700">{studyStats.human}</span>
          </div>
          <div className="text-xs md:text-sm text-green-600 font-medium mt-1">Human Studies</div>
        </Link>
        <Link
          href="/research?subject=review"
          className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-4 rounded-xl text-center border border-blue-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-lg">📊</span>
            <span className="text-2xl md:text-3xl font-bold text-blue-700">{studyStats.reviews}</span>
          </div>
          <div className="text-xs md:text-sm text-blue-600 font-medium mt-1">Reviews</div>
        </Link>
        <Link
          href="/research?subject=animal"
          className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-4 rounded-xl text-center border border-purple-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-lg">🧪</span>
            <span className="text-2xl md:text-3xl font-bold text-purple-700">{studyStats.preclinical}</span>
          </div>
          <div className="text-xs md:text-sm text-purple-600 font-medium mt-1">Preclinical</div>
        </Link>
      </div>

      {/* Publication Trends Chart */}
      {Object.keys(yearDistribution).length > 0 && (() => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i);
        const maxCount = Math.max(...Object.values(yearDistribution), 1);
        const minYear = Math.min(...Object.keys(yearDistribution).map(Number));
        const maxYear = Math.max(...Object.keys(yearDistribution).map(Number));

        return (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Publication Trends ({minYear}–{maxYear})</h3>
              <span className="text-xs text-gray-500">{studyStats.total} studies indexed</span>
            </div>
            <div className="flex items-end gap-px h-20" aria-label="Research publications by year">
              {years.map(year => {
                const count = yearDistribution[year] || 0;
                const height = count > 0 ? Math.max((count / maxCount) * 100, 3) : 0;
                const isRecent = year >= currentYear - 2;

                return (
                  <div key={year} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t transition-colors ${
                        isRecent ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-400 hover:bg-blue-500'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${year}: ${count} studies`}
                    />
                    {year % 5 === 0 && (
                      <span className="text-[9px] text-gray-400 mt-1">{year}</span>
                    )}
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {year}: {count} studies
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              CBD research has grown significantly since 2000, with a surge following the 2018 Farm Bill
            </p>
          </div>
        );
      })()}

      {/* Research Interface */}
      <ResearchPageClient initialResearch={allResearch} />

      {/* FAQ Section - Focused on high-value SEO questions not covered in the accordion */}
      {(() => {
        const faqs = [
          {
            question: "Is CBD backed by scientific research?",
            answer: `Yes. We index ${studyStats.total.toLocaleString()} peer-reviewed studies from PubMed, ClinicalTrials.gov, and other authoritative medical databases. This includes ${studyStats.human.toLocaleString()} human clinical studies, ${studyStats.reviews.toLocaleString()} systematic reviews, and ${studyStats.preclinical.toLocaleString()} preclinical studies. Research quality varies—use our filters and quality scores to find the most robust evidence.`
          },
          {
            question: "Is CBD FDA approved?",
            answer: "CBD is not FDA-approved as a dietary supplement. However, Epidiolex (prescription CBD) is FDA-approved for seizures in Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex. This database includes the clinical trials supporting that approval, plus ongoing research into anxiety, pain, sleep, and other conditions."
          },
          {
            question: "What health conditions have CBD research?",
            answer: "The most-researched conditions include epilepsy (FDA-approved use), anxiety disorders, chronic pain, sleep problems, and inflammatory conditions. Use the condition filters above to explore studies for specific health topics, or browse our condition pages which summarise the available evidence."
          },
          {
            question: "Can I use this research to make health decisions?",
            answer: "This database is for educational purposes only. We aggregate and index published research—we do not conduct studies or provide medical advice. Individual studies have limitations and results vary. Always consult a qualified healthcare professional before using CBD, especially if you have health conditions or take medications."
          }
        ];

        return (
          <div className="mt-16 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <p className="text-center">
                Learn more about our{' '}
                <Link href="/research/methodology" className="text-green-600 hover:underline">scoring methodology</Link>
                {' '}or see the information panels above for details on quality scores, data sources, and how to use this database.
              </p>
              <p className="text-center mt-3 text-xs text-gray-400">
                All research indexed here is from third-party sources. We do not own or claim copyright over the original studies.
                Study abstracts and metadata are aggregated under fair use for educational purposes.
              </p>
            </div>
          </div>
        );
      })()}

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

      {/* FAQPage Schema for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Is CBD backed by scientific research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `Yes. This database indexes ${studyStats.total.toLocaleString()} peer-reviewed studies from PubMed, ClinicalTrials.gov, and other authoritative sources, including ${studyStats.human.toLocaleString()} human clinical studies and ${studyStats.reviews.toLocaleString()} systematic reviews.`
                }
              },
              {
                '@type': 'Question',
                name: 'Is CBD FDA approved?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'CBD is not FDA-approved as a dietary supplement. However, Epidiolex (prescription CBD) is FDA-approved for treating seizures in Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex.'
                }
              },
              {
                '@type': 'Question',
                name: 'What health conditions have CBD research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The most-researched conditions include epilepsy (FDA-approved use), anxiety disorders, chronic pain, sleep problems, and inflammatory conditions.'
                }
              },
              {
                '@type': 'Question',
                name: 'Can I use CBD research to make health decisions?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'This database is for educational purposes only. We aggregate published research but do not provide medical advice. Always consult a healthcare professional before using CBD.'
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}