'use client';
import { useState } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';
import { FooterLanguageSelector } from './FooterLanguageSelector';

interface FooterStats {
  studies: number;
  conditions: number;
  glossaryTerms: number;
  articles: number;
}

interface FooterProps {
  stats?: FooterStats;
  currentLang?: string;
}

export function Footer({ stats, currentLang = 'en' }: FooterProps) {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Default stats - can be overridden by props from server component
  const displayStats: FooterStats = stats || {
    studies: 4000,
    conditions: 311,
    glossaryTerms: 263,
    articles: 1000,
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    setSubscribeMessage(null);

    try {
      // TODO: Implement actual newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSubscribeMessage({ type: 'success', text: 'Thanks for subscribing!' });
      setEmail('');
    } catch {
      setSubscribeMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubscribing(false);
    }
  };

  const formatNumber = (num: number): string => {
    return `${num.toLocaleString()}+`;
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Stats Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(displayStats.studies)}</p>
              <p className="text-xs text-gray-400">{t('stats.researchStudies')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{displayStats.conditions}</p>
              <p className="text-xs text-gray-400">{t('stats.healthConditions')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(displayStats.glossaryTerms)}</p>
              <p className="text-xs text-gray-400">{t('stats.glossaryTerms')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatNumber(displayStats.articles)}</p>
              <p className="text-xs text-gray-400">{t('stats.articlesPublished')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-white">CBD Portal</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {t('footer.brandDescription')}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              {t('footer.brandTagline')}
            </p>

            {/* Newsletter Signup */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2 text-sm">{t('newsletter.title')}</h3>
              <p className="text-xs text-gray-400 mb-3">
                {t('newsletter.description')}
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubscribing ? t('common.subscribing') : t('newsletter.button')}
                </button>
              </form>
              {subscribeMessage && (
                <p className={`mt-2 text-xs ${subscribeMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {subscribeMessage.text}
                </p>
              )}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.explore')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/conditions" className="hover:text-white transition-colors">{t('footer.healthConditions')}</Link></li>
              <li><Link href="/research" className="hover:text-white transition-colors">{t('footer.researchDatabase')}</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">{t('footer.glossary')}</Link></li>
              <li><Link href="/articles" className="hover:text-white transition-colors">{t('footer.allArticles')}</Link></li>
              <li><Link href="/authors" className="hover:text-white transition-colors">{t('footer.ourAuthors')}</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.tools')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/dosage-calculator" className="hover:text-white transition-colors">{t('footer.dosageCalculator')}</Link></li>
              <li><Link href="/tools/interactions" className="hover:text-white transition-colors">{t('footer.drugInteractions')}</Link></li>
              <li><Link href="/tools/cost-calculator" className="hover:text-white transition-colors">{t('footer.costCalculator')}</Link></li>
              <li><Link href="/tools/strength-calculator" className="hover:text-white transition-colors">{t('footer.strengthCalculator')}</Link></li>
              <li><Link href="/tools/animal-dosage-calculator" className="hover:text-white transition-colors">{t('footer.petDosage')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/medical-disclaimer" className="hover:text-white transition-colors">{t('footer.medicalDisclaimer')}</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-white transition-colors">{t('footer.editorialPolicy')}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">{t('footer.termsOfService')}</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Language Selector */}
        <FooterLanguageSelector currentLang={currentLang} />

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} {t('footer.copyright')}
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-xs text-gray-500 max-w-xl text-center md:text-right">
                {t('footer.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
