'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { SearchBar } from '@/components/SearchBar';

interface NavSearchBarProps {
  searchLabel: string;
  searchPlaceholder: string;
}

/**
 * Desktop search bar - renders the actual SearchBar component
 */
export function DesktopSearchBar() {
  return (
    <div className="hidden lg:block">
      <SearchBar />
    </div>
  );
}

/**
 * Mobile search button - links to search page
 */
export function MobileSearchButton({ searchLabel }: { searchLabel: string }) {
  return (
    <Link
      href="/search"
      className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      aria-label={searchLabel}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </Link>
  );
}

/**
 * Mobile menu search link - shown inside the mobile drawer
 */
export function MobileMenuSearchLink({ searchPlaceholder, onNavigate }: { searchPlaceholder: string; onNavigate: () => void }) {
  return (
    <div className="p-4 border-b">
      <Link
        href="/search"
        className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-500"
        onClick={onNavigate}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>{searchPlaceholder}</span>
      </Link>
    </div>
  );
}
