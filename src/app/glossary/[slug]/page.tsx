import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { LinkedDefinition } from '@/lib/glossary-definition-linker';
import { GlossaryViewTracker } from '@/components/GlossaryViewTracker';
import { formatDate } from '@/lib/locale';
import { getLanguage } from '@/lib/get-language';
import { getGlossaryTermWithTranslation, getRelatedGlossaryTermsWithTranslations } from '@/lib/translations';
import { getLocaleSync } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getHreflangAlternates } from '@/components/HreflangTags';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate static params for all glossary terms at build time
export async function generateStaticParams() {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: terms } = await supabase
    .from('kb_glossary')
    .select('slug');

  return (terms || []).map((term) => ({
    slug: term.slug,
  }));
}

interface FAQ {
  question: string;
  answer: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  cannabinoids: { label: 'Cannabinoids', icon: '🧬', color: 'green' },
  terpenes: { label: 'Terpenes', icon: '🌿', color: 'emerald' },
  products: { label: 'Products', icon: '📦', color: 'blue' },
  extraction: { label: 'Extraction', icon: '🔬', color: 'purple' },
  science: { label: 'Science & Biology', icon: '🧠', color: 'indigo' },
  research: { label: 'Research', icon: '📊', color: 'violet' },
  'side-effects': { label: 'Side Effects', icon: '⚠️', color: 'amber' },
  conditions: { label: 'Conditions', icon: '🩺', color: 'orange' },
  testing: { label: 'Testing & Quality', icon: '🧪', color: 'teal' },
  legal: { label: 'Legal & Compliance', icon: '⚖️', color: 'slate' },
  dosing: { label: 'Dosing', icon: '💊', color: 'cyan' },
  plant: { label: 'Plant & Cultivation', icon: '🌱', color: 'lime' }
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  cannabinoids: { bg: 'bg-green-100', text: 'text-green-700' },
  terpenes: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  products: { bg: 'bg-blue-100', text: 'text-blue-700' },
  extraction: { bg: 'bg-purple-100', text: 'text-purple-700' },
  science: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  research: { bg: 'bg-violet-100', text: 'text-violet-700' },
  'side-effects': { bg: 'bg-amber-100', text: 'text-amber-700' },
  conditions: { bg: 'bg-orange-100', text: 'text-orange-700' },
  testing: { bg: 'bg-teal-100', text: 'text-teal-700' },
  legal: { bg: 'bg-slate-100', text: 'text-slate-700' },
  dosing: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  plant: { bg: 'bg-lime-100', text: 'text-lime-700' }
};

// Cannabinoid slugs that should link to research
const CANNABINOID_SLUGS = ['cbd', 'thc', 'cbg', 'cbn', 'cbc', 'cbda', 'thca', 'cbdv', 'thcv', 'delta-8-thc'];

function formatMetaDescription(text: string): string {
  // Target 145-155 characters
  if (!text) return '';

  // Remove extra whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();

  if (cleaned.length >= 145 && cleaned.length <= 155) {
    return cleaned;
  }

  if (cleaned.length > 155) {
    // Truncate at word boundary
    cleaned = cleaned.substring(0, 152);
    const lastSpace = cleaned.lastIndexOf(' ');
    if (lastSpace > 120) {
      cleaned = cleaned.substring(0, lastSpace);
    }
    return cleaned + '...';
  }

  // If too short, return as-is (better than padding)
  return cleaned;
}

