'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import type { NavItem } from './navItems';

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

/**
 * Individual navigation link component
 * Used for nav items without mega menus (simple links)
 */
export function NavLink({ item, isActive, isMobile = false, onNavigate }: NavLinkProps) {
  if (isMobile) {
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg font-medium transition-colors
          ${isActive
            ? 'bg-green-50 text-green-700'
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
        onClick={onNavigate}
      >
        <span className="text-xl">{item.icon}</span>
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'text-green-700 bg-green-50'
          : 'text-gray-700 hover:text-green-700 hover:bg-gray-50'
        }`}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}
