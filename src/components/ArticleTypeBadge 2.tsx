import { ArticleType, articleTemplates } from '@/lib/article-templates';

interface ArticleTypeBadgeProps {
  type: ArticleType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5'
};

const colorClasses: Record<ArticleType, string> = {
  'condition': 'bg-blue-100 text-blue-700 border-blue-200',
  'product-guide': 'bg-green-100 text-green-700 border-green-200',
  'science-explainer': 'bg-purple-100 text-purple-700 border-purple-200',
  'beginner-guide': 'bg-orange-100 text-orange-700 border-orange-200',
  'comparison': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'news': 'bg-red-100 text-red-700 border-red-200',
  'standard': 'bg-gray-100 text-gray-700 border-gray-200'
};

export function ArticleTypeBadge({ type, size = 'sm', showIcon = true }: ArticleTypeBadgeProps) {
  const template = articleTemplates[type];

  if (!template || type === 'standard') return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[type]}`}>
      {showIcon && <span>{template.icon}</span>}
      <span>{template.name}</span>
    </span>
  );
}

export function ArticleTypeIndicator({ type }: { type: ArticleType }) {
  const template = articleTemplates[type];

  if (!template) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-base">{template.icon}</span>
      <span>{template.name}</span>
    </div>
  );
}