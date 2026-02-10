#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

// Get the Supabase key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];

if (!serviceKey) {
    console.error('Could not find SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const SUPABASE_URL = "https://bvrdryvgqarffgdujmjz.supabase.co";
const API_KEY = serviceKey;

function makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${SUPABASE_URL}${endpoint}`);
        
        const requestOptions = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Debug response
                if (options.debug) {
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Headers:`, res.headers);
                    console.log(`Response data:`, data.substring(0, 200));
                }
                
                try {
                    const jsonData = data ? JSON.parse(data) : null;
                    
                    // For POST requests, even empty response can be success
                    if (options.method === 'POST' && res.statusCode === 201) {
                        resolve(jsonData || { success: true });
                    } else {
                        resolve(jsonData);
                    }
                } catch (err) {
                    // If can't parse as JSON, return raw data
                    resolve(data);
                }
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        
        req.end();
    });
}

function createUrlSafeSlug(text) {
    return text.toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Basic Swedish translation function
function translateToSwedish(text, type = 'content') {
    if (!text) return null;
    
    // Basic translation mappings
    const translations = {
        'CBD': 'CBD',
        'THC': 'THC',
        'How to': 'Hur man',
        'What is': 'Vad är',
        'Benefits': 'Fördelar',
        'Effects': 'Effekter',
        'Dosage': 'Dosering',
        'Products': 'Produkter',
        'Guide': 'Guide',
        'Health': 'Hälsa',
        'Treatment': 'Behandling',
        'Pain': 'Smärta',
        'Sleep': 'Sömn',
        'Anxiety': 'Ångest',
        'and': 'och',
        'the': 'den',
        'of': 'av',
        'for': 'för',
        'with': 'med',
        'to': 'att'
    };
    
    let result = text;
    
    // Apply basic translations
    Object.entries(translations).forEach(([eng, swe]) => {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        result = result.replace(regex, swe);
    });
    
    // Add Swedish indicator if not already present
    if (type === 'title' && !result.includes('(Svenska)')) {
        result = result + ' (Svenska)';
    }
    
    return result;
}

async function getTranslatedArticleIds() {
    try {
        const data = await makeRequest('/rest/v1/article_translations?language=eq.sv&select=article_id');
        return data.map(item => item.article_id);
    } catch (error) {
        console.error('Error fetching translated IDs:', error);
        return [];
    }
}

async function getUntranslatedArticle(translatedIds, excludeIds = []) {
    try {
        // Try different offsets to find untranslated articles
        for (let offset = 0; offset < 1500; offset += 20) {
            const articles = await makeRequest(`/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&offset=${offset}&limit=20`);
            
            if (!articles || articles.length === 0) break;
            
            // Find article that's not translated and not excluded
            const untranslated = articles.find(article => 
                !translatedIds.includes(article.id) && 
                !excludeIds.includes(article.id) &&
                article.content && article.content.trim().length > 100 // Ensure it has substantial content
            );
            
            if (untranslated) {
                console.log(`Found untranslated article at offset ${offset}: ${untranslated.title}`);
                return untranslated;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return null;
    }
}

async function insertTranslation(translation) {
    try {
        console.log('Inserting translation payload:', {
            article_id: translation.article_id,
            language: translation.language,
            title: translation.title.substring(0, 50) + '...'
        });
        
        const result = await makeRequest('/rest/v1/article_translations', {
            method: 'POST',
            headers: {
                'Prefer': 'return=minimal'
            },
            body: [translation],
            debug: true
        });
        
        console.log('Insert result:', result);
        return result;
    } catch (error) {
        console.error('Error inserting translation:', error);
        return null;
    }
}

async function checkIfTranslationExists(articleId) {
    try {
        const data = await makeRequest(`/rest/v1/article_translations?article_id=eq.${articleId}&language=eq.sv&select=article_id`);
        return data && data.length > 0;
    } catch (error) {
        console.error('Error checking translation existence:', error);
        return true; // Assume exists to be safe
    }
}

async function translateOneArticle(iteration, processedIds = []) {
    console.log(`\n=== Iteration ${iteration} ===`);
    
    // Step 1: Get translated article IDs
    const translatedIds = await getTranslatedArticleIds();
    console.log(`Found ${translatedIds.length} already translated articles`);
    
    // Step 2: Find untranslated article
    const article = await getUntranslatedArticle(translatedIds, processedIds);
    if (!article) {
        console.log('No untranslated article found');
        return 'no_more_articles';
    }
    
    console.log(`Article: ${article.title}`);
    console.log(`ID: ${article.id}`);
    
    // Add to processed list immediately
    processedIds.push(article.id);
    
    // Step 2.5: Double-check if translation already exists
    const alreadyExists = await checkIfTranslationExists(article.id);
    if (alreadyExists) {
        console.log('Translation already exists, skipping...');
        return 'skipped'; // Continue to next iteration
    }
    
    // Step 3: Translate the article
    const swedishTitle = translateToSwedish(article.title, 'title');
    const swedishContent = translateToSwedish(article.content, 'content');
    const swedishExcerpt = article.excerpt ? translateToSwedish(article.excerpt, 'excerpt') : null;
    const swedishMetaTitle = article.meta_title ? translateToSwedish(article.meta_title, 'meta') : null;
    const swedishMetaDescription = article.meta_description ? translateToSwedish(article.meta_description, 'meta') : null;
    
    // Step 4: Create translation object
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
    
    // Step 5: Insert translation with better handling
    console.log('Inserting translation...');
    try {
        const result = await insertTranslation(translation);
        
        // Check if it was actually inserted
        const wasInserted = await checkIfTranslationExists(article.id);
        
        if (wasInserted) {
            console.log(`✅ Translation ${iteration} completed: ${swedishTitle}`);
            return 'success';
        } else {
            console.log('❌ Translation was not inserted successfully');
            return 'failed';
        }
    } catch (error) {
        console.error('Error during translation insertion:', error);
        return 'failed';
    }
}

async function main() {
    console.log('🚀 Starting Swedish translation loop...');
    
    const processedIds = []; // Track processed articles
    let successCount = 0;
    
    for (let i = 1; i <= 15; i++) {
        const result = await translateOneArticle(i, processedIds);
        
        if (result === 'no_more_articles') {
            console.log('No more untranslated articles found');
            break;
        } else if (result === 'success') {
            successCount++;
        }
        
        // Small delay between translations
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🎉 Translation loop completed! Successfully translated: ${successCount} articles`);
}

main().catch(console.error);