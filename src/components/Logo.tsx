'use client';

import { useEffect, useState } from 'react';
import { getLogoText } from '@/lib/language';
import Link from 'next/link';

export function Logo() {
  const [logoText, setLogoText] = useState('CBD Portal');

  useEffect(() => {
    setLogoText(getLogoText(window.location.hostname));
  }, []);

  return (
    <Link href="/" className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
      {logoText}
    </Link>
  );
}