# CBD Portal - Claude Code Project Documentation

## Project Overview

CBD educational portal built with Next.js 14, Supabase, and TailwindCSS. Features a comprehensive knowledge base, research scanner, glossary system, and admin tools.

**Live Site:** https://cbd-portal.vercel.app

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **Language**: TypeScript

---

## Multi-Language Support

The portal supports 8 European languages with domain-based routing. Each language has its own domain.

### Languages & Domains

| Code | Language | Domain | Priority |
|------|----------|--------|----------|
| en | English | cbd-portal.vercel.app | Primary |
| da | Danish | cbd.dk | High |
| sv | Swedish | cbd.se | High |
| no | Norwegian | cbd.no | High |
| de | German | cbd.de | High |
| nl | Dutch | cbdportaal.nl | Medium |
| fi | Finnish | cbd.fi | Medium |
| fr | French | cbdportail.fr | Medium |
| it | Italian | cbd.it | Medium |

**Swiss Variants** (on cbdportal.ch):
- de-CH (Swiss German)
- fr-CH (Swiss French)
- it-CH (Swiss Italian)

### Translation Status (Danish)

| Content Type | Total | Translated | Status |
|--------------|-------|------------|--------|
| Conditions | 312 | 312 | ✅ 100% |
| Glossary Terms | 263 | 263 | ✅ 100% |
| Articles | 1,259 | 1,259 | ✅ 100% |
| Research | 4,879 | 4,488 | 92% (391 remaining) |
| UI Strings | 1 file | da.json | ✅ 100% |

### Translation Tables

- `condition_translations` - Translated condition names and descriptions
- `glossary_translations` - Translated glossary terms and definitions
- `article_translations` - Translated article titles and content
- `research_translations` - Translated research summaries

### Key Files

- `locales/*.json` - UI string translations (da, sv, no, de, nl, fi, fr, it)
- `src/lib/language.ts` - Domain-based language detection
- `src/lib/translation-service.ts` - Claude API translation service
- `src/components/LocaleProvider.tsx` - React context for translations
- `src/components/FooterLanguageSelector.tsx` - **Canonical domain names** (check here for correct siteName!)
- `src/hooks/useLocale.ts` - Translation hook for components
- `scripts/translate-content.ts` - Batch translation script

### Translation Guide

**IMPORTANT:** Before translating to a new language, read `/docs/translation-guide.md` for the complete process, common pitfalls, and verification steps.

### Translation Implementation Guidelines

**CRITICAL LESSONS LEARNED from Danish translation:**

#### 1. Translations Stored ≠ Translations Displayed

Having data in `*_translations` tables does NOT mean it will display. Each component/page must:
- Accept a `language` parameter
- Query the translation table
- Merge translations with fallback to English

**Pattern for translation-aware data fetching:**
```typescript
// 1. Fetch base data
const { data: items } = await supabase.from('kb_items').select('*');

// 2. Return as-is if English
if (language === 'en') return items;

// 3. Fetch translations for non-English
const { data: translations } = await supabase
  .from('item_translations')
  .select('item_id, title, description')
  .eq('language', language)
  .in('item_id', itemIds);

// 4. Merge with fallback
const translationMap = new Map(translations.map(t => [t.item_id, t]));
return items.map(item => {
  const trans = translationMap.get(item.id);
  return {
    ...item,
    title: trans?.title || item.title,
    description: trans?.description || item.description,
  };
});
```

#### 2. Check ALL Data Fetching Paths

A single content type may be fetched in multiple places:
- Homepage component (e.g., `FeaturedArticles.tsx`)
- Listing page (e.g., `/articles/page.tsx`)
- Detail page (e.g., `/articles/[slug]/page.tsx`)
- API routes

**Each path needs translation support independently!**

#### 3. Language Detection Priority

Always check URL parameter first, then hostname:
```typescript
// Correct order
let language = searchParams.lang;  // URL param first (?lang=da)
if (!language) {
  const host = headers.get('host');
  language = getLanguageFromHostname(host);  // Hostname fallback
}
```

#### 4. Verify with Browser Agent

After implementing translations, always verify visually:
```bash
agent-browser open "https://cbd-portal.vercel.app/?lang=da"
agent-browser scroll down 1000
agent-browser screenshot /tmp/verify-danish.png
```

Look for:
- English text that should be translated
- Raw translation keys (e.g., `articlesPage.title`)
- Mixed language content

