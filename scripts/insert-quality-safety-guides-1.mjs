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
    slug: "how-to-read-cbd-labels",
    title: "How to Read CBD Labels: Understanding Product Information",
    meta_description:
      "Learn to decode CBD product labels. Understand potency, ingredients, serving sizes, and what to look for to ensure you're getting a quality product.",
    content: `# How to Read CBD Labels: Understanding Product Information

**Quick Answer:** CBD labels should show total CBD content (mg), serving size, CBD per serving, type (isolate/broad/full-spectrum), ingredients list, and batch number for lab reports. Quality brands display this information clearly. Labels missing key details or making health claims are red flags.

## Key Takeaways

- **Total CBD mg** tells you overall potency
- **Serving size** tells you how much CBD per dose
- **Spectrum type** determines if THC is present
- **Batch/lot numbers** link to third-party lab reports

---

## Essential Label Information

Every quality CBD product should clearly display:

| Label Element | What It Tells You | Why It Matters |
|---------------|-------------------|----------------|
| Total CBD (mg) | Potency of entire bottle | Value calculation, dosing |
| Serving size | Amount per recommended dose | Daily dosing guidance |
| CBD per serving | mg in each dose | Accurate dosing |
| Spectrum type | Isolate/broad/full | THC presence, entourage effect |
| Ingredients | Everything in the product | Allergies, quality check |
| Batch number | Links to lab tests | Verification, quality assurance |

---

## Understanding CBD Potency

### Total CBD Content

The large number on the bottle (e.g., "1000mg CBD") represents the total CBD in the entire container.

**Calculating per-serving amounts:**
- 1000mg CBD in 30ml bottle = 33mg per ml
- 750mg CBD in 30 gummies = 25mg per gummy
- 500mg CBD in 2oz cream = 8.3mg per application (estimated)

### Potency vs. Concentration

**Potency (total mg):** How much CBD in the whole product
**Concentration (mg/ml):** How much CBD per unit volume

A 500mg/15ml bottle is more concentrated than a 500mg/30ml bottle — same total CBD, half the volume.

---

## Spectrum Types Explained

### CBD Isolate (99%+ CBD)

**Label terms:** "Pure CBD," "THC-Free," "CBD Isolate"
**Contains:** Only CBD, no other cannabinoids
**THC level:** 0%
**Best for:** Those avoiding THC completely

### Broad-Spectrum CBD

**Label terms:** "Broad Spectrum," "THC-Free Full Spectrum"
**Contains:** CBD plus other cannabinoids, terpenes — THC removed
**THC level:** 0% (or non-detectable)
**Best for:** Those wanting entourage effect without THC

### Full-Spectrum CBD

**Label terms:** "Full Spectrum," "Whole Plant"
**Contains:** CBD plus all hemp compounds including trace THC
**THC level:** Up to 0.3%
**Best for:** Those seeking complete hemp benefits, not concerned about trace THC

---

## Ingredients to Understand

### Carrier Oils

CBD needs a carrier oil for absorption. Common options:

| Carrier Oil | Properties |
|-------------|------------|
| MCT oil | Fast absorption, neutral taste |
| Hemp seed oil | Omega fatty acids, earthy taste |
| Olive oil | Common, mild taste |
| Coconut oil | Solid at room temp, common in balms |

### Additives to Watch For

**Acceptable:**
- Natural flavors
- Essential oils (for flavor/scent)
- Vitamin E (antioxidant)
- Terpenes (from hemp or botanical)

**Concerning:**
- Artificial colors
- Artificial sweeteners (in excess)
- Unnecessary fillers
- Ingredients you can't pronounce or research

---

## Serving Size Breakdown

### Reading Serving Information

**Example label:**
- Serving size: 1 ml (1 full dropper)
- Servings per container: 30
- CBD per serving: 33mg

**What this means:**
The bottle contains 30 doses of 33mg each (30 × 33 = 990mg total, rounded to 1000mg on label).

### Variations by Product Type

| Product | Typical Serving | How It's Stated |
|---------|-----------------|-----------------|
| Oil/tincture | 1 ml dropper | "1 full dropper" |
| Gummies | 1-2 gummies | "1 gummy" |
| Capsules | 1-2 capsules | "1 capsule" |
| Topicals | Pea to dime-sized | "Apply as needed" |

---

## Batch and Lot Numbers

### Why They Matter

Batch numbers connect your specific product to:
- Third-party lab test results
- Manufacturing date
- Quality control records

### How to Use Them

1. Find the batch/lot number on label or box
2. Visit brand's website
3. Enter batch number or scan QR code
4. View Certificate of Analysis (COA)

Products without batch numbers or accessible COAs raise quality concerns.

---

## Label Red Flags

### Warning Signs of Low-Quality Products

| Red Flag | Why It's Concerning |
|----------|---------------------|
| No mg listed | Can't determine potency |
| Health claims | "Cures," "treats," etc. are illegal |
| No batch number | Can't verify testing |
| Unrealistic prices | Too cheap likely means low quality |
| Vague spectrum info | Unclear what you're getting |
| No ingredients list | Can't check for allergens or quality |

### Illegal Health Claims

CBD products cannot legally claim to:
- Cure any disease
- Treat specific conditions
- Guarantee specific effects
- Be a replacement for medication

Words like "may help" or "supports" are acceptable. "Cures" or "treats" are not.

---

## Hemp Source Information

### What to Look For

**Ideal labels indicate:**
- Where hemp was grown (US, EU preferred)
- Organic certification (if applicable)
- Non-GMO status
- Extraction method (CO2 is gold standard)

### Why Source Matters

Hemp absorbs substances from soil. Hemp grown in regulated environments (US, EU) follows standards that limit pesticides, heavy metals, and other contaminants.

---

## Practical Label Reading Exercise

### Example: CBD Oil Bottle

**Front label shows:**
- Brand name
- "Full Spectrum Hemp Extract"
- "1500mg CBD"
- "30ml / 1 fl oz"

**What you know:**
- Full-spectrum = contains trace THC
- 1500mg ÷ 30ml = 50mg per ml
- Standard 1ml dropper delivers ~50mg per dose

**Back/side label shows:**
- Serving size: 0.5ml (half dropper)
- Servings per container: 60
- CBD per serving: 25mg
- Ingredients: MCT oil, full-spectrum hemp extract, natural mint flavor
- Batch: LOT2024-0815

**What you now know:**
- Brand recommends starting with half-dropper (25mg)
- 60 servings at 0.5ml each = 30ml total
- MCT carrier with mint flavoring
- You can look up batch LOT2024-0815 for lab results

---

## FAQ

### What's the difference between "hemp extract" and "CBD"?
"Hemp extract" is the raw extract from hemp, which contains CBD plus other compounds. Some labels say hemp extract mg rather than CBD mg — these aren't equivalent. Look for labels specifying CBD content.

### Why do some labels show both "total cannabinoids" and "CBD"?
Total cannabinoids includes CBD plus CBG, CBC, CBN, and others in full/broad-spectrum products. CBD-specific amount tells you exactly how much CBD is present.

### Should I trust labels that don't show mg per serving?
Be cautious. Quality brands make dosing information clear. Labels only showing total mg require you to calculate serving amounts yourself.

### What does "nano CBD" or "water-soluble" mean on labels?
These indicate processing methods designed to improve absorption. The base CBD information should still be clearly labeled; "nano" is an additional feature, not a replacement for standard labeling.

### Is higher mg always better?
Not necessarily. Higher mg means stronger potency, but appropriate strength depends on your needs. A 3000mg bottle might be wasteful for someone who needs only 15mg daily.

---

*This article is for informational purposes only and does not constitute medical advice. Always verify product information through third-party lab reports.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-read-cbd-lab-reports",
    title: "How to Read CBD Lab Reports: COA Guide for Consumers",
    meta_description:
      "Learn to read Certificate of Analysis (COA) reports for CBD products. Understand cannabinoid profiles, contaminant tests, and how to verify product quality.",
    content: `# How to Read CBD Lab Reports: COA Guide for Consumers

