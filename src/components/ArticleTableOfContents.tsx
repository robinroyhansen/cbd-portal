'use client';

import { useState, useEffect, useCallback } from 'react';
import { TOCItem } from '@/lib/utils/toc';

interface ArticleTableOfContentsProps {
  items: TOCItem[];
  variant?: 'mobile' | 'desktop' | 'both';
  className?: string;
}

export function ArticleTableOfContents({ items, variant = 'both', className = '' }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Scroll spy - track which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const headings = items.flatMap(item => [
        item,
        ...(item.children || [])
      ]);

      let currentId = '';

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section is considered active when its top is above 150px from viewport top
          if (rect.top <= 150) {
            currentId = heading.id;
          }
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Smooth scroll to section
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header + some padding
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsExpanded(false); // Close mobile menu after click
    }
  }, []);

  if (items.length === 0) return null;

  const showMobile = variant === 'mobile' || variant === 'both';
  const showDesktop = variant === 'desktop' || variant === 'both';

  return (
    <>
      {/* Mobile TOC - Collapsible at top */}
      {showMobile && (
      <div className={`lg:hidden mb-6 ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left"
        >
          <span className="flex items-center gap-2 font-medium text-gray-900">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Table of Contents
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <nav className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeId === item.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.text}
                  </button>
                  {item.children && item.children.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => scrollToSection(child.id)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                              activeId === child.id
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {child.text}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      )}

      {/* Desktop TOC - Sticky sidebar */}
      {showDesktop && (
      <nav
        className={`hidden lg:block sticky top-24 ${className}`}
        aria-label="Table of contents"
      >
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            On This Page
          </h2>

          <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                    activeId === item.id
                      ? 'bg-green-100 text-green-800 font-medium border-l-2 border-green-500'
                      : 'text-gray-700 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  {item.text}
                </button>

                {/* Nested H3 items */}
                {item.children && item.children.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l border-gray-200">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => scrollToSection(child.id)}
                          className={`w-full text-left pl-4 pr-3 py-1.5 text-sm rounded-r-lg transition-all ${
                            activeId === child.id
                              ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-500 -ml-px'
                              : 'text-gray-600 hover:bg-white hover:text-gray-800'
                          }`}
                        >
                          {child.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Progress indicator line */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{items.length} sections</span>
            </div>
          </div>
        </div>
      </nav>
      )}
    </>
  );
}
