-- Country-specific legal articles for CBD Portal
-- Creates legal content for 8 European countries

-- Get or create the Legal & Regulatory category
INSERT INTO kb_categories (name, slug, description, language)
VALUES ('Legal & Regulatory', 'legal-regulatory', 'Legal status of CBD across different regions and regulatory updates', 'en')
ON CONFLICT (slug) DO NOTHING;

-- Get the category ID
DO $$
DECLARE
  legal_cat_id UUID;
  author_id UUID;
BEGIN
  SELECT id INTO legal_cat_id FROM kb_categories WHERE slug = 'legal-regulatory' LIMIT 1;
  SELECT id INTO author_id FROM kb_authors WHERE is_primary = true LIMIT 1;

  -- ============================================
  -- DENMARK
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Denmark? Complete 2026 Guide',
    'is-cbd-legal-in-denmark',
    'Complete guide to CBD legality in Denmark. Learn about regulations, THC limits, where to buy, and what you need to know before purchasing CBD products in Denmark.',
    E'# Is CBD Legal in Denmark? Complete 2026 Guide

## Quick Answer

**Yes, CBD is legal in Denmark** when it contains less than 0.2% THC and is derived from EU-approved industrial hemp strains. However, Denmark has some of the stricter regulations in the Nordic region.

## Key Regulations

### THC Limit
- Maximum **0.2% THC** content allowed
- Products exceeding this limit are classified as controlled substances

### Legal Requirements
1. CBD products must be derived from EU-approved hemp varieties
2. Products cannot make medical claims without approval
3. Novel Food regulations apply to CBD edibles and supplements
4. Only licensed pharmacies can sell CBD products classified as medicine

## Where to Buy CBD in Denmark

### Legal Options
- **Online retailers** - EU-based CBD shops that ship to Denmark
- **Health food stores** - Some stock CBD oils and topicals
- **Pharmacies** - For medical CBD products

### What to Look For
- Third-party lab testing (COA)
- THC content clearly stated (must be <0.2%)
- EU hemp source verification
- Company registration in EU

## Medical CBD in Denmark

Denmark has a medical cannabis pilot program that began in 2018. However:
- Requires prescription from a doctor
- Limited to specific conditions
- Products must be approved by the Danish Medicines Agency
- Not all doctors are authorized to prescribe

## Novel Food Regulations

As an EU member state, Denmark follows EU Novel Food regulations:
- CBD extracts and isolates require Novel Food authorization
- Many products are in "regulatory limbo"
- Check that products have pending or approved applications

## Traveling with CBD

- Allowed within EU/Schengen area
- Keep lab reports and receipts
- Maximum personal use quantities
- Declare at customs if asked

## Common Questions

### Can I grow hemp in Denmark?
Yes, with a license from the Danish Agricultural Agency. Only EU-approved varieties with <0.2% THC are permitted.

### Are CBD edibles legal?
CBD edibles fall under Novel Food regulations. Products without proper authorization exist in a gray area.

### Can I order CBD online from other EU countries?
Yes, provided products meet Danish requirements (<0.2% THC, EU hemp source).

## Summary

CBD is legal in Denmark under strict conditions. Always verify THC content, source, and compliance with EU regulations before purchasing. When in doubt, consult the Danish Medicines Agency or a legal professional.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Denmark? 2026 Guide to Danish CBD Laws',
    'Complete guide to CBD legality in Denmark. THC limits, where to buy, medical CBD, and regulations explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- GERMANY
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Germany? Complete 2026 Guide',
    'is-cbd-legal-in-germany',
    'Complete guide to CBD legality in Germany. Learn about regulations, THC limits, Novel Food status, pharmacy rules, and where to buy legal CBD products in Germany.',
    E'# Is CBD Legal in Germany? Complete 2026 Guide

## Quick Answer

**Yes, CBD is legal in Germany** when derived from EU-certified hemp and containing less than 0.2% THC. Germany has one of Europe''s largest and most developed CBD markets.

## Key Regulations

### THC Limit
- Maximum **0.2% THC** for hemp-derived products
- Zero THC tolerance for food products in some federal states

### Legal Framework
1. CBD is not a controlled substance under the Narcotics Act (BtMG)
2. Novel Food Regulation applies to CBD foods and supplements
3. CBD cosmetics are legal and widely available
4. Medical CBD requires prescription

## Novel Food Status in Germany

