import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CBD Portal | Evidence-Based CBD Information',
  description: 'CBD Portal provides evidence-based CBD information written by industry experts.',
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const supabase = createClient();

  // Get stats
  const { count: articleCount } = await supabase
    .from('kb_articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: researchCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { data: authors } = await supabase
    .from('kb_authors')
    .select('years_experience')
    .eq('is_active', true);

  const totalExperience = authors?.reduce((sum, a) => sum + (a.years_experience || 0), 0) || 0;

  // Organization schema
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CBD Portal',
    url: 'https://cbd-portal.vercel.app',
    logo: 'https://cbd-portal.vercel.app/logo.png',
    description: 'Evidence-based CBD information backed by peer-reviewed research',
    foundingDate: '2024',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@cbdportal.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About CBD Portal</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide evidence-based CBD information written by industry experts
            and backed by peer-reviewed scientific research.
          </p>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-700">{researchCount || 0}+</div>
            <div className="text-sm text-gray-600">Research Studies</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-3xl font-bold text-blue-700">{totalExperience}+</div>
            <div className="text-sm text-gray-600">Years Combined Experience</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="text-3xl font-bold text-purple-700">{articleCount || 0}</div>
            <div className="text-sm text-gray-600">Expert Articles</div>
          </div>
          <div className="text-center p-6 bg-orange-50 rounded-xl">
            <div className="text-3xl font-bold text-orange-700">{authors?.length || 0}</div>
            <div className="text-sm text-gray-600">Expert Authors</div>
          </div>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <div className="prose prose-green max-w-none">
            <p>
              CBD Portal was created to provide clear, accurate, and trustworthy information about
              cannabidiol (CBD) and its potential health applications. In a market flooded with
              misinformation and exaggerated claims, we believe consumers deserve access to
              evidence-based content they can trust.
            </p>
            <p>
              Our content is written by industry professionals with real-world experience in CBD
              product development, research, and regulatory compliance. Every claim is supported
              by citations from peer-reviewed scientific literature.
            </p>
          </div>
        </section>

        {/* What makes us different */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🔬</div>
              <h3 className="font-semibold text-lg mb-2">Evidence-Based Content</h3>
              <p className="text-gray-600 text-sm">
                Every article is backed by citations from peer-reviewed research. We don't make
                claims we can't support with scientific evidence.
              </p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">👨‍🔬</div>
              <h3 className="font-semibold text-lg mb-2">Expert Authors</h3>
              <p className="text-gray-600 text-sm">
                Our content is written by industry professionals with decades of combined
                experience in CBD product development and research.
              </p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg mb-2">No Exaggerated Claims</h3>
              <p className="text-gray-600 text-sm">
                We present research findings honestly, including limitations. We never promise
                miracle cures or guaranteed results.
              </p>
            </div>
            <div className="p-6 border rounded-xl">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="font-semibold text-lg mb-2">Regularly Updated</h3>
              <p className="text-gray-600 text-sm">
                CBD research is rapidly evolving. We continuously update our content to reflect
                the latest scientific findings.
              </p>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Our Expert Team</h2>
          <p className="text-gray-600 mb-6">
            Our authors are CBD industry veterans with hands-on experience in product development,
            regulatory compliance, and scientific research. They bring practical knowledge that
            goes beyond academic theory.
          </p>
          <Link
            href="/authors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Meet Our Authors
            <span>→</span>
          </Link>
        </section>

        {/* Editorial standards */}
        <section className="mb-16 bg-gray-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Our Editorial Standards</h2>
          <p className="text-gray-600 mb-6">
            We maintain rigorous editorial standards to ensure the accuracy and trustworthiness
            of our content. Learn more about how we research, write, and review our articles.
          </p>
          <Link
            href="/editorial-policy"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            Read our Editorial Policy →
          </Link>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-green-700 text-white rounded-xl p-10">
          <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
          <p className="text-green-100 mb-6">
            We're here to help. Reach out with questions, feedback, or correction requests.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </>
  );
}