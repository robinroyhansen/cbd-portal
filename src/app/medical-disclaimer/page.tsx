'use client';

import { useLocale } from '@/hooks/useLocale';

export default function MedicalDisclaimerPage() {
  const { t } = useLocale();
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('medicalDisclaimer.title')}</h1>
      <p className="text-gray-500 mb-8">{t('medicalDisclaimer.lastUpdated')}: {lastUpdated}</p>

      {/* Important notice box */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
        <h2 className="text-xl font-bold text-red-800 mb-2">{t('medicalDisclaimer.importantNotice')}</h2>
        <p className="text-red-700">{t('medicalDisclaimer.importantNoticeText')}</p>
      </div>

      <div className="prose prose-green max-w-none">
        <h2>{t('medicalDisclaimer.notMedicalTitle')}</h2>
        <p>{t('medicalDisclaimer.notMedicalText')}</p>

        <h2>{t('medicalDisclaimer.consultTitle')}</h2>
        <p><strong>{t('medicalDisclaimer.consultText')}</strong></p>
        <ul>
          <li>{t('medicalDisclaimer.consultItem1')}</li>
          <li>{t('medicalDisclaimer.consultItem2')}</li>
          <li>{t('medicalDisclaimer.consultItem3')}</li>
          <li>{t('medicalDisclaimer.consultItem4')}</li>
          <li>{t('medicalDisclaimer.consultItem5')}</li>
        </ul>

        <h2>{t('medicalDisclaimer.neverDisregardTitle')}</h2>
        <p>{t('medicalDisclaimer.neverDisregardText')}</p>

        <h2>{t('medicalDisclaimer.noRelationshipTitle')}</h2>
        <p>{t('medicalDisclaimer.noRelationshipText')}</p>

        <h2>{t('medicalDisclaimer.regulatoryTitle')}</h2>
        <p>{t('medicalDisclaimer.regulatoryText')}</p>

        <h2>{t('medicalDisclaimer.researchTitle')}</h2>
        <p>{t('medicalDisclaimer.researchText')}</p>
        <ul>
          <li>{t('medicalDisclaimer.researchItem1')}</li>
          <li>{t('medicalDisclaimer.researchItem2')}</li>
          <li>{t('medicalDisclaimer.researchItem3')}</li>
          <li>{t('medicalDisclaimer.researchItem4')}</li>
          <li>{t('medicalDisclaimer.researchItem5')}</li>
        </ul>

        <h2>{t('medicalDisclaimer.sideEffectsTitle')}</h2>
        <p>{t('medicalDisclaimer.sideEffectsText')}</p>
        <ul>
          <li>{t('medicalDisclaimer.sideEffectsItem1')}</li>
          <li>{t('medicalDisclaimer.sideEffectsItem2')}</li>
          <li>{t('medicalDisclaimer.sideEffectsItem3')}</li>
          <li>{t('medicalDisclaimer.sideEffectsItem4')}</li>
          <li>{t('medicalDisclaimer.sideEffectsItem5')}</li>
        </ul>
        <p>{t('medicalDisclaimer.sideEffectsNote')}</p>

        <h2>{t('medicalDisclaimer.interactionsTitle')}</h2>
        <p>{t('medicalDisclaimer.interactionsText')}</p>
        <ul>
          <li>{t('medicalDisclaimer.interactionsItem1')}</li>
          <li>{t('medicalDisclaimer.interactionsItem2')}</li>
          <li>{t('medicalDisclaimer.interactionsItem3')}</li>
          <li>{t('medicalDisclaimer.interactionsItem4')}</li>
          <li>{t('medicalDisclaimer.interactionsItem5')}</li>
        </ul>
        <p><strong>{t('medicalDisclaimer.interactionsWarning')}</strong></p>

        <h2>{t('medicalDisclaimer.legalTitle')}</h2>
        <p>{t('medicalDisclaimer.legalText')}</p>

        <h2>{t('medicalDisclaimer.opinionsTitle')}</h2>
        <p>{t('medicalDisclaimer.opinionsText')}</p>

        <h2>{t('medicalDisclaimer.noGuaranteesTitle')}</h2>
        <p>{t('medicalDisclaimer.noGuaranteesText')}</p>
        <ul>
          <li>{t('medicalDisclaimer.noGuaranteesItem1')}</li>
          <li>{t('medicalDisclaimer.noGuaranteesItem2')}</li>
          <li>{t('medicalDisclaimer.noGuaranteesItem3')}</li>
          <li>{t('medicalDisclaimer.noGuaranteesItem4')}</li>
          <li>{t('medicalDisclaimer.noGuaranteesItem5')}</li>
        </ul>

        <h2>{t('medicalDisclaimer.acknowledgmentTitle')}</h2>
        <p>{t('medicalDisclaimer.acknowledgmentText')}</p>

        <h2>{t('medicalDisclaimer.contactTitle')}</h2>
        <p>{t('medicalDisclaimer.contactText')}</p>
        <p>{t('medicalDisclaimer.contactEmail')}</p>
      </div>
    </div>
  );
}