**Quick Answer:** A Certificate of Analysis (COA) is a third-party lab report verifying CBD product contents. Key sections include cannabinoid profile (CBD/THC amounts), contaminant testing (pesticides, heavy metals, microbes), and terpene profile. Always match the batch number on your product to the COA and verify the lab is ISO-certified.

## Key Takeaways

- **COA = Certificate of Analysis** — proof of third-party testing
- **Match batch numbers** between product and report
- **Check cannabinoid amounts** match label claims (±10%)
- **Review contaminant tests** — should show "ND" (not detected) or pass thresholds

---

## What is a Certificate of Analysis?

A COA is a document from an independent laboratory that tests CBD products for:
- Cannabinoid content (CBD, THC, CBG, etc.)
- Contaminants (pesticides, heavy metals, residual solvents)
- Microbial safety (bacteria, mold, yeast)
- Terpene content (optional but valuable)

Quality brands provide COAs for every batch. No COA available? Consider it a significant red flag.

---

## How to Find and Verify COAs

### Locating the COA

1. **Product packaging:** QR code or batch number
2. **Brand website:** "Lab Results" or "Third-Party Testing" page
3. **Direct request:** Email customer service with batch number

### Verification Checklist

| Item | How to Verify |
|------|---------------|
| Batch number | Must match your product exactly |
| Lab name | Should be clearly stated |
| Lab accreditation | Look for ISO 17025 certification |
| Test date | Should be recent (within 12-18 months) |
| Lab signature/stamp | Should appear on document |

