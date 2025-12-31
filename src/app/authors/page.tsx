import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Expert Authors | CBD Portal',
  description: 'Meet our team of CBD industry experts and researchers.',
  alternates: {
    canonical: '/authors',
  },
};

interface Author {
  id: string;
  name: string;
  slug: string;
  title: string;
  credentials: string[];
  bio_short: string;
  image_url: string;
  years_experience: number;
  expertise_areas: string[];
  article_count: number;
  is_verified: boolean;
  is_primary: boolean;
  website_url?: string;
  companies?: { name: string; role: string }[];
}

export default async function AuthorsPage() {
  const supabase = await createClient();

  // Get authors from authors table, fallback to mock data if table doesn't exist
  let authors: Author[] = [];
  let totalArticles = 0;

  try {
    const { data: authorsData, error } = await supabase
      .from('authors')
      .select('*')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('article_count', { ascending: false });

    if (error) {
      console.log('authors table not found, using fallback data');

      // Get total article count for fallback
      const { count } = await supabase
        .from('kb_articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      totalArticles = count || 0;

      // Create Formula Swiss author data until table is created
      authors = [{
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
        article_count: totalArticles,
        is_verified: true,
        is_primary: true,
        website_url: 'https://formulaswiss.com',
        companies: [
          { name: 'Formula Swiss AG', role: 'Swiss flagship company' },
          { name: 'Formula Swiss Wholesale AG', role: 'B2B division' },
          { name: 'Formula Swiss UK Ltd.', role: 'UK operations' },
          { name: 'Formula Swiss Europe Ltd.', role: 'EU distribution' },
          { name: 'Formula Swiss Medical Ltd.', role: 'Medical division' }
        ]
      }];
    } else {
      authors = authorsData || [];
      totalArticles = authors?.reduce((sum, a) => sum + (a.article_count || 0), 0) || 0;
    }
  } catch (error) {
    console.error('Error fetching authors:', error);
    authors = [];
  }

  // Calculate total stats
  const totalYears = authors?.reduce((sum, a) => sum + (a.years_experience || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Our Expert Authors</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Our content is written by industry experts with real-world experience in CBD product development,
          cannabinoid research, and health science. Every article is backed by peer-reviewed research
          and decades of combined industry knowledge.
        </p>

        {/* Trust stats */}
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{authors?.length || 0}</div>
            <div className="text-sm text-gray-500">Expert Authors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{totalYears}+</div>
            <div className="text-sm text-gray-500">Combined Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">{totalArticles}</div>
            <div className="text-sm text-gray-500">Articles Published</div>
          </div>
        </div>
      </div>

      {/* Authors grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {authors?.map((author) => (
          <Link
            key={author.id}
            href={`/authors/${author.slug}`}
            className="group bg-white border rounded-xl p-6 hover:shadow-xl hover:border-green-300 transition-all"
          >
            <div className="flex gap-5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {author.image_url ? (
                  <img
                    src={author.image_url}
                    alt={author.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    {author.slug === 'formula-swiss' ? (
                      <span className="text-2xl text-green-700">🏢</span>
                    ) : (
                      <span className="text-3xl text-green-700">
                        {author.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold group-hover:text-green-700 transition-colors">
                    {author.name}
                  </h2>
                  {author.is_verified && (
                    <span className="text-blue-500" title="Verified Expert">✓</span>
                  )}
                  {author.slug === 'formula-swiss' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                      Since 2013
                    </span>
                  )}
                </div>

                <p className="text-green-700 font-medium text-sm mb-2">{author.title}</p>

                {author.credentials && Array.isArray(author.credentials) && author.credentials.length > 0 && (
                  <div className="text-gray-500 text-sm mb-3">
                    <div className="flex flex-wrap gap-1">
                      {author.credentials.slice(0, 2).map((credential, index) => (
                        <span key={index} className="flex items-center">
                          <span className="text-green-600 mr-1">✓</span>
                          <span>{credential}</span>
                          {index < author.credentials.length - 1 && index < 1 && <span className="ml-2">•</span>}
                        </span>
                      ))}
                      {author.credentials.length > 2 && (
                        <span className="text-gray-400">
                          +{author.credentials.length - 2} more credentials
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{author.bio_short}</p>

                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">
                    <strong className="text-gray-700">{author.years_experience}+</strong> years
                  </span>
                  <span className="text-gray-500">
                    <strong className="text-gray-700">{author.article_count}</strong> articles
                  </span>
                </div>

                {/* Expertise tags */}
                {author.expertise_areas && author.expertise_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {author.expertise_areas.slice(0, 3).map((area) => (
                      <span key={area} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {area}
                      </span>
                    ))}
                    {author.expertise_areas.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-400 text-xs">
                        +{author.expertise_areas.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Editorial standards note */}
      <div className="mt-16 bg-green-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Our Editorial Standards</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Every piece of content on CBD Portal undergoes rigorous fact-checking and is supported by
          citations from peer-reviewed research. Our authors follow strict editorial guidelines to
          ensure accuracy, transparency, and trustworthiness.
        </p>
        <Link
          href="/editorial-policy"
          className="text-green-600 hover:text-green-800 font-medium"
        >
          Read our Editorial Policy →
        </Link>
      </div>
    </div>
  );
}