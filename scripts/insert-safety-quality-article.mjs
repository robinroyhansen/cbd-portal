import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

const CATEGORY_ID = '2d7e1eac-f000-433c-8fca-e8bd3d4b9477';

const article = {
  title: 'CBD Drug Interactions: Complete Guide to Medications & Safety',
  slug: 'cbd-drug-interactions',
  excerpt: "CBD can interact with many common medications by affecting how your liver processes drugs. Learn which medications interact with CBD, the risks involved, and how to use CBD safely with prescriptions.",
  content: `CBD's generally favourable safety profile comes with one significant caveat: it can interact with many medications. This isn't a minor consideration — drug interactions are the most important safety factor for most CBD users who take prescription medications. Understanding these interactions can literally prevent serious health consequences.

## Quick Answer

**CBD interacts with medications primarily by inhibiting liver enzymes (CYP450 system) that metabolise drugs.** This can cause medications to build up to higher-than-intended levels, increasing effects and side effects. The most concerning interactions involve blood thinners (especially warfarin), anti-epileptic drugs, immunosuppressants, certain heart medications, and benzodiazepines. If you take any prescription medication, consult your doctor before using CBD. The "grapefruit test" applies: if your medication warns against grapefruit, it likely interacts with CBD.

## Key Takeaways

- CBD inhibits CYP450 liver enzymes that metabolise many medications
- This can raise drug levels in your blood, intensifying effects
- Blood thinners, anti-epileptics, and immunosuppressants have highest interaction risk
- The "grapefruit rule" identifies many interacting medications
- Effects are dose-dependent — higher CBD doses mean more interaction potential
- Always consult your doctor before combining CBD with prescription medications
- Timing CBD and medications separately may reduce (but not eliminate) interactions
- Some interactions can be medically serious

## How CBD Drug Interactions Work

### The Liver's Role in Drug Processing

Your liver contains enzymes that break down medications, toxins, and other substances. The CYP450 (cytochrome P450) enzyme system handles the metabolism of an estimated 60-70% of all medications.

**Key enzymes CBD affects:**
- CYP3A4 — metabolises ~50% of all medications
- CYP2C19 — handles various drugs including some antidepressants
- CYP2D6 — processes some antidepressants and antipsychotics
- CYP2C9 — metabolises warfarin and some NSAIDs

### What Happens When CBD Inhibits These Enzymes

When CBD inhibits these enzymes:

1. **Medications break down more slowly**
2. **Drug levels in your blood rise higher than expected**
3. **Effects (both therapeutic and side effects) intensify**
4. **Drugs stay in your system longer**

Think of it like this: if a medication is designed to be processed at a certain rate, CBD can slow that processing down, causing the drug to accumulate.

### The Bidirectional Effect

The interaction works both ways:

**CBD affecting medications:** CBD inhibits enzymes, raising drug levels
**Medications affecting CBD:** Some drugs that induce these enzymes may lower CBD levels, reducing effectiveness

## The Grapefruit Rule: A Simple Check

If your medication comes with a warning about avoiding grapefruit, it likely interacts with CBD. Both substances affect similar metabolic pathways.

### Why This Works as a Rule of Thumb

Grapefruit contains compounds called furanocoumarins that inhibit CYP3A4 — the same enzyme CBD inhibits. Medications that warn against grapefruit are those where enzyme inhibition causes significant effects.

**Common medications with grapefruit warnings:**
- Many statins (cholesterol medications)
- Some blood pressure medications
- Certain immunosuppressants
- Some anxiety medications
- Various antibiotics

**This rule isn't perfect** — some medications interact with CBD through mechanisms grapefruit doesn't affect — but it catches many common interactions.

## High-Risk Drug Interactions

### Blood Thinners

#### Warfarin (Coumadin)

| Risk Level | Interaction Type | Effect |
|------------|------------------|--------|
| **HIGH** | CYP2C9 inhibition | Increased warfarin levels, higher bleeding risk |

**What happens:** CBD significantly increases warfarin blood levels, raising INR (International Normalized Ratio) and risk of bleeding.

**Clinical evidence:** Multiple case reports document INR increases when patients added CBD to warfarin therapy.

**What to do:**
- **Do not start CBD without doctor supervision** if you take warfarin
- INR monitoring is essential if combining
- Warfarin dose adjustment may be necessary
- Report any unusual bruising or bleeding

#### Other Anticoagulants

| Medication | Risk Level | Notes |
|------------|------------|-------|
| Apixaban (Eliquis) | Moderate-High | CYP3A4 substrate |
| Rivaroxaban (Xarelto) | Moderate | CYP3A4/P-gp substrate |
| Dabigatran (Pradaxa) | Lower | P-gp substrate only |
| Heparin | Lower | Different mechanism |

### Anti-Epileptic Drugs

#### Clobazam

| Risk Level | Interaction Type | Effect |
|------------|------------------|--------|
| **HIGH** | CYP2C19 inhibition | Increased clobazam/metabolite levels |

**What happens:** CBD significantly increases levels of clobazam's active metabolite (N-desmethylclobazam), intensifying sedation.

**Clinical evidence:** Epidiolex trials documented this interaction. Patients on clobazam often need dose reductions when adding CBD.

**What to do:**
- Medical supervision is essential
- Clobazam dose may need reduction
- Monitor for excessive sedation

#### Valproate (Depakote, Epilim)

| Risk Level | Interaction Type | Effect |
|------------|------------------|--------|
| **MODERATE-HIGH** | Hepatic effects | Increased risk of liver enzyme elevation |

**What happens:** Combining CBD with valproate increases risk of elevated liver enzymes.

**Clinical evidence:** Epidiolex trials showed higher rates of liver enzyme elevation in patients taking both.

**What to do:**
- Liver function monitoring is recommended
- Watch for signs of liver problems
- Report any right upper abdominal pain, fatigue, or jaundice

#### Other Anti-Epileptics

| Medication | Risk Level | Mechanism |
|------------|------------|-----------|
| Phenytoin | Moderate | CYP2C9/CYP2C19 |
| Carbamazepine | Moderate | CYP3A4 (may lower CBD levels) |
| Phenobarbital | Moderate | CYP3A4 (may lower CBD levels) |
| Topiramate | Low | Minimal interaction expected |

### Sedatives and Anxiolytics

#### Benzodiazepines

| Medication | Risk Level | Specific Concern |
|------------|------------|------------------|
| Diazepam (Valium) | Moderate-High | CYP2C19/CYP3A4 substrate |
| Alprazolam (Xanax) | Moderate | CYP3A4 substrate |
| Lorazepam (Ativan) | Low | Glucuronidation (less affected) |
| Clonazepam | Moderate | Multiple CYP enzymes |

**What happens:** CBD may increase benzodiazepine levels, intensifying sedation and side effects.

**What to do:**
- Discuss with your doctor before combining
- Be alert to excessive drowsiness
- Don't drive until you understand the combined effect

### Antidepressants

#### SSRIs

| Medication | Risk Level | Mechanism |
|------------|------------|-----------|
| Sertraline (Zoloft) | Moderate | CYP2C19/CYP3A4 |
| Escitalopram (Lexapro) | Moderate | CYP2C19 |
| Fluoxetine (Prozac) | Moderate | CYP2D6 (also inhibitor) |
| Citalopram (Celexa) | Moderate | CYP2C19 |
| Paroxetine (Paxil) | Moderate | CYP2D6 |

**What happens:** CBD may modestly increase SSRI levels. This could intensify both effects and side effects.

**Symptoms of excess:** Increased serotonergic effects, serotonin syndrome risk (rare but serious)

#### Other Antidepressants

| Medication Type | Risk Level | Notes |
|-----------------|------------|-------|
| SNRIs (venlafaxine, duloxetine) | Moderate | CYP2D6 substrates |
| TCAs (amitriptyline) | Moderate-High | Multiple CYP enzymes |
| Bupropion | Lower | CYP2B6 (less affected by CBD) |
| Mirtazapine | Moderate | CYP1A2/CYP3A4 |

### Blood Pressure Medications

| Medication Class | Risk Level | Concern |
|------------------|------------|---------|
| Amlodipine | Moderate | CYP3A4 substrate |
| Losartan | Moderate | CYP2C9 substrate |
| Propranolol | Moderate | CYP2D6 substrate |
| Diltiazem | Moderate-High | CYP3A4 substrate |
| Verapamil | Moderate-High | CYP3A4 substrate, also inhibitor |

**Combined effect:** Both CBD and some blood pressure medications lower blood pressure. Combining may cause excessive blood pressure drops.

### Immunosuppressants

| Medication | Risk Level | Concern |
|------------|------------|---------|
| Tacrolimus | HIGH | Narrow therapeutic window; CYP3A4 |
| Cyclosporine | HIGH | Narrow therapeutic window; CYP3A4 |
| Sirolimus | HIGH | CYP3A4 substrate |

**Critical warning:** Immunosuppressants often have narrow therapeutic windows, meaning even small changes in blood levels can cause serious problems — either organ rejection (too low) or toxicity (too high).

**Do not use CBD with these medications without close medical supervision and monitoring.**

### Opioid Pain Medications

| Medication | Risk Level | Mechanism |
|------------|------------|-----------|
| Codeine | Moderate | CYP2D6 (actually needs metabolism to work) |
| Oxycodone | Moderate | CYP3A4 |
| Fentanyl | Moderate-High | CYP3A4 |
| Morphine | Lower | Glucuronidation |
| Hydromorphone | Lower | Glucuronidation |

**Special consideration:** Some opioids (like codeine) need enzyme processing to become active. CBD's effect could theoretically reduce effectiveness in some cases while intensifying others.

### Other Notable Interactions

| Medication | Category | Risk Level | Notes |
|------------|----------|------------|-------|
| Omeprazole (Prilosec) | Proton pump inhibitor | Low-Moderate | CYP2C19 |
| Metformin | Diabetes | Low | Not CYP-metabolised |
| Levothyroxine | Thyroid | Low | Minimal interaction expected |
| Statins (simvastatin, atorvastatin) | Cholesterol | Moderate | CYP3A4 |
| Sildenafil (Viagra) | ED | Moderate | CYP3A4 |

## Factors Affecting Interaction Severity

### CBD Dose

**Higher CBD doses = stronger enzyme inhibition**

| CBD Dose | Interaction Potential |
|----------|----------------------|
| 10-25mg | Minimal |
| 25-50mg | Low-Moderate |
| 50-100mg | Moderate |
| 100-200mg | Moderate-High |
| 200mg+ | High |

At typical consumer doses (10-50mg), many interactions may be clinically insignificant. However, at higher doses or with particularly sensitive medications, even moderate doses can matter.

### Product Type

**Full-spectrum vs Isolate:**
- Full-spectrum products contain other cannabinoids that may contribute to interactions
- Trace THC in full-spectrum products has its own interaction potential
- Isolate products provide a cleaner interaction profile

### Individual Variation

Genetic differences in CYP enzyme function mean some people are more susceptible to interactions:

- **Poor metabolisers:** May experience stronger interactions
- **Rapid metabolisers:** May have less interaction concern
- **Genetic testing:** Can identify your metaboliser status for some enzymes

### Timing

Taking CBD and medications at different times doesn't eliminate interactions but may reduce peak interaction effects:

- CBD's enzyme inhibition effects last hours
- Separating doses by several hours may modestly reduce interactions
- This is not a substitute for medical consultation

## How to Safely Combine CBD with Medications

### Step 1: Identify Your Medications

List all prescription medications, OTC drugs, and supplements you take. Include:
- Drug name
- Dose
- Frequency
- Why you take it

### Step 2: Research Potential Interactions

For each medication:
- Check if it's metabolised by CYP450 enzymes (especially CYP3A4, CYP2C19, CYP2D6)
- Check for grapefruit warnings in the medication information
- Research the specific medication + CBD interaction

### Step 3: Consult Your Doctor

**Bring to your appointment:**
- Your medication list
- The CBD product you want to use (or information about it)
- Specific questions about monitoring
- Information about interactions you've researched

**Ask your doctor:**
- Are any of my medications at high risk for interaction?
- What monitoring should we do?
- What symptoms should prompt me to contact you?
- Are there alternatives to any high-risk medications?

### Step 4: Start Conservatively

If your doctor approves CBD use:
- Start with a lower dose than you might otherwise
- Increase slowly
- Monitor for any changes in how your medications affect you
- Report any unusual symptoms promptly

### Step 5: Monitor and Communicate

- Keep a log of CBD doses and any effects
- Note any changes in medication effectiveness or side effects
- Follow up with your doctor as recommended
- Don't adjust medications on your own

## When NOT to Use CBD

### Absolute Contraindications (Without Medical Supervision)

- **Warfarin or other blood thinners** — bleeding risk too high
- **Post-organ transplant immunosuppressants** — narrow therapeutic window
- **Clobazam for seizures** — significant interaction documented
- **Any medication with narrow therapeutic window** — small changes in levels cause big problems

### High Caution Required

- Multiple medications with interaction potential
- Liver disease (reduced capacity to process CBD)
- Elderly patients on multiple medications
- Anyone on medications requiring regular blood level monitoring

## Frequently Asked Questions

### Can I take CBD with my blood pressure medication?

Possibly, but it depends on which medication. CBD may interact with some blood pressure drugs (especially calcium channel blockers like amlodipine, diltiazem) and may also lower blood pressure on its own. Combined effects could cause excessive blood pressure drops. Consult your doctor, and if approved, monitor for lightheadedness or dizziness.

### How long should I wait between taking CBD and my medication?

Taking them at different times may modestly reduce peak interactions but doesn't eliminate them. CBD's enzyme inhibition effects last for hours. A common approach is separating by 2-4 hours, but this isn't a substitute for medical guidance. The more important factor is overall daily CBD dose.

### Can CBD reduce the effectiveness of my medication?

In most cases, CBD increases medication levels (by slowing metabolism). However, some medications need enzyme processing to become active (prodrugs), and theoretically CBD could reduce their effectiveness. Additionally, some drugs (like carbamazepine) can lower CBD levels. These complex interactions require professional guidance.

### Does CBD interact with birth control?

Some hormonal contraceptives are metabolised by CYP3A4, which CBD inhibits. However, clinical significance at typical CBD doses is uncertain. If you're on hormonal birth control and want to use CBD, discuss with your healthcare provider. Consider backup contraception methods if there's any concern.

### My doctor doesn't know about CBD interactions. What should I do?

Bring printed information about CBD-drug interactions to your appointment. Pharmacists often have good interaction databases — ask your pharmacist. You can also suggest your doctor review Epidiolex prescribing information, which contains detailed interaction data.

### Are natural supplements safer than medications with CBD?

Not necessarily. "Natural" doesn't mean "no interactions." Many supplements (St. John's wort, ginkgo, kava, etc.) also affect CYP enzymes. When combining CBD with supplements that have CNS effects (like valerian or kava), sedative effects may be additive. Apply the same caution to supplements as medications.

## My Perspective on CBD and Medications

After years in the CBD industry, I've seen too many people assume "natural" means "no interactions." This is one of the most common and potentially serious misconceptions about CBD.

The interaction potential is real and documented. At the same time, many people do successfully use CBD alongside medications — with medical supervision and appropriate monitoring. The key is:

1. **Don't assume it's fine.** Take interactions seriously.
2. **Involve your doctor.** They may not know everything about CBD, but they know your medications and health status.
3. **Start conservatively.** Lower CBD doses mean less interaction potential.
4. **Monitor actively.** Pay attention to any changes.

CBD can be a valuable wellness tool, but not at the expense of properly controlled medical conditions. Your prescription medications are there for a reason.

## Summary

CBD drug interactions are a genuine safety consideration that deserves careful attention. CBD inhibits liver enzymes (particularly CYP3A4 and CYP2C19) that metabolise a large proportion of common medications, potentially causing drug levels to rise higher than intended.

High-risk interactions include blood thinners (especially warfarin), anti-epileptic drugs (especially clobazam and valproate), immunosuppressants, and various other medications with narrow therapeutic windows. The grapefruit rule provides a quick check for many potential interactions.

If you take prescription medications, consulting your doctor before using CBD is essential — not just recommended. This is particularly important for blood thinners, seizure medications, and immunosuppressants where interaction consequences can be medically serious.

With proper medical guidance, monitoring, and conservative dosing, many people can safely combine CBD with their medications. But this requires active engagement with your healthcare provider, not assumptions that a natural product is automatically safe.

---

## Sources

1. Nasrin S, et al. (2021). Cannabinoid Metabolites as Inhibitors of Major Hepatic CYP450 Enzymes. *Drug Metabolism and Disposition*, 49(3), 238-245.

2. Grayson L, et al. (2018). An interaction between warfarin and cannabidiol: A case report. *Epilepsy & Behavior Case Reports*, 9, 10-11.

3. Gaston TE, et al. (2017). Interactions between cannabidiol and commonly used antiepileptic drugs. *Epilepsia*, 58(9), 1586-1592.

4. Epidiolex (cannabidiol) Prescribing Information. Greenwich Biosciences, Inc.

5. Brown JD, Winterstein AG. (2019). Potential Adverse Drug Events and Drug-Drug Interactions with Medical and Consumer Cannabidiol (CBD) Use. *Journal of Clinical Medicine*, 8(7), 989.

---

*Last updated: January 2026*`,
  article_type: 'educational-guide',
  category_id: CATEGORY_ID,
  reading_time: 14,
  status: 'published',
  published_at: new Date().toISOString(),
  meta_title: "CBD Drug Interactions: Complete Medication Safety Guide (2026)",
  meta_description: "CBD can interact with many medications including blood thinners, anti-epileptics, and antidepressants. Learn which drugs interact with CBD and how to stay safe.",
  language: 'en'
};

async function run() {
  const { data, error } = await supabase
    .from('kb_articles')
    .insert(article)
    .select('id, slug, title')
    .single();

  if (error) {
    if (error.code === '23505') {
      console.log(`Already exists: ${article.slug}`);
    } else {
      console.error(`Error inserting ${article.slug}:`, error.message);
    }
  } else {
    console.log(`Created: ${data.slug}`);
  }

  // Update category count
  const { count } = await supabase
    .from('kb_articles')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', CATEGORY_ID)
    .eq('status', 'published');

  await supabase
    .from('kb_categories')
    .update({ article_count: count || 0 })
    .eq('id', CATEGORY_ID);

  console.log(`Safety & Quality category now has ${count} articles`);
}

run();
