import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Drug Interaction Checker | Medication Safety Tool',
    description: 'Check potential interactions between CBD and your medications. Comprehensive drug database with severity ratings and safety recommendations.',
    alternates: getHreflangAlternates('/tools/interactions'),
  };
}

export default function InteractionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
