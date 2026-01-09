'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

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

  const [scores, setScores] = useState<Record<string, { score: number; ai_reasoning: string; author_notes: string }>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      const initialScores: Record<string, { score: number; ai_reasoning: string; author_notes: string }> = {};
      reviewData.criteria?.forEach((c: Criterion) => {
        initialScores[c.id] = { score: 0, ai_reasoning: '', author_notes: '' };
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
            ai_reasoning: s.ai_reasoning || '',
            author_notes: s.author_notes || ''
          };
        });
      }

      setScores(initialScores);
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
      data.data.scores.forEach((s: { criterion_id: string; score: number; reasoning: string }) => {
        if (newScores[s.criterion_id]) {
          newScores[s.criterion_id] = {
            ...newScores[s.criterion_id],
            score: s.score,
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
              {criteria.map(criterion => (
                <div key={criterion.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                      <p className="text-sm text-gray-500">{criterion.description}</p>
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

                  {/* Subcriteria reference */}
                  {criterion.subcriteria && criterion.subcriteria.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-medium text-gray-500 mb-2">Subcriteria:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {criterion.subcriteria.map(sub => (
                          <div key={sub.id} className="flex justify-between">
                            <span className="text-gray-600">{sub.name}</span>
                            <span className="text-gray-400">{sub.max_points} pts</span>
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
                </div>
              ))}
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
    </div>
  );
}
