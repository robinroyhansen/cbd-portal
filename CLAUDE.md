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

| Content Type | Target | Current | Status |
|--------------|--------|---------|--------|
| Conditions | 312 × 8 = 2,496 | 2,496 | ✅ 100% all languages |
| Glossary Terms | 263 × 8 = 2,104 | 2,104 | ✅ 100% all languages |
| Articles | 1,259 × 8 = 10,072 | 1,259 | Danish: 100%, others: 0% |
| Research | 4,879 × 8 = 39,032 | 4,488 | Danish: 92%, others: 0% |
| UI Strings | 8 locale files | 8 files | ✅ 100% translated |

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

### Translation Status

| Language | Conditions | Glossary | Articles | Research |
|----------|------------|----------|----------|----------|
| Danish (da) | 312/312 ✅ | 263/263 ✅ | 1,259/1,259 ✅ | 4,488/4,879 (92%) |
| Swedish (sv) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| Norwegian (no) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| German (de) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| Dutch (nl) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| Finnish (fi) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| French (fr) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |
| Italian (it) | 312/312 ✅ | 263/263 ✅ | 0/1,259 | 0/4,879 |

**Totals:** Conditions: 2,496/2,496 ✅ (100%) | Glossary: 2,104/2,104 ✅ (100%) | Articles: 1,259/10,072 (12%) | Research: 4,488/39,032 (11%)

**UI Strings:** 8 locale JSON files (100% translated)

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

### What's Remaining

1. **Condition Translations** - ✅ COMPLETE (100% for all 8 languages)
2. **Glossary Translations** - ✅ COMPLETE (100% for all 8 languages)
3. **Article Translations** - Danish ✅ complete, 7 languages remaining (sv, no, de, nl, fi, fr, it)
4. **Research Translations** - Danish 92% (391 remaining), 7 languages not started
5. **Domain Setup** - Configure cbd.dk, cbd.se, cbd.no, etc. DNS and Vercel domains

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
