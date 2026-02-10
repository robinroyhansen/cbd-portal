#!/bin/bash

URL="https://bvrdryvgqarffgdujmjz.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY"

echo "🔥 Swedish CBD Translation Loop - 15 Articles"
echo "============================================="

for i in {1..15}; do
    echo ""
    echo "=== ITERATION $i/15 ==="
    
    # Get a random untranslated article
    OFFSET=$((RANDOM % 500 + 800))  # Random offset between 800-1300
    
    echo "Fetching article at offset $OFFSET..."
    
    # Fetch article and clean for JSON parsing
    ARTICLE_RAW=$(curl -s "$URL/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=1&offset=$OFFSET" -H "apikey: $KEY" -H "Authorization: Bearer $KEY")
    
    # Clean the content by replacing problematic characters
    ARTICLE_CLEAN=$(echo "$ARTICLE_RAW" | tr -cd '[:print:]\n\t' | sed 's/[\x00-\x1f\x7f]//g')
    
    # Try to extract article data
    ARTICLE_ID=$(echo "$ARTICLE_CLEAN" | jq -r '.[0].id' 2>/dev/null)
    ARTICLE_TITLE=$(echo "$ARTICLE_CLEAN" | jq -r '.[0].title' 2>/dev/null)
    
    if [ "$ARTICLE_ID" = "null" ] || [ "$ARTICLE_ID" = "" ]; then
        echo "❌ Failed to get article at offset $OFFSET, trying next iteration..."
        continue
    fi
    
    # Check if already translated
    TRANSLATION_CHECK=$(curl -s "$URL/rest/v1/article_translations?article_id=eq.$ARTICLE_ID&language=eq.sv&select=count" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" | jq '.[0].count' 2>/dev/null)
    
    if [ "$TRANSLATION_CHECK" != "0" ] && [ "$TRANSLATION_CHECK" != "null" ]; then
        echo "⏭️  Article already translated: $ARTICLE_TITLE"
        continue
    fi
    
    echo "🎯 Translating: $ARTICLE_TITLE"
    echo "   Article ID: $ARTICLE_ID"
    
    # Save article to temp file for translation
    echo "$ARTICLE_CLEAN" | jq '.[0]' > "temp_article_$i.json"
    
    echo "✅ Article $i/15 prepared for translation!"
    echo "   Title: $ARTICLE_TITLE"
    echo "   Ready for manual translation..."
    
    break  # Exit after finding one good article
done

echo ""
echo "🚀 Found untranslated article for iteration $i"
echo "Next step: Translate the content in temp_article_$i.json to Swedish"