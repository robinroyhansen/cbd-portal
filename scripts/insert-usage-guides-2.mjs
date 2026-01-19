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
    slug: "how-to-apply-cbd-cream",
    title: "How to Apply CBD Cream: Topical Application Guide",
    meta_description:
      "Learn the correct way to apply CBD cream for targeted relief. Step-by-step instructions for massaging CBD into skin, how much to use, and when to reapply.",
    content: `# How to Apply CBD Cream: Topical Application Guide

**Quick Answer:** Apply CBD cream directly to clean, dry skin and massage thoroughly until absorbed. Use a dime-to-quarter sized amount for small areas, more for larger regions. Reapply every 4–6 hours as needed. CBD topicals work locally — they don't enter your bloodstream.

## Key Takeaways

- **Apply to clean, dry skin** for best absorption
- **Massage thoroughly** — friction helps CBD penetrate deeper
- **Effects are local** — CBD stays in the applied area
- **Reapply every 4–6 hours** for sustained effects

---

## How CBD Cream Works

Unlike CBD oil you swallow or vape, topical CBD doesn't reach your bloodstream. Instead, it interacts with cannabinoid receptors in your skin, muscles, and local tissues.

This makes CBD cream ideal for:
- Targeted application to specific areas
- Skin-specific concerns
- Muscle and joint comfort
- People who prefer not to ingest CBD

---

## Step-by-Step Application

### Step 1: Clean the Area

Wash the target area with mild soap and water. Remove any lotions, oils, or sweat that could create a barrier between the CBD cream and your skin.

### Step 2: Dry Completely

Pat the area dry with a clean towel. Applying cream to wet skin dilutes the product and reduces absorption.

### Step 3: Dispense the Right Amount

| Area Size | Amount of Cream |
|-----------|-----------------|
| Small (wrist, finger) | Dime-sized |
| Medium (knee, elbow) | Nickel-sized |
| Large (back, thigh) | Quarter-sized or more |

Start with less — you can always add more.

### Step 4: Apply and Massage

Place the cream on your skin and massage using circular motions. The goal is to:
- Spread evenly across the entire target area
- Generate mild friction (increases absorption)
- Work the cream fully into the skin

**Massage for 30–60 seconds** or until the cream is no longer visible on the surface.

### Step 5: Wash Your Hands

Unless your hands are the target area, wash them after application to avoid accidentally transferring CBD cream to your eyes or mouth.

---

## How Much CBD Cream to Use

**There's no universal dose for topicals.** The amount depends on:

- Size of the area
- Concentration of the product (mg of CBD per oz)
- Your individual skin and needs

**General guideline:** Apply enough to create a thin, even layer across the entire target area. The cream should absorb within 1–2 minutes without leaving a thick residue.

---

## When and How Often to Apply

**Onset:** Effects typically begin within 15–45 minutes.

**Duration:** Most people experience effects for 4–6 hours.

**Frequency:** Reapply as needed, typically 2–4 times daily for ongoing concerns. There's no established maximum for topical application.

| Usage Pattern | Application Frequency |
|---------------|----------------------|
| Occasional use | Once when needed |
| Regular support | 2–3 times daily |
| Intensive use | 3–4 times daily |

---

## Tips for Better Results

**Warm the area first:**
Warm skin absorbs better. Try applying after a warm shower or placing a warm towel on the area for a few minutes first.

**Exfoliate occasionally:**
Dead skin cells can reduce absorption. Gentle exfoliation once or twice weekly keeps skin receptive.

**Layer if needed:**
For stubborn areas, apply a thin layer, let it absorb, then apply a second layer.

**Don't cover immediately:**
Let the cream absorb for 5–10 minutes before covering with clothing or bandages.

---

## What to Expect

**First application:**
Many people notice soothing sensations within 30 minutes. Full effects may take several days of consistent use.

**Ongoing use:**
Regular application tends to produce more consistent results than occasional use.

**What you won't feel:**
Topical CBD doesn't produce the systemic effects associated with oils or edibles. You won't feel it throughout your body — only in the applied area.

---

## CBD Cream vs. Other Topicals

| Product | Texture | Best For | Absorption |
|---------|---------|----------|------------|
| Cream | Rich, moisturizing | Dry skin, large areas | Moderate |
| Balm | Thick, waxy | Targeted spots | Slower, longer-lasting |
| Lotion | Light, spreads easily | Body-wide use | Fast |
| Salve | Semi-solid, concentrated | Intensive application | Moderate |
| Roll-on | Liquid, no-mess | Quick application | Fast |

---

## FAQ

### How long does CBD cream take to work?
Most people notice effects within 15–45 minutes, with peak effects around 1 hour after application.

### Can I use CBD cream on my face?
Yes, if the product is formulated for facial use. Check the label — some CBD creams contain ingredients not suitable for facial skin.

### Will CBD cream show up on a drug test?
Unlikely. Topical CBD typically doesn't enter the bloodstream in significant amounts. However, if you're subject to drug testing, choose CBD isolate products with 0% THC.

### Can I use too much CBD cream?
Excess cream creates waste rather than harm. If you've applied too much, the extra simply sits on your skin without absorbing. Wipe off the excess.

### Should I refrigerate CBD cream?
Not necessary for most products, but cool storage can extend shelf life. Don't freeze — this can change the texture.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-apply-cbd-topicals",
    title: "How to Apply CBD Topicals: Balms, Salves, Lotions & Roll-Ons",
    meta_description:
      "Complete guide to using CBD topicals. Learn application techniques for balms, salves, lotions, and roll-ons, plus tips for maximum absorption.",
    content: `# How to Apply CBD Topicals: Balms, Salves, Lotions & Roll-Ons

