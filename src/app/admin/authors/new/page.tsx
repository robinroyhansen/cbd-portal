'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthorForm, { AuthorFormData } from '@/components/admin/AuthorForm';

export default function NewAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: AuthorFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create author');
      }

      const data = await response.json();

      // Redirect to the authors list with a success message
      router.push('/admin/authors?created=true');

    } catch (error) {
      console.error('Error creating author:', error);
      alert(error instanceof Error ? error.message : 'Failed to create author');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/authors');
  };

  return (
    <AuthorForm
      isEditing={false}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  );
}