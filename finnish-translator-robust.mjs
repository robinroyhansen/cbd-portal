import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env.local') })

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Get the full article content first
async function getFullArticleContent(articleId) {
  const { data, error } = await supabase
    .from('kb_articles')
    .select('content')
    .eq('id', articleId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch content for article ${articleId}: ${error.message}`)
  }

  return data.content
}

async function translateMetadata(article) {
  console.log(`Translating metadata for: ${article.title}`)
  
  const prompt = `Translate this CBD article metadata to Finnish. Follow these requirements exactly:

1. Natural Finnish, not machine-translation sounding
2. meta_title should be ≤60 chars, meta_description ≤160 chars  
3. Generate appropriate Finnish slug from title (use only a-z, 0-9, hyphens)

Article metadata to translate:

TITLE: ${article.title}
EXCERPT: ${article.excerpt}
META_TITLE: ${article.meta_title}
META_DESCRIPTION: ${article.meta_description}

Please provide the translation in this exact JSON format:
{
  "title": "Finnish title",
  "slug": "finnish-slug-here",
  "excerpt": "Finnish excerpt", 
  "meta_title": "Finnish meta title (≤60 chars)",
  "meta_description": "Finnish meta description (≤160 chars)"
}`

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  })

  const response = completion.content[0].text
  const jsonMatch = response.match(/\\{[\\s\\S]*\\}/)
  
  if (!jsonMatch) {
    throw new Error('No JSON found in metadata translation response')
  }

  return JSON.parse(jsonMatch[0])
}

async function translateContent(content, title) {
  console.log(`Translating content for: ${title}`)
  console.log(`Content length: ${content.length} characters`)
  
  // Split content into chunks if it's too long
  const maxChunkSize = 4000 // Conservative limit for API
  
  if (content.length <= maxChunkSize) {
    // Single chunk translation
    const prompt = `Translate this CBD article content to Finnish. Follow these requirements exactly:

1. Natural Finnish, not machine-translation sounding
2. Keep markdown formatting intact
3. Keep internal links like /glossary/xxx and /conditions/xxx unchanged
4. Translate comprehensively — full articles, not summaries

Article content to translate:

${content}

Please provide ONLY the translated content, maintaining all original formatting.`

    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }]
    })

    return completion.content[0].text
  } else {
    // Multi-chunk translation - split by paragraphs
    const sections = content.split('\\n\\n')
    const translatedSections = []
    
    let currentChunk = ''
    
    for (const section of sections) {
      if ((currentChunk + section).length > maxChunkSize && currentChunk) {
        // Translate current chunk
        const translatedChunk = await translateChunk(currentChunk)
        translatedSections.push(translatedChunk)
        currentChunk = section
        
        // Small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        currentChunk += (currentChunk ? '\\n\\n' : '') + section
      }
    }
    
    // Translate final chunk
    if (currentChunk) {
      const translatedChunk = await translateChunk(currentChunk)
      translatedSections.push(translatedChunk)
    }
    
    return translatedSections.join('\\n\\n')
  }
}

async function translateChunk(chunk) {
  const prompt = `Translate this CBD article content chunk to Finnish. Follow these requirements exactly:

1. Natural Finnish, not machine-translation sounding
2. Keep markdown formatting intact  
3. Keep internal links like /glossary/xxx and /conditions/xxx unchanged
4. Translate comprehensively

Content chunk:

${chunk}

Please provide ONLY the translated content, maintaining all original formatting.`

  const completion = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }]
  })

  return completion.content[0].text
}

async function processArticle(articleInfo) {
  console.log(`\\n${'='.repeat(60)}`)
  console.log(`Processing article: ${articleInfo.title}`)
  console.log(`Article ID: ${articleInfo.id}`)
  console.log(`${'='.repeat(60)}`)
  
  try {
    // Step 1: Get full content from database
    console.log('Step 1: Fetching full content...')
    const fullContent = await getFullArticleContent(articleInfo.id)
    
    // Step 2: Translate metadata
    console.log('Step 2: Translating metadata...')
    const metadataTranslation = await translateMetadata(articleInfo)
    
    // Step 3: Translate content
    console.log('Step 3: Translating content...')
    const contentTranslation = await translateContent(fullContent, articleInfo.title)
    
    // Step 4: Combine and prepare for database
    const finalTranslation = {
      article_id: articleInfo.id,
      language: 'fi',
      title: metadataTranslation.title,
      slug: metadataTranslation.slug,
      content: contentTranslation,
      excerpt: metadataTranslation.excerpt,
      meta_title: metadataTranslation.meta_title,
      meta_description: metadataTranslation.meta_description
    }
    
    console.log('Step 4: Inserting into database...')
    const { data, error } = await supabase
      .from('article_translations')
      .upsert(finalTranslation, {
        onConflict: 'article_id,language'
      })
      .select()

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log(`✓ SUCCESS: Article translated and saved`)
    console.log(`  Finnish Title: ${metadataTranslation.title}`)
    console.log(`  Slug: ${metadataTranslation.slug}`)
    console.log(`  Meta title length: ${metadataTranslation.meta_title.length}/60`)
    console.log(`  Meta description length: ${metadataTranslation.meta_description.length}/160`)
    console.log(`  Content length: ${contentTranslation.length} characters`)
    
    return true
    
  } catch (error) {
    console.error(`✗ FAILED: ${error.message}`)
    throw error
  }
}

async function main() {
  // The 15 articles to translate (oldest first)
  const articlesToTranslate = [
    {
      "id": "eec8d839-859a-44c5-a7b8-5de9aafd475b",
      "title": "The Science of CBD: How Cannabidiol Works in the Body",
      "excerpt": "Discover the science behind CBD. Learn how cannabidiol interacts with your endocannabinoid system, its multiple receptor targets, and why bioavailability matters for therapeutic effects.",
      "meta_title": "How CBD Works: The Science of Cannabidiol Explained",
      "meta_description": "Learn how CBD interacts with your endocannabinoid system, its 65+ molecular targets, bioavailability by delivery method, and why the entourage effect matters."
    },
    {
      "id": "f4dda161-607a-4167-b9f7-69bba8cf2643", 
      "title": "What is CBD Balm?",
      "excerpt": "CBD balm is a thick, wax-based topical containing cannabidiol for targeted skin application. Its rich texture creates a protective barrier, making it ideal for dry skin and concentrated relief.",
      "meta_title": "What is CBD Balm? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what CBD balm is, how it differs from creams and salves, and how to use it effectively. Complete guide to benefits, ingredients, and buying tips."
    },
    {
      "id": "e31dfe2f-8836-48fe-a863-279d5ac55fc2",
      "title": "What are CBD Topicals?", 
      "excerpt": "CBD topicals are products applied directly to your skin—creams, balms, salves, lotions, and patches. They provide localised CBD effects without entering your bloodstream.",
      "meta_title": "What are CBD Topicals? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what CBD topicals are, how they work, and which type is right for you. Complete guide comparing creams, balms, salves, lotions, and patches."
    },
    {
      "id": "e989566c-e67a-45b6-93c3-3d9aa310e7ed",
      "title": "What is a CBD Vape Pen?",
      "excerpt": "CBD vape pens are portable, easy-to-use devices for inhaling cannabidiol. Learn about disposable vs rechargeable options, how they work, and what to look for when buying.",
      "meta_title": "What is a CBD Vape Pen? Complete Guide [2026] | CBD Portal", 
      "meta_description": "Learn what CBD vape pens are, how they work, and why they're popular for beginners. Discover types, benefits, and how to choose the right CBD vape pen."
    },
    {
      "id": "f262ed81-c4eb-4fcd-a659-1426c691de5c",
      "title": "What is CBD E-Liquid?",
      "excerpt": "CBD e-liquid (vape juice) is specifically formulated for vaporization. Learn how it works, what ingredients to look for, and the difference between CBD e-liquid and regular CBD oil.",
      "meta_title": "What is CBD E-Liquid? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what CBD e-liquid is, how it differs from CBD oil, and how to use it safely. Discover ingredients, strengths, and tips for choosing quality CBD vape juice."
    },
    {
      "id": "e660f044-6cfa-4664-9b89-8993cdea6852",
      "title": "What are CBD Drinks?",
      "excerpt": "CBD drinks are ready-to-consume beverages infused with cannabidiol. Learn about types like CBD water, sparkling drinks, and teas, plus what to look for when buying.",
      "meta_title": "What are CBD Drinks? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what CBD drinks are, how they work, and the different types available. Discover benefits, onset times, and how to choose quality CBD beverages."
    },
    {
      "id": "e5a36af9-3bbc-4d54-be5b-74530be96b5b",
      "title": "What is Nano CBD?", 
      "excerpt": "Nano CBD uses nanotechnology to create microscopic CBD particles for faster, more efficient absorption. Learn how it works and whether it's worth the premium price.",
      "meta_title": "What is Nano CBD? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what nano CBD is, how nanotechnology improves absorption, and whether it's worth choosing over regular CBD. Discover benefits, science, and buying tips."
    },
    {
      "id": "ee594ad0-a229-48ef-887c-66c467726690",
      "title": "What is CBD Skincare?",
      "excerpt": "CBD skincare products apply cannabidiol topically for potential skin benefits. Learn about serums, moisturizers, cleansers, and what the research says.",
      "meta_title": "What is CBD Skincare? Complete Guide [2026] | CBD Portal",
      "meta_description": "Learn what CBD skincare is, the potential benefits for skin, and what products are available. Discover how CBD works topically and what to look for when buying."
    },
    {
      "id": "e133f0be-2664-4efa-9838-9baaeb5de54c",
      "title": "Full Spectrum vs. Broad Spectrum vs. Isolate: CBD Types Compared",
      "excerpt": "Compare full spectrum, broad spectrum, and CBD isolate. Learn which type is best for drug testing, maximum effects, or THC sensitivity—plus how the entourage effect impacts each.",
      "meta_title": "Full Spectrum vs Broad Spectrum vs CBD Isolate: Complete Guide", 
      "meta_description": "Understand the differences between full spectrum, broad spectrum, and CBD isolate. Learn which CBD type is right for your needs, drug testing concerns, and goals."
    },
    {
      "id": "df0c9cec-31be-464a-bdc5-90e852904780",
      "title": "What Is THC? The Complete Guide to Tetrahydrocannabinol",
      "excerpt": "Learn what THC is, how it produces its effects, medical uses, risks, and legal status. Understand why THC gets you high while CBD doesn't.",
      "meta_title": "What Is THC (Tetrahydrocannabinol)? Complete Guide",
      "meta_description": "Understand what THC is, how it works in the brain, its effects and risks, medical uses, and legal status. Learn how THC differs from CBD."
    },
    {
      "id": "f7fb8c53-6b5d-406f-91c8-fde02e083b35",
      "title": "What is Borneol? The Cooling Camphor Terpene",
      "excerpt": "Borneol has a cooling, camphor-like aroma used in traditional medicine for centuries. Learn about its potential analgesic and stress-relieving properties.",
      "meta_title": "What is Borneol? The Cooling Camphor Terpene",
      "meta_description": "Borneol is a cooling, camphor-like terpene used in traditional medicine. Learn about its analgesic properties."
    },
    {
      "id": "f23ee3ff-b2d7-41ee-af68-a1838a8cd6a0", 
      "title": "What is Sabinene? The Spicy, Piney Terpene",
      "excerpt": "Sabinene has a complex spicy, piney aroma with citrus notes. Learn about this terpene found in black pepper, nutmeg, and some cannabis strains.",
      "meta_title": "What is Sabinene? The Spicy, Piney Terpene", 
      "meta_description": "Sabinene is a spicy, piney terpene found in black pepper and cannabis. Learn about its antioxidant properties."
    },
    {
      "id": "e2bb9adf-38f9-45d9-94d4-98fd29c4e0c5",
      "title": "What Is CBG? The \"Mother Cannabinoid\" Explained",
      "excerpt": "Learn about CBG (cannabigerol)—the \"mother cannabinoid\" that all others derive from. Discover CBG's unique antibacterial, anti-inflammatory, and neuroprotective properties.",
      "meta_title": "What Is CBG (Cannabigerol)? Benefits, Uses & Research",
      "meta_description": "Understand CBG, the \"mother cannabinoid\" precursor to CBD and THC. Learn about its antibacterial, anti-inflammatory properties and how it compares to CBD."
    },
    {
      "id": "e176fb80-561e-4484-bb18-3470b8c440ff",
      "title": "How Terpenes Affect CBD Effects", 
      "excerpt": "Different terpenes can make CBD feel more relaxing, energising, or focused. Learn how terpene profiles shape your CBD experience.",
      "meta_title": "How Terpenes Affect CBD Effects | Relaxing vs Energising",
      "meta_description": "Terpenes shape how CBD affects you. Learn which terpenes make CBD relaxing, energising, or focused."
    },
    {
      "id": "efa0abaa-6b3e-4974-9450-c21546208b66",
      "title": "Best Terpenes for Energy: A Complete Guide",
      "excerpt": "Certain terpenes like limonene and pinene may boost energy and combat fatigue. Learn which terpenes provide natural energy support with CBD.",
      "meta_title": "Best Terpenes for Energy | Limonene, Pinene & More",
      "meta_description": "Discover the best terpenes for energy including limonene and pinene. Learn how to choose CBD products that boost natural energy."
    }
  ]

  console.log(`Starting Finnish translation batch`)
  console.log(`Articles to translate: ${articlesToTranslate.length}`)
  console.log(`Direction: ASC (oldest first)`)
  console.log(`Language: Finnish (fi)`)
  console.log(`\\nBegin processing...\\n`)

  let successCount = 0
  let failures = []

  for (const [index, article] of articlesToTranslate.entries()) {
    try {
      console.log(`\\n\\n[${index + 1}/${articlesToTranslate.length}] Starting article: ${article.title}`)
      
      await processArticle(article)
      successCount++
      
      console.log(`\\n✓ Article ${index + 1} completed successfully`)
      
      // Delay between articles to be nice to the API
      if (index < articlesToTranslate.length - 1) {
        console.log(`\\nWaiting 3 seconds before next article...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
      
    } catch (error) {
      console.error(`\\n✗ Article ${index + 1} failed: ${error.message}`)
      failures.push({
        index: index + 1,
        title: article.title,
        error: error.message
      })
    }
  }

  // Final summary
  console.log(`\\n\\n${'='.repeat(80)}`)
  console.log('FINNISH TRANSLATION BATCH COMPLETE')
  console.log(`${'='.repeat(80)}`)
  console.log(`✓ Successfully translated: ${successCount}/${articlesToTranslate.length} articles`)
  
  if (failures.length > 0) {
    console.log(`\\n✗ Failed translations (${failures.length}):`)
    failures.forEach(failure => {
      console.log(`  ${failure.index}. ${failure.title}`)
      console.log(`     Error: ${failure.error}`)
    })
  } else {
    console.log(`\\n🎉 All articles translated successfully!`)
  }
  
  console.log(`\\n📊 Summary:`)
  console.log(`   - Language: Finnish (fi)`)
  console.log(`   - Direction: ASC (oldest first)`)
  console.log(`   - Success Rate: ${((successCount/articlesToTranslate.length) * 100).toFixed(1)}%`)
  console.log(`   - Total Inserted: ${successCount} translations`)
  console.log(`\\n✅ Finnish translation batch complete!`)
}

main().catch(error => {
  console.error('\\n💥 FATAL ERROR:', error)
  process.exit(1)
})