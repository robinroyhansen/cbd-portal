'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { useNavigationContext } from './NavigationWrapper';
import { MobileLanguageSwitcher } from './MobileLanguageSwitcher';
import { useLocale } from '@/hooks/useLocale';

interface NavChild {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  researchHref?: string;
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

interface NavigationProps {
  currentLang?: string;
}

export function Navigation({ currentLang = 'en' }: NavigationProps) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigationContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for mobile menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    if (e.key === 'Escape') {
      setIsMobileMenuOpen(false);
      mobileMenuButtonRef.current?.focus();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // Set up focus trap event listener
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the first focusable element when menu opens
      const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      firstFocusable?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, handleKeyDown]);

  // Build navigation items with translations
  const NAV_ITEMS: NavItem[] = useMemo(() => [
    {
      label: t('nav.healthTopics'),
      href: '/conditions',
      icon: '🏥',
      megaMenu: {
        featured: [
          { label: t('conditions.anxiety') || 'Anxiety', href: '/conditions/anxiety', description: `353 ${t('common.studies')}`, icon: '😰', researchHref: '/research/anxiety' },
          { label: t('conditions.sleep') || 'Sleep & Insomnia', href: '/conditions/sleep', description: `287 ${t('common.studies')}`, icon: '😴', researchHref: '/research/sleep' },
          { label: t('conditions.chronicPain') || 'Chronic Pain', href: '/conditions/chronic_pain', description: `412 ${t('common.studies')}`, icon: '💪', researchHref: '/research/chronic_pain' },
          { label: t('conditions.depression') || 'Depression', href: '/conditions/depression', description: `198 ${t('common.studies')}`, icon: '😔', researchHref: '/research/depression' },
          { label: t('conditions.epilepsy') || 'Epilepsy', href: '/conditions/epilepsy', description: t('evidence.clinicallyProven'), icon: '⚡', researchHref: '/research/epilepsy' },
          { label: t('conditions.inflammation') || 'Inflammation', href: '/conditions/inflammation', description: `267 ${t('common.studies')}`, icon: '🔥', researchHref: '/research/inflammation' },
        ],
        categories: [
          {
            title: t('nav.browseByBodySystem'),
            items: [
              { label: t('navCategories.mentalHealth'), href: '/conditions?category=mental_health', icon: '🧠' },
              { label: t('navCategories.painDiscomfort'), href: '/conditions?category=pain', icon: '💪' },
              { label: t('navCategories.neurological'), href: '/conditions?category=neurological', icon: '⚡' },
              { label: t('navCategories.digestiveHealth'), href: '/conditions?category=gastrointestinal', icon: '🍃' },
              { label: t('navCategories.skinConditions'), href: '/conditions?category=skin', icon: '✨' },
              { label: t('navCategories.cardiovascular'), href: '/conditions?category=cardiovascular', icon: '❤️' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllConditions'), href: '/conditions' }
      }
    },
    {
      label: t('nav.learn'),
      href: '/articles',
      icon: '📚',
      megaMenu: {
        featured: [
          { label: t('navLearn.cbdBasics'), href: '/categories/cbd-basics', description: t('navLearn.cbdBasicsDesc'), icon: '🌱' },
          { label: t('navLearn.scienceResearch'), href: '/categories/science', description: t('navLearn.scienceResearchDesc'), icon: '🔬' },
          { label: t('navLearn.guidesHowTo'), href: '/categories/guides', description: t('navLearn.guidesHowToDesc'), icon: '📖' },
          { label: t('navLearn.productsFormats'), href: '/categories/products', description: t('navLearn.productsFormatsDesc'), icon: '💊' },
          { label: t('navLearn.legalSafety'), href: '/categories/legal', description: t('navLearn.legalSafetyDesc'), icon: '⚖️' },
        ],
        categories: [
          {
            title: t('nav.quickAccess'),
            items: [
              { label: t('nav.glossary'), href: '/glossary', description: t('navLearn.termsDefinedCount', { count: '263' }), icon: '📖' },
              { label: t('nav.allArticles'), href: '/articles', description: t('navLearn.articlesCount', { count: '1,000' }), icon: '📄' },
              { label: t('nav.authors'), href: '/authors', description: t('navLearn.meetExperts'), icon: '👨‍⚕️' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllArticles'), href: '/articles' }
      }
    },
    {
      label: t('nav.research'),
      href: '/research',
      icon: '🔬'
    },
    {
      label: t('nav.tools'),
      href: '/tools',
      icon: '🧮',
      megaMenu: {
        featured: [
          { label: t('navTools.dosageCalculator'), href: '/tools/dosage-calculator', description: t('navTools.dosageCalculatorDesc'), icon: '💊' },
          { label: t('navTools.interactionChecker'), href: '/tools/interactions', description: t('navTools.interactionCheckerDesc'), icon: '⚠️' },
          { label: t('navTools.costCalculator'), href: '/tools/cost-calculator', description: t('navTools.costCalculatorDesc'), icon: '💰' },
          { label: t('navTools.strengthCalculator'), href: '/tools/strength-calculator', description: t('navTools.strengthCalculatorDesc'), icon: '📊' },
        ],
        categories: [
          {
            title: t('nav.comingSoon'),
            items: [
              { label: t('navTools.productComparison'), href: '/tools', description: t('navTools.productComparisonDesc'), icon: '📋' },
              { label: t('navTools.labReportDecoder'), href: '/tools', description: t('navTools.labReportDecoderDesc'), icon: '🔍' },
              { label: t('navTools.toleranceCalculator'), href: '/tools', description: t('navTools.toleranceCalculatorDesc'), icon: '📈' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllTools'), href: '/tools' }
      }
    },
    {
      label: t('nav.pets'),
      href: '/pets',
      icon: '🐾',
      megaMenu: {
        featured: [
          { label: t('navPets.dogs'), href: '/pets/dogs', description: t('navPets.dogsDesc'), icon: '🐕' },
          { label: t('navPets.cats'), href: '/pets/cats', description: t('navPets.catsDesc'), icon: '🐈' },
          { label: t('navPets.horses'), href: '/pets/horses', description: t('navPets.horsesDesc'), icon: '🐴' },
          { label: t('navPets.smallPets'), href: '/pets/small-pets', description: t('navPets.smallPetsDesc'), icon: '🐰' },
          { label: t('navPets.birds'), href: '/pets/birds', description: t('navPets.birdsDesc'), icon: '🦜' },
        ],
        categories: [
          {
            title: t('nav.petTools'),
            items: [
              { label: t('navPets.petDosageCalculator'), href: '/tools/animal-dosage-calculator', description: t('navPets.petDosageCalculatorDesc'), icon: '💊' },
            ]
          },
          {
            title: t('nav.quickLinks'),
            items: [
              { label: t('navPets.allPetArticles'), href: '/pets', description: t('navPets.allPetArticlesCount', { count: '78' }), icon: '📄' },
              { label: t('navPets.petResearch'), href: '/research?topic=veterinary', description: t('navPets.petResearchDesc'), icon: '🔬' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllPetGuides'), href: '/pets' }
      }
    },
    {
      label: t('nav.reviews'),
      href: '/reviews',
      icon: '⭐'
    }
  ], [t]);

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

  // Helper to get column header based on nav item
  const getColumnHeader = (itemLabel: string) => {
    if (itemLabel === t('nav.healthTopics')) return t('nav.popularConditions');
    return t('nav.categories');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label={`${t('meta.siteName')} - Go to homepage`}>
            <span className="text-2xl" aria-hidden="true">🌿</span>
            <span className="font-bold text-xl text-gray-900">{t('meta.siteName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <div key={item.href} className="relative group">
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
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="menu"
                      aria-controls={`dropdown-${item.href.replace('/', '')}`}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Mega Menu Dropdown */}
                    <div
                      id={`dropdown-${item.href.replace('/', '')}`}
                      role="menu"
                      aria-label={`${item.label} submenu`}
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
                              {getColumnHeader(item.label)}
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

          {/* Mobile Search Button - visible in header for quick access */}
          <Link
            href="/search"
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={t('common.search')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={isMobileMenuOpen ? t('nav.closeMenu') || 'Close menu' : t('nav.toggleMenu') || 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        ref={mobileMenuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('common.menu') || 'Navigation menu'}
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg text-gray-900" id="mobile-menu-title">{t('common.menu')}</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label={t('nav.closeMenu') || 'Close menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
            <span>{t('common.searchPlaceholder')}</span>
          </Link>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="p-4 pb-20 flex-1 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="mb-2">
              {item.megaMenu ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left font-medium transition-colors
                      ${openDropdown === item.label ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="menu"
                    aria-controls={`mobile-dropdown-${item.href.replace('/', '')}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Mobile Dropdown Content */}
                  <div
                    id={`mobile-dropdown-${item.href.replace('/', '')}`}
                    role="menu"
                    aria-label={`${item.label} submenu`}
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

        {/* Mobile Language Switcher */}
        <MobileLanguageSwitcher
          currentLang={currentLang}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Menu Footer */}
        <div className="border-t bg-gray-50 p-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/about"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            <Link
              href="/authors"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.ourExperts')}
            </Link>
            <Link
              href="/editorial-policy"
              className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.editorialPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
