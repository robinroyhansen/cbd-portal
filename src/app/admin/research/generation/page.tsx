'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface GenerationStats {
  totalStudies: number;
  withSummaries: number;
  withMeta: number;
  withCountry: number;
}

interface StudyForCountry {
  id: string;
  title: string;
  abstract: string | null;
  country: string | null;
  detectedCountry?: string | null;
}

type Step = 'summaries' | 'meta' | 'country';

const COUNTRIES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  CH: 'Switzerland',
  IL: 'Israel',
  BR: 'Brazil',
  CN: 'China',
  JP: 'Japan',
  KR: 'South Korea',
  IN: 'India',
  SE: 'Sweden',
  DK: 'Denmark',
  NO: 'Norway',
  PL: 'Poland',
  CZ: 'Czech Republic',
  AT: 'Austria',
  BE: 'Belgium',
  PT: 'Portugal',
  IE: 'Ireland',
  NZ: 'New Zealand',
  MX: 'Mexico',
  AR: 'Argentina',
  ZA: 'South Africa',
  OTHER: 'Other',
};

// Country detection patterns
const COUNTRY_PATTERNS: Record<string, RegExp[]> = {
  US: [
    /\b(United States|USA|U\.S\.A\.|U\.S\.|American)\b/i,
    /\b(NIH|FDA|CDC|Veterans Affairs)\b/,
    /\b(University of California|Harvard|Stanford|Johns Hopkins|Mayo Clinic|UCLA|NYU|MIT|Yale|Columbia University|Cornell|Duke|University of Michigan|University of Pennsylvania|University of Texas|University of Florida|University of Colorado|University of Washington|Cleveland Clinic)\b/i,
    /\b(California|New York|Texas|Florida|Massachusetts|Colorado|Washington DC|Maryland|Pennsylvania|Illinois|Ohio|Michigan|Arizona|Georgia)\b/,
  ],
  GB: [
    /\b(United Kingdom|UK|U\.K\.|Britain|British|England|Scotland|Wales)\b/i,
    /\b(NHS|University of Oxford|Cambridge University|Imperial College|King's College|UCL|University College London|Edinburgh|Manchester University|University of Birmingham|University of Bristol|University of Leeds|University of Liverpool|University of Nottingham|GW Pharmaceuticals)\b/i,
    /\b(London|Oxford|Cambridge|Edinburgh|Manchester|Birmingham|Bristol|Liverpool|Leeds|Glasgow)\b/,
  ],
  CA: [
    /\b(Canada|Canadian)\b/i,
    /\b(University of Toronto|McGill|University of British Columbia|UBC|McMaster|University of Alberta|University of Calgary|University of Montreal|Dalhousie|University of Ottawa)\b/i,
    /\b(Toronto|Vancouver|Montreal|Calgary|Ottawa|Alberta|Ontario|Quebec|British Columbia)\b/,
  ],
  AU: [
    /\b(Australia|Australian)\b/i,
    /\b(University of Sydney|University of Melbourne|Monash|University of Queensland|UNSW|University of New South Wales|University of Adelaide|University of Western Australia|ANU|Australian National University)\b/i,
    /\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Queensland|Victoria|New South Wales)\b/,
  ],
  DE: [
    /\b(Germany|German|Deutschland)\b/i,
    /\b(Charité|University of Munich|LMU|Heidelberg University|University of Cologne|University of Hamburg|University of Frankfurt|Technical University|Humboldt|Max Planck)\b/i,
    /\b(Berlin|Munich|Hamburg|Frankfurt|Cologne|Heidelberg|Dresden|Leipzig)\b/,
  ],
  IL: [
    /\b(Israel|Israeli)\b/i,
    /\b(Hebrew University|Tel Aviv University|Technion|Weizmann|Ben-Gurion|Hadassah|Sheba Medical|Rambam)\b/i,
    /\b(Tel Aviv|Jerusalem|Haifa|Beer Sheva)\b/,
  ],
  NL: [
    /\b(Netherlands|Dutch|Holland)\b/i,
    /\b(University of Amsterdam|Leiden University|Utrecht University|Erasmus|VU Amsterdam|Maastricht University|University Medical Center)\b/i,
    /\b(Amsterdam|Rotterdam|Utrecht|Leiden|Maastricht|The Hague)\b/,
  ],
  CH: [
    /\b(Switzerland|Swiss)\b/i,
    /\b(ETH Zurich|University of Zurich|University of Geneva|University of Bern|University of Basel|EPFL|University of Lausanne)\b/i,
    /\b(Zurich|Geneva|Basel|Bern|Lausanne)\b/,
  ],
  BR: [
    /\b(Brazil|Brazilian|Brasil)\b/i,
    /\b(University of São Paulo|USP|UNICAMP|Federal University|UFRJ|PUC)\b/i,
    /\b(São Paulo|Rio de Janeiro|Brasilia|Belo Horizonte)\b/,
  ],
  CN: [
    /\b(China|Chinese|PRC)\b/i,
    /\b(Peking University|Tsinghua|Fudan|Shanghai Jiao Tong|Zhejiang University|Sun Yat-sen|Nanjing University|Chinese Academy)\b/i,
    /\b(Beijing|Shanghai|Guangzhou|Shenzhen|Hangzhou|Nanjing|Wuhan|Chengdu)\b/,
  ],
  JP: [
    /\b(Japan|Japanese)\b/i,
    /\b(University of Tokyo|Kyoto University|Osaka University|Tohoku University|Keio|Waseda|Tokyo Medical|Nagoya University)\b/i,
    /\b(Tokyo|Osaka|Kyoto|Nagoya|Yokohama|Sapporo|Fukuoka)\b/,
  ],
  IT: [
    /\b(Italy|Italian|Italia)\b/i,
    /\b(University of Milan|University of Rome|La Sapienza|University of Bologna|University of Padua|University of Turin|University of Florence|Università)\b/i,
    /\b(Rome|Milan|Florence|Venice|Naples|Turin|Bologna|Padua)\b/,
  ],
  FR: [
    /\b(France|French)\b/i,
    /\b(Sorbonne|University of Paris|INSERM|CNRS|Institut Pasteur|University of Lyon|University of Bordeaux|Université)\b/i,
    /\b(Paris|Lyon|Marseille|Bordeaux|Toulouse|Lille|Strasbourg)\b/,
  ],
  ES: [
    /\b(Spain|Spanish|España)\b/i,
    /\b(University of Barcelona|University of Madrid|Universidad Complutense|Universidad Autónoma|Universidad de Valencia|Universidad de Sevilla)\b/i,
    /\b(Madrid|Barcelona|Valencia|Sevilla|Bilbao|Malaga)\b/,
  ],
  SE: [
    /\b(Sweden|Swedish)\b/i,
    /\b(Karolinska|Uppsala University|Lund University|University of Gothenburg|Stockholm University|KTH)\b/i,
    /\b(Stockholm|Gothenburg|Malmö|Uppsala|Lund)\b/,
  ],
  DK: [
    /\b(Denmark|Danish)\b/i,
    /\b(University of Copenhagen|Aarhus University|Technical University of Denmark|DTU|Aalborg University)\b/i,
    /\b(Copenhagen|Aarhus|Odense|Aalborg)\b/,
  ],
  KR: [
    /\b(South Korea|Korean|Korea)\b/i,
    /\b(Seoul National University|Yonsei|Korea University|KAIST|Sungkyunkwan|Hanyang)\b/i,
    /\b(Seoul|Busan|Incheon|Daegu)\b/,
  ],
  IN: [
    /\b(India|Indian)\b/i,
    /\b(AIIMS|IIT|Indian Institute|University of Delhi|Banaras Hindu University|NIMHANS)\b/i,
    /\b(Delhi|Mumbai|Bangalore|Chennai|Kolkata|Hyderabad|Pune)\b/,
  ],
  PL: [
    /\b(Poland|Polish)\b/i,
    /\b(University of Warsaw|Jagiellonian|Medical University of Warsaw|Wrocław University)\b/i,
    /\b(Warsaw|Krakow|Wrocław|Gdańsk|Poznań)\b/,
  ],
  AT: [
    /\b(Austria|Austrian)\b/i,
    /\b(University of Vienna|Medical University of Vienna|University of Innsbruck|University of Graz)\b/i,
    /\b(Vienna|Salzburg|Innsbruck|Graz)\b/,
  ],
  BE: [
    /\b(Belgium|Belgian)\b/i,
    /\b(KU Leuven|Ghent University|Université Libre de Bruxelles|University of Antwerp)\b/i,
    /\b(Brussels|Antwerp|Ghent|Leuven|Liège)\b/,
  ],
  IE: [
    /\b(Ireland|Irish)\b/i,
    /\b(Trinity College Dublin|University College Dublin|UCD|National University of Ireland|Royal College of Surgeons)\b/i,
    /\b(Dublin|Cork|Galway|Limerick)\b/,
  ],
  NZ: [
    /\b(New Zealand|NZ)\b/i,
    /\b(University of Auckland|University of Otago|Victoria University of Wellington|University of Canterbury)\b/i,
    /\b(Auckland|Wellington|Christchurch|Dunedin)\b/,
  ],
  PT: [
    /\b(Portugal|Portuguese)\b/i,
    /\b(University of Lisbon|University of Porto|University of Coimbra|Universidade)\b/i,
    /\b(Lisbon|Porto|Coimbra|Faro)\b/,
  ],
  NO: [
    /\b(Norway|Norwegian)\b/i,
    /\b(University of Oslo|Norwegian University|NTNU|University of Bergen)\b/i,
    /\b(Oslo|Bergen|Trondheim|Stavanger)\b/,
  ],
  CZ: [
    /\b(Czech|Czechia|Czech Republic)\b/i,
    /\b(Charles University|Masaryk University|Czech Technical University)\b/i,
    /\b(Prague|Brno|Ostrava)\b/,
  ],
};

