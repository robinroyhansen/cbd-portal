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

### Translation Status

| Content Type | Count | Status |
|--------------|-------|--------|
| Conditions | 312 × 8 = 2,496 | 100% translated |
| Glossary Terms | 263 × 8 = 2,104 | 100% translated |
| UI Strings | 8 locale files | 100% translated |

### Translation Tables

- `condition_translations` - Translated condition names and descriptions
- `glossary_translations` - Translated glossary terms and definitions
- `article_translations` - Translated article content (future)

### Key Files

- `locales/*.json` - UI string translations (da, sv, no, de, nl, fi, fr, it)
- `src/lib/language.ts` - Domain-based language detection
- `src/lib/translation-service.ts` - Claude API translation service
- `src/components/LocaleProvider.tsx` - React context for translations
- `src/hooks/useLocale.ts` - Translation hook for components
- `scripts/translate-content.ts` - Batch translation script

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

## CURRENT STATE (January 25, 2026)

### Research Database
- **4000+ approved studies** in `kb_research_queue`
- **37 topics** covered (anxiety, pain, sleep, epilepsy, etc.)
- **7 data sources** integrated (PubMed, PMC, ClinicalTrials.gov, OpenAlex, Europe PMC, Semantic Scholar, bioRxiv/medRxiv)
- **106 search keywords** across all therapeutic areas

### Content Production
- **312 medical conditions** in `kb_conditions` with SEO templates
- **263 glossary terms** in `kb_glossary`
- **Condition article spec v1.1** — Ready for article production
- **Evidence-tiered system** — Article length (600-2,400 words) based on research depth

### Multi-Language System
- **8 European languages** fully supported (da, sv, no, de, nl, fi, fr, it)
- **2,496 condition translations** (312 × 8 languages)
- **2,104 glossary translations** (263 × 8 languages)
- **8 UI locale files** with all interface strings translated
- **Domain-based routing** ready for cbd.dk, cbd.se, cbd.no, etc.

### Database Tables
- **kb_conditions**: Medical conditions with SEO templates (foundation for programmatic pages)
- **kb_articles**: Articles linked to conditions with FAQ schema, RLS policies, full-text search
- **kb_research_queue**: Research studies with quality/relevance scores, topics, study_subject
- **kb_scan_jobs**: Scanner job tracking with pause/resume support
- **kb_glossary**: Glossary definitions for auto-linking
- **condition_translations**: Translated condition content (8 languages)
- **glossary_translations**: Translated glossary terms (8 languages)

### Recent Updates
- Multi-language translation system (8 European languages)
- Domain-based language routing infrastructure
- AI-powered batch translation via Claude API
- LocaleProvider and useLocale hook for React components

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
- `src/lib/research-scanner.ts` - Main scanner with 7 source adapters
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

## Deployment Rules

After completing any build or feature:
1. Run `npm run build` to verify it works
2. Commit changes with descriptive message
3. Push to GitHub: `git push origin main`
4. Vercel auto-deploys from GitHub

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

### Key Topics (37 total)
Anxiety, depression, PTSD, sleep, epilepsy, chronic_pain, neuropathic_pain, arthritis, fibromyalgia, inflammation, migraines, cancer, skin conditions (acne, psoriasis, eczema), cardiovascular, diabetes, and more.

### Quality Thresholds
- **High quality:** score ≥ 70
- **Medium quality:** score 50-69
- **Lower quality:** score < 50
- **Publication gate:** relevance_score ≥ 40 required for public display

---

## SESSION LOG

### January 25, 2026 - Multi-Language Translation System

**Implemented:**
- Complete translation system for 8 European languages
- Domain-based routing infrastructure (cbd.dk, cbd.se, cbd.no, etc.)
- AI-powered translation via Claude API (claude-3-haiku)
- LocaleProvider context and useLocale hook

**Translation Coverage:**
- Conditions: 2,496/2,496 (100%)
- Glossary: 2,104/2,104 (100%)
- UI Strings: 8 locale JSON files

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
- 7 data sources integrated
- 106 search keywords across all therapeutic areas
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
