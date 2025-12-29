import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About CBD Knowledge Base | Evidence-Based CBD Research',
  description: 'Learn about our mission to translate peer-reviewed CBD research into accessible information. Founded by Robin Roy Krigslund-Hansen, 10+ years CBD industry experience.',
  alternates: {
    canonical: 'https://cbd-portal.vercel.app/about',
  },
};

export default function AboutPage() {
  const baseUrl = 'https://cbd-portal.vercel.app';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CBD Knowledge Base',
    url: baseUrl,
    description: 'Evidence-based CBD research translated into accessible information for consumers',
    founder: {
      '@type': 'Person',
      name: 'Robin Roy Krigslund-Hansen',
      jobTitle: 'CEO & Co-founder',
      affiliation: {
        '@type': 'Organization',
        name: 'Formula Swiss AG',
      },
    },
  };

  // Person Schema for Author
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Robin Roy Krigslund-Hansen',
    jobTitle: 'CBD Industry Expert & Researcher',
    description: 'CEO & Co-founder of Formula Swiss with over 10 years of experience in the CBD and cannabis industry',
    url: `${baseUrl}/about`,
    sameAs: [
      'https://www.formulaswiss.com',
    ],
    knowsAbout: [
      'Cannabidiol (CBD)',
      'Cannabis Research',
      'European CBD Regulations',
      'Clinical Cannabinoid Research',
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>About</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            About CBD Knowledge Base
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Translating clinical research into accessible, evidence-based information about CBD
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            <p className="mt-4 text-gray-700">
              CBD Knowledge Base exists to bridge the gap between peer-reviewed scientific research and consumer understanding. With widespread interest in cannabidiol (CBD) for health and wellness, we recognised the need for a trusted source that presents clinical evidence without commercial bias or exaggerated claims.
            </p>
            <p className="mt-4 text-gray-700">
              Our mission is to provide accurate, up-to-date information about CBD based exclusively on peer-reviewed research, clinical trials, and authoritative medical sources. We prioritise transparency, scientific rigour, and accessibility, making complex research findings understandable to consumers whilst maintaining accuracy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">About the Author</h2>
            <div className="mt-6 rounded-lg bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">Robin Roy Krigslund-Hansen</h3>
              <p className="mt-2 text-sm text-primary-600">
                CBD Industry Expert | 10+ Years Experience | Switzerland-Based
              </p>
              <p className="mt-4 text-gray-700">
                Robin Roy Krigslund-Hansen has worked in the CBD and cannabis industry since 2013, witnessing the field's evolution from emerging research to mainstream medical applications. As CEO and co-founder of Formula Swiss AG, a Switzerland-based CBD company, Robin has navigated the complex landscape of European CBD regulations whilst maintaining a commitment to evidence-based product development.
              </p>
              <p className="mt-4 text-gray-700">
                Based in Switzerland, Robin focuses on translating clinical research into accessible information for consumers. His approach prioritises peer-reviewed evidence and regulatory developments across European markets, drawing on over a decade of industry experience to provide context and practical insights alongside scientific findings.
              </p>
              <p className="mt-4 text-gray-700">
                Robin's work with CBD Knowledge Base reflects his belief that consumers deserve accurate, unbiased information about CBD—free from commercial interests and grounded in the best available scientific evidence.
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> The opinions expressed in articles on this site are Robin's own and do not represent the views of Formula Swiss AG.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Editorial Standards</h2>
            <p className="mt-4 text-gray-700">
              Every article on CBD Knowledge Base adheres to strict editorial standards designed to ensure accuracy, reliability, and scientific integrity:
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Peer-Reviewed Sources Only</h3>
                <p className="mt-2 text-gray-700">
                  We cite only peer-reviewed research published in recognised scientific journals, clinical trial data, and information from authoritative medical institutions (FDA, EMA, WHO, NIH) and established medical centres (Mayo Clinic, Cleveland Clinic, Johns Hopkins).
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">No Commercial Bias</h3>
                <p className="mt-2 text-gray-700">
                  We never link to CBD companies, e-commerce sites, or commercial interests. Our focus is solely on presenting research findings, not promoting products or brands.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Current Research</h3>
                <p className="mt-2 text-gray-700">
                  We prioritise recent studies (2023-2025) to ensure information reflects the latest scientific understanding, whilst also referencing foundational research where relevant.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Balanced Presentation</h3>
                <p className="mt-2 text-gray-700">
                  We present both positive and negative findings, acknowledge research limitations, and clearly distinguish between preclinical studies, small pilot trials, and large-scale randomised controlled trials.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Medical Disclaimers</h3>
                <p className="mt-2 text-gray-700">
                  Every article includes clear medical disclaimers emphasising that our content is for informational purposes only and should not replace professional medical advice.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">Transparency</h3>
                <p className="mt-2 text-gray-700">
                  We provide full citations with DOIs where available, enabling readers to access original research. We clearly identify the strength of evidence behind each claim.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Our Approach</h2>
            <p className="mt-4 text-gray-700">
              CBD research is rapidly evolving. What we know today may be refined or revised as new studies emerge. Our commitment is to:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
              <li>Update articles as significant new research is published</li>
              <li>Clearly distinguish between established findings and emerging evidence</li>
              <li>Acknowledge gaps in current research and areas requiring further study</li>
              <li>Present dosage information from clinical trials without making specific recommendations</li>
              <li>Highlight the importance of individual variation and medical supervision</li>
              <li>Maintain scientific accuracy whilst making information accessible to non-specialists</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Contact & Feedback</h2>
            <p className="mt-4 text-gray-700">
              We welcome feedback about our content, corrections to any inaccuracies, and suggestions for topics to cover. Whilst we cannot provide personal medical advice, we're committed to improving our resources and addressing gaps in the information we provide.
            </p>
            <p className="mt-4 text-gray-700">
              If you notice an error, have access to new research we should consider, or have suggestions for improving our content, please reach out. Scientific understanding of CBD continues to evolve, and we're committed to keeping pace with the latest evidence.
            </p>
          </section>

          <div className="mt-12 rounded-lg border border-primary-200 bg-primary-50 p-6">
            <h3 className="font-semibold text-primary-900">Disclosure</h3>
            <p className="mt-2 text-sm text-primary-800">
              Robin Roy Krigslund-Hansen is CEO and co-founder of Formula Swiss AG, a Switzerland-based CBD company. CBD Knowledge Base operates independently with a focus on evidence-based information. We do not promote specific products or brands, and our editorial standards prioritise scientific accuracy over commercial interests.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            Explore Articles →
          </Link>
        </div>
      </div>
    </>
  );
}
