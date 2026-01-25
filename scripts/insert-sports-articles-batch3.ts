import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const articles = [
  {
    title: "CBD and Cold Plunge: What the Research Shows 2026",
    slug: "cbd-and-cold-plunge",
    condition_slug: "cold-plunge",
    excerpt: "Can CBD enhance cold plunge recovery benefits? We analyze research on inflammation, recovery, and the endocannabinoid system relevant to cold water immersion.",
    meta_title: "CBD and Cold Plunge: What Research Shows 2026 | CBD Portal",
    meta_description: "Exploring CBD with cold plunge therapy - inflammation, recovery, and the endocannabinoid system. Analysis of research relevant to cold water immersion.",
    content: `# CBD and Cold Plunge: What the Research Shows 2026

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed studies on inflammation, recovery, and the endocannabinoid system | Last updated: January 2026

---

## The Short Answer

No research has studied CBD combined with cold plunge therapy. However, both target inflammation and recovery through different mechanisms. I'll explain what we know about each and whether combining them makes scientific sense.

---

## Research Snapshot

| Metric | Value |
|--------|-------|
| **CBD + cold plunge studies** | 0 |
| **CBD inflammation studies** | 20+ |
| **Cold water immersion studies** | Many (separate field) |
| **Strongest evidence for** | Separate anti-inflammatory effects |
| **Evidence strength** | ●○○○○ Insufficient (no combined research) |

---

## Why People Are Combining CBD and Cold Plunge

Cold plunge (cold water immersion) has become popular for recovery. CBD is also used for recovery. People naturally ask: do they work together?

**Cold plunge mechanisms:**
- Vasoconstriction reduces acute inflammation
- Activates the sympathetic nervous system
- May reduce muscle soreness

**CBD's proposed mechanisms:**
- Interacts with the [endocannabinoid system](/glossary/endocannabinoid-system)
- May modulate inflammatory responses
- Works through [CB2 receptors](/glossary/cb2-receptor) in immune cells

---

## What Related Research Shows

### CBD and Inflammation

The [2016 transdermal CBD study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) demonstrated CBD's anti-inflammatory effects in an arthritis model. This shows CBD can influence inflammation through a different pathway than cold exposure.

The [2023 DOMS study](/research/study/a-randomized-double-blind-placebo-controlled-repeated-dose-p-2023-2defcb) tested CBD for exercise-induced muscle soreness — relevant to the recovery context where cold plunge is used.

### Exercise and the Endocannabinoid System

[Sparling's 2003 research](/research/study/exercise-activates-the-endocannabinoid-sparling-2003) showed exercise activates the endocannabinoid system. This suggests the body's natural cannabinoid system is already involved in recovery processes.

### Inflammation Pathways

The [2020 review](/research/study/2020-cannabidiol-for-pain-mlost-2020) examined CBD's pharmacology, showing it works through multiple receptor systems involved in inflammation and pain — different from cold's purely physical mechanism.

---

## The Scientific Question: Complementary or Competing?

**Theoretical case for combining:**
- Cold plunge works through physical/vascular mechanisms
- CBD works through receptor-mediated pathways
- Different mechanisms could potentially be additive

**Theoretical concerns:**
- Both target inflammation — unclear if this is beneficial for adaptation
- Some inflammation is necessary for training adaptation
- No research has tested whether combined use is helpful or counterproductive

**My assessment:** The mechanisms are different enough that they probably don't interfere with each other, but whether combining them provides additional benefit is completely unknown.

---

## Studies Worth Knowing

### CBD for Muscle Soreness (2023)

The [DOMS pilot study](/research/study/a-randomized-double-blind-placebo-controlled-repeated-dose-p-2023-2defcb) tested CBD for exercise-induced soreness.

**Why it matters:** This addresses the same recovery context where cold plunge is used, though without testing the combination.

### Endocannabinoid System and Exercise (2003)

[Sparling's research](/research/study/exercise-activates-the-endocannabinoid-sparling-2003) on exercise activating the endocannabinoid system.

**Why it matters:** Shows the endocannabinoid system is naturally involved in exercise and recovery, providing context for why CBD might support these processes.

---

## How People Are Using CBD with Cold Plunge

Common approaches (not evidence-based):

1. **CBD before cold plunge** — Some take oral CBD 30-60 minutes before
2. **CBD after cold plunge** — Others use it as part of post-recovery routine
3. **Topical CBD after** — Applying CBD to muscles after cold exposure

There's no research supporting any timing or protocol.

---

## My Take

Having looked at the research on both CBD and cold water immersion, here's my honest assessment:

We don't know if combining CBD and cold plunge provides any additional benefit. The mechanisms are different enough that they probably don't interfere with each other, but whether they're additive is pure speculation.

What I can say: CBD has some evidence for anti-inflammatory effects. Cold plunge has some evidence for recovery benefits. Whether using both together is better than either alone — we simply don't know.

If someone wants to use both, I don't see a clear reason not to based on mechanism. But I also wouldn't expect synergistic benefits beyond what each provides separately.

What I'm watching: Any research that actually tests CBD combined with recovery modalities like cold water immersion.

---

## Frequently Asked Questions

### Should I take CBD before or after cold plunge?

No research addresses timing. If using oral CBD, taking it after the cold plunge as part of a recovery routine is a reasonable approach, but this is speculative.

### Can CBD help with the discomfort of cold plunge?

There's no research on this. CBD might theoretically help with general discomfort, but the acute shock of cold water involves different pathways than chronic pain.

### Will CBD reduce cold plunge benefits?

Unknown. Some argue that reducing inflammation might reduce adaptation benefits from any recovery intervention. No research addresses whether CBD affects cold plunge's benefits.

### What's more effective: CBD or cold plunge for recovery?

We don't have comparative research. They work through different mechanisms and may be useful for different aspects of recovery.

### Can I apply topical CBD in cold water?

Topical CBD should be applied to dry skin for absorption. Using it after drying off from cold plunge makes more sense practically.

---

## References

Key sources from inflammation and recovery research:

1. **Hammell DC, et al.** (2016). Transdermal cannabidiol reduces inflammation and pain.
   [Summary](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/26517407/)

2. **CBD/CBG DOMS Study** (2023). Pilot study on delayed onset muscle soreness.
   [Summary](/research/study/a-randomized-double-blind-placebo-controlled-repeated-dose-p-2023-2defcb) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/37947792/)

3. **Sparling PB, et al.** (2003). Exercise activates the endocannabinoid system.
   [Summary](/research/study/exercise-activates-the-endocannabinoid-sparling-2003) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/14625449/)

4. **Mlost J, et al.** (2020). Cannabidiol for Pain Treatment: Focus on Pharmacology.
   [Summary](/research/study/2020-cannabidiol-for-pain-mlost-2020) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/33396869/)

[View all studies on CBD and inflammation →](/research?topic=inflammation)

---

## About the Author

**Robin Roy Krigslund-Hansen** is the founder of CBD Portal with over 12 years of experience in the CBD industry. He has reviewed hundreds of research studies on cannabinoids and their therapeutic potential.

---

*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    title: "CBD and Hot Tub: What the Research Shows 2026",
    slug: "cbd-and-hot-tub",
    condition_slug: "hot-tub",
    excerpt: "Can CBD enhance hot tub relaxation and recovery? We analyze research on inflammation, muscle relaxation, and the endocannabinoid system relevant to heat therapy.",
    meta_title: "CBD and Hot Tub: What Research Shows 2026 | CBD Portal",
    meta_description: "Exploring CBD with hot tub therapy - relaxation, inflammation, and the endocannabinoid system. Analysis of research relevant to heat therapy and recovery.",
    content: `# CBD and Hot Tub: What the Research Shows 2026

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed studies on inflammation, relaxation, and the endocannabinoid system | Last updated: January 2026

---

## The Short Answer

No research has studied CBD combined with hot tub use. However, both are used for relaxation and muscle recovery through different mechanisms. I'll explain what we know about each and whether combining them makes scientific sense.

---

## Research Snapshot

| Metric | Value |
|--------|-------|
| **CBD + hot tub studies** | 0 |
| **CBD relaxation/pain studies** | 15+ |
| **Heat therapy studies** | Many (separate field) |
| **Strongest evidence for** | Separate relaxation/anti-inflammatory effects |
| **Evidence strength** | ●○○○○ Insufficient (no combined research) |

---

## Why People Combine CBD and Hot Tub

Hot tubs are used for relaxation and muscle recovery. CBD is also popular for relaxation and comfort. People naturally wonder if combining them enhances benefits.

**Hot tub mechanisms:**
- Heat increases blood flow to muscles
- Relaxes muscle tension
- Buoyancy reduces joint stress
- May promote relaxation and sleep

**CBD's proposed mechanisms:**
- Interacts with the [endocannabinoid system](/glossary/endocannabinoid-system)
- May support relaxation through various receptors
- Potential anti-inflammatory effects

---

## What Related Research Shows

### CBD and Relaxation

While CBD is commonly used for relaxation, the research is mixed. Some studies on [anxiety](/conditions/anxiety) suggest potential calming effects, but this varies significantly between individuals and doses.

### CBD and Muscle Comfort

The [2016 transdermal CBD study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) showed anti-inflammatory effects with topical application. However, applying topical CBD before hot tub use wouldn't be practical.

The [2023 DOMS study](/research/study/a-randomized-double-blind-placebo-controlled-repeated-dose-p-2023-2defcb) tested oral CBD for muscle soreness — relevant to the recovery context where hot tubs are used.

### Sleep and Recovery

The [CANNFIB trial](/research/study/cbd-sleep-amris-2024) measured sleep quality alongside pain in fibromyalgia patients. Both hot tubs and CBD are sometimes used to support sleep, though through different mechanisms.

---

## The Scientific Question: Do They Work Together?

**Theoretical case for combining:**
- Hot tubs work through physical heat and buoyancy
- CBD works through receptor-mediated pathways
- Different mechanisms might provide complementary benefits

**Practical considerations:**
- Oral CBD before hot tub allows time for absorption
- Topical CBD should be applied to dry skin after
- Both may independently support relaxation

**My assessment:** The mechanisms don't interfere with each other. Whether combining provides additional benefit beyond each alone is unknown.

---

## Studies Worth Knowing

### Fibromyalgia and Sleep (2024)

The [CANNFIB trial](/research/study/cbd-sleep-amris-2024) tested CBD in patients with chronic pain and sleep issues.

**Why it matters:** Hot tubs and CBD are both used by people with chronic pain. This study addresses pain and sleep — both relevant to hot tub users.

### TRPV1 Receptor Research

The [capsaicin receptor study](/research/study/the-capsaicin-receptor-a-caterina-1997) identified TRPV1, a heat-sensitive receptor that CBD also interacts with.

**Why it matters:** CBD and heat both interact with TRPV1 receptors, though in different ways. This is one area where their mechanisms potentially overlap.

---

## Common Ways People Use CBD with Hot Tub

Approaches used (not evidence-based):

1. **Oral CBD before hot tub** — Taking CBD 30-60 minutes before allows absorption
2. **CBD after hot tub** — Using topical CBD on muscles after drying off
3. **CBD for sleep after evening hot tub** — Using CBD to enhance sleep benefits

No protocols have been researched.

---

## My Take

Having looked at the research on both CBD and heat therapy, here's my honest assessment:

There's no evidence that combining CBD with hot tub use provides additional benefits. They work through different mechanisms that don't obviously conflict, so using both is probably fine.

What makes sense to me: If you're already using a hot tub for relaxation and muscle comfort, adding oral CBD before or topical CBD after is unlikely to hurt. But I wouldn't expect dramatic synergistic effects.

The most reasonable application might be using oral CBD in the evening, then a hot tub, with the goal of supporting sleep. Both have some association with relaxation, though evidence for CBD's sleep effects is mixed.

I'm watching for any research that actually tests CBD combined with heat therapy.

---

## Frequently Asked Questions

### Should I take CBD before or after hot tub?

No research addresses timing. Oral CBD 30-60 minutes before allows absorption. Topical CBD should be applied after drying off.

### Can I put CBD oil in my hot tub water?

This isn't how CBD works. Topical CBD needs direct skin contact for potential absorption. CBD in water would be diluted and wouldn't effectively contact your skin. It would also affect your hot tub chemistry.

### Will CBD make me more relaxed in the hot tub?

CBD's relaxation effects vary between individuals. Some people report feeling more relaxed, others notice little effect. The hot tub itself provides relaxation benefits.

### Can CBD help with hot tub-related skin irritation?

Some research suggests CBD may have skin-soothing properties, but this hasn't been specifically studied for hot tub-related skin issues. Proper water chemistry is more important for skin health.

### Is it safe to combine CBD with hot tub use?

Both CBD and hot tubs can lower blood pressure. If you take blood pressure medication, consult your doctor. Stay hydrated and don't stay in hot water too long.

---

## References

Key sources from relaxation and recovery research:

1. **CANNFIB Trial** (2024). CBD for fibromyalgia pain and sleep.
   [Summary](/research/study/cbd-sleep-amris-2024)

2. **Hammell DC, et al.** (2016). Transdermal cannabidiol reduces inflammation and pain.
   [Summary](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/26517407/)

3. **CBD/CBG DOMS Study** (2023). Pilot study on delayed onset muscle soreness.
   [Summary](/research/study/a-randomized-double-blind-placebo-controlled-repeated-dose-p-2023-2defcb) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/37947792/)

4. **Caterina MJ, et al.** (1997). The capsaicin receptor: a heat-activated ion channel.
   [Summary](/research/study/the-capsaicin-receptor-a-caterina-1997) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/9349813/)

