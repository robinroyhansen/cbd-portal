import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { GlossaryClient } from './GlossaryClient';

const SITE_URL = 'https://cbd-portal.vercel.app';

interface GlossaryTerm {
  id: string;
  term: string;
  display_name: string;
  slug: string;
  definition: string;
  short_definition: string;
  category: string;
  synonyms: string[];
  pronunciation?: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

// SEO Metadata
export const metadata: Metadata = {
  title: 'CBD & Cannabis Glossary | 250+ Terms Explained | CBD Portal',
  description: 'Comprehensive glossary of CBD and cannabis terms. Learn about cannabinoids, terpenes, extraction methods, dosing, and more. Expert-reviewed definitions for beginners and professionals.',
  keywords: ['CBD glossary', 'cannabis terminology', 'cannabinoid definitions', 'CBD terms', 'hemp glossary', 'cannabis science terms'],
  alternates: {
    canonical: `${SITE_URL}/glossary`,
  },
  openGraph: {
    title: 'CBD & Cannabis Glossary - 250+ Terms Explained',
    description: 'Comprehensive glossary covering cannabinoids, terpenes, products, extraction methods, and more. Expert-reviewed definitions.',
    type: 'website',
    url: `${SITE_URL}/glossary`,
    siteName: 'CBD Portal',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBD & Cannabis Glossary',
    description: 'Comprehensive glossary of CBD and cannabis terminology with expert-reviewed definitions.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const CATEGORIES = [
  { key: 'cannabinoids', label: 'Cannabinoids', icon: '🧬', description: 'Chemical compounds found in cannabis plants' },
  { key: 'terpenes', label: 'Terpenes', icon: '🌿', description: 'Aromatic compounds that give cannabis its scent' },
  { key: 'products', label: 'Products', icon: '📦', description: 'CBD product types and formats' },
  { key: 'extraction', label: 'Extraction', icon: '🔬', description: 'Methods for extracting cannabinoids' },
  { key: 'science', label: 'Science & Biology', icon: '🧠', description: 'Scientific and biological terms' },
  { key: 'research', label: 'Research', icon: '📊', description: 'Clinical and research terminology' },
  { key: 'side-effects', label: 'Side Effects', icon: '⚠️', description: 'Potential effects and safety terms' },
  { key: 'conditions', label: 'Conditions', icon: '🩺', description: 'Health conditions and symptoms' },
  { key: 'testing', label: 'Testing & Quality', icon: '🧪', description: 'Lab testing and quality terms' },
  { key: 'legal', label: 'Legal & Compliance', icon: '⚖️', description: 'Legal and regulatory terminology' },
  { key: 'dosing', label: 'Dosing', icon: '💊', description: 'Dosage and administration terms' },
  { key: 'plant', label: 'Plant & Cultivation', icon: '🌱', description: 'Cannabis plant and growing terms' },
];

export default async function GlossaryPage() {
  const supabase = await createClient();

  // Fetch all terms for SEO (server-rendered)
  const { data: terms } = await supabase
    .from('kb_glossary')
    .select('id, term, display_name, slug, short_definition, category, synonyms, pronunciation')
    .order('term', { ascending: true });

  // Get category counts
  const { data: countData } = await supabase
    .from('kb_glossary')
    .select('category');

  const categoryCounts: Record<string, number> = {};
  countData?.forEach((item: { category: string }) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const allTerms: GlossaryTerm[] = terms || [];
  const totalTerms = allTerms.length;

  // Group terms by first letter for SEO-friendly rendering
  const termsByLetter: Record<string, GlossaryTerm[]> = {};
  allTerms.forEach(term => {
    const letter = term.term.charAt(0).toUpperCase();
    if (!termsByLetter[letter]) termsByLetter[letter] = [];
    termsByLetter[letter].push(term);
  });

  const availableLetters = Object.keys(termsByLetter).sort();

  // JSON-LD DefinedTermSet Schema
  const definedTermSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary`,
    name: 'CBD Portal Glossary',
    description: 'Comprehensive glossary of CBD and cannabis terminology with expert-reviewed definitions covering cannabinoids, terpenes, products, extraction methods, and more.',
    url: `${SITE_URL}/glossary`,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'CBD Portal',
      url: SITE_URL,
    },
    hasDefinedTerm: allTerms.slice(0, 100).map(term => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE_URL}/glossary/${term.slug}`,
      name: term.display_name || term.term,
      description: term.short_definition,
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
    name: 'CBD & Cannabis Glossary Terms',
    description: `${totalTerms} CBD and cannabis terms explained`,
    numberOfItems: totalTerms,
    itemListElement: allTerms.slice(0, 50).map((term, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: term.display_name || term.term,
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

      {/* Client component handles interactivity, but HTML is server-rendered */}
      <GlossaryClient
        initialTerms={allTerms}
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
