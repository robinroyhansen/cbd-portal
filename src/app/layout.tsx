import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import Search from './components/Search';
import { Logo } from '@/components/Logo';
import { LanguageSelectorWrapper } from '@/components/LanguageSelectorWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cbdknowledgebase.com'),
  title: {
    default: 'CBD Knowledge Base | Evidence-Based CBD Information',
    template: '%s | CBD Knowledge Base',
  },
  description:
    'Your trusted source for evidence-based information about CBD. Explore research-backed articles on CBD benefits, usage, and the latest scientific studies.',
  keywords: [
    'CBD',
    'cannabidiol',
    'CBD oil',
    'CBD research',
    'CBD benefits',
    'CBD studies',
    'hemp extract',
    'wellness',
  ],
  authors: [{ name: 'CBD Knowledge Base' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'CBD Knowledge Base',
    title: 'CBD Knowledge Base | Evidence-Based CBD Information',
    description:
      'Your trusted source for evidence-based information about CBD. Explore research-backed articles.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBD Knowledge Base',
    description: 'Evidence-based CBD information and research.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="min-h-screen bg-white font-sans text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <Logo />
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/articles"
                className="text-gray-600 hover:text-primary-600"
              >
                Articles
              </a>
              <a
                href="/categories"
                className="text-gray-600 hover:text-primary-600"
              >
                Topics
              </a>
              <a
                href="/about"
                className="text-gray-600 hover:text-primary-600"
              >
                About
              </a>
              <Search />
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-4 text-lg font-semibold">
                  CBD Knowledge Base
                </h3>
                <p className="text-sm text-gray-600">
                  Evidence-based information about CBD, backed by scientific
                  research and peer-reviewed studies.
                </p>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="/articles" className="hover:text-primary-600">
                      All Articles
                    </a>
                  </li>
                  <li>
                    <a href="/categories" className="hover:text-primary-600">
                      Browse Topics
                    </a>
                  </li>
                  <li>
                    <a href="/about" className="hover:text-primary-600">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/admin" className="hover:text-primary-600">
                      Admin
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 font-semibold">Disclaimer</h4>
                <p className="text-xs text-gray-500">
                  The information provided is for educational purposes only and
                  is not intended as medical advice. Always consult with a
                  healthcare professional before using CBD products.
                </p>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <LanguageSelectorWrapper />
              <div className="mt-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} CBD Knowledge Base. All rights
                reserved.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