Germany strictly enforces EU Novel Food regulations:
- CBD food supplements require authorization
- Many products operate under "transitional" status
- BVL (Federal Office of Consumer Protection) oversees enforcement
- Products without authorization may be removed from sale

## Where to Buy CBD in Germany

### Legal Options
1. **Online shops** - Largest selection, often better prices
2. **Pharmacies (Apotheken)** - For medical CBD and some OTC products
3. **Drugstores (dm, Rossmann)** - CBD cosmetics and topicals
4. **Specialty CBD shops** - In major cities
5. **Health food stores** - Limited selection

### What to Verify
- Lab reports (Analysezertifikat)
- THC content below 0.2%
- EU hemp certification
- Novel Food compliance

## Medical CBD in Germany

Since March 2017, medical cannabis (including CBD) is legally available:

### Requirements
- Valid prescription (Rezept) from a German doctor
- Covered by health insurance in some cases
- Available at pharmacies
- Must be pharmaceutical-grade

### Conditions Treated
- Chronic pain
- Spasticity in MS
- Chemotherapy-induced nausea
- Other conditions at doctor''s discretion

## Buying CBD at German Pharmacies

German pharmacies can sell:
- Prescription medical CBD products
- Some over-the-counter CBD oils
- CBD cosmetics and topicals

Note: Availability varies by pharmacy and region.

## CBD Cosmetics in Germany

CBD cosmetics are fully legal:
- No Novel Food restrictions
- Available at drugstores and online
- Must meet EU Cosmetics Regulation standards
- Popular products: creams, balms, serums

## Legal Gray Areas

### CBD Flowers
- Technically legal if THC <0.2%
- Often confiscated by police
- Legal status disputed
- Best avoided for consumer safety

### CBD E-Liquids
- Legal for non-nicotine products
- TPD (Tobacco Products Directive) applies
- Must not make health claims

## Traveling with CBD in Germany

- Allowed within EU
- Keep receipts and lab reports
- Avoid CBD flowers when traveling
- Prescription needed for medical CBD

## Common Questions

### Is CBD flower legal in Germany?
Technically yes if THC <0.2%, but enforcement is inconsistent. Police may confiscate and test products.

### Can I buy CBD at dm or Rossmann?
Yes, primarily CBD cosmetics and some oils are available at major German drugstores.

### Is CBD covered by German health insurance?
Medical CBD may be covered (Krankenkasse) when prescribed for approved conditions.

## Summary

Germany has a well-established CBD market with clear regulations. Stick to reputable vendors, verify lab reports, and be aware of Novel Food requirements. Medical users should consult with a doctor about prescription options.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Germany? 2026 Guide to German CBD Laws',
    'Complete guide to CBD legality in Germany. THC limits, Novel Food status, pharmacy rules, and where to buy legal CBD explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- SWEDEN
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Sweden? Complete 2026 Guide',
    'is-cbd-legal-in-sweden',
    'Complete guide to CBD legality in Sweden. Learn about Sweden''s strict regulations, zero THC policy, what''s allowed, and how to legally obtain CBD products.',
    E'# Is CBD Legal in Sweden? Complete 2026 Guide

## Quick Answer

**CBD has complex legal status in Sweden.** While pure CBD is not classified as a narcotic, Sweden has extremely strict regulations that effectively make most CBD products illegal or difficult to obtain legally.

## Key Regulations

### THC Policy
- Sweden has a **zero-tolerance policy** for THC
- Even trace amounts (<0.2%) can make products illegal
- This differs from most EU countries

### Legal Classification
1. Pure CBD isolate: Not classified as narcotic
2. Full-spectrum CBD: Often illegal due to THC traces
3. CBD with any THC: Classified as narcotic
4. Medical CBD: Requires special permission

## What''s Legal in Sweden

### Allowed
- CBD isolate products (zero THC)
- CBD cosmetics (external use only)
- Hemp seed oil (food grade, no CBD)

### Not Allowed
- Full-spectrum CBD products
- Any product with detectable THC
- CBD flower or hemp buds
- Unapproved medical CBD

## Why Sweden Is Different

Sweden takes a precautionary approach:
- Strong anti-drug culture and policy
- Medical Products Agency (Läkemedelsverket) strict oversight
- Any THC content = narcotic classification
- Health claims require medical product authorization

## Medical CBD in Sweden

