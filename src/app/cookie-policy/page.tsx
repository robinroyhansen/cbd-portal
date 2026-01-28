'use client';

import { useLocale } from '@/hooks/useLocale';
import { formatDateLong } from '@/lib/utils/format-date';

export default function CookiePolicyPage() {
  const { t, lang } = useLocale();
  const lastUpdated = formatDateLong(new Date('2025-01-01'), lang);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('cookiePolicy.title')}</h1>
      <p className="text-gray-500 mb-8">{t('cookiePolicy.lastUpdated')}: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>{t('cookiePolicy.whatAreCookiesTitle')}</h2>
        <p>{t('cookiePolicy.whatAreCookiesText')}</p>

        <h2>{t('cookiePolicy.howWeUseCookiesTitle')}</h2>
        <p>{t('cookiePolicy.howWeUseCookiesText')}</p>

        <h3>{t('cookiePolicy.essentialCookiesTitle')}</h3>
        <p>{t('cookiePolicy.essentialCookiesText')}</p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderCookie')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderPurpose')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderDuration')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieSession')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieSessionPurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieSessionDuration')}</td>
            </tr>
          </tbody>
        </table>

        <h3>{t('cookiePolicy.analyticsCookiesTitle')}</h3>
        <p>{t('cookiePolicy.analyticsCookiesText')}</p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderCookie')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderPurpose')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderDuration')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGa')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGaPurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGaDuration')}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGid')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGidPurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGidDuration')}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGat')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGatPurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieGatDuration')}</td>
            </tr>
          </tbody>
        </table>

        <h3>{t('cookiePolicy.preferenceCookiesTitle')}</h3>
        <p>{t('cookiePolicy.preferenceCookiesText')}</p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderCookie')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderPurpose')}</th>
              <th className="border border-gray-300 px-4 py-2 text-left">{t('cookiePolicy.tableHeaderDuration')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieLanguage')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieLanguagePurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieLanguageDuration')}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieConsent')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieConsentPurpose')}</td>
              <td className="border border-gray-300 px-4 py-2">{t('cookiePolicy.cookieConsentDuration')}</td>
            </tr>
          </tbody>
        </table>

        <h2>{t('cookiePolicy.thirdPartyCookiesTitle')}</h2>
        <p>{t('cookiePolicy.thirdPartyCookiesText')}</p>
        <ul>
          <li><strong>{t('cookiePolicy.thirdPartyGoogleAnalytics')}</strong> {t('cookiePolicy.thirdPartyGoogleAnalyticsText')}</li>
          <li><strong>{t('cookiePolicy.thirdPartyVercel')}</strong> {t('cookiePolicy.thirdPartyVercelText')}</li>
        </ul>

        <h2>{t('cookiePolicy.managingCookiesTitle')}</h2>
        <p>{t('cookiePolicy.managingCookiesText')}</p>
        <ul>
          <li>{t('cookiePolicy.managingCookiesOption1')}</li>
          <li>{t('cookiePolicy.managingCookiesOption2')}</li>
          <li>{t('cookiePolicy.managingCookiesOption3')}</li>
          <li>{t('cookiePolicy.managingCookiesOption4')}</li>
          <li>{t('cookiePolicy.managingCookiesOption5')}</li>
          <li>{t('cookiePolicy.managingCookiesOption6')}</li>
        </ul>

        <h3>{t('cookiePolicy.browserInstructionsTitle')}</h3>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">{t('cookiePolicy.browserChrome')}</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">{t('cookiePolicy.browserFirefox')}</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">{t('cookiePolicy.browserSafari')}</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">{t('cookiePolicy.browserEdge')}</a></li>
        </ul>

        <h2>{t('cookiePolicy.impactTitle')}</h2>
        <p>{t('cookiePolicy.impactText')}</p>

        <h2>{t('cookiePolicy.doNotTrackTitle')}</h2>
        <p>{t('cookiePolicy.doNotTrackText')}</p>

        <h2>{t('cookiePolicy.updatesTitle')}</h2>
        <p>{t('cookiePolicy.updatesText')}</p>

        <h2>{t('cookiePolicy.contactTitle')}</h2>
        <p>{t('cookiePolicy.contactText')}</p>
        <p>{t('cookiePolicy.contactEmail')}</p>
      </div>
    </div>
  );
}
