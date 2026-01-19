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
    slug: "how-to-spot-fake-cbd",
    title: "How to Spot Fake CBD Products: Warning Signs & Scams",
    meta_description:
      "Learn to identify fake and low-quality CBD products. Understand common scams, warning signs, and how to protect yourself from counterfeit CBD.",
    content: `# How to Spot Fake CBD Products: Warning Signs & Scams

**Quick Answer:** Spot fake CBD products by checking for missing or unverifiable lab reports, unrealistic health claims, extremely low prices, and poor packaging quality. Legitimate CBD products have batch-specific COAs from accredited labs, clear ingredient lists, and transparent company information. If something seems too good to be true, it likely is.

## Key Takeaways

- **No lab reports = major red flag**
- **Miracle cure claims are illegal** and indicate disreputable products
- **Extremely low prices** often mean little or no actual CBD
- **Verify before buying** — research brands thoroughly

---

## Common Types of CBD Fraud

### 1. No CBD or Very Little CBD

Some products labeled as CBD contain little to no actual cannabidiol.

**How to spot it:**
- Price drastically below market rate
- No COA available
- COA shows far less CBD than label claims
- No effects whatsoever (though individual response varies)

### 2. Contaminated Products

Products containing harmful substances not listed on labels.

**Potential contaminants:**
- Synthetic cannabinoids (dangerous)
- Heavy metals
- Pesticides
- Residual solvents
- Bacteria/mold

**How to spot it:**
- No contaminant testing on COA
- Unusual side effects
- Product from unregulated sources

### 3. Mislabeled THC Content

Products with more THC than legally allowed or advertised.

**Risks:**
- Unexpected intoxication
- Failed drug tests
- Legal issues

**How to spot it:**
- No THC testing on COA
- COA shows THC above 0.3%
- Full-spectrum products without THC disclosure

### 4. Counterfeit Brand Products

Fake versions of legitimate brands sold at lower prices.

**How to spot it:**
- Unusually low prices for premium brands
- Purchasing from unauthorized retailers
- Packaging quality differs from legitimate products
- Batch numbers don't verify on brand website

---

## Red Flags Checklist

### Product Red Flags

| Warning Sign | What It Suggests |
|--------------|-----------------|
| No mg amount listed | Can't verify potency |
| No batch/lot number | Can't verify testing |
| "Miracle cure" claims | Illegal, untrustworthy |
| Extremely low price | May be fake or underdosed |
| Poor packaging quality | Unprofessional operation |
| No ingredients list | What else is in there? |
| No expiration date | Poor quality control |

### Seller Red Flags

| Warning Sign | What It Suggests |
|--------------|-----------------|
| No physical address | Untraceable business |
| No contact information | No accountability |
| Only positive reviews | Potentially fake reviews |
| No return policy | Won't stand behind product |
| Pressure tactics | Manipulative selling |
| Cash-only transactions | Avoiding documentation |

### COA Red Flags

| Warning Sign | What It Suggests |
|--------------|-----------------|
| No COA available | No verification possible |
| COA from unknown lab | Could be fabricated |
| Batch number mismatch | COA may not be for your product |
| Missing tests | Incomplete safety verification |
| Old dates | May not reflect current product |

---

## How Scammers Operate

### The "Free Trial" Scam

**How it works:**
- Advertise "free" or "just pay shipping" CBD
- Fine print enrolls you in subscription
- Credit card charged monthly for overpriced products

**Protection:**
- Read all terms before entering payment info
- Avoid "free trial" offers entirely
- Monitor credit card statements

### The Celebrity Endorsement Scam

**How it works:**
- Fake articles claim celebrities use specific CBD brands
- Uses fabricated quotes and unauthorized photos
- Products are often low quality or non-existent

**Protection:**
- Verify endorsements through official celebrity channels
- Be skeptical of "news" articles promoting specific products
- Celebrity endorsements don't guarantee quality anyway

### The Miracle Cure Scam

**How it works:**
- Claims CBD cures cancer, diabetes, or other serious diseases
- Uses fake testimonials and pseudoscience
- Preys on desperate people seeking treatment

**Protection:**
- Remember: CBD cannot legally claim to cure any disease
- Consult healthcare providers for medical conditions
- Be extremely skeptical of extraordinary health claims

### The Amazon/eBay Marketplace Scam

**How it works:**
- Lists "hemp oil" products as if they contain CBD
- Uses misleading language and images
- Products may contain no CBD at all

**Protection:**
- Note that major platforms often prohibit CBD sales
- "Hemp oil" and "hemp seed oil" may contain zero CBD
- Purchase from brand websites or authorized retailers

---

## Verification Steps Before Buying

### 1. Research the Brand (5 minutes)

- Search "[brand name] reviews"
- Look for reviews on multiple platforms
- Check Better Business Bureau listing
- Verify physical business address exists

### 2. Verify Lab Testing (5 minutes)

- Find COA on brand website
- Confirm lab is ISO 17025 accredited
- Match batch numbers
- Check all required tests are present

### 3. Analyze Pricing (2 minutes)

Calculate cost per mg of CBD:
- Industry average: $0.05-0.15 per mg
- Below $0.03/mg: Investigate carefully
- Above $0.20/mg: Verify premium justification

### 4. Check Claims (2 minutes)

Legitimate products:
- Don't claim to cure diseases
- Use language like "may support" or "promotes"
- Don't guarantee specific results

---

## Where to Buy Safely

### Recommended Sources

| Source | Pros | Cons |
|--------|------|------|
| Brand direct (website) | Authentic, full info | May cost more |
| Authorized retailers | Convenient, verified | Verify authorization |
| Licensed dispensaries | Regulated, tested | Limited availability |
| Specialty CBD stores | Knowledgeable staff | Quality varies |

### Higher-Risk Sources

| Source | Risk Factors |
|--------|--------------|
| Random online stores | Verification difficult |
| Gas stations | Often low quality |
| Flea markets | No accountability |
| Social media sellers | Minimal oversight |
| Unregulated marketplaces | May prohibit CBD entirely |

---

## What to Do If You've Been Scammed

### Immediate Steps

1. **Stop using the product** — especially if you've had adverse reactions
2. **Document everything** — save receipts, emails, packaging, product
3. **Contact your bank** — dispute charges if necessary
4. **Report the seller** — to platform and authorities

### Where to Report

| Issue Type | Report To |
|------------|-----------|
| Unauthorized charges | Your credit card company |
| Fake products | FTC (ftc.gov/complaint) |
| Adverse reactions | FDA MedWatch |
| Illegal health claims | FDA |
| Marketplace violations | Amazon, eBay, etc. |

---

## Quality Verification Summary

### Must-Have

- ✅ Verifiable third-party COA
- ✅ Clear mg potency on label
- ✅ Full ingredients list
- ✅ Batch/lot number
- ✅ Company contact information

### Should Have

- ✅ Hemp source information
- ✅ Extraction method disclosed
- ✅ Reasonable pricing
- ✅ Multiple contact options
- ✅ Return/refund policy

### Red Flags (Avoid)

- ❌ No COA or unverifiable testing
- ❌ Disease cure claims
- ❌ Suspiciously low prices
- ❌ No business address
- ❌ Pressure selling tactics

---

## FAQ

### Is cheap CBD always fake?
Not always, but extremely low prices often indicate quality issues. Budget CBD exists, but prices far below market average warrant investigation.

### Can I trust CBD from Amazon?
Amazon's policy technically prohibits CBD sales. Products labeled "hemp oil" or "hemp extract" may contain zero CBD. Exercise extreme caution.

### How do I verify a COA is real?
Check that the lab exists, has ISO accreditation, and some labs offer online verification. Call the lab if necessary.

### What if a product has no effects — is it fake?
Not necessarily. Individual responses vary, and some people need time to build up CBD effects. However, complete lack of any effect combined with other red flags is concerning.

### Can I get my money back for fake CBD?
Potentially. Contact your credit card company for chargebacks, and file complaints with relevant authorities. Keep all documentation.

---

*This article is for informational purposes only and does not constitute medical advice. Always verify CBD product quality before purchase from reputable sources.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-store-cbd-products",
    title: "How to Store CBD Products: Keep Your CBD Fresh & Potent",
    meta_description:
      "Learn proper CBD storage to maintain potency and freshness. Covers temperature, light, and humidity guidelines for oils, gummies, topicals, and vapes.",
    content: `# How to Store CBD Products: Keep Your CBD Fresh & Potent

