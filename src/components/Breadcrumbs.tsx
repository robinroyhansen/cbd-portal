'use client';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { getEnglishPath, usesLocalizedRoutes } from '@/lib/route-translations';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Map of path segments to display labels
const SEGMENT_LABELS: Record<string, string> = {
  conditions: 'Health Topics',
  research: 'Research',
  articles: 'Articles',
  glossary: 'Glossary',
  tools: 'Tools',
  reviews: 'Reviews',
  categories: 'Categories',
  authors: 'Authors',
  about: 'About',
  contact: 'Contact',
  admin: 'Admin',
  'dosage-calculator': 'Dosage Calculator',
  'cost-calculator': 'Cost Calculator',
  'strength-calculator': 'Strength Calculator',
  'animal-dosage-calculator': 'Pet Dosage Calculator',
  interactions: 'Drug Interactions',
  'cbd-basics': 'CBD Basics',
  science: 'Science',
  guides: 'Guides',
  products: 'Products',
  legal: 'Legal',
  'editorial-policy': 'Editorial Policy',
  'medical-disclaimer': 'Medical Disclaimer',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  search: 'Search',
  kb: 'Knowledge Base',
};

// Format a slug into a readable label
function formatSegment(segment: string): string {
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  // Convert slug to title case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  const { lang } = useLocale();

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbs = useMemo(() => {
    if (items) return items;

    // Convert localized path back to English for consistent breadcrumb generation
    const englishPath = usesLocalizedRoutes(lang) ? getEnglishPath(pathname, lang) : pathname;
    const segments = englishPath.split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      crumbs.push({
        label: formatSegment(segment),
        // Always use English paths - LocaleLink will translate them
        href: currentPath,
      });
    });

    return crumbs;
  }, [pathname, items, lang]);

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  // Don't show if only home
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex items-center flex-wrap gap-1">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.href} className="flex items-center">
              {!isFirst && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="text-gray-500 font-medium truncate max-w-[200px]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-600 hover:text-green-700 transition-colors"
                >
                  {isFirst ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span className="sr-only">Home</span>
                    </span>
                  ) : (
                    crumb.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.label,
              item: `https://cbd-portal.vercel.app${crumb.href}`,
            })),
          }),
        }}
      />
    </nav>
  );
}
