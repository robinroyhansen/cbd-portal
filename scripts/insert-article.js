const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const article = {
  slug: "how-much-cbd-for-small-pets",
  title: "How Much CBD for Small Pets: Dosing Guide by Species & Weight",
  meta_title: "CBD Dosing for Small Pets: Safe Amounts by Species [2026]",
  meta_description: "CBD dosing guide for rabbits, guinea pigs, ferrets, and hamsters. Weight-based calculations, measurement challenges, and species-specific adjustments explained.",
  excerpt: "Dosing CBD for small pets presents unique challenges that don't exist with dogs or cats. Their tiny body weights make standard measurements inadequate, and species-specific physiology requires careful consideration. This guide provides weight-based starting doses, explains the practical difficulties of accurate measurement, and helps you understand why dosing precision matters more with smaller animals.",
  content: `<div class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-amber-800 mb-2">Important Caveat</p>
<p class="text-amber-900">There is NO published research on CBD dosing for small pets. All dosing guidance is extrapolated from dog and cat studies and adjusted by weight. Individual response varies significantly. These are conservative starting points, not proven doses. Always start lower than suggested and increase gradually with close monitoring.</p>
</div>

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Quick Answer</p>
<p class="text-green-900">Small pet CBD dosing starts at approximately 0.25 mg per kg body weight, given once daily. For a 2 kg rabbit, this equals about 0.5 mg CBD. For a 100g hamster, this equals 0.025 mg—virtually unmeasurable with consumer products. The smaller your pet, the more difficult accurate dosing becomes. Rabbits and larger guinea pigs are practical to dose; ferrets are challenging; hamsters are generally not practical due to measurement limitations.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Key Takeaways</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Starting dose</strong>: 0.25 mg CBD per kg body weight</li>
<li>✓ <strong>Maximum conservative dose</strong>: 1 mg CBD per kg body weight</li>
<li>✓ <strong>Frequency</strong>: Once daily initially</li>
<li>✓ <strong>Adjustment</strong>: Increase by 25% every 5-7 days if needed</li>
<li>✓ <strong>Species matters</strong>: Metabolism varies between species</li>
<li>✓ <strong>Measurement tools</strong>: Precision syringes required for accuracy</li>
<li>✓ <strong>Dilution strategy</strong>: Lower concentration oils easier to dose</li>
</ul>
</div>

## Weight-Based Dosing Chart

### General Starting Doses

| Body Weight | Starting Dose | Low Dose | Moderate Dose | Notes |
|-------------|---------------|----------|---------------|-------|
| **0.5 kg (500g)** | 0.125 mg | 0.25 mg | 0.5 mg | Large guinea pig, small rabbit |
| **1 kg** | 0.25 mg | 0.5 mg | 1 mg | Average rabbit, large guinea pig |
| **1.5 kg** | 0.375 mg | 0.75 mg | 1.5 mg | Medium rabbit |
| **2 kg** | 0.5 mg | 1 mg | 2 mg | Average rabbit |
| **2.5 kg** | 0.625 mg | 1.25 mg | 2.5 mg | Larger rabbit |
| **3 kg** | 0.75 mg | 1.5 mg | 3 mg | Large rabbit |

### Species-Specific Dosing

| Species | Typical Weight | Starting Dose | Practical to Dose? |
|---------|----------------|---------------|--------------------|
| **Rabbit** | 1.5-5 kg | 0.375-1.25 mg | Yes |
| **Guinea pig** | 0.7-1.2 kg | 0.175-0.3 mg | Yes, with care |
| **Ferret** | 0.7-2 kg | 0.175-0.5 mg | Challenging |
| **Hamster** | 0.03-0.15 kg | 0.0075-0.0375 mg | Not practical |
| **Rat** | 0.3-0.5 kg | 0.075-0.125 mg | Very difficult |
| **Gerbil** | 0.05-0.13 kg | 0.0125-0.0325 mg | Not practical |

## The Measurement Problem

### Why Small Pet Dosing Is Difficult

| Challenge | Example |
|-----------|---------|
| **Tiny amounts** | 0.3 mg dose is 0.01 mL of typical 30 mg/mL oil |
| **Dropper limitations** | Standard droppers measure ~1 mL minimum |
| **Volume too small** | Needed doses often smaller than one drop |
| **Measurement error** | 0.05 mL mistake = 50%+ dosing error |
| **Concentration issues** | Most oils too concentrated for small pets |

### Practical Measurement Tools

| Tool | Accuracy | Best For |
|------|----------|----------|
| **Standard dropper** | ~0.5-1 mL | Dogs, cats only |
| **1 mL oral syringe** | 0.1 mL increments | Rabbits, large guinea pigs |
| **0.5 mL precision syringe** | 0.01 mL increments | Guinea pigs, ferrets |
| **Insulin syringe (100 unit)** | 0.01 mL | Smallest measurable volumes |
| **Veterinary compounding** | Precise custom doses | All species |

### Concentration Selection

| Oil Concentration | 1 Drop (~0.05 mL) Contains | Best For |
|-------------------|---------------------------|----------|
| **5 mg/mL (150 mg/30 mL)** | ~0.25 mg | Rabbits, guinea pigs |
| **10 mg/mL (300 mg/30 mL)** | ~0.5 mg | Rabbits only |
| **17 mg/mL (500 mg/30 mL)** | ~0.85 mg | Too concentrated |
| **33 mg/mL (1000 mg/30 mL)** | ~1.65 mg | Not suitable |

**Recommendation:** Use the lowest concentration oil available (5-10 mg/mL) for small pets.

## Species-Specific Dosing Guidelines

### Rabbits

| Factor | Consideration |
|--------|---------------|
| **Dose range** | 0.25-1 mg/kg |
| **Frequency** | Once daily |
| **Administration** | Oral syringe, mix with banana/herb treat |
| **Monitoring** | Appetite, cecotrope production, activity |
| **GI consideration** | Start very low—GI stasis risk |
| **Best practice** | Give with small food amount, not on empty stomach |

**Example Dosing:**
| Rabbit Weight | Starting | Low | Moderate |
|---------------|----------|-----|----------|
| **1.5 kg** | 0.375 mg | 0.75 mg | 1.5 mg |
| **2 kg** | 0.5 mg | 1 mg | 2 mg |
| **3 kg** | 0.75 mg | 1.5 mg | 3 mg |
| **4 kg** | 1 mg | 2 mg | 4 mg |

### Guinea Pigs

| Factor | Consideration |
|--------|---------------|
| **Dose range** | 0.25-0.75 mg/kg (conservative) |
| **Frequency** | Once daily |
| **Administration** | Oral syringe, mix with vitamin C source |
| **Monitoring** | Appetite, droppings, vitamin C intake |
| **GI consideration** | Hindgut fermenter—same caution as rabbits |
| **Practical limit** | Doses below 0.1 mg difficult to measure |

**Example Dosing:**
| Guinea Pig Weight | Starting | Low | Moderate |
|-------------------|----------|-----|----------|
| **700g** | 0.175 mg | 0.35 mg | 0.5 mg |
| **900g** | 0.225 mg | 0.45 mg | 0.675 mg |
| **1.1 kg** | 0.275 mg | 0.55 mg | 0.825 mg |

### Ferrets

| Factor | Consideration |
|--------|---------------|
| **Dose range** | 0.25-0.75 mg/kg (very conservative) |
| **Frequency** | Once daily |
| **Administration** | Oral syringe, salmon oil may help acceptance |
| **Monitoring** | Energy, appetite, blood sugar if insulinoma |
| **Metabolic consideration** | Obligate carnivore—may process differently |
| **Disease caution** | Extra care with insulinoma (blood sugar) |

**Example Dosing:**
| Ferret Weight | Starting | Low | Moderate |
|---------------|----------|-----|----------|
| **700g** | 0.175 mg | 0.35 mg | 0.5 mg |
| **1 kg** | 0.25 mg | 0.5 mg | 0.75 mg |
| **1.5 kg** | 0.375 mg | 0.75 mg | 1.125 mg |
| **2 kg** | 0.5 mg | 1 mg | 1.5 mg |

### Hamsters (Generally Not Recommended)

| Factor | Reality |
|--------|---------|
| **Calculated dose** | 0.0075-0.0375 mg |
| **Measurement challenge** | Requires 0.00025 mL for starting dose |
| **Available tools** | Cannot measure accurately |
| **Overdose risk** | Extremely high due to measurement error |
| **Practical assessment** | Dosing not feasible with consumer products |

**Recommendation:** CBD is not practical for hamsters due to the impossibility of accurate dosing with available tools.

## Calculating Your Pet's Dose

### Step-by-Step Process

| Step | Action | Example (1.5 kg rabbit) |
|------|--------|-------------------------|
| **1** | Weigh pet in kg | 1.5 kg |
| **2** | Multiply by 0.25 mg/kg | 1.5 × 0.25 = 0.375 mg |
| **3** | Check oil concentration | 5 mg/mL example |
| **4** | Calculate volume | 0.375 ÷ 5 = 0.075 mL |
| **5** | Convert to drops | ~1.5 drops (0.05 mL/drop) |
| **6** | Round conservatively | Start with 1 drop |

### Volume Reference Table (5 mg/mL Oil)

| CBD Dose | Volume Needed | Approximate Drops |
|----------|---------------|-------------------|
| **0.125 mg** | 0.025 mL | Less than 1 drop |
| **0.25 mg** | 0.05 mL | ~1 drop |
| **0.375 mg** | 0.075 mL | ~1.5 drops |
| **0.5 mg** | 0.1 mL | ~2 drops |
| **0.75 mg** | 0.15 mL | ~3 drops |
| **1 mg** | 0.2 mL | ~4 drops |

## Administration Methods

### Oral Syringe (Recommended)

| Advantage | Detail |
|-----------|--------|
| **Precision** | More accurate than droppers |
| **Control** | Deliver exact amount |
| **Safety** | Reduces overdose risk |
| **Availability** | Pharmacy or veterinary supply |

### With Food

| Species | Food Options |
|---------|--------------|
| **Rabbit** | Small piece of banana, basil, cilantro |
| **Guinea pig** | Bell pepper, cucumber (with vitamin C) |
| **Ferret** | Salmon oil, meat-based treat |

### Direct Oral Administration

| Step | Instruction |
|------|-------------|
| **1** | Draw measured dose into syringe |
| **2** | Gently restrain pet |
| **3** | Insert syringe tip at side of mouth |
| **4** | Slowly dispense (avoid aspiration) |
| **5** | Release and offer treat |

## Adjusting Doses

### When to Increase

| Sign | Interpretation |
|------|----------------|
| **No observed effect** | After 7+ days at starting dose |
| **Tolerated well** | No adverse effects |
| **Condition unchanged** | Target symptoms persist |

### How to Increase

| Guideline | Detail |
|-----------|--------|
| **Increment** | 25% increase |
| **Frequency** | Every 5-7 days maximum |
| **Maximum** | 1 mg/kg for most small pets |
| **Documentation** | Track dose and response |

### When to Decrease or Stop

| Sign | Action |
|------|--------|
| **Lethargy** | Reduce dose 50% or stop |
| **Appetite decrease** | Stop immediately |
| **GI changes** | Stop; monitor carefully |
| **Any abnormal behavior** | Stop; assess |

## Dosing Frequency

### Standard Protocol

| Phase | Frequency |
|-------|-----------|
| **Initial (weeks 1-2)** | Once daily |
| **If tolerated, as needed** | Twice daily possible |
| **Maximum** | Twice daily |

### Timing Considerations

| Timing | Best For |
|--------|----------|
| **Morning** | Anxiety (day coverage) |
| **Evening** | Sleep support, calming |
| **With meals** | Better absorption, GI protection |
| **Consistent time** | Allows meaningful monitoring |

## Special Considerations

### Multiple Small Pets

| Factor | Guidance |
|--------|----------|
| **Individual dosing** | Each pet needs own calculation |
| **Weight variation** | Even same species varies |
| **Separate administration** | Don't share doses |
| **Track separately** | Monitor each individually |

### Senior Small Pets

| Consideration | Adjustment |
|---------------|------------|
| **Slower metabolism** | Start 25% lower than calculated |
| **Longer monitoring** | Effects may take longer |
| **Kidney/liver function** | May clear CBD slower |
| **Drug interactions** | More likely on medications |

### Pregnancy/Nursing

| Status | Recommendation |
|--------|----------------|
| **Pregnant** | Avoid—no safety data |
| **Nursing** | Avoid—transfers to milk |
| **Breeding animals** | Avoid—unknown effects |

## Creating a Dosing Log

### What to Record

| Entry | Purpose |
|-------|---------|
| **Date and time** | Track consistency |
| **CBD dose (mg)** | Exact amount given |
| **Product details** | Concentration, brand |
| **Pet's weight** | Track any changes |
| **Observations** | Behavior, appetite, activity |
| **Target symptom rating** | 1-10 scale before/after |

### Sample Log Entry

| Field | Example |
|-------|---------|
| **Date** | January 19, 2026 |
| **Time** | 8:00 AM |
| **Dose** | 0.5 mg CBD |
| **Product** | 5 mg/mL hemp oil |
| **Volume** | 0.1 mL |
| **Weight** | 2 kg (rabbit) |
| **Observations** | Normal appetite, active |
| **Anxiety rating** | 6/10 (slight improvement) |

## Common Dosing Mistakes

### Errors to Avoid

| Mistake | Consequence |
|---------|-------------|
| **Using high-concentration oil** | Difficult to measure, overdose risk |
| **Eyeballing doses** | Inconsistent amounts |
| **Increasing too fast** | Can't identify optimal dose |
| **Ignoring weight changes** | Dose becomes inaccurate |
| **Sharing calculations** | Each pet needs own dose |

### How to Avoid

| Practice | Why It Helps |
|----------|--------------|
| **Use precision syringes** | Accurate measurement |
| **Choose low concentration** | Easier to dose small amounts |
| **Wait between increases** | See true effects |
| **Re-weigh monthly** | Keep dose accurate |
| **Document everything** | Track patterns objectively |

## Common Questions About CBD Dosing for Small Pets

### Why can't I just use the same dose as for my dog?

Dog doses don't translate directly to small pets because of the massive weight difference and potential metabolic variations between species. A "low" dog dose of 5 mg could be 10x the appropriate amount for a guinea pig. Additionally, dogs have been studied; small pets haven't. The extrapolation must be extremely conservative. Weight-based calculations (mg per kg) help, but even then, starting at the low end and monitoring closely is essential.

### My CBD oil says "1 dropper = 25 mg CBD." How do I give my rabbit 0.5 mg?

This is the core challenge. If 1 full dropper (1 mL) contains 25 mg, you'd need 1/50th of that dropper for 0.5 mg—impossible to measure accurately. Solution: Use a much lower concentration oil. Look for 150 mg per 30 mL bottle (5 mg/mL), where 0.1 mL equals 0.5 mg—measurable with a precision syringe. Alternatively, some owners dilute higher concentration oils with additional carrier oil, though this requires precise calculation.

### Can I give CBD twice a day to my small pet?

Start with once daily. CBD effects in dogs last approximately 4-6 hours, possibly longer in smaller animals with different metabolisms. If once daily dosing isn't providing adequate duration of effect—for example, if your rabbit seems anxious again by evening after a morning dose—you could try twice daily. However, don't double the total daily amount; split it (half in morning, half in evening). Only consider this after 2+ weeks at a stable once-daily dose.

### How do I know if I gave too much CBD?

Watch for: unusual lethargy or sedation (beyond normal rest), decreased appetite (especially concerning in rabbits and guinea pigs), changes in droppings (smaller, fewer, or different consistency), unsteadiness or wobbliness, and any behavior that seems "off" for your specific pet. If you observe these, stop CBD immediately and monitor. Most overdose effects resolve within 12-24 hours as CBD clears the system. If symptoms persist or worsen, contact a veterinarian.

### My small pet won't take CBD from a syringe. What are alternatives?

Try mixing with a highly palatable food. For rabbits: banana, fresh herbs like cilantro or basil, or a small piece of apple (sparingly due to sugar). For guinea pigs: bell pepper or cucumber slice. For ferrets: salmon oil or a meat-based treat. Apply the measured dose to the food and ensure your pet eats all of it. Avoid sprinkling on hay or larger food portions where consumption is uncertain.

### Should I adjust the dose seasonally or as my pet ages?

Weigh your pet regularly (monthly is ideal) and recalculate doses accordingly. Weight fluctuations affect appropriate dosing. For aging pets, metabolism may slow—you might notice the same dose having stronger effects over time. Senior pets may need reduced doses compared to when they were younger. Always err on the side of less, especially as pets age, since their ability to process substances typically decreases.

---

## Related Articles

- [Is CBD Safe for Small Animals?](/articles/is-cbd-safe-for-small-animals)
- [CBD for Small Pets: Complete Guide](/articles/cbd-for-small-pets)
- [CBD for Rabbits](/articles/cbd-for-rabbits)
- [CBD for Guinea Pigs](/articles/cbd-for-guinea-pigs)
- [CBD for Ferrets](/articles/cbd-for-ferrets)
- [CBD for Hamsters](/articles/cbd-for-hamsters)

---

## Sources

1. Gamble LJ, et al. (2018). "CBD treatment in osteoarthritic dogs." *Frontiers in Veterinary Science*. (Dosing reference extrapolated from dogs)
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/30083539/)

2. Deabold KA, et al. (2019). "Single-Dose Pharmacokinetics and Preliminary Safety Assessment with Use of CBD-Rich Hemp Nutraceutical in Healthy Dogs and Cats." *Animals*. (Cross-species pharmacokinetics)
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/31546658/)

3. McGrath S, et al. (2019). "Randomized blinded controlled clinical trial to assess the effect of oral cannabidiol administration on seizure frequency in dogs with intractable idiopathic epilepsy." *JAVMA*. (Dosing protocols)
   [PubMed](https://pubmed.ncbi.nlm.nih.gov/31162161/)

4. Quesenberry KE & Carpenter JW. (2021). "Ferrets, Rabbits, and Rodents: Clinical Medicine and Surgery." 4th ed. (Weight references, physiology)

5. Harkness JE, et al. (2010). "Biology and Medicine of Rabbits and Rodents." 5th ed. (Species-specific considerations)

---

**Veterinary Disclaimer:** This article is for informational purposes only and does not constitute veterinary advice. There is no published research on CBD dosing for small pets. All doses are extrapolated from dog studies and adjusted conservatively by weight. Individual animals may respond differently. Small pets have unique physiologies and some species may not be practical to dose with available consumer products. Always consult an exotic animal veterinarian before starting CBD. Stop immediately if any adverse effects occur.`,
  category_id: "e15ff27f-cce7-4c55-83fa-4f7941b3280e",
  status: "published",
  author_id: null,
  featured_image: null,
  published_at: new Date().toISOString(),
  reading_time: 12,
  language: "en",
  article_type: "educational"
};

(async () => {
  const { data, error } = await supabase.from("kb_articles").insert([article]).select();
  if (error) console.error("Error:", error.message);
  else console.log("Inserted:", data[0].title);
})();
