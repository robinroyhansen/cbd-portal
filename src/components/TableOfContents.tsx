'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  label: string;
}

const TOC_ITEMS: TOCItem[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'about', label: 'About' },
  { id: 'score-breakdown', label: 'Score Breakdown' },
  { id: 'pros-cons', label: 'Pros & Cons' },
  { id: 'full-review', label: 'Full Review' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'faqs', label: 'FAQs' },
];

export function TableOfContents() {
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show TOC after scrolling past hero (300px)
      setIsVisible(window.scrollY > 300);

      // Find the current section
      const sections = TOC_ITEMS.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
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

  return (
    <nav
      className={`hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
      }`}
      aria-label="Table of contents"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-4 max-w-[180px]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          On this page
        </h3>
        <ul className="space-y-1">
          {TOC_ITEMS.map(item => (
            <li key={item.id}>
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
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
