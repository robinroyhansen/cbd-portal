import { LocaleLink as Link } from '@/components/LocaleLink';

interface Tag {
  name: string;
  slug: string;
  color?: string;
}

interface TagListProps {
  tags: Tag[];
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
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

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function TagList({ tags, size = 'sm', showCount = false }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Link
          key={tag.slug}
          href={`/tags/${tag.slug}`}
          className={`rounded-full transition-all hover:scale-105 ${sizeClasses[size]} ${colorClasses[tag.color || 'gray']}`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function TagBadge({ tag, size = 'sm', clickable = true }: TagBadgeProps) {
  const className = `inline-flex items-center rounded-full transition-all ${sizeClasses[size]} ${colorClasses[tag.color || 'gray']} ${clickable ? 'hover:scale-105' : ''}`;

  if (clickable) {
    return (
      <Link href={`/tags/${tag.slug}`} className={className}>
        {tag.name}
      </Link>
    );
  }

  return (
    <span className={className}>
      {tag.name}
    </span>
  );
}