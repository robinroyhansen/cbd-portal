'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

interface Comment {
  id: string;
  author_name: string;
  comment_text: string;
  created_at: string;
  parent_id: string | null;
}

export function Comments({ articleId }: { articleId: string }) {
  const { t } = useLocale();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', comment: '', honeypot: '' });

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?article_id=${articleId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          author_name: form.name,
          author_email: form.email,
          comment_text: form.comment,
          honeypot: form.honeypot
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      setSubmitted(true);
      setForm({ name: '', email: '', comment: '', honeypot: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) return t('comments.timeAgo.monthAgo', { count: months });
    if (weeks > 0) return t('comments.timeAgo.weekAgo', { count: weeks });
    if (days > 0) return t('comments.timeAgo.dayAgo', { count: days });
    if (hours > 0) return t('comments.timeAgo.hourAgo', { count: hours });
    if (minutes > 0) return t('comments.timeAgo.minuteAgo', { count: minutes });
    return t('comments.timeAgo.justNow');
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 print:hidden">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t('comments.title')} {comments.length > 0 && <span className="text-gray-500 font-normal">{t('comments.count', { count: comments.length })}</span>}
      </h2>

      {/* Existing comments - sorted oldest first for conversation flow */}
      {loading ? (
        <div className="space-y-4 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 mb-8">{t('comments.noComments')}</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{comment.author_name}</span>
                  <p className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</p>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-green-600 text-xl">✓</span>
            <p className="text-green-800 font-medium">{t('comments.thankYou')}</p>
          </div>
          <p className="text-green-700 text-sm">
            {t('comments.submitted')}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
          >
            {t('comments.submitAnother')}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('comments.leaveComment')}</h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('comments.name')} <span className="text-red-500">{t('comments.required')}</span>
                </label>
                <input
                  type="text"
                  id="comment-name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t('comments.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('comments.email')} <span className="text-red-500">{t('comments.required')}</span>
                  <span className="text-gray-500 font-normal ml-1">{t('comments.emailNotDisplayed')}</span>
                </label>
                <input
                  type="email"
                  id="comment-email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={t('comments.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-1">
                {t('comments.comment')} <span className="text-red-500">{t('comments.required')}</span>
              </label>
              <textarea
                id="comment-text"
                required
                minLength={10}
                maxLength={5000}
                rows={4}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-y"
                placeholder={t('comments.commentPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{form.comment.length}/5000 {t('comments.characters')}</p>
            </div>

            {/* Honeypot field - hidden from real users */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website-field">Website</label>
              <input
                type="text"
                id="website-field"
                name="website"
                value={form.honeypot}
                onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">
                {t('comments.moderated')}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('comments.submitting')}
                  </>
                ) : (
                  t('comments.postComment')
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
