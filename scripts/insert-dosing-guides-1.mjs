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
    slug: 'cbd-dosage-guide',
    title: 'CBD Dosage Guide: Finding Your Optimal Amount',
    excerpt: 'Complete guide to CBD dosing. Learn how to find your ideal dose based on weight, goals, product type, and individual factors. Includes dosage charts and calculators.',
    meta_title: 'CBD Dosage Guide: How Much CBD Should You Take?',
    meta_description: 'Learn how much CBD to take with our comprehensive dosage guide. Includes charts by weight, goal-specific recommendations, and step-by-step titration instructions.',
    reading_time: 14,
    content: `## Quick Answer

**Most adults start with 10-25mg of CBD per day and adjust based on response.** There's no universal dose—optimal amounts vary based on body weight, the concern being addressed, individual biology, and product type. Start low, increase gradually (every 5-7 days), and find the minimum effective dose for your needs.

---

## Key Takeaways

- **Start low**: 10-25mg daily for most adults
- **Go slow**: Increase by 5-10mg every 5-7 days if needed
- **Individual variation**: Optimal doses range from 10mg to 100mg+ daily
- **Goal matters**: Different concerns may require different amounts
- **Less can be more**: Find your minimum effective dose
- **Consistency wins**: Daily use typically works better than occasional

---

## Why There's No "Standard" CBD Dose

### Factors That Affect Your Optimal Dose

| Factor | How It Affects Dosing |
|--------|----------------------|
| **Body weight** | Larger bodies may need more |
| **Individual biology** | Metabolism, genetics, [ECS tone](/glossary/endocannabinoid-tone) |
| **Severity of concern** | More significant issues may need higher doses |
| **Product type** | [Bioavailability](/articles/cbd-bioavailability) varies by format |
| **Spectrum type** | [Full spectrum](/articles/what-is-full-spectrum-cbd) may require less than [isolate](/articles/what-is-cbd-isolate) |
| **Tolerance** | May develop over time in some people |

---

## General Dosing Framework

### Starting Dose by Body Weight

| Body Weight | Suggested Starting Dose |
|-------------|------------------------|
| Under 55 kg (120 lbs) | 10-15mg daily |
| 55-75 kg (120-165 lbs) | 15-20mg daily |
| 75-90 kg (165-200 lbs) | 20-25mg daily |
| Over 90 kg (200 lbs) | 25-30mg daily |

### Dose Ranges by Intensity

| Level | Daily Dose | Typical Use |
|-------|-----------|-------------|
| **Low** | 10-20mg | General wellness, mild concerns |
| **Medium** | 20-50mg | Moderate concerns, most common range |
| **High** | 50-100mg | Significant concerns, with guidance |
| **Very high** | 100mg+ | Specific situations, professional oversight recommended |

---

## Dosing by Goal

### Stress and Anxiety

| Severity | Suggested Range | Notes |
|----------|-----------------|-------|
| Mild daily stress | 10-25mg | Start here |
| Moderate anxiety | 25-50mg | Build up gradually |
| Significant anxiety | 50-100mg | Work with healthcare provider |

Research note: Studies have used doses from 25-600mg for anxiety, with 300mg showing particular promise in some trials.

### Sleep Support

| Concern | Suggested Range | Timing |
|---------|-----------------|--------|
| Difficulty unwinding | 15-30mg | 30-60 min before bed |
| Trouble falling asleep | 25-50mg | 30-60 min before bed |
| Night waking | 30-60mg | Consider extended-release format |

Higher doses tend to be more sedating for most people.

### Physical Discomfort

| Type | Suggested Range | Approach |
|------|-----------------|----------|
| Mild/occasional | 15-30mg | As needed or daily |
| Moderate/chronic | 30-60mg | Daily consistency |
| Significant | 50-100mg+ | Work with healthcare provider |

Topicals can supplement oral doses for localised concerns.

### General Wellness

| Goal | Suggested Range | Notes |
|------|-----------------|-------|
| Daily support | 10-25mg | Consistency over high doses |
| [ECS support](/glossary/endocannabinoid-system) | 15-30mg | Regular daily use |

---

## The "Start Low, Go Slow" Method

### Week-by-Week Titration

| Week | Action | Assessment |
|------|--------|------------|
| **Week 1** | Start at baseline dose (10-20mg) | Track daily, note any effects |
| **Week 2** | If no benefit, increase by 5-10mg | Continue tracking |
| **Week 3** | Continue adjusting if needed | Look for patterns |
| **Week 4** | Evaluate effectiveness | Decide: continue, adjust, or reassess |

### How to Increase Your Dose

1. **Wait 5-7 days** at each dose level
2. **Increase by small amounts** (5-10mg)
3. **Track consistently** at each level
4. **Stop increasing** when you notice benefits
5. **Find minimum effective dose** (don't go higher than needed)

---

## Dosing by Product Type

### CBD Oil (Tinctures)

| Calculation | Example |
|-------------|---------|
| Know your bottle's total mg | 1000mg per 30ml bottle |
| Calculate mg per ml | 1000 ÷ 30 = 33.3mg/ml |
| Know your dropper volume | Typically 1ml = full dropper |
| Measure your dose | Half dropper = ~16.5mg |

### CBD Gummies

| Typical Strengths | How to Dose |
|-------------------|-------------|
| 10mg per gummy | 1-2 gummies = 10-20mg |
| 25mg per gummy | Start with 1 = 25mg |
| 50mg per gummy | Consider cutting in half initially |

### CBD Capsules

| Typical Strengths | Notes |
|-------------------|-------|
| 10-15mg | Good for starting, easier to titrate |
| 25mg | Most common strength |
| 50mg | Higher strength, less flexible |

### CBD Topicals

Topical dosing is less precise—apply as needed to affected areas. Since CBD doesn't significantly enter the bloodstream from topicals, you can use liberally.

---

## Understanding Bioavailability

Different delivery methods absorb differently, affecting effective dose.

### Bioavailability by Method

| Method | Bioavailability | Implication |
|--------|-----------------|-------------|
| **Inhalation** | 30-50% | Lower mg needed |
| **Sublingual** | 20-30% | Moderate efficiency |
| **Oral (with food)** | 10-20% | May need higher mg |
| **Topical** | Local only | Different purpose |

### Adjusting Dose for Bioavailability

If switching products, you may need to adjust:

| Switching From | Switching To | Adjustment |
|----------------|--------------|------------|
| Oil (sublingual) | Gummies | May need ~50% more mg |
| Gummies | Oil (sublingual) | May need ~30% less mg |
| Any | Topical | Separate consideration—local use |

---

## When Dosing Isn't Working

### Troubleshooting No Effects

| Possible Issue | Solution |
|----------------|----------|
| **Dose too low** | Gradually increase |
| **Not enough time** | Wait 4 weeks before judging |
| **Poor absorption** | Take with fatty food |
| **Low quality product** | Try tested, reputable brand |
| **Wrong spectrum** | Try [full spectrum](/articles/what-is-full-spectrum-cbd) if using isolate |
| **Individual variation** | Some people don't respond to CBD |

### Troubleshooting Side Effects

| Side Effect | Solution |
|-------------|----------|
| **Drowsiness** | Reduce dose, take at night |
| **Digestive upset** | Take with food, reduce dose |
| **Dry mouth** | Stay hydrated |
| **Persistent issues** | Reduce dose significantly or stop |

---

## Special Considerations

### For Seniors

| Consideration | Recommendation |
|---------------|----------------|
| **Start lower** | Begin with 5-10mg |
| **Increase slower** | Wait longer between adjustments |
| **Monitor carefully** | Track effects and any medications |
| **Consult doctor** | Especially important with medications |

### For Large Body Size

| Body Weight | Adjustment |
|-------------|------------|
| Over 100 kg | May need 25-50% higher doses |
| Very high body fat | CBD is fat-soluble—may need more |

### For Sensitive Individuals

| Sensitivity Type | Approach |
|------------------|----------|
| Generally sensitive to supplements | Start at 5mg |
| History of medication sensitivities | Start very low, increase slowly |
| Prone to anxiety from substances | Start low, monitor carefully |

---

## Dosing FAQs

### Can I take too much CBD?

While CBD has a good safety profile and no known toxic dose in humans, taking excessive amounts can cause side effects (drowsiness, digestive upset) and wastes money. More isn't always better—find your minimum effective dose.

### How often should I take CBD?

Most people benefit from daily use, either once or twice per day. Consistency matters more than occasional high doses. Some take CBD as needed (like for acute stress), but regular use typically produces better results.

### Should I take CBD with food?

Yes—taking CBD with food (especially fatty food) significantly improves absorption. Studies show up to 4x better absorption when taken with a high-fat meal.

### Does tolerance develop?

Some people report needing to increase their dose over time, while others experience "reverse tolerance" (needing less). If tolerance develops, try a 2-3 day break or reassess your baseline.

### What time of day should I take CBD?

Depends on your goals:
- **General wellness:** Morning or split AM/PM
- **Sleep:** 30-60 minutes before bed
- **Stress:** When you typically feel most stressed
- **Pain:** Consistent timing daily

---

## Quick Dosing Reference

### At-a-Glance Recommendations

| Situation | Starting Dose | Range |
|-----------|---------------|-------|
| **New to CBD, general use** | 15-20mg | 10-30mg |
| **Mild stress/sleep** | 15-25mg | 15-40mg |
| **Moderate concerns** | 20-30mg | 20-60mg |
| **Significant concerns** | 25-50mg | 30-100mg+ |

### When to Get Professional Guidance

- Taking medications (especially blood thinners, seizure meds)
- Dealing with serious health conditions
- Needing very high doses (100mg+)
- Not responding to CBD despite adequate trial
- Experiencing persistent side effects

---

## Next Steps

1. **Determine your starting dose** based on weight and goals
2. **Choose your product** ([comparison guide](/articles/how-to-choose-cbd-product))
3. **Set up tracking** ([journal guide](/articles/keep-cbd-journal))
4. **Start low, go slow** and adjust weekly if needed
5. **Evaluate at week 4** and continue optimising

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Dosing guidance is general and not personalised. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'find-your-cbd-dosage',
    title: 'How to Find Your CBD Dosage: Personal Optimisation Guide',
    excerpt: 'Finding your ideal CBD dose is personal. Learn the step-by-step process for discovering what works for your body, including titration, tracking, and adjustment.',
    meta_title: 'How to Find Your CBD Dosage: Personalisation Guide',
    meta_description: 'Discover how to find your optimal CBD dose with our step-by-step personalisation guide. Includes titration protocol, tracking methods, and troubleshooting.',
    reading_time: 10,
    content: `## Quick Answer

