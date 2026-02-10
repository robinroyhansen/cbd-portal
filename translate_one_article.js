#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const URL = "https://bvrdryvgqarffgdujmjz.supabase.co";
const KEY = execSync("grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2 | tr -d '\"'", { encoding: 'utf-8' }).trim();

// Translation function using Claude
async function translateWithClaude(text, type = "content") {
    const prompt = `Translate the following ${type} to natural Swedish. Keep CBD/THC/mg/% terms unchanged. Preserve markdown formatting. For slugs, use only a-z, 0-9, hyphens (no å/ä/ö characters).

Text to translate:
${text}

Swedish translation:`;

    const tempFile = `temp_claude_${type}_${Date.now()}.txt`;
    fs.writeFileSync(tempFile, prompt);
    
    try {
        // Using claude CLI or API - adjust as needed
        const result = execSync(`echo '${prompt}' | anthropic messages --model claude-3-sonnet-20240229 --max-tokens 2000`, { 
            encoding: 'utf-8',
            timeout: 30000 
        });
        
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        
        return result.trim();
    } catch (error) {
        console.error(`Translation error for ${type}:`, error.message);
        
        // Clean up temp file
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        
        // Fallback simple translation
        return text.replace(/^/, 'Swedish: ');
    }
}

async function findAndTranslateOneArticle() {
    try {
        console.log("=== Finding untranslated article ===");
        
        let found = false;
        let article = null;
        
        // Try different offsets to find an untranslated article
        for (let offset = 1200; offset < 1400; offset += 50) {
            console.log(`Checking articles at offset ${offset}...`);
            
            const articlesJson = execSync(`curl -s "${URL}/rest/v1/kb_articles?select=id,slug,title,excerpt,meta_title,meta_description&order=id.asc&limit=50&offset=${offset}" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
            const articles = JSON.parse(articlesJson);
            
            for (const a of articles) {
                // Check if Swedish translation exists
                const translationsJson = execSync(`curl -s "${URL}/rest/v1/article_translations?article_id=eq.${a.id}&language=eq.sv&select=id" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
                const translations = JSON.parse(translationsJson);
                
                if (translations.length === 0) {
                    console.log(`✅ Found untranslated article: ${a.id}`);
                    console.log(`Title: ${a.title}`);
                    
                    // Get full article with content
                    const fullJson = execSync(`curl -s "${URL}/rest/v1/kb_articles?id=eq.${a.id}&select=*" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}"`, { encoding: 'utf-8' });
                    const fullData = JSON.parse(fullJson)[0];
                    
                    article = fullData;
                    found = true;
                    break;
                }
            }
            
            if (found) break;
        }
        
        if (!article) {
            console.log("❌ No untranslated articles found in this range");
            return;
        }
        
        console.log("\n=== Translating to Swedish ===");
        
        // Create URL-safe slug (no Swedish characters)
        const swedishSlug = article.slug.toLowerCase()
            .replace(/[åäö]/g, (match) => {
                const replacements = { 'å': 'a', 'ä': 'a', 'ö': 'o' };
                return replacements[match] || match;
            });
        
        console.log("Translating title...");
        const swedishTitle = await translateWithClaude(article.title, "title");
        
        console.log("Translating excerpt...");
        const swedishExcerpt = await translateWithClaude(article.excerpt, "excerpt");
        
        console.log("Translating meta title...");
        const swedishMetaTitle = await translateWithClaude(article.meta_title, "meta_title");
        
        console.log("Translating meta description...");
        const swedishMetaDescription = await translateWithClaude(article.meta_description, "meta_description");
        
        console.log("Translating content...");
        // Limit content to avoid token issues
        const contentToTranslate = article.content ? article.content.substring(0, 6000) : '';
        const swedishContent = await translateWithClaude(contentToTranslate, "content");
        
        const translation = {
            article_id: article.id,
            language: 'sv',
            slug: swedishSlug,
            title: swedishTitle,
            content: swedishContent,
            excerpt: swedishExcerpt,
            meta_title: swedishMetaTitle,
            meta_description: swedishMetaDescription,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log("\n=== Inserting Translation ===");
        
        const insertData = JSON.stringify([translation]).replace(/'/g, "'\\''");
        const insertCommand = `curl -s -X POST "${URL}/rest/v1/article_translations" -H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '${insertData}'`;
        
        const result = execSync(insertCommand, { encoding: 'utf-8' });
        console.log("Insert result:", result);
        
        console.log("\n🎉 Translation completed successfully!");
        console.log(`Article ID: ${article.id}`);
        console.log(`Original Title: ${article.title}`);
        console.log(`Swedish Title: ${swedishTitle}`);
        
        // Save details for debugging
        fs.writeFileSync(`translation_result_${Date.now()}.json`, JSON.stringify({
            original: article,
            translation: translation,
            result: result
        }, null, 2));
        
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

// Run the translation
findAndTranslateOneArticle().catch(console.error);