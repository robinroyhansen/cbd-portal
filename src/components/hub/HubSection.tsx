'use client';

import { ReactNode } from 'react';

interface HubSectionProps {
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export function HubSection({
  title,
  description,
  icon,
  children,
  className = '',
  headerRight,
}: HubSectionProps) {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      {children}
    </section>
  );
}
