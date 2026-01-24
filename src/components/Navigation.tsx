'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { useNavigationContext } from './NavigationWrapper';

interface NavChild {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  researchHref?: string; // Link to filtered research database
}

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavChild[];
  megaMenu?: {
    featured?: NavChild[];
    categories?: { title: string; items: NavChild[] }[];
    footer?: { label: string; href: string };
  };
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Health Topics',
    href: '/conditions',
    icon: '🏥',
    megaMenu: {
      featured: [
        { label: 'Anxiety', href: '/conditions/anxiety', description: '353 studies', icon: '😰', researchHref: '/research/anxiety' },
        { label: 'Sleep & Insomnia', href: '/conditions/sleep', description: '287 studies', icon: '😴', researchHref: '/research/sleep' },
        { label: 'Chronic Pain', href: '/conditions/chronic_pain', description: '412 studies', icon: '💪', researchHref: '/research/chronic_pain' },
        { label: 'Depression', href: '/conditions/depression', description: '198 studies', icon: '😔', researchHref: '/research/depression' },
        { label: 'Epilepsy', href: '/conditions/epilepsy', description: 'Clinically proven', icon: '⚡', researchHref: '/research/epilepsy' },
        { label: 'Inflammation', href: '/conditions/inflammation', description: '267 studies', icon: '🔥', researchHref: '/research/inflammation' },
      ],
      categories: [
        {
          title: 'Browse by Body System',
          items: [
            { label: 'Mental Health', href: '/conditions?category=mental_health', icon: '🧠' },
            { label: 'Pain & Discomfort', href: '/conditions?category=pain', icon: '💪' },
            { label: 'Neurological', href: '/conditions?category=neurological', icon: '⚡' },
            { label: 'Digestive Health', href: '/conditions?category=gastrointestinal', icon: '🍃' },
            { label: 'Skin Conditions', href: '/conditions?category=skin', icon: '✨' },
            { label: 'Cardiovascular', href: '/conditions?category=cardiovascular', icon: '❤️' },
          ]
        }
      ],
      footer: { label: 'View all 300+ conditions', href: '/conditions' }
    }
  },
  {
    label: 'Learn',
    href: '/articles',
    icon: '📚',
    megaMenu: {
      featured: [
        { label: 'CBD Basics', href: '/categories/cbd-basics', description: 'Start here if you\'re new', icon: '🌱' },
        { label: 'Science & Research', href: '/categories/science', description: 'How cannabinoids work', icon: '🔬' },
        { label: 'Guides & How-To', href: '/categories/guides', description: 'Practical advice', icon: '📖' },
        { label: 'Products & Formats', href: '/categories/products', description: 'Oils, capsules, topicals', icon: '💊' },
        { label: 'Legal & Safety', href: '/categories/legal', description: 'Regulations and safety', icon: '⚖️' },
      ],
      categories: [
        {
          title: 'Quick Access',
          items: [
            { label: 'Glossary', href: '/glossary', description: '263 terms defined', icon: '📖' },
            { label: 'All Articles', href: '/articles', description: '1,000+ articles', icon: '📄' },
            { label: 'Our Authors', href: '/authors', description: 'Meet our experts', icon: '👨‍⚕️' },
          ]
        }
      ],
      footer: { label: 'Browse all articles', href: '/articles' }
    }
  },
  {
    label: 'Research',
    href: '/research',
    icon: '🔬'
  },
  {
    label: 'Tools',
    href: '/tools',
    icon: '🧮',
    megaMenu: {
      featured: [
        { label: 'CBD Dosage Calculator', href: '/tools/dosage-calculator', description: 'Personalized recommendations', icon: '💊' },
        { label: 'Drug Interaction Checker', href: '/tools/interactions', description: 'Check CBD-medication safety', icon: '⚠️' },
        { label: 'CBD Cost Calculator', href: '/tools/cost-calculator', description: 'Compare price per mg', icon: '💰' },
        { label: 'Strength Calculator', href: '/tools/strength-calculator', description: 'Convert mg/ml & percentages', icon: '📊' },
        { label: 'Pet Dosage Calculator', href: '/tools/animal-dosage-calculator', description: 'Vet-guided dosing', icon: '🐕' },
      ],
      categories: [
        {
          title: 'Coming Soon',
          items: [
            { label: 'Product Comparison Tool', href: '/tools', description: 'Compare CBD products', icon: '📋' },
            { label: 'Lab Report Decoder', href: '/tools', description: 'Understand COAs', icon: '🔍' },
            { label: 'Tolerance Calculator', href: '/tools', description: 'Track your usage', icon: '📈' },
          ]
        }
      ],
      footer: { label: 'View all tools', href: '/tools' }
    }
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: '⭐'
  }
];