**Quick Answer:** Store CBD products in a cool (60–70°F), dark place away from direct sunlight and heat sources. Keep containers tightly sealed to prevent air exposure. Most CBD products last 12–24 months when stored properly. Refrigeration is optional for oils and extends shelf life but may thicken the product.

## Key Takeaways

- **Cool and dark** — avoid heat and sunlight
- **Sealed tight** — minimize air exposure
- **Upright storage** — prevents leaking and contamination
- **Away from humidity** — especially for gummies and flower

---

## What Degrades CBD

Understanding what damages CBD helps you protect your investment:

| Factor | How It Harms CBD | Solution |
|--------|------------------|----------|
| Light | UV breaks down cannabinoids | Store in dark place or opaque container |
| Heat | Accelerates degradation | Keep at room temp or below |
| Air/Oxygen | Oxidation reduces potency | Keep tightly sealed |
| Humidity | Promotes mold (especially in flower) | Dry environment |
| Time | Natural degradation | Use before expiration |

---

## Storage by Product Type

### CBD Oils and Tinctures

**Ideal storage:**
- Cool, dark cabinet
- Original bottle with cap tight
- Standing upright

**Temperature:** 60–70°F (15–21°C)

**Refrigeration:** Optional
- Extends shelf life
- May cause oil to thicken (let warm before use)
- Don't freeze

