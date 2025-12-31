'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

export function Comments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', content: '' });

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('kb_comments')
      .select('*')
      .eq('article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    setComments(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.from('kb_comments').insert({
      article_id: articleId,
      author_name: form.name,
      author_email: form.email,
      content: form.content,
      status: 'pending'
    });

    if (!error) {
      setSubmitted(true);
      setForm({ name: '', email: '', content: '' });
    }

    setSubmitting(false);
  };

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 print:hidden">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      {/* Existing comments */}
      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 mb-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{comment.author_name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            Thank you for your comment! It will appear after review.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Leave a Comment</h3>
          <p className="text-sm text-gray-500 mb-4">
            Your comment will be reviewed before publishing.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-gray-400 mt-1">Not displayed publicly</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Comment *</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      )}
    </section>
  );
}