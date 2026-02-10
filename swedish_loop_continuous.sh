#!/bin/bash

# Swedish Translation Loop - ONE AT A TIME
URL="https://bvrdryvgqarffgdujmjz.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY"

echo "🇸🇪 Starting Swedish Translation Loop - 15 articles"
echo "============================================="

for i in {1..15}; do
    echo ""
    echo "🔄 Iteration $i/15"
    echo "-------------------"
    
    # 1. Get currently translated article IDs
    echo "Fetching already translated Swedish article IDs..."
    TRANSLATED=$(curl -s "$URL/rest/v1/article_translations?language=eq.sv&select=article_id" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" | jq -r '[.[].article_id] | join(",")')
    
    if [ "$TRANSLATED" = "" ] || [ "$TRANSLATED" = "null" ]; then
        echo "No existing translations found, starting fresh..."
        WHERE_CLAUSE=""
    else
        WHERE_CLAUSE="&id=not.in.($TRANSLATED)"
        echo "Found $(echo $TRANSLATED | tr ',' '\n' | wc -l) existing translations"
    fi
    
    # 2. Fetch one untranslated article
    echo "Fetching next untranslated article..."
    ARTICLE=$(curl -s "$URL/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=1$WHERE_CLAUSE" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
    
    # Check if we got an article
    ARTICLE_COUNT=$(echo "$ARTICLE" | jq '. | length')
    if [ "$ARTICLE_COUNT" -eq 0 ]; then
        echo "❌ No more articles to translate! Stopping at iteration $i."
        break
    fi
    
    ARTICLE_ID=$(echo "$ARTICLE" | jq -r '.[0].id')
    ARTICLE_TITLE=$(echo "$ARTICLE" | jq -r '.[0].title')
    
    echo "📄 Article ID: $ARTICLE_ID"
    echo "📝 Title: $ARTICLE_TITLE"
    
    # Save article data for translation
    echo "$ARTICLE" | jq '.[0]' > "temp_article_${i}.json"
    
    echo "🔄 Translating to Swedish..."
    # Note: This will be done by Claude in the next step
    
    break  # For now, let's do one at a time
done