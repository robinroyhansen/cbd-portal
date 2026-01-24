import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { NavigationProvider } from '@/components/NavigationWrapper';
import { MobileBottomNav } from '@/components/MobileBottomNav';

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
  metadataBase: new URL('https://cbd-portal.vercel.app'),
  title: 'CBD Portal | Evidence-Based CBD Information & Research',
  description: 'Comprehensive CBD information backed by 4,000+ peer-reviewed studies. Learn how CBD may help with anxiety, pain, sleep and more. Written by industry experts.',
  keywords: 'CBD, cannabidiol, CBD oil, CBD research, CBD for anxiety, CBD for pain, CBD for sleep, cannabis research',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CBD Portal | Evidence-Based CBD Information',
    description: 'Comprehensive CBD guides backed by peer-reviewed research',
    url: 'https://cbd-portal.vercel.app',
    siteName: 'CBD Portal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CBD Portal | Evidence-Based CBD Information',
    description: 'Comprehensive CBD guides backed by peer-reviewed research',
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
        <NavigationProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CookieConsent />
        </NavigationProvider>
      </body>
    </html>
  );
}
