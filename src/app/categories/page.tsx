import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse CBD Topics | CBD Portal',
  description: 'Explore our comprehensive library of CBD articles organized by health conditions, products, science, and guides.'
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  article_count?: number;
}

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Get all categories
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('*')
    .order('name');

  // Get article counts per category
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('category_id')
    .eq('status', 'published');

  // Count articles per category
  const countMap: Record<string, number> = {};
  articles?.forEach(a => {
    if (a.category_id) {
      countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
    }
  });

  // Add visual styling for each category
  const categoryStyles: Record<string, { icon: string; color: string; colorClasses: string }> = {
    'conditions': {
      icon: '🏥',
      color: 'green',
      colorClasses: 'bg-green-50 border-green-200 hover:border-green-400'
    },
    'products': {
      icon: '🧴',
      color: 'blue',
      colorClasses: 'bg-blue-50 border-blue-200 hover:border-blue-400'
    },
    'science': {
      icon: '🔬',
      color: 'purple',
      colorClasses: 'bg-purple-50 border-purple-200 hover:border-purple-400'
    },
    'guides': {
      icon: '📚',
      color: 'orange',
      colorClasses: 'bg-orange-50 border-orange-200 hover:border-orange-400'
    },
    'legal': {
      icon: '⚖️',
      color: 'gray',
      colorClasses: 'bg-gray-50 border-gray-200 hover:border-gray-400'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Browse Topics</h1>
      <p className="text-xl text-gray-600 mb-10">
        Explore our comprehensive library of evidence-based CBD information
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {categories?.map((category) => {
          const totalArticles = countMap[category.id] || 0;
          const style = categoryStyles[category.slug] || categoryStyles.legal;

          return (
            <div
              key={category.id}
              className={`rounded-xl border-2 p-6 transition-all ${style.colorClasses}`}
            >
              <Link href={`/categories/${category.slug}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{style.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <span className="text-sm text-gray-500">
                      {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>
              </Link>

              {/* Show some popular articles in this category */}
              {totalArticles > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">
                    Popular articles in this topic →
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats section */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Evidence-Based Information</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-green-600">{articles?.length || 0}</div>
            <div className="text-sm text-gray-600">Research Articles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{categories?.length || 0}</div>
            <div className="text-sm text-gray-600">Topic Categories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">100+</div>
            <div className="text-sm text-gray-600">Scientific Citations</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          All information is backed by peer-reviewed research and regularly updated
        </p>
      </div>
    </div>
  );
}