**Avoid:**
- Windowsills
- Near stove or oven
- Bathroom (humidity)
- Car in summer

**Shelf life:** 12–24 months

---

### CBD Gummies and Edibles

**Ideal storage:**
- Cool, dry location
- Original container or airtight container
- Away from humidity

**Temperature:** 60–70°F (15–21°C)

**Refrigeration:** Generally not needed
- Can extend freshness
- May harden texture
- Don't freeze (ruins texture)

**Avoid:**
- Heat (gummies melt)
- Humidity (sticky, potential mold)
- Direct sunlight
- Near strong odors (absorb smells)

**Shelf life:** 6–12 months (shorter than oils)

---

### CBD Capsules

**Ideal storage:**
- Room temperature
- Original bottle with desiccant pack
- Away from moisture

**Temperature:** 60–75°F (15–24°C)

**Refrigeration:** Not recommended
- Moisture condensation can damage capsules

**Avoid:**
- Bathroom medicine cabinet (humidity)
- Kitchen near heat sources

**Shelf life:** 12–24 months

---

### CBD Topicals (Creams, Balms, Salves)

**Ideal storage:**
- Room temperature
- Tightly closed container
- Clean application methods

**Temperature:** 60–75°F (15–24°C)

**Refrigeration:** Usually not needed
- Some prefer cooled topicals
- Very cold may harden balms/salves

**Avoid:**
- Double-dipping (introduces bacteria)
- Heat exposure (separation)
- Contamination from dirty hands

**Shelf life:** 12–24 months

---

### CBD Vape Products

**Cartridges and E-liquids:**
- Store upright to prevent leaking
- Room temperature
- Away from heat (batteries explode)
- Keep caps on e-liquid bottles

**Temperature:** 60–70°F (15–21°C)

**Avoid:**
- Cars in summer (extreme heat)
- Direct sunlight
- Near batteries or heat sources

**Shelf life:** 6–12 months

---

### CBD Flower

**Ideal storage:**
- Airtight glass jar
- Cool, dark location
- With humidity control (58–62% RH)

**Temperature:** 60–70°F (15–21°C)

