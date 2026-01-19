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
    slug: "how-to-take-cbd-oil",
    title: "How to Take CBD Oil: Complete Usage Guide",
    meta_description:
      "Learn the correct way to take CBD oil for maximum absorption. Step-by-step instructions for sublingual, oral, and topical application methods.",
    content: `# How to Take CBD Oil: Complete Usage Guide

**Quick Answer:** The most effective way to take CBD oil is sublingually (under your tongue). Place your dose under the tongue, hold for 60–90 seconds, then swallow. This method provides 20–35% bioavailability with effects starting within 15–30 minutes.

## Key Takeaways

- **Sublingual method** offers the best absorption for CBD oil
- **Hold under tongue** for at least 60 seconds for optimal results
- **Timing matters** — take consistently at the same time daily
- **Start low** — begin with 10–20mg and adjust based on response

---

## The Three Methods for Taking CBD Oil

CBD oil can be taken in several ways, each with distinct advantages:

| Method | Bioavailability | Onset Time | Duration | Best For |
|--------|-----------------|------------|----------|----------|
| Sublingual | 20–35% | 15–30 min | 4–6 hours | Daily wellness, anxiety |
| Oral (swallowed) | 6–15% | 30–90 min | 6–8 hours | Sustained effects |
| Topical | Local only | 15–45 min | 2–4 hours | Targeted skin areas |

---

## Step-by-Step: Sublingual Method (Recommended)

The sublingual method maximizes absorption by bypassing your digestive system:

### Step 1: Prepare Your Dose

Shake the bottle gently to ensure even distribution. Check the dropper markings — most standard droppers hold 1ml, which typically equals one full dropper squeeze.

### Step 2: Measure Accurately

Use the dropper to draw your desired amount. For beginners, half a dropper (0.5ml) is a reasonable starting point. Check your product's concentration to calculate your mg dosage.

### Step 3: Place Under Tongue

Lift your tongue and deposit the oil directly into the sublingual area — the soft tissue under your tongue where blood vessels are close to the surface.

### Step 4: Hold for 60–90 Seconds

This is critical. The longer you hold, the more CBD absorbs directly into your bloodstream. Resist the urge to swallow immediately.

### Step 5: Swallow the Remainder

After holding, swallow any remaining oil. Some additional absorption occurs through your digestive system.

---

## When to Take CBD Oil

**Consistency matters more than timing.** Taking CBD at the same time each day helps maintain stable levels in your system.

**Common timing approaches:**

- **Morning:** For daytime focus and anxiety management
- **Evening:** For sleep support and nighttime relaxation
- **Split dosing:** Half in morning, half in evening for all-day coverage
- **As needed:** For situational use (before stressful events)

---

## Tips for Better Absorption

**With food or without?**
Taking CBD with fatty foods can increase absorption by 4–5 times. Consider taking your dose with a meal containing healthy fats like avocado, nuts, or olive oil.

**Storage matters:**
Store CBD oil in a cool, dark place. Heat and light degrade cannabinoids over time. A kitchen cabinet away from the stove works well.

**Shake before use:**
CBD and carrier oils can separate. A gentle shake ensures consistent dosing.

---

## Common Mistakes to Avoid

1. **Swallowing immediately** — Bypassing sublingual absorption reduces effectiveness
2. **Inconsistent dosing** — Random timing makes it harder to assess effects
3. **Starting too high** — Beginning with large doses may cause drowsiness
4. **Expecting instant results** — Some benefits build over days or weeks of consistent use

---

## FAQ

### How long should I hold CBD oil under my tongue?
Aim for 60–90 seconds minimum. Some people hold for up to 2 minutes for maximum absorption through the sublingual tissue.

### Can I add CBD oil to food or drinks?
Yes, but this converts it to oral consumption with lower bioavailability. If you dislike the taste, add it to smoothies or coffee after measuring your dose.

### How do I know if my CBD oil is working?
Effects vary by individual. Most people notice subtle shifts in mood, relaxation, or sleep quality within 30 minutes to 2 hours. Keep a journal to track responses.

### Should I take CBD oil on an empty stomach?
You can, but taking it with fatty foods significantly increases absorption. An empty stomach leads to faster but potentially lower overall absorption.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen, especially if you take other medications.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-use-cbd-drops",
    title: "How to Use CBD Drops: Dropper Guide & Dosing Tips",
    meta_description:
      "Master CBD drop dosing with our complete guide. Learn dropper measurements, calculate your dose, and get consistent results from CBD tinctures.",
    content: `# How to Use CBD Drops: Dropper Guide & Dosing Tips