export function Navigation() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigationContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
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
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative group">
                {item.megaMenu ? (
                  <>
                    <button
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive(item.href)
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

                    {/* Mega Menu Dropdown */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100 transition-all duration-200
                        ${openDropdown === item.label ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
                      `}
                      onMouseEnter={() => !isMobile && setOpenDropdown(item.label)}
                      onMouseLeave={() => !isMobile && setOpenDropdown(null)}
                    >
                      <div className="grid grid-cols-2 gap-0">
                        {/* Featured Column */}
                        {item.megaMenu.featured && (
                          <div className="p-4 border-r border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              {item.label === 'Health Topics' ? 'Popular Conditions' : 'Categories'}
                            </h3>
                            <div className="space-y-1">
                              {item.megaMenu.featured.map((child) => (
                                <div key={child.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group/item">
                                  <span className="text-lg">{child.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={child.href}
                                      className="font-medium text-gray-900 group-hover/item:text-green-700 block"
                                    >
                                      {child.label}
                                    </Link>
                                    {child.description && child.researchHref ? (
                                      <Link
                                        href={child.researchHref}
                                        className="text-xs text-green-600 hover:text-green-700 hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {child.description}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </Link>
                                    ) : child.description ? (
                                      <div className="text-xs text-gray-500">{child.description}</div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Categories Column */}
                        {item.megaMenu.categories && (
                          <div className="p-4">
                            {item.megaMenu.categories.map((category) => (
                              <div key={category.title}>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                  {category.title}
                                </h3>
                                <div className="space-y-1">
                                  {category.items.map((child) => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group/item"
                                    >
                                      <span className="text-lg">{child.icon}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 group-hover/item:text-green-700 text-sm">{child.label}</div>
                                        {child.description && (
                                          <div className="text-xs text-gray-500">{child.description}</div>
                                        )}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {item.megaMenu.footer && (
                        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-xl">
                          <Link
                            href={item.megaMenu.footer.href}
                            className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2"
                          >
                            {item.megaMenu.footer.label}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive(item.href)
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
          <div className="hidden lg:block">
            <SearchBar />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
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
            <span>Search CBD Portal...</span>
          </Link>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="p-4 pb-20 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mb-2">
              {item.megaMenu ? (
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
                      ${openDropdown === item.label ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="pl-4 py-2 space-y-1">
                      {/* Featured items */}
                      {item.megaMenu.featured?.map((child) => (
                        <div
                          key={child.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <span className="text-lg">{child.icon}</span>
                          <div className="flex-1">
                            <Link
                              href={child.href}
                              className="font-medium block"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                            {child.description && child.researchHref ? (
                              <Link
                                href={child.researchHref}
                                className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.description}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            ) : child.description ? (
                              <div className="text-xs text-gray-400">{child.description}</div>
                            ) : null}
                          </div>
                        </div>
                      ))}

                      {/* Separator */}
                      {item.megaMenu.categories && (
                        <div className="border-t border-gray-100 my-2 mx-4"></div>
                      )}

                      {/* Category items */}
                      {item.megaMenu.categories?.map((category) => (
                        <div key={category.title}>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {category.title}
                          </div>
                          {category.items.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="text-lg">{child.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{child.label}</div>
                                {child.description && (
                                  <div className="text-xs text-gray-400">{child.description}</div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}

                      {/* Footer link */}
                      {item.megaMenu.footer && (
                        <Link
                          href={item.megaMenu.footer.href}
                          className="flex items-center gap-2 px-4 py-3 text-green-700 font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.megaMenu.footer.label}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors
                    ${isActive(item.href)
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
