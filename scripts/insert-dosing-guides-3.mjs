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
    slug: 'cbd-titration',
    title: 'CBD Titration: How to Adjust Your Dose',
    excerpt: 'Titration is the process of gradually adjusting your CBD dose to find what works. Learn the proper titration method for optimal CBD results.',
    meta_title: 'CBD Titration: Step-by-Step Dose Adjustment Guide',
    meta_description: 'Master CBD titration with our step-by-step guide. Learn how to gradually adjust your dose to find your optimal CBD amount safely and effectively.',
    reading_time: 8,
    content: `## Quick Answer

**CBD titration is the systematic process of adjusting your dose—starting low and gradually increasing until you find the amount that provides benefits without unwanted side effects.** The standard approach is increasing by 5-10mg every 5-7 days while tracking your response. This method helps you find your minimum effective dose safely.

---

## Key Takeaways

- **Titration = gradual adjustment** to find optimal dose
- **Start low**: 10-20mg typically
- **Increase slowly**: 5-10mg at a time
- **Wait between increases**: 5-7 days minimum
- **Track consistently**: Document response at each level
- **Stop at optimal**: When benefits appear without side effects

---

## What Is Titration?

### Definition

Titration (in the CBD context) means systematically adjusting your dose to find what works best for you.

| Concept | Meaning |
|---------|---------|
| **Upward titration** | Gradually increasing dose |
| **Downward titration** | Gradually decreasing dose |
| **Optimal dose** | Where benefits meet minimal side effects |
| **Minimum effective dose** | Lowest amount that provides benefits |

### Why Titration Matters

| Benefit | Explanation |
|---------|-------------|
| **Safety** | Avoids potential side effects from starting too high |
| **Efficiency** | Finds minimum effective dose (saves money) |
| **Personalisation** | Discovers YOUR optimal amount |
| **Data-driven** | Decisions based on tracked response |

---

## The Standard Titration Protocol

### Week-by-Week Guide

| Week | Action | Track |
|------|--------|-------|
| **Week 1** | Start at 15-20mg daily | Baseline response |
| **Week 2** | If no benefit, increase to 25-30mg | Changes from week 1 |
| **Week 3** | If still no benefit, increase to 35-40mg | Changes from week 2 |
| **Week 4** | Continue pattern or stabilise | Identify optimal |
| **Week 5+** | Fine-tune and maintain | Long-term consistency |

### Titration Rules

| Rule | Explanation |
|------|-------------|
| **One change at a time** | Only adjust dose, nothing else |
| **Wait adequate time** | 5-7 days minimum between changes |
| **Small increments** | 5-10mg increases |
| **Track consistently** | Same metrics daily |
| **Stop when optimal** | Don't keep increasing past effective |

---

## Upward Titration (Most Common)

### When to Increase

| Sign | Action |
|------|--------|
| **No noticeable effects** | Increase by 5-10mg |
| **Partial benefit** | May increase slightly |
| **Effects wore off mid-day** | Consider split dosing or slight increase |

### How to Increase

| Step | Detail |
|------|--------|
| **1** | Wait at least 5-7 days at current dose |
| **2** | Increase by 5-10mg |
| **3** | Maintain new dose for 5-7 days |
| **4** | Assess and repeat if needed |

### When to Stop Increasing

| Sign | What It Means |
|------|---------------|
| **Benefits achieved** | You've found your dose |
| **Side effects appear** | Go back to previous dose |
| **Very high without benefit** | Reassess approach |

---

## Downward Titration

### When to Decrease

| Situation | Action |
|-----------|--------|
| **Side effects** | Reduce by 5-10mg |
| **Finding minimum effective** | Test if lower dose still works |
| **Benefits achieved at lower level** | Maintain lower amount |
| **Cost concerns** | See if less still works |

### How to Decrease

| Step | Detail |
|------|--------|
| **1** | Reduce by 5mg |
| **2** | Maintain for 5-7 days |
| **3** | Assess: benefits still present? |
| **4** | If benefits remain, continue at lower dose |
| **5** | If benefits decrease, return to previous dose |

---

## Titration by Goal

### For General Wellness

| Week | Dose | Focus |
|------|------|-------|
| 1 | 10-15mg | Establish baseline |
| 2 | 15-20mg | Slight increase if needed |
| 3-4 | 20-25mg | Likely optimal range |

### For Sleep

| Week | Dose | Focus |
|------|------|-------|
| 1 | 20-25mg | Start slightly higher |
| 2 | 30-40mg | Increase for sleep needs |
| 3-4 | 40-60mg | Higher often needed for sleep |

### For Anxiety

| Week | Dose | Focus |
|------|------|-------|
| 1 | 15-20mg | Conservative start |
| 2 | 25-35mg | Increase based on response |
| 3-4 | 35-50mg | Find optimal anti-anxiety dose |

### For Pain

| Week | Dose | Focus |
|------|------|-------|
| 1 | 25-30mg | Start slightly higher |
| 2 | 40-50mg | Pain often needs more |
| 3-4 | 50-70mg+ | Continue until relief |

---

## Tracking During Titration

### What to Track

| Metric | How to Record |
|--------|---------------|
| **Current dose** | Exact mg |
| **Primary goal rating** | 1-10 daily |
| **Side effects** | Yes/no, description |
| **Sleep quality** | 1-10 |
| **Energy level** | 1-10 |
| **Notable observations** | Any changes |

### Titration Tracking Template

\`\`\`
Week: ___ | Current dose: ___mg

Day 1: Goal: _/10, Side effects: ___
Day 2: Goal: _/10, Side effects: ___
Day 3: Goal: _/10, Side effects: ___
Day 4: Goal: _/10, Side effects: ___
Day 5: Goal: _/10, Side effects: ___
Day 6: Goal: _/10, Side effects: ___
Day 7: Goal: _/10, Side effects: ___

Weekly average: _/10
Decision: [ ] Increase [ ] Maintain [ ] Decrease
Next week's dose: ___mg
\`\`\`

---

## Titration Mistakes to Avoid

### Common Errors

| Mistake | Problem | Solution |
|---------|---------|----------|
| **Increasing too fast** | Miss optimal, risk side effects | Wait 5-7 days |
| **Big jumps in dose** | Overshoot optimal | Increase by 5-10mg only |
| **Not tracking** | Can't assess objectively | Daily simple tracking |
| **Changing other variables** | Confuses results | Only adjust CBD dose |
| **Giving up too soon** | May miss effectiveness | Give it 4-6 weeks |
| **Ignoring side effects** | Discomfort | Reduce dose |

---

## Advanced Titration Considerations

### Split Dosing Titration

If effects don't last all day:

| Current | Adjustment |
|---------|------------|
| 30mg once daily | Try 15mg twice daily |
| 40mg once daily | Try 20mg twice daily |

### Time-of-Day Titration

| Goal | Timing Adjustment |
|------|-------------------|
| Daytime function | Move dose to morning |
| Sleep | Move dose to evening |
| All-day coverage | Split AM/PM |

### Product Change Titration

If switching products, re-titrate:

| Change | Action |
|--------|--------|
| **New brand** | Start at current dose, monitor |
| **New spectrum** | May need dose adjustment |
| **New delivery method** | Recalibrate (bioavailability differs) |

---

## Frequently Asked Questions

### How long should the titration process take?

Typically 4-8 weeks to find your optimal dose. Some people find it quickly (2-3 weeks), others need longer. Don't rush the process.

### What if I never find a dose that works?

After 8 weeks of systematic titration up to 100mg+ without benefit:
- Verify product quality
- Try different spectrum (full vs. isolate)
- Try different delivery method
- Accept that CBD may not work for you

### Can I titrate faster if I'm impatient?

Not recommended. The 5-7 day waiting period allows your body to adjust and reveals true effects at each dose level. Faster titration may cause you to overshoot your optimal dose.

### Should I titrate with each new product?

If staying with the same brand and spectrum, you can usually start at your established dose. If changing brands, spectrum, or delivery method, some re-titration may be needed.

---

## Titration Quick Reference

| Phase | Duration | Action |
|-------|----------|--------|
| **Week 1** | 7 days | Start at baseline dose |
| **Week 2-4** | 2-3 weeks | Adjust by 5-10mg weekly |
| **Week 5+** | Ongoing | Stabilise at optimal dose |

**The goal:** Find your minimum effective dose through patient, systematic adjustment.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'when-to-increase-cbd-dose',
    title: 'When to Increase Your CBD Dose: Signs and Guidelines',
    excerpt: 'Not getting results from CBD? Learn when and how to increase your dose, including signs it\'s time to go higher, safe increase guidelines, and what to expect.',
    meta_title: 'When to Increase CBD Dose: Signs You Need More',
    meta_description: 'Not feeling CBD effects? Learn the signs that indicate you should increase your dose, how to do it safely, and what to expect after adjustment.',
    reading_time: 7,
    content: `## Quick Answer

