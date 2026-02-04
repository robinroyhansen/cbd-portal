#!/usr/bin/env node
/**
 * CBD Portal Image Generator
 * Creates high-quality images based on article content
 * Uses Kie.ai Flux Kontext for generation
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const KIE_API_KEY = '7677cea98ae520121b1d989087abfcf2';
const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const OUTPUT_DIR = path.join(process.cwd(), 'public/images/articles');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// CBD-specific subject detection
const CBD_SUBJECTS = {
  // Mental health
  anxiety: { keywords: ['anxiety', 'stress', 'worry', 'panic', 'nervous'], style: 'calming wellness', colors: 'soft blues and greens' },
  depression: { keywords: ['depression', 'mood', 'sad', 'mental health'], style: 'hopeful wellness', colors: 'warm sunrise tones' },
  sleep: { keywords: ['sleep', 'insomnia', 'rest', 'night'], style: 'peaceful nighttime', colors: 'deep blues and purples' },
  
  // Pain & Physical
  pain: { keywords: ['pain', 'chronic', 'arthritis', 'inflammation', 'joint'], style: 'relief and comfort', colors: 'soothing earth tones' },
  muscle: { keywords: ['muscle', 'recovery', 'exercise', 'fitness', 'sport'], style: 'active wellness', colors: 'energetic greens' },
  
  // Neurological
  epilepsy: { keywords: ['epilepsy', 'seizure', 'neurological'], style: 'medical scientific', colors: 'clinical blues and whites' },
  
  // Wellness
  skincare: { keywords: ['skin', 'acne', 'beauty', 'topical', 'cream'], style: 'beauty and skincare', colors: 'fresh natural tones' },
  
  // Pets
  pets: { keywords: ['dog', 'cat', 'pet', 'animal', 'veterinary'], style: 'pet wellness', colors: 'warm friendly tones' },
  
  // General CBD
  oil: { keywords: ['oil', 'tincture', 'drops', 'sublingual'], style: 'product photography', colors: 'amber and green botanical' },
  dosage: { keywords: ['dosage', 'dose', 'calculator', 'mg', 'how much'], style: 'informational medical', colors: 'clean clinical' },
  research: { keywords: ['research', 'study', 'science', 'clinical'], style: 'scientific research', colors: 'professional blues' },
};

function detectSubject(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  for (const [subject, config] of Object.entries(CBD_SUBJECTS)) {
    if (config.keywords.some(kw => text.includes(kw))) {
      return { subject, ...config };
    }
  }
  
  // Default CBD style
  return { 
    subject: 'general', 
    style: 'wellness and natural health', 
    colors: 'green botanical tones with hemp leaves'
  };
}

function generatePrompt(article) {
  const { title, slug, content, condition_slug, article_type } = article;
  const subject = detectSubject(title, content || '');
  
  // Extract key topic from title
  const topic = title.replace(/CBD (and|for|&)/gi, '').replace(/: What the Research Shows/gi, '').trim();
  
  let prompt = `Professional health and wellness photography: ${topic}. `;
  prompt += `Style: ${subject.style}, ${subject.colors}. `;
  prompt += `Modern, clean, trustworthy medical/wellness aesthetic. `;
  prompt += `No text, no logos, no people's faces. `;
  prompt += `Subtle cannabis/hemp leaf elements if appropriate. `;
  prompt += `High-end editorial quality, soft natural lighting. `;
  prompt += `Aspect ratio 16:9, photorealistic.`;
  
  return prompt;
}

async function generateImage(prompt) {
  try {
    // Start generation
    const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        aspectRatio: '16:9',
        model: 'flux-kontext-pro',
        outputFormat: 'jpeg'
      })
    });
    
    const data = await response.json();
    if (data.code !== 200 || !data.data?.taskId) {
      throw new Error(`API error: ${JSON.stringify(data)}`);
    }
    
    const taskId = data.data.taskId;
    
    // Poll for result
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 3000));
      
      const pollRes = await fetch(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, {
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
      });
      
      const pollData = await pollRes.json();
      
      if (pollData.data?.successFlag === 1) {
        return pollData.data.response?.resultImageUrl;
      } else if (pollData.data?.successFlag >= 2) {
        throw new Error(`Generation failed: ${JSON.stringify(pollData)}`);
      }
    }
    
    throw new Error('Timeout waiting for image');
  } catch (error) {
    console.error('Image generation error:', error.message);
    return null;
  }
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
  console.log('🌿 CBD Portal Image Generator\n');
  
  // Get articles without images
  const { data: articles, error } = await supabase
    .from('kb_articles')
    .select('id, slug, title, content, condition_slug, article_type')
    .is('featured_image', null)
    .eq('status', 'published')
    .eq('language', 'en')
    .limit(500);  // Process in batches
  
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }
  
  console.log(`📄 Found ${articles.length} articles needing images\n`);
  
  let processed = 0;
  let success = 0;
  
  for (const article of articles) {
    processed++;
    const filepath = path.join(OUTPUT_DIR, `${article.slug}.jpg`);
    
    // Skip if already exists locally
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  [${processed}/${articles.length}] ${article.slug} - already exists`);
      continue;
    }
    
    console.log(`🎨 [${processed}/${articles.length}] Generating: ${article.slug}`);
    
    const prompt = generatePrompt(article);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
    
    const imageUrl = await generateImage(prompt);
    
    if (imageUrl) {
      await downloadImage(imageUrl, filepath);
      
      // Update database with image path
      const imagePath = `/images/articles/${article.slug}.jpg`;
      await supabase
        .from('kb_articles')
        .update({ featured_image: imagePath })
        .eq('id', article.id);
      
      console.log(`   ✅ Saved: ${filepath}`);
      success++;
    } else {
      console.log(`   ❌ Failed to generate`);
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log(`\n✨ Complete! Generated ${success}/${processed} images`);
}

main().catch(console.error);
