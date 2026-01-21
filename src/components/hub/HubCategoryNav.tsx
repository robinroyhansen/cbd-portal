'use client';

export interface CategoryNavItem {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

interface HubCategoryNavProps {
  categories: CategoryNavItem[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  allLabel?: string;
  showCounts?: boolean;
}

export function HubCategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  allLabel = 'All',
  showCounts = true,
}: HubCategoryNavProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          activeCategory === null
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            activeCategory === category.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category.icon && <span>{category.icon}</span>}
          {category.name}
          {showCounts && category.count !== undefined && (
            <span className={`text-xs ${
              activeCategory === category.id ? 'text-green-100' : 'text-gray-400'
            }`}>
              ({category.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
