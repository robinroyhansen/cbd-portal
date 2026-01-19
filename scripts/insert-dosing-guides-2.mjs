import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const GUIDES_CATEGORY_ID = 'bfd651e6-7fb3-4756-a19d-7ad2ab98a2d2';

const articles = [
  {
    slug: 'cbd-dosage-for-anxiety',
    title: 'CBD Dosage for Anxiety: How Much to Take for Calm',
    excerpt: 'Learn the optimal CBD dosage for anxiety relief. Covers dose ranges for different anxiety levels, research-backed recommendations, and titration strategies.',
    meta_title: 'CBD Dosage for Anxiety: Finding Your Calm',
    meta_description: 'What CBD dose works for anxiety? Learn research-backed dosing recommendations, from mild stress to significant anxiety. Includes titration guide.',
    reading_time: 9,
    content: `## Quick Answer

**For anxiety, most people find benefit with 15-50mg of CBD daily, though research has used doses from 25-600mg.** Start with 15-25mg and increase gradually until you find relief. Acute anxiety may benefit from higher doses (25-50mg as needed), while daily anxiety management often works well with consistent, moderate doses.

---

## Key Takeaways

- **Common anxiety range**: 15-50mg daily for most people
- **Research doses**: Studies have used 25-600mg with positive results
- **Start conservative**: Begin at 15-25mg daily
- **Consistency matters**: Daily use often works better than as-needed
- **Timing flexibility**: Can take morning, evening, or split
- **Individual variation**: Your optimal dose may differ significantly

---

## How CBD May Help Anxiety

### Mechanisms

| Pathway | Effect on Anxiety |
|---------|-------------------|
| **[5-HT1A receptors](/glossary/serotonin-receptors-5ht1a)** | Activates serotonin pathways, similar to some anti-anxiety medications |
| **[Endocannabinoid system](/articles/endocannabinoid-system)** | Supports natural stress regulation |
| **Amygdala modulation** | May reduce fear response |
| **[GABA system](/glossary/gaba)** | May enhance calming neurotransmission |

---

## Dosing for Different Anxiety Types

### Daily/General Anxiety

| Severity | Suggested Range | Timing |
|----------|-----------------|--------|
| Mild daily tension | 10-20mg | Morning or evening |
| Moderate anxiety | 20-40mg | Split AM/PM or single dose |
| Significant anxiety | 40-75mg+ | Split doses, with medical guidance |

### Situational/Acute Anxiety

| Situation | Suggested Dose | Timing |
|-----------|----------------|--------|
| Social anxiety event | 25-50mg | 1-2 hours before |
| Stressful meeting | 15-30mg | 30-60 min before |
| Flying anxiety | 25-50mg | Before and/or during |
| Public speaking | 25-50mg | 1-2 hours before |

### Anxiety-Related Sleep Issues

| Concern | Suggested Approach |
|---------|-------------------|
| Racing thoughts at bedtime | 25-50mg, 60 min before bed |
| Anxiety causing poor sleep | Daytime dose + higher bedtime dose |

---

## What Research Shows

### Key Study Findings

| Study | Dose | Finding |
|-------|------|---------|
| **Zuardi et al.** | 300mg | Reduced anxiety in simulated public speaking |
| **Bergamaschi et al.** | 600mg | Reduced anxiety in social anxiety disorder patients |
| **Shannon et al.** | 25-175mg | 79% had lower anxiety scores in first month |
| **Masataka** | 300mg | Reduced social anxiety in teenagers |

### Research Observations

- Wide dose range shows effectiveness (25-600mg)
- 300mg appears frequently in successful anxiety studies
- Lower doses (25-75mg) also show benefit in real-world use
- Individual response varies significantly

---

## Anxiety Dose by Body Weight

| Body Weight | Starting Dose | Moderate Range | Higher Range |
|-------------|---------------|----------------|--------------|
| Under 60 kg | 15mg | 20-35mg | 40-50mg |
| 60-80 kg | 20mg | 25-45mg | 50-70mg |
| 80-100 kg | 25mg | 30-50mg | 55-80mg |
| Over 100 kg | 30mg | 35-60mg | 65-100mg |

---

## Finding Your Anxiety Dose

### Titration Protocol

| Week | Dose | Assessment |
|------|------|------------|
| **Week 1** | 15-20mg | Baseline, monitor response |
| **Week 2** | Same or +5-10mg | Adjust if needed |
| **Week 3** | Continue adjusting | Find effective level |
| **Week 4** | Maintain/optimise | Establish routine |

### Signs You've Found Your Dose

| Indicator | What It Looks Like |
|-----------|-------------------|
| **Feel calmer** | Without drowsiness |
| **Better stress response** | Don't react as intensely |
| **Improved coping** | Challenges feel more manageable |
| **Fewer anxious thoughts** | Mind less racing |
| **No significant side effects** | Or only mild, acceptable ones |

---

## Timing Strategies for Anxiety

### Daily Anxiety

| Strategy | Best For |
|----------|----------|
| **Morning dose** | Daytime anxiety, work stress |
| **Evening dose** | Evening anxiety, bedtime worries |
| **Split dose (AM/PM)** | All-day coverage |

### Acute Anxiety

| Situation | Timing |
|-----------|--------|
| **Predictable event** | 1-2 hours before |
| **Unexpected stress** | As soon as possible |
| **Ongoing situation** | Regular intervals |

### For Best Absorption During Anxiety

- Take with food or fatty snack
- Sublingual oil: hold 60 seconds
- Allow adequate time to work (15-60 min depending on method)

---

## Product Considerations for Anxiety

### Best Formats for Anxiety

| Product | Anxiety Suitability | Notes |
|---------|---------------------|-------|
| **CBD oil** | Excellent | Fast-acting, flexible dosing |
| **Gummies** | Good | Convenient, predictable |
| **Capsules** | Good | Precise, discrete |
| **Vape** | Situational | Fastest onset for acute anxiety |

### Spectrum Recommendations

| Type | For Anxiety |
|------|-------------|
| **[Full spectrum](/articles/what-is-full-spectrum-cbd)** | May provide enhanced effects via entourage effect |
| **[Broad spectrum](/articles/what-is-broad-spectrum-cbd)** | Good option if avoiding THC |
| **[Isolate](/articles/what-is-cbd-isolate)** | Works, but may need higher dose |

### Terpenes for Anxiety

Look for products containing:
- **[Linalool](/articles/what-is-linalool)**: Calming, in lavender
- **[Limonene](/articles/what-is-limonene)**: Mood-lifting
- **[Myrcene](/articles/what-is-myrcene)**: Relaxing

---

## Troubleshooting Anxiety Dosing

### If CBD Isn't Reducing Anxiety

| Issue | Solution |
|-------|----------|
| **Dose too low** | Increase by 10mg weekly |
| **Not enough time** | Give it 4 weeks of consistent use |
| **Wrong timing** | Try different timing strategies |
| **Wrong product** | Try full spectrum or different brand |
| **Underlying issues** | CBD may complement but not replace other treatment |

### If You Feel More Anxious

| Possible Cause | Solution |
|----------------|----------|
| **Dose too high** | Reduce by 50% |
| **THC sensitivity** | Try isolate or broad spectrum |
| **Stimulating at low doses** | Try higher dose |
| **Product issue** | Try different brand |

---

## CBD and Anxiety Medications

### Important Considerations

| Situation | Recommendation |
|-----------|----------------|
| **Currently on anxiety medication** | Don't stop medication; discuss CBD with prescriber |
| **Considering reducing medication** | Work with prescriber, never stop abruptly |
| **Want to try CBD instead** | Discuss with healthcare provider |

### Potential Interactions

CBD may interact with certain medications including:
- Benzodiazepines (Xanax, Valium, etc.)
- SSRIs and SNRIs
- Buspirone

Always consult your prescriber before combining.

---

## Frequently Asked Questions

### How quickly does CBD work for anxiety?

Acute effects can begin within 15-30 minutes (sublingual) to 60 minutes (oral). However, for ongoing anxiety, consistent daily use over 2-4 weeks often produces the best results.

### Should I take CBD for anxiety daily or as needed?

Both approaches work. Daily use provides consistent baseline support. As-needed use works for situational anxiety. Many people combine both: a daily maintenance dose plus extra for anticipated stressful situations.

### Why do studies use such high doses (300-600mg)?

Clinical studies often use higher doses to ensure effects are measurable. Many individuals find benefit at much lower doses (15-75mg). Start low and find your personal effective dose.

### Can CBD make anxiety worse?

Rarely. Some people, especially those sensitive to THC, may experience increased anxiety from full spectrum products. If this happens, try isolate or broad spectrum, or reduce your dose.

### Is CBD effective for panic attacks?

Some people find fast-acting CBD (sublingual or vape) helpful during panic. However, CBD is generally better for ongoing anxiety management than acute panic intervention. Severe panic disorder requires medical attention.

---

## Anxiety Dosing Quick Reference

| Anxiety Type | Starting Dose | Typical Range | Notes |
|--------------|---------------|---------------|-------|
| **Mild daily stress** | 15mg | 10-25mg | Consistency over high dose |
| **Moderate anxiety** | 20mg | 20-40mg | Daily use recommended |
| **Significant anxiety** | 25mg | 30-75mg | Work with healthcare provider |
| **Social anxiety (event)** | 25-50mg | 25-75mg | 1-2 hours before |
| **Acute situational** | 25-50mg | 25-75mg | As needed |

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. If you have an anxiety disorder, work with a mental health professional. CBD should not replace prescribed anxiety treatments without medical guidance.*`
  },
  {
    slug: 'cbd-dosage-for-pain',
    title: 'CBD Dosage for Pain: How Much for Relief',
    excerpt: 'Find the right CBD dosage for pain management. Covers dose ranges for different pain types, combining oral and topical CBD, and research-backed recommendations.',
    meta_title: 'CBD Dosage for Pain: How Much to Take for Relief',
    meta_description: 'Learn the best CBD dosage for pain relief, from mild discomfort to chronic pain. Includes dosing by pain type, product recommendations, and research findings.',
    reading_time: 10,
    content: `## Quick Answer

**For pain management, effective CBD doses typically range from 20-100mg+ daily, depending on pain severity and type.** Start with 20-30mg daily and increase gradually. Chronic pain often requires higher, consistent doses, while mild discomfort may respond to lower amounts. Combining oral CBD with topical application can enhance relief for localised pain.

---

## Key Takeaways

- **Pain often needs higher doses** than other concerns
- **Consistency matters**: Daily use typically works better than as-needed
- **Combine approaches**: Oral + topical for localised pain
- **Be patient**: Pain relief may take weeks to establish
- **Type matters**: Different pain responds to different approaches
- **Quality is crucial**: Poor products won't provide relief

---

## How CBD May Help Pain

### Mechanisms

| Pathway | Pain-Relevant Effect |
|---------|---------------------|
| **[TRPV1 receptors](/glossary/trpv1-receptor)** | Modulates pain perception |
| **Anti-inflammatory** | Reduces inflammation-related pain |
| **[CB2 receptors](/articles/cb2-receptors)** | Immune modulation, inflammation |
| **Glycine receptors** | Pain signal transmission |
| **Muscle relaxation** | May reduce tension-related pain |

---

## Dosing by Pain Type

### Chronic Pain

| Severity | Daily Dose Range | Approach |
|----------|------------------|----------|
| Mild-moderate | 30-50mg | Consistent daily use |
| Moderate-severe | 50-100mg | Split doses, higher range |
| Severe | 100mg+ | With healthcare guidance |

### Inflammatory Pain (Arthritis, etc.)

| Approach | Suggestion |
|----------|------------|
| **Oral** | 30-60mg daily |
| **Topical** | Apply to affected joints 2-3x daily |
| **Combined** | Oral + topical often most effective |

### Neuropathic Pain

| Approach | Suggestion |
|----------|------------|
| **Dose range** | 40-100mg+ daily |
| **Patience needed** | May take 4-6 weeks to evaluate |
| **Full spectrum** | May be more effective |

### Muscle Pain/Soreness

| Type | Dose | Approach |
|------|------|----------|
| Exercise soreness | 20-40mg | Post-workout, topical helpful |
| Tension pain | 25-50mg | Topical to affected area |
| Chronic muscle pain | 30-60mg | Daily oral + topical |

### Headaches/Migraines

| Approach | Suggestion |
|----------|------------|
| **Preventive** | 25-50mg daily |
| **Acute** | 25-50mg at onset |
| **Note** | Research limited, individual responses vary |

---

## Pain Dose by Body Weight

| Body Weight | Starting Dose | Moderate Pain | Significant Pain |
|-------------|---------------|---------------|------------------|
| Under 60 kg | 20mg | 30-50mg | 50-80mg |
| 60-80 kg | 25mg | 40-60mg | 60-100mg |
| 80-100 kg | 30mg | 50-75mg | 75-120mg |
| Over 100 kg | 40mg | 60-90mg | 90-150mg |

---

## Combining Oral and Topical CBD

### Why Combination Works

| Approach | What It Does |
|----------|--------------|
| **Oral CBD** | Systemic effects, overall inflammation reduction |
| **Topical CBD** | Localised effects, targeted relief |
| **Combined** | Addresses pain from multiple angles |

### Combination Protocol

| Component | Dose | Frequency |
|-----------|------|-----------|
| **Oral** | 30-60mg | 1-2x daily |
| **Topical** | Liberal application | 2-4x daily to affected areas |

### Best for Combination Approach

- Joint pain
- Muscle pain
- Localised inflammation
- Post-exercise recovery
- Back pain

---

## Titration for Pain

### Week-by-Week Protocol

| Week | Dose | Assessment |
|------|------|------------|
| **Week 1** | 25-30mg | Baseline, establish routine |
| **Week 2** | Same or +10mg | Note any changes |
| **Week 3** | Continue adjusting | +10mg if needed |
| **Week 4+** | Optimise | Find minimum effective dose |

### Signs Your Dose Is Working

| Indicator | What It Looks Like |
|-----------|-------------------|
| **Reduced pain intensity** | Rating goes down on 1-10 scale |
| **Improved function** | Can do more activities |
| **Less reliance on other pain relief** | Over time |
| **Better quality of life** | Pain less limiting |

---

## What Research Shows

### Key Findings

| Research Area | Findings |
|---------------|----------|
| **Chronic pain reviews** | Moderate evidence for cannabinoids in pain |
| **Neuropathic pain** | Some positive results in studies |
| **Arthritis (animal)** | Reduced inflammation and pain behaviours |
| **Human trials** | Mixed results, often positive |

### Research Limitations

- Many studies use THC+CBD, not CBD alone
- Doses vary widely across studies
- Most evidence from animal/preclinical research
- Large-scale human trials limited

---

## Product Recommendations for Pain

### Best Formats

| Product | Pain Suitability | Notes |
|---------|------------------|-------|
| **CBD oil** | Excellent | Flexible dosing, good baseline |
| **Topicals** | Excellent (localised) | For targeted relief |
| **Capsules** | Good | Consistent, convenient |
| **Patches** | Good | Extended release for lasting pain |

### Spectrum for Pain

| Type | Pain Effectiveness |
|------|-------------------|
| **[Full spectrum](/articles/what-is-full-spectrum-cbd)** | Often most effective—full entourage effect |
| **[Broad spectrum](/articles/what-is-broad-spectrum-cbd)** | Good option |
| **[Isolate](/articles/what-is-cbd-isolate)** | May need higher doses |

### Helpful Terpenes for Pain

- **[Beta-caryophyllene](/articles/what-is-caryophyllene)**: Anti-inflammatory, interacts with CB2
- **[Myrcene](/articles/what-is-myrcene)**: Muscle relaxation
- **[Linalool](/articles/what-is-linalool)**: Analgesic properties

---

## Timing Strategies for Pain

### Chronic Pain

| Strategy | How It Works |
|----------|--------------|
| **Split dosing** | Half AM, half PM for consistent coverage |
| **With meals** | Better absorption, consistent timing |
| **Topical as needed** | Supplement oral with targeted relief |

### Activity-Related Pain

| Timing | Suggestion |
|--------|------------|
| **Post-exercise** | Within 30 min of activity |
| **Pre-activity** | 30-60 min before for known triggers |
| **Bedtime** | If pain disrupts sleep |

---

## Troubleshooting Pain Dosing

### If Not Getting Relief

| Issue | Solution |
|-------|----------|
| **Dose too low** | Increase by 10-15mg weekly |
| **Not consistent** | Take daily at same times |
| **Wrong product** | Try full spectrum or different brand |
| **Need combination** | Add topical to oral routine |
| **Need more time** | Pain relief can take 4-6 weeks |

### If High Doses Needed

| Consideration | Action |
|---------------|--------|
| **Verify product quality** | COA, reputable brand |
| **Try full spectrum** | If using isolate |
| **Consult healthcare provider** | For guidance at higher doses |
| **Consider realistic expectations** | CBD may help but not eliminate pain |

---

## CBD and Pain Medications

### Important Considerations

| Situation | Recommendation |
|-----------|----------------|
| **On prescription pain meds** | Don't stop; discuss CBD with prescriber |
| **Using OTC pain relievers** | CBD may allow reduced use over time |
| **Opioid concerns** | Research shows potential for CBD to reduce opioid use, but work with doctor |

### Potential Interactions

CBD may interact with certain pain medications. Discuss with your prescriber if taking:
- Opioids
- NSAIDs
- Gabapentin/pregabalin
- Certain muscle relaxants

---

## Frequently Asked Questions

### How long until CBD helps pain?

Some people notice improvement within days, but chronic pain often requires 2-6 weeks of consistent use to fully evaluate. Don't judge effectiveness based on a few doses.

### Why do pain doses tend to be higher?

Pain pathways may require more CBD to modulate effectively than, say, general wellness or mild anxiety. The severity and chronicity of pain also influences dose needs.

### Can I use CBD instead of pain medication?

Discuss with your healthcare provider. Some people successfully reduce other pain management tools over time with CBD, but this should be done gradually and with medical supervision. Never stop prescribed medications abruptly.

### Should I take CBD for pain every day?

For chronic pain, yes—daily consistent use typically provides better results than occasional use. Your body may develop better response over time with consistent dosing.

### How much topical CBD should I use?

Apply liberally to affected areas. Topical dosing is less precise—you can't really "overdose" by applying too much. Reapply 2-4 times daily or as needed.

---

## Pain Dosing Quick Reference

| Pain Type | Starting Dose | Typical Range | Notes |
|-----------|---------------|---------------|-------|
| **Mild/occasional** | 20mg | 15-35mg | May use as-needed |
| **Moderate chronic** | 30mg | 30-60mg | Daily consistency |
| **Significant chronic** | 40mg | 50-100mg+ | With medical guidance |
| **Inflammatory (joints)** | 30mg | 30-70mg | Add topical |
| **Neuropathic** | 40mg | 50-100mg+ | Patience needed |
| **Muscle/exercise** | 25mg | 20-50mg | Post-activity timing |

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Chronic pain should be evaluated by a healthcare provider. CBD should not replace prescribed pain treatments without medical guidance.*`
  },
  {
    slug: 'cbd-starting-dose',
    title: 'CBD Starting Dose: Where to Begin',
    excerpt: 'What\'s the right CBD starting dose? Learn how to calculate your first dose based on your situation, with clear recommendations and simple guidelines.',
    meta_title: 'CBD Starting Dose: How Much for Your First Time',
    meta_description: 'Wondering how much CBD to take your first time? Get clear starting dose recommendations based on weight, goals, and product type. Simple, practical guidance.',
    reading_time: 6,
    content: `## Quick Answer

**Most adults should start with 15-25mg of CBD per day.** This is low enough to minimise side effects while potentially producing noticeable benefits. Take this starting dose consistently for 5-7 days before considering any adjustment. The exact starting point depends on your body weight, goals, and product type.

---

## Key Takeaways

- **Standard starting dose**: 15-25mg daily
- **Lower for caution**: 10-15mg if very sensitive
- **Higher for larger bodies**: 25-35mg if over 90kg
- **Commit to 5-7 days** before changing
- **Take with food** for better absorption
- **Track your response** from day one

---

## Quick Start Recommendations

### By Body Weight

| Your Weight | Starting Dose |
|-------------|---------------|
| Under 55 kg (120 lbs) | 10-15mg |
| 55-75 kg (120-165 lbs) | 15-20mg |
| 75-95 kg (165-210 lbs) | 20-25mg |
| Over 95 kg (210 lbs) | 25-35mg |

### By Goal

| Primary Goal | Starting Dose |
|--------------|---------------|
| General wellness | 15-20mg |
| Sleep support | 20-30mg |
| Stress/anxiety | 15-25mg |
| Physical discomfort | 20-30mg |

---

## Why Start Low

### Benefits of a Low Starting Dose

| Benefit | Explanation |
|---------|-------------|
| **Minimises side effects** | Less chance of drowsiness, etc. |
| **Identifies sensitivity** | See how your body responds |
| **Saves money** | Find minimum effective dose |
| **Room to adjust** | Can only increase from here |
| **Better data** | Clear baseline for comparison |

### What Happens If You Start Too High

| Risk | Consequence |
|------|-------------|
| **Side effects** | Drowsiness, digestive issues |
| **Wasted product** | Using more than needed |
| **Unclear picture** | Don't know minimum effective dose |
| **Negative experience** | May put you off CBD |

---

## Your First Dose: Step by Step

### How to Take Your First CBD Dose

| Step | Action |
|------|--------|
| **1** | Choose your starting dose from charts above |
| **2** | Measure carefully using product markings |
| **3** | Take with food or fatty snack |
| **4** | If oil, hold under tongue 60 seconds |
| **5** | Note the time and amount |

### What to Expect

| Timeframe | What You May Experience |
|-----------|------------------------|
| **First hour** | Possibly nothing—normal |
| **First few hours** | Maybe subtle calm or nothing |
| **First few days** | Building routine, possibly subtle effects |
| **First week** | May start noticing something |

---

## Starting Dose by Product Type

### CBD Oil

| Bottle Strength | Drops for ~20mg* |
|-----------------|------------------|
| 500mg/30ml | Full dropper (1ml) |
| 1000mg/30ml | Half dropper (0.5ml) |
| 1500mg/30ml | 1/3 dropper (~0.4ml) |

*Approximate—check your specific product

### CBD Gummies

| Gummy Strength | Starting Suggestion |
|----------------|---------------------|
| 10mg per gummy | Start with 2 gummies |
| 25mg per gummy | Start with 1 gummy |
| 50mg per gummy | Start with half |

### CBD Capsules

| Capsule Strength | Starting Suggestion |
|------------------|---------------------|
| 10mg per capsule | Start with 2 capsules |
| 25mg per capsule | Start with 1 capsule |
| 50mg per capsule | Consider lower strength |

---

## Special Starting Considerations

### If You're Particularly Cautious

| Recommendation | Why |
|----------------|-----|
| Start at 10mg | Extra conservative |
| Wait 7-10 days | Before any increase |
| Track carefully | Note any changes |

### If You Have Previous CBD Experience

| Situation | Starting Suggestion |
|-----------|---------------------|
| Previously worked at specific dose | Start there again |
| Tried before but unclear | Start at 20-25mg |
| Taking a break and returning | Same as before or slightly lower |

### If Using Full Spectrum (Contains THC)

| Recommendation | Why |
|----------------|-----|
| Start standard dose | Full spectrum often more effective |
| Note any THC sensitivity | May affect your spectrum choice |

---

## The First Week Protocol

### Daily Routine

| Day | What to Do |
|-----|------------|
| **Day 1** | Take starting dose, note time/amount |
| **Day 2-3** | Same dose, same time, track |
| **Day 4-5** | Continue, note any changes |
| **Day 6-7** | Assess—any effects? Side effects? |

### End of Week 1 Assessment

| Question | If Yes | If No |
|----------|--------|-------|
| Any negative effects? | Reduce dose or try different timing | Continue |
| Any positive effects? | Keep current dose | May increase next week |
| Tolerable experience? | Continue routine | Adjust as needed |

---

## Common Starting Dose Mistakes

### Mistakes to Avoid

| Mistake | Better Approach |
|---------|-----------------|
| Starting too high | Begin with recommended amount |
| Increasing too fast | Wait 5-7 days minimum |
| Expecting immediate results | Give it time |
| Skipping days | Take consistently |
| Not tracking | Note dose and effects |

---

## When to Adjust from Starting Dose

### After Week 1, Increase If:

| Sign | Action |
|------|--------|
| No effects, no side effects | Increase by 5-10mg |
| Partial benefit | May try slight increase |

### Keep Same Dose If:

| Sign | Action |
|------|--------|
| Positive effects | Maintain current dose |
| Subtle benefits developing | Continue observing |

### Decrease or Stop If:

| Sign | Action |
|------|--------|
| Significant side effects | Reduce by 50% or pause |
| Uncomfortable experience | Reassess product or approach |

---

## Frequently Asked Questions

### What if 20mg is too much to start?

If you're particularly sensitive to supplements or have had reactions before, starting at 10mg is perfectly reasonable. You can always increase from there.

### Can I start higher if I want faster results?

Starting higher increases side effect risk and makes it harder to find your minimum effective dose. Patience with a lower start typically leads to better long-term results.

### Does my starting dose depend on what I'm using CBD for?

Somewhat. Sleep and pain often need slightly higher doses, so starting at 25-30mg makes sense. For general wellness, 15-20mg is usually sufficient to start.

### What if I accidentally take more than intended?

Don't worry—CBD has a good safety profile. You might experience drowsiness or mild digestive effects. Just return to your intended dose the next day.

---

## Quick Start Summary

| Step | Action |
|------|--------|
| **1** | Calculate dose from weight chart |
| **2** | Adjust for goal if needed |
| **3** | Take with food, track daily |
| **4** | Maintain for 5-7 days |
| **5** | Assess and adjust as needed |

**Most people:** Start with **15-25mg** and adjust from there.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-maintenance-dose',
    title: 'CBD Maintenance Dose: Finding Your Long-Term Amount',
    excerpt: 'Found a CBD dose that works? Learn how to establish and maintain your optimal long-term dose, when to reassess, and how to optimise for continued benefits.',
    meta_title: 'CBD Maintenance Dose: Your Long-Term Guide',
    meta_description: 'Once you find your CBD dose, how do you maintain it? Learn about long-term CBD use, when to adjust, and optimising your maintenance routine.',
    reading_time: 7,
    content: `## Quick Answer

**Your maintenance dose is the amount of CBD that provides consistent benefits with minimal side effects over time.** Once you've found this through titration (typically over 4-8 weeks), maintain it consistently. The goal is finding your **minimum effective dose**—the lowest amount that delivers your desired benefits.

---

## Key Takeaways

- **Maintenance dose is personal**—what you've discovered works for you
- **Minimum effective dose** is the target—not maximum tolerable
- **Consistency is key**—same dose, same timing, daily
- **Periodic reassessment** ensures dose remains optimal
- **Lifestyle changes** may require adjustment
- **Long-term use** appears safe based on current evidence

---

## What Is a Maintenance Dose?

### Definition

| Concept | Meaning |
|---------|---------|
| **Maintenance dose** | The amount you take regularly for ongoing benefits |
| **Minimum effective** | The lowest dose that still works |
| **Optimal dose** | Where benefits peak without increasing side effects |

### How It Differs from Starting/Titration

| Phase | Purpose | Duration |
|-------|---------|----------|
| **Starting dose** | Safe introduction | Week 1 |
| **Titration** | Finding what works | Weeks 2-6 |
| **Maintenance** | Sustaining benefits | Ongoing |

---

## Finding Your Maintenance Dose

### Signs You've Found It

| Indicator | What It Looks Like |
|-----------|-------------------|
| **Consistent benefits** | Effects are reliable day to day |
| **No significant side effects** | Or only minor, acceptable ones |
| **Feels sustainable** | Easy to maintain routine |
| **Increasing doesn't add benefit** | Higher doses aren't better |

### Testing Minimum Effective Dose

Once stable, try reducing:

| Step | Action | Assessment |
|------|--------|------------|
| **1** | Reduce by 5mg | Maintain for 5-7 days |
| **2** | If benefits continue | That's your new dose |
| **3** | If benefits decrease | Return to previous dose |

---

## Typical Maintenance Dose Ranges

### By Goal

| Purpose | Common Maintenance Range |
|---------|-------------------------|
| **General wellness** | 15-30mg daily |
| **Stress/anxiety** | 20-50mg daily |
| **Sleep** | 25-60mg daily |
| **Physical discomfort** | 30-80mg daily |
| **Significant concerns** | 50-100mg+ daily |

**Note:** Your personal maintenance dose may be higher or lower.

---

## Maintaining Your Dose

### Daily Routine

| Element | Recommendation |
|---------|----------------|
| **Timing** | Same time(s) each day |
| **With food** | Consistent absorption |
| **Method** | Same product/delivery type |
| **Tracking** | Occasional check-ins |

### Weekly/Monthly Check-Ins

| Frequency | What to Assess |
|-----------|----------------|
| **Weekly (month 1-2)** | Effects still consistent? |
| **Monthly (months 3-6)** | Any changes needed? |
| **Quarterly (ongoing)** | Overall assessment |

---

## When to Reassess Your Maintenance Dose

### Life Changes That May Affect Dose

| Change | Possible Adjustment |
|--------|---------------------|
| **Significant weight change** | May need increase or decrease |
| **New medication** | Consult doctor, may need adjustment |
| **Health status change** | Reassess needs |
| **Stress level change** | May need temporary adjustment |
| **Product change** | May need recalibration |

### Signs Your Dose Needs Adjustment

| Sign | Possible Action |
|------|-----------------|
| **Effects diminishing** | Small increase or tolerance break |
| **New side effects** | Decrease or investigate cause |
| **Concerns improving** | May try reducing |
| **New concern arising** | May need increase or timing change |

---

## Long-Term CBD Use

### What We Know About Extended Use

| Factor | Current Understanding |
|--------|----------------------|
| **Safety** | Good long-term safety profile in studies |
| **Dependence** | No physical dependence observed |
| **Effectiveness** | Generally maintains over time |
| **Tolerance** | Variable—some develop, some don't |

### Tolerance Considerations

| If Tolerance Develops | Options |
|----------------------|---------|
| **Effects seem weaker** | Try 2-3 day break |
| **Need more for same effect** | Reassess, try break |
| **No tolerance** | Many people don't develop it |

---

## Optimising Your Maintenance Routine

### Strategies for Best Results

| Strategy | How It Helps |
|----------|--------------|
| **Consistent timing** | Body adjusts to routine |
| **Quality products** | Reliable effects |
| **Healthy lifestyle** | Supports ECS function |
| **Periodic assessment** | Catches needed changes |

### Supporting Your Endocannabinoid System

Beyond CBD, support your ECS with:

| Factor | Action |
|--------|--------|
| **Exercise** | Regular physical activity |
| **Sleep** | Consistent sleep schedule |
| **Diet** | Omega fatty acids, reduce processed food |
| **Stress management** | Mindfulness, relaxation |

---

## Managing Your CBD Supply

### Calculating Monthly Needs

| Your Daily Dose | Monthly Need | 30ml Bottle Lasts* |
|-----------------|--------------|-------------------|
| 20mg | 600mg | 6 weeks (1000mg bottle) |
| 30mg | 900mg | 4 weeks (1000mg bottle) |
| 50mg | 1500mg | 3 weeks (1500mg bottle) |

*Approximate, based on 30ml bottles

### Cost Considerations

| Strategy | How It Helps |
|----------|--------------|
| **Find minimum effective dose** | Don't use more than needed |
| **Subscribe for discounts** | Many brands offer savings |
| **Buy larger quantities** | Often better price per mg |
| **Compare price per mg** | Not just bottle price |

---

## Frequently Asked Questions

### Can I stay on the same dose forever?

Many people maintain the same dose for extended periods. However, life changes may require adjustment. Periodic reassessment ensures your dose remains optimal.

### Will I need to keep increasing my dose?

Not necessarily. While some people experience tolerance, many maintain the same effective dose for months or years. If you notice diminishing effects, try a short break before increasing.

### What if I miss a day?

Missing occasional doses isn't a major concern. Just resume your normal routine. If you frequently forget, set reminders or adjust your timing.

### Should I take a break from CBD periodically?

Some people benefit from occasional breaks (2-3 days) to reset tolerance. Others maintain consistent use without issues. If effects seem weaker, a brief break may help.

### Is there a maximum safe maintenance dose?

No established maximum, but higher doses (100mg+) should be discussed with a healthcare provider. Most people maintain well below this level. The goal is minimum effective dose, not maximum.

---

## Maintenance Dose Summary

| Phase | Timeline | Focus |
|-------|----------|-------|
| **Find dose** | Weeks 1-6 | Titration, discovering what works |
| **Establish maintenance** | Weeks 6-8 | Confirming consistent benefits |
| **Long-term maintenance** | Ongoing | Consistency, periodic reassessment |

**Your maintenance dose is what works for YOU, taken consistently, for ongoing benefit.**

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD long-term, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'microdosing-cbd',
    title: 'Microdosing CBD: The Low-Dose Approach',
    excerpt: 'Microdosing CBD means taking very small doses throughout the day. Learn about the benefits, how to microdose effectively, and who this approach works for.',
    meta_title: 'Microdosing CBD: Guide to Low-Dose Benefits',
    meta_description: 'Is less more with CBD? Learn about microdosing CBD, including benefits, protocols, and who might benefit from this low-dose, frequent approach.',
    reading_time: 8,
    content: `## Quick Answer

**Microdosing CBD means taking very small doses (2-10mg) multiple times throughout the day rather than larger doses once or twice daily.** This approach maintains steady CBD levels, may be more cost-effective, and can provide consistent effects without drowsiness. It's particularly useful for daytime function and general wellness.

---

## Key Takeaways

- **Typical microdose**: 2-10mg per serving
- **Frequency**: 3-6 times daily
- **Total daily**: Often 15-40mg (similar to standard dosing)
- **Goal**: Steady levels, subtle effects
- **Best for**: Daytime use, sensitive individuals, general wellness
- **Not for**: Significant concerns requiring higher doses

---

## What Is CBD Microdosing?

### Definition

| Term | Meaning |
|------|---------|
| **Microdosing** | Taking very small, frequent doses |
| **Sub-perceptual** | Effects subtle, not dramatic |
| **Steady state** | Maintaining consistent CBD levels |

### Microdosing vs. Standard Dosing

| Approach | Dose Size | Frequency | Total Daily |
|----------|-----------|-----------|-------------|
| **Standard** | 20-50mg | 1-2x daily | 20-50mg |
| **Microdosing** | 3-10mg | 4-6x daily | 15-40mg |

---

## Benefits of Microdosing

### Potential Advantages

| Benefit | Explanation |
|---------|-------------|
| **Steady levels** | No peaks and valleys in CBD blood levels |
| **Daytime friendly** | Less drowsiness than larger doses |
| **Cost efficiency** | Potentially use less total CBD |
| **Consistent effects** | Subtle, ongoing support |
| **Find minimum effective** | Easier to determine exact needs |

### Who Microdosing May Suit

| Candidate | Why Microdosing Fits |
|-----------|---------------------|
| **CBD-sensitive individuals** | Small doses prevent overwhelming effects |
| **Daytime users** | Avoid drowsiness |
| **General wellness seekers** | Subtle daily support |
| **Cost-conscious users** | Potentially lower total consumption |
| **Those who forgot CBD doesn't work** | Different approach may yield results |

---

## How to Microdose CBD

### Basic Protocol

| Element | Recommendation |
|---------|----------------|
| **Dose size** | 3-5mg per serving |
| **Frequency** | Every 3-4 hours while awake |
| **Times per day** | 4-6 servings |
| **Total daily** | 15-30mg typically |

### Sample Schedule

| Time | Dose | Notes |
|------|------|-------|
| **8:00 AM** | 5mg | With breakfast |
| **12:00 PM** | 5mg | Midday |
| **3:00 PM** | 5mg | Afternoon |
| **7:00 PM** | 5mg | Evening |

Total: 20mg distributed throughout day

---

## Products for Microdosing

### Best Formats

| Product | Microdose Suitability | Notes |
|---------|----------------------|-------|
| **CBD oil** | Excellent | Precise measuring possible |
| **Low-dose gummies** | Good | 5mg gummies ideal |
| **CBD mints/lozenges** | Excellent | Designed for small doses |
| **CBD softgels (low strength)** | Good | 5-10mg options |
| **Capsules** | Moderate | Often higher strength |

### Calculating Oil Microdoses

For a 1000mg/30ml bottle:
- ~33mg per ml (full dropper)
- ~3.3mg per 0.1ml (few drops)
- 3-4 drops ≈ 5mg

### Measuring Precisely

| Method | Precision |
|--------|-----------|
| **Counting drops** | Good for oils |
| **Graduated dropper** | More precise |
| **CBD calculator** | Helps determine drops needed |

---

## When Microdosing Works Best

### Ideal Situations

| Situation | Why Microdosing Helps |
|-----------|----------------------|
| **Office/work use** | Discrete, no drowsiness |
| **Mild daily stress** | Gentle ongoing support |
| **General wellness** | Subtle ECS support |
| **Sensitive constitution** | Avoid overwhelming effects |
| **Testing CBD response** | Safe way to start |

### When Standard Dosing Is Better

| Situation | Why Standard Dosing Preferred |
|-----------|------------------------------|
| **Significant concerns** | May need higher acute doses |
| **Sleep issues** | Higher bedtime dose often needed |
| **Severe discomfort** | May require substantial amounts |
| **Convenience priority** | Once-daily is simpler |

---

## Combining Microdosing with Regular Dosing

### Hybrid Approach

| Time | Approach | Dose |
|------|----------|------|
| **Daytime** | Microdose | 5mg × 3-4 times |
| **Evening/night** | Standard dose | 20-30mg |

### Why Combine

- Daytime functionality (microdose)
- Evening relaxation or sleep (standard dose)
- Flexibility based on needs
- Best of both approaches

---

## Microdosing Protocol

### Getting Started

| Week | Protocol |
|------|----------|
| **Week 1** | 3mg × 4 times daily (12mg total) |
| **Week 2** | If no effect, try 5mg × 4 times (20mg total) |
| **Week 3** | Optimise timing and dose |
| **Week 4** | Establish routine |

### Tracking Microdoses

| Track | Why |
|-------|-----|
| **Each dose time** | Ensure consistency |
| **Subtle effects** | Microdoses have subtle results |
| **End of day review** | Overall assessment |
| **Weekly patterns** | Long-term picture |

---

## Microdosing FAQ

### Is microdosing more effective than standard dosing?

Not necessarily more effective, but different. Microdosing provides steady levels without peaks. Some people respond better to this approach, others to standard dosing. It's a matter of individual response and preference.

### How many mg total per day with microdosing?

Typically 15-40mg total daily, spread across multiple small doses. This is often similar to or slightly less than standard dosing totals.

### Can I feel a 5mg dose?

Most people don't "feel" a single 5mg microdose dramatically. The effects are subtle—cumulative and steady rather than acute. This is actually the point of microdosing.

### What if microdosing isn't working?

If you don't notice any benefit after 3-4 weeks:
- Slightly increase each microdose
- Try standard dosing approach
- Verify product quality
- Consider you may need a different approach

### Is microdosing more affordable?

Potentially. If you find you need less total daily CBD with microdosing compared to standard dosing, costs decrease. However, some people need similar amounts either way.

---

## Microdosing Summary

| Element | Recommendation |
|---------|----------------|
| **Dose size** | 3-10mg |
| **Frequency** | 4-6 times daily |
| **Total daily** | 15-40mg typically |
| **Best for** | Daytime use, general wellness, sensitive users |
| **Products** | Low-dose oils, 5mg gummies, mints |

**Microdosing offers an alternative approach that may suit your lifestyle and sensitivity level.**

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  }
];

async function main() {
  console.log('Inserting Dosing guides (batch 2)...\n');

  for (const article of articles) {
    const { data, error } = await supabase.from('kb_articles').insert({
      ...article,
      status: 'published',
      featured: false,
      article_type: 'educational-guide',
      category_id: GUIDES_CATEGORY_ID,
      language: 'en',
      published_at: new Date().toISOString()
    }).select('slug').single();

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${data.slug}`);
    }
  }

  console.log('\nBatch 2 complete (10/15 Dosing guides).');
}
main();
