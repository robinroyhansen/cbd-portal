#!/bin/bash
# German Translation Script via API
# Uses the deployed API at cbd-portal.vercel.app
# This works because the API has SUPABASE_SERVICE_ROLE_KEY configured in Vercel

API_URL="https://cbd-portal.vercel.app/api/admin/translations/bulk"
AUTH="Bearer RrB22yE!"
LANG="de"

echo "🇩🇪 German Translation for cbd.de via API"
echo "==========================================="

# Function to run batch translation
translate_batch() {
    local TYPE=$1
    local BATCH_SIZE=$2
    
    echo ""
    echo "🔄 Translating $TYPE (batch size: $BATCH_SIZE)..."
    
    RESULT=$(curl -s -X POST "$API_URL" \
        -H "Authorization: $AUTH" \
        -H "Content-Type: application/json" \
        -d "{\"contentType\": \"$TYPE\", \"targetLanguages\": [\"$LANG\"], \"batchSize\": $BATCH_SIZE}")
    
    echo "$RESULT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'error' in data:
        print(f\"  ❌ Error: {data['error']}\")
    else:
        print(f\"  ✅ Processed: {data.get('totalProcessed', 0)}\")
        print(f\"     Successful: {data.get('successful', 0)}\")
        print(f\"     Failed: {data.get('failed', 0)}\")
except:
    print('  ❌ Failed to parse response')
"
}

# Get current status
echo ""
echo "📊 Current German translation status:"
curl -s "https://cbd-portal.vercel.app/api/admin/translations/status" \
    -H "Authorization: $AUTH" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    de = data['overall']['byLanguage'].get('de', {})
    print(f\"   Total items: {de.get('total', 0)}\")
    print(f\"   Translated: {de.get('translated', 0)}\")
    print(f\"   Percentage: {de.get('percentage', 0)}%\")
    
    print('')
    print('   By type:')
    for t in ['conditions', 'glossary', 'articles', 'research']:
        total = data[t]['total']
        done = data[t]['translated'].get('de', 0)
        pct = data[t]['percentage'].get('de', 0)
        print(f\"   - {t}: {done}/{total} ({pct}%)\")
except Exception as e:
    print(f'Error: {e}')
"

# Translate conditions (batch of 50)
translate_batch "conditions" 50

# Translate articles (batch of 20 - articles are larger)
translate_batch "articles" 20

# Translate research (batch of 50)
translate_batch "research" 50

echo ""
echo "✅ Batch complete. Run again to continue translating remaining items."
echo "   Use: ./scripts/translate-german-via-api.sh"
