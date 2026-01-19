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

      {/* Research Interface */}
      <ResearchPageClient initialResearch={allResearch} />

      {/* FAQ Section */}
      {(() => {
        const faqs = [
          {
            question: "Is CBD backed by scientific research?",
            answer: `Yes. Our database contains ${studyStats.total} peer-reviewed studies on CBD and cannabinoids from authoritative sources including PubMed, PMC, ClinicalTrials.gov, and major medical journals. Of these, ${studyStats.human} are human clinical studies and ${studyStats.reviews} are systematic reviews or meta-analyses. While research is ongoing and results vary by condition, CBD is one of the most studied cannabinoids.`
          },
          {
            question: "Where does this research data come from?",
            answer: "We aggregate research from 7 authoritative sources: PubMed (NIH's database of 33M+ biomedical articles), PubMed Central (full-text research), ClinicalTrials.gov (clinical trial registry), OpenAlex (250M+ scholarly works), Europe PMC (European biomedical literature), Semantic Scholar (AI-powered research discovery), and bioRxiv/medRxiv (preprints). Each study is verified and scored for quality before inclusion."
          },
          {
            question: "What is the quality score and how is it calculated?",
            answer: "Our quality score (0-100) evaluates research methodology and reliability. Factors include: study design (meta-analyses and randomized controlled trials score highest), sample size, peer-review status, journal reputation, and methodology rigour (double-blind, placebo-controlled). Higher scores indicate more robust evidence. Use the filters to focus on high-quality studies."
          },
          {
            question: "What's the difference between human studies, reviews, and preclinical research?",
            answer: `Human studies (${studyStats.human} in our database) test CBD directly in people through clinical trials or observational studies - these provide the most relevant evidence for humans. Reviews (${studyStats.reviews}) are systematic analyses that synthesise findings from multiple studies, offering broader conclusions. Preclinical research (${studyStats.preclinical}) includes animal studies and lab experiments that help understand mechanisms but may not translate directly to humans.`
          },
          {
            question: "Is CBD FDA approved?",
            answer: "CBD itself is not FDA-approved as a general supplement. However, Epidiolex (pharmaceutical-grade CBD) is FDA-approved for treating seizures associated with Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex. Our database includes the clinical trials that led to this approval, plus ongoing research into other potential applications."
          },
          {
            question: "What conditions have the most CBD research?",
            answer: "The most-studied conditions include epilepsy and seizure disorders (where CBD has FDA approval), anxiety and stress, chronic pain, sleep disorders, and inflammation. Use our condition filters to explore research for specific health topics. Each condition page shows how many studies are available and their quality ratings."
          },
          {
            question: "How often is the research database updated?",
            answer: `Our research scanner continuously monitors scientific databases for new CBD and cannabinoid studies. New research is reviewed for quality and relevance before being added to the database.${lastUpdated ? ` The database was last updated on ${lastUpdated}.` : ''} We currently track ${studyStats.total} approved studies with more added regularly.`
          },
          {
            question: "Can I use this research to make health decisions?",
            answer: "This database is for educational and informational purposes only. While we provide access to peer-reviewed scientific literature, research findings don't constitute medical advice. Individual studies may have limitations, and results may not apply to everyone. Always consult a qualified healthcare professional before using CBD, especially if you have a medical condition or take medications."
          }
        ];

        return (
          <div className="mt-16 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-amber-500">❓</span>
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
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Have more questions? Read our{' '}
                <Link href="/research/methodology" className="text-green-600 hover:underline">research methodology</Link>
                {' '}or{' '}
                <Link href="/contact" className="text-green-600 hover:underline">contact us</Link>.
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
                  text: `Yes. Our database contains ${studyStats.total} peer-reviewed studies on CBD and cannabinoids from authoritative sources including PubMed, PMC, ClinicalTrials.gov, and major medical journals. Of these, ${studyStats.human} are human clinical studies and ${studyStats.reviews} are systematic reviews or meta-analyses.`
                }
              },
              {
                '@type': 'Question',
                name: 'Where does CBD research data come from?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'We aggregate research from 7 authoritative sources: PubMed (NIH\'s database of 33M+ biomedical articles), PubMed Central, ClinicalTrials.gov, OpenAlex, Europe PMC, Semantic Scholar, and bioRxiv/medRxiv. Each study is verified and scored for quality.'
                }
              },
              {
                '@type': 'Question',
                name: 'Is CBD FDA approved?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'CBD itself is not FDA-approved as a general supplement. However, Epidiolex (pharmaceutical-grade CBD) is FDA-approved for treating seizures associated with Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex.'
                }
              },
              {
                '@type': 'Question',
                name: 'What is the difference between human studies and preclinical research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `Human studies (${studyStats.human} in our database) test CBD directly in people through clinical trials. Preclinical research (${studyStats.preclinical}) includes animal studies and lab experiments that help understand mechanisms but may not translate directly to humans.`
                }
              },
              {
                '@type': 'Question',
                name: 'What conditions have the most CBD research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The most-studied conditions include epilepsy and seizure disorders (where CBD has FDA approval), anxiety and stress, chronic pain, sleep disorders, and inflammation.'
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}