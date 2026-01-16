import Link from 'next/link';
import { MegaMenu } from './MegaMenu';
import { getNavigationData } from '@/lib/navigation';
import { SearchBar } from './SearchBar';

export async function Header() {
  const categories = await getNavigationData();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-700">CBD Portal</span>
          </Link>

          {/* Navigation */}
          <MegaMenu categories={categories} />

          {/* Search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}