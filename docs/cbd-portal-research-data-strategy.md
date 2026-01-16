# CBD Portal - Research Data Strategy Addendum

**Addendum to:** CBD Portal Master Plan v6
**Created:** January 12, 2026
**Last Updated:** January 16, 2026
**Purpose:** Detailed technical specifications for research database management and content integration

---

## EXECUTIVE SUMMARY

This addendum defines the data quality architecture, topic taxonomy, and research-to-content pipeline that underpins CBD Portal's evidence-based approach. All article content production begins AFTER the research database is fully imported, cleaned, and categorized.

**Key Principle:** Research studies are the foundation. Content is built ON TOP OF research, not independently.

---

## 1. RESEARCH DATABASE ARCHITECTURE

### 1.1 Current State (as of January 16, 2026)

| Metric | Value |
|--------|-------|
| Total Studies | 1,400+ (and growing) |
| Data Sources | 7 (see below) |
| Search Keywords | 106 condition-specific queries |
| Topic Categories | 28 |
| Quality Score Range | 0-100 |
| Relevance Score Range | 0-100 |
| Cross-Source Deduplication | DOI → PMID → PMC ID → Fuzzy Title |

### 1.2 Data Sources (7 Integrated)

| Source | Description | Status |
|--------|-------------|--------|
| **PubMed** | 33M+ biomedical literature | ✅ Active |
| **PMC** | Full-text research articles | ✅ Active |
| **ClinicalTrials.gov** | Clinical trial database | ✅ Active |
| **OpenAlex** | 250M+ works, comprehensive | ✅ Active |
| **Europe PMC** | European biomedical literature | ✅ Active |
| **Semantic Scholar** | AI-powered research discovery | ✅ Active |
| **bioRxiv/medRxiv** | Preprints (newest research) | ✅ Active |

### 1.3 Search Keywords (106 Terms, 28 Categories)

The scanner uses 106 condition-specific search queries organized into categories:

| Category | Terms | Examples |
|----------|-------|----------|
| Clinical Trials | 10 | cannabidiol clinical trial, CBD randomized controlled |
| Anxiety | 5 | cannabidiol anxiety, CBD panic disorder |
| Depression | 4 | cannabidiol depression, CBD antidepressant |
| PTSD | 4 | cannabidiol PTSD, cannabis trauma |
| Sleep | 5 | cannabidiol sleep, CBD insomnia |
| Epilepsy | 6 | Epidiolex Dravet, CBD seizure |
| Parkinson's | 4 | cannabidiol Parkinson, CBD parkinsonian |
| Alzheimer's | 4 | cannabidiol Alzheimer, CBD dementia |
| Autism | 3 | cannabidiol autism, CBD ASD |
| ADHD | 2 | cannabidiol ADHD, CBD attention deficit |
| Schizophrenia | 3 | cannabidiol schizophrenia, CBD psychosis |
| Addiction | 5 | cannabidiol addiction, cannabis opioid withdrawal |
| Tourette's | 2 | cannabidiol Tourette, cannabis tic disorder |
| Chronic Pain | 5 | cannabidiol chronic pain, CBD pain management |
| Neuropathic Pain | 4 | cannabidiol neuropathic pain, CBD neuropathy |
| Arthritis | 4 | cannabidiol arthritis, CBD rheumatoid arthritis |
| Fibromyalgia | 3 | cannabidiol fibromyalgia, CBD widespread pain |
| Multiple Sclerosis | 4 | Sativex spasticity, nabiximols MS |
| Inflammation | 4 | cannabidiol inflammation, CBD anti-inflammatory |
| Migraines | 3 | cannabidiol migraine, CBD headache |
| GI/Digestive | 9 | cannabidiol Crohn, CBD IBD, CBD IBS |
| Cancer | 8 | cannabidiol cancer, CBD tumor, CBD palliative |
| Skin | 7 | cannabidiol acne, cannabidiol psoriasis |
| Cardiovascular | 5 | cannabidiol cardiovascular, CBD blood pressure |
| Metabolic | 5 | cannabidiol diabetes, cannabidiol obesity |
| Other Conditions | 9 | cannabidiol glaucoma, CBD sports medicine |
| Products | 8 | Epidiolex, Sativex, nabiximols, dronabinol |
| Research Types | 5 | cannabidiol systematic review, CBD meta-analysis |

