# CBD Portal - Route & Localization Checklist

## Issues Fixed (2024-02-01)

### 1. Missing Route Translations in Middleware
Added missing translations for DA/NO:
- `tags` → `tags` (DA/NO)
- `topics` → `emner` (DA/NO)
- `product-finder` → `produkt-finder` (DA) / `produkt-finner` (NO)
- `methodology` → `metodik` (DA) / `metodikk` (NO)
- `study` → `studie` (DA/NO)
- `category` → `kategori` (DA/NO)

### 2. Components Using Wrong Link Import
Fixed 14 components to use `LocaleLink` instead of regular `next/link`:
- `ConditionsHub.tsx`
- `BrowseByCondition.tsx`
- `TrendingTopics.tsx`
- `LatestResearch.tsx`
- `GlossaryTeaser.tsx`
- `FeaturedArticles.tsx`
- `ToolsShowcase.tsx`
- `ComparisonShowcase.tsx`
- `AuthorTrust.tsx`
- `BrowseByProduct.tsx`
- `LinkedContent.tsx`
- `ResearchCard.tsx`
- `ResearchCitations.tsx`
- All cannabinoid components

---

## Complete Route Checklist by Language

### English (en) - Default
| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ | Homepage |
| `/conditions` | ✅ | Conditions hub |
| `/conditions/depression` | ✅ | Individual condition |
| `/articles` | ✅ | Articles list |
| `/articles/[slug]` | ✅ | Individual article |
| `/glossary` | ✅ | Glossary hub |
| `/glossary/[slug]` | ✅ | Glossary term |
| `/glossary/category/[category]` | ✅ | Glossary category |
| `/research` | ✅ | Research hub |
| `/research/[condition]` | ✅ | Condition research |
| `/research/methodology` | ✅ | Research methodology |
| `/research/study/[slug]` | ✅ | Individual study |
| `/tools` | ✅ | Tools hub |
| `/tools/dosage-calculator` | ✅ | Dosage calculator |
| `/tools/cost-calculator` | ✅ | Cost calculator |
| `/tools/strength-calculator` | ✅ | Strength calculator |
| `/tools/interactions` | ✅ | Drug interactions |
| `/tools/product-finder` | ✅ | Product finder |
| `/tools/animal-dosage-calculator` | ✅ | Pet dosage |
| `/pets` | ✅ | Pets hub |
| `/pets/dogs` | ✅ | Dogs section |
| `/pets/cats` | ✅ | Cats section |
| `/pets/horses` | ✅ | Horses section |
| `/pets/birds` | ✅ | Birds section |
| `/pets/small-pets` | ✅ | Small pets |
| `/reviews` | ✅ | Reviews |
| `/reviews/[slug]` | ✅ | Individual review |
| `/reviews/methodology` | ✅ | Review methodology |
| `/authors` | ✅ | Authors list |
| `/authors/[slug]` | ✅ | Author profile |
| `/categories` | ✅ | Categories hub |
| `/categories/[slug]` | ✅ | Category page |
| `/tags` | ✅ | Tags hub |
| `/tags/[slug]` | ✅ | Tag page |
| `/topics` | ✅ | Topics hub |
| `/topics/[slug]` | ✅ | Topic page |
| `/search` | ✅ | Search |
| `/about` | ✅ | About page |
| `/contact` | ✅ | Contact page |
| `/medical-disclaimer` | ✅ | Medical disclaimer |
| `/editorial-policy` | ✅ | Editorial policy |
| `/privacy-policy` | ✅ | Privacy policy |
| `/terms-of-service` | ✅ | Terms of service |
| `/cookie-policy` | ✅ | Cookie policy |

### Danish (da) - with `?lang=da` or on cbd.dk
| English Route | Danish Route | Status |
|--------------|--------------|--------|
| `/conditions` | `/tilstande` | ✅ |
| `/conditions/depression` | `/tilstande/depression` | ✅ |
| `/articles` | `/artikler` | ✅ |
| `/glossary` | `/ordliste` | ✅ |
| `/research` | `/forskning` | ✅ |
| `/research/methodology` | `/forskning/metodik` | ✅ |
| `/research/study/[slug]` | `/forskning/studie/[slug]` | ✅ |
| `/tools` | `/vaerktoejer` | ✅ |
| `/tools/dosage-calculator` | `/vaerktoejer/dosis-beregner` | ✅ |
| `/tools/cost-calculator` | `/vaerktoejer/pris-beregner` | ✅ |
| `/tools/strength-calculator` | `/vaerktoejer/styrke-beregner` | ✅ |
| `/tools/interactions` | `/vaerktoejer/interaktioner` | ✅ |
| `/tools/product-finder` | `/vaerktoejer/produkt-finder` | ✅ |
| `/tools/animal-dosage-calculator` | `/vaerktoejer/dyre-dosis-beregner` | ✅ |
| `/pets` | `/kaeledyr` | ✅ |
| `/pets/dogs` | `/kaeledyr/hunde` | ✅ |
| `/pets/cats` | `/kaeledyr/katte` | ✅ |
| `/pets/horses` | `/kaeledyr/heste` | ✅ |
| `/pets/birds` | `/kaeledyr/fugle` | ✅ |
| `/pets/small-pets` | `/kaeledyr/smaa-kaeledyr` | ✅ |
| `/reviews` | `/anmeldelser` | ✅ |
| `/authors` | `/forfattere` | ✅ |
| `/categories` | `/kategorier` | ✅ |
| `/tags` | `/tags` | ✅ |
| `/topics` | `/emner` | ✅ |
| `/search` | `/soeg` | ✅ |
| `/about` | `/om-os` | ✅ |
| `/contact` | `/kontakt` | ✅ |
| `/glossary/category/[cat]` | `/ordliste/kategori/[cat]` | ✅ |
| `/medical-disclaimer` | `/medicinsk-ansvarsfraskrivelse` | ✅ |
| `/editorial-policy` | `/redaktionspolitik` | ✅ |
| `/privacy-policy` | `/privatlivspolitik` | ✅ |
| `/terms-of-service` | `/servicevilkaar` | ✅ |
| `/cookie-policy` | `/cookiepolitik` | ✅ |

