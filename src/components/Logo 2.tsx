'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const logoMap: Record<string, string> = {
  'swissorganic.co.uk': 'CBD.uk',
  'cbd-portal.vercel.app': 'CBD Portal',
  'cbd.dk': 'CBD.dk',
  'cbd.se': 'CBD.se',
  'cbd.no': 'CBD.no',
  'cbd.fi': 'CBD.fi',
  'cbd.de': 'CBD.de',
  'cbd.it': 'CBD.it',
  'cbd.pt': 'CBD.pt',
  'cbdportaal.nl': 'CBDportaal.nl',
  'cbdportail.fr': 'CBDportail.fr',
  'cbdportal.ro': 'CBDportal.ro',
  'cbdportal.es': 'CBDportal.es',
  'cbdportal.ch': 'CBDportal.ch',
  'localhost': 'CBD Portal'
};

export function Logo() {
  const [logoText, setLogoText] = useState('CBD Portal');

  useEffect(() => {
    const hostname = window.location.hostname;
    setLogoText(logoMap[hostname] || 'CBD Portal');
  }, []);

  return (
    <Link href="/" className="text-2xl font-bold text-green-700 hover:text-green-800">
      {logoText}
    </Link>
  );
}