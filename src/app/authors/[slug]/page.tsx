import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // For fallback case when table doesn't exist
  if (params.slug === 'formula-swiss') {
    return {
      title: 'Formula Swiss - European CBD Industry Pioneer | CBD Portal',
      description: 'Meet Formula Swiss, Europe\'s most established CBD company operating since 2013. Learn about our group of companies serving consumers, retailers, and medical professionals across Europe.',
      alternates: {
        canonical: `/authors/${params.slug}`,
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data: author } = await supabase
      .from('authors')
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
  } catch (error) {
    return {
      title: 'Author | CBD Portal',
      description: 'CBD Portal author profile',
      alternates: {
        canonical: `/authors/${params.slug}`,
      },
    };
  }
}

export default async function AuthorPage({ params }: Props) {
  const supabase = await createClient();
  let author: any = null;
  let articles: any[] = [];

  // Handle fallback for Formula Swiss if table doesn't exist
  if (params.slug === 'formula-swiss') {
    try {
      const { data: authorData } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single();

      if (authorData) {
        author = authorData;
        // Get author's articles
        const { data: articleData } = await supabase
          .from('kb_articles')
          .select('slug, title, excerpt, reading_time, published_at, updated_at')
          .eq('author_id', author.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(20);
        articles = articleData || [];
      }
    } catch (error) {
      console.log('authors table not found, using fallback');
    }

    // Use fallback data if no author found in database
    if (!author) {
      // Get total articles count for fallback
      const { data: allArticles } = await supabase
        .from('kb_articles')
        .select('slug, title, excerpt, reading_time, published_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      articles = allArticles || [];

      author = {
        id: 'formula-swiss-temp-id',
        name: 'Formula Swiss',
        slug: 'formula-swiss',
        title: 'European CBD Industry Pioneer Since 2013',
        credentials: [
          'Operating in the CBD industry since 2013',
          'Over €1 million invested in EU regulatory compliance',
          'Novel Food applications submitted and approved',
          'Five specialized companies across Europe and UK',
          'Partnerships with certified testing laboratories',
          'Direct relationships with organic hemp farmers',
          'GMP-compliant manufacturing processes',
          'Medical-grade product development expertise'
        ],
        bio_short: 'Formula Swiss is one of Europe\'s most established CBD companies, operating since 2013 when the European CBD market was still in its infancy. What started as a small operation has grown into a group of companies serving consumers, retailers, and medical professionals across Europe and beyond.',
        bio_full: `Formula Swiss is one of Europe's most established CBD companies, operating since 2013 when the European CBD market was still in its infancy. What started as a small operation has grown into a group of companies serving consumers, retailers, and medical professionals across Europe and beyond.

## The Formula Swiss Group

The Formula Swiss group includes:

**Formula Swiss AG** – The flagship Swiss company focusing on premium CBD consumer products, manufactured under strict Swiss quality standards.

**Formula Swiss Wholesale AG** – Dedicated B2B division supplying CBD products to retailers, pharmacies, and white-label partners throughout Europe.

**Formula Swiss UK Ltd.** – UK operations ensuring continued service and compliance following Brexit, with products tailored to British regulations.

**Formula Swiss Europe Ltd.** – European distribution hub managing logistics and compliance across EU member states.

**Formula Swiss Medical Ltd.** – Specialized division focused on medical-grade CBD products and collaboration with healthcare professionals.

## Industry Leadership

Over more than a decade in the CBD industry, Formula Swiss has invested heavily in regulatory compliance, including over €1 million in Novel Food applications and product registrations across European markets. The company works with certified laboratories for third-party testing and maintains relationships with organic hemp farmers and state-of-the-art extraction facilities.

## Mission

CBD Portal was founded by the Formula Swiss team to provide consumers with honest, evidence-based information about CBD – cutting through marketing hype to deliver research-backed guidance that helps people make informed decisions about CBD products.`,
        image_url: '',
        years_experience: 12,
        expertise_areas: [
          'CBD Oils & Tinctures',
          'CBD Capsules & Edibles',
          'CBD Topicals & Skincare',
          'CBD for Pets',
          'Medical CBD Applications',
          'European CBD Regulations',
          'Product Quality & Testing',
          'Hemp Cultivation & Extraction'
        ],
        article_count: articles.length,
        is_verified: true,
        is_primary: true,
        website_url: 'https://formulaswiss.com',
        companies: [
          {
            name: 'Formula Swiss AG',
            role: 'Swiss flagship company',
            location: 'Switzerland',
            description: 'Premium CBD consumer products manufactured under strict Swiss quality standards'
          },
          {
            name: 'Formula Swiss Wholesale AG',
            role: 'B2B division',
            location: 'Switzerland',
            description: 'Supplying CBD products to retailers, pharmacies, and white-label partners throughout Europe'
          },
          {
            name: 'Formula Swiss UK Ltd.',
            role: 'UK operations',
            location: 'United Kingdom',
            description: 'Ensuring continued service and compliance following Brexit with products tailored to British regulations'
          },
          {
            name: 'Formula Swiss Europe Ltd.',
            role: 'European distribution',
            location: 'Europe',
            description: 'Managing logistics and compliance across EU member states'
          },
          {
            name: 'Formula Swiss Medical Ltd.',
            role: 'Medical division',
            location: 'Europe',
            description: 'Medical-grade CBD products and collaboration with healthcare professionals'
          }
        ]
      };
    }
  } else {
    // Get author from database for other slugs
    const { data: authorData } = await supabase
      .from('authors')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single();

    if (!authorData) notFound();

    author = authorData;

    // Get author's articles
    const { data: articleData } = await supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time, published_at, updated_at')
      .eq('author_id', author.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    articles = articleData || [];
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Authors', url: '/authors' },
    { name: author.name, url: `/authors/${author.slug}` }
  ];

  // Schema for SEO - Organization for Formula Swiss, Person for others
  const schema = author.slug === 'formula-swiss' ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: author.name || '',
    description: author.bio_short || '',
    url: `https://cbd-portal.vercel.app/authors/${author.slug}`,
    foundingDate: '2013',
    ...(author.website_url && {
      sameAs: author.website_url
    })
  } : {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name || '',
    jobTitle: author.title || '',
    description: author.bio_short || '',
    url: `https://cbd-portal.vercel.app/authors/${author.slug}`,
    ...(author.website_url && {
      sameAs: author.website_url
    })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
                {author.slug === 'formula-swiss' ? (
                  <span className="text-5xl text-green-700">🏢</span>
                ) : (
                  <span className="text-5xl text-green-700">
                    {author.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold">{author.name}</h1>
              {author.is_verified && (
                <span className="text-blue-500 text-2xl" title="Verified Expert">✓</span>
              )}
              {author.slug === 'formula-swiss' && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  Since 2013
                </span>
              )}
            </div>

            <p className="text-xl text-green-700 font-medium mb-2">{author.title}</p>

            {author.credentials && (
              <div className="mb-4">
                {Array.isArray(author.credentials) ? (
                  <div className="space-y-1">
                    {author.credentials.slice(0, 3).map((credential: string, index: number) => (
                      <div key={index} className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>{credential}</span>
                      </div>
                    ))}
                    {author.credentials.length > 3 && (
                      <div className="text-sm text-gray-500 text-center md:text-left">
                        +{author.credentials.length - 3} more achievements
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">{author.credentials}</p>
                )}
              </div>
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
            <div className="prose prose-green max-w-none">
              {author.bio_full.split('\n\n').map((paragraph: string, index: number) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold mt-6 mb-3">
                      {paragraph.replace('## ', '')}
                    </h3>
                  );
                }

                // Handle bold text with **text**
                const parts = paragraph.split(/(\*\*.*?\*\*)/);
                return (
                  <p key={index} className="mb-4">
                    {parts.map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={partIndex} className="font-semibold">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
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