**Finding your CBD dosage requires starting low (10-20mg), taking consistently for 5-7 days, tracking your response, then adjusting incrementally until you find the minimum dose that produces your desired effects.** This self-titration process typically takes 2-6 weeks and is the most reliable way to find your personal optimal dose.

---

## Key Takeaways

- **Your optimal dose is unique** to your body and goals
- **Self-titration** is the most reliable method
- **Consistency matters** more than finding the "perfect" dose
- **Track objectively** using ratings, not just feelings
- **Minimum effective dose** is your target—not maximum
- **Patience required**: 2-6 weeks for optimal dosing

---

## Why Doses Vary So Much

### The Individual Variation Problem

Research studies use doses from 10mg to 1,500mg. This huge range exists because:

| Factor | Impact on Dosing |
|--------|-----------------|
| **Genetics** | [Endocannabinoid system](/articles/endocannabinoid-system) function differs |
| **Body composition** | Fat-soluble CBD distributes differently |
| **Metabolism** | Some process CBD faster than others |
| **Existing ECS tone** | Those with deficiency may respond more |
| **Health status** | Severity of concern affects dose needs |

**Bottom line:** No one can tell you exactly what dose you need. You must find it yourself through systematic testing.

---

## The Self-Titration Process

### Phase 1: Establish Baseline (Pre-CBD)

