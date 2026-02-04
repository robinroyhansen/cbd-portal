import { createClient } from '@/lib/supabase/server';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { getLanguage } from '@/lib/get-language';
import type { LanguageCode } from '@/lib/translation-service';
import {
  assessStudyQuality,
  calculateQualityScoreWithBreakdown,
  detectStudyType,
  StudyType,
  getStudyTypeColor
} from '@/lib/quality-tiers';
import {
  extractSampleInfo,
  extractStudyStatus,
  extractTreatment,
  getSubjectIcon,
  getStudyStatusInfo
} from '@/lib/study-analysis';
import { StudyPageClient } from './StudyPageClient';
import { generateStudyQualitySchema } from '@/lib/seo/schema-generators';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

interface KeyFinding {
  text: string;
  type: 'finding' | 'limitation';
}

interface Study {
  id: string;
  title: string;
  authors: string | null;
  publication: string | null;
  year: number | null;
  abstract: string | null;
  plain_summary: string | null;
  url: string;
  doi: string | null;
  source_site: string | null;
  relevant_topics: string[] | null;
  relevance_score: number | null;
  slug: string;
  key_findings: KeyFinding[] | null;
  study_quality: string | null;
  study_type: string | null;
  meta_title: string | null;
  meta_description: string | null;
  country: string | null;
}

// Country extraction from text
const COUNTRY_FLAGS: Record<string, { flag: string; name: string }> = {
  'usa': { flag: '🇺🇸', name: 'USA' },
  'united states': { flag: '🇺🇸', name: 'USA' },
  'america': { flag: '🇺🇸', name: 'USA' },
  'uk': { flag: '🇬🇧', name: 'UK' },
  'united kingdom': { flag: '🇬🇧', name: 'UK' },
  'britain': { flag: '🇬🇧', name: 'UK' },
  'england': { flag: '🇬🇧', name: 'UK' },
  'germany': { flag: '🇩🇪', name: 'Germany' },
  'german': { flag: '🇩🇪', name: 'Germany' },
  'france': { flag: '🇫🇷', name: 'France' },
  'french': { flag: '🇫🇷', name: 'France' },
  'spain': { flag: '🇪🇸', name: 'Spain' },
  'spanish': { flag: '🇪🇸', name: 'Spain' },
  'italy': { flag: '🇮🇹', name: 'Italy' },
  'italian': { flag: '🇮🇹', name: 'Italy' },
  'canada': { flag: '🇨🇦', name: 'Canada' },
  'canadian': { flag: '🇨🇦', name: 'Canada' },
  'australia': { flag: '🇦🇺', name: 'Australia' },
  'australian': { flag: '🇦🇺', name: 'Australia' },
  'netherlands': { flag: '🇳🇱', name: 'Netherlands' },
  'dutch': { flag: '🇳🇱', name: 'Netherlands' },
  'switzerland': { flag: '🇨🇭', name: 'Switzerland' },
  'swiss': { flag: '🇨🇭', name: 'Switzerland' },
  'israel': { flag: '🇮🇱', name: 'Israel' },
  'israeli': { flag: '🇮🇱', name: 'Israel' },
  'brazil': { flag: '🇧🇷', name: 'Brazil' },
  'brazilian': { flag: '🇧🇷', name: 'Brazil' },
  'china': { flag: '🇨🇳', name: 'China' },
  'chinese': { flag: '🇨🇳', name: 'China' },
  'japan': { flag: '🇯🇵', name: 'Japan' },
  'japanese': { flag: '🇯🇵', name: 'Japan' },
  'korea': { flag: '🇰🇷', name: 'South Korea' },
  'korean': { flag: '🇰🇷', name: 'South Korea' },
  'india': { flag: '🇮🇳', name: 'India' },
  'indian': { flag: '🇮🇳', name: 'India' },
  'poland': { flag: '🇵🇱', name: 'Poland' },
  'polish': { flag: '🇵🇱', name: 'Poland' },
  'sweden': { flag: '🇸🇪', name: 'Sweden' },
  'swedish': { flag: '🇸🇪', name: 'Sweden' },
  'denmark': { flag: '🇩🇰', name: 'Denmark' },
  'danish': { flag: '🇩🇰', name: 'Denmark' },
  'norway': { flag: '🇳🇴', name: 'Norway' },
  'norwegian': { flag: '🇳🇴', name: 'Norway' },
  'austria': { flag: '🇦🇹', name: 'Austria' },
  'austrian': { flag: '🇦🇹', name: 'Austria' },
  'belgium': { flag: '🇧🇪', name: 'Belgium' },
  'belgian': { flag: '🇧🇪', name: 'Belgium' },
  'portugal': { flag: '🇵🇹', name: 'Portugal' },
  'portuguese': { flag: '🇵🇹', name: 'Portugal' },
  'ireland': { flag: '🇮🇪', name: 'Ireland' },
  'irish': { flag: '🇮🇪', name: 'Ireland' },
  'new zealand': { flag: '🇳🇿', name: 'New Zealand' },
  'mexico': { flag: '🇲🇽', name: 'Mexico' },
  'mexican': { flag: '🇲🇽', name: 'Mexico' },
  'argentina': { flag: '🇦🇷', name: 'Argentina' },
  'czech': { flag: '🇨🇿', name: 'Czech Republic' },
  'greece': { flag: '🇬🇷', name: 'Greece' },
  'greek': { flag: '🇬🇷', name: 'Greece' },
  'turkey': { flag: '🇹🇷', name: 'Turkey' },
  'turkish': { flag: '🇹🇷', name: 'Turkey' },
  'finland': { flag: '🇫🇮', name: 'Finland' },
  'finnish': { flag: '🇫🇮', name: 'Finland' },
};

