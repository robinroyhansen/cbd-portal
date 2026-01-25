'use client';

import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          setErrorMessage(t('common.rateLimitError') || 'Too many requests. Please try again later.');
          setStatus('error');
          return;
        }
        // Handle other errors
        setErrorMessage(data.error || t('common.subscribeError') || 'Failed to subscribe. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setErrorMessage(t('common.subscribeError') || 'An unexpected error occurred. Please try again.');
      setStatus('error');
    }
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
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
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
            {status === 'error' && errorMessage && (
              <div className="mt-3 text-red-400 text-sm">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          {t('newsletter.noSpam')}
        </p>
      </div>
    </section>
  );
}