#### 5. Translation Table Column Names

The column is `language`, NOT `language_code`:
```sql
-- Correct
.eq('language', 'da')

-- Wrong
.eq('language_code', 'da')
```

#### 6. Site Name Source of Truth

**Always check `FooterLanguageSelector.tsx`** for correct domain/site names:
- `nl` → `CBDportaal.nl` (not CBD.nl)
- `fr` → `CBDportail.fr` (not CBD.fr)
- Swiss → `CBDportal.ch` (not CBD.ch)

#### 7. Files That Need Translation Support

When adding a new content type, update ALL these:

| File | Purpose |
|------|---------|
| `src/lib/translations.ts` | Add `getXWithTranslations()` function |
| `src/lib/[content].ts` | Update `getX()` to fetch translations |
| `src/components/home/[X].tsx` | Homepage component |
| `src/app/[content]/page.tsx` | Listing page |
| `src/app/[content]/[slug]/page.tsx` | Detail page |

#### 8. Vercel Caching

Pages with `revalidate` may show stale content. Force fresh fetch:
```bash
# Add cache buster for testing
agent-browser open "https://site.com/page?lang=da&_t=$(date +%s)"
```

#### 9. Hardcoded Config Objects

**Watch for objects like `CATEGORY_CONFIG` with hardcoded English names:**

```typescript
// BAD - Hardcoded English
const CATEGORY_CONFIG = {
  'mental_health': { name: 'Mental Health', description: '...' }
};

// Display (shows English even on Danish site)
<span>{config.name}</span>

// GOOD - Use translation function with fallback
<span>{t(`conditions.categories.${category}`) || config.name}</span>
<p>{t(`conditions.categories.${category}_desc`) || config.description}</p>
```

**Common places to check for hardcoded text:**
- Category/filter configuration objects
- Tooltip and placeholder text
- Error messages and empty states
- Section headers and labels
- Button text and CTAs

### Translation Scripts

```bash
# Translate conditions to all languages
npx tsx scripts/translate-content.ts --type=conditions --lang=all

# Translate glossary to specific languages
npx tsx scripts/translate-content.ts --type=glossary --lang=da,sv,no

# Check translation coverage
npx tsx scripts/check-counts.ts

# Find missing translations
npx tsx scripts/find-missing.ts
```

---

## IMPORTANT: DOCUMENTATION RULES

### Before Writing Condition Articles

**ALWAYS read these files FIRST before writing any "CBD and [Condition]" article:**

1. **`/docs/content/condition-article-spec.md`** — Complete specification (evidence tiers, structure, citations, E-E-A-T)
2. **`/docs/claude-instructions/condition-article-generator.md`** — Condensed execution instructions

**MANDATORY PROCESS:**
1. Query ALL approved studies for the condition from `kb_research_queue`
2. Complete the evidence analysis (counts, categories, stats)
3. Determine evidence level (Strong/Moderate/Limited/Insufficient)
4. Set article length based on evidence depth
5. THEN write the article following the spec

### Documentation Reference

| Task | Read First |
|------|------------|
| Writing condition articles | `condition-article-spec.md` + `condition-article-generator.md` |
| Writing other article types | `/docs/content/writing-guidelines.md` |
| Working with research database | `/docs/content/research-data-strategy.md` |
| Strategic/planning decisions | `/docs/cbd-portal-master-plan.md` |

### Documentation Locations

```
/docs/
├── cbd-portal-master-plan.md           # Strategy, content plan, all article types
├── content/
│   ├── writing-guidelines.md           # General writing rules, SEO, voice
│   ├── research-data-strategy.md       # Research database architecture
│   └── condition-article-spec.md       # Condition article specification
└── claude-instructions/
    └── condition-article-generator.md  # Claude Code instruction for conditions
```

---

## CURRENT STATE (January 27, 2026)

### Content Database - Complete

| Content Type | Count | Status |
|--------------|-------|--------|
| **Articles** | 1,259 | ✅ All published |
| **Conditions** | 312 | ✅ 100% have articles |
| **Approved Studies** | 4,879 | ✅ Complete |
| **Glossary Terms** | 263 | ✅ Complete |

### Articles by Type

