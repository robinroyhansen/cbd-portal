#!/bin/bash
URL="https://bvrdryvgqarffgdujmjz.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY"

for i in {1..15}; do
  echo "=== Fetching article $i/15 ==="
  ARTICLE=$(curl -s "$URL/rest/v1/rpc/get_untranslated_articles" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d '{"lang": "sv", "lim": 1, "sort_dir": "asc"}')
  
  if [ "$(echo "$ARTICLE" | jq 'length')" -eq 0 ]; then
    echo "No more untranslated articles!"
    break
  fi
  
  ID=$(echo "$ARTICLE" | jq -r '.[0].id')
  TITLE=$(echo "$ARTICLE" | jq -r '.[0].title')
  echo "Article ID: $ID"
  echo "Title: $TITLE"
  echo "$ARTICLE" > /tmp/article_$i.json
done