---

## Section 1: Cannabinoid Profile

### What It Shows

The cannabinoid profile lists all measured cannabinoids and their concentrations:

| Cannabinoid | What You're Looking For |
|-------------|------------------------|
| CBD | Should match label claim (±10%) |
| THC | Must be under 0.3% for legal hemp |
| Delta-9 THC | The regulated THC form |
| THCA | Converts to THC when heated |
| CBG | Additional cannabinoid |
| CBN | Indicates age/oxidation |
| CBC | Additional cannabinoid |

### Understanding Measurements

**Common formats:**
- **mg/g:** Milligrams per gram of product
- **mg/ml:** Milligrams per milliliter (liquids)
- **%:** Percentage of total weight

**Example calculation:**
If COA shows 33.5 mg/ml CBD in a 30ml bottle:
33.5 × 30 = 1,005mg total CBD

This validates a "1000mg" label claim.

### Acceptable Variance

Lab testing has inherent variance. Product potency within **±10%** of label claim is considered acceptable.

| Label Claim | Acceptable Range |
|-------------|------------------|
| 500mg | 450-550mg |
| 1000mg | 900-1100mg |
| 1500mg | 1350-1650mg |

---

## Section 2: THC Compliance

### Legal Threshold

Hemp products must contain less than 0.3% Delta-9 THC by dry weight to be federally legal.

### Reading THC Results

**Look for:**
- Delta-9 THC: Should be <0.3% or show "ND"
- Total THC: May be listed separately (includes THCA)
- "Pass" notation for compliance testing

**Example compliant result:**
- Delta-9 THC: 0.18% (Pass)
- THCA: 0.05%
- Total THC: 0.22% (Pass)

### THC in Different Product Types

| Product Type | Expected THC |
|--------------|--------------|
| CBD Isolate | 0.00% or ND |
| Broad-Spectrum | 0.00% or ND |
| Full-Spectrum | 0.01-0.29% |

---

## Section 3: Contaminant Testing

### Pesticide Analysis

Tests for residual pesticides that could remain from cultivation.

**What to look for:**
- "ND" (Not Detected) for all listed pesticides
- "Pass" status
- Results below LOQ (Limit of Quantification)

Common tested pesticides include: bifenthrin, chlorpyrifos, myclobutanil, and dozens more.