Before taking CBD:

| Task | Purpose |
|------|---------|
| Rate your primary concern (1-10) | Know where you're starting |
| Rate secondary factors (sleep, mood, energy) | Catch additional benefits |
| Document for 2-3 days | Establish consistent baseline |

### Phase 2: Starting Dose (Week 1)

| Step | Action |
|------|--------|
| **1** | Choose starting dose (typically 15-20mg for average adult) |
| **2** | Take at the same time daily |
| **3** | Take with food for better absorption |
| **4** | Track daily using consistent metrics |
| **5** | Don't adjust dose during this week |

### Phase 3: Assessment (End of Week 1)

| Question | If Yes | If No |
|----------|--------|-------|
| Any side effects? | Consider reducing or adjusting | Continue |
| Any noticeable benefits? | Note them, continue dose | Normal—continue |
| Want to continue? | Proceed to week 2 | Reassess approach |

### Phase 4: Incremental Adjustment (Weeks 2-4)

| Week | If No Benefit Yet | If Some Benefit |
|------|-------------------|-----------------|
| **Week 2** | Increase by 5-10mg | Maintain current dose |
| **Week 3** | If needed, increase again | Continue or slight increase |
| **Week 4** | Continue adjusting | Evaluate—found optimal? |

---

## Tracking Your Response

### Essential Metrics to Track

| Metric | How to Track | Why It Matters |
|--------|--------------|----------------|
| **Primary concern** | Daily rating 1-10 | Main goal measurement |
| **Sleep quality** | Rating 1-10 | Common early indicator |
| **Energy level** | Rating 1-10 | Catches drowsiness or boost |
| **Side effects** | Yes/no + description | Safety monitoring |
| **Dose taken** | Exact mg | Know what you took |

### Simple Daily Log

