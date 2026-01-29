import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getLocalizedSlug } from '@/lib/utils/locale-href';
import { getLanguage } from '@/lib/get-language';
import type { LanguageCode } from '@/lib/translation-service';

const SITE_URL = 'https://cbd-portal.vercel.app';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ lang?: string }>;
}

interface GlossaryTerm {
  id: string;
  term: string;
  display_name: string;
  slug: string;
  short_definition: string;
  synonyms: string[];
  pronunciation?: string;
}

const CATEGORIES: Record<string, {
  label: string;
  icon: string;
  color: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}> = {
  cannabinoids: {
    label: 'Cannabinoids',
    icon: '🧬',
    color: 'green',
    description: 'Chemical compounds found in cannabis plants that interact with the endocannabinoid system.',
    seoTitle: 'Cannabinoid Glossary | CBD, THC, CBG & More',
    seoDescription: 'Complete guide to cannabinoids including CBD, THC, CBG, CBN, and more. Learn about each compound, its effects, benefits, and how it interacts with your body.',
  },
  terpenes: {
    label: 'Terpenes',
    icon: '🌿',
    color: 'emerald',
    description: 'Aromatic compounds that give cannabis its distinctive scents and may contribute to its effects.',
    seoTitle: 'Cannabis Terpene Glossary | Myrcene, Limonene & More',
    seoDescription: 'Discover cannabis terpenes like myrcene, limonene, linalool, and pinene. Learn how terpenes affect aroma, flavor, and the entourage effect.',
  },
  products: {
    label: 'Products',
    icon: '📦',
    color: 'blue',
    description: 'Different types of CBD and cannabis products available on the market.',
    seoTitle: 'CBD Product Types Glossary | Oils, Edibles, Topicals',
    seoDescription: 'Guide to CBD product types including oils, tinctures, edibles, topicals, capsules, and vapes. Learn which product format is right for you.',
  },
  extraction: {
    label: 'Extraction',
    icon: '🔬',
    color: 'purple',
    description: 'Methods and technologies used to extract cannabinoids and other compounds from cannabis.',
    seoTitle: 'CBD Extraction Methods Glossary | CO2, Ethanol & More',
    seoDescription: 'Learn about CBD extraction methods including CO2 extraction, ethanol extraction, and more. Understand how extraction affects product quality.',
  },
  science: {
    label: 'Science & Biology',
    icon: '🧠',
    color: 'indigo',
    description: 'Scientific and biological terms related to how cannabinoids work in the body.',
    seoTitle: 'Cannabis Science Glossary | Endocannabinoid System',
    seoDescription: 'Understand the science behind CBD and cannabis. Learn about the endocannabinoid system, receptors, bioavailability, and pharmacology.',
  },
  research: {
    label: 'Research',
    icon: '📊',
    color: 'violet',
    description: 'Clinical research and scientific study terminology.',
    seoTitle: 'CBD Research Terms Glossary | Clinical Studies',
    seoDescription: 'Glossary of CBD and cannabis research terminology. Understand clinical trials, study types, and how to interpret scientific research.',
  },
  'side-effects': {
    label: 'Side Effects',
    icon: '⚠️',
    color: 'amber',
    description: 'Potential effects, interactions, and safety considerations.',
    seoTitle: 'CBD Side Effects Glossary | Safety & Interactions',
    seoDescription: 'Learn about potential CBD side effects and drug interactions. Comprehensive guide to CBD safety terminology and what to watch for.',
  },
  conditions: {
    label: 'Health Conditions',
    icon: '🩺',
    color: 'orange',
    description: 'Health conditions and symptoms that may be relevant to CBD use.',
    seoTitle: 'Health Conditions & CBD Glossary | Medical Terms',
    seoDescription: 'Glossary of health conditions related to CBD research including anxiety, pain, epilepsy, inflammation, and sleep disorders.',
  },
  testing: {
    label: 'Testing & Quality',
    icon: '🧪',
    color: 'teal',
    description: 'Laboratory testing and quality assurance terminology.',
    seoTitle: 'CBD Lab Testing Glossary | COA, Potency & Purity',
    seoDescription: 'Understand CBD lab testing terms including COA, potency testing, heavy metals, pesticides, and third-party verification.',
  },
  legal: {
    label: 'Legal & Compliance',
    icon: '⚖️',
    color: 'slate',
    description: 'Legal and regulatory terminology related to CBD and cannabis.',
    seoTitle: 'CBD Legal Terms Glossary | Regulations & Compliance',
    seoDescription: 'Guide to CBD legal terminology including hemp regulations, novel food requirements, THC limits, and compliance standards affecting CBD products worldwide.',
  },
  dosing: {
    label: 'Dosing',
    icon: '💊',
    color: 'cyan',
    description: 'Terms related to CBD dosage, administration, and measurement.',
    seoTitle: 'CBD Dosing Glossary | Dosage & Administration',
    seoDescription: 'Learn CBD dosing terminology including milligrams, bioavailability, titration, and how to determine the right dose for you.',
  },
  plant: {
    label: 'Plant & Cultivation',
    icon: '🌱',
    color: 'lime',
    description: 'Terms related to the cannabis plant and how it is grown.',
    seoTitle: 'Cannabis Plant Glossary | Hemp, Strains & Cultivation',
    seoDescription: 'Glossary of cannabis plant terms including hemp vs marijuana, strains, cultivation methods, and botanical terminology.',
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cannabinoids: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  terpenes: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  products: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  extraction: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  science: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  research: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  'side-effects': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  conditions: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  testing: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  legal: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  dosing: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  plant: { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
};

// Generate static params for all categories
export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = CATEGORIES[category];

  if (!categoryInfo) {
    return {
      title: 'Category Not Found | CBD Portal Glossary',
      description: 'This glossary category could not be found.',
    };
  }

  const canonicalUrl = `${SITE_URL}/glossary/category/${category}`;

  return {
    title: `${categoryInfo.seoTitle} | CBD Portal`,
    description: categoryInfo.seoDescription,
    keywords: [`${categoryInfo.label.toLowerCase()} glossary`, `CBD ${categoryInfo.label.toLowerCase()}`, `cannabis ${categoryInfo.label.toLowerCase()} terms`],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: categoryInfo.seoTitle,
      description: categoryInfo.seoDescription,
      type: 'website',
      url: canonicalUrl,
      siteName: 'CBD Portal',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryInfo.seoTitle,
      description: categoryInfo.seoDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GlossaryCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const categoryInfo = CATEGORIES[category];

  if (!categoryInfo) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch terms in this category
  const { data: terms } = await supabase
    .from('kb_glossary')
    .select('id, term, display_name, slug, short_definition, synonyms, pronunciation')
    .eq('category', category)
    .order('term', { ascending: true });

  const categoryTerms: GlossaryTerm[] = terms || [];

  // Fetch translated slugs for non-English languages
  let glossarySlugMap = new Map<string, string>();
  if (lang !== 'en' && categoryTerms.length > 0) {
    const termIds = categoryTerms.map((t: { id: string }) => t.id);
    const { data: slugTranslations } = await supabase
      .from('glossary_translations')
      .select('term_id, slug')
      .eq('language', lang)
      .in('term_id', termIds);
    glossarySlugMap = new Map(
      (slugTranslations || []).map((t: { term_id: string; slug: string }) => [t.term_id, t.slug])
    );
  }
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.cannabinoids;

  // Group terms by first letter
  const termsByLetter: Record<string, GlossaryTerm[]> = {};
  categoryTerms.forEach(term => {
    const letter = term.term.charAt(0).toUpperCase();
    if (!termsByLetter[letter]) termsByLetter[letter] = [];
    termsByLetter[letter].push(term);
  });

  const availableLetters = Object.keys(termsByLetter).sort();

  // Get other category counts for navigation
  const { data: allCategories } = await supabase
    .from('kb_glossary')
    .select('category');

  const categoryCounts: Record<string, number> = {};
  allCategories?.forEach((item: { category: string }) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Glossary', url: `${SITE_URL}/glossary` },
    { name: categoryInfo.label, url: `${SITE_URL}/glossary/category/${category}` },
  ];

  // JSON-LD Schema
  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/glossary/category/${category}`,
    name: categoryInfo.seoTitle,
    description: categoryInfo.seoDescription,
    url: `${SITE_URL}/glossary/category/${category}`,
    isPartOf: {
      '@type': 'DefinedTermSet',
      '@id': `${SITE_URL}/glossary`,
      name: 'CBD Portal Glossary',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryTerms.length,
      itemListElement: categoryTerms.slice(0, 50).map((term, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'DefinedTerm',
          '@id': `${SITE_URL}/glossary/${term.slug}`,
          name: term.display_name || term.term,
          description: term.short_definition,
          url: `${SITE_URL}/glossary/${term.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Breadcrumbs items={breadcrumbs} variant="dark" />

            <div className="flex items-center gap-4 mt-6 mb-4">
              <span className="text-5xl" aria-hidden="true">{categoryInfo.icon}</span>
              <div>
                <h1 className="text-4xl font-bold">{categoryInfo.label} Glossary</h1>
                <p className="text-green-100 mt-2">{categoryTerms.length} terms</p>
              </div>
            </div>

            <p className="text-xl text-green-100 max-w-3xl">
              {categoryInfo.description}
            </p>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <nav aria-label="Glossary categories">
              <h2 className="sr-only">Browse other categories</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/glossary"
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  All Categories
                </Link>
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const isActive = key === category;
                  const count = categoryCounts[key] || 0;
                  return (
                    <Link
                      key={key}
                      href={`/glossary/category/${key}`}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span aria-hidden="true">{cat.icon}</span>
                      <span>{cat.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-green-500 text-green-100' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Alphabet Quick Links */}
        {availableLetters.length > 1 && (
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <nav className="flex flex-wrap gap-1" aria-label="Jump to letter">
                {availableLetters.map(letter => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded text-gray-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    {letter}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {categoryTerms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No terms found in this category.</p>
              <Link
                href="/glossary"
                className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium"
              >
                View all glossary terms
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {availableLetters.map(letter => (
                <section key={letter} id={`letter-${letter}`} aria-labelledby={`heading-${letter}`}>
                  <h2
                    id={`heading-${letter}`}
                    className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200"
                  >
                    {letter}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({termsByLetter[letter].length} {termsByLetter[letter].length === 1 ? 'term' : 'terms'})
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {termsByLetter[letter].map(term => (
                      <Link
                        key={term.id}
                        href={`/glossary/${getLocalizedSlug({ slug: term.slug, translated_slug: glossarySlugMap.get(term.id) })}`}
                        className="block bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-green-300 transition-all group"
                      >
                        <article className="p-4">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-green-600 transition-colors mb-1">
                            {term.display_name || term.term}
                          </h3>
                          {term.pronunciation && (
                            <p className="text-xs text-gray-400 font-mono mb-2">/{term.pronunciation}/</p>
                          )}
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {term.short_definition}
                          </p>
                          {term.synonyms && term.synonyms.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Also: {term.synonyms.slice(0, 2).join(', ')}
                              {term.synonyms.length > 2 && '...'}
                            </p>
                          )}
                        </article>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Full Glossary
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

// Revalidate every hour
export const revalidate = 3600;
