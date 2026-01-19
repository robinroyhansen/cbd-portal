#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const categoryId = '946fdca2-f621-4f58-abfa-73f33fa2b32d';

async function createArticle(article) {
  const { data, error } = await supabase
    .from('kb_articles')
    .insert({
      ...article,
      category_id: categoryId,
      status: 'published',
      featured: false,
      language: 'en',
      article_type: 'comparison'
    })
    .select('id, title, slug')
    .single();

  if (error) {
    console.error('Error creating', article.slug + ':', error.message);
    return null;
  }
  console.log('Created:', data.slug);
  return data;
}

const articles = [
  // CBD vs Valerian
  {
    title: 'CBD vs Valerian Root: Which Is Better for Sleep and Anxiety?',
    slug: 'cbd-vs-valerian',
    excerpt: 'Compare CBD and valerian root for sleep and relaxation. Learn how these natural remedies work differently and which one may suit your needs better.',
    meta_title: 'CBD vs Valerian Root: Complete Comparison for Sleep 2026',
    meta_description: 'CBD or valerian for sleep? Compare how they work, effectiveness, safety, and which natural sleep aid is better for anxiety and insomnia.',
    reading_time: 7,
    content: `# CBD vs Valerian Root: Which Is Better for Sleep and Anxiety?

**Quick Answer:** Both CBD and valerian root are popular natural sleep aids, but they work differently. Valerian root primarily enhances GABA activity to promote sedation, working best when taken consistently for 2-4 weeks. CBD interacts with the endocannabinoid system and may address underlying causes of sleep problems like anxiety or pain. Valerian is more directly sedating; CBD is more versatile but less specifically sleep-focused.

## Key Takeaways

- **Valerian** has centuries of traditional use for sleep and mild sedation
- **CBD** works through the endocannabinoid system with broader effects
- Valerian may cause morning grogginess; CBD typically does not
- Both are considered safe for most adults
- Valerian works best with consistent use over 2-4 weeks
- CBD may help when anxiety or pain disrupts sleep
- Combination products exist, though research on combined use is limited

## Understanding Each Remedy

### What Is Valerian Root?

Valerian (Valeriana officinalis) is a flowering plant native to Europe and Asia. The root has been used as a medicinal herb since ancient Greek and Roman times. Hippocrates described its properties, and Galen prescribed it for insomnia in the 2nd century.

The root contains compounds including valerenic acid and isovaleric acid, which are thought to interact with the GABA system to promote relaxation and sleep.

### What Is CBD?

[CBD](/glossary/cbd) (cannabidiol) is a compound found in hemp plants. Unlike valerian, which targets GABA directly, CBD works through the [endocannabinoid system](/glossary/endocannabinoid-system) and may influence sleep through multiple pathways, including anxiety reduction and pain relief.

## Mechanism Comparison

| Aspect | Valerian Root | CBD |
|--------|--------------|-----|
| **Primary mechanism** | GABA enhancement | ECS modulation |
| **Onset** | 30-60 minutes | 30-90 minutes |
| **Time to full effect** | 2-4 weeks | Hours to days |
| **Sedation level** | Moderate-direct | Mild-indirect |
| **Effect type** | Specifically sedating | Broadly calming |

### How Valerian Works

Valerian's sleep-promoting effects come from:

1. **GABA enhancement:** Inhibits the breakdown of GABA, increasing its calming effects
2. **GABA-A receptor binding:** Valerenic acid may bind directly to GABA receptors
3. **Adenosine influence:** May affect adenosine receptors involved in sleep pressure
4. **Serotonin effects:** Some compounds may interact with serotonin pathways

### How CBD Works for Sleep

CBD may support sleep through:

1. **Anxiety reduction:** By interacting with serotonin receptors
2. **Pain relief:** Reducing discomfort that prevents sleep
3. **Cortisol modulation:** Potentially lowering stress hormones
4. **ECS regulation:** Supporting the body's natural sleep-wake cycles

## Detailed Comparison

| Factor | Valerian | CBD |
|--------|----------|-----|
| **Best for** | Difficulty falling asleep | Anxiety-related insomnia |
| **Typical dose** | 300-600mg extract | 25-75mg |
| **Side effects** | Headache, upset stomach | Dry mouth, drowsiness |
| **Morning grogginess** | Common | Uncommon |
| **Drug interactions** | Sedatives, alcohol | CYP450 medications |
| **Taste/smell** | Strong, unpleasant | Earthy |
| **Research quality** | Mixed but substantial | Growing, promising |
| **Monthly cost** | €10-25 | €30-80 |

## When to Choose Valerian

### You Have Trouble Falling Asleep

Valerian's sedating effects make it particularly useful for sleep onset. If your main issue is lying awake unable to drift off, valerian's GABA-enhancing properties may help.

### You Prefer Traditional Remedies

With over 2,000 years of documented use, valerian has one of the longest track records of any herbal sleep remedy. This history provides some confidence in its safety and traditional efficacy.

### You Want Budget-Friendly Options

Quality valerian supplements typically cost €10-25 per month, making it more affordable than CBD for ongoing sleep support.

### You Can Commit to Consistent Use

Valerian works best when taken regularly for 2-4 weeks. If you can maintain a consistent routine, you are more likely to see benefits.

## When to Choose CBD

### Anxiety Disrupts Your Sleep

If racing thoughts, worry, or anxiety keep you awake, CBD may address the root cause rather than just promoting sedation. Its potential anxiolytic effects work through different pathways than valerian.

### Pain Interferes with Sleep

CBD may help with [pain-related sleep problems](/learn/cbd-and-pain). Valerian does not have significant analgesic properties.

### You Prefer Less Sedation

CBD typically does not cause the grogginess that valerian can. If you need to wake up alert, CBD may be preferable.

### You Want Flexible Use

Unlike valerian, which requires consistent use, CBD can potentially be used as-needed for sleep or taken daily—offering more flexibility.

## Research Overview

### Valerian Research

Studies on valerian for sleep show mixed results:

- Some trials show modest improvements in sleep quality
- Meta-analyses have found inconsistent evidence
- Best results typically seen after 2-4 weeks of use
- Generally considered safe but effects may be modest

The research is extensive but conclusions are limited by study quality variations.

### CBD Research

CBD sleep research is newer but growing:

- A 2019 study showed improved sleep scores in 66.7% of participants
- Research suggests CBD may reduce anxiety that impairs sleep
- Studies indicate potential benefits for REM sleep behaviour disorder
- More large-scale trials are needed

## Side Effects

### Valerian Side Effects

- Headaches
- Digestive upset
- Morning drowsiness or grogginess
- Vivid dreams
- Possible rebound insomnia if stopped abruptly after long use

### CBD Side Effects

- Dry mouth
- Drowsiness (usually mild)
- Appetite changes
- Potential drug interactions via CYP450

Learn more about [CBD side effects](/learn/cbd-side-effects).

## Dosage Guidelines

### Valerian Dosing

| Form | Dose | Timing |
|------|------|--------|
| Standardised extract | 300-600mg | 30-60 min before bed |
| Dried root | 2-3g | As tea, before bed |
| Tincture | 1-2ml | Before bed |

### CBD Dosing for Sleep

| Level | Dose | Timing |
|-------|------|--------|
| Beginner | 15-25mg | 60-90 min before bed |
| Intermediate | 25-50mg | 60-90 min before bed |
| Experienced | 50-100mg | 60-90 min before bed |

Use our [CBD dosage calculator](/tools/dosage-calculator) for personalised guidance.

## Frequently Asked Questions

### Can I take valerian and CBD together for sleep?

While some people do combine them, dedicated research on this combination is limited. If you try both, start with lower doses of each. Both affect the central nervous system, so combined sedation could be stronger than expected.

### Which is safer—valerian or CBD?

Both have good safety profiles. Valerian has a longer history of use. CBD has been extensively studied in recent years. Neither is recommended during pregnancy or while taking sedatives without medical guidance. Valerian may interact with sedatives and alcohol; CBD interacts with many medications via CYP450.

### Why does valerian smell so bad?

Valerian contains isovaleric acid, which has a distinctive pungent odour often described as sweaty or cheese-like. This does not affect its efficacy. Capsules and tablets mask the smell better than tea or tinctures.

### How long before valerian starts working?

While you may feel some effects the first night, valerian typically requires 2-4 weeks of consistent use for full benefits. This differs from CBD, which may show effects more quickly.

### Does valerian cause dependence?

Unlike some sleep medications, valerian is not considered habit-forming. However, some people report mild rebound insomnia if they stop suddenly after extended use. Gradual reduction is advisable.

## The Bottom Line

**Choose valerian if:** You have difficulty falling asleep, prefer traditional remedies with long historical use, want an affordable option, and can commit to consistent daily use for several weeks.

**Choose CBD if:** Anxiety or pain disrupts your sleep, you want flexible dosing, prefer avoiding morning grogginess, or want broader benefits beyond sleep alone.

**Consider combining if:** Neither works adequately alone, but do so cautiously and start with lower doses of each.

---

*Last Updated: January 2026*

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using valerian or CBD, especially if you take medications or have health conditions.`
  },

  // CBD vs Kratom
  {
    title: 'CBD vs Kratom: Important Differences You Should Know',
    slug: 'cbd-vs-kratom',
    excerpt: 'A critical comparison of CBD and kratom. Understand the significant safety differences, legal status, effects, and why these two substances should not be equated.',
    meta_title: 'CBD vs Kratom: Safety, Legality & Effects Compared 2026',
    meta_description: 'CBD and kratom are very different substances. Compare their safety profiles, legal status, effects, and risks. Important information for consumers.',
    reading_time: 8,
    content: `# CBD vs Kratom: Important Differences You Should Know

**Quick Answer:** CBD and kratom are fundamentally different substances with very different safety profiles. CBD is a non-intoxicating cannabinoid with a favourable safety record. Kratom is an opioid-like substance with potential for dependence, withdrawal symptoms, and more serious side effects. While both are used for pain and wellness, they should not be considered equivalent alternatives.

## Key Takeaways

- **CBD is non-addictive**; kratom can cause physical dependence
- Kratom acts on opioid receptors; CBD does not
- CBD is legal across the EU; kratom is banned in many European countries
- Kratom has been associated with serious adverse events including deaths
- CBD has a well-established safety profile with mild side effects
- These substances are not interchangeable wellness products
- If considering kratom, understand the risks thoroughly

## Critical Safety Distinction

Before comparing features, it is essential to understand that CBD and kratom occupy very different positions on the safety spectrum:

| Safety Factor | CBD | Kratom |
|--------------|-----|--------|
| **Addiction potential** | Very low/none | Moderate to high |
| **Physical dependence** | Not documented | Well-documented |
| **Withdrawal symptoms** | None | Can be severe |
| **Overdose risk** | Extremely low | Documented fatalities |
| **Regulatory status** | Generally accepted | Controlled/banned in many areas |

## What Is Kratom?

Kratom (Mitragyna speciosa) is a tropical tree native to Southeast Asia. Its leaves contain compounds—primarily mitragynine and 7-hydroxymitragynine—that interact with opioid receptors in the brain.

At low doses, kratom has stimulant-like effects. At higher doses, it produces opioid-like effects including sedation, pain relief, and euphoria. This opioid activity is why kratom can cause dependence.

### Kratom's Opioid Activity

Kratom's active compounds bind to:
- **Mu-opioid receptors:** The same receptors activated by morphine and heroin
- **Delta-opioid receptors:** Involved in mood and pain
- **Adrenergic receptors:** Contributing to stimulant effects

This is fundamentally different from how CBD works.

## What Is CBD?

[CBD](/glossary/cbd) is a [phytocannabinoid](/glossary/phytocannabinoid) from hemp that works through the [endocannabinoid system](/glossary/endocannabinoid-system). It does not bind significantly to opioid receptors and does not produce intoxication or euphoria.

CBD's effects are mediated through:
- Endocannabinoid system modulation
- Serotonin receptor interaction
- GABA modulation
- Various non-opioid pathways

## Comparison Table

| Factor | CBD | Kratom |
|--------|-----|--------|
| **Source** | Hemp plant | Mitragyna speciosa tree |
| **Primary receptors** | CB1/CB2, 5-HT1A | Opioid receptors |
| **Intoxicating** | No | Yes (dose-dependent) |
| **Pain relief mechanism** | Anti-inflammatory, ECS | Opioid receptor activation |
| **Addiction risk** | None documented | Significant |
| **Legal in EU** | Yes (regulated) | Banned in many countries |
| **WHO safety assessment** | Favourable | Concerns raised |
| **Typical use** | Anxiety, pain, sleep | Pain, opioid withdrawal |

## Legal Status

### CBD in Europe

CBD is legal throughout most of the EU under Novel Food regulations, provided:
- THC content is below 0.2% (0.3% in some countries)
- Products comply with Novel Food authorisation requirements
- No medical claims are made

### Kratom in Europe

Kratom's legal status is much more restrictive:

| Country | Status |
|---------|--------|
| **Denmark** | Banned |
| **Finland** | Banned |
| **Ireland** | Banned |
| **Italy** | Banned |
| **Latvia** | Banned |
| **Lithuania** | Banned |
| **Poland** | Banned |
| **Romania** | Banned |
| **Sweden** | Banned |
| **UK** | Banned (Psychoactive Substances Act) |
| **Germany** | Legal but regulated |
| **Netherlands** | Legal |
| **France** | Legal grey area |

The widespread restrictions reflect concerns about kratom's safety profile.

## Effects Comparison

### CBD Effects

- Potential anxiety reduction
- Anti-inflammatory properties
- May support sleep
- No intoxication or "high"
- No euphoria
- Effects are subtle

### Kratom Effects

**At low doses (1-5g):**
- Stimulation
- Increased energy
- Enhanced sociability

**At higher doses (5-15g):**
- Sedation
- Pain relief
- Euphoria
- Opioid-like effects

The dose-dependent nature of kratom makes it more complex and potentially more dangerous.

## Risk Profiles

### CBD Risks

CBD has a favourable safety profile:

- Dry mouth
- Potential drowsiness
- Appetite changes
- Drug interactions (CYP450)
- No documented overdose deaths
- No physical dependence

The World Health Organization concluded that CBD is "generally well tolerated with a good safety profile."

### Kratom Risks

Kratom carries significant risks:

**Dependence and Withdrawal:**
- Physical dependence develops with regular use
- Withdrawal symptoms include muscle aches, insomnia, irritability, aggression, nausea, and mood disturbances
- Withdrawal can last days to weeks

**Adverse Effects:**
- Nausea and vomiting
- Constipation
- Liver toxicity (rare but documented)
- Seizures (rare)
- Respiratory depression at high doses
- Cognitive impairment

**Fatalities:**
- Deaths have been associated with kratom use, often involving other substances
- The US FDA has linked kratom to 44 deaths (as of 2017 data)

## Why People Use Each

### Why People Use CBD

- Anxiety management
- Sleep support
- Inflammatory conditions
- General wellness
- Seeking non-pharmaceutical options
- Pain management (without opioid effects)

### Why People Use Kratom

- Pain management (seeking opioid-like effects)
- Attempting self-treatment of opioid withdrawal
- Energy/stimulation at low doses
- Recreational effects

The motivations differ significantly, with kratom users often seeking stronger, opioid-like effects.

## Can They Be Combined?

Combining CBD and kratom is not recommended without medical supervision. While some kratom users take CBD, the interactions are not well-studied. Both substances affect the liver's CYP450 enzymes, potentially altering how each is metabolised.

If someone is using kratom and considering CBD, they should consult a healthcare provider.

## For Those Considering Kratom

If you are researching kratom, consider:

1. **Understand the addiction risk:** Kratom causes physical dependence. What starts as occasional use can become compulsive.

2. **Check legality:** Kratom is banned in many European countries. Possession could have legal consequences.

3. **Know the withdrawal reality:** Stopping kratom after regular use causes genuine withdrawal symptoms.

4. **Consider alternatives:** For pain, explore options with better safety profiles. For opioid withdrawal, seek professional addiction treatment.

5. **Do not self-treat addiction:** Using kratom to manage opioid withdrawal is not evidence-based treatment and may trade one dependence for another.

## Frequently Asked Questions

### Is kratom safer than opioids?

While kratom may have lower overdose risk than pharmaceutical opioids when used alone, it is not "safe." It acts on the same receptors, causes dependence, and has been associated with deaths (often with other substances present). Calling it safer may underestimate real risks.

### Can CBD help with kratom withdrawal?

Some people report using CBD to manage kratom withdrawal symptoms like anxiety and sleep disturbance. However, this is not a studied treatment approach. Professional addiction support is more appropriate for significant kratom dependence.

### Why is CBD legal but kratom is not in many places?

CBD has a favourable safety profile with no addiction potential and no intoxication. Kratom acts on opioid receptors, causes dependence, and has been associated with serious adverse events. Regulatory bodies have assessed the risk-benefit differently.

### Can I use kratom for anxiety like CBD?

While some people use low-dose kratom for anxiety, the addiction risk, legal issues, and opioid activity make this problematic. CBD is a far safer option for anxiety management and should be tried first.

### Is kratom natural and therefore safe?

Many dangerous substances are natural—opium, cocaine, and various toxic plants. "Natural" does not mean safe. Kratom's natural origin does not mitigate its opioid activity or dependence potential.

## The Bottom Line

**CBD and kratom should not be viewed as similar alternatives.** They work through completely different mechanisms, have vastly different safety profiles, and pose very different risks.

**CBD** is a non-addictive compound with a well-established safety record, legal status across Europe, and potential benefits for anxiety, pain, and sleep.

**Kratom** is an opioid-like substance with addiction potential, serious withdrawal symptoms, legal restrictions across Europe, and documented adverse events including deaths.

If you are considering kratom for pain management, first explore safer options including CBD. If you are struggling with kratom use, seek professional support.

---

*Last Updated: January 2026*

**Medical Disclaimer:** This article is for informational purposes only. It does not endorse kratom use. Consult healthcare professionals for pain management and addiction support.`
  },

  // CBD vs Turmeric
  {
    title: 'CBD vs Turmeric (Curcumin): Which Is Better for Inflammation?',
    slug: 'cbd-vs-turmeric',
    excerpt: 'Compare CBD and turmeric/curcumin for inflammation and pain. Learn how these popular natural anti-inflammatories work and which may be more effective for your needs.',
    meta_title: 'CBD vs Turmeric for Inflammation: Complete Comparison 2026',
    meta_description: 'CBD or turmeric for inflammation? Compare mechanisms, research, bioavailability, and effectiveness. Find which natural anti-inflammatory works better.',
    reading_time: 7,
    content: `# CBD vs Turmeric (Curcumin): Which Is Better for Inflammation?

**Quick Answer:** Both CBD and turmeric (curcumin) have anti-inflammatory properties, but they work through different mechanisms. Turmeric's curcumin blocks inflammatory pathways like NF-kB and has extensive research backing. CBD works through the endocannabinoid system and has broader effects including anxiety and pain relief. For pure inflammation, curcumin has stronger evidence. For inflammation plus anxiety or sleep issues, CBD may be more versatile.

## Key Takeaways

- **Turmeric/curcumin** has decades of anti-inflammatory research
- **CBD** offers broader effects beyond inflammation
- Curcumin has poor bioavailability without enhancement (piperine, fats)
- CBD bioavailability varies by delivery method
- Both are considered safe for most adults
- Curcumin is more affordable; CBD is more versatile
- Combining both may offer complementary benefits

## Understanding Each Remedy

### What Is Turmeric/Curcumin?

Turmeric is a spice derived from Curcuma longa, a plant in the ginger family. Curcumin is the active compound responsible for turmeric's yellow colour and most of its health benefits.

Curcumin comprises about 3% of turmeric by weight. Most supplements use concentrated curcumin extracts for meaningful doses.

### What Is CBD?

[CBD](/glossary/cbd) (cannabidiol) is a [phytocannabinoid](/glossary/phytocannabinoid) found in hemp. It interacts with the [endocannabinoid system](/glossary/endocannabinoid-system) and influences inflammation through multiple pathways distinct from curcumin.

## How They Fight Inflammation

### Curcumin's Anti-Inflammatory Mechanism

Curcumin is a potent anti-inflammatory through:

1. **NF-kB inhibition:** Blocks the master switch that activates inflammatory genes
2. **COX-2 inhibition:** Similar mechanism to NSAIDs
3. **Cytokine reduction:** Lowers TNF-alpha, IL-1, IL-6
4. **Antioxidant effects:** Neutralises free radicals
5. **LOX inhibition:** Blocks another inflammatory pathway

### CBD's Anti-Inflammatory Mechanism

CBD reduces inflammation through:

1. **ECS modulation:** Supports anti-inflammatory endocannabinoid activity
2. **Cytokine influence:** May reduce pro-inflammatory cytokines
3. **Immune cell modulation:** Affects T-cell and macrophage behaviour
4. **PPAR activation:** Activates receptors involved in inflammation control
5. **Adenosine signalling:** May enhance anti-inflammatory adenosine effects

## Comparison Table

| Factor | Turmeric/Curcumin | CBD |
|--------|-------------------|-----|
| **Primary mechanism** | NF-kB, COX-2 inhibition | ECS modulation |
| **Research volume** | Extensive (thousands of studies) | Growing (hundreds of studies) |
| **Bioavailability challenge** | Significant | Moderate |
| **Enhancement methods** | Piperine, lipids | Nano, liposomal |
| **Additional benefits** | Antioxidant, brain health | Anxiety, sleep, pain |
| **Typical dose** | 500-2000mg curcumin | 25-100mg |
| **Monthly cost** | €15-35 | €30-80 |
| **Taste** | Earthy, bitter | Earthy, hempy |
| **Side effects** | GI upset (high doses) | Dry mouth, drowsiness |

## The Bioavailability Challenge

Both substances have bioavailability limitations that affect their effectiveness.

### Curcumin Bioavailability

Standard curcumin has notoriously poor absorption—less than 1% typically reaches systemic circulation. This has led to enhanced formulations:

| Enhancement | Improvement |
|-------------|-------------|
| Piperine (black pepper) | 2000% increase |
| Phytosomal (with phospholipids) | 29x better absorption |
| Nano-curcumin | Significantly enhanced |
| With fats/oils | Improved absorption |

Always choose enhanced curcumin products for meaningful effects.

### CBD Bioavailability

CBD bioavailability varies by method:

| Method | Bioavailability |
|--------|-----------------|
| Sublingual oil | 20-35% |
| Oral (swallowed) | 6-20% |
| Vaporised | 30-40% |
| Topical | Local effects |
| [Nano CBD](/glossary/nano-cbd) | Enhanced absorption |

Learn more about [CBD bioavailability](/learn/cbd-bioavailability).

## When to Choose Curcumin

### Pure Anti-Inflammatory Focus

If inflammation is your primary concern—whether from arthritis, exercise, or inflammatory conditions—curcumin has more targeted and extensively researched anti-inflammatory effects.

### Joint Health

Curcumin has strong evidence for joint pain and osteoarthritis. Multiple studies show significant improvements in joint function and pain scores.

### Budget Considerations

Quality curcumin supplements cost €15-35 monthly, making ongoing use more affordable than CBD.

### You Want Maximum Research Support

Curcumin has thousands of published studies. While not all are high-quality clinical trials, the research volume provides confidence in its mechanisms.

## When to Choose CBD

### Inflammation Plus Anxiety

If your inflammation comes with anxiety or stress, CBD addresses both. Curcumin does not have significant anxiolytic effects.

### Pain Beyond Inflammation

CBD may help with pain through multiple mechanisms, not just inflammation. For complex pain involving nerve sensitisation, CBD offers broader support.

### Sleep Disruption

If inflammation-related discomfort disrupts sleep, CBD may help both the inflammation and the sleep quality. Curcumin does not directly improve sleep.

### You Want Flexible Forms

CBD comes in oils, gummies, capsules, topicals, and more. Curcumin is typically limited to capsules and powders.

## Research Summary

### Curcumin Research

- **Arthritis:** Meta-analyses confirm benefits for osteoarthritis pain and function
- **IBD:** Some evidence for inflammatory bowel conditions
- **Metabolic syndrome:** May improve markers of inflammation
- **Exercise recovery:** Studies show reduced muscle damage markers

The research base is extensive, though many studies have limitations.

### CBD Research

- **Arthritis:** Preclinical evidence is strong; human trials are limited
- **General inflammation:** Animal studies show clear effects; human data emerging
- **Inflammatory pain:** Some clinical evidence for specific conditions
- **Broader benefits:** Also researched for anxiety, epilepsy, sleep

CBD research is growing rapidly but is less mature than curcumin research for inflammation specifically.

## Can You Combine CBD and Curcumin?

Yes, many people combine CBD and curcumin for potentially complementary effects. They work through different pathways, so combined use may address inflammation more comprehensively.

### How to Combine

- **Start with one:** Establish effects of each individually first
- **Add the second:** Introduce at lower doses
- **Take with fats:** Both absorb better with dietary fats
- **Consider timing:** Morning curcumin, evening CBD is common
- **Monitor effects:** Track improvements and any side effects

Some supplements now combine CBD and curcumin in single products.

## Side Effects

### Curcumin Side Effects

Generally safe but may cause:
- Digestive upset (nausea, diarrhoea)
- Risk of kidney stones at very high doses
- May increase bleeding risk (avoid before surgery)
- Iron absorption interference (theoretical at high doses)

### CBD Side Effects

Also generally safe:
- Dry mouth
- Drowsiness
- Appetite changes
- Drug interactions (CYP450)

Learn more about [CBD side effects](/learn/cbd-side-effects).

## Dosage Guidelines

### Curcumin Dosing

| Goal | Dose | Notes |
|------|------|-------|
| General wellness | 500mg | Enhanced formulation |
| Inflammation | 1000-1500mg | Split doses |
| Arthritis | 1000-2000mg | With piperine/phospholipids |

### CBD Dosing for Inflammation

| Level | Dose |
|-------|------|
| Starting | 15-25mg daily |
| Moderate | 25-50mg daily |
| Higher | 50-100mg daily |

Use our [CBD dosage calculator](/tools/dosage-calculator) for personalised recommendations.

## Frequently Asked Questions

### Which is more effective for arthritis—CBD or curcumin?

Curcumin has more clinical trial evidence for arthritis specifically. Multiple studies show reduced pain and improved function in osteoarthritis patients. CBD has promising preclinical data but fewer human trials for arthritis. For pure arthritis inflammation, curcumin currently has stronger evidence.

### Can turmeric and CBD interact?

No significant negative interactions are documented. Both are metabolised by CYP450 enzymes, so theoretical interactions exist with medications using these pathways. They work through different mechanisms and may actually complement each other.

### Is turmeric the same as curcumin?

No. Turmeric is the whole spice containing about 3% curcumin. Curcumin is the active compound. For therapeutic effects, concentrated curcumin extracts (95%+) are used because you would need to consume unrealistic amounts of turmeric powder.

### Why do some turmeric supplements contain black pepper?

Black pepper contains piperine, which inhibits enzymes that break down curcumin. This dramatically increases curcumin bioavailability—by up to 2000% according to studies. Always choose curcumin products enhanced with piperine or other absorption technologies.

### How long until curcumin or CBD works for inflammation?

Curcumin typically requires 4-8 weeks of consistent use to show full benefits for chronic inflammation. CBD may work faster for symptom relief, with some people noticing effects within days. Both require patience for optimal results.

## The Bottom Line

**Choose curcumin if:** Your primary concern is inflammation (especially joint inflammation), you want maximum research support, prefer a more affordable option, or do not need help with anxiety or sleep.

**Choose CBD if:** You have inflammation plus anxiety or sleep issues, want broader pain relief beyond inflammation, prefer more product form options, or want a more versatile wellness supplement.

**Consider both if:** You want comprehensive anti-inflammatory support through complementary mechanisms, or if one alone has not provided sufficient relief.

---

*Last Updated: January 2026*

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using turmeric or CBD, especially if you take medications or have health conditions.`
  }
];

async function main() {
  console.log('Creating comparison articles batch 1b...\n');
  for (const article of articles) {
    await createArticle(article);
  }
  console.log('\nDone!');
}

main().catch(console.error);
