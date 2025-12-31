import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data: tag } = await supabase
    .from('kb_tags')
    .select('name, description')
    .eq('slug', params.slug)
    .single();

  return {
    title: `${tag?.name} Articles | CBD Portal`,
    description: tag?.description || `Browse all CBD articles tagged with ${tag?.name}.`,
    alternates: {
      canonical: `/tags/${params.slug}`,
    },
  };
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  lime: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  zinc: { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' },
};

export default async function TagPage({ params }: Props) {
  const supabase = await createClient();

  // Get tag
  const { data: tag } = await supabase
    .from('kb_tags')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!tag) notFound();

  // Get articles with this tag
  const { data: articleTags } = await supabase
    .from('kb_article_tags')
    .select('article_id')
    .eq('tag_id', tag.id);

  const articleIds = articleTags?.map(at => at.article_id) || [];

  let articles: any[] = [];
  if (articleIds.length > 0) {
    const { data } = await supabase
      .from('kb_articles')
      .select(`
        slug, title, excerpt, reading_time, updated_at,
        category:kb_categories(name, slug)
      `)
      .in('id', articleIds)
      .eq('status', 'published')
      .eq('language', 'en')
      .order('published_at', { ascending: false });
    articles = data || [];
  }

  // Get related tags (tags that appear on the same articles)
  let relatedTags: any[] = [];
  if (articleIds.length > 0) {
    const { data: relatedTagIds } = await supabase
      .from('kb_article_tags')
      .select('tag_id')
      .in('article_id', articleIds)
      .neq('tag_id', tag.id);

    const uniqueTagIds = [...new Set(relatedTagIds?.map(rt => rt.tag_id) || [])];

    if (uniqueTagIds.length > 0) {
      const { data } = await supabase
        .from('kb_tags')
        .select('name, slug, color')
        .in('id', uniqueTagIds.slice(0, 10));
      relatedTags = data || [];
    }
  }

  const colors = colorClasses[tag.color] || colorClasses.gray;

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Tags', url: 'https://cbd-portal.vercel.app/tags' },
    { name: tag.name, url: `https://cbd-portal.vercel.app/tags/${tag.slug}` }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href="/tags" className="text-gray-500 hover:text-gray-700">Tags</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">{tag.name}</li>
        </ol>
      </nav>

      {/* Tag header */}
      <div className={`rounded-xl p-8 mb-10 ${colors.bg} border ${colors.border}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-4 py-2 rounded-full text-lg font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
            #{tag.name}
          </span>
          <span className="text-gray-500">{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
        </div>
        {tag.description && (
          <p className="text-gray-600 text-lg">{tag.description}</p>
        )}
      </div>

      {/* Related tags */}
      {relatedTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Tags</h2>
          <div className="flex flex-wrap gap-2">
            {relatedTags.map(rt => (
              <Link
                key={rt.slug}
                href={`/tags/${rt.slug}`}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {rt.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      {articles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block border rounded-lg p-5 bg-white hover:shadow-md hover:border-green-300 transition-all"
            >
              {article.category && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded mb-3">
                  {article.category.name}
                </span>
              )}
              <h2 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {article.reading_time && <span>{article.reading_time} min read</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No articles with this tag yet.</p>
          <Link href="/articles" className="text-green-600 hover:underline">
            Browse all articles →
          </Link>
        </div>
      )}

      {/* Back to tags */}
      <div className="mt-12 pt-8 border-t">
        <Link href="/tags" className="text-green-600 hover:text-green-800 font-medium">
          ← Browse all tags
        </Link>
      </div>
    </div>
  );
}