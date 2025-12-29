'use client';

import { usePathname } from 'next/navigation';
import { LanguageSelector } from './LanguageSelector';

export function LanguageSelectorWrapper() {
  const pathname = usePathname();

  // Extract article slug if on article page
  let currentSlug: string | undefined;
  const articleMatch = pathname.match(/^\/articles\/(.+)$/);
  if (articleMatch) {
    currentSlug = articleMatch[1];
  }

  return <LanguageSelector currentSlug={currentSlug} />;
}