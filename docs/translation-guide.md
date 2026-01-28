# CBD Portal Translation Guide

Complete guide for translating the CBD Portal to a new language. Follow this guide exactly to avoid errors.

---

## Pre-Translation Checklist

Before starting, verify you have:

- [ ] Language code (e.g., `sv`, `no`, `de`)
- [ ] Domain name from `FooterLanguageSelector.tsx`
- [ ] Site name (branding) from `FooterLanguageSelector.tsx`
- [ ] Access to translation scripts and database

---

## Phase 1: Configuration (Do First)

### Step 1.1: Get Domain Configuration

**CRITICAL:** Check `src/components/FooterLanguageSelector.tsx` for the canonical domain name.

```typescript
// Example entries from LANGUAGE_SITES array:
{ code: 'da', domain: 'cbd.dk', displayName: 'CBD.dk' }
{ code: 'nl', domain: 'cbdportaal.nl', displayName: 'CBDportaal.nl' }  // NOT CBD.nl!
{ code: 'fr', domain: 'cbdportail.fr', displayName: 'CBDportail.fr' }  // NOT CBD.fr!
```

**Common mistakes to avoid:**
- `nl` → `CBDportaal.nl` (not `CBD.nl`)
- `fr` → `CBDportail.fr` (not `CBD.fr`)
- `es` → `CBDportal.es` (not `CBD.es`)
- `ro` → `CBDportal.ro` (not `CBD.ro`)
- Swiss variants → `CBDportal.ch` (not `CBD.ch`)

### Step 1.2: Update language.ts

Add domain mapping to `src/lib/language.ts`:

```typescript
// In domainToLanguage object:
'yourdomain.xx': 'xx',
'www.yourdomain.xx': 'xx',

// In logoMap object:
'yourdomain.xx': 'YourDomain.xx',
'www.yourdomain.xx': 'YourDomain.xx',
```

### Step 1.3: Update FooterLanguageSelector.tsx

Add the language to the appropriate region in `LANGUAGE_SITES` array if not already present.

---

## Phase 2: UI Strings (Must Complete Before Content)

### Step 2.1: Create Locale File

Copy English locale and translate:

```bash
cp locales/en.json locales/[lang].json
```

### Step 2.2: Translate All Sections

The locale file has **1,400+ strings** across these sections. ALL must be translated:

| Section | Description | Priority |
|---------|-------------|----------|
| `meta` | Site name, tagline, description | **CRITICAL** |
| `common` | Shared UI elements | **CRITICAL** |
| `nav` | Navigation menu items | **CRITICAL** |
| `navCategories` | Category names in nav | HIGH |
| `navLearn` | Learn menu items | HIGH |
| `navTools` | Tools menu items | HIGH |
| `navPets` | Pets menu items | HIGH |
| `hero` | Homepage hero section | **CRITICAL** |
| `stats` | Statistics labels | HIGH |
| `conditions` | Conditions page UI | **CRITICAL** |
| `evidence` | Evidence level labels | HIGH |
| `research` | Research page UI | **CRITICAL** |
| `articles` | Articles section UI | HIGH |
| `glossary` | Glossary page UI | **CRITICAL** |
| `glossaryCategories` | Glossary category names | HIGH |
| `footer` | Footer content | **CRITICAL** |
| `newsletter` | Newsletter signup | MEDIUM |
| `cookie` | Cookie consent | MEDIUM |
| `chat` | Chat widget | MEDIUM |
| `errors` | Error messages | HIGH |
| `accessibility` | Screen reader labels | MEDIUM |
| `seo` | SEO templates | HIGH |
| `toolsPage` | Tools landing page | HIGH |
| `researchPage` | Research database page | **CRITICAL** |
| `articlesPage` | Articles listing page | **CRITICAL** |
| `petsPage` | Pets section | MEDIUM |
| `searchPage` | Search results | MEDIUM |
| `researchFilters` | Research filter labels | HIGH |
| `researchConditions` | Condition names in research | HIGH |
| `dosageCalc` | Dosage calculator | HIGH |
| `strengthCalc` | Strength calculator | HIGH |
| `interactionChecker` | Drug interaction tool | HIGH |
| `costCalc` | Cost calculator | MEDIUM |
| `animalDosageCalc` | Pet dosage calculator | MEDIUM |
| `about` | About page | MEDIUM |
| `contact` | Contact page | MEDIUM |
| `privacyPolicy` | Privacy policy | LOW |
| `termsOfService` | Terms of service | LOW |
| `medicalDisclaimer` | Medical disclaimer | LOW |
| `cookiePolicy` | Cookie policy | LOW |
| `authorBio` | Author information | MEDIUM |
| `conditionPage` | Individual condition pages | HIGH |

### Step 2.3: Critical meta.siteName

**MUST match the domain from FooterLanguageSelector:**

```json
{
  "meta": {
    "siteName": "CBDportaal.nl",  // From FooterLanguageSelector displayName
    "siteTagline": "...",
    "siteDescription": "..."
  }
}
```