**Increase your CBD dose if you've taken a consistent amount for at least 7 days without noticeable benefit and aren't experiencing side effects.** Increase by 5-10mg, maintain the new dose for another 5-7 days, and assess. Repeat until you find relief or reach a dose where further increases don't add benefit.

---

## Key Takeaways

- **Wait 7+ days** at current dose before increasing
- **No benefit + no side effects** = try higher dose
- **Increase by 5-10mg** increments
- **Reassess at each level** before increasing again
- **Stop increasing** when benefits appear
- **Consult a professional** if needing very high doses

---

## Signs You May Need to Increase

### Clear Indicators

| Sign | What It Means |
|------|---------------|
| **No noticeable effects** | Dose may be too low |
| **Partial benefit only** | May need slightly more |
| **Effects wear off early** | Dose or timing adjustment needed |
| **Originally effective, now less so** | Possible tolerance |
| **No side effects at current dose** | Room to go higher safely |

### Questions to Ask Yourself

Before increasing, confirm:

| Question | Required Answer |
|----------|-----------------|
| Have I been consistent for 7+ days? | Yes |
| Am I taking it with food? | Yes |
| Am I using a quality product? | Yes |
| Am I experiencing side effects? | No |
| Have I given it adequate time? | Yes (2-4 weeks minimum) |

