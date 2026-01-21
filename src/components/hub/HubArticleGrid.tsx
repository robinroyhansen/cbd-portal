'use client';

import { ReactNode } from 'react';

interface HubArticleGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function HubArticleGrid({
  children,
  columns = 3,
  className = '',
}: HubArticleGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {children}
    </div>
  );
}
