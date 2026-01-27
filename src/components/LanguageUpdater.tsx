'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface LanguageUpdaterProps {
  onLanguageChange: (lang: string) => void;
}

/**
 * Client component that detects ?lang= parameter and triggers language change
 * This is used to override the server-detected language for dev testing
 */
export function LanguageUpdater({ onLanguageChange }: LanguageUpdaterProps) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');

  useEffect(() => {
    if (langParam) {
      onLanguageChange(langParam);
    }
  }, [langParam, onLanguageChange]);

  return null;
}