// Using formatDate from @/lib/locale for consistent international formatting

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLanguage();
  const locale = getLocaleSync(lang as LanguageCode);

  // Get term with translation applied
  const term = await getGlossaryTermWithTranslation(slug, lang as LanguageCode);

  if (!term) {
    return {
      title: `${locale.errors?.pageNotFound || 'Term Not Found'} | ${locale.meta?.siteName || 'CBD Portal'} ${locale.glossary?.title || 'Glossary'}`,
      description: 'This glossary term could not be found.',
    };
  }

  const displayTitle = term.display_name || term.term;
  const metaDescription = formatMetaDescription(term.short_definition);

  const canonicalUrl = `https://cbd-portal.vercel.app/glossary/${slug}`;
  const siteName = locale.meta?.siteName || 'CBD Portal';
  const langCode = lang === 'en' ? 'en_US' : lang;

  return {
    title: `${displayTitle} - ${locale.glossary?.title || 'CBD Glossary'} | ${siteName}`,
    description: metaDescription,
    alternates: getHreflangAlternates(`/glossary/${slug}`),
    openGraph: {
      title: `${displayTitle} - ${locale.glossary?.title || 'CBD Glossary'}`,
      description: metaDescription,
      type: 'article',
      url: canonicalUrl,
      siteName,
      locale: langCode,
    },
    twitter: {
      card: 'summary',
      title: `${displayTitle} - ${locale.glossary?.title || 'CBD Glossary'}`,
      description: metaDescription,
      site: '@cbdportal',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getLanguage();
  const locale = getLocaleSync(lang as LanguageCode);
  const supabase = await createClient();

  // Get term with translation applied
  const term = await getGlossaryTermWithTranslation(slug, lang as LanguageCode);

  if (!term) notFound();

  // Determine query flags early
  const isCannnabinoid = CANNABINOID_SLUGS.includes(slug) || term.category === 'cannabinoids';
  const isCondition = term.category === 'conditions';

  // Run independent queries in parallel for better performance
  const [
    authorResult,
    relatedTermsResult,
    categoryTermsResult,
    relatedArticlesResult,
    researchCountResult,
    allTermsResult
  ] = await Promise.all([
    // Fetch author if exists
    term.author_id
      ? supabase
          .from('kb_authors')
          .select('id, name, slug, title, avatar_url')
          .eq('id', term.author_id)
          .single()
      : Promise.resolve({ data: null }),

    // Get related terms with translations
    term.related_terms && term.related_terms.length > 0
      ? getRelatedGlossaryTermsWithTranslations(term.related_terms, lang as LanguageCode)
      : Promise.resolve([]),

    // Get category terms for fallback
    supabase
      .from('kb_glossary')
      .select('id, term, slug, category')
      .eq('category', term.category)
      .neq('slug', slug)
      .limit(6),

    // Get articles that reference this term
    supabase
      .from('kb_articles')
      .select('title, slug')
      .eq('status', 'published')
      .eq('language', 'en')
      .or(`content.ilike.%${term.term}%,title.ilike.%${term.term}%`)
      .limit(5),

    // Check for related research (only for cannabinoids/conditions)
    isCannnabinoid || isCondition
      ? supabase
          .from('kb_research_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .or(`title.ilike.%${term.term}%,abstract.ilike.%${term.term}%`)
      : Promise.resolve({ count: 0 }),

    // Fetch all glossary terms for auto-linking definitions
    supabase
      .from('kb_glossary')
      .select('term, display_name, slug, synonyms')
  ]);

  const author = authorResult.data;
  let relatedTerms = Array.isArray(relatedTermsResult) ? relatedTermsResult : [];
  const relatedArticles = relatedArticlesResult.data;
  const researchCount = researchCountResult.count || 0;
  const allTermsForLinking = allTermsResult.data || [];

  // Get more terms from same category if not enough related
  if (relatedTerms.length < 4 && categoryTermsResult.data && categoryTermsResult.data.length > 0) {
    const additionalSlugs = categoryTermsResult.data
      .filter((t: { slug: string }) => !relatedTerms.some((rt: { slug: string }) => rt.slug === t.slug))
      .slice(0, 6 - relatedTerms.length)
      .map((t: { slug: string }) => t.slug);

    if (additionalSlugs.length > 0) {
      const additionalTerms = await getRelatedGlossaryTermsWithTranslations(
        additionalSlugs,
        lang as LanguageCode
      );
      relatedTerms = [...relatedTerms, ...additionalTerms];
    }
  }

  // Check if this term should show dosage calculator link
  const DOSING_RELATED_SLUGS = ['bioavailability', 'titration', 'microdosing', 'sublingual', 'half-life', 'onset-time'];
  const showDosageCalculator = term.category === 'dosing' || DOSING_RELATED_SLUGS.includes(slug);

  const displayTitle = term.display_name || term.term;
  const categoryInfo = CATEGORY_INFO[term.category] || { label: term.category, icon: '📖', color: 'gray' };
  const categoryColors = CATEGORY_COLORS[term.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  const breadcrumbs = [
    { name: locale.common?.home || 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: locale.glossary?.title || 'Glossary', url: 'https://cbd-portal.vercel.app/glossary' },
    { name: displayTitle, url: `https://cbd-portal.vercel.app/glossary/${term.slug}` }
  ];

  // JSON-LD structured data for SEO - DefinedTerm
  const langCode = lang === 'en' ? 'en-US' : lang;
  const siteName = locale.meta?.siteName || 'CBD Portal';
  const definedTermSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `https://cbd-portal.vercel.app/glossary/${term.slug}`,
    name: displayTitle,
    description: term.definition,
    termCode: term.slug,
    inLanguage: langCode,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': 'https://cbd-portal.vercel.app/glossary',
      name: `${siteName} ${locale.glossary?.title || 'Glossary'}`,
      description: locale.glossary?.pageDescription || 'Comprehensive glossary of CBD and cannabis terminology'
    },
    ...(term.synonyms && term.synonyms.length > 0 && {
      alternateName: term.synonyms
    })
  };

  // FAQ Schema if FAQs exist
  const faqSchema = term.faq && term.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: term.faq.map((faq: FAQ) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  // Format definition paragraphs
  const definitionParagraphs = term.definition.split('\n\n').filter((p: string) => p.trim());

  // Research link
  const researchLink = isCannnabinoid
    ? `/research?q=${encodeURIComponent(term.term)}`
    : isCondition
      ? `/research?condition=${slug}`
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Track page view for popularity */}
      <GlossaryViewTracker slug={slug} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} variant="dark" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${categoryColors.bg} ${categoryColors.text}`}>
              <span>{categoryInfo.icon}</span>
              {categoryInfo.label}
            </span>
          </div>

          {/* Title & Pronunciation */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
          {term.pronunciation && (
            <p className="text-lg text-gray-500 mb-4 font-mono">
              /{term.pronunciation}/
            </p>
          )}

          {/* Author & Last Updated Attribution */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6">
            {author && (
              <div className="flex items-center gap-2">
                {author.avatar_url && (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>
                  Reviewed by{' '}
                  <Link
                    href={`/authors/${author.slug}`}
                    className="text-green-600 hover:text-green-700 hover:underline"
                  >
                    {author.name}
                  </Link>
                </span>
              </div>
            )}
            {term.updated_at && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {formatDate(term.updated_at)}
              </span>
            )}
          </div>

          {/* Short Definition Highlight */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8 rounded-r-lg">
            <p className="text-lg text-gray-800 font-medium">{term.short_definition}</p>
          </div>

          {/* Full Definition with Auto-Linked Terms */}
          <div className="prose prose-lg prose-green max-w-none mb-10">
            {definitionParagraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                <LinkedDefinition
                  definition={paragraph}
                  allTerms={allTermsForLinking}
                  currentSlug={slug}
                />
              </p>
            ))}
          </div>

          {/* Dosage Calculator CTA */}
          {showDosageCalculator && (
            <div className="mb-8 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Calculate Your CBD Dosage</h3>
                  <p className="text-sm text-gray-600">Get personalized dosage recommendations based on your needs.</p>
                </div>
                <Link
                  href="/tools/dosage-calculator"
                  className="flex-shrink-0 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm"
                >
                  Try Calculator →
                </Link>
              </div>
            </div>
          )}

          {/* View Research Link */}
          {researchLink && researchCount > 0 && (
            <div className="mb-8">
              <Link
                href={researchLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View {researchCount} {researchCount === 1 ? 'study' : 'studies'} →
              </Link>
            </div>
          )}

          {/* FAQ Section */}
          {term.faq && term.faq.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {term.faq.map((faq: FAQ, index: number) => (
                  <details
                    key={index}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <svg
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Synonyms */}
          {term.synonyms && term.synonyms.length > 0 && (
            <div className="mb-10 p-5 bg-white rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{locale.glossary?.seeAlso || 'Also Known As'}</h2>
              <div className="flex flex-wrap gap-2">
                {term.synonyms.map((synonym: string) => (
                  <span
                    key={synonym}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{locale.glossary?.relatedTerms || 'Related Terms'}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedTerms.map(related => {
                  const relatedColors = CATEGORY_COLORS[related.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                  const relatedInfo = CATEGORY_INFO[related.category] || { icon: '📖' };
                  return (
                    <Link
                      key={related.slug}
                      href={`/glossary/${related.slug}`}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-green-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {related.display_name || related.term}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${relatedColors.bg} ${relatedColors.text}`}>
                          {relatedInfo.icon}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{related.short_definition}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related Articles */}
          {relatedArticles && relatedArticles.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn More</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {relatedArticles.map(article => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-green-600 mr-3">→</span>
                    <span className="text-gray-700 group-hover:text-green-700 transition-colors">
                      {article.title}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Glossary */}
          <div className="pt-8 border-t border-gray-200">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {locale.common?.back || 'Back'} {locale.glossary?.title || 'Glossary'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Revalidate pages every hour (ISR)
export const revalidate = 3600;
