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
  accentColor?: string;
}

export function HubArticleCard({
  article,
  variant = 'default',
  badge,
  badgeColor = 'bg-gray-100 text-gray-700',
  borderColor = 'border-gray-200',
  hoverBorderColor = 'hover:border-gray-400',
  accentColor = 'bg-emerald-500',
}: HubArticleCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={`group relative block bg-white rounded-lg border ${borderColor} p-4 ${hoverBorderColor} hover:shadow-md transition-all duration-200 overflow-hidden`}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor} transition-all duration-200 group-hover:w-1`} />

        <div className="pl-2">
          <h3 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 hub-body-text">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 hub-stat-number">
            {article.reading_time && <span>{article.reading_time} min</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className={`group relative block bg-white rounded-xl border-2 ${borderColor} p-6 ${hoverBorderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
      >
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} transition-all duration-200 group-hover:w-1.5`} />

        <div className="pl-3">
          {/* Reading time badge */}
          {article.reading_time && (
            <span className="absolute top-4 right-4 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hub-stat-number">
              {article.reading_time} min
            </span>
          )}

          {badge && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${badgeColor} text-xs font-semibold rounded-full mb-3`}>
              {badge}
            </span>
          )}

          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors pr-16 hub-body-text">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 hub-body-text leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 hub-stat-number">
              {new Date(article.updated_at).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              })}
            </span>

            {/* Read more reveal */}
            <span className="text-sm font-medium text-emerald-600 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              Read article →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group relative block bg-white rounded-xl border ${borderColor} p-5 ${hoverBorderColor} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor} transition-all duration-200 group-hover:w-1`} />

      <div className="pl-3">
        {/* Reading time badge */}
        {article.reading_time && (
          <span className="absolute top-4 right-4 px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-medium rounded hub-stat-number">
            {article.reading_time} min
          </span>
        )}

        {badge && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 ${badgeColor} text-xs font-medium rounded-full mb-2`}>
            {badge}
          </span>
        )}

        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors pr-14 hub-body-text">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 hub-body-text leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 hub-stat-number">
            {new Date(article.updated_at).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            })}
          </span>

          {/* Read more reveal */}
          <span className="text-xs font-medium text-emerald-600 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}