### Heavy Metals

Tests for toxic metals that hemp can absorb from soil:

| Metal | Concern Level | Typical Threshold |
|-------|--------------|-------------------|
| Lead (Pb) | High | <0.5-1.0 ppm |
| Arsenic (As) | High | <1.0-2.0 ppm |
| Mercury (Hg) | High | <0.1-0.2 ppm |
| Cadmium (Cd) | Moderate | <0.5-1.0 ppm |

Results should show "ND" or be well below threshold limits.

### Residual Solvents

Tests for extraction chemicals that should be removed during production:

| Solvent | Why Tested | Safe Level |
|---------|------------|------------|
| Ethanol | Extraction method | Low amounts often acceptable |
| Butane | Extraction method | Should be ND or minimal |
| Propane | Extraction method | Should be ND or minimal |
| Isopropanol | Processing | Should be ND |

### Microbial Testing

Screens for harmful bacteria, mold, and yeast:

| Test | What It Detects |
|------|-----------------|
| Total Aerobic Count | General bacteria levels |
| Total Yeast/Mold | Fungal contamination |
| E. coli | Specific pathogen |
| Salmonella | Specific pathogen |
| Coliforms | Indicator organisms |

All results should show "Pass" or be below specified limits.

---

## Section 4: Terpene Profile (Optional)

### What It Shows

Terpenes are aromatic compounds that may influence CBD effects. Quality full-spectrum products often include terpene testing.

**Common terpenes:**
| Terpene | Associated Properties |
|---------|----------------------|
| Myrcene | Relaxation |
| Limonene | Uplifting |
| Linalool | Calming |
| Beta-Caryophyllene | May interact with CB2 receptors |
| Pinene | Alertness |

### Why It Matters

Terpene profiles help identify:
- Product authenticity
- Potential synergy with CBD
- Consistency between batches

---

## Red Flags in COAs

### Warning Signs

| Red Flag | What It Suggests |
|----------|-----------------|
| No lab name | Could be fabricated |
| No batch number | Can't verify it matches your product |
| Missing tests | Incomplete quality control |
| Old test date (>2 years) | May not reflect current product |
| CBD far below label claim | Product is under-dosed |
| THC above 0.3% | Product not legal hemp |
| Failed contaminant tests | Safety concern |
| Unusual formatting | Potentially altered document |

### Verifying Lab Authenticity

1. Note the lab name from the COA
2. Search for the lab online
3. Verify they're ISO 17025 accredited
4. Some labs have online verification portals

---

## Practical COA Reading Exercise

### Sample COA Analysis

**Header information:**
- Lab: Example Testing Labs, Denver CO
- Date tested: January 10, 2025
- Batch: BN-2025-0110

**Cannabinoid results:**
- CBD: 32.8 mg/ml
- THC: 0.21% (Pass)
- CBG: 0.8 mg/ml
- Product size: 30ml

**What this tells you:**
- Total CBD: 32.8 × 30 = 984mg (acceptable for "1000mg" label)
- THC is legal (<0.3%)
- Contains additional cannabinoids (full-spectrum)

**Contaminant results:**
- Pesticides: All ND
- Heavy metals: All below LOQ
- Microbial: Pass
- Residual solvents: All ND

**Conclusion:** This COA indicates a properly labeled, compliant, safe product.

---

## FAQ

### What if I can't find a COA for my product?
Contact the brand directly with your batch number. If they can't provide a COA, consider this a significant quality concern and choose a different product.

### What does "LOQ" mean on lab reports?
Limit of Quantification — the lowest amount the lab can accurately measure. Results below LOQ essentially mean the substance wasn't detected in meaningful amounts.

### Should I worry about trace THC in full-spectrum products?
If the COA shows THC under 0.3%, the product is legal. Trace THC is expected in full-spectrum products. If you're concerned about any THC, choose isolate or broad-spectrum.

### How often should brands update their COAs?
Each production batch should have its own COA. If a brand uses the same COA for years, they may not be testing each batch.

