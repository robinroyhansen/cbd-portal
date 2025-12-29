import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import type { Database } from '@/lib/database.types';

type Article = Database['public']['Tables']['kb_articles']['Row'];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_articles')
    .select('title, excerpt, meta_title, meta_description, featured_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  const article = data as Pick<Article, 'title' | 'excerpt' | 'meta_title' | 'meta_description' | 'featured_image'> | null;

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || '',
      type: 'article',
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

export async function generateStaticParams() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_articles')
    .select('slug')
    .eq('status', 'published');

  const articles = data as Pick<Article, 'slug'>[] | null;

  return (articles || []).map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_articles')
    .select(
      `
      *,
      category:kb_categories(name, slug),
      citations:kb_citations(*)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  const article = data as (Article & {
    category: { name: string; slug: string } | null;
    citations: any[];
  }) | null;

  if (!article) {
    notFound();
  }

  // Get related articles from same category
  const { data: relatedArticles } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt')
    .eq('status', 'published')
    .eq('category_id', article.category_id)
    .neq('id', article.id)
    .limit(3);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/articles" className="hover:text-primary-600">
          Articles
        </Link>
        {article.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categories/${article.category.slug}`}
              className="hover:text-primary-600"
            >
              {article.category.name}
            </Link>
          </>
        )}
      </nav>

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
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
          {article.published_at && (
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
          {article.reading_time && (
            <>
              <span>•</span>
              <span>{article.reading_time} min read</span>
            </>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.featured_image && (
        <figure className="mb-12">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full rounded-lg object-cover"
          />
        </figure>
      )}

      {/* Content */}
      <div className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSlug]}
        >
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Citations */}
      {article.citations && article.citations.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            References & Citations
          </h2>
          <ol className="space-y-4">
            {article.citations.map((citation: any, index: number) => (
              <li key={citation.id} className="citation">
                <span className="font-medium">[{index + 1}]</span>{' '}
                {citation.authors && <span>{citation.authors}. </span>}
                <span className="italic">{citation.title}</span>
                {citation.publication && <span>. {citation.publication}</span>}
                {citation.year && <span> ({citation.year})</span>}
                {citation.doi && (
                  <span>
                    . DOI:{' '}
                    <a
                      href={`https://doi.org/${citation.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {citation.doi}
                    </a>
                  </span>
                )}
                {citation.url && !citation.doi && (
                  <span>
                    .{' '}
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      View source
                    </a>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

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

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Related Articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/articles/${related.slug}`}
                className="group rounded-lg border border-gray-200 p-4 transition hover:border-primary-300"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
                  {related.title}
                </h3>
                {related.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {related.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