### 1.4 Cross-Source Deduplication

Studies are deduplicated using a waterfall matching strategy:

```
1. DOI Match (exact)           → Highest confidence
2. PMID Match (exact)          → High confidence
3. PMC ID Match (exact)        → High confidence
4. Title Similarity (≥90%)     → Medium confidence (fuzzy match)
```

**Database columns for dedup:**
- `doi` - Digital Object Identifier
- `pmid` - PubMed ID
- `pmc_id` - PubMed Central ID
- `source_ids` - JSONB storing IDs from each source

### 1.2 Study Subject Classification

Every study is classified by subject type:

| Subject Type | Code | Description | Default Filter |
|--------------|------|-------------|----------------|
| Human | `human` | Human clinical trials, observational studies | ✅ Shown |
| Review | `review` | Systematic reviews, meta-analyses | ✅ Shown |
| Animal | `animal` | Preclinical animal studies (mice, rats, dogs, etc.) | ❌ Hidden by default |
| In Vitro | `in_vitro` | Cell culture, lab studies | ❌ Hidden by default |

**Database Column:** `study_subject TEXT DEFAULT 'human'`

**Auto-Detection Patterns:**
```
Animal studies detected by:
- Title contains: mice, mouse, murine, rat, rats, canine, dog, feline, cat, 
  animal model, preclinical, in vivo, rodent
- Abstract contains: "mice were", "rats were", "animal study", "animal model"
- Topic contains: veterinary

In Vitro detected by:
- Title contains: in vitro, cell line, cell culture, cultured cells, HEK293, HeLa

Reviews detected by:
- Title contains: systematic review, meta-analysis, literature review, 
  narrative review, scoping review
```

### 1.3 Dual Scoring System

Each study has two independent scores:

**Quality Score (0-100)** — Research rigor
- Study design (meta-analysis: 30, RCT: 25, cohort: 15)
- Methodology (double-blind, placebo, multicenter)
- Sample size
- Publication recency

**Relevance Score (0-100)** — CBD health topic relevance
- CBD/Cannabidiol in title: +25
- Therapeutic context: +20
- Health conditions mentioned: up to +20
- Policy/economic focus: -30
- Agricultural focus: -30

**Publication Gate:** Only studies with relevance ≥40 appear on public site.

### 1.4 Topic Taxonomy (37 Topics)

```
NEUROLOGICAL & MENTAL HEALTH (12)
├── anxiety
├── depression
├── ptsd
├── sleep
├── epilepsy
├── parkinsons
├── alzheimers
├── autism
├── adhd
├── schizophrenia
├── addiction
└── tourettes

PAIN & INFLAMMATION (7)
├── chronic_pain
├── neuropathic_pain
├── arthritis
├── fibromyalgia
├── ms (multiple sclerosis)
├── inflammation
└── migraines

GASTROINTESTINAL (3)
├── crohns
├── ibs
└── nausea

CANCER (2)
├── cancer
└── chemo_side_effects

SKIN (3)
├── acne
├── psoriasis
└── eczema

CARDIOVASCULAR (2)
├── heart
└── blood_pressure

METABOLIC (2)
├── diabetes
└── obesity

OTHER (6)
├── athletic
├── veterinary (→ feeds Pet content)
├── stress
├── glaucoma
├── covid
├── aging
└── womens
```

**Topic Detection:** Word boundary regex matching (`\b...\b`) on title + abstract. Each topic has specific keyword patterns defined in `research-scanner.ts`.

---

## 2. DATA QUALITY LAYERS

### Layer 1: Import Gate (Automatic)
- Relevance score ≥20 required
- Blacklist term rejection
- Duplicate detection (DOI, URL, title similarity)
- Future year rejection
- Language detection

### Layer 2: Topic Detection (Automatic)
- Word boundary regex matching
- Multiple topics per study allowed
- Primary topic = highest confidence match
- "general" fallback for unmatched studies

### Layer 3: Human Review (Queue)
- Admin reviews pending studies
- Can edit topics, approve/reject
- Bulk actions for efficiency