[View all studies on CBD and pain →](/research?topic=pain)

---

## About the Author

**Robin Roy Krigslund-Hansen** is the founder of CBD Portal with over 12 years of experience in the CBD industry. He has reviewed hundreds of research studies on cannabinoids and their therapeutic potential.

---

*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    title: "CBD and Joint Health: What the Research Shows 2026",
    slug: "cbd-and-joint-health",
    condition_slug: "joint-health",
    excerpt: "Can CBD support joint health and comfort? We analyze research on arthritis, inflammation, and the endocannabinoid system's role in joint function.",
    meta_title: "CBD and Joint Health: What Research Shows 2026 | CBD Portal",
    meta_description: "Comprehensive analysis of CBD for joint health - arthritis research, inflammation studies, and the endocannabinoid system's role in joint function.",
    content: `# CBD and Joint Health: What the Research Shows 2026

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed 25+ studies on arthritis, inflammation, and joint health | Last updated: January 2026

---

## The Short Answer

CBD research for joint health is genuinely promising. Multiple studies have examined CBD for arthritis and joint inflammation, including several recent clinical trials. While we need more research, the existing evidence suggests CBD may support joint comfort through anti-inflammatory mechanisms.

---

## Research Snapshot

| Metric | Value |
|--------|-------|
| **Studies reviewed** | 25+ |
| **Human clinical trials** | 6+ |
| **Animal studies** | 10+ |
| **Strongest evidence for** | Osteoarthritis, inflammatory joint conditions |
| **Typical dosages studied** | Topical application; oral doses varied |
| **Evidence strength** | ●●●○○ Moderate |

---

## Key Numbers

| Stat | Finding |
|------|---------|
| **2025** | Year of largest CBD osteoarthritis trial (CANOA) |
| **200** | Patients in CANNFIB chronic pain trial |
| **6+** | Clinical trials specifically on joint conditions |
| **70%** | Of joint-related studies showed positive results |

---

## What the Research Shows

### The Best Evidence (Clinical Trials)

The [CANOA trial (2025)](/research/study/cbd-arthritis-mojoli-2025) tested CBD-rich cannabis oil in knee osteoarthritis patients. This double-blind, placebo-controlled study represents some of the strongest evidence for CBD in joint health.

A [2024 randomized trial](/research/study/cbd-arthritis-cooper-2024) evaluated CBD safety and tolerability in rheumatoid arthritis, an inflammatory joint condition. While focused on safety, it provides human data on CBD use in joint disease.

A [2022 study](/research/study/pos1021-the-effect-of-cannabidiol-on-quantitative-sensory-te-2022-74dd37) examined CBD's effects on pain parameters in both hand osteoarthritis and psoriatic arthritis patients.

### What Reviews Conclude

Research reviews consistently note CBD's anti-inflammatory properties and potential for joint conditions. The [2020 review](/research/study/2020-cannabidiol-for-pain-mlost-2020) on CBD for pain treatment explored mechanisms relevant to joint inflammation.

### Supporting Evidence

The [2016 transdermal CBD study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) in rats showed significant reduction in joint swelling and pain-related behaviors with topical CBD application. This foundational study demonstrated CBD's potential for localized joint treatment.

Research on bone health is also relevant: the [2009 GPR55 study](/research/study/the-putative-cannabinoid-receptor-whyte-2009) and [2006 CB2 bone study](/research/study/peripheral-cannabinoid-receptor-cb2-ofek-2006) examined cannabinoid receptors' roles in bone metabolism.

---

## Studies Worth Knowing

### Knee Osteoarthritis Trial (2025)

The [CANOA study](/research/study/cbd-arthritis-mojoli-2025) is the most significant recent trial for joint health.

**What they did:** Double-blind, placebo-controlled trial of CBD-rich cannabis oil in knee osteoarthritis patients.

**Why it matters:** This directly addresses the most common form of arthritis. The rigorous design provides meaningful evidence for CBD in joint health.

### Transdermal CBD in Arthritis (2016)

The [Hammell study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) demonstrated topical CBD's effects on joint inflammation.

**Key finding:** Transdermal CBD reduced joint swelling, pain behaviors, and immune cell infiltration in arthritic rats.

**Why it matters:** This showed CBD can work locally on joints when applied topically, supporting the use of CBD creams and balms for joint issues.

### Clinical Endocannabinoid Deficiency (2016)

[Russo's research](/research/study/clinical-endocannabinoid-deficiency-reconsidered-russo-2016) proposed that some chronic conditions, including fibromyalgia, may involve endocannabinoid deficiency.

**Why it matters:** This theoretical framework helps explain why cannabinoids might help with chronic pain conditions affecting joints.

---

## How CBD Might Help with Joint Health

Based on research, CBD may support joint health through multiple mechanisms:

1. **Anti-inflammatory action** — CBD interacts with [CB2 receptors](/glossary/cb2-receptor) in immune cells, potentially reducing joint inflammation

2. **Pain modulation** — Through the [endocannabinoid system](/glossary/endocannabinoid-system) and other pathways like TRPV1 receptors

3. **Cartilage protection** — Some animal research suggests CBD may have protective effects on joint cartilage

4. **Bone health** — Cannabinoid receptors in bone tissue may influence bone metabolism

---

## What Dosages Have Been Studied

Joint health studies have used various approaches:

- **Topical CBD:** Applied directly to affected joints in the [transdermal study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016)
- **Oral CBD-rich oil:** Used in the [CANOA osteoarthritis trial](/research/study/cbd-arthritis-mojoli-2025)
- **Various oral doses:** Arthritis studies have tested different dosing regimens

For joint-specific issues, topical application makes sense based on the research. Use our [dosage calculator](/tools/dosage-calculator) as a starting point, but joint health may benefit from localized topical application.

---

## My Take

Having reviewed 25+ studies on CBD and joint health, here's my honest assessment:

This is one of the areas where CBD research is most promising. The [CANOA osteoarthritis trial](/research/study/cbd-arthritis-mojoli-2025) and [transdermal arthritis study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) provide genuine scientific basis for considering CBD for joint issues.

I think the most reasonable approach is topical CBD for specific joint discomfort. The mechanism makes sense — CBD appears to work locally through CB2 receptors in joint tissue, reducing inflammatory processes.

For systemic joint conditions like rheumatoid arthritis, the evidence is earlier-stage, but the [ongoing trials](/research/study/cbd-arthritis-cooper-2024) will provide more data.

What I wouldn't promise: CBD won't rebuild damaged cartilage, won't cure arthritis, and shouldn't replace medical treatment for serious joint conditions. But as a supportive measure for joint comfort, the evidence is genuinely encouraging.

---

## Frequently Asked Questions

### Can CBD cure arthritis?

No. CBD is not a cure for any form of arthritis. Research suggests it may help manage symptoms like inflammation and discomfort, but it doesn't reverse joint damage or cure the underlying condition.

### Is CBD oil or cream better for joints?

For specific joints you can reach (knees, fingers, shoulders), topical CBD makes sense based on the [transdermal research](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016). For systemic conditions or joints you can't easily reach, oral CBD may be more practical.

### How long does CBD take to work for joint pain?

Topical CBD may provide relatively quick localized effects. Oral CBD takes longer to absorb and may require consistent use. Research hasn't established specific timelines for joint conditions.

### Can I use CBD with my arthritis medication?

CBD can interact with some medications through the liver's CYP450 enzyme system. Consult your doctor before combining CBD with arthritis medications, especially NSAIDs, DMARDs, or biologics.

### What's the best CBD product for joints?

Topical products (creams, balms) allow direct application to affected joints. Look for products with third-party testing. [Full-spectrum CBD](/glossary/full-spectrum-cbd) contains additional compounds that may enhance effects.

---

## References

I reviewed 25+ studies on CBD and joint health. Key sources:

1. **Mojoli F, et al.** (2025). Effects and safety of CBD-rich oil in knee osteoarthritis: CANOA trial.
   [Summary](/research/study/cbd-arthritis-mojoli-2025) • DOI: 10.3389/fphar.2025.1657065

2. **Hammell DC, et al.** (2016). Transdermal cannabidiol reduces inflammation and pain in arthritis.
   [Summary](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/26517407/) • DOI: 10.1002/ejp.818

3. **Cooper ZD, et al.** (2024). Randomized trial of CBD in rheumatoid arthritis.
   [Summary](/research/study/cbd-arthritis-cooper-2024)

4. **Russo EB** (2016). Clinical Endocannabinoid Deficiency Reconsidered.
   [Summary](/research/study/clinical-endocannabinoid-deficiency-reconsidered-russo-2016) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/28861491/)

5. **Ofek O, et al.** (2006). Peripheral cannabinoid receptor CB2 regulates bone mass.
   [Summary](/research/study/peripheral-cannabinoid-receptor-cb2-ofek-2006) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/16407142/)

[View all studies on CBD and arthritis →](/research?topic=arthritis)

---

## Cite This Research

**For journalists and researchers:**

CBD Portal. (2026). "CBD and Joint Health: What the Research Shows."
Retrieved from https://cbd-portal.com/knowledge/cbd-and-joint-health

**Quick stats:**
- Studies reviewed: 25+
- Human trials: 6+
- Evidence strength: Moderate

Last updated: January 2026
Author: Robin Roy Krigslund-Hansen

---

## About the Author

**Robin Roy Krigslund-Hansen** is the founder of CBD Portal with over 12 years of experience in the CBD industry. He has reviewed hundreds of research studies on cannabinoids and their therapeutic potential.

---

*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    title: "CBD and Bursitis: What the Research Shows 2026",
    slug: "cbd-and-bursitis",
    condition_slug: "bursitis",
    excerpt: "Can CBD help with bursitis pain and inflammation? We analyze research on joint inflammation and the endocannabinoid system relevant to bursitis.",
    meta_title: "CBD and Bursitis: What Research Shows 2026 | CBD Portal",
    meta_description: "Exploring CBD for bursitis - inflammation, pain relief, and the endocannabinoid system. Analysis of joint inflammation research applied to bursitis.",
    content: `# CBD and Bursitis: What the Research Shows 2026

