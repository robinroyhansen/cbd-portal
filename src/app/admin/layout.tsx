'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthProvider, useAdminAuth } from '../../lib/admin-auth';
import { AdminProtected } from '../../components/AdminProtected';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
  subItems?: NavItem[];
}

interface QueueCounts {
  pending: number;
  rejected: number;
}

function useQueueCounts() {
  const [counts, setCounts] = useState<QueueCounts>({ pending: 0, rejected: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/queue-count');
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch queue counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return counts;
}

function getNavItems(queueCounts: QueueCounts): NavItem[] {
  return [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    {
      name: 'Articles',
      href: '/admin/articles',
      icon: '📝',
      subItems: [
        { name: 'All Articles', href: '/admin/articles', icon: '📋' },
        { name: 'Create Article', href: '/admin/articles/new', icon: '➕' },
        { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
        { name: 'Comments', href: '/admin/articles/comments', icon: '💬' },
        { name: 'Authors', href: '/admin/authors', icon: '👤' },
      ]
    },
    {
      name: 'Research',
      href: '/admin/research',
      icon: '🔬',
      subItems: [
        { name: 'Scanner', href: '/admin/research', icon: '🔍' },
        { name: 'Queue', href: '/admin/research/queue', icon: '📋', badge: queueCounts.pending },
        { name: 'Rejected', href: '/admin/research/rejected', icon: '🚫', badge: queueCounts.rejected },
        { name: 'Citations', href: '/admin/citations', icon: '📚' },
        { name: 'Studies', href: '/admin/research/studies', icon: '📄' },
      ]
    },
    {
      name: 'Reviews',
      href: '/admin/brands',
      icon: '⭐',
      subItems: [
        { name: 'Brands', href: '/admin/brands', icon: '🏢' },
        { name: 'All Reviews', href: '/admin/reviews', icon: '📝' },
      ]
    },
    { name: 'Glossary', href: '/admin/glossary', icon: '📖' },
    { name: 'Media Library', href: '/admin/media', icon: '🖼️' },
    { name: 'Languages', href: '/admin/languages', icon: '🌍' },
  ];
}

function AdminLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Articles', 'Research', 'Reviews']);
  const queueCounts = useQueueCounts();

  const navItems = getNavItems(queueCounts);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">CBD Admin</h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item: any) => {
              const isActive = pathname === item.href;
              const isExpanded = expandedItems.includes(item.name);
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <li key={item.href || item.name}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <ul className="ml-4 mt-2 space-y-1">
                          {item.subItems.map((subItem: any) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                                    isSubActive
                                      ? 'bg-primary-500 text-white'
                                      : 'hover:bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm">{subItem.icon}</span>
                                    <span className="text-sm">{subItem.name}</span>
                                  </div>
                                  {subItem.badge !== undefined && subItem.badge > 0 && (
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center ${
                                      subItem.badge > 10
                                        ? 'bg-red-500 text-white'
                                        : 'bg-amber-500 text-white'
                                    }`}>
                                      {subItem.badge > 99 ? '99+' : subItem.badge}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full min-w-[20px] text-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">🔙</span>
              <span>Back to site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminProtected>
        <AdminLayoutInner>
          {children}
        </AdminLayoutInner>
      </AdminProtected>
    </AdminAuthProvider>
  );
}