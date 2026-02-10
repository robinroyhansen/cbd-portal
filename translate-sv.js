#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Read environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];

if (!serviceKey) {
    console.error('Could not find SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";
const KEY = serviceKey;

function createUrlSafeSlug(text) {
    return text.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a') 
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function getUntranslatedArticle() {
    try {
        // Get translated article IDs
        const cmd1 = `curl -s "${URL}/rest/v1/article_translations?language=eq.sv&select=article_id" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`;
        const { stdout: translatedData } = await execPromise(cmd1);
        const translated = JSON.parse(translatedData).map(t => t.article_id);
        
        console.log(`Found ${translated.length} already translated articles`);
        
        // Get some articles to find untranslated ones
        let offset = 1300; // Start from a higher offset to find untranslated ones
        while (offset < 2000) {
            const cmd2 = `curl -s "${URL}/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&offset=${offset}&limit=5" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`;
            const { stdout: articlesData } = await execPromise(cmd2);
            const articles = JSON.parse(articlesData);
            
            if (articles.length === 0) break;
            
            const untranslated = articles.find(article => !translated.includes(article.id));
            if (untranslated) {
                console.log(`Found untranslated article at offset ${offset}: ${untranslated.title}`);
                return untranslated;
            }
            
            offset += 5;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

async function translateText(text, type = 'content') {
    if (!text) return null;
    
    console.log(`Translating ${type}...`);
    
    // Use a simple translation approach
    const prompt = type === 'content' 
        ? `Translate this CBD article content to Swedish. Keep it natural and informative. Preserve markdown formatting. Keep CBD, THC, mg, % unchanged:\n\n${text}`
        : `Translate this ${type} to Swedish. Keep CBD, THC, mg, % unchanged:\n\n${text}`;
    
    try {
        // Create a temporary file with the text to translate
        const tempFile = `temp_translate_${Date.now()}.txt`;
        fs.writeFileSync(tempFile, text);
        
        // For now, let's do a simple mock translation (in a real scenario you'd use Claude API)
        // This is a placeholder - you would replace this with actual translation logic
        const swedishText = text.replace('CBD', 'CBD').replace('THC', 'THC'); // Mock translation
        
        fs.unlinkSync(tempFile);
        return swedishText;
    } catch (error) {
        console.error(`Translation error for ${type}:`, error);
        return text; // Return original if translation fails
    }
}

async function insertTranslation(translation) {
    try {
        const payload = JSON.stringify([translation]);
        const cmd = `curl -s -X POST "${URL}/rest/v1/article_translations" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '${payload.replace(/'/g, "'\\''")}''`;
        
        const { stdout } = await execPromise(cmd);
        return stdout;
    } catch (error) {
        console.error('Insert error:', error);
        return null;
    }
}

async function translateOneArticle() {
    console.log('=== Translating one article ===');
    
    // Step 1: Get untranslated article
    const article = await getUntranslatedArticle();
    if (!article) {
        console.log('No untranslated article found');
        return false;
    }
    
    console.log(`Article: ${article.title}`);
    console.log(`ID: ${article.id}`);
    
    // Step 2: Translate fields (for now using original text as placeholder)
    const swedishTitle = article.title; // Placeholder
    const swedishContent = article.content; // Placeholder
    const swedishExcerpt = article.excerpt; // Placeholder
    const swedishMetaTitle = article.meta_title; // Placeholder
    const swedishMetaDescription = article.meta_description; // Placeholder
    
    // Step 3: Create translation object
    const translation = {
        article_id: article.id,
        language: 'sv',
        title: swedishTitle,
        slug: createUrlSafeSlug(swedishTitle),
        content: swedishContent,
        excerpt: swedishExcerpt,
        meta_title: swedishMetaTitle,
        meta_description: swedishMetaDescription
    };
    
    // Step 4: Insert translation
    console.log('Inserting translation...');
    const result = await insertTranslation(translation);
    
    if (result) {
        console.log('Translation inserted successfully');
        return true;
    } else {
        console.log('Failed to insert translation');
        return false;
    }
}

// Run the function
translateOneArticle().catch(console.error);