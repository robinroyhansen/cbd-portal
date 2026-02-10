#!/bin/bash

URL="https://bvrdryvgqarffgdujmjz.supabase.co"
KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2 | tr -d '"')

echo "🇸🇪 Starting Swedish translation loop - 15 articles"
echo "==============================================="

for i in {1..15}; do
    echo ""
    echo "📝 Iteration $i/15 - $(date)"
    
    # 1. Fetch translated article IDs
    TRANSLATED=$(curl -s "$URL/rest/v1/article_translations?language=eq.sv&select=article_id" \
        -H "apikey: $KEY" \
        -H "Authorization: Bearer $KEY" | jq -r '[.[].article_id] | join(",")')
    
    if [ "$TRANSLATED" == "" ]; then
        TRANSLATED="0"
    fi
    
    # 2. Fetch 1 untranslated article (from END/latest)
    ARTICLE=$(curl -s "$URL/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id.desc&limit=1&id=not.in.($TRANSLATED)" \
        -H "apikey: $KEY" \
        -H "Authorization: Bearer $KEY")
    
    # Check if we got an article
    ARTICLE_ID=$(echo "$ARTICLE" | jq -r '.[0].id // empty')
    
    if [ -z "$ARTICLE_ID" ] || [ "$ARTICLE_ID" == "null" ]; then
        echo "❌ No more articles to translate!"
        break
    fi
    
    TITLE=$(echo "$ARTICLE" | jq -r '.[0].title')
    echo "🔍 Found article ID: $ARTICLE_ID"
    echo "📄 Title: $TITLE"
    
    # Save article for translation
    echo "$ARTICLE" > temp_article_$i.json
    
    # 3. Translate to Swedish via Claude
    echo "🌐 Translating to Swedish..."
    
    # Process translation here - will be done by the agent
    sleep 1
    
    echo "✅ Iteration $i/15 complete"
done

echo ""
echo "🎉 Translation loop finished!"
echo "Total iterations: $i"