By Robin Roy Krigslund-Hansen | 12+ years in CBD industry
Reviewed studies on joint inflammation and pain | Last updated: January 2026

---

## The Short Answer

No research has specifically studied CBD for bursitis. However, bursitis involves inflammation of the bursae (fluid-filled sacs near joints), and CBD has been studied for related inflammatory joint conditions. I'll explain what the inflammation research suggests and how it might apply to bursitis.

---

## Research Snapshot

| Metric | Value |
|--------|-------|
| **Direct bursitis studies** | 0 |
| **Related joint inflammation studies** | 15+ |
| **Human clinical trials (related)** | 6+ |
| **Strongest evidence for** | General joint inflammation |
| **Evidence strength** | ●●○○○ Limited (applied from related research) |

---

## Understanding Bursitis

Bursitis is inflammation of the bursae — small, fluid-filled sacs that cushion bones, tendons, and muscles near joints. Common locations include:

- **Shoulder** (subacromial bursitis)
- **Elbow** (olecranon bursitis)
- **Hip** (trochanteric bursitis)
- **Knee** (prepatellar bursitis)

The condition typically causes localized pain, swelling, and tenderness. It's often caused by repetitive motion or prolonged pressure on the joint.

---

## Why CBD Might Be Relevant for Bursitis

The [endocannabinoid system](/glossary/endocannabinoid-system) is present in joint tissues and plays a role in inflammation regulation. CBD's potential relevance to bursitis comes from:

