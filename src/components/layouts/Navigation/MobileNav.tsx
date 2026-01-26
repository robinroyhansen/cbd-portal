'use client';

import { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { NavItem, NavChild } from './navItems';
import { NavLink } from './NavLink';
import { MobileMenuSearchLink } from './NavSearchBar';
import { MobileLanguageSwitcher } from '@/components/MobileLanguageSwitcher';

interface MobileNavProps {
  navItems: NavItem[];
  isOpen: boolean;
  openDropdown: string | null;
  currentLang: string;
  translations: {
    menu: string;
    closeMenu: string;
    searchPlaceholder: string;
    about: string;
    contact: string;
    ourExperts: string;
    editorialPolicy: string;
  };
  isActive: (href: string) => boolean;
  onClose: () => void;
  onDropdownToggle: (label: string) => void;
  mobileMenuButtonRef: React.RefObject<HTMLButtonElement | null>;
}

interface MobileDropdownItemProps {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

interface MobileFeaturedItemProps {
  child: NavChild;
  onNavigate: () => void;
}

interface MobileCategoryItemProps {
  child: NavChild;
  onNavigate: () => void;
}

/**
 * Mobile menu header with close button
 */
function MobileMenuHeader({ menuTitle, closeLabel, onClose }: { menuTitle: string; closeLabel: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <span className="font-bold text-lg text-gray-900" id="mobile-menu-title">{menuTitle}</span>
      <button
        onClick={onClose}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        aria-label={closeLabel}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Mobile featured item with research link
 */
function MobileFeaturedItem({ child, onNavigate }: MobileFeaturedItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
      <span className="text-lg">{child.icon}</span>
      <div className="flex-1">
        <Link
          href={child.href}
          className="font-medium block"
          onClick={onNavigate}
        >
          {child.label}
        </Link>
        {child.description && child.researchHref ? (
          <Link
            href={child.researchHref}
            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
            onClick={onNavigate}
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
  );
}

/**
 * Mobile category item
 */
function MobileCategoryItem({ child, onNavigate }: MobileCategoryItemProps) {
  return (
    <Link
      href={child.href}
      className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
      onClick={onNavigate}
    >
      <span className="text-lg">{child.icon}</span>
      <div className="flex-1">
        <div className="font-medium">{child.label}</div>
        {child.description && (
          <div className="text-xs text-gray-400">{child.description}</div>
        )}
      </div>
    </Link>
  );
}

/**
 * Mobile dropdown item with expandable content
 */
function MobileDropdownItem({ item, isOpen, onToggle, onNavigate }: MobileDropdownItemProps) {
  if (!item.megaMenu) return null;

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-left font-medium transition-colors
          ${isOpen ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={`mobile-dropdown-${item.href.replace('/', '')}`}
      >
        <span className="flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="pl-4 py-2 space-y-1">
          {/* Featured items */}
          {item.megaMenu.featured?.map((child) => (
            <MobileFeaturedItem key={child.href} child={child} onNavigate={onNavigate} />
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
                <MobileCategoryItem key={child.href} child={child} onNavigate={onNavigate} />
              ))}
            </div>
          ))}

          {/* Footer link */}
          {item.megaMenu.footer && (
            <Link
              href={item.megaMenu.footer.href}
              className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-green-700 font-medium"
              onClick={onNavigate}
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
  );
}

/**
 * Mobile menu footer with secondary links
 */
function MobileMenuFooter({ translations, onNavigate }: { translations: MobileNavProps['translations']; onNavigate: () => void }) {
  return (
    <div className="border-t bg-gray-50 p-4 flex-shrink-0">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Link
          href="/about"
          className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
          onClick={onNavigate}
        >
          {translations.about}
        </Link>
        <Link
          href="/contact"
          className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
          onClick={onNavigate}
        >
          {translations.contact}
        </Link>
        <Link
          href="/authors"
          className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
          onClick={onNavigate}
        >
          {translations.ourExperts}
        </Link>
        <Link
          href="/editorial-policy"
          className="px-3 py-2 text-center text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white"
          onClick={onNavigate}
        >
          {translations.editorialPolicy}
        </Link>
      </div>
    </div>
  );
}

/**
 * Mobile slide-out drawer navigation
 * Includes focus trap for accessibility
 */
export function MobileNav({
  navItems,
  isOpen,
  openDropdown,
  currentLang,
  translations,
  isActive,
  onClose,
  onDropdownToggle,
  mobileMenuButtonRef,
}: MobileNavProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Focus trap for mobile menu
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen || !mobileMenuRef.current) return;

    if (e.key === 'Escape') {
      onClose();
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
  }, [isOpen, onClose, mobileMenuButtonRef]);

  // Set up focus trap event listener
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu Slide-out */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={translations.menu}
        className={`fixed top-0 right-0 h-screen w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Menu Header */}
        <MobileMenuHeader
          menuTitle={translations.menu}
          closeLabel={translations.closeMenu}
          onClose={onClose}
        />

        {/* Mobile Search */}
        <MobileMenuSearchLink
          searchPlaceholder={translations.searchPlaceholder}
          onNavigate={onClose}
        />

        {/* Mobile Navigation Links */}
        <nav className="p-4 pb-20 flex-1 overflow-y-auto" role="navigation" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <div key={item.href} className="mb-2">
              {item.megaMenu ? (
                <MobileDropdownItem
                  item={item}
                  isOpen={openDropdown === item.label}
                  onToggle={() => onDropdownToggle(item.label)}
                  onNavigate={onClose}
                />
              ) : (
                <NavLink
                  item={item}
                  isActive={isActive(item.href)}
                  isMobile={true}
                  onNavigate={onClose}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Language Switcher */}
        <MobileLanguageSwitcher
          currentLang={currentLang}
          onClose={onClose}
        />

        {/* Mobile Menu Footer */}
        <MobileMenuFooter translations={translations} onNavigate={onClose} />
      </div>
    </>
  );
}

/**
 * Mobile menu toggle button for the header
 */
interface MobileMenuButtonProps {
  isOpen: boolean;
  toggleLabel: string;
  closeLabel: string;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenuButton({ isOpen, toggleLabel, closeLabel, onClick, buttonRef }: MobileMenuButtonProps) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      aria-label={isOpen ? closeLabel : toggleLabel}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}
