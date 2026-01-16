/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
};

module.exports = nextConfig;