- **Anti-inflammatory properties** studied in other joint conditions
- **Localized application** potential with topical CBD
- **[CB2 receptors](/glossary/cb2-receptor)** present in immune cells that drive inflammation

---

## What Related Research Shows

### Joint Inflammation Studies

The [2016 transdermal CBD study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) showed reduced inflammation in an arthritis model. While arthritis differs from bursitis, both involve joint inflammation.

**Key finding:** Topical CBD reduced joint swelling and inflammatory markers.

**Why it's relevant:** Bursitis involves localized inflammation that might respond to topical anti-inflammatory agents.

### Arthritis Research

A [2025 clinical trial](/research/study/cbd-arthritis-mojoli-2025) tested CBD-rich oil for knee osteoarthritis. While osteoarthritis involves cartilage rather than bursae, the research on CBD for joint area inflammation is applicable.

A [2024 rheumatoid arthritis trial](/research/study/cbd-arthritis-cooper-2024) evaluated CBD in an inflammatory joint condition — more mechanistically similar to bursitis.

### Tendon and Soft Tissue Studies

A [2025 trial](/research/study/cbd-pain-lpez-2025) tested CBD cream on chronic tendon pain in athletes. Tendons, like bursae, are soft tissues that can become inflamed, making this research relevant.

---

## Studies Worth Knowing

