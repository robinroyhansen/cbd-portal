import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function AuthorTrust() {
  const supabase = await createClient();

  const { data: authors } = await supabase
    .from('kb_authors')
    .select('name, slug, title, years_experience, image_url')
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .limit(4);

  const totalExperience = authors?.reduce((sum, a) => sum + (a.years_experience || 0), 0) || 0;

  return (
    <section className="py-16 bg-green-700 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Written by Industry Experts
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Our content is created by CBD industry veterans with decades of combined experience
            in product development, research, and regulatory compliance.
          </p>
        </div>

        {/* Author avatars */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          {authors?.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="text-center group"
            >
              {author.image_url ? (
                <img
                  src={author.image_url}
                  alt={author.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-white group-hover:border-green-300 transition-colors"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-2 border-2 border-white group-hover:border-green-300 transition-colors">
                  <span className="text-xl">{author.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
              )}
              <p className="text-sm font-medium">{author.name.split(' ')[0]}</p>
              <p className="text-xs text-green-200">{author.years_experience}+ years</p>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 text-sm mb-8">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{totalExperience}+ Years Combined Experience</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Verified Industry Professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Evidence-Based Approach</span>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/authors"
            className="inline-block px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            Meet All Authors
          </Link>
        </div>

        <p className="text-xs text-green-200 mt-8 text-center max-w-xl mx-auto">
          All views expressed are personal expert opinions based on industry experience and independent research.
          Content does not constitute medical advice.
        </p>
      </div>
    </section>
  );
}