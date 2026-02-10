/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      // Glossary abbreviation redirects (301 permanent for SEO)
      {
        source: '/glossary/cbd',
        destination: '/glossary/cannabidiol',
        permanent: true,
      },
      {
        source: '/glossary/thc',
        destination: '/glossary/tetrahydrocannabinol',
        permanent: true,
      },
      {
        source: '/glossary/cbg',
        destination: '/glossary/cannabigerol',
        permanent: true,
      },
      {
        source: '/glossary/cbn',
        destination: '/glossary/cannabinol',
        permanent: true,
      },
      {
        source: '/glossary/cbc',
        destination: '/glossary/cannabichromene',
        permanent: true,
      },
      {
        source: '/glossary/ecs',
        destination: '/glossary/endocannabinoid-system',
        permanent: true,
      },
      {
        source: '/glossary/coa',
        destination: '/glossary/certificate-of-analysis',
        permanent: true,
      },
      // Note: cbda, thca, thcv, cbdv, rso, gmp already have short slugs - no redirect needed
    ];
  },
  async rewrites() {
    return [
      // Finnish localized routes (as fallback to middleware)
      {
        source: '/tutkimus',
        destination: '/research?lang=fi',
      },
      {
        source: '/tyokalut',
        destination: '/tools?lang=fi',
      },
      {
        source: '/sairaudet',
        destination: '/conditions?lang=fi',
      },
      {
        source: '/artikkelit',
        destination: '/articles?lang=fi',
      },
      {
        source: '/sanasto',
        destination: '/glossary?lang=fi',
      },
      {
        source: '/tietoja',
        destination: '/about?lang=fi',
      },
      {
        source: '/yhteystiedot',
        destination: '/contact?lang=fi',
      },
      {
        source: '/lemmikit',
        destination: '/pets?lang=fi',
      },
      {
        source: '/arvostelut',
        destination: '/reviews?lang=fi',
      },
      {
        source: '/kategoriat',
        destination: '/categories?lang=fi',
      },
      {
        source: '/kirjoittajat',
        destination: '/authors?lang=fi',
      },
      {
        source: '/haku',
        destination: '/search?lang=fi',
      },
      {
        source: '/tunnisteet',
        destination: '/tags?lang=fi',
      },
      {
        source: '/aiheet',
        destination: '/topics?lang=fi',
      },
      // Finnish tools
      {
        source: '/annostus-laskuri',
        destination: '/dosage-calculator?lang=fi',
      },
      {
        source: '/elain-annostus-laskuri',
        destination: '/animal-dosage-calculator?lang=fi',
      },
      {
        source: '/hinta-laskuri',
        destination: '/cost-calculator?lang=fi',
      },
      {
        source: '/vahvuus-laskuri',
        destination: '/strength-calculator?lang=fi',
      },
      {
        source: '/yhteisvaikutukset',
        destination: '/interactions?lang=fi',
      },
      {
        source: '/tuotehaku',
        destination: '/product-finder?lang=fi',
      },
      // Finnish pet categories
      {
        source: '/koirat',
        destination: '/dogs?lang=fi',
      },
      {
        source: '/kissat',
        destination: '/cats?lang=fi',
      },
      {
        source: '/hevoset',
        destination: '/horses?lang=fi',
      },
      {
        source: '/pikkulemmikit',
        destination: '/small-pets?lang=fi',
      },
      {
        source: '/linnut',
        destination: '/birds?lang=fi',
      },
      // Finnish legal pages
      {
        source: '/laaketieteen-vastuuvapautuslauseke',
        destination: '/medical-disclaimer?lang=fi',
      },
      {
        source: '/toimituskasitanto',
        destination: '/editorial-policy?lang=fi',
      },
      {
        source: '/tietosuojakasitanto',
        destination: '/privacy-policy?lang=fi',
      },
      {
        source: '/kayttoehdot',
        destination: '/terms-of-service?lang=fi',
      },
      {
        source: '/evastekasitanto',
        destination: '/cookie-policy?lang=fi',
      },
      {
        source: '/menetelmat',
        destination: '/methodology?lang=fi',
      },
      {
        source: '/kategoria',
        destination: '/category?lang=fi',
      },
    ];
  },
};

module.exports = nextConfig;
