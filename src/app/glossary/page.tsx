import { Metadata } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { GlossaryClient } from './GlossaryClient';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getGlossaryTermsWithTranslations, getPopularGlossaryTermsWithTranslations } from '@/lib/translations';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguageFromHostname } from '@/lib/language';

// Force dynamic rendering to support language switching via ?lang= parameter
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ lang?: string; category?: string; q?: string; letter?: string }>;
}

// Category keys - labels are fetched from translations
const CATEGORY_KEYS = [
  'cannabinoids', 'terpenes', 'products', 'extraction', 'science',
  'research', 'side-effects', 'conditions', 'testing', 'legal', 'dosing', 'plant'
];

const CATEGORY_ICONS: Record<string, string> = {
  cannabinoids: '🧬',
  terpenes: '🌿',
  products: '📦',
  extraction: '🔬',
  science: '🧠',
  research: '📊',
  'side-effects': '⚠️',
  conditions: '🩺',
  testing: '🧪',
  legal: '⚖️',
  dosing: '💊',
  plant: '🌱',
};

const SITE_URL = 'https://cbd-portal.vercel.app';

interface GlossaryTerm {
  id: string;
  term: string;
  display_name?: string | null;
  slug: string;
  definition: string;
  simple_definition: string | null;
  category: string;
  synonyms: string[] | null;
  pronunciation?: string | null;
}

interface CategoryCount {
  category: string;
  count: number;
}