### Step 2.4: Verify All Keys Present

Run this to check for missing keys:

```bash
# Compare keys between English and new locale
node -e "
const en = require('./locales/en.json');
const target = require('./locales/[lang].json');

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? getKeys(v, prefix + k + '.')
      : [prefix + k]
  );
}

const enKeys = getKeys(en);
const targetKeys = getKeys(target);
const missing = enKeys.filter(k => !targetKeys.includes(k));
console.log('Missing keys:', missing.length ? missing : 'None');
"
```

---

## Phase 3: Database Content Translation

### Translation Order (Important!)

Execute translations in this order due to dependencies:

```
1. Glossary      → Independent, needed for article auto-linking
2. Conditions    → Independent
3. Articles      → May reference glossary terms
4. Research      → Independent summaries
```

### Step 3.1: Translate Glossary (263 terms)

```bash
npx tsx scripts/translate-content.ts --type=glossary --lang=[code]
```

### Step 3.2: Translate Conditions (312 conditions)

```bash
npx tsx scripts/translate-content.ts --type=conditions --lang=[code]
```

### Step 3.3: Translate Articles (1,259 articles)

```bash
# Translate in batches to manage API costs
npx tsx scripts/translate-content.ts --type=articles --lang=[code] --limit=100
npx tsx scripts/translate-content.ts --type=articles --lang=[code] --limit=100 --offset=100
# Continue until complete...
```

### Step 3.4: Translate Research (4,879 studies)

```bash
# Translate in batches
npx tsx scripts/translate-content.ts --type=research --lang=[code] --limit=500
# Continue until complete...
```

---

## Phase 4: Verification

### Step 4.1: Database Verification

Run this query to verify translation counts:

```bash
npx tsx -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify(lang) {
  const tables = [
    { name: 'condition_translations', total: 312 },
    { name: 'glossary_translations', total: 263 },
    { name: 'article_translations', total: 1259 },
    { name: 'research_translations', total: 4879 },
  ];

  console.log('=== Translation Status for ' + lang + ' ===');
  for (const t of tables) {
    const { count } = await supabase
      .from(t.name)
      .select('*', { count: 'exact', head: true })
      .eq('language', lang);
    const pct = Math.round((count / t.total) * 100);
    console.log(t.name + ': ' + count + '/' + t.total + ' (' + pct + '%)');
  }
}

verify('[LANG_CODE]');
"
```

### Step 4.2: Visual Verification

Test each page type with `?lang=[code]` parameter:

```bash
# Start dev server
npm run dev

# Test pages (use agent-browser or manual browser)
http://localhost:3000/?lang=[code]                    # Homepage
http://localhost:3000/conditions?lang=[code]          # Conditions list
http://localhost:3000/conditions/anxiety?lang=[code]  # Condition detail
http://localhost:3000/articles?lang=[code]            # Articles list
http://localhost:3000/glossary?lang=[code]            # Glossary
http://localhost:3000/research?lang=[code]            # Research database
http://localhost:3000/tools?lang=[code]               # Tools
http://localhost:3000/tools/dosage-calculator?lang=[code]  # Calculator
```

### Step 4.3: Check for Issues

Look for these common problems:

| Issue | Cause | Fix |
|-------|-------|-----|
| Raw translation keys (e.g., `articlesPage.title`) | Missing key in locale file | Add missing translation |
| English text mixed with translated | Incomplete locale file | Complete all sections |
| Navigation shows English | Hydration timing issue | Check LocaleProvider initialization |
| Wrong site name in header/footer | Wrong `meta.siteName` | Match FooterLanguageSelector displayName |
| Links lose `?lang=` parameter | Using `<Link>` instead of `<LocaleLink>` | Use LocaleLink component |

---

## Phase 5: Update Documentation

### Step 5.1: Update CLAUDE.md

Add translation statistics:

```markdown
### Translation Status ([Language])

| Content Type | Total | Translated | Gap | Status |
|--------------|-------|------------|-----|--------|
| Conditions | 312 | XXX | XXX | XX% |
| Glossary | 263 | XXX | XXX | XX% |
| Articles | 1,259 | XXX | XXX | XX% |
| Research | 4,879 | XXX | XXX | XX% |
| UI Strings | [lang].json | ✅ | - | ✅ Complete |
```

---

## Database Schema Reference

### condition_translations

```sql
id              UUID PRIMARY KEY
condition_id    UUID REFERENCES kb_conditions(id)
language        VARCHAR(10)  -- 'da', 'sv', 'no', etc.
name            TEXT
display_name    TEXT
short_description TEXT
long_description TEXT
meta_title      TEXT
meta_description TEXT
translated_at   TIMESTAMP
translation_quality VARCHAR(20)  -- 'ai' or 'human'
```

### glossary_translations

