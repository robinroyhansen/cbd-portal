# CBD Portal Build & Deploy Log

This file tracks build, deploy, and browser validation results.

---

## 2026-01-28 - Fix Condition Pages Danish Translation

**Commits:**
- `36f3c95` - Add Danish translations for condition detail pages
- `92fc165` - Fix language detection using searchParams

**Build:** ✅ Success
**Deploy:** ✅ Live

### Problem Solved
Condition detail pages (e.g., `/conditions/sleep?lang=da`) were showing English content even when accessed with the Danish language parameter. The page title, buttons, stats, and sections all displayed in English.

### Root Cause
The condition page is a server component that used `getLanguage()` to detect the language from headers. However, with `revalidate = 86400` (static generation), headers were not available during static generation, causing the page to always render in English.

### Solution
1. Added `searchParams` to the page's Props interface
2. Read `lang` directly from URL searchParams instead of relying on headers
3. Added translation keys for all condition page UI strings to locale files

### Files Changed
- `src/app/conditions/[slug]/page.tsx` - Read lang from searchParams, use t() for translations
- `locales/da.json` - Added `conditionPage` section with Danish translations
- `locales/en.json` - Added `conditionPage` section with English strings

### Validation Results
| Test | Status | Notes |
|------|--------|-------|
| Sleep page in Danish | ✅ Pass | All UI in Danish |
| Anxiety page in Danish | ✅ Pass | All UI in Danish |
| Buttons translated | ✅ Pass | "Læs artikler", "Gennemse studier" |
| Stats section translated | ✅ Pass | "Forskningsoversigt", "studier", etc. |
| Links preserve lang param | ✅ Pass | Internal links include `?lang=da` |

### Screenshots
- Danish sleep condition: `/tmp/production-danish.png`
- Danish anxiety condition: `/tmp/production-danish-anxiety.png`

---

## 2026-01-28 - Fix Language Preservation in Internal Links

**Commit:** `4ad7d3e` - Update NavLink and NavSearchBar to use LocaleLink
**Build:** ✅ Success (459 pages generated)
**Deploy:** ✅ Live

### Problem Solved
Internal links were losing the `?lang=da` parameter when navigating, causing Danish users to fall back to English pages.

### Solution
- Created `LocaleLink` component that automatically appends `?lang=` to internal links
- Created `createLocalizedHref()` utility for server components
- Updated 12 components to use locale-aware links

### Files Changed
- `src/components/LocaleLink.tsx` (new) - Client-side locale-aware Link wrapper
- `src/lib/utils/locale-href.ts` (new) - Server-side localized href builder
- `src/components/Footer.tsx` - All footer links
- `src/components/home/Hero.tsx` - CTA buttons
- `src/components/home/BrowseByCondition.tsx` - Condition cards
- `src/components/home/BrowseByProduct.tsx` - Product cards
- `src/components/home/GlossaryTeaser.tsx` - Glossary links
- `src/components/home/LatestResearch.tsx` - Research cards
- `src/components/articles/ArticlesHub.tsx` - Article cards
- `src/components/layouts/Navigation/*.tsx` - Nav links

### Validation Results
| Test | Status | Notes |
|------|--------|-------|
| Homepage loads in Danish | ✅ Pass | `?lang=da` shows full Danish UI |
| Hero CTA links | ✅ Pass | `/conditions?lang=da` preserved |
| Footer links | ✅ Pass | `/conditions?lang=da` preserved |
| Navigation links | ✅ Pass | `/research?lang=da` preserved |
| Page content stays Danish | ✅ Pass | All UI strings translated |

### Screenshots
- Danish homepage: `/tmp/danish-final-test.png`

---

## 2026-01-28 - Build & Deploy Workflow Documentation

**Commit:** `88fd6e7` - Add build & deploy workflow with browser validation
**Build:** ✅ Success (459 pages generated)
**Deploy:** ✅ Live

### Validation Results
| Viewport | Status | Notes |
|----------|--------|-------|
| Desktop (1280px) | ✅ Pass | All sections rendering, navigation/footer/chat functional |
| Mobile (375px) | ✅ Pass | Responsive layout, mobile nav, bottom bar visible |

### Changes Deployed
- Added build & deploy workflow to CLAUDE.md
- Created BUILD_LOG.md for tracking deployments
- Documented browser validation commands (desktop + mobile)

### Screenshots
- Desktop: `/tmp/deploy-desktop.png`
- Mobile: `/tmp/deploy-mobile.png`

### Build Warnings (non-blocking)
- `ConditionKey` export warning in ResearchPageClient.tsx
- `calculateRelevance` import warning in research-scanner-chunked.ts

---

## 2026-01-28 - Danish Localization Complete

**Commit:** `f27d026` - Fix newsletter and chat translations for Danish
**Build:** ✅ Success
**Deploy:** ✅ Live

### Validation Results
| Viewport | Status | Notes |
|----------|--------|-------|
| Desktop (1280px) | ✅ Pass | All UI in Danish, navigation/footer/chat verified |
| Mobile (375px) | ✅ Pass | Responsive layout working |

### Changes Deployed
- Complete Danish localization for cbd.dk
- Navigation: Sundhedsemner, Lær, Forskning, Værktøjer, Kæledyr, Anmeldelser
- Footer: All links translated
- Newsletter: "Hold dig opdateret", "Din e-mail", "Tilmeld"
- Chat widget: Danish questions and placeholders
- Cookie banner: Danish consent buttons

### Screenshots
- Desktop: `/tmp/cbd-danish-complete.png`

---

## 2026-01-28 - Research Translations & Hardcoded Strings

**Commit:** `c99ce9d` - Complete Danish localization for CBD.dk launch
**Build:** ✅ Success
**Deploy:** ✅ Live

### Changes Deployed
- 4,488 research summaries translated to Danish (100%)
- Fixed hardcoded strings in CannabinoidHub, ConditionArticlesHub, AuthorBio
- Created `/src/lib/utils/format-date.ts` for locale-aware dates
- Added Cookie Policy Danish translation
- Fixed share buttons and study page strings

---

## Template

```markdown
## [DATE] - [Description]

**Commit:** `[hash]` - [message]
**Build:** ✅ Success | ❌ Failed
**Deploy:** ✅ Live | ⏳ Pending | ❌ Failed

### Validation Results
| Viewport | Status | Notes |
|----------|--------|-------|
| Desktop (1280px) | ✅/❌ | |
| Mobile (375px) | ✅/❌ | |

### Changes Deployed
-

### Issues Found
-

---
```