\`\`\`
Date: ___
Dose: ___mg at ___:___
Primary concern before: _/10
Primary concern evening: _/10
Sleep last night: _/10
Energy: _/10
Side effects: ___
Notes: ___
\`\`\`

---

## Finding Your "Sweet Spot"

### Signs You've Found It

| Indicator | What It Looks Like |
|-----------|-------------------|
| **Consistent benefit** | Improvement sustained day to day |
| **No side effects** | Or only minor, acceptable ones |
| **Feels "right"** | Comfortable with your routine |
| **Minimum effective** | Increasing more doesn't add benefit |

### The Minimum Effective Dose Concept

**Goal:** Find the lowest dose that gives you the benefits you want.

**Why not just take more?**
- Higher doses aren't always more effective
- Wastes product and money
- Increases side effect risk
- CBD may have a "[bell curve](/articles/what-is-cbd-isolate)" response for some

### Testing If You're at Minimum Effective

Once you've found a dose that works:

1. Try reducing by 5mg
2. Continue for 5-7 days
3. If benefits maintained → that's your new dose
4. If benefits decrease → return to previous dose

---

## Adjustment Strategies

### When to Increase

| Situation | Action |
|-----------|--------|
| No noticeable effects after 1 week | Increase by 5-10mg |
| Partial benefit, want more | Increase by 5mg |
| Effects fade after initial improvement | Small increase |

### When to Decrease

| Situation | Action |
|-----------|--------|
| Drowsiness or fatigue | Reduce by 5-10mg or take at night |
| Any unwanted side effects | Reduce dose |
| Testing minimum effective | Reduce by 5mg, observe |

### When to Reassess Approach

| Situation | Consider |
|-----------|----------|
| No effects after 4 weeks at decent dose | Different product, spectrum, or method |
| Effects only with very high doses | Product quality, full spectrum switch |
| Unpredictable response | More consistency needed, external factors |

---

## Common Dosing Patterns

### Pattern 1: Low Responder

- Notices effects only at higher doses (50mg+)
- May benefit from [full spectrum](/articles/what-is-full-spectrum-cbd)
- Should verify product quality

### Pattern 2: Sensitive Responder

- Notices effects at low doses (5-15mg)
- May experience side effects at typical doses
- Start very low, increase cautiously

### Pattern 3: Standard Responder

- Comfortable in 20-50mg range
- Clear dose-response relationship
- Most common pattern

### Pattern 4: Non-Responder

- No effects regardless of dose
- May have genetic variation in ECS
- CBD may not be effective for this person

---

## Troubleshooting

### "I Can't Tell If It's Working"

| Solution | How to Implement |
|----------|------------------|
| **Objective tracking** | Use numbers (1-10) daily |
| **Longer trial** | Extend to 6 weeks |
| **Higher dose trial** | Increase incrementally |
| **Ask others** | Do people notice you seem calmer/better? |
| **Take a break** | Stop for 5-7 days, notice any difference |

### "It Worked at First but Stopped"

| Possibility | Solution |
|-------------|----------|
| **Tolerance** | Try a 3-5 day break, then resume |
| **External factors** | Something else changed? |
| **Dose creep needed** | Modest increase |
| **Product batch variation** | Quality issue possible |

### "Effects Are Inconsistent"

| Cause | Solution |
|-------|----------|
| **Taking inconsistently** | Same time daily |
| **Variable food intake** | Always take with food |
| **External stress variation** | Track external factors |
| **Product quality** | Try verified brand |

---

## Dose Journaling Template

### Weekly Summary

\`\`\`
Week: ___ Current dose: ___mg
Average primary concern rating: _/10
Change from last week: ↑↓→
Sleep average: _/10
Energy average: _/10
Side effects: ___
Assessment: [ ] Increase [ ] Maintain [ ] Decrease
Next week's dose: ___mg
\`\`\`

---

## Frequently Asked Questions

### How long until I know my optimal dose?

Most people find their optimal dose within 2-6 weeks of consistent use and adjustment. Some figure it out faster, others need longer. The key is patience and systematic adjustment.

### What if I need different doses for different times?

Some people take a lower dose in the morning (for daytime function) and a higher dose at night (for sleep). This is fine—track each separately.

### Should I start over if I change products?

When switching products, you may need to re-titrate, especially if changing:
- Spectrum type (full to isolate or vice versa)
- Delivery method (oil to gummies)
- Brand (potency may differ)

### Is my dose forever or does it change?

Your optimal dose may shift over time based on:
- Changes in your health status
- Lifestyle changes
- Body weight changes
- Tolerance development
- Product changes

Re-evaluate periodically or if effects change.

---

## Your Personal Dosing Action Plan

**Week 1:** Take ___mg daily (starting dose)
- Track: ☐ Daily ratings ☐ Side effects ☐ Dose/time

**Week 2:** If no benefit, increase to ___mg
- If benefit, maintain at ___mg
- If side effects, adjust to ___mg

**Week 3-4:** Continue adjusting until you find:
- ☐ Consistent benefit
- ☐ No significant side effects
- ☐ Minimum effective dose

**Ongoing:** Monthly check-in
- Is current dose still working?
- Any need to adjust?

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-dosage-by-weight',
    title: 'CBD Dosage by Weight: Body Weight Dosing Guide',
    excerpt: 'Your body weight affects CBD dosing. Learn weight-based dosing guidelines, how to calculate your starting dose, and when weight matters most for CBD effects.',
    meta_title: 'CBD Dosage by Weight: How Much Based on Body Weight',
    meta_description: 'Learn how body weight affects CBD dosing with our weight-based guide. Includes dosage charts, calculation methods, and when weight matters for CBD.',
    reading_time: 8,
    content: `## Quick Answer

**A general guideline is 0.2-0.5mg of CBD per kg of body weight as a starting point.** For example, someone weighing 70kg might start with 14-35mg daily. However, weight is just one factor—individual biology, goals, and product type also significantly influence optimal dosing.

---

## Key Takeaways

- **Weight is a starting point**, not the whole answer
- **General range**: 0.2-0.5mg per kg body weight to start
- **Heavier individuals** may need proportionally more
- **Lighter individuals** should start on the lower end
- **Individual factors** often matter more than weight alone
- **Always titrate** regardless of weight-based starting dose

---

## Weight-Based Dosing Chart

### Starting Dose Guidelines

| Body Weight (kg) | Body Weight (lbs) | Low Range | Standard Range | Higher Range |
|------------------|-------------------|-----------|----------------|--------------|
| 45-55 kg | 100-120 lbs | 10mg | 15mg | 20mg |
| 55-65 kg | 120-145 lbs | 12mg | 18mg | 25mg |
| 65-80 kg | 145-175 lbs | 15mg | 20mg | 30mg |
| 80-95 kg | 175-210 lbs | 18mg | 25mg | 35mg |
| 95-110 kg | 210-240 lbs | 20mg | 30mg | 40mg |
| 110+ kg | 240+ lbs | 25mg | 35mg | 50mg |

### Choosing Your Starting Range

| Use Low Range If | Use Standard Range If | Use Higher Range If |
|------------------|----------------------|---------------------|
| Very sensitive to supplements | Typical sensitivity | Previous CBD experience |
| Starting cautiously | Average starting point | More significant concerns |
| First time with cannabinoids | General wellness goal | Need stronger effects |

---

## The Weight-Dose Calculation

### Simple Formula

**Starting dose (mg) = Body weight (kg) × 0.25**

| Your Weight | Calculation | Starting Dose |
|-------------|-------------|---------------|
| 60 kg | 60 × 0.25 | 15mg |
| 75 kg | 75 × 0.25 | 19mg (round to 20mg) |
| 90 kg | 90 × 0.25 | 22mg (round to 20-25mg) |
| 100 kg | 100 × 0.25 | 25mg |

### Intensity Multipliers

Once you know your baseline, adjust for intensity of need:

| Goal Intensity | Multiplier | Example (75kg person) |
|----------------|------------|----------------------|
| Mild/wellness | ×0.8 | 15mg |
| Moderate | ×1.0 | 20mg |
| Significant | ×1.5 | 30mg |
| Severe | ×2.0+ | 40mg+ |

---

