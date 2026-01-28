import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import {
  getTopics,
  getTotalTopicResearchCount,
  TOPIC_CATEGORIES,
  type TopicCategory,
  type TopicWithDetails,
} from '@/lib/topics';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export const revalidate = 3600; // Revalidate every 1 hour

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: t('topicsPage.title') || 'CBD Research Topics | Explore Evidence by Health Topic',
    description: 'Browse CBD research organized by health topics. Explore studies on anxiety, pain, sleep, epilepsy, inflammation and 30+ other conditions with evidence-based summaries.',
    alternates: getHreflangAlternates('/topics'),
    openGraph: {
      title: t('topicsPage.title') || 'CBD Research Topics | CBD Portal',
      description: 'Explore CBD research organized by health topics with evidence-based summaries and study counts.',
      type: 'website',
      url: '/topics',
    },
  };
}

// Color mapping for topic cards
const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  fuchsia: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100 text-fuchsia-700' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-700' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
};

// Icon components
const icons: Record<string, React.ReactNode> = {
  brain: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  cloud: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  moon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  refresh: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  zap: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  activity: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  flame: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  bone: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  dna: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m0-15c1.463-1.5 4.5-2 7.5-1.5m-15 0c3-0.5 6.037 0 7.5 1.5m0 15c-1.463 1.5-4.5 2-7.5 1.5m15 0c-3 0.5-6.037 0-7.5-1.5M4.5 7.5h15m-15 9h15" />
    </svg>
  ),
  puzzle: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  droplet: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a8 8 0 008-8c0-4.418-8-12-8-12S4 8.582 4 13a8 8 0 008 8z" />
    </svg>
  ),
  ribbon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pill: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  scale: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  paw: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  running: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  female: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14a5 5 0 100-10 5 5 0 000 10zm0 0v7m-3-4h6" />
    </svg>
  ),
  eye: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  'alert-circle': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

function TopicCard({ topic, t }: { topic: TopicWithDetails; t: (key: string) => string }) {
  const colors = colorClasses[topic.color] || colorClasses.gray;
  const icon = icons[topic.icon] || icons.activity;

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={`block p-5 rounded-xl border-2 ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-200 group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${colors.badge} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${colors.text} group-hover:underline`}>
            {topic.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {topic.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
            {topic.studyCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full ${colors.badge}`}>
                {topic.studyCount} {topic.studyCount === 1 ? t('topicsPage.study') : t('topicsPage.studies')}
              </span>
            )}
            {topic.articleCount > 0 && (
              <span className="text-gray-400">
                {topic.articleCount} {topic.articleCount === 1 ? t('topicsPage.article') : t('topicsPage.articles')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CategoryPill({
  category,
  isActive,
  onClick,
}: {
  category: { name: TopicCategory; color: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const baseClasses = 'px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer';
  const activeClasses = `bg-green-600 text-white`;
  const inactiveClasses = `bg-gray-100 text-gray-600 hover:bg-gray-200`;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {category.name}
    </button>
  );
}

// Map category names to translation keys
const categoryTranslationKeys: Record<TopicCategory, string> = {
  'Mental Health': 'mentalHealth',
  'Pain & Inflammation': 'painInflammation',
  'Neurological': 'neurological',
  'Gastrointestinal': 'gastrointestinal',
  'Cancer': 'cancer',
  'Skin': 'skin',
  'Cardiovascular': 'cardiovascular',
  'Metabolic': 'metabolic',
  'Other': 'other',
};

// Component for filtering
function TopicsGrid({ topics, t }: { topics: TopicWithDetails[]; t: (key: string) => string }) {
  // Group topics by category
  const groupedTopics: Record<TopicCategory, TopicWithDetails[]> = {
    'Mental Health': [],
    'Pain & Inflammation': [],
    'Neurological': [],
    'Gastrointestinal': [],
    'Cancer': [],
    'Skin': [],
    'Cardiovascular': [],
    'Metabolic': [],
    'Other': [],
  };

  topics.forEach(topic => {
    groupedTopics[topic.category].push(topic);
  });

  return (
    <div className="space-y-12">
      {TOPIC_CATEGORIES.map(cat => {
        const categoryTopics = groupedTopics[cat.name];
        if (categoryTopics.length === 0) return null;

        return (
          <section key={cat.name} id={cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full bg-${cat.color}-500`}
                style={{
                  backgroundColor:
                    cat.color === 'purple' ? '#8b5cf6' :
                    cat.color === 'red' ? '#ef4444' :
                    cat.color === 'blue' ? '#3b82f6' :
                    cat.color === 'amber' ? '#f59e0b' :
                    cat.color === 'pink' ? '#ec4899' :
                    cat.color === 'sky' ? '#0ea5e9' :
                    cat.color === 'rose' ? '#f43f5e' :
                    cat.color === 'emerald' ? '#10b981' :
                    '#6b7280'
                }}
              />
              {t(`topicsPage.${categoryTranslationKeys[cat.name]}`)}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTopics.map(topic => (
                <TopicCard key={topic.slug} topic={topic} t={t} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default async function TopicsPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const [topics, totalResearch] = await Promise.all([
    getTopics(),
    getTotalTopicResearchCount(),
  ]);

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: t('topicsPage.title'), url: 'https://cbd-portal.vercel.app/topics' },
  ];

  // Count topics with research
  const topicsWithStudies = topics.filter(tp => tp.studyCount > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('topicsPage.title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          {t('topicsPage.subtitle').replace('{{count}}', topicsWithStudies.toString())}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
              {totalResearch.toLocaleString()}
            </span>
            <span className="text-gray-600">{t('topicsPage.researchStudies')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
              {topics.length}
            </span>
            <span className="text-gray-600">{t('topicsPage.healthTopics')}</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {TOPIC_CATEGORIES.map(cat => (
            <a
              key={cat.name}
              href={`#${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {t(`topicsPage.${categoryTranslationKeys[cat.name]}`)}
            </a>
          ))}
        </div>
      </div>

      {/* Topics Grid by Category */}
      <TopicsGrid topics={topics} t={t} />

      {/* CTA Section */}
      <div className="mt-16 bg-green-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">{t('topicsPage.lookingForConditions')}</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          {t('topicsPage.conditionsDescription')}
        </p>
        <Link
          href="/conditions"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          {t('topicsPage.browseAllConditions')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