**Quick Answer:** Most CBD dropper bottles dispense 1ml per full dropper squeeze (approximately 20 drops). To calculate your dose, divide the total mg by total ml. For a 1000mg/30ml bottle, one full dropper delivers about 33mg of CBD.

## Key Takeaways

- **Standard dropper** = 1ml = approximately 20 drops
- **Calculate mg per drop** by dividing total mg by total drops (bottle ml × 20)
- **Consistency** in squeezing the dropper ensures accurate dosing
- **Graduated droppers** make measurement easier for beginners

---

## Understanding CBD Dropper Measurements

CBD tinctures come with a dropper that holds approximately 1ml when fully squeezed. This is your primary measurement tool.

### Standard Bottle Calculations

| Bottle Size | Total CBD | Per 1ml Dropper | Per Single Drop |
|-------------|-----------|-----------------|-----------------|
| 30ml / 500mg | 500mg | ~16.7mg | ~0.83mg |
| 30ml / 1000mg | 1000mg | ~33.3mg | ~1.67mg |
| 30ml / 1500mg | 1500mg | ~50mg | ~2.5mg |
| 30ml / 3000mg | 3000mg | ~100mg | ~5mg |

**Quick formula:** Total mg ÷ Total ml = mg per dropper

---

## How to Use the Dropper Correctly

### Step 1: Squeeze the Bulb

Before inserting into the bottle, squeeze all air out of the rubber bulb at the top.

### Step 2: Insert and Release

Place the dropper into the oil and slowly release the bulb. This creates suction that draws oil into the glass tube.

### Step 3: Check the Fill Level

Most droppers have measurement lines. A "full" dropper means filled to the typical line marking, not completely full to the top.

### Step 4: Dispense Your Dose

Hold the dropper under your tongue or over food. Squeeze the bulb slowly for controlled dispensing.

---

## Counting Drops vs. Full Droppers

**When to count individual drops:**

- Starting with very low doses (under 10mg)
- Making precise micro-adjustments
- Using high-potency oils where small amounts matter

**When to use full droppers:**

- Established doses you've already found effective
- Lower-potency oils where precision is less critical
- Convenience when you know your standard dose

---

## Tips for Accurate Dosing

**Use consistent technique:**
Different squeeze pressures create different drop sizes. Develop a consistent motion — gentle, steady pressure — and stick with it.

**Hold the dropper vertically:**
Tilting affects drop size. Keep the dropper straight up and down when counting drops.

**Warm thick oils:**
If your CBD oil is thick (especially full-spectrum varieties), hold the bottle in your hands for a minute. Warmer oil flows more consistently.

**Mark your dropper:**
If your dropper lacks measurement lines, use a fine-tip marker to note your usual dose level.

---

## Common Dosing Questions

### How many drops in a full dropper?
Approximately 20 drops per 1ml dropper, though this varies slightly by oil viscosity and dropper design.

### Why does my dropper never fill completely?
Most droppers are designed to fill to a specific line, not the absolute top. The empty space allows for the rubber bulb's squeeze mechanism.

### Can I use a different dropper?
Yes, but recalculate your measurements. Different dropper sizes hold different volumes, affecting your mg-per-drop calculation.

### Should I use the same number of drops every time?
For consistent effects, yes. Varying your dose makes it difficult to assess how CBD affects you.

---

## Troubleshooting Common Issues

**Oil won't draw up:**
- Check that the cap threads properly
- Ensure the bulb isn't cracked
- Try warming the oil if it's thick

**Inconsistent drop sizes:**
- Squeeze more slowly
- Keep the dropper vertical
- Use the same technique each time

**Oil tastes bad:**
- Try flavored CBD oils
- Chase with juice or food
- Add to a beverage (reduces bioavailability but improves taste)

---

## FAQ

### How do I know how much CBD is in each drop?
Calculate by dividing total mg by total drops. For a 1000mg/30ml bottle: 1000 ÷ 600 drops = ~1.67mg per drop.

### Is it okay to take more drops than recommended?
Start with the suggested serving size and increase gradually. More isn't always better — find your personal effective dose.

### How long does a bottle of CBD drops last?
At 1ml per day (one full dropper), a 30ml bottle lasts about 30 days.