| Type | Count |
|------|-------|
| educational | 322 |
| educational-guide | 209 |
| condition | 120 |
| comparison | 77 |
| legal-guide | 53 |
| science | 44 |
| product-guide | 39 |
| standard | 30 |
| pillar | 29 |
| guide | 24 |
| cannabinoid-profile | 20 |
| terpene-profile | 20 |
| basics | 8 |
| application-guide | 5 |

### Research Database

| Metric | Count |
|--------|-------|
| Approved Studies | 4,879 |
| Rejected Studies | 4,523 |
| Human Studies | 4,814 |
| Reviews/Meta-analyses | 29 |
| High Quality (70+) | 147 |
| Pending Review | 0 |

- **39 topics** covered (anxiety, pain, sleep, epilepsy, addiction, adhd, alzheimers, etc.)
- **6 data sources** integrated (PubMed, PMC, OpenAlex, Europe PMC, Semantic Scholar, citation imports)
- **48 search keywords** matched across therapeutic areas

### Translation Status (Danish)

| Content Type | Total | Translated | Gap | Status |
|--------------|-------|------------|-----|--------|
| Conditions | 312 | 312 | 0 | ✅ Complete |
| Glossary | 263 | 263 | 0 | ✅ Complete |
| Articles | 1,259 | 1,259 | 0 | ✅ Complete |
| Research | 4,879 | 4,488 | 391 | 92% |
| UI Strings | da.json | ✅ | - | ✅ Complete |

**Gap Analysis:** Only 391 research translations remaining for Danish (8% gap).

### AI Chat System - Complete

| Feature | Status |
|---------|--------|
| Chat Widget | ✅ Live on public site |
| RAG Context (conditions, research, glossary) | ✅ Working |
| Conversation Logging | ✅ Working |
| Chat Analytics Admin | ✅ Working |
| View Conversation Details | ✅ Working |
| Delete Individual/All Logs | ✅ Working |
| Geo Info Capture (Vercel) | ✅ Working |
| User Agent Parsing | ✅ Working |

### Database Tables
- **kb_conditions**: Medical conditions with SEO templates (foundation for programmatic pages)
- **kb_articles**: Articles linked to conditions with FAQ schema, RLS policies, full-text search
- **kb_research_queue**: Research studies with quality/relevance scores, topics, study_subject
- **kb_scan_jobs**: Scanner job tracking with pause/resume support
- **kb_glossary**: Glossary definitions for auto-linking
- **condition_translations**: Translated condition content (8 languages)
- **glossary_translations**: Translated glossary terms (8 languages)
- **article_translations**: Translated article titles and content
- **research_translations**: Translated research summaries
- **chat_conversations**: Chat session tracking with geo metadata
- **chat_messages**: Individual chat messages with intent classification
- **chat_feedback**: User feedback on chat responses

### What's Remaining (Danish)

1. **Condition Translations** - ✅ Complete (312/312)
2. **Glossary Translations** - ✅ Complete (263/263)
3. **Article Translations** - ✅ Complete (1,259/1,259)
4. **Research Translations** - 391 remaining (4,488/4,879 = 92%)
5. **Domain Setup** - Configure cbd.dk DNS and Vercel domain

### Chat System Usage

| Metric | Count |
|--------|-------|
| Total Conversations | 10 |
| Total Messages | 22 |

---

## CONDITION ARTICLE QUICK REFERENCE

### Evidence Levels & Article Length

| Level | Criteria | Word Count |
|-------|----------|------------|
| **Strong** | 20+ studies, 3+ RCTs or meta-analysis, 200+ participants | 1,800-2,400 |
| **Moderate** | 10-20 studies, 1-2 RCTs, 5+ human studies | 1,300-1,800 |
| **Limited** | 5-10 studies, no RCTs, mostly animal | 900-1,300 |
| **Insufficient** | <5 studies, only animal/in-vitro | 600-900 |

### Required Query Before Writing

```sql
SELECT 
  id, title, year, study_type, study_subject, 
  sample_size, quality_score, abstract, plain_summary,
  doi, pmid, slug
FROM kb_research_queue
WHERE status = 'approved'
AND (
  primary_topic = '[condition]' 
  OR '[condition]' = ANY(relevant_topics)
)
ORDER BY quality_score DESC;
```

### Citation Strategy (Hybrid - Strategy C)

- **Inline claims** → Link to internal study summary: `/research/study/[slug]`
- **References section** → Internal summary + PubMed link + DOI

### Author for All Condition Articles

