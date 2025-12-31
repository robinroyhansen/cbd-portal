import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
      <body className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
