'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Types
interface ConditionNode {
  id: string;
  slug: string;
  name: string;
  level: number;
  icon: string | null;
  description: string | null;
  studyCount: number;
  humanStudyCount: number;
  hasPage: boolean;
  pageThreshold: number;
  meshIds: string[] | null;
  openalexIds: string[] | null;
  synonyms: string[] | null;
  children: ConditionNode[];
}

interface UnmappedTerm {
  id: string;
  term: string;
  originalTerm: string;
  studyCount: number;
  sources: string[];
  sampleTitles: string[];
  suggestedConditionId: string | null;
  suggestedConditionName: string | null;
  status: string;
}

interface Stats {
  terms: {
    totalRawTerms: number;
    uniqueTerms: number;
    mappedTerms: number;
    unmappedTerms: number;
    mappedPercentage: number;
    termMappingsCount: number;
  };
  conditions: {
    total: number;
    withStudies: number;
    topConditions: { name: string; study_count: number; human_study_count: number }[];
  };
  studies: {
    totalApproved: number;
    resolved: number;
    resolvedPercentage: number;
    pendingUnmapped: number;
  };
}

export default function ConditionsAdminPage() {
  // State
  const [tree, setTree] = useState<ConditionNode[]>([]);
  const [treeStats, setTreeStats] = useState({ total: 0, categories: 0, withStudies: 0, readyForPages: 0 });
  const [unmappedTerms, setUnmappedTerms] = useState<UnmappedTerm[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tree' | 'unmapped' | 'stats'>('tree');

  // Edit modal state
  const [editingCondition, setEditingCondition] = useState<ConditionNode | null>(null);
  const [editForm, setEditForm] = useState({ name: '', synonyms: '', meshIds: '', description: '' });

  // Map modal state
  const [mappingTerm, setMappingTerm] = useState<UnmappedTerm | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    parentId: '',
    synonyms: '',
    description: ''
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [taxonomyRes, unmappedRes, statsRes] = await Promise.all([
        fetch('/api/admin/conditions/taxonomy'),
        fetch('/api/admin/conditions/unmapped?limit=50'),
        fetch('/api/admin/conditions/stats')
      ]);

      if (taxonomyRes.ok) {
        const data = await taxonomyRes.json();
        setTree(data.tree || []);
        setTreeStats(data.stats || { total: 0, categories: 0, withStudies: 0, readyForPages: 0 });
      }

      if (unmappedRes.ok) {
        const data = await unmappedRes.json();
        setUnmappedTerms(data.terms || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Flatten tree for condition search
  const flattenTree = (nodes: ConditionNode[]): ConditionNode[] => {
    const result: ConditionNode[] = [];
    const traverse = (node: ConditionNode) => {
      result.push(node);
      node.children.forEach(traverse);
    };
    nodes.forEach(traverse);
    return result;
  };

  const allConditions = flattenTree(tree);
  const filteredConditions = searchQuery
    ? allConditions.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.synonyms?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allConditions;

  // Handle map term
  const handleMapTerm = async () => {
    if (!mappingTerm || !selectedConditionId) return;

    try {
      const res = await fetch('/api/admin/conditions/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: mappingTerm.term,
          conditionId: selectedConditionId
        })
      });

      if (res.ok) {
        setMappingTerm(null);
        setSelectedConditionId('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to map term:', error);
    }
  };

  // Handle ignore term
  const handleIgnoreTerm = async (term: UnmappedTerm) => {
    try {
      const res = await fetch('/api/admin/conditions/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: term.term })
      });

      if (res.ok) {
        setUnmappedTerms(prev => prev.filter(t => t.id !== term.id));
      }
    } catch (error) {
      console.error('Failed to ignore term:', error);
    }
  };

  // Handle edit condition
  const handleEditCondition = async () => {
    if (!editingCondition) return;

    try {
      const res = await fetch(`/api/admin/conditions/${editingCondition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          synonyms: editForm.synonyms.split(',').map(s => s.trim()).filter(Boolean),
          meshIds: editForm.meshIds.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setEditingCondition(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update condition:', error);
    }
  };

  // Handle create condition
  const handleCreateCondition = async () => {
    try {
      const res = await fetch('/api/admin/conditions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          parentId: createForm.parentId || null,
          description: createForm.description,
          synonyms: createForm.synonyms.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({ name: '', parentId: '', synonyms: '', description: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create condition:', error);
    }
  };

  // Open edit modal
  const openEditModal = (condition: ConditionNode) => {
    setEditingCondition(condition);
    setEditForm({
      name: condition.name,
      synonyms: condition.synonyms?.join(', ') || '',
      meshIds: condition.meshIds?.join(', ') || '',
      description: condition.description || ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Condition Intelligence</h1>
              <p className="text-gray-600 mt-1">
                Manage condition taxonomy and term mappings
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Condition
              </button>
              <Link
                href="/admin/research/queue"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Queue
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{treeStats.total}</div>
              <div className="text-sm text-gray-600">Total Conditions</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{treeStats.withStudies}</div>
              <div className="text-sm text-gray-600">With Studies</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{unmappedTerms.length}</div>
              <div className="text-sm text-gray-600">Unmapped Terms</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{treeStats.readyForPages}</div>
              <div className="text-sm text-gray-600">Ready for Pages</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tree'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Taxonomy Tree
          </button>
          <button
            onClick={() => setActiveTab('unmapped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'unmapped'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unmapped Terms
            {unmappedTerms.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                {unmappedTerms.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Taxonomy Tree Tab */}
          {activeTab === 'tree' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Condition Taxonomy</h2>
              {tree.length === 0 ? (
                <p className="text-gray-500">No conditions found. Add some conditions to get started.</p>
              ) : (
                <div className="space-y-2">
                  {tree.map(category => (
                    <TreeNode
                      key={category.id}
                      node={category}
                      depth={0}
                      onEdit={openEditModal}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unmapped Terms Tab */}
          {activeTab === 'unmapped' && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Unmapped Terms
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (needs review)
                </span>
              </h2>
              {unmappedTerms.length === 0 ? (
                <p className="text-gray-500">No unmapped terms found. All terms have been mapped!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Term</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Studies</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sources</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sample Title</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unmappedTerms.map(term => (
                        <tr key={term.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{term.originalTerm || term.term}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {term.studyCount}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {term.sources.map(source => (
                                <span
                                  key={source}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                            {term.sampleTitles[0] || '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setMappingTerm(term)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Map
                              </button>
                              <button
                                onClick={() => handleIgnoreTerm(term)}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                              >
                                Ignore
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
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Mapping Health</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Terms Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Term Mappings</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total raw terms captured</span>
                      <span className="font-medium">{stats.terms.totalRawTerms.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unique terms</span>
                      <span className="font-medium">{stats.terms.uniqueTerms.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terms mapped</span>
                      <span className="font-medium text-green-600">
                        {stats.terms.mappedTerms.toLocaleString()} ({stats.terms.mappedPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terms unmapped</span>
                      <span className="font-medium text-orange-600">
                        {stats.terms.unmappedTerms.toLocaleString()} ({100 - stats.terms.mappedPercentage}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${stats.terms.mappedPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Studies Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Study Resolution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total approved studies</span>
                      <span className="font-medium">{stats.studies.totalApproved.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Studies with conditions</span>
                      <span className="font-medium text-green-600">
                        {stats.studies.resolved.toLocaleString()} ({stats.studies.resolvedPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conditions with studies</span>
                      <span className="font-medium">{stats.conditions.withStudies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending unmapped</span>
                      <span className="font-medium text-orange-600">{stats.studies.pendingUnmapped}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${stats.studies.resolvedPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Conditions */}
                <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Top Conditions by Study Count</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.conditions.topConditions.map((condition, i) => (
                      <div key={i} className="flex justify-between items-center bg-white rounded p-2">
                        <span className="text-gray-700">{condition.name}</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm">
                            {condition.study_count} studies
                          </span>
                          {condition.human_study_count > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-sm">
                              {condition.human_study_count} human
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Modal */}
        {mappingTerm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Map &quot;{mappingTerm.originalTerm || mappingTerm.term}&quot;
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Found in {mappingTerm.studyCount} studies. Select a condition to map this term to:
              </p>

              {/* Search */}
              <input
                type="text"
                placeholder="Search conditions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
              />

              {/* Condition list */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredConditions.map(condition => (
                  <button
                    key={condition.id}
                    onClick={() => setSelectedConditionId(condition.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                      selectedConditionId === condition.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {condition.icon && <span>{condition.icon}</span>}
                      <span>{condition.name}</span>
                      <span className="text-xs text-gray-500">
                        ({condition.studyCount} studies)
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setMappingTerm(null);
                    setSelectedConditionId('');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMapTerm}
                  disabled={!selectedConditionId}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Map Term
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingCondition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                Edit {editingCondition.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Synonyms (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.synonyms}
                    onChange={e => setEditForm(f => ({ ...f, synonyms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="anxiety disorder, GAD, generalized anxiety"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MeSH IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.meshIds}
                    onChange={e => setEditForm(f => ({ ...f, meshIds: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="D001007, D001008"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingCondition(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCondition}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Condition</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Tinnitus"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                  <select
                    value={createForm.parentId}
                    onChange={e => setCreateForm(f => ({ ...f, parentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">None (top-level category)</option>
                    {allConditions.filter(c => c.level <= 2).map(condition => (
                      <option key={condition.id} value={condition.id}>
                        {'  '.repeat(condition.level - 1)}{condition.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Synonyms (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={createForm.synonyms}
                    onChange={e => setCreateForm(f => ({ ...f, synonyms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="ringing in ears, ear ringing"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ name: '', parentId: '', synonyms: '', description: '' });
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCondition}
                  disabled={!createForm.name}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Create Condition
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tree Node Component
function TreeNode({
  node,
  depth,
  onEdit
}: {
  node: ConditionNode;
  depth: number;
  onEdit: (node: ConditionNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  const hasChildren = node.children.length > 0;
  const canCreatePage = node.studyCount >= node.pageThreshold && !node.hasPage;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 ${
          depth === 0 ? 'bg-gray-50' : ''
        }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Icon */}
        {node.icon && <span className="text-lg">{node.icon}</span>}

        {/* Name */}
        <span className={`font-medium ${depth === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
          {node.name}
        </span>

        {/* Study count badge */}
        <span className={`px-2 py-0.5 rounded text-xs ${
          node.studyCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
        }`}>
          {node.studyCount} studies
        </span>

        {/* Human study count */}
        {node.humanStudyCount > 0 && (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
            {node.humanStudyCount} human
          </span>
        )}

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          {canCreatePage && (
            <button className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200">
              Create Page
            </button>
          )}
          {node.hasPage && (
            <Link
              href={`/research/${node.slug}`}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
            >
              View
            </Link>
          )}
          <button
            onClick={() => onEdit(node)}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