- **Name:** Robin Roy Krigslund-Hansen
- **Title:** Founder & Editor
- **Experience:** 12+ years in CBD industry
- **Byline:** "By Robin Roy Krigslund-Hansen | 12+ years in CBD industry"

---

## KEY FILES

### Content Production
- `/docs/content/condition-article-spec.md` - Complete condition article specification
- `/docs/claude-instructions/condition-article-generator.md` - Claude Code instruction
- `/docs/content/writing-guidelines.md` - General writing guidelines
- `/docs/content/research-data-strategy.md` - Research database strategy

### Scanner System
- `src/lib/research-scanner.ts` - Main scanner with 6 source adapters
- `src/app/api/admin/scanner/process/route.ts` - Job processing API
- `src/app/admin/research/scanner/page.tsx` - Scanner UI
- `src/hooks/useScannerJob.ts` - Real-time job tracking hook

### Queue System
- `src/app/admin/research/queue/page.tsx` - Review queue UI
- `src/hooks/useResearchQueue.ts` - Queue data hook
- `src/lib/utils/relevance-scorer.ts` - Relevance scoring

### Data Quality
- `src/lib/utils/text-cleanup.ts` - HTML cleanup utilities
- `src/lib/utils/deduplication.ts` - Cross-source dedup
- `src/lib/utils/language-detection.ts` - Language detection

### Database
- `supabase/setup_research_scanner.sql` - Table setup script
- `supabase/migrations/20260116_create_kb_conditions.sql` - Conditions table with SEO templates
- `supabase/migrations/20260116_create_kb_articles.sql` - Articles table with RLS and full-text search

### SEO & Article Production
- `src/lib/seo/page-templates.ts` - Metadata & JSON-LD schema generators
- `src/lib/glossary.ts` - Glossary term fetching with Next.js caching
- `src/lib/utils/glossary-autolink.ts` - Glossary term markers (client-side)
- `src/components/research/ResearchCitations.tsx` - Display related studies
- `src/components/ArticleContent.tsx` - Markdown rendering with glossary auto-linking
- `src/lib/kb-data.ts` - Data fetching with React cache() deduplication

### Shared Utilities
- `src/lib/types/database.ts` - TypeScript definitions for all KB tables
- `src/lib/api-response.ts` - API error handling utilities
- `src/lib/constants/categories.ts` - Condition & article category configuration

### Page Routes (Programmatic SEO)
- `src/app/conditions/page.tsx` - Conditions list with categories
- `src/app/conditions/[slug]/page.tsx` - Condition page with research & articles
- `src/app/kb/articles/[slug]/page.tsx` - KB article page (uses kb_articles table)

### Chat System
- `src/components/chat/ChatWidget.tsx` - Floating chat button + window container
- `src/components/chat/ChatWindow.tsx` - Main chat interface
- `src/components/chat/ChatMessage.tsx` - Message bubbles with links
- `src/components/chat/ChatInput.tsx` - Message input with send button
- `src/lib/chat/context-builder.ts` - RAG context from conditions, research, glossary
- `src/lib/chat/system-prompt.ts` - Claude system prompt for chat
- `src/lib/chat/intent-classifier.ts` - Message intent classification
- `src/lib/chat/conversation-memory.ts` - Conversation context extraction
- `src/app/api/chat/route.ts` - Chat API with RAG and logging
- `src/app/admin/chat/page.tsx` - Chat analytics dashboard
- `src/app/admin/chat/[id]/page.tsx` - Conversation detail view

---

## COMMANDS

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Database setup (run in Supabase SQL Editor)
# See: supabase/setup_research_scanner.sql
```

---

## Build & Deploy Workflow

**IMPORTANT:** Follow this workflow after completing any feature or fix.

### Workflow Steps

1. **Build Verification**
   ```bash
   cd "/Users/robinroyhansen/Development with AI/cbd-portal"
   npm run build
   ```

2. **Commit & Push**
   ```bash
   git add -A
   git commit -m "Description of changes"
   git push origin main
   ```
   - Vercel auto-deploys from GitHub (typically 1-2 minutes)

3. **Browser Validation** (using agent-browser)

   **Desktop (1280px):**
   ```bash
   agent-browser open https://cbd-portal.vercel.app
   agent-browser snapshot -i
   agent-browser screenshot /tmp/deploy-desktop.png
   ```

   **Mobile (375px):**
   ```bash
   agent-browser set viewport 375 812
   agent-browser reload
   agent-browser snapshot -i
   agent-browser screenshot /tmp/deploy-mobile.png
   agent-browser close
   ```

4. **Log Results** → Append to `BUILD_LOG.md`

### Validation Checklist

| Check | Desktop | Mobile |
|-------|---------|--------|
| Page loads without errors | ✓ | ✓ |
| Navigation renders correctly | ✓ | ✓ |
| Key content visible | ✓ | ✓ |
| No console errors | ✓ | ✓ |
| Interactive elements work | ✓ | ✓ |

### Quick Deploy Command Sequence

```bash
# Full deploy workflow
cd "/Users/robinroyhansen/Development with AI/cbd-portal"
npm run build && git add -A && git commit -m "feat: description" && git push origin main

