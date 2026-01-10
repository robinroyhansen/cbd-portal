/**
 * Generates FAQ items for a brand review based on brand data
 */

interface BrandData {
  name: string;
  headquarters_country?: string | null;
  founded_year?: number | null;
  certifications?: string[] | null;
  website_url?: string | null;
}

interface ReviewData {
  overall_score: number;
  trustpilot_score?: number | null;
  summary?: string | null;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Country code to full name mapping
const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'UK': 'United Kingdom',
  'DE': 'Germany',
  'DK': 'Denmark',
  'NL': 'Netherlands',
  'CH': 'Switzerland',
  'FR': 'France',
  'ES': 'Spain',
  'IT': 'Italy',
  'CA': 'Canada',
  'AU': 'Australia',
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

function getScoreDescription(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 70) return 'very good';
  if (score >= 60) return 'good';
  if (score >= 50) return 'average';
  return 'below average';
}

export function generateFAQs(brand: BrandData, review: ReviewData): FAQItem[] {
  const faqs: FAQItem[] = [];

  // 1. Is [Brand] legit?
  faqs.push({
    question: `Is ${brand.name} legit?`,
    answer: `Yes, ${brand.name} is a legitimate CBD company${brand.headquarters_country ? ` based in ${getCountryName(brand.headquarters_country)}` : ''}${brand.founded_year ? `, established in ${brand.founded_year}` : ''}. Our comprehensive review scored them ${review.overall_score}/100, which is considered ${getScoreDescription(review.overall_score)}. ${review.trustpilot_score ? `They have a ${review.trustpilot_score}/5 rating on Trustpilot.` : ''}`
  });

  // 2. Does [Brand] offer third-party testing?
  const hasLabTesting = brand.certifications?.some(c =>
    c.toLowerCase().includes('lab') || c.toLowerCase().includes('test') || c.toLowerCase().includes('coa')
  );
  faqs.push({
    question: `Does ${brand.name} offer third-party testing?`,
    answer: hasLabTesting
      ? `Yes, ${brand.name} provides third-party lab testing for their CBD products. This ensures product quality, potency verification, and safety testing for contaminants.`
      : `${brand.name}'s third-party testing practices are detailed in our full review. We evaluate all brands on their transparency and lab testing availability as part of our scoring methodology.`
  });

  // 3. What is [Brand]'s return policy?
  faqs.push({
    question: `What is ${brand.name}'s return policy?`,
    answer: `${brand.name}'s specific return policy details can be found on their official website${brand.website_url ? ` at ${new URL(brand.website_url).hostname}` : ''}. We recommend checking their terms before purchase. Our review evaluates customer service and policies as part of our overall assessment.`
  });

  // 4. Where is [Brand] located?
  if (brand.headquarters_country) {
    faqs.push({
      question: `Where is ${brand.name} located?`,
      answer: `${brand.name} is headquartered in ${getCountryName(brand.headquarters_country)}${brand.founded_year ? ` and was established in ${brand.founded_year}` : ''}. They ship to various regions, with shipping details available on their website.`
    });
  }

  // 5. Is [Brand] worth the price?
  faqs.push({
    question: `Is ${brand.name} worth the price?`,
    answer: `Based on our ${review.overall_score}/100 review score, ${brand.name} offers ${getScoreDescription(review.overall_score)} value. ${review.summary ? review.summary.slice(0, 200) + (review.summary.length > 200 ? '...' : '') : 'Check our detailed review for a complete breakdown of their pricing, quality, and overall value proposition.'}`
  });

  return faqs;
}

/**
 * Generates FAQPage JSON-LD schema
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}