---

## When NOT to Increase

### Hold Your Current Dose If

| Situation | Why |
|-----------|-----|
| **Less than 7 days at current dose** | Not enough time to assess |
| **Experiencing side effects** | Address these first |
| **Haven't tried other adjustments** | Timing, food, etc. |
| **Benefits are present** | Don't fix what's working |
| **At very high doses already** | Seek professional guidance |

### Consider Other Adjustments First

| Instead of Increasing | Try |
|-----------------------|-----|
| **Different timing** | Morning vs. evening, split doses |
| **With fatty food** | Improves absorption significantly |
| **Different product** | Quality issue possible |
| **Different spectrum** | [Full spectrum](/articles/what-is-full-spectrum-cbd) may be more effective |

---

## How to Increase Safely

### Step-by-Step Guide

| Step | Action |
|------|--------|
| **1** | Confirm you've met criteria above |
| **2** | Increase by 5-10mg (not more) |
| **3** | Maintain new dose for 5-7 days |
| **4** | Track response daily |
| **5** | Assess: continue, increase more, or stabilise |

### Increase Amount Guidelines

| Current Dose | Suggested Increase |
|--------------|-------------------|
| Under 20mg | +5mg |
| 20-40mg | +5-10mg |
| 40-60mg | +10mg |
| 60-80mg | +10mg |
| 80mg+ | Consult healthcare provider |

---

## What to Expect After Increasing

### Possible Outcomes

| Outcome | What It Means | Next Step |
|---------|---------------|-----------|
| **Benefits appear** | Found effective dose | Maintain |
| **Some improvement** | Getting closer | May increase slightly more |
| **No change** | May need more time or more increase | Wait 7 days, reassess |
| **Side effects** | Dose too high | Return to previous dose |

### Common Side Effects at Higher Doses

| Side Effect | Severity | Action |
|-------------|----------|--------|
| **Drowsiness** | Mild-moderate | Reduce dose or take at night |
| **Digestive changes** | Mild | Take with food, reduce dose |
| **Dry mouth** | Mild | Stay hydrated |

---

## Tracking Your Dose Increase

### Before and After Template

