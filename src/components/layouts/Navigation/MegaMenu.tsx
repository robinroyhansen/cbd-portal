'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import type { NavItem, NavChild, MegaMenuConfig } from './navItems';

interface MegaMenuProps {
  item: NavItem;
  isOpen: boolean;
  columnHeader: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface FeaturedItemProps {
  child: NavChild;
}

interface CategoryItemProps {
  child: NavChild;
}

/**
 * Featured item in mega menu - shows icon, label, and optional description/research link
 */
function FeaturedItem({ child }: FeaturedItemProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group/item">
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
  );
}

/**
 * Category item in mega menu - simpler style without research links
 */
function CategoryItem({ child }: CategoryItemProps) {
  return (
    <Link
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
  );
}

/**
 * Featured column component - left side of mega menu
 */
function FeaturedColumn({ featured, columnHeader }: { featured: NavChild[]; columnHeader: string }) {
  return (
    <div className="p-4 border-r border-gray-100">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {columnHeader}
      </h3>
      <div className="space-y-1">
        {featured.map((child) => (
          <FeaturedItem key={child.href} child={child} />
        ))}
      </div>
    </div>
  );
}

/**
 * Categories column component - right side of mega menu
 */
function CategoriesColumn({ categories }: { categories: MegaMenuConfig['categories'] }) {
  if (!categories) return null;

  return (
    <div className="p-4">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {category.title}
          </h3>
          <div className="space-y-1">
            {category.items.map((child) => (
              <CategoryItem key={child.href} child={child} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Footer section with "View all" link
 */
function MegaMenuFooter({ footer }: { footer: MegaMenuConfig['footer'] }) {
  if (!footer) return null;

  return (
    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-xl">
      <Link
        href={footer.href}
        className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-2"
      >
        {footer.label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * Desktop mega menu dropdown component
 * Displays featured items, categories, and footer link in a two-column layout
 */
export function MegaMenu({ item, isOpen, columnHeader, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  if (!item.megaMenu) return null;

  const { featured, categories, footer } = item.megaMenu;

  return (
    <div
      id={`dropdown-${item.href.replace('/', '')}`}
      role="menu"
      aria-label={`${item.label} submenu`}
      className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100 transition-all duration-200
        ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="grid grid-cols-2 gap-0">
        {/* Featured Column */}
        {featured && (
          <FeaturedColumn featured={featured} columnHeader={columnHeader} />
        )}

        {/* Categories Column */}
        {categories && (
          <CategoriesColumn categories={categories} />
        )}
      </div>

      {/* Footer */}
      <MegaMenuFooter footer={footer} />
    </div>
  );
}