### Can COAs be faked?
Yes, unfortunately. Verify by checking that the lab exists, is accredited, and some labs allow you to verify results online with a batch number.

---

*This article is for informational purposes only and does not constitute medical advice. Always verify CBD product quality through third-party lab reports from accredited laboratories.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-verify-cbd-quality",
    title: "How to Verify CBD Quality: Complete Buyer's Checklist",
    meta_description:
      "Learn how to verify CBD product quality before buying. Covers third-party testing, hemp sourcing, extraction methods, and warning signs of low-quality products.",
    content: `# How to Verify CBD Quality: Complete Buyer's Checklist

**Quick Answer:** Verify CBD quality by checking for third-party lab reports (COAs), confirming hemp source, reviewing extraction method, and evaluating brand transparency. Quality products have accessible COAs matching their batch numbers, clear ingredient lists, realistic pricing, and no illegal health claims.

## Key Takeaways

- **Third-party lab testing** is non-negotiable for quality
- **Hemp source matters** — US/EU grown under regulations preferred
- **CO2 extraction** is the gold standard method
- **Transparent brands** share manufacturing details

---

## The CBD Quality Verification Checklist

### Essential Quality Markers

| Criterion | What to Check | Why It Matters |
|-----------|---------------|----------------|
| Lab testing | Current COA with batch number | Verifies contents and safety |
| Hemp source | Country/state of origin | Cultivation standards |
| Extraction | CO2, ethanol, or solvent-free | Purity and safety |
| Ingredients | Full list on label | Allergens, additives |
| Brand reputation | Reviews, transparency | Track record |
| Pricing | Reasonable cost per mg | Quality indicator |

---

## Step 1: Check Third-Party Lab Testing

### What to Look For

**Mandatory testing:**
- Cannabinoid potency (CBD, THC content)
- Heavy metals (lead, arsenic, mercury, cadmium)
- Pesticides
- Microbial contamination

**Additional quality testing:**
- Residual solvents
- Terpene profile
- Mycotoxins

### How to Verify Lab Reports

1. Find batch number on your product
2. Locate COA on brand website or request directly
3. Match batch numbers exactly
4. Verify lab is ISO 17025 accredited
5. Confirm CBD content matches label (within ±10%)
6. Check all contaminants show "Pass" or "ND"

### Red Flags

- No COA available
- Old test dates (over 18 months)
- Batch number doesn't match
- Unknown or unverifiable lab
- Failed contaminant tests

---

## Step 2: Evaluate Hemp Source

### Preferred Sourcing

| Source | Quality Indicator |
|--------|-------------------|
| USA (Colorado, Kentucky, Oregon) | Strict regulations, established industry |
| European Union | Rigorous standards |
| Canada | Well-regulated market |

### Why Source Matters

Hemp is a "bioaccumulator" — it absorbs substances from its growing environment. Hemp grown in regulated environments must meet standards for:
- Pesticide use
- Heavy metal contamination
- THC compliance
- Agricultural practices

### Questions to Ask

- Where is the hemp grown?
- Is it organic certified?
- Does the brand own farms or source from verified suppliers?

---

## Step 3: Review Extraction Method

### Extraction Methods Ranked

| Method | Quality Level | Notes |
|--------|--------------|-------|
| Supercritical CO2 | Highest | Clean, precise, no residual solvents |
| Subcritical CO2 | High | Gentler, preserves more compounds |
| Ethanol extraction | Good | Effective, minimal solvent concerns if properly purged |
| Hydrocarbon (butane) | Variable | Can be quality if properly processed |
| Oil infusion | Basic | Simple but less precise |

### Why CO2 Is Preferred

- No chemical solvents that could remain in product
- Precise control over what compounds are extracted
- Produces clean, consistent extract
- Industry gold standard

### What to Avoid

- Brands that don't disclose extraction method
- Cheap hydrocarbon extractions without proper testing
- "Secret" or proprietary methods without verification

---

## Step 4: Analyze Brand Transparency

### Signs of a Quality Brand

| Transparency Marker | What It Shows |
|--------------------|---------------|
| Clear contact information | Accountability |
| Physical business address | Legitimate operation |
| Responsive customer service | Stands behind products |
| Educational content | Industry knowledge |
| Manufacturing details | Nothing to hide |
| Batch-specific COAs | Consistent testing |

### Information Quality Brands Provide

- Hemp farm locations or sourcing partnerships
- Extraction facility details
- Team bios or company history
- Detailed FAQ sections
- Multiple ways to contact them

### Warning Signs

- No address or contact info
- Vague "proprietary" claims with no details
- Only positive testimonials, no real reviews
- Website looks hastily made
- Impossible health claims

---

## Step 5: Evaluate Pricing

### Understanding CBD Pricing

**Price per mg is the key metric:**

Calculate: Total price ÷ Total CBD mg = Cost per mg

**Example:**
$60 bottle with 1000mg CBD = $0.06 per mg

### Typical Price Ranges

| Price per mg | Quality Expectation |
|--------------|---------------------|
| Under $0.03 | Suspiciously cheap — investigate closely |
| $0.03-0.06 | Budget range — verify quality carefully |
| $0.06-0.12 | Standard range — typical for quality products |
| $0.12-0.20 | Premium range — should justify with superior quality |
| Over $0.20 | Luxury/specialty — must offer clear added value |

### Why Very Cheap CBD Is Concerning

Quality CBD production involves:
- Proper hemp cultivation
- Safe extraction
- Third-party testing
- Quality packaging

These have costs. Products drastically below market rates often cut corners on quality, testing, or both.

---

## Step 6: Check Product Claims

### Legal vs. Illegal Claims

**Acceptable language:**
- "May support wellness"
- "Promotes relaxation"
- "Supports healthy sleep cycles"
- "Natural plant-based supplement"

**Illegal/Red flag claims:**
- "Cures disease"
- "Treats condition"
- "Guaranteed results"
- "FDA approved" (CBD is not FDA approved for general use)
- Specific medical claims

### Why This Matters

Brands making illegal health claims are either:
- Uninformed about regulations
- Willing to break rules to sell products

Neither inspires confidence in their quality standards.

---

## Quality Verification in Practice

### Quick Store Check (2 Minutes)

1. ✅ CBD mg clearly labeled
2. ✅ Batch number present
3. ✅ Ingredients list visible
4. ✅ Company website listed
5. ✅ No health claims

### Thorough Online Research (15 Minutes)

1. Visit brand website
2. Find lab results section
3. Look up your product's batch
4. Review COA for potency and contaminants
5. Check hemp sourcing information
6. Read extraction method details
7. Search for independent reviews
8. Verify business legitimacy

---

## Product Type Considerations

### Oils/Tinctures

- Check carrier oil type
- Verify CBD concentration per ml
- Look for terpene information (full-spectrum)

### Gummies/Edibles

- Verify CBD per gummy
- Check for artificial additives
- Note sugar content if relevant

### Topicals

- Confirm CBD penetration claims are reasonable
- Check for beneficial secondary ingredients
- Note concentration (mg per oz)

### Vape Products

- CRITICAL: Verify no vitamin E acetate
- Check for appropriate vape-specific carrier
- Review hardware safety if included

---

## FAQ

### Is expensive CBD always better quality?
Not always. Price often reflects quality, but some brands charge premium prices without superior products. Always verify quality markers regardless of price.

### Can I trust CBD from gas stations or convenience stores?
Generally, exercise caution. These outlets may not verify their suppliers. Look for the same quality markers — if you can't find COAs and sourcing info, reconsider.

### How do I know if reviews are fake?
Look for specific details in reviews (not just "great product!"), check multiple platforms, and be suspicious if all reviews are overwhelmingly positive with no constructive feedback.

### Should I only buy organic CBD?
Organic certification is a positive indicator but not mandatory for quality. Proper testing for pesticides matters more than organic labeling.

### What if a brand has good reviews but no COAs?
Reviews indicate customer satisfaction but don't verify safety or accuracy. No COAs is a significant gap — quality brands test every batch.

---

*This article is for informational purposes only and does not constitute medical advice. Always verify CBD product quality before purchase.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
  {
    slug: "how-to-check-cbd-potency",
    title: "How to Check CBD Potency: Verifying Product Strength",
    meta_description:
      "Learn how to verify CBD potency claims on products. Understand mg calculations, lab report verification, and how to ensure you're getting the CBD you paid for.",
    content: `# How to Check CBD Potency: Verifying Product Strength

