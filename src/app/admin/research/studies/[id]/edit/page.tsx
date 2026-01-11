'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  assessStudyQuality,
  detectStudyType,
  StudyType
} from '@/lib/quality-tiers';
import { extractSampleInfo } from '@/lib/study-analysis';

interface KeyFinding {
  text: string;
  type: 'finding' | 'limitation';
}

interface Study {
  id: string;
  title: string;
  slug: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  plain_summary?: string;
  url: string;
  doi?: string;
  source_site: string;
  relevance_score: number;
  relevant_topics: string[];
  status: string;
  meta_title?: string;
  meta_description?: string;
  study_type?: string;
  study_quality?: string;
  country?: string;
  key_findings?: KeyFinding[];
  display_title?: string;
}

const STUDY_TYPES = [
  'Randomized Controlled Trial',
  'Meta-Analysis',
  'Systematic Review',
  'Clinical Trial',
  'Cohort Study',
  'Case-Control Study',
  'Observational Study',
  'Case Report',
  'In Vitro Study',
  'Animal Study',
  'Review Article',
  'Other'
];

const STUDY_QUALITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

const AVAILABLE_TOPICS = [
  'anxiety', 'depression', 'ptsd', 'sleep', 'epilepsy', 'pain',
  'inflammation', 'cancer', 'nausea', 'skin', 'arthritis', 'stress',
  'neurological', 'addiction', 'diabetes', 'heart', 'autism', 'adhd',
  'schizophrenia', 'parkinsons', 'alzheimers', 'fibromyalgia', 'migraines',
  'crohns', 'ibs', 'acne', 'psoriasis', 'eczema', 'obesity', 'athletic'
].sort();

// Character count color helper
function getCharCountColor(current: number, min: number, ideal: number, max: number): string {
  if (current === 0) return 'text-red-500';
  if (current >= min && current <= max) {
    if (current >= ideal - 5 && current <= ideal + 5) return 'text-green-600';
    return 'text-amber-600';
  }
  return 'text-red-500';
}

