'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ConfigItem {
  id: string;
  category: 'cannabinoid' | 'condition' | 'study_type' | 'blacklist' | 'journal';
  term_key: string;
  display_name: string;
  synonyms: string[];
  enabled: boolean;
  sort_order: number;
}

type CategoryType = ConfigItem['category'];

const CATEGORY_INFO: Record<CategoryType, { label: string; description: string; icon: string }> = {
  cannabinoid: {
    label: 'Cannabinoids',
    description: 'Cannabinoid terms and their synonyms used in search queries',
    icon: '🌿',
  },
  condition: {
    label: 'Health Conditions',
    description: 'Medical conditions to search for in combination with cannabinoids',
    icon: '🏥',
  },
  study_type: {
    label: 'Study Types',
    description: 'Research study types used for classification',
    icon: '📊',
  },
  blacklist: {
    label: 'Blacklist Terms',
    description: 'Terms that indicate false positives (non-cannabinoid CBD)',
    icon: '🚫',
  },
  journal: {
    label: 'Cannabis Journals',
    description: 'Cannabis-focused journals that add confirmation score',
    icon: '📰',
  },
};

export default function ScannerConfigPage() {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('cannabinoid');
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [newItem, setNewItem] = useState({
    term_key: '',
    display_name: '',
    synonyms: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_scanner_config')
      .select('*')
      .order('category')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching config:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  async function toggleEnabled(item: ConfigItem) {
    setSaving(true);
    const { error } = await supabase
      .from('research_scanner_config')
      .update({ enabled: !item.enabled })
      .eq('id', item.id);

    if (error) {
      console.error('Error toggling:', error);
      alert('Failed to update');
    } else {
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, enabled: !i.enabled } : i))
      );
    }
    setSaving(false);
  }

  async function saveEdit() {
    if (!editingItem) return;
    setSaving(true);

    const { error } = await supabase
      .from('research_scanner_config')
      .update({
        display_name: editingItem.display_name,
        synonyms: editingItem.synonyms,
      })
      .eq('id', editingItem.id);

    if (error) {
      console.error('Error saving:', error);
      alert('Failed to save');
    } else {
      setItems(prev =>
        prev.map(i => (i.id === editingItem.id ? editingItem : i))
      );
      setEditingItem(null);
    }
    setSaving(false);
  }

  async function addNewItem() {
    if (!newItem.term_key.trim() || !newItem.display_name.trim()) {
      alert('Term key and display name are required');
      return;
    }

    setSaving(true);
    const synonyms = newItem.synonyms
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    // Add the term_key itself as a synonym if not already included
    const termKeyLower = newItem.term_key.toLowerCase();
    if (!synonyms.includes(termKeyLower)) {
      synonyms.unshift(termKeyLower);
    }

    const { error } = await supabase
      .from('research_scanner_config')
      .insert({
        category: activeCategory,
        term_key: newItem.term_key.toLowerCase().replace(/\s+/g, '_'),
        display_name: newItem.display_name,
        synonyms,
        enabled: true,
        sort_order: filteredItems.length + 1,
      });

    if (error) {
      console.error('Error adding:', error);
      if (error.code === '23505') {
        alert('A term with this key already exists in this category');
      } else {
        alert('Failed to add term');
      }
    } else {
      setNewItem({ term_key: '', display_name: '', synonyms: '' });
      setShowAddForm(false);
      fetchItems();
    }
    setSaving(false);
  }

  async function deleteItem(item: ConfigItem) {
    if (!confirm(`Delete "${item.display_name}"? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('research_scanner_config')
      .delete()
      .eq('id', item.id);

    if (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    } else {
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
    setSaving(false);
  }

  const filteredItems = items.filter(i => i.category === activeCategory);
  const enabledCount = filteredItems.filter(i => i.enabled).length;
  const categoryInfo = CATEGORY_INFO[activeCategory];

  // Stats for sidebar
  const stats = (Object.keys(CATEGORY_INFO) as CategoryType[]).map(cat => ({
    category: cat,
    total: items.filter(i => i.category === cat).length,
    enabled: items.filter(i => i.category === cat && i.enabled).length,
  }));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-5 gap-4 mt-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Scanner Configuration</h1>
        <p className="text-gray-600 mt-1">
          Configure search terms, conditions, and validation rules for the research scanner
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(Object.keys(CATEGORY_INFO) as CategoryType[]).map(cat => {
          const info = CATEGORY_INFO[cat];
          const stat = stats.find(s => s.category === cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeCategory === cat ? 'bg-green-500' : 'bg-gray-200'
              }`}>
                {stat?.enabled}/{stat?.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Header */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>{categoryInfo.icon}</span>
              {categoryInfo.label}
            </h2>
            <p className="text-sm text-gray-600">{categoryInfo.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {enabledCount} of {filteredItems.length} enabled
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add New
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-4">
          <h3 className="font-medium mb-3">Add New {categoryInfo.label.slice(0, -1)}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term Key
              </label>
              <input
                type="text"
                value={newItem.term_key}
                onChange={e => setNewItem({ ...newItem, term_key: e.target.value })}
                placeholder="e.g., chronic_pain"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={newItem.display_name}
                onChange={e => setNewItem({ ...newItem, display_name: e.target.value })}
                placeholder="e.g., Chronic Pain"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synonyms (comma-separated)
              </label>
              <input
                type="text"
                value={newItem.synonyms}
                onChange={e => setNewItem({ ...newItem, synonyms: e.target.value })}
                placeholder="e.g., chronic pain, persistent pain, long-term pain"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addNewItem}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Term'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewItem({ term_key: '', display_name: '', synonyms: '' });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-lg border">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {categoryInfo.label.toLowerCase()} configured yet.
            <br />
            Click &quot;Add New&quot; to get started.
          </div>
        ) : (
          <div className="divide-y">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !item.enabled ? 'opacity-50' : ''
                }`}
              >
                {editingItem?.id === item.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={editingItem.display_name}
                          onChange={e =>
                            setEditingItem({ ...editingItem, display_name: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="block text-xs text-gray-500 mb-1">
                          Synonyms (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editingItem.synonyms.join(', ')}
                          onChange={e =>
                            setEditingItem({
                              ...editingItem,
                              synonyms: e.target.value.split(',').map(s => s.trim().toLowerCase()),
                            })
                          }
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{item.display_name}</h3>
                        <span className="text-xs text-gray-400 font-mono">{item.term_key}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.synonyms.slice(0, 8).map((syn, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {syn}
                          </span>
                        ))}
                        {item.synonyms.length > 8 && (
                          <span className="px-2 py-0.5 text-gray-400 text-xs">
                            +{item.synonyms.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleEnabled(item)}
                        disabled={saving}
                        className={`px-3 py-1.5 text-sm rounded ${
                          item.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        disabled={saving}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
        <h3 className="font-medium text-blue-800 mb-2">How Scanner Configuration Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            <strong>Cannabinoids:</strong> Terms used to build search queries. Synonyms are searched together.
          </li>
          <li>
            <strong>Conditions:</strong> Health topics combined with cannabinoids for targeted searches.
          </li>
          <li>
            <strong>Study Types:</strong> Used to classify research (RCT, meta-analysis, case report, etc.).
          </li>
          <li>
            <strong>Blacklist:</strong> Terms that indicate false positives. Studies matching these are rejected.
          </li>
          <li>
            <strong>Journals:</strong> Cannabis-focused journals add +40 to confirmation score.
          </li>
        </ul>
      </div>
    </div>
  );
}