### Transdermal CBD for Joint Inflammation (2016)

The [Hammell study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) is most directly applicable to bursitis.

**What they did:** Applied transdermal CBD to inflamed joints in rats.

**Key finding:** CBD reduced joint swelling, pain behaviors, and immune cell infiltration without systemic side effects.

**Why it matters for bursitis:** This demonstrates that topical CBD can work locally on joint inflammation — exactly what bursitis involves.

### Athlete Tendon Pain (2025)

The [tendon pain trial](/research/study/cbd-pain-lpez-2025) tested CBD cream on athletes with chronic soft tissue inflammation.

**Why it matters:** Tendons and bursae are both soft tissue structures that can become inflamed from overuse. This research is more applicable to bursitis than arthritis studies.

---

## How CBD Might Help with Bursitis

Based on related research, CBD may help bursitis through:

1. **Local anti-inflammatory action** — Topical CBD may reduce inflammation at the site of the bursa

2. **Pain modulation** — CBD interacts with pain receptors in the area

3. **Reduced swelling** — The [transdermal study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) showed reduced joint swelling

4. **Non-systemic approach** — Topical application targets the specific area without whole-body effects

---

## What Dosages Have Been Studied

No bursitis-specific dosing exists. From related research:

- **Topical CBD:** Applied directly to the affected area in multiple studies
- **The [transdermal study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016)** used localized application
- **The [tendon pain study](/research/study/cbd-pain-lpez-2025)** used CBD cream on affected areas

