'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export default function TermsOfServicePage() {
  const { t } = useLocale();
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('termsOfService.title')}</h1>
      <p className="text-gray-500 mb-8">{t('termsOfService.lastUpdated')}: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>{t('termsOfService.agreementTitle')}</h2>
        <p>{t('termsOfService.agreementText')}</p>

        <h2>{t('termsOfService.descriptionTitle')}</h2>
        <p>{t('termsOfService.descriptionText')}</p>

        <h2>{t('termsOfService.medicalTitle')}</h2>
        <p>
          <strong>{t('termsOfService.medicalImportant')}</strong> {t('termsOfService.medicalText')}
        </p>
        <p>
          {t('termsOfService.medicalLink')}{' '}
          <Link href="/medical-disclaimer">{t('termsOfService.medicalDisclaimerPage')}</Link>.
        </p>

        <h2>{t('termsOfService.ipTitle')}</h2>
        <p>{t('termsOfService.ipText1')}</p>
        <p>{t('termsOfService.ipText2')}</p>
        <ul>
          <li>{t('termsOfService.ipItem1')}</li>
          <li>{t('termsOfService.ipItem2')}</li>
          <li>{t('termsOfService.ipItem3')}</li>
          <li>{t('termsOfService.ipItem4')}</li>
        </ul>

        <h2>{t('termsOfService.contributionsTitle')}</h2>
        <p>{t('termsOfService.contributionsText1')}</p>
        <p>{t('termsOfService.contributionsText2')}</p>
        <ul>
          <li>{t('termsOfService.contributionsItem1')}</li>
          <li>{t('termsOfService.contributionsItem2')}</li>
          <li>{t('termsOfService.contributionsItem3')}</li>
          <li>{t('termsOfService.contributionsItem4')}</li>
          <li>{t('termsOfService.contributionsItem5')}</li>
          <li>{t('termsOfService.contributionsItem6')}</li>
        </ul>

        <h2>{t('termsOfService.accuracyTitle')}</h2>
        <p>{t('termsOfService.accuracyText')}</p>

        <h2>{t('termsOfService.linksTitle')}</h2>
        <p>{t('termsOfService.linksText')}</p>

        <h2>{t('termsOfService.citationsTitle')}</h2>
        <p>{t('termsOfService.citationsText')}</p>

        <h2>{t('termsOfService.liabilityTitle')}</h2>
        <p>{t('termsOfService.liabilityText')}</p>
        <ul>
          <li>{t('termsOfService.liabilityItem1')}</li>
          <li>{t('termsOfService.liabilityItem2')}</li>
          <li>{t('termsOfService.liabilityItem3')}</li>
          <li>{t('termsOfService.liabilityItem4')}</li>
          <li>{t('termsOfService.liabilityItem5')}</li>
        </ul>

        <h2>{t('termsOfService.indemnityTitle')}</h2>
        <p>{t('termsOfService.indemnityText')}</p>

        <h2>{t('termsOfService.governingTitle')}</h2>
        <p>{t('termsOfService.governingText')}</p>

        <h2>{t('termsOfService.changesToTermsTitle')}</h2>
        <p>{t('termsOfService.changesToTermsText')}</p>

        <h2>{t('termsOfService.severabilityTitle')}</h2>
        <p>{t('termsOfService.severabilityText')}</p>

        <h2>{t('termsOfService.contactTitle')}</h2>
        <p>{t('termsOfService.contactText')}</p>
        <p>{t('termsOfService.contactEmail')}</p>
      </div>
    </div>
  );
}
