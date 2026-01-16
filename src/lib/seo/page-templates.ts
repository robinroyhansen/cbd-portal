import { Metadata } from 'next';

/**
 * SEO Page Templates
 * Generates metadata and structured data for programmatic SEO pages
 */

// ============================================================================
// Types
// ============================================================================

export interface ConditionPageData {
  slug: string;
  name: string;
  displayName?: string;
  description: string;
  shortDescription?: string;
  category: string;
  researchCount: number;
  relatedConditions?: { name: string; slug: string }[];
  parentCondition?: { name: string; slug: string };
}

export interface ArticlePageData {
  slug: string;
  title: string;
  description: string;
  author?: { name: string; slug: string };
  publishedDate: string;
  modifiedDate?: string;
  category?: string;
  tags?: string[];
  wordCount?: number;
  readingTime?: number;
  imageUrl?: string;
}

export interface ResearchPageData {
  slug: string;
  title: string;
  readableTitle: string;
  authors?: string;
  publication?: string;
  year?: number;
  doi?: string;
  abstract?: string;
  topics?: string[];
  studyType?: string;
  sampleSize?: number;
}

export interface GlossaryPageData {
  slug: string;
  term: string;
  definition: string;
  shortDefinition?: string;
  category?: string;
  synonyms?: string[];
  relatedTerms?: { term: string; slug: string }[];
}

// ============================================================================
// Base Configuration
// ============================================================================

const SITE_NAME = 'CBD Portal';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbdportal.eu';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

// ============================================================================
// Metadata Generators
// ============================================================================

/**
 * Generate metadata for condition pages
 */
export function generateConditionMetadata(data: ConditionPageData): Metadata {
  const title = `CBD for ${data.displayName || data.name}: Research & Evidence`;
  const description = data.shortDescription ||
    `Explore ${data.researchCount}+ scientific studies on CBD and ${data.name.toLowerCase()}. Evidence-based information with quality ratings.`;

  return {
    title,
    description,
    keywords: [
      `cbd ${data.name.toLowerCase()}`,
      `cannabidiol ${data.name.toLowerCase()}`,
      `cbd research ${data.name.toLowerCase()}`,
      `cbd studies ${data.name.toLowerCase()}`,
      data.category,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/conditions/${data.slug}`,
      siteName: SITE_NAME,
      type: 'article',
      images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/conditions/${data.slug}`,
    },
  };
}

/**
 * Generate metadata for article pages
 */
export function generateArticleMetadata(data: ArticlePageData): Metadata {
  const title = data.title.includes('CBD') ? data.title : `${data.title} | CBD Portal`;

  return {
    title,
    description: data.description,
    authors: data.author ? [{ name: data.author.name }] : undefined,
    openGraph: {
      title,
      description: data.description,
      url: `${SITE_URL}/articles/${data.slug}`,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: data.publishedDate,
      modifiedTime: data.modifiedDate,
      authors: data.author ? [data.author.name] : undefined,
      tags: data.tags,
      images: data.imageUrl ? [{ url: data.imageUrl, width: 1200, height: 630 }] : [{ url: DEFAULT_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: data.description,
    },
    alternates: {
      canonical: `${SITE_URL}/articles/${data.slug}`,
    },
  };
}

/**
 * Generate metadata for research/study pages
 */
export function generateResearchMetadata(data: ResearchPageData): Metadata {
  const title = data.readableTitle || data.title;
  const description = data.abstract?.substring(0, 155) + '...' ||
    `Scientific study on CBD: ${data.title.substring(0, 100)}...`;

  return {
    title: `${title} | CBD Research`,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/research/study/${data.slug}`,
      siteName: SITE_NAME,
      type: 'article',
      images: [{ url: DEFAULT_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/research/study/${data.slug}`,
    },
  };
}

/**
 * Generate metadata for glossary pages
 */
export function generateGlossaryMetadata(data: GlossaryPageData): Metadata {
  const title = `${data.term}: Definition & Meaning | CBD Glossary`;
  const description = data.shortDefinition || data.definition.substring(0, 155) + '...';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/glossary/${data.slug}`,
      siteName: SITE_NAME,
      type: 'article',
      images: [{ url: DEFAULT_IMAGE }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/glossary/${data.slug}`,
    },
  };
}

// ============================================================================
// JSON-LD Schema Generators
// ============================================================================

/**
 * Generate MedicalCondition schema for condition pages
 */
export function generateConditionSchema(data: ConditionPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: data.displayName || data.name,
    description: data.description,
    url: `${SITE_URL}/conditions/${data.slug}`,
    possibleTreatment: {
      '@type': 'Drug',
      name: 'Cannabidiol (CBD)',
      alternateName: 'CBD',
    },
  };
}

/**
 * Generate Article schema for article pages
 */
export function generateArticleSchema(data: ArticlePageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: `${SITE_URL}/articles/${data.slug}`,
    datePublished: data.publishedDate,
    dateModified: data.modifiedDate || data.publishedDate,
    author: data.author ? {
      '@type': 'Person',
      name: data.author.name,
      url: `${SITE_URL}/authors/${data.author.slug}`,
    } : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    wordCount: data.wordCount,
    image: data.imageUrl || DEFAULT_IMAGE,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/articles/${data.slug}`,
    },
  };
}

/**
 * Generate ScholarlyArticle schema for research/study pages
 */
export function generateResearchSchema(data: ResearchPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: data.readableTitle || data.title,
    name: data.title,
    description: data.abstract?.substring(0, 300),
    url: `${SITE_URL}/research/study/${data.slug}`,
    author: data.authors ? {
      '@type': 'Person',
      name: data.authors,
    } : undefined,
    datePublished: data.year ? `${data.year}-01-01` : undefined,
    publisher: data.publication ? {
      '@type': 'Organization',
      name: data.publication,
    } : undefined,
    identifier: data.doi ? {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: data.doi,
    } : undefined,
    about: data.topics?.map(topic => ({
      '@type': 'MedicalCondition',
      name: topic,
    })),
  };
}

/**
 * Generate DefinedTerm schema for glossary pages
 */
export function generateGlossarySchema(data: GlossaryPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: data.term,
    description: data.definition,
    url: `${SITE_URL}/glossary/${data.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'CBD Glossary',
      url: `${SITE_URL}/glossary`,
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate WebSite schema (for homepage)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      // Add social media URLs here
    ],
  };
}

// ============================================================================
// Combined Schema Helper
// ============================================================================

/**
 * Combine multiple schemas into an array for injection
 */
export function combineSchemas(...schemas: object[]): object[] {
  return schemas.filter(Boolean);
}

/**
 * Generate the script tag content for JSON-LD
 */
export function schemaToScriptContent(schemas: object | object[]): string {
  return JSON.stringify(Array.isArray(schemas) ? schemas : [schemas]);
}

// ============================================================================
// Hreflang Generator (for multi-language support)
// ============================================================================

export interface HreflangConfig {
  languages: { code: string; domain: string }[];
  currentLang: string;
  path: string;
}

export function generateHreflangLinks(config: HreflangConfig) {
  const links = config.languages.map(lang => ({
    rel: 'alternate',
    hrefLang: lang.code,
    href: `https://${lang.domain}${config.path}`,
  }));

  // Add x-default
  const defaultLang = config.languages.find(l => l.code === 'en') || config.languages[0];
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `https://${defaultLang.domain}${config.path}`,
  });

  return links;
}
