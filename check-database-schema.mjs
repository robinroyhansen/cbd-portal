#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function checkTables() {
  console.log('🔍 Checking database tables...')
  
  // Check for article-related tables
  const articleTables = ['articles', 'kb_articles', 'article_translations']
  
  for (const table of articleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}':`, error.message)
      } else {
        console.log(`✅ Table '${table}': Found ${Array.isArray(data) ? data.length : 'unknown'} records`)
        if (data && data.length > 0) {
          console.log(`   Columns:`, Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log(`❌ Table '${table}':`, e.message)
    }
  }
  
  // Check for glossary tables
  const glossaryTables = ['glossary', 'glossary_translations', 'kb_glossary']
  
  for (const table of glossaryTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}':`, error.message)
      } else {
        console.log(`✅ Table '${table}': Found ${Array.isArray(data) ? data.length : 'unknown'} records`)
        if (data && data.length > 0) {
          console.log(`   Columns:`, Object.keys(data[0]))
        }
      }
    } catch (e) {
      console.log(`❌ Table '${table}':`, e.message)
    }
  }
  
  // Search for articles with cbd-morning-routine or cbd-buying-mistakes
  console.log('\n🔎 Searching for mentioned articles...')
  
  const searchTables = ['kb_articles']
  for (const table of searchTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .or('slug.ilike.%cbd-morning-routine%,slug.ilike.%cbd-buying-mistakes%,title.ilike.%morgen%,title.ilike.%routine%,title.ilike.%kauf%,title.ilike.%fehler%')
      
      if (!error && data) {
        console.log(`📄 Found ${data.length} matching articles in '${table}':`)
        data.forEach(article => {
          console.log(`   - ${article.slug || article.title || 'Unknown'} (ID: ${article.id})`)
        })
      }
    } catch (e) {
      console.log(`❌ Error searching in '${table}':`, e.message)
    }
  }
}

checkTables().catch(console.error)