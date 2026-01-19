'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠'
  },
  {
    label: 'Health Topics',
    href: '/categories/conditions',
    icon: '🏥',
    children: [
      { label: 'Anxiety', href: '/articles/cbd-and-anxiety', description: 'Research on CBD for anxiety disorders' },
      { label: 'Sleep', href: '/articles/cbd-and-sleep', description: 'CBD for insomnia and sleep quality' },
      { label: 'Pain', href: '/articles/cbd-and-pain', description: 'Chronic pain and CBD research' },
      { label: 'Depression', href: '/articles/cbd-and-depression', description: 'CBD and mood disorders' },
      { label: 'Inflammation', href: '/articles/cbd-and-inflammation', description: 'Anti-inflammatory properties' },
      { label: 'Epilepsy', href: '/articles/cbd-and-epilepsy', description: 'FDA-approved CBD treatment' },
      { label: 'View All Conditions', href: '/categories/conditions', description: '' },
    ]
  },
  {
    label: 'Learn',
    href: '/categories/guides',
    icon: '📚',
    children: [
      { label: 'Beginner Guides', href: '/categories/guides', description: 'Start here if you\'re new to CBD' },
      { label: 'CBD Products', href: '/categories/products', description: 'Oils, capsules, topicals & more' },
      { label: 'CBD Science', href: '/categories/science', description: 'How cannabinoids work' },
      { label: 'Legal & Safety', href: '/categories/legal', description: 'Regulations and safety info' },
      { label: 'Glossary', href: '/glossary', description: 'CBD terminology explained' },
    ]
  },
  {
    label: 'Research',
    href: '/research',
    icon: '🔬'
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: '⭐'
  },
  {
    label: 'Tools',
    href: '/tools',
    icon: '⚙️',
    children: [
      { label: 'CBD Dosage Calculator', href: '/tools/dosage-calculator', description: 'Get personalized dosing recommendations' },
      { label: 'Animal CBD Calculator', href: '/tools/animal-dosage-calculator', description: 'Veterinary-guided dosing for pets' },
      { label: 'Drug Interaction Checker', href: '/tools/interactions', description: 'Coming soon - Check CBD interactions' },
      { label: 'Product Finder', href: '/tools/product-finder', description: 'Coming soon - Find the right CBD product' },
    ]
  },
  {
    label: 'Articles',
    href: '/articles',
    icon: '📄'
  }
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-xl text-gray-900">CBD Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <>
                    <button
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${pathname.startsWith(item.href)
                          ? 'text-green-700 bg-green-50'
                          : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                        }`}
                      onMouseEnter={() => !isMobile && setOpenDropdown(item.label)}
                      onClick={() => isMobile && toggleDropdown(item.label)}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Desktop Dropdown */}
                    <div
                      className={`absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200
                        ${openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
                      `}
                      onMouseEnter={() => !isMobile && setOpenDropdown(item.label)}
                      onMouseLeave={() => !isMobile && setOpenDropdown(null)}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{child.label}</div>
                          {child.description && (
                            <div className="text-sm text-gray-500 mt-0.5">{child.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${pathname === item.href
                        ? 'text-green-700 bg-green-50'
                        : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 border-b">
          <Link
            href="/search"
            className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search articles...</span>
          </Link>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="p-4 pb-20 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mb-2">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left font-medium transition-colors
                      ${openDropdown === item.label ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Mobile Dropdown Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                      ${openDropdown === item.label ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="pl-4 py-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors min-h-[60px] flex flex-col justify-center"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="font-medium">{child.label}</div>
                          {child.description && (
                            <div className="text-sm text-gray-400 mt-0.5">{child.description}</div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                    ${pathname === item.href
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu Footer */}
        <div className="border-t bg-gray-50 p-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/about"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/authors"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Experts
            </Link>
            <Link
              href="/editorial-policy"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Editorial Policy
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
