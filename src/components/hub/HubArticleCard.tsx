'use client';

import Link from 'next/link';

export interface HubArticle {
  slug: string;
  title: string;
  excerpt?: string | null;
  reading_time?: number | null;
  updated_at: string;
}

interface HubArticleCardProps {
  article: HubArticle;
  variant?: 'default' | 'compact' | 'featured';
  badge?: string;
  badgeColor?: string;
  borderColor?: string;
  hoverBorderColor?: string;
}

export function HubArticleCard({
  article,
  variant = 'default',
  badge,
  badgeColor = 'bg-gray-100 text-gray-700',
  borderColor = 'border-gray-200',
  hoverBorderColor = 'hover:border-gray-300',
}: HubArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={`block bg-white rounded-lg border ${borderColor} p-4 ${hoverBorderColor} hover:shadow-md transition-all group`}
      >
        <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
          {article.reading_time && <span>{article.reading_time} min</span>}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={`block bg-white rounded-xl border-2 ${borderColor} p-6 ${hoverBorderColor} hover:shadow-lg transition-all group`}
      >
        {badge && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 ${badgeColor} text-xs font-medium rounded mb-3`}>
            {badge}
          </span>
        )}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {article.reading_time && <span>{article.reading_time} min read</span>}
          <span>•</span>
          <span>
            {new Date(article.updated_at).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`block bg-white rounded-xl border ${borderColor} p-5 ${hoverBorderColor} hover:shadow-lg transition-all group`}
    >
      {badge && (
        <span className={`inline-flex items-center gap-1 px-2 py-1 ${badgeColor} text-xs font-medium rounded mb-3`}>
          {badge}
        </span>
      )}
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {article.reading_time && <span>{article.reading_time} min read</span>}
        <span>•</span>
        <span>
          {new Date(article.updated_at).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>
    </Link>
  );
}
