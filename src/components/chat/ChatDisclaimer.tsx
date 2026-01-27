'use client';

import { useLocale } from '@/hooks/useLocale';

/**
 * ChatDisclaimer Component
 * Medical disclaimer banner
 */

export function ChatDisclaimer() {
  const { t } = useLocale();

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <p className="text-xs text-amber-800">
        <span className="font-medium">{t('chat.disclaimer')}:</span> {t('chat.disclaimerText')}
      </p>
    </div>
  );
}
