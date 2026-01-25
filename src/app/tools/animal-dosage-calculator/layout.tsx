import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Pet CBD Dosage Calculator | Dogs, Cats, Horses & More',
    description: 'Veterinary-guided CBD dosing recommendations for dogs, cats, horses, and other animals. Species-specific calculations with safety protocols.',
    alternates: getHreflangAlternates('/tools/animal-dosage-calculator'),
  };
}

export default function AnimalDosageCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
