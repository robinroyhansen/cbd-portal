import { LocaleLink as Link } from '@/components/LocaleLink';
import { getPopularTags } from '@/lib/tags';

interface PopularTagsProps {
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  lime: 'bg-lime-100 text-lime-700 hover:bg-lime-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  sky: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  zinc: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
};

export async function PopularTags({
  limit = 15,
  title = "Popular Topics",
  showViewAll = true
}: PopularTagsProps) {
  const tags = await getPopularTags(limit);

  if (tags.length === 0) return null;

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {showViewAll && (
          <Link href="/tags" className="text-green-600 hover:text-green-800 text-sm">
            View all →
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${colorClasses[tag.color] || colorClasses.gray}`}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function PopularTagsWidget() {
  return <PopularTags limit={12} showViewAll={true} />;
}

export async function PopularTagsCompact() {
  return <PopularTags limit={8} title="Topics" showViewAll={false} />;
}

// Tag cloud variant for larger displays
export async function TagCloud() {
  const tags = await getPopularTags(25);

  if (tags.length === 0) return null;

  // Calculate tag sizes based on article count
  const maxCount = Math.max(...tags.map(t => t.article_count || 0));
  const getSize = (count: number): string => {
    if (maxCount === 0) return 'text-sm';
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-xl font-bold';
    if (ratio > 0.6) return 'text-lg font-semibold';
    if (ratio > 0.4) return 'text-base font-medium';
    if (ratio > 0.2) return 'text-sm font-medium';
    return 'text-sm';
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Explore Topics</h3>
        <Link href="/tags" className="text-green-600 hover:text-green-800 font-medium">
          Browse all tags →
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className={`px-4 py-2 rounded-full transition-all hover:scale-105 ${colorClasses[tag.color] || colorClasses.gray} ${getSize(tag.article_count || 0)}`}
          >
            {tag.name}
            <span className="ml-1 opacity-60 text-xs">
              ({tag.article_count})
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}