import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Dosage Calculator | Personalized Recommendations',
    description: 'Get personalized CBD dosing recommendations based on your body weight, experience level, and health goals. Science-based calculations with safety guidelines.',
    alternates: getHreflangAlternates('/tools/dosage-calculator'),
  };
}

export default function DosageCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
