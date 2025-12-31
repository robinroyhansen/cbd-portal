import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CBD Glossary | CBD Portal',
  description: 'Comprehensive glossary of CBD and cannabis terms.',
  alternates: {
    canonical: '/glossary',
  },
};

interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  short_definition: string;
  category: string;
}

export default async function GlossaryPage() {
  const supabase = await createClient();

  const { data: terms } = await supabase
    .from('kb_glossary')
    .select('*')
    .eq('language', 'en')
    .eq('is_active', true)
    .order('term');

  // Group by first letter
  const grouped: Record<string, GlossaryTerm[]> = {};
  terms?.forEach(term => {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  });

  const letters = Object.keys(grouped).sort();

  // Category labels
  const categoryLabels: Record<string, string> = {
    cannabinoids: 'Cannabinoids',
    science: 'Science & Biology',
    products: 'Products & Types',
    methods: 'Consumption Methods',
    medical: 'Medical Terms',
    research: 'Research Terms',
    legal: 'Legal & Regulatory'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">CBD Glossary</h1>
      <p className="text-xl text-gray-600 mb-8">
        Understanding CBD terminology is essential for making informed decisions.
        Browse our comprehensive glossary of CBD and cannabis-related terms.
      </p>

      {/* Alphabet navigation */}
      <div className="flex flex-wrap gap-2 mb-8 sticky top-16 bg-white py-4 border-b">
        {letters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium text-sm"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Terms by letter */}
      <div className="space-y-12">
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-3xl font-bold text-green-700 mb-6 pb-2 border-b-2 border-green-200">
              {letter}
            </h2>
            <div className="space-y-6">
              {grouped[letter].map(term => (
                <div key={term.id} id={term.slug} className="scroll-mt-32">
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="group"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 mb-1">
                      {term.term}
                    </h3>
                  </Link>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mb-2">
                    {categoryLabels[term.category] || term.category}
                  </span>
                  <p className="text-gray-600">{term.short_definition || term.definition}</p>
                  <Link
                    href={`/glossary/${term.slug}`}
                    className="text-green-600 hover:text-green-800 text-sm mt-2 inline-block"
                  >
                    Read full definition →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}