\`\`\`
BEFORE INCREASE
Previous dose: ___mg for ___ days
Primary concern rating: _/10
Side effects: ___

AFTER INCREASE
New dose: ___mg
Day 1: _/10, Side effects: ___
Day 2: _/10, Side effects: ___
Day 3: _/10, Side effects: ___
Day 4: _/10, Side effects: ___
Day 5: _/10, Side effects: ___
Day 6: _/10, Side effects: ___
Day 7: _/10, Side effects: ___

ASSESSMENT
Average rating: _/10
Change from before: Better / Same / Worse
Decision: Maintain / Increase more / Decrease
\`\`\`

---

## Ceiling Dose: When to Stop Increasing

### Signs You've Reached Your Ceiling

| Sign | Meaning |
|------|---------|
| **Benefits achieved** | You've found your dose |
| **No additional benefit at higher doses** | Optimal already found |
| **Side effects appear** | Previous dose was your limit |
| **Reached 100mg+ without benefit** | Reassess approach |

### What Is a "High" Dose?

| Dose Level | Consideration |
|------------|---------------|
| Under 50mg | Standard range |
| 50-100mg | Higher but common for significant concerns |
| 100-200mg | High—work with healthcare provider |
| 200mg+ | Very high—professional guidance essential |

---

## If Increasing Still Doesn't Work

### Next Steps

| If | Then |
|----|------|
| **4-6 weeks, up to 50-75mg, no benefit** | Try different product/brand |
| **Tried multiple products** | Try different spectrum |
| **Tried full spectrum** | CBD may not work for you |
| **Very high doses needed** | Consult healthcare provider |

### Alternative Approaches

- Try sublingual vs. oral
- Add topical for localised concerns
- Combine with [CBN](/articles/what-is-cbn) for sleep
- Ensure product quality (third-party testing)

---

## Frequently Asked Questions

### How high can I safely increase my CBD dose?

There's no established toxic dose, but most people find effective doses between 20-100mg. Doses above 100mg should be discussed with a healthcare provider, especially if you take medications.

### I increased my dose but feel worse—what happened?

Some people experience paradoxical effects at higher doses. Return to your previous dose. You may have already passed your optimal dose, or the timing/product may need adjustment.

### My previous dose worked but now doesn't—should I increase?

Possibly. This could be tolerance developing. Options: try a 2-3 day break before increasing, or make a small increase. If breaks restore effectiveness, that's preferable to continually increasing.

### How often can I increase my dose?

Wait at least 5-7 days between increases. More frequent changes don't give your body time to adjust and make it hard to assess what's actually working.

---

## Increase Decision Flowchart

\`\`\`
Been at current dose 7+ days?
├── NO → Wait longer
└── YES → Any side effects?
    ├── YES → Address side effects first
    └── NO → Any benefits?
        ├── YES → Consider maintaining
        └── NO → Increase by 5-10mg
            └── Track for 7 days
                └── Reassess and repeat
\`\`\`

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using higher CBD doses, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'when-to-decrease-cbd-dose',
    title: 'When to Decrease Your CBD Dose: Signs and Guidelines',
    excerpt: 'Sometimes less is more with CBD. Learn when to reduce your dose, how to decrease safely, and signs that a lower amount might work better for you.',
    meta_title: 'When to Decrease CBD Dose: Signs You Need Less',
    meta_description: 'Taking too much CBD? Learn the signs you should decrease your dose, how to reduce safely, and why finding your minimum effective dose matters.',
    reading_time: 6,
    content: `## Quick Answer

**Decrease your CBD dose if you're experiencing side effects (drowsiness, digestive issues), if you want to test whether a lower amount works equally well, or if your initial concerns have improved significantly.** Reduce by 5-10mg at a time, wait 5-7 days, and assess whether benefits remain.

---

## Key Takeaways

- **Side effects** are the primary reason to decrease
- **Minimum effective dose** saves money and is optimal
- **Decrease by 5-10mg** at a time
- **Wait 5-7 days** before further reduction
- **Benefits may remain** at lower doses
- **Return to higher dose** if benefits diminish

---

## Signs You Should Decrease

### Clear Indicators to Reduce

| Sign | What It Means |
|------|---------------|
| **Drowsiness/fatigue** | Dose may be too high |
| **Digestive upset** | Body may want less |
| **Dry mouth (bothersome)** | Common at higher doses |
| **Feeling "too mellow"** | Effects too strong |
| **Spending more than needed** | Test lower dose |

### Questions to Ask

| Question | If Yes |
|----------|--------|
| Am I experiencing unwanted side effects? | Consider decreasing |
| Have my original concerns improved? | Test lower dose |
| Am I using more than typical ranges? | Worth trying less |
| Do I feel over-medicated? | Reduce dose |

---

## Benefits of Finding Lower Effective Dose

### Why Less Can Be Better

| Benefit | Explanation |
|---------|-------------|
| **Cost savings** | Less product needed |
| **Fewer side effects** | Lower doses = less drowsiness |
| **Better daytime function** | Less sedation |
| **More sustainable** | Easier to maintain long-term |
| **Optimal response** | Some research shows CBD has "sweet spot" |

---

## How to Decrease Safely

### Step-by-Step Reduction

| Step | Action |
|------|--------|
| **1** | Reduce current dose by 5-10mg |
| **2** | Maintain new (lower) dose for 5-7 days |
| **3** | Track: Do benefits remain? |
| **4** | If benefits remain, consider reducing again |
| **5** | If benefits decrease, return to previous dose |

### Reduction Amount Guide

| Current Dose | Reduction Amount |
|--------------|-----------------|
| Under 30mg | -5mg |
| 30-50mg | -5 to 10mg |
| 50-80mg | -10mg |
| 80mg+ | -10 to 15mg |

---

## What to Monitor When Decreasing

### Track These Metrics

