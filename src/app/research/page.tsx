import { Metadata } from 'next';
import { headers } from 'next/headers';
import { createClient } from '../../lib/supabase/server';
import { ResearchPageClient, CONDITIONS, ConditionKey } from '../../components/ResearchPageClient';
import Link from 'next/link';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguageFromHostname } from '@/lib/language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const hreflang = getHreflangAlternates('/research');
  return {
    title: 'CBD Research Database | Evidence-Based Studies | CBD Portal',
    description: 'Browse 200+ peer-reviewed CBD and cannabis research studies. Filter by condition (anxiety, pain, sleep, epilepsy), study type, and quality score. Features schema.org structured data.',
    alternates: {
      canonical: '/research',
      languages: hreflang.languages,
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
}

export const revalidate = 3600; // Revalidate every 1 hour

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

export default async function ResearchPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Get language from URL param, or fall back to hostname-based detection
  let lang: LanguageCode = (params.lang as LanguageCode) || 'en';
  if (!params.lang) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    lang = getLanguageFromHostname(host.split(':')[0]) as LanguageCode;
  }

  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

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
      lastUpdated = new Date(latestStudy.reviewed_at).toLocaleDateString('en-GB', {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            {t('researchPage.updatedRegularly')}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t('researchPage.title')}
            <span className="block text-blue-200">{t('researchPage.titleHighlight')}</span>
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
            {t('researchPage.subtitle')}
            {' '}{studyStats.total.toLocaleString()} {t('researchPage.peerReviewedStudies')}.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl">
            <Link
              href="/research"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {studyStats.total.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200 font-medium">{t('researchPage.totalStudies')}</div>
              <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-blue-300 to-purple-300 rounded-full" />
              </div>
            </Link>

            <Link
              href="/research?subject=human"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">👤</span>
                <span className="text-3xl md:text-4xl font-bold text-white">{studyStats.human.toLocaleString()}</span>
              </div>
              <div className="text-sm text-blue-200 font-medium">{t('researchPage.humanStudies')}</div>
              <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-300 to-emerald-300 rounded-full" style={{ width: `${(studyStats.human / studyStats.total) * 100}%` }} />
              </div>
            </Link>

            <Link
              href="/research?subject=review"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📚</span>
                <span className="text-3xl md:text-4xl font-bold text-white">{studyStats.reviews.toLocaleString()}</span>
              </div>
              <div className="text-sm text-blue-200 font-medium">{t('researchPage.systematicReviews')}</div>
              <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full" style={{ width: `${(studyStats.reviews / studyStats.total) * 100}%` }} />
              </div>
            </Link>

            <Link
              href="/research?subject=animal"
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🧪</span>
                <span className="text-3xl md:text-4xl font-bold text-white">{studyStats.preclinical.toLocaleString()}</span>
              </div>
              <div className="text-sm text-blue-200 font-medium">{t('researchPage.preclinicalStudies')}</div>
              <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-300 to-pink-300 rounded-full" style={{ width: `${(studyStats.preclinical / studyStats.total) * 100}%` }} />
              </div>
            </Link>
          </div>

          {lastUpdated && (
            <p className="text-sm text-blue-200 mt-8">
              {t('researchPage.lastUpdated')}: {lastUpdated}
            </p>
          )}
        </div>
      </section>

      {/* Data Sources Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-6 gap-y-2 text-xs md:text-sm text-gray-500">
            <span className="font-medium text-gray-700 w-full text-center sm:w-auto">{t('researchPage.dataFrom')}:</span>
            <span className="flex items-center gap-1">
              <span className="text-base md:text-lg">🔬</span> PubMed
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base md:text-lg">🏥</span> ClinicalTrials.gov
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base md:text-lg">📚</span> Cochrane
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="text-base md:text-lg">🇪🇺</span> Europe PMC
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="text-base md:text-lg">🎓</span> Semantic Scholar
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Publication Trends Chart */}
      {Object.keys(yearDistribution).length > 0 && (() => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i);
        const maxCount = Math.max(...Object.values(yearDistribution), 1);
        const minYear = Math.min(...Object.keys(yearDistribution).map(Number));
        const maxYear = Math.max(...Object.keys(yearDistribution).map(Number));

        // On mobile, show fewer years (last 15 years)
        const mobileYears = years.filter(y => y >= 2010);

        return (
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">{t('researchPage.publicationTrends')}</h3>
                <p className="text-xs md:text-sm text-gray-500">{minYear} – {maxYear}</p>
              </div>
              <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"></span>
                  <span className="text-gray-600">{t('researchPage.historical')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"></span>
                  <span className="text-gray-600">{t('researchPage.recent')}</span>
                </span>
              </div>
            </div>
            {/* Chart bars - Desktop version (all years) */}
            <div className="hidden md:flex items-end gap-0.5" style={{ height: '120px' }} aria-label="Research publications by year">
              {years.map(year => {
                const count = yearDistribution[year] || 0;
                const heightPx = count > 0 ? Math.max(Math.round((count / maxCount) * 120), 4) : 0;
                const isRecent = year >= currentYear - 2;

                return (
                  <div
                    key={year}
                    className="flex-1 group relative"
                    title={`${year}: ${count} studies`}
                  >
                    <div
                      className={`w-full rounded-t-sm transition-all duration-200 ${
                        isRecent
                          ? 'bg-gradient-to-t from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500'
                          : 'bg-gradient-to-t from-blue-500 to-indigo-400 hover:from-blue-600 hover:to-indigo-500'
                      }`}
                      style={{ height: `${heightPx}px` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10">
                      <div className="font-bold">{year}</div>
                      <div>{count} studies</div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Chart bars - Mobile version (last 15 years only) */}
            <div className="flex md:hidden items-end gap-0.5" style={{ height: '80px' }} aria-label="Research publications by year (2010-present)">
              {mobileYears.map(year => {
                const count = yearDistribution[year] || 0;
                const heightPx = count > 0 ? Math.max(Math.round((count / maxCount) * 80), 3) : 0;
                const isRecent = year >= currentYear - 2;

                return (
                  <div
                    key={year}
                    className="flex-1 group relative"
                    title={`${year}: ${count} studies`}
                  >
                    <div
                      className={`w-full rounded-t-sm ${
                        isRecent
                          ? 'bg-gradient-to-t from-emerald-500 to-green-400'
                          : 'bg-gradient-to-t from-blue-500 to-indigo-400'
                      }`}
                      style={{ height: `${heightPx}px` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Year labels - Desktop */}
            <div className="hidden md:flex gap-0.5 mt-2 border-t border-gray-100 pt-2">
              {years.map(year => (
                <div key={year} className="flex-1 text-center">
                  {year % 5 === 0 && (
                    <span className="text-xs text-gray-400 font-medium">{year}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Year labels - Mobile */}
            <div className="flex md:hidden gap-0.5 mt-2 border-t border-gray-100 pt-2">
              {mobileYears.map(year => (
                <div key={year} className="flex-1 text-center">
                  {year % 5 === 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">{year}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-blue-50 rounded-lg">
              <p className="text-xs md:text-sm text-blue-700 text-center">
                {t('researchPage.researchAccelerating')}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Research Interface */}
      <ResearchPageClient initialResearch={allResearch} />

      {/* FAQ Section */}
      {(() => {
        const faqs = [
          {
            question: "Is CBD backed by scientific research?",
            answer: `Yes. We index ${studyStats.total.toLocaleString()} peer-reviewed studies from PubMed, ClinicalTrials.gov, and other authoritative medical databases. This includes ${studyStats.human.toLocaleString()} human clinical studies, ${studyStats.reviews.toLocaleString()} systematic reviews, and ${studyStats.preclinical.toLocaleString()} preclinical studies. Research quality varies—use our filters and quality scores to find the most robust evidence.`,
            icon: "📊"
          },
          {
            question: "Is CBD medically approved?",
            answer: "Most CBD products are sold as food supplements, not approved medicines. However, Epidiolex (prescription CBD) is approved in multiple countries (EU, UK, USA, Australia, and others) for treating seizures in Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex. This database includes clinical trials supporting that approval, plus ongoing research into anxiety, pain, sleep, and other conditions.",
            icon: "💊"
          },
          {
            question: "What health conditions have CBD research?",
            answer: "The most-researched conditions include epilepsy (approved prescription use), anxiety disorders, chronic pain, sleep problems, and inflammatory conditions. Use the condition filters above to explore studies for specific health topics, or browse our condition pages which summarise the available evidence.",
            icon: "🩺"
          },
          {
            question: "Can I use this research to make health decisions?",
            answer: "This database is for educational purposes only. We aggregate and index published research—we do not conduct studies or provide medical advice. Individual studies have limitations and results vary. Always consult a qualified healthcare professional before using CBD, especially if you have health conditions or take medications.",
            icon: "⚕️"
          }
        ];

        return (
          <section className="mt-12 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQ
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {t('researchPage.faqTitle')}
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                {t('researchPage.faqSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl border border-gray-200 p-4 md:p-6 hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="text-xl md:text-2xl p-1.5 md:p-2 bg-indigo-50 rounded-lg md:rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                      {faq.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1.5 md:mb-2 group-hover:text-indigo-700 transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Methodology CTA */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white text-center">
                <h3 className="text-xl font-bold mb-2">{t('researchPage.qualityScoresTitle')}</h3>
                <p className="text-indigo-100 mb-4">
                  {t('researchPage.qualityScoresDesc')}
                </p>
                <Link
                  href="/research/methodology"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
                >
                  {t('researchPage.viewMethodology')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center text-sm text-gray-500 max-w-2xl mx-auto">
              <p>
                {t('researchPage.disclaimer')}
              </p>
            </div>
          </section>
        );
      })()}
      </div>

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
                name: 'Is CBD medically approved?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Most CBD products are sold as supplements, not approved medicines. However, Epidiolex (prescription CBD) is approved in multiple countries for treating seizures in Lennox-Gastaut syndrome, Dravet syndrome, and tuberous sclerosis complex.'
                }
              },
              {
                '@type': 'Question',
                name: 'What health conditions have CBD research?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'The most-researched conditions include epilepsy (approved prescription use), anxiety disorders, chronic pain, sleep problems, and inflammatory conditions.'
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