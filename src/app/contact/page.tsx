import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { detectLanguage } from '@/lib/language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us | CBD Portal',
    description: 'Get in touch with the CBD Portal team.',
    alternates: getHreflangAlternates('/contact'),
  };
}

export default async function ContactPage() {
  const headersList = await headers();
  const lang = detectLanguage(headersList) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('contact.title')}</h1>
      <p className="text-xl text-gray-600 mb-12">{t('contact.subtitle')}</p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact options */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('contact.getInTouch')}</h2>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">📧 {t('contact.generalInquiries')}</h3>
              <p className="text-gray-600 text-sm mb-2">{t('contact.generalInquiriesDesc')}</p>
              <a href="mailto:info@cbdportal.com" className="text-green-600 hover:underline">
                info@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">✏️ {t('contact.editorialCorrections')}</h3>
              <p className="text-gray-600 text-sm mb-2">{t('contact.editorialCorrectionsDesc')}</p>
              <a href="mailto:editorial@cbdportal.com" className="text-green-600 hover:underline">
                editorial@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">🤝 {t('contact.partnerships')}</h3>
              <p className="text-gray-600 text-sm mb-2">{t('contact.partnershipsDesc')}</p>
              <a href="mailto:partnerships@cbdportal.com" className="text-green-600 hover:underline">
                partnerships@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">🔒 {t('contact.privacy')}</h3>
              <p className="text-gray-600 text-sm mb-2">{t('contact.privacyDesc')}</p>
              <a href="mailto:privacy@cbdportal.com" className="text-green-600 hover:underline">
                privacy@cbdportal.com
              </a>
            </div>
          </div>
        </div>

        {/* Response times and notes */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('contact.whatToExpect')}</h2>

          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">⏱️ {t('contact.responseTimes')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• {t('contact.generalResponse')}</li>
              <li>• {t('contact.editorialResponse')}</li>
              <li>• {t('contact.partnershipResponse')}</li>
              <li>• {t('contact.privacyResponse')}</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">📝 {t('contact.beforeYouWrite')}</h3>
            <p className="text-sm text-gray-600 mb-3">{t('contact.beforeYouWriteDesc')}</p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• {t('contact.includeUrl')}</li>
              <li>• {t('contact.includeDescription')}</li>
              <li>• {t('contact.includeSupporting')}</li>
            </ul>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="font-semibold mb-3">🚫 {t('contact.pleaseNote')}</h3>
            <p className="text-sm text-gray-600">{t('contact.pleaseNoteDesc')}</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">{t('contact.faqTitle')}</h2>
        <div className="space-y-4">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">{t('contact.faqWriteForUs')}</summary>
            <p className="mt-3 text-gray-600 text-sm">{t('contact.faqWriteForUsAnswer')}</p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">{t('contact.faqReportError')}</summary>
            <p className="mt-3 text-gray-600 text-sm">{t('contact.faqReportErrorAnswer')}</p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">{t('contact.faqSponsored')}</summary>
            <p className="mt-3 text-gray-600 text-sm">{t('contact.faqSponsoredAnswer')}</p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">{t('contact.faqRecommend')}</summary>
            <p className="mt-3 text-gray-600 text-sm">{t('contact.faqRecommendAnswer')}</p>
          </details>
        </div>
      </div>
    </div>
  );
}