# Condition Article Generator - Claude Code Instruction v1.1

**Purpose:** Generate research-backed "CBD and [Condition]" articles  
**Author:** Robin Roy Krigslund-Hansen  
**Reference:** See `condition-article-spec-v1.1.md` for full rationale

---

## CRITICAL: ANALYZE BEFORE WRITING

You MUST analyze ALL approved research for the condition BEFORE writing anything.

### Step 1: Query ALL Studies

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

### Step 2: Categorize & Calculate

Count:
- Total studies
- Study types: RCT, systematic review, meta-analysis, cohort, case study, animal, in-vitro
- Species: human vs. animal
- Quality tiers: high (70+), medium (50-69), lower (<50)
- Finding direction: positive, negative, neutral/mixed

Calculate:
- Total participants (sum of sample_size for human studies)
- % of human studies showing positive results
- Dosage range used
- Most common effective dose
- Largest study sample size

### Step 3: Determine Evidence Level

| Level | Criteria |
|-------|----------|
| **Strong** | 20+ studies AND (3+ RCTs OR 1+ meta-analysis) AND 200+ total participants |
| **Moderate** | 10-20 studies AND (1-2 RCTs OR 3+ controlled trials) AND 5+ human studies |
| **Limited** | 5-10 studies, mostly observational/animal, no RCTs, small samples |
| **Insufficient** | <5 studies, only in-vitro/animal, no human data |

### Step 4: Set Target Length

| Evidence Level | Word Count |
|----------------|------------|
| Strong | 1,800-2,400 |
| Moderate | 1,300-1,800 |
| Limited | 900-1,300 |
| Insufficient | 600-900 |

### Step 5: Check for Zero Studies

If 0 approved studies exist: **DO NOT write standard article.** See Zero-Study Policy below.

---

## ARTICLE STRUCTURE

```
# CBD and [Condition]: What the Research Shows [Year]

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed [X] studies for this article | Last updated: [Date]

---

## [THE SHORT ANSWER - 50-100 words]
Answer immediately. No preamble. State evidence strength.

---

## Research Snapshot
[Quick facts box - see format below]

---

## Key Numbers
[Quotable stats - see format below]
[OMIT if Insufficient evidence]

---

## What the Research Shows

### The Best Evidence (Clinical Trials)
[RCTs and controlled trials - highest quality first]
[Include: what tested, sample size, results]
[Author interpretation: "What I find significant..."]

### What Reviews Conclude
[Systematic reviews and meta-analyses]
[Scientific consensus]

### Supporting Evidence
[Observational studies, animal research]
[Context on limitations]

---

## Studies Worth Knowing
[2-4 highlighted studies with author perspective]

---

## How CBD Might Help with [Condition]
[Mechanism in plain language]
[Link glossary terms]

---

## What Dosages Have Been Studied
[NOT advice - what research used]
[Link to dosage calculator]
[OMIT if no dosage data]

---

## My Take
[Personal author perspective - see guidance below]

---

## Frequently Asked Questions
[4-6 questions - see guidance below]

---

## References
[All cited studies - see citation format below]

---

## Cite This Article
[For journalists/researchers - OMIT if Insufficient evidence]

---

[Author box]
[Disclaimer]
```

---

## RESEARCH SNAPSHOT FORMAT

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 RESEARCH SNAPSHOT                                           │
│                                                                 │
│  Studies reviewed:           [X]                                │
│  Human clinical trials:      [X]                                │
│  Systematic reviews:         [X]                                │
│  Total participants studied: [X]                                │
│  Strongest evidence for:     [specific finding]                 │
│  Typical dosages studied:    [range]                            │
│  Evidence strength:          [●●●○○ Level]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Visual indicators:
- Strong: ●●●●● or ●●●●○
- Moderate: ●●●○○
- Limited: ●●○○○
- Insufficient: ●○○○○

---

## KEY NUMBERS FORMAT (Quotable Stats)

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 KEY NUMBERS                                                 │
│                                                                 │
│  [X]%      [Metric - e.g., "Reduction in symptoms"]            │
│            ([Study citation])                                   │
│                                                                 │
│  [X]%      [Metric - e.g., "Of studies showed positive"]       │
│            [description]                                        │
│                                                                 │
│  [X]mg     [Metric - e.g., "Most common effective dose"]       │
│            [description]                                        │
│                                                                 │
│  [X]       [Metric - e.g., "Total participants studied"]       │
│            [description]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Include 3-5 stats. Omit section entirely if Insufficient evidence.

