# CBD Portal Finnish (FI) Comprehensive QA Report

**Date:** 2026-02-10
**Site:** https://cbd-portal.vercel.app
**Language:** Finnish (FI)
**Database Status:** 1,317/1,317 articles translated (100% complete)
**Test Type:** Comprehensive translation and localization audit

## Executive Summary

| Metric | Count | Status |
|--------|-------|--------|
| Total Pages Tested | 33 | - |
| ✅ Fully Translated | 0 | 0.0% |
| ⚠️ Translation Issues | 33 | 100.0% |
| ❌ Failed to Load | 0 | 0.0% |
| 🔀 Wrong Language | 0 | 0.0% |
| 🔑 Raw Translation Keys | 132 | Critical Issue |

**Overall Translation Quality:** 0.0% 🔴 Poor

## 🚨 Critical Issues - Raw Translation Keys

**These must be fixed immediately - they show untranslated key names to users:**

| Page | Type | Raw Keys Found |
|------|------|----------------|
| `/?lang=fi` | homepage | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/?lang=fi` | homepage | `{{count}}, {{count}}, {{count}}...` |
| `/?lang=fi` | homepage | `undefined, undefined, undefined...` |
| `/?lang=fi` | homepage | `null, null, null...` |
| `/artikkelit?lang=fi` | articles | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/artikkelit?lang=fi` | articles | `{{count}}, {{count}}, {{count}}...` |
| `/artikkelit?lang=fi` | articles | `undefined, undefined, undefined...` |
| `/artikkelit?lang=fi` | articles | `null, null, null...` |
| `/sairaudet?lang=fi` | conditions | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/sairaudet?lang=fi` | conditions | `{{count}}, {{count}}, {{count}}...` |
| `/sairaudet?lang=fi` | conditions | `undefined, undefined, undefined...` |
| `/sairaudet?lang=fi` | conditions | `null, null, null...` |
| `/tyokalut?lang=fi` | tools | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tyokalut?lang=fi` | tools | `{{count}}, {{count}}, {{count}}...` |
| `/tyokalut?lang=fi` | tools | `undefined, undefined, undefined...` |
| `/tyokalut?lang=fi` | tools | `null, null, null...` |
| `/sanasto?lang=fi` | glossary | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/sanasto?lang=fi` | glossary | `{{count}}, {{count}}, {{count}}...` |
| `/sanasto?lang=fi` | glossary | `undefined, undefined, undefined...` |
| `/sanasto?lang=fi` | glossary | `null, null, null...` |
| `/tutkimus?lang=fi` | research | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tutkimus?lang=fi` | research | `{{count}}, {{count}}, {{count}}...` |
| `/tutkimus?lang=fi` | research | `undefined, undefined, undefined...` |
| `/tutkimus?lang=fi` | research | `null, null, null...` |
| `/lemmikit?lang=fi` | pets | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/lemmikit?lang=fi` | pets | `{{count}}, {{count}}, {{count}}...` |
| `/lemmikit?lang=fi` | pets | `undefined, undefined, undefined...` |
| `/lemmikit?lang=fi` | pets | `null, null, null...` |
| `/haku?lang=fi` | search | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/haku?lang=fi` | search | `{{count}}, {{count}}, {{count}}...` |
| `/haku?lang=fi` | search | `undefined, undefined, undefined...` |
| `/haku?lang=fi` | search | `null, null, null...` |
| `/conditions?lang=fi` | conditions-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions?lang=fi` | conditions-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/conditions?lang=fi` | conditions-english-path | `undefined, undefined, undefined...` |
| `/conditions?lang=fi` | conditions-english-path | `null, null, null...` |
| `/tools?lang=fi` | tools-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tools?lang=fi` | tools-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/tools?lang=fi` | tools-english-path | `undefined, undefined, undefined...` |
| `/tools?lang=fi` | tools-english-path | `null, null, null...` |
| `/glossary?lang=fi` | glossary-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/glossary?lang=fi` | glossary-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/glossary?lang=fi` | glossary-english-path | `undefined, undefined, undefined...` |
| `/glossary?lang=fi` | glossary-english-path | `null, null, null...` |
| `/research?lang=fi` | research-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/research?lang=fi` | research-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/research?lang=fi` | research-english-path | `undefined, undefined, undefined...` |
| `/research?lang=fi` | research-english-path | `null, null, null...` |
| `/articles?lang=fi` | articles-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/articles?lang=fi` | articles-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/articles?lang=fi` | articles-english-path | `undefined, undefined, undefined...` |
| `/articles?lang=fi` | articles-english-path | `null, null, null...` |
| `/pets?lang=fi` | pets-english-path | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/pets?lang=fi` | pets-english-path | `{{count}}, {{count}}, {{count}}...` |
| `/pets?lang=fi` | pets-english-path | `undefined, undefined, undefined...` |
| `/pets?lang=fi` | pets-english-path | `null, null, null...` |
| `/conditions/anxiety?lang=fi` | condition-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions/anxiety?lang=fi` | condition-page | `{{count}}, {{count}}, {{count}}...` |
| `/conditions/anxiety?lang=fi` | condition-page | `undefined, undefined, undefined...` |
| `/conditions/anxiety?lang=fi` | condition-page | `null, null, null...` |
| `/conditions/pain?lang=fi` | condition-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions/pain?lang=fi` | condition-page | `{{count}}, {{count}}, {{count}}...` |
| `/conditions/pain?lang=fi` | condition-page | `undefined, undefined, undefined...` |
| `/conditions/pain?lang=fi` | condition-page | `null, null, null...` |
| `/conditions/depression?lang=fi` | condition-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions/depression?lang=fi` | condition-page | `{{count}}, {{count}}, {{count}}...` |
| `/conditions/depression?lang=fi` | condition-page | `undefined, undefined, undefined...` |
| `/conditions/depression?lang=fi` | condition-page | `null, null, null...` |
| `/conditions/epilepsy?lang=fi` | condition-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions/epilepsy?lang=fi` | condition-page | `{{count}}, {{count}}, {{count}}...` |
| `/conditions/epilepsy?lang=fi` | condition-page | `undefined, undefined, undefined...` |
| `/conditions/epilepsy?lang=fi` | condition-page | `null, null, null...` |
| `/conditions/sleep?lang=fi` | condition-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/conditions/sleep?lang=fi` | condition-page | `{{count}}, {{count}}, {{count}}...` |
| `/conditions/sleep?lang=fi` | condition-page | `undefined, undefined, undefined...` |
| `/conditions/sleep?lang=fi` | condition-page | `null, null, null...` |
| `/tools/dosage-calculator?lang=fi` | tool-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tools/dosage-calculator?lang=fi` | tool-page | `{{count}}, {{count}}, {{count}}...` |
| `/tools/dosage-calculator?lang=fi` | tool-page | `undefined, undefined, undefined...` |
| `/tools/dosage-calculator?lang=fi` | tool-page | `null, null, null...` |
| `/tools/interactions?lang=fi` | tool-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tools/interactions?lang=fi` | tool-page | `{{count}}, {{count}}, {{count}}...` |
| `/tools/interactions?lang=fi` | tool-page | `undefined, undefined, undefined...` |
| `/tools/interactions?lang=fi` | tool-page | `null, null, null...` |
| `/tools/cost-calculator?lang=fi` | tool-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tools/cost-calculator?lang=fi` | tool-page | `{{count}}, {{count}}, {{count}}...` |
| `/tools/cost-calculator?lang=fi` | tool-page | `undefined, undefined, undefined...` |
| `/tools/cost-calculator?lang=fi` | tool-page | `null, null, null...` |
| `/tools/strength-calculator?lang=fi` | tool-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/tools/strength-calculator?lang=fi` | tool-page | `{{count}}, {{count}}, {{count}}...` |
| `/tools/strength-calculator?lang=fi` | tool-page | `undefined, undefined, undefined...` |
| `/tools/strength-calculator?lang=fi` | tool-page | `null, null, null...` |
| `/glossary/cbd?lang=fi` | glossary-term | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/glossary/cbd?lang=fi` | glossary-term | `{{count}}, {{count}}, {{count}}...` |
| `/glossary/cbd?lang=fi` | glossary-term | `undefined, undefined, undefined...` |
| `/glossary/cbd?lang=fi` | glossary-term | `null, null, null...` |
| `/glossary/thc?lang=fi` | glossary-term | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/glossary/thc?lang=fi` | glossary-term | `{{count}}, {{count}}, {{count}}...` |
| `/glossary/thc?lang=fi` | glossary-term | `undefined, undefined, undefined...` |
| `/glossary/thc?lang=fi` | glossary-term | `null, null, null...` |
| `/glossary/cannabidiol?lang=fi` | glossary-term | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/glossary/cannabidiol?lang=fi` | glossary-term | `{{count}}, {{count}}, {{count}}...` |
| `/glossary/cannabidiol?lang=fi` | glossary-term | `undefined, undefined, undefined...` |
| `/glossary/cannabidiol?lang=fi` | glossary-term | `null, null, null...` |
| `/pets/dogs?lang=fi` | pet-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/pets/dogs?lang=fi` | pet-page | `{{count}}, {{count}}, {{count}}...` |
| `/pets/dogs?lang=fi` | pet-page | `undefined, undefined, undefined...` |
| `/pets/dogs?lang=fi` | pet-page | `null, null, null...` |
| `/pets/cats?lang=fi` | pet-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/pets/cats?lang=fi` | pet-page | `{{count}}, {{count}}, {{count}}...` |
| `/pets/cats?lang=fi` | pet-page | `undefined, undefined, undefined...` |
| `/pets/cats?lang=fi` | pet-page | `null, null, null...` |
| `/about?lang=fi` | static-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/about?lang=fi` | static-page | `{{count}}, {{count}}, {{count}}...` |
| `/about?lang=fi` | static-page | `undefined, undefined, undefined...` |
| `/about?lang=fi` | static-page | `null, null, null...` |
| `/contact?lang=fi` | static-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/contact?lang=fi` | static-page | `{{count}}, {{count}}, {{count}}...` |
| `/contact?lang=fi` | static-page | `undefined, undefined, undefined...` |
| `/contact?lang=fi` | static-page | `null, null, null...` |
| `/privacy-policy?lang=fi` | static-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/privacy-policy?lang=fi` | static-page | `{{count}}, {{count}}, {{count}}...` |
| `/privacy-policy?lang=fi` | static-page | `undefined, undefined, undefined...` |
| `/privacy-policy?lang=fi` | static-page | `null, null, null...` |
| `/terms-of-service?lang=fi` | static-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/terms-of-service?lang=fi` | static-page | `{{count}}, {{count}}, {{count}}...` |
| `/terms-of-service?lang=fi` | static-page | `undefined, undefined, undefined...` |
| `/terms-of-service?lang=fi` | static-page | `null, null, null...` |
| `/medical-disclaimer?lang=fi` | static-page | `s.p.woff, portal.vercel.app, portal.vercel.app...` |
| `/medical-disclaimer?lang=fi` | static-page | `{{count}}, {{count}}, {{count}}...` |
| `/medical-disclaimer?lang=fi` | static-page | `undefined, undefined, undefined...` |
| `/medical-disclaimer?lang=fi` | static-page | `null, null, null...` |

## ⚠️ Translation Issues Detail

### `/?lang=fi` - homepage
- **Language:** fi
- **Title:** CBD Portal | Evidence-Based CBD Information &amp; Research
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all
  - Title appears to be in English

### `/artikkelit?lang=fi` - articles
- **Language:** fi
- **Title:** CBD-artikkelit ja -oppaat | Näyttöön perustuva tieto
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Learn more, Learn more
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all, View all, View all

### `/sairaudet?lang=fi` - conditions
- **Language:** fi
- **Title:** Terveystilat | CBD-portaali
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tyokalut?lang=fi` - tools
- **Language:** fi
- **Title:** CBD-työkalut ja -laskurit | Annostus, yhteisvaikutukset, kustannukset
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/sanasto?lang=fi` - glossary
- **Language:** fi
- **Title:** CBD-sanasto | CBD-portaali
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tutkimus?lang=fi` - research
- **Language:** fi
- **Title:** CBD-tutkimustietokanta | Näyttöön perustuvat tutkimukset
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, s.p.woff...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/lemmikit?lang=fi` - pets
- **Language:** fi
- **Title:** petsPage.metaTitle
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/haku?lang=fi` - search
- **Language:** fi
- **Title:** Hae CBD Portalista | CBD.fi
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/conditions?lang=fi` - conditions-english-path
- **Language:** fi
- **Title:** Terveystilat | CBD-portaali
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tools?lang=fi` - tools-english-path
- **Language:** fi
- **Title:** CBD-työkalut ja -laskurit | Annostus, yhteisvaikutukset, kustannukset
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/glossary?lang=fi` - glossary-english-path
- **Language:** fi
- **Title:** CBD-sanasto | CBD-portaali
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/research?lang=fi` - research-english-path
- **Language:** fi
- **Title:** CBD-tutkimustietokanta | Näyttöön perustuvat tutkimukset
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, s.p.woff...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/articles?lang=fi` - articles-english-path
- **Language:** fi
- **Title:** CBD-artikkelit ja -oppaat | Näyttöön perustuva tieto
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Learn more, Learn more
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all, View all, View all

### `/pets?lang=fi` - pets-english-path
- **Language:** fi
- **Title:** petsPage.metaTitle
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/conditions/anxiety?lang=fi` - condition-page
- **Language:** fi
- **Title:** CBD Ahdistuneisuuden Hoitoon: {research_count}+ Tutkimusta Arvioitu ({year})
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all, View all, View all

