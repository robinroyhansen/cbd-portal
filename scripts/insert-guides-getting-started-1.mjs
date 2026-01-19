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

// Guides category ID
const GUIDES_CATEGORY_ID = 'bfd651e6-7fb3-4756-a19d-7ad2ab98a2d2';

const articles = [
  {
    slug: 'how-to-start-taking-cbd',
    title: 'How to Start Taking CBD: A Complete Beginner\'s Guide',
    excerpt: 'Learn how to start taking CBD safely and effectively. Step-by-step guide covering product selection, dosing, timing, and what to expect in your first weeks.',
    meta_title: 'How to Start Taking CBD: Step-by-Step Beginner\'s Guide',
    meta_description: 'Ready to try CBD? Learn how to start safely with our complete guide. Covers choosing products, finding your dose, timing, and realistic expectations.',
    reading_time: 12,
    content: `## Quick Answer

**To start taking CBD, begin with a low dose (10-20mg) of a quality [full spectrum](/glossary/full-spectrum) or [broad spectrum](/glossary/broad-spectrum) CBD oil, take it consistently at the same time each day, and gradually increase every 5-7 days until you find your optimal dose.** Most people notice effects within 1-4 weeks of consistent use. Start with sublingual oil for the best balance of absorption and ease of use.

---

## Key Takeaways

- **Start low, go slow**: Begin with 10-20mg daily and increase gradually
- **Choose quality first**: Look for third-party tested products with a [Certificate of Analysis](/articles/read-lab-reports)
- **Be consistent**: Take CBD at the same time daily for best results
- **Give it time**: Allow 2-4 weeks before evaluating effectiveness
- **Track your experience**: Keep notes on dose, timing, and effects
- **Consult your doctor**: Especially if you take medications

---

## Step 1: Understand What You're Taking

Before starting CBD, it helps to understand the basics.

### What Is CBD?

[CBD (cannabidiol)](/glossary/cannabidiol) is a naturally occurring compound found in hemp plants. Unlike [THC](/glossary/tetrahydrocannabinol), CBD is non-intoxicating—it won't get you high.

### How CBD Works

CBD interacts with your [endocannabinoid system (ECS)](/articles/endocannabinoid-system), a network of receptors that helps regulate:

| System | Function |
|--------|----------|
| **Mood** | Stress response, emotional balance |
| **Sleep** | Sleep-wake cycles |
| **Pain** | Pain perception, inflammation |
| **Appetite** | Hunger signals |
| **Immune function** | Inflammatory response |

---

## Step 2: Choose Your Product Type

Different CBD products suit different needs and preferences.

### Product Comparison for Beginners

| Product | Onset | Duration | Best For | Ease of Dosing |
|---------|-------|----------|----------|----------------|
| **[CBD Oil](/articles/cbd-oil-guide)** | 15-30 min | 4-6 hours | General use, flexibility | Excellent |
| **[CBD Gummies](/articles/cbd-gummies-guide)** | 30-60 min | 6-8 hours | Convenience, taste | Good |
| **[CBD Capsules](/articles/cbd-capsules-guide)** | 30-60 min | 6-8 hours | Precision, no taste | Excellent |
| **[CBD Topicals](/articles/cbd-topicals-guide)** | 15-45 min | 2-4 hours | Localised concerns | Moderate |

### Recommended Starting Product

**For most beginners, CBD oil (tincture) is ideal because:**

- Flexible dosing (easy to adjust)
- Relatively fast onset
- Good [bioavailability](/articles/cbd-bioavailability) when taken sublingually
- Easy to track exact amounts

---

## Step 3: Choose Your Spectrum Type

CBD products come in three main types based on their cannabinoid content.

### Spectrum Comparison

| Type | Contains | THC | Best For |
|------|----------|-----|----------|
| **[Full Spectrum](/articles/what-is-full-spectrum-cbd)** | All cannabinoids, terpenes | <0.2% | Maximum [entourage effect](/glossary/entourage-effect) |
| **[Broad Spectrum](/articles/what-is-broad-spectrum-cbd)** | Multiple cannabinoids, no THC | 0% | Entourage effect without THC |
| **[Isolate](/articles/what-is-cbd-isolate)** | Pure CBD only | 0% | THC-sensitive, drug testing |

### Which Should You Choose?

| Your Situation | Recommended Type |
|----------------|------------------|
| **First time, no THC concerns** | Full spectrum |
| **Subject to drug testing** | Broad spectrum or isolate |
| **Sensitive to THC** | Broad spectrum or isolate |
| **Want maximum effectiveness** | Full spectrum |

---

## Step 4: Find a Quality Product

Quality varies significantly in the CBD market. Here's what to look for.

### Quality Checklist

| Factor | What to Check |
|--------|---------------|
| **Third-party testing** | Independent lab verification |
| **Certificate of Analysis (COA)** | Should be accessible on website |
| **Hemp source** | EU-grown hemp preferred |
| **Extraction method** | CO2 extraction is gold standard |
| **THC content** | Must be <0.2% (EU legal limit) |
| **No health claims** | Reputable brands don't claim to cure |

### Red Flags to Avoid

- No lab reports available
- Unrealistic health claims
- Prices too good to be true
- No clear ingredient list
- No company contact information

---

## Step 5: Determine Your Starting Dose

There's no universal CBD dose—it varies by individual. Start conservatively.

### Starting Dose Guidelines

| Body Weight | Suggested Starting Dose |
|-------------|------------------------|
| Under 60 kg | 10-15mg per day |
| 60-90 kg | 15-20mg per day |
| Over 90 kg | 20-25mg per day |

### The "Start Low, Go Slow" Method

| Week | Action |
|------|--------|
| **Week 1** | Take starting dose daily |
| **Week 2** | If needed, increase by 5mg |
| **Week 3** | Continue adjusting by 5mg increments |
| **Week 4+** | Maintain when you find your optimal dose |

---

## Step 6: Choose When to Take CBD

Timing can affect your experience with CBD.

### Timing Recommendations by Goal

| Goal | Suggested Timing |
|------|------------------|
| **General wellness** | Morning or split AM/PM |
| **Sleep support** | 30-60 minutes before bed |
| **Stress/anxiety** | Morning or as needed |
| **Exercise recovery** | Post-workout |
| **Pain management** | Consistent daily timing |

### With or Without Food?

| Timing | Effect |
|--------|--------|
| **With fatty food** | Increases absorption by up to 4x |
| **Empty stomach** | Faster onset, lower absorption |
| **Recommendation** | Take with a meal or snack containing fat |

---

## Step 7: Take Your First Dose

Here's how to take CBD oil sublingually for best absorption.

### How to Take CBD Oil

1. **Shake the bottle** to ensure even distribution
2. **Measure your dose** using the dropper
3. **Place under tongue** and hold for 60-90 seconds
4. **Swallow** the remainder
5. **Don't eat or drink** for 10-15 minutes

### Why Sublingual?

The tissue under your tongue allows CBD to absorb directly into your bloodstream, bypassing the digestive system for better [bioavailability](/articles/cbd-bioavailability).

---

## Step 8: Track Your Experience

Keeping records helps you find your optimal routine.

### What to Track

| Factor | Why It Matters |
|--------|----------------|
| **Date and time** | Identifies patterns |
| **Dose (mg)** | Helps find optimal amount |
| **Product used** | Compare different products |
| **How you feel before** | Establishes baseline |
| **How you feel after** | Measures effects |
| **Sleep quality** | CBD often affects sleep |
| **Any side effects** | Important for safety |

Consider keeping a [CBD journal](/articles/keep-cbd-journal) or using a notes app on your phone.

---

## What to Expect: Realistic Timeline

CBD works differently than many supplements. Here's a realistic timeline.

### First Few Days

| What You Might Notice | What's Normal |
|----------------------|---------------|
| Subtle calm feeling | Yes |
| No dramatic effects | Yes—this is common |
| Slightly better sleep | Possible |
| Wondering if it's working | Very common |

### First 1-2 Weeks

Most people begin noticing effects around this time with consistent use. Effects are often subtle—you may notice the *absence* of something (less tension, fewer racing thoughts) rather than a strong sensation.

### 2-4 Weeks

By this point, you should have a clearer picture of whether CBD is helpful for you. If you haven't noticed any benefits:

- Try increasing your dose
- Ensure you're taking it consistently
- Consider trying a different product type or brand

---

## Common Mistakes to Avoid

### Mistakes New Users Make

| Mistake | Why It's a Problem | Solution |
|---------|-------------------|----------|
| **Starting too high** | Can cause side effects | Start with 10-20mg |
| **Giving up too soon** | CBD needs time to build up | Give it 2-4 weeks |
| **Inconsistent use** | Reduces effectiveness | Take daily at same time |
| **Cheap products** | May be low quality or mislabeled | Invest in tested products |
| **Expecting instant results** | CBD isn't like pharmaceuticals | Set realistic expectations |
| **Not tracking** | Can't optimise what you don't measure | Keep simple notes |

---

## Safety Considerations

### Possible Side Effects

CBD is generally well-tolerated, but some people experience:

- Dry mouth
- Drowsiness (especially at higher doses)
- Changes in appetite
- Digestive upset

These are typically mild and often resolve as your body adjusts.

### Who Should Be Cautious

| Situation | Recommendation |
|-----------|----------------|
| **Taking medications** | Consult doctor first |
| **Pregnant or breastfeeding** | Avoid CBD |
| **Liver conditions** | Consult doctor first |
| **Scheduled surgery** | Stop CBD 1-2 weeks before |

### Drug Interactions

CBD can interact with medications that carry a "grapefruit warning." If your medication warns against grapefruit, [consult your doctor](/articles/talk-to-doctor-about-cbd) before using CBD.

---

## Frequently Asked Questions

### How long does it take for CBD to work?

For sublingual CBD oil, you may feel effects within 15-30 minutes. However, CBD's full benefits often develop over 2-4 weeks of consistent use. Don't judge effectiveness based on a single dose.

### Can I take too much CBD?

While CBD has a good safety profile, taking very high doses can cause side effects like drowsiness or digestive upset. There's no established toxic dose, but more isn't always better. Find the minimum effective dose for you.

### Should I take CBD every day?

For most uses, daily consistency provides the best results. CBD appears to have cumulative effects, and your [endocannabinoid system](/articles/endocannabinoid-system) may respond better with regular support.

### What if I don't feel anything?

This is common, especially in the first week. Try: increasing your dose by 5-10mg, ensuring you're taking it with food, checking that your product is from a reputable source, and giving it more time.

### Can I take CBD with other supplements?

CBD can generally be taken with most supplements. However, be cautious combining it with supplements that cause drowsiness (valerian, melatonin) until you know how CBD affects you.

### Is CBD legal?

In most EU countries, CBD products derived from hemp with less than 0.2% THC are legal. However, regulations vary by country. Check your local laws before purchasing.

---

## Next Steps

Now that you understand how to start, here's your action plan:

1. **[Choose your product type](/articles/choose-cbd-product)** based on your preferences
2. **[Find a quality brand](/articles/choose-cbd-brand)** with third-party testing
3. **Start with 10-20mg daily** and track your experience
4. **Adjust gradually** over 2-4 weeks
5. **[Use our dosage calculator](/tools/dosage-calculator)** to refine your dose

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    slug: 'how-to-choose-cbd-product',
    title: 'How to Choose a CBD Product: Finding What Works for You',
    excerpt: 'Not sure which CBD product to choose? Learn how to select between oils, gummies, capsules, and topicals based on your needs, lifestyle, and preferences.',
    meta_title: 'How to Choose a CBD Product: Complete Selection Guide',
    meta_description: 'Confused by CBD product options? Our guide helps you choose between oils, gummies, capsules, and more based on your specific needs and preferences.',
    reading_time: 10,
    content: `## Quick Answer

**Choose your CBD product based on three factors: your primary goal (what you want CBD for), your lifestyle preferences (convenience vs. control), and how quickly you need effects.** [CBD oil](/articles/cbd-oil-guide) offers the best flexibility and absorption, [gummies](/articles/cbd-gummies-guide) provide convenience and taste, [capsules](/articles/cbd-capsules-guide) offer precision, and [topicals](/articles/cbd-topicals-guide) work best for localised concerns.

---

## Key Takeaways

- **CBD oil** is best for beginners—flexible dosing and good absorption
- **Gummies and capsules** are best for convenience and consistency
- **Topicals** are best for targeting specific body areas
- **Vapes** offer fastest effects but have lung health considerations
- **Consider your daily routine** when choosing a format
- **Quality matters more than format**—always choose tested products

---

## Understanding Your Options

The CBD market offers numerous product types, each with distinct advantages.

### Complete Product Comparison

| Product | Onset | Duration | Bioavailability | Dosing Ease | Best For |
|---------|-------|----------|-----------------|-------------|----------|
| **[CBD Oil](/articles/cbd-oil-guide)** | 15-30 min | 4-6 hours | 20-30% | Excellent | Flexibility, beginners |
| **[Gummies](/articles/cbd-gummies-guide)** | 30-60 min | 6-8 hours | 10-20% | Good | Convenience, taste |
| **[Capsules](/articles/cbd-capsules-guide)** | 30-60 min | 6-8 hours | 10-20% | Excellent | No taste, precision |
| **[Softgels](/articles/cbd-softgels-guide)** | 30-45 min | 6-8 hours | 15-25% | Excellent | Better absorption than caps |
| **[Topicals](/articles/cbd-topicals-guide)** | 15-45 min | 2-4 hours | Local only | Moderate | Targeted application |
| **[Vapes](/articles/cbd-vape-guide)** | 1-5 min | 1-3 hours | 30-50% | Poor | Fast relief |
| **[Patches](/articles/cbd-patches-guide)** | 30-60 min | 8-12 hours | Variable | Poor | Extended release |

---

## Step 1: Identify Your Primary Goal

Different products suit different purposes.

### Product Recommendations by Goal

| Your Goal | Recommended Products | Why |
|-----------|---------------------|-----|
| **General wellness** | Oil, capsules, gummies | Consistent systemic effects |
| **Sleep support** | Oil, gummies, capsules | Can time before bed |
| **Stress/anxiety** | Oil, vape | Flexible timing, fast onset |
| **Muscle/joint discomfort** | Topicals + oral | Local and systemic approach |
| **Skin concerns** | Topicals, skincare | Direct application |
| **Exercise recovery** | Topicals, oral | Combined approach |
| **Focus/daily function** | Oil, capsules | Easy to incorporate |

---

## Step 2: Consider Your Lifestyle

Your daily routine should inform your choice.

### Lifestyle Factors

| Factor | Product Implications |
|--------|---------------------|
| **Busy schedule** | Capsules or gummies—grab and go |
| **Work from home** | Oil—more flexibility |
| **Travel frequently** | Capsules, gummies—portable, no spills |
| **Dislike hemp taste** | Gummies, capsules, flavoured oils |
| **Need discretion** | Capsules, gummies—look like supplements |
| **Active/athletic** | Topicals for recovery, oral for overall |
| **Precise about dosing** | Oil or capsules—measured amounts |

### Questions to Ask Yourself

1. Do you want to taste hemp, or avoid it?
2. How important is precise dosing to you?
3. Do you need to take CBD outside your home?
4. How quickly do you need to feel effects?
5. Do you have specific areas of concern, or general wellness goals?

---

## Step 3: Understand Absorption

How much CBD actually enters your system varies by product type.

### Bioavailability by Method

| Method | Bioavailability | What This Means |
|--------|-----------------|-----------------|
| **Inhalation** | 30-50% | Highest absorption, fastest onset |
| **Sublingual** | 20-30% | Good absorption, moderate onset |
| **Oral (with food)** | 10-20% | Lower absorption, slower onset |
| **Topical** | N/A | Doesn't enter bloodstream significantly |

### Practical Implication

If a product has lower bioavailability, you may need a higher dose to achieve similar effects. For example:

- 20mg sublingual oil ≈ 30-40mg gummy (roughly)

This doesn't make one better than the other—just factor it into your dosing.

---

## Product Deep Dives

### CBD Oil (Tinctures)

**Best for:** Beginners, those wanting dosing flexibility, sublingual use

| Pros | Cons |
|------|------|
| Flexible dosing | Can taste earthy |
| Good absorption (sublingual) | Requires measuring |
| Fast onset (15-30 min) | Less portable |
| Cost-effective per mg | Potential for spills |

**Ideal user:** Someone who wants control over their dose and doesn't mind the routine of measuring drops.

### CBD Gummies

**Best for:** Convenience, taste-sensitive users, consistent daily dosing

| Pros | Cons |
|------|------|
| Great taste | Added sugar |
| Pre-measured doses | Lower bioavailability |
| Very portable | Slower onset |
| Discreet | Less flexible dosing |

**Ideal user:** Someone who wants a simple, enjoyable daily routine and doesn't need fast-acting effects.

### CBD Capsules

**Best for:** Precision, supplement routine, no taste preference

| Pros | Cons |
|------|------|
| Exact dosing | Lower bioavailability |
| No taste | No dosing flexibility |
| Familiar format | Slower onset |
| Very portable | Can't adjust mid-dose |

**Ideal user:** Someone who already takes daily supplements and wants CBD to fit seamlessly into that routine.

### CBD Topicals

**Best for:** Targeted application, skin concerns, localised discomfort

| Pros | Cons |
|------|------|
| Targeted effects | Limited to application area |
| No systemic effects | Need frequent reapplication |
| Easy to use | Hard to measure dose |
| Good for sensitive users | Won't address systemic concerns |

**Ideal user:** Someone with specific areas of concern (joints, muscles, skin) rather than general wellness goals.

### CBD Vapes

**Best for:** Fast relief, experienced users, acute situations

| Pros | Cons |
|------|------|
| Fastest onset (1-5 min) | Lung health concerns |
| Highest bioavailability | Short duration |
| Good for acute needs | Requires equipment |
| Efficient use of CBD | Less discreet |

**Ideal user:** Someone who needs rapid effects and is comfortable with the trade-offs of inhalation.

---

## Step 4: Choose Your Spectrum

Regardless of product type, you'll need to choose a spectrum.

### Quick Spectrum Guide

| Type | Best For |
|------|----------|
| **[Full Spectrum](/articles/what-is-full-spectrum-cbd)** | Maximum effectiveness, no drug testing concerns |
| **[Broad Spectrum](/articles/what-is-broad-spectrum-cbd)** | Entourage benefits without THC |
| **[Isolate](/articles/what-is-cbd-isolate)** | THC-sensitive, precise CBD only |

---

## Decision Framework

Use this framework to narrow your choice.

### Quick Decision Tree

**Start here:** What's most important to you?

**Flexibility and control** → CBD Oil
**Convenience and taste** → Gummies
**Precision and simplicity** → Capsules
**Targeted relief** → Topicals
**Fastest effects** → Vape (with caution)

### By Common Situations

| Situation | Recommended |
|-----------|-------------|
| "I'm brand new to CBD" | CBD oil |
| "I hate the taste of hemp" | Gummies or capsules |
| "I travel for work" | Capsules or gummies |
| "My knees hurt after running" | Topical + oral |
| "I want help falling asleep" | Oil or gummies (evening) |
| "I need something during work stress" | Capsules or low-dose gummies |

---

## Quality Considerations

Your product format matters less than product quality.

### Universal Quality Markers

| Check | Why It Matters |
|-------|----------------|
| **Third-party lab testing** | Verifies contents and safety |
| **Clear CBD content (mg)** | Know what you're getting |
| **Hemp source disclosed** | Quality starts with the plant |
| **Extraction method listed** | CO2 is gold standard |
| **Full ingredient list** | Check for allergens, additives |

---

## Frequently Asked Questions

### Which CBD product is most effective?

Effectiveness depends more on quality and dosing than product type. That said, products with higher bioavailability (sublingual oil, vapes) deliver more CBD to your system per mg. For most people, CBD oil offers the best balance of effectiveness and practicality.

### Should beginners start with gummies or oil?

Oil is generally better for beginners because you can easily adjust your dose. With gummies, you're limited to the pre-set amount (usually 10-25mg each). Once you know your optimal dose, gummies become more practical.

### Can I use multiple CBD products?

Yes—many people combine products. For example, daily capsules for consistent baseline effects plus a topical for targeted concerns. Just track your total daily CBD intake.

### Are some products safer than others?

All quality CBD products have similar safety profiles. The exception is vaping, which carries lung health considerations. Topicals are the "safest" in terms of systemic effects since CBD doesn't significantly enter the bloodstream.

### Do more expensive products work better?

Not necessarily. Price doesn't always correlate with quality. Focus on third-party testing, transparent sourcing, and reasonable per-mg pricing rather than overall product cost.

---

## Your Next Steps

1. **Identify your primary goal** from the table above
2. **Consider your lifestyle factors** (convenience, taste, portability)
3. **Choose your spectrum type** (full, broad, or isolate)
4. **[Find a quality brand](/articles/how-to-choose-cbd-brand)** with proper testing
5. **Start with your chosen product** and [track your experience](/articles/keep-cbd-journal)

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    slug: 'how-to-choose-cbd-brand',
    title: 'How to Choose a CBD Brand: Finding Trustworthy Products',
    excerpt: 'Learn how to evaluate CBD brands and find trustworthy products. Our guide covers third-party testing, sourcing, red flags to avoid, and what quality really means.',
    meta_title: 'How to Choose a CBD Brand: Trust & Quality Guide',
    meta_description: 'Not all CBD brands are equal. Learn how to identify trustworthy companies with our guide to third-party testing, sourcing, certifications, and red flags.',
    reading_time: 11,
    content: `## Quick Answer

**Choose a CBD brand that provides third-party lab reports (Certificates of Analysis), uses quality hemp from reputable sources, clearly states CBD content in milligrams, and maintains transparent business practices.** Avoid brands making medical claims, offering prices too good to be true, or unable to provide lab documentation.

---

## Key Takeaways

- **Third-party testing is non-negotiable**—never buy without a COA
- **Look for EU-grown hemp** or certified organic sources
- **CO2 extraction** indicates quality manufacturing
- **Transparent pricing** per mg helps compare value
- **Red flags include** health claims, no lab reports, and vague sourcing
- **Good brands welcome questions** about their products

---

## Why Brand Choice Matters

The CBD market remains inconsistent in quality. Studies have found:

| Finding | Implication |
|---------|-------------|
| Many products contain less CBD than labelled | You may not get what you pay for |
| Some contain more THC than legal limits | Legal and safety concerns |
| Contaminants found in some products | Potential health risks |
| Wildly varying quality between brands | Research before buying |

Choosing the right brand protects you and ensures you actually experience CBD's potential benefits.

---

## The Essential Checklist

### Must-Have Quality Markers

| Requirement | What to Look For | Red Flag If Missing |
|-------------|------------------|---------------------|
| **Third-party COA** | Accessible on website, recent date | No lab reports = don't buy |
| **Clear CBD content** | mg per serving and total | Vague like "hemp extract" |
| **Hemp source** | Country/region of origin stated | "Proprietary" or unstated |
| **Extraction method** | CO2, ethanol, or clearly stated | Not disclosed |
| **Full ingredient list** | All components listed | Incomplete information |
| **Contact information** | Real address, phone, email | No way to reach company |

---

## Step 1: Verify Third-Party Testing

This is the most important factor in choosing a CBD brand.

### What Is a Certificate of Analysis (COA)?

A COA is a document from an independent laboratory verifying:

| Test | What It Confirms |
|------|------------------|
| **Cannabinoid profile** | CBD, THC, and other cannabinoid levels |
| **Heavy metals** | Lead, mercury, arsenic, cadmium below safe limits |
| **Pesticides** | No harmful pesticide residues |
| **Microbial** | No mould, bacteria, or pathogens |
| **Residual solvents** | No leftover extraction chemicals |

### How to Read a COA

| Look For | What It Should Show |
|----------|---------------------|
| **CBD content** | Should match or exceed label claim |
| **THC content** | Must be <0.2% (EU limit) |
| **"Pass" or "ND"** | On contaminant tests |
| **Batch number** | Should match your product |
| **Recent date** | Within past 12 months |
| **Accredited lab** | ISO 17025 certified preferred |

### COA Red Flags

| Warning Sign | What It Means |
|--------------|---------------|
| COA not available | Major concern—avoid brand |
| Internal lab only | Not independent verification |
| Outdated (>12 months) | May not reflect current batches |
| Missing tests | Incomplete quality control |
| Results don't match label | Quality control issues |

---

## Step 2: Evaluate Hemp Source

Quality CBD starts with quality hemp.

### Hemp Source Indicators

| Source | Quality Signal |
|--------|----------------|
| **EU-grown** | Strict agricultural regulations |
| **Organic certified** | No synthetic pesticides |
| **US-grown (Colorado, Oregon, Kentucky)** | Established hemp farming |
| **Single-origin** | Traceability |
| **Farm partnerships named** | Transparency |

### Hemp Red Flags

| Warning | Concern |
|---------|---------|
| **"Proprietary source"** | Hiding origin |
| **No country stated** | Could be anywhere |
| **"Industrial hemp"** | Vague, potentially lower quality |
| **Multiple unnamed sources** | Inconsistent quality |

---

## Step 3: Check Extraction Method

How CBD is extracted affects purity and quality.

### Extraction Methods Ranked

| Method | Quality | Safety | Notes |
|--------|---------|--------|-------|
| **CO2 (supercritical)** | Highest | Excellent | Gold standard, no residues |
| **Ethanol** | High | Good | Clean when done properly |
| **Hydrocarbon** | Variable | Needs care | Requires thorough purging |
| **Olive oil** | Lower | Safe | Not commercially viable |

### What to Look For

**Best:** "Supercritical CO2 extraction" or "CO2 extracted"
**Good:** "Ethanol extraction" with residual solvent testing
**Caution:** Method not disclosed

---

## Step 4: Analyse the Product Label

A quality label tells you everything you need to know.

### What Should Be on the Label

| Element | Example |
|---------|---------|
| **CBD content per serving** | "25mg CBD per dropper" |
| **Total CBD content** | "750mg CBD per bottle" |
| **Spectrum type** | "Full Spectrum" / "Broad Spectrum" / "Isolate" |
| **Serving size** | "1ml (1 full dropper)" |
| **All ingredients** | Hemp extract, MCT oil, etc. |
| **Net volume/weight** | "30ml" |
| **Batch/lot number** | For COA matching |
| **Best by date** | Product freshness |

### Label Red Flags

| Problem | What It Suggests |
|---------|------------------|
| **"Hemp oil" with no mg** | May be hemp seed oil, not CBD |
| **"Proprietary blend"** | Hiding actual CBD content |
| **No batch number** | Can't verify with COA |
| **Only total hemp extract** | CBD amount unclear |
| **Health claims on label** | Regulatory violation |

---

## Step 5: Research the Company

Look beyond the product to the company behind it.

### Company Transparency Indicators

| Factor | Good Sign | Bad Sign |
|--------|-----------|----------|
| **About page** | Real founders, mission | Generic or missing |
| **Contact info** | Physical address, phone | Email only, no address |
| **Customer service** | Responsive, helpful | Slow or no response |
| **Return policy** | Clear, reasonable | Restrictive or unclear |
| **Educational content** | Helpful, non-sales | All promotional |

### Questions to Ask a Brand

Before buying, consider contacting the company to ask:

1. Can you send me the COA for [specific batch]?
2. Where is your hemp grown?
3. What extraction method do you use?
4. How do you determine serving sizes?
5. What's your return policy if I'm not satisfied?

**Good brands welcome these questions.** Evasive answers are a red flag.

---

## Step 6: Evaluate Price and Value

Price should be evaluated per milligram of CBD, not per bottle.

### Calculating Price Per mg

**Formula:** Total price ÷ Total mg CBD = Price per mg

| Product | Price | Total CBD | Per mg |
|---------|-------|-----------|--------|
| Brand A | €45 | 500mg | €0.09/mg |
| Brand B | €60 | 1000mg | €0.06/mg |
| Brand C | €30 | 250mg | €0.12/mg |

### Typical Price Ranges (EU)

| Price per mg | Quality Expectation |
|--------------|---------------------|
| **€0.04-0.08** | Good value, verify quality |
| **€0.08-0.15** | Mid-range, expect quality |
| **€0.15+** | Premium, should be exceptional |
| **<€0.03** | Suspiciously cheap—verify carefully |

### Cheap CBD Concerns

Very low prices often indicate:
- Lower CBD content than labelled
- Poor quality hemp
- Inadequate testing
- Contaminant risks

---

## Red Flags to Avoid

### Immediate Warning Signs

| Red Flag | Why It's Concerning |
|----------|---------------------|
| **"Cures" or "treats" claims** | Illegal, indicates disregard for regulations |
| **No COA available** | Can't verify contents or safety |
| **Celebrity endorsements** | Marketing over substance |
| **"Proprietary" everything** | Hiding information |
| **Too many health claims** | Regulatory red flag |
| **No contact information** | Can't reach them if problems |
| **Prices far below market** | Quality likely compromised |

### Marketing Hype to Ignore

| Claim | Reality |
|-------|---------|
| **"Pure CBD oil"** | Meaningless without mg stated |
| **"Clinical strength"** | No standard definition |
| **"Doctor recommended"** | Often unverifiable |
| **"Premium hemp"** | Vague quality claim |
| **"Nano CBD"** | Technology exists but often overhyped |

---

## Certifications That Matter

### Meaningful Certifications

| Certification | What It Means |
|---------------|---------------|
| **Organic (EU/USDA)** | No synthetic pesticides, verified |
| **GMP certified** | Good Manufacturing Practices |
| **ISO certified lab** | Testing standards verified |
| **EU Novel Food** | Compliant with EU regulations |

### Less Meaningful Claims

| Claim | Why It's Limited |
|-------|------------------|
| **"Lab tested"** | Vague—what tests? By whom? |
| **"Premium quality"** | Unregulated claim |
| **"Pharmaceutical grade"** | Not a real standard for CBD |

---

## Frequently Asked Questions

### How do I know if a COA is real?

Check that the COA includes: the laboratory's name, contact information, and accreditation; a batch number matching your product; a recent date; and specific test results (not just "pass"). You can often verify by contacting the lab directly.

### Is more expensive CBD always better?

No. Price doesn't guarantee quality. Some expensive brands are overpriced, while some moderately priced brands offer excellent products. Focus on verifiable quality markers, not price alone.

### Should I only buy organic CBD?

Organic certification is a positive sign but not essential. Well-managed conventional hemp farming can produce quality CBD. What matters more is third-party testing that confirms no pesticide residues.

### Can I trust CBD from online marketplaces?

Be very cautious. Platforms like Amazon often have issues with counterfeit or mislabelled CBD products. Buy directly from brand websites or verified retailers where possible.

### What if a brand won't show me their COA?

Don't buy from them. Any reputable brand will gladly share their lab reports. Refusal or evasion is a major red flag.

---

## Your Next Steps

1. **Identify 2-3 brands** that interest you
2. **Check each for COAs** on their website
3. **Compare price per mg** across products
4. **Research company background** (about page, reviews)
5. **Contact with questions** if anything is unclear
6. **Start with a smaller purchase** to test quality

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    slug: 'how-to-buy-cbd-online',
    title: 'How to Buy CBD Online: Safe Shopping Guide',
    excerpt: 'Learn how to safely buy CBD online. Our guide covers finding reputable sellers, checking product quality, understanding shipping, and avoiding scams.',
    meta_title: 'How to Buy CBD Online Safely: Complete Shopping Guide',
    meta_description: 'Buying CBD online? Learn how to find reputable sellers, verify product quality, understand shipping rules, and protect yourself from scams.',
    reading_time: 9,
    content: `## Quick Answer

**To buy CBD online safely, purchase directly from brand websites rather than marketplaces, verify third-party lab reports before ordering, check the company's reputation through reviews and business information, and ensure the THC content is within legal limits (<0.2% in the EU).** Avoid deals that seem too good to be true and always use secure payment methods.

---

## Key Takeaways

- **Buy direct from brand websites** when possible—avoid unverified marketplaces
- **Always check lab reports (COA)** before purchasing
- **Verify company legitimacy** through reviews, contact info, and business details
- **Understand shipping restrictions** to your country
- **Use secure payment methods** for buyer protection
- **Start with smaller orders** until you trust a brand

---

## Why Buy CBD Online?

Online purchasing offers several advantages:

| Benefit | Explanation |
|---------|-------------|
| **Wider selection** | Access to more brands and products |
| **Better pricing** | Often lower than retail stores |
| **Full information** | Lab reports, ingredients easily available |
| **Convenience** | Delivered to your door |
| **Research time** | Compare products without pressure |

However, online also comes with risks that require careful navigation.

---

## Step 1: Choose Where to Buy

Your source matters as much as the product itself.

### Buying Options Ranked

| Source | Trust Level | Pros | Cons |
|--------|-------------|------|------|
| **Brand websites** | Highest | Direct, authentic, full info | May have higher prices |
| **Authorised retailers** | High | Verified products, good selection | Verify authorisation |
| **Specialist CBD shops** | Medium-High | Curated selection, expertise | Verify their vetting process |
| **General marketplaces** | Low | Convenience | High counterfeit risk |
| **Social media sellers** | Very Low | None | High scam risk |

### Why Brand Websites Are Safest

Buying directly from brand websites means:

- **Guaranteed authentic product**—no counterfeit risk
- **Freshest inventory**—directly from source
- **Full customer service**—direct relationship with company
- **Access to all documentation**—COAs, batch info
- **Better return policies**—typically

---

## Step 2: Verify the Seller

Before entering payment information, verify the seller's legitimacy.

### Website Trust Indicators

| Check | What to Look For |
|-------|------------------|
| **SSL certificate** | URL starts with "https://" |
| **Contact information** | Physical address, phone number, email |
| **About page** | Real company information, founders |
| **Privacy policy** | Clear data handling practices |
| **Terms of service** | Professional, complete |
| **Professional design** | Investment in presentation |

### Red Flags

| Warning Sign | What It Suggests |
|--------------|------------------|
| **No physical address** | May not be legitimate business |
| **Email-only contact** | Harder to reach if problems |
| **Stock photos only** | May not be making their own products |
| **Copied content** | Low-quality operation |
| **No COAs available** | Can't verify product quality |
| **Too many pop-ups/ads** | Potentially untrustworthy |

---

## Step 3: Verify Product Quality

Quality verification should happen before you buy, not after.

### Pre-Purchase Checklist

| Step | How to Do It |
|------|--------------|
| **1. Find the COA** | Should be linked on product page or in a "Lab Results" section |
| **2. Check CBD content** | COA should match label claims |
| **3. Verify THC level** | Must be <0.2% for EU legality |
| **4. Review contaminant tests** | Heavy metals, pesticides should pass |
| **5. Check COA date** | Within past 12 months |
| **6. Match batch number** | If possible before purchase |

### Understanding Product Pages

Good product pages include:

| Element | Why It Matters |
|---------|----------------|
| **Clear CBD content (mg)** | Know what you're getting |
| **Serving information** | Understand dosing |
| **All ingredients listed** | Check for allergens |
| **Spectrum type stated** | Full, broad, or isolate |
| **Hemp source mentioned** | Quality indicator |
| **Link to lab reports** | Transparency |

---

## Step 4: Read Reviews Carefully

Reviews help gauge real customer experiences, but require critical reading.

### Evaluating Reviews

| Good Signs | Warning Signs |
|------------|---------------|
| Detailed, specific experiences | All generic 5-star reviews |
| Mix of positive and constructive | No negative reviews at all |
| Responses from company | Deleted negative comments |
| Consistent across platforms | Reviews only on their site |
| Verified purchase indicators | Same reviewer language patterns |

### Where to Find Reviews

| Source | Reliability |
|--------|-------------|
| **Trustpilot** | Generally reliable, verified purchases |
| **Google Reviews** | Mixed, but hard to fake |
| **Reddit communities** | Honest, detailed, but individual experiences |
| **CBD review sites** | Useful but check for affiliate bias |
| **Website reviews** | Least reliable—can be curated |

---

## Step 5: Understand Shipping and Legal Considerations

CBD shipping involves legal complexities depending on your location.

### EU Shipping Considerations

| Factor | What to Know |
|--------|--------------|
| **THC limits** | Must be <0.2% (some countries <0.3%) |
| **Novel Food status** | Some countries have stricter requirements |
| **Cross-border** | Usually fine within EU, verify locally |
| **Customs declarations** | Reputable companies handle correctly |
| **Delivery timeframes** | Typically 2-7 days within EU |

### Country-Specific Notes

| Country | Status |
|---------|--------|
| **UK** | Legal, separate from EU regulations post-Brexit |
| **Germany** | Legal, relatively relaxed |
| **France** | Legal, stricter enforcement historically |
| **Italy** | Legal, some local variations |
| **Spain** | Legal, well-established market |

**Always verify current regulations** for your specific country before ordering.

### Shipping Red Flags

| Warning | Concern |
|---------|---------|
| **Ships from unexpected countries** | May not meet EU standards |
| **No tracking provided** | Harder to resolve issues |
| **Unusually long estimates** | Supply chain concerns |
| **No customs information** | May cause delivery issues |

---

## Step 6: Safe Payment Practices

Protect yourself financially when buying online.

### Payment Methods

| Method | Security Level | Buyer Protection |
|--------|----------------|------------------|
| **Credit card** | High | Good chargeback rights |
| **PayPal** | High | Strong buyer protection |
| **Debit card** | Medium | Some protection |
| **Bank transfer** | Low | Minimal protection |
| **Cryptocurrency** | Low | No protection |

### Payment Security Tips

1. **Use credit cards** for best protection
2. **Check for secure checkout** (https, padlock icon)
3. **Don't save payment info** on unfamiliar sites
4. **Use strong passwords** for accounts
5. **Monitor statements** for unauthorised charges

---

## Step 7: Your First Order

For initial purchases from a new brand:

### First Order Best Practices

| Practice | Reason |
|----------|--------|
| **Start small** | Test quality before larger investment |
| **Order one product type** | Evaluate before expanding |
| **Save all documentation** | Order confirmation, tracking, receipts |
| **Note the batch number** | For COA verification |
| **Document unboxing** | In case of disputes |

---

## What to Do When Your Order Arrives

### Arrival Checklist

| Step | What to Check |
|------|---------------|
| **1. Package condition** | Intact, properly sealed |
| **2. Correct product** | Matches your order |
| **3. Intact seal** | Product not tampered with |
| **4. Expiration date** | Well within date |
| **5. Batch number** | Note for COA matching |
| **6. Match to COA** | Verify batch matches available lab report |

### If Something's Wrong

| Issue | Action |
|-------|--------|
| **Damaged package** | Photograph, contact company immediately |
| **Wrong product** | Contact for exchange |
| **Quality concerns** | Request COA, contact company |
| **Doesn't match description** | Request return/refund |
| **No response from company** | Credit card chargeback |

---

## Common Online Buying Mistakes

### Mistakes to Avoid

| Mistake | Why It's a Problem |
|---------|-------------------|
| **Buying the cheapest option** | Often means lowest quality |
| **Skipping COA verification** | Can't know what you're getting |
| **Large first orders** | Stuck if you don't like it |
| **Ignoring return policies** | No recourse if unsatisfied |
| **Buying from social media ads** | High scam rate |
| **Not checking reviews** | Missing warning signs |

---

## Frequently Asked Questions

### Is it legal to buy CBD online?

In most EU countries, yes—CBD products with <0.2% THC can be legally purchased online. However, regulations vary by country. Always verify your local laws and buy from compliant sellers.

### Will my CBD be stopped at customs?

Unlikely if buying within the EU from reputable sellers. Proper CBD products with compliant THC levels and appropriate documentation typically clear customs without issues. Problems arise with non-compliant products or suspicious shipments.

### How do I know if an online CBD seller is legitimate?

Check for: physical business address, phone number, accessible lab reports, professional website, positive reviews on independent platforms, and clear company information. Legitimate businesses are transparent and responsive.

### Can I return CBD products if I don't like them?

Policies vary by seller. Many reputable brands offer 30-day satisfaction guarantees. Always check the return policy before purchasing. Unopened products are usually returnable; opened products vary by seller.

### Why is some CBD much cheaper online?

Lower-priced CBD may indicate: less CBD than claimed, lower quality hemp, inadequate testing, or old inventory. Extremely low prices are a red flag. Quality CBD has baseline production costs.

---

## Your Online Buying Checklist

Before you click "buy":

- [ ] Verified seller legitimacy (contact info, about page)
- [ ] Found and reviewed COA
- [ ] CBD content matches label
- [ ] THC <0.2%
- [ ] Read independent reviews
- [ ] Understood shipping to your location
- [ ] Checked return policy
- [ ] Using secure payment method

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  }
];

async function main() {
  console.log('Inserting Getting Started guides (batch 1)...\n');

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

  console.log('\nBatch 1 complete.');
}
main();
