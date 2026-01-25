import { createClient } from '@/lib/supabase/server';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  article_count?: number;
}

export async function getArticleTags(articleId: string): Promise<Tag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_article_tags')
    .select(`
      tag:kb_tags(id, name, slug, color)
    `)
    .eq('article_id', articleId);

  return data?.map(d => d.tag).filter(Boolean) as Tag[] || [];
}

export async function getPopularTags(limit = 10): Promise<Tag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_tags')
    .select('id, name, slug, color, article_count')
    .gt('article_count', 0)
    .order('article_count', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_tags')
    .select('id, name, slug, color, article_count')
    .order('name')
    .limit(500); // Reasonable limit for tags

  return data || [];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_tags')
    .select('id, name, slug, color, article_count, description')
    .eq('slug', slug)
    .single();

  return data;
}

export async function addTagsToArticle(articleId: string, tagSlugs: string[]): Promise<void> {
  const supabase = await createClient();

  // Get tag IDs from slugs
  const { data: tags } = await supabase
    .from('kb_tags')
    .select('id, slug')
    .in('slug', tagSlugs);

  if (!tags || tags.length === 0) return;

  // Insert article-tag relationships
  const relations = tags.map(tag => ({
    article_id: articleId,
    tag_id: tag.id
  }));

  await supabase
    .from('kb_article_tags')
    .upsert(relations, { onConflict: 'article_id,tag_id' });
}

export async function removeTagFromArticle(articleId: string, tagId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('kb_article_tags')
    .delete()
    .eq('article_id', articleId)
    .eq('tag_id', tagId);
}

export async function autoTagArticle(articleId: string, title: string, content: string): Promise<string[]> {
  const supabase = await createClient();

  // Get all tags
  const { data: allTags } = await supabase
    .from('kb_tags')
    .select('id, name, slug');

  if (!allTags) return [];

  const matchedTags: string[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  for (const tag of allTags) {
    const tagName = tag.name.toLowerCase();
    const tagSlug = tag.slug.replace(/-/g, ' ');

    // Check if tag name or variations appear in title or content
    // Prioritize title matches and exact matches
    const titleMatch = lowerTitle.includes(tagName) || lowerTitle.includes(tagSlug);
    const contentMatch = lowerContent.includes(tagName) || lowerContent.includes(tagSlug);

    if (titleMatch || contentMatch) {
      matchedTags.push(tag.slug);
    }
  }

  // Add matched tags to article
  if (matchedTags.length > 0) {
    await addTagsToArticle(articleId, matchedTags);
  }

  return matchedTags;
}

export async function getRelatedTags(articleIds: string[], excludeTagId?: string, limit = 10): Promise<Tag[]> {
  const supabase = await createClient();

  const { data: relatedTagIds } = await supabase
    .from('kb_article_tags')
    .select('tag_id')
    .in('article_id', articleIds)
    .neq('tag_id', excludeTagId || '');

  const uniqueTagIds = [...new Set(relatedTagIds?.map(rt => rt.tag_id) || [])];

  if (uniqueTagIds.length === 0) return [];

  const { data: tags } = await supabase
    .from('kb_tags')
    .select('id, name, slug, color')
    .in('id', uniqueTagIds.slice(0, limit));

  return tags || [];
}

export async function getTagArticleCount(tagId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('kb_article_tags')
    .select('*', { count: 'exact' })
    .eq('tag_id', tagId);

  return count || 0;
}

// Utility function to suggest tags based on content analysis
export function suggestTagsFromContent(title: string, content: string, availableTags: Tag[]): string[] {
  const suggestions: string[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();

  // Health condition keywords
  const healthKeywords = {
    'anxiety': ['anxiety', 'anxious', 'worry', 'panic'],
    'depression': ['depression', 'depressed', 'mood', 'sadness'],
    'pain': ['pain', 'ache', 'hurt', 'soreness'],
    'sleep': ['sleep', 'insomnia', 'sleepless', 'bedtime'],
    'stress': ['stress', 'stressed', 'tension'],
    'inflammation': ['inflammation', 'inflammatory', 'swelling'],
  };

  // Product type keywords
  const productKeywords = {
    'cbd-oil': ['oil', 'tincture', 'drops', 'liquid'],
    'cbd-edibles': ['gummies', 'edibles', 'food', 'eat'],
    'cbd-topicals': ['cream', 'balm', 'lotion', 'topical', 'skin'],
  };

  // Check for keyword matches
  for (const tag of availableTags) {
    const tagSlug = tag.slug;

    // Direct name match
    if (lowerTitle.includes(tag.name.toLowerCase()) || lowerContent.includes(tag.name.toLowerCase())) {
      suggestions.push(tagSlug);
      continue;
    }

    // Keyword-based suggestions
    const keywords = healthKeywords[tagSlug] || productKeywords[tagSlug] || [];
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword) || lowerContent.includes(keyword)) {
        suggestions.push(tagSlug);
        break;
      }
    }
  }

  return [...new Set(suggestions)];
}