const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const terms = [
  // EUROPEAN REGULATIONS - COUNTRY SPECIFIC (10)
  {
    term: "Swiss CBD Regulations",
    display_name: "Swiss CBD Regulations",
    slug: "swiss-cbd-law",
    category: "legal",
    short_definition: "Switzerland allows CBD products with <1% THC, more lenient than EU's 0.2% limit.",
    definition: "Switzerland allows CBD products with <1% THC, more lenient than EU's 0.2%. Swissmedic regulates medical cannabis; BAG oversees supplements.\n\nSwitzerland is not part of the EU and sets its own cannabis regulations. The higher THC threshold of 1% (compared to EU's 0.2-0.3%) makes Swiss CBD products unique but potentially non-compliant when crossing borders.\n\nSwiss 'CBD cannabis' or 'cannabis light' is widely available in tobacco shops and specialized stores. Products must be properly labeled with THC content and health warnings.",
    synonyms: ["Swiss Cannabis Law", "Switzerland CBD Rules"]
  },
  {
    term: "Swissmedic",
    display_name: "Swissmedic",
    slug: "swissmedic",
    category: "legal",
    short_definition: "Swiss regulatory authority for medicines, approving pharmaceutical CBD products.",
    definition: "Swissmedic is the Swiss Agency for Therapeutic Products, responsible for authorizing and supervising therapeutic products including pharmaceutical CBD medications.\n\nSwissmedic approves medical cannabis products and oversees Switzerland's medical cannabis programs. They ensure pharmaceutical-grade CBD meets strict quality and safety standards.\n\nFor CBD to be sold as a medicine in Switzerland, it must receive Swissmedic authorization. Consumer CBD products fall under different regulations overseen by BAG.",
    synonyms: ["Swiss Agency for Therapeutic Products", "Swiss Medicines Agency"]
  },
  {
    term: "BAG (Swiss Federal Office of Public Health)",
    display_name: "BAG (Swiss Federal Office of Public Health)",
    slug: "bag-switzerland",
    category: "legal",
    short_definition: "Swiss authority regulating CBD supplements, food products, and THC limits.",
    definition: "BAG (Bundesamt für Gesundheit) is the Swiss Federal Office of Public Health, responsible for regulating CBD as a consumer product, food supplement, or cosmetic.\n\nBAG sets the rules for non-pharmaceutical CBD products in Switzerland, including the <1% THC limit, labeling requirements, and permitted health claims.\n\nThey work alongside Swissmedic but focus on consumer protection rather than medical authorization. BAG also monitors the Swiss CBD market for compliance.",
    synonyms: ["Bundesamt für Gesundheit", "Swiss FOPH", "Swiss Public Health Office"]
  },
  {
    term: "BfArM (Germany)",
    display_name: "BfArM (Germany)",
    slug: "bfarm",
    category: "legal",
    short_definition: "German Federal Institute for Drugs overseeing medical cannabis prescriptions.",
    definition: "BfArM (Bundesinstitut für Arzneimittel und Medizinprodukte) is the German Federal Institute for Drugs and Medical Devices, overseeing pharmaceutical CBD and medical cannabis.\n\nSince Germany legalized medical cannabis in 2017, BfArM manages the Cannabis Agency that oversees domestic cultivation, import licenses, and prescription tracking.\n\nFor pharmaceutical CBD products, BfArM handles marketing authorizations. They also collect data on medical cannabis prescriptions to monitor safety and efficacy.",
    synonyms: ["Bundesinstitut für Arzneimittel", "German Federal Drug Institute", "German Cannabis Agency"]
  },
  {
    term: "German CBD Regulations",
    display_name: "German CBD Regulations",
    slug: "german-cbd-status",
    category: "legal",
    short_definition: "Germany allows CBD under Novel Food rules with medical cannabis available by prescription.",
    definition: "Germany allows CBD under Novel Food rules. Medical cannabis available by prescription since 2017. Strict advertising restrictions apply to all CBD products.\n\nGermany is Europe's largest CBD market. Consumer CBD products must comply with EU Novel Food regulations, meaning proper authorization is required. Many products exist in legal grey areas.\n\nMedical cannabis, including high-CBD products, can be prescribed by any doctor since 2017. Health insurance may cover costs in certain cases. CBD flower remains legally complex.",
    synonyms: ["German Cannabis Law", "Germany CBD Rules"]
  },
  {
    term: "French CBD Regulations",
    display_name: "French CBD Regulations",
    slug: "french-cbd-law",
    category: "legal",
    short_definition: "France bans CBD flower but allows other CBD products with 0% THC requirement.",
    definition: "France bans CBD flower but allows other CBD products with 0% THC (strictest in EU). Regulations frequently changing due to legal challenges.\n\nFrance has Europe's strictest CBD rules. In 2021, a law banned CBD flower and leaves, though this was partially overturned by courts. The situation remains in flux.\n\nOnly processed CBD products (oils, cosmetics) from EU-approved hemp varieties are permitted. The 0% THC requirement (vs EU's 0.2%) makes sourcing compliant products challenging for French businesses.",
    synonyms: ["French Cannabis Law", "France CBD Rules"]
  },
  {
    term: "Italian CBD Regulations",
    display_name: "Italian CBD Regulations",
    slug: "italian-cbd-law",
    category: "legal",
    short_definition: "Italy allows 'cannabis light' with <0.6% THC in a legal grey area.",
    definition: "Italy allows 'cannabis light' with <0.6% THC. Grey legal area with varying enforcement by region and ongoing legal debates.\n\nItaly's 2016 law permitting hemp cultivation created a booming 'cannabis light' market. Products with up to 0.6% THC are tolerated, though technically the law addresses cultivation, not consumption.\n\nEnforcement varies significantly by region and over time. Several court cases have both restricted and expanded what's permitted. The market thrives despite legal uncertainty.",
    synonyms: ["Italian Cannabis Law", "Cannabis Light Italy"]
  },
  {
    term: "EU-GMP Certification",
    display_name: "EU-GMP Certification",
    slug: "eu-gmp",
    category: "legal",
    short_definition: "Highest European manufacturing standard for pharmaceutical-grade CBD products.",
    definition: "European Union Good Manufacturing Practice certification represents the highest manufacturing standard for pharmaceutical-grade CBD in Europe.\n\nEU-GMP certification ensures products are consistently produced and controlled according to quality standards. It covers all aspects from raw materials to finished products, including personnel, facilities, and documentation.\n\nFor medical/pharmaceutical CBD, EU-GMP is often required. Consumer products don't require it but some premium brands pursue certification to demonstrate quality commitment.",
    synonyms: ["European GMP", "EU Good Manufacturing Practice"]
  },
  {
    term: "Traveling with CBD",
    display_name: "Traveling with CBD",
    slug: "traveling-with-cbd",
    category: "legal",
    short_definition: "CBD legality varies by country; check destination laws before traveling.",
    definition: "CBD legality varies by country. Within Schengen, generally allowed if EU-compliant. Check destination laws; some countries have zero tolerance for any cannabis-derived products.\n\nWithin the EU/Schengen area, traveling with EU-compliant CBD (≤0.2% THC) is generally permitted but not guaranteed. Carry COA documentation proving THC content.\n\nSome countries (UAE, Singapore, Japan, Russia) have zero tolerance for any cannabis products including CBD. Even trace THC could cause serious legal problems. Always research specific destination laws before traveling.",
    synonyms: ["Flying with CBD", "CBD at Airport", "CBD Travel Rules"]
  },
  {
    term: "THC-Free",
    display_name: "THC-Free",
    slug: "thc-free",
    category: "legal",
    short_definition: "Products with non-detectable THC levels, important for drug testing and zero-tolerance countries.",
    definition: "Products with non-detectable THC levels (<0.01%). Important for drug testing concerns and countries with zero-tolerance THC laws.\n\nTHC-free typically means below detection limits, usually <0.01% or ND (non-detect). This differs from 'low-THC' products that may contain trace amounts.\n\nTHC-free products are essential for: athletes subject to drug testing, professionals with zero-tolerance employers, travel to strict countries, and those sensitive to any THC. Usually achieved through CBD isolate or broad-spectrum processing.",
    synonyms: ["Zero THC", "THC Non-Detect", "ND THC"]
  },

  // CONSUMER PRACTICAL TERMS (10)
  {
    term: "Shelf Life",
    display_name: "Shelf Life",
    slug: "shelf-life",
    category: "products",
    short_definition: "How long a CBD product remains effective, typically 1-2 years if stored properly.",
    definition: "Shelf life is how long a CBD product remains effective and safe to use. Typically 1-2 years if stored properly. Check expiration dates; degraded CBD loses potency.\n\nCBD degrades over time through oxidation and exposure to heat, light, and air. Degraded CBD isn't dangerous but becomes less effective. The oil may darken or develop off-flavors.\n\nFactors affecting shelf life: extraction quality, carrier oil stability (MCT lasts longer), packaging (dark glass bottles protect from light), and storage conditions. Always check batch dates when purchasing.",
    synonyms: ["Expiration", "Best Before", "Product Lifespan"]
  },
  {
    term: "CBD Storage",
    display_name: "CBD Storage",
    slug: "cbd-storage",
    category: "products",
    short_definition: "Store CBD in cool, dark place away from heat and light to preserve potency.",
    definition: "Store CBD in cool, dark place away from heat and light. Refrigeration extends shelf life. Keep bottles sealed to prevent oxidation.\n\nIdeal storage: room temperature (15-25°C), away from windows, in original dark bottle. Avoid bathrooms (humidity) and kitchens near stoves (heat fluctuations).\n\nRefrigeration is beneficial for long-term storage but may cause oil to thicken. Let refrigerated oil warm to room temperature before use. Never freeze CBD oil as it may separate.",
    synonyms: ["Storing CBD", "CBD Preservation"]
  },
  {
    term: "Serving Size",
    display_name: "Serving Size",
    slug: "serving-size",
    category: "dosing",
    short_definition: "Recommended amount per use shown on label; multiply by concentration for mg per serving.",
    definition: "Serving size is the recommended amount per use, shown on the product label. One dropper, one gummy, one capsule, etc. Multiply by CBD concentration to get mg per serving.\n\nExample: If a gummy's serving size is 1 gummy containing 25mg CBD, that's your dose per serving. For oils, one 'serving' is typically one full dropper (1mL).\n\nServing sizes are suggestions, not prescriptions. Your optimal dose may be more or less than one serving. Start with the suggested serving and adjust based on your response.",
    synonyms: ["Portion Size", "Dose Per Serving"]
  },
  {
    term: "mg/mL Calculation",
    display_name: "mg/mL Calculation",
    slug: "mg-ml-calculation",
    category: "dosing",
    short_definition: "To find CBD per mL: divide total mg by bottle mL. One dropper typically equals 1mL.",
    definition: "To find CBD per mL: divide total mg by bottle mL. Example: 1000mg in 30mL = 33.3mg per mL. One dropper typically equals 1mL.\n\nThis calculation helps you know exactly how much CBD you're taking. A 'dropper' or 'dropperful' usually means a full dropper which is approximately 1mL.\n\nCommon calculations:\n- 500mg/30mL = 16.7mg per dropper\n- 1000mg/30mL = 33.3mg per dropper\n- 1500mg/30mL = 50mg per dropper\n- 3000mg/30mL = 100mg per dropper",
    synonyms: ["CBD Concentration", "mg per mL", "Dropper Calculation"]
  },
  {
    term: "Percentage to mg Conversion",
    display_name: "Percentage to mg Conversion",
    slug: "percentage-to-mg",
    category: "dosing",
    short_definition: "Convert percentage to mg by multiplying product weight by percentage.",
    definition: "To convert percentage to mg: multiply product weight (in grams) by percentage, then multiply by 10. Example: 10% CBD in 10g product = 10 × 10 × 10 = 1000mg CBD.\n\nThis conversion is essential for comparing products listed differently. European products often show percentage while American products show total mg.\n\nSimpler formula: For a 10mL oil (≈10g), percentage roughly equals mg per mL. A 5% oil has approximately 5mg per mL, or 50mg per dropper.",
    synonyms: ["Percent to mg", "CBD Percentage Calculation"]
  },
  {
    term: "Reading CBD Labels",
    display_name: "Reading CBD Labels",
    slug: "label-reading",
    category: "products",
    short_definition: "Check total CBD mg, THC content, serving size, ingredients, and third-party test links.",
    definition: "When reading CBD labels, check: total CBD mg, THC content, serving size, ingredients, batch number, and third-party test link. Avoid products missing this information.\n\nRed flags: Only 'hemp extract' amount listed (not CBD specifically), no THC disclosure, no batch/lot number, missing contact information, outrageous health claims.\n\nGreen flags: Clear CBD mg per serving AND total, THC percentage stated, QR code to lab results, batch number matching COA, full ingredient list, manufacturer contact info.",
    synonyms: ["CBD Label Guide", "Understanding CBD Labels"]
  },
  {
    term: "Inactive Ingredients",
    display_name: "Inactive Ingredients",
    slug: "inactive-ingredients",
    category: "products",
    short_definition: "Non-CBD components like carrier oils and flavorings; check for allergens.",
    definition: "Inactive ingredients are non-CBD components: carrier oils, flavorings, preservatives. Check for allergens (coconut, tree nuts). Fewer additives often indicates better quality.\n\nCommon carrier oils: MCT (coconut-derived), hemp seed oil, olive oil. Some people react to MCT oil. Check if you have coconut allergies.\n\nWatch for: artificial sweeteners (some people sensitive), artificial colors (unnecessary), preservatives (may indicate lower quality oil). Gummies often contain more additives than oils.",
    synonyms: ["Other Ingredients", "Non-Active Ingredients"]
  },
  {
    term: "Batch Testing",
    display_name: "Batch Testing",
    slug: "batch-testing",
    category: "legal",
    short_definition: "Testing each production batch ensures consistency; match your batch number to lab report.",
    definition: "Batch testing means testing each production batch rather than just initial samples. This ensures consistency across products. Match your product's batch number to the lab report.\n\nWhy it matters: CBD potency can vary between batches due to plant variation, extraction differences, and production variables. Batch testing catches these variations.\n\nHow to verify: Find the batch/lot number on your product (usually on bottom or back). Look up COA on manufacturer's website. Ensure batch numbers match. If they don't match, the COA may not represent your product.",
    synonyms: ["Lot Testing", "Production Batch Testing"]
  },
  {
    term: "QR Code Verification",
    display_name: "QR Code Verification",
    slug: "qr-code-verification",
    category: "products",
    short_definition: "Scannable code linking to lab results for your specific batch; no QR code is a red flag.",
    definition: "QR code verification is a scannable code linking to lab results for that specific batch. Best practice for transparency. No QR code is a red flag for quality brands.\n\nHow to use: Scan with your phone camera, which opens the lab report webpage. Verify the batch number matches your product. Review cannabinoid content, contaminant testing, and test date.\n\nAdvanced verification: Check that the lab (not the brand) hosts the results. Some brands create fake 'lab result' pages. Legitimate results come from the testing laboratory's domain.",
    synonyms: ["Lab Result QR", "COA QR Code"]
  },
  {
    term: "CBD Dosage Calculator",
    display_name: "CBD Dosage Calculator",
    slug: "cbd-calculator",
    category: "dosing",
    short_definition: "Tool to estimate starting dose based on body weight and condition; adjust based on response.",
    definition: "A CBD dosage calculator is a tool to estimate starting dose based on body weight, condition severity, and product strength. It's a starting point only; individual response varies.\n\nGeneral formula: 0.25-0.5mg CBD per kg body weight as starting dose. Example: 70kg person starts with 17.5-35mg. Increase gradually every few days if needed.\n\nFactors affecting optimal dose: body weight, metabolism, condition being addressed, product type (absorption varies), individual sensitivity. Some people need 10mg; others need 100mg+ for same effect.",
    synonyms: ["Dosing Calculator", "CBD Dose Finder"]
  },

  // PET/VETERINARY CBD (10)
  {
    term: "Pet CBD",
    display_name: "Pet CBD",
    slug: "pet-cbd",
    category: "products",
    short_definition: "CBD products formulated for animals with lower concentrations and pet-safe ingredients.",
    definition: "Pet CBD refers to CBD products specifically formulated for animals. Usually lower concentrations than human products, with pet-safe flavorings. Never give human products containing xylitol or chocolate.\n\nPet products are designed for proper dosing based on animal body weights (often much smaller than humans) and exclude ingredients toxic to pets.\n\nFormats include: oils/tinctures (most versatile), treats (convenient but fixed dose), topicals (for skin/joints). Choose format based on your pet's preferences and needs.",
    synonyms: ["Animal CBD", "CBD for Pets"]
  },
  {
    term: "Pet Endocannabinoid System",
    display_name: "Pet Endocannabinoid System",
    slug: "pet-endocannabinoid",
    category: "medical",
    short_definition: "Dogs, cats, and most mammals have endocannabinoid systems similar to humans.",
    definition: "Dogs, cats, and most mammals have endocannabinoid systems similar to humans. CBD interacts with their CB1 and CB2 receptors just as it does in people.\n\nThe endocannabinoid system regulates similar functions in animals: pain, inflammation, mood, appetite, and immune response. This is why CBD may offer similar benefits.\n\nDogs have more CB1 receptors in their brains than humans, which may make them more sensitive to THC. This is why THC-free or very low THC products are essential for pets.",
    synonyms: ["Animal ECS", "Pet ECS"]
  },
  {
    term: "CBD for Dogs",
    display_name: "CBD for Dogs",
    slug: "dog-cbd",
    category: "products",
    short_definition: "CBD may help dogs with anxiety, pain, and seizures; ensure products have minimal THC.",
    definition: "CBD may help dogs with anxiety, pain, seizures, and inflammation. Dogs are more sensitive to THC than humans; ensure products have <0.3% THC, preferably THC-free.\n\nResearch is promising: A Cornell University study found CBD oil helped increase comfort and activity in dogs with osteoarthritis. Colorado State University research showed reduced seizure frequency.\n\nCommon uses: separation anxiety, noise phobia, joint pain/arthritis, epilepsy support, general wellness. Always start with low doses and consult your veterinarian.",
    synonyms: ["Canine CBD", "CBD for Canines"]
  },
  {
    term: "CBD for Cats",
    display_name: "CBD for Cats",
    slug: "cat-cbd",
    category: "products",
    short_definition: "CBD for feline anxiety and pain; cats metabolize differently, so use cat-specific products.",
    definition: "CBD for feline anxiety, pain, and inflammation. Cats metabolize substances differently than dogs; use cat-specific products. Avoid essential oils and terpenes which can be toxic to cats.\n\nCats lack certain liver enzymes that process compounds found in many CBD products. Full-spectrum products with terpenes may be problematic. CBD isolate products are often safer for cats.\n\nNever use products containing: essential oils, artificial sweeteners, or high terpene content. Fish or unflavored formulas are usually best tolerated.",
    synonyms: ["Feline CBD", "CBD for Felines"]
  },
  {
    term: "Pet CBD Dosing",
    display_name: "Pet CBD Dosing",
    slug: "pet-dosing",
    category: "dosing",
    short_definition: "General starting point: 0.25-0.5mg CBD per kg body weight, twice daily.",
    definition: "General starting point for pets: 0.25-0.5mg CBD per kg body weight, twice daily. Start low, increase gradually. Consult your veterinarian before starting.\n\nExample doses:\n- Small dog (5kg): 1.25-2.5mg twice daily\n- Medium dog (15kg): 3.75-7.5mg twice daily\n- Large dog (30kg): 7.5-15mg twice daily\n- Cat (4kg): 1-2mg twice daily\n\nWatch for: excessive sedation, digestive upset, or changes in behavior. Reduce dose if side effects occur. Effects typically appear within 30-60 minutes.",
    synonyms: ["Animal CBD Dosing", "Pet Dosage"]
  },
  {
    term: "Pet Anxiety & CBD",
    display_name: "Pet Anxiety & CBD",
    slug: "pet-anxiety",
    category: "conditions",
    short_definition: "CBD may help pets with separation anxiety, noise phobia, and travel anxiety.",
    definition: "CBD may help pets with separation anxiety, noise phobia (fireworks/thunder), and travel anxiety. Research is limited but promising, with many pet owners reporting positive results.\n\nCommon anxiety triggers in pets: owner absence, loud noises, car travel, vet visits, new environments, other animals. CBD may help reduce stress response without heavy sedation.\n\nFor best results with situational anxiety (fireworks, travel), give CBD 30-60 minutes before the triggering event. For chronic anxiety, consistent daily dosing may be more effective.",
    synonyms: ["Pet Stress", "Animal Anxiety"]
  },
  {
    term: "Pet Arthritis & CBD",
    display_name: "Pet Arthritis & CBD",
    slug: "pet-arthritis",
    category: "conditions",
    short_definition: "CBD shows promise for pet joint pain; Cornell study showed improvement in arthritic dogs.",
    definition: "CBD shows promise for pet joint pain and mobility issues. A Cornell University study found dogs with osteoarthritis showed significant improvement in comfort and activity levels with CBD treatment.\n\nThe study used 2mg/kg twice daily and measured pain scores and activity levels. Dogs showed decreased pain and increased activity without observable side effects.\n\nCBD may help through anti-inflammatory effects on joints. It's often used alongside (not replacing) other arthritis treatments. Consult your vet about integrating CBD into your pet's pain management plan.",
    synonyms: ["Pet Joint Pain", "Animal Arthritis"]
  },
  {
    term: "Pet Seizures & CBD",
    display_name: "Pet Seizures & CBD",
    slug: "pet-seizures",
    category: "conditions",
    short_definition: "CBD may reduce seizure frequency in epileptic dogs; research showed 89% reduction in some cases.",
    definition: "CBD may reduce seizure frequency in dogs with epilepsy. Colorado State University research showed 89% of dogs in the CBD group had reduced seizure frequency.\n\nThe study found CBD was well-tolerated with the most common side effect being increased appetite. Dogs receiving CBD alongside traditional anti-epileptic drugs showed the most improvement.\n\nImportant: Don't replace prescribed seizure medications with CBD without veterinary guidance. CBD may be a helpful addition to existing treatment, not necessarily a replacement.",
    synonyms: ["Pet Epilepsy", "Animal Seizures"]
  },
  {
    term: "Veterinary Cannabis Medicine",
    display_name: "Veterinary Cannabis Medicine",
    slug: "veterinary-cannabis",
    category: "medical",
    short_definition: "Emerging field studying cannabinoids for animal health, limited by legal restrictions.",
    definition: "Veterinary cannabis medicine is an emerging field studying cannabinoids for animal health. Limited by legal restrictions on veterinary research and prescribing in many jurisdictions.\n\nVeterinarians often cannot legally recommend CBD or prescribe cannabis products for animals. Laws vary by country and state. Many vets can only discuss CBD if pet owners bring it up first.\n\nResearch is growing despite limitations. Institutions like Cornell, Colorado State, and others are conducting studies. Professional organizations are developing guidelines as evidence accumulates.",
    synonyms: ["Animal Cannabis Medicine", "Veterinary Cannabinoid Therapy"]
  },
  {
    term: "Pet CBD Product Safety",
    display_name: "Pet CBD Product Safety",
    slug: "pet-product-safety",
    category: "products",
    short_definition: "Choose pet-specific formulas; avoid xylitol, chocolate, grapes, essential oils, and high THC.",
    definition: "Pet CBD product safety: Choose pet-specific formulas. Avoid: xylitol (extremely toxic to dogs), chocolate, grapes/raisins, essential oils (toxic to cats), and high THC content.\n\nSafety checklist:\n- Specifically formulated for pets\n- Third-party tested for pets\n- THC-free or <0.3% THC\n- No artificial sweeteners\n- No essential oil additives\n- Clear dosing instructions by weight\n\nRed flags: Human products marketed for pets without reformulation, no COA available, unclear ingredient lists, unrealistic health claims.",
    synonyms: ["Safe Pet CBD", "Animal CBD Safety"]
  },

  // QUALITY CERTIFICATIONS (10)
  {
    term: "USDA Organic",
    display_name: "USDA Organic",
    slug: "usda-organic",
    category: "legal",
    short_definition: "U.S. certification for hemp grown without synthetic pesticides or GMOs.",
    definition: "USDA Organic is the U.S. certification for hemp grown without synthetic pesticides, herbicides, or GMOs. Higher quality but typically more expensive. Look for the official green seal.\n\nOrganic certification ensures hemp is grown using approved methods: natural pest control, no synthetic fertilizers, non-GMO seeds, and sustainable farming practices.\n\nFor CBD products, USDA Organic certification means the hemp source meets these standards. However, the extraction process may not be certified organic. Look for 'Made with Organic Hemp' vs '100% Organic' distinctions.",
    synonyms: ["Organic Certified", "USDA Organic Hemp"]
  },
  {
    term: "EU Organic Certification",
    display_name: "EU Organic Certification",
    slug: "eu-organic",
    category: "legal",
    short_definition: "European organic standard for hemp cultivation, indicated by the green leaf logo.",
    definition: "EU Organic Certification is the European organic standard for hemp cultivation. The green leaf logo (Euro-leaf) indicates compliance with EU organic farming regulations.\n\nEU organic standards prohibit synthetic pesticides and fertilizers, require crop rotation, mandate animal welfare (if applicable), and limit processing additives.\n\nCertification is issued by approved control bodies in each EU member state. Products must contain at least 95% organic agricultural ingredients to carry the EU organic logo.",
    synonyms: ["Euro-leaf", "European Organic", "EU Bio"]
  },
  {
    term: "Non-GMO",
    display_name: "Non-GMO",
    slug: "non-gmo",
    category: "products",
    short_definition: "Product made without genetically modified organisms; most hemp is naturally non-GMO.",
    definition: "Non-GMO indicates products made without genetically modified organisms. Most hemp is naturally non-GMO, but certification provides third-party verification.\n\nCurrently, no GMO hemp varieties are commercially available, so virtually all hemp is non-GMO by default. However, third-party verification (like Non-GMO Project Verified) confirms this.\n\nThe Non-GMO Project butterfly seal is the most recognized certification. It verifies products are produced according to non-GMO best practices, including testing of at-risk ingredients.",
    synonyms: ["Non-GMO Project", "GMO-Free"]
  },
  {
    term: "Vegan CBD",
    display_name: "Vegan CBD",
    slug: "vegan-cbd",
    category: "products",
    short_definition: "CBD products without animal-derived ingredients; check for gelatin, beeswax, or lanolin.",
    definition: "Vegan CBD products contain no animal-derived ingredients. Common non-vegan ingredients to watch for: gelatin (capsules/gummies), beeswax (topicals), lanolin (creams), and honey.\n\nMost CBD oils are naturally vegan (CBD + carrier oil). Issues arise with other product types: capsule shells, gummy bases, and topical ingredients may contain animal products.\n\nVegan alternatives: pectin-based gummies, plant-based capsule shells, shea butter or coconut oil in topicals. Look for certified vegan labels from organizations like Vegan Society or Vegan Action.",
    synonyms: ["Plant-Based CBD", "Vegan Cannabis"]
  },
  {
    term: "Cruelty-Free",
    display_name: "Cruelty-Free",
    slug: "cruelty-free",
    category: "products",
    short_definition: "Products not tested on animals; look for Leaping Bunny or PETA certification.",
    definition: "Cruelty-free means products and ingredients were not tested on animals. Look for Leaping Bunny or PETA certification. Most CBD brands are cruelty-free but verify.\n\nCBD doesn't require animal testing for safety (unlike pharmaceuticals), so most brands don't test on animals. However, some ingredient suppliers or parent companies may conduct animal testing.\n\nLeaping Bunny certification requires no animal testing at any stage by the company, its suppliers, or any third parties. PETA's Beauty Without Bunnies program maintains a searchable database of cruelty-free companies.",
    synonyms: ["Not Tested on Animals", "Animal-Friendly"]
  },
  {
    term: "ISO Certification",
    display_name: "ISO Certification",
    slug: "iso-certification",
    category: "legal",
    short_definition: "International quality standards; ISO 17025 for labs, ISO 9001 for manufacturers.",
    definition: "ISO (International Organization for Standardization) certification indicates adherence to international quality management standards. ISO 17025 applies to testing labs; ISO 9001 applies to manufacturers.\n\nISO 17025 is crucial for CBD testing labs. It ensures the lab has competent personnel, validated methods, proper equipment, and quality controls. Lab results from ISO 17025-accredited labs are more reliable.\n\nISO 9001 for manufacturers indicates a quality management system covering design, production, and customer service. It doesn't guarantee product quality but indicates systematic quality processes.",
    synonyms: ["ISO 17025", "ISO 9001", "ISO Standards"]
  },
  {
    term: "cGMP (Current Good Manufacturing Practice)",
    display_name: "cGMP (Current Good Manufacturing Practice)",
    slug: "cgmp",
    category: "legal",
    short_definition: "FDA manufacturing standards ensuring product quality and consistency.",
    definition: "cGMP (Current Good Manufacturing Practice) represents FDA manufacturing standards ensuring product quality and consistency. Higher standard than basic GMP. Required for pharmaceutical products.\n\ncGMP covers: facility design/maintenance, equipment calibration, personnel training, ingredient sourcing, production procedures, quality testing, packaging, labeling, and record-keeping.\n\nFor CBD, cGMP certification indicates the manufacturer follows pharmaceutical-grade procedures even though CBD supplements don't require it. It's a mark of quality commitment and reduces contamination/mislabeling risks.",
    synonyms: ["Current Good Manufacturing Practice", "cGMP Certified"]
  },
  {
    term: "Kosher CBD",
    display_name: "Kosher CBD",
    slug: "kosher-cbd",
    category: "products",
    short_definition: "CBD products certified to meet Jewish dietary laws under rabbinical supervision.",
    definition: "Kosher CBD products are certified to meet Jewish dietary laws (kashrut). Requires rabbinical supervision of production. Relevant for observant Jewish users.\n\nKosher certification examines: all ingredients (no non-kosher animal derivatives), production equipment (not used for non-kosher products), and processing methods.\n\nMost pure CBD oils can be certified kosher as they contain minimal ingredients. Gummies and flavored products require more scrutiny. Look for recognized kosher symbols (OU, OK, Star-K, etc.).",
    synonyms: ["Kosher Certified", "Kosher Cannabis"]
  },
  {
    term: "Halal CBD",
    display_name: "Halal CBD",
    slug: "halal-cbd",
    category: "products",
    short_definition: "CBD products compliant with Islamic law; must be THC-free and alcohol-free.",
    definition: "Halal CBD products comply with Islamic law (sharia). Must be THC-free and not contain alcohol or haram (forbidden) animal-derived ingredients.\n\nHalal requirements for CBD:\n- No THC (intoxicants are haram)\n- No alcohol-based extraction or ingredients\n- No porcine-derived ingredients (gelatin)\n- No ingredients from improperly slaughtered animals\n\nMany scholars consider CBD permissible (halal) when it's THC-free and produces no intoxication. However, opinions vary. Look for halal certification from recognized Islamic authorities.",
    synonyms: ["Halal Certified", "Islamic-Compliant CBD"]
  },
  {
    term: "Third-Party Verified",
    display_name: "Third-Party Verified",
    slug: "third-party-verified",
    category: "legal",
    short_definition: "Independent organization has verified product claims, stronger than just third-party tested.",
    definition: "Third-party verified means an independent organization has verified product claims beyond just testing. This is stronger than 'third-party tested' and includes verification seals.\n\nDifference from third-party tested:\n- Third-party tested: Lab tested the product\n- Third-party verified: Organization audited claims, manufacturing, supply chain, etc.\n\nVerification programs like NSF International, US Hemp Authority, or ConsumerLab go beyond testing to verify label accuracy, manufacturing standards, and company practices. These seals indicate more comprehensive quality assurance.",
    synonyms: ["Independently Verified", "Third-Party Certification"]
  },

  // COMMON CLARIFICATIONS (10)
  {
    term: "Hemp Oil vs CBD Oil",
    display_name: "Hemp Oil vs CBD Oil",
    slug: "hemp-oil-vs-cbd",
    category: "products",
    short_definition: "Hemp seed oil contains no CBD; CBD oil is extracted from flowers/leaves. Often confused.",
    definition: "Hemp seed oil contains no CBD or other cannabinoids; it's made from seeds for nutritional value. CBD oil is extracted from flowers, leaves, and stalks containing cannabinoids. These are often confused, especially on Amazon.\n\nHemp seed oil is a nutritional product rich in omega fatty acids. It's great for cooking and skincare but has no therapeutic cannabinoid content.\n\nCBD oil contains cannabidiol extracted from hemp's aerial parts. It's the product with potential therapeutic benefits. Watch for products labeled 'hemp oil' or 'hemp extract' without specifying CBD content—they may be seed oil masquerading as CBD.",
    synonyms: ["Hemp vs CBD", "Hemp Seed vs CBD"]
  },
  {
    term: "Hemp Seed Oil",
    display_name: "Hemp Seed Oil",
    slug: "hemp-seed-oil",
    category: "products",
    short_definition: "Oil pressed from hemp seeds; nutritious but contains zero CBD or THC.",
    definition: "Hemp seed oil is cold-pressed from hemp seeds. Rich in omega-3 and omega-6 fatty acids but contains zero CBD or THC. It's a nutritional supplement, not a therapeutic cannabinoid product.\n\nNutritional benefits: excellent omega fatty acid profile, vitamin E, minerals. Used in cooking, salads, smoothies, and skincare.\n\nNot a CBD substitute: Despite being from the hemp plant, seeds don't contain cannabinoids. Products advertising 'hemp oil' benefits for anxiety, pain, etc. are misleading if they only contain seed oil.",
    synonyms: ["Cannabis Sativa Seed Oil", "Hemp Hearts Oil"]
  },
  {
    term: "Cannabis Oil",
    display_name: "Cannabis Oil",
    slug: "cannabis-oil",
    category: "products",
    short_definition: "General term for oils from cannabis; can mean CBD oil, THC oil, or both.",
    definition: "Cannabis oil is a general term for any oil extracted from the cannabis plant. It can mean CBD oil, THC oil, or products containing both. In medical contexts, it often refers to high-THC products.\n\nContext matters:\n- 'Cannabis oil' in dispensaries often means THC-dominant\n- 'Cannabis oil' in wellness stores often means CBD\n- Medical 'cannabis oil' varies by prescription\n\nAlways check cannabinoid content labels. Don't assume 'cannabis oil' is CBD-only or THC-only. The term is used loosely across different markets and countries.",
    synonyms: ["Cannabis Extract", "Marijuana Oil"]
  },
  {
    term: "Psychoactive vs Intoxicating",
    display_name: "Psychoactive vs Intoxicating",
    slug: "psychoactive-vs-intoxicating",
    category: "medical",
    short_definition: "Psychoactive affects the mind (like caffeine); intoxicating impairs function (like alcohol).",
    definition: "Psychoactive substances affect the mind—this includes caffeine, CBD, and antidepressants. Intoxicating substances specifically impair cognitive or motor function—like alcohol or THC. CBD is psychoactive but NOT intoxicating.\n\nTechnically, CBD is psychoactive because it interacts with brain receptors and can affect mood/anxiety. However, it doesn't impair judgment, coordination, or produce a 'high.'\n\nThis distinction matters for understanding CBD: it can have calming mental effects (psychoactive) without making you impaired (not intoxicating). The term 'non-psychoactive' is often used but technically incorrect.",
    synonyms: ["Psychoactive Definition", "Intoxicating Definition"]
  },
  {
    term: "Legal High (Misnomer)",
    display_name: "Legal High (Misnomer)",
    slug: "legal-high",
    category: "legal",
    short_definition: "CBD does NOT produce a 'high'—this marketing term is misleading.",
    definition: "CBD does not produce a 'high' or intoxication. Marketing using 'legal high' terminology is misleading. CBD may promote relaxation but without THC's impairment.\n\nWhy this term is problematic:\n- Misrepresents what CBD does\n- Sets wrong expectations\n- May indicate low-quality or mislabeled products\n- Could actually contain synthetic cannabinoids (dangerous)\n\nLegitimate CBD products don't market as 'legal highs.' If you see this language, it's a red flag suggesting the product may be mislabeled, contain undisclosed THC, or be synthetic cannabinoids.",
    synonyms: ["CBD High (Misleading)", "Legal Cannabis High (Wrong)"]
  },
  {
    term: "Synthetic Cannabinoids (Danger)",
    display_name: "Synthetic Cannabinoids (Danger)",
    slug: "synthetic-cannabinoids",
    category: "medical",
    short_definition: "Dangerous lab-made chemicals mimicking THC; NOT related to legitimate CBD products.",
    definition: "Synthetic cannabinoids are dangerous lab-made chemicals designed to mimic THC effects. They cause unpredictable, often severe effects including seizures, psychosis, and death. NOT related to legitimate CBD products.\n\nThese compounds bind to cannabinoid receptors much more strongly than natural THC, causing dangerous reactions. Effects are unpredictable because formulations constantly change to evade drug laws.\n\nSynthetic cannabinoids (Spice, K2, etc.) are completely different from:\n- Natural CBD from hemp\n- Natural THC from cannabis\n- Pharmaceutical cannabinoids (dronabinol, nabilone)\n\nNever confuse street 'synthetics' with legitimate CBD.",
    synonyms: ["Synthetic Marijuana", "Designer Cannabinoids"]
  },
  {
    term: "Spice / K2 (Avoid)",
    display_name: "Spice / K2 (Avoid)",
    slug: "spice-k2",
    category: "medical",
    short_definition: "Illegal, dangerous synthetic cannabinoids causing severe health problems. NOT real cannabis.",
    definition: "Spice and K2 are illegal synthetic cannabinoids sprayed on plant material. They cause severe health problems including seizures, heart attacks, kidney damage, and deaths. Completely different from natural CBD.\n\nThese products:\n- Are NOT cannabis or hemp\n- Contain ever-changing synthetic chemicals\n- Have caused mass hospitalizations\n- Are illegal in most countries\n- Have no quality control\n\nThey have no relationship to legitimate CBD products. Don't let fear of synthetic cannabinoids prevent you from using properly tested, natural CBD from reputable sources.",
    synonyms: ["K2", "Spice Drug", "Synthetic Marijuana (Street)"]
  },
  {
    term: "CBD vs THC",
    display_name: "CBD vs THC",
    slug: "cbd-vs-thc",
    category: "cannabinoids",
    short_definition: "Both are cannabinoids; THC is intoxicating ('high'), CBD is not. Different legal status.",
    definition: "CBD and THC are both cannabinoids from the cannabis plant but with different effects. THC produces the intoxicating 'high' associated with marijuana. CBD does not cause intoxication. Legal status differs significantly.\n\nKey differences:\n- THC: Intoxicating, psychoactive 'high', restricted in most places, drug test positive\n- CBD: Non-intoxicating, calming effects, broadly legal from hemp, usually drug test safe\n\nSimilarities: Both interact with the endocannabinoid system, both have potential therapeutic benefits, both come from cannabis plants. They may work better together (entourage effect) than alone.",
    synonyms: ["Cannabidiol vs THC", "THC vs CBD"]
  },
  {
    term: "Hemp vs Marijuana",
    display_name: "Hemp vs Marijuana",
    slug: "hemp-vs-marijuana",
    category: "legal",
    short_definition: "Both are cannabis; hemp has ≤0.3% THC (legal), marijuana has >0.3% THC (restricted).",
    definition: "Hemp and marijuana are both Cannabis sativa but legally distinguished by THC content. Hemp contains ≤0.3% THC (≤0.2% in EU) and is broadly legal. Marijuana contains >0.3% THC and remains restricted in most places.\n\nBiological reality: They're the same species. The distinction is legal/regulatory, not botanical. A plant becomes 'marijuana' only if THC exceeds the legal threshold.\n\nPractical implications:\n- CBD is typically derived from hemp (legal)\n- THC products come from marijuana (restricted)\n- Hemp-derived products must stay under THC limits\n- Full-spectrum hemp CBD contains trace THC within legal limits",
    synonyms: ["Hemp vs Cannabis", "Industrial Hemp vs Marijuana"]
  },
  {
    term: "CBD Marketing Claims",
    display_name: "CBD Marketing Claims",
    slug: "cbd-marketing-claims",
    category: "legal",
    short_definition: "CBD cannot legally claim to cure or treat diseases; watch for 'miracle cure' red flags.",
    definition: "CBD products cannot legally claim to cure, treat, diagnose, or prevent diseases (except FDA-approved Epidiolex). Watch for red flags: 'miracle cure,' guaranteed results, or specific disease treatment claims.\n\nLegal language typically includes:\n- 'May support...'\n- 'Promotes...'\n- 'Helps maintain...'\n\nIllegal claims include:\n- 'Cures cancer/diabetes/etc.'\n- 'Treats anxiety disorder'\n- 'Guaranteed results'\n\nCompanies making disease claims are breaking regulations and may also be selling low-quality products. Legitimate brands are careful with their language.",
    synonyms: ["CBD Health Claims", "CBD Advertising Rules"]
  }
];

