'use client';

import Link from 'next/link';

interface HubCompactCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  href?: string;
  badge?: { label: string; color: string };
  rightContent?: React.ReactNode;
  borderColor?: string;
}

export function HubCompactCard({
  icon,
  title,
  subtitle,
  href,
  badge,
  rightContent,
  borderColor = 'border-gray-200',
}: HubCompactCardProps) {
  const content = (
    <div className={`bg-white rounded-lg border ${borderColor} p-4 hover:shadow-md transition-all group flex items-center gap-3`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors truncate">
            {title}
          </h3>
          {badge && (
            <span className={`px-2 py-0.5 ${badge.color} text-xs font-medium rounded flex-shrink-0`}>
              {badge.label}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      {rightContent && (
        <div className="flex-shrink-0">{rightContent}</div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
