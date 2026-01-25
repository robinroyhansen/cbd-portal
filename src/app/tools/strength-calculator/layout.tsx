import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Strength Calculator | Convert %, mg/ml, Total mg',
    description: 'Convert between CBD percentages, mg/ml, and total mg. Calculate drops needed for your target dose and compare product strengths.',
    alternates: getHreflangAlternates('/tools/strength-calculator'),
  };
}

export default function StrengthCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
