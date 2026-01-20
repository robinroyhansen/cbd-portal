'use client';

import Link from 'next/link';
import { getCountryWithFlag } from '@/lib/utils/brand-helpers';
import { formatDate } from '@/lib/locale';

interface Author {
  name: string;
  slug: string;
}

interface QuickFactsProps {
  brand: {
    name: string;
    headquarters_country: string | null;
    founded_year: number | null;
    website_url: string | null;
    certifications: string[] | null;
  };
  review: {
    overall_score: number;
    trustpilot_score: number | null;
    trustpilot_count: number | null;
    trustpilot_url: string | null;
    last_reviewed_at: string | null;
    author: Author | null;
  };
}

function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function QuickFacts({ brand, review }: QuickFactsProps) {
  const facts: { label: string; value: React.ReactNode }[] = [];

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

  // Website
  if (brand.website_url) {
    facts.push({
      label: 'Website',
      value: getDomainFromUrl(brand.website_url),
    });
  }

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
          <span className="mr-1">⭐</span>
          {review.trustpilot_score}/5
          {review.trustpilot_count && ` (${review.trustpilot_count.toLocaleString()} reviews)`}
          <span className="ml-1">↗</span>
        </a>
      ) : (
        <span>
          <span className="mr-1">⭐</span>
          {review.trustpilot_score}/5
          {review.trustpilot_count && ` (${review.trustpilot_count.toLocaleString()} reviews)`}
        </span>
      ),
    });
  }

  // Reviewed By (Author)
  if (review.author) {
    facts.push({
      label: 'Reviewed By',
      value: (
        <Link
          href={`/authors/${review.author.slug}`}
          className="text-green-600 hover:text-green-700"
        >
          {review.author.name}
        </Link>
      ),
    });
  }

  // Last Reviewed
  if (review.last_reviewed_at) {
    facts.push({
      label: 'Last Reviewed',
      value: formatDate(review.last_reviewed_at),
    });
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
