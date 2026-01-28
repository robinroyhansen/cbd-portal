import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { headers } from 'next/headers';
import { getArticleBySlug, getRelatedArticles } from '@/lib/articles';
import { getLanguageFromHostname } from '@/lib/language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getGlossaryTermsForLinking } from '@/lib/glossary';
import { AuthorBio, AuthorByline } from '@/components/AuthorBio';
import { Citations, CitationCount } from '@/components/Citations';
import { DateDisplay } from '@/components/DateDisplay';
import { ContentFreshnessIndicator } from '@/components/ContentFreshnessIndicator';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { FAQSchema } from '@/components/FAQSchema';
import { MedicalDisclaimerSchema } from '@/components/MedicalDisclaimerSchema';
import { ArticleActions } from '@/components/ArticleActions';
import { RelatedArticles } from '@/components/RelatedArticles';
import { YouMightAlsoLike } from '@/components/YouMightAlsoLike';
import { Comments } from '@/components/Comments';
import { TagList } from '@/components/TagList';
import { getArticleTags } from '@/lib/tags';
import { ArticleContent } from '@/components/ArticleContent';
import { ArticleTableOfContents } from '@/components/ArticleTableOfContents';
import { extractTOCFromMarkdown, buildNestedTOC, countWords } from '@/lib/utils/toc';
import { getHreflangAlternates } from '@/components/HreflangTags';

export const revalidate = 86400; // Revalidate every 24 hours

// Strip Medical/Veterinary disclaimers from content (we render a standardized one in the template)
function stripDisclaimers(content: string): string {
  // Remove disclaimers after --- separator with "Medical/Veterinary Disclaimer:" header
  let result = content.replace(
    /\n*-{3,}\n+\*{0,2}(?:Medical|Veterinary)\s*Disclaimer:?\*{0,2}:?[\s\S]*$/gi,
    ''
  );
  // Remove italic disclaimers after --- separator (e.g., *This article is for informational...*)
  result = result.replace(
    /\n*-{3,}\n+\*This (?:article|content) is for informational purposes only[\s\S]*$/gi,
    ''
  );
  // Remove inline disclaimers without separator
  result = result.replace(
    /\n+\*{0,2}(?:Medical|Veterinary)\s*Disclaimer:?\*{0,2}:?\s*This (?:article|content) is for informational purposes only[\s\S]*$/gi,
    ''
  );
  return result;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;

  // Get language from URL param, or fall back to hostname-based detection
  let language: LanguageCode = (langParam as LanguageCode) || 'en';
  if (!langParam) {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost';
    language = getLanguageFromHostname(host.split(':')[0]) as LanguageCode;
  }

  const { data: article } = await getArticleBySlug(slug, language);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${(article as any).title} | CBD Portal`,
    description: (article as any).excerpt,
    alternates: getHreflangAlternates(`/articles/${(article as any).slug}`),
    openGraph: {
      title: (article as any).title,
      description: (article as any).excerpt,
      url: `https://cbd-portal.vercel.app/articles/${(article as any).slug}`,
      type: 'article',
    },
  };
}

