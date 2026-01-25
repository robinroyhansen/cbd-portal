import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Suspense } from 'react';

// Types for dashboard data
interface ContentStats {
  articles: number;
  conditions: number;
  studies: number;
  glossaryTerms: number;
  brands: number;
}

interface ResearchStats {
  pending: number;
  approved: number;
  rejected: number;
  todayAdded: number;
  withSummaries: number;
  highQuality: number;
}

interface TranslationLanguage {
  code: string;
  name: string;
  conditionsCoverage: number;
  glossaryCoverage: number;
}

interface ContentGrowthData {
  month: string;
  studies: number;
  articles: number;
}

interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  action: string;
  timestamp: string;
}

// Loading skeleton components
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-24"></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="h-48 bg-gray-100 rounded"></div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  value,
  label,
  icon,
  color = 'gray',
  href,
  subtitle,
}: {
  value: number;
  label: string;
  icon: string;
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'gray' | 'red';
  href?: string;
  subtitle?: string;
}) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    gray: 'text-gray-900',
    red: 'text-red-600',
  };

  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-3xl font-bold ${colorClasses[color]}`}>
          {value.toLocaleString('de-DE')}
        </p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all block"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {content}
    </div>
  );
}

// Bar Chart Component (CSS/SVG based)
function BarChart({ data }: { data: ContentGrowthData[] }) {
  const maxValue = Math.max(...data.flatMap((d) => [d.studies, d.articles]), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>📈</span> Content Growth (Last 6 Months)
      </h2>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => {
          const studyHeight = (item.studies / maxValue) * 100;
          const articleHeight = (item.articles / maxValue) * 100;
          const monthLabel = new Date(item.month + '-01').toLocaleDateString('en-US', {
            month: 'short',
          });

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-1 h-40 w-full justify-center">
                {/* Studies bar */}
                <div
                  className="w-5 bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600"
                  style={{ height: `${Math.max(studyHeight, 2)}%` }}
                  title={`Studies: ${item.studies}`}
                />
                {/* Articles bar */}
                <div
                  className="w-5 bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${Math.max(articleHeight, 2)}%` }}
                  title={`Articles: ${item.articles}`}
                />
              </div>
              <span className="text-xs text-gray-500">{monthLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Studies</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Articles</span>
        </div>
      </div>
    </div>
  );
}