### Do all CBD brands use the same dropper size?
Most use standard 1ml droppers, but always verify with the product label. Some brands use 0.5ml or larger droppers.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-take-cbd-sublingually",
    title: "How to Take CBD Sublingually: Under-Tongue Method Explained",
    meta_description:
      "Learn the sublingual CBD technique for maximum absorption. Step-by-step guide to under-tongue dosing, hold times, and why this method works best.",
    content: `# How to Take CBD Sublingually: Under-Tongue Method Explained

**Quick Answer:** Sublingual administration means placing CBD oil under your tongue and holding it there for 60–90 seconds before swallowing. This allows CBD to absorb directly into your bloodstream through the thin tissue beneath your tongue, bypassing first-pass liver metabolism.

## Key Takeaways

- **Sublingual = under the tongue** — the most efficient method for CBD oils
- **Hold for 60–90 seconds** minimum for optimal absorption
- **Bioavailability reaches 20–35%** compared to 6–15% when swallowed
- **Effects begin in 15–30 minutes** versus 1–2 hours for oral ingestion

---

## Why Sublingual Works Better

When you swallow CBD directly, it passes through your digestive system and liver before reaching your bloodstream. This "first-pass metabolism" breaks down a significant portion of the CBD before it can take effect.

The sublingual area — the soft tissue under your tongue — contains numerous blood vessels close to the surface. CBD absorbs directly into these capillaries, entering your bloodstream without passing through the digestive system first.

### Absorption Comparison

| Method | Bioavailability | Time to Effects | Peak Effects |
|--------|-----------------|-----------------|--------------|
| Sublingual | 20–35% | 15–30 minutes | 1–2 hours |
| Swallowed | 6–15% | 45–90 minutes | 2–3 hours |
| Inhaled | 30–40% | 1–5 minutes | 15–30 minutes |

---

## Step-by-Step Sublingual Technique

### 1. Prepare Your Space

Have a mirror nearby if you're new to this method. It helps you see where you're placing the drops.

### 2. Shake the Bottle

CBD and carrier oils can separate. A gentle shake ensures consistent potency with each dose.

### 3. Draw Your Dose

Use the dropper to measure your desired amount. For most people, this ranges from half to one full dropper (0.5–1ml).

### 4. Lift Your Tongue

Curl your tongue back to expose the sublingual tissue — the soft, vein-rich area on the floor of your mouth.

### 5. Deposit the Oil

Squeeze the dropper to release the oil directly onto this tissue. Avoid the top of your tongue, which has less blood vessel access.

### 6. Lower Your Tongue and Hold

Gently lower your tongue over the oil. Keep your mouth closed and resist swallowing. Set a timer for 60–90 seconds.

### 7. Swallow the Remainder

After holding, swallow any remaining oil. The portion that didn't absorb sublingually will still provide some benefit through digestion.

---

## How Long Should You Hold CBD Under Your Tongue?

**Minimum:** 60 seconds
**Optimal:** 90 seconds
**Extended:** Up to 2 minutes

Research suggests most sublingual absorption occurs within the first 60–90 seconds. Holding longer than 2 minutes provides minimal additional benefit and most people find it uncomfortable.

---

## Tips for Maximizing Sublingual Absorption

**Don't eat or drink right before:**
A clean, dry mouth allows better contact between the oil and sublingual tissue.

**Avoid brushing teeth immediately before:**
Toothpaste residue and minor gum irritation from brushing can affect absorption.

**Stay still:**
Moving around while holding can trigger the swallowing reflex. Sit comfortably and relax.

**Practice with the mirror:**
Seeing where the drops land helps ensure consistent placement each time.

---

## Common Challenges and Solutions

**Difficulty holding without swallowing:**
Start with shorter hold times (30 seconds) and gradually increase. It gets easier with practice.

**Oil pools in one spot:**
Tilt your head slightly or gently move your tongue to distribute the oil across more tissue.

**Strong taste bothers you:**
Flavored CBD oils mask the hemp taste. Or, accept that you can swallow after 60 seconds — some absorption is better than none.

**You swallowed immediately by accident:**
Not a problem — you'll still absorb some CBD through digestion. Just try again next dose.

---

## Who Should Use the Sublingual Method?

**Ideal for:**
- People seeking faster onset of effects
- Those wanting maximum value from their CBD oil
- Daily users establishing consistent routines
- Anyone managing acute situations (sudden stress, sleep difficulties)

**May not be ideal for:**
- People who strongly dislike the taste of hemp
- Children who can't hold still for 60+ seconds
- Those with oral health issues affecting the sublingual area

---

## FAQ

### Does sublingual CBD work faster than gummies?
Yes, significantly. Sublingual CBD reaches your bloodstream in 15–30 minutes. Gummies must be digested first, taking 45–90 minutes.

### Can I use any CBD product sublingually?
Oil tinctures are designed for this method. Gummies, capsules, and topicals are not suitable for sublingual use.

### What happens if I swallow before 60 seconds?
You'll still absorb some CBD, but primarily through your digestive system at lower bioavailability. The dose won't be wasted.

### Is there a wrong place to put CBD under my tongue?
Place it under your tongue, not on top. The underside has more blood vessels for absorption. The top of your tongue absorbs much less.

### Should I hold my breath while holding CBD under my tongue?
No need to hold your breath — just don't swallow. Breathe normally through your nose.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-use-cbd-gummies",
    title: "How to Use CBD Gummies: Dosing, Timing & What to Expect",
    meta_description:
      "Learn how to take CBD gummies effectively. Covers proper dosing, when to take them, how long they last, and tips for getting the best results.",
    content: `# How to Use CBD Gummies: Dosing, Timing & What to Expect

