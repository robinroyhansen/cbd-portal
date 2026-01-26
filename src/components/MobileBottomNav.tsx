'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationContext } from './NavigationWrapper';
import { useLocale } from '@/hooks/useLocale';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  action?: 'link' | 'search' | 'menu';
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobileMenu } = useNavigationContext();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { t } = useLocale();

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navItems: NavItem[] = useMemo(() => [
    {
      label: t('common.home'),
      href: '/',
      action: 'link',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      label: t('mobile.search'),
      href: '/search',
      action: 'search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34A6.505 6.505 0 004.12 9.5c0 3.59 2.91 6.5 6.5 6.5 1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L21.49 19l-5.99-5zm-5.38 0c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z" />
        </svg>
      ),
    },
    {
      label: t('mobile.topics'),
      href: '/conditions',
      action: 'link',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z" />
        </svg>
      ),
    },
    {
      label: t('mobile.tools'),
      href: '/tools',
      action: 'link',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-.55 0-1-.45-1-1v-4H7c-.55 0-1-.45-1-1s.45-1 1-1h4V6c0-.55.45-1 1-1s1 .45 1 1v4h4c.55 0 1 .45 1 1s-.45 1-1 1h-4v4c0 .55-.45 1-1 1z" />
        </svg>
      ),
    },
    {
      label: t('mobile.menu'),
      href: '#',
      action: 'menu',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ], [t]);

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'search') {
      setIsSearchOpen(true);
    } else if (item.action === 'menu') {
      toggleMobileMenu();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Popular search terms - these could be translated in the future
  const popularSearchTerms = useMemo(() => [
    { key: 'anxiety', label: t('conditions.anxiety') || 'Anxiety' },
    { key: 'sleep', label: t('conditions.sleep') || 'Sleep' },
    { key: 'pain', label: t('conditions.chronicPain') || 'Pain Relief' },
    { key: 'dosage', label: t('tools.dosageCalculator') || 'Dosage' },
    { key: 'interactions', label: t('quickLinks.drugInteractions') || 'Drug Interactions' },
  ], [t]);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden transition-transform duration-300
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = item.action === 'link' && isActive(item.href);
            const isSearchItem = item.action === 'search';

            if (item.action === 'link') {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors
                    ${active ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  {active ? item.activeIcon : item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.action}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors
                  ${isSearchItem && isSearchOpen ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {isSearchItem && isSearchOpen ? item.activeIcon : item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl lg:hidden animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('common.search')}</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.searchConditions')}
                    className="w-full px-4 py-3 pl-12 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="w-full mt-3 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                >
                  {t('common.search')}
                </button>
              </form>

              {/* Quick links */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">{t('mobile.popularSearches')}</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearchTerms.map((term) => (
                    <Link
                      key={term.key}
                      href={`/search?q=${encodeURIComponent(term.key)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="px-3 py-1.5 min-h-[44px] inline-flex items-center bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {term.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add bottom padding spacer to main content */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          main {
            padding-bottom: calc(64px + env(safe-area-inset-bottom));
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
