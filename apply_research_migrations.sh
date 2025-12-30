#!/bin/bash

echo "========================================="
echo "Research Scanner Migration"
echo "========================================="
echo ""
echo "This script will prepare the research scanner migration"
echo "for manual execution in Supabase."
echo ""

# Path to migration files
RESEARCH_MIGRATION="supabase/migrations/20251230_create_research_scanner.sql"
LANGUAGE_MIGRATION="supabase/migrations/20251230_activate_all_languages.sql"

# Combine migrations
MIGRATION_FILE="/tmp/research_scanner_migrations.sql"
cat "$RESEARCH_MIGRATION" > "$MIGRATION_FILE"
echo -e "\n\n-- Activate all languages for global research\n" >> "$MIGRATION_FILE"
cat "$LANGUAGE_MIGRATION" >> "$MIGRATION_FILE"

# Check if files exist
if [ ! -f "$RESEARCH_MIGRATION" ]; then
    echo "Error: Research migration file not found: $RESEARCH_MIGRATION"
    exit 1
fi

if [ ! -f "$LANGUAGE_MIGRATION" ]; then
    echo "Error: Language migration file not found: $LANGUAGE_MIGRATION"
    exit 1
fi

# Copy to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$MIGRATION_FILE" | pbcopy
    echo "✅ Research Scanner migration SQL copied to clipboard!"
    echo ""
    echo "Now follow these steps:"
    echo "1. Go to: https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor"
    echo "2. Click on 'SQL Editor' in the left sidebar"
    echo "3. Click 'New query' button"
    echo "4. Paste the SQL (Cmd+V)"
    echo "5. Click 'Run' button"
    echo ""
    echo "The migration will:"
    echo "- Create kb_research_queue table for storing discovered research"
    echo "- Create kb_article_research junction table for tracking integration"
    echo "- Set up proper indexes and RLS policies"
    echo "- Activate all languages for global research availability"
    echo ""
    echo "After running the migration, set the CRON_SECRET environment variable:"
    echo "1. Go to: https://vercel.com/robinroyhansens-projects/cbd-portal/settings/environment-variables"
    echo "2. Add: CRON_SECRET = $(openssl rand -base64 32)"
    echo "3. Deploy the changes to activate the research scanner system"
else
    echo "To apply the migration manually:"
    echo "1. Copy the contents of: $MIGRATION_FILE"
    echo "2. Go to: https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor"
    echo "3. Paste and run the SQL"
    echo ""
    echo "Then set up environment variables as described above."
fi

echo ""
echo "🚀 Research Scanner Features:"
echo "- Daily automated scanning of PubMed, ClinicalTrials.gov, and PMC"
echo "- 60+ comprehensive search terms covering CBD, cannabis, and medical cannabis"
echo "- Intelligent relevance scoring and topic categorization"
echo "- Admin review interface at /admin/research"
echo "- Manual scan trigger for immediate updates"
echo "- Automatic citation integration into relevant articles"
echo "- Rate limiting and error handling for reliable operation"
echo ""