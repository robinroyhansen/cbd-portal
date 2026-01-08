-- ============================================
-- Export CBD-Only Data from Old Database
-- Run these queries in the OLD Supabase SQL Editor
-- to get INSERT statements for the new database
-- ============================================

-- ============================================
-- STEP 1: Check what data exists
-- ============================================

-- Count articles by category to identify CBD vs knife content
SELECT
  c.name as category,
  c.slug,
  COUNT(a.id) as article_count
FROM kb_categories c
LEFT JOIN kb_articles a ON a.category_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY c.name;

-- List articles that might be knife-related (to exclude)
SELECT id, title, slug, category_id
FROM kb_articles
WHERE
  LOWER(title) LIKE '%knife%' OR
  LOWER(title) LIKE '%blade%' OR
  LOWER(title) LIKE '%steel%' OR
  LOWER(title) LIKE '%sharpening%' OR
  LOWER(title) LIKE '%damascus%' OR
  LOWER(slug) LIKE '%knife%' OR
  LOWER(slug) LIKE '%blade%';

-- ============================================
-- STEP 2: Export Categories (CBD only)
-- ============================================

-- Export CBD categories as INSERT statements
SELECT 'INSERT INTO kb_categories (id, created_at, name, slug, description, article_count, language) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(name) || ', ' ||
  quote_literal(slug) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  article_count || ', ' ||
  quote_literal(COALESCE(language, 'en')) || ');'
FROM kb_categories
WHERE
  LOWER(name) NOT LIKE '%knife%' AND
  LOWER(slug) NOT LIKE '%knife%';

-- ============================================
-- STEP 3: Export Authors
-- ============================================

