'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: {
    name: string;
    slug: string;
    articleCount: number;
  }[];
  featuredArticles: {
    title: string;
    slug: string;
  }[];
}

interface MegaMenuProps {
  categories: NavCategory[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(slug);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav ref={menuRef} className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1">
        <Link
          href="/"
          className="px-4 py-2 text-gray-700 hover:text-green-700 font-medium"
        >
          Home
        </Link>

        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.slug)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={`/categories/${category.slug}`}
              className={`flex items-center gap-1 px-4 py-2 font-medium transition-colors ${
                activeMenu === category.slug
                  ? 'text-green-700'
                  : 'text-gray-700 hover:text-green-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${activeMenu === category.slug ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {/* Mega Menu Dropdown */}
            {activeMenu === category.slug && (
              <div
                className="absolute left-0 top-full pt-2 z-50"
                onMouseEnter={() => handleMouseEnter(category.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 min-w-[500px]">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Category Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        About {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                      <Link
                        href={`/categories/${category.slug}`}
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Explore all {category.name}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Featured Articles */}
                    <div className="border-l border-gray-200 pl-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Popular Articles
                      </h3>
                      <div className="space-y-3">
                        {category.featuredArticles.length > 0 ? (
                          category.featuredArticles.map((article) => (
                            <Link
                              key={article.slug}
                              href={`/articles/${article.slug}`}
                              className="block text-sm text-gray-600 hover:text-green-700 line-clamp-2"
                            >
                              → {article.title}
                            </Link>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Articles coming soon
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <Link
          href="/research"
          className="px-4 py-2 text-gray-700 hover:text-green-700 font-medium"
        >
          Research
        </Link>
      </div>

      {/* Mobile Navigation Toggle */}
      <button
        className="lg:hidden p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="py-4">
            <Link
              href="/"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            {categories.map((category) => (
              <div key={category.id} className="border-t border-gray-100">
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-50 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>

                {category.featuredArticles.length > 0 && (
                  <div className="bg-gray-50 py-2">
                    {category.featuredArticles.slice(0, 2).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/articles/${article.slug}`}
                        className="block px-10 py-2 text-sm text-gray-600 hover:text-green-700 line-clamp-1"
                        onClick={() => setMobileOpen(false)}
                      >
                        → {article.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/research"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-50 border-t border-gray-100"
              onClick={() => setMobileOpen(false)}
            >
              Research
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}