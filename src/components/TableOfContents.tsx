'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  label: string;
  children?: TOCItem[];
}

// Full Review sub-sections based on review criteria
const FULL_REVIEW_SECTIONS: TOCItem[] = [
  { id: 'section-quality-testing', label: 'Quality & Testing' },
  { id: 'section-transparency', label: 'Transparency' },
  { id: 'section-reputation', label: 'Reputation' },
  { id: 'section-value-pricing', label: 'Value & Pricing' },
  { id: 'section-customer-experience', label: 'Customer Experience' },
  { id: 'section-product-range', label: 'Product Range' },
  { id: 'section-certifications', label: 'Certifications' },
  { id: 'section-sourcing', label: 'Sourcing' },
  { id: 'section-education', label: 'Education' },
];

const TOC_ITEMS: TOCItem[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'about', label: 'About' },
  { id: 'score-breakdown', label: 'Score Breakdown' },
  { id: 'pros-cons', label: 'Pros & Cons' },
  { id: 'full-review', label: 'Full Review', children: FULL_REVIEW_SECTIONS },
  { id: 'verdict', label: 'Verdict' },
  { id: 'faqs', label: 'FAQs' },
];

// Get all section IDs (flat list for scroll detection)
function getAllSectionIds(): string[] {
  const ids: string[] = [];
  for (const item of TOC_ITEMS) {
    ids.push(item.id);
    if (item.children) {
      ids.push(...item.children.map(c => c.id));
    }
  }
  return ids;
}

export function TableOfContents() {
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['full-review']));

  useEffect(() => {
    const allIds = getAllSectionIds();

    const handleScroll = () => {
      // Show TOC after scrolling past hero (300px)
      setIsVisible(window.scrollY > 300);

      // Find the current section
      const sections = allIds.map(id => ({
        id,
        element: document.getElementById(id)
      })).filter(s => s.element);

      let currentSection = '';
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          // If section top is in the upper half of viewport
          if (rect.top <= 200) {
            currentSection = section.id;
          }
        }
      }
      setActiveId(currentSection);

      // Auto-expand Full Review when scrolling through its sub-sections
      if (currentSection.startsWith('section-')) {
        setExpandedSections(prev => new Set([...prev, 'full-review']));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Check if a parent item or any of its children are active
  const isParentOrChildActive = (item: TOCItem): boolean => {
    if (activeId === item.id) return true;
    if (item.children) {
      return item.children.some(child => activeId === child.id);
    }
    return false;
  };

  return (
    <nav
      className={`hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
      }`}
      aria-label="Table of contents"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-4 max-w-[200px] max-h-[70vh] overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          On this page
        </h3>
        <ul className="space-y-0.5">
          {TOC_ITEMS.map(item => (
            <li key={item.id}>
              {item.children ? (
                // Item with children (Full Review)
                <div>
                  <button
                    onClick={() => {
                      scrollToSection(item.id);
                      toggleExpanded(item.id);
                    }}
                    className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      isParentOrChildActive(item)
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        expandedSections.has(item.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Nested items */}
                  <ul
                    className={`overflow-hidden transition-all duration-200 ${
                      expandedSections.has(item.id) ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.children.map(child => (
                      <li key={child.id}>
                        <button
                          onClick={() => scrollToSection(child.id)}
                          className={`block w-full text-left pl-5 pr-3 py-1 text-xs rounded-lg transition-colors ${
                            activeId === child.id
                              ? 'bg-green-50 text-green-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                // Regular item without children
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeId === item.id
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
