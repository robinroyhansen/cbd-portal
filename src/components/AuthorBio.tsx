'use client';

import React from 'react';
import { useLocale } from '@/hooks/useLocale';
import { formatDateLong } from '@/lib/utils/format-date';

interface AuthorBioProps {
  className?: string;
}

export function AuthorBio({ className = '' }: AuthorBioProps) {
  const { t } = useLocale();

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mt-12 border border-blue-100 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('authorBio.aboutAuthor')}</h3>
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">RK</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-lg text-gray-900">Robin Roy Krigslund-Hansen</p>
            <span className="text-blue-500" title="Verified CBD Expert">✓</span>
          </div>
          <p className="text-sm text-blue-700 mb-3 font-medium">{t('authorBio.authorTitle')}</p>

          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            {t('authorBio.authorBio')}
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-blue-500">🗓️</span>
              <span>{t('authorBio.since')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-blue-500">🧪</span>
              <span>{t('authorBio.products')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-blue-500">✅</span>
              <span>{t('authorBio.gmpCertified')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="text-blue-500">🌍</span>
              <span>{t('authorBio.countries')}</span>
            </div>
          </div>

          {/* Key credentials */}
          <div className="flex flex-wrap gap-1 mb-4">
            {[
              'EIHA Member',
              'Novel Food Consortium',
              'University Research Partner',
              'Zero Failed Lab Tests'
            ].map((credential, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                {credential}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span>🇨🇭 Zug, Switzerland</span>
            <span>•</span>
            <span>{t('authorBio.experience')}</span>
            <span>•</span>
            <span>100% renewable energy operations</span>
          </div>

          <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-3">
            <strong>{t('authorBio.disclaimer')}</strong> {t('authorBio.disclaimerText')}
          </p>
        </div>
      </div>
    </div>
  );
}

// Also export a simplified byline component for the article header
export function AuthorByline({ date, className = '' }: { date?: string; className?: string }) {
  const { t, lang } = useLocale();

  return (
    <div className={`flex items-center gap-3 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <span className="text-white font-bold text-sm">RK</span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">Robin Roy Krigslund-Hansen</p>
          <span className="text-blue-500 text-xs" title="Verified CBD Expert">✓</span>
        </div>
        <p className="text-xs text-gray-500">
          {t('authorBio.bylineSubtext')} • {t('authorBio.experience')} • {t('authorBio.since')}
        </p>
      </div>
      {date && (
        <>
          <span className="text-gray-300 ml-2">•</span>
          <span className="text-xs">{formatDateLong(date, lang)}</span>
        </>
      )}
    </div>
  );
}

export default AuthorBio;