'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BlacklistTerm {
  id: string;
  term: string;
  match_type: 'contains' | 'exact' | 'regex';
  case_sensitive: boolean;
  reason: string | null;
  created_at: string;
}

export default function ResearchSettingsPage() {
  const [terms, setTerms] = useState<BlacklistTerm[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [newReason, setNewReason] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact' | 'regex'>('contains');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ rejected: number; checked: number } | null>(null);
  const [scanningApproved, setScanningApproved] = useState(false);
  const [approvedResult, setApprovedResult] = useState<{ found: number; checked: number } | null>(null);
  const [flaggedStudies, setFlaggedStudies] = useState<{ id: string; title: string; matchedTerm: string }[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    const { data, error } = await supabase
      .from('research_blacklist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blacklist:', error);
    }
    setTerms(data || []);
    setLoading(false);
  }

  async function addTerm() {
    if (!newTerm.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('research_blacklist')
      .insert({
        term: newTerm.trim().toLowerCase(),
        match_type: matchType,
        case_sensitive: caseSensitive,
        reason: newReason.trim() || null,
      });

    if (error) {
      console.error('Error adding term:', error);
      alert('Failed to add term. It may already exist.');
    } else {
      setNewTerm('');
      setNewReason('');
      setMatchType('contains');
      setCaseSensitive(false);
      fetchTerms();
    }
    setSaving(false);
  }

  async function deleteTerm(id: string) {
    if (!confirm('Remove this term from blacklist?')) return;

    const { error } = await supabase
      .from('research_blacklist')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting term:', error);
    } else {
      fetchTerms();
    }
  }

  async function applyBlacklistToExisting() {
    if (!confirm('This will check all pending studies against the blacklist and auto-reject matches. Continue?')) return;

    setApplying(true);
    setApplyResult(null);

    try {
      const res = await fetch('/api/admin/research/apply-blacklist', { method: 'POST' });
      const data = await res.json();
      setApplyResult({ rejected: data.rejected, checked: data.checked });
    } catch (error) {
      console.error('Error applying blacklist:', error);
      alert('Failed to apply blacklist');
    }

    setApplying(false);
  }

  async function checkApprovedStudies() {
    if (!confirm('This will check all APPROVED studies against the blacklist. Matches will be flagged for review (not auto-rejected). Continue?')) return;

    setScanningApproved(true);
    setApprovedResult(null);
    setFlaggedStudies([]);

    try {
      const res = await fetch('/api/admin/research/check-approved-blacklist', { method: 'POST' });
      const data = await res.json();
      setApprovedResult({
        found: data.found,
        checked: data.checked
      });
      setFlaggedStudies(data.flaggedStudies || []);
    } catch (error) {
      console.error('Error checking approved studies:', error);
      alert('Failed to check approved studies');
    }

    setScanningApproved(false);
  }

  async function handleRejectStudy(studyId: string) {
    if (!confirm('Reject this study? It will be moved to rejected status.')) return;

    setProcessingId(studyId);
    try {
      const res = await fetch('/api/admin/research/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: studyId,
          status: 'rejected',
          rejection_reason: 'Matched blacklist term'
        })
      });

      if (res.ok) {
        setFlaggedStudies(prev => prev.filter(s => s.id !== studyId));
        setApprovedResult(prev => prev ? { ...prev, found: prev.found - 1 } : null);
      } else {
        alert('Failed to reject study');
      }
    } catch (error) {
      console.error('Error rejecting study:', error);
      alert('Error rejecting study');
    }
    setProcessingId(null);
  }

  async function handleDismissFlag(studyId: string) {
    setProcessingId(studyId);
    try {
      // Just remove from local state - no need to track dismissals in DB
      setFlaggedStudies(prev => prev.filter(s => s.id !== studyId));
      setApprovedResult(prev => prev ? { ...prev, found: prev.found - 1 } : null);
    } catch (error) {
      console.error('Error dismissing flag:', error);
    }
    setProcessingId(null);
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Research Scanner Settings</h1>
      <p className="text-gray-600 mb-8">Configure filters and blacklist terms to reduce false positives</p>

      {/* Blacklist Section */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Blacklist Terms</h2>
        <p className="text-sm text-gray-600 mb-4">
          Studies containing these terms will be automatically rejected during scanning.
          Use this to filter out false positives like &quot;Central Business District&quot; which contains &quot;CBD&quot;.
        </p>

        {/* Add new term */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Term to blacklist (e.g., central business district)"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onKeyDown={(e) => e.key === 'Enter' && addTerm()}
            />
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as 'contains' | 'exact' | 'regex')}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="contains">Contains</option>
              <option value="exact">Exact Word</option>
              <option value="regex">Regex</option>
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Reason (e.g., 'CBD acronym - urban planning')"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded"
              />
              Case sensitive
            </label>
            <button
              onClick={addTerm}
              disabled={saving || !newTerm.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
            >
              {saving ? 'Adding...' : 'Add Term'}
            </button>
          </div>
        </div>

        {/* Match type explanation */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Match types:</strong>
          <ul className="mt-1 ml-4 list-disc">
            <li><strong>Contains</strong> — Matches if term appears anywhere in title/abstract</li>
            <li><strong>Exact Word</strong> — Matches only whole words (won&apos;t match &quot;CBDA&quot; when blacklisting &quot;CBD&quot;)</li>
            <li><strong>Regex</strong> — Advanced pattern matching for complex rules</li>
          </ul>
        </div>

        {/* Existing terms */}
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
          </div>
        ) : terms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No blacklist terms yet</p>
            <p className="text-sm mt-1">Add terms above to start filtering false positives</p>
          </div>
        ) : (
          <div className="space-y-2">
            {terms.map((term) => (
              <div
                key={term.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{term.term}</span>
                  <span className={`text-xs ml-2 px-2 py-0.5 rounded ${
                    term.match_type === 'contains' ? 'bg-blue-100 text-blue-700' :
                    term.match_type === 'exact' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {term.match_type}
                  </span>
                  {term.case_sensitive && (
                    <span className="text-xs ml-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                      case-sensitive
                    </span>
                  )}
                  {term.reason && (
                    <span className="text-sm text-gray-500 ml-2">— {term.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => deleteTerm(term.id)}
                  className="text-red-600 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Bulk Actions</h2>

        {/* Pending Studies */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Pending Studies</h3>
          <p className="text-sm text-gray-600 mb-3">
            Auto-reject pending studies that match blacklist terms.
          </p>
          <button
            onClick={applyBlacklistToExisting}
            disabled={applying || terms.length === 0}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply Blacklist to Pending Studies'}
          </button>

          {terms.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Add blacklist terms above before applying.
            </p>
          )}

          {applyResult && (
            <div className={`mt-3 p-3 rounded-lg ${
              applyResult.rejected > 0 ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-600'
            }`}>
              {applyResult.rejected > 0 ? (
                <>Rejected <strong>{applyResult.rejected}</strong> of {applyResult.checked} pending studies</>
              ) : (
                <>Checked {applyResult.checked} studies — no matches found</>
              )}
            </div>
          )}
        </div>

        {/* Approved Studies */}
        <div className="pt-6 border-t">
          <h3 className="font-medium text-gray-900 mb-2">Approved Studies</h3>
          <p className="text-sm text-gray-600 mb-3">
            Check already-approved studies against the blacklist. Matches will be flagged for manual review, not auto-rejected.
          </p>
          <button
            onClick={checkApprovedStudies}
            disabled={scanningApproved || terms.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {scanningApproved ? 'Checking...' : 'Check Approved Studies'}
          </button>

          {approvedResult && (
            <div className={`mt-3 p-3 rounded-lg ${
              approvedResult.found > 0 || flaggedStudies.length > 0 ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              {approvedResult.found > 0 || flaggedStudies.length > 0 ? (
                <div>
                  <p className="text-red-800">
                    Found <strong>{approvedResult.found}</strong> approved studies matching blacklist terms
                    (out of {approvedResult.checked} total)
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Checked {approvedResult.checked} approved studies — no matches found
                </p>
              )}
            </div>
          )}

          {/* Flagged Studies with Action Buttons */}
          {flaggedStudies.length > 0 && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium text-red-700">
                Flagged studies ({flaggedStudies.length} remaining):
              </p>
              {flaggedStudies.map((study) => (
                <div
                  key={study.id}
                  className="p-4 bg-white border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2">
                        {study.title}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Matched: &quot;{study.matchedTerm}&quot;
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`/research/study/${study.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDismissFlag(study.id)}
                        disabled={processingId === study.id}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleRejectStudy(study.id)}
                        disabled={processingId === study.id}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Common False Positives Reference */}
      <div className="mt-6 bg-gray-50 rounded-lg border p-6">
        <h3 className="font-semibold mb-3">Common False Positives to Consider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-white rounded">
            <strong>central business district</strong> — Urban planning
          </div>
          <div className="p-2 bg-white rounded">
            <strong>convention on biological diversity</strong> — Environmental treaty
          </div>
          <div className="p-2 bg-white rounded">
            <strong>compulsive buying disorder</strong> — Psychology
          </div>
          <div className="p-2 bg-white rounded">
            <strong>corticobasal degeneration</strong> — Neurology (different CBD)
          </div>
          <div className="p-2 bg-white rounded">
            <strong>common bile duct</strong> — Anatomy
          </div>
          <div className="p-2 bg-white rounded">
            <strong>closed brain damage</strong> — Medical
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Click on any term to add it to the blacklist (coming soon)
        </p>
      </div>
    </div>
  );
}