function extractCountry(
  text: string,
  sourceSite?: string | null,
  dbCountry?: string | null
): { flag: string; name: string } | null {
  // 1. Use database country field if available
  if (dbCountry) {
    const lowerCountry = dbCountry.toLowerCase();
    for (const [keyword, info] of Object.entries(COUNTRY_FLAGS)) {
      if (lowerCountry.includes(keyword)) {
        return info;
      }
    }
  }

  // 2. Try to extract from text
  const lowerText = text.toLowerCase();
  for (const [keyword, info] of Object.entries(COUNTRY_FLAGS)) {
    if (lowerText.includes(keyword)) {
      return info;
    }
  }

  // 3. Infer from source site
  if (sourceSite) {
    const lowerSource = sourceSite.toLowerCase();
    if (lowerSource.includes('clinicaltrials.gov')) {
      return { flag: '🇺🇸', name: 'USA' };
    }
    if (lowerSource.includes('pubmed') || lowerSource.includes('ncbi')) {
      // PubMed is international, can't assume country
      return null;
    }
  }

  return null;
}

// Generate readable title from scientific title
function generateReadableTitle(scientificTitle: string, studyType?: string): string {
  const title = scientificTitle;

  // Detect study type from title if not provided
  let type = studyType || 'Study';
  if (/randomized.*controlled.*trial|RCT/i.test(title)) {
    type = 'Clinical Trial';
  } else if (/systematic review/i.test(title)) {
    type = 'Systematic Review';
  } else if (/meta-analysis/i.test(title)) {
    type = 'Meta-Analysis';
  } else if (/pilot study/i.test(title)) {
    type = 'Pilot Study';
  } else if (/case report/i.test(title)) {
    type = 'Case Report';
  } else if (/cohort/i.test(title)) {
    type = 'Cohort Study';
  } else if (/in vitro|cell line/i.test(title)) {
    type = 'Lab Study';
  } else if (/mice|mouse|rat|animal/i.test(title)) {
    type = 'Animal Study';
  }

  // Try to extract condition/topic from title
  // Pattern: "for [Condition]" at the end, or "treatment for [Condition]"
  // Be careful not to match "for CBD" or "for Cannabidiol"
  let condition: string | null = null;

  // Try specific patterns in order of preference
  const patterns = [
    // "treatment for Social Anxiety Disorder"
    /(?:treatment|therapy)\s+(?:of|for)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
    // "for Chronic Pain" at end of title
    /\bfor\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
    // "in Epilepsy" or "in Sleep Disorders"
    /\bin\s+([A-Z][a-zA-Z\s]+?(?:disorder|disease|syndrome|condition|pain|epilepsy|anxiety|depression)s?)(?:\s*[:(]|\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const extracted = match[1].trim();
      // Skip if it's just CBD/Cannabidiol
      if (!/^(cannabidiol|cbd|cannabis|hemp|thc)$/i.test(extracted)) {
        condition = extracted;
        break;
      }
    }
  }

  // If we found a good condition, create a nice title
  if (condition && condition.length > 3 && condition.length < 50) {
    // Clean up the condition
    condition = condition.replace(/\s+/g, ' ').trim();

    // Check if it mentions CBD/cannabidiol
    const hasCBD = /cannabidiol|cbd/i.test(title);
    if (hasCBD) {
      return `CBD for ${condition}: ${type} Results`;
    }
    return `${condition}: ${type} Results`;
  }

  // Fallback: Clean up the original title
  let readable = title;

  // Remove common scientific prefixes but keep the important parts
  readable = readable.replace(/^(A |An |The )/i, '');

  // Remove study type descriptors at the beginning
  readable = readable.replace(/^randomized,?\s*/i, '');
  readable = readable.replace(/^double-blind,?\s*/i, '');
  readable = readable.replace(/^placebo-controlled,?\s*/i, '');
  readable = readable.replace(/^controlled\s+trial\s+(of|to|for)\s*/i, '');
  readable = readable.replace(/^trial\s+(of|to|for)\s*/i, '');

  // Remove parenthetical references like (R61)
  readable = readable.replace(/\s*\([A-Z0-9]+\)\s*$/i, '');

  // If still too long, smart truncation
  if (readable.length > 85) {
    // Word boundary truncation
    readable = readable.substring(0, 82).replace(/\s+\S*$/, '');
  }

  // Capitalize first letter
  readable = readable.charAt(0).toUpperCase() + readable.slice(1);

  return readable;
}

// Calculate reading time
function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: study } = await supabase
    .from('kb_research_queue')
    .select('title, authors, year, publication, meta_title, meta_description, plain_summary')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (!study) {
    return {
      title: 'Study Not Found | CBD Portal Research',
      description: 'This research study could not be found.',
      robots: { index: false, follow: false }
    };
  }

  const year = study.year || new Date().getFullYear();
  const readableTitle = generateReadableTitle(study.title);
  const defaultTitle = `${readableTitle} (${year})`;

  const title = study.meta_title || defaultTitle;

  const defaultDescription = study.plain_summary
    ? study.plain_summary.substring(0, 155) + (study.plain_summary.length > 155 ? '...' : '')
    : `Read our plain-language summary of this ${year} CBD research study published in ${study.publication || 'a peer-reviewed journal'}.`;

  const description = study.meta_description || defaultDescription;
  const canonicalUrl = `${SITE_URL}/research/study/${slug}`;

  return {
    title: `${title} | CBD Portal Research`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'CBD Portal',
      publishedTime: study.year ? `${study.year}-01-01` : undefined,
      authors: study.authors ? [study.authors] : undefined,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      site: '@cbdportal',
    },
    robots: { index: true, follow: true }
  };
}

