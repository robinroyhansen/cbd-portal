import { ArticleType, getTemplate } from './article-templates';

export interface GeneratedContent {
  content: string;
  excerpt: string;
  wordCount: number;
  readingTime: number;
}

export function generateArticleContent(
  type: ArticleType,
  sectionData: Record<string, string>
): GeneratedContent {
  const template = getTemplate(type);
  let content = '';

  // Generate markdown content from sections
  for (const section of template.sections) {
    const sectionContent = sectionData[section.id];
    if (sectionContent && sectionContent.trim()) {
      // Add section heading
      content += `## ${section.title}\n\n`;
      content += `${sectionContent.trim()}\n\n`;
    }
  }

  content = content.trim();

  // Calculate word count
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Calculate reading time (average 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200) || 1;

  // Generate excerpt from first section or intro
  const firstSection = sectionData['introduction'] || sectionData['headline-summary'] || sectionData['summary'] || Object.values(sectionData)[0] || '';
  const excerpt = firstSection.substring(0, 200).trim() + (firstSection.length > 200 ? '...' : '');

  return {
    content,
    excerpt,
    wordCount,
    readingTime
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionPercentage: number;
}

export function validateArticle(
  type: ArticleType,
  sectionData: Record<string, string>
): ValidationResult {
  const template = getTemplate(type);
  const errors: string[] = [];
  const warnings: string[] = [];

  let completedSections = 0;
  const totalSections = template.sections.length;

  for (const section of template.sections) {
    const content = sectionData[section.id];
    const hasContent = content && content.trim();

    if (hasContent) {
      completedSections++;
      const wordCount = content.split(/\s+/).filter(Boolean).length;

      if (section.required) {
        if (wordCount < section.wordCountGuide.min) {
          errors.push(`"${section.title}" needs at least ${section.wordCountGuide.min} words (currently ${wordCount})`);
        }
      }

      if (wordCount > section.wordCountGuide.max) {
        warnings.push(`"${section.title}" is longer than recommended (${wordCount}/${section.wordCountGuide.max} words)`);
      }
    } else if (section.required) {
      errors.push(`"${section.title}" section is required`);
    }
  }

  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completionPercentage
  };
}

export function generateSEOMetadata(
  type: ArticleType,
  title: string,
  sectionData: Record<string, string>
): { metaTitle: string; metaDescription: string; suggestedKeywords: string[] } {
  const template = getTemplate(type);

  // Generate meta title
  let metaTitle = title;
  if (type === 'condition' && !title.toLowerCase().includes('cbd')) {
    metaTitle = `CBD for ${title}`;
  } else if (type === 'product-guide' && !title.toLowerCase().includes('guide')) {
    metaTitle = `${title} - Complete Guide`;
  } else if (type === 'beginner-guide' && !title.toLowerCase().includes('beginner')) {
    metaTitle = `${title} - Beginner's Guide`;
  }

  // Generate meta description from content
  const excerpt = sectionData['introduction'] || sectionData['summary'] || Object.values(sectionData)[0] || '';
  const metaDescription = excerpt.substring(0, 155).trim() + (excerpt.length > 155 ? '...' : '');

  // Generate keyword suggestions based on type and content
  const suggestedKeywords: string[] = [];

  // Add template-specific keywords
  if (template.suggestedTags.length > 0) {
    suggestedKeywords.push(...template.suggestedTags);
  }

  // Add content-based keywords
  const allContent = Object.values(sectionData).join(' ').toLowerCase();
  const commonKeywords = ['cbd', 'cannabis', 'hemp', 'cannabidiol', 'health', 'wellness'];
  commonKeywords.forEach(keyword => {
    if (allContent.includes(keyword) && !suggestedKeywords.includes(keyword)) {
      suggestedKeywords.push(keyword);
    }
  });

  return {
    metaTitle,
    metaDescription,
    suggestedKeywords
  };
}

export function generateTableOfContents(
  sectionData: Record<string, string>,
  template: ReturnType<typeof getTemplate>
): Array<{ title: string; anchor: string; wordCount: number }> {
  const toc: Array<{ title: string; anchor: string; wordCount: number }> = [];

  template.sections.forEach(section => {
    const content = sectionData[section.id];
    if (content && content.trim()) {
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const anchor = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      toc.push({
        title: section.title,
        anchor,
        wordCount
      });
    }
  });

  return toc;
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function generateContentPreview(
  type: ArticleType,
  sectionData: Record<string, string>,
  maxLength: number = 300
): string {
  const generated = generateArticleContent(type, sectionData);

  if (generated.content.length <= maxLength) {
    return generated.content;
  }

  return generated.content.substring(0, maxLength - 3) + '...';
}

export function analyzeContentQuality(
  type: ArticleType,
  sectionData: Record<string, string>
): {
  score: number;
  feedback: string[];
  suggestions: string[];
} {
  const template = getTemplate(type);
  const feedback: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check completion
  const validation = validateArticle(type, sectionData);
  if (validation.isValid) {
    score += 40;
    feedback.push('All required sections completed');
  } else {
    feedback.push(`${validation.errors.length} required sections missing`);
    suggestions.push('Complete all required sections for publication');
  }

  // Check word count balance
  const totalWords = Object.values(sectionData).join(' ').split(/\s+/).filter(Boolean).length;
  if (totalWords >= 800) {
    score += 20;
    feedback.push('Good content length');
  } else {
    suggestions.push('Consider expanding content for better SEO performance');
  }

  // Check structure
  const hasIntro = sectionData['introduction'] || sectionData['summary'];
  const hasConclusion = sectionData['conclusion'] || sectionData['key-takeaways'];

  if (hasIntro) {
    score += 10;
    feedback.push('Has proper introduction');
  } else {
    suggestions.push('Add a compelling introduction');
  }

  if (hasConclusion) {
    score += 10;
    feedback.push('Has proper conclusion');
  } else {
    suggestions.push('Add a summary or conclusion');
  }

  // Check FAQ section for better SEO
  if (sectionData['faq']) {
    score += 10;
    feedback.push('Includes FAQ section for SEO');
  } else {
    suggestions.push('Consider adding an FAQ section for better search visibility');
  }

  // Check for keywords
  const allContent = Object.values(sectionData).join(' ').toLowerCase();
  if (allContent.includes('cbd')) {
    score += 10;
    feedback.push('Contains relevant keywords');
  }

  return {
    score: Math.min(100, score),
    feedback,
    suggestions
  };
}