## Why Weight Matters (and When It Doesn't)

### Why Weight Is Relevant

| Factor | Explanation |
|--------|-------------|
| **Distribution volume** | Larger bodies have more tissue for CBD to distribute into |
| **Blood volume** | More blood = more dilution of CBD |
| **Fat tissue** | CBD is fat-soluble; more fat may require more CBD |
| **Metabolic rate** | Often (not always) correlates with body size |

### When Weight Matters Less

| Factor | Impact |
|--------|--------|
| **Individual metabolism** | Fast metabolisers may need more regardless of size |
| **ECS function** | [Endocannabinoid tone](/glossary/endocannabinoid-tone) varies person to person |
| **Severity of concern** | May override weight calculations |
| **Product bioavailability** | Absorption affects effective dose |
| **Sensitivity** | Some people respond at very low doses |

---

## Body Composition Considerations

### Beyond Just Weight

| Body Type | Consideration |
|-----------|---------------|
| **Higher muscle mass** | May need slightly less than pure weight suggests |
| **Higher body fat** | May need slightly more; CBD stores in fat |
| **Very lean** | May respond to lower doses |
| **Average composition** | Standard weight calculations work well |

### Fat-Soluble Nature of CBD

CBD dissolves in fat, which means:
- It distributes into fatty tissues
- Higher body fat may require higher doses
- Taking with fatty food improves absorption regardless of body composition

---

## Special Populations

### Underweight Individuals

| Weight | Recommendation |
|--------|----------------|
| Under 45 kg | Start at 5-10mg |
| Very low body fat | May be very sensitive |
| Frail/elderly | Start very low, monitor closely |

### Overweight/Obese Individuals

| Weight | Recommendation |
|--------|----------------|
| BMI 30+ | May need 25-50% more than standard |
| Very high body fat | Consider bioavailability |
| 120+ kg | May start at 30-40mg |

### Children (If Applicable)

**Note:** CBD use in children should only occur under medical supervision, typically for specific conditions like certain epilepsies. Paediatric dosing is not covered here—consult a healthcare provider.

---

## Adjusting from Your Weight-Based Start

### Titration After Starting

Your weight-based dose is a starting point. From there:

| Week | Action |
|------|--------|
| Week 1 | Take weight-based starting dose |
| Week 2 | If no effect, increase 5-10mg |
| Week 3+ | Continue adjusting until optimal |

### Finding Your True Optimal

Two people of the same weight may have very different optimal doses:

| Person | Weight | Optimal Dose | Why |
|--------|--------|--------------|-----|
| Person A | 70 kg | 20mg | Average responder |
| Person B | 70 kg | 50mg | Low ECS tone, significant concerns |
| Person C | 70 kg | 10mg | Highly sensitive |

---

## Weight-Based Dosing for Different Goals

### By Goal and Weight Range

| Goal | Light (<60kg) | Medium (60-80kg) | Heavy (>80kg) |
|------|---------------|------------------|---------------|
| **General wellness** | 10-15mg | 15-25mg | 20-30mg |
| **Sleep support** | 15-25mg | 25-40mg | 30-50mg |
| **Stress/anxiety** | 10-20mg | 20-35mg | 25-45mg |
| **Discomfort** | 15-25mg | 25-50mg | 35-60mg |

These are starting ranges—always titrate to find your personal optimal.

---

## Practical Application

### Step-by-Step Process

1. **Find your weight category** from the chart above
2. **Choose your intensity level** (low, standard, or higher)
3. **Calculate your starting dose**
4. **Begin with that dose daily** for 5-7 days
5. **Track your response** using consistent metrics
6. **Adjust based on effects**, not just weight

### Example: 75kg Person Starting for Stress

1. Weight category: 65-80 kg
2. Chart suggests: 15-30mg starting range
3. Moderate concern intensity: 20mg starting dose
4. Week 1: Take 20mg daily
5. Week 2: If helpful, continue; if not, increase to 25-30mg
6. Continue until optimal dose found

---

## Frequently Asked Questions

### If I weigh more, do I definitely need more CBD?

Not necessarily. Weight provides a starting estimate, but individual factors can override it. A heavy person might be a sensitive responder and need less than a lighter person who's less responsive.

### Should I adjust my dose if my weight changes?

Significant weight changes (10%+ body weight) might warrant reassessing your dose. If your current dose continues working, there's no need to change it just because you lost or gained weight.

### Why don't CBD products give weight-based instructions?

CBD isn't regulated as a medication, so products can't make dosing claims. The wide variation in individual response also makes precise recommendations difficult.

### Does the weight-based dose change with different products?

The weight calculation gives you a target mg amount. You then need to figure out how much product delivers that amount (e.g., how many drops, gummies, etc.).

### Is weight more important than other factors?

No—weight is ONE factor among many. Someone's endocannabinoid system function, metabolism, sensitivity, and the severity of their concern often matter more than weight alone.

---

## Quick Reference

### Your Weight-Based Starting Dose

Find your weight, choose your intensity:

| Your Weight | Conservative Start | Standard Start | Stronger Start |
|-------------|-------------------|----------------|----------------|
| 50 kg (110 lbs) | 10mg | 13mg | 18mg |
| 60 kg (132 lbs) | 12mg | 15mg | 21mg |
| 70 kg (154 lbs) | 14mg | 18mg | 25mg |
| 80 kg (176 lbs) | 16mg | 20mg | 28mg |
| 90 kg (198 lbs) | 18mg | 23mg | 32mg |
| 100 kg (220 lbs) | 20mg | 25mg | 35mg |
| 110 kg (242 lbs) | 22mg | 28mg | 39mg |