-- Export all authors
SELECT 'INSERT INTO kb_authors (id, name, slug, email, title, credentials, bio_short, bio_full, years_experience, expertise_areas, companies, affiliations, linkedin_url, twitter_url, website_url, image_url, publications, media_mentions, speaking_engagements, certifications, is_verified, is_primary, is_active, article_count, meta_title, meta_description, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  quote_literal(slug) || ', ' ||
  COALESCE(quote_literal(email), 'NULL') || ', ' ||
  COALESCE(quote_literal(title), 'NULL') || ', ' ||
  COALESCE(quote_literal(credentials), 'NULL') || ', ' ||
  COALESCE(quote_literal(bio_short), 'NULL') || ', ' ||
  COALESCE(quote_literal(bio_full), 'NULL') || ', ' ||
  COALESCE(years_experience::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(expertise_areas::text) || '::text[]', 'NULL') || ', ' ||
  COALESCE(quote_literal(companies::text) || '::jsonb', 'NULL') || ', ' ||
  COALESCE(quote_literal(affiliations::text) || '::jsonb', 'NULL') || ', ' ||
  COALESCE(quote_literal(linkedin_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(twitter_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(website_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(image_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(publications::text) || '::jsonb', 'NULL') || ', ' ||
  COALESCE(quote_literal(media_mentions::text) || '::jsonb', 'NULL') || ', ' ||
  COALESCE(quote_literal(speaking_engagements::text) || '::jsonb', 'NULL') || ', ' ||
  COALESCE(quote_literal(certifications::text) || '::jsonb', 'NULL') || ', ' ||
  is_verified || ', ' ||
  is_primary || ', ' ||
  is_active || ', ' ||
  COALESCE(article_count::text, '0') || ', ' ||
  COALESCE(quote_literal(meta_title), 'NULL') || ', ' ||
  COALESCE(quote_literal(meta_description), 'NULL') || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM kb_authors;

-- ============================================
-- STEP 4: Export CBD Articles (excluding knife content)
-- ============================================

-- Export CBD-only articles
SELECT 'INSERT INTO kb_articles (id, created_at, updated_at, title, slug, excerpt, content, featured_image, status, featured, category_id, author_id, published_at, reading_time, meta_title, meta_description, language, original_article_id, article_type, template_data) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz, ' ||
  quote_literal(title) || ', ' ||
  quote_literal(slug) || ', ' ||
  COALESCE(quote_literal(excerpt), 'NULL') || ', ' ||
  quote_literal(content) || ', ' ||
  COALESCE(quote_literal(featured_image), 'NULL') || ', ' ||
  quote_literal(status::text) || '::article_status, ' ||
  featured || ', ' ||
  COALESCE(quote_literal(category_id::text) || '::uuid', 'NULL') || ', ' ||
  COALESCE(quote_literal(author_id::text) || '::uuid', 'NULL') || ', ' ||
  COALESCE(quote_literal(published_at::text) || '::timestamptz', 'NULL') || ', ' ||
  COALESCE(reading_time::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(meta_title), 'NULL') || ', ' ||
  COALESCE(quote_literal(meta_description), 'NULL') || ', ' ||
  quote_literal(COALESCE(language, 'en')) || ', ' ||
  COALESCE(quote_literal(original_article_id::text) || '::uuid', 'NULL') || ', ' ||
  quote_literal(COALESCE(article_type, 'standard')) || ', ' ||
  COALESCE(quote_literal(template_data::text) || '::jsonb', 'NULL') || ');'
FROM kb_articles
WHERE
  LOWER(title) NOT LIKE '%knife%' AND
  LOWER(title) NOT LIKE '%blade%' AND
  LOWER(title) NOT LIKE '%steel%' AND
  LOWER(title) NOT LIKE '%sharpening%' AND
  LOWER(title) NOT LIKE '%damascus%' AND
  LOWER(slug) NOT LIKE '%knife%' AND
  LOWER(slug) NOT LIKE '%blade%' AND
  category_id NOT IN (
    SELECT id FROM kb_categories
    WHERE LOWER(name) LIKE '%knife%' OR LOWER(slug) LIKE '%knife%'
  );

-- ============================================
-- STEP 5: Export Tags
-- ============================================

-- Export CBD-related tags
SELECT 'INSERT INTO kb_tags (id, name, slug) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  quote_literal(slug) || ');'
FROM kb_tags
WHERE
  LOWER(name) NOT LIKE '%knife%' AND
  LOWER(name) NOT LIKE '%blade%' AND
  LOWER(name) NOT LIKE '%steel%';

-- ============================================
-- STEP 6: Export Article-Tag relationships
-- ============================================

SELECT 'INSERT INTO kb_article_tags (article_id, tag_id) VALUES (' ||
  quote_literal(at.article_id::text) || '::uuid, ' ||
  quote_literal(at.tag_id::text) || '::uuid);'
FROM kb_article_tags at
JOIN kb_articles a ON a.id = at.article_id
JOIN kb_tags t ON t.id = at.tag_id
WHERE
  LOWER(a.title) NOT LIKE '%knife%' AND
  LOWER(a.slug) NOT LIKE '%knife%' AND
  LOWER(t.name) NOT LIKE '%knife%';

-- ============================================
-- STEP 7: Export Citations
-- ============================================

SELECT 'INSERT INTO kb_citations (id, created_at, article_id, title, authors, publication, year, url, doi, accessed_at) VALUES (' ||
  quote_literal(c.id::text) || '::uuid, ' ||
  quote_literal(c.created_at::text) || '::timestamptz, ' ||
  quote_literal(c.article_id::text) || '::uuid, ' ||
  quote_literal(c.title) || ', ' ||
  COALESCE(quote_literal(c.authors), 'NULL') || ', ' ||
  COALESCE(quote_literal(c.publication), 'NULL') || ', ' ||
  COALESCE(c.year::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(c.url), 'NULL') || ', ' ||
  COALESCE(quote_literal(c.doi), 'NULL') || ', ' ||
  COALESCE(quote_literal(c.accessed_at::text) || '::date', 'NULL') || ');'
FROM kb_citations c
JOIN kb_articles a ON a.id = c.article_id
WHERE
  LOWER(a.title) NOT LIKE '%knife%' AND
  LOWER(a.slug) NOT LIKE '%knife%';

-- ============================================
-- STEP 8: Export Media
-- ============================================

SELECT 'INSERT INTO kb_media (id, filename, url, alt_text, file_size, mime_type, width, height, created_at, created_by) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(filename) || ', ' ||
  quote_literal(url) || ', ' ||
  COALESCE(quote_literal(alt_text), 'NULL') || ', ' ||
  COALESCE(file_size::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(mime_type), 'NULL') || ', ' ||
  COALESCE(width::text, 'NULL') || ', ' ||
  COALESCE(height::text, 'NULL') || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(created_by) || ');'
FROM kb_media
WHERE
  LOWER(filename) NOT LIKE '%knife%' AND
  LOWER(alt_text) NOT LIKE '%knife%';

-- ============================================
-- STEP 9: Export Research Queue
-- ============================================

SELECT 'INSERT INTO kb_research_queue (id, title, authors, publication, year, abstract, url, doi, source_site, relevance_score, relevant_topics, search_term_matched, status, reviewed_at, reviewed_by, rejection_reason, discovered_at, created_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(title) || ', ' ||
  COALESCE(quote_literal(authors), 'NULL') || ', ' ||
  COALESCE(quote_literal(publication), 'NULL') || ', ' ||
  COALESCE(year::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(abstract), 'NULL') || ', ' ||
  quote_literal(url) || ', ' ||
  COALESCE(quote_literal(doi), 'NULL') || ', ' ||
  COALESCE(quote_literal(source_site), 'NULL') || ', ' ||
  COALESCE(relevance_score::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(relevant_topics::text) || '::text[]', 'NULL') || ', ' ||
  COALESCE(quote_literal(search_term_matched), 'NULL') || ', ' ||
  quote_literal(status) || ', ' ||
  COALESCE(quote_literal(reviewed_at::text) || '::timestamptz', 'NULL') || ', ' ||
  COALESCE(quote_literal(reviewed_by), 'NULL') || ', ' ||
  COALESCE(quote_literal(rejection_reason), 'NULL') || ', ' ||
  quote_literal(discovered_at::text) || '::timestamptz, ' ||
  quote_literal(created_at::text) || '::timestamptz);'
FROM kb_research_queue;