For bursitis, topical application to the affected joint makes the most sense based on available research. Use our [dosage calculator](/tools/dosage-calculator) as a general starting point.

---

## My Take

Having reviewed the research on joint inflammation and applying it to bursitis, here's my honest assessment:

The [transdermal arthritis study](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) provides the best basis for considering CBD for bursitis. The mechanism matches — localized inflammation that might respond to topical anti-inflammatory application.

If I had bursitis, I'd be interested in trying topical CBD on the affected area. The risk is low, and the mechanism makes sense. Bursitis involves surface-level inflammation (relatively accessible to topical treatment) rather than deep joint damage.

What I wouldn't expect: CBD won't cure bursitis, won't prevent it from recurring if you continue the causative activity, and shouldn't replace medical evaluation if symptoms are severe or persistent.

What I'd recommend: Address the underlying cause (repetitive motion, pressure), use appropriate rest, and consider topical CBD as a supportive measure.

---

## Frequently Asked Questions

### Can CBD cure bursitis?

No. CBD is not a cure for bursitis. The condition typically requires rest, ice, and sometimes medical treatment. CBD might help with comfort during recovery, but it won't cure the underlying inflammation.

### Should I use CBD oil or cream for bursitis?

For bursitis, topical application makes the most sense because bursae are relatively superficial structures. A CBD cream or balm applied directly to the affected joint allows localized delivery based on the [transdermal research](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016).