// Dynamic SEO Metadata based on language
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  let lang: LanguageCode = (params.lang as LanguageCode) || 'en';
  if (!params.lang) {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost';
    lang = getLanguageFromHostname(host.split(':')[0]) as LanguageCode;
  }

  const locale = getLocaleSync(lang);

  return {
    title: locale.glossary?.pageTitle || 'CBD & Cannabis Glossary | 250+ Terms Explained | CBD Portal',
    description: locale.glossary?.pageDescription || 'Comprehensive glossary of CBD and cannabis terms. Learn about cannabinoids, terpenes, extraction methods, dosing, and more.',
    keywords: ['CBD glossary', 'cannabis terminology', 'cannabinoid definitions', 'CBD terms', 'hemp glossary'],
    alternates: getHreflangAlternates('/glossary'),
    openGraph: {
      title: locale.glossary?.title || 'CBD & Cannabis Glossary',
      description: locale.glossary?.pageDescription || 'Comprehensive glossary of CBD and cannabis terminology.',
      type: 'website',
      url: `${SITE_URL}/glossary`,
      siteName: locale.meta?.siteName || 'CBD Portal',
      locale: lang === 'en' ? 'en_US' : lang,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GlossaryPage({ searchParams }: PageProps) {
  const supabase = await createClient();
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

  // Build translated categories
  const CATEGORIES = CATEGORY_KEYS.map(key => ({
    key,
    label: t(`glossaryCategories.${key}`) || key,
    icon: CATEGORY_ICONS[key] || '📋',
    description: t(`glossaryCategories.${key}_desc`) || '',
  }));

  // Fetch all terms with translations applied
  const translatedTerms = await getGlossaryTermsWithTranslations(lang as LanguageCode);

  // Map to the expected format
  const allTerms: GlossaryTerm[] = translatedTerms.map(t => ({
    id: t.id,
    term: t.term,
    display_name: t.term, // Use translated term as display name
    slug: t.slug,
    definition: t.definition,
    simple_definition: t.simple_definition,
    category: t.category,
    synonyms: t.synonyms,
    pronunciation: t.pronunciation,
  }));

  const totalTerms = allTerms.length;

  // Get category counts (categories don't change with language)
  const { data: countData } = await supabase
    .from('kb_glossary')
    .select('category');

  const categoryCounts: Record<string, number> = {};
  countData?.forEach((item: { category: string }) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  // Fetch top 15 most viewed terms with translations
  const popularTranslated = await getPopularGlossaryTermsWithTranslations(lang as LanguageCode, 15);
  const popularTerms: GlossaryTerm[] = popularTranslated.map(t => ({
    id: t.id,
    term: t.term,
    display_name: t.term,
    slug: t.slug,
    definition: t.definition,
    simple_definition: t.simple_definition,
    category: t.category,
    synonyms: t.synonyms,
    pronunciation: t.pronunciation,
  }));

  // Breadcrumbs data with translations
  const breadcrumbs = [
    { name: t('glossary.home') || 'Home', url: SITE_URL },
    { name: t('glossary.title') || 'Glossary', url: `${SITE_URL}/glossary` },
  ];

  // Group terms by first letter for SEO-friendly rendering
  const termsByLetter: Record<string, GlossaryTerm[]> = {};
  allTerms.forEach(term => {
    const letter = term.term.charAt(0).toUpperCase();
    if (!termsByLetter[letter]) termsByLetter[letter] = [];
    termsByLetter[letter].push(term);
  });

  const availableLetters = Object.keys(termsByLetter).sort();

  // Get lang code for schema
  const langCode = lang === 'en' ? 'en-US' : lang;

  // JSON-LD DefinedTermSet Schema
  const definedTermSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary`,
    name: locale.glossary?.title || 'CBD Portal Glossary',
    description: locale.glossary?.pageDescription || 'Comprehensive glossary of CBD and cannabis terminology.',
    url: `${SITE_URL}/glossary`,
    inLanguage: langCode,
    publisher: {
      '@type': 'Organization',
      name: locale.meta?.siteName || 'CBD Portal',
      url: SITE_URL,
    },
    hasDefinedTerm: allTerms.slice(0, 100).map(term => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE_URL}/glossary/${term.slug}`,
      name: term.term,
      description: term.simple_definition || term.definition,
      url: `${SITE_URL}/glossary/${term.slug}`,
      ...(term.synonyms && term.synonyms.length > 0 && {
        alternateName: term.synonyms
      })
    }))
  };

  // ItemList Schema for search engines
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale.glossary?.title || 'CBD & Cannabis Glossary Terms',
    description: `${totalTerms} CBD and cannabis terms explained`,
    numberOfItems: totalTerms,
    itemListElement: allTerms.slice(0, 50).map((term, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: term.term,
      url: `${SITE_URL}/glossary/${term.slug}`
    }))
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Breadcrumbs - Server rendered for SEO */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700">
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Breadcrumbs items={breadcrumbs} variant="dark" />
        </div>
      </div>

      {/* Client component handles interactivity, but HTML is server-rendered */}
      <GlossaryClient
        initialTerms={allTerms}
        popularTerms={popularTerms}
        categoryCounts={categoryCounts}
        availableLetters={availableLetters}
        totalTerms={totalTerms}
        categories={CATEGORIES}
      />

      {/* SEO: Hidden but crawlable full term list (visible to search engines) */}
      <noscript>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1>CBD & Cannabis Glossary - {totalTerms} Terms</h1>
          <p>Comprehensive glossary of CBD and cannabis terminology.</p>

          {/* Category Links */}
          <nav aria-label="Glossary categories">
            <h2>Browse by Category</h2>
            <ul>
              {CATEGORIES.map(cat => (
                <li key={cat.key}>
                  <a href={`/glossary/category/${cat.key}`}>
                    {cat.label} ({categoryCounts[cat.key] || 0} terms) - {cat.description}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* All Terms by Letter */}
          {availableLetters.map(letter => (
            <section key={letter} id={`letter-${letter}`}>
              <h2>{letter}</h2>
              <ul>
                {termsByLetter[letter].map(term => (
                  <li key={term.id}>
                    <a href={`/glossary/${term.slug}`}>
                      <strong>{term.display_name || term.term}</strong>
                    </a>
                    {term.pronunciation && <span> /{term.pronunciation}/</span>}
                    <p>{term.short_definition}</p>
                    {term.synonyms && term.synonyms.length > 0 && (
                      <p>Also known as: {term.synonyms.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </noscript>
    </>
  );
}
