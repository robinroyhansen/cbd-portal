'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  reading_time: number | null;
  updated_at: string;
}

interface ScienceArticleCardProps {
  article: Article;
  accentColor?: string;
  borderColor?: string;
}

// Extract key takeaways from markdown content
function extractKeyTakeaways(content: string): string[] {
  const takeaways: string[] = [];

  // Look for "Key Takeaways" or "## Key" sections
  const keyTakeawaysMatch = content.match(/##\s*Key Takeaways?\s*\n([\s\S]*?)(?=\n##|\n---|\n\*\*Quick|$)/i);

  if (keyTakeawaysMatch) {
    const section = keyTakeawaysMatch[1];
    // Extract bullet points
    const bullets = section.match(/^[-*]\s+\*?\*?(.+?)\*?\*?\s*(?:—|–|-|$)/gm);
    if (bullets) {
      bullets.slice(0, 4).forEach(bullet => {
        const cleaned = bullet
          .replace(/^[-*]\s+/, '')
          .replace(/\*\*/g, '')
          .replace(/—.*$/, '')
          .replace(/–.*$/, '')
          .trim();
        if (cleaned.length > 10 && cleaned.length < 100) {
          takeaways.push(cleaned);
        }
      });
    }
  }

  // Fallback: look for any bullet list early in the article
  if (takeaways.length === 0) {
    const earlyBullets = content.slice(0, 2000).match(/^[-*]\s+\*?\*?([^*\n]+)\*?\*?\s*$/gm);
    if (earlyBullets) {
      earlyBullets.slice(0, 3).forEach(bullet => {
        const cleaned = bullet
          .replace(/^[-*]\s+/, '')
          .replace(/\*\*/g, '')
          .trim();
        if (cleaned.length > 10 && cleaned.length < 80) {
          takeaways.push(cleaned);
        }
      });
    }
  }

  return takeaways;
}

// Extract quick answer from content
function extractQuickAnswer(content: string): string | null {
  const quickMatch = content.match(/\*\*Quick Answer:?\*\*\s*([^\n]+)/i);
  if (quickMatch) {
    return quickMatch[1].trim().slice(0, 200);
  }
  return null;
}

// Determine article type based on content/title
function getArticleType(title: string, content: string): { label: string; color: string } {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (titleLower.includes('beginner') || titleLower.includes('guide') || titleLower.includes('how to')) {
    return { label: 'Beginner Guide', color: 'bg-green-100 text-green-700' };
  }
  if (titleLower.includes('vs') || titleLower.includes('comparison') || titleLower.includes('difference')) {
    return { label: 'Comparison', color: 'bg-amber-100 text-amber-700' };
  }
  if (contentLower.includes('clinical trial') || contentLower.includes('study found') || contentLower.includes('research shows')) {
    return { label: 'Research', color: 'bg-purple-100 text-purple-700' };
  }
  if (titleLower.includes('what is') || titleLower.includes('understanding')) {
    return { label: 'Explainer', color: 'bg-blue-100 text-blue-700' };
  }
  return { label: 'Article', color: 'bg-gray-100 text-gray-600' };
}

// Estimate reading level
function getReadingLevel(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const hasScientificTerms = /receptor|cannabinoid|endocannabinoid|pharmacokinetic|bioavailability/i.test(content);

  if (hasScientificTerms && wordCount > 1500) return 'Advanced';
  if (wordCount > 1200) return 'Intermediate';
  return 'Beginner';
}

export function ScienceArticleCard({ article, accentColor = 'purple', borderColor = 'border-purple-200' }: ScienceArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const takeaways = extractKeyTakeaways(article.content);
  const quickAnswer = extractQuickAnswer(article.content);
  const articleType = getArticleType(article.title, article.content);
  const readingLevel = getReadingLevel(article.content);

  return (
    <div className={`bg-white rounded-xl border-2 ${borderColor} overflow-hidden transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${articleType.color}`}>
            {articleType.label}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {readingLevel}
          </span>
          {article.reading_time && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.reading_time} min
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/articles/${article.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-700 transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Quick Answer (if available) */}
        {quickAnswer && (
          <div className="bg-purple-50 border-l-4 border-purple-400 px-3 py-2 mb-3 rounded-r">
            <p className="text-sm text-purple-800 line-clamp-2">{quickAnswer}</p>
          </div>
        )}

        {/* Excerpt (fallback if no quick answer) */}
        {!quickAnswer && article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>
        )}

        {/* Key Takeaways Preview */}
        {takeaways.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ transformOrigin: 'center' }} />
              </svg>
              Key Takeaways ({takeaways.length})
            </button>

            {isExpanded && (
              <ul className="mt-3 space-y-2 pl-1">
                {takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Updated {new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
        <Link
          href={`/articles/${article.slug}`}
          className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
        >
          Read article
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
