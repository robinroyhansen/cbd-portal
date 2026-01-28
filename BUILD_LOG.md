# CBD Portal Build & Deploy Log

This file tracks build, deploy, and browser validation results.

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