Medical CBD is theoretically possible but:
- Requires application to Läkemedelsverket
- Extremely few approvals granted
- Doctor must apply on patient''s behalf
- Limited to specific conditions
- Epidiolex (for epilepsy) is available

## Where Swedes Buy CBD

Due to strict domestic laws, many Swedes:
- Order CBD isolate products online
- Travel to other EU countries to purchase
- Use products from EU countries (legal risk)

### Important Warnings
- Importing full-spectrum CBD is risky
- Customs may seize products
- Prosecution is possible
- Always verify zero THC

## CBD Cosmetics in Sweden

CBD cosmetics are the safest option:
- Legal for external use
- Available in some stores
- No THC restrictions for cosmetics
- Must comply with EU Cosmetics Regulation

## Traveling with CBD to/from Sweden

### Entering Sweden
- Avoid bringing CBD products
- Even legal EU products may be seized
- Zero THC tolerance applies

### Leaving Sweden
- Other EU countries more lenient
- Keep documentation if traveling
- Declare if asked

## Recent Developments

Sweden''s CBD policy is under review:
- EU pressure for harmonization
- Some advocacy for change
- Medical access slowly improving
- No major reforms expected short-term

## Common Questions

### Can I order CBD oil online to Sweden?
CBD isolate (0% THC) may be delivered, but full-spectrum products risk seizure and legal consequences.

### Is CBD oil sold in Swedish pharmacies?
Not typically. Only approved medical CBD products with special permission.

### What happens if caught with CBD in Sweden?
Depends on THC content. Zero THC: likely okay. Any THC: potential drug charges.

## Summary

Sweden has among the strictest CBD regulations in Europe. Only zero-THC CBD isolate products are clearly legal. Consumers should exercise extreme caution, verify products contain no THC, and consider the legal risks before purchasing or importing CBD.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Sweden? 2026 Guide to Swedish CBD Laws',
    'Complete guide to CBD legality in Sweden. Learn about Sweden''s strict zero-THC policy, what''s legal, and how to safely obtain CBD products.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- NORWAY
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Norway? Complete 2026 Guide',
    'is-cbd-legal-in-norway',
    'Complete guide to CBD legality in Norway. Learn about regulations, THC limits, medical CBD, what''s allowed, and how to legally obtain CBD products in Norway.',
    E'# Is CBD Legal in Norway? Complete 2026 Guide

## Quick Answer

**CBD has limited legality in Norway.** While CBD itself is not a controlled substance, Norway''s strict regulations and non-EU status create significant barriers to purchasing and using CBD products.

## Key Regulations

### THC Limit
- Norway follows **0.2% THC** maximum (similar to EU)
- But enforcement and import rules are stricter

### Legal Classification
1. CBD: Not a controlled substance
2. THC: Strictly controlled
3. Medical CBD: Requires prescription
4. CBD imports: Heavily regulated

## What''s Legal in Norway

### Allowed
- CBD products with <0.2% THC (domestic)
- Medical CBD with prescription
- CBD cosmetics
- Hemp seed products (food grade)

### Restricted
- Importing CBD products (customs issues)
- CBD food supplements (Novel Food)
- Full-spectrum products (THC concerns)

## Norway''s Special Status

Norway is not an EU member, but:
- Part of EEA (European Economic Area)
- Follows many EU regulations
- Has stricter customs enforcement
- Novel Food rules apply

## Importing CBD to Norway

This is where it gets complicated:
- Norwegian Customs may seize CBD products
- Even legal EU products can be confiscated
- Lab testing may be required
- THC verification mandatory

### Tips for Importing
1. Keep all documentation
2. Have lab reports ready
3. Verify THC content (<0.2%)
4. Declare at customs
5. Small personal quantities only

## Medical CBD in Norway

### Requirements
- Prescription from Norwegian doctor
- Apply to Legemiddelverket (Medicines Agency)
- Limited approved products
- Often for specific conditions

### Available Products
- Epidiolex (for epilepsy)
- Sativex (for MS spasticity)
- Other products via special application

## Where to Buy CBD in Norway

### Legal Options
1. **Norwegian online shops** - Limited selection
2. **Pharmacies** - Prescription products only
3. **Health stores** - Very limited CBD
4. **EU online shops** - Import risks apply

### Recommended Approach
- Buy from Norwegian retailers when possible
- Verify THC content
- Keep documentation
- Understand import risks

## CBD Cosmetics in Norway