# Wait for Vercel deploy, then validate
agent-browser open https://cbd-portal.vercel.app
agent-browser snapshot -i
agent-browser screenshot /tmp/deploy-desktop.png
agent-browser set viewport 375 812
agent-browser reload
agent-browser screenshot /tmp/deploy-mobile.png
agent-browser close
```

### Log Entry Format

After each deploy, append to `BUILD_LOG.md`:
```markdown
## [DATE] - [Feature/Fix Description]

**Commit:** [commit hash]
**Build:** ✅ Success | ❌ Failed
**Deploy:** ✅ Live | ⏳ Pending

### Validation Results
| Viewport | Status | Screenshot |
|----------|--------|------------|
| Desktop (1280px) | ✅ Pass | /tmp/deploy-desktop.png |
| Mobile (375px) | ✅ Pass | /tmp/deploy-mobile.png |

### Notes
- [Any issues or observations]
```

---

## API ENDPOINTS

### Scanner
- `POST /api/admin/scanner/start` - Create new scan job
- `POST /api/admin/scanner/process` - Process scan job
- `POST /api/admin/scanner/jobs/[id]/pause` - Pause job
- `POST /api/admin/scanner/jobs/[id]/resume` - Resume job
- `POST /api/admin/scanner/jobs/[id]/cancel` - Cancel job
- `GET /api/admin/scanner/cleanup?dryRun=true` - Preview data cleanup

### Queue
- `POST /api/admin/integrate-research` - Approve and integrate research

### Conditions (Programmatic SEO)
- `GET /api/conditions` - List all conditions (supports `?category=`, `?featured=true`)
- `GET /api/conditions/[slug]` - Get single condition with related data (`?withResearch=true`, `?lang=`)

### Articles
- `POST /api/admin/articles/generate` - Generate article drafts from research

### Chat
- `POST /api/chat` - Send chat message (RAG-powered responses)
- `GET /api/admin/chat` - List all chat conversations
- `DELETE /api/admin/chat` - Delete all chat conversations
- `GET /api/admin/chat/[id]` - Get conversation details with messages
- `DELETE /api/admin/chat/[id]` - Delete single conversation
- `POST /api/chat/feedback` - Submit feedback on chat response

---

## ENVIRONMENT VARIABLES

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_SECRET=
```

---

## RESEARCH DATABASE QUICK REFERENCE

### Study Subject Types
- `human` - Human clinical trials, observational studies (shown by default)
- `review` - Systematic reviews, meta-analyses (shown by default)
- `animal` - Preclinical animal studies (hidden by default)
- `in_vitro` - Cell culture, lab studies (hidden by default)

### Key Topics (39 total)
addiction, adhd, aging, alzheimers, anxiety, arthritis, athletic, autism, blood_pressure, cancer, chemo_side_effects, chronic_pain, covid, crohns, depression, diabetes, eczema, epilepsy, fibromyalgia, general, glaucoma, heart, inflammation, migraines, ms, nausea, neurological, neuropathic_pain, obesity, pain, parkinsons, psoriasis, ptsd, schizophrenia, sleep, stress, tourettes, veterinary, womens

### Quality Thresholds
- **High quality:** score ≥ 70
- **Medium quality:** score 50-69
- **Lower quality:** score < 50
- **Publication gate:** relevance_score ≥ 40 required for public display

---

## SESSION LOG

### January 28, 2026 - Danish Translation Verification & Fixes

**Issues Found & Fixed:**

1. **Article titles showing in English** - FeaturedArticles and articles page fetched from `kb_articles` without joining `article_translations`
   - Added `getFeaturedArticlesWithTranslations()` to `src/lib/translations.ts`
   - Updated `getArticles()` in `src/lib/articles.ts` to merge translations
   - Updated `src/app/articles/page.tsx` to detect `?lang=` URL parameter

