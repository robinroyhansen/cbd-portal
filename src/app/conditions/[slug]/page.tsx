import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: condition } = await supabase
    .from('kb_conditions')
    .select('name, display_name, meta_title, meta_description, short_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!condition) {
    return { title: 'Condition Not Found | CBD Portal' };
  }

  return {
    title: condition.meta_title || `CBD for ${condition.display_name || condition.name} | CBD Portal`,
    description: condition.meta_description || condition.short_description,
    alternates: {
      canonical: `/conditions/${slug}`,
    },
  };
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  'mental-health': '🧠',
  'pain': '💪',
  'sleep': '🌙',
  'neurological': '⚡',
  'inflammation': '🔥',
  'skin': '✨',
  'digestive': '🌿',
  'cardiovascular': '❤️',
  'immune': '🛡️',
  'other': '🏥',
};

// Evidence strength based on research count
function getEvidenceStrength(count: number): { level: string; color: string; width: string; description: string } {
  if (count >= 100) return { level: 'Strong', color: 'emerald', width: '100%', description: 'Extensive research available' };
  if (count >= 50) return { level: 'Moderate', color: 'green', width: '75%', description: 'Good research foundation' };
  if (count >= 20) return { level: 'Emerging', color: 'lime', width: '50%', description: 'Growing body of evidence' };
  if (count >= 5) return { level: 'Limited', color: 'amber', width: '25%', description: 'Early-stage research' };
  return { level: 'Preliminary', color: 'gray', width: '10%', description: 'Very limited data' };
}

