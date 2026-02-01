import { LocaleLink as Link } from '@/components/LocaleLink';

interface Author {
  name: string;
  slug: string;
  title: string;
  credentials: string;
  bio_short: string;
  image_url: string;
  years_experience: number;
  is_verified: boolean;
  linkedin_url?: string;
}

interface ArticleAuthorProps {
  author: Author;
  variant: 'byline' | 'box';
  publishedAt?: string;
  updatedAt?: string;
}

export function ArticleAuthor({ author, variant, publishedAt, updatedAt }: ArticleAuthorProps) {
  if (variant === 'byline') {
    return (
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/authors/${author.slug}`}>
          {author.image_url ? (
            <img
              src={author.image_url}
              alt={author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg text-green-700">
                {author.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/authors/${author.slug}`}
              className="font-medium text-gray-900 hover:text-green-700"
            >
              {author.name}
            </Link>
            {author.is_verified && (
              <span className="text-blue-500 text-sm" title="Verified Expert">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {author.title} • {author.years_experience}+ years experience
          </p>
        </div>
      </div>
    );
  }

  // Full author box
  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-12">
      <div className="flex items-start gap-4">
        <Link href={`/authors/${author.slug}`} className="flex-shrink-0">
          {author.image_url ? (
            <img
              src={author.image_url}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl text-green-700">
                {author.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/authors/${author.slug}`}
              className="text-lg font-semibold hover:text-green-700"
            >
              {author.name}
            </Link>
            {author.is_verified && (
              <span className="text-blue-500" title="Verified Expert">✓</span>
            )}
          </div>

          <p className="text-green-700 text-sm mb-2">{author.title}</p>

          {author.credentials && (
            <p className="text-gray-500 text-sm mb-3">{author.credentials}</p>
          )}

          <p className="text-gray-600 text-sm mb-4">{author.bio_short}</p>

          <div className="flex items-center gap-4">
            <Link
              href={`/authors/${author.slug}`}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View full profile →
            </Link>
            {author.linkedin_url && (
              <a
                href={author.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
        The views expressed are {author.name.split(' ')[0]}'s personal expert opinions based on industry
        experience and research. They do not constitute medical advice. Always consult a healthcare professional.
      </p>
    </div>
  );
}