export default function EditStudyPage() {
  const params = useParams();
  const router = useRouter();
  const studyId = params.id as string;

  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculated values
  const [qualityScore, setQualityScore] = useState(0);
  const [sampleInfo, setSampleInfo] = useState<{ size: number; label: string } | null>(null);
  const [studyTypeName, setStudyTypeName] = useState('');

  // Form state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [displayTitle, setDisplayTitle] = useState('');
  const [plainSummary, setPlainSummary] = useState('');
  const [studyType, setStudyType] = useState('');
  const [studyQuality, setStudyQuality] = useState('');
  const [country, setCountry] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [keyFindings, setKeyFindings] = useState<KeyFinding[]>([]);

  const supabase = createClient();

  const fetchStudy = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('id', studyId)
      .single();

    if (!error && data) {
      setStudy(data);
      setMetaTitle(data.meta_title || '');
      setMetaDescription(data.meta_description || '');
      setDisplayTitle(data.display_title || '');
      setPlainSummary(data.plain_summary || '');
      setStudyType(data.study_type || '');
      setStudyQuality(data.study_quality || '');
      setCountry(data.country || '');
      setTopics(data.relevant_topics || []);
      setKeyFindings(data.key_findings || []);

      // Calculate quality score
      const assessment = assessStudyQuality(data);
      setQualityScore(assessment.score);

      // Extract sample info
      const studyText = `${data.title || ''} ${data.abstract || ''}`;
      const sample = extractSampleInfo(studyText);
      setSampleInfo(sample);

      // Detect study type
      const detected = detectStudyType(data);
      const typeName =
        detected === StudyType.RCT ? 'Randomized Controlled Trial' :
        detected === StudyType.META_ANALYSIS ? 'Meta-Analysis' :
        detected === StudyType.SYSTEMATIC_REVIEW ? 'Systematic Review' :
        detected === StudyType.CLINICAL_TRIAL ? 'Clinical Trial' :
        detected === StudyType.COHORT ? 'Cohort Study' :
        detected === StudyType.IN_VITRO ? 'In Vitro Study' :
        detected === StudyType.ANIMAL ? 'Animal Study' :
        'Study';
      setStudyTypeName(typeName);
    } else {
      console.error('Error fetching study:', error);
      setMessage({ type: 'error', text: 'Failed to load study' });
    }
    setLoading(false);
  }, [supabase, studyId]);

  useEffect(() => {
    fetchStudy();
  }, [fetchStudy]);

  const handleSave = async () => {
    if (!study) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('kb_research_queue')
      .update({
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        display_title: displayTitle || null,
        plain_summary: plainSummary || null,
        study_type: studyType || null,
        study_quality: studyQuality || null,
        country: country || null,
        relevant_topics: topics,
        key_findings: keyFindings.length > 0 ? keyFindings : null,
      })
      .eq('id', studyId);

    if (error) {
      console.error('Error saving study:', error);
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } else {
      setMessage({ type: 'success', text: 'Changes saved successfully!' });
    }
    setSaving(false);
  };

  const handleGenerate = async (field: string) => {
    if (!study) return;

    setGeneratingField(field);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/research/studies/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyId: study.id, field })
      });

      if (response.ok) {
        const data = await response.json();

        // Update the appropriate field
        switch (field) {
          case 'meta_title':
            setMetaTitle(data.content);
            break;
          case 'meta_description':
            setMetaDescription(data.content);
            break;
          case 'display_title':
            setDisplayTitle(data.content);
            break;
          case 'plain_summary':
            setPlainSummary(data.content);
            break;
          case 'key_findings':
            setKeyFindings(data.content.filter((f: KeyFinding) => f.type === 'finding'));
            break;
          case 'limitations':
            // Add to existing findings
            const newLimitations = data.content.filter((f: KeyFinding) => f.type === 'limitation');
            setKeyFindings(prev => [...prev.filter(f => f.type === 'finding'), ...newLimitations]);
            break;
        }
        setMessage({ type: 'success', text: `${field.replace('_', ' ')} generated!` });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to generate' });
      }
    } catch (error) {
      console.error('Error generating:', error);
      setMessage({ type: 'error', text: 'Failed to generate content' });
    }
    setGeneratingField(null);
  };

  const addTopic = (topic: string) => {
    if (topic && !topics.includes(topic)) {
      setTopics([...topics, topic]);
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const moveTopic = (index: number, direction: 'up' | 'down') => {
    const newTopics = [...topics];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newTopics.length) {
      [newTopics[index], newTopics[newIndex]] = [newTopics[newIndex], newTopics[index]];
      setTopics(newTopics);
    }
  };

  const addFinding = (type: 'finding' | 'limitation') => {
    setKeyFindings([...keyFindings, { text: '', type }]);
  };

  const updateFinding = (index: number, text: string) => {
    const updated = [...keyFindings];
    updated[index].text = text;
    setKeyFindings(updated);
  };

  const removeFinding = (index: number) => {
    setKeyFindings(keyFindings.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Study not found</p>
          <Link href="/admin/research/studies" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Studies
          </Link>
        </div>
      </div>
    );
  }

  const findings = keyFindings.filter(f => f.type === 'finding');
  const limitations = keyFindings.filter(f => f.type === 'limitation');

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/research/studies"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back to Studies
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Edit Study</h1>
        </div>
        <Link
          href={`/research/study/${study.slug}`}
          target="_blank"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          View Page ↗
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* STUDY INFO (Read-only) */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Study Info</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Original Title</label>
            <p className="text-gray-900 text-sm">{study.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Authors</label>
              <p className="text-gray-900 text-sm">{study.authors || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Year</label>
              <p className="text-gray-900 text-sm">{study.year || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Source</label>
              <p className="text-gray-900 text-sm">{study.source_site}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Primary Topic</label>
              <p className="text-gray-900 text-sm capitalize">{topics[0] || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Quality Score</label>
              <p className={`text-sm font-medium ${
                qualityScore >= 70 ? 'text-green-600' :
                qualityScore >= 40 ? 'text-amber-600' : 'text-red-600'
              }`}>{qualityScore}/100</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Sample Size</label>
              <p className="text-gray-900 text-sm">{sampleInfo?.label || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO SETTINGS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">SEO Settings</h2>

        {/* Meta Title */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Meta Title <span className="font-normal text-gray-400">(50-60 characters)</span>
            </label>
            <button
              onClick={() => handleGenerate('meta_title')}
              disabled={generatingField === 'meta_title'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'meta_title' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="CBD for Social Anxiety: 2026 Clinical Trial | CBD Portal"
          />
          <div className={`text-xs mt-1 ${getCharCountColor(metaTitle.length, 45, 55, 65)}`}>
            {metaTitle.length}/60 {metaTitle.length >= 50 && metaTitle.length <= 60 ? '✓' : ''}
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Meta Description <span className="font-normal text-gray-400">(145-155 characters)</span>
            </label>
            <button
              onClick={() => handleGenerate('meta_description')}
              disabled={generatingField === 'meta_description'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'meta_description' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Clinical trial tested 300mg CBD on 20 adults with social anxiety. Rated 73/100 quality. Expert analysis."
          />
          <div className={`text-xs mt-1 ${getCharCountColor(metaDescription.length, 130, 150, 160)}`}>
            {metaDescription.length}/155 {metaDescription.length >= 145 && metaDescription.length <= 155 ? '✓' : ''}
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Page Content</h2>

        {/* Display Title */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Display Title (H1)</label>
            <button
              onClick={() => handleGenerate('display_title')}
              disabled={generatingField === 'display_title'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'display_title' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <input
            type="text"
            value={displayTitle}
            onChange={(e) => setDisplayTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="CBD for Social Anxiety Disorder: Clinical Trial Results"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate from original title</p>
        </div>

        {/* What You Need to Know */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">What You Need to Know</label>
            <button
              onClick={() => handleGenerate('plain_summary')}
              disabled={generatingField === 'plain_summary'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'plain_summary' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <textarea
            value={plainSummary}
            onChange={(e) => setPlainSummary(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="This clinical trial is testing whether CBD can help people with social anxiety disorder..."
          />
          <p className="text-xs text-gray-500 mt-1">Plain language summary for general audience (max 100 words)</p>
        </div>

        {/* Key Findings */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Key Findings</label>
            <button
              onClick={() => handleGenerate('key_findings')}
              disabled={generatingField === 'key_findings'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'key_findings' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <div className="space-y-2 mb-2">
            {findings.map((finding, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="text-green-500 mt-2">✓</span>
                <input
                  type="text"
                  value={finding.text}
                  onChange={(e) => {
                    const allIndex = keyFindings.findIndex(f => f === finding);
                    updateFinding(allIndex, e.target.value);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500"
                  placeholder="Key finding..."
                />
                <button
                  onClick={() => {
                    const allIndex = keyFindings.findIndex(f => f === finding);
                    removeFinding(allIndex);
                  }}
                  className="px-2 py-2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => addFinding('finding')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Finding
          </button>
        </div>

        {/* Limitations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Limitations</label>
            <button
              onClick={() => handleGenerate('limitations')}
              disabled={generatingField === 'limitations'}
              className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
            >
              {generatingField === 'limitations' ? 'Generating...' : 'Auto-generate'}
            </button>
          </div>
          <div className="space-y-2 mb-2">
            {limitations.map((limitation, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="text-amber-500 mt-2">⚠</span>
                <input
                  type="text"
                  value={limitation.text}
                  onChange={(e) => {
                    const allIndex = keyFindings.findIndex(f => f === limitation);
                    updateFinding(allIndex, e.target.value);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500"
                  placeholder="Limitation..."
                />
                <button
                  onClick={() => {
                    const allIndex = keyFindings.findIndex(f => f === limitation);
                    removeFinding(allIndex);
                  }}
                  className="px-2 py-2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => addFinding('limitation')}
            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            + Add Limitation
          </button>
        </div>
      </div>

      {/* ADDITIONAL FIELDS */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Additional Fields</h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Study Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Type</label>
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
            >
              <option value="">Auto-detected: {studyTypeName}</option>
              {STUDY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Study Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Quality</label>
            <select
              value={studyQuality}
              onChange={(e) => setStudyQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
            >
              <option value="">Auto-calculated: {qualityScore}/100</option>
              {STUDY_QUALITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Country */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Select country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics <span className="font-normal text-gray-400">(first is primary)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {topics.map((topic, index) => (
              <div
                key={topic}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  index === 0 ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {index === 0 && <span className="font-bold">1.</span>}
                <span className="capitalize">{topic}</span>
                <div className="flex gap-0.5 ml-1">
                  {index > 0 && (
                    <button onClick={() => moveTopic(index, 'up')} className="hover:text-purple-900">↑</button>
                  )}
                  {index < topics.length - 1 && (
                    <button onClick={() => moveTopic(index, 'down')} className="hover:text-purple-900">↓</button>
                  )}
                  <button onClick={() => removeTopic(topic)} className="hover:text-red-600 ml-1">×</button>
                </div>
              </div>
            ))}
          </div>
          <select
            onChange={(e) => { addTopic(e.target.value); e.target.value = ''; }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Add topic...</option>
            {AVAILABLE_TOPICS.filter(t => !topics.includes(t)).map((topic) => (
              <option key={topic} value={topic} className="capitalize">{topic}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center sticky bottom-0 bg-gray-50 -mx-8 px-8 py-4 border-t border-gray-200">
        <Link
          href="/admin/research/studies"
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
