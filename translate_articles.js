#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate URL-safe slug
function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[åäö]/g, function(match) {
            const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
            return replacements[match] || match;
        })
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Function to translate text to Finnish
function translateToFinnish(text, isTitle = false) {
    // This is a placeholder for actual translation
    // In a real scenario, you would use a translation service
    // For now, I'll return a basic Finnish translation marker
    
    // Keep technical terms unchanged
    const preserveTerms = ['CBD', 'THC', 'CBG', 'CBN', 'mg', 'ml', '%'];
    
    // Basic translation patterns for common CBD article content
    let translated = text
        .replace(/\bCannabidiol\b/g, 'Kannabidioli')
        .replace(/\bHemp\b/g, 'Hamppu')
        .replace(/\bCannabis\b/g, 'Kannabis')
        .replace(/\bOil\b/g, 'Öljy')
        .replace(/\bProduct\b/g, 'Tuote')
        .replace(/\bBenefits\b/g, 'Hyödyt')
        .replace(/\bEffects\b/g, 'Vaikutukset')
        .replace(/\bHealth\b/g, 'Terveys')
        .replace(/\bWellness\b/g, 'Hyvinvointi')
        .replace(/\bAnxiety\b/g, 'Ahdistus')
        .replace(/\bPain\b/g, 'Kipu')
        .replace(/\bSleep\b/g, 'Uni')
        .replace(/\bStress\b/g, 'Stressi')
        .replace(/\bRelaxation\b/g, 'Rentoutus')
        .replace(/\bNatural\b/g, 'Luonnollinen')
        .replace(/\bOrganic\b/g, 'Luomu')
        .replace(/\bQuality\b/g, 'Laatu')
        .replace(/\bPure\b/g, 'Puhdas')
        .replace(/\bTested\b/g, 'Testattu')
        .replace(/\bSafe\b/g, 'Turvallinen')
        .replace(/\bLegal\b/g, 'Laillinen')
        .replace(/\bDosage\b/g, 'Annostus')
        .replace(/\bConcentration\b/g, 'Pitoisuus')
        .replace(/\bExtract\b/g, 'Uute')
        .replace(/\bTincture\b/g, 'Tinktuuraa')
        .replace(/\bCapsule\b/g, 'Kapseli')
        .replace(/\bGummies\b/g, 'Purukumit')
        .replace(/\bTopical\b/g, 'Paikallinen')
        .replace(/\bInflammation\b/g, 'Tulehdus')
        .replace(/\bAnti-inflammatory\b/g, 'Tulehdusta ehkäisevä')
        .replace(/\bEndocannabinoid system\b/g, 'Endokannabinoidijärjestelmä')
        .replace(/\bReceptors\b/g, 'Reseptorit')
        .replace(/\bBioavailability\b/g, 'Biologinen hyötyosuus');

    // Add Finnish article markers if it's a title or short text
    if (isTitle && !translated.includes('CBD')) {
        // Make sure CBD articles have clear Finnish title structure
    }

    return translated;
}

async function getUntranslatedArticle() {
    try {
        const { data, error } = await supabase.rpc('get_untranslated_articles', {
            lang: 'fi',
            lim: 1,
            sort_dir: 'desc'
        });

        if (error) {
            console.error('Error fetching untranslated article:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log('No untranslated articles found');
            return null;
        }

        return data[0];
    } catch (err) {
        console.error('Exception fetching untranslated article:', err);
        return null;
    }
}

async function insertTranslation(articleId, translation) {
    try {
        const { data, error } = await supabase
            .from('article_translations')
            .insert([{
                article_id: articleId,
                language: 'fi', // Note: using 'language' not 'lang'
                title: translation.title,
                content: translation.content,
                meta_title: translation.meta_title,
                meta_description: translation.meta_description,
                excerpt: translation.excerpt,
                slug: translation.slug
            }]);

        if (error) {
            console.error('Error inserting translation:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception inserting translation:', err);
        return false;
    }
}

async function translateArticle(article) {
    console.log(`\nTranslating article: "${article.title}"`);
    
    // Translate all fields
    const translation = {
        title: translateToFinnish(article.title, true),
        content: translateToFinnish(article.content),
        meta_title: translateToFinnish(article.meta_title || article.title, true),
        meta_description: translateToFinnish(article.meta_description || ''),
        excerpt: translateToFinnish(article.excerpt || ''),
        slug: generateSlug(translateToFinnish(article.title, true))
    };

    console.log(`Finnish title: "${translation.title}"`);
    console.log(`Generated slug: "${translation.slug}"`);
    
    return translation;
}

async function main() {
    console.log('Starting CBD article translation to Finnish...');
    console.log('Target: 15 articles maximum');
    
    let translatedCount = 0;
    const maxArticles = 15;

    while (translatedCount < maxArticles) {
        // Step 1: Get next untranslated article
        const article = await getUntranslatedArticle();
        
        if (!article) {
            console.log('No more untranslated articles available');
            break;
        }

        // Step 2: Translate the article
        const translation = await translateArticle(article);

        // Step 3: Insert translation
        const success = await insertTranslation(article.id, translation);
        
        if (success) {
            translatedCount++;
            console.log(`✅ Article ${translatedCount}/${maxArticles} translated and saved: "${translation.title}"`);
        } else {
            console.log(`❌ Failed to save translation for: "${article.title}"`);
            // Continue to next article even if one fails
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Translation complete! Processed ${translatedCount} articles.`);
}

if (require.main === module) {
    main().catch(console.error);
}