### Norwegian (no) - with `?lang=no` or on cbd.no
| English Route | Norwegian Route | Status |
|--------------|-----------------|--------|
| `/conditions` | `/tilstander` | ✅ |
| `/articles` | `/artikler` | ✅ |
| `/glossary` | `/ordliste` | ✅ |
| `/research` | `/forskning` | ✅ |
| `/research/methodology` | `/forskning/metodikk` | ✅ |
| `/research/study/[slug]` | `/forskning/studie/[slug]` | ✅ |
| `/tools` | `/verktoy` | ✅ |
| `/tools/dosage-calculator` | `/verktoy/dose-kalkulator` | ✅ |
| `/tools/cost-calculator` | `/verktoy/pris-kalkulator` | ✅ |
| `/tools/strength-calculator` | `/verktoy/styrke-kalkulator` | ✅ |
| `/tools/interactions` | `/verktoy/interaksjoner` | ✅ |
| `/tools/product-finder` | `/verktoy/produkt-finner` | ✅ |
| `/tools/animal-dosage-calculator` | `/verktoy/dyre-dose-kalkulator` | ✅ |
| `/pets` | `/kjaeledyr` | ✅ |
| `/pets/dogs` | `/kjaeledyr/hunder` | ✅ |
| `/pets/cats` | `/kjaeledyr/katter` | ✅ |
| `/pets/horses` | `/kjaeledyr/hester` | ✅ |
| `/pets/birds` | `/kjaeledyr/fugler` | ✅ |
| `/pets/small-pets` | `/kjaeledyr/smaa-kjaeledyr` | ✅ |
| `/reviews` | `/anmeldelser` | ✅ |
| `/authors` | `/forfattere` | ✅ |
| `/categories` | `/kategorier` | ✅ |
| `/tags` | `/tags` | ✅ |
| `/topics` | `/emner` | ✅ |
| `/search` | `/sok` | ✅ |
| `/about` | `/om-oss` | ✅ |
| `/contact` | `/kontakt` | ✅ |
| `/glossary/category/[cat]` | `/ordliste/kategori/[cat]` | ✅ |
| `/medical-disclaimer` | `/medisinsk-ansvarsfraskrivelse` | ✅ |
| `/editorial-policy` | `/redaksjonspolitikk` | ✅ |
| `/privacy-policy` | `/personvernpolitikk` | ✅ |
| `/terms-of-service` | `/tjenestevilkaar` | ✅ |
| `/cookie-policy` | `/informasjonskapsler` | ✅ |

---

## How Route Localization Works

### For Danish (DA) and Norwegian (NO):
1. **Domain-based**: On `cbd.dk` or `cbd.no`, routes are automatically translated
2. **Query param**: Using `?lang=da` or `?lang=no` on the test domain also translates routes
3. **Middleware rewrites**: Localized paths are rewritten to English paths internally

### For Other Languages (DE, SV, FI, etc.):
1. Routes stay in English
2. Content is translated via the `?lang=XX` parameter
3. Only UI text is translated, not URL paths

---

## Testing Guide

### Test Danish Routes:
```
https://cbd-portal.vercel.app/tilstande/depression?lang=da
https://cbd-portal.vercel.app/vaerktoejer/dosis-beregner?lang=da
https://cbd-portal.vercel.app/forskning/metodik?lang=da
```

### Test Norwegian Routes:
```
https://cbd-portal.vercel.app/tilstander/depresjon?lang=no
https://cbd-portal.vercel.app/verktoy/dose-kalkulator?lang=no
https://cbd-portal.vercel.app/forskning/metodikk?lang=no
```

### Test German (No route translation, only content):
```
https://cbd-portal.vercel.app/conditions/depression?lang=de
https://cbd-portal.vercel.app/tools/dosage-calculator?lang=de
```
