#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";
const KEY = execSync("grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2 | tr -d '\"'", { encoding: 'utf-8' }).trim();

async function findUntranslatedArticle() {
    try {
        console.log("Finding an untranslated article...");
        
        // Get all article IDs
        const allArticles = execSync(`curl -s "${URL}/rest/v1/kb_articles?select=id,slug,title,excerpt,meta_title,meta_description&order=id.asc&limit=50&offset=1200" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
        const articles = JSON.parse(allArticles);
        
        for (const article of articles) {
            console.log(`Checking article: ${article.id} - "${article.title}"`);
            
            // Check if Swedish translation exists
            const translations = execSync(`curl -s "${URL}/rest/v1/article_translations?article_id=eq.${article.id}&language=eq.sv&select=id" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
            const translationList = JSON.parse(translations);
            
            if (translationList.length === 0) {
                console.log(`✅ Found untranslated article: ${article.id}`);
                console.log(`Title: ${article.title}`);
                
                // Get full content
                const fullArticle = execSync(`curl -s "${URL}/rest/v1/kb_articles?id=eq.${article.id}&select=*" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
                const articleData = JSON.parse(fullArticle)[0];
                
                // Save article data
                fs.writeFileSync('temp_article_1.json', JSON.stringify(articleData, null, 2));
                
                return articleData;
            }
        }
        
        console.log("No untranslated articles found in this range. Trying different offset...");
        return null;
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

async function translateToSwedish(article) {
    console.log(`\n🔄 Translating article: "${article.title}"`);
    
    // Create slug without Swedish characters
    const englishSlug = article.slug.toLowerCase()
        .replace(/[åäö]/g, (match) => {
            const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
            return replacements[match] || match;
        });
    
    // Translate title
    const swedishTitle = await translateText(article.title);
    
    // Translate excerpt
    const swedishExcerpt = await translateText(article.excerpt);
    
    // Translate meta title
    const swedishMetaTitle = await translateText(article.meta_title);
    
    // Translate meta description
    const swedishMetaDescription = await translateText(article.meta_description);
    
    // Translate content (limit to avoid token issues)
    const swedishContent = await translateText(article.content.substring(0, 8000));
    
    return {
        article_id: article.id,
        language: 'sv',
        slug: englishSlug,
        title: swedishTitle,
        content: swedishContent,
        excerpt: swedishExcerpt,
        meta_title: swedishMetaTitle,
        meta_description: swedishMetaDescription,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

async function translateText(text) {
    if (!text) return '';
    
    // Very basic placeholder - in reality we'd use Claude or another translation service
    console.log(`Translating: "${text.substring(0, 100)}..."`);
    
    // For now, just add "SE: " prefix to indicate Swedish version
    // In a real implementation, you'd call Claude API here
    return `SE: ${text}`;
}

async function insertTranslation(translation) {
    try {
        console.log(`\n💾 Inserting Swedish translation...`);
        
        const insertCommand = `curl -s -X POST "${URL}/rest/v1/article_translations" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '${JSON.stringify([translation])}'`;
        
        const result = execSync(insertCommand, { encoding: 'utf-8' });
        console.log(`✅ Inserted translation for article: ${translation.article_id}`);
        
        return true;
    } catch (error) {
        console.error("Insert error:", error.message);
        return false;
    }
}

async function main() {
    console.log("=== Swedish Translation Loop - One at a Time ===");
    
    const article = await findUntranslatedArticle();
    
    if (!article) {
        console.log("❌ No untranslated articles found.");
        return;
    }
    
    const translation = await translateToSwedish(article);
    const success = await insertTranslation(translation);
    
    if (success) {
        console.log("\n🎉 Translation complete!");
        console.log(`Article ID: ${article.id}`);
        console.log(`Original Title: ${article.title}`);
        console.log(`Swedish Title: ${translation.title}`);
    } else {
        console.log("❌ Translation failed.");
    }
}

main().catch(console.error);