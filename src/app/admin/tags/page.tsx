'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  article_count: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', slug: '', description: '', color: 'gray' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'article_count' | 'color'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('kb_tags')
      .select('*')
      .order('name');
    setTags(data || []);
    setLoading(false);
  };

  const createTag = async () => {
    if (!newTag.name) return;

    const slug = newTag.slug || newTag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const supabase = createClient();
    const { error } = await supabase.from('kb_tags').insert({
      name: newTag.name,
      slug,
      description: newTag.description,
      color: newTag.color
    });

    if (error) {
      alert(`Error creating tag: ${error.message}`);
      return;
    }

    setNewTag({ name: '', slug: '', description: '', color: 'gray' });
    fetchTags();
  };

  const updateTag = async () => {
    if (!editingTag) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('kb_tags')
      .update({
        name: editingTag.name,
        description: editingTag.description,
        color: editingTag.color
      })
      .eq('id', editingTag.id);

    if (error) {
      alert(`Error updating tag: ${error.message}`);
      return;
    }

    setEditingTag(null);
    fetchTags();
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Delete this tag? This will also remove it from all articles.')) return;

    const supabase = createClient();
    const { error } = await supabase.from('kb_tags').delete().eq('id', id);

    if (error) {
      alert(`Error deleting tag: ${error.message}`);
      return;
    }

    fetchTags();
  };

  const colors = [
    'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
    'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose', 'slate', 'zinc'
  ];

  // Filter and sort tags
  const filteredAndSortedTags = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'article_count') {
        comparison = (a.article_count || 0) - (b.article_count || 0);
      } else if (sortBy === 'color') {
        comparison = a.color.localeCompare(b.color);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (field: 'name' | 'article_count' | 'color') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'article_count' | 'color') => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏷️ Tag Management</h1>
        <p className="text-gray-600">Manage topic tags for categorizing and cross-referencing articles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
          <div className="text-sm text-gray-600">Total Tags</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {tags.filter(t => (t.article_count || 0) > 0).length}
          </div>
          <div className="text-sm text-gray-600">Tags in Use</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(tags.reduce((sum, t) => sum + (t.article_count || 0), 0) / tags.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Avg Articles</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(tags.map(t => t.color)).size}
          </div>
          <div className="text-sm text-gray-600">Color Categories</div>
        </div>
      </div>

      {/* Create new tag */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Tag</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tag name *"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
            <input
              type="text"
              placeholder="Slug (auto-generated)"
              value={newTag.slug}
              onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <select
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
              className="px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {colors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={createTag}
              disabled={!newTag.name}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Create Tag
            </button>
          </div>
          <textarea
            placeholder="Description (optional)"
            value={newTag.description}
            onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <span className="text-sm text-gray-500">
            {filteredAndSortedTags.length} of {tags.length} tags
          </span>
        </div>
      </div>

      {/* Tags list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading tags...</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('name')}
                >
                  Tag {getSortIcon('name')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('color')}
                >
                  Color {getSortIcon('color')}
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('article_count')}
                >
                  Articles {getSortIcon('article_count')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndSortedTags.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingTag?.id === tag.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="px-2 py-1 border rounded w-full text-sm focus:ring-1 focus:ring-green-500"
                        />
                        <textarea
                          value={editingTag.description}
                          onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                          placeholder="Description"
                          rows={2}
                          className="px-2 py-1 border rounded w-full text-xs focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">{tag.name}</span>
                        {tag.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{tag.description}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{tag.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    {editingTag?.id === tag.id ? (
                      <select
                        value={editingTag.color}
                        onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                        className="px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-green-500"
                      >
                        {colors.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${tag.color}-100 text-${tag.color}-700`}>
                        {tag.color}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tag.article_count || 0}</span>
                      {(tag.article_count || 0) > 0 && (
                        <span className="text-xs text-green-600">in use</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingTag?.id === tag.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={updateTag}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTag(tag)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          disabled={(tag.article_count || 0) > 0}
                        >
                          {(tag.article_count || 0) > 0 ? 'In Use' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedTags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No tags match your search.' : 'No tags found.'}
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Actions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Use descriptive names for better user understanding</p>
          <p>• Choose colors that group related topics (e.g., health conditions in blue/red)</p>
          <p>• Tags in use cannot be deleted - remove from articles first</p>
          <p>• Auto-tagging suggestions can be implemented based on article content</p>
        </div>
      </div>
    </div>
  );
}