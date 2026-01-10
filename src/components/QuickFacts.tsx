'use client';

import { getCountryWithFlag } from '@/lib/utils/brand-helpers';

interface QuickFactsProps {
  brand: {
    name: string;
    website_url: string | null;
    headquarters_country: string | null;
    founded_year: number | null;
    certifications: string[] | null;
  };
  review: {
    overall_score: number;
    trustpilot_score: number | null;
    trustpilot_count: number | null;
    trustpilot_url: string | null;
  };
}

const CERTIFICATION_LABELS: Record<string, string> = {
  'gmp': 'GMP Certified',
  'third_party_tested': 'Third-Party Tested',
  'iso_certified': 'ISO Certified',
  'non_gmo': 'Non-GMO',
  'vegan': 'Vegan',
  'cruelty_free': 'Cruelty-Free',
  'usda_organic': 'USDA Organic',
  'us_hemp_authority': 'US Hemp Authority',
  'eu_organic': 'EU Organic',
  'novel_food': 'Novel Food',
};

function getDomainFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Below Average';
}

export function QuickFacts({ brand, review }: QuickFactsProps) {
  const facts: { label: string; value: React.ReactNode }[] = [];

  // Our Score
  facts.push({
    label: 'Our Score',
    value: (
      <span className="font-bold text-green-600">
        {review.overall_score}/100 ({getScoreLabel(review.overall_score)})
      </span>
    ),
  });

  // Trustpilot
  if (review.trustpilot_score) {
    facts.push({
      label: 'Trustpilot',
      value: review.trustpilot_url ? (
        <a
          href={review.trustpilot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-700"
        >
          {review.trustpilot_score}/5
          {review.trustpilot_count && ` (${review.trustpilot_count.toLocaleString()} reviews)`}
          <span className="ml-1">↗</span>
        </a>
      ) : (
        <span>
          {review.trustpilot_score}/5
          {review.trustpilot_count && ` (${review.trustpilot_count.toLocaleString()} reviews)`}
        </span>
      ),
    });
  }

  // Headquarters
  if (brand.headquarters_country) {
    facts.push({
      label: 'Headquarters',
      value: getCountryWithFlag(brand.headquarters_country),
    });
  }

  // Founded
  if (brand.founded_year) {
    facts.push({
      label: 'Founded',
      value: brand.founded_year.toString(),
    });
  }

  // Website (plain text, no link - SEO strategy)
  if (brand.website_url) {
    facts.push({
      label: 'Website',
      value: <span className="text-gray-700">{getDomainFromUrl(brand.website_url)}</span>,
    });
  }

  // Certifications
  if (brand.certifications && brand.certifications.length > 0) {
    const certNames = brand.certifications
      .map(c => CERTIFICATION_LABELS[c])
      .filter(Boolean);
    if (certNames.length > 0) {
      facts.push({
        label: 'Certifications',
        value: (
          <div className="flex flex-wrap gap-1">
            {certNames.slice(0, 3).map((cert, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
              >
                {cert}
              </span>
            ))}
            {certNames.length > 3 && (
              <span className="text-gray-500 text-xs">+{certNames.length - 3} more</span>
            )}
          </div>
        ),
      });
    }
  }

  if (facts.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Quick Facts
      </h3>
      <dl className="space-y-3">
        {facts.map((fact, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <dt className="text-sm text-gray-500">{fact.label}</dt>
            <dd className="text-sm text-gray-900 sm:text-right">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
