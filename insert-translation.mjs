import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function insertTranslation(translationFile) {
  try {
    console.log(`Reading translation from ${translationFile}`)
    const translationData = JSON.parse(fs.readFileSync(translationFile, 'utf8'))
    
    console.log(`Inserting translation for article ${translationData.article_id}`)
    console.log(`Title: ${translationData.title}`)
    console.log(`Language: ${translationData.language}`)
    
    const { data, error } = await supabase
      .from('article_translations')
      .upsert(translationData, {
        onConflict: 'article_id,language'
      })
      .select()

    if (error) {
      console.error(`✗ Insert failed:`, error)
      throw error
    }

    console.log(`✓ Successfully inserted translation`)
    console.log(`  - Article ID: ${translationData.article_id}`)
    console.log(`  - Language: ${translationData.language}`) 
    console.log(`  - Title: ${translationData.title}`)
    console.log(`  - Slug: ${translationData.slug}`)
    console.log(`  - Meta title length: ${translationData.meta_title.length}/60`)
    console.log(`  - Meta description length: ${translationData.meta_description.length}/160`)
    console.log(`  - Content length: ${translationData.content.length} characters`)
    
    return data

  } catch (error) {
    console.error('Error:', error.message)
    throw error
  }
}

// Get filename from command line argument or use default
const filename = process.argv[2] || 'translation1.json'

insertTranslation(filename)
  .then(() => {
    console.log(`\\n🎉 ${filename} inserted successfully!`)
  })
  .catch(error => {
    console.error('\\n💥 Failed to insert translation:', error)
  })