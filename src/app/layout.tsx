import type { Metadata } from 'next';
import { Inter, Merriweather, DM_Serif_Display, Source_Sans_3, Space_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { NavigationProvider } from '@/components/NavigationWrapper';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LocaleProvider } from '@/components/LocaleProvider';
import { DevLanguageSwitcher } from '@/components/DevLanguageSwitcher';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
});

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get language from middleware-set headers
  const lang = await getLanguage();
  const locale = getLocaleSync(lang as LanguageCode);

  return (
    <html lang={lang.split('-')[0]} className={`${inter.variable} ${merriweather.variable} ${dmSerifDisplay.variable} ${sourceSans.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
        {/* Skip to content link for keyboard accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <LocaleProvider locale={locale} lang={lang as LanguageCode}>
          <NavigationProvider>
            <Navigation currentLang={lang} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer currentLang={lang} />
            <MobileBottomNav />
            <CookieConsent />
            <DevLanguageSwitcher />
          </NavigationProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