function detectCountry(text: string): string | null {
  if (!text) return null;

  const scores: Record<string, number> = {};

  for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern, 'gi'));
      if (matches) {
        scores[code] = (scores[code] || 0) + matches.length;
      }
    }
  }

  // Find the country with the highest score
  let maxScore = 0;
  let detectedCountry: string | null = null;

  for (const [code, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCountry = code;
    }
  }

  // Only return if we have a reasonable confidence (at least 2 matches)
  return maxScore >= 2 ? detectedCountry : null;
}

export default function GenerationHubPage() {
  const searchParams = useSearchParams();
  const urlStep = searchParams.get('step') as Step | null;

  const [currentStep, setCurrentStep] = useState<Step>(urlStep || 'summaries');
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialStepSet, setInitialStepSet] = useState(!!urlStep);

  // Meta generation state
  const [metaGenerating, setMetaGenerating] = useState(false);
  const [metaProgress, setMetaProgress] = useState({ processed: 0, total: 0 });
  const [metaResults, setMetaResults] = useState<Array<{ id: string; status: string; title?: string; error?: string }>>([]);

  // Country state
  const [countryStudies, setCountryStudies] = useState<StudyForCountry[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countrySaving, setCountrySaving] = useState<string | null>(null);
  const [countryBatchSaving, setCountryBatchSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/research/generation/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Determine recommended step based on completion (only if no URL step provided)
  useEffect(() => {
    if (stats && !initialStepSet) {
      const summaryPercent = (stats.withSummaries / stats.totalStudies) * 100;
      const metaPercent = (stats.withMeta / stats.totalStudies) * 100;
      const countryPercent = (stats.withCountry / stats.totalStudies) * 100;

      if (summaryPercent < 100) {
        setCurrentStep('summaries');
      } else if (metaPercent < 100) {
        setCurrentStep('meta');
      } else if (countryPercent < 100) {
        setCurrentStep('country');
      }
      setInitialStepSet(true);
    }
  }, [stats, initialStepSet]);

  // Fetch studies needing country
  const fetchCountryStudies = useCallback(async () => {
    setCountryLoading(true);
    try {
      const res = await fetch('/api/admin/research/generation/country?limit=50');
      const data = await res.json();

      // Auto-detect countries from abstracts
      const studiesWithDetection = (data.studies || []).map((study: StudyForCountry) => ({
        ...study,
        detectedCountry: detectCountry(study.abstract || study.title || ''),
      }));

      setCountryStudies(studiesWithDetection);
    } catch (error) {
      console.error('Failed to fetch country studies:', error);
    } finally {
      setCountryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 'country') {
      fetchCountryStudies();
    }
  }, [currentStep, fetchCountryStudies]);

  // Generate meta & findings
  const handleGenerateMeta = async (batchSize: number = 10) => {
    setMetaGenerating(true);
    setMetaResults([]);

    const needsContent = stats ? stats.totalStudies - stats.withMeta : 0;
    setMetaProgress({ processed: 0, total: needsContent });

    try {
      const res = await fetch('/api/admin/research/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize }),
      });

      const data = await res.json();
      setMetaResults(data.results || []);
      setMetaProgress(prev => ({ ...prev, processed: data.processed || 0 }));

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Meta generation failed:', error);
    } finally {
      setMetaGenerating(false);
    }
  };

  // Save single country
  const handleSaveCountry = async (studyId: string, countryCode: string) => {
    setCountrySaving(studyId);
    try {
      const res = await fetch('/api/admin/research/generation/country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyId, country: countryCode }),
      });

      if (res.ok) {
        setCountryStudies(prev => prev.filter(s => s.id !== studyId));
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to save country:', error);
    } finally {
      setCountrySaving(null);
    }
  };

  // Apply all detected countries
  const handleApplyAllDetected = async () => {
    const studiesWithDetected = countryStudies.filter(s => s.detectedCountry);
    if (studiesWithDetected.length === 0) return;

    setCountryBatchSaving(true);
    try {
      const updates = studiesWithDetected.map(s => ({
        studyId: s.id,
        country: s.detectedCountry!,
      }));

      const res = await fetch('/api/admin/research/generation/country/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        const data = await res.json();
        // Remove saved studies from list
        const savedIds = new Set(data.saved || []);
        setCountryStudies(prev => prev.filter(s => !savedIds.has(s.id)));
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to batch save countries:', error);
    } finally {
      setCountryBatchSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: 'summaries' as Step,
      name: 'Plain Summaries',
      icon: '📝',
      completed: stats?.withSummaries || 0,
      total: stats?.totalStudies || 0,
      color: 'green',
    },
    {
      id: 'meta' as Step,
      name: 'Meta & Findings',
      icon: '🏷️',
      completed: stats?.withMeta || 0,
      total: stats?.totalStudies || 0,
      color: 'blue',
    },
    {
      id: 'country' as Step,
      name: 'Country Data',
      icon: '🌍',
      completed: stats?.withCountry || 0,
      total: stats?.totalStudies || 0,
      color: 'purple',
    },
  ];

  const detectedCount = countryStudies.filter(s => s.detectedCountry).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Generation</h1>
          <p className="text-gray-600 mt-1">Generate missing content for research studies</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Step Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const percent = step.total > 0 ? Math.round((step.completed / step.total) * 100) : 0;
            const isActive = currentStep === step.id;
            const isComplete = percent === 100;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center p-4 rounded-lg transition-all flex-1 ${
                    isActive
                      ? `bg-${step.color}-50 border-2 border-${step.color}-500`
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{step.icon}</span>
                    {isComplete && <span className="text-green-500 text-lg">✓</span>}
                  </div>
                  <span className={`font-medium ${isActive ? `text-${step.color}-700` : 'text-gray-700'}`}>
                    {step.name}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    {step.completed}/{step.total} ({percent}%)
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`bg-${step.color}-500 h-1.5 rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Step 1: Summaries */}
        {currentStep === 'summaries' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Plain Summaries
            </h2>
            <p className="text-gray-600 mb-6">
              Generate readable summaries (100 words max) for each research study.
              These appear in the &quot;What You Need to Know&quot; section.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">
                    {stats?.withSummaries || 0} of {stats?.totalStudies || 0} studies have summaries
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {(stats?.totalStudies || 0) - (stats?.withSummaries || 0)} remaining
                  </p>
                </div>
                <Link
                  href="/admin/research/summaries"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Continue Writing Summaries →
                </Link>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Summaries are written one at a time for quality control. Click the button above to continue.
            </p>
          </div>
        )}

        {/* Step 2: Meta & Findings */}
        {currentStep === 'meta' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏷️</span> Meta Titles & Key Findings
            </h2>
            <p className="text-gray-600 mb-6">
              Auto-generate SEO meta titles, descriptions, display titles, and key findings/limitations for each study.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">
                    {stats?.withMeta || 0} of {stats?.totalStudies || 0} studies have complete meta
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {(stats?.totalStudies || 0) - (stats?.withMeta || 0)} remaining
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateMeta(10)}
                    disabled={metaGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {metaGenerating ? 'Generating...' : 'Generate Next 10'}
                  </button>
                  <button
                    onClick={() => handleGenerateMeta(20)}
                    disabled={metaGenerating}
                    className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate 20
                  </button>
                </div>
              </div>
            </div>

            {metaGenerating && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">
                    Processing batch...
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {metaResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Generation Results</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {metaResults.map((result, i) => (
                    <div
                      key={result.id || i}
                      className={`px-4 py-2 border-b border-gray-100 last:border-0 flex items-center justify-between ${
                        result.status === 'error' ? 'bg-red-50' : 'bg-green-50'
                      }`}
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {result.title || result.id}
                      </span>
                      <span className={`text-xs font-medium ${
                        result.status === 'error' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {result.status === 'error' ? `Error: ${result.error}` : 'Success'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              Uses Claude AI to generate content. Each batch takes ~15-30 seconds due to rate limiting.
            </p>
          </div>
        )}

        {/* Step 3: Country Data */}
        {currentStep === 'country' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🌍</span> Country Data
            </h2>
            <p className="text-gray-600 mb-6">
              Assign country of origin to each study. Countries are auto-detected from institution names and locations in the abstract.
            </p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-800">
                    {stats?.withCountry || 0} of {stats?.totalStudies || 0} studies have country data
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    {(stats?.totalStudies || 0) - (stats?.withCountry || 0)} remaining
                  </p>
                </div>
                {detectedCount > 0 && (
                  <button
                    onClick={handleApplyAllDetected}
                    disabled={countryBatchSaving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countryBatchSaving ? 'Saving...' : `Apply ${detectedCount} Detected`}
                  </button>
                )}
              </div>
            </div>

            {countryLoading ? (
              <div className="text-center py-8 text-gray-500">Loading studies...</div>
            ) : countryStudies.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">🎉</span>
                <p className="text-gray-600 mt-2">All studies have country data assigned!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {countryStudies.map((study) => (
                  <div
                    key={study.id}
                    className={`border rounded-lg p-4 ${
                      study.detectedCountry ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">
                          {study.title}
                        </p>
                        {study.detectedCountry && (
                          <p className="text-xs text-purple-600 mt-1">
                            Auto-detected: {COUNTRIES[study.detectedCountry] || study.detectedCountry}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                          defaultValue={study.detectedCountry || ''}
                          onChange={(e) => {
                            const code = e.target.value;
                            if (code) {
                              handleSaveCountry(study.id, code);
                            }
                          }}
                          disabled={countrySaving === study.id}
                        >
                          <option value="">Select country...</option>
                          {Object.entries(COUNTRIES).map(([code, name]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                        </select>
                        {study.detectedCountry && (
                          <button
                            onClick={() => handleSaveCountry(study.id, study.detectedCountry!)}
                            disabled={countrySaving === study.id}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {countrySaving === study.id ? '...' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {countryStudies.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={fetchCountryStudies}
                  disabled={countryLoading}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Load more studies
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation between steps */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            const idx = steps.findIndex(s => s.id === currentStep);
            if (idx > 0) setCurrentStep(steps[idx - 1].id);
          }}
          disabled={currentStep === 'summaries'}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous Step
        </button>
        <button
          onClick={() => {
            const idx = steps.findIndex(s => s.id === currentStep);
            if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].id);
          }}
          disabled={currentStep === 'country'}
          className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
