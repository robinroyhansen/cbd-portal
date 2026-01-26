/**
 * SEO Schema Generators
 * Additional JSON-LD structured data generators for enhanced search visibility
 * https://schema.org
 */

// ============================================================================
// Site Configuration
// ============================================================================

const SITE_NAME = 'CBD Portal';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbdportal.eu';

// ============================================================================
// Types
// ============================================================================

export interface VideoSchemaData {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO 8601 date
  duration?: string; // ISO 8601 duration format, e.g., "PT5M30S"
  embedUrl?: string;
}

export interface NewsArticleSchemaData {
  headline: string;
  datePublished: string; // ISO 8601 date
  dateModified: string; // ISO 8601 date
  author: {
    name: string;
    url?: string;
  };
  publisher: {
    name: string;
    logo: string;
  };
  image?: string;
}

export interface ReviewSchemaData {
  itemReviewed: {
    name: string;
    type: string; // e.g., 'ScholarlyArticle', 'Product', 'MedicalCondition'
  };
  ratingValue: number;
  bestRating: number;
  worstRating: number;
  ratingCount?: number;
}

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * Generate VideoObject schema for video content
 * https://schema.org/VideoObject
 * Used for video rich results in Google Search
 */
export function generateVideoSchema(video: VideoSchemaData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
  };

  if (video.duration) {
    schema.duration = video.duration;
  }

  if (video.embedUrl) {
    schema.embedUrl = video.embedUrl;
  }

  return schema;
}

/**
 * Generate NewsArticle schema for news/blog content
 * https://schema.org/NewsArticle
 * Used for news article rich results and Google News
 */
export function generateNewsArticleSchema(article: NewsArticleSchemaData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.headline,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: article.author.name,
      ...(article.author.url && { url: article.author.url }),
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: article.publisher.logo,
      },
    },
  };

  if (article.image) {
    schema.image = article.image;
  }

  return schema;
}

/**
 * Generate Review/AggregateRating schema for quality scores
 * https://schema.org/Review
 * https://schema.org/AggregateRating
 * Used for rating rich results (stars in search)
 */
export function generateReviewSchema(review: ReviewSchemaData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': review.itemReviewed.type,
      name: review.itemReviewed.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: review.bestRating,
      worstRating: review.worstRating,
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  // Add aggregate rating if we have a rating count
  if (review.ratingCount && review.ratingCount > 1) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: review.ratingValue,
      bestRating: review.bestRating,
      worstRating: review.worstRating,
      ratingCount: review.ratingCount,
    };
  }

  return schema;
}

/**
 * Generate WebSite schema with SearchAction for Google Sitelinks Searchbox
 * https://schema.org/WebSite
 * https://developers.google.com/search/docs/appearance/sitelinks-searchbox
 * Enables the search box directly in Google search results
 */
export function generateWebsiteSearchSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Organization schema with full CBD Portal details
 * https://schema.org/Organization
 * Used for knowledge panel and brand recognition
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'Evidence-based CBD information portal with 4,000+ peer-reviewed studies. Comprehensive guides on CBD for anxiety, pain, sleep, and more.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Robin Roy Krigslund-Hansen',
      jobTitle: 'Founder & Editor',
    },
    sameAs: [
      // Social media profiles can be added here
      // 'https://twitter.com/cbdportal',
      // 'https://www.facebook.com/cbdportal',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'contact@cbdportal.eu',
      availableLanguage: ['English', 'Danish', 'Swedish', 'Norwegian', 'German', 'Dutch', 'Finnish', 'French', 'Italian'],
    },
    areaServed: {
      '@type': 'GeoShape',
      name: 'Europe',
    },
    knowsAbout: [
      'Cannabidiol (CBD)',
      'CBD Research',
      'CBD for Anxiety',
      'CBD for Pain',
      'CBD for Sleep',
      'CBD for Epilepsy',
      'Hemp',
      'Cannabis Science',
      'Endocannabinoid System',
    ],
  };
}

/**
 * Generate Study Quality Rating schema
 * Specialized schema for research study quality scores
 * Maps quality score (0-100) to a 5-star rating system
 */
export function generateStudyQualitySchema(study: {
  title: string;
  slug: string;
  qualityScore: number;
}) {
  // Convert 0-100 score to 1-5 rating
  const ratingValue = Math.max(1, Math.min(5, Math.round((study.qualityScore / 100) * 5 * 10) / 10));

  return generateReviewSchema({
    itemReviewed: {
      name: study.title,
      type: 'ScholarlyArticle',
    },
    ratingValue,
    bestRating: 5,
    worstRating: 1,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Helper to combine multiple schemas for a single page
 */
export function combineSchemas(...schemas: (object | null | undefined)[]): object[] {
  return schemas.filter((schema): schema is object => schema != null);
}

/**
 * Helper to serialize schemas for injection into script tag
 */
export function schemaToJson(schemas: object | object[]): string {
  return JSON.stringify(Array.isArray(schemas) ? schemas : [schemas]);
}