2. **Wrong domain names in branding** - Used `CBD.nl` instead of `CBDportaal.nl`
   - Fixed all locale files to match `FooterLanguageSelector.tsx` domains
   - `nl` → `CBDportaal.nl`, `fr` → `CBDportail.fr`, Swiss → `CBDportal.ch`

3. **Hero section excessive whitespace** - Reduced `min-h-[90vh]` to `min-h-[75vh]`

4. **Conditions title** - Changed "Gennemse efter sygdom" to "CBD og sygdomme"

5. **Category labels showing in English** - Category names like "MENTAL HEALTH", "NEUROLOGICAL" displayed raw database values instead of translations
   - Fixed `src/components/home/BrowseByCondition.tsx` - Use `t()` for category labels
   - Fixed `src/components/conditions/ConditionsHub.tsx` - Updated all category display areas:
     - Category filter buttons
     - "Browse by Body System" section (header + category cards)
     - Selected category header
     - Grid view category labels
     - ConditionCard component (studies/articles counts)
     - No Results section
     - A-Z list view (studies/articles counts)
   - Added missing translation keys to `locales/da.json` and `locales/en.json`:
     - `conditions.strongestEvidence`
     - `conditions.findByArea`
     - `conditions.searchResults`

**Key Learnings:**

1. **Translations Stored ≠ Translations Displayed** - Having data in database or locale files doesn't mean components use it
2. **Hardcoded config objects** - Watch for objects like `CATEGORY_CONFIG` with hardcoded English names/descriptions
3. **Fallback pattern** - Always use `t('key') || fallbackValue` to gracefully handle missing translations
4. **Client vs Server components** - Client components use `useLocale()` hook, server components use `getLocaleSync()` and `createTranslator()`

6. **Condition detail page showing English** - `/conditions/[slug]` page had multiple untranslated areas:
   - Article titles and excerpts in English
   - Research summaries (plain_summary) in English
   - Category badge showing raw database value
   - Evidence level ("Strong") and description in English
   - Study subject badges ("human", "animal") in English

   **Fixes applied:**
   - Added `getArticlesForConditionWithTranslations()` to `src/lib/translations.ts`
   - Added `getResearchWithTranslations()` to `src/lib/translations.ts`
   - Updated `src/app/conditions/[slug]/page.tsx` to use translation functions
   - Category badge now uses `t('conditions.categories.{category}')`
   - Evidence level uses `t('evidence.strong')`, `t('evidence.strongDesc')`, etc.
   - Study subject uses `t('research.studySubject.{subject}')`
   - Added missing translation keys:
     - `evidence.strongDesc`, `moderateDesc`, `emergingDesc`, `limitedDesc`, `preliminaryDesc`
     - `evidence.emerging`, `evidence.preliminary`
     - `research.studySubject.human`, `animal`, `review`, `in_vitro`
     - `common.healthCondition`

**Verification Completed:**
- ✅ Homepage: Category labels show "MENTAL SUNDHED", "NEUROLOGISKE SYGDOMME" etc.
- ✅ Conditions page: All category cards translated with Danish names and descriptions
- ✅ Study/article counts: "studier" and "artikler" instead of "studies" and "articles"
- ✅ Section headers: "Gennemse efter kropssystem", "Find sygdomme organiseret efter kropsdel"
- ✅ Condition detail page (`/conditions/sleep?lang=da`):
  - Category badge: "Mental sundhed" instead of raw category
  - Evidence level: "Stærk" with Danish description
  - Article titles: All translated to Danish
  - Research summaries: Translated plain_summary from database
  - Study subject badges: "Menneskelig studie" instead of "human"

**Files Modified:**
- `src/lib/translations.ts` - Added `getFeaturedArticlesWithTranslations()`, `getArticlesForConditionWithTranslations()`, `getResearchWithTranslations()`
- `src/lib/articles.ts` - Updated `getArticles()` with translation support
- `src/app/articles/page.tsx` - Added searchParams language detection
- `src/app/conditions/[slug]/page.tsx` - Full translation support for detail page
- `src/components/articles/ArticlesHub.tsx` - Added lang prop
- `src/components/home/FeaturedArticles.tsx` - Use translation function
- `src/components/home/Hero.tsx` - Reduced spacing
- `src/components/home/BrowseByCondition.tsx` - Use `t()` for category labels
- `src/components/conditions/ConditionsHub.tsx` - Full translation support for categories
- `locales/da.json` - Fixed conditions title + added missing keys
- `locales/en.json` - Added missing keys for consistency
- `locales/*.json` - Fixed all domain-based site names

