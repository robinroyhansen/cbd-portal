# Multi-Language Database Setup

## Overview
The database has been configured to support 15 languages across different domains. Currently, only English is active, but the structure is ready for future translations.

## Database Structure

### Modified Tables
- **kb_articles**: Added `language` column (default: 'en') and `original_article_id` for translation references
- **kb_categories**: Added `language` column (default: 'en')

### New Tables
- **kb_languages**: Reference table containing all 15 language configurations

## Supported Languages

| Code | Language | Domain | Logo Text | Status |
|------|----------|--------|-----------|---------|
| en | English | swissorganic.co.uk | CBD.uk | **ACTIVE** |
| da | Danish | cbd.dk | CBD.dk | Inactive |
| sv | Swedish | cbd.se | CBD.se | Inactive |
| no | Norwegian | cbd.no | CBD.no | Inactive |
| fi | Finnish | cbd.fi | CBD.fi | Inactive |
| de | German | cbd.de | CBD.de | Inactive |
| it | Italian | cbd.it | CBD.it | Inactive |
| pt | Portuguese | cbd.pt | CBD.pt | Inactive |
| nl | Dutch | cbdportaal.nl | CBDportaal.nl | Inactive |
| fr | French | cbdporteil.fr | CBDporteil.fr | Inactive |
| ro | Romanian | cbdportal.ro | CBDportal.ro | Inactive |
| es | Spanish | cbdportal.es | CBDportal.es | Inactive |
| de-CH | Swiss German | cbdportal.ch | CBDportal.ch | Inactive |
| fr-CH | Swiss French | cbdportal.ch | CBDportal.ch | Inactive |
| it-CH | Swiss Italian | cbdportal.ch | CBDportal.ch | Inactive |

## Migration Files

- **SQL Migration**: `/supabase/migrations/20251229_add_multi_language_support.sql`
- **Migration Script**: `/apply_migrations.sh` - Copies SQL to clipboard for manual execution
- **Direct Migration**: `/run_migrations_direct.py` - For direct database execution (requires DB password)

## Future Implementation

When ready to add translations:

1. **Activate Languages**: Update `is_active = true` for desired languages
2. **Add Translations**: Create article copies with appropriate `language` code and link to original via `original_article_id`
3. **Frontend Updates**: Add language selector component and routing logic
4. **Domain Routing**: Configure domain-based language detection

## Database Queries

### Get all active languages:
```sql
SELECT * FROM kb_languages WHERE is_active = true ORDER BY display_order;
```

### Get articles for a specific language:
```sql
SELECT * FROM kb_articles WHERE language = 'en';
```

### Get translated versions of an article:
```sql
SELECT * FROM kb_articles
WHERE original_article_id = 'article-uuid-here'
OR id = 'article-uuid-here';
```

## Notes

- All existing content has been set to English ('en')
- The Swiss variants (de-CH, fr-CH, it-CH) share the same domain but have different language codes
- Row Level Security (RLS) is enabled with public read access for the languages table
- Indexes have been created on language columns for better query performance