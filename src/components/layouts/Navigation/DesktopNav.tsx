'use client';

import type { NavItem } from './navItems';
import { NavLink } from './NavLink';
import { MegaMenu } from './MegaMenu';

interface DesktopNavProps {
  navItems: NavItem[];
  openDropdown: string | null;
  isMobile: boolean;
  isActive: (href: string) => boolean;
  getColumnHeader: (itemLabel: string) => string;
  onDropdownOpen: (label: string) => void;
  onDropdownClose: () => void;
  onDropdownToggle: (label: string) => void;
}

interface DesktopNavButtonProps {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

/**
 * Desktop nav button for items with mega menus
 */
function DesktopNavButton({ item, isActive, isOpen, isMobile, onMouseEnter, onClick }: DesktopNavButtonProps) {
  return (
    <button
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'text-green-700 bg-green-50'
          : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
        }`}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-controls={`dropdown-${item.href.replace('/', '')}`}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

/**
 * Desktop navigation bar component
 * Renders the main navigation with mega menu dropdowns
 */
export function DesktopNav({
  navItems,
  openDropdown,
  isMobile,
  isActive,
  getColumnHeader,
  onDropdownOpen,
  onDropdownClose,
  onDropdownToggle,
}: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <div key={item.href} className="relative group">
          {item.megaMenu ? (
            <>
              <DesktopNavButton
                item={item}
                isActive={isActive(item.href)}
                isOpen={openDropdown === item.label}
                isMobile={isMobile}
                onMouseEnter={() => !isMobile && onDropdownOpen(item.label)}
                onClick={() => isMobile && onDropdownToggle(item.label)}
              />

              <MegaMenu
                item={item}
                isOpen={openDropdown === item.label}
                columnHeader={getColumnHeader(item.label)}
                onMouseEnter={() => !isMobile && onDropdownOpen(item.label)}
                onMouseLeave={() => !isMobile && onDropdownClose()}
              />
            </>
          ) : (
            <NavLink item={item} isActive={isActive(item.href)} />
          )}
        </div>
      ))}
    </nav>
  );
}
