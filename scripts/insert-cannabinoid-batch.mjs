import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

const CATEGORY_ID = 'b6b0dd3c-d0a8-485c-84a6-5c5a850b0d61';

const articles = [
  {
    title: 'Natural vs Synthetic Cannabinoids: Key Differences & Safety',
    slug: 'natural-vs-synthetic-cannabinoids',
    excerpt: 'Understand the critical differences between natural plant cannabinoids like CBD and THC, pharmaceutical synthetics, and dangerous synthetic drugs like Spice. Learn what makes each safe or risky.',
    content: `Not all cannabinoids are created equal. Natural cannabinoids from cannabis are fundamentally different from synthetic cannabinoids made in labs — and some synthetic cannabinoids are extremely dangerous. Understanding these differences is crucial for your safety.

## Quick Answer

**Natural cannabinoids** (CBD, THC, etc.) come from the cannabis plant and have thousands of years of human use with well-documented effects. **Pharmaceutical synthetics** (like dronabinol/Marinol) are lab-made copies of THC, regulated and tested for safety. **Illicit synthetics** (Spice, K2) are completely different chemicals sprayed on herbs — they're unpredictable, dangerous, and have caused deaths. Never confuse these categories.

## The Three Categories

| Type | Examples | Safety | Legal |
|------|----------|--------|-------|
| **Natural plant** | CBD, THC, CBG, CBN | Well-documented | Varies |
| **Pharmaceutical synthetic** | Dronabinol, nabilone | Tested, regulated | Prescription |
| **Illicit synthetic** | Spice, K2, "fake weed" | Dangerous | Illegal |

## Natural Plant Cannabinoids

### What They Are

Cannabinoids produced by cannabis plants:

- **CBD** (cannabidiol) — Non-intoxicating, wellness use
- **THC** (delta-9-tetrahydrocannabinol) — Intoxicating, medical use
- **CBG** (cannabigerol) — Non-intoxicating, emerging research
- **CBN** (cannabinol) — Mildly intoxicating, sleep products
- **100+ others** — In various concentrations

### Why They're Considered Safer

**Evolutionary history:**
- Cannabis has co-evolved with humans for millennia
- Our [endocannabinoid system](/articles/endocannabinoid-system-explained) evolved alongside plant cannabinoids
- Long history of human use provides safety data

**Partial agonism:**
- Natural THC is a partial CB1 agonist
- It doesn't fully activate receptors
- This limits the intensity of effects
- Built-in ceiling to how strong effects get

**Known properties:**
- Extensively studied (especially CBD and THC)
- Predictable dose-response curves
- Understood side effect profiles
- Documented drug interactions

### Limitations

- Inconsistent plant-to-plant concentrations
- Variable absorption and metabolism
- Regulatory grey areas
- Quality control varies

---

## Pharmaceutical Synthetics

### What They Are

Lab-made cannabinoids created to mimic natural ones:

**Dronabinol (Marinol):**
- Synthetic delta-9-THC
- Identical chemical structure to plant THC
- FDA approved for nausea, appetite
- Prescription medication

**Nabilone (Cesamet):**
- Synthetic THC analogue
- Similar but not identical to THC
- Approved for chemotherapy nausea
- Prescription medication

**Rimonabant (Acomplia) — discontinued:**
- CB1 antagonist (blocks cannabinoid receptors)
- Was used for weight loss
- Withdrawn due to psychiatric side effects
- Shows the risks of manipulating the endocannabinoid system

### Why They're Regulated Differently

**Advantages:**
- Consistent dosing
- Pharmaceutical purity
- Studied in clinical trials
- FDA/EMA approved
- Quality controlled

**Disadvantages:**
- May lack entourage effect
- Single-molecule limitations
- Often not as effective as whole plant (per some patients)
- Prescription required
- Expensive

### The Whole-Plant Debate

Many patients report plant cannabis works better than Marinol:

- May be due to entourage effect
- Other cannabinoids contribute
- Terpenes may play a role
- Individual variation matters

---

## Illicit Synthetic Cannabinoids (Dangerous)

### What They Are

**These are NOT cannabis products.** They're:

- Research chemicals designed in labs
- Often based on compounds never tested in humans
- Sprayed onto plant material to look like cannabis
- Sold as "Spice," "K2," "fake weed," or under countless brand names
- Unpredictable in potency and composition

### Why They're Dangerous

**Full agonism:**
- Unlike THC (partial agonist), many are FULL CB1 agonists
- No ceiling effect
- Can fully activate receptors
- Effects can be overwhelming and dangerous

**Unknown compounds:**
- Formulations change constantly
- New chemicals replace banned ones
- No testing for safety
- No quality control

**Unpredictable potency:**
- Sprayed unevenly on plant material
- One batch may be 100x stronger than another
- "Hot spots" cause accidental overdose
- Users have no idea what or how much they're taking

### Documented Harms

**Deaths reported from:**
- Cardiac events
- Seizures
- Kidney failure
- Psychotic episodes
- Respiratory failure

**Common adverse effects:**
- Severe anxiety/paranoia
- Hallucinations
- Violent behaviour
- Chest pain
- Vomiting
- Rapid heart rate
- Seizures

### Why People Use Them

Despite the dangers:
- Cheaper than cannabis
- Not detected on standard drug tests
- Legal in some places (until banned)
- Availability when cannabis isn't

**These are not valid reasons.** The risks are extreme and unpredictable.

---

## Chemical Comparison

### THC vs Synthetic Cannabinoids

| Property | Natural THC | Pharmaceutical THC | Illicit Synthetics |
|----------|-------------|--------------------|--------------------|
| Source | Cannabis plant | Lab synthesis | Lab synthesis |
| Structure | Consistent | Matches plant THC | Variable chemicals |
| CB1 activity | Partial agonist | Partial agonist | Often full agonist |
| Potency | Predictable | Controlled dose | Unpredictable |
| Safety data | Extensive | Clinical trials | None |
| Effects | Well-known | Similar to plant | Dangerous |

### Why Partial vs Full Agonism Matters

**Partial agonist (natural THC):**
- Only partially activates receptors
- Effects plateau at certain doses
- Body has some natural buffering
- Tolerance develops gradually

**Full agonist (many synthetics):**
- Fully activates receptors
- Effects can escalate without limit
- Overwhelms the system
- Can cause severe toxicity

Think of it like this: partial agonism is a dimmer switch with a limit; full agonism removes all limits.

---

## Semi-Synthetic Cannabinoids

### The Grey Area

Recent products like delta-8 THC and [HHC](/articles/what-is-hhc):

**What they are:**
- Derived from hemp CBD
- Chemically converted in labs
- Not the same as natural plant cannabinoids
- Not the same as dangerous synthetics

**Concerns:**
- Limited safety research
- Production quality varies
- May contain unwanted byproducts
- Regulatory grey area
- Unknown long-term effects

**Distinction from illicit synthetics:**
- Chemical structure is close to natural cannabinoids
- Don't appear to be full agonists
- Deaths haven't been reported at natural cannabinoid rates
- Still concerning due to lack of research

### My View

Semi-synthetics occupy an uncomfortable middle ground:
- Not as safe as natural plant cannabinoids (less research)
- Not as dangerous as illicit synthetics (similar structures)
- Production quality is the biggest concern
- I recommend sticking with natural cannabinoids when possible

---

## How to Stay Safe

### Always Choose

**Natural plant cannabinoids when possible:**
- Full-spectrum CBD from hemp
- Legal medical cannabis where available
- Products with third-party testing
- Reputable, transparent companies

### Avoid

**Any product that:**
- Doesn't specify what cannabinoids it contains
- Lacks third-party test results
- Is sold as "Spice," "K2," or "synthetic cannabis"
- Seems too cheap to be real
- Promises to not show on drug tests as a selling point
- Has unknown origin

### If Prescribed Pharmaceutical Synthetics

**They're safe when:**
- Prescribed by a doctor
- From a licensed pharmacy
- Taken as directed
- Monitored appropriately

---

## Recognising Illicit Synthetics

### Warning Signs

**Products may be illicit synthetics if:**
- Sold in convenience stores/head shops as "herbal incense"
- Labelled "not for human consumption"
- Branded with cartoon characters or extreme imagery
- Much cheaper than cannabis
- Cause effects far more intense than expected
- Produce effects that don't match cannabis

### What to Do

**If you or someone you know has consumed synthetic cannabinoids and experiences:**
- Severe anxiety, paranoia, or confusion
- Hallucinations
- Rapid heart rate or chest pain
- Seizures
- Difficulty breathing

**Seek medical attention immediately.** These can be medical emergencies.

---

## Frequently Asked Questions

### Is CBD synthetic?

CBD from hemp products is natural, extracted from plants. However, some products use synthetic CBD — check for "hemp-derived" or "plant-derived" on labels and COAs. Pharmaceutical CBD (Epidiolex) is plant-derived, not synthetic.

### Are pharmaceutical synthetics safe?

Dronabinol and nabilone are regulated, tested, and have known safety profiles. They're safe when prescribed appropriately. They're fundamentally different from illicit synthetic cannabinoids.

### Why are illicit synthetics still available?

When one compound is banned, chemists create new ones. Regulations struggle to keep up. Some jurisdictions haven't banned all variants. Online markets make distribution easy.

### Is delta-8 THC a synthetic cannabinoid?

It's semi-synthetic — converted from natural CBD using chemical processes. It's not in the same category as dangerous synthetics (Spice/K2), but it's also not the same as natural delta-8 in cannabis plants. The concern is production quality, not the molecule itself.

### Can I tell natural from synthetic just by looking?

No. Synthetic cannabinoids sprayed on herbs can look like cannabis. Only lab testing can determine what's in a product. Buy from verified sources with third-party testing.

## Sources

1. Castaneto MS, et al. (2014). Synthetic cannabinoids: Epidemiology, pharmacodynamics, and clinical implications. *Drug and Alcohol Dependence*, 144, 12-41.

2. Adams AJ, et al. (2017). Zombie Outbreak Caused by the Synthetic Cannabinoid AMB-FUBINACA in New York. *New England Journal of Medicine*, 376(3), 235-242.

3. Pertwee RG. (2008). The diverse CB1 and CB2 receptor pharmacology of three plant cannabinoids. *British Journal of Pharmacology*, 153(2), 199-215.

4. Tait RJ, et al. (2016). A systematic review of adverse events arising from the use of synthetic cannabinoids. *Psychopharmacology*, 233(9), 1547-1559.

5. EMCDDA. (2017). Synthetic cannabinoids in Europe. European Monitoring Centre for Drugs and Drug Addiction.

---

*Last updated: January 2026*`,
    article_type: 'educational-guide',
    category_id: CATEGORY_ID,
    reading_time: 11,
    status: 'published',
    published_at: new Date().toISOString(),
    meta_title: 'Natural vs Synthetic Cannabinoids: Safety & Key Differences',
    meta_description: "Understand the critical differences between natural plant cannabinoids, pharmaceutical synthetics, and dangerous illicit synthetics like Spice. Learn what's safe.",
    language: 'en'
  }
];

async function run() {
  console.log(`Inserting ${articles.length} articles...\n`);

  for (const article of articles) {
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

  console.log(`\nCannabinoids category now has ${count} articles`);
}

run();
