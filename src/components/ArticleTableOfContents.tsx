'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TOCItem } from '@/lib/utils/toc';

interface ArticleTableOfContentsProps {
  items: TOCItem[];
  variant?: 'mobile' | 'desktop' | 'both';
  className?: string;
}

// Estimate reading time (average 200 words per minute)
function estimateReadTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 200);
  return minutes <= 1 ? '1 min' : `${minutes} min`;
}

export function ArticleTableOfContents({ items, variant = 'both', className = '' }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [passedSections, setPassedSections] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Flatten items for easier processing
  const allHeadings = items.flatMap(item => [
    item,
    ...(item.children || [])
  ]);

  // Use Intersection Observer for better performance
  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const headingElements: { id: string; element: Element }[] = [];

    allHeadings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        headingElements.push({ id: heading.id, element });
      }
    });

    if (headingElements.length === 0) return;

    // Track which sections are visible
    const visibleSections = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleSections.add(id);
          } else {
            visibleSections.delete(id);
          }
        });

        // Find the topmost visible section
        let topSection = '';
        let topPosition = Infinity;

        visibleSections.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top < topPosition && rect.top > -100) {
              topPosition = rect.top;
              topSection = id;
            }
          }
        });

        // If no section is visible in viewport, find the last one we scrolled past
        if (!topSection) {
          for (const heading of allHeadings) {
            const element = document.getElementById(heading.id);
            if (element) {
              const rect = element.getBoundingClientRect();
              if (rect.top < 150) {
                topSection = heading.id;
              }
            }
          }
        }

        if (topSection) {
          setActiveId(topSection);

          // Update URL hash without adding to history
          if (typeof window !== 'undefined' && topSection !== window.location.hash.slice(1)) {
            window.history.replaceState(null, '', `#${topSection}`);
          }

          // Track passed sections
          const currentIndex = allHeadings.findIndex(h => h.id === topSection);
          if (currentIndex > 0) {
            const passed = new Set(allHeadings.slice(0, currentIndex).map(h => h.id));
            setPassedSections(passed);
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: [0, 0.5, 1]
      }
    );

    headingElements.forEach(({ element }) => {
      observerRef.current?.observe(element);
    });

    // Set initial active section from URL hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      if (allHeadings.some(h => h.id === hash)) {
        setActiveId(hash);
      }
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  // Smooth scroll to section
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setIsExpanded(false);

      // Update URL hash
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  }, []);

  // Copy link to section
  const copyLinkToSection = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  if (items.length === 0) return null;

  const showMobile = variant === 'mobile' || variant === 'both';
  const showDesktop = variant === 'desktop' || variant === 'both';

  // Calculate progress percentage
  const totalSections = allHeadings.length;
  const completedSections = passedSections.size + (activeId ? 1 : 0);
  const progressPercent = Math.round((completedSections / totalSections) * 100);

  return (
    <>
      {/* Mobile TOC - Collapsible at top */}
      {showMobile && (
      <div className={`lg:hidden mb-6 ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-left"
          aria-expanded={isExpanded}
          aria-controls="mobile-toc"
        >
          <span className="flex items-center gap-2 font-medium text-gray-900">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Table of Contents
            <span className="text-xs text-gray-500 font-normal">({progressPercent}% read)</span>
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
          <nav id="mobile-toc" className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm" aria-label="Table of contents">
            <ul className="space-y-1" role="list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                      activeId === item.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : passedSections.has(item.id)
                        ? 'text-gray-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {passedSections.has(item.id) && (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="flex-1">{item.text}</span>
                  </button>
                  {item.children && item.children.length > 0 && (
                    <ul className="ml-4 mt-1 space-y-1" role="list">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => scrollToSection(child.id)}
                            className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                              activeId === child.id
                                ? 'bg-green-100 text-green-800 font-medium'
                                : passedSections.has(child.id)
                                ? 'text-gray-400'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {passedSections.has(child.id) && (
                              <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span className="flex-1">{child.text}</span>
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
          <h2 className="flex items-center justify-between text-sm font-semibold text-gray-900 mb-4">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              On This Page
            </span>
            <span className="text-xs font-normal text-gray-500">{progressPercent}%</span>
          </h2>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <ul className="space-y-0.5 max-h-[55vh] overflow-y-auto pr-2" role="list">
            {items.map((item) => (
              <li key={item.id} className="group">
                <div className="flex items-center">
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`flex-1 text-left px-3 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
                      activeId === item.id
                        ? 'bg-green-100 text-green-800 font-medium'
                        : passedSections.has(item.id)
                        ? 'text-gray-400 hover:text-gray-600 hover:bg-white'
                        : 'text-gray-700 hover:bg-white hover:text-gray-900'
                    }`}
                  >
                    {passedSections.has(item.id) ? (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : activeId === item.id ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    ) : (
                      <span className="w-4 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{item.text}</span>
                  </button>
                  <button
                    onClick={(e) => copyLinkToSection(item.id, e)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                    title="Copy link to section"
                    aria-label={`Copy link to ${item.text}`}
                  >
                    {copiedId === item.id ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Nested H3 items */}
                {item.children && item.children.length > 0 && (
                  <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-200" role="list">
                    {item.children.map((child) => (
                      <li key={child.id} className="group/child">
                        <div className="flex items-center">
                          <button
                            onClick={() => scrollToSection(child.id)}
                            className={`flex-1 text-left pl-4 pr-2 py-1.5 text-sm rounded-r-lg transition-all flex items-center gap-2 ${
                              activeId === child.id
                                ? 'bg-green-50 text-green-700 font-medium border-l-2 border-green-500 -ml-px'
                                : passedSections.has(child.id)
                                ? 'text-gray-400 hover:text-gray-600 hover:bg-white'
                                : 'text-gray-600 hover:bg-white hover:text-gray-800'
                            }`}
                          >
                            {passedSections.has(child.id) ? (
                              <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : activeId === child.id ? (
                              <span className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                            ) : (
                              <span className="w-3 flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate">{child.text}</span>
                          </button>
                          <button
                            onClick={(e) => copyLinkToSection(child.id, e)}
                            className="p-1 rounded opacity-0 group-hover/child:opacity-100 hover:bg-gray-200 transition-opacity"
                            title="Copy link to section"
                            aria-label={`Copy link to ${child.text}`}
                          >
                            {copiedId === child.id ? (
                              <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Footer with section count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {items.length} sections
              </span>
              <span>{completedSections} of {totalSections} read</span>
            </div>
          </div>
        </div>
      </nav>
      )}
    </>
  );
}
