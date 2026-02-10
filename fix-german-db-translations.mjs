#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixGermanTranslations() {
  console.log('🔧 Starting German Translation Database Fixes...')
  
  // Issue 1: Fix 2 garbled articles in database
  console.log('\n1️⃣ Fixing garbled article translations...')
  
  // Get article IDs
  const morningArticleId = 'defd041b-5b1f-40ad-949a-609093e494be'
  const buyingArticleId = '1f4ad345-fa4d-4979-8e4b-3bc1b4cc16bd'
  
  // Fix cbd-morning-routine article
  const morningRoutineExcerpt = "Erfahren Sie, wie Sie CBD in Ihre Morgenroutine integrieren können, um Ruhe, Fokus und Stressprävention den ganzen Tag über zu fördern."
  
  const { error: error1 } = await supabase
    .from('article_translations')
    .update({ excerpt: morningRoutineExcerpt })
    .eq('language', 'de')
    .eq('article_id', morningArticleId)
  
  if (error1) {
    console.error('❌ Error updating cbd-morning-routine:', error1)
  } else {
    console.log('✅ Fixed cbd-morning-routine article excerpt')
  }
  
  // Fix cbd-buying-mistakes article  
  const buyingMistakesExcerpt = "Lernen Sie die häufigsten CBD-Kauffehler kennen und wie Sie diese vermeiden können, um eine bessere Erfahrung zu machen."
  
  const { error: error2 } = await supabase
    .from('article_translations')
    .update({ excerpt: buyingMistakesExcerpt })
    .eq('language', 'de')
    .eq('article_id', buyingArticleId)
  
  if (error2) {
    console.error('❌ Error updating cbd-buying-mistakes:', error2)
  } else {
    console.log('✅ Fixed cbd-buying-mistakes article excerpt')
  }
  
  // Issue 2: Fix glossary encoding bug
  console.log('\n2️⃣ Fixing glossary encoding bug...')
  
  // Check both tables for the encoding issue
  const { data: glossaryTerms, error: glossaryError1 } = await supabase
    .from('glossary_translations')
    .select('*')
    .eq('language', 'de')
    .like('term', '%ZwangsstÃ¶rung%')
  
  if (glossaryTerms && glossaryTerms.length > 0) {
    console.log(`Found ${glossaryTerms.length} terms with encoding issues in glossary_translations`)
    
    for (const term of glossaryTerms) {
      const { error } = await supabase
        .from('glossary_translations')
        .update({ term: 'Zwangsstörung' })
        .eq('id', term.id)
      
      if (error) {
        console.error('❌ Error fixing glossary_translations term:', error)
      } else {
        console.log('✅ Fixed glossary_translations term encoding')
      }
    }
  }
  
  // Also check kb_glossary table
  const { data: kbGlossaryTerms, error: glossaryError2 } = await supabase
    .from('kb_glossary')
    .select('*')
    .like('term', '%ZwangsstÃ¶rung%')
  
  if (kbGlossaryTerms && kbGlossaryTerms.length > 0) {
    console.log(`Found ${kbGlossaryTerms.length} terms with encoding issues in kb_glossary`)
    
    for (const term of kbGlossaryTerms) {
      const { error } = await supabase
        .from('kb_glossary')
        .update({ term: 'Zwangsstörung', display_name: 'Zwangsstörung' })
        .eq('id', term.id)
      
      if (error) {
        console.error('❌ Error fixing kb_glossary term:', error)
      } else {
        console.log('✅ Fixed kb_glossary term encoding')
      }
    }
  }
  
  if (!glossaryTerms?.length && !kbGlossaryTerms?.length) {
    console.log('ℹ️ No terms with encoding issues found (already fixed?)')
  }
  
  console.log('\n🎉 Database fixes completed!')
}

// Verify current translations
async function verifyTranslations() {
  console.log('\n🔍 Verifying current article translations...')
  
  const articleIds = [
    { id: 'defd041b-5b1f-40ad-949a-609093e494be', slug: 'cbd-morning-routine' },
    { id: '1f4ad345-fa4d-4979-8e4b-3bc1b4cc16bd', slug: 'cbd-buying-mistakes' }
  ]
  
  for (const article of articleIds) {
    const { data, error } = await supabase
      .from('article_translations')
      .select('excerpt')
      .eq('language', 'de')
      .eq('article_id', article.id)
      .single()
    
    if (error) {
      console.log(`❌ No German translation found for ${article.slug}`)
    } else {
      console.log(`📄 ${article.slug}: "${data.excerpt?.substring(0, 80)}..."`)
    }
  }
}

async function main() {
  await verifyTranslations()
  await fixGermanTranslations()
}

main().catch(console.error)