export default async function ResearchStudyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = (sp.lang || await getLanguage()) as LanguageCode;
  const supabase = await createClient();

  const { data: study, error } = await supabase
    .from('kb_research_queue')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single();

  if (error || !study) {
    notFound();
  }

  // Fetch translation for non-English languages
  if (lang !== 'en' && study.id) {
    const { data: translation } = await supabase
      .from('research_translations')
      .select('plain_summary')
      .eq('research_id', study.id)
      .eq('language', lang)
      .single();

    if (translation?.plain_summary) {
      study.plain_summary = translation.plain_summary;
    }
  }

  // Analyze study using shared utilities
  const studyText = `${study.title || ''} ${study.abstract || ''}`;
  const assessment = assessStudyQuality(study);
  const scoreBreakdown = calculateQualityScoreWithBreakdown(study);
  const detectedStudyType = detectStudyType(study);
  const sampleInfo = extractSampleInfo(studyText, detectedStudyType);
  const studyStatus = extractStudyStatus(studyText, study.url);
  const treatment = extractTreatment(studyText);
  const statusInfo = getStudyStatusInfo(studyStatus);
  const country = extractCountry(studyText, study.source_site, study.country);
  const primaryTopic = study.relevant_topics?.[0] || null;

  // Generate readable title
  const readableTitle = generateReadableTitle(study.title);

  // Calculate reading time from summary + abstract
  const contentForReading = `${study.plain_summary || ''} ${study.abstract || ''}`;
  const readingTime = calculateReadingTime(contentForReading);

  // Fetch ALL studies with same primary topic for research context
  interface TopicStudy {
    id: string;
    title: string;
    slug: string;
    year: number | null;
    publication: string | null;
    relevant_topics: string[] | null;
    abstract: string | null;
  }

  let allTopicStudies: TopicStudy[] = [];
  let relatedStudies: Study[] = [];

  if (primaryTopic) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, title, slug, year, publication, relevant_topics, abstract')
      .eq('status', 'approved')
      .contains('relevant_topics', [primaryTopic])
      .order('year', { ascending: false });

    // Filter to only keep studies where PRIMARY topic matches
    allTopicStudies = (data || []).filter(s => s.relevant_topics?.[0] === primaryTopic);

    // Get related studies (excluding current, limit to 4)
    relatedStudies = allTopicStudies
      .filter(s => s.id !== study.id)
      .slice(0, 4);
  }

  // Calculate research context
  interface ResearchContext {
    totalInTopic: number;
    qualityScore: number;
    qualityRank: number;
    currentSampleSize: number;
    medianSampleSize: number;
    sampleComparison: 'larger' | 'smaller' | 'average' | 'unknown';
    studyTypeName: string;
    rctCount: number;
    bottomLine: string;
  }

  // Calculate quality scores for all topic studies
  const topicStudiesWithScores = allTopicStudies.map(s => {
    const studyAssessment = assessStudyQuality(s);
    const studyText = `${s.title || ''} ${s.abstract || ''}`;
    const studySampleInfo = extractSampleInfo(studyText);
    const studyDetectedType = detectStudyType(s);
    const isRCT = studyDetectedType === StudyType.RCT ||
                  studyDetectedType === StudyType.META_ANALYSIS ||
                  studyDetectedType === StudyType.SYSTEMATIC_REVIEW;
    return {
      id: s.id,
      qualityScore: studyAssessment.score,
      sampleSize: studySampleInfo?.size || 0,
      isRCT,
    };
  });

  // Sort by quality score descending
  const sortedByQuality = [...topicStudiesWithScores].sort((a, b) => b.qualityScore - a.qualityScore);
  const qualityRank = sortedByQuality.findIndex(s => s.id === study.id) + 1;
  const totalInTopic = allTopicStudies.length;

  // Calculate median sample size
  const validSampleSizes = topicStudiesWithScores
    .map(s => s.sampleSize)
    .filter(size => size > 0)
    .sort((a, b) => a - b);
  const medianSampleSize = validSampleSizes.length > 0
    ? validSampleSizes[Math.floor(validSampleSizes.length / 2)]
    : 0;

  // Sample comparison
  const currentSampleSize = sampleInfo?.size || 0;
  let sampleComparison: ResearchContext['sampleComparison'] = 'unknown';
  if (currentSampleSize > 0 && medianSampleSize > 0) {
    if (currentSampleSize > medianSampleSize * 1.2) sampleComparison = 'larger';
    else if (currentSampleSize < medianSampleSize * 0.8) sampleComparison = 'smaller';
    else sampleComparison = 'average';
  }

  // Count RCTs (gold standard studies)
  const rctCount = topicStudiesWithScores.filter(s => s.isRCT).length;

  // Study type name for display
  const studyTypeName =
    detectedStudyType === StudyType.RCT ? 'RCT' :
    detectedStudyType === StudyType.META_ANALYSIS ? 'Meta-Analysis' :
    detectedStudyType === StudyType.SYSTEMATIC_REVIEW ? 'Systematic Review' :
    detectedStudyType === StudyType.COHORT ? 'Cohort Study' :
    detectedStudyType === StudyType.CLINICAL_TRIAL ? 'Clinical Trial' :
    detectedStudyType === StudyType.CASE_CONTROL ? 'Case-Control' :
    detectedStudyType === StudyType.OBSERVATIONAL ? 'Observational' :
    detectedStudyType === StudyType.IN_VITRO ? 'In Vitro' :
    detectedStudyType === StudyType.ANIMAL ? 'Animal Study' :
    'Study';

  // Determine if this study is gold standard
  const isGoldStandard = detectedStudyType === StudyType.RCT ||
                         detectedStudyType === StudyType.META_ANALYSIS ||
                         detectedStudyType === StudyType.SYSTEMATIC_REVIEW;

  // Generate bottom line (user's spec)
  const topicLower = primaryTopic?.toLowerCase() || 'this condition';
  const qualityWord = assessment.score >= 70 ? 'high-quality' :
                      assessment.score >= 50 ? 'moderate-quality' : 'preliminary';
  const sampleWord = !currentSampleSize ? '' :
                     currentSampleSize >= 100 ? 'with a robust sample size' :
                     currentSampleSize >= 50 ? 'with an adequate sample size' :
                     'with a small sample size';
  const volumeWord = totalInTopic >= 30 ? 'substantial body of' :
                     totalInTopic >= 15 ? 'growing body of' :
                     totalInTopic >= 5 ? 'emerging' : 'limited';

  let bottomLine = `This is a ${qualityWord} study`;
  if (sampleWord) bottomLine += ` ${sampleWord}`;
  bottomLine += `. It adds to the ${volumeWord} research on CBD and ${topicLower}`;

  if (totalInTopic > 1) {
    bottomLine += `, but isn't definitive on its own. Consider alongside the other ${totalInTopic - 1} ${totalInTopic - 1 === 1 ? 'study' : 'studies'} in this area.`;
  } else {
    bottomLine += `. More research is needed in this area.`;
  }

  const researchContext: ResearchContext = {
    totalInTopic,
    qualityScore: assessment.score,
    qualityRank,
    currentSampleSize,
    medianSampleSize,
    sampleComparison,
    studyTypeName,
    rctCount,
    bottomLine,
  };

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Research', url: `${SITE_URL}/research` },
    { name: 'Study', url: `${SITE_URL}/research/study/${slug}` }
  ];

  // Fetch glossary terms for auto-linking
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('term, slug')
    .order('term', { ascending: true });

  const keyFindings = (study.key_findings as KeyFinding[]) || [];
  const findings = keyFindings.filter(f => f.type === 'finding');
  const limitations = keyFindings.filter(f => f.type === 'limitation');

  // Schema.org ScholarlyArticle (enhanced for SEO)
  const scholarlyArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${SITE_URL}/research/study/${slug}`,
    'headline': readableTitle,
    'name': study.title,
    'description': study.meta_description || study.plain_summary?.slice(0, 160) || study.abstract?.slice(0, 160),
    ...(study.year && { 'datePublished': `${study.year}-01-01` }),
    ...(study.authors && {
      'author': study.authors.split(',').map((name: string) => ({
        '@type': 'Person',
        'name': name.trim()
      }))
    }),
    ...(primaryTopic && {
      'about': {
        '@type': 'MedicalCondition',
        'name': primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1)
      }
    }),
    ...(study.publication && { 'isPartOf': { '@type': 'Periodical', 'name': study.publication } }),
    ...(study.doi && { 'identifier': { '@type': 'PropertyValue', 'propertyID': 'doi', 'value': study.doi } }),
    ...(study.abstract && { 'abstract': study.abstract }),
    ...(study.url && { 'url': study.url }),
    'publisher': {
      '@type': 'Organization',
      'name': 'CBD Portal',
      'url': SITE_URL
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/research/study/${slug}`
    },
    'isAccessibleForFree': true,
    ...(study.relevant_topics?.length && { 'keywords': study.relevant_topics.join(', ') })
  };

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Research',
        'item': `${SITE_URL}/research`
      },
      ...(primaryTopic ? [{
        '@type': 'ListItem',
        'position': 2,
        'name': primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1),
        'item': `${SITE_URL}/research?topic=${encodeURIComponent(primaryTopic)}`
      }] : []),
      {
        '@type': 'ListItem',
        'position': primaryTopic ? 3 : 2,
        'name': readableTitle
      }
    ]
  };

  // Generate quality review schema if study has a quality score
  const qualityReviewSchema = assessment.score > 0
    ? generateStudyQualitySchema({
        title: readableTitle,
        slug: study.slug,
        qualityScore: assessment.score,
      })
    : null;

  // Combined schema array for single script tag
  const combinedSchema = [
    scholarlyArticleSchema,
    breadcrumbSchema,
    ...(qualityReviewSchema ? [qualityReviewSchema] : []),
  ];

  // Study type display info
  const studyTypeLabel = detectedStudyType !== StudyType.UNKNOWN ? detectedStudyType : (study.study_type || 'Research Study');
  const studyTypeColorClass = getStudyTypeColor(detectedStudyType);

  const pageUrl = `${SITE_URL}/research/study/${slug}`;

  // Prepare props for client component
  const studyData = {
    study,
    readableTitle,
    studyTypeLabel,
    studyTypeColorClass,
    country,
    primaryTopic,
    sampleInfo,
    statusInfo,
    treatment,
    readingTime,
    findings,
    limitations,
    assessment,
    scoreBreakdown,
    relatedStudies,
    researchContext,
    pageUrl,
    breadcrumbs,
    combinedSchema,
    glossaryTerms: glossaryTerms || [],
  };

  return <StudyPageClient data={studyData} />;
}

export const dynamic = 'force-dynamic';