**Quick Answer:** Apply CBD topicals to clean skin and massage until absorbed. Different formulations — balms, salves, lotions, roll-ons — have unique textures and best uses, but all work by delivering CBD directly to the applied area without entering your bloodstream.

## Key Takeaways

- **Each topical type has distinct advantages** — choose based on your needs
- **All require clean, dry skin** for optimal absorption
- **Massage increases effectiveness** by pushing CBD deeper into tissue
- **Effects are localized** — CBD stays where you apply it

---

## Understanding CBD Topical Types

### CBD Balm

**Texture:** Thick, solid at room temperature, melts with body heat
**Base:** Beeswax, shea butter, coconut oil

**Best for:**
- Small, targeted areas
- Longer-lasting application (slower absorption)
- Dry or cracked skin

**Application:** Scoop a small amount, warm between fingers, press and massage into skin.

---

### CBD Salve

**Texture:** Semi-solid, softer than balm, spreadable
**Base:** Oil and wax blend, often with herbal infusions

**Best for:**
- Medium-sized areas
- Traditional, concentrated formulas
- Thick, protective layer

**Application:** Apply directly to skin, massage in circular motions until absorbed.

---

### CBD Lotion

**Texture:** Light, creamy, absorbs quickly
**Base:** Water and oil emulsion

**Best for:**
- Large body areas
- Daily moisturizing with CBD
- Quick absorption needs
- Under clothing

**Application:** Pump or squeeze desired amount, spread over area, rub until absorbed.

---

### CBD Roll-On

**Texture:** Liquid, glides on smoothly
**Base:** Oil or gel-based liquid

**Best for:**
- Mess-free application
- On-the-go use
- Post-workout application
- Areas you can't easily massage yourself

**Application:** Roll directly onto skin, let absorb naturally or gently spread with fingertips.

---

## Comparison Table

| Type | Absorption Speed | Duration | Mess Level | Best Use |
|------|-----------------|----------|------------|----------|
| Balm | Slow | Long | Low | Targeted spots |
| Salve | Medium | Medium-Long | Medium | Intensive care |
| Lotion | Fast | Shorter | Low | Large areas |
| Roll-On | Fast | Medium | None | Quick application |

---

## Step-by-Step Application Guide

### For Thick Topicals (Balms, Salves)

1. **Warm the product** — Rub between fingers until pliable
2. **Apply to clean skin** — Press firmly onto target area
3. **Massage deeply** — Use circular and pressing motions for 60 seconds
4. **Let it sit** — Allow 5–10 minutes before covering with clothing

### For Thin Topicals (Lotions, Roll-Ons)

1. **Dispense onto skin** — Apply directly to target area
2. **Spread evenly** — Cover the entire region in a thin layer
3. **Light massage** — Rub gently to encourage absorption
4. **Allow to dry** — Wait 2–3 minutes before dressing

---

## How to Maximize Absorption

**Temperature matters:**
Warm skin absorbs better. Apply after a shower or use a warm compress first.

**Preparation helps:**
Gently exfoliating removes dead skin cells that can block absorption.