### Layer 4: Publication Gate (Automatic)
- Relevance ≥40 required for public display
- Must have: title, year, abstract OR summary
- Human studies shown by default
- Animal studies require toggle

---

## 3. RESEARCH → CONTENT PIPELINE

### 3.1 Critical Principle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ALL ARTICLE CONTENT PRODUCTION BEGINS AFTER               │
│   RESEARCH DATABASE IS FULLY IMPORTED AND CATEGORIZED       │
│                                                             │
│   Content is BUILT ON research, not created independently   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Import Completion Criteria

Before starting article production:

| Criterion | Target | Status |
|-----------|--------|--------|
| PubMed import complete | 500+ studies | ✅ Done |
| Quality scores calculated | 100% | ✅ Done |
| Relevance scores calculated | 100% | ✅ Done |
| Topics assigned | 100% | ✅ Done |
| Study subjects classified | 100% | ✅ Done |
| Duplicates removed | <1% duplicate rate | Pending |
| Meta content generated | 100% | In Progress (43%) |
| Non-English translated | 100% | In Progress |

### 3.3 Topic → Article Category Mapping

Research topics map to article categories:

| Research Topic(s) | Article Category | Article Count |
|-------------------|------------------|---------------|
| anxiety, stress, depression, ptsd, schizophrenia, addiction | Mental Health | 30 |
| sleep | Sleep | 15 |
| chronic_pain, neuropathic_pain, arthritis, fibromyalgia, migraines | Pain | 35 |
| inflammation, ms, crohns, ibs | Inflammation & Autoimmune | 25 |
| epilepsy, parkinsons, alzheimers, autism, adhd, tourettes | Neurological | 25 |
| acne, psoriasis, eczema | Skin | 22 |
| nausea + GI topics | Digestive | 18 |
| heart, blood_pressure | Cardiovascular | 12 |
| cancer, chemo_side_effects | Cancer Support | 10 |
| diabetes, obesity | Metabolic & Diabetes | 10 |
| womens | Women's Health | 18 |
| glaucoma | Eye & Ear | 8 |
| athletic | Sports & Recovery | 12 |
| veterinary | **PETS (Separate Section)** | 80 |
| aging | Aging & Longevity | 8 |

### 3.4 Article Production Workflow

```
FOR EACH CONDITION ARTICLE:

1. QUERY RESEARCH DATABASE
   └── SELECT * FROM kb_research_queue
       WHERE [topic] = ANY(relevant_topics)
       AND status = 'approved'
       AND relevance_score >= 40
       ORDER BY quality_score DESC

2. ANALYZE EVIDENCE
   ├── Count total studies
   ├── Count by study type (RCT, review, observational)
   ├── Identify key findings
   └── Note evidence gaps

3. GENERATE ARTICLE
   ├── Use research findings as foundation
   ├── Cite specific studies with links
   ├── Include evidence quality assessment
   └── Match content depth to evidence volume

4. LINK RESEARCH
   ├── Embed study citations in article
   ├── Add "Related Research" section
   └── Link to individual study pages
```

---

## 4. DO LATER: IMPLEMENTATION TASKS

### 4.1 Topic-to-Category Mapping Table

**When:** Before article production begins

```sql
CREATE TABLE kb_topic_category_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_topic TEXT NOT NULL,        -- e.g., 'anxiety'
  article_category TEXT NOT NULL,      -- e.g., 'mental-health'
  article_subcategory TEXT,            -- e.g., 'anxiety-disorders'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example mappings
INSERT INTO kb_topic_category_map (research_topic, article_category, article_subcategory) VALUES
('anxiety', 'mental-health', 'anxiety-disorders'),
('depression', 'mental-health', 'mood-disorders'),
('chronic_pain', 'pain', 'chronic-pain'),
('arthritis', 'pain', 'joint-conditions'),
('epilepsy', 'neurological', 'seizure-disorders'),
('veterinary', 'pets', NULL);
```

### 4.2 Condition Article Page — Research Integration

**When:** Building condition article pages