export default async function ConditionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: condition } = await supabase
    .from('kb_conditions')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!condition) notFound();

  const { data: research } = await supabase
    .from('kb_research_queue')
    .select('id, title, slug, year, study_type, study_subject, sample_size, quality_score, plain_summary')
    .eq('status', 'approved')
    .or(`primary_topic.eq.${slug},relevant_topics.cs.{${slug}}`)
    .order('quality_score', { ascending: false })
    .limit(8);

  // Get article count first
  const { count: totalArticleCount } = await supabase
    .from('kb_articles')
    .select('id', { count: 'exact', head: true })
    .or(`condition_slug.eq.${slug},title.ilike.%${condition.name}%`)
    .eq('status', 'published');

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, featured_image, published_at, reading_time')
    .or(`condition_slug.eq.${slug},title.ilike.%${condition.name}%`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12);

  let relatedConditions: Array<{ slug: string; name: string; display_name?: string; short_description?: string; research_count?: number; category?: string }> = [];
  if (condition.related_condition_slugs && condition.related_condition_slugs.length > 0) {
    const { data } = await supabase
      .from('kb_conditions')
      .select('slug, name, display_name, short_description, research_count, category')
      .in('slug', condition.related_condition_slugs)
      .eq('is_published', true);
    relatedConditions = data || [];
  }

  const evidence = getEvidenceStrength(condition.research_count || 0);
  const categoryIcon = CATEGORY_ICONS[condition.category] || CATEGORY_ICONS.other;

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Conditions', url: 'https://cbd-portal.vercel.app/conditions' },
    { name: condition.display_name || condition.name, url: `https://cbd-portal.vercel.app/conditions/${slug}` }
  ];

  // Calculate study type breakdown
  const studyTypes = research?.reduce((acc, study) => {
    const type = study.study_subject || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const humanStudies = (studyTypes['human'] || 0) + (studyTypes['review'] || 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600 rounded-full blur-3xl opacity-20" />
        </div>

        {/* Grain texture overlay */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Breadcrumbs items={breadcrumbs} />

          <div className="mt-8 grid lg:grid-cols-5 gap-12 items-start">
            {/* Main content */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{categoryIcon}</span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-emerald-200 text-sm font-medium border border-white/20">
                  {condition.category?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Health Condition'}
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                CBD &amp; {condition.display_name || condition.name}
              </h1>

              <p className="text-xl text-emerald-100/90 leading-relaxed max-w-2xl">
                {condition.short_description}
              </p>

              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-4 mt-8">
                {articles && articles.length > 0 && (
                  <a href="#articles" className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg shadow-black/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Read Articles
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{totalArticleCount || articles.length}</span>
                  </a>
                )}
                {condition.research_count && condition.research_count > 0 && (
                  <Link href={`/research/${slug}`} className="group inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Browse {condition.research_count} Studies
                  </Link>
                )}
              </div>
            </div>

            {/* Stats card */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-sm font-semibold text-emerald-200 uppercase tracking-wider mb-4">Research Overview</h3>

                {/* Research count */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold text-white font-serif">{condition.research_count || 0}</span>
                    <span className="text-emerald-200">studies</span>
                  </div>
                  <p className="text-emerald-300/80 text-sm">peer-reviewed research papers</p>
                </div>

                {/* Evidence strength meter */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-200">Evidence Strength</span>
                    <span className={`text-sm font-semibold text-${evidence.color}-400`}>{evidence.level}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${evidence.color}-400 to-${evidence.color}-500 rounded-full transition-all duration-1000`}
                      style={{ width: evidence.width }}
                    />
                  </div>
                  <p className="text-xs text-emerald-300/60 mt-1">{evidence.description}</p>
                </div>

                {/* Study breakdown */}
                {humanStudies > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <div className="text-2xl font-bold text-white">{humanStudies}</div>
                        <div className="text-xs text-emerald-300">Human Studies</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <div className="text-2xl font-bold text-white">{(studyTypes['animal'] || 0) + (studyTypes['in_vitro'] || 0)}</div>
                        <div className="text-xs text-emerald-300">Preclinical</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Article Content Section */}
          {condition.description && (
            <section className="mb-16">
              {/* Author Byline */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                  RK
                </div>
                <div>
                  <p className="font-semibold text-slate-900">By Robin Roy Krigslund-Hansen</p>
                  <p className="text-sm text-slate-500">
                    12+ years in CBD industry • Reviewed {condition.research_count || 0} studies for this article
                  </p>
                </div>
              </div>

              {/* Main Article Content */}
              <div className="condition-article">
                <div dangerouslySetInnerHTML={{ __html: condition.description }} />
              </div>
            </section>
          )}

          {/* Articles Section */}
          {articles && articles.length > 0 && (
            <section id="articles" className="mb-16 scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-900">
                    Articles &amp; Guides
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {totalArticleCount || articles.length} articles about CBD and {condition.display_name || condition.name}
                  </p>
                </div>
                {totalArticleCount && totalArticleCount > 12 && (
                  <Link
                    href={`/articles?q=${encodeURIComponent(condition.name)}`}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                  >
                    View all {totalArticleCount}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article: { id: string; title: string; slug: string; excerpt?: string; featured_image?: string; published_at?: string; reading_time?: number }, index: number) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                      {article.featured_image ? (
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-30">{categoryIcon}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-2 mb-2 transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {article.reading_time && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {article.reading_time} min
                          </span>
                        )}
                        {article.published_at && (
                          <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute bottom-5 right-5 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile CTA & View all link */}
              {totalArticleCount && totalArticleCount > 12 && (
                <Link
                  href={`/articles?q=${encodeURIComponent(condition.name)}`}
                  className="flex sm:hidden items-center justify-center gap-2 mt-6 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  View all {totalArticleCount} articles
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </section>
          )}

          {/* Research Section */}
          {research && research.length > 0 && (
            <section id="research" className="mb-16 scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-900">
                    Scientific Research
                  </h2>
                  <p className="text-slate-600 mt-1">Peer-reviewed studies on CBD and {condition.display_name || condition.name}</p>
                </div>
                <Link
                  href={`/research/${slug}`}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Browse all {condition.research_count || ''} studies
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-4">
                {research.map((study) => (
                  <Link
                    key={study.id}
                    href={`/research/study/${study.slug}`}
                    className="group block bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex">
                      {/* Quality score sidebar */}
                      {study.quality_score && (
                        <div className={`hidden sm:flex flex-col items-center justify-center w-20 py-6 ${
                          study.quality_score >= 70 ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                          study.quality_score >= 50 ? 'bg-gradient-to-b from-amber-500 to-amber-600' :
                          'bg-gradient-to-b from-slate-400 to-slate-500'
                        }`}>
                          <span className="text-2xl font-bold text-white">{study.quality_score}</span>
                          <span className="text-xs text-white/80 uppercase tracking-wide">Score</span>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 mb-2 transition-colors line-clamp-2">
                              {study.title}
                            </h3>
                            {study.plain_summary && (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                {study.plain_summary}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-slate-500 font-medium">{study.year}</span>
                              {study.study_type && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                  {study.study_type}
                                </span>
                              )}
                              {study.study_subject && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  study.study_subject === 'human' ? 'bg-blue-100 text-blue-700' :
                                  study.study_subject === 'review' ? 'bg-purple-100 text-purple-700' :
                                  study.study_subject === 'animal' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {study.study_subject}
                                </span>
                              )}
                              {study.sample_size && (
                                <span className="text-xs text-slate-500">n={study.sample_size}</span>
                              )}
                            </div>
                          </div>

                          {/* Mobile quality score */}
                          {study.quality_score && (
                            <div className="sm:hidden flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                study.quality_score >= 70 ? 'bg-emerald-500' :
                                study.quality_score >= 50 ? 'bg-amber-500' :
                                'bg-slate-400'
                              }`}>
                                {study.quality_score}
                              </div>
                            </div>
                          )}

                          {/* Arrow */}
                          <div className="hidden sm:flex items-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile CTA */}
              <Link
                href={`/research/${slug}`}
                className="sm:hidden flex items-center justify-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Browse all {condition.research_count || ''} studies
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </section>
          )}

          {/* Related Conditions */}
          {relatedConditions.length > 0 && (
            <section className="mb-16">
              <h2 className="font-serif text-3xl font-bold text-slate-900 mb-8">
                Related Conditions
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedConditions.map((related) => {
                  const relatedIcon = CATEGORY_ICONS[related.category || 'other'] || CATEGORY_ICONS.other;
                  return (
                    <Link
                      key={related.slug}
                      href={`/conditions/${related.slug}`}
                      className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
                    >
                      <span className="text-2xl mt-0.5">{relatedIcon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {related.display_name || related.name}
                        </h3>
                        {related.short_description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                            {related.short_description}
                          </p>
                        )}
                        {related.research_count && related.research_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            {related.research_count} studies
                          </span>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Navigation Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
            <Link
              href="/conditions"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Browse All Conditions
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Research Database
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Medical Disclaimer</h3>
                <p className="text-sm text-amber-800">
                  This information is for educational purposes only and is not intended as medical advice.
                  Always consult with a healthcare professional before using CBD, especially if you have a
                  medical condition or are taking medications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