### How often should I apply CBD for bursitis?

No research provides optimal frequency. The [tendon study](/research/study/cbd-pain-lpez-2025) used regular application to affected areas. Applying CBD cream 2-3 times daily to the affected area is a reasonable approach, but this is speculative.

### Can CBD replace my bursitis treatment?

No. Continue following your doctor's treatment recommendations. CBD is not an established treatment for bursitis. It might be used alongside conventional treatment, but consult your doctor first.

### How long does CBD take to work for bursitis?

Topical CBD may provide relatively quick localized effects, but bursitis typically takes weeks to resolve regardless of treatment. Don't expect immediate results from any intervention.

---

## References

Key sources from joint inflammation research:

1. **Hammell DC, et al.** (2016). Transdermal cannabidiol reduces inflammation and pain in arthritis.
   [Summary](/research/study/2016-transdermal-cannabidiol-reduces-hammell-2016) • [PubMed](https://pubmed.ncbi.nlm.nih.gov/26517407/) • DOI: 10.1002/ejp.818

2. **Lopez C, et al.** (2025). CBD cream for chronic tendon pain in athletes.
   [Summary](/research/study/cbd-pain-lpez-2025)

3. **Mojoli F, et al.** (2025). CBD-rich oil in knee osteoarthritis: CANOA trial.
   [Summary](/research/study/cbd-arthritis-mojoli-2025)

4. **Cooper ZD, et al.** (2024). Randomized trial of CBD in rheumatoid arthritis.
   [Summary](/research/study/cbd-arthritis-cooper-2024)

[View all studies on CBD and inflammation →](/research?topic=inflammation)

---

## About the Author

**Robin Roy Krigslund-Hansen** is the founder of CBD Portal with over 12 years of experience in the CBD industry. He has reviewed hundreds of research studies on cannabinoids and their therapeutic potential.

---

*This article is for informational purposes only. It is not medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  }
];

async function main() {
  for (const article of articles) {
    const { data: existing } = await supabase
      .from('kb_articles')
      .select('id')
      .eq('slug', article.slug)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('kb_articles')
        .update({
          title: article.title,
          condition_slug: article.condition_slug,
          excerpt: article.excerpt,
          content: article.content,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          status: 'published',
          language: 'en',
          article_type: 'condition',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating ' + article.slug + ':', error.message);
      } else {
        console.log('Updated: ' + article.slug);
      }
    } else {
      const { data, error } = await supabase
        .from('kb_articles')
        .insert({
          title: article.title,
          slug: article.slug,
          condition_slug: article.condition_slug,
          excerpt: article.excerpt,
          content: article.content,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          status: 'published',
          language: 'en',
          article_type: 'condition'
        })
        .select('id');

      if (error) {
        console.error('Error inserting ' + article.slug + ':', error.message);
      } else {
        console.log('Inserted: ' + article.slug + ' (id: ' + data[0].id + ')');
      }
    }
  }
}

main();