// Donut Chart Component (SVG based)
function DonutChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const percentage = total > 0 ? item.value / total : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + percentage * 360;
    currentAngle = endAngle;

    // Calculate SVG arc path
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = percentage > 0.5 ? 1 : 0;

    const path =
      percentage >= 1
        ? `M 50 10 A 40 40 0 1 1 49.99 10`
        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...item,
      percentage,
      path,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>🌍</span> {title}
      </h2>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80"
              >
                <title>
                  {segment.label}: {segment.value} ({(segment.percentage * 100).toFixed(1)}%)
                </title>
              </path>
            ))}
            {/* Inner circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-700">{total}</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-gray-700">{segment.label}</span>
              </div>
              <span className="text-gray-500">
                {segment.value} ({(segment.percentage * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Translation Coverage Component
function TranslationCoverage({ languages, totalConditions, totalGlossary }: {
  languages: TranslationLanguage[];
  totalConditions: number;
  totalGlossary: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>🌐</span> Translation Coverage
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {languages.map((lang) => {
          const condPercent = totalConditions > 0
            ? Math.round((lang.conditionsCoverage / totalConditions) * 100)
            : 0;
          const glossPercent = totalGlossary > 0
            ? Math.round((lang.glossaryCoverage / totalGlossary) * 100)
            : 0;
          const avgPercent = Math.round((condPercent + glossPercent) / 2);

          return (
            <div
              key={lang.code}
              className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{lang.name}</span>
                <span className="text-xs text-gray-500 uppercase">{lang.code}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${condPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{condPercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${glossPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{glossPercent}%</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400 flex justify-between">
                <span>Conditions: {lang.conditionsCoverage}</span>
                <span>Glossary: {lang.glossaryCoverage}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Conditions ({totalConditions})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Glossary ({totalGlossary})</span>
        </div>
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'text-green-500';
      case 'published':
        return 'text-blue-500';
      case 'created':
        return 'text-purple-500';
      case 'added':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study':
        return '📚';
      case 'article':
        return '📝';
      case 'glossary':
        return '📖';
      case 'condition':
        return '🏥';
      default:
        return '📄';
    }
  };

  const getTypeLink = (type: string, id: string) => {
    switch (type) {
      case 'study':
        return `/admin/research/studies/${id}/edit`;
      case 'article':
        return `/admin/articles/${id}`;
      case 'glossary':
        return `/admin/glossary`;
      default:
        return '#';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>🕐</span> Recent Activity
      </h2>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={getActionColor(activity.action)}>
                  {getTypeIcon(activity.type)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    <span className="capitalize text-gray-500">{activity.type}</span>{' '}
                    <span className={getActionColor(activity.action)}>{activity.action}</span>:{' '}
                    <span className="font-medium">{activity.title}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <Link
                href={getTypeLink(activity.type, activity.id)}
                className="text-xs text-green-600 hover:text-green-700 shrink-0"
              >
                View
              </Link>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
}

// Research Queue Status Component
function ResearchQueueStatus({ stats }: { stats: ResearchStats }) {
  const total = stats.pending + stats.approved + stats.rejected;

  return (
    <DonutChart
      title="Research Queue Status"
      data={[
        { label: 'Pending', value: stats.pending, color: '#f59e0b' },
        { label: 'Approved', value: stats.approved, color: '#22c55e' },
        { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
      ]}
    />
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    {
      href: '/admin/research/queue',
      icon: '📋',
      label: 'Review Queue',
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700',
    },
    {
      href: '/admin/research/scanner',
      icon: '🔍',
      label: 'Scan Research',
      color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
    },
    {
      href: '/admin/research/generation',
      icon: '✨',
      label: 'Generate Content',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
    },
    {
      href: '/admin/glossary',
      icon: '📖',
      label: 'Glossary',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
    },
    {
      href: '/admin/conditions',
      icon: '🏥',
      label: 'Conditions',
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700',
    },
    {
      href: '/admin/articles',
      icon: '📝',
      label: 'Articles',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>⚡</span> Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center p-4 rounded-xl border transition-colors ${action.color}`}
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({
  label,
  current,
  total,
  color = 'green',
  href,
}: {
  label: string;
  current: number;
  total: number;
  color?: 'green' | 'blue' | 'purple';
  href?: string;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  const content = (
    <>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">
          {percentage}% ({current.toLocaleString('de-DE')}/{total.toLocaleString('de-DE')})
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClasses[color]} h-2.5 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

// Main Dashboard Content (Server Component)
async function DashboardContent() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [
    articlesResult,
    conditionsResult,
    studiesResult,
    glossaryResult,
    brandsResult,
    pendingResult,
    approvedResult,
    rejectedResult,
    withSummariesResult,
    highQualityResult,
    completedMetaResult,
    withCountryResult,
    recentStudiesResult,
  ] = await Promise.all([
    supabase.from('kb_articles').select('*', { count: 'exact', head: true }),
    supabase.from('kb_conditions').select('*', { count: 'exact', head: true }),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('kb_glossary').select('*', { count: 'exact', head: true }),
    supabase.from('kb_brands').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'approved').not('plain_summary', 'is', null),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'approved').gte('relevance_score', 70),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'approved').not('meta_title', 'is', null).not('key_findings', 'is', null),
    supabase.from('kb_research_queue').select('*', { count: 'exact', head: true })
      .eq('status', 'approved').not('country', 'is', null),
    supabase.from('kb_research_queue')
      .select('id, title, slug, reviewed_at, status')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false })
      .limit(5),
  ]);

  // Fetch translation stats
  const languages = [
    { code: 'da', name: 'Danish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'no', name: 'Norwegian' },
    { code: 'de', name: 'German' },
    { code: 'nl', name: 'Dutch' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
  ];

  const translationStats = await Promise.all(
    languages.map(async (lang) => {
      const [condResult, glossResult] = await Promise.all([
        supabase.from('condition_translations').select('*', { count: 'exact', head: true }).eq('language', lang.code),
        supabase.from('glossary_translations').select('*', { count: 'exact', head: true }).eq('language', lang.code),
      ]);
      return {
        ...lang,
        conditionsCoverage: condResult.count || 0,
        glossaryCoverage: glossResult.count || 0,
      };
    })
  );

  // Fetch content growth data (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: studiesData } = await supabase
    .from('kb_research_queue')
    .select('reviewed_at')
    .eq('status', 'approved')
    .gte('reviewed_at', sixMonthsAgo.toISOString())
    .not('reviewed_at', 'is', null);

  const { data: articlesData } = await supabase
    .from('kb_articles')
    .select('created_at')
    .gte('created_at', sixMonthsAgo.toISOString());

  // Group by month
  const months: { [key: string]: { studies: number; articles: number } } = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    months[monthKey] = { studies: 0, articles: 0 };
  }

  studiesData?.forEach((study) => {
    if (study.reviewed_at) {
      const monthKey = study.reviewed_at.substring(0, 7);
      if (months[monthKey]) months[monthKey].studies++;
    }
  });

  articlesData?.forEach((article) => {
    if (article.created_at) {
      const monthKey = article.created_at.substring(0, 7);
      if (months[monthKey]) months[monthKey].articles++;
    }
  });

  const contentGrowth: ContentGrowthData[] = Object.entries(months).map(([month, counts]) => ({
    month,
    studies: counts.studies,
    articles: counts.articles,
  }));

  // Build recent activity
  const recentActivity: RecentActivityItem[] = (recentStudiesResult.data || []).map((study) => ({
    id: study.id,
    type: 'study',
    title: study.title?.substring(0, 60) + (study.title?.length > 60 ? '...' : ''),
    action: 'approved',
    timestamp: study.reviewed_at || new Date().toISOString(),
  }));

  // Stats
  const totalStudies = approvedResult.count || 0;
  const withSummaries = withSummariesResult.count || 0;
  const completedMeta = completedMetaResult.count || 0;
  const withCountry = withCountryResult.count || 0;

  const summaryPercent = totalStudies > 0 ? Math.round((withSummaries / totalStudies) * 100) : 0;
  const metaPercent = totalStudies > 0 ? Math.round((completedMeta / totalStudies) * 100) : 0;
  const countryPercent = totalStudies > 0 ? Math.round((withCountry / totalStudies) * 100) : 0;

  const researchStats: ResearchStats = {
    pending: pendingResult.count || 0,
    approved: approvedResult.count || 0,
    rejected: rejectedResult.count || 0,
    todayAdded: 0,
    withSummaries: withSummaries,
    highQuality: highQualityResult.count || 0,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CBD Portal Dashboard</h1>
        <p className="text-gray-600">Analytics overview and content management</p>
      </div>

      {/* Content Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📊</span> Content Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            value={articlesResult.count || 0}
            label="Articles"
            icon="📝"
            color="blue"
            href="/admin/articles"
          />
          <StatCard
            value={conditionsResult.count || 0}
            label="Conditions"
            icon="🏥"
            color="purple"
            href="/admin/conditions"
          />
          <StatCard
            value={studiesResult.count || 0}
            label="Research Studies"
            icon="🔬"
            color="green"
            href="/admin/research/studies"
          />
          <StatCard
            value={glossaryResult.count || 0}
            label="Glossary Terms"
            icon="📖"
            color="amber"
            href="/admin/glossary"
          />
          <StatCard
            value={brandsResult.count || 0}
            label="Published Brands"
            icon="⭐"
            color="gray"
            href="/admin/brands"
          />
        </div>
      </div>

      {/* Research Queue Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🔬</span> Research Queue
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            value={researchStats.pending}
            label="Pending Review"
            icon="⏳"
            color="amber"
            href="/admin/research/queue"
          />
          <StatCard
            value={researchStats.approved}
            label="Approved"
            icon="✅"
            color="green"
            href="/admin/research/studies"
          />
          <StatCard
            value={researchStats.rejected}
            label="Rejected"
            icon="❌"
            color="red"
            href="/admin/research/rejected"
          />
          <StatCard
            value={researchStats.highQuality}
            label="High Quality (70+)"
            icon="⭐"
            color="purple"
            subtitle={`${totalStudies > 0 ? Math.round((researchStats.highQuality / totalStudies) * 100) : 0}% of approved`}
          />
        </div>
      </div>

      {/* Content Generation Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <span>📈</span> Content Generation Progress
          </h2>
          <Link
            href="/admin/research/generation"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Continue Generation
          </Link>
        </div>
        <div className="space-y-4">
          <ProgressBar
            label="Plain Summaries"
            current={withSummaries}
            total={totalStudies}
            color="green"
            href="/admin/research/generation?step=summaries"
          />
          <ProgressBar
            label="Meta Titles & Findings"
            current={completedMeta}
            total={totalStudies}
            color="blue"
            href="/admin/research/generation?step=meta"
          />
          <ProgressBar
            label="Country Data"
            current={withCountry}
            total={totalStudies}
            color="purple"
            href="/admin/research/generation?step=country"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <BarChart data={contentGrowth} />
        <ResearchQueueStatus stats={researchStats} />
      </div>

      {/* Translation Coverage */}
      <div className="mb-6">
        <TranslationCoverage
          languages={translationStats}
          totalConditions={conditionsResult.count || 0}
          totalGlossary={glossaryResult.count || 0}
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <RecentActivity activities={recentActivity} />
        <QuickActions />
      </div>

      {/* Pending Queue Alert */}
      {researchStats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 text-2xl">⏳</span>
            <div>
              <p className="text-amber-800 font-medium">
                {researchStats.pending.toLocaleString('de-DE')} studies pending review
              </p>
              <p className="text-amber-700 text-sm">Review and approve new research papers</p>
            </div>
          </div>
          <Link
            href="/admin/research/queue"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}

// Loading fallback
function DashboardLoading() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="h-9 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-100 rounded w-96 animate-pulse"></div>
      </div>

      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

// Error boundary component
function DashboardError({ error }: { error: Error }) {
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-red-500 text-2xl">⚠️</span>
          <h2 className="text-lg font-semibold text-red-800">Dashboard Error</h2>
        </div>
        <p className="text-red-700 mb-4">
          Failed to load dashboard data. Please try refreshing the page.
        </p>
        <details className="text-sm text-red-600">
          <summary className="cursor-pointer hover:underline">Error details</summary>
          <pre className="mt-2 p-3 bg-red-100 rounded overflow-x-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
