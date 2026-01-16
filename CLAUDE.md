# CBD Portal - Claude Code Project Documentation

## Project Overview

CBD educational portal built with Next.js 14, Supabase, and TailwindCSS. Features a comprehensive knowledge base, research scanner, glossary system, and admin tools.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Deployment**: Vercel
- **Language**: TypeScript

---

## CURRENT STATE (January 16, 2026)

### Database Tables
- **kb_conditions**: 39 medical conditions with SEO templates (foundation for programmatic pages)
- **kb_research_queue**: Active research queue for scanner results
- **kb_scan_jobs**: Scanner job tracking with pause/resume support
- **kb_articles**: Knowledge base articles
- **kb_glossary_terms**: Glossary definitions

### In Progress
- Full "All time" scan running across all 7 sources
- Collecting research across 106 condition-specific search terms

### Recent Deployments
- Scanner UI with 106 keywords display
- Queue improvements with score breakdowns
- Cross-source deduplication

---

## SESSION LOG

### January 16, 2026 - Research Scanner Completion

**Scanner System - Fully Operational:**
- 7 data sources integrated:
  - PubMed (33M+ articles)
  - PMC (full-text research)
  - ClinicalTrials.gov (clinical trials)
  - OpenAlex (250M+ works)
  - Europe PMC (European literature)
  - Semantic Scholar (AI-powered discovery)
  - bioRxiv/medRxiv (preprints)

**106 Search Keywords** covering all therapeutic areas:
- Clinical Trials (10 terms)
- Mental Health: Anxiety (5), Depression (4), PTSD (4), Sleep (5)
- Neurological: Epilepsy (6), Parkinson's (4), Alzheimer's (4), Autism (3), ADHD (2), Schizophrenia (3), Tourette's (2)
- Addiction (5)
- Pain: Chronic (5), Neuropathic (4), Arthritis (4), Fibromyalgia (3)
- Multiple Sclerosis (4)
- Inflammation (4), Migraines (3)
- GI/Digestive (9)
- Cancer (8)
- Skin (7)
- Cardiovascular (5)
- Metabolic (5)
- Other conditions (9)
- Products: Epidiolex, Sativex, etc. (8)
- Research Types (5)

**Cross-Source Deduplication:**
- DOI matching (primary)
- PMID matching
- PMC ID matching
- Title similarity (90%+ threshold)

**Job Controls:**
- Pause/Resume support with state preservation
- Cancel running jobs
- Per-source progress tracking
- Real-time UI updates via Supabase subscriptions

**Data Quality:**
- HTML entity cleanup (titles, abstracts)
- Year validation using DOI patterns
- Language detection
- Relevance scoring with signals

**Queue UI Improvements:**
- ResearchDetailModal for full paper review
- ScoreBadge with expandable relevance signals
- Categorized rejection reasons (7 options)
- "Approve High Confidence" bulk action (score >= 70)
- Color-coded confidence indicators
- Visual score progress bars

**Scanner UI Updates:**
- Shows all 106 keywords organized by 28 categories
- "Show all" toggle to expand full term list
- Category badges with term counts
- Custom keyword support

---

## KEY FILES

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

### Conditions API
- `src/app/api/conditions/route.ts` - List/filter conditions
- `src/app/api/conditions/[slug]/route.ts` - Single condition with related data

### SEO & Article Production
- `src/lib/seo/page-templates.ts` - Metadata & JSON-LD schema generators
- `src/lib/glossary-linker.ts` - Auto-link glossary terms (server-side)
- `src/lib/utils/glossary-autolink.ts` - Glossary term markers (client-side)
- `src/components/research/ResearchCitations.tsx` - Display related studies

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

---

## ENVIRONMENT VARIABLES

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