---

## STUDIES WORTH KNOWING FORMAT

Select 2-4 studies based on:
1. Highest quality score among human studies
2. Largest sample size
3. Most recent high-quality study
4. Any contradictory findings worth noting

Format:

```markdown
### [Study Title Short] ([Year])

[What they did - 1-2 sentences plain language]

**Key finding:** [Main result with specific numbers]

**Sample:** [X] participants | **Type:** [RCT/Review/etc.]

**Why it matters:** [Author perspective - why significant]

[View study summary →](/research/study/[slug])
```

---

## CITATION STRATEGY (Hybrid - Strategy C)

### Inline Citations (body text)

Always link to YOUR internal study summary pages:

```markdown
A [2019 clinical trial](/research/study/zuardi-2019-anxiety) found that 
300mg CBD reduced anxiety scores by 40% compared to placebo.
```

### References Section (bottom)

Include: Summary link + PubMed + DOI

```markdown
## References

I reviewed [X] studies for this article. Key sources:

1. **Zuardi AW, et al.** (2019). Inverted U-Shaped Dose-Response Curve of 
   the Anxiolytic Effect of Cannabidiol. *Journal of Psychopharmacology*, 
   33(9), 1088-1095.  
   [Summary](/research/study/zuardi-2019-anxiety) • 
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30950793/) • 
   DOI: 10.1177/0269881119828083

2. **[Next study...]**

[View all [X] studies on CBD and [condition] →](/research?topic=[condition])
```

---

## CITE THIS ARTICLE FORMAT

```markdown
## Cite This Research

**For journalists and researchers:**

CBD Portal. ([Year]). "CBD and [Condition]: What the Research Shows." 
Retrieved from https://cbd-portal.com/knowledge/cbd-and-[condition]

**Quick stats:**
- Studies reviewed: [X]
- Human trials: [X]
- Total participants: [X]
- Evidence strength: [Level]

Last updated: [Date]
Author: Robin Roy Krigslund-Hansen

[Download Press Summary (PDF)] [Download Study Data (CSV)]
```

---

## MY TAKE SECTION

Write as Robin with 12 years experience. Must feel genuine.

**Structure:**
```markdown
## My Take

Having reviewed [X] studies on CBD and [condition] — and worked in the 
CBD industry for over a decade — here's my honest assessment:

[Overall impression of evidence - 1-2 sentences]

[What's most promising or concerning - 1-2 sentences]

[What I'd tell someone considering CBD for this - 1-2 sentences]

[What future research I'm watching - 1 sentence]
```

**Tone by evidence level:**

| Level | Tone |
|-------|------|
| **Strong** | Confident, genuinely enthusiastic, practical advice |
| **Moderate** | Cautiously optimistic, acknowledge limitations, worth trying |
| **Limited** | Honest about gaps, explain what we're waiting for, temper expectations |
| **Insufficient** | Direct about lack of evidence, explain plausibility if any, suggest waiting |

---

## HANDLING CONTRADICTORY RESEARCH

If studies disagree:

1. **Acknowledge directly:** "The research is mixed..."
2. **Explain why:** Different doses, populations, study designs
3. **Weight by quality:** "Higher-quality trials suggest X, smaller studies found Y"
4. **Be honest in My Take:** "I'm genuinely uncertain here because..."

---

## HANDLING NEGATIVE RESULTS

If evidence shows CBD doesn't help:

1. **Say so clearly:** "The evidence doesn't support CBD for this use"
2. **Explain what was tried:** Doses, populations, study designs
3. **My Take is honest:** "I wouldn't recommend CBD for this"
4. **Link alternatives:** Conditions where evidence is stronger

**We write to inform, not promote. Negative findings are valuable.**

---

## FAQ GUIDELINES

Include 4-6 questions from this list (adapt to condition):

| Question | Answer Approach |
|----------|-----------------|
| Can CBD cure [condition]? | No. May help manage symptoms, not a cure. |
| How much CBD for [condition]? | What studies used. Link calculator. Not advice. |
| How long to work? | Onset times from research if available. |
| CBD with [condition] medications? | CYP450 interaction warning. Consult doctor. |
| What CBD type is best? | Full-spectrum vs isolate if research differentiates. |
| Is it legal? | Yes with caveats. Link to legal page. |

