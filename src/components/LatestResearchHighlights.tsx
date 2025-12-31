import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function LatestResearchHighlights({ limit = 5 }: { limit?: number }) {
  const supabase = await createClient();

  const { data: research } = await supabase
    .from('kb_research_queue')
    .select('id, title, authors, publication, year, url, relevant_topics')
    .eq('status', 'approved')
    .order('discovered_at', { ascending: false })
    .limit(limit);

  if (!research || research.length === 0) return null;

  return (
    <section className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Latest Research</h2>
        <Link href="/research" className="text-green-600 hover:underline text-sm">
          View all →
        </Link>
      </div>
      <ul className="space-y-4">
        {research.map((item) => (
          <li key={item.id} className="border-b border-gray-200 pb-3 last:border-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <h3 className="font-medium text-sm group-hover:text-green-700 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {item.publication} • {item.year}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}