```sql
id              UUID PRIMARY KEY
term_id         UUID REFERENCES kb_glossary(id)
language        VARCHAR(10)
term            TEXT
definition      TEXT
simple_definition TEXT
translated_at   TIMESTAMP
translation_quality VARCHAR(20)
```

### article_translations

```sql
id              UUID PRIMARY KEY
article_id      UUID REFERENCES kb_articles(id)
language        VARCHAR(10)
slug            TEXT
title           TEXT
content         TEXT  -- Full markdown content
excerpt         TEXT
meta_title      TEXT
meta_description TEXT
translated_at   TIMESTAMP
source_updated_at TIMESTAMP
translation_quality VARCHAR(20)
```

### research_translations

```sql
id              UUID PRIMARY KEY
research_id     UUID REFERENCES kb_research_queue(id)
language        VARCHAR(10)
plain_summary   TEXT
translated_at   TIMESTAMP
```

---

## Translation Script Reference

### Commands

```bash
# Translate specific content type to one language
npx tsx scripts/translate-content.ts --type=conditions --lang=da

# Translate to multiple languages
npx tsx scripts/translate-content.ts --type=glossary --lang=da,sv,no

# Translate with limit (for large datasets)
npx tsx scripts/translate-content.ts --type=articles --lang=da --limit=100

# Translate with offset (resume from position)
npx tsx scripts/translate-content.ts --type=articles --lang=da --limit=100 --offset=500
```

### Content Types

| Type | Records | Est. Time | API Calls |
|------|---------|-----------|-----------|
| `conditions` | 312 | ~30 min | 312 |
| `glossary` | 263 | ~25 min | 263 |
| `articles` | 1,259 | ~4 hours | 1,259 |
| `research` | 4,879 | ~15 hours | 4,879 |

### Translation Context

The script uses this context for all translations:

```
Guidelines:
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for the target country
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Use native medical terminology where appropriate
- Preserve any HTML tags exactly as they appear
```

---

## Troubleshooting

### UI Shows Raw Translation Keys

**Symptom:** Page shows `articlesPage.knowledgeBase` instead of translated text

**Cause:** Missing keys in locale file

**Fix:**
1. Open `locales/en.json` and find the section
2. Copy the missing section to your locale file
3. Translate the values

### Navigation Shows English After Page Load

**Symptom:** Page initially shows English, then switches (or doesn't switch)

**Cause:** Hydration timing - server renders with default, client detects `?lang=`

**Fix:** This is handled in `LocaleProvider.tsx`. If issue persists, check:
1. Middleware is setting `NEXT_LOCALE` cookie
2. LocaleProvider initializes with URL param

### Wrong Domain/Site Name

**Symptom:** Header shows wrong branding (e.g., "CBD.nl" instead of "CBDportaal.nl")

**Cause:** `meta.siteName` doesn't match `FooterLanguageSelector.tsx`

**Fix:**
1. Check `FooterLanguageSelector.tsx` for correct `displayName`
2. Update `meta.siteName` in locale file to match exactly

### Links Lose Language Parameter

**Symptom:** Clicking internal links removes `?lang=xx` from URL

**Cause:** Using `<Link>` instead of `<LocaleLink>`

**Fix:** All internal links should use `LocaleLink` component which preserves the language parameter

### Translation Script Fails

**Symptom:** Script errors or stops mid-translation

**Possible causes:**
1. API rate limits → Add delays between batches
2. Network timeout → Reduce batch size
3. Invalid content → Check source content for issues

---

## Complete Translation Checklist

### Configuration
- [ ] Domain mapping added to `language.ts`
- [ ] Logo mapping added to `language.ts`
- [ ] Language added to `FooterLanguageSelector.tsx` (if new domain)

### UI Strings
- [ ] Locale file created (`locales/[lang].json`)
- [ ] `meta.siteName` matches FooterLanguageSelector displayName
- [ ] All 40+ sections translated
- [ ] No missing keys (verified with comparison script)

### Database Content
- [ ] Glossary: 263/263 (100%)
- [ ] Conditions: 312/312 (100%)
- [ ] Articles: 1,259/1,259 (100%)
- [ ] Research: 4,879/4,879 (100%)

### Verification
- [ ] Homepage loads fully translated
- [ ] Navigation menu fully translated
- [ ] Conditions list page works
- [ ] Condition detail page works
- [ ] Articles list page works
- [ ] Glossary page works
- [ ] Research database works
- [ ] Tools pages work
- [ ] Footer shows correct site name
- [ ] No console errors
- [ ] Internal links preserve language parameter

### Documentation
- [ ] CLAUDE.md updated with translation statistics
- [ ] Any issues documented for future reference

---

## Files Modified for New Language

| File | Changes Required |
|------|-----------------|
| `locales/[lang].json` | Create new file with all translations |
| `src/lib/language.ts` | Add domain → language mapping |
| `src/components/FooterLanguageSelector.tsx` | Add to LANGUAGE_SITES (if new domain) |
| `CLAUDE.md` | Add translation statistics |

---

*Last updated: January 2026*
*Based on Danish translation experience*
