# Adding a New Language to CBD Portal

This guide explains how to add a new language/locale to the multi-language CBD Portal system.

## Overview

The system uses:
- **next-intl** for translations
- **Middleware** for domain-based language detection
- **Route mappings** for localized URLs
- **JSON translation files** for all UI text

## Step-by-Step Process

### 1. Add Locale to Configuration

Edit `src/i18n/config.ts`:

```typescript
export const locales = ['en', 'da', 'sv', 'no', 'fi', 'de', 'NEW_LOCALE'] as const;
```

### 2. Create Translation File

Copy an existing translation file as a template:

```bash
cp messages/en.json messages/NEW_LOCALE.json
```

Then translate all strings in the new file. Key sections:
- `common` — General UI (buttons, labels)
- `nav` — Navigation menu items
- `home` — Homepage content
- `conditions` — Health conditions page
- `research` — Research database
- `glossary` — Glossary/dictionary
- `tools` — Calculator tools
- `footer` — Footer content
- `chat` — AI chat assistant
- `cookies` — Cookie consent banner

### 3. Add Route Mappings

Edit `src/i18n/routeMappings.ts`:

```typescript
export const routeMappings: Record<string, Record<string, string>> = {
  // ... existing locales ...
  
  'NEW_LOCALE': {
    'conditions': 'TRANSLATED_CONDITIONS',
    'research': 'TRANSLATED_RESEARCH', 
    'glossary': 'TRANSLATED_GLOSSARY',
    'articles': 'TRANSLATED_ARTICLES',
    'authors': 'TRANSLATED_AUTHORS',
    'tools': 'TRANSLATED_TOOLS',
    'tools/dosage-calculator': 'TRANSLATED_TOOLS/TRANSLATED_DOSAGE',
    'tools/interactions': 'TRANSLATED_TOOLS/TRANSLATED_INTERACTIONS',
    'tools/cost-calculator': 'TRANSLATED_TOOLS/TRANSLATED_COST',
    'tools/strength-calculator': 'TRANSLATED_TOOLS/TRANSLATED_STRENGTH',
    'tools/animal-dosage-calculator': 'TRANSLATED_TOOLS/TRANSLATED_ANIMAL',
    'pets': 'TRANSLATED_PETS',
    'reviews': 'TRANSLATED_REVIEWS',
    'search': 'TRANSLATED_SEARCH',
    'about': 'TRANSLATED_ABOUT',
    'contact': 'TRANSLATED_CONTACT',
    'privacy-policy': 'TRANSLATED_PRIVACY',
    'terms-of-service': 'TRANSLATED_TERMS',
    'medical-disclaimer': 'TRANSLATED_DISCLAIMER',
    'editorial-policy': 'TRANSLATED_EDITORIAL',
    'cookie-policy': 'TRANSLATED_COOKIE',
  },
};
```

### 4. Add Domain Mapping

Edit `middleware.ts` to add the domain → locale mapping:

```typescript
const domainToLanguage: Record<string, string> = {
  // ... existing domains ...
  'cbd.NEW_TLD': 'NEW_LOCALE',     // e.g., 'cbd.pl': 'pl'
  'cbdportal.NEW': 'NEW_LOCALE',   // alternative domain
};
```

### 5. Add to Footer Language Selector

Edit `src/components/Footer.tsx` to include the new language in the appropriate region:

```typescript
// In the language links section
<Link href="/?lang=NEW_LOCALE">🇽🇽 CBD.NEW_TLD</Link>
```

### 6. Update Glossary Slug Mappings (if applicable)

If the language has translated glossary term slugs, add them to `src/i18n/glossaryMappings.ts`:

```typescript
export const glossarySlugMappings: Record<string, Record<string, string>> = {
  'NEW_LOCALE': {
    'full-spectrum': 'translated-full-spectrum',
    'broad-spectrum': 'translated-broad-spectrum',
    // ... etc
  },
};
```

### 7. Update Condition Slug Mappings

Add condition URL translations to `src/i18n/conditionMappings.ts`:

```typescript
export const conditionSlugMappings: Record<string, Record<string, string>> = {
  'NEW_LOCALE': {
    'anxiety': 'translated-anxiety',
    'depression': 'translated-depression',
    'sleep': 'translated-sleep',
    'pain': 'translated-pain',
    'epilepsy': 'translated-epilepsy',
    // ... all conditions
  },
};
```

## Testing

### Local Testing

```bash
npm run dev
# Visit: http://localhost:3000/?testdomain=cbd.NEW_TLD
```

### Vercel Testing

After deploying:
```
https://cbd-portal.vercel.app/?testdomain=cbd.NEW_TLD
https://cbd-portal.vercel.app/TRANSLATED_ROUTE?testdomain=cbd.NEW_TLD
```

## Translation Tips

1. **Use native speakers** — Machine translation is a starting point, but native review is essential
2. **Keep placeholders** — Preserve `{variable}` placeholders in translations
3. **Maintain tone** — Keep the professional but accessible tone across languages
4. **SEO keywords** — Research local CBD/health keywords for each market
5. **Legal terms** — Ensure medical disclaimers are legally appropriate for each country

## File Checklist

- [ ] `src/i18n/config.ts` — Add locale
- [ ] `messages/NEW_LOCALE.json` — Create translation file
- [ ] `src/i18n/routeMappings.ts` — Add URL mappings
- [ ] `middleware.ts` — Add domain mapping
- [ ] `src/components/Footer.tsx` — Add to language selector
- [ ] `src/i18n/glossaryMappings.ts` — Add glossary slugs (optional)
- [ ] `src/i18n/conditionMappings.ts` — Add condition slugs (optional)

## Currently Supported Languages

| Locale | Domain | Status |
|--------|--------|--------|
| en | cbdportal.com | ✅ Complete |
| da | cbd.dk | ✅ Complete |
| sv | cbd.se | 🔄 In progress |
| no | cbd.no | 🔄 In progress |
| fi | cbd.fi | 🔄 In progress |
| de | cbd.de | 🔄 In progress |
| fr | cbdportail.fr | 📝 Planned |
| es | cbdportal.es | 📝 Planned |
| it | cbd.it | 📝 Planned |
| nl | cbdportaal.nl | 📝 Planned |
| pt | cbd.pt | 📝 Planned |
| ro | cbdportal.ro | 📝 Planned |
| de-CH | cbdportal.ch | 📝 Planned |