**Documentation Added:**
- `docs/translation-guide.md` - Complete translation guide
- `CLAUDE.md` - Translation Implementation Guidelines section

---

### January 27, 2026 - Chat Analytics & Project Status

**Chat Analytics Fixes:**
- Fixed React error #438 in chat detail page (changed `use(params)` to `useParams()`)
- Fixed chat logging not appearing (Supabase client singleton issue on Vercel)
- Added delete individual conversation functionality
- Added delete all conversations functionality
- Added geo info capture from Vercel headers (country, region, city)
- Added enhanced user agent parsing (browser, OS, device type)
- Added country flag emoji display in conversation details

**Key Files Modified:**
- `src/app/api/admin/chat/[id]/route.ts` - Fixed client, added DELETE endpoint
- `src/app/api/admin/chat/route.ts` - Added DELETE ALL endpoint
- `src/app/api/chat/route.ts` - Fixed logging client, added geo capture
- `src/app/admin/chat/page.tsx` - Added delete UI with confirmation
- `src/app/admin/chat/[id]/page.tsx` - Fixed useParams, enhanced user info display

**Project Status Update:**
- Verified all 1,259 articles published
- Verified all 312 conditions have articles (100% coverage)
- Updated CLAUDE.md with complete project status

---

### January 25, 2026 - Multi-Language Translation System

**Implemented:**
- Complete translation system for 8 European languages
- Domain-based routing infrastructure (cbd.dk, cbd.se, cbd.no, etc.)
- AI-powered translation via Claude API (claude-3-haiku)
- LocaleProvider context and useLocale hook

**Translation Coverage (partial - in progress):**
- Conditions: 1,000/2,496 (~40%)
- Glossary: 1,000/2,104 (~48%)
- UI Strings: 8 locale JSON files (100%)

**Key Files Created:**
- `locales/*.json` - UI translations for all 8 languages
- `src/components/LocaleProvider.tsx` - React context provider
- `src/hooks/useLocale.ts` - Translation hook
- `scripts/translate-content.ts` - Batch translation script
- `scripts/validate-translations.ts` - Coverage checker
- `scripts/check-counts.ts` - Quick count verification
- `scripts/find-missing.ts` - Find missing translations

**Database Tables Added:**
- `condition_translations` - Condition name/description translations
- `glossary_translations` - Glossary term translations

---

### January 18, 2026 - Content Documentation System

**Added:**
- Condition Article Specification v1.1
- Condition Article Generator instruction
- Updated Master Plan to v7
- Updated Writing Guidelines to v1.1
- Updated Research Data Strategy to v1.1

**Key Features:**
- Evidence-tiered article length (600-2,400 words)
- Hybrid citation strategy (internal + external)
- Quotable stats for journalists (Key Numbers box)
- "My Take" author perspective section
- Mandatory research analysis before writing
- Medical review requirements
- Content freshness triggers

### January 16, 2026 - Research Scanner Completion

**Scanner System - Fully Operational:**
- 6 data sources integrated (PubMed, PMC, OpenAlex, Europe PMC, Semantic Scholar, citation imports)
- 48 search keywords across therapeutic areas
- Cross-source deduplication (DOI, PMID, PMC ID, title similarity)
- Job controls (pause/resume/cancel)
- Real-time UI updates via Supabase subscriptions

**Code Quality Improvements:**
- Database indexes for kb_articles, kb_research_queue, kb_scan_jobs
- Centralized type definitions in `src/lib/types/database.ts`
- API utilities with consistent error handling
- N+1 query fix with React `cache()`

**Production Readiness:**
- Sitemap with 39 condition pages
- Admin API authentication (token-based)
- Image optimization with Next.js Image component
- AI article generation endpoint


## Feature Implementation Priority Rules
- IMMEDIATE EXECUTION: Launch parallel Tasks immediately upon feature requests
- PARALLEL BY DEFAULT: Always use 7-parallel-Task method for efficiency
- NO CLARIFICATION: Skip asking what type of implementation unless absolutely critical
