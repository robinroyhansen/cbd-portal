import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  config({ path: envPath });
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GUIDES_CATEGORY_ID = "bfd651e6-7fb3-4756-a19d-7ad2ab98a2d2";

const articles = [
  {
    slug: "cbd-consumption-methods-compared",
    title: "CBD Consumption Methods Compared: Finding Your Best Option",
    meta_description:
      "Compare all CBD consumption methods side-by-side. Detailed breakdown of oils, edibles, topicals, vapes, and more to help you choose the best option for your needs.",
    content: `# CBD Consumption Methods Compared: Finding Your Best Option

**Quick Answer:** CBD can be taken sublingually (under tongue), orally (edibles, capsules), topically (creams), or inhaled (vaping). Sublingual offers the best balance of absorption and convenience for most users. Inhalation is fastest but shortest-lasting. Edibles last longest but absorb least efficiently. Topicals work locally only.

## Key Takeaways

- **Best for beginners:** Sublingual oils or gummies
- **Fastest effects:** Inhalation (1–5 minutes)
- **Longest lasting:** Edibles and capsules (6–8 hours)
- **Targeted relief:** Topicals (local effects only)

---

## Complete Method Comparison

| Method | Onset | Duration | Bioavailability | Convenience | Best For |
|--------|-------|----------|-----------------|-------------|----------|
| Sublingual | 15–30 min | 4–6 hrs | 20–35% | High | Daily use, balanced needs |
| Edibles | 30–90 min | 6–8 hrs | 6–15% | Very high | Sustained effects, taste |
| Capsules | 45–90 min | 6–8 hrs | 6–15% | Very high | Precise dosing, discretion |
| Topicals | 15–45 min | 4–6 hrs | Local only | High | Targeted application |
| Inhalation | 1–5 min | 1–3 hrs | 30–40% | Medium | Rapid relief |
| Patches | 1–2 hrs | 8–12 hrs | Variable | High | Sustained, steady release |

---

## Sublingual Method

### How It Works
Place CBD oil under your tongue and hold for 60–90 seconds. CBD absorbs through the thin tissue and blood vessels directly into your bloodstream.

### Pros
- Good bioavailability (20–35%)
- Relatively fast onset (15–30 minutes)
- Easy to adjust dosage
- Moderate duration (4–6 hours)

### Cons
- Taste may be unpleasant (hemp flavor)
- Requires holding under tongue
- Not as discreet as capsules

### Products
- CBD oils/tinctures
- CBD sprays

### Ideal For
- Daily wellness routines
- Those wanting control over dosage
- People seeking reliable absorption

---

## Oral Consumption (Edibles & Capsules)

### How It Works
Swallow CBD products that pass through your digestive system. The liver metabolizes CBD before it enters circulation ("first-pass metabolism").

### Pros
- Longest-lasting effects (6–8 hours)
- Very convenient and discreet
- Pre-measured doses (no guessing)
- Pleasant taste (gummies)
- No equipment needed

### Cons
- Lowest bioavailability (6–15%)
- Slowest onset (30–90 minutes)
- Food affects absorption
- Less flexible dosing (must take whole gummy/capsule)

### Products
- CBD gummies
- CBD capsules/softgels
- CBD beverages
- CBD-infused foods

### Ideal For
- People who dislike hemp taste
- Those wanting sustained effects
- Convenience-focused users
- Nighttime/sleep use

---

## Topical Application

### How It Works
Apply CBD directly to skin. CBD interacts with cannabinoid receptors in the skin and underlying tissue without entering your bloodstream significantly.

### Pros
- Targeted application
- No systemic effects
- No risk of drug interactions (typically)
- Won't affect drug tests (usually)
- Easy to use

### Cons
- Effects stay local
- Can't address systemic concerns
- Difficult to measure absorption
- May need frequent reapplication

### Products
- CBD creams
- CBD balms/salves
- CBD lotions
- CBD roll-ons
- CBD patches (transdermal — different mechanism)

### Ideal For
- Localized skin concerns
- Muscle and joint areas
- Those avoiding systemic CBD
- Skincare-focused users

---

## Inhalation (Vaping & Smoking)

### How It Works
Heat CBD (vape oil or flower) to create vapor, inhale into lungs where CBD absorbs directly into bloodstream through lung tissue.

### Pros
- Fastest onset (1–5 minutes)
- Highest bioavailability (30–40%)
- Easy to micro-dose
- Full-spectrum experience with flower

### Cons
- Shortest duration (1–3 hours)
- Requires equipment (vape device)
- Potential lung health concerns
- Less discreet (visible vapor/smoke)
- Flower looks like marijuana

### Products
- CBD vape pens/cartridges
- CBD e-liquid
- CBD flower (for smoking or dry-herb vaping)

### Ideal For
- Rapid relief needs
- Experienced cannabis users
- Those comfortable with inhalation
- Situational/acute use

---

## Transdermal Patches

### How It Works
Patches use technology to push CBD through your skin into your bloodstream over extended periods (8–12 hours).

### Pros
- Sustained, steady release
- No re-dosing needed
- Bypasses digestion
- Very discreet
- Set-and-forget convenience

### Cons
- Limited dosing flexibility
- Can't adjust mid-application
- May cause skin irritation
- Higher cost per dose
- Slower onset (1–2 hours)

### Products
- Transdermal CBD patches (various strengths)

### Ideal For
- Those wanting consistent levels
- People with busy schedules
- Users preferring passive delivery
- All-day coverage needs

---

## Method Selection Guide

### By Primary Goal

| Goal | Recommended Method |
|------|-------------------|
| Daily wellness | Sublingual or capsules |
| Sleep support | Gummies or capsules (evening) |
| Targeted skin concerns | Topicals |
| Acute/rapid needs | Inhalation |
| All-day coverage | Patches or split-dose oils |
| Maximum discretion | Capsules or patches |
| Precise dosing | Capsules or oils |

### By Lifestyle

| Lifestyle Factor | Recommended Method |
|------------------|-------------------|
| Busy schedule | Capsules, gummies, or patches |
| Works from home | Oils (can take time for sublingual) |
| Travels frequently | Capsules or gummies |
| Dislikes hemp taste | Gummies or capsules |
| Health-conscious | Oils (fewer additives) |
| Athletes | Topicals + sublingual |

### By Experience Level

| Experience | Recommended Method |
|------------|-------------------|
| CBD beginner | Gummies or sublingual oil |
| Some experience | Any method based on preference |
| Experienced | May combine multiple methods |

---

## Combining Methods

Many experienced users combine methods for optimal results:

### Common Combinations

**Sublingual + Topical:**
- Oil for systemic effects
- Cream for targeted areas
- Example: Morning oil + cream on joints

**Capsule + Vape:**
- Capsules for baseline coverage
- Vape for breakthrough needs
- Example: Daily capsule + vape as needed

**Morning Oil + Evening Gummy:**
- Oil for daytime
- Gummy for sleep support
- Example: Split dosing across day

---

## Bioavailability Deep Dive

**What is bioavailability?**
The percentage of CBD that actually reaches your bloodstream.

### Why It Matters

Higher bioavailability means:
- More CBD reaches your system
- Potentially lower doses needed
- Better value per mg

Lower bioavailability means:
- More CBD lost to digestion/metabolism
- May need higher doses
- Effects may feel different (slower, sustained)

### Bioavailability Comparison

| Method | Bioavailability | What Reaches You |
|--------|-----------------|------------------|
| Inhalation | 30–40% | 30–40mg from 100mg |
| Sublingual | 20–35% | 20–35mg from 100mg |
| Oral | 6–15% | 6–15mg from 100mg |
| Topical | Local only | Stays in applied area |

---

## FAQ

### Which method is best for beginners?
Sublingual oils or gummies. Oils offer control and good absorption. Gummies are easy and pre-dosed. Both have clear dosing guidance.

### Can I use multiple methods at once?
Yes, many people combine methods. A common approach is daily capsules plus topical cream for targeted areas.

### Which method has the least noticeable effects?
Capsules and patches typically have the gentlest, most gradual effects due to slow release. Inhalation has the most noticeable immediate impact.

### What method is safest?
All methods are generally considered safe when using quality products. Inhalation carries some lung health questions. Topicals have virtually no systemic risk.

### Does the method affect drug test risk?
Topicals rarely cause positive tests (no systemic absorption). Full-spectrum products via any method carry trace THC that could accumulate with heavy use.

---

## Summary Table

| If You Want... | Choose... |
|----------------|-----------|
| Best overall balance | Sublingual oil |
| Fastest effects | Vaping |
| Longest effects | Capsules or gummies |
| Targeted relief | Topicals |
| Maximum convenience | Patches or capsules |
| Best taste | Flavored gummies |
| Most discreet | Capsules |
| Most control | Sublingual oil |

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: true,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "sublingual-cbd-guide",
    title: "Sublingual CBD Guide: Under-Tongue Oil Method Explained",
    meta_description:
      "Complete guide to taking CBD sublingually. Learn proper technique, timing, benefits, and tips for maximizing absorption with under-tongue CBD delivery.",
    content: `# Sublingual CBD Guide: Under-Tongue Oil Method Explained

**Quick Answer:** Sublingual CBD means placing oil under your tongue and holding for 60–90 seconds before swallowing. This allows CBD to absorb directly into your bloodstream through the thin tissue beneath your tongue, bypassing digestion for faster onset (15–30 minutes) and better bioavailability (20–35%).

## Key Takeaways

- **20–35% bioavailability** — significantly better than oral consumption
- **15–30 minute onset** — faster than edibles
- **60–90 second hold** is optimal for absorption
- **Most popular method** for CBD oils and tinctures

---

## Why Sublingual Absorption Works

### The Science

The sublingual area (under your tongue) has several features that make it ideal for CBD absorption:

1. **Thin mucous membrane** — CBD passes through easily
2. **Rich blood supply** — Numerous capillaries for quick uptake
3. **Bypasses first-pass metabolism** — Avoids liver processing

### Comparison to Swallowing

| Route | Process | Bioavailability | Onset |
|-------|---------|-----------------|-------|
| Sublingual | Direct to bloodstream | 20–35% | 15–30 min |
| Swallowed | Stomach → liver → blood | 6–15% | 45–90 min |

---

## Step-by-Step Technique

### Step 1: Prepare

- Shake your CBD oil bottle gently
- Check dropper measurements
- Have a mirror nearby if you're new to this

### Step 2: Measure Your Dose

- Use the dropper to draw your desired amount
- Standard droppers hold approximately 1ml
- Check your product's mg/ml to calculate dose

### Step 3: Position

- Lift your tongue toward the roof of your mouth
- Expose the sublingual area (floor of mouth beneath tongue)
- Position dropper tip directly over this area

### Step 4: Deposit

- Squeeze dropper to release oil
- Aim for the center of the sublingual area
- Avoid the top of your tongue (less absorption)

### Step 5: Hold

- Lower your tongue gently
- Keep mouth closed
- **Hold for 60–90 seconds minimum**
- Resist the urge to swallow

### Step 6: Swallow

- After holding, swallow any remaining oil
- This portion absorbs through digestion
- Some additional benefit, though less efficient

---

## Optimal Hold Times

| Hold Time | Absorption Level | Notes |
|-----------|-----------------|-------|
| 30 seconds | Minimal | Too short for significant absorption |
| 60 seconds | Good | Standard recommendation |
| 90 seconds | Better | Optimal for most people |
| 2 minutes | Maximum | Diminishing returns beyond this |

**Tip:** Use a timer until you develop a feel for 60–90 seconds.

---

## Maximizing Sublingual Absorption

### Do's

| Practice | Why It Helps |
|----------|--------------|
| Clean mouth before | Removes barriers to absorption |
| Stay still | Prevents triggering swallow reflex |
| Use mirror | Ensures correct placement |
| Be consistent | Same technique = predictable results |
| Relax | Tension makes holding harder |

### Don'ts

| Practice | Why It Hurts |
|----------|--------------|
| Eating right before | Food residue blocks absorption |
| Brushing teeth immediately before | Irritation affects tissue |
| Drinking water right before | Dilutes oil, washes away |
| Talking while holding | Triggers swallowing |
| Giving up too early | Reduces effectiveness |

---

## Best Products for Sublingual Use

### Ideal: CBD Oils and Tinctures

- Specifically designed for sublingual use
- Common carriers: MCT oil, hemp seed oil, olive oil
- Available in various concentrations

### Also Works: CBD Sprays

- Pump spray directly under tongue
- Often lower doses per spray
- Good for micro-dosing

### Not Designed for Sublingual

- Gummies (chew and swallow)
- Capsules (swallow whole)
- Topicals (skin application)
- Vapes (inhale)

---

## Timing Considerations

### When Effects Begin

| Factor | Onset Time |
|--------|------------|
| Typical onset | 15–30 minutes |
| Some people | 5–15 minutes |
| Others | Up to 45 minutes |

Individual metabolism affects timing.

### When to Take for Specific Goals

| Goal | Timing |
|------|--------|
| Morning wellness | With breakfast routine |
| Work stress | 30 min before stressful periods |
| Sleep | 60–90 min before bed |
| Post-workout | After exercise |

---

## Common Questions About Technique

### What if I swallow too early?

Not a problem — you'll still absorb CBD, just through digestion at lower bioavailability. Try again with next dose.

### Can I place oil on top of my tongue?

Yes, but absorption is significantly lower. The underside has more blood vessels for uptake.

### What if I can't hold for 60 seconds?

Start with 30 seconds and work up. Any sublingual holding is better than immediate swallowing.

### Should I move the oil around?

Gently swishing can spread oil across more tissue, potentially improving absorption. Don't swish vigorously.

### Does swallowing the remainder help?

Yes, but it's less efficient. The CBD you swallow undergoes first-pass metabolism, absorbing at oral bioavailability rates.

---

## Troubleshooting Common Issues

### Issue: Difficulty Holding Without Swallowing

**Solutions:**
- Start with shorter times (30 sec)
- Focus on breathing through nose
- Relax jaw muscles
- Distract yourself (count, listen to music)

### Issue: Bad Taste

**Solutions:**
- Try flavored CBD oils
- Have juice or food ready to follow
- Use mint oil products
- Chase with honey

### Issue: Inconsistent Results

**Solutions:**
- Use same technique every time
- Measure doses carefully
- Hold for consistent times
- Track your experiences

### Issue: Oil Spreads Around Mouth

**Solutions:**
- Use smaller volumes
- Position dropper carefully
- Tilt head slightly back
- Practice placement

---

## Sublingual vs. Other Methods

| Feature | Sublingual | Oral | Topical | Inhaled |
|---------|------------|------|---------|---------|
| Speed | Medium | Slow | Medium | Fast |
| Duration | 4–6 hrs | 6–8 hrs | 4–6 hrs | 1–3 hrs |
| Bioavailability | 20–35% | 6–15% | Local | 30–40% |
| Convenience | Good | Best | Good | Medium |
| Taste | Hemp/flavored | Pleasant | N/A | Mild |

---

## FAQ

### How much CBD should I put under my tongue?
Start with your product's recommended serving size, typically 0.5–1ml. Beginners might start with half a dropper and adjust based on response.

### Can I drink water right after?
Wait a few minutes after swallowing the remainder. Immediate water can wash away CBD that was still absorbing.

### Does CBD oil need to be held under the tongue?
For maximum absorption, yes. You can swallow immediately, but you'll get lower bioavailability similar to eating CBD.

### How often can I take sublingual CBD?
Most people take CBD 1–2 times daily. There's no established maximum, but consistent daily dosing typically produces best results.

### Will sublingual CBD make my mouth numb?
CBD itself isn't numbing. Some people report mild tingling, which is normal. Strong numbness would be unusual.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "oral-cbd-guide",
    title: "Oral CBD Guide: Gummies, Capsules & Edibles Explained",
    meta_description:
      "Complete guide to taking CBD orally. Covers gummies, capsules, and edibles including dosing, timing, absorption, and tips for best results.",
    content: `# Oral CBD Guide: Gummies, Capsules & Edibles Explained

**Quick Answer:** Oral CBD (swallowed as gummies, capsules, or edibles) provides the longest-lasting effects (6–8 hours) but lowest bioavailability (6–15%). Effects take 30–90 minutes to begin as CBD must pass through your digestive system. This method prioritizes convenience and sustained duration over speed and absorption efficiency.

## Key Takeaways

- **Longest duration** of all methods (6–8 hours)
- **Slowest onset** — 30–90 minutes to feel effects
- **Lowest bioavailability** — 6–15% reaches bloodstream
- **Most convenient** — pre-dosed, portable, discreet

---

## How Oral CBD Works

### The Digestive Process

When you swallow CBD:

1. **Stomach** — Gummy/capsule breaks down
2. **Small intestine** — CBD absorbs into intestinal wall
3. **Liver** — "First-pass metabolism" processes CBD
4. **Bloodstream** — Remaining CBD enters circulation
5. **Distribution** — CBD spreads throughout body

### Why Bioavailability Is Lower

**First-pass metabolism** is the key factor:
- Your liver processes CBD before it reaches general circulation
- Enzymes break down a significant portion
- Only 6–15% of the original CBD makes it through

This isn't necessarily bad — it creates sustained, gradual effects.

---

## Types of Oral CBD Products

### CBD Gummies

**What they are:** Chewy candies infused with CBD

| Feature | Details |
|---------|---------|
| Typical dose | 10–50mg per gummy |
| Taste | Flavored (fruit, etc.) |
| Convenience | Very high |
| Dosing precision | Moderate (varies slightly per gummy) |

**Best for:** Those who dislike hemp taste, casual users

### CBD Capsules

**What they are:** CBD oil in swallowable capsule shells

| Feature | Details |
|---------|---------|
| Typical dose | 10–50mg per capsule |
| Taste | None |
| Convenience | Very high |
| Dosing precision | High (consistent fill) |

**Best for:** Supplement users, those wanting precise doses

### CBD Softgels

**What they are:** CBD in liquid-filled soft gel coating

| Feature | Details |
|---------|---------|
| Typical dose | 15–50mg per softgel |
| Absorption | Slightly better than capsules |
| Convenience | Very high |
| Dosing precision | High |

**Best for:** Those wanting slightly improved absorption

### Other CBD Edibles

- **CBD beverages** — Drinks infused with CBD
- **CBD chocolate** — CBD mixed into chocolate
- **CBD honey** — CBD-infused honey
- **CBD baked goods** — Cookies, brownies, etc.

---

## Dosing Oral CBD

### Starting Dose Guidelines

| Experience | Gummies | Capsules |
|------------|---------|----------|
| Beginner | 1 gummy (10–25mg) | 1 capsule (10–25mg) |
| Some experience | 1–2 gummies | 1–2 capsules |
| Experienced | 2–3+ based on needs | 2–3+ based on needs |

### Timing Your Dose

| Goal | When to Take |
|------|--------------|
| Daily wellness | Morning with breakfast |
| Sleep support | 90 min before bed |
| Sustained relief | Morning + evening (split) |
| Post-exercise | After workout |

### Adjusting Over Time

**Week 1:** Start with recommended serving
**Week 2:** Assess effects, increase by 5–10mg if needed
**Week 3+:** Fine-tune to find optimal dose

---

## Maximizing Oral CBD Absorption

### Take with Fatty Foods

CBD is fat-soluble. Research shows taking CBD with fats can increase absorption by **4–5 times**.

**Good pairings:**
- Avocado
- Nuts or nut butter
- Full-fat yogurt
- Eggs with yolks
- Fish or meat
- Olive oil

### Timing with Meals

| Timing | Effect |
|--------|--------|
| Empty stomach | Faster but lower absorption |
| With meal | Slower but higher absorption |
| After fatty meal | Best absorption |

---

## What to Expect

### Onset Timeline

| Time | What Happens |
|------|--------------|
| 0–30 min | Product digesting, no effects yet |
| 30–60 min | Effects begin for most people |
| 60–90 min | Effects increasing |
| 2–3 hours | Peak effects |
| 4–6 hours | Effects sustained |
| 6–8 hours | Gradual decline |

### Effect Characteristics

Oral CBD typically produces:
- Gradual onset (no sudden "kick")
- Sustained, even effects
- Longer duration than other methods
- Subtle rather than dramatic sensations

---

## Oral CBD: Pros and Cons

### Advantages

| Advantage | Explanation |
|-----------|-------------|
| Long duration | 6–8 hours from single dose |
| Convenience | No equipment, pre-measured |
| Discretion | Looks like regular supplements |
| Pleasant | Gummies taste good |
| Portability | Easy to travel with |
| Consistency | Same dose every time |

### Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| Slow onset | Must wait 30–90 minutes |
| Lower bioavailability | Less CBD reaches system |
| Inflexible dosing | Must take whole gummy/capsule |
| Variable absorption | Food intake affects results |
| Added ingredients | Sugar in gummies, etc. |

---

## Comparing Oral CBD Products

| Feature | Gummies | Capsules | Softgels | Edibles |
|---------|---------|----------|----------|---------|
| Taste | Flavored | None | None | Varies |
| Convenience | High | High | High | Medium |
| Absorption | Standard | Standard | Slightly better | Standard |
| Ingredients | Sugar, flavors | Minimal | Minimal | Varies |
| Cost | Medium | Medium | Higher | Varies |
| Shelf life | 6–12 months | 12–24 months | 12–24 months | Varies |

---

## When to Choose Oral CBD

### Ideal Situations

- You need effects lasting 6+ hours
- Convenience is priority
- You dislike hemp taste
- Discretion matters
- You take other daily supplements
- You prefer not to hold oil under tongue

### Less Ideal Situations

- You need rapid relief (under 30 minutes)
- Maximum absorption efficiency is priority
- You're sensitive to added sugars (gummies)
- You need flexible, adjustable dosing

---

## Troubleshooting

### Issue: No effects after an hour

**Possible causes:**
- Dose too low for your body
- Took on empty stomach (lower absorption)
- Product quality issues

**Solutions:**
- Wait full 90 minutes before adding more
- Try taking with fatty food next time
- Verify product quality (check COA)

### Issue: Effects too strong

**Possible causes:**
- Dose too high
- Stronger product than expected
- Individual sensitivity

**Solutions:**
- Reduce dose by half
- Try cutting gummies (if even distribution)
- Choose lower-mg products

### Issue: Inconsistent results

**Possible causes:**
- Varying food intake
- Different timing each day
- Product variation

**Solutions:**
- Take consistently with/without food
- Same time each day
- Check batch COAs for consistency

---

## FAQ

### How many CBD gummies should I take?
Start with one gummy and wait 2 hours before taking more. Adjust over time based on your response. Most people find 1–3 gummies effective.

### Can I take CBD capsules with other supplements?
Generally yes, but check for potential interactions with medications. CBD can affect how your liver processes certain drugs.

### Why do edibles take so long to work?
CBD must travel through your entire digestive system, absorb through intestinal walls, and process through your liver before reaching circulation. This takes time.

### Are CBD gummies less effective than oils?
They have lower bioavailability, but they last longer. Effectiveness depends on your goals — for sustained effects, they work well.

### Can I take oral CBD on an empty stomach?
Yes, but absorption is significantly lower. For best results, take with fatty foods.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "topical-cbd-guide",
    title: "Topical CBD Guide: Creams, Balms & External Application",
    meta_description:
      "Complete guide to using CBD topicals. Covers creams, balms, salves, and roll-ons including application technique, dosing, and what to expect from external CBD use.",
    content: `# Topical CBD Guide: Creams, Balms & External Application

**Quick Answer:** Topical CBD products (creams, balms, salves, roll-ons) are applied directly to the skin where CBD interacts with local cannabinoid receptors without significantly entering your bloodstream. Effects begin in 15–45 minutes and last 4–6 hours. Topicals are ideal for targeted application to specific areas.

## Key Takeaways

- **Local effects only** — CBD stays where you apply it
- **No systemic absorption** — doesn't enter bloodstream significantly
- **15–45 minute onset** — faster than edibles
- **Ideal for targeted application** to specific areas

---

## How Topical CBD Works

### The Mechanism

When you apply CBD topically:

1. **Contact** — CBD cream meets skin surface
2. **Penetration** — CBD passes through outer skin layers
3. **Local interaction** — CBD interacts with cannabinoid receptors in skin
4. **Tissue distribution** — CBD reaches muscles/tissue below application site
5. **Local effect** — Benefits concentrated in applied area

### What Makes Topicals Different

| Feature | Topical CBD | Other Methods |
|---------|-------------|---------------|
| Bloodstream entry | Minimal | Yes |
| Whole-body effects | No | Yes |
| Drug test concern | Very low | Possible |
| Drug interactions | Minimal | Possible |
| Targeted relief | Yes | No |

---

## Types of CBD Topicals

### CBD Cream

**Characteristics:**
- Smooth, spreadable consistency
- Water and oil based
- Absorbs relatively quickly
- Often includes moisturizing ingredients

**Best for:** Large areas, daily skincare, quick absorption

### CBD Balm

**Characteristics:**
- Thick, waxy texture
- Solid at room temperature
- Melts with body heat
- Longer-lasting on skin

**Best for:** Small, targeted spots, intensive application, dry skin

### CBD Salve

**Characteristics:**
- Semi-solid consistency
- Often contains herbs
- Concentrated formulas
- Traditional preparation style

**Best for:** Targeted application, natural formulas

### CBD Lotion

**Characteristics:**
- Lighter than cream
- Spreads easily
- Fast absorption
- Often scented

**Best for:** Large body areas, everyday use, under clothing

### CBD Roll-On

**Characteristics:**
- Liquid in roller applicator
- No-mess application
- Often contains cooling/warming agents
- Quick-drying

**Best for:** On-the-go use, post-workout, mess-free application

---

## Application Technique

### Step 1: Clean the Area

Wash target area with mild soap and water. Remove any lotions, oils, or debris that could block absorption.

### Step 2: Dry Completely

Pat dry with clean towel. Applying to wet skin dilutes the product.

### Step 3: Apply Appropriate Amount

| Area Size | Amount |
|-----------|--------|
| Small (finger, wrist) | Pea-sized |
| Medium (knee, elbow) | Dime-sized |
| Large (back, thigh) | Quarter-sized or more |

### Step 4: Massage Thoroughly

- Use circular motions
- Apply moderate pressure
- Continue for 30–60 seconds
- Ensure product is no longer visible on surface

### Step 5: Wash Hands

Unless your hands are the target area, wash after application to avoid transferring CBD to eyes or mouth.

### Step 6: Allow to Absorb

Wait 5–10 minutes before covering with clothing for full absorption.

---

## When and How Often to Apply

### Timing

| Goal | When to Apply |
|------|---------------|
| Morning routine | After shower |
| Ongoing support | 2–3 times daily |
| Post-exercise | After workout |
| Before bed | Part of evening routine |
| As needed | When discomfort arises |

### Frequency

**General guideline:** Apply every 4–6 hours as needed

| Usage Level | Frequency |
|-------------|-----------|
| Light | Once daily |
| Moderate | 2–3 times daily |
| Intensive | 3–4 times daily |

There's no established maximum for topical CBD application.

---

## Maximizing Topical Effectiveness

### Before Application

| Tip | Why It Helps |
|-----|--------------|
| Warm shower first | Opens pores, increases absorption |
| Gentle exfoliation | Removes dead skin barrier |
| Dry skin completely | Prevents dilution |

### During Application

| Tip | Why It Helps |
|-----|--------------|
| Massage firmly | Friction aids penetration |
| Apply enough | Thin layer should cover area |
| Take your time | 60 seconds of massage helps |

### After Application

| Tip | Why It Helps |
|-----|--------------|
| Don't wash immediately | Allow time to absorb |
| Wait before clothing | Prevents transfer |
| Be consistent | Regular use often works better |

---

## What to Expect

### Onset and Duration

| Phase | Timeframe |
|-------|-----------|
| Application | 0 minutes |
| Initial effects | 15–45 minutes |
| Peak effects | 1–2 hours |
| Duration | 4–6 hours |
| Reapplication | Every 4–6 hours as needed |

### Typical Experience

Topical CBD typically produces:
- Localized comfort in applied area
- No whole-body sensations
- No mental effects
- Subtle rather than dramatic

### What You Won't Feel

- Relaxation throughout body (no systemic absorption)
- Mental calmness (doesn't reach brain)
- Drowsiness (not affecting central nervous system)

---

## Topical CBD: Pros and Cons

### Advantages

| Advantage | Explanation |
|-----------|-------------|
| Targeted relief | Apply exactly where needed |
| No systemic effects | Won't feel drowsy |
| Minimal drug interactions | Doesn't go through liver |
| Very low drug test risk | Little to no blood absorption |
| Easy to use | No equipment or timing needed |
| Add to skincare | Doubles as moisturizer |

### Disadvantages

| Disadvantage | Explanation |
|--------------|-------------|
| Limited to local effects | Can't address whole-body concerns |
| Difficult to measure dose | Absorption varies |
| May need frequent reapplication | Effects fade |
| Can be messy | Creams and balms transfer |
| Harder to compare products | No standardized dosing |

---

## Choosing the Right Topical

### By Need

| Need | Best Product Type |
|------|-------------------|
| Quick absorption | Lotion or roll-on |
| Long-lasting application | Balm |
| Large area coverage | Cream or lotion |
| Targeted small spots | Balm or salve |
| On-the-go use | Roll-on |
| Dry skin | Balm or cream |

### By Active Ingredients

Many topicals include additional ingredients:

| Ingredient | Purpose |
|------------|---------|
| Menthol | Cooling sensation |
| Camphor | Warming sensation |
| Arnica | Traditional herbal use |
| Essential oils | Aromatherapy, scent |
| Vitamin E | Antioxidant, skin health |
| Aloe vera | Soothing, moisturizing |

---

## Topicals vs. Other Methods

| Feature | Topical | Sublingual | Oral | Inhaled |
|---------|---------|------------|------|---------|
| Local effects | Yes | No | No | No |
| Systemic effects | No | Yes | Yes | Yes |
| Drug test risk | Very low | Present | Present | Present |
| Onset | 15–45 min | 15–30 min | 30–90 min | 1–5 min |
| Duration | 4–6 hours | 4–6 hours | 6–8 hours | 1–3 hours |

---

## FAQ

### Will CBD cream make me fail a drug test?
Very unlikely. Topical CBD doesn't significantly enter your bloodstream, so THC (even from full-spectrum products) shouldn't accumulate. For absolute safety, use isolate-based topicals.

### How much CBD is in each application?
It's difficult to measure precisely. Product labels show total mg in the container. Divide by estimated applications for rough per-use amount, but absorption varies.

### Can I use CBD topicals on my face?
Yes, if the product is formulated for facial use. Some CBD creams contain ingredients not suitable for facial skin. Check the label.

### Why don't I feel CBD topicals working?
Topical effects are subtle and localized. You won't feel relaxed or drowsy like with oral CBD. Effects are often described as comfort in the applied area.

### Can I apply CBD cream too often?
There's no established maximum. However, applying excessively wastes product — your skin can only absorb so much at once.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "inhaled-cbd-guide",
    title: "Inhaled CBD Guide: Vaping, Smoking & Lung Delivery",
    meta_description:
      "Complete guide to inhaling CBD through vaping and smoking. Covers devices, techniques, safety considerations, dosing, and what to expect from inhaled CBD.",
    content: `# Inhaled CBD Guide: Vaping, Smoking & Lung Delivery

**Quick Answer:** Inhaling CBD (via vaping or smoking) provides the fastest onset (1–5 minutes) and highest bioavailability (30–40%) of any consumption method. CBD enters your bloodstream directly through lung tissue. Effects last 1–3 hours. While efficient, inhalation carries potential lung health considerations.

## Key Takeaways

- **Fastest onset** — effects in 1–5 minutes
- **Highest bioavailability** — 30–40% absorption
- **Shortest duration** — 1–3 hours
- **Lung health considerations** — not risk-free

---

## How Inhaled CBD Works

### The Mechanism

When you inhale CBD vapor or smoke:

1. **Inhalation** — CBD-containing vapor enters lungs
2. **Alveolar absorption** — CBD passes through thin lung tissue
3. **Bloodstream entry** — CBD enters pulmonary circulation
4. **Systemic distribution** — CBD circulates throughout body
5. **Brain delivery** — CBD reaches brain within seconds

### Why It's So Fast

Your lungs are designed for rapid gas exchange. The same features that let you absorb oxygen instantly allow CBD vapor to pass through:
- Massive surface area
- Extremely thin tissue barrier
- Rich blood supply

---

## CBD Inhalation Methods

### Vaping CBD

**How it works:** Electronic device heats CBD oil/liquid to produce vapor

**Types of vape products:**

| Product | Description | Pros | Cons |
|---------|-------------|------|------|
| Disposable vape | Pre-filled, single-use | No setup | More expensive, waste |
| Cartridge + battery | Pre-filled cart, rechargeable battery | Easy, consistent | Medium cost |
| Refillable pod | Refillable pod, rechargeable | Cost-effective | Requires refilling |
| Tank system | Customizable setup | Most flexible | Requires knowledge |

### Dry Herb Vaping

**How it works:** Device heats CBD flower to release cannabinoids without combustion

**Advantages over smoking:**
- No combustion = fewer harmful compounds
- Better flavor preservation
- More efficient extraction
- Temperature control

### Smoking CBD Flower

**How it works:** Burning CBD-rich hemp flower and inhaling smoke

**Methods:**
- Joints (rolled in papers)
- Pipes (glass, wood, metal)
- Bongs (water filtration)

**Considerations:**
- Combustion produces tar and carcinogens
- Less refined than vaping
- Traditional, ritualistic experience

---

## Vape Products Explained

### CBD Vape Juice (E-Liquid)

**Composition:**
- CBD extract
- Vegetable glycerin (VG)
- Propylene glycol (PG)
- Flavorings (optional)

**Used with:** Refillable vape pens, pod systems, tanks

### CBD Vape Cartridges

**Composition:**
- CBD distillate or oil
- Pre-filled in cartridge
- Sometimes terpenes added

**Used with:** 510-thread batteries (most common)

### CBD Disposable Vapes

**Composition:**
- All-in-one device
- Pre-filled, pre-charged
- Single use

**Used with:** Nothing — self-contained

---

## How to Vape CBD

### Using a Disposable

1. Remove from packaging
2. Check for button (some auto-draw)
3. Place mouthpiece to lips
4. Inhale gently for 2–3 seconds
5. Hold briefly (1–2 seconds)
6. Exhale

### Using a Cartridge System

1. Charge battery fully
2. Screw cartridge onto battery
3. If button exists, click 5x to turn on
4. Hold button while inhaling (or auto-draw)
5. Take 2–3 second draws
6. Start with 1–2 puffs

### Using a Refillable Device

1. Fill tank/pod with CBD e-liquid
2. Let sit 5–10 minutes (wick saturation)
3. Start at low wattage
4. Take test puffs
5. Adjust settings as needed

---

## Vaping Dosage

### Starting Low

**Begin with:** 1–2 small puffs
**Wait:** 10 minutes
**Assess:** Effects noticeable?
**Adjust:** Add 1 puff if needed

### Estimating mg Per Puff

This varies significantly by:
- Product concentration
- Puff duration
- Device wattage
- Inhalation depth

**Very rough estimates:**
| Product Strength | Approximate mg/Puff |
|-----------------|---------------------|
| Low (100–250mg/ml) | 1–2mg |
| Medium (250–500mg/ml) | 2–4mg |
| High (500mg+/ml) | 4–8mg |

---

## Safety Considerations

### Potential Risks of Inhalation

| Risk | Details |
|------|---------|
| Lung irritation | Vapor/smoke can irritate airways |
| Unknown long-term effects | Vaping relatively new, research ongoing |
| Product quality issues | Contaminated products have caused illness |
| Addiction to vaping habit | Behavioral, not CBD-related |

### Critical Safety Rules

1. **Never vape regular CBD oil** — MCT oil and other carriers can cause lung damage
2. **Only use products designed for vaping** — Proper VG/PG base or CO2 extract
3. **Avoid vitamin E acetate** — Linked to vaping illness outbreak
4. **Buy from reputable sources** — Third-party tested products
5. **Stop if you experience symptoms** — Coughing, chest pain, breathing difficulty

### Who Should Avoid Inhalation

- People with respiratory conditions (asthma, COPD)
- Non-smokers who've never vaped
- Pregnant or breastfeeding women
- Those with lung sensitivities
- People under 21 (legal age varies)

---

## Vaping vs. Smoking CBD

| Factor | Vaping | Smoking |
|--------|--------|---------|
| Combustion | No | Yes |
| Harmful compounds | Fewer | More |
| Temperature control | Yes | No |
| Efficiency | Higher | Lower |
| Flavor | Better | Reduced |
| Equipment | Required | Minimal |
| Smell | Less | More |
| Legal perception | Varies | Looks like marijuana |

---

## What to Expect

### Timeline

| Time | What Happens |
|------|--------------|
| 0–1 min | Inhalation complete |
| 1–5 min | Effects begin |
| 5–15 min | Effects building |
| 15–30 min | Peak effects |
| 1–2 hours | Effects sustained |
| 2–3 hours | Effects fading |

### Effect Characteristics

Inhaled CBD typically produces:
- Rapid onset you can notice
- Clear, immediate experience
- Shorter total duration
- Easy to gauge and adjust

---

## Troubleshooting

### Issue: Coughing

**Causes:** Hitting too hard, high temperature, throat sensitivity

**Solutions:**
- Take smaller, gentler puffs
- Lower device wattage if adjustable
- Try different products
- Consider other methods if persistent

### Issue: No Effects

**Causes:** Low dose, poor quality product, tolerance

**Solutions:**
- Increase puffs (carefully)
- Verify product quality
- Try different products

### Issue: Too Intense

**Causes:** Too many puffs, high concentration

**Solutions:**
- Reduce puffs
- Use lower-concentration products
- Wait longer between sessions

---

## Inhaled vs. Other Methods

| Feature | Inhaled | Sublingual | Oral | Topical |
|---------|---------|------------|------|---------|
| Onset | 1–5 min | 15–30 min | 30–90 min | 15–45 min |
| Duration | 1–3 hrs | 4–6 hrs | 6–8 hrs | 4–6 hrs |
| Bioavailability | 30–40% | 20–35% | 6–15% | Local |
| Lung concerns | Yes | No | No | No |
| Portability | Medium | Good | Best | Good |

---

## FAQ

### Is vaping CBD safe?
Vaping is not risk-free. It's generally considered less harmful than smoking but carries potential lung health concerns. Long-term effects are still being studied.

### What should I look for in CBD vape products?
Third-party lab testing, proper ingredients (no vitamin E acetate), reputable brand, transparent labeling, appropriate carrier for vaping.

### How many puffs equal a dose?
It varies too much to generalize. Start with 1–2 puffs, wait 10 minutes, and adjust. Track your experience to find your personal effective amount.

### Can I vape regular CBD oil?
No. Regular CBD oil uses carriers like MCT oil that can cause serious lung injury when inhaled. Only use products specifically designed for vaping.

### Does CBD flower get you high?
No. CBD flower contains less than 0.3% THC, which isn't enough to produce intoxication. You may feel relaxed but not "high."

---

*This article is for informational purposes only and does not constitute medical advice. Inhalation carries inherent risks. Consult a healthcare provider before starting any CBD regimen, especially if you have respiratory conditions.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
];

async function main() {
  console.log("Inserting Consumption Method guides...\n");

  for (const article of articles) {
    const { error } = await supabase.from("kb_articles").insert(article);

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log("\nConsumption Method guides complete (5/5)!");
  console.log("\n🎉 All 55 Guide articles have been produced!");
}

main().catch(console.error);
