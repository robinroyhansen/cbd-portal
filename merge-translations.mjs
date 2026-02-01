import { readFileSync, writeFileSync } from 'fs';

// Read both files
const metadata = JSON.parse(readFileSync('translations-batch-6-complete.json', 'utf-8'));
const templates = JSON.parse(readFileSync('translations-batch-6-templates.json', 'utf-8'));

// Create a map of article_id to template
const templateMap = new Map();
templates.forEach(t => templateMap.set(t.article_id, t));

// Merge: use metadata's translated fields, but take content from templates
const merged = metadata.map(meta => {
  const template = templateMap.get(meta.article_id);
  if (!template) {
    console.log('No template for:', meta.article_id);
    return null;
  }
  
  return {
    article_id: meta.article_id,
    language: 'de',
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt,
    content: template.content, // Use the partially translated content
    meta_title: meta.meta_title,
    meta_description: meta.meta_description,
    translation_quality: 'professional'
  };
}).filter(x => x !== null);

console.log(`Merged ${merged.length} translations`);
writeFileSync('translations-batch-6-final.json', JSON.stringify(merged, null, 2));
console.log('Saved to translations-batch-6-final.json');
