#!/bin/bash

echo "==================================="
echo "Supabase Multi-Language Migration"
echo "==================================="
echo ""
echo "Since Supabase requires direct SQL execution via their dashboard,"
echo "this script will copy the migration SQL to your clipboard."
echo ""

# Path to migration file
MIGRATION_FILE="supabase/migrations/20251229_add_multi_language_support.sql"

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Copy to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$MIGRATION_FILE" | pbcopy
    echo "✅ Migration SQL copied to clipboard!"
    echo ""
    echo "Now follow these steps:"
    echo "1. Go to: https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor"
    echo "2. Click on 'SQL Editor' in the left sidebar"
    echo "3. Click 'New query' button"
    echo "4. Paste the SQL (Cmd+V)"
    echo "5. Click 'Run' button"
    echo ""
    echo "The migration will:"
    echo "- Add language columns to articles and categories tables"
    echo "- Create kb_languages table with 15 language configurations"
    echo "- Set English as the only active language for now"
    echo "- Create indexes and enable RLS policies"
else
    echo "To apply the migration manually:"
    echo "1. Copy the contents of: $MIGRATION_FILE"
    echo "2. Go to: https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor"
    echo "3. Paste and run the SQL"
fi