**Quick Answer:** Check CBD potency by reviewing the Certificate of Analysis (COA) and comparing lab-tested mg amounts to label claims. Lab results should be within ±10% of advertised potency. Calculate mg per serving by dividing total CBD by container volume or unit count. Request COAs if not publicly available.

## Key Takeaways

- **Lab reports verify actual potency** — don't rely on labels alone
- **±10% variance is acceptable** due to testing limitations
- **Calculate per-serving amounts** from total mg
- **Beware products significantly under-labeled** — you're not getting what you paid for

---

## Understanding CBD Potency Claims

### What Labels Show

CBD products display potency in different ways:

| Label Format | Example | What It Means |
|--------------|---------|---------------|
| Total mg | "1000mg CBD" | Entire bottle/package contains 1000mg |
| Per serving | "25mg per gummy" | Each unit contains 25mg |
| Concentration | "33mg/ml" | Each milliliter contains 33mg |
| Percentage | "5% CBD" | 5% of weight is CBD |

### Converting Between Formats

**Total to per-serving:**
Total mg ÷ servings = mg per serving

**Example:** 1500mg total ÷ 30ml = 50mg per ml

**Percentage to mg:**
Product weight × percentage = total mg

**Example:** 30ml oil at 5% ≈ 1500mg (assuming 1ml ≈ 1g)

