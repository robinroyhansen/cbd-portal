'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface HubFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  badges?: { label: string; color: string }[];
  stats?: { label: string; value: string | number }[];
  features?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  children?: ReactNode;
}

export function HubFeatureCard({
  icon,
  title,
  description,
  href,
  badges,
  stats,
  features,
  gradientFrom = 'from-green-50',
  gradientTo = 'to-emerald-50',
  children,
}: HubFeatureCardProps) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              {title}
            </h3>
          </div>

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 ${badge.color} text-xs font-medium rounded`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {features && features.length > 0 && (
          <ul className="space-y-1 mb-4">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                {feature}
              </li>
            ))}
          </ul>
        )}

        {stats && stats.length > 0 && (
          <div className="flex gap-4 pt-3 border-t border-gray-100">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
