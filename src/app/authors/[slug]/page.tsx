import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: author } = await supabase
    .from('kb_authors')
    .select('name, meta_title, meta_description')
    .eq('slug', params.slug)
    .single();

  return {
    title: author?.meta_title || `${author?.name} | CBD Portal Author`,
    description: author?.meta_description,
    alternates: {
      canonical: `/authors/${params.slug}`,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const supabase = createClient();

  // Get author
  const { data: author } = await supabase
    .from('kb_authors')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single();

  if (!author) notFound();

  // Get author's articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time, published_at, updated_at')
    .eq('author_id', author.id)
    .eq('status', 'published')
    .eq('language', 'en')
    .order('published_at', { ascending: false })
    .limit(20);

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Authors', url: 'https://cbd-portal.vercel.app/authors' },
    { name: author.name, url: `https://cbd-portal.vercel.app/authors/${author.slug}` }
  ];

  // Person schema for SEO
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    description: author.bio_short,
    url: `https://cbd-portal.vercel.app/authors/${author.slug}`,
    image: author.image_url,
    sameAs: [
      author.linkedin_url,
      author.twitter_url,
      author.website_url
    ].filter(Boolean),
    worksFor: author.companies?.map((c: any) => ({
      '@type': 'Organization',
      name: c.name,
      description: c.description
    })),
    knowsAbout: author.expertise_areas
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.url} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <Link href={crumb.url} className="hover:text-green-600">
                  {crumb.name}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        {/* Author header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {author.image_url ? (
              <img
                src={author.image_url}
                alt={author.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto md:mx-0"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-green-100 flex items-center justify-center mx-auto md:mx-0">
                <span className="text-5xl text-green-700">
                  {author.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">{author.name}</h1>
              {author.is_verified && (
                <span className="text-blue-500 text-2xl" title="Verified Expert">✓</span>
              )}
            </div>

            <p className="text-xl text-green-700 font-medium mb-2">{author.title}</p>

            {author.credentials && (
              <p className="text-gray-500 mb-4">{author.credentials}</p>
            )}

            {/* Quick stats */}
            <div className="flex justify-center md:justify-start gap-6 mb-6">
              <div>
                <span className="text-2xl font-bold text-gray-900">{author.years_experience}+</span>
                <span className="text-gray-500 text-sm ml-1">years experience</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">{author.article_count}</span>
                <span className="text-gray-500 text-sm ml-1">articles</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex justify-center md:justify-start gap-3">
              {author.linkedin_url && (
                <a
                  href={author.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {author.twitter_url && (
                <a
                  href={author.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors"
                >
                  Twitter/X
                </a>
              )}
              {author.website_url && (
                <a
                  href={author.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Expertise areas */}
        {author.expertise_areas && author.expertise_areas.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-3">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {author.expertise_areas.map((area: string) => (
                <span key={area} className="px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  {area}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Companies */}
        {author.companies && author.companies.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-3">Companies & Organizations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {author.companies.map((company: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{company.name}</span>
                    {company.location && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        {company.location}
                      </span>
                    )}
                  </div>
                  <p className="text-green-700 text-sm">{company.role}</p>
                  {company.description && (
                    <p className="text-gray-500 text-sm mt-1">{company.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full bio */}
        {author.bio_full && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-3">About {author.name.split(' ')[0]}</h2>
            <div
              className="prose prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(author.bio_full) }}
            />
          </section>
        )}

        {/* Publications/Media */}
        {author.publications && author.publications.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-3">Publications & Media</h2>
            <ul className="space-y-3">
              {author.publications.map((pub: any, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600">→</span>
                  <div>
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-green-700"
                    >
                      {pub.title}
                    </a>
                    {pub.publication && (
                      <span className="text-gray-500 text-sm"> — {pub.publication}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Articles by this author */}
        {articles && articles.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Articles by {author.name.split(' ')[0]}
            </h2>
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block p-5 border rounded-lg hover:border-green-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2 hover:text-green-700">{article.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{article.excerpt}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    {article.reading_time && <span>{article.reading_time} min read</span>}
                    <span>Updated {new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>

            {articles.length >= 20 && (
              <div className="text-center mt-6">
                <Link
                  href={`/articles?author=${author.slug}`}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  View all articles by {author.name.split(' ')[0]} →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2">Author Disclaimer</h3>
          <p className="text-sm text-gray-600">
            The views and opinions expressed in {author.name.split(' ')[0]}'s articles are personal expert opinions
            based on extensive industry experience and independent research. They do not represent the official
            position of {author.companies?.[0]?.name || 'any affiliated organization'} or any other organization.
            Always consult with a qualified healthcare professional before making decisions about CBD use.
          </p>
        </div>
      </div>
    </>
  );
}

function formatMarkdown(text: string): string {
  // Simple markdown to HTML conversion
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}