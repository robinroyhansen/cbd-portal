import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD Cost Calculator | Compare Price Per mg',
    description: 'Compare CBD product costs per milligram. Find the best value products and calculate how long your CBD will last based on daily usage.',
    alternates: getHreflangAlternates('/tools/cost-calculator'),
  };
}

export default function CostCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
