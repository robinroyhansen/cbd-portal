'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/admin/ProjectForm';
import { ProjectFormData } from '@/lib/project-types';

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: ProjectFormData) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { project } = await response.json();
      router.push(`/admin/projects/${project.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/projects');
  };

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={saving}
    />
  );
}