CBD cosmetics have clearer status:
- Legal for sale and use
- No THC limits for external use
- Available in some stores
- Can be imported more easily

## Drug Testing Concerns

Important for Norwegian workers:
- Random drug testing is common
- Even legal CBD may cause positive test
- Zero THC products recommended
- Inform employer if using CBD

## Common Questions

### Can I bring CBD from vacation in EU?
Technically possible but risky. Customs may seize products and require testing.

### Are CBD gummies legal in Norway?
CBD edibles face Novel Food restrictions. Availability is very limited.

### What''s the penalty for illegal CBD in Norway?
Depends on circumstances. May range from confiscation to drug charges if THC detected.

## Summary

Norway presents unique challenges for CBD users due to its non-EU status and strict customs enforcement. Medical CBD is available with prescription. Consumer CBD exists but with significant import barriers. Always verify THC content and be prepared for customs scrutiny.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Norway? 2026 Guide to Norwegian CBD Laws',
    'Complete guide to CBD legality in Norway. THC limits, import rules, medical CBD, and regulations explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- NETHERLANDS
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in the Netherlands? Complete 2026 Guide',
    'is-cbd-legal-in-netherlands',
    'Complete guide to CBD legality in the Netherlands. Learn about Dutch regulations, THC limits, coffeeshops vs CBD shops, and where to buy legal CBD products.',
    E'# Is CBD Legal in the Netherlands? Complete 2026 Guide

## Quick Answer

**Yes, CBD is legal in the Netherlands** when it contains less than 0.05% THC for consumer products. The Netherlands has a unique cannabis culture, but CBD and recreational cannabis are regulated separately.

## Key Regulations

### THC Limits
- Consumer CBD products: **<0.05% THC** (stricter than EU standard)
- Industrial hemp: 0.2% THC (EU standard)
- This stricter limit is unique to the Netherlands

### Legal Framework
1. CBD is not a controlled substance
2. Hemp cultivation is legal (licensed)
3. Novel Food regulations apply
4. CBD cosmetics are fully legal
5. Medical CBD requires prescription

## CBD vs. Cannabis in the Netherlands

Common misconception: The Netherlands is "liberal" about cannabis.

### The Reality
- Cannabis is **tolerated**, not legal
- Coffeeshops operate under strict rules
- CBD is separate from cannabis policy
- CBD has clearer legal status than cannabis

### Key Difference
- Coffeeshops: THC products, tolerated
- CBD shops: Legal products, regulated

## Where to Buy CBD in Netherlands

### Legal Options
1. **CBD specialty shops** - Many in major cities
2. **Online retailers** - Wide selection
3. **Health food stores** - Limited options
4. **Pharmacies** - Medical products
5. **Smart shops** - Some carry CBD

### NOT at Coffeeshops
- Coffeeshops sell cannabis, not CBD
- Different licensing and regulations
- Don''t confuse the two

## The 0.05% THC Rule

Netherlands has stricter THC limits:
- EU standard: 0.2% THC
- Dutch standard: 0.05% THC (for sale)
- This affects product availability
- Full-spectrum may not qualify

### Why Stricter?
- NVWA (food authority) interpretation
- Precautionary approach
- Stricter enforcement than some EU countries

## Novel Food in Netherlands

NVWA actively enforces Novel Food:
- CBD foods require authorization
- Many products in gray area
- Enforcement varies
- Cosmetics exempt

## Medical CBD in Netherlands

### Available Options
- Bedrocan (Dutch medical cannabis producer)
- Prescription required
- Insurance may cover
- Available at pharmacies

### Getting a Prescription
1. Consult with doctor
2. Discuss CBD options
3. Prescription if appropriate
4. Fill at pharmacy

## CBD Cosmetics

Fully legal and widely available:
- No Novel Food restrictions
- Available in stores and online
- Must meet EU Cosmetics Regulation
- Popular: creams, serums, lip balms

## Important Cities for CBD

### Amsterdam
- Many CBD shops (not coffeeshops)
- Tourist-friendly options
- Verify THC content

### Rotterdam, Utrecht, Den Haag
- CBD shops available
- Health food stores
- Less tourist-focused

## Traveling with CBD

### Within Netherlands
- No issues for legal products
- Keep receipts

### To/From Netherlands
- EU travel: Generally okay
- Non-EU: Check destination laws
- Keep lab reports handy

## Common Questions