| Metric | What to Watch |
|--------|---------------|
| **Primary concern** | Does it return or stay improved? |
| **Side effects** | Should decrease or resolve |
| **Sleep quality** | May change with dose |
| **Energy levels** | Should improve if drowsy before |
| **Overall wellbeing** | Maintain or improve |

### Tracking Template

\`\`\`
BEFORE DECREASE
Previous dose: ___mg
Primary concern: _/10
Side effects: ___

AFTER DECREASE
New dose: ___mg
Day 1-7: Primary concern ratings: _,_,_,_,_,_,_
Side effects resolved? Y/N
Benefits maintained? Y/N

DECISION
[ ] Continue at lower dose
[ ] Return to higher dose
[ ] Try reducing more
\`\`\`

---

## When NOT to Decrease

### Maintain Current Dose If

| Situation | Why |
|-----------|-----|
| **Current dose working well** | Don't fix what works |
| **No side effects** | No reason to change |
| **Just started** | Not enough data yet |
| **Recently increased** | Give it time first |

---

## Scenarios for Decreasing

### Scenario 1: Side Effects

**Situation:** 50mg causes drowsiness

| Action | Detail |
|--------|--------|
| **Reduce to** | 40mg |
| **Wait** | 5-7 days |
| **Assess** | Drowsiness better? Benefits remain? |
| **If still drowsy** | Reduce to 30mg |

### Scenario 2: Testing Minimum Effective

**Situation:** 40mg works, want to test if less works

| Action | Detail |
|--------|--------|
| **Reduce to** | 30mg |
| **Wait** | 7 days |
| **Assess** | Benefits same? |
| **If benefits remain** | 30mg is your new dose |
| **If benefits decrease** | Return to 40mg |

### Scenario 3: Improved Condition

**Situation:** Initial concerns have significantly improved

| Action | Detail |
|--------|--------|
| **Gradually reduce** | 5mg at a time |
| **Find maintenance dose** | Lower than initial therapeutic dose |
| **Monitor** | Ensure improvements maintained |

---

## Frequently Asked Questions

### Will reducing my dose make benefits go away?

Not necessarily. Many people find their minimum effective dose is lower than what they initially titrated to. You may maintain full benefits at a lower dose.

### How low can I go?

Some people maintain benefits at surprisingly low doses (10-15mg). Test gradually to find your minimum. If benefits disappear, simply return to the previous dose.

### Should I decrease slowly or all at once?

Gradual reduction (5-10mg at a time) is recommended. This helps you identify exactly where your minimum effective dose lies.

### What if I decreased too much?

Simply return to the previous dose that was working. There's no harm in this experimentation—it helps you find your optimal amount.

### Can I decrease some days but not others?

Consistency is generally better. Variable dosing makes it hard to assess what's working. Find your consistent effective dose.

---

## Decrease Decision Flowchart

\`\`\`
Experiencing side effects?
├── YES → Decrease by 5-10mg
│   └── Wait 5-7 days
│       └── Side effects resolved?
│           ├── YES → Benefits maintained?
│           │   ├── YES → New dose established
│           │   └── NO → Return to previous dose
│           └── NO → Decrease more or stop
└── NO → Want to find minimum effective?
    ├── YES → Decrease by 5mg
    │   └── Benefits maintained?
    │       ├── YES → Try decreasing more
    │       └── NO → Previous dose was optimal
    └── NO → Maintain current dose
\`\`\`

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional about CBD dosing, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-mg-ml-calculator-guide',
    title: 'CBD mg/ml Calculator Guide: How to Calculate Your Dose',
    excerpt: 'Learn how to calculate CBD dosage from your bottle\'s mg/ml concentration. Includes formulas, examples, and tips for measuring accurate doses.',
    meta_title: 'CBD mg/ml Calculator: How to Figure Out Your Dose',
    meta_description: 'Confused by CBD oil measurements? Learn how to calculate your dose using mg/ml, including easy formulas, dropper measurements, and practical examples.',
    reading_time: 7,
    content: `## Quick Answer

**To calculate your CBD dose: divide your bottle's total CBD (mg) by the total volume (ml) to get mg/ml, then multiply by how much you take.** For example, a 1000mg/30ml bottle = 33.3mg/ml. If you take 0.5ml (half dropper), that's 33.3 × 0.5 = 16.7mg CBD.

---

## Key Takeaways

- **mg/ml** tells you CBD concentration (potency)
- **Formula**: Total mg ÷ Total ml = mg per ml
- **Standard dropper** = approximately 1ml when full
- **Know your dropper size** for accurate dosing
- **Higher mg/ml** = fewer drops needed
- **Calculate ONCE** per bottle, then use that number