**Technique counts:**
Firm, circular massage motions push topicals deeper than light spreading.

**Timing is key:**
For best results, don't rush. Take 60 seconds to fully work the product into your skin.

---

## How Much to Apply

| Area | Thin Topical | Thick Topical |
|------|--------------|---------------|
| Finger/toe | Pea-sized | Pea-sized |
| Wrist/ankle | Dime-sized | Fingertip amount |
| Knee/elbow | Nickel-sized | Dime-sized |
| Shoulder/hip | Quarter-sized | Nickel-sized |
| Back (section) | Multiple applications | Quarter-sized |

**Start conservatively.** It's easier to add more than to waste product or create a greasy residue.

---

## When to Reapply

**General guideline:** Every 4–6 hours as needed.

**Signs it's time to reapply:**
- Effects begin to fade
- Area feels tense again
- Skin has fully absorbed previous application

**No known maximum:** Topical CBD is considered safe for frequent reapplication. However, excessive use wastes product without providing additional benefit.

---

## Choosing the Right Topical

**For quick relief:** Roll-on or lotion
**For lasting application:** Balm
**For intensive focus:** Salve
**For full-body use:** Lotion
**For travel:** Roll-on

**Consider your lifestyle:**
- Active/sweaty? Choose fast-absorbing lotions or roll-ons
- Desk work? Balms and salves won't transfer to surfaces
- Before bed? Thick balms have time to absorb overnight

---

## FAQ

### Can I layer different topical types?
Yes. Some people apply a fast-absorbing lotion first, then seal with a balm for prolonged effects.

### Do CBD topicals stain clothing?
Most don't if fully absorbed before dressing. Balms and salves are more likely to leave oily residue on fabric if applied too heavily.

### How do I know if a topical is working?
Effects are subtle — often described as soothing comfort in the applied area. Don't expect dramatic sensations.

### Can I use CBD topicals with other skincare products?
Generally yes. Apply CBD topical first (so it directly contacts skin), then layer other products on top if needed.