**Remember:** This is just a starting point. Your optimal dose will be discovered through [personal titration](/articles/find-your-cbd-dosage).

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-dosage-for-beginners',
    title: 'CBD Dosage for Beginners: Simple Starting Guide',
    excerpt: 'New to CBD? This beginner-friendly guide simplifies dosing with clear starting recommendations, easy-to-follow rules, and step-by-step instructions.',
    meta_title: 'CBD Dosage for Beginners: Easy Starting Guide',
    meta_description: 'New to CBD and confused about dosing? Our beginner guide makes it simple with clear starting doses, easy rules, and step-by-step instructions.',
    reading_time: 7,
    content: `## Quick Answer

**If you're new to CBD, start with 15-20mg per day, taken with food, at the same time each day.** Give it at least 2 weeks at this dose before deciding if you need more. Most beginners find their comfortable dose somewhere between 10-40mg daily.

---

## Key Takeaways

- **Start simple**: 15-20mg per day is a good beginning
- **Be patient**: Give it 2-4 weeks to evaluate
- **Stay consistent**: Same dose, same time, every day
- **Track simply**: Just note how you feel
- **Increase slowly**: Add 5mg at a time if needed
- **Don't overcomplicate**: Simple approach works best

---

## The Simplest Starting Approach

### Your First 2 Weeks

| Day | What to Do |
|-----|------------|
| **Day 1-7** | Take 15-20mg once daily with food |
| **Day 8-14** | Continue same dose, note how you feel |
| **Day 15** | Assess: is it helping? |

That's it for week one and two. Don't overthink it.

---

## Choosing Your Starting Dose

### Simple Starting Recommendations

| Your Situation | Starting Dose |
|----------------|---------------|
| **Typical adult** | 15-20mg |
| **Smaller body or very cautious** | 10-15mg |
| **Larger body** | 20-25mg |
| **Previously tried CBD** | Where you left off or slightly higher |

### Why These Amounts?

- Low enough to avoid side effects
- High enough to potentially feel something
- Easy numbers to measure and track
- Room to increase if needed

---

## How to Take Your First Dose

### Step by Step

1. **Choose your time** (morning or evening, whatever fits your routine)
2. **Eat something** (CBD absorbs better with food)
3. **Measure your dose** carefully
4. **Take it** (method depends on product)
5. **Note the time** so you can be consistent

### By Product Type

| Product | How to Take |
|---------|-------------|
| **[CBD Oil](/articles/cbd-oil-guide)** | Place under tongue, hold 60 seconds, swallow |
| **[Gummies](/articles/cbd-gummies-guide)** | Chew and swallow |
| **[Capsules](/articles/cbd-capsules-guide)** | Swallow with water |

---

## Simple Rules for Beginners

### The 5 Basic Rules

| Rule | Why |
|------|-----|
| **1. Same dose daily** | Consistency helps you evaluate |
| **2. Same time daily** | Builds habit, easier to remember |
| **3. With food** | Better absorption |
| **4. Wait 2 weeks** | Before changing anything |
| **5. Track minimally** | Just: better, same, or worse? |

### Common Beginner Mistakes

| Mistake | What to Do Instead |
|---------|---------------------|
| Starting too high | Begin with 15-20mg |
| Increasing too fast | Wait 5-7 days minimum |
| Judging too quickly | Give it 2-4 weeks |
| Skipping days | Be consistent |
| Overthinking | Keep it simple |

---

## What to Expect

### First Few Days

| Expectation | Reality |
|-------------|---------|
| **Probably feel** | Little to nothing |
| **Possibly feel** | Subtle relaxation, slight drowsiness |
| **Unlikely to feel** | Dramatic effects |

This is normal. CBD often works subtly and builds over time.

### After 1-2 Weeks

| If You Notice | What It Means |
|---------------|---------------|
| **Sleeping slightly better** | Common early sign |
| **Feeling calmer** | Possible benefit developing |
| **Nothing yet** | Normal—continue, maybe increase |
| **Mild side effect** | Usually temporary, reduce if bothersome |

---

## When and How to Adjust

### When to Increase

After 2 weeks at your starting dose:

| If | Then |
|----|------|
| No noticeable effects | Increase by 5mg |
| Some benefit, want more | Increase by 5mg |
| Working well | Keep same dose |

### How to Increase

1. Add 5mg to your daily dose
2. Continue for another 5-7 days
3. Assess again
4. Repeat if needed

### Maximum Before Reassessing

If you reach 40-50mg with no benefit, consider:
- Is the product quality good?
- Should you try a different product type?
- Maybe CBD isn't right for you (that's okay)

---

## Measuring Your Dose

### With CBD Oil

Most bottles tell you:
- Total CBD in the bottle (e.g., 1000mg)
- CBD per ml or per dropper

**Example calculation:**
- 1000mg bottle, 30ml total
- 1000 ÷ 30 = 33mg per ml
- Half a dropper (0.5ml) = ~16mg

### With Gummies

- Check mg per gummy on label
- 10mg gummy = start with 1-2 gummies
- 25mg gummy = start with 1 gummy

### With Capsules

- Capsules are pre-measured
- Choose a capsule strength close to your starting dose
- 15mg or 25mg capsules are good beginner options

---

## Simple Tracking for Beginners

### The Minimal Approach

Just answer one question each night:

**"How was today compared to before I started CBD?"**

- ☐ Better
- ☐ About the same
- ☐ Worse

That's enough to track when you're starting out.

### If You Want Slightly More Detail

| Daily Quick Check | Your Rating |
|-------------------|-------------|
| Overall feeling | Better / Same / Worse |
| Sleep last night | Better / Same / Worse |
| Stress level | Better / Same / Worse |

---

## Frequently Asked Questions

### What if I forget a dose?

Just take it when you remember, or skip to the next day. Missing one dose isn't a big deal. Try to be more consistent going forward.

### What if I feel drowsy?

This is common at first. Options:
- Take your dose in the evening instead
- Reduce your dose by 5mg
- It often goes away after a few days

### Can I take more if I don't feel anything?

Wait at least 5-7 days at each dose before increasing. Patience is important—CBD often works gradually.

### When should I take it—morning or night?

Either works. Consider:
- **Morning**: Good for daytime stress, focus
- **Evening**: Good for sleep, winding down
- **Split dose**: Half morning, half evening (more complex, not needed for beginners)

### How will I know it's working?

Look for subtle changes over time:
- Sleeping a bit better
- Feeling slightly calmer
- Less bothered by things that usually stress you
- Small improvements you might not notice day-to-day

---

## Quick Start Summary

**Your first 4 weeks:**

| Week | Dose | Action |
|------|------|--------|
| **Week 1** | 15-20mg | Start, be consistent |
| **Week 2** | Same | Continue, observe |
| **Week 3** | Same or +5mg | Adjust if needed |
| **Week 4** | Optimise | Find what works |

**Remember:** Start low, go slow, stay consistent, and don't overthink it.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-dosage-for-sleep',
    title: 'CBD Dosage for Sleep: How Much CBD for Better Rest',
    excerpt: 'Learn the best CBD dosage for sleep support. Covers optimal timing, dose ranges for different sleep issues, product recommendations, and what research shows.',
    meta_title: 'CBD Dosage for Sleep: How Much to Take for Rest',
    meta_description: 'Struggling to sleep? Learn the best CBD dosage for sleep, including timing, dose ranges, and product recommendations. Evidence-based guide to CBD for rest.',
    reading_time: 9,
    content: `## Quick Answer