**Quick Answer:** Take CBD gummies by chewing thoroughly and swallowing. Effects typically begin within 30–90 minutes and last 4–6 hours. Most gummies contain 10–25mg of CBD each, making dosing straightforward — simply eat the number of gummies needed for your target dose.

## Key Takeaways

- **Chew thoroughly** for faster onset
- **Effects take 30–90 minutes** due to digestion
- **Last 4–6 hours** — longer than sublingual oils
- **Pre-measured doses** make gummies beginner-friendly

---

## Why Choose CBD Gummies?

CBD gummies offer several advantages:

| Feature | Gummies | CBD Oil |
|---------|---------|---------|
| Taste | Pleasant flavors | Earthy hemp taste |
| Dosing | Pre-measured | Requires calculation |
| Discretion | Looks like candy | Obvious dropper bottle |
| Onset | 30–90 minutes | 15–30 minutes (sublingual) |
| Duration | 4–6 hours | 4–6 hours |
| Bioavailability | 6–15% | 20–35% (sublingual) |

Gummies prioritize convenience and taste over speed and absorption efficiency.

---

## How to Take CBD Gummies Properly

### Step 1: Check the Dose Per Gummy

Read the label carefully. A bottle of "30 gummies with 750mg CBD" means each gummy contains 25mg. A "60 count bottle with 600mg" has 10mg per gummy.

### Step 2: Start with One Gummy

If you're new to CBD, begin with a single gummy regardless of the mg content. This establishes a baseline for how you respond.

### Step 3: Chew Thoroughly

Don't swallow gummies whole. Chewing breaks them down for faster digestion and allows some absorption through your oral mucosa (mouth tissue).

### Step 4: Wait Before Taking More

Allow at least 2 hours before deciding if you need more. Gummies take time to work — many people make the mistake of doubling up too soon.

---

## When to Take CBD Gummies

**Timing depends on your goal:**

| Purpose | When to Take | Why |
|---------|--------------|-----|
| Daily wellness | Morning with breakfast | Consistent levels throughout day |
| Sleep support | 60–90 minutes before bed | Allows time for effects to begin |
| Stress management | 1–2 hours before stressful event | Peak effects align with need |
| Exercise recovery | After workout | Supports post-exercise relaxation |

**With food or without?**

Taking gummies with food — especially fatty foods — increases CBD absorption. The gummy itself provides some sugar and gelatin, but pairing with a meal boosts effectiveness.

---

## How Long Do CBD Gummies Take to Work?

**Onset timeline:**
- **30 minutes:** Some people feel early effects
- **60 minutes:** Most common timeframe for noticeable effects
- **90 minutes:** Peak effects for most users

**Factors affecting onset:**
- Body weight and metabolism
- Whether you've eaten recently
- Individual digestive speed
- Previous CBD experience

---

## How Long Do CBD Gummy Effects Last?

CBD gummy effects typically last **4–6 hours**, with some residual effects extending to 8 hours.