### Why does my roll-on dry so fast?
Roll-ons often contain alcohol or fast-evaporating carriers for quick absorption. This is intentional — it minimizes mess and allows quick drying.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-vape-cbd",
    title: "How to Vape CBD: Beginner's Guide to CBD Vaping",
    meta_description:
      "Learn how to vape CBD safely and effectively. Covers devices, e-liquids, cartridges, dosing, and what to expect when inhaling CBD vapor.",
    content: `# How to Vape CBD: Beginner's Guide to CBD Vaping

**Quick Answer:** Vaping CBD delivers effects in 1–5 minutes by inhaling vaporized CBD oil through a vape device. Use CBD-specific vape products (not regular CBD oil), start with 1–2 small puffs, wait 10 minutes, and adjust as needed. Vaping offers the fastest onset and highest bioavailability (30–40%) of any CBD method.

## Key Takeaways

- **Fastest onset** — effects begin in 1–5 minutes
- **Highest bioavailability** — 30–40% absorption
- **Use only vape-specific CBD** — never vape regular CBD oil
- **Short duration** — effects last 1–3 hours

---

## Why People Vape CBD

| Advantage | Explanation |
|-----------|-------------|
| Speed | Effects in minutes, not hours |
| Efficiency | More CBD reaches your system |
| Control | Easy to micro-dose with single puffs |
| Portability | Compact devices fit anywhere |

**The tradeoff:** Effects don't last as long as edibles or capsules.

---

## CBD Vaping Products Explained

### CBD Vape Juice (E-Liquid)

**What it is:** CBD mixed with vegetable glycerin (VG) and propylene glycol (PG)
**Used with:** Refillable vape pens or tanks
**Pros:** Cost-effective, customizable flavors
**Cons:** Requires refilling, device maintenance

### CBD Vape Cartridges

**What it is:** Pre-filled cartridge with CBD oil
**Used with:** 510-thread battery pens
**Pros:** No refilling, consistent quality
**Cons:** More expensive long-term

### CBD Disposable Vapes

**What it is:** Single-use device with built-in battery and pre-filled CBD
**Used with:** Nothing — it's all-in-one
**Pros:** No setup, no charging (usually), very convenient
**Cons:** Most expensive per mg, creates waste

---

## Choosing a Vape Device

### For Beginners

**Disposable vapes** — Zero learning curve. Unwrap and inhale.

**Cartridge + battery** — Simple setup. Screw cartridge onto battery, inhale.

### For Regular Users

**Refillable pod system** — Better value, choose your own e-liquid.

**Tank system** — Maximum customization, requires more knowledge.

| Device Type | Ease of Use | Cost Over Time | Best For |
|-------------|-------------|----------------|----------|
| Disposable | Very easy | High | Trying vaping |
| Cartridge + battery | Easy | Medium | Regular users |
| Pod system | Medium | Lower | Experienced vapers |

---

## How to Vape CBD: Step-by-Step

### Using a Disposable Vape

1. **Remove from packaging**
2. **Check for activation** — Some have buttons, most activate on inhale
3. **Take a small puff** — Inhale gently for 2–3 seconds
4. **Hold briefly** — Keep vapor in lungs for 1–2 seconds
5. **Exhale** — Breathe out slowly
6. **Wait and assess** — Wait 10 minutes before additional puffs

### Using a Cartridge System

1. **Charge the battery** — Most use USB charging
2. **Attach cartridge** — Screw onto 510-thread battery
3. **Activate** — Press button (if applicable) while inhaling
4. **Take small puffs** — 2–3 second draws
5. **Start low** — Begin with 1–2 puffs

### Using E-Liquid with Refillable Device

1. **Fill tank or pod** — Follow device instructions
2. **Prime the coil** — Let sit 5–10 minutes before first use
3. **Start at low wattage** — Prevent burning the e-liquid
4. **Inhale gently** — CBD e-liquid doesn't require strong draws

---

## CBD Vaping Dosage Guide

**Starting point:** 1–2 puffs (approximately 1–5mg CBD per puff)

**Wait period:** 10 minutes between sessions

**Building up:** Add 1 puff at a time until desired effects

### Typical CBD Amounts Per Puff

| Product Strength | Approximate mg/Puff |
|-----------------|---------------------|
| Low (100–250mg/ml) | 1–2mg |
| Medium (250–500mg/ml) | 2–4mg |
| High (500–1000mg/ml) | 4–8mg |

**Note:** These are estimates. Actual amounts vary by device and inhalation style.

---

## Safety Considerations

**Only vape CBD products designed for vaping:**
- Never vape regular CBD oil (MCT oil base can damage lungs)
- Never vape CBD tinctures (not formulated for inhalation)
- Look for VG/PG base or CO2-extracted vape oils

**Quality matters:**
- Choose products with third-party lab tests
- Avoid products with vitamin E acetate
- Buy from reputable brands

**Know the risks:**
- Long-term vaping effects still being studied
- May irritate airways, especially for non-smokers
- Not recommended for those with respiratory conditions

---

## What to Expect When Vaping CBD

**Onset:** 1–5 minutes
**Peak effects:** 10–30 minutes
**Duration:** 1–3 hours

**Physical sensations:**
- Subtle relaxation
- Possible mild throat sensation (normal)
- No "high" — CBD is non-intoxicating

**If you cough:**
Take smaller, gentler puffs. Lower wattage if using adjustable device.

---

## Maintaining Your Vape Device

**For cartridge systems:**
- Store upright to prevent leaking
- Keep battery charged
- Replace cartridges when empty or flavor degrades

**For refillable devices:**
- Clean regularly (weekly for daily users)
- Replace coils per manufacturer schedule
- Don't let e-liquid run completely dry

---

## FAQ

### How many puffs of CBD should I take?
Start with 1–2 puffs, wait 10 minutes, and add more if needed. There's no universal number — it depends on your body and the product strength.

### Is vaping CBD legal?
CBD derived from hemp (under 0.3% THC) is legal federally in the US, but vaping laws vary by state and country. Check local regulations.

### Does vaping CBD smell?
Slightly — CBD vape produces vapor with a faint smell that dissipates quickly. It's far less noticeable than smoking cannabis.

### Can I vape too much CBD?
Excessive CBD may cause drowsiness or mild stomach upset, but serious risks are rare. Start low and increase gradually.

### How do I know when a disposable vape is empty?
Flavor weakens, vapor production drops, and some devices have indicator lights. Most disposables last 200–800 puffs.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen. Vaping carries inherent risks and may not be suitable for everyone.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-use-cbd-patches",
    title: "How to Use CBD Patches: Transdermal Application Guide",
    meta_description:
      "Learn how CBD patches work and how to apply them correctly. Covers placement, duration, benefits of transdermal CBD delivery, and what to expect.",
    content: `# How to Use CBD Patches: Transdermal Application Guide