### Can I buy CBD at a coffeeshop?
No. Coffeeshops sell cannabis products. CBD is sold at separate, legal CBD shops.

### Why is the THC limit lower in Netherlands?
NVWA (Dutch food authority) interprets regulations more strictly than some EU countries.

### Is full-spectrum CBD legal in Netherlands?
Only if THC is below 0.05%, which is rare for full-spectrum products.

## Summary

The Netherlands has a mature CBD market with clear regulations, but a stricter THC limit (0.05%) than most EU countries. Don''t confuse legal CBD shops with tolerated cannabis coffeeshops. Verify THC content meets Dutch standards before purchasing.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Netherlands? 2026 Guide to Dutch CBD Laws',
    'Complete guide to CBD legality in the Netherlands. Dutch THC limits, coffeeshops vs CBD shops, and where to buy explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- FINLAND
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Finland? Complete 2026 Guide',
    'is-cbd-legal-in-finland',
    'Complete guide to CBD legality in Finland. Learn about Finnish regulations, THC limits, Fimea oversight, medical CBD, and where to buy legal CBD products.',
    E'# Is CBD Legal in Finland? Complete 2026 Guide

## Quick Answer

**CBD has complex legal status in Finland.** While CBD itself is not classified as a narcotic, Finland has strict regulations similar to Sweden, making many CBD products effectively illegal or requiring special authorization.

## Key Regulations

### THC Policy
- Finland has strict THC enforcement
- Products must have **<0.2% THC** (but enforcement is strict)
- Any product making health claims needs authorization

### Regulatory Bodies
1. **Fimea** (Finnish Medicines Agency) - Medical products
2. **Evira** (Food Safety Authority) - Food products
3. **Tukes** - Consumer product safety

## What''s Legal in Finland

### Generally Allowed
- CBD cosmetics (external use)
- Hemp seed products (without CBD)
- CBD with proper authorization (rare)

### Restricted/Prohibited
- CBD food supplements (need Novel Food approval)
- CBD oils marketed as supplements
- Products making health claims
- Full-spectrum products with any THC

## Finland''s Strict Approach

Finland interprets regulations conservatively:
- CBD extracts often classified as medicines
- Novel Food strictly enforced
- Few products have proper authorization
- Similar approach to Sweden

## Medical CBD in Finland

### Prescription CBD
- Available via Fimea special permit
- Doctor must apply on patient''s behalf
- Very limited availability
- For specific conditions

### Approved Products
- Epidiolex (epilepsy)
- Sativex (MS)
- Other products via special authorization

### Getting Medical CBD
1. Discuss with doctor
2. Doctor applies to Fimea
3. If approved, prescription issued
4. Fill at pharmacy

## Where to Buy CBD in Finland

### Legal Options (Limited)
1. **Online from EU** - Risk of customs seizure
2. **Pharmacies** - Prescription products only
3. **Some health stores** - CBD cosmetics only

### Challenges
- Few domestic retailers
- Import risks
- Strict enforcement
- Limited product selection

## CBD Cosmetics in Finland

The safest option for Finnish consumers:
- Legal for external use
- No Novel Food restrictions
- Available in some stores
- Can be imported more easily

## Customs and Importing

Finnish customs is vigilant:
- CBD products may be seized
- Lab testing may be required
- Even EU products face scrutiny
- Keep all documentation

### Tips for Importing
1. Choose cosmetics over supplements
2. Verify zero or <0.2% THC
3. Have lab reports
4. Small quantities only
5. Be prepared for customs questions

## Drug Testing

Important for Finnish workers:
- Drug testing is common
- CBD may cause false positives
- Zero THC products recommended
- Document your CBD use

## Recent Developments

Finnish CBD policy is evolving:
- Some push for clearer regulations
- EU harmonization pressure
- Medical access slowly improving
- Consumer market still restricted

## Common Questions

### Can I order CBD oil from EU to Finland?
Technically possible but risky. Customs may seize products, especially food supplements.

### Is CBD sold in Finnish pharmacies?
Only prescription medical CBD products with special authorization.

### What happens if caught with CBD in Finland?
Depends on product type. Cosmetics: likely okay. Supplements: may be seized. High THC: potential drug charges.

## Summary

