# CBD Portal Build & Deploy Log

This file tracks build, deploy, and browser validation results.

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