---

## Understanding CBD Measurements

### What the Numbers Mean

| Term | Meaning | Example |
|------|---------|---------|
| **Total mg** | CBD in entire bottle | 1000mg |
| **Total ml** | Volume of bottle | 30ml |
| **mg/ml** | CBD per millilitre | 33.3mg/ml |
| **mg per serving** | CBD per dose | Varies |

### Common Bottle Sizes

| Bottle Size | Common in |
|-------------|-----------|
| **10ml** | EU, travel sizes |
| **15ml** | Mid-size |
| **30ml** | Most common |
| **60ml** | Larger/value bottles |

---

## The Basic Formula

### Step-by-Step Calculation

**Step 1:** Find your bottle's total mg and ml
**Step 2:** Divide mg by ml
**Step 3:** Result = mg per ml

\`\`\`
mg/ml = Total CBD (mg) ÷ Total Volume (ml)
\`\`\`

### Example Calculations

| Bottle | Total mg | Total ml | Calculation | mg/ml |
|--------|----------|----------|-------------|-------|
| A | 500mg | 30ml | 500÷30 | 16.7mg/ml |
| B | 1000mg | 30ml | 1000÷30 | 33.3mg/ml |
| C | 1500mg | 30ml | 1500÷30 | 50mg/ml |
| D | 1000mg | 10ml | 1000÷10 | 100mg/ml |

---

## Calculating Your Dose

### From mg/ml to Actual Dose

Once you know mg/ml, calculate how much CBD you're taking:

\`\`\`
Your dose (mg) = mg/ml × Amount taken (ml)
\`\`\`

### Example: Finding Your Dose

**Bottle:** 1000mg/30ml = 33.3mg/ml

| You Take | Calculation | Your Dose |
|----------|-------------|-----------|
| Full dropper (1ml) | 33.3 × 1 | 33.3mg |
| Half dropper (0.5ml) | 33.3 × 0.5 | 16.7mg |
| Quarter dropper (0.25ml) | 33.3 × 0.25 | 8.3mg |

---

## Working Backwards: Desired Dose to Volume

### When You Know How Much mg You Want

\`\`\`
Volume needed (ml) = Desired dose (mg) ÷ mg/ml
\`\`\`

### Example: Getting 20mg

**Bottle:** 1000mg/30ml = 33.3mg/ml
**Desired dose:** 20mg

\`\`\`
Volume = 20 ÷ 33.3 = 0.6ml (slightly more than half dropper)
\`\`\`

---

## Understanding Droppers

### Standard Dropper Facts

| Fact | Detail |
|------|--------|
| **Full dropper** | Usually ~1ml (check your product) |
| **Drops per ml** | Approximately 20-25 drops |
| **Half dropper** | ~0.5ml |
| **Markings** | Many droppers have ml markings |

### Dropper Variation

**Important:** Dropper sizes can vary by product. Check if your dropper has markings or states its volume.

| Dropper Type | Typical Volume |
|--------------|----------------|
| Standard glass dropper | 1ml |
| Some European products | 0.5ml or 1ml |
| Spray bottles | Per spray varies |

---

## Quick Reference Charts

### Common Bottle Concentrations

| Bottle | mg/ml | Full Dropper | Half Dropper |
|--------|-------|--------------|--------------|
| 300mg/30ml | 10mg/ml | 10mg | 5mg |
| 500mg/30ml | 16.7mg/ml | 16.7mg | 8.3mg |
| 750mg/30ml | 25mg/ml | 25mg | 12.5mg |
| 1000mg/30ml | 33.3mg/ml | 33.3mg | 16.7mg |
| 1500mg/30ml | 50mg/ml | 50mg | 25mg |
| 2000mg/30ml | 66.7mg/ml | 66.7mg | 33.3mg |
| 3000mg/30ml | 100mg/ml | 100mg | 50mg |

### 10ml Bottles

| Bottle | mg/ml | Full Dropper | Half Dropper |
|--------|-------|--------------|--------------|
| 500mg/10ml | 50mg/ml | 50mg | 25mg |
| 1000mg/10ml | 100mg/ml | 100mg | 50mg |

---

## Practical Tips

### Making Dosing Easier

| Tip | How It Helps |
|-----|--------------|
| **Calculate once** | Do math once per new bottle |
| **Write it down** | Stick label on bottle with mg/ml |
| **Use a calculator** | No mental math errors |
| **Count drops** | More precise than eyeballing |
| **Get marked dropper** | Visual ml markings help |

### Common Mistakes

| Mistake | Solution |
|---------|----------|
| **Confusing mg with ml** | mg = CBD amount, ml = volume |
| **Assuming all droppers are same** | Check your specific dropper |
| **Not accounting for concentration** | Higher mg bottles need less volume |
| **Guessing volumes** | Use markings or count drops |

---

## Special Situations

### If Your Bottle Lists "mg per serving"

Some labels state mg per serving (e.g., "25mg per dropper"):

| What Label Says | What It Means |
|-----------------|---------------|
| "25mg per serving" | Full dropper = 25mg |
| "1 serving = 1ml" | 1ml gives you stated mg |

You can still calculate mg/ml for flexibility:
\`\`\`
If 25mg per 1ml dropper, mg/ml = 25
\`\`\`

### Spray Bottles

| Information Needed | How to Find |
|-------------------|-------------|
| **mg per spray** | Usually on label |
| **Sprays per bottle** | Count or check label |

Example: 500mg bottle, 100 sprays = 5mg per spray

---

## Frequently Asked Questions

### What if my bottle doesn't show ml?

Most CBD bottles are 30ml or 10ml. Check the packaging or manufacturer website. If unlabeled and unknown, contact the company.

### Is a dropper always 1ml?

Usually, but not always. Check for markings on your dropper or product information. When in doubt, assume ~1ml for a full glass dropper.

### How many drops equal 1ml?

Approximately 20-25 drops, but this varies by oil thickness and dropper size. For precision, use ml markings when possible.

### Why do some bottles seem stronger?

Higher mg with same ml = more concentrated. A 3000mg/30ml bottle is much more potent per drop than a 500mg/30ml bottle.

### Does this apply to gummies and capsules?

No—gummies and capsules state mg per unit (e.g., "25mg per gummy"). This calculation is for oils/tinctures only.

---

## Your Calculation Worksheet

Fill this out for your bottle:

**My bottle:**
- Total CBD: _____mg
- Total volume: _____ml
- mg/ml calculation: _____ ÷ _____ = _____mg/ml

**My dose:**
- Desired dose: _____mg
- Volume needed: _____ ÷ _____ = _____ml
- That equals: _____ (full/half/quarter dropper or drops)

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  },
  {
    slug: 'cbd-percentage-to-mg-conversion',
    title: 'CBD Percentage to mg Conversion: Understanding Potency',
    excerpt: 'CBD products list potency as percentages or mg. Learn how to convert between them, understand what the numbers mean, and compare products accurately.',
    meta_title: 'CBD Percentage to mg Conversion Guide',
    meta_description: 'Confused by CBD percentage vs. mg? Learn how to convert between them, understand potency labels, and compare products accurately with our simple guide.',
    reading_time: 6,
    content: `## Quick Answer

