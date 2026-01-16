const terms = [
  // TERPENES (8 new - some already exist)
  {
    term: "Bisabolol",
    slug: "bisabolol",
    definition: "Alpha-bisabolol is a floral, sweet terpene found in cannabis, chamomile, and candeia trees. It has a subtle, pleasant aroma often described as honey-like with hints of apple and citrus.\n\nBisabolol is prized for its anti-inflammatory, antibacterial, and skin-healing properties. It's commonly used in cosmetics and skincare products. In cannabis, it may enhance the calming and anti-anxiety effects of other compounds.",
    short_definition: "A floral, honey-scented terpene with anti-inflammatory and skin-healing properties.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: ["α-bisabolol", "alpha-bisabolol", "levomenol"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/20359517/"]
  },
  {
    term: "Ocimene",
    slug: "ocimene",
    definition: "Ocimene is a terpene with a sweet, herbaceous, and woody aroma with citrus undertones. It's found in cannabis, mint, parsley, pepper, basil, mangoes, orchids, and kumquats.\n\nOcimene serves as a natural defense mechanism in plants, repelling pests. Research suggests it may have antiviral, antifungal, antibacterial, and anti-inflammatory properties. It's often found in sativa-dominant strains associated with uplifting effects.",
    short_definition: "A sweet, herbaceous terpene with antiviral and antifungal properties.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: ["β-ocimene", "beta-ocimene"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/25456298/"]
  },
  {
    term: "Geraniol",
    slug: "geraniol",
    definition: "Geraniol is a terpene with a sweet, floral aroma reminiscent of roses and geraniums. It's found in cannabis, roses, lemongrass, citronella, and many fruits.\n\nGeraniol is commonly used in perfumes and as a natural mosquito repellent. Research indicates it may have neuroprotective, antioxidant, and anti-inflammatory properties. Some studies suggest potential antitumor effects.",
    short_definition: "A rose-scented terpene with neuroprotective and antioxidant properties.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: ["geranyl alcohol"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/26548500/"]
  },
  {
    term: "Eucalyptol",
    slug: "eucalyptol",
    definition: "Eucalyptol (1,8-cineole) is a cooling, minty terpene that dominates eucalyptus oil and is also found in tea tree, bay leaves, rosemary, and some cannabis strains.\n\nIt's known for its respiratory benefits, acting as an expectorant and bronchodilator. Research shows eucalyptol has anti-inflammatory, antibacterial, and analgesic properties. It can cross the blood-brain barrier and may support cognitive function.",
    short_definition: "A cooling, minty terpene with respiratory benefits and cognitive support.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: ["1,8-cineole", "cineole"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/23878109/"]
  },
  {
    term: "Camphene",
    slug: "camphene",
    definition: "Camphene is a terpene with a pungent, earthy aroma with hints of fir needles. It's found in cannabis, cypress oil, camphor oil, and various conifers.\n\nHistorically used as lamp fuel before petroleum, camphene now shows promise for cardiovascular health. Research indicates it may help lower cholesterol and triglycerides. It also exhibits antibacterial and antifungal properties.",
    short_definition: "An earthy, fir-scented terpene that may support cardiovascular health.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: [],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/21854221/"]
  },
  {
    term: "Borneol",
    slug: "borneol",
    definition: "Borneol is a terpene with a minty, camphor-like aroma found in cannabis, rosemary, mint, and camphor. It has been used in traditional Chinese medicine for centuries.\n\nBorneol is notable for its ability to enhance the absorption of other compounds across the blood-brain barrier. Research suggests it may have analgesic, anti-inflammatory, and neuroprotective effects. It's being studied for potential use in drug delivery systems.",
    short_definition: "A minty terpene that enhances compound absorption across the blood-brain barrier.",
    category: "terpenes",
    difficulty: "advanced",
    synonyms: ["d-borneol", "l-borneol"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/23402829/"]
  },
  {
    term: "Valencene",
    slug: "valencene",
    definition: "Valencene is a citrusy terpene named after Valencia oranges, where it's most abundant. It's also found in cannabis, grapefruits, tangerines, and certain herbs.\n\nValencene has a sweet, fresh citrus aroma that contributes to uplifting effects. Research suggests it may have anti-inflammatory, anti-allergic, and skin-protective properties. It's also being studied as a natural insect repellent.",
    short_definition: "A sweet citrus terpene with anti-inflammatory and skin-protective properties.",
    category: "terpenes",
    difficulty: "intermediate",
    synonyms: [],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/26617548/"]
  },
  {
    term: "Nerolidol",
    slug: "nerolidol",
    definition: "Nerolidol is a terpene with a woody, floral aroma with hints of citrus and rose. It's found in cannabis, jasmine, tea tree, lemongrass, and ginger.\n\nNerolidol is particularly notable for its ability to enhance skin penetration, making it valuable in transdermal applications. Research indicates sedative, anti-parasitic, antifungal, and anticancer properties. It may enhance the effectiveness of certain medications.",
    short_definition: "A woody-floral terpene that enhances skin penetration for topical applications.",
    category: "terpenes",
    difficulty: "advanced",
    synonyms: ["trans-nerolidol", "peruviol"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/27435786/"]
  },

  // MEDICAL/SCIENTIFIC TERMS (14 new)
  {
    term: "CB1 Receptor",
    slug: "cb1-receptor",
    definition: "CB1 receptors are cannabinoid receptors primarily located in the brain and central nervous system, with some presence in peripheral tissues. They are the most abundant G protein-coupled receptors in the brain.\n\nWhen THC binds to CB1 receptors, it produces psychoactive effects including euphoria, altered perception, and memory changes. CBD does not directly bind to CB1 but can modulate its activity. CB1 receptors play crucial roles in pain modulation, appetite regulation, mood, and memory.",
    short_definition: "Brain-based cannabinoid receptors responsible for THC's psychoactive effects.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["cannabinoid receptor type 1", "CNR1"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/16596789/"]
  },
  {
    term: "CB2 Receptor",
    slug: "cb2-receptor",
    definition: "CB2 receptors are cannabinoid receptors primarily found in immune cells, the peripheral nervous system, and the gastrointestinal system, with lower expression in the brain.\n\nUnlike CB1, activation of CB2 receptors does not produce psychoactive effects. CB2 is crucial for immune function and inflammation regulation. Many therapeutic benefits of cannabinoids, including anti-inflammatory and pain-relieving effects, are mediated through CB2 receptors.",
    short_definition: "Immune system cannabinoid receptors involved in inflammation and pain regulation.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["cannabinoid receptor type 2", "CNR2"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/23237593/"]
  },
  {
    term: "Anandamide",
    slug: "anandamide",
    definition: "Anandamide (AEA) is an endogenous cannabinoid (endocannabinoid) produced naturally by the human body. Its name derives from 'ananda,' the Sanskrit word for bliss.\n\nAnandamide binds to CB1 and CB2 receptors, playing roles in mood regulation, pain perception, appetite, and memory. It's broken down by the enzyme FAAH. Higher anandamide levels are associated with reduced anxiety and improved mood. Exercise can increase anandamide levels, contributing to 'runner's high.'",
    short_definition: "The 'bliss molecule' - an endocannabinoid naturally produced by the body.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["AEA", "N-arachidonoylethanolamine", "bliss molecule"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/19839937/"]
  },
  {
    term: "2-AG",
    slug: "2-ag",
    definition: "2-Arachidonoylglycerol (2-AG) is the most abundant endocannabinoid in the body, found at higher concentrations than anandamide. It acts as a full agonist at both CB1 and CB2 receptors.\n\n2-AG plays crucial roles in immune function, pain modulation, emotional responses, and neuroprotection. It's synthesized on-demand from membrane lipids and broken down by the enzyme MAGL. Research suggests 2-AG is particularly important for synaptic plasticity and learning.",
    short_definition: "The body's most abundant endocannabinoid, crucial for pain and immune regulation.",
    category: "medical",
    difficulty: "advanced",
    synonyms: ["2-arachidonoylglycerol"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/16596789/"]
  },
  {
    term: "Homeostasis",
    slug: "homeostasis",
    definition: "Homeostasis refers to the body's ability to maintain stable internal conditions despite external changes. The endocannabinoid system (ECS) is a key regulator of homeostasis.\n\nThe ECS helps maintain balance in processes including temperature regulation, sleep-wake cycles, appetite, mood, immune response, and pain perception. When systems become imbalanced, the ECS works to restore equilibrium. This is why cannabinoids can have such wide-ranging effects on health.",
    short_definition: "The body's self-regulating balance system, significantly influenced by the ECS.",
    category: "medical",
    difficulty: "beginner",
    synonyms: ["biological balance", "internal equilibrium"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/26485449/"]
  },
  {
    term: "Pharmacokinetics",
    slug: "pharmacokinetics",
    definition: "Pharmacokinetics describes what the body does to a drug - how it's absorbed, distributed, metabolized, and eliminated. Understanding CBD pharmacokinetics helps optimize dosing.\n\nKey pharmacokinetic factors for CBD include: absorption rate (varies by route - sublingual, oral, inhaled), distribution to tissues, metabolism by liver enzymes (primarily CYP450), and elimination half-life (typically 1-2 days). Food, especially fatty foods, significantly increases CBD absorption.",
    short_definition: "How the body processes CBD - absorption, distribution, metabolism, and elimination.",
    category: "medical",
    difficulty: "advanced",
    synonyms: ["PK", "drug kinetics"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/28861514/"]
  },
  {
    term: "Pharmacodynamics",
    slug: "pharmacodynamics",
    definition: "Pharmacodynamics describes what a drug does to the body - its mechanisms of action and effects. For cannabinoids, this includes receptor binding, enzyme inhibition, and downstream effects.\n\nCBD's pharmacodynamics include: modulation of serotonin receptors (anxiolytic effects), TRPV1 activation (pain modulation), adenosine reuptake inhibition (anti-inflammatory), GPR55 antagonism, and allosteric modulation of opioid receptors. Understanding pharmacodynamics explains why CBD has such diverse therapeutic applications.",
    short_definition: "How CBD affects the body - mechanisms of action and therapeutic effects.",
    category: "medical",
    difficulty: "advanced",
    synonyms: ["PD", "drug dynamics"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/32322673/"]
  },
  {
    term: "Blood-Brain Barrier",
    slug: "blood-brain-barrier",
    definition: "The blood-brain barrier (BBB) is a selective membrane that separates circulating blood from brain tissue, protecting the brain from pathogens and toxins while allowing essential nutrients to pass.\n\nCannabinoids can cross the BBB due to their lipophilic nature. This is crucial for CBD's potential neurological effects, including neuroprotection, anxiety reduction, and seizure control. Some terpenes like borneol may enhance BBB penetration of other compounds.",
    short_definition: "Protective brain membrane that cannabinoids can cross due to their fat-soluble nature.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["BBB"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/30993303/"]
  },
  {
    term: "Receptor Agonist",
    slug: "receptor-agonist",
    definition: "An agonist is a substance that binds to a receptor and activates it, triggering a biological response. The degree of activation determines if it's a full or partial agonist.\n\nTHC is a partial agonist at CB1 receptors, producing psychoactive effects. 2-AG is a full agonist at both CB1 and CB2. Understanding agonism helps explain why different cannabinoids have different effects and potencies.",
    short_definition: "A substance that activates a receptor to produce a biological response.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["agonistic"],
    sources: []
  },
  {
    term: "Receptor Antagonist",
    slug: "receptor-antagonist",
    definition: "An antagonist is a substance that binds to a receptor but does not activate it, instead blocking the receptor and preventing other substances from binding.\n\nCBD acts as an antagonist at GPR55 and may have antagonistic effects at CB1 at high concentrations. THCV acts as a CB1 antagonist at low doses. Understanding antagonism explains how some cannabinoids can counteract effects of others.",
    short_definition: "A substance that blocks a receptor, preventing activation by other compounds.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["antagonistic", "blocker"],
    sources: []
  },
  {
    term: "Lipophilic",
    slug: "lipophilic",
    definition: "Lipophilic means 'fat-loving' - substances that dissolve in fats and oils rather than water. Cannabinoids are highly lipophilic, which affects their absorption, distribution, and storage.\n\nBecause cannabinoids are lipophilic, they: are best absorbed with fatty foods, can cross cell membranes easily, accumulate in fatty tissues, have longer elimination times, and require oil-based carriers for optimal bioavailability. This is why CBD is often formulated with MCT oil or other carrier oils.",
    short_definition: "Fat-soluble property of cannabinoids affecting absorption and storage in the body.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["fat-soluble", "lipid-soluble"],
    sources: []
  },
  {
    term: "Hydrophobic",
    slug: "hydrophobic",
    definition: "Hydrophobic means 'water-fearing' - substances that repel water and don't dissolve in it. Cannabinoids are hydrophobic, which presents challenges for water-based formulations.\n\nThe hydrophobic nature of cannabinoids means: they don't mix with water-based beverages naturally, nanoemulsion technology is needed for water-soluble products, traditional tinctures use alcohol or oil bases, and bioavailability varies significantly by formulation type.",
    short_definition: "Water-repelling property of cannabinoids requiring special formulations for beverages.",
    category: "medical",
    difficulty: "intermediate",
    synonyms: ["water-insoluble"],
    sources: []
  },
  {
    term: "Neurotransmitter",
    slug: "neurotransmitter",
    definition: "Neurotransmitters are chemical messengers that transmit signals between neurons (nerve cells) in the brain and throughout the body. The endocannabinoid system modulates neurotransmitter release.\n\nEndocannabinoids like anandamide and 2-AG act as retrograde neurotransmitters, traveling 'backward' from the receiving neuron to regulate the sending neuron's activity. This unique mechanism allows the ECS to fine-tune neural signaling, affecting mood, pain, memory, and more.",
    short_definition: "Chemical brain messengers regulated by the endocannabinoid system.",
    category: "medical",
    difficulty: "beginner",
    synonyms: ["neural messenger"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/26485449/"]
  },
  {
    term: "Endocannabinoid Deficiency",
    slug: "endocannabinoid-deficiency",
    definition: "Clinical Endocannabinoid Deficiency (CED) is a theory proposing that certain conditions result from inadequate endocannabinoid levels or function. It was first proposed by Dr. Ethan Russo.\n\nConditions potentially linked to CED include migraine, fibromyalgia, irritable bowel syndrome, and other treatment-resistant conditions. The theory suggests supplementing with plant cannabinoids may help restore balance. Research is ongoing to validate this hypothesis.",
    short_definition: "Theory that inadequate endocannabinoid levels may cause certain chronic conditions.",
    category: "medical",
    difficulty: "advanced",
    synonyms: ["CED", "clinical endocannabinoid deficiency"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/24977967/"]
  },

  // PRODUCT TYPES (10 new)
  {
    term: "RSO",
    slug: "rso",
    definition: "Rick Simpson Oil (RSO) is a concentrated, full-spectrum cannabis extract named after its creator. It's made by extracting cannabinoids using a solvent (typically isopropyl alcohol or ethanol), then evaporating the solvent.\n\nRSO is extremely potent and typically contains high levels of THC. It's usually taken orally or applied topically. Rick Simpson popularized it as a cancer treatment, though clinical evidence is limited. Due to high THC content, it's only legal in certain jurisdictions.",
    short_definition: "Highly concentrated full-spectrum cannabis extract, typically high in THC.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["Rick Simpson Oil", "Phoenix Tears"],
    sources: []
  },
  {
    term: "Live Resin",
    slug: "live-resin",
    definition: "Live resin is a cannabis concentrate made from fresh, flash-frozen cannabis plants rather than dried and cured material. This process preserves the full terpene profile.\n\nBy freezing the plant immediately after harvest, live resin retains volatile terpenes and flavonoids that are typically lost during drying. This results in a more aromatic, flavorful product with potentially enhanced entourage effects. Live resin is popular among connoisseurs for its superior flavor profile.",
    short_definition: "Premium concentrate from flash-frozen cannabis preserving full terpene profile.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["fresh frozen extract"],
    sources: []
  },
  {
    term: "Shatter",
    slug: "shatter",
    definition: "Shatter is a cannabis concentrate with a glass-like, brittle texture that 'shatters' when broken. It's one of the purest forms of cannabis extract, typically containing 70-90% cannabinoids.\n\nShatter is made through BHO (butane hash oil) extraction, followed by careful purging and cooling. Its translucent, amber appearance indicates high purity. Shatter is primarily used for dabbing and requires specialized equipment. Due to potency, proper dosing is crucial.",
    short_definition: "Glass-like, highly pure cannabis concentrate that shatters when broken.",
    category: "products",
    difficulty: "intermediate",
    synonyms: [],
    sources: []
  },
  {
    term: "Wax",
    slug: "wax",
    definition: "Cannabis wax is a soft, opaque concentrate with a waxy texture. Like shatter, it's typically made through solvent extraction but with different post-processing that creates its distinctive consistency.\n\nWax is easier to handle than shatter and is popular for dabbing. Variations include crumble (drier texture) and budder (creamy texture). Potency ranges from 60-90% cannabinoids. The opaque appearance results from agitation during processing, which incorporates air and disrupts molecule alignment.",
    short_definition: "Soft, opaque cannabis concentrate with a waxy texture for dabbing.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["cannabis wax", "ear wax"],
    sources: []
  },
  {
    term: "Crumble",
    slug: "crumble",
    definition: "Crumble is a dry, crumbly cannabis concentrate that easily breaks apart. It's made similarly to wax but with lower heat during purging, creating a drier final product.\n\nCrumble's texture makes it easy to handle and dose. It can be sprinkled on flower, used in vaporizers, or dabbed. Potency typically ranges from 60-80% cannabinoids. Some users prefer crumble for its ease of use compared to stickier concentrates.",
    short_definition: "Dry, crumbly cannabis concentrate that's easy to handle and dose.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["honeycomb", "crumble wax"],
    sources: []
  },
  {
    term: "Budder",
    slug: "budder",
    definition: "Budder (or batter) is a cannabis concentrate with a creamy, butter-like consistency. It's made by whipping the extract during processing, incorporating air and creating a smooth texture.\n\nBudder is easy to work with and popular for dabbing. It typically retains more terpenes than shatter due to lower processing temperatures. Potency ranges from 70-90% cannabinoids. The creamy texture makes it ideal for spreading on papers or loading into vaporizers.",
    short_definition: "Creamy, butter-like cannabis concentrate retaining high terpene content.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["batter", "badder"],
    sources: []
  },
  {
    term: "Rosin",
    slug: "rosin",
    definition: "Rosin is a solventless cannabis concentrate made by applying heat and pressure to cannabis flower or hash. No chemical solvents are used, making it popular among health-conscious consumers.\n\nRosin can be made at home using a hair straightener or with commercial rosin presses for better results. It preserves terpenes and produces a clean, flavorful product. Live rosin (from fresh frozen material) is considered premium. Potency typically ranges from 60-80% cannabinoids.",
    short_definition: "Solventless concentrate made with heat and pressure, no chemicals required.",
    category: "products",
    difficulty: "beginner",
    synonyms: ["solventless extract"],
    sources: []
  },
  {
    term: "Hash",
    slug: "hash",
    definition: "Hash (hashish) is one of the oldest cannabis concentrates, made by separating trichomes from plant material and compressing them. Traditional methods include hand-rubbing or dry sifting.\n\nHash varies widely in potency (20-60% THC) and appearance depending on production method and source material. Types include bubble hash (ice water extraction), dry sift, and traditional hand-rolled varieties. Hash can be smoked, vaporized, or used in edibles.",
    short_definition: "Traditional concentrate made from compressed cannabis trichomes.",
    category: "products",
    difficulty: "beginner",
    synonyms: ["hashish"],
    sources: []
  },
  {
    term: "Kief",
    slug: "kief",
    definition: "Kief (also called dry sift or pollen) is the collection of loose trichomes that fall off cannabis flowers. It appears as a fine, powdery, golden-green substance.\n\nKief can be collected using a grinder with a kief catcher or by sifting dried cannabis through fine mesh screens. It's more potent than flower (typically 30-60% cannabinoids) but less concentrated than other extracts. Kief can be sprinkled on flower, pressed into hash, or used in edibles.",
    short_definition: "Fine powder of cannabis trichomes, more potent than flower.",
    category: "products",
    difficulty: "beginner",
    synonyms: ["dry sift", "pollen", "crystal"],
    sources: []
  },
  {
    term: "Nano CBD",
    slug: "nano-cbd",
    definition: "Nano CBD refers to CBD that has been processed using nanotechnology to create extremely small particles (nanometers in size). This increases water solubility and bioavailability.\n\nNanoemulsion technology breaks CBD oil into tiny droplets that mix with water and are absorbed more efficiently by the body. Claims suggest 3-5x better absorption than regular CBD oil. Nano CBD is used in beverages, water-soluble tinctures, and fast-acting products. Effects may onset faster and at lower doses.",
    short_definition: "Ultra-small CBD particles with enhanced water solubility and faster absorption.",
    category: "products",
    difficulty: "intermediate",
    synonyms: ["nanoemulsion CBD", "water-soluble CBD"],
    sources: []
  },

  // CONDITIONS (9 new - Insomnia already exists)
  {
    term: "Fibromyalgia",
    slug: "fibromyalgia",
    definition: "Fibromyalgia is a chronic condition characterized by widespread musculoskeletal pain, fatigue, sleep disturbances, and cognitive difficulties. The exact cause is unknown but involves abnormal pain processing.\n\nResearch suggests CBD may help manage fibromyalgia symptoms through anti-inflammatory effects, pain modulation, and sleep improvement. Some studies indicate endocannabinoid deficiency may play a role in fibromyalgia. Many patients report benefits from full-spectrum cannabis products, though clinical trials are ongoing.",
    short_definition: "Chronic pain condition where CBD may help through anti-inflammatory and sleep effects.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: ["FM", "fibro"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/30585986/"]
  },
  {
    term: "PTSD",
    slug: "ptsd",
    definition: "Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by experiencing or witnessing traumatic events. Symptoms include flashbacks, nightmares, severe anxiety, and intrusive thoughts.\n\nResearch shows promising results for cannabis in PTSD treatment. CBD may reduce anxiety and help process traumatic memories. THC may reduce nightmares. The endocannabinoid system plays a role in fear extinction and memory processing, making it a therapeutic target for PTSD.",
    short_definition: "Trauma-related disorder where cannabinoids may reduce anxiety and nightmares.",
    category: "conditions",
    difficulty: "beginner",
    synonyms: ["post-traumatic stress disorder"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/31165171/"]
  },
  {
    term: "Multiple Sclerosis",
    slug: "multiple-sclerosis",
    definition: "Multiple Sclerosis (MS) is an autoimmune disease where the immune system attacks the protective myelin sheath of nerve fibers, causing communication problems between the brain and body.\n\nSativex (nabiximols), a cannabis-based medication containing THC and CBD, is approved in many countries for MS-related spasticity. Research shows cannabinoids may help with muscle spasms, pain, bladder dysfunction, and sleep problems in MS patients. Neuroprotective properties are also being studied.",
    short_definition: "Autoimmune nerve disease where cannabis-based medications help manage spasticity.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: ["MS"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/24525548/"]
  },
  {
    term: "Crohn's Disease",
    slug: "crohns-disease",
    definition: "Crohn's disease is a chronic inflammatory bowel disease (IBD) affecting the digestive tract, causing symptoms like abdominal pain, severe diarrhea, fatigue, and weight loss.\n\nThe gut contains numerous CB2 receptors, making it a target for cannabinoid therapy. Research suggests CBD may reduce intestinal inflammation and improve gut motility. Some studies show cannabis use leads to reduced need for other medications and fewer surgeries in Crohn's patients. Clinical trials are ongoing.",
    short_definition: "Inflammatory bowel disease where CBD may reduce intestinal inflammation.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: ["Crohn disease", "regional enteritis"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/23648372/"]
  },
  {
    term: "Glaucoma",
    slug: "glaucoma",
    definition: "Glaucoma is a group of eye conditions that damage the optic nerve, often due to elevated intraocular pressure (IOP). It's a leading cause of irreversible blindness.\n\nCannabis was one of the first conditions for which medical marijuana was prescribed, as THC can lower IOP. However, the effect is short-lived (3-4 hours), requiring frequent dosing. Current research focuses on developing cannabinoid-based eye drops for sustained IOP reduction without systemic effects.",
    short_definition: "Eye condition causing nerve damage where THC may temporarily lower eye pressure.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: [],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/6296638/"]
  },
  {
    term: "Arthritis",
    slug: "arthritis",
    definition: "Arthritis encompasses over 100 conditions causing joint inflammation, pain, and stiffness. The most common types are osteoarthritis (wear and tear) and rheumatoid arthritis (autoimmune).\n\nCBD shows promise for arthritis through anti-inflammatory effects and pain modulation. Topical CBD products are popular for localized joint relief. Animal studies show CBD prevents arthritis progression, while patient surveys report significant symptom improvement. Both CB1 and CB2 receptors are found in joint tissues.",
    short_definition: "Joint inflammation conditions where topical and oral CBD may reduce pain.",
    category: "conditions",
    difficulty: "beginner",
    synonyms: ["joint inflammation"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/26517407/"]
  },
  {
    term: "Migraine",
    slug: "migraine",
    definition: "Migraine is a neurological condition characterized by intense, debilitating headaches often accompanied by nausea, vomiting, and sensitivity to light and sound. Episodes can last hours to days.\n\nResearch links migraine to endocannabinoid deficiency. Studies show cannabis users report decreased migraine frequency and intensity. CBD may help through serotonin modulation and anti-inflammatory effects. Some patients use CBD preventatively, while others use it for acute relief.",
    short_definition: "Severe headache disorder potentially linked to endocannabinoid deficiency.",
    category: "conditions",
    difficulty: "beginner",
    synonyms: ["migraine headache"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/27699780/"]
  },
  {
    term: "Neuropathy",
    slug: "neuropathy",
    definition: "Neuropathy (peripheral neuropathy) refers to damage to peripheral nerves, causing weakness, numbness, and pain, typically in the hands and feet. Common causes include diabetes, chemotherapy, and infections.\n\nNeuropathic pain is notoriously difficult to treat with conventional medications. Studies show cannabinoids can significantly reduce neuropathic pain through CB1 and CB2 receptor activation and TRPV1 modulation. Both THC and CBD show efficacy, with many patients preferring balanced ratios.",
    short_definition: "Nerve damage causing pain where cannabinoids show significant relief potential.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: ["peripheral neuropathy", "nerve pain"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/29513392/"]
  },
  {
    term: "Chemotherapy-Induced Nausea",
    slug: "chemotherapy-induced-nausea",
    definition: "Chemotherapy-induced nausea and vomiting (CINV) is one of the most distressing side effects of cancer treatment. It can be acute (within 24 hours) or delayed (days after treatment).\n\nCannabinoids were among the first approved medications for CINV. Dronabinol (synthetic THC) and nabilone are FDA-approved for CINV when other treatments fail. Research shows THC and CBD work through CB1 receptors in the brain's vomiting center. Many cancer patients find cannabis more effective than prescription anti-nausea drugs.",
    short_definition: "Treatment-related nausea where cannabinoids are FDA-approved as antiemetics.",
    category: "conditions",
    difficulty: "intermediate",
    synonyms: ["CINV", "chemo nausea"],
    sources: ["https://pubmed.ncbi.nlm.nih.gov/29165238/"]
  }
];

async function insertTerms() {
  const url = 'https://bvrdryvgqarffgdujmjz.supabase.co/rest/v1/kb_glossary';
  const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

  console.log(`Inserting ${terms.length} new glossary terms...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal,resolution=ignore-duplicates'
    },
    body: JSON.stringify(terms)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error inserting terms:', error);
    process.exit(1);
  }

  console.log(`Successfully inserted ${terms.length} terms!`);

  // Get total count
  const countResponse = await fetch(`${url}?select=id`, {
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer': 'count=exact'
    }
  });

  const countData = await countResponse.json();
  console.log(`Total terms in database: ${countData.length}`);
}

insertTerms().catch(console.error);