**Humidity control:**
- Use humidity packs (Boveda, Integra)
- Too dry = harsh, crumbly
- Too wet = mold risk

**Avoid:**
- Plastic bags (static, terpene loss)
- Light exposure
- Temperature fluctuations
- Excessive handling

**Shelf life:** 6–12 months optimal quality

---

## General Storage Guidelines

### Do's

| Action | Benefit |
|--------|---------|
| Store in original packaging | Designed for protection |
| Keep in cool, dark place | Prevents degradation |
| Seal tightly after each use | Minimizes oxidation |
| Check expiration dates | Ensures potency |
| Keep upright | Prevents leaks |

### Don'ts

| Action | Why to Avoid |
|--------|--------------|
| Store in direct sunlight | UV degrades CBD |
| Leave near heat sources | Accelerates breakdown |
| Keep in bathroom | Humidity damages products |
| Leave caps loose | Air exposure reduces potency |
| Store in car | Temperature extremes |

---

## Signs Your CBD Has Degraded

### Visual Changes

| Sign | What It Means |
|------|---------------|
| Oil becomes very dark | Oxidation/degradation |
| Cloudiness (if previously clear) | Possible contamination |
| Separation that won't remix | Product breakdown |
| Mold visible | Discard immediately |

### Texture Changes

| Sign | Product Type |
|------|--------------|
| Unusual thickness | Oils — may still be okay |
| Grainy texture | Oils — crystallization |
| Sticky/clumping | Gummies — moisture exposure |
| Crumbling | Capsules — moisture damage |

### Smell Changes

| Sign | Action |
|------|--------|
| Rancid oil smell | Likely expired — discard |
| Musty/moldy odor | Contaminated — discard |
| No smell at all | May have lost potency |

---

## Special Storage Situations

### Traveling with CBD

**Short trips (days):**
- Keep in carry-on (room temperature area)
- Avoid checked luggage in summer (cargo heat)
- Original packaging for identification

**Long trips (weeks+):**
- Consider smaller quantities
- Ensure products won't expire during trip
- Research destination laws

### Bulk Storage

**Buying in quantity:**
- Keep unopened products sealed
- Store extras in coolest, darkest location
- Rotate stock (use oldest first)
- Consider refrigeration for long-term storage

### Seasonal Considerations

**Summer:**
- Never leave in car
- Consider refrigeration
- Check gummies for melting

**Winter:**
- Bring in from car (cold thickens oils)
- Let products reach room temp before use
- Avoid temperature swings

---

## Extending Shelf Life

### Best Practices

1. **Buy appropriate quantities** — Don't stockpile beyond what you'll use
2. **Check manufacture dates** — Buy recently made products
3. **Use clean tools** — Prevent contamination
4. **Minimize air exposure** — Quick opens and closes
5. **Store original containers** — They're designed for protection

### When to Refrigerate

**Consider refrigeration if:**
- You won't use product for months
- Room is consistently above 75°F
- Product will last longer than 6 months

**Refrigeration notes:**
- Let products warm before opening (prevents condensation)
- Thick oils may need more warm-up time
- Don't refrigerate gummies (texture issues)

---

## FAQ

### Does CBD oil go bad?
Yes, CBD oil degrades over time. Properly stored, most oils last 12–24 months. Expired oil isn't necessarily dangerous but may lose potency and taste.

### Should I keep CBD in the fridge?
It's optional. Refrigeration extends shelf life but thickens oils. Room temperature storage in a cool, dark cabinet works for most users.

### Can I freeze CBD products?
Generally not recommended. Freezing can damage product structure, especially gummies and capsules. Cold is good; freezing is usually overkill.

### Why did my CBD oil turn dark?
Darkening is normal over time due to oxidation. Slightly darker oil may still be fine. Very dark, murky oil with off smells should be discarded.

### How do I know if my CBD is still potent?
Short of lab testing, you can't be certain. Use within expiration date, store properly, and note if effects seem weaker over time.

---

