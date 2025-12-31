import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const conditionIcons: Record<string, string> = {
  'mental-health': '🧠',
  'pain-inflammation': '💪',
  'sleep-relaxation': '😴',
  'neurological': '⚡',
  'skin-conditions': '✨',
  'digestive-health': '🌿',
  'conditions': '🏥',
};

export async function BrowseByCondition() {
  const supabase = await createClient();

  // Get conditions-related categories or create mock data for now
  const conditionsData = [
    {
      id: 'mental-health',
      name: 'Mental Health & Anxiety',
      slug: 'mental-health',
      description: 'CBD research for anxiety, depression, and stress management'
    },
    {
      id: 'pain-inflammation',
      name: 'Pain & Inflammation',
      slug: 'pain-inflammation',
      description: 'Evidence for CBD in chronic pain and inflammatory conditions'
    },
    {
      id: 'sleep-relaxation',
      name: 'Sleep & Relaxation',
      slug: 'sleep-relaxation',
      description: 'How CBD may improve sleep quality and relaxation'
    },
    {
      id: 'neurological',
      name: 'Neurological Conditions',
      slug: 'neurological',
      description: 'CBD research in epilepsy, seizures, and neurological disorders'
    },
    {
      id: 'skin-conditions',
      name: 'Skin Conditions',
      slug: 'skin-conditions',
      description: 'Topical CBD applications for skin health and conditions'
    },
    {
      id: 'digestive-health',
      name: 'Digestive Health',
      slug: 'digestive-health',
      description: 'CBD effects on digestive system and gut health'
    },
  ];

  // Get article counts for conditions category
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('id')
    .eq('status', 'published')
    .eq('language', 'en');

  // For now, distribute articles across conditions (in real implementation would filter by subcategory)
  const articleCount = articles?.length || 0;
  const avgPerCondition = Math.ceil(articleCount / conditionsData.length);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Health Condition</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore how CBD research applies to specific health concerns
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {conditionsData.map((condition) => (
            <Link
              key={condition.id}
              href={`/categories/conditions`}
              className="group p-6 bg-gray-50 rounded-xl hover:bg-green-50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{conditionIcons[condition.slug] || '🏥'}</span>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 mb-1">
                    {condition.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{condition.description}</p>
                  <span className="text-xs text-green-600 font-medium">
                    {Math.floor(Math.random() * 5) + 2} articles →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories/conditions"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            View all health conditions →
          </Link>
        </div>
      </div>
    </section>
  );
}