```typescript
// On article page, fetch related research:
async function getRelatedResearch(articleTopics: string[]) {
  const { data } = await supabase
    .from('kb_research_queue')
    .select('id, slug, title, display_title, year, quality_score, plain_summary')
    .eq('status', 'approved')
    .gte('relevance_score', 40)
    .overlaps('relevant_topics', articleTopics)
    .order('quality_score', { ascending: false })
    .limit(10);
  
  return data;
}

// Display in article:
// - "X studies support this article"
// - Top 3-5 studies with summaries
// - Link to full research page filtered by topic
```

### 4.3 CBD for Pets Section

**When:** After completing 80 pet articles

```
/cbd-for-pets/
├── index (overview + animal dosage calculator link)
├── dogs/
│   ├── cbd-for-dogs (pillar)
│   ├── cbd-for-dog-anxiety
│   ├── cbd-for-dog-arthritis
│   └── ... (25 articles)
├── cats/
│   └── ... (18 articles)
├── horses/
│   └── ... (12 articles)
├── research/
│   └── (filtered view: study_subject = 'animal' OR 'veterinary' in topics)
└── dosage-calculator (already exists)
```

**Research Integration:**
- Pull studies WHERE study_subject = 'animal' OR 'veterinary' = ANY(relevant_topics)
- Display species-specific studies on relevant pages
- Link to animal dosage calculator

---

## 5. API ENDPOINTS REFERENCE

### Research Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/research/recalculate-topics` | POST | Recalculate all topics using TOPIC_KEYWORDS |
| `/api/admin/research/recalculate-relevance` | POST | Recalculate relevance scores |
| `/api/admin/research/recalculate-scores` | POST | Recalculate quality scores |
| `/api/admin/research/detect-languages` | POST | Detect languages for all studies |
| `/api/admin/research/translate` | POST | Translate non-English study |
| `/api/admin/research/fix-future-years` | POST | Fix studies with year > current |

### Scanner (Updated January 16, 2026)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/scanner/start` | POST | Create new scan job |
| `/api/admin/scanner/process` | POST | Process scan job (called automatically) |
| `/api/admin/scanner/jobs/[id]/pause` | POST | Pause running job |
| `/api/admin/scanner/jobs/[id]/resume` | POST | Resume paused job |
| `/api/admin/scanner/jobs/[id]/cancel` | POST | Cancel job |
| `/api/admin/scanner/cleanup?dryRun=true` | GET | Preview/run data cleanup |

### Queue Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/research/queue` | GET | List pending studies |
| `/api/admin/research/queue/[id]` | PUT | Update study (approve/reject/edit) |
| `/api/admin/research/queue/bulk` | POST | Bulk approve/reject |

---

## 6. DATABASE SCHEMA ADDITIONS

### Added Columns (January 12-16, 2026)

```sql
-- Study subject classification
ALTER TABLE kb_research_queue
ADD COLUMN study_subject TEXT DEFAULT 'human';
-- Values: 'human', 'animal', 'in_vitro', 'review'

-- Dual scoring system
-- quality_score (methodology quality)
-- relevance_score (CBD health topic relevance)

-- Language handling
-- detected_language TEXT
-- original_title TEXT (stores pre-translation)
-- original_abstract TEXT (stores pre-translation)

-- Cross-source deduplication (January 16, 2026)
ALTER TABLE kb_research_queue
ADD COLUMN pmid TEXT,                    -- PubMed ID
ADD COLUMN pmc_id TEXT,                  -- PubMed Central ID
ADD COLUMN source_ids JSONB DEFAULT '{}'; -- IDs from each source

-- Scanner job controls (January 16, 2026)
ALTER TABLE kb_scan_jobs
ADD COLUMN current_source_offset INT DEFAULT 0,  -- Resume position within source
ADD COLUMN resume_state JSONB,                    -- Full resume state
ADD COLUMN paused_at TIMESTAMPTZ;                -- When job was paused
```

### Indexes

```sql
CREATE INDEX idx_research_study_subject ON kb_research_queue(study_subject);
CREATE INDEX idx_research_relevance ON kb_research_queue(relevance_score);
CREATE INDEX idx_research_quality ON kb_research_queue(quality_score);
CREATE INDEX idx_research_language ON kb_research_queue(detected_language);
CREATE INDEX idx_research_primary_topic ON kb_research_queue(primary_topic);
CREATE INDEX idx_research_pmid ON kb_research_queue(pmid);
CREATE INDEX idx_research_pmc_id ON kb_research_queue(pmc_id);
CREATE INDEX idx_research_doi ON kb_research_queue(doi);
```

