import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: term } = await supabase
    .from('kb_glossary')
    .select('term, short_definition')
    .eq('slug', params.slug)
    .single();

  return {
    title: `${term?.term} - CBD Glossary | CBD Portal`,
    description: term?.short_definition || `Learn what ${term?.term} means in the context of CBD.`,
    alternates: {
      canonical: `/glossary/${params.slug}`,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const supabase = await createClient();

  const { data: term } = await supabase
    .from('kb_glossary')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!term) notFound();

  // Get related terms
  let relatedTerms: any[] = [];
  if (term.related_terms && term.related_terms.length > 0) {
    const { data } = await supabase
      .from('kb_glossary')
      .select('term, slug, short_definition')
      .in('term', term.related_terms)
      .eq('is_active', true)
      .limit(6);
    relatedTerms = data || [];
  }

  // Get articles that might reference this term
  const { data: relatedArticles } = await supabase
    .from('kb_articles')
    .select('title, slug')
    .eq('status', 'published')
    .eq('language', 'en')
    .or(`content.ilike.%${term.term}%,title.ilike.%${term.term}%`)
    .limit(5);

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Glossary', url: 'https://cbd-portal.vercel.app/glossary' },
    { name: term.term, url: `https://cbd-portal.vercel.app/glossary/${term.slug}` }
  ];

  const categoryLabels: Record<string, string> = {
    cannabinoids: 'Cannabinoids',
    science: 'Science & Biology',
    products: 'Products & Types',
    methods: 'Consumption Methods',
    medical: 'Medical Terms',
    research: 'Research Terms',
    legal: 'Legal & Regulatory'
  };

  // JSON-LD schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'CBD Glossary',
      url: 'https://cbd-portal.vercel.app/glossary'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            {categoryLabels[term.category] || term.category}
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-6">{term.term}</h1>

        <div className="prose prose-green max-w-none mb-12">
          <p className="text-xl text-gray-700 leading-relaxed">{term.definition}</p>
        </div>

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Terms</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedTerms.map(related => (
                <Link
                  key={related.slug}
                  href={`/glossary/${related.slug}`}
                  className="p-4 border rounded-lg hover:border-green-400 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-green-700">{related.term}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{related.short_definition}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Articles About {term.term}</h2>
            <ul className="space-y-2">
              {relatedArticles.map(article => (
                <li key={article.slug}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    → {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Back to glossary */}
        <div className="pt-8 border-t">
          <Link
            href="/glossary"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            ← Back to Glossary
          </Link>
        </div>
      </div>
    </>
  );
}