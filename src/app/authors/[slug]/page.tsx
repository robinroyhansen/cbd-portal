import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // For fallback case when table doesn't exist
  if (params.slug === 'robin-roy-krigslund-hansen') {
    return {
      title: 'Robin Roy Krigslund-Hansen - CBD Industry Expert | CBD Portal',
      description: 'Meet Robin Roy Krigslund-Hansen, Danish entrepreneur and CBD industry pioneer with 12+ years of hands-on experience in the European CBD market since 2013.',
      alternates: {
        canonical: `/authors/${params.slug}`,
      },
    };
  }

  try {
    const supabase = await createClient();
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

  // Handle fallback for Robin if table doesn't exist
  if (params.slug === 'robin-roy-krigslund-hansen') {
    try {
      const { data: authorData } = await supabase
        .from('kb_authors')
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
        id: 'robin-temp-id',
        name: 'Robin Roy Krigslund-Hansen',
        slug: 'robin-roy-krigslund-hansen',
        title: 'CBD Industry Pioneer & Entrepreneur',
        location: 'Zug, Switzerland',
        credentials: [
          '12+ years in CBD industry (since 2013)',
          'Developed 300+ CBD product formulations',
          'GMP & ISO 22716 certified operations',
          'EU Novel Food Consortium shareholder',
          'University research collaborations',
          'Zero failed third-party lab tests',
          'Operations in 16+ European countries',
          '100% renewable energy production',
          'EIHA member (European Industrial Hemp Association)',
          'MEDCAN supporter (Swiss Medical Cannabis Association)',
          'Organic cultivation expertise',
          'CO2 extraction specialist'
        ],
        bio_short: 'Danish entrepreneur who has been pioneering the European CBD industry since 2013. With over a decade of hands-on experience in product development, manufacturing, and regulatory compliance, he shares evidence-based insights to help consumers make informed decisions.',
        bio_full: `Robin Roy Krigslund-Hansen is a Danish entrepreneur and CBD industry pioneer who founded his first CBD company in 2013, making him one of the earliest players in the European cannabinoid market.

Over the past 12 years, Robin has built extensive hands-on experience across every aspect of the CBD industry — from organic hemp cultivation and CO2 extraction to product formulation, GMP manufacturing, and navigating the complex European regulatory landscape.

**Product Development & Manufacturing**
Robin has overseen the development of over 300 different CBD products, including full-spectrum and broad-spectrum CBD oils, CBG oils, CBN oils, CBD skincare, and pet products. He has direct experience with CO2 extraction processes, winterization, and decarboxylation techniques that ensure optimal cannabinoid profiles.

**Quality Standards & Certifications**
Under Robin's leadership, his companies have achieved GMP (Good Manufacturing Practice) and ISO 22716-2007 certifications — the highest standards in the industry. Every production batch undergoes third-party laboratory testing in Switzerland, with a perfect track record of zero failed tests.

**Regulatory Expertise**
Robin has navigated CBD regulations across 16+ European countries and invested significantly in EU Novel Food compliance. He is a shareholder in the EIHA Novel Food Consortium, a €3.5 million initiative to establish comprehensive safety data for CBD products in Europe.

**Scientific Research Collaboration**
Robin has established research partnerships with the University of Bologna's Department of Veterinary Medical Sciences for CBD studies in animals, and has supported human clinical research including double-blind, placebo-controlled trials in the Netherlands.

**Sustainability Commitment**
Robin's operations use 100% renewable energy (solar and hydro), state-of-the-art LED growing technology, and follow organic cultivation principles without pesticides or artificial fertilizers. Hemp's natural CO2 absorption makes his operations carbon-negative.

**Industry Leadership**
Robin is an active member of leading industry associations including:
- European Industrial Hemp Association (EIHA)
- EIHA Novel Food Consortium (shareholder)
- Swiss Medical Cannabis Association (MEDCAN)
- Swiss Hemp Producer Association (IG Hanf)
- Arge Canna (Austria)

Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.`,
        image_url: '',
        years_experience: 12,
        expertise_areas: [
          'CBD Oils (Full-spectrum & Broad-spectrum)',
          'CBG & CBN Cannabinoids',
          'CBD for Pets (Dogs, Cats, Horses)',
          'CBD Skincare & Cosmetics',
          'CO2 Extraction Methods',
          'GMP Manufacturing Standards',
          'EU Novel Food Regulations',
          'Third-party Lab Testing',
          'Organic Hemp Cultivation',
          'European CBD Market',
          'Product Quality Control',
          'Cannabinoid Science'
        ],
        article_count: articles.length,
        is_verified: true,
        is_primary: true,
        website_url: '',
        companies: [
          {
            name: 'CBD Industry Pioneer',
            role: 'Since 2013',
            location: 'Europe',
            description: 'Founded first CBD company in 2013, building extensive experience across product development, manufacturing, and European regulatory compliance'
          }
        ]
      };
    }
  } else {
    // Get author from database for other slugs
    const { data: authorData } = await supabase
      .from('kb_authors')
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

  // Enhanced Person schema for SEO with full E-E-A-T signals
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name || '',
    jobTitle: author.title || '',
    description: author.bio_short || '',
    url: `https://cbd-portal.vercel.app/authors/${author.slug}`,
    knowsAbout: [
      'CBD Oil',
      'Cannabidiol',
      'Hemp Products',
      'GMP Manufacturing',
      'EU Novel Food Regulations',
      'CO2 Extraction',
      'CBD for Pets',
      'CBG Products',
      'CBN Products',
      'European CBD Market',
      'Product Quality Control',
      'Cannabinoid Science'
    ],
    memberOf: [
      {
        '@type': 'Organization',
        'name': 'European Industrial Hemp Association (EIHA)'
      },
      {
        '@type': 'Organization',
        'name': 'EIHA Novel Food Consortium'
      },
      {
        '@type': 'Organization',
        'name': 'Swiss Medical Cannabis Association (MEDCAN)'
      }
    ],
    award: [
      'GMP Certification',
      'ISO 22716 Certification'
    ],
    nationality: 'Danish',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Zug',
      addressCountry: 'Switzerland'
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'CBD Industry Entrepreneur',
      occupationalCategory: 'Pharmaceutical and Biotechnology',
      skills: author.expertise_areas || []
    },
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
                <Link href={crumb.url} className="hover:text-blue-600">
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
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto md:mx-0">
                <span className="text-5xl font-bold text-white">
                  RK
                </span>
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
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                Since 2013
              </span>
            </div>

            <p className="text-xl text-blue-700 font-medium mb-2">{author.title}</p>

            {author.credentials && (
              <div className="mb-4">
                {Array.isArray(author.credentials) ? (
                  <div className="space-y-1">
                    {author.credentials.slice(0, 3).map((credential: string, index: number) => (
                      <div key={index} className="flex items-center justify-center md:justify-start text-sm text-gray-600">
                        <span className="text-blue-600 mr-2">✓</span>
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
              {(author.social_links?.linkedin || author.linkedin_url) && (
                <a
                  href={author.social_links?.linkedin || author.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {(author.social_links?.twitter || author.twitter_url) && (
                <a
                  href={author.social_links?.twitter || author.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors"
                >
                  Twitter/X
                </a>
              )}
              {(author.social_links?.website || author.website_url) && (
                <a
                  href={author.social_links?.website || author.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  Website
                </a>
              )}
              {author.social_links?.facebook && (
                <a
                  href={author.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors"
                >
                  Facebook
                </a>
              )}
              {author.social_links?.instagram && (
                <a
                  href={author.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700 transition-colors"
                >
                  Instagram
                </a>
              )}
              {author.social_links?.youtube && (
                <a
                  href={author.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  YouTube
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
                <span key={area} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
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
                  <p className="text-blue-700 text-sm">{company.role}</p>
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
                  <span className="text-blue-600">→</span>
                  <div>
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-blue-700"
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
                  className="block p-5 border rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-700">{article.title}</h3>
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
                  className="text-blue-600 hover:text-blue-800 font-medium"
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