---

## 7. QUICK START GUIDE

**For resuming work in a new session:**

### Check Current Status
```bash
# Check study counts
curl https://cbd-portal.vercel.app/api/admin/research/stats

# Check topic distribution (run in Supabase)
SELECT LOWER(unnest(relevant_topics)) as topic, COUNT(*) 
FROM kb_research_queue WHERE status = 'approved'
GROUP BY 1 ORDER BY 2 DESC;

# Check study subject distribution
SELECT study_subject, COUNT(*) FROM kb_research_queue 
WHERE status = 'approved' GROUP BY 1;
```

### Common Tasks

**Recalculate topics after code changes:**
```bash
curl -X POST https://cbd-portal.vercel.app/api/admin/research/recalculate-topics
```

**Check queue for pending reviews:**
```
https://cbd-portal.vercel.app/admin/research/queue
```

**Run scanner for new studies:**
```
https://cbd-portal.vercel.app/admin/research/scanner
```

---

## 8. DECISION LOG

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 12, 2026 | Separate quality vs relevance scores | High-quality studies on irrelevant topics were being included |
| Jan 12, 2026 | Add study_subject classification | Need to separate human/animal studies for filtering |
| Jan 12, 2026 | Default hide animal studies | Most users want human evidence; researchers can toggle |
| Jan 12, 2026 | 37 topics is sufficient | Matches article categories; more granularity has diminishing returns |
| Jan 12, 2026 | Veterinary studies feed Pets section | Different audience needs different presentation |
| Jan 12, 2026 | All content based on research | Evidence-first approach ensures credibility |
| Jan 16, 2026 | Expand to 7 data sources | PubMed alone misses significant research; diversify for completeness |
| Jan 16, 2026 | 106 search keywords | Condition-specific queries find more relevant studies than generic terms |
| Jan 16, 2026 | DOI → PMID → PMC ID → Title dedup | Multiple sources = many duplicates; need reliable deduplication |
| Jan 16, 2026 | Add pause/resume to scanner | Long scans need interruptibility; state preservation critical |
| Jan 16, 2026 | HTML cleanup functions | APIs return inconsistent formatting; clean on import |
| Jan 16, 2026 | Year validation via DOI | Some sources report incorrect years; DOI often contains correct year |

---

## 9. NEXT STEPS CHECKLIST

### Completed (January 16, 2026)
- [x] Expand from 1 source (PubMed) to 7 sources
- [x] Implement cross-source deduplication
- [x] Add pause/resume/cancel job controls
- [x] Create 106 condition-specific search keywords
- [x] Add HTML cleanup and year validation
- [x] Improve queue UI with scores, signals, abstracts

### Immediate (Before Article Production)
- [ ] Complete "All time" scan across all sources
- [ ] Complete meta content generation
- [ ] Translate non-English studies
- [ ] Build topic → category mapping

### Before Launch
- [ ] Integrate research into condition article pages
- [ ] Build /cbd-for-pets section
- [ ] Add "Evidence Score" to articles based on supporting research
- [ ] Create research citation component for articles

### Post-Launch
- [ ] Set up automated weekly scans
- [ ] Monitor topic distribution as new studies import
- [ ] Refine study_subject auto-detection based on errors

---

## 10. DATA CLEANUP FUNCTIONS

### HTML Entity Cleanup
Located in `src/lib/utils/text-cleanup.ts`:
- `cleanTitle()` - Strips HTML, decodes entities, normalizes whitespace
- `cleanAbstract()` - Same as title but preserves paragraph breaks
- `decodeHtmlEntities()` - Handles 60+ named entities and numeric codes
- `stripHtmlTags()` - Removes tags, converts `<br>` to newlines

### Year Validation
- `validateYear()` - Cross-references reported year with DOI patterns
- `extractYearFromDoi()` - Extracts year from DOI format (e.g., `10.xxxx/journal.2024.xxxxx`)
- Rejects future years, corrects obvious errors

---

*Document Version: 1.1*
*Created: January 12, 2026*
*Updated: January 16, 2026*
*For: CBD Portal Research Data Management*
