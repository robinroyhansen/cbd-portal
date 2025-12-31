'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthorForm, { AuthorFormData } from '@/components/admin/AuthorForm';

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authorData, setAuthorData] = useState<Partial<AuthorFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchAuthor(params.id as string);
    }
  }, [params.id]);

  const fetchAuthor = async (id: string) => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/admin/authors/${id}`);

      if (!response.ok) {
        throw new Error('Author not found');
      }

      const data = await response.json();
      setAuthorData(data.author);
      setError(null);

    } catch (error) {
      console.error('Error fetching author:', error);
      setError(error instanceof Error ? error.message : 'Failed to load author');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (formData: AuthorFormData) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/authors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update author');
      }

      const data = await response.json();

      // Redirect to the authors list with a success message
      router.push('/admin/authors?updated=true');

    } catch (error) {
      console.error('Error updating author:', error);
      alert(error instanceof Error ? error.message : 'Failed to update author');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/authors');
  };

  if (initialLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !authorData) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Author</h3>
          <p className="text-red-700 mb-4">{error || 'Author not found'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchAuthor(params.id as string)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/admin/authors')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Authors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthorForm
      initialData={authorData}
      isEditing={true}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  );
}