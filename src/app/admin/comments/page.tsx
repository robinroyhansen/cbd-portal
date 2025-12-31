'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
  article: { title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('kb_comments')
      .select(`
        *,
        article:kb_articles(title, slug)
      `)
      .eq('status', filter)
      .order('created_at', { ascending: false });

    setComments(data || []);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from('kb_comments')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', id);
    fetchComments();
  };

  const handleReject = async (id: string) => {
    const supabase = createClient();
    await supabase
      .from('kb_comments')
      .update({ status: 'rejected' })
      .eq('id', id);
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this comment permanently?')) return;
    const supabase = createClient();
    await supabase.from('kb_comments').delete().eq('id', id);
    fetchComments();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💬 Comments Moderation</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md capitalize ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {loading ? (
        <p>Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No {filter} comments.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{comment.author_name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-sm text-gray-500">{comment.author_email}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-2">
                On: <a href={`/articles/${comment.article?.slug}`} className="text-blue-600 hover:underline">
                  {comment.article?.title}
                </a>
              </p>

              <p className="text-gray-700 mb-4">{comment.content}</p>

              <div className="flex gap-2">
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}