**Timeline breakdown:**
- **0–30 min:** No noticeable effects (digestion)
- **30–90 min:** Effects begin
- **1–3 hours:** Peak effects
- **3–6 hours:** Gradual decline
- **6–8 hours:** Minimal residual effects

---

## CBD Gummy Dosing Guide

### General Starting Points

| Experience Level | Starting Dose | Adjustment |
|-----------------|---------------|------------|
| CBD beginner | 10–15mg | Increase by 5mg weekly if needed |
| Some CBD experience | 20–30mg | Adjust based on previous products |
| Regular CBD user | 30–50mg | May need higher doses for effects |

### By Body Weight

| Weight Range | Suggested Starting Dose |
|--------------|------------------------|
| Under 130 lbs | 10–15mg |
| 130–200 lbs | 15–25mg |
| Over 200 lbs | 25–35mg |

These are guidelines, not rules. Individual responses vary significantly.

---

## Tips for Getting the Most from CBD Gummies

**Be consistent:**
Take gummies at the same time daily. Consistent use often produces better results than occasional high doses.

**Keep a log:**
Track when you take gummies, how many, and how you feel 1–2 hours later. This helps identify your optimal dose.

**Store properly:**
Keep gummies in a cool, dry place. Heat can melt them together and degrade the CBD.

**Check expiration:**
Gummies expire. CBD potency decreases over time, and gummy texture degrades.

---

## Common Mistakes to Avoid

1. **Taking more too soon** — Wait at least 2 hours before additional doses
2. **Expecting immediate effects** — Gummies require digestion time
3. **Ignoring the sugar content** — Some gummies are high in added sugars
4. **Storing in heat** — Warm environments melt and damage gummies
5. **Comparing to oils** — Lower bioavailability means you may need higher mg amounts

---

## FAQ

### How many CBD gummies should I take?
Start with one gummy and assess effects after 2 hours. Increase gradually over days or weeks until you find your effective dose.

### Can I take CBD gummies every day?
Yes, daily use is common and often recommended for consistent results. CBD is generally well-tolerated with regular use.

### Do CBD gummies work better on an empty stomach?
No — they actually work better with food, especially fatty foods, which help CBD absorb into your system.

### Why don't I feel anything from CBD gummies?
Common reasons: not waiting long enough, dose too low for your body, product quality issues, or individual body chemistry. Try adjusting one variable at a time.