**Do NOT:**
- Repeat what's in main article
- Include more than 6 questions
- Give medical advice

---

## INTERNAL LINKING REQUIREMENTS

| Link Type | Minimum | Anchor Text Style |
|-----------|---------|-------------------|
| Glossary terms | 5-10 | Use the term: "[endocannabinoid system]" |
| Related conditions | 3-5 | Natural: "If you also experience [sleep issues]..." |
| Study citations | All | Descriptive: "A [2019 clinical trial] found..." |
| Dosage calculator | 1 | Action: "Use our [dosage calculator]..." |
| Product guides | 1-2 | Contextual: "...often use [CBD oil] for this" |

**Avoid:** "Click here", "Read more", over-optimized anchors

---

## WRITING RULES

### Voice
- First person: "I've reviewed...", "In my experience...", "I find..."
- Confident but honest
- Share opinions: "I think this study is important because..."
- Specific: numbers, study details, concrete findings

### Avoid
- "It is worth noting..."
- "Many people wonder..."
- "Studies have shown that CBD may potentially..."
- "Results may vary"
- "More research is needed" (generic — be specific instead)
- Filler paragraphs
- Repeating information

### Readability
- Grade 8-10 reading level
- 15-20 words per sentence average
- 2-3 sentences per paragraph
- Explain or link all medical terms

---

## SEO REQUIREMENTS

**Title:** `CBD and [Condition]: What Research Shows [Year] | CBD Portal`  
**Meta:** 150-155 chars. Answer + evidence + hook.  
**URL:** `/knowledge/cbd-and-[condition]`

**Schema:** Article, Person, FAQPage, MedicalWebPage, BreadcrumbList

---

## ZERO-STUDY POLICY

If condition has 0 approved studies:

**DO NOT write standard condition article.**

Options:
1. Skip entirely and flag for monitoring
2. Write "What We Don't Know" article if high search volume:

```markdown
# CBD and [Condition]: What We Don't Know Yet

There is currently no published research specifically studying CBD for 
[condition]. This means we cannot make evidence-based statements.

## Why People Are Interested
[Biological plausibility if any]

## What Research Would Need to Show
[Types of studies needed]

## Related Conditions With Research
[Link to related conditions]

## My Take
I can't recommend CBD for [condition] because there's no research. 
I'll update this when research becomes available.
```

---

## MEDICAL REVIEW REQUIREMENTS

**Requires medical reviewer:**
- Serious conditions (cancer, epilepsy, diabetes, heart, MS)
- Drug interactions mentioned
- Pregnancy/breastfeeding
- Children

**Author review sufficient:**
- Wellness topics (stress, sleep quality, recovery)
- Product explanations
- Legal content

---

## AUTHOR INFO

```
Name: Robin Roy Krigslund-Hansen
Title: Founder & Editor
Experience: 12+ years in CBD industry
Background: Founded Formula Swiss (2014)
Credentials: Reviewed 700+ CBD research studies
```

**Byline:**
> By Robin Roy Krigslund-Hansen | 12+ years in CBD industry  
> Reviewed [X] studies for this article | Last updated: [Date]

---

## DISCLAIMER

End every article with:

> This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.

---

## PRE-PUBLISH CHECKLIST

**Research:**
- [ ] Queried ALL approved studies
- [ ] Calculated stats (total, %, participants, doses)
- [ ] Evidence level matches study profile
- [ ] Length matches evidence depth

**Structure:**
- [ ] Short Answer in first 100 words
- [ ] Research Snapshot complete
- [ ] Key Numbers included (if Moderate+)
- [ ] Studies Worth Knowing highlights best evidence
- [ ] My Take is genuine, not generic
- [ ] 4-6 FAQ questions (not repeating article)
- [ ] Cite This Article included (if Moderate+)

**Citations (Strategy C):**
- [ ] Inline claims → internal study summaries
- [ ] References → Summary + PubMed + DOI
- [ ] "View all studies" link at end

**Linking:**
- [ ] 5-10 glossary terms (first mention)
- [ ] 3-5 related conditions
- [ ] All studies → internal summaries
- [ ] Dosage calculator linked
- [ ] Anchor text is natural

**Quality:**
- [ ] Grade 8-10 readability
- [ ] No hedging language
- [ ] No medical claims
- [ ] Contradictions acknowledged
- [ ] Disclaimer present

---

*Instruction Version: 1.1*
