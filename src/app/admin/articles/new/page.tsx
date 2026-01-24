'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { articleTemplates, ArticleType, getTemplate } from '@/lib/article-templates';
import { TemplatePreview } from '@/components/admin/TemplatePreview';
import { TemplateEditor } from '@/components/admin/TemplateEditor';

export default function NewArticlePage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<ArticleType | null>(null);
  const [step, setStep] = useState<'select' | 'edit'>('select');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [sectionData, setSectionData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('kb_categories')
      .select('id, name')
      .order('name');
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
    // Auto-select primary author if available
    const primary = data?.find(a => a.is_primary);
    if (primary) {
      setSelectedAuthor(primary.name);
    }
  };

  const handleSelectTemplate = (type: ArticleType) => {
    setSelectedType(type);
    setStep('edit');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const generateContent = (): string => {
    if (!selectedType) return '';

    const template = getTemplate(selectedType);
    let content = '';

    for (const section of template.sections) {
      if (sectionData[section.id] && sectionData[section.id].trim()) {
        content += `## ${section.title}\n\n${sectionData[section.id].trim()}\n\n`;
      }
    }

    return content.trim();
  };

  const calculateReadingTime = (content: string): number => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / 200) || 1;
  };

  const generateExcerpt = (): string => {
    if (excerpt) return excerpt;

    const introContent = sectionData['introduction'] || sectionData['headline-summary'] || Object.values(sectionData)[0] || '';
    return introContent.substring(0, 200).trim() + (introContent.length > 200 ? '...' : '');
  };

  const handleSave = async (status: 'draft' | 'published' | 'scheduled') => {
    if (!selectedType || !title.trim()) return;
    if (!selectedAuthor) {
      alert('Please select an author.');
      return;
    }
    if (status === 'scheduled' && !scheduledDate) {
      alert('Please select a publish date for scheduled articles.');
      return;
    }

    setLoading(true);

    try {
      const content = generateContent();
      const finalExcerpt = generateExcerpt();
      const readingTime = calculateReadingTime(content);

      const articleData: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: finalExcerpt,
        article_type: selectedType,
        template_data: sectionData,
        category_id: categoryId || null,
        reading_time: readingTime,
        status,
        author: selectedAuthor,
        published_at: status === 'published' ? new Date().toISOString() : null,
        scheduled_publish_at: status === 'scheduled' ? new Date(scheduledDate).toISOString() : null,
        meta_title: title.trim(),
        meta_description: finalExcerpt
      };

      const { error } = await supabase
        .from('kb_articles')
        .insert(articleData);

      if (error) throw error;

      router.push('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Error creating article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim() || !slug.trim() || !selectedAuthor) return false;

    if (!selectedType) return false;

    const template = getTemplate(selectedType);
    const requiredSections = template.sections.filter(s => s.required);

    return requiredSections.every(section =>
      sectionData[section.id] && sectionData[section.id].trim()
    );
  };

  const isFormValid = validateForm();

  if (step === 'select') {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Article</h1>
          <p className="text-gray-600">Choose a template to get started with structured content creation</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(articleTemplates).map(template => (
            <TemplatePreview
              key={template.type}
              template={template}
              onSelect={() => handleSelectTemplate(template.type)}
            />
          ))}
        </div>
      </div>
    );
  }

  const template = selectedType ? getTemplate(selectedType) : null;

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setStep('select')}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to templates
        </button>
        <h1 className="text-2xl font-bold">
          New {template?.name}
        </h1>
      </div>

      <div className="max-w-4xl">
        {/* Article Details */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Article Details</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author *</label>
              <select
                required
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Custom Excerpt (optional)</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Will be auto-generated from content if empty"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Template Editor */}
        {template && (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Content Sections</h2>
            <TemplateEditor
              template={template}
              initialData={sectionData}
              onChange={setSectionData}
            />
          </div>
        )}

        {/* Schedule Options */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Schedule Publication (Optional)</h2>
          <div className="flex items-center gap-4">
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {scheduledDate && (
              <button
                onClick={() => setScheduledDate('')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
          {scheduledDate && (
            <p className="mt-2 text-sm text-blue-600">
              Article will be automatically published on {new Date(scheduledDate).toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => handleSave('draft')}
            disabled={loading || !title.trim() || !slug.trim()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          {scheduledDate ? (
            <button
              onClick={() => handleSave('scheduled')}
              disabled={loading || !isFormValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Scheduling...' : 'Schedule Publication'}
            </button>
          ) : (
            <button
              onClick={() => handleSave('published')}
              disabled={loading || !isFormValid}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Now'}
            </button>
          )}
          <button
            onClick={() => setStep('select')}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Change Template
          </button>
          <button
            onClick={() => router.push('/admin/articles')}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Validation Status */}
        {!isFormValid && title && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              Please complete all required sections to publish the article.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}