*This article is for informational purposes only and does not constitute medical advice. Follow manufacturer storage recommendations when available.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-travel-with-cbd",
    title: "How to Travel with CBD: Flying, Driving & International Rules",
    meta_description:
      "Learn how to travel with CBD legally and safely. Covers TSA rules, state laws, international travel restrictions, and tips for hassle-free trips with CBD products.",
    content: `# How to Travel with CBD: Flying, Driving & International Rules

**Quick Answer:** Hemp-derived CBD with less than 0.3% THC is federally legal to fly with in the US per TSA guidelines, but individual state laws vary. International travel with CBD is risky — many countries prohibit it entirely. Always carry documentation (COA), keep products in original packaging, and research destination laws before traveling.

## Key Takeaways

- **TSA allows hemp CBD** (<0.3% THC) on US flights
- **State laws vary** — research your destination
- **International travel is risky** — many countries ban CBD
- **Documentation helps** — carry COAs and receipts

---

## US Domestic Travel

### TSA Guidelines

The Transportation Security Administration (TSA) updated rules in 2019 to permit:
- Hemp-derived CBD products containing <0.3% THC
- FDA-approved CBD medications (Epidiolex)

**What this means practically:**
- CBD is not specifically targeted by TSA
- Products may be screened if flagged
- Marijuana-derived products remain prohibited

### Flying with CBD

**Carry-on vs. checked baggage:**

| Product Type | Carry-On | Checked |
|--------------|----------|---------|
| CBD oil (<3.4oz) | ✓ Yes | ✓ Yes |
| CBD oil (>3.4oz) | ✗ No (liquid rules) | ✓ Yes |
| CBD gummies | ✓ Yes | ✓ Yes |
| CBD capsules | ✓ Yes | ✓ Yes |
| CBD topicals (<3.4oz) | ✓ Yes | ✓ Yes |
| CBD vape cartridges | ✓ Yes (required*) | ✗ No (battery rules) |
| CBD flower | Risky (looks like marijuana) | Risky |

*Vape batteries and cartridges must go in carry-on due to lithium battery regulations.

### Best Practices for Flying

1. **Keep original packaging** — Labels show what the product is
2. **Carry documentation** — COA proving <0.3% THC
3. **Pack logically** — Easy to identify during screening
4. **Research destination state** — Laws vary
5. **Declare if asked** — Honesty prevents complications

### State-by-State Considerations

While federally legal, some states have stricter CBD laws:

**Generally CBD-friendly states:**
- Colorado, California, Oregon, Nevada, etc.
- Most states allow hemp-derived CBD

**States with restrictions:**
- Some states limit CBD types or sales locations
- Rules change frequently
- Research current laws before travel

---

## Driving with CBD

### Within Your State

Generally straightforward if CBD is legal in your state. Keep products:
- In original packaging
- Away from driver reach (trunk or closed container)
- With documentation available

### Crossing State Lines

**Considerations:**
- Hemp CBD is federally legal, so crossing state lines should be okay
- However, you pass through each state's jurisdiction
- Some states historically have stricter enforcement

**Best practices:**
- Research states you'll pass through
- Keep COA documentation handy
- Avoid states with strict cannabis enforcement if possible
- Store in trunk/closed container

---

## International Travel

### General Rule: Exercise Extreme Caution

Many countries have zero-tolerance drug policies that include CBD, regardless of THC content.

### Countries Where CBD Is Prohibited or Risky

| Country/Region | Status | Risk Level |
|----------------|--------|------------|
| Asia (most countries) | Generally prohibited | Very high |
| Middle East | Generally prohibited | Very high |
| Russia | Prohibited | Very high |
| China | Prohibited | Very high |
| Japan | Prohibited (even trace THC) | Very high |
| UAE | Prohibited | Very high |
| Singapore | Prohibited | Very high |

### Countries with Legal or Permitted CBD

| Country | Status | Notes |
|---------|--------|-------|
| United Kingdom | Legal | THC must be 0% |
| Canada | Legal | Regulated sales |
| Germany | Legal | Pharmacy sales |
| Switzerland | Legal | Higher THC threshold (1%) |
| Netherlands | Legal | Regulated |

**Important:** Laws change frequently. Always verify current regulations before travel.

### International Travel Recommendations

1. **Default assumption:** Don't bring CBD internationally
2. **If you must:** Research extensively
3. **When in doubt:** Leave it home and purchase locally (if legal)
4. **Prescriptions:** Even medical CBD may be prohibited

---

## Documentation to Carry

### Essential Documents

| Document | Purpose |
|----------|---------|
| Certificate of Analysis (COA) | Proves THC content <0.3% |
| Purchase receipt | Shows legal purchase |
| Product packaging | Original label information |

### Optional but Helpful

| Document | Purpose |
|----------|---------|
| Brand authenticity letter | Verifies legitimate product |
| Doctor's note (if applicable) | Medical context |
| State/country legal summary | Quick reference for authorities |

### Why Documentation Matters

- CBD products can't be visually distinguished from THC products
- Lab reports prove legal THC levels
- Receipts show legitimate retail purchase
- Packaging provides product information

---

## What to Do If Questioned

### At Airport Security

1. **Stay calm** — Anxiety raises suspicion
2. **Be honest** — Explain it's hemp-derived CBD
3. **Offer documentation** — COA showing THC content
4. **Cooperate** — Follow officer instructions
5. **Know your rights** — But don't argue

### During Traffic Stops

1. **Inform officer** — "I have CBD products, legally purchased"
2. **Show documentation** — Have COA ready
3. **Keep products accessible** — Trunk/glove box
4. **Cooperate** — Escalation helps no one

### Worst Case Scenarios

- Products may be confiscated pending verification
- You may be detained while products are tested
- False positive field tests are possible
- Having documentation significantly improves outcomes

---

## Product-Specific Travel Tips

### CBD Oils

- Follow TSA liquid rules (3.4oz carry-on limit)
- Pack securely to prevent leaking
- Consider smaller travel sizes
- Keep upright

### CBD Gummies

- Look like regular candy — advantage for discretion
- Keep in original packaging for identification
- Declare if asked (don't lie)

### CBD Vapes

- Batteries must go in carry-on
- E-liquids follow liquid rules
- Cartridges can be tricky — consider leaving home

### CBD Flower

- **Avoid traveling with flower**
- Visually identical to marijuana
- Very high risk of complications
- Field tests may false positive

---

## Alternative: Buying CBD at Your Destination

### Advantages

- No travel risk
- Legal in destination
- No crossing borders with products
- Fresh products

### How to Find CBD at Your Destination

- Research dispensaries/shops before trip
- Check local brand availability
- Read reviews for quality stores
- Verify local laws first

---

## FAQ

### Can TSA drug dogs detect CBD?
TSA dogs are typically trained for explosives, not drugs. However, police dogs may be trained for cannabis, and CBD flower smells similar to marijuana.

### What happens if TSA finds CBD in my bag?
If it appears to be hemp CBD (<0.3% THC), TSA typically allows it. They may refer to local law enforcement if uncertain. Documentation helps tremendously.

### Can I mail CBD products to my destination instead?
Within the US, mailing hemp CBD is legal via USPS, UPS, and FedEx. International shipping is complicated by destination country laws.

### Is it safe to travel with CBD internationally for medical reasons?
No assumption of safety. Even medical CBD is prohibited in many countries. Research thoroughly and consult your embassy if uncertain.

### What if my CBD tests positive for THC at a checkpoint?
Field tests are notoriously inaccurate. Remain calm, request lab testing, and provide your COA. Lab tests should verify legal THC levels.

---

## Travel Checklist

### Before Your Trip

- [ ] Research destination CBD laws
- [ ] Research transit state/country laws
- [ ] Obtain COA for your products
- [ ] Keep purchase receipts
- [ ] Pack in original containers
- [ ] Consider travel-size options

### Packing

- [ ] Liquids under 3.4oz for carry-on
- [ ] Vape batteries in carry-on
- [ ] Products easily accessible
- [ ] Documentation with products

### At Security

- [ ] Declare if asked
- [ ] Offer documentation
- [ ] Remain calm and cooperative

---

*This article is for informational purposes only and does not constitute legal advice. Laws change frequently. Always research current regulations before traveling with CBD products.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-dispose-of-cbd-products",
    title: "How to Dispose of CBD Products Safely & Responsibly",
    meta_description:
      "Learn the proper way to dispose of expired or unwanted CBD products. Covers safe disposal methods for oils, gummies, topicals, vapes, and packaging.",
    content: `# How to Dispose of CBD Products Safely & Responsibly