**For sleep support, most people take 25-75mg of CBD about 30-60 minutes before bed.** Higher doses tend to be more sedating. Start with 25mg and increase by 10mg each week until you find your optimal dose. Full spectrum products and those combined with CBN may be particularly effective for sleep.

---

## Key Takeaways

- **Typical sleep dose**: 25-75mg, higher than daytime doses
- **Timing**: 30-60 minutes before bed
- **Higher = more sedating** for most people
- **Full spectrum** may work better than isolate for sleep
- **Consistency matters**: Take nightly for best results
- **CBN combination**: May enhance sleep effects

---

## How CBD May Help Sleep

### Mechanisms

| Pathway | Effect |
|---------|--------|
| **Anxiety reduction** | Calmer mind, easier to fall asleep |
| **[5-HT1A receptors](/glossary/serotonin-receptors-5ht1a)** | Mood regulation, relaxation |
| **Pain/discomfort reduction** | Removes barriers to sleep |
| **Circadian rhythm** | May help regulate sleep-wake cycles |

### What CBD Doesn't Do

CBD is not a sedative like sleeping pills. It may:
- Help you relax and unwind
- Reduce things that keep you awake (anxiety, discomfort)
- Support natural sleep processes

---

## Dosing for Different Sleep Issues

### Difficulty Falling Asleep

| Severity | Suggested Dose | Timing |
|----------|----------------|--------|
| Mild | 20-30mg | 60 min before bed |
| Moderate | 30-50mg | 45-60 min before bed |
| Significant | 50-75mg | 45-60 min before bed |

### Waking During the Night

| Approach | Suggestion |
|----------|------------|
| **Standard** | 30-50mg before bed |
| **Extended release** | Capsules/softgels may last longer |
| **Split dose** | Half before bed, half if you wake |

### Poor Sleep Quality

| Goal | Approach |
|------|----------|
| **Deeper sleep** | Higher dose (40-60mg) |
| **Consistent routine** | Same time nightly |
| **Full spectrum** | [Entourage effect](/glossary/entourage-effect) may help |

### Anxiety-Related Sleep Problems

| Approach | Suggestion |
|----------|------------|
| **Daytime anxiety dose** | 15-25mg during day |
| **Bedtime dose** | 25-50mg before sleep |
| **Addresses root cause** | Reducing anxiety helps sleep |

---

## Sleep Dose Ranges by Body Weight

| Body Weight | Starting Sleep Dose | Range |
|-------------|--------------------:|------:|
| Under 60 kg | 20mg | 20-50mg |
| 60-80 kg | 25mg | 25-60mg |
| 80-100 kg | 30mg | 30-70mg |
| Over 100 kg | 35mg | 35-80mg |

---

## Timing Your CBD for Sleep

### When to Take It

| Product Type | When to Take |
|--------------|--------------|
| **CBD oil (sublingual)** | 30-45 min before bed |
| **Gummies** | 45-60 min before bed |
| **Capsules** | 60-90 min before bed |

### Why Timing Matters

- **Too early**: Effects may peak before you're ready to sleep
- **Too late**: May not have time to work before bed
- **Optimal**: Gives CBD time to absorb and take effect as you're getting into bed

---

## Best Products for Sleep

### Product Recommendations

| Product Type | Sleep Suitability | Notes |
|--------------|-------------------|-------|
| **CBD oil** | Excellent | Flexible dosing, good absorption |
| **CBD gummies** | Good | Convenient, longer-lasting |
| **CBD capsules** | Good | Precise, extended release possible |
| **CBD + CBN** | Very good | CBN may enhance sedation |

