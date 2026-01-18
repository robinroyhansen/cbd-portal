# CBD Portal - Research Data Strategy Addendum

**Addendum to:** CBD Portal Master Plan v6  
**Created:** January 12, 2026  
**Purpose:** Detailed technical specifications for research database management and content integration

---

## EXECUTIVE SUMMARY

This addendum defines the data quality architecture, topic taxonomy, and research-to-content pipeline that underpins CBD Portal's evidence-based approach. All article content production begins AFTER the research database is fully imported, cleaned, and categorized.

**Key Principle:** Research studies are the foundation. Content is built ON TOP OF research, not independently.

---

## 1. RESEARCH DATABASE ARCHITECTURE

### 1.1 Current State (as of January 12, 2026)

| Metric | Value |
|--------|-------|
| Total Approved Studies | 771 |
| Topics Covered | 37 |
| Quality Score Range | 0-100 |
| Relevance Score Range | 0-100 |
| Studies with Meta Content | ~43% |
| Non-English Studies | ~13% |

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

### Scanner

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/trigger-scan` | POST | Run PubMed scan for new studies |
| `/api/admin/scanner/status` | GET | Check scanner status |

### Queue Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/research/queue` | GET | List pending studies |
| `/api/admin/research/queue/[id]` | PUT | Update study (approve/reject/edit) |
| `/api/admin/research/queue/bulk` | POST | Bulk approve/reject |

---

## 6. DATABASE SCHEMA ADDITIONS

### Added Columns (January 12, 2026)

```sql
-- Study subject classification
ALTER TABLE kb_research_queue
ADD COLUMN study_subject TEXT DEFAULT 'human';
-- Values: 'human', 'animal', 'in_vitro', 'review'

-- Dual scoring system
-- quality_score (renamed from relevance_score - methodology quality)
-- relevance_score (NEW - CBD health topic relevance)

-- Language handling
-- detected_language TEXT
-- original_title TEXT (stores pre-translation)
-- original_abstract TEXT (stores pre-translation)
```

### Indexes

```sql
CREATE INDEX idx_research_study_subject ON kb_research_queue(study_subject);
CREATE INDEX idx_research_relevance ON kb_research_queue(relevance_score);
CREATE INDEX idx_research_quality ON kb_research_queue(quality_score);
CREATE INDEX idx_research_language ON kb_research_queue(detected_language);
CREATE INDEX idx_research_primary_topic ON kb_research_queue(primary_topic);
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

---

## 9. NEXT STEPS CHECKLIST

### Immediate (Before Article Production)
- [ ] Complete meta content generation (57% remaining)
- [ ] Translate non-English studies
- [ ] Run deduplication check
- [ ] Verify study_subject classification accuracy
- [ ] Build topic → category mapping

### Before Launch
- [ ] Integrate research into condition article pages
- [ ] Build /cbd-for-pets section
- [ ] Add "Evidence Score" to articles based on supporting research
- [ ] Create research citation component for articles

### Post-Launch
- [ ] Set up automated weekly PubMed scans
- [ ] Monitor topic distribution as new studies import
- [ ] Refine study_subject auto-detection based on errors

---

*Document Version: 1.0*  
*Created: January 12, 2026*  
*For: CBD Portal Research Data Management*