**Quick Answer:** Dispose of CBD products by mixing oils with absorbent material (coffee grounds, cat litter) and placing in sealed trash. Gummies and edibles can go directly in household trash. Never flush CBD products or pour oils down drains. Vape cartridges require proper e-waste disposal.

## Key Takeaways

- **Don't flush** — CBD shouldn't enter water systems
- **Don't pour down drain** — Oils can clog pipes and harm environment
- **Mix with absorbent material** — Coffee grounds, kitty litter
- **Vape products are e-waste** — Require special disposal

---

## Why Proper Disposal Matters

### Environmental Concerns

CBD products, like many supplements and medications, shouldn't enter:
- Water supply (flushing)
- Sewage systems (drain disposal)
- Recycling streams (contaminated packaging)

### Safety Concerns

- Children or pets accessing discarded products
- Accidental consumption by others
- Drug diversion (though CBD isn't controlled)

### Legal Considerations

While CBD isn't a controlled substance federally, some localities have specific disposal requirements for supplements and hemp products.

---

## Disposal by Product Type

### CBD Oils and Tinctures

**Best method: Absorbent material disposal**

1. Mix remaining oil with absorbent material:
   - Coffee grounds (used or fresh)
   - Cat litter (clay-based)
   - Sawdust
   - Paper towels

2. Place mixture in sealable bag or container
3. Dispose in regular household trash
4. Rinse empty bottle; recycle if accepted locally

**Do not:**
- Pour down sink or toilet
- Dispose of liquid oil directly in trash
- Attempt to burn

---

### CBD Gummies and Edibles

**Method: Direct trash disposal (modified)**

1. Remove from original packaging
2. Mix with undesirable substance (optional):
   - Coffee grounds
   - Dirt
   - Cat litter
   - This prevents accidental consumption
3. Place in sealed bag
4. Dispose in household trash

**For large quantities:**
- Consider community drug take-back programs
- Some accept supplements and hemp products

---

### CBD Capsules

**Method: Similar to gummies**

1. Empty capsules from bottle
2. Mix with undesirable substance
3. Seal in bag
4. Dispose in trash

**Alternative for softgels:**
- Puncture and squeeze into absorbent material
- Dispose of shells separately

---

### CBD Topicals (Creams, Balms, Salves)

**Method: Absorbent and trash**

1. Scrape remaining product into paper towels
2. Mix with coffee grounds or cat litter
3. Seal in bag
4. Dispose in household trash
5. Rinse container for recycling (if applicable)

**Glass containers:**
- Clean thoroughly
- Recycle with glass
- Or repurpose for non-food use

---

### CBD Vape Products

**Cartridges and pods:**
Contain batteries and electronics — treat as e-waste.

1. Check if cartridge is empty
2. If not, try to use remaining product or absorb into paper towel
3. Take to e-waste collection site
4. Do not place in regular trash

**E-liquid bottles:**
1. Absorb remaining liquid with paper towels
2. Dispose of liquid with absorbent material
3. Recycle empty plastic bottle if possible

**Vape devices:**
1. Remove battery if possible
2. Take to electronics recycling
3. Some vape shops accept returns

**Finding e-waste disposal:**
- Search "e-waste disposal near me"
- Check local government recycling programs
- Retailers like Best Buy often accept electronics

---

### CBD Flower

**Method: Compost or trash**

**Composting (preferred):**
- CBD flower is plant material
- Add to compost bin
- Will decompose naturally

**Trash disposal:**
1. Mix with other organic waste
2. Seal in bag
3. Dispose in household trash

**Do not:**
- Burn indoors (smoke concerns)
- Leave accessible to children/pets

---

## Packaging Disposal

### Recyclable Components

| Material | How to Dispose |
|----------|---------------|
| Cardboard boxes | Recycle |
| Paper inserts | Recycle |
| Glass bottles (cleaned) | Recycle |
| Plastic bottles (cleaned) | Recycle if accepted |

### Non-Recyclable Components

| Material | How to Dispose |
|----------|---------------|
| Dropper bulbs (rubber) | Trash |
| Mixed-material packaging | Trash |
| Contaminated containers | Trash |
| Blister packs | Trash |

### Cleaning Containers for Recycling

1. Remove residue with paper towel
2. Rinse with warm water
3. Let dry
4. Recycle according to local guidelines

---

## Special Situations

### Large Quantities

**For bulk disposal (business inventory, etc.):**
- Contact local waste management
- Look for pharmaceutical waste disposal services
- Some may charge fees for large quantities

### Take-Back Programs

**Check availability:**
- DEA National Prescription Drug Take-Back Days
- Some pharmacies have permanent drop boxes
- Community collection events

**Note:** These programs primarily target controlled substances but may accept supplements.

### Expired vs. Unwanted Products

**Expired products:**
- Dispose using methods above
- No need to keep beyond expiration

**Unwanted but not expired:**
- Consider giving to someone who can use them
- Or donate to qualifying organizations
- Dispose if no takers

---

## What NOT to Do

### Never Flush

**Why not:**
- CBD enters water supply
- Wastewater treatment doesn't remove all compounds
- Environmental impact on aquatic systems

### Never Pour Down Drain

**Why not:**
- Oils clog pipes
- Environmental contamination
- Potential septic system issues

### Never Burn

**Why not:**
- Incomplete combustion creates harmful compounds
- Fire hazard with oils
- Indoor air quality concerns

### Never Put Vape Products in Regular Trash

**Why not:**
- Battery fire hazard
- E-waste regulations
- Environmental contamination from metals

---

## Safe Disposal Checklist

### CBD Oils

- [ ] Mix with absorbent material
- [ ] Place in sealed container
- [ ] Dispose in household trash
- [ ] Clean bottle for recycling

### CBD Edibles

- [ ] Remove from packaging
- [ ] Mix with undesirable substance
- [ ] Seal in bag
- [ ] Dispose in household trash

### CBD Vapes

- [ ] Empty remaining liquid (absorb)
- [ ] Separate battery components
- [ ] Take to e-waste facility
- [ ] Do not place in regular trash

### Packaging

- [ ] Separate recyclable materials
- [ ] Clean containers
- [ ] Recycle appropriate materials
- [ ] Trash non-recyclables

---

## FAQ

### Can I flush CBD oil down the toilet?
No. CBD oil should never be flushed. It can enter water systems and isn't fully processed by wastewater treatment.

### Is expired CBD dangerous?
Expired CBD isn't typically dangerous but loses potency and may have off flavors. When in doubt, dispose of it properly.

### Can I throw CBD products in the trash?
Gummies and solid products can go directly in trash (preferably mixed with undesirable material). Oils should first be absorbed into dry material.

### Where can I recycle CBD bottles?
If cleaned, glass bottles can typically be recycled with glass. Plastic bottles may be recyclable depending on local programs. Check local guidelines.

### Do I need to report disposal of CBD products?
No. CBD is not a controlled substance. No reporting is required for personal-use disposal.

---

*This article is for informational purposes only. Check local regulations for specific disposal requirements in your area.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
];

async function main() {
  console.log("Inserting Quality & Safety guides (batch 2 - final)...\n");

  for (const article of articles) {
    const { error } = await supabase.from("kb_articles").insert(article);

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log("\nQuality & Safety guides complete (8/8)!");
}

main().catch(console.error);