### Spectrum Considerations

| Spectrum | For Sleep |
|----------|-----------|
| **[Full spectrum](/articles/what-is-full-spectrum-cbd)** | Best—contains all compounds including sedating cannabinoids |
| **[Broad spectrum](/articles/what-is-broad-spectrum-cbd)** | Good—multiple cannabinoids, no THC |
| **[Isolate](/articles/what-is-cbd-isolate)** | May work, but missing potential sleep-enhancing compounds |

### Look for These Additions

| Ingredient | Benefit |
|------------|---------|
| **CBN** | May enhance sedation |
| **Melatonin** | Helps with sleep timing |
| **Calming terpenes** | [Myrcene](/articles/what-is-myrcene), [linalool](/articles/what-is-linalool) |
| **Lavender** | Traditional calming herb |

---

## Building a Sleep Routine with CBD

### Optimal Routine

| Time Before Bed | Action |
|-----------------|--------|
| **60-90 min** | Start winding down, dim lights |
| **45-60 min** | Take CBD dose |
| **30 min** | No screens, relaxation activities |
| **15 min** | Get into bed, relaxed state |

### Complementary Practices

| Practice | How It Helps |
|----------|--------------|
| **Consistent sleep time** | Regulates circadian rhythm |
| **Cool bedroom** | Optimal sleep temperature |
| **No caffeine after 2pm** | Removes sleep blocker |
| **Limited alcohol** | Alcohol disrupts sleep quality |
| **Screen reduction** | Blue light affects sleep |

---

## What Research Shows

### Study Findings

| Study | Finding |
|-------|---------|
| **Shannon et al. (2019)** | 66.7% of participants had improved sleep scores in first month |
| **Case series research** | Sleep improvements often noted as secondary benefit |
| **Higher dose studies** | Higher doses (160mg+) shown to increase sleep time in insomnia |

### Research Limitations

- Most studies small-scale
- Variable dosing across studies
- CBD often studied with other cannabinoids
- Individual response varies significantly

---

## Troubleshooting Sleep Dosing

### If CBD Isn't Helping Sleep

| Issue | Solution |
|-------|----------|
| **Dose too low** | Increase by 10mg each week |
| **Wrong timing** | Experiment with 30-90 min before bed |
| **Wrong product** | Try full spectrum or CBD+CBN |
| **Other sleep factors** | Address sleep hygiene |
| **Underlying cause** | May need to address anxiety, pain, etc. |

### If CBD Makes You Alert

Some people experience alertness at lower doses:

| Solution | How |
|----------|-----|
| **Increase dose** | Higher doses are more sedating |
| **Different timing** | Earlier in evening |
| **Split dose** | Small amount earlier, more before bed |

---

## Combining CBD with Other Sleep Aids

### Generally Compatible

| Combination | Notes |
|-------------|-------|
| **CBD + melatonin** | Common combination, may enhance effects |
| **CBD + calming herbs** | Valerian, chamomile, lavender |
| **CBD + magnesium** | May complement each other |

### Use Caution

| Combination | Concern |
|-------------|---------|
| **CBD + prescription sleep meds** | Consult doctor first |
| **CBD + alcohol** | Both can cause drowsiness |
| **CBD + antihistamines** | Increased drowsiness |

---

## Finding Your Sleep Dose: Protocol

### Week-by-Week Approach

| Week | Dose | Assessment |
|------|------|------------|
| **Week 1** | 25mg | Track sleep quality |
| **Week 2** | Same or +10mg | Adjust if no improvement |
| **Week 3** | Optimise timing/dose | Fine-tune |
| **Week 4** | Establish routine | Maintain what works |

### Track These Metrics

| Metric | How to Track |
|--------|--------------|
| **Time to fall asleep** | Estimate in minutes |
| **Night wakings** | Count each morning |
| **Sleep quality** | 1-10 rating |
| **Morning alertness** | 1-10 rating |

---

## Frequently Asked Questions

### Will CBD make me drowsy the next morning?

Usually not at appropriate doses. If you experience morning grogginess, try reducing your dose slightly or taking CBD earlier in the evening.

### Can I take CBD for sleep every night?

Yes. CBD doesn't cause dependence like some sleep medications. Many people use it nightly as part of their sleep routine.

### How long until CBD helps my sleep?

Some people notice improvements within days, but give it at least 2-3 weeks of consistent use before evaluating effectiveness.

### Is higher dose always better for sleep?

Not necessarily. Find your minimum effective dose. Very high doses aren't needed for most people and may not add benefit.

### Can I stop CBD without sleep rebounding?

Yes. CBD doesn't typically cause rebound insomnia when stopped, unlike some sleep medications.

---

## Sleep Dose Quick Reference

| Your Situation | Starting Dose | Range | Timing |
|----------------|---------------|-------|--------|
| **Mild sleep issues** | 20-25mg | 20-40mg | 60 min before |
| **Moderate issues** | 25-35mg | 30-60mg | 45-60 min before |
| **Significant issues** | 35-50mg | 40-75mg | 45-60 min before |
| **Anxiety-related** | 30-40mg | 25-60mg | 60 min before |

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. If you have chronic sleep problems, consult a healthcare provider. CBD is not a replacement for treating underlying sleep disorders.*`
  }
];

async function main() {
  console.log('Inserting Dosing guides (batch 1)...\n');

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

  console.log('\nBatch 1 complete (5/15 Dosing guides).');
}
main();
