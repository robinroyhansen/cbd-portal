'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationContext } from '@/components/NavigationWrapper';
import { useLocale } from '@/hooks/useLocale';
import { buildNavItems, getColumnHeader } from './navItems';
import { DesktopNav } from './DesktopNav';
import { MobileNav, MobileMenuButton } from './MobileNav';
import { DesktopSearchBar, MobileSearchButton } from './NavSearchBar';

interface NavigationProps {
  currentLang?: string;
}

/**
 * Main Navigation component
 * Manages state and coordinates between desktop and mobile navigation
 */
export function Navigation({ currentLang = 'en' }: NavigationProps) {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useNavigationContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Build navigation items with translations
  const navItems = useMemo(() => buildNavItems(t), [t]);

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

  // Dropdown handlers
  const handleDropdownOpen = (label: string) => {
    setOpenDropdown(label);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // Check if path is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Get column header with translations
  const getHeader = (itemLabel: string) => getColumnHeader(itemLabel, t);

  // Mobile menu handlers
  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Translation strings for mobile nav
  const mobileTranslations = {
    menu: t('common.menu'),
    closeMenu: t('nav.closeMenu') || 'Close menu',
    searchPlaceholder: t('common.searchPlaceholder'),
    about: t('nav.about'),
    contact: t('nav.contact'),
    ourExperts: t('nav.ourExperts'),
    editorialPolicy: t('nav.editorialPolicy'),
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label={`${t('meta.siteName')} - Go to homepage`}
          >
            <span className="text-2xl" aria-hidden="true">{'\u{1F33F}'}</span>
            <span className="font-bold text-xl text-gray-900">{t('meta.siteName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav
            navItems={navItems}
            openDropdown={openDropdown}
            isMobile={isMobile}
            isActive={isActive}
            getColumnHeader={getHeader}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClose={handleDropdownClose}
            onDropdownToggle={handleDropdownToggle}
          />

          {/* Desktop Search */}
          <DesktopSearchBar />

          {/* Mobile Search Button */}
          <MobileSearchButton searchLabel={t('common.search')} />

          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={isMobileMenuOpen}
            toggleLabel={t('nav.toggleMenu') || 'Open menu'}
            closeLabel={t('nav.closeMenu') || 'Close menu'}
            onClick={handleMobileMenuToggle}
            buttonRef={mobileMenuButtonRef}
          />
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        navItems={navItems}
        isOpen={isMobileMenuOpen}
        openDropdown={openDropdown}
        currentLang={currentLang}
        translations={mobileTranslations}
        isActive={isActive}
        onClose={handleMobileMenuClose}
        onDropdownToggle={handleDropdownToggle}
        mobileMenuButtonRef={mobileMenuButtonRef}
      />
    </header>
  );
}