async function addTerms() {
  console.log(`Adding ${terms.length} glossary terms (Batch 4 - Final)...\n`);

  // First, get existing slugs to check for duplicates
  const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=slug`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const existingTerms = await existingResponse.json();
  const existingSlugs = new Set(existingTerms.map(t => t.slug));

  let added = 0;
  let skipped = 0;

  for (const term of terms) {
    // Check if slug already exists
    if (existingSlugs.has(term.slug)) {
      console.log(`⊖ Skipped "${term.term}" (already exists)`);
      skipped++;
      continue;
    }

    const insertData = {
      term: term.term,
      display_name: term.display_name,
      slug: term.slug,
      definition: term.definition,
      short_definition: term.short_definition,
      category: term.category,
      synonyms: term.synonyms || [],
      sources: [],
      related_terms: [],
      related_research: []
    };

    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(insertData)
    });

    if (insertResponse.ok) {
      console.log(`✓ Added "${term.display_name}"`);
      added++;
    } else {
      const error = await insertResponse.text();
      console.error(`✗ Failed to add "${term.term}":`, error);
    }
  }

  // Get final count
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id,category`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const allTerms = await countResponse.json();

  // Count by category
  const categoryCounts = {};
  allTerms.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  console.log(`\n=== Summary ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total terms: ${allTerms.length}`);
  console.log(`\nBy category:`);
  Object.entries(categoryCounts).sort((a, b) => a[0].localeCompare(b[0])).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });
}

addTerms().catch(console.error);