**To convert CBD percentage to mg: multiply the percentage by the volume in ml, then multiply by 10.** For example, a 5% CBD oil in a 10ml bottle = 5 × 10 × 10 = 500mg total CBD. Conversely, to find percentage from mg: divide total mg by (volume × 10).

---

## Key Takeaways

- **Percentage** and **mg** both describe potency—just different formats
- **Formula**: % × ml × 10 = total mg
- **European products** often use percentages
- **UK/US products** typically use mg
- **Higher percentage** = more potent = fewer drops needed
- **Compare by mg/ml** for accuracy

---

## Understanding the Two Systems

### Percentage System

| What It Means | Example |
|---------------|---------|
| % of CBD by weight | "5% CBD oil" |
| Common in | Europe, especially |
| Range | Typically 2-30% |

### Milligram System

| What It Means | Example |
|---------------|---------|
| Total mg of CBD in bottle | "1000mg CBD" |
| Common in | UK, US |
| Requires knowing | Bottle volume |

---

## The Conversion Formula

### Percentage to mg

\`\`\`
Total mg = Percentage × Volume (ml) × 10
\`\`\`

**Why × 10?**
1% of 1ml = 0.01ml = 10mg (approximately, as CBD oil density ≈ 1g/ml)

### mg to Percentage

\`\`\`
Percentage = Total mg ÷ (Volume × 10)
\`\`\`

---

## Conversion Examples

### Percentage → mg

| Percentage | Bottle Size | Calculation | Total mg |
|------------|-------------|-------------|----------|
| 5% | 10ml | 5 × 10 × 10 | 500mg |
| 10% | 10ml | 10 × 10 × 10 | 1000mg |
| 5% | 30ml | 5 × 30 × 10 | 1500mg |
| 10% | 30ml | 10 × 30 × 10 | 3000mg |
| 15% | 10ml | 15 × 10 × 10 | 1500mg |
| 20% | 10ml | 20 × 10 × 10 | 2000mg |

### mg → Percentage

| Total mg | Bottle Size | Calculation | Percentage |
|----------|-------------|-------------|------------|
| 500mg | 10ml | 500 ÷ (10 × 10) | 5% |
| 1000mg | 30ml | 1000 ÷ (30 × 10) | 3.3% |
| 1500mg | 30ml | 1500 ÷ (30 × 10) | 5% |
| 3000mg | 30ml | 3000 ÷ (30 × 10) | 10% |

---

## Quick Reference Chart

### Common Equivalents

| 10ml Bottle | 30ml Bottle | Percentage | mg/ml |
|-------------|-------------|------------|-------|
| 250mg | 750mg | 2.5% | 25mg/ml |
| 500mg | 1500mg | 5% | 50mg/ml |
| 1000mg | 3000mg | 10% | 100mg/ml |
| 1500mg | 4500mg | 15% | 150mg/ml |
| 2000mg | 6000mg | 20% | 200mg/ml |
| 2500mg | 7500mg | 25% | 250mg/ml |

---

## Comparing Products

### When Comparing Different Brands

To accurately compare:

| Product A | Product B | Fair Comparison |
|-----------|-----------|-----------------|
| 10% / 10ml | 3000mg / 30ml | Both = 10% or 100mg/ml |
| 5% / 30ml | 1500mg / 30ml | Same product |
| 10% / 10ml | 500mg / 10ml | A is stronger (10% vs 5%) |

### The mg/ml Method

Most accurate way to compare:

\`\`\`
mg/ml = Total mg ÷ Total ml
OR
mg/ml = Percentage × 10
\`\`\`

| Product | Label | mg/ml | Comparison |
|---------|-------|-------|------------|
| A | 10%, 10ml | 100mg/ml | Strongest |
| B | 1000mg, 30ml | 33mg/ml | Weakest |
| C | 5%, 30ml | 50mg/ml | Middle |

---

## Practical Application

### Finding Your Dose from Percentage

**If you take 20mg and have a 5% (10ml) oil:**

1. 5% × 10 = 50mg/ml
2. 20mg ÷ 50mg/ml = 0.4ml needed
3. 0.4ml ≈ just under half a dropper

### Comparing Price per mg

| Product | Price | Total mg | Price per mg |
|---------|-------|----------|--------------|
| 10% / 10ml | €50 | 1000mg | €0.05/mg |
| 5% / 30ml | €60 | 1500mg | €0.04/mg |
| 3000mg / 30ml | €80 | 3000mg | €0.027/mg |

**Higher mg products often offer better value per mg.**

---

## Common Percentage Ranges

### What Percentages Mean

| Percentage | Strength | Typical Use |
|------------|----------|-------------|
| 2-3% | Low | Beginners, mild needs |
| 5-10% | Medium | Most common, general use |
| 15-20% | High | Significant needs |
| 25-30%+ | Very high | Experienced users, specific needs |

---

## Frequently Asked Questions

### Why do European and UK/US labels differ?

European regulations and traditions often use percentage labeling, while UK/US markets traditionally use mg. Neither is better—they're just different conventions.

### Is 10% oil the same as 1000mg in 10ml?

Yes, exactly. 10% in a 10ml bottle = 10 × 10 × 10 = 1000mg.

### Which is more accurate for dosing?

Both are accurate if you do the math. mg is often easier because you can calculate exact doses. Percentage requires converting to mg/ml first.

### Does a higher percentage mean better quality?

No. Percentage indicates concentration, not quality. A lower percentage from a quality brand may be better than a high percentage from a poor one.

### How do I know what percentage I need?

Start with lower concentrations (5-10%) as they're easier to dose precisely. Move to higher percentages once you know your optimal mg dose—you'll use less oil.

---

## Conversion Worksheet

**Convert your product:**

If you have a percentage:
- Percentage: _____%
- Bottle size: _____ml
- Calculation: _____ × _____ × 10 = _____mg total
- mg/ml: _____ × 10 = _____mg/ml

If you have mg:
- Total mg: _____mg
- Bottle size: _____ml
- mg/ml: _____ ÷ _____ = _____mg/ml
- Percentage: _____ ÷ 10 = _____%

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have health conditions or take medications.*`
  }
];

async function main() {
  console.log('Inserting Dosing guides (batch 3 - final)...\n');

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

  console.log('\nDosing guides complete (15/15)!');
}
main();
