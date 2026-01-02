import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // For fallback case when table doesn't exist
  if (params.slug === 'robin-roy-krigslund-hansen') {
    return {
      title: 'Robin Roy Krigslund-Hansen - CBD Products Expert & Formula Swiss Co-founder | CBD Portal',
      description: 'Meet Robin Roy Krigslund-Hansen, Swiss CBD products expert and co-founder of Formula Swiss AG. Academic background with university studies, legal advocate suing MPA Sweden and Kanton Zug, serving 100,000+ customers.',
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
        title: 'CBD Products Expert, Industry Pioneer & Co-founder of Formula Swiss AG',
        location: 'Zug, Switzerland',
        credentials: [
          'Co-founder, Formula Swiss AG (2013-present)',
          'CBD Products Expert & Industry Pioneer',
          'Extensive academic background (studied at university 4 times)',
          'Expert on European CBD and cannabis laws',
          'Legal advocate - sued MPA Sweden, Kanton Zug (Supreme Court case)',
          '12+ years in CBD industry',
          'Developed 300+ CBD product formulations',
          'GMP & ISO 22716 certified operations',
          'EU Novel Food Consortium shareholder',
          'University research collaborations',
          'Zero failed third-party lab tests',
          'Served 100,000+ customers across 60+ countries',
          'Operations in 16+ European countries',
          '100% renewable energy production',
          'EIHA member (European Industrial Hemp Association)',
          'MEDCAN supporter (Swiss Medical Cannabis Association)',
          'Organic cultivation expertise',
          'CO2 extraction specialist'
        ],
        bio_short: 'Swiss entrepreneur, CBD products expert, and industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe\'s leading CBD companies. With over 12 years of hands-on experience and extensive academic background (studied at university 4 times), he has served 100,000+ customers across 60+ countries and developed 300+ CBD product formulations under GMP certification standards.',
        bio_full: `Robin Roy Krigslund-Hansen is a Swiss entrepreneur, CBD products expert, and CBD industry pioneer who co-founded Formula Swiss AG in 2013, establishing one of Europe's most trusted CBD companies. Robin has built an extensive track record in the cannabinoid industry spanning over 12 years.

**Company Leadership & Achievements**
As Co-founder of Formula Swiss AG and an extensive network of related international entities including Formula Swiss UK Ltd., Formula Swiss Medical Ltd., Formula Swiss Europe Ltd., Formula Swiss Portugal Ltd., and Zonaverde SRL, Robin has built a comprehensive European CBD business ecosystem. Through these strategically positioned companies across multiple jurisdictions, Robin has served over 100,000 customers across 60+ countries and developed 300+ different CBD product formulations.

Robin has invested €1+ million in EU product compliance and registrations while maintaining a perfect track record with zero failed third-party lab tests. Under his leadership, the companies have achieved GMP (Good Manufacturing Practice) certification and obtained ISO 22716-2007 certification, representing the highest standards in the industry. Every production batch undergoes third-party laboratory testing in Switzerland, ensuring consistent quality and safety.

**Academic Background & Legal Expertise**
Robin holds an extensive academic background, having studied at university 4 times, which provides the scientific foundation for his expertise in CBD products and cannabinoid science. He is recognized as an expert on national and European laws surrounding CBD and cannabis in Europe.

Robin is well-known for his groundbreaking legal advocacy work, including suing the MPA (Medical Products Agency) in Sweden and taking on the Kanton of Zug in Switzerland, with the latter case currently in the Supreme Court. These landmark cases demonstrate his commitment to challenging restrictive cannabis regulations and advancing industry rights across Europe.

**Product Development & Manufacturing**
Robin has developed over 300 different CBD products, including full-spectrum and broad-spectrum CBD oils, CBG oils, CBN oils, CBD skincare, and pet products.

**Scientific Research Collaboration**
Robin has established research partnerships with the University of Bologna's Department of Veterinary Medical Sciences for CBD studies in animals, and has supported human clinical research including double-blind, placebo-controlled trials in the Netherlands. As a significant sponsor of CBD research for animals in Europe, Robin and Formula Swiss have contributed to advancing veterinary cannabinoid science.

Beyond research funding, Robin has authored hundreds of expert articles about CBD and cannabis, sharing evidence-based insights with both consumers and industry professionals. His expertise is regularly sought by major media channels for interviews and commentary on CBD industry developments and regulatory matters.

**Regulatory Expertise**
Robin has navigated CBD regulations across 16+ European countries and invested significantly in EU Novel Food compliance. He is a shareholder in the EIHA Novel Food Consortium, a €3.5 million initiative to establish comprehensive safety data for CBD products in Europe. His expertise extends to being a recognized authority on national and European cannabis laws.

**Industry Leadership**
Robin is an active member of leading industry associations including the European Industrial Hemp Association (EIHA), where he serves as a shareholder in the EIHA Novel Food Consortium. He maintains memberships with the Swiss Medical Cannabis Association (MEDCAN), Swiss Hemp Producer Association (IG Hanf), and Arge Canna (Austria). Through these affiliations, Robin actively contributes to shaping industry standards and advancing CBD research initiatives across Europe.

**Independent Research & Education**
Through this portal, Robin shares his decade-plus of practical experience to provide accurate, evidence-based information about CBD products, helping consumers separate fact from marketing hype.`,
        image_url: '',
        years_experience: 12,
        expertise_areas: [
          // Products & Manufacturing
          'CBD Oils (Full-spectrum & Broad-spectrum)',
          'CBG & CBN Cannabinoids',
          'CBD for Pets (Dogs, Cats, Horses)',
          'CBD Skincare & Cosmetics',
          'CO2 Extraction Methods',
          'GMP Manufacturing Standards',

          // Legal & Regulatory
          'European Cannabis Law',
          'Legal Advocacy & Regulatory Reform',
          'EU Novel Food Regulations',
          'Third-party Lab Testing',

          // Business & Research
          'Formula Swiss Operations',
          'CBD Industry Leadership',
          'Academic Research & Science',
          'International Market Expansion',

          // Specialized Areas
          'CBD Products Expertise',
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
    nationality: 'Swiss',
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
        <Breadcrumbs items={breadcrumbs} />

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

      </div>

      {/* Comprehensive Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Person',
                '@id': `https://cbd-portal.vercel.app/authors/robin-roy-krigslund-hansen`,
                name: 'Robin Roy Krigslund-Hansen',
                alternateName: ['Robin Krigslund-Hansen', 'Robin Roy Krigslund Hansen'],
                jobTitle: 'CBD Products Expert, Industry Pioneer & Co-founder of Formula Swiss AG',
                description: author.bio_short,
                image: author.image_url || 'https://cbd-portal.vercel.app/images/robin-author.jpg',
                url: `https://cbd-portal.vercel.app/authors/robin-roy-krigslund-hansen`,
                sameAs: [
                  'https://formulaswiss.com',
                  'https://linkedin.com/in/robinroykh'
                ],
                nationality: 'Swiss',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Zug',
                  addressCountry: 'Switzerland'
                },
                educationalCredential: [
                  {
                    '@type': 'EducationalOccupationalCredential',
                    name: 'University Studies',
                    description: 'Extensive academic background with university studies completed 4 times',
                    credentialCategory: 'degree'
                  }
                ],
                hasOccupation: [
                  {
                    '@type': 'Occupation',
                    name: 'CBD Products Expert',
                    occupationLocation: {
                      '@type': 'Country',
                      name: 'Switzerland'
                    }
                  },
                  {
                    '@type': 'Occupation',
                    name: 'Legal Advocate',
                    description: 'Cannabis law reform advocate with cases against MPA Sweden and Kanton of Zug'
                  },
                  {
                    '@type': 'Occupation',
                    name: 'Industry Pioneer',
                    description: '12+ years in CBD industry since 2013'
                  }
                ],
                founder: [
                  {
                    '@type': 'Organization',
                    name: 'Formula Swiss AG',
                    foundingDate: '2013',
                    description: 'Leading European CBD company',
                    address: {
                      '@type': 'PostalAddress',
                      addressCountry: 'Switzerland'
                    }
                  }
                ],
                memberOf: [
                  {
                    '@type': 'Organization',
                    name: 'European Industrial Hemp Association',
                    alternateName: 'EIHA'
                  },
                  {
                    '@type': 'Organization',
                    name: 'EIHA Novel Food Consortium',
                    description: 'Shareholder in €3.5 million CBD safety research initiative'
                  },
                  {
                    '@type': 'Organization',
                    name: 'Swiss Medical Cannabis Association',
                    alternateName: 'MEDCAN'
                  },
                  {
                    '@type': 'Organization',
                    name: 'Swiss Hemp Producer Association',
                    alternateName: 'IG Hanf'
                  },
                  {
                    '@type': 'Organization',
                    name: 'Arge Canna Austria'
                  }
                ],
                award: [
                  'Perfect third-party lab testing record (zero failed tests)',
                  'GMP (Good Manufacturing Practice) certification',
                  'ISO 22716-2007 certification',
                  'Served 100,000+ customers across 60+ countries',
                  '300+ CBD product formulations developed'
                ],
                knowsAbout: [
                  'CBD Products',
                  'European Cannabis Law',
                  'Legal Advocacy',
                  'Regulatory Reform',
                  'Cannabinoid Science',
                  'GMP Manufacturing',
                  'EU Novel Food Regulations',
                  'CO2 Extraction',
                  'Third-party Lab Testing',
                  'Hemp Cultivation',
                  'Product Development'
                ],
                publishingPrinciples: {
                  '@type': 'CreativeWork',
                  name: 'Evidence-based CBD Education',
                  description: 'Hundreds of expert articles about CBD and cannabis, sharing evidence-based insights with consumers and industry professionals'
                }
              },
              {
                '@type': 'Organization',
                '@id': 'https://formulaswiss.com',
                name: 'Formula Swiss AG',
                foundingDate: '2013',
                founder: {
                  '@type': 'Person',
                  '@id': `https://cbd-portal.vercel.app/authors/robin-roy-krigslund-hansen`
                },
                address: {
                  '@type': 'PostalAddress',
                  addressCountry: 'Switzerland'
                },
                description: 'Leading European CBD company with GMP certification and operations across 16+ European countries',
                parentOrganization: [
                  {
                    '@type': 'Organization',
                    name: 'Formula Swiss UK Ltd.',
                    foundingDate: '2013',
                    address: {
                      '@type': 'PostalAddress',
                      addressCountry: 'United Kingdom'
                    }
                  },
                  {
                    '@type': 'Organization',
                    name: 'Formula Swiss Medical Ltd.',
                    foundingDate: '2013',
                    description: 'Medical-grade CBD research and development'
                  },
                  {
                    '@type': 'Organization',
                    name: 'Formula Swiss Europe Ltd.',
                    foundingDate: '2013',
                    description: 'European CBD distribution network'
                  },
                  {
                    '@type': 'Organization',
                    name: 'Formula Swiss Portugal Ltd.',
                    foundingDate: '2013',
                    address: {
                      '@type': 'PostalAddress',
                      addressCountry: 'Portugal'
                    }
                  },
                  {
                    '@type': 'Organization',
                    name: 'Zonaverde SRL',
                    foundingDate: '2013',
                    description: 'European CBD business operations'
                  }
                ]
              }
            ]
          })
        }}
      />
    </>
  );
}

