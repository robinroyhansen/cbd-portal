'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { Article, Category } from '@/types/database.types';

const MarkdownEditor = dynamic(
  () => import('@/components/admin/MarkdownEditor'),
  { ssr: false }
);

export default function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled' | 'archived',
    author: '',
    scheduled_publish_at: '',
  });

  useEffect(() => {
    fetchArticle();
    fetchCategories();
    fetchAuthors();
  }, [params.id]);

  const fetchArticle = async () => {
    const { data } = await supabase
      .from('kb_articles')
      .select('*')
      .eq('id', params.id)
      .single<Article>();

    if (data) {
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        category_id: data.category_id || '',
        featured_image: data.featured_image || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        status: data.status,
        author: data.author || 'Robin Roy Krigslund-Hansen',
        scheduled_publish_at: data.scheduled_publish_at
          ? new Date(data.scheduled_publish_at).toISOString().slice(0, 16)
          : '',
      });
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('kb_categories')
      .select('id, name')
      .order('name')
      .returns<Pick<Category, 'id' | 'name'>[]>();
    setCategories(data || []);
  };

  const fetchAuthors = async () => {
    const { data } = await supabase
      .from('kb_authors')
      .select('id, name, is_primary')
      .eq('is_active', true)
      .order('is_primary', { ascending: false })
      .order('name');
    setAuthors(data || []);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { scheduled_publish_at, ...restFormData } = formData;
      const updateData: Partial<Article> & { scheduled_publish_at?: string | null } = {
        ...restFormData,
        reading_time: calculateReadingTime(formData.content),
        updated_at: new Date().toISOString(),
      };

      // Handle scheduled_publish_at
      if (formData.status === 'scheduled' && scheduled_publish_at) {
        updateData.scheduled_publish_at = new Date(scheduled_publish_at).toISOString();
        updateData.published_at = null; // Clear published_at for scheduled articles
      } else if (formData.status === 'published') {
        // Only update published_at if status changed to published
        const { data: currentArticle } = await supabase
          .from('kb_articles')
          .select('status, published_at')
          .eq('id', params.id)
          .single<Pick<Article, 'status' | 'published_at'>>();

        if (currentArticle && currentArticle.status !== 'published') {
          updateData.published_at = new Date().toISOString();
        }
        updateData.scheduled_publish_at = null; // Clear scheduled date
      } else {
        updateData.scheduled_publish_at = null; // Clear for draft/archived
      }

      const { error } = await (supabase as any)
        .from('kb_articles')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            required
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            rows={3}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <MarkdownEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
          />
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={() => router.push('/admin/media?select=true')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Browse Media
            </button>
          </div>
          {formData.featured_image && (
            <img
              src={formData.featured_image}
              alt="Featured"
              className="mt-2 h-32 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Meta Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title (SEO)
          </label>
          <input
            type="text"
            value={formData.meta_title}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder={formData.title}
          />
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description (SEO)
          </label>
          <textarea
            rows={2}
            value={formData.meta_description}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder={formData.excerpt}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'scheduled' | 'archived' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Scheduled Publish Date */}
        {formData.status === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.scheduled_publish_at}
              onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Article will be automatically published at this time
            </p>
          </div>
        )}

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <select
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select an author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.name}>
                {author.name}{author.is_primary ? ' (Primary)' : ''}
              </option>
            ))}
          </select>
          {authors.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              No authors found. <a href="/admin/authors/new" className="underline">Create an author</a> first.
            </p>
          )}
        </div>

        {/* Submit buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/articles')}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}