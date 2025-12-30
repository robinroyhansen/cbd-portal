import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get article statistics
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('status, category_id');

  const { data: categories } = await supabase
    .from('kb_categories')
    .select('id, name, article_count');

  const { data: media } = await supabase
    .from('kb_media')
    .select('id');

  const { data: citations } = await supabase
    .from('kb_citations')
    .select('id');

  // Calculate stats
  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.status === 'published').length || 0;
  const draftArticles = articles?.filter(a => a.status === 'draft').length || 0;
  const totalCategories = categories?.length || 0;
  const totalMedia = media?.length || 0;
  const totalCitations = citations?.length || 0;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900">{totalArticles}</p>
            </div>
            <span className="text-4xl">📄</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{publishedArticles}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-3xl font-bold text-amber-600">{draftArticles}</p>
            </div>
            <span className="text-4xl">📝</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900">{totalCategories}</p>
            </div>
            <span className="text-4xl">🏷️</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Media Files</p>
              <p className="text-3xl font-bold text-gray-900">{totalMedia}</p>
            </div>
            <span className="text-4xl">🖼️</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citations</p>
              <p className="text-3xl font-bold text-gray-900">{totalCitations}</p>
            </div>
            <span className="text-4xl">📚</span>
          </div>
        </div>
      </div>

      {/* Articles by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Articles by Category</h2>
        <div className="space-y-3">
          {categories?.map((category) => (
            <div key={category.id} className="flex justify-between items-center">
              <span className="text-gray-700">{category.name}</span>
              <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-sm">
                {category.article_count} articles
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/articles/new"
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm text-gray-700">New Article</span>
          </a>
          <a
            href="/admin/categories/new"
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="text-3xl mb-2">🏷️</span>
            <span className="text-sm text-gray-700">New Category</span>
          </a>
          <a
            href="/admin/media"
            className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="text-3xl mb-2">📤</span>
            <span className="text-sm text-gray-700">Upload Media</span>
          </a>
          <a
            href="/apply_migrations.sh"
            download
            className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <span className="text-3xl mb-2">🔧</span>
            <span className="text-sm text-gray-700">Run Migrations</span>
          </a>
        </div>
      </div>
    </div>
  );
}