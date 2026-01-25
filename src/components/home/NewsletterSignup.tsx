'use client';

import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // For now, just show success. Integrate with email service later.
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t('newsletter.title')}
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          {t('newsletter.description')}
        </p>

        {status === 'success' ? (
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg inline-block">
            ✓ {t('common.subscribeSuccess')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? t('common.subscribing') : t('newsletter.button')}
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 mt-4">
          {t('newsletter.noSpam')}
        </p>
      </div>
    </section>
  );
}