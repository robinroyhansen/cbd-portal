'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ToneSlider, ToneType } from '@/components/admin/ToneSlider';
import { AdjustReviewModal } from '@/components/admin/AdjustReviewModal';

// Types for adjust review feature
interface ScoreHistory {
  score: number;
  sub_scores: Record<string, number>;
  timestamp: number;
}

interface SectionVersion {
  text: string;
  timestamp: number;
}

interface AdjustModalState {
  isOpen: boolean;
  criterionId: string;
  criterionName: string;
  oldScore: number;
  newScore: number;
  maxPoints: number;
  originalText: string;
  adjustedText: string;
  tone: ToneType;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  website_domain: string | null;
  logo_url: string | null;
  headquarters_country: string | null;
  founded_year: number | null;
  short_description: string | null;
}

interface SubCriterion {
  id: string;
  name: string;
  max_points: number;
  description: string;
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  max_points: number;
  display_order: number;
  subcriteria: SubCriterion[];
}

interface ReviewScore {
  criterion_id: string;
  score: number;
  sub_scores: Record<string, number> | null;
  ai_reasoning: string | null;
  author_notes: string | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Review {
  id: string;
  brand_id: string;
  author_id: string | null;
  overall_score: number;
  summary: string | null;
  full_review: string | null;
  pros: string[];
  cons: string[];
  verdict: string | null;
  sources_researched: string[];
  meta_title: string | null;
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  last_reviewed_at: string | null;
  kb_brands: Brand;
  kb_authors: Author | null;
  kb_brand_review_scores: ReviewScore[];
}

export default function BrandReviewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [review, setReview] = useState<Review | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    author_id: '',
    summary: '',
    full_review: '',
    pros: [''],
    cons: [''],
    verdict: '',
    sources_researched: [''],
    meta_title: '',
    meta_description: '',
    is_published: false
  });

  const [scores, setScores] = useState<Record<string, { score: number; sub_scores: Record<string, number>; ai_reasoning: string; author_notes: string }>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Adjust Review feature state
  const [originalScores, setOriginalScores] = useState<Record<string, { score: number; sub_scores: Record<string, number> }>>({});
  const [sectionTones, setSectionTones] = useState<Record<string, ToneType>>({});
  const [adjustingSection, setAdjustingSection] = useState<string | null>(null);
  const [adjustModal, setAdjustModal] = useState<AdjustModalState>({
    isOpen: false,
    criterionId: '',
    criterionName: '',
    oldScore: 0,
    newScore: 0,
    maxPoints: 0,
    originalText: '',
    adjustedText: '',
    tone: 'balanced'
  });

  // Undo functionality
  const [sectionHistory, setSectionHistory] = useState<Record<string, SectionVersion[]>>({});
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const undoTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch brand info first
      const brandRes = await fetch(`/api/admin/brands?q=`);
      const brandData = await brandRes.json();
      const foundBrand = brandData.brands?.find((b: Brand) => b.id === brandId);

      if (!foundBrand) {
        setError('Brand not found');
        setLoading(false);
        return;
      }

      setBrand(foundBrand);

      // Fetch review and criteria
      const reviewRes = await fetch(`/api/admin/brand-reviews?brand_id=${brandId}`);
      const reviewData = await reviewRes.json();

      setCriteria(reviewData.criteria || []);

      // Fetch authors for dropdown
      const authorsRes = await fetch('/api/admin/authors');
      const authorsData = await authorsRes.json();
      setAuthors(authorsData.authors || []);

      // Initialize scores from criteria
      const initialScores: Record<string, { score: number; sub_scores: Record<string, number>; ai_reasoning: string; author_notes: string }> = {};
      reviewData.criteria?.forEach((c: Criterion) => {
        const emptySubScores: Record<string, number> = {};
        c.subcriteria?.forEach(sub => {
          emptySubScores[sub.id] = 0;
        });
        initialScores[c.id] = { score: 0, sub_scores: emptySubScores, ai_reasoning: '', author_notes: '' };
      });

      if (reviewData.review) {
        setReview(reviewData.review);

        // Populate form with existing review data
        setFormData({
          author_id: reviewData.review.author_id || '',
          summary: reviewData.review.summary || '',
          full_review: reviewData.review.full_review || '',
          pros: reviewData.review.pros?.length > 0 ? reviewData.review.pros : [''],
          cons: reviewData.review.cons?.length > 0 ? reviewData.review.cons : [''],
          verdict: reviewData.review.verdict || '',
          sources_researched: reviewData.review.sources_researched?.length > 0 ? reviewData.review.sources_researched : [''],
          meta_title: reviewData.review.meta_title || '',
          meta_description: reviewData.review.meta_description || '',
          is_published: reviewData.review.is_published || false
        });

        // Populate scores from existing review
        reviewData.review.kb_brand_review_scores?.forEach((s: ReviewScore) => {
          initialScores[s.criterion_id] = {
            score: s.score,
            sub_scores: s.sub_scores || initialScores[s.criterion_id]?.sub_scores || {},
            ai_reasoning: s.ai_reasoning || '',
            author_notes: s.author_notes || ''
          };
        });
      }

      setScores(initialScores);

      // Store original scores for mismatch detection
      const origScores: Record<string, { score: number; sub_scores: Record<string, number> }> = {};
      Object.entries(initialScores).forEach(([id, s]) => {
        origScores[id] = { score: s.score, sub_scores: { ...s.sub_scores } };
      });
      setOriginalScores(origScores);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, s) => sum + (s.score || 0), 0);
  };

  const handleScoreChange = (criterionId: string, value: number, maxPoints: number) => {
    const clampedValue = Math.min(Math.max(0, value), maxPoints);
    setScores(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], score: clampedValue }
    }));
  };

  const handleArrayFieldChange = (field: 'pros' | 'cons' | 'sources_researched', index: number, value: string) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayField = (field: 'pros' | 'cons' | 'sources_researched') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'pros' | 'cons' | 'sources_researched', index: number) => {
    setFormData(prev => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length > 0 ? arr : [''] };
    });
  };

  const handleSave = async (publish: boolean = false) => {
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const scoresArray = Object.entries(scores).map(([criterion_id, s]) => ({
        criterion_id,
        score: s.score,
        sub_scores: s.sub_scores || {},
        ai_reasoning: s.ai_reasoning || null,
        author_notes: s.author_notes || null
      }));

      const payload = {
        ...(review ? { id: review.id } : { brand_id: brandId }),
        author_id: formData.author_id || null,
        summary: formData.summary.trim() || null,
        full_review: formData.full_review.trim() || null,
        pros: formData.pros.filter(p => p.trim()),
        cons: formData.cons.filter(c => c.trim()),
        verdict: formData.verdict.trim() || null,
        sources_researched: formData.sources_researched.filter(s => s.trim()),
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        is_published: publish ? true : formData.is_published,
        scores: scoresArray
      };

      const res = await fetch('/api/admin/brand-reviews', {
        method: review ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save review');
      }

      setSuccessMessage(publish ? 'Review published successfully!' : 'Review saved successfully!');
      setReview(data.review);
      setFormData(prev => ({ ...prev, is_published: data.review.is_published }));

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const generateAIReview = async () => {
    if (!brand?.website_url) {
      setError('Brand must have a website URL to generate AI review');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/brand-reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate review');
      }

      // Update scores with AI-generated values
      const newScores = { ...scores };
      data.data.scores.forEach((s: { criterion_id: string; score: number; sub_scores?: { id: string; score: number }[]; reasoning: string }) => {
        if (newScores[s.criterion_id]) {
          // Convert sub_scores array to Record<string, number>
          const subScoresMap: Record<string, number> = {};
          if (s.sub_scores && Array.isArray(s.sub_scores)) {
            s.sub_scores.forEach(sub => {
              subScoresMap[sub.id] = sub.score;
            });
          }
          newScores[s.criterion_id] = {
            ...newScores[s.criterion_id],
            score: s.score,
            sub_scores: subScoresMap,
            ai_reasoning: s.reasoning
          };
        }
      });
      setScores(newScores);

      // Update form data with generated content
      setFormData(prev => ({
        ...prev,
        summary: data.data.summary || prev.summary,
        full_review: data.data.full_review || prev.full_review,
        pros: data.data.pros?.length > 0 ? data.data.pros : prev.pros,
        cons: data.data.cons?.length > 0 ? data.data.cons : prev.cons,
        verdict: data.data.verdict || prev.verdict
      }));

      setSuccessMessage('AI review generated successfully! Review and edit the content before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI review');
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Adjust Review helper functions
  const hasScoreChanged = (criterionId: string): boolean => {
    const original = originalScores[criterionId];
    const current = scores[criterionId];
    if (!original || !current) return false;
    return original.score !== current.score;
  };

  const getScoreChange = (criterionId: string): { direction: 'up' | 'down' | 'none'; diff: number } => {
    const original = originalScores[criterionId];
    const current = scores[criterionId];
    if (!original || !current) return { direction: 'none', diff: 0 };
    const diff = current.score - original.score;
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'none',
      diff: Math.abs(diff)
    };
  };

  const getChangedSections = (): string[] => {
    return Object.keys(scores).filter(id => hasScoreChanged(id) && !dismissedWarnings.has(id));
  };

  const extractSectionText = (criterionId: string, criterionName: string): string => {
    const fullReview = formData.full_review;
    if (!fullReview) return '';

    // Try to find the section by heading pattern: ## Category Name — X/Y
    const escapedName = criterionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(
      `(## ${escapedName}\\s*[—-]\\s*\\d+\\/\\d+[\\s\\S]*?)(?=## |$)`,
      'i'
    );
    const match = fullReview.match(sectionRegex);
    return match ? match[1].trim() : '';
  };

  const updateSectionText = (criterionId: string, criterionName: string, newText: string) => {
    const fullReview = formData.full_review;
    if (!fullReview) return;

    const escapedName = criterionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(
      `(## ${escapedName}\\s*[—-]\\s*\\d+\\/\\d+[\\s\\S]*?)(?=## |$)`,
      'gi'
    );

    const updatedReview = fullReview.replace(sectionRegex, newText + '\n\n');
    setFormData(prev => ({ ...prev, full_review: updatedReview }));
  };

  const handleAdjustSection = async (criterionId: string, criterionName: string, maxPoints: number) => {
    setAdjustingSection(criterionId);
    setError(null);

    const originalScore = originalScores[criterionId]?.score || 0;
    const currentScore = scores[criterionId]?.score || 0;
    const currentSubScores = scores[criterionId]?.sub_scores || {};
    const tone = sectionTones[criterionId] || 'balanced';
    const currentText = extractSectionText(criterionId, criterionName);

    if (!currentText) {
      setError(`Could not find section for "${criterionName}" in the review. Generate a full review first.`);
      setAdjustingSection(null);
      return;
    }

    try {
      const res = await fetch('/api/admin/brand-reviews/adjust-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          criterion_id: criterionId,
          criterion_name: criterionName,
          old_score: originalScore,
          new_score: currentScore,
          max_points: maxPoints,
          sub_scores: Object.entries(currentSubScores).map(([id, score]) => ({ id, score })),
          current_text: currentText,
          tone
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to adjust section');
      }

      // Open preview modal
      setAdjustModal({
        isOpen: true,
        criterionId,
        criterionName,
        oldScore: originalScore,
        newScore: currentScore,
        maxPoints,
        originalText: currentText,
        adjustedText: data.data.adjusted_text,
        tone
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust section');
    } finally {
      setAdjustingSection(null);
    }
  };

  const handleAcceptAdjustment = () => {
    const { criterionId, criterionName, originalText, adjustedText } = adjustModal;

    // Store previous version for undo
    setSectionHistory(prev => {
      const history = prev[criterionId] || [];
      const newHistory = [{ text: originalText, timestamp: Date.now() }, ...history].slice(0, 3);
      return { ...prev, [criterionId]: newHistory };
    });

    // Update the section text
    updateSectionText(criterionId, criterionName, adjustedText);

    // Update original scores to match current (clears warning)
    setOriginalScores(prev => ({
      ...prev,
      [criterionId]: {
        score: scores[criterionId]?.score || 0,
        sub_scores: { ...scores[criterionId]?.sub_scores } || {}
      }
    }));

    // Set up undo timer (1 minute)
    if (undoTimers.current[criterionId]) {
      clearTimeout(undoTimers.current[criterionId]);
    }
    undoTimers.current[criterionId] = setTimeout(() => {
      setSectionHistory(prev => {
        const { [criterionId]: _, ...rest } = prev;
        return rest;
      });
    }, 60000);

    // Close modal
    setAdjustModal(prev => ({ ...prev, isOpen: false }));
    setSuccessMessage(`"${criterionName}" section updated successfully!`);
  };

  const handleRegenerateAdjustment = async (newTone: ToneType) => {
    const { criterionId, criterionName, maxPoints, originalText } = adjustModal;
    const originalScore = originalScores[criterionId]?.score || 0;
    const currentScore = scores[criterionId]?.score || 0;
    const currentSubScores = scores[criterionId]?.sub_scores || {};

    setAdjustingSection(criterionId);

    try {
      const res = await fetch('/api/admin/brand-reviews/adjust-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          criterion_id: criterionId,
          criterion_name: criterionName,
          old_score: originalScore,
          new_score: currentScore,
          max_points: maxPoints,
          sub_scores: Object.entries(currentSubScores).map(([id, score]) => ({ id, score })),
          current_text: originalText,
          tone: newTone
        })
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to regenerate');
      }

      setAdjustModal(prev => ({
        ...prev,
        adjustedText: data.data.adjusted_text,
        tone: newTone
      }));

      setSectionTones(prev => ({ ...prev, [criterionId]: newTone }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setAdjustingSection(null);
    }
  };

  const handleUndo = (criterionId: string, criterionName: string) => {
    const history = sectionHistory[criterionId];
    if (!history || history.length === 0) return;

    const previousVersion = history[0];
    updateSectionText(criterionId, criterionName, previousVersion.text);

    // Remove from history
    setSectionHistory(prev => ({
      ...prev,
      [criterionId]: history.slice(1)
    }));

    // Clear timer
    if (undoTimers.current[criterionId]) {
      clearTimeout(undoTimers.current[criterionId]);
      delete undoTimers.current[criterionId];
    }
  };

  const handleDismissWarning = (criterionId: string) => {
    setDismissedWarnings(prev => new Set([...prev, criterionId]));
  };

  const handleBatchAdjust = async () => {
    const changedSections = getChangedSections();
    if (changedSections.length === 0) return;

    // For now, process them sequentially
    for (const criterionId of changedSections) {
      const criterion = criteria.find(c => c.id === criterionId);
      if (criterion) {
        await handleAdjustSection(criterionId, criterion.name, criterion.max_points);
        // Wait for user to accept before continuing - for now just process first one
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !brand) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <Link href="/admin/brands" className="mt-4 inline-block text-green-600 hover:underline">
            Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {brand?.logo_url ? (
            <img src={brand.logo_url} alt={brand.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400">
              {brand?.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{brand?.name} Review</h1>
            <div className="flex items-center gap-4 mt-1">
              {brand?.website_domain && (
                <span className="text-gray-500">{brand.website_domain}</span>
              )}
              {brand?.headquarters_country && (
                <span className="text-gray-500">• {brand.headquarters_country}</span>
              )}
              {brand?.founded_year && (
                <span className="text-gray-500">• Est. {brand.founded_year}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={generateAIReview}
            disabled={generating || !brand?.website_url}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title={!brand?.website_url ? 'Brand needs a website URL' : 'Generate review using AI'}
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Review
              </>
            )}
          </button>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">{calculateTotalScore()}/100</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {/* Batch Rewrite Banner */}
      {getChangedSections().length >= 2 && formData.full_review && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-amber-800">
                {getChangedSections().length} sections have changed scores
              </div>
              <div className="text-sm text-amber-600">
                Review text may no longer match the current scores
              </div>
            </div>
          </div>
          <button
            onClick={handleBatchAdjust}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Adjust All Changed Sections
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setShowPreview(false)}
            className={`pb-3 px-1 border-b-2 font-medium ${
              !showPreview ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Edit Review
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`pb-3 px-1 border-b-2 font-medium ${
              showPreview ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{brand?.name} Review</h2>

          {/* Score Breakdown Preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {criteria.map(c => (
                <div key={c.id} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-gray-700">{c.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(scores[c.id]?.score || 0, c.max_points)}`}
                      style={{ width: `${((scores[c.id]?.score || 0) / c.max_points) * 100}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {scores[c.id]?.score || 0}/{c.max_points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {formData.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-gray-700">{formData.summary}</p>
            </div>
          )}

          {/* Full Review */}
          {formData.full_review && (
            <div className="mb-6 prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">Full Review</h3>
              <ReactMarkdown>{formData.full_review}</ReactMarkdown>
            </div>
          )}

          {/* Pros and Cons */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {formData.pros.filter(p => p.trim()).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-700">Pros</h3>
                <ul className="space-y-1">
                  {formData.pros.filter(p => p.trim()).map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.cons.filter(c => c.trim()).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">Cons</h3>
                <ul className="space-y-1">
                  {formData.cons.filter(c => c.trim()).map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verdict */}
          {formData.verdict && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Verdict</h3>
              <p className="text-gray-700">{formData.verdict}</p>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-8">
          {/* Score Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Score Breakdown (100 points total)</h2>

            <div className="space-y-6">
              {criteria.map(criterion => {
                const scoreChange = getScoreChange(criterion.id);
                const showWarning = hasScoreChanged(criterion.id) && !dismissedWarnings.has(criterion.id) && formData.full_review;
                const hasUndo = sectionHistory[criterion.id]?.length > 0;

                return (
                <div key={criterion.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                        <p className="text-sm text-gray-500">{criterion.description}</p>
                      </div>
                      {/* Score Change Warning Badge */}
                      {showWarning && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Score changed (was {originalScores[criterion.id]?.score}, now {scores[criterion.id]?.score})
                          </span>
                          <button
                            onClick={() => handleDismissWarning(criterion.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Dismiss"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={criterion.max_points}
                        value={scores[criterion.id]?.score || 0}
                        onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0, criterion.max_points)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-medium"
                      />
                      <span className="text-gray-500">/ {criterion.max_points}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreColor(scores[criterion.id]?.score || 0, criterion.max_points)}`}
                      style={{ width: `${((scores[criterion.id]?.score || 0) / criterion.max_points) * 100}%` }}
                    />
                  </div>

                  {/* Subcriteria with editable scores */}
                  {criterion.subcriteria && criterion.subcriteria.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Sub-scores:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {criterion.subcriteria.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between gap-2 bg-white rounded px-2 py-1">
                            <span className="text-gray-600 truncate" title={sub.description}>{sub.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={sub.max_points}
                                value={scores[criterion.id]?.sub_scores?.[sub.id] || 0}
                                onChange={(e) => {
                                  const newValue = Math.min(Math.max(0, parseInt(e.target.value) || 0), sub.max_points);
                                  setScores(prev => {
                                    const newSubScores = { ...prev[criterion.id]?.sub_scores, [sub.id]: newValue };
                                    const newTotal = Object.values(newSubScores).reduce((sum, v) => sum + (v || 0), 0);
                                    return {
                                      ...prev,
                                      [criterion.id]: {
                                        ...prev[criterion.id],
                                        sub_scores: newSubScores,
                                        score: Math.min(newTotal, criterion.max_points)
                                      }
                                    };
                                  });
                                }}
                                className="w-12 px-1 py-0.5 border border-gray-200 rounded text-center text-sm"
                              />
                              <span className="text-gray-400">/{sub.max_points}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning (if available) */}
                  {scores[criterion.id]?.ai_reasoning && (
                    <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Reasoning
                      </div>
                      <p className="text-sm text-purple-900">{scores[criterion.id].ai_reasoning}</p>
                    </div>
                  )}

                  {/* Author notes */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
                    <input
                      type="text"
                      value={scores[criterion.id]?.author_notes || ''}
                      onChange={(e) => setScores(prev => ({
                        ...prev,
                        [criterion.id]: { ...prev[criterion.id], author_notes: e.target.value }
                      }))}
                      placeholder="Add notes about this score..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>

                  {/* Adjust Review Section - Only show when score changed and review exists */}
                  {formData.full_review && (hasScoreChanged(criterion.id) || hasUndo) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4">
                        {/* Tone Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Tone:</span>
                          <ToneSlider
                            value={sectionTones[criterion.id] || 'balanced'}
                            onChange={(tone) => setSectionTones(prev => ({ ...prev, [criterion.id]: tone }))}
                            compact
                          />
                        </div>

                        {/* Adjust Button */}
                        <div className="flex items-center gap-2">
                          {hasUndo && (
                            <button
                              onClick={() => handleUndo(criterion.id, criterion.name)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Undo
                            </button>
                          )}

                          {scoreChange.direction !== 'none' && (
                            <button
                              onClick={() => handleAdjustSection(criterion.id, criterion.name, criterion.max_points)}
                              disabled={adjustingSection === criterion.id}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                scoreChange.direction === 'down'
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {adjustingSection === criterion.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Adjusting...
                                </>
                              ) : (
                                <>
                                  Adjust Review {scoreChange.direction === 'down' ? '↓' : '↑'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>

          {/* Review Content Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Review Content</h2>

            <div className="space-y-6">
              {/* Author Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Author
                </label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData({ ...formData, author_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select an author</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                  <span className="text-gray-500 font-normal ml-1">(brief overview for listings)</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="A 2-3 sentence summary of the review..."
                />
              </div>

              {/* Full Review */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Review
                  <span className="text-gray-500 font-normal ml-1">(supports markdown)</span>
                </label>
                <textarea
                  value={formData.full_review}
                  onChange={(e) => setFormData({ ...formData, full_review: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  placeholder="Detailed review content with markdown formatting..."
                />
              </div>

              {/* Pros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pros</label>
                {formData.pros.map((pro, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => handleArrayFieldChange('pros', i, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Add a pro..."
                    />
                    {formData.pros.length > 1 && (
                      <button
                        onClick={() => removeArrayField('pros', i)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('pros')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add Pro
                </button>
              </div>

              {/* Cons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cons</label>
                {formData.cons.map((con, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => handleArrayFieldChange('cons', i, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Add a con..."
                    />
                    {formData.cons.length > 1 && (
                      <button
                        onClick={() => removeArrayField('cons', i)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField('cons')}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  + Add Con
                </button>
              </div>

              {/* Verdict */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verdict</label>
                <textarea
                  value={formData.verdict}
                  onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Final verdict and recommendation..."
                />
              </div>
            </div>
          </div>

          {/* SEO & Meta */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                  <span className="text-gray-500 font-normal ml-1">(max 60 chars)</span>
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={`${brand?.name} Review 2024 - Score ${calculateTotalScore()}/100`}
                />
                <div className="text-xs text-gray-400 mt-1">{formData.meta_title.length}/60</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                  <span className="text-gray-500 font-normal ml-1">(max 155 chars)</span>
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  maxLength={155}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Independent review of brand's CBD products..."
                />
                <div className="text-xs text-gray-400 mt-1">{formData.meta_description.length}/155</div>
              </div>
            </div>
          </div>

          {/* Internal: Sources Researched */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-2">Sources Researched</h2>
            <p className="text-sm text-gray-500 mb-4">Internal only - these URLs are not displayed publicly</p>

            {formData.sources_researched.map((source, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={source}
                  onChange={(e) => handleArrayFieldChange('sources_researched', i, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
                {formData.sources_researched.length > 1 && (
                  <button
                    onClick={() => removeArrayField('sources_researched', i)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayField('sources_researched')}
              className="text-sm text-green-600 hover:text-green-700"
            >
              + Add Source
            </button>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/brands"
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Back to Brands
                </Link>

                {review?.is_published && brand?.slug && (
                  <Link
                    href={`/reviews/${brand.slug}`}
                    target="_blank"
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    View Public Page
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : formData.is_published ? 'Update & Publish' : 'Save & Publish'}
                </button>
              </div>
            </div>

            {formData.is_published && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                This review is currently published and visible on the public site.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjust Review Modal */}
      <AdjustReviewModal
        isOpen={adjustModal.isOpen}
        onClose={() => setAdjustModal(prev => ({ ...prev, isOpen: false }))}
        criterionName={adjustModal.criterionName}
        oldScore={adjustModal.oldScore}
        newScore={adjustModal.newScore}
        maxPoints={adjustModal.maxPoints}
        originalText={adjustModal.originalText}
        adjustedText={adjustModal.adjustedText}
        tone={adjustModal.tone}
        onAccept={handleAcceptAdjustment}
        onRegenerate={handleRegenerateAdjustment}
        isRegenerating={adjustingSection === adjustModal.criterionId}
      />
    </div>
  );
}
