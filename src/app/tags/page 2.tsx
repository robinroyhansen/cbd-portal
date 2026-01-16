import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse by Tag | CBD Portal',
  description: 'Browse CBD articles by topic tags.',
  alternates: {
    canonical: '/tags',
  },
};

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  article_count: number;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  lime: 'bg-lime-100 text-lime-700 hover:bg-lime-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  sky: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  zinc: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
};

export default async function TagsPage() {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from('kb_tags')
    .select('*')
    .order('name');

  // Group tags by first letter for alphabet nav
  const grouped: Record<string, Tag[]> = {};
  tags?.forEach(tag => {
    const letter = tag.name[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(tag);
  });

  // Calculate tag sizes based on article count
  const maxCount = Math.max(...(tags?.map(t => t.article_count || 0) || [1]));
  const getSize = (count: number): string => {
    if (maxCount === 0) return 'text-sm';
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-xl font-bold';
    if (ratio > 0.4) return 'text-lg font-semibold';
    if (ratio > 0.2) return 'text-base font-medium';
    return 'text-sm';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Browse by Tag</h1>
      <p className="text-xl text-gray-600 mb-10">
        Explore CBD topics through our tag system. Tags help you find related content across different categories.
      </p>

      {/* Tag cloud */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Tags</h2>
        <div className="flex flex-wrap gap-3">
          {tags?.filter(t => (t.article_count || 0) > 0).sort((a, b) => (b.article_count || 0) - (a.article_count || 0)).slice(0, 30).map(tag => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={`px-4 py-2 rounded-full transition-all ${colorClasses[tag.color] || colorClasses.gray} ${getSize(tag.article_count || 0)}`}
            >
              {tag.name}
              <span className="ml-1 opacity-60">({tag.article_count || 0})</span>
            </Link>
          ))}
        </div>
        {tags?.filter(t => (t.article_count || 0) > 0).length === 0 && (
          <div className="text-gray-500 italic">No articles tagged yet. Tags will appear here as content is added.</div>
        )}
      </section>

      {/* All tags by letter */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Tags</h2>

        {/* Letter navigation */}
        {Object.keys(grouped).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 sticky top-16 bg-white py-4 border-b">
            {Object.keys(grouped).sort().map(letter => (
              <a
                key={letter}
                href={`#tags-${letter}`}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium text-sm"
              >
                {letter}
              </a>
            ))}
          </div>
        )}

        {/* Tags by letter */}
        <div className="space-y-8">
          {Object.keys(grouped).length > 0 ? Object.keys(grouped).sort().map(letter => (
            <div key={letter} id={`tags-${letter}`}>
              <h3 className="text-xl font-bold text-gray-400 mb-3">{letter}</h3>
              <div className="flex flex-wrap gap-2">
                {grouped[letter].map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${colorClasses[tag.color] || colorClasses.gray}`}
                  >
                    {tag.name}
                    {(tag.article_count || 0) > 0 && (
                      <span className="ml-1 opacity-60">({tag.article_count})</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No tags available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}