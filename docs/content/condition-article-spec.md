# CBD Portal - Condition Article Specification v1.1

**Purpose:** Complete specification for producing research-backed condition articles  
**Content Type:** "CBD and [Condition]" articles  
**Author:** Robin Roy Krigslund-Hansen  
**Last Updated:** January 18, 2026

---

## EXECUTIVE SUMMARY

Condition articles are the cornerstone of CBD Portal's content strategy. Each article answers the question: **"Does CBD help with [condition]?"**

These articles are built ON TOP OF research, not independently. Claude Code must analyze ALL approved studies for a condition before writing a single word.

**Core Principles:**
- Answer the question immediately (first 100 words)
- Let evidence depth determine article length
- Include personal author perspective (E-E-A-T)
- Be honest when evidence is weak — or negative
- Every claim needs a citation
- Make stats quotable for journalists

---

## TABLE OF CONTENTS

1. [Author Profile](#1-author-profile)
2. [Article Structure](#2-article-structure)
3. [Evidence-Tiered Length](#3-evidence-tiered-length)
4. [Evidence Strength Rating](#4-evidence-strength-rating)
5. [Research Analysis Process](#5-research-analysis-process)
6. [Citation Strategy](#6-citation-strategy)
7. [Quotable Stats for Media](#7-quotable-stats-for-media)
8. [Writing Voice & Style](#8-writing-voice--style)
9. [Handling Contradictory & Negative Research](#9-handling-contradictory--negative-research)
10. [SEO Requirements](#10-seo-requirements)
11. [Internal Linking & Anchor Text](#11-internal-linking--anchor-text)
12. [FAQ Guidelines](#12-faq-guidelines)
13. [Visual & Image Requirements](#13-visual--image-requirements)
14. [Medical Review Requirements](#14-medical-review-requirements)
15. [Content Freshness & Updates](#15-content-freshness--updates)
16. [Sub-Condition Strategy](#16-sub-condition-strategy)
17. [Zero-Study Conditions](#17-zero-study-conditions)
18. [Quality Checklist](#18-quality-checklist)
19. [Examples](#19-examples)

---

## 1. AUTHOR PROFILE

### 1.1 Primary Author

All condition articles are authored by:

| Field | Value |
|-------|-------|
| **Name** | Robin Roy Krigslund-Hansen |
| **Slug** | robin-krigslund-hansen |
| **Title** | Founder & Editor |
| **Experience** | 12+ years in CBD industry |
| **Background** | Founded Formula Swiss (2014), built CBD Portal research database |
| **Credentials** | Reviewed 700+ CBD research studies |
| **Location** | Switzerland |

### 1.2 Author Byline (Top of Article)

```
By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed [X] studies for this article | Last updated: [Date]
```

### 1.3 Author Box (Bottom of Article)

```
┌────────────────────────────────────────────────────────────────┐
│ [Photo]  Robin Roy Krigslund-Hansen                            │
│                                                                │
│          Robin has worked in the CBD industry for over 12      │
│          years, including founding Formula Swiss. He has       │
│          personally reviewed over 700 CBD studies and built    │
│          CBD Portal to make research accessible to everyone.   │
│                                                                │
│          [LinkedIn] [All Articles by Robin]                    │
└────────────────────────────────────────────────────────────────┘
```

### 1.4 E-E-A-T Signals

| Signal | How It's Demonstrated |
|--------|----------------------|
| **Experience** | "In my 12 years working with CBD products..." |
| **Expertise** | Deep knowledge of research, products, regulations |
| **Authority** | Founder credentials, study count, CBD Portal itself |
| **Trust** | No products sold on Portal, transparent methodology, honest about limitations |

---

## 2. ARTICLE STRUCTURE

### 2.1 Complete Template

```
┌────────────────────────────────────────────────────────────────┐
│ TITLE                                                          │
│ CBD and [Condition]: What the Research Shows [Year]            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ AUTHOR BYLINE                                                  │
│ By Robin Roy Krigslund-Hansen | 12+ years in CBD industry      │
│ Reviewed [X] studies for this article | Last updated: [Date]   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ THE SHORT ANSWER (50-100 words)                                │
│ ─────────────────────────────────                              │
│ Answer the main question IMMEDIATELY. No preamble.             │
│ State: what research suggests + evidence strength + key caveat │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ RESEARCH SNAPSHOT (Quick Facts Box)                            │
│ ───────────────────────────────────                            │
│ [See Section 2.2 for format]                                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ KEY NUMBERS (Quotable Stats Box)                               │
│ ────────────────────────────────                               │
│ [See Section 7 for format]                                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ WHAT THE RESEARCH SHOWS                                        │
│ ────────────────────────                                       │
│                                                                │
│ ## The Best Evidence (Clinical Trials)                         │
│ Most important findings from RCTs and controlled trials.       │
│ Include: what they tested, sample size, results.               │
│ Add author interpretation: "What I find significant..."        │
│                                                                │
│ ## What Reviews Conclude                                       │
│ Summary of systematic reviews and meta-analyses.               │
│ Author perspective on scientific consensus.                    │
│                                                                │
│ ## Supporting Evidence                                         │
│ Brief mention of observational studies, animal research.       │
│ Context on what this evidence can and can't tell us.           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ STUDIES WORTH KNOWING (2-4 highlighted)                        │
│ ───────────────────────────────────────                        │
│ [See Section 2.3 for format]                                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ HOW CBD MIGHT HELP WITH [CONDITION]                            │
│ ────────────────────────────────────                           │
│ Mechanism of action in plain language.                         │
│ Use analogies: "Think of it like..."                           │
│ Link glossary terms (endocannabinoid system, CB1, CB2, etc.)   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ WHAT DOSAGES HAVE BEEN STUDIED                                 │
│ ──────────────────────────────                                 │
│ NOT medical advice — what research actually used.              │
│ Range of doses, patterns observed.                             │
│ "Most clinical trials used between X and Y mg..."              │
│ Link to dosage calculator.                                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ MY TAKE                                                        │
│ ───────                                                        │
│ Author's personal perspective based on experience.             │
│ [See Section 8.5 for guidance]                                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ FREQUENTLY ASKED QUESTIONS (4-6)                               │
│ ─────────────────────────────────                              │
│ [See Section 12 for guidance]                                  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ REFERENCES                                                     │
│ ──────────                                                     │
│ [See Section 6 for citation format]                            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ CITE THIS ARTICLE (for journalists/researchers)                │
│ ───────────────────────────────────────────────                │
│ [See Section 7.3 for format]                                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ AUTHOR BOX                                                     │
│ [See Section 1.3]                                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ DISCLAIMER                                                     │
│ "This article is for informational purposes only. It is not    │
│ medical advice. Consult a healthcare professional before       │
│ using CBD, especially if you have a medical condition or       │
│ take medications."                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Research Snapshot Format

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 RESEARCH SNAPSHOT                                           │
│                                                                 │
│  Studies reviewed:           47                                 │
│  Human clinical trials:      12                                 │
│  Systematic reviews:         3                                  │
│  Total participants studied: 847                                │
│  Strongest evidence for:     Social anxiety disorder            │
│  Typical dosages studied:    150-600mg/day                      │
│  Evidence strength:          ●●●●○ Strong                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Studies Worth Knowing Format

Select 2-4 studies based on:
1. Highest quality score among human studies
2. Largest sample size
3. Most recent high-quality study
4. Any contradictory findings worth noting

Format for each:

```markdown
### [Study Title Short Version] ([Year])

[What they did in plain language — 1-2 sentences]

**Key finding:** [Main result with specific numbers]

**Sample:** [X] participants | **Type:** [RCT/Review/etc.]

**Why it matters:** [Author perspective — why this study is significant]

[View study summary →](/research/study/[slug])
```

### 2.4 Section Requirements by Evidence Level

| Section | Strong | Moderate | Limited | Insufficient |
|---------|--------|----------|---------|--------------|
| The Short Answer | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| Research Snapshot | ✅ Full | ✅ Full | ✅ Full | ✅ Minimal |
| Key Numbers | ✅ 4-5 stats | ✅ 3-4 stats | ✅ 2-3 stats | ❌ Omit |
| What Research Shows | ✅ All 3 subsections | ✅ All 3 subsections | ✅ 1-2 subsections | ✅ Brief |
| Studies Worth Knowing | 3-4 studies | 2-3 studies | 1-2 studies | 0-1 studies |
| How CBD Might Help | ✅ Detailed | ✅ Standard | ✅ Brief | ✅ Theoretical |
| Dosages Studied | ✅ Detailed | ✅ Standard | ✅ Brief | ❌ Omit if no data |
| My Take | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| FAQ | 5-6 questions | 4-5 questions | 4 questions | 3-4 questions |
| Cite This Article | ✅ Include | ✅ Include | ✅ Include | ❌ Omit |

---

## 3. EVIDENCE-TIERED LENGTH

Article length is an OUTPUT of evidence, not a target.

### 3.1 Length Tiers

| Evidence Level | Study Profile | Target Length | Rationale |
|----------------|---------------|---------------|-----------|
| **Strong** | 20+ studies, 3+ RCTs or meta-analyses | 1,800-2,400 words | Comprehensive coverage warranted |
| **Moderate** | 10-20 studies, 1-2 RCTs | 1,300-1,800 words | Solid research deserves solid coverage |
| **Limited** | 5-10 studies, no RCTs, mostly animal | 900-1,300 words | Cover what exists, acknowledge gaps |
| **Insufficient** | <5 studies, only in-vitro/animal | 600-900 words | Be honest, don't pad thin evidence |

### 3.2 How to Determine Evidence Level

Claude Code calculates this AFTER analyzing all studies:

```
STRONG EVIDENCE requires ALL of:
□ 20+ total approved studies for condition
□ At least ONE of:
  - 3+ randomized controlled trials (RCTs) with consistent positive results
  - 1+ systematic review or meta-analysis with positive conclusion
□ Total human participants across studies > 200

MODERATE EVIDENCE requires ALL of:
□ 10-20 total approved studies
□ At least ONE of:
  - 1-2 RCTs with positive results
  - 3+ controlled trials (non-randomized)
□ At least 5 human studies
□ Some inconsistency in findings acceptable

LIMITED EVIDENCE:
□ 5-10 total approved studies
□ Mostly pilot studies, case series, or animal research
□ Small sample sizes (<50 per study)
□ No RCTs available
□ Some human data exists

INSUFFICIENT EVIDENCE:
□ <5 total approved studies
□ Only in-vitro (cell studies) or animal research
□ No human clinical data
□ Theoretical/mechanistic only
```

### 3.3 What NOT to Do

❌ **Don't pad thin evidence** — If only 3 animal studies exist, don't write 2,000 words  
❌ **Don't hit word counts** — Write what the evidence supports  
❌ **Don't repeat information** — Say it once, well  
❌ **Don't add filler sections** — If there's no dosage data, skip that section

---

## 4. EVIDENCE STRENGTH RATING

### 4.1 Visual Indicator

Display in Research Snapshot box:

| Rating | Display | Criteria |
|--------|---------|----------|
| Strong | ●●●●● or ●●●●○ | Multiple RCTs, meta-analyses, consistent results |
| Moderate | ●●●○○ | Some RCTs or good controlled trials |
| Limited | ●●○○○ | Mostly observational or animal studies |
| Insufficient | ●○○○○ | Only in-vitro or very early research |

### 4.2 How to Communicate Each Level

**Strong Evidence:**
> "The research on CBD and [condition] is robust. We have [X] clinical trials involving over [Y] participants, and the findings are largely consistent."

**Moderate Evidence:**
> "There's promising research on CBD for [condition], though we need more large-scale trials. The existing studies suggest [finding], but sample sizes are still relatively small."

**Limited Evidence:**
> "Research on CBD for [condition] is still in early stages. Most studies are preclinical (animal or cell studies), though [X] small human studies show [finding]."

**Insufficient Evidence:**
> "There's very little research specifically on CBD and [condition]. The few studies that exist are [description]. I can't draw conclusions from such limited data."

---

## 5. RESEARCH ANALYSIS PROCESS

### 5.1 Mandatory Pre-Writing Analysis

Before writing ANY condition article, Claude Code MUST:

**Step 1: Query ALL approved studies**

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

**Step 2: Categorize the evidence**

Create counts for:
- Total studies
- By study type: RCT, systematic review, meta-analysis, cohort, case study, animal, in-vitro
- By species: human vs. animal
- By quality: high (score 70+), medium (50-69), lower (<50)
- By finding direction: positive, negative, neutral/mixed

**Step 3: Calculate aggregate statistics**

- Total participants across all human studies (sum of sample_size)
- Percentage of studies showing positive results
- Dosage range used across studies
- Year range of research

**Step 4: Identify key studies to highlight**

Selection criteria for "Studies Worth Knowing":
1. Highest quality score among human studies
2. Largest sample size
3. Most recent (if high quality)
4. Most cited/influential (if known)
5. Any contradictory findings worth noting

**Step 5: Note conflicts and gaps**

- Do studies contradict each other?
- What questions remain unanswered?
- What populations were not studied?
- What dosages/formulations need more research?

**Step 6: Determine evidence level and article length**

Apply criteria from Section 3.2.

### 5.2 Analysis Output Format

Before writing, Claude Code should have:

```
CONDITION: [name]
EVIDENCE LEVEL: [Strong/Moderate/Limited/Insufficient]
TARGET LENGTH: [X-Y words]

STUDY SUMMARY:
- Total studies: X
- Human studies: X (RCTs: X, Reviews: X, Other: X)
- Animal studies: X
- In-vitro: X
- Total human participants: X

KEY STATS:
- % showing positive results: X%
- Dosage range: X-Y mg
- Most common effective dose: X mg
- Largest study sample size: X

KEY FINDINGS:
1. [Most important finding with study citation]
2. [Second finding]
3. [Third finding]

STUDIES TO HIGHLIGHT:
1. [Title, Year] - Quality: X - Why: [reason]
2. [Title, Year] - Quality: X - Why: [reason]

GAPS/LIMITATIONS:
- [Gap 1]
- [Gap 2]

CONTRADICTIONS: [Any conflicting findings]
```

---

## 6. CITATION STRATEGY

We use a **hybrid approach**: internal links in body text, full references with external verification at bottom.

### 6.1 Inline Citations (in body text)

**Always link to YOUR summary pages:**

```markdown
A [2019 clinical trial](/research/study/zuardi-2019-anxiety) found that 
300mg CBD reduced anxiety scores by 40% compared to placebo.
```

**For multiple citations:**

```markdown
CBD doses of 300-600mg showed anxiolytic effects in multiple 
trials[\[1\]](/research/study/zuardi-2019-anxiety)[\[2\]](/research/study/blessing-2015-anxiety), 
though lower doses showed inconsistent results[\[3\]](/research/study/sparse-2020-anxiety).
```

**Why internal links:**
- Keeps users on site (better engagement)
- Distributes page authority across your research section
- Your study pages can rank independently
- Full source always available one click away

### 6.2 References Section (at bottom)

Provide YOUR summary link + PubMed + DOI for full transparency:

```markdown
## References

I reviewed [X] studies for this article. Key sources:

1. **Zuardi AW, et al.** (2019). Inverted U-Shaped Dose-Response Curve of 
   the Anxiolytic Effect of Cannabidiol. *Journal of Psychopharmacology*, 
   33(9), 1088-1095.  
   [Summary](/research/study/zuardi-2019-anxiety) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30950793/) • 
   DOI: 10.1177/0269881119828083

2. **Blessing EM, et al.** (2015). Cannabidiol as a Potential Treatment 
   for Anxiety Disorders. *Neurotherapeutics*, 12(4), 825-836.  
   [Summary](/research/study/blessing-2015-anxiety) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/26341731/) • 
   DOI: 10.1007/s13311-015-0387-1

3. **Shannon S, et al.** (2019). Cannabidiol in Anxiety and Sleep: A Large 
   Case Series. *Perm J*, 23, 18-041.  
   [Summary](/research/study/shannon-2019-anxiety-sleep) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30624194/) • 
   DOI: 10.7812/TPP/18-041

[View all [X] studies on CBD and [condition] →](/research?topic=[condition])
```

### 6.3 Citation Rules

| Rule | Implementation |
|------|----------------|
| Every factual claim needs citation | Link to study summary |
| First mention of a study | Full descriptive link |
| Subsequent mentions | Can use short reference |
| Statistics/numbers | Always cite source |
| Mechanism explanations | Link to relevant studies or glossary |

---

## 7. QUOTABLE STATS FOR MEDIA

Make articles journalist-friendly with quotable, specific numbers.

### 7.1 Key Numbers Box

Place after Research Snapshot:

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 KEY NUMBERS                                                 │
│                                                                 │
│  40%       Reduction in anxiety scores with 300mg CBD           │
│            vs placebo (Zuardi et al., 2019)                     │
│                                                                 │
│  79%       Of human studies reviewed showed positive            │
│            effects for anxiety symptoms                         │
│                                                                 │
│  300mg     Most commonly effective dose across                  │
│            clinical trials                                      │
│                                                                 │
│  847       Total participants across all human                  │
│            studies reviewed                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Stats to Calculate and Display

| Stat | Calculation | Example |
|------|-------------|---------|
| % positive studies | (positive human studies / total human studies) × 100 | "79% showed positive effects" |
| Total participants | Sum of sample_size across human studies | "847 total participants" |
| Largest study | Max sample_size | "Largest trial: 150 participants" |
| Year range | Min year - max year | "Research spans 2011-2024" |
| Most common dose | Mode of effective doses | "300mg most commonly effective" |
| Effect size | Average % improvement if extractable | "Average 35% symptom reduction" |

### 7.3 Cite This Article Box

At end of article, before author box:

```markdown
## Cite This Research

**For journalists and researchers:**

CBD Portal. (2026). "CBD and Anxiety: What the Research Shows." 
Retrieved from https://cbd-portal.com/knowledge/cbd-and-anxiety

**Quick stats:**
- Studies reviewed: 47
- Human trials: 12  
- Total participants: 847
- Evidence strength: Strong

Last updated: January 18, 2026  
Author: Robin Roy Krigslund-Hansen

[Download Press Summary (PDF)] [Download Study Data (CSV)]
```

### 7.4 Tweetable Summary

Include at end of "What Research Shows" section:

```markdown
> **The research in one sentence:** 12 clinical trials involving 847 
> participants suggest CBD can reduce anxiety symptoms by 30-50% at 
> doses of 300-600mg.
```

---

## 8. WRITING VOICE & STYLE

### 8.1 Personal, Authoritative Voice

This is NOT generic health content. It's written by an expert with 12 years of experience.

**Use first person:**
- "In my experience..."
- "I've reviewed X studies..."
- "What I find compelling about this research..."
- "I'd want to see more data before..."

**Be confident but honest:**
- "The research is clear on X"
- "The evidence is less certain on Y"
- "I'm genuinely excited about this area"
- "I'm skeptical of these findings because..."

**Share opinions:**
- "I think this study is particularly important because..."
- "This doesn't surprise me given..."
- "If a friend asked me about this, I'd say..."

### 8.2 What to Avoid

| ❌ Don't Write | ✅ Do Write |
|----------------|-------------|
| "It is worth noting that..." | "One important point:" |
| "Many people wonder if..." | "Does CBD help? Based on my review..." |
| "Studies have shown that CBD may potentially..." | "A 2019 trial of 57 patients found..." |
| "In today's world, many are turning to..." | [Skip entirely — no fluff] |
| "More research is needed" (generic) | "We need larger trials — the biggest study had only 50 participants" |
| "Results may vary" | [Don't state the obvious] |

### 8.3 Specificity Over Vagueness

| ❌ Vague | ✅ Specific |
|----------|-------------|
| "Studies show CBD helps anxiety" | "A 2019 Brazilian trial gave 300mg CBD to 57 people with social anxiety — their anxiety scores dropped 40% compared to placebo" |
| "Some research suggests benefits" | "12 of the 15 human studies I reviewed showed positive effects" |
| "CBD may interact with medications" | "CBD inhibits CYP3A4 and CYP2D6 enzymes, which can affect blood levels of certain medications including some blood thinners and antidepressants" |

### 8.4 Readability Standards

| Metric | Target |
|--------|--------|
| Reading level | Grade 8-10 (15-year-old can understand) |
| Sentence length | 15-20 words average |
| Paragraph length | 2-3 sentences |
| Medical terms | Always explain or link to glossary |

### 8.5 The "My Take" Section

This is the most important E-E-A-T section. It should feel genuine.

**Structure:**

```markdown
## My Take

Having reviewed [X] studies on CBD and [condition] — and worked in the 
CBD industry for over a decade — here's my honest assessment:

[1-2 sentences on overall impression of the evidence]

[1-2 sentences on what's most promising or concerning]

[1-2 sentences on what I'd tell someone considering CBD for this]

[1 sentence on what future research I'm watching for]
```

**Tone by evidence level:**

**Strong Evidence:**
> "This is one of the better-researched areas for CBD. The clinical trials are consistent, and I've seen the effects firsthand with customers over the years. If you're considering CBD for anxiety, the research genuinely supports trying it — though I'd still recommend starting with a low dose and working with your doctor if you're on other medications."

**Moderate Evidence:**
> "The research is promising but not conclusive. I've seen enough positive trials to think CBD is worth considering for [condition], but I want to see larger studies before being fully confident. If you try it, keep your expectations realistic and track your results."

**Limited Evidence:**
> "I wish I could be more enthusiastic, but the research just isn't there yet. The animal studies are interesting, and there's biological plausibility, but we really need human trials before drawing conclusions. I'm watching this space — there are two clinical trials currently recruiting that should give us better data in 2027."

**Insufficient Evidence:**
> "I have to be direct: there's almost no research on CBD for [condition]. I can't recommend it based on evidence because the evidence doesn't exist yet. Some people try it based on CBD's general effects on [related system], but you'd be experimenting, not following science."

---

## 9. HANDLING CONTRADICTORY & NEGATIVE RESEARCH

### 9.1 When Studies Contradict Each Other

If studies show conflicting results:

1. **Acknowledge it directly:** "The research is mixed on this point..."

2. **Explain possible reasons:** Different doses, populations, study designs, CBD formulations

3. **Weight by quality:** "The higher-quality trials suggest X, while smaller studies found Y"

4. **Be honest in My Take:** "I'm genuinely uncertain here because..."

**Example:**
> "Two RCTs found CBD reduced chronic pain, but a 2022 trial found no significant difference from placebo. The negative study used a lower dose (50mg vs 300mg), which may explain the discrepancy. I lean toward the higher-dose studies being more relevant, but this needs more research."

### 9.2 When Evidence is Negative or Neutral

If research shows CBD doesn't help:

1. **Say so clearly:** "The evidence doesn't support CBD for this use"

2. **Still be useful:** Explain what was tried, why it might not work

3. **My Take should be honest:** "I wouldn't recommend CBD for this based on current research"

4. **Suggest alternatives if appropriate:** Link to conditions where evidence is stronger

**Example:**
> "Three controlled trials tested CBD for [condition], and none found significant benefits compared to placebo. The largest study (n=120) saw no difference in symptoms at doses up to 600mg. Based on this, I can't recommend CBD for [condition] — the research simply doesn't support it."

**We don't write articles to promote CBD — we write to inform. Negative findings are valuable.**

### 9.3 Presenting Balanced View

Even for conditions with positive evidence, note limitations:

```markdown
**What the research supports:**
- [Positive finding 1]
- [Positive finding 2]

**What remains uncertain:**
- [Limitation or gap 1]
- [Limitation or gap 2]

**What the research doesn't support:**
- [Any negative findings]
```

---

## 10. SEO REQUIREMENTS

### 10.1 Title Tag

**Format:** `CBD and [Condition]: What Research Shows [Year] | CBD Portal`  
**Length:** 50-60 characters  
**Example:** `CBD and Anxiety: What Research Shows 2026 | CBD Portal`

### 10.2 Meta Description

**Format:** Answer + evidence summary + hook  
**Length:** 150-155 characters  
**Example:** `Does CBD help anxiety? I reviewed 47 studies. Clinical trials show promising results for social anxiety at 300-600mg doses. Here's what works.`

### 10.3 URL Structure

**Format:** `/knowledge/cbd-and-[condition]`  
**Example:** `/knowledge/cbd-and-anxiety`

### 10.4 Header Structure

```
H1: CBD and [Condition]: What the Research Shows
  H2: The Best Evidence (Clinical Trials)
  H2: What Reviews Conclude
  H2: Supporting Evidence
  H2: Studies Worth Knowing
  H2: How CBD Might Help with [Condition]
  H2: What Dosages Have Been Studied
  H2: My Take
  H2: Frequently Asked Questions
    H3: [Question 1]?
    H3: [Question 2]?
  H2: References
```

### 10.5 Schema Markup

Required for all condition articles:

- `Article` schema with author, datePublished, dateModified
- `Person` schema for author (with credentials)
- `FAQPage` schema for FAQ section
- `MedicalWebPage` schema (signals health content)
- `BreadcrumbList` schema

---

## 11. INTERNAL LINKING & ANCHOR TEXT

### 11.1 Required Internal Links

Every condition article must link to:

| Link Type | Minimum | Example |
|-----------|---------|---------|
| Glossary terms | 5-10 | CBD, endocannabinoid system, CB1 receptor |
| Related conditions | 3-5 | Anxiety → depression, sleep, stress |
| Research database | All cited studies | Link each study to its summary page |
| Dosage calculator | 1 | When discussing dosages |
| Product types | 1-2 | Relevant CBD product guides |

### 11.2 Anchor Text Guidelines

**Glossary links:**
- Use the term itself: "...interacts with the [endocannabinoid system](/glossary/endocannabinoid-system)..."
- First mention only
- Don't link common words like "CBD" every time

**Related condition links:**
- Natural phrases: "If you also experience [sleep issues](/knowledge/cbd-and-sleep), CBD may help there too"
- Not: "Click here to read about sleep"

**Study links:**
- Descriptive: "A [2019 clinical trial](/research/study/zuardi-2019) found..."
- Or: "View the [Zuardi et al. study](/research/study/zuardi-2019)"

**Tool links:**
- Action-oriented: "Use our [CBD dosage calculator](/tools/dosage-calculator) to find a starting point"

**Avoid:**
- "Click here"
- "Read more"
- Over-optimized: "best CBD oil for anxiety treatment"

---

## 12. FAQ GUIDELINES

### 12.1 Purpose

FAQs address **adjacent concerns** not fully covered in the main content. They should NOT repeat the article.

### 12.2 Standard Questions for Condition Articles

Include 4-6 from this list, adapted to the condition:

| Question | Why Include | Answer Approach |
|----------|-------------|-----------------|
| Can CBD cure [condition]? | Sets honest expectations | No. May help manage symptoms, not a cure. |
| How much CBD should I take for [condition]? | High search volume | What studies used. Link calculator. Not advice. |
| How long does CBD take to work for [condition]? | Practical concern | Onset times from research if available. |
| Can I take CBD with my [condition] medications? | Safety concern | CYP450 interaction warning. Consult doctor. |
| What type of CBD is best for [condition]? | Product guidance | Full-spectrum vs isolate if research differentiates. |
| Is CBD legal for [condition]? | Regulatory clarity | Yes with caveats. Link to legal page. |
| Will CBD get me high? | Common misconception | No, CBD is non-intoxicating. Explain THC difference. |

### 12.3 FAQ Format

```markdown
## Frequently Asked Questions

### Can CBD cure [condition]?

No. CBD is not a cure for [condition]. Research suggests it may help 
manage symptoms, but it should complement — not replace — conventional 
treatment. Always consult your doctor.

### How much CBD should I take for [condition]?

Clinical studies have used doses ranging from [X] to [Y] mg. Most trials 
showing positive results used [most common dose]. Start low (10-25mg) and 
increase gradually. Use our [dosage calculator](/tools/dosage-calculator) 
to find a starting point.
```

### 12.4 What NOT to Include in FAQs

❌ Questions already answered in the main article  
❌ Generic questions unrelated to the condition  
❌ Questions that require medical advice to answer  
❌ More than 6 questions (keeps section focused)

---

## 13. VISUAL & IMAGE REQUIREMENTS

### 13.1 Required Visuals

| Visual | Purpose | Placement |
|--------|---------|-----------|
| **Research Snapshot graphic** | Shareable summary | After byline |
| **Key Numbers graphic** | Journalist-friendly stats | After Research Snapshot |
| **Mechanism diagram** | Explain how CBD works | In "How CBD Might Help" section |

### 13.2 Mechanism Diagram

Simple illustration showing: CBD → ECS → [relevant pathway] → [effect on condition]

Example for anxiety:
```
CBD → 5-HT1A receptors → Serotonin modulation → Reduced anxiety
CBD → Amygdala activity → Decreased fear response → Calming effect
```

### 13.3 Image Specifications

| Spec | Requirement |
|------|-------------|
| Featured image | 1200×630px (social sharing optimized) |
| Inline diagrams | 800px wide max |
| Alt text | Descriptive, includes keyword naturally |
| File naming | `cbd-[condition]-[description].png` |
| Format | PNG for diagrams, WebP for photos |

### 13.4 What NOT to Use

❌ Stock photos of hemp plants (generic, low-trust)  
❌ Photos of CBD products (looks promotional)  
❌ Images with text that duplicates article content  
❌ Low-resolution or watermarked images

---

## 14. MEDICAL REVIEW REQUIREMENTS

### 14.1 Requires Medical Reviewer

The following article types need review by a medical professional before publication:

- Any serious medical diagnosis (cancer, epilepsy, diabetes, heart conditions, MS)
- Any mention of specific drug interactions
- Any mention of contraindications
- Articles about CBD during pregnancy/breastfeeding
- Articles about CBD for children

**Display:** "Medically reviewed by [Name], [Credentials]"

### 14.2 Author Review Sufficient

These can be published with author review only:

- General wellness topics (stress, sleep quality, recovery)
- Product/format explanations
- Legal/regulatory content
- Comparison articles
- Mild conditions (minor muscle soreness, general relaxation)

**Display:** "By Robin Roy Krigslund-Hansen"

### 14.3 Medical Reviewer Credentials

Acceptable credentials for medical review:
- MD (Medical Doctor)
- DO (Doctor of Osteopathic Medicine)
- PharmD (Doctor of Pharmacy)
- PhD in relevant field (pharmacology, neuroscience)
- RN with specialized certification

---

## 15. CONTENT FRESHNESS & UPDATES

### 15.1 Update Triggers

**Automatic review flag (check these conditions):**

| Trigger | Action |
|---------|--------|
| 6 months since last update | Flag for review |
| New RCT published for condition | Flag for update |
| New systematic review/meta-analysis | Flag for update |
| 5+ new studies added to condition | Flag for update |
| Major news/regulatory change | Immediate review |

### 15.2 Update Scope

| Scope | When | What Changes |
|-------|------|--------------|
| **Minor** | New study adds to existing picture | Update counts, add to references |
| **Moderate** | New significant study | Revise "What Research Shows," possibly update evidence level |
| **Major** | New evidence changes conclusions | Rewrite article, update My Take |

### 15.3 Display Freshness

Every article shows:
- **"Last updated: [Date]"** — when content was last changed
- **"Last reviewed: [Date]"** — when reviewed but no changes needed (if different)

Consider adding for returning users:
- "X new studies added since [date]"

---

## 16. SUB-CONDITION STRATEGY

### 16.1 Condition Hierarchy

```
PILLAR ARTICLE: CBD and Anxiety (broad)
├── CLUSTER: CBD and Social Anxiety (if 5+ dedicated studies)
├── CLUSTER: CBD and Generalized Anxiety (if 5+ dedicated studies)
└── CLUSTER: CBD and Panic Attacks (if 5+ dedicated studies)
```

### 16.2 When to Create Sub-Condition Articles

**Create separate article if:**
- 5+ studies specifically address the sub-condition
- Sub-condition has distinct search volume
- Research findings differ from parent condition
- Different dosages or approaches studied

**Keep as section in pillar if:**
- <5 studies for sub-condition
- Findings are same as parent condition
- Low search volume for sub-condition

### 16.3 Linking Rules

- Sub-condition articles link UP to pillar: "For general information, see [CBD and Anxiety](/knowledge/cbd-and-anxiety)"
- Pillar articles link DOWN to clusters: "For social anxiety specifically, see [CBD and Social Anxiety](/knowledge/cbd-and-social-anxiety)"
- Don't duplicate content — reference and link

---

## 17. ZERO-STUDY CONDITIONS

### 17.1 Policy

If a condition has 0 approved studies in the database:

**DO NOT write a standard condition article.**

### 17.2 Instead:

1. Add condition to "Research Gaps" tracking list
2. Set alert for when studies appear in scanner
3. If highly searched, consider "What We Don't Know" article (see below)

### 17.3 "What We Don't Know" Article Format

For conditions with high search volume but no research:

```markdown
# CBD and [Condition]: What We Don't Know Yet

[Acknowledge the gap honestly]

There is currently no published research specifically studying CBD for 
[condition]. This means we cannot make evidence-based statements about 
whether CBD helps.

## Why People Are Interested

[Explain the biological plausibility if any]

## What Research Would Need to Show

[Describe what kind of studies would be needed]

## Related Conditions With Research

[Link to related conditions where evidence exists]

## My Take

I can't recommend CBD for [condition] because there's no research to 
support it. If you're considering trying it anyway, [practical guidance].
I'll update this article when research becomes available.
```

---

## 18. QUALITY CHECKLIST

### Pre-Publication Checklist

**Research Foundation:**
- [ ] ALL approved studies for condition were queried and analyzed
- [ ] Evidence level correctly determined (Strong/Moderate/Limited/Insufficient)
- [ ] Article length matches evidence depth
- [ ] All factual claims have citations (linked to study summaries)
- [ ] Study details are accurate (year, sample size, findings)
- [ ] Contradictory findings are acknowledged if present

**Structure:**
- [ ] Short Answer appears in first 100 words
- [ ] Research Snapshot box is complete with all fields
- [ ] Key Numbers box included (if Moderate+ evidence)
- [ ] Studies Worth Knowing section highlights best evidence
- [ ] "My Take" section has genuine author perspective
- [ ] FAQ has 4-6 relevant questions (not repeating main content)
- [ ] References section lists all cited studies with Summary + PubMed + DOI
- [ ] Cite This Article box included (if Moderate+ evidence)

**Writing Quality:**
- [ ] Reading level is Grade 8-10
- [ ] First person voice used appropriately
- [ ] No hedging language ("It is worth noting...")
- [ ] No filler paragraphs
- [ ] Medical terms explained or linked to glossary
- [ ] Specific numbers used instead of vague quantities

**Citations (Strategy C - Hybrid):**
- [ ] Inline claims link to internal study summary pages
- [ ] References section includes Summary link + PubMed + DOI
- [ ] "View all studies" link at end of references

**SEO:**
- [ ] Title tag is 50-60 characters with keyword
- [ ] Meta description is 150-155 characters
- [ ] Primary keyword in H1 and first 100 words
- [ ] URL follows `/knowledge/cbd-and-[condition]` format
- [ ] Schema markup specified (Article, Person, FAQPage, MedicalWebPage)

**Internal Linking:**
- [ ] 5-10 glossary terms linked (first mention only)
- [ ] 3-5 related conditions linked
- [ ] All cited studies link to internal summary pages
- [ ] Dosage calculator linked
- [ ] 1-2 relevant product guides linked
- [ ] Anchor text is natural, not over-optimized

**Visuals:**
- [ ] Research Snapshot graphic ready
- [ ] Key Numbers graphic ready (if applicable)
- [ ] Mechanism diagram included
- [ ] All images have alt text

**Compliance:**
- [ ] No medical claims ("CBD treats/cures...")
- [ ] No dosage recommendations (only "studies used...")
- [ ] Medical review completed (if required per Section 14)
- [ ] Disclaimer present at end
- [ ] European focus (not US-centric)

**Freshness:**
- [ ] "Last updated" date set
- [ ] Review date scheduled (6 months)

---

## 19. EXAMPLES

### 19.1 Strong Evidence Example: CBD and Anxiety

**Research Snapshot:**
```
Studies reviewed:           47
Human clinical trials:      12
Systematic reviews:         3
Total participants studied: 847
Strongest evidence for:     Social anxiety disorder
Typical dosages studied:    300-600mg/day
Evidence strength:          ●●●●○ Strong
```

**Key Numbers:**
```
40%    Reduction in anxiety scores (300mg vs placebo)
79%    Of human studies showed positive effects
300mg  Most commonly effective dose
847    Total participants across studies
```

**Short Answer:**
> Does CBD help with anxiety? Based on the 47 studies I've reviewed, the evidence is genuinely promising. Multiple clinical trials show CBD can reduce anxiety symptoms, with the strongest evidence for social anxiety disorder. A standout [2019 trial](/research/study/zuardi-2019) found 300mg CBD reduced anxiety by 40% compared to placebo. The research is solid enough that I consider anxiety one of the better-supported uses for CBD.

### 19.2 Limited Evidence Example: CBD and Migraines

**Research Snapshot:**
```
Studies reviewed:           8
Human clinical trials:      1
Systematic reviews:         0
Total participants studied: 34
Strongest evidence for:     General headache (not migraine-specific)
Typical dosages studied:    200mg/day (limited data)
Evidence strength:          ●●○○○ Limited
```

**Short Answer:**
> Does CBD help with migraines? The honest answer: we don't have enough research to say. I found only 8 studies that mention CBD and migraines, and only one was a human trial — with just 34 participants. There's biological plausibility (CBD affects pain pathways), but I can't point to solid clinical evidence yet. If you're considering CBD for migraines, know that you're ahead of the research.

### 19.3 References Section Example

```markdown
## References

I reviewed 47 studies for this article. Key sources:

1. **Zuardi AW, et al.** (2019). Inverted U-Shaped Dose-Response Curve of 
   the Anxiolytic Effect of Cannabidiol. *Journal of Psychopharmacology*, 
   33(9), 1088-1095.  
   [Summary](/research/study/zuardi-2019-anxiety) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30950793/) • 
   DOI: 10.1177/0269881119828083

2. **Blessing EM, et al.** (2015). Cannabidiol as a Potential Treatment 
   for Anxiety Disorders. *Neurotherapeutics*, 12(4), 825-836.  
   [Summary](/research/study/blessing-2015-anxiety) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/26341731/) • 
   DOI: 10.1007/s13311-015-0387-1

3. **Shannon S, et al.** (2019). Cannabidiol in Anxiety and Sleep: A Large 
   Case Series. *Perm J*, 23, 18-041.  
   [Summary](/research/study/shannon-2019-anxiety-sleep) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30624194/) • 
   DOI: 10.7812/TPP/18-041

[View all 47 studies on CBD and anxiety →](/research?topic=anxiety)
```

---

## APPENDIX A: CONDITION PRIORITY MATRIX

Prioritize article production based on:

```
Priority Score = (Search Volume × Evidence Strength) / Competition

HIGH PRIORITY (write first):
- High search volume + moderate/strong evidence
- Examples: anxiety, sleep, pain, arthritis, inflammation

MEDIUM PRIORITY:
- Moderate search volume + any evidence level
- High search volume + limited evidence
- Examples: depression, PTSD, epilepsy, fibromyalgia

LOWER PRIORITY:
- Low search volume regardless of evidence
- Highly competitive keywords with limited differentiation opportunity
- Examples: rare conditions, very niche applications
```

---

## APPENDIX B: STUDY SUMMARY PAGE REQUIREMENTS

For the hybrid citation strategy to work, each study summary page needs:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Study Title] — [Authors] ([Year])                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PLAIN LANGUAGE SUMMARY                                          │
│ [What they did, what they found, why it matters — 100 words]    │
│                                                                 │
│ KEY FINDINGS                                                    │
│ • [Finding 1 with numbers]                                      │
│ • [Finding 2 with numbers]                                      │
│ • [Finding 3 with numbers]                                      │
│                                                                 │
│ STUDY DETAILS                                                   │
│ Type: [RCT/Review/Observational/etc.]                          │
│ Participants: [N] [description]                                 │
│ Duration: [X weeks/months]                                      │
│ Quality Score: [X]/100                                          │
│                                                                 │
│ ORIGINAL SOURCE                                                 │
│ [Journal Name] ([Year])                                         │
│ [View on PubMed] [Full text via DOI]                           │
│                                                                 │
│ RELATED STUDIES                                                 │
│ [Links to related studies in database]                          │
│                                                                 │
│ ARTICLES CITING THIS STUDY                                      │
│ [Links back to condition articles that cite this]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Specification Version: 1.1*  
*Created: January 18, 2026*  
*For: CBD Portal Condition Article Production*