**Quick Answer:** Apply a CBD patch to clean, dry skin on a venous area (inner wrist, ankle, or upper arm). Press firmly for 30 seconds and leave on for 8–12 hours or as directed. Transdermal patches deliver CBD slowly through your skin into your bloodstream, providing steady, long-lasting effects without pills or tinctures.

## Key Takeaways

- **Apply to venous areas** where blood vessels are close to skin surface
- **Slow, steady release** over 8–12+ hours
- **Systemic effects** — CBD enters bloodstream, affects whole body
- **Set-and-forget convenience** — no re-dosing throughout the day

---

## How CBD Patches Work

Unlike CBD creams that stay local, transdermal patches use specialized technology to push CBD through your skin into your bloodstream.

**Key technologies:**
- **Permeation enhancers** — Ingredients that temporarily increase skin permeability
- **Reservoir systems** — Contain a pool of CBD released over time
- **Matrix systems** — CBD embedded in adhesive, releases as adhesive warms

Once in your bloodstream, CBD circulates throughout your body — similar to taking CBD oil orally but with steadier levels.

---

## Benefits of CBD Patches

| Advantage | Explanation |
|-----------|-------------|
| Consistent delivery | Steady CBD levels, no peaks and valleys |
| Long-lasting | 8–12+ hours from single application |
| No dosing | Pre-measured, no guessing amounts |
| Bypasses digestion | Avoids first-pass liver metabolism |
| Discreet | Hidden under clothing |

---

## Step-by-Step Application

### Step 1: Choose Your Location

**Best placement areas** (venous locations where skin is thinner):
- Inner wrist
- Inner ankle
- Inside of upper arm
- Top of foot
- Lower abdomen

**Avoid:**
- Hairy areas (reduces adhesion)
- Irritated or broken skin
- Areas that bend excessively (may dislodge patch)

### Step 2: Prepare the Skin

Wash the area with soap and water. Dry completely. Don't apply lotions, oils, or powders — these create barriers that reduce absorption and adhesion.

### Step 3: Apply the Patch

1. Remove patch from packaging
2. Peel off backing without touching adhesive
3. Place on skin and press firmly
4. Hold pressure for 30 seconds
5. Smooth edges to ensure seal

### Step 4: Wear as Directed

Most patches work for 8–12 hours. Some are designed for 24-hour wear. Check your product's instructions.

### Step 5: Remove and Dispose

Peel off slowly from one edge. Fold adhesive sides together and dispose in trash. Don't flush.

---

## What to Expect

**Onset:** 1–2 hours (slower than oils or vaping)
**Peak effects:** Gradual plateau rather than sharp peak
**Duration:** 8–12 hours of steady effects

**The experience:**
Patches provide subtle, sustained effects rather than an obvious "kick in." Many users describe feeling consistently calm or comfortable throughout the day without noticeable ups and downs.

---

## Patch Dosing

CBD patches come pre-dosed, typically ranging from 15mg to 60mg per patch.

| Patch Strength | Best For | Duration |
|----------------|----------|----------|
| 15–20mg | CBD beginners, low-dose needs | 8–12 hours |
| 30–40mg | Regular CBD users | 8–12 hours |
| 50–60mg | Higher tolerance, intensive needs | 12–24 hours |

**Can't adjust mid-application:** Unlike oils where you can take more drops, patches deliver their fixed dose. If you need more CBD, you'll need to use a higher-strength patch or supplement with another method.

---

## Tips for Best Results

**Rotate application sites:**
Don't apply to the same spot repeatedly. This prevents skin irritation and maintains consistent absorption.

**Secure if needed:**
If edges lift during activity, cover with medical tape or a bandage. Don't cover the entire patch — some airflow helps.

**Time it right:**
For all-day effects, apply in the morning. For sleep, apply a few hours before bed.

**Track your experience:**
Note how long effects last for you — some people metabolize faster than others.

---

## Patches vs. Other CBD Methods

| Feature | Patches | Oil | Gummies | Topicals |
|---------|---------|-----|---------|----------|
| Onset | 1–2 hours | 15–30 min | 30–90 min | 15–45 min |
| Duration | 8–12 hours | 4–6 hours | 4–6 hours | 4–6 hours |
| Systemic? | Yes | Yes | Yes | No |
| Dosing effort | None | Measured | None | Estimated |
| Reapplication | Once daily | 1–2x daily | 1–2x daily | 2–4x daily |

