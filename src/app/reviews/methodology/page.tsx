import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'How We Review CBD Brands - Our Methodology | CBD Portal',
  description: 'Learn about our comprehensive 100-point scoring system for CBD brand reviews. We evaluate quality, transparency, reputation, value, and more through independent research.',
  alternates: {
    canonical: '/reviews/methodology'
  }
};

interface SubCriterion {
  id: string;
  name: string;
  max_points: number;
  description: string;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  max_points: number;
  display_order: number;
  subcriteria: SubCriterion[];
}

export default async function ReviewMethodologyPage() {
  const supabase = await createClient();

  // Fetch review criteria
  const { data: criteria } = await supabase
    .from('kb_review_criteria')
    .select('*')
    .order('display_order', { ascending: true });

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Methodology', href: '/reviews/methodology' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How We Review CBD Brands
          </h1>
          <p className="text-xl text-gray-600">
            Our comprehensive 100-point scoring system ensures every CBD brand is evaluated fairly and thoroughly.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Independence</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                At CBD Portal, we believe consumers deserve honest, unbiased information about CBD products. Our review process is designed to be thorough, consistent, and completely independent of brand influence.
              </p>
              <p>
                Every review is conducted by our team of CBD industry experts who personally research each brand. We don't accept payment for positive reviews, and brands cannot influence their scores.
              </p>
            </div>
          </section>

          {/* Research Process */}
          <section className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Research Process</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Website Analysis</h3>
                  <p className="text-gray-600">We thoroughly examine the brand's website, including product pages, about section, lab reports, and certifications.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Third-Party Reviews</h3>
                  <p className="text-gray-600">We check Trustpilot and Google Reviews to understand real customer experiences and satisfaction levels.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Lab Report Verification</h3>
                  <p className="text-gray-600">We verify the accessibility and quality of Certificates of Analysis (COAs) and third-party lab testing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Expert Scoring</h3>
                  <p className="text-gray-600">Our CBD experts score each sub-criterion individually based on evidence found during research.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Scoring System */}
          <section className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The 100-Point Scoring System</h2>
            <p className="text-gray-600 mb-6">
              Our scoring system evaluates CBD brands across 9 key categories. Each category has multiple sub-criteria, and the total adds up to 100 points.
            </p>

            <div className="space-y-6">
              {(criteria as Criterion[] || []).map((criterion, index) => (
                <div key={criterion.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-gray-900">{criterion.name}</h3>
                    </div>
                    <span className="text-green-700 font-bold">{criterion.max_points} pts</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
                    {criterion.subcriteria && criterion.subcriteria.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {criterion.subcriteria.map(sub => (
                          <div key={sub.id} className="text-xs bg-gray-100 rounded px-2 py-1">
                            <span className="text-gray-700">{sub.name}</span>
                            <span className="text-gray-400 ml-1">({sub.max_points} pts)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Score Interpretation */}
          <section className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding the Scores</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-700 mb-1">80-100</div>
                <div className="font-semibold text-green-800">Excellent</div>
                <p className="text-sm text-green-700 mt-1">Top-tier brands with exceptional quality, transparency, and customer experience.</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-700 mb-1">60-79</div>
                <div className="font-semibold text-yellow-800">Good</div>
                <p className="text-sm text-yellow-700 mt-1">Solid brands with good practices but room for improvement in some areas.</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-3xl font-bold text-orange-700 mb-1">40-59</div>
                <div className="font-semibold text-orange-800">Average</div>
                <p className="text-sm text-orange-700 mt-1">Brands meeting basic standards but lacking in several key areas.</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-3xl font-bold text-red-700 mb-1">0-39</div>
                <div className="font-semibold text-red-800">Below Average</div>
                <p className="text-sm text-red-700 mt-1">Brands with significant concerns that we recommend caution with.</p>
              </div>
            </div>
          </section>

          {/* Transparency Note */}
          <section className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Our Promise to You</h2>
            <div className="space-y-3 text-green-50">
              <p>
                <strong className="text-white">Independence:</strong> We never accept payment for reviews or allow brands to influence scores.
              </p>
              <p>
                <strong className="text-white">Transparency:</strong> Our methodology is public, and we explain every score.
              </p>
              <p>
                <strong className="text-white">Consistency:</strong> Every brand is evaluated using the same criteria and process.
              </p>
              <p>
                <strong className="text-white">Updates:</strong> We regularly re-review brands to ensure scores reflect current practices.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Browse All Reviews
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