Finland has one of Europe''s more restrictive CBD environments. Medical CBD requires special authorization, consumer CBD products face significant barriers, and customs actively enforces regulations. CBD cosmetics are the safest option. Always verify THC content and be prepared for regulatory challenges.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Finland? 2026 Guide to Finnish CBD Laws',
    'Complete guide to CBD legality in Finland. Fimea regulations, THC limits, medical CBD, and where to buy explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- FRANCE
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in France? Complete 2026 Guide',
    'is-cbd-legal-in-france',
    'Complete guide to CBD legality in France. Learn about French regulations, the 2022 court ruling, THC limits, flower legality, and where to buy legal CBD products.',
    E'# Is CBD Legal in France? Complete 2026 Guide

## Quick Answer

**Yes, CBD is legal in France** following a landmark 2022 Court of Justice ruling. France now allows CBD products including flowers, oils, and cosmetics derived from EU-approved hemp with less than 0.3% THC.

## Key Regulations

### THC Limit
- Maximum **0.3% THC** content allowed
- Updated from 0.2% following EU changes
- Applies to all CBD products including flowers

### Legal Framework
1. CBD is not classified as a narcotic
2. All parts of the hemp plant are legal (since 2022)
3. Novel Food regulations apply to CBD foods
4. No health claims without authorization

## The 2022 Game-Changer

France''s CBD market transformed after courts ruled:
- Banning CBD flowers was illegal under EU law
- Full plant now legal, not just seeds and fibers
- Significant market expansion followed
- Many CBD shops opened across France

### Before vs. After 2022
| Before | After |
|--------|-------|
| Only seeds/fiber legal | Full plant legal |
| Flowers banned | Flowers allowed |
| Limited market | Thriving market |

## Where to Buy CBD in France

### Legal Options
1. **CBD shops (boutiques CBD)** - Now in every major city
2. **Online retailers** - Wide selection
3. **Pharmacies** - Some stock CBD
4. **Tabac shops** - Limited CBD products
5. **Health food stores** - Oils and capsules

### What to Look For
- THC content clearly stated (<0.3%)
- Lab reports (certificat d''analyse)
- EU hemp origin
- Proper labeling in French

## CBD Flowers in France

Now fully legal:
- Popular product category
- Available in CBD shops
- Must have <0.3% THC
- Cannot be smoked in public

### Popular Varieties
- Amnesia CBD
- Strawberry CBD
- OG Kush CBD
- And many more

## CBD Food Products

Subject to Novel Food regulations:
- CBD oils: Widely available
- CBD edibles: In gray area
- CBD beverages: Available with caution
- DGCCRF (consumer protection) oversees

## Medical CBD in France

France has a medical cannabis experiment:
- Started in 2021
- Limited patient access
- Includes CBD products
- Prescription required
- Specific conditions only

## Popular CBD Products in France

1. **Huile CBD** (CBD oil) - Most popular
2. **Fleurs CBD** (CBD flowers) - Growing market
3. **Résine CBD** (CBD hash) - Legal
4. **Cosmétiques CBD** - Widely available
5. **Infusions CBD** - Tea products

## Traveling with CBD in France

### Within France
- Legal to transport
- Keep documentation
- Avoid public consumption of flowers

### To/From France
- EU travel: Generally okay
- Check destination laws
- Keep receipts and lab reports

## French CBD Market Size

France has one of Europe''s largest CBD markets:
- Hundreds of CBD shops
- Major online retailers
- Growing consumer base
- Estimated €700M+ market

## Common Questions

### Is smoking CBD flower legal in France?
Possessing and buying CBD flower is legal, but smoking in public may attract attention. Private consumption is legal.

### Can I buy CBD at a French pharmacy?
Some pharmacies stock CBD products, but selection varies. CBD shops typically have better variety.

### What''s the difference between CBD and cannabis in France?
CBD products must have <0.3% THC. Cannabis with higher THC remains illegal.

## Summary