---

## Common Questions About Application

**Can I shower with a CBD patch?**
Most patches are water-resistant but not waterproof. Brief showers are usually fine, but extended soaking may loosen adhesive.

**What if my patch falls off?**
Reapply if possible, or apply a new one. Effects may be incomplete if the patch didn't stay on long enough.

**Can I exercise with a patch?**
Yes, but excessive sweating can reduce adhesion. Choose a location less prone to sweating or secure with medical tape.

---

## FAQ

### How long does it take for a CBD patch to start working?
Expect 1–2 hours for initial effects, with steady levels maintained throughout the wear period.

### Can I cut a CBD patch in half for a smaller dose?
Generally not recommended. Cutting can disrupt the patch's delivery mechanism and may not provide accurate half-dosing.

### Will a CBD patch show up on a drug test?
Most drug tests screen for THC, not CBD. However, full-spectrum patches contain trace THC. For complete assurance, choose isolate-based patches.

### Do CBD patches cause skin irritation?
Some people experience minor redness at the application site. Rotating sites and removing gently helps prevent irritation.

### Can I wear a CBD patch while sleeping?
Yes, many people apply patches before bed for overnight effects. Just ensure it's secure enough not to dislodge during sleep.

---

*This article is for informational purposes only and does not constitute medical advice. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-use-cbd-flower",
    title: "How to Use CBD Flower: Smoking, Vaping & Preparing Hemp Buds",
    meta_description:
      "Learn how to use CBD hemp flower through smoking, dry herb vaping, and other methods. Covers preparation, devices, dosing, and what to expect.",
    content: `# How to Use CBD Flower: Smoking, Vaping & Preparing Hemp Buds

**Quick Answer:** CBD flower can be smoked in joints, pipes, or bongs, or vaped in a dry herb vaporizer. Grind the flower first, use your chosen device, and start with 1–2 small inhalations. Effects begin within minutes and last 1–3 hours. CBD flower provides the full spectrum of hemp cannabinoids and terpenes.

## Key Takeaways

- **Fastest effects** — onset within 1–5 minutes
- **Full-spectrum experience** — all hemp compounds together
- **Multiple consumption methods** — smoke, vape, or infuse
- **Legal but nuanced** — check local laws, flower looks like cannabis

---

## What is CBD Flower?

CBD flower (also called hemp flower or CBD bud) is the dried, cured flower of the hemp plant. It contains:

- **High CBD levels** (typically 10–25%)
- **Trace THC** (legally under 0.3%)
- **Other cannabinoids** (CBG, CBC, etc.)
- **Terpenes** (aromatic compounds)
- **Flavonoids** (plant compounds)

Unlike processed CBD products, flower delivers the complete range of hemp compounds in their natural ratios — often called the "entourage effect."

---

## Methods for Using CBD Flower

### Smoking

**Options:**
- Joints (rolled in papers)
- Pipes (glass, wood, metal)
- Bongs (water filtration)
- One-hitters (small pipes for single hits)

**Pros:** Fast effects, no device charging, ritual enjoyment
**Cons:** Smoke inhalation, smell, less discreet

### Dry Herb Vaping

**How it works:** Heats flower to release cannabinoids without combustion

**Temperature ranges:**
- Low (160–180°C / 320–356°F): Light vapor, more flavor
- Medium (180–200°C / 356–392°F): Balanced effects
- High (200–220°C / 392–428°F): Stronger effects, less flavor

**Pros:** No combustion, better flavor, more efficient extraction
**Cons:** Device cost, maintenance, charging needed

### Other Methods

| Method | Description | Best For |
|--------|-------------|----------|
| Infusion | Extract into oils or butter | Edibles, cooking |
| Tea | Steep in hot water with fat | Gentle, oral consumption |
| Topical | Infuse into carrier oil | Localized skin application |

---

## How to Prepare CBD Flower

### Step 1: Examine Your Flower

Quality CBD flower should be:
- Dense, sticky buds (not loose and dry)
- Rich color (greens with orange or purple accents)
- Visible trichomes (crystal-like coating)
- Pleasant aroma (not musty or hay-like)

### Step 2: Grind the Flower

**Why grind?**
- Even burning/heating
- Better airflow
- More consistent dose

**How much to grind:**
| Method | Amount |
|--------|--------|
| Joint | 0.5–1 gram |
| Pipe bowl | 0.25–0.5 gram |
| Vaporizer chamber | 0.1–0.25 gram |

Use a grinder designed for dry herbs. Don't over-grind to powder.

### Step 3: Load Your Device

**For joints:** Distribute evenly along paper, roll, seal
**For pipes:** Pack loosely enough for airflow, don't compress
**For vaporizers:** Fill chamber without overpacking

---

## How to Smoke CBD Flower

### Rolling a Joint

1. Place paper with adhesive side up, facing you
2. Spread ground flower evenly along center
3. Roll back and forth to shape
4. Tuck, roll up, lick adhesive
5. Pack the end gently, twist tip
6. Light tip while drawing gently

### Using a Pipe

1. Ensure pipe is clean
2. Pack bowl loosely
3. Hold flame to edge of flower (not center)
4. Inhale slowly while lighting
5. Cover carb hole, then release to clear
6. Start with 1–2 small puffs

### Using a Bong

1. Fill chamber with water above downstem
2. Pack bowl with ground flower
3. Light while inhaling gently
4. When chamber fills with smoke, remove bowl
5. Inhale to clear chamber

---

## How to Vape CBD Flower

### With a Dry Herb Vaporizer

1. Charge device fully
2. Grind flower medium-fine
3. Load chamber without packing tight
4. Set temperature (start at 180°C/356°F)
5. Wait for device to heat
6. Draw slowly for 5–10 seconds
7. Exhale, wait, assess effects
8. Increase temperature for stronger effects

### Device Types

| Type | Price Range | Best For |
|------|-------------|----------|
| Portable pen | $50–150 | On-the-go |
| Portable high-end | $150–300 | Quality vapor, portability |
| Desktop | $150–500 | Home use, group sessions |

---

## CBD Flower Dosing

**Start low:** 1–2 small puffs
**Wait:** 5–10 minutes before more
**Build gradually:** Add puffs until comfortable

**What affects dose:**
- CBD percentage of flower
- Inhalation depth
- Number of puffs
- Personal tolerance

---

## What to Expect

**Onset:** 1–5 minutes
**Peak:** 15–30 minutes
**Duration:** 1–3 hours

**Typical effects:**
- Relaxation without intoxication
- Clarity (not foggy)
- Calm alertness
- No "high" (less than 0.3% THC)

**Flavor profile:**
CBD flower has rich terpene profiles — expect earthy, piney, citrus, or floral notes depending on strain.

---

## Storage Tips

- Store in airtight container
- Keep in cool, dark place
- Use humidity packs (58–62% RH) for long-term storage
- Don't refrigerate or freeze
- Use within 6–12 months for best quality

---

## Legal Considerations

CBD flower is legal federally in the US (under 0.3% THC), but:
- Some states restrict hemp flower
- Looks and smells like cannabis
- May cause issues during traffic stops
- Check local laws before purchasing or traveling

Always carry purchase receipts and certificates of analysis showing THC compliance.

---

## FAQ

### Will CBD flower make me high?
No, CBD flower contains less than 0.3% THC, which isn't enough to produce intoxication. You may feel relaxed but not high.

### How much CBD is in hemp flower?
Most quality CBD flower contains 10–25% CBD. A gram of 15% flower contains approximately 150mg of CBD.

### Is smoking CBD flower safe?
Inhaling any smoke carries risks. Vaping at appropriate temperatures is considered less harmful than combustion, but neither is risk-free.

### Can I fail a drug test from CBD flower?
Possible. Even legal hemp flower contains trace THC that may accumulate with regular use. If you're tested, consider CBD isolate products instead.

### What's the difference between CBD flower and marijuana?
Both come from cannabis plants. CBD flower (hemp) has high CBD and less than 0.3% THC. Marijuana has higher THC (5–30%) and produces intoxication.

---

*This article is for informational purposes only and does not constitute medical advice. Inhaling any substance carries inherent risks. Consult a healthcare provider before starting any CBD regimen.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
];

async function main() {
  console.log("Inserting Usage guides (batch 2)...\n");

  for (const article of articles) {
    const { error } = await supabase.from("kb_articles").insert(article);

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log("\nBatch 2 complete (10/15 usage guides)");
}

main().catch(console.error);