---

## Verifying Potency Through Lab Reports

### Step 1: Find the COA

Locate the Certificate of Analysis for your specific batch:
- QR code on product packaging
- Brand website "Lab Results" page
- Direct request to customer service

### Step 2: Match Batch Numbers

Your product's batch/lot number MUST match the COA exactly. Testing a different batch proves nothing about your specific product.

### Step 3: Read Cannabinoid Results

Look for these measurements:
- **CBD (cannabidiol):** Primary cannabinoid
- **CBDA (cannabidiolic acid):** May convert to CBD
- **Total CBD:** CBD + CBDA combined

### Step 4: Calculate and Compare

**For oils (mg/ml format):**
Lab result (mg/ml) × container volume (ml) = Total mg

**Example COA:** 33.2 mg/ml CBD in 30ml bottle
33.2 × 30 = 996mg total

**Label claim:** 1000mg
**Verdict:** 996mg vs 1000mg = 99.6% accuracy ✓

---

## Acceptable Potency Variance

### Industry Standards

Lab testing has inherent variability. Quality benchmarks:

| Variance from Label | Assessment |
|---------------------|------------|
| Within ±10% | Acceptable |
| 10-20% under | Concerning |
| Over 20% under | Significantly under-dosed |
| Over label claim | Rare but acceptable |

### Examples

| Label | Lab Result | Variance | Assessment |
|-------|------------|----------|------------|
| 1000mg | 980mg | -2% | ✓ Acceptable |
| 1000mg | 900mg | -10% | Borderline acceptable |
| 1000mg | 750mg | -25% | ✗ Under-dosed |
| 1000mg | 1100mg | +10% | ✓ Acceptable |

---

## Calculating Your Actual Dose

### For CBD Oils

**Standard calculation:**
Lab-verified mg/ml × dropper volume = Your dose

**Example:**
Lab shows 32mg/ml, you take 1ml dropper:
32mg × 1ml = 32mg per dose

### For Gummies

**Standard calculation:**
Total verified CBD ÷ gummy count = mg per gummy

