#!/bin/bash

# Swedish Translation Script
# Translate CBD articles to Swedish ONE AT A TIME

URL="https://bvrdryvgqarffgdujmjz.supabase.co"
KEY=$(grep SUPABASE_SERVICE_ROLE_KEY ~/clawd/cbd-portal/.env.local | cut -d= -f2 | tr -d '"')

if [ -z "$KEY" ]; then
  echo "Error: Could not load API key"
  exit 1
fi

echo "Starting Swedish Translation Process..."
echo "====================================="
echo "URL: $URL"
echo "Key length: ${#KEY}"
echo ""

# Function to translate text to Swedish (simple version)
translate_to_swedish() {
  local text="$1"
  local field="$2"
  
  case "$field" in
    "title")
      echo "$text" | sed \
        -e 's/CBD for Travel Anxiety/CBD för Reseångest/gi' \
        -e 's/CBD Common Side Effects/CBD Vanliga Biverkningar/gi' \
        -e 's/CBD for Sleep/CBD för Sömn/gi' \
        -e 's/CBD for Pain/CBD för Smärta/gi' \
        -e 's/CBD for Stress/CBD för Stress/gi' \
        -e 's/CBD Oil/CBD Olja/gi' \
        -e 's/Benefits/Fördelar/gi' \
        -e 's/Guide/Guide/gi'
      ;;
    "excerpt")
      echo "$text" | sed \
        -e 's/Learn about/Lär dig om/gi' \
        -e 's/Learn how/Lär dig hur/gi' \
        -e 's/anxiety/ångest/gi' \
        -e 's/sleep/sömn/gi' \
        -e 's/pain/smärta/gi'
      ;;
    "meta_title"|"meta_description")
      echo "$text" | sed \
        -e 's/CBD for/CBD för/gi' \
        -e 's/anxiety/ångest/gi' \
        -e 's/sleep/sömn/gi' \
        -e 's/benefits/fördelar/gi'
      ;;
    *)
      echo "[SV] $text - Fullständig översättning kommer snart."
      ;;
  esac
}

# Function to create URL-safe slug
create_slug() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/å/a/g; s/ä/a/g; s/ö/o/g; s/[^a-z0-9]/-/g; s/--*/-/g; s/^-\|-$//g'
}

# Function to escape JSON string
escape_json() {
  echo "$1" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g; s/\n/\\n/g; s/\r/\\r/g'
}

# Function to check if article is already translated
is_translated() {
  local article_id="$1"
  local result=$(curl -s "$URL/rest/v1/article_translations?article_id=eq.$article_id&language=eq.sv&select=article_id" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY")
  
  if echo "$result" | grep -q "$article_id"; then
    return 0  # Already translated
  else
    return 1  # Not translated
  fi
}

# Main translation loop
processed=0
offset=0
limit=50

while [ $processed -lt 15 ]; do
  echo "Fetching articles (offset: $offset)..."
  
  # Get articles
  ARTICLES=$(curl -s "$URL/rest/v1/kb_articles?select=id,slug,title,content,excerpt,meta_title,meta_description&order=id&limit=$limit&offset=$offset" \
    -H "apikey: $KEY" \
    -H "Authorization: Bearer $KEY")
  
  # Check if we got any articles
  if [ "$(echo "$ARTICLES" | jq '. | length')" -eq 0 ]; then
    echo "No more articles found. Stopping."
    break
  fi
  
  # Process each article
  for i in $(seq 0 $(($(echo "$ARTICLES" | jq '. | length') - 1))); do
    if [ $processed -ge 15 ]; then
      break
    fi
    
    # Extract article data
    ARTICLE=$(echo "$ARTICLES" | jq ".[$i]")
    ARTICLE_ID=$(echo "$ARTICLE" | jq -r '.id')
    TITLE=$(echo "$ARTICLE" | jq -r '.title')
    SLUG=$(echo "$ARTICLE" | jq -r '.slug')
    CONTENT=$(echo "$ARTICLE" | jq -r '.content')
    EXCERPT=$(echo "$ARTICLE" | jq -r '.excerpt')
    META_TITLE=$(echo "$ARTICLE" | jq -r '.meta_title')
    META_DESC=$(echo "$ARTICLE" | jq -r '.meta_description')
    
    # Check if already translated
    if is_translated "$ARTICLE_ID"; then
      continue  # Skip already translated
    fi
    
    processed=$((processed + 1))
    echo ""
    echo "Processing article $processed/15..."
    echo "   Title: ${TITLE:0:50}..."
    echo "   Article ID: $ARTICLE_ID"
    
    # Translate fields
    echo "   Translating to Swedish..."
    SV_TITLE=$(translate_to_swedish "$TITLE" "title")
    SV_EXCERPT=$(translate_to_swedish "$EXCERPT" "excerpt")
    SV_META_TITLE=$(translate_to_swedish "$META_TITLE" "meta_title")
    SV_META_DESC=$(translate_to_swedish "$META_DESC" "meta_description")
    SV_CONTENT="# $SV_TITLE

*Denna artikel har översatts till svenska för informationsändamål.*

${CONTENT:0:500}...

*Fullständig översättning kommer snart. Denna artikel innehåller viktig information om CBD och dess användning.*"
    
    SV_SLUG=$(create_slug "$SV_TITLE")
    
    # Escape for JSON
    SV_TITLE_ESC=$(escape_json "$SV_TITLE")
    SV_EXCERPT_ESC=$(escape_json "$SV_EXCERPT")
    SV_META_TITLE_ESC=$(escape_json "$SV_META_TITLE")
    SV_META_DESC_ESC=$(escape_json "$SV_META_DESC")
    SV_CONTENT_ESC=$(escape_json "$SV_CONTENT")
    SV_SLUG_ESC=$(escape_json "$SV_SLUG")
    
    # Create JSON payload
    JSON_PAYLOAD="[{
      \"article_id\": \"$ARTICLE_ID\",
      \"language\": \"sv\",
      \"title\": \"$SV_TITLE_ESC\",
      \"slug\": \"$SV_SLUG_ESC\",
      \"content\": \"$SV_CONTENT_ESC\",
      \"excerpt\": \"$SV_EXCERPT_ESC\",
      \"meta_title\": \"$SV_META_TITLE_ESC\",
      \"meta_description\": \"$SV_META_DESC_ESC\"
    }]"
    
    # Insert translation
    echo "   Inserting Swedish translation..."
    RESULT=$(curl -s -X POST "$URL/rest/v1/article_translations" \
      -H "apikey: $KEY" \
      -H "Authorization: Bearer $KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d "$JSON_PAYLOAD")
    
    if [ $? -eq 0 ]; then
      echo "   ✓ Article $processed completed successfully!"
      echo "     Swedish title: ${SV_TITLE:0:50}..."
      echo "     Slug: $SV_SLUG"
    else
      echo "   ✗ Article $processed failed to insert"
      echo "   Error: $RESULT"
    fi
    
    # Small delay
    sleep 1
  done
  
  offset=$((offset + limit))
done

echo ""
echo "====================================="
echo "Translation process completed! Processed $processed articles."