### `/conditions/pain?lang=fi` - condition-page
- **Language:** fi
- **Title:** Kivunhallinta - CBD:n hyödyt
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all

### `/conditions/depression?lang=fi` - condition-page
- **Language:** fi
- **Title:** CBD masennus: Tutkimus ja näyttö ({year})
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all

### `/conditions/epilepsy?lang=fi` - condition-page
- **Language:** fi
- **Title:** CBD epilepsian hoitoon: Epidiolex ja kouristustutkimukset ({year})
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all

### `/conditions/sleep?lang=fi` - condition-page
- **Language:** fi
- **Title:** CBD ja uni: {research_count} tutkimusta unettomuudesta ja unen laadusta
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all, Browse all
  - English text found: View all, View all, View all

### `/tools/dosage-calculator?lang=fi` - tool-page
- **Language:** fi
- **Title:** CBD Dosage Calculator | Personalized Recommendations
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tools/interactions?lang=fi` - tool-page
- **Language:** fi
- **Title:** CBD Drug Interaction Checker | Medication Safety Tool
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tools/cost-calculator?lang=fi` - tool-page
- **Language:** fi
- **Title:** CBD Cost Calculator | Compare Price Per mg
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/tools/strength-calculator?lang=fi` - tool-page
- **Language:** fi
- **Title:** CBD Strength Calculator | Convert %, mg/ml, Total mg
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all, View all

### `/glossary/cbd?lang=fi` - glossary-term
- **Language:** fi
- **Title:** Kannabidioli - CBD-sanasto | CBD.fi
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/glossary/thc?lang=fi` - glossary-term
- **Language:** fi
- **Title:** Tetrahydrokannabinoli - CBD-sanasto | CBD.fi
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/glossary/cannabidiol?lang=fi` - glossary-term
- **Language:** fi
- **Title:** Kannabidioli - CBD-sanasto | CBD.fi
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/pets/dogs?lang=fi` - pet-page
- **Language:** fi
- **Title:** CBD for Dogs
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/pets/cats?lang=fi` - pet-page
- **Language:** fi
- **Title:** CBD for Cats
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/about?lang=fi` - static-page
- **Language:** fi
- **Title:** about.metaTitle
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/contact?lang=fi` - static-page
- **Language:** fi
- **Title:** contact.metaTitle
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all

### `/privacy-policy?lang=fi` - static-page
- **Language:** fi
- **Title:** CBD Portal | Evidence-Based CBD Information &amp; Research
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all
  - Title appears to be in English

### `/terms-of-service?lang=fi` - static-page
- **Language:** fi
- **Title:** CBD Portal | Evidence-Based CBD Information &amp; Research
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all
  - Title appears to be in English

### `/medical-disclaimer?lang=fi` - static-page
- **Language:** fi
- **Title:** CBD Portal | Evidence-Based CBD Information &amp; Research
- **Issues:**
  - Raw translation keys found: s.p.woff, portal.vercel.app, portal.vercel.app, portal.vercel.app, portal.vercel.app...
  - Raw translation keys found: {{count}}, {{count}}, {{count}}, {{count}}, {{count}}...
  - Raw translation keys found: undefined, undefined, undefined, undefined, undefined...
  - Raw translation keys found: null, null, null, null, null...
  - English text found: CBD Portal, CBD Portal, CBD Portal
  - English text found: Browse all, Browse all
  - English text found: View all
  - Title appears to be in English

## 🎯 Recommendations

### Priority 1: Fix Translation Keys
- Review translation files for Finnish (fi.json or similar)
- Ensure all keys have proper Finnish translations
- Check for missing namespace imports in components
- Verify i18n configuration includes Finnish locale

### General Recommendations
- Test with Finnish users for UX feedback
- Verify meta tags (title, description) are translated
- Check breadcrumb navigation in Finnish
- Test search functionality with Finnish queries
- Validate form placeholders and error messages
- Ensure date/number formatting follows Finnish conventions

## 📋 Next Steps

1. **Fix critical translation key issues** (if any found)
2. **Resolve language detection problems**
3. **Test article content translation quality**
4. **Verify Finnish-specific URLs work** (if implementing /fi/ prefixes)
5. **QA test with native Finnish speakers**
6. **Setup automated translation monitoring**