// Helper function to extract FAQ from article content
function extractFAQs(content: string): Array<{ question: string; answer: string }> | null {
  const faqs: Array<{ question: string; answer: string }> = [];

  // Look for FAQ sections with various headings
  const faqMatch = content.match(/##\s*(?:FAQ|Frequently Asked Questions|Common Questions|Questions & Answers)\s*\n\n([\s\S]*?)(?=\n---|\n\*Written by|\n##[^#]|$)/i);
  if (faqMatch) {
    const faqSection = faqMatch[1];
    const faqRegex = /### (.+?)\?\s*\n(.+?)(?=\n###|\n\n###|$)/gs;

    let match;
    while ((match = faqRegex.exec(faqSection)) !== null) {
      faqs.push({
        question: match[1].trim() + '?',
        answer: match[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim(),
      });
    }
  }

  // Also look for Q: and A: patterns
  const qaDirectPattern = /Q:\s*(.+?)\n\s*A:\s*([\s\S]*?)(?=\nQ:|$)/g;
  let qaMatch;
  while ((qaMatch = qaDirectPattern.exec(content)) !== null) {
    faqs.push({
      question: qaMatch[1].trim(),
      answer: qaMatch[2].trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
    });
  }

  return faqs.length > 0 ? faqs : null;
}

// Disabled static generation for now to avoid cookie issues at build time
// export async function generateStaticParams() {
//   const supabase = await createClient();
//
//   const { data } = await supabase
//     .from('kb_articles')
//     .select('slug')
//     .eq('status', 'published');
//
//   const articles = data as Pick<Article, 'slug'>[] | null;
//
//   return (articles || []).map((article) => ({
//     slug: article.slug,
//   }));
// }

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;

  // Get language from URL param, or fall back to hostname-based detection
  let language: LanguageCode = (langParam as LanguageCode) || 'en';
  if (!langParam) {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost';
    language = getLanguageFromHostname(host.split(':')[0]) as LanguageCode;
  }

  const { data } = await getArticleBySlug(slug, language);
  const article = data as any;

  if (!article) {
    notFound();
  }

  // Get related articles from same category
  const { data: relatedArticles } = article.category_id
    ? await getRelatedArticles(article.category_id, article.slug, language, 3)
    : { data: null };

  // Get article tags
  const tags = await getArticleTags(article.id);

  // Get glossary terms for auto-linking
  const glossaryTerms = await getGlossaryTermsForLinking();

  // Extract FAQs from content
  const faqs = extractFAQs(article.content);

  // Extract TOC from content (for articles 1000+ words with 3+ headers)
  const strippedContent = stripDisclaimers(article.content);
  const wordCount = countWords(strippedContent);
  const tocItems = extractTOCFromMarkdown(strippedContent);
  const nestedTOC = buildNestedTOC(tocItems);
  const showTOC = wordCount >= 1000 && tocItems.length >= 3;

  // Base URL for schemas
  const baseUrl = 'https://cbd-portal.vercel.app';

  // Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.meta_description,
    image: article.featured_image || `${baseUrl}/og-image.png`,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: 'Robin Roy Krigslund-Hansen',
      description: 'CBD Expert & Industry Veteran with over 12 years of hands-on experience in the CBD and cannabis industry. Has developed hundreds of CBD-based products sold to more than 100,000 customers across 60+ countries worldwide.',
      url: `${baseUrl}/about`,
      location: {
        '@type': 'Place',
        name: 'Switzerland'
      },
      knowsAbout: ['CBD', 'Cannabis', 'Cannabidiol', 'Hemp', 'Clinical Research', 'Regulatory Affairs']
    },
    publisher: {
      '@type': 'Organization',
      name: 'CBD Knowledge Base',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${slug}`,
    },
    articleBody: article.content,
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    disclaimer: 'This article is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional before starting any new supplement regimen, especially if you have existing health conditions or take medications.',
  };

  // FAQ Schema (if FAQs exist)
  const faqSchema = faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${baseUrl}/articles`,
      },
      ...(article.category ? [{
        '@type': 'ListItem',
        position: 3,
        name: article.category.name,
        item: `${baseUrl}/categories/${article.category.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: article.category ? 4 : 3,
        name: article.title,
        item: `${baseUrl}/articles/${slug}`,
      },
    ],
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Articles', url: 'https://cbd-portal.vercel.app/articles' },
    ...(article.category ? [{
      name: article.category.name,
      url: `https://cbd-portal.vercel.app/categories/${article.category.slug}`
    }] : []),
    { name: article.title, url: `https://cbd-portal.vercel.app/articles/${slug}` }
  ];

  return (
    <>
      {/* Schema markup */}
      <FAQSchema faqs={faqs} />
      <MedicalDisclaimerSchema articleTitle={article.title} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading progress */}
      <ReadingProgress />

      <div className={`mx-auto px-4 py-12 sm:px-6 lg:px-8 ${showTOC ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className={showTOC ? 'lg:grid lg:grid-cols-12 lg:gap-8' : ''}>
          {/* Main Article Content */}
          <article className={showTOC ? 'lg:col-span-8 xl:col-span-9' : ''}>
            {/* Enhanced Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Mobile TOC - shown at top for mobile users */}
            {showTOC && (
              <ArticleTableOfContents items={nestedTOC} variant="mobile" />
            )}

      {/* Header */}
      <header className="mb-12">
        {article.category && (
          <Link
            href={`/categories/${article.category.slug}`}
            className="text-sm font-medium uppercase tracking-wide text-primary-600"
          >
            {article.category.name}
          </Link>
        )}
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-xl text-gray-600">{article.excerpt}</p>
        )}
        <div className="mt-6 space-y-4">
          {/* Enhanced Author Byline */}
          <AuthorByline />

          {/* Publication and Update Dates */}
          <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <DateDisplay
                  publishedAt={article.published_at || article.created_at}
                  updatedAt={article.updated_at}
                />
                <ContentFreshnessIndicator
                  lastUpdated={article.updated_at}
                  variant="full"
                />
              </div>
              {article.citations && article.citations.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  This article references {article.citations.length} peer-reviewed {article.citations.length === 1 ? 'study' : 'studies'}
                </p>
              )}
            </div>
            <ArticleActions title={article.title} slug={article.slug} />
          </div>

          {/* Article Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {article.reading_time && (
              <span>{article.reading_time} min read</span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Topics</h3>
              <TagList tags={tags} size="md" />
            </div>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image && (
        <figure className="mb-12 relative aspect-[16/9]">
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="rounded-lg object-cover"
            priority
          />
        </figure>
      )}

      {/* Content with auto-linked glossary terms */}
      {/* Exclude glossary terms that match this article's subject (e.g., don't link "CBD Patches" on the CBD Patches article) */}
      <ArticleContent
        content={stripDisclaimers(article.content)}
        glossaryTerms={glossaryTerms}
        excludeSlugs={[slug.replace(/-guide$/, '')]}
        stripReferences={article.citations && article.citations.length > 0}
      />

      {/* Enhanced Citations Component */}
      <Citations
        citations={article.citations || []}
        topic={article.category?.slug === 'science' ? 'cannabinoids' : undefined}
      />

      {/* Related articles using topic relationships */}
      <RelatedArticles currentSlug={article.slug} />

      {/* You might also like */}
      <YouMightAlsoLike currentSlug={article.slug} categoryId={article.category?.id} />

      {/* Enhanced Author Bio Component */}
      <AuthorBio />

      {/* Disclaimer */}
      <aside className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-800">Medical Disclaimer</h3>
        <p className="mt-2 text-sm text-amber-700">
          This article is for informational purposes only and does not
          constitute medical advice. Always consult with a qualified healthcare
          professional before using CBD products or making changes to your
          health regimen.
        </p>
      </aside>

      {/* Last Updated Note */}
      <p className="text-xs text-gray-400 mt-6 text-center">
        {(() => {
          const locale = getLocaleSync(language as LanguageCode);
          const t = createTranslator(locale);
          const dateLocale = language === 'en' ? 'en-GB' : language;
          return `${t('common.lastReviewedAndUpdated')} ${new Date(article.updated_at).toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}`;
        })()}
      </p>

      {/* Comments */}
      <Comments articleId={article.id} />
          </article>

          {/* Desktop TOC Sidebar */}
          {showTOC && (
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <ArticleTableOfContents items={nestedTOC} variant="desktop" />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
