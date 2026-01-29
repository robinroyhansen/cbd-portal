import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { MedicalDisclaimerSchema } from '@/components/MedicalDisclaimerSchema';
import {
  getTopicBySlug,
  TOPICS,
  type TopicDetail,
  type TopicStats,
  type RelatedStudy,
  type RelatedCondition,
  type RelatedGlossaryTerm,
  type RelatedArticle,
} from '@/lib/topics';
import { getLocalizedSlug } from '@/lib/utils/locale-href';
import { getLanguage } from '@/lib/get-language';
import { createClient } from '@/lib/supabase/server';
import type { LanguageCode } from '@/lib/translation-service';

export const revalidate = 3600; // Revalidate every 1 hour

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    return {
      title: 'Topic Not Found | CBD Portal',
    };
  }

  return {
    title: `${topic.name} - CBD Research & Studies | CBD Portal`,
    description: `${topic.description} Browse ${topic.studyCount} research studies, ${topic.articleCount} articles, and expert insights on CBD for ${topic.name.toLowerCase()}.`,
    alternates: {
      canonical: `/topics/${slug}`,
    },
    openGraph: {
      title: `${topic.name} - CBD Research | CBD Portal`,
      description: topic.description,
      type: 'website',
      url: `/topics/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  return TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

// Color mapping
const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; light: string }> = {
  purple: { bg: 'bg-purple-600', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', light: 'bg-purple-50' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', light: 'bg-blue-50' },
  indigo: { bg: 'bg-indigo-600', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', light: 'bg-indigo-50' },
  slate: { bg: 'bg-slate-600', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700', light: 'bg-slate-50' },
  green: { bg: 'bg-green-600', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', light: 'bg-green-50' },
  orange: { bg: 'bg-orange-600', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', light: 'bg-orange-50' },
  red: { bg: 'bg-red-600', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', light: 'bg-red-50' },
  amber: { bg: 'bg-amber-600', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', light: 'bg-amber-50' },
  fuchsia: { bg: 'bg-fuchsia-600', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100 text-fuchsia-700', light: 'bg-fuchsia-50' },
  yellow: { bg: 'bg-yellow-600', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', light: 'bg-yellow-50' },
  teal: { bg: 'bg-teal-600', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', light: 'bg-teal-50' },
  gray: { bg: 'bg-gray-600', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', light: 'bg-gray-50' },
  cyan: { bg: 'bg-cyan-600', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700', light: 'bg-cyan-50' },
  pink: { bg: 'bg-pink-600', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700', light: 'bg-pink-50' },
  rose: { bg: 'bg-rose-600', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', light: 'bg-rose-50' },
  sky: { bg: 'bg-sky-600', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700', light: 'bg-sky-50' },
  emerald: { bg: 'bg-emerald-600', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', light: 'bg-emerald-50' },
};

function StatsOverview({ stats, colors }: { stats: TopicStats; colors: typeof colorClasses.gray }) {
  const statItems = [
    { label: 'Total Studies', value: stats.totalStudies.toLocaleString(), icon: 'document' },
    { label: 'Human Studies', value: `${stats.humanStudiesPercent}%`, icon: 'user' },
    { label: 'Reviews', value: `${stats.reviewsPercent}%`, icon: 'clipboard' },
    { label: 'High Quality', value: stats.highQualityCount.toString(), icon: 'star' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className={`${colors.light} rounded-xl p-4 text-center`}>
          <div className={`text-2xl font-bold ${colors.text}`}>{item.value}</div>
          <div className="text-sm text-gray-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function StudyCard({ study }: { study: RelatedStudy }) {
  const getSubjectBadge = (subject: string | null) => {
    switch (subject) {
      case 'human': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Human' };
      case 'review': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Review' };
      case 'animal': return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Animal' };
      case 'in_vitro': return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Vitro' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Study' };
    }
  };

  const badge = getSubjectBadge(study.study_subject);

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text} shrink-0`}>
          {badge.label}
        </span>
        <div className="flex-1 min-w-0">
          {study.slug ? (
            <Link href={`/research/study/${study.slug}`} className="font-medium text-gray-900 hover:text-green-600 line-clamp-2">
              {study.title}
            </Link>
          ) : (
            <span className="font-medium text-gray-900 line-clamp-2">{study.title}</span>
          )}
          {study.plain_summary && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{study.plain_summary}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {study.year && <span>{study.year}</span>}
            {study.quality_score && (
              <span className={`px-1.5 py-0.5 rounded ${study.quality_score >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                Quality: {study.quality_score}
              </span>
            )}
            {study.doi && (
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                DOI
              </a>
            )}
            {study.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                PubMed
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionCard({ condition, translatedSlug }: { condition: RelatedCondition; translatedSlug?: string }) {
  return (
    <Link
      href={`/conditions/${getLocalizedSlug({ slug: condition.slug, translated_slug: translatedSlug })}`}
      className="block border rounded-lg p-4 bg-white hover:shadow-md hover:border-green-300 transition-all"
    >
      <h4 className="font-semibold text-gray-900">{condition.display_name || condition.name}</h4>
      {condition.short_description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{condition.short_description}</p>
      )}
      <div className="mt-2 text-xs text-gray-500">
        {condition.research_count} {condition.research_count === 1 ? 'study' : 'studies'}
      </div>
    </Link>
  );
}

function GlossaryTermCard({ term, translatedSlug }: { term: RelatedGlossaryTerm; translatedSlug?: string }) {
  return (
    <Link
      href={`/glossary/${getLocalizedSlug({ slug: term.slug, translated_slug: translatedSlug })}`}
      className="block border rounded-lg p-3 bg-white hover:shadow-md hover:border-green-300 transition-all"
    >
      <h4 className="font-medium text-gray-900">{term.term}</h4>
      {term.short_definition && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{term.short_definition}</p>
      )}
    </Link>
  );
}

function ArticleCard({ article }: { article: RelatedArticle }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block border rounded-lg p-4 bg-white hover:shadow-md hover:border-green-300 transition-all"
    >
      <h4 className="font-semibold text-gray-900 line-clamp-2">{article.title}</h4>
      {article.excerpt && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        {article.reading_time_minutes && (
          <span>{article.reading_time_minutes} min read</span>
        )}
        {article.published_at && (
          <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        )}
      </div>
    </Link>
  );
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const colors = colorClasses[topic.color] || colorClasses.gray;

  // Fetch translated slugs for conditions and glossary terms (non-English)
  let conditionSlugMap = new Map<string, string>();
  let glossarySlugMap = new Map<string, string>();
  if (lang !== 'en') {
    const supabase = await createClient();

    // Fetch condition translated slugs
    if (topic.relatedConditions.length > 0) {
      const conditionIds = topic.relatedConditions.map((c) => c.id);
      const { data: condSlugTranslations } = await supabase
        .from('condition_translations')
        .select('condition_id, slug')
        .eq('language', lang)
        .in('condition_id', conditionIds);
      conditionSlugMap = new Map(
        (condSlugTranslations || []).map((t: { condition_id: string; slug: string }) => [t.condition_id, t.slug])
      );
    }

    // Fetch glossary translated slugs
    if (topic.glossaryTerms.length > 0) {
      const glossaryIds = topic.glossaryTerms.map((g) => g.id);
      const { data: glossSlugTranslations } = await supabase
        .from('glossary_translations')
        .select('term_id, slug')
        .eq('language', lang)
        .in('term_id', glossaryIds);
      glossarySlugMap = new Map(
        (glossSlugTranslations || []).map((t: { term_id: string; slug: string }) => [t.term_id, t.slug])
      );
    }
  }

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Topics', url: 'https://cbd-portal.vercel.app/topics' },
    { name: topic.name, url: `https://cbd-portal.vercel.app/topics/${slug}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <MedicalDisclaimerSchema />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <div className={`${colors.light} rounded-2xl p-8 mb-10`}>
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 ${colors.badge} rounded-full text-sm font-medium`}>
            {topic.category}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{topic.name}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mb-6">
          {topic.description}
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">{topic.studyCount}</span>
            <span className="text-gray-500">Research Studies</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="font-medium">{topic.articleCount}</span>
            <span className="text-gray-500">Articles</span>
          </div>
          {topic.stats.latestStudyYear && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500">Latest study: {topic.stats.latestStudyYear}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {topic.stats.totalStudies > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Research Overview</h2>
          <StatsOverview stats={topic.stats} colors={colors} />

          {/* Research Type Breakdown */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-3">Study Types</h3>
              <div className="space-y-2">
                {topic.stats.humanStudiesPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${topic.stats.humanStudiesPercent}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-20">Human {topic.stats.humanStudiesPercent}%</span>
                  </div>
                )}
                {topic.stats.reviewsPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${topic.stats.reviewsPercent}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-20">Reviews {topic.stats.reviewsPercent}%</span>
                  </div>
                )}
                {topic.stats.animalStudiesPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${topic.stats.animalStudiesPercent}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-20">Animal {topic.stats.animalStudiesPercent}%</span>
                  </div>
                )}
                {topic.stats.inVitroPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${topic.stats.inVitroPercent}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-20">In Vitro {topic.stats.inVitroPercent}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold mb-3">Quality Assessment</h3>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${colors.text}`}>
                  {topic.stats.averageQualityScore}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Average Quality Score</div>
                  <div className="text-xs text-gray-400">(out of 100)</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {topic.stats.highQualityCount} studies scored 70+ (high quality)
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Related Conditions */}
      {topic.relatedConditions.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Conditions</h2>
            <Link href="/conditions" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View all conditions
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.relatedConditions.slice(0, 6).map((condition) => (
              <ConditionCard key={condition.id} condition={condition} translatedSlug={conditionSlugMap.get(condition.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Research Studies */}
      {topic.studies.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Research Studies</h2>
            <Link href="/research" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Browse all research
            </Link>
          </div>
          <div className="space-y-3">
            {topic.studies.slice(0, 10).map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
          {topic.studies.length > 10 && (
            <div className="mt-4 text-center">
              <Link
                href={`/research?topic=${slug}`}
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                View all {topic.studyCount} studies
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Glossary Terms */}
      {topic.glossaryTerms.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Terms</h2>
            <Link href="/glossary" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View glossary
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topic.glossaryTerms.slice(0, 9).map((term) => (
              <GlossaryTermCard key={term.id} term={term} translatedSlug={glossarySlugMap.get(term.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      {topic.articles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Articles</h2>
            <Link href="/articles" className="text-green-600 hover:text-green-700 text-sm font-medium">
              View all articles
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topic.articles.slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Medical Disclaimer */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-semibold text-amber-800 mb-2">Medical Disclaimer</h3>
            <p className="text-sm text-amber-700">
              The information on this page is for educational purposes only and is not intended as medical advice.
              CBD research is ongoing, and results may vary. Always consult with a qualified healthcare provider
              before starting any new supplement regimen, especially if you have existing health conditions or
              take medications.
            </p>
          </div>
        </div>
      </section>

      {/* Back to Topics */}
      <div className="border-t pt-8">
        <Link href="/topics" className="text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all topics
        </Link>
      </div>
    </div>
  );
}
