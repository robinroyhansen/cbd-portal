'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { OverallStarRating } from './StarRating';

interface RelatedBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  headquarters_country: string | null;
  overall_score: number;
}

interface RelatedReviewsProps {
  brands: RelatedBrand[];
  currentBrandId: string;
}

// Country code to flag emoji
function getCountryFlag(countryCode: string | null): string {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export function RelatedReviews({ brands, currentBrandId }: RelatedReviewsProps) {
  // Filter out current brand and limit to 4
  const relatedBrands = brands
    .filter(b => b.id !== currentBrandId)
    .slice(0, 4);

  if (relatedBrands.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">You might also consider</h2>
      <p className="text-sm text-gray-500 mb-6">Other CBD brands we've reviewed</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedBrands.map(brand => (
          <Link
            key={brand.id}
            href={`/reviews/${brand.slug}`}
            className="group block p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
          >
            {/* Logo */}
            <div className="flex justify-center mb-3">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-16 h-16 rounded-lg object-contain bg-white border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400">
                  {brand.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-gray-900 text-center group-hover:text-green-700 transition-colors truncate">
              {brand.name}
            </h3>

            {/* Country */}
            {brand.headquarters_country && (
              <p className="text-sm text-gray-500 text-center mt-1">
                {getCountryFlag(brand.headquarters_country)}
              </p>
            )}

            {/* Score */}
            <div className="flex flex-col items-center mt-3 gap-1">
              <span className={`px-2 py-0.5 rounded text-sm font-bold ${getScoreBadgeColor(brand.overall_score)}`}>
                {brand.overall_score}/100
              </span>
              <OverallStarRating score={brand.overall_score} size="sm" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