France has transformed from a restrictive to an open CBD market. Following the 2022 court ruling, consumers have access to a full range of CBD products including flowers. Verify THC content (<0.3%), buy from reputable sources, and enjoy the legal French CBD market.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in France? 2026 Guide to French CBD Laws',
    'Complete guide to CBD legality in France. 2022 court ruling, flower legality, THC limits, and where to buy explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- ITALY
  -- ============================================
  INSERT INTO kb_articles (title, slug, excerpt, content, status, category_id, author_id, language, article_type, meta_title, meta_description, published_at)
  VALUES (
    'Is CBD Legal in Italy? Complete 2026 Guide',
    'is-cbd-legal-in-italy',
    'Complete guide to CBD legality in Italy. Learn about "cannabis light," THC limits, where to buy legal CBD products, and Italian regulations.',
    E'# Is CBD Legal in Italy? Complete 2026 Guide

## Quick Answer

**Yes, CBD is legal in Italy** under the "cannabis light" (cannabis leggera) framework. Products must contain less than 0.5% THC, making Italy one of Europe''s more permissive CBD markets.

## Key Regulations

### THC Limit
- Maximum **0.5% THC** for cannabis light products
- Higher than EU standard of 0.2-0.3%
- One of Europe''s highest limits

### Legal Framework (Law 242/2016)
1. Hemp cultivation legal with registered varieties
2. Cannabis light with <0.5% THC is legal
3. CBD not classified as narcotic
4. Products widely available

## The "Cannabis Light" Market

Italy pioneered the cannabis light concept:
- Started 2017-2018
- Thousands of shops opened
- Products include flowers, oils, resins
- Significant agricultural sector

### What is Cannabis Light?
- Hemp products with <0.5% THC
- Legal for sale and possession
- Includes CBD-rich flowers
- Cannot make therapeutic claims

## Where to Buy CBD in Italy

### Legal Options
1. **Cannabis light shops** - Found throughout Italy
2. **Online retailers** - Wide selection
3. **Tobacco shops (tabacchi)** - Some stock CBD
4. **Pharmacies** - Medical products
5. **Hemp shops** - Specialty products

### Major Cities
- Rome: Many cannabis light shops
- Milan: Developed market
- Florence, Naples, Turin: Good availability

## CBD Flowers in Italy

Very popular in Italy:
- Widely available
- Many varieties
- Sold openly
- Must have <0.5% THC

### Popular Products
- CBD buds (infiorescenze)
- CBD hash (resina)
- Pre-rolled CBD
- CBD trim

## CBD Oils and Other Products

Beyond flowers:
- **Olio CBD** - Wide range of concentrations
- **Capsule CBD** - Convenient option
- **Cosmetici CBD** - Growing market
- **Alimentari** - Subject to Novel Food

## Medical CBD in Italy

Italy has medical cannabis program:
- Available since 2006
- Prescription required
- Produced by military facility
- Also imported products

### Getting Medical CBD
1. Prescription from doctor
2. Fill at authorized pharmacy
3. For specific conditions
4. Regional availability varies

## Legal Considerations

While generally permissive, note:
- Cannot make therapeutic claims
- Must have proper labeling
- THC limit strictly enforced
- No sales to minors

### Enforcement
- Generally relaxed
- Police usually ignore cannabis light
- Lab testing may occur
- Stay within legal limits

## Regional Differences

Italy''s regions may vary:
- Some more permissive
- Others stricter enforcement
- Northern Italy: More shops
- Southern Italy: Growing market

## Traveling with CBD in Italy

### Within Italy
- Legal to transport
- Keep receipts
- Stay under <0.5% THC

### To/From Italy
- EU travel: Generally okay
- Non-EU: Check destination laws
- Italy''s limit higher than some countries

## The Italian CBD Market

Strong and growing:
- Thousands of shops nationwide
- Significant hemp cultivation
- Export market developing
- Tourism interest high

## Common Questions

### Can I smoke CBD in public in Italy?
While cannabis light is legal, public smoking may attract attention. Private consumption is clearly legal.

### What''s the difference between CBD shops and pharmacies?
CBD shops sell cannabis light products freely. Pharmacies offer medical cannabis with prescription.

### Is Italian cannabis light really 0.5% THC?
Yes, up to 0.5% THC is legal. This is higher than most EU countries (0.2-0.3%).

## Summary

Italy offers one of Europe''s most accessible CBD markets with its cannabis light framework and 0.5% THC limit. Products are widely available, flowers are legal, and the market is well-established. Verify THC content, buy from reputable sources, and enjoy Italy''s permissive CBD environment.

*Last updated: January 2026*',
    'published',
    legal_cat_id,
    author_id,
    'en',
    'standard',
    'Is CBD Legal in Italy? 2026 Guide to Italian CBD Laws',
    'Complete guide to CBD legality in Italy. Cannabis light, THC limits, where to buy, and Italian regulations explained for 2026.',
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;

END $$;

-- Log completion
SELECT 'Country-specific legal articles created successfully' AS status;