### Can I cut CBD gummies in half?
Yes, if the dose is too strong. Just note that CBD may not be evenly distributed throughout the gummy.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-take-cbd-capsules",
    title: "How to Take CBD Capsules: Complete Guide to CBD Pills",
    meta_description:
      "Learn how to use CBD capsules effectively. Covers dosing, timing, what to expect, and how capsules compare to other CBD products.",
    content: `# How to Take CBD Capsules: Complete Guide to CBD Pills

**Quick Answer:** Take CBD capsules with water, preferably alongside a meal containing fats for better absorption. Effects begin within 45–90 minutes and last 6–8 hours. Capsules provide precise, consistent dosing — each contains an exact amount of CBD, typically 10–50mg.

## Key Takeaways

- **Take with fatty foods** for up to 4–5x better absorption
- **Effects take 45–90 minutes** — slower than oils, similar to gummies
- **Longest duration** — 6–8 hours of sustained effects
- **Precise dosing** — no measuring or guessing required

---

## Why Choose CBD Capsules?

CBD capsules offer unique advantages for certain users:

| Feature | Capsules | CBD Oil | Gummies |
|---------|----------|---------|---------|
| Dosing | Exact mg | Calculated | Pre-measured |
| Taste | None | Earthy | Flavored |
| Onset | 45–90 min | 15–30 min | 30–90 min |
| Duration | 6–8 hours | 4–6 hours | 4–6 hours |
| Portability | Excellent | Good | Good |
| Discretion | High | Moderate | Moderate |

Capsules are ideal if you want no taste, no measuring, and maximum convenience.

---

## How to Take CBD Capsules Correctly

### Step 1: Identify Your Dose

Read the label for mg per capsule. Common strengths include:
- **10mg** — Low dose, good for beginners
- **25mg** — Standard dose for most users
- **50mg** — Higher dose for experienced users

### Step 2: Take with Water

Swallow the capsule with a full glass of water. This helps the capsule reach your stomach and begin dissolving.

### Step 3: Pair with Food

The critical step many people miss. Taking CBD capsules with food — especially food containing fats — significantly increases absorption.

**Good food pairings:**
- Avocado or guacamole
- Nuts or nut butter
- Eggs cooked in butter or oil
- Full-fat yogurt
- Salmon or fatty fish

### Step 4: Wait for Effects

Unlike sublingual oils, capsules must dissolve and pass through your digestive system. Allow 60–90 minutes before assessing effects.

---

## When to Take CBD Capsules

**For general wellness:**
Take with breakfast for day-long effects, or with dinner for overnight support.

**For sleep:**
Take 60–90 minutes before your target bedtime.

**For sustained coverage:**
Some users take capsules twice daily — morning and evening — for consistent CBD levels.

| Goal | Timing | Rationale |
|------|--------|-----------|
| Daytime support | With breakfast | Effects last through workday |
| Sleep | 90 min before bed | Peak effects align with sleep |
| All-day coverage | Morning + evening | Maintains steady levels |

---

## How Long Do CBD Capsules Take to Work?

**Typical timeline:**
- **30 minutes:** Capsule begins dissolving
- **45–60 minutes:** CBD enters bloodstream
- **60–90 minutes:** Effects become noticeable
- **2–3 hours:** Peak effects reached

**Factors that affect onset:**
- Recent food intake (faster with meals)
- Metabolism speed
- Capsule type (some use faster-dissolving designs)
- Stomach acid levels

---

## How Long Do CBD Capsule Effects Last?

CBD capsules typically provide **6–8 hours** of effects — the longest duration among common CBD products.

This extended duration happens because:
1. Slow digestion releases CBD gradually
2. Liver metabolism creates longer-lasting metabolites
3. Fat-soluble CBD stores temporarily in body fat

**Effect timeline:**
| Time | What to Expect |
|------|----------------|
| 0–1 hour | No noticeable effects |
| 1–3 hours | Effects build and peak |
| 3–6 hours | Sustained, steady effects |
| 6–8 hours | Gradual decline |

---

## CBD Capsule Dosing Guidelines

### Starting Doses by Experience

| CBD Experience | Recommended Start |
|----------------|-------------------|
| Complete beginner | 10–15mg |
| Some experience | 20–25mg |
| Regular CBD user | 25–50mg |

### Adjusting Your Dose

- **Too subtle:** Increase by 5–10mg after 1 week
- **Too strong:** Reduce by half or switch to lower-mg capsules
- **Inconsistent effects:** Focus on consistent timing and food pairing

---

## Types of CBD Capsules

**Standard capsules:**
CBD oil in a gelatin or vegetable capsule shell. Most common type.

**Softgels:**
Liquid CBD in a soft, easy-to-swallow gel coating. Often higher bioavailability due to liquid form.

**Time-release capsules:**
Designed to release CBD slowly over several hours. Less common but available from some brands.

**Water-soluble capsules:**
Use nano-emulsion technology for faster absorption. May onset in 30–45 minutes instead of 60–90.

---

## Tips for Best Results

**Consistency matters:**
Taking capsules at the same time daily helps maintain stable CBD levels in your system.

**Don't open the capsules:**
The capsule shell protects CBD from stomach acid and ensures it reaches your intestines where absorption occurs.

**Track your response:**
Note when you take capsules and how you feel 2 hours later. This data helps optimize your routine.

**Store properly:**
Keep capsules in a cool, dry place. Avoid bathroom cabinets where humidity can degrade the capsules.

---

## FAQ

### Can I take CBD capsules on an empty stomach?
You can, but absorption decreases significantly. Taking with food (especially fats) can increase absorption 4–5 times.

### How many CBD capsules can I take per day?
This depends on the mg per capsule and your needs. Most people take 1–2 capsules daily. Start with one and adjust based on response.

### Why do capsules take longer to work than CBD oil?
Capsules must dissolve in your stomach and pass through your digestive system before CBD reaches your bloodstream. Sublingual oil absorbs directly through mouth tissue.

### Can I take CBD capsules with other supplements?
Generally yes, but consult a healthcare provider about potential interactions, especially with medications.

### Do CBD capsules expire?
Yes. Check the expiration date on the bottle. Potency decreases over time, and capsule shells can degrade.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
];

async function main() {
  console.log("Inserting Usage guides (batch 1)...\n");

  for (const article of articles) {
    const { error } = await supabase.from("kb_articles").insert(article);

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log("\nBatch 1 complete (5/15 usage guides)");
}

main().catch(console.error);
