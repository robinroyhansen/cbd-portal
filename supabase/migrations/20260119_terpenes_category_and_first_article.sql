-- Create Terpenes category and first article: "What Are Terpenes?"
-- Migration: 20260119_terpenes_category_and_first_article.sql
-- Author: Robin Roy Krigslund-Hansen

-- Step 1: Create the Terpenes category
INSERT INTO kb_categories (name, slug, description, article_count)
VALUES (
  'Terpenes',
  'terpenes',
  'Complete guides to cannabis terpenes: what they are, how they work with CBD, individual terpene profiles, and therapeutic applications.',
  0
)
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Insert "What Are Terpenes? Complete Guide" article
INSERT INTO kb_articles (
  title,
  slug,
  excerpt,
  content,
  article_type,
  category_id,
  reading_time,
  status,
  published_at,
  meta_title,
  meta_description,
  language
) VALUES (
  'What Are Terpenes? Complete Guide to Cannabis Terpenes',
  'what-are-terpenes',
  'Terpenes are aromatic compounds that give cannabis its distinctive smell and may enhance CBD''s effects. Learn what terpenes are, how they work, and why they matter for CBD products.',
  E'Terpenes are aromatic compounds found throughout the plant kingdom — and they''re a key reason why different cannabis strains smell and feel so different. If you''ve ever wondered why one CBD oil smells piney while another is citrusy, or why [full-spectrum CBD](/glossary/full-spectrum-cbd) seems to work better than [isolate](/glossary/cbd-isolate) for some people, terpenes are a big part of the answer.

## Quick Answer

**Terpenes** are volatile aromatic compounds produced by plants, including cannabis and hemp. They create the distinctive smells of lavender, pine, citrus, and cannabis. In CBD products, terpenes may work alongside [cannabinoids](/glossary/cannabinoid) to enhance therapeutic effects — a phenomenon known as the [entourage effect](/glossary/entourage-effect). Full-spectrum and broad-spectrum CBD products retain natural terpenes, while CBD isolate does not.

## Key Takeaways

- Terpenes are aromatic oils that give plants their distinctive scents
- Cannabis produces over 200 different terpenes
- They may enhance CBD''s effects through the entourage effect
- Common cannabis terpenes include myrcene, limonene, pinene, and linalool
- Full-spectrum CBD products contain natural terpene profiles
- Terpenes are legal and found throughout nature (not just cannabis)

## What Are Terpenes?

Terpenes are a large class of organic compounds produced by plants, insects, and some animals. Chemically, they''re built from repeating units of isoprene (C₅H₈) — the same building block found in rubber and vitamin A.

Plants produce terpenes for several reasons:
- **Defence** — Strong smells repel herbivores and pests
- **Attraction** — Floral scents attract pollinators
- **Protection** — Some terpenes have antimicrobial properties
- **Communication** — Plants use terpenes to signal each other

You encounter terpenes daily without realising it. The fresh smell of a pine forest? That''s pinene. The citrus burst when you peel an orange? Limonene. The calming scent of lavender? Linalool.

### Terpenes vs Terpenoids

You''ll sometimes see these terms used interchangeably, but there''s a technical difference:

- **Terpenes** are pure hydrocarbons (contain only carbon and hydrogen)
- **Terpenoids** (or isoprenoids) have been chemically modified, usually through oxidation or drying

In practice, when people discuss cannabis terpenes, they often mean both. Fresh cannabis flowers contain terpenes; dried and cured cannabis contains more terpenoids.

## Terpenes in Cannabis

Cannabis is exceptionally rich in terpenes. The plant produces over 200 different terpene compounds in its [trichomes](/glossary/trichomes) — the same resin glands that produce [cannabinoids](/glossary/cannabinoid) like [CBD](/glossary/cannabidiol) and [THC](/glossary/thc).

The terpene profile (the specific combination and concentration of terpenes) varies between:
- **Strains/cultivars** — Different genetics produce different terpene profiles
- **Growing conditions** — Light, soil, and climate affect terpene production
- **Harvest timing** — Terpene content changes as plants mature
- **Processing** — Heat and oxidation can degrade terpenes

This is why two CBD products from different hemp strains can smell completely different — and potentially feel different too.

### Why Cannabis Produces Terpenes

Cannabis evolved to produce terpenes for the same reasons as other plants:

1. **Pest deterrence** — Many terpenes repel insects and animals
2. **Antimicrobial protection** — Terpenes help protect against fungi and bacteria
3. **UV protection** — Some terpenes absorb harmful UV radiation
4. **Pollinator attraction** — Certain terpenes attract beneficial insects

The distinctive "skunky" or "dank" smell of cannabis comes from its unique combination of terpenes (plus some sulfur compounds recently identified by researchers).

## The Entourage Effect: How Terpenes Work with CBD

The [entourage effect](/glossary/entourage-effect) is the theory that cannabis compounds work better together than in isolation. Terpenes are thought to be key players in this synergy.

### How It Works

Research suggests terpenes may:

1. **Modulate cannabinoid receptors** — Some terpenes interact with [CB1](/glossary/cb1-receptor) and [CB2 receptors](/glossary/cb2-receptor) in the [endocannabinoid system](/glossary/endocannabinoid-system)

2. **Affect neurotransmitter systems** — Linalool affects serotonin receptors; limonene may influence dopamine

3. **Enhance absorption** — Certain terpenes may improve how cannabinoids cross cell membranes

4. **Provide independent effects** — Many terpenes have documented therapeutic properties on their own

### What the Research Shows

A 2011 review by Dr. Ethan Russo, published in the *British Journal of Pharmacology*, examined how terpenes might contribute to cannabis''s therapeutic effects. The paper suggested specific terpene-cannabinoid combinations could be useful for pain, anxiety, inflammation, and other conditions.

More recent research continues to explore these interactions:

- A 2018 study found that [beta-caryophyllene](/articles/what-is-caryophyllene) activates CB2 receptors, making it a "dietary cannabinoid"
- Research on linalool shows anxiolytic (anti-anxiety) effects similar to some pharmaceutical sedatives
- Studies on limonene demonstrate mood-elevating and anti-anxiety properties

However, a 2020 study in *Scientific Reports* found that adding terpenes to CBD isolate didn''t enhance its effects in a mouse model of pain. The entourage effect remains debated in scientific literature.

**My perspective:** After 12 years in the CBD industry, I''ve observed that many people report better results with full-spectrum products than isolate — but whether that''s due to terpenes, minor cannabinoids, or placebo is genuinely hard to determine. The science is still catching up to anecdotal experience.

## Major Cannabis Terpenes

Here are the most common terpenes found in cannabis and hemp:

### Myrcene

**Aroma:** Earthy, musky, herbal — like cloves or lemongrass
**Also found in:** Mangoes, hops, thyme, lemongrass
**Potential effects:** Sedating, relaxing, muscle relaxant
**Boiling point:** 167°C (332°F)

Myrcene is typically the most abundant terpene in cannabis. It''s thought to contribute to the "couch-lock" effect of some strains. Some believe eating mangoes (which contain myrcene) before using CBD enhances effects, though this isn''t scientifically proven.

[Read more: What is Myrcene? →](/articles/what-is-myrcene)

### Limonene

**Aroma:** Citrus — like lemon and orange peel
**Also found in:** Citrus fruits, juniper, peppermint
**Potential effects:** Mood elevation, stress relief, antifungal
**Boiling point:** 176°C (349°F)

Limonene is the second most common terpene in nature and gives citrus fruits their characteristic smell. Research suggests it may have anti-anxiety and antidepressant properties.

[Read more: What is Limonene? →](/articles/what-is-limonene)

### Linalool

**Aroma:** Floral, lavender, slightly spicy
**Also found in:** Lavender, birch bark, coriander
**Potential effects:** Calming, anti-anxiety, may aid sleep
**Boiling point:** 198°C (388°F)

Linalool is responsible for lavender''s famous calming properties. It''s been used in aromatherapy for centuries and is one of the most studied terpenes for anxiety.

[Read more: What is Linalool? →](/articles/what-is-linalool)

### Pinene

**Aroma:** Pine, fresh forest
**Also found in:** Pine needles, rosemary, basil, dill
**Potential effects:** Alertness, memory retention, bronchodilator
**Boiling point:** 155°C (311°F)

Pinene is the most common terpene in the natural world. It exists in two forms: alpha-pinene (piney) and beta-pinene (more herbal). Research suggests it may counteract some of THC''s memory effects.

[Read more: What is Pinene? →](/articles/what-is-pinene)

### Caryophyllene

**Aroma:** Spicy, peppery, woody — like black pepper and cloves
**Also found in:** Black pepper, cloves, cinnamon, oregano
**Potential effects:** Anti-inflammatory, may reduce anxiety
**Boiling point:** 160°C (320°F)

Beta-caryophyllene is unique among terpenes: it directly activates CB2 cannabinoid receptors, making it technically a "dietary cannabinoid." This gives it particular interest for anti-inflammatory applications.

[Read more: What is Caryophyllene? →](/articles/what-is-caryophyllene)

### Comparison Table

| Terpene | Aroma | Primary Effects | Found In |
|---------|-------|-----------------|----------|
| Myrcene | Earthy, musky | Relaxing, sedating | Mangoes, hops |
| Limonene | Citrus | Mood elevation | Citrus fruits |
| Linalool | Floral | Calming, anti-anxiety | Lavender |
| Pinene | Pine | Alertness | Pine, rosemary |
| Caryophyllene | Peppery | Anti-inflammatory | Black pepper |
| Humulene | Hoppy, earthy | Appetite suppression | Hops, sage |
| Terpinolene | Herbal, floral | Mildly sedating | Lilacs, nutmeg |

## Terpenes in CBD Products

### Full-Spectrum CBD

[Full-spectrum CBD](/glossary/full-spectrum-cbd) products retain the natural terpene profile from the hemp plant, along with cannabinoids, flavonoids, and trace THC (under 0.2% in Europe). This provides the most complete entourage effect.

**Pros:**
- Natural terpene profile
- Potential entourage effect
- Most "whole plant" experience

**Cons:**
- Contains trace THC
- Stronger, earthier taste

### Broad-Spectrum CBD

[Broad-spectrum CBD](/glossary/broad-spectrum-cbd) removes THC but attempts to retain terpenes and other cannabinoids. Terpene preservation varies significantly between products.

**Pros:**
- No THC
- May retain some terpenes

**Cons:**
- Processing often reduces terpene content
- Entourage effect may be diminished

### CBD Isolate

[CBD isolate](/glossary/cbd-isolate) is 99%+ pure CBD with no terpenes, other cannabinoids, or plant compounds. Some products add terpenes back afterward.

**Pros:**
- No THC, no taste
- Precise CBD dosing

**Cons:**
- No natural terpenes
- No entourage effect

### Added Terpenes

Some manufacturers add terpenes to CBD products — either cannabis-derived or botanical (from other plants like lavender or citrus). This is common in:

- CBD vape products
- "Strain-specific" CBD products
- Isolate products seeking entourage benefits

When buying products with added terpenes, look for transparency about:
- Source (cannabis-derived vs botanical)
- Specific terpenes included
- Concentration levels

## How to Choose CBD Products for Terpenes

If terpenes matter to you, here''s what to look for:

### Check the Certificate of Analysis (COA)

Quality CBD products include [third-party testing](/glossary/third-party-testing). Some COAs include terpene profiles showing which terpenes are present and in what concentrations. Not all labs test for terpenes, so this isn''t always available.

### Choose Full-Spectrum When Possible

For maximum terpene content, full-spectrum CBD oil typically offers the richest natural terpene profile. Look for products made with gentle extraction methods (CO2 extraction preserves terpenes better than some solvent methods).

### Consider the Strain/Cultivar

Some CBD brands specify which hemp strain their product comes from. Different strains have different terpene profiles:

- **Relaxation-focused strains** tend to be high in myrcene and linalool
- **Energising strains** often contain more pinene and limonene
- **Pain-focused strains** may emphasise caryophyllene

### Match Terpenes to Your Goals

| Goal | Look For |
|------|----------|
| Sleep | Myrcene, linalool, terpinolene |
| Anxiety | Linalool, limonene, caryophyllene |
| Focus | Pinene, limonene |
| Pain | Caryophyllene, myrcene, humulene |
| Mood | Limonene, pinene |

## Are Terpenes Safe?

Terpenes are generally recognised as safe (GRAS) for consumption. You ingest terpenes daily through fruits, vegetables, herbs, and spices. The amounts in CBD products are typically similar to or less than what you''d get from food sources.

### Considerations

- **Sensitivity:** Some people are sensitive to strong aromatic compounds
- **Allergies:** Rare, but possible — especially with citrus terpenes
- **Concentration:** Very high concentrations (in some vape products) may cause irritation
- **Quality:** Low-quality synthetic terpenes may contain impurities

### Drug Interactions

Some terpenes may affect how your body processes medications. Beta-caryophyllene, for instance, may interact with the same liver enzymes as CBD. If you take medications, discuss terpene-rich CBD products with your doctor.

## Frequently Asked Questions

### Do terpenes get you high?

No. Terpenes are not intoxicating. While they may influence mood and how CBD feels, they don''t produce a "high" like THC. The relaxing feeling from linalool, for example, is similar to the calming effect of lavender aromatherapy — noticeable but not intoxicating.

### Can I smell terpenes in CBD oil?

Yes. The aroma of CBD oil comes primarily from its terpene content. Full-spectrum oils have a distinctive earthy, herbal, sometimes piney or citrusy smell depending on their terpene profile. CBD isolate, by contrast, is nearly odourless.

### Are botanical terpenes as effective as cannabis terpenes?

This is debated. Chemically, limonene from lemons is identical to limonene from cannabis. However, some argue that the specific ratios and combinations in cannabis may be unique. There''s no conclusive research proving one is better than the other.

### Do terpenes survive digestion?

Partially. When you take CBD oil orally, some terpenes are metabolised in the gut and liver. Sublingual absorption (holding oil under the tongue) may preserve more terpene effects. Inhalation delivers terpenes most directly but has other considerations.

### How do I preserve terpenes in my CBD products?

Terpenes are volatile (they evaporate easily) and sensitive to heat and light. To preserve them:
- Store CBD oil in a cool, dark place
- Keep the bottle sealed when not in use
- Don''t expose to heat or direct sunlight
- Use within the recommended timeframe

### Are terpenes legal?

Yes. Terpenes themselves are completely legal — they''re found in thousands of plants and common foods. There are no restrictions on terpenes in CBD products in Europe or elsewhere.

## Related Articles

- [The Entourage Effect Explained](/articles/entourage-effect)
- [Full-Spectrum vs Broad-Spectrum vs Isolate](/articles/full-spectrum-vs-broad-spectrum-vs-isolate)
- [How to Read CBD Lab Reports](/articles/how-to-read-cbd-lab-reports)
- [What is Myrcene?](/articles/what-is-myrcene)
- [What is Limonene?](/articles/what-is-limonene)
- [Best Terpenes for Sleep](/articles/best-terpenes-for-sleep)
- [Best Terpenes for Anxiety](/articles/best-terpenes-for-anxiety)

---

## Sources

1. Russo EB. (2011). Taming THC: potential cannabis synergy and phytocannabinoid-terpenoid entourage effects. *British Journal of Pharmacology*, 163(7), 1344-1364.

2. Gertsch J, et al. (2008). Beta-caryophyllene is a dietary cannabinoid. *Proceedings of the National Academy of Sciences*, 105(26), 9099-9104.

3. Guimarães AG, et al. (2013). Terpenes and derivatives as a new perspective for pain treatment: a patent review. *Expert Opinion on Therapeutic Patents*, 23(5), 579-590.

4. Santiago M, et al. (2019). Absence of Entourage: Terpenoids Commonly Found in Cannabis sativa Do Not Modulate the Functional Activity of Δ9-THC at Human CB1 and CB2 Receptors. *Cannabis and Cannabinoid Research*, 4(3), 165-176.

5. Finlay DB, et al. (2020). Terpenoids From Cannabis Do Not Mediate an Entourage Effect by Acting at Cannabinoid Receptors. *Frontiers in Pharmacology*, 11, 359.

[View all terpene studies in our database →](/research?topic=terpenes)

---

**Medical Disclaimer:** This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD products, especially if you have a medical condition or take medications.',
  'educational-guide',
  (SELECT id FROM kb_categories WHERE slug = 'terpenes'),
  12,
  'published',
  NOW(),
  'What Are Terpenes? Complete Guide to Cannabis Terpenes',
  'Terpenes are aromatic compounds in cannabis that may enhance CBD''s effects. Learn what they are, how they work, and why they matter for CBD products.',
  'en'
);

-- Update category article count
UPDATE kb_categories
SET article_count = (
  SELECT COUNT(*)
  FROM kb_articles
  WHERE category_id = (SELECT id FROM kb_categories WHERE slug = 'terpenes')
  AND status = 'published'
)
WHERE slug = 'terpenes';
