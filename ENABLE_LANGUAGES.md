# How to Enable Multi-Language Support

The multi-language infrastructure is ready but temporarily disabled. Your content is back and working normally.

## When You're Ready to Enable Languages:

### 1. Run the Database Migration

The SQL migration is in your clipboard (or run `./apply_migrations.sh` to copy it again).

1. Go to: https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor
2. Click "SQL Editor"
3. Create new query
4. Paste the SQL
5. Click "Run"

### 2. Enable Language Filtering

After the migration succeeds, update these files:

**In `/src/lib/articles.ts`:**
- Uncomment all `.eq('language', language)` lines
- Remove the TODO comments

**In `/src/components/LanguageSelector.tsx`:**
- Uncomment the Supabase query code
- Remove the temporary empty arrays

### 3. Commit and Deploy

```bash
git add -A
git commit -m "Enable language filtering after migration"
git push origin main
```

## Current Status

✅ Multi-language infrastructure is ready
✅ Content is working normally
✅ Only English is active
❌ Language filtering is disabled (until migration)
❌ Language selector is hidden (no languages to select)

## Note

The language selector will automatically appear when you activate more languages in the kb_languages table by setting `is_active = true`.