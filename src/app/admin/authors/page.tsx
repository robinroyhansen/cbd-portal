'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Author {
  id: string;
  name: string;
  slug: string;
  title: string;
  is_verified: boolean;
  is_primary: boolean;
  is_active: boolean;
  article_count: number;
  years_experience: number;
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('kb_authors')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('name');
    setAuthors(data || []);
    setLoading(false);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from('kb_authors')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    fetchAuthors();
  };

  const toggleVerified = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from('kb_authors')
      .update({ is_verified: !currentStatus })
      .eq('id', id);
    fetchAuthors();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👤 Authors</h1>
        <Link
          href="/admin/authors/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add Author
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Author</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Experience</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Articles</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {authors.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{author.name}</span>
                      {author.is_primary && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Primary</span>
                      )}
                      {author.is_verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">/{author.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{author.title}</td>
                  <td className="px-4 py-3 text-sm">{author.years_experience}+ years</td>
                  <td className="px-4 py-3 text-sm">{author.article_count}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      author.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {author.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/authors/${author.slug}`}
                        target="_blank"
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => toggleVerified(author.id, author.is_verified)}
                        className={`px-3 py-1 rounded text-sm ${
                          author.is_verified
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {author.is_verified ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        onClick={() => toggleActive(author.id, author.is_active)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                      >
                        {author.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}