**Example:**
Lab shows 740mg total in 30-gummy package:
740 ÷ 30 = 24.7mg per gummy

### For Capsules

Similar to gummies:
Total verified CBD ÷ capsule count = mg per capsule

### For Topicals

Topicals are harder to dose precisely. Calculate approximate mg per application:
Total mg ÷ estimated applications = approximate mg per use

---

## Red Flags: Potency Problems

### Signs of Under-Dosed Products

| Warning Sign | What It Suggests |
|--------------|-----------------|
| Lab results 20%+ below label | Product not as advertised |
| No COA available | Can't verify claims |
| Batch number mismatch | COA doesn't apply to your product |
| Dramatically low price | May indicate lower actual CBD |
| Effects seem weaker than expected | Possible under-dosing |

### Why Under-Dosing Happens

- Intentional cost-cutting by low-quality brands
- Degradation during storage
- Manufacturing inconsistency
- Inaccurate initial formulation
- CBD loss during processing

---

## Testing CBD Products Yourself

### Home Testing Limitations

Consumer-grade CBD test kits exist but have significant limitations:
- Less accurate than laboratory testing
- May not distinguish between cannabinoids
- Can't test for contaminants
- Results are approximations

### When Home Testing Might Help

- Quick check before sending to lab
- Verifying presence of CBD (not precise amount)
- Educational purposes

### Professional Testing

For definitive results, send samples to an ISO-certified lab. Costs typically $50-200 per sample but provides authoritative results.

---

## Potency Over Time: Degradation

### CBD Stability

CBD degrades when exposed to:
- Light (especially UV)
- Heat (above 70°F/21°C accelerates)
- Air/oxygen
- Time

### Estimated Potency Loss

| Storage Condition | Annual Loss |
|-------------------|-------------|
| Ideal (cool, dark, sealed) | 2-5% |
| Average (room temp, normal use) | 5-10% |
| Poor (heat, light exposure) | 10-20%+ |

### Implications

- Products near expiration may test lower than originally
- Proper storage maintains potency longer
- Old products may not match original COA

---

## Practical Potency Verification

### Quick Check Process

1. Note label claim (e.g., 1000mg)
2. Find COA for your batch
3. Verify batch number matches
4. Find CBD mg/ml or total mg result
5. Calculate total if needed
6. Compare: Lab result vs. label claim
7. Check variance is within 10%

### Example Walkthrough

**Your product:** "CBD Oil 1500mg" 30ml bottle, Batch: LOT2025-001

**COA results:** CBD: 48.5mg/ml

**Calculation:** 48.5 × 30 = 1,455mg total

**Comparison:** 1,455 vs 1,500 = 97% of claim

**Verdict:** ✓ Within acceptable range

---

## FAQ

### What if the COA shows more CBD than the label claims?
This occasionally happens and isn't a problem — you're getting more than advertised. It may indicate conservative labeling.

### How do I know if the COA is for my exact product?
Match the batch/lot number on your product to the one on the COA. They must be identical.

### Why do some labs show different results for the same product?
Lab testing has inherent variability. Different labs may use different methods. Results within 10% of each other are considered consistent.

### Should I be concerned about THCA levels on COAs?
THCA converts to THC when heated. For products not heated (oils, gummies), THCA generally stays as THCA. For vapes, THCA effectively becomes THC.

### How often do brands update their COAs?
Quality brands test each batch, so COAs should update with each production run. Ask brands how frequently they test if unclear.

---

*This article is for informational purposes only and does not constitute medical advice. Always verify CBD product potency through third-party lab testing.*`,
    article_type: "educational-guide",
    status: "published",
    featured: false,
    category_id: GUIDES_CATEGORY_ID,
  },
];

async function main() {
  console.log("Inserting Quality & Safety guides (batch 1)...\n");

  for (const article of articles) {
    const { error } = await supabase.from("kb_articles").insert(article);

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug}`);
    }
  }

  console.log("\nBatch 1 complete (4/8 quality & safety guides)");
}

main().catch(console.error);
