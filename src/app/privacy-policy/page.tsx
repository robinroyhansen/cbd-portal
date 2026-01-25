'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export default function PrivacyPolicyPage() {
  const { t } = useLocale();
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('privacyPolicy.title')}</h1>
      <p className="text-gray-500 mb-8">{t('privacyPolicy.lastUpdated')}: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>{t('privacyPolicy.introTitle')}</h2>
        <p>{t('privacyPolicy.introText1')}</p>
        <p>{t('privacyPolicy.introText2')}</p>

        <h2>{t('privacyPolicy.collectTitle')}</h2>

        <h3>{t('privacyPolicy.collectProvideTitle')}</h3>
        <p>{t('privacyPolicy.collectProvideText')}</p>
        <ul>
          <li>{t('privacyPolicy.collectProvideItem1')}</li>
          <li>{t('privacyPolicy.collectProvideItem2')}</li>
          <li>{t('privacyPolicy.collectProvideItem3')}</li>
        </ul>
        <p>{t('privacyPolicy.collectProvideInclude')}</p>
        <ul>
          <li>{t('privacyPolicy.collectProvideName')}</li>
          <li>{t('privacyPolicy.collectProvideEmail')}</li>
          <li>{t('privacyPolicy.collectProvideOther')}</li>
        </ul>

        <h3>{t('privacyPolicy.collectAutoTitle')}</h3>
        <p>{t('privacyPolicy.collectAutoText')}</p>
        <ul>
          <li>{t('privacyPolicy.collectAutoBrowser')}</li>
          <li>{t('privacyPolicy.collectAutoOS')}</li>
          <li>{t('privacyPolicy.collectAutoIP')}</li>
          <li>{t('privacyPolicy.collectAutoPages')}</li>
          <li>{t('privacyPolicy.collectAutoReferrer')}</li>
          <li>{t('privacyPolicy.collectAutoDevice')}</li>
        </ul>

        <h2>{t('privacyPolicy.useTitle')}</h2>
        <p>{t('privacyPolicy.useText')}</p>
        <ul>
          <li>{t('privacyPolicy.useItem1')}</li>
          <li>{t('privacyPolicy.useItem2')}</li>
          <li>{t('privacyPolicy.useItem3')}</li>
          <li>{t('privacyPolicy.useItem4')}</li>
          <li>{t('privacyPolicy.useItem5')}</li>
          <li>{t('privacyPolicy.useItem6')}</li>
        </ul>

        <h2>{t('privacyPolicy.cookiesTitle')}</h2>
        <p>
          {t('privacyPolicy.cookiesText')}{' '}
          <Link href="/cookie-policy">{t('privacyPolicy.cookiePolicy')}</Link>.
        </p>

        <h2>{t('privacyPolicy.thirdPartyTitle')}</h2>
        <p>{t('privacyPolicy.thirdPartyText')}</p>
        <ul>
          <li><strong>{t('privacyPolicy.thirdPartyAnalytics')}</strong> {t('privacyPolicy.thirdPartyAnalyticsText')}</li>
          <li><strong>{t('privacyPolicy.thirdPartyHosting')}</strong> {t('privacyPolicy.thirdPartyHostingText')}</li>
          <li><strong>{t('privacyPolicy.thirdPartyDatabase')}</strong> {t('privacyPolicy.thirdPartyDatabaseText')}</li>
        </ul>
        <p>{t('privacyPolicy.thirdPartyNote')}</p>

        <h2>{t('privacyPolicy.retentionTitle')}</h2>
        <p>{t('privacyPolicy.retentionText')}</p>

        <h2>{t('privacyPolicy.securityTitle')}</h2>
        <p>{t('privacyPolicy.securityText')}</p>

        <h2>{t('privacyPolicy.rightsTitle')}</h2>
        <p>{t('privacyPolicy.rightsText')}</p>
        <ul>
          <li>{t('privacyPolicy.rightsAccess')}</li>
          <li>{t('privacyPolicy.rightsCorrection')}</li>
          <li>{t('privacyPolicy.rightsDeletion')}</li>
          <li>{t('privacyPolicy.rightsWithdraw')}</li>
          <li>{t('privacyPolicy.rightsObject')}</li>
          <li>{t('privacyPolicy.rightsPortability')}</li>
        </ul>
        <p>{t('privacyPolicy.rightsExercise')}</p>

        <h2>{t('privacyPolicy.childrenTitle')}</h2>
        <p>{t('privacyPolicy.childrenText')}</p>

        <h2>{t('privacyPolicy.transferTitle')}</h2>
        <p>{t('privacyPolicy.transferText')}</p>

        <h2>{t('privacyPolicy.changesTitle')}</h2>
        <p>{t('privacyPolicy.changesText')}</p>

        <h2>{t('privacyPolicy.contactTitle')}</h2>
        <p>{t('privacyPolicy.contactText')}</p>
        <p>{t('privacyPolicy.contactEmail')}</p>
      </div>
    </div>
  );
}
