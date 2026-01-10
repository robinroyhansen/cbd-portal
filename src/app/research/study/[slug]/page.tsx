import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cbd-portal.vercel.app';

interface Props {
  params: Promise<{ slug: string }>;
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

function extractCountry(text: string): { flag: string; name: string } | null {
  const lowerText = text.toLowerCase();
  for (const [keyword, info] of Object.entries(COUNTRY_FLAGS)) {
    if (lowerText.includes(keyword)) {
      return info;
    }
  }
  return null;
}

// Generate readable title from scientific title
function generateReadableTitle(scientificTitle: string): string {
  let readable = scientificTitle;

  // Remove common scientific prefixes
  readable = readable.replace(/^(A |An |The )/i, '');
  readable = readable.replace(/randomized,? controlled trial(s)? (of|to|for)/gi, '');
  readable = readable.replace(/randomized,? placebo-controlled/gi, '');
  readable = readable.replace(/double-blind,?/gi, '');
  readable = readable.replace(/placebo-controlled,?/gi, '');
  readable = readable.replace(/systematic review (of|and)/gi, '');
  readable = readable.replace(/meta-analysis (of|and)/gi, '');

  // Truncate if too long
  if (readable.length > 80) {
    const words = readable.split(' ');
    let truncated = '';
    for (const word of words) {
      if ((truncated + ' ' + word).length > 75) break;
      truncated += (truncated ? ' ' : '') + word;
    }
    readable = truncated;
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
      siteName: 'CBD Portal'
    },
    twitter: { card: 'summary', title, description },
    robots: { index: true, follow: true }
  };
}

export default async function ResearchStudyPage({ params }: Props) {
  const { slug } = await params;
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

  // Analyze study using shared utilities
  const studyText = `${study.title || ''} ${study.abstract || ''}`;
  const assessment = assessStudyQuality(study);
  const scoreBreakdown = calculateQualityScoreWithBreakdown(study);
  const detectedStudyType = detectStudyType(study);
  const sampleInfo = extractSampleInfo(studyText, detectedStudyType);
  const studyStatus = extractStudyStatus(studyText, study.url);
  const treatment = extractTreatment(studyText);
  const statusInfo = getStudyStatusInfo(studyStatus);
  const country = extractCountry(studyText);
  const primaryTopic = study.relevant_topics?.[0] || null;

  // Generate readable title
  const readableTitle = generateReadableTitle(study.title);

  // Calculate reading time from summary + abstract
  const contentForReading = `${study.plain_summary || ''} ${study.abstract || ''}`;
  const readingTime = calculateReadingTime(contentForReading);

  // Fetch related studies - match by primary topic only
  let relatedStudies: Study[] = [];
  if (primaryTopic) {
    const { data } = await supabase
      .from('kb_research_queue')
      .select('id, title, slug, year, publication, relevant_topics')
      .eq('status', 'approved')
      .neq('id', study.id)
      .contains('relevant_topics', [primaryTopic])
      .limit(4);
    relatedStudies = data || [];
  }

  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Research', url: `${SITE_URL}/research` },
    { name: 'Study', url: `${SITE_URL}/research/study/${slug}` }
  ];

  const keyFindings = (study.key_findings as KeyFinding[]) || [];
  const findings = keyFindings.filter(f => f.type === 'finding');
  const limitations = keyFindings.filter(f => f.type === 'limitation');

  // Schema.org ScholarlyArticle
  const scholarlyArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${SITE_URL}/research/study/${slug}`,
    'headline': study.title,
    'name': study.title,
    ...(study.authors && { 'author': study.authors.split(',').map((name: string) => ({ '@type': 'Person', 'name': name.trim() })) }),
    ...(study.publication && { 'isPartOf': { '@type': 'Periodical', 'name': study.publication } }),
    ...(study.year && { 'datePublished': `${study.year}` }),
    ...(study.doi && { 'identifier': { '@type': 'PropertyValue', 'propertyID': 'doi', 'value': study.doi } }),
    ...(study.abstract && { 'abstract': study.abstract }),
    ...(study.url && { 'url': study.url }),
    'publisher': { '@type': 'Organization', 'name': study.source_site || 'Academic Publisher' }
  };

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
    pageUrl,
    breadcrumbs,
    scholarlyArticleSchema,
  };

  return <StudyPageClient data={studyData} />;
}

export const dynamic = 'force-dynamic';
