const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const terms = [
  // MISSING CANNABINOIDS
  {
    term: "Delta-8 THC",
    display_name: "Δ8-THC (Delta-8-Tetrahydrocannabinol)",
    slug: "delta-8-thc",
    category: "cannabinoids",
    short_definition: "A mildly psychoactive cannabinoid similar to Delta-9 THC but with reduced potency and different legal status.",
    definition: "Delta-8-Tetrahydrocannabinol (Δ8-THC) is a naturally occurring cannabinoid found in trace amounts in cannabis plants. It's chemically similar to Delta-9 THC but with the double bond on the 8th carbon instead of the 9th.\n\nDelta-8 produces milder psychoactive effects than Delta-9 THC, often described as a clearer, less anxious high. It binds to CB1 receptors with lower affinity, resulting in reduced potency. Many users report it provides relaxation and mild euphoria without the intense effects of traditional THC.\n\nDelta-8 exists in a legal gray area in many jurisdictions, as it can be derived from hemp-derived CBD through chemical conversion.",
    synonyms: ["Δ8-THC", "D8", "Delta-8", "Delta 8"]
  },
  {
    term: "CBDV",
    display_name: "CBDV (Cannabidivarin)",
    slug: "cbdv",
    category: "cannabinoids",
    short_definition: "A non-psychoactive cannabinoid similar to CBD, being researched for potential anti-nausea and anti-epileptic properties.",
    definition: "Cannabidivarin (CBDV) is a non-psychoactive cannabinoid found in cannabis plants, particularly in indica strains from Asia and Africa. It's structurally similar to CBD but with a shortened side chain.\n\nCBDV is being actively researched for its potential therapeutic benefits, particularly for nausea, seizure disorders, and autism spectrum disorder. Early studies suggest it may have anticonvulsant properties similar to CBD.\n\nLike CBD, CBDV does not produce intoxicating effects and may help modulate the effects of THC when present together in full-spectrum products.",
    synonyms: ["Cannabidivarin", "GWP42006"]
  },

  // MISSING PRODUCTS
  {
    term: "RSO",
    display_name: "RSO (Rick Simpson Oil)",
    slug: "rso",
    category: "products",
    short_definition: "A highly concentrated, full-spectrum cannabis extract named after its creator, typically containing high levels of THC.",
    definition: "Rick Simpson Oil (RSO) is a concentrated cannabis extract created by Rick Simpson, a Canadian medical marijuana activist. It's made using a solvent extraction process that produces a thick, tar-like oil containing high concentrations of cannabinoids.\n\nRSO typically contains very high levels of THC (often 60-90%) along with other cannabinoids, terpenes, and plant compounds. It's usually consumed orally or applied topically, not smoked or vaporized.\n\nThe oil gained popularity after Rick Simpson claimed it helped treat his skin cancer. While anecdotal reports exist, clinical research on RSO specifically is limited. It's important to note that RSO is highly potent and should be used with caution.",
    synonyms: ["Rick Simpson Oil", "Phoenix Tears", "FECO"]
  },

  // TERPENES (15)
  {
    term: "Myrcene",
    display_name: "Myrcene",
    slug: "myrcene",
    category: "terpenes",
    short_definition: "The most abundant terpene in cannabis with an earthy, musky aroma, known for its sedative and relaxing properties.",
    definition: "Myrcene is the most prevalent terpene found in cannabis, often comprising more than 50% of a strain's terpene profile. It has an earthy, musky scent with hints of cloves and fruit, similar to hops.\n\nMyrcene is associated with the sedating, relaxing effects often attributed to indica strains. Research suggests it may enhance THC's psychoactive effects by increasing cell membrane permeability, allowing cannabinoids to cross the blood-brain barrier more easily.\n\nBeyond cannabis, myrcene is found in mangoes, lemongrass, thyme, and hops. It's being studied for potential anti-inflammatory, analgesic, and muscle-relaxant properties.",
    synonyms: ["β-Myrcene", "Beta-Myrcene"]
  },
  {
    term: "Limonene",
    display_name: "Limonene",
    slug: "limonene",
    category: "terpenes",
    short_definition: "A citrus-scented terpene associated with mood elevation, stress relief, and potential anti-anxiety effects.",
    definition: "Limonene is a terpene with a bright, citrusy aroma reminiscent of lemons and oranges. It's the second most common terpene in nature and frequently found in cannabis strains with uplifting effects.\n\nResearch suggests limonene may have mood-enhancing and anti-anxiety properties. It's been studied for potential anti-cancer, anti-inflammatory, and antifungal effects. Limonene may also improve absorption of other compounds through the skin and digestive tract.\n\nStrains high in limonene are often associated with energetic, uplifting effects. It's also found in citrus fruit peels, juniper, and peppermint.",
    synonyms: ["D-Limonene", "Dipentene"]
  },
  {
    term: "Pinene",
    display_name: "α-Pinene (Alpha-Pinene)",
    slug: "pinene",
    category: "terpenes",
    short_definition: "A pine-scented terpene with potential bronchodilator and anti-inflammatory properties, may counteract some THC effects.",
    definition: "Pinene is a terpene with a distinctive pine and fir needle aroma. It exists in two forms: alpha-pinene (α-pinene) and beta-pinene (β-pinene), with alpha being more common in cannabis.\n\nPinene is notable for its potential to counteract some of THC's cognitive effects, particularly short-term memory impairment. It acts as a bronchodilator, potentially helping to open airways, and has demonstrated anti-inflammatory and antimicrobial properties.\n\nAs the most common terpene in nature, pinene is abundant in pine trees, rosemary, basil, and dill. Cannabis strains high in pinene are often associated with alertness and mental clarity.",
    synonyms: ["α-Pinene", "Alpha-Pinene", "Beta-Pinene", "β-Pinene"]
  },
  {
    term: "Linalool",
    display_name: "Linalool",
    slug: "linalool",
    category: "terpenes",
    short_definition: "A floral, lavender-scented terpene known for its calming, anti-anxiety, and potential sedative effects.",
    definition: "Linalool is a terpene with a floral, lavender-like scent with subtle spicy notes. It's one of the most widely used terpenes in aromatherapy and is a key component of lavender essential oil.\n\nResearch indicates linalool may have significant anxiolytic (anti-anxiety), sedative, and anti-inflammatory properties. It's been studied for potential anticonvulsant effects and may help modulate the nervous system's response to stress.\n\nIn cannabis, linalool contributes to the calming effects of certain strains. It's also found in lavender, mint, cinnamon, and coriander. Linalool may enhance the sedative qualities of THC while reducing anxiety.",
    synonyms: ["Linalyl alcohol", "β-Linalool"]
  },
  {
    term: "Caryophyllene",
    display_name: "β-Caryophyllene (Beta-Caryophyllene)",
    slug: "caryophyllene",
    category: "terpenes",
    short_definition: "A spicy, peppery terpene unique for directly binding to CB2 receptors, offering potential anti-inflammatory benefits.",
    definition: "Beta-caryophyllene (β-caryophyllene) is a terpene with a spicy, peppery, woody aroma. It's unique among terpenes because it can directly bind to CB2 cannabinoid receptors, technically making it a dietary cannabinoid.\n\nDue to its CB2 receptor activity, caryophyllene shows promise for anti-inflammatory, analgesic, and neuroprotective applications without psychoactive effects. Research suggests it may help with anxiety, depression, and chronic pain.\n\nCaryophyllene is found in black pepper, cloves, cinnamon, and hops. It's the only terpene known to directly interact with the endocannabinoid system, enhancing the therapeutic potential of cannabis.",
    synonyms: ["β-Caryophyllene", "Beta-Caryophyllene", "BCP"]
  },
  {
    term: "Humulene",
    display_name: "α-Humulene (Alpha-Humulene)",
    slug: "humulene",
    category: "terpenes",
    short_definition: "An earthy, woody terpene found in hops and cannabis, studied for appetite-suppressing and anti-inflammatory effects.",
    definition: "Humulene (α-humulene) is a terpene with an earthy, woody, and slightly spicy aroma. It's a major component of hops, giving beer its distinctive bitter taste, and is found in many cannabis strains.\n\nUnlike many cannabinoids that stimulate appetite, humulene has been studied for potential appetite-suppressing effects. It also shows promise as an anti-inflammatory, antibacterial, and anti-tumor agent in preclinical research.\n\nHumulene works synergistically with other terpenes and cannabinoids. It's also found in sage, ginger, and ginseng. Strains high in humulene may be beneficial for those seeking therapeutic benefits without increased appetite.",
    synonyms: ["α-Humulene", "Alpha-Humulene", "α-Caryophyllene"]
  },
  {
    term: "Terpinolene",
    display_name: "Terpinolene",
    slug: "terpinolene",
    category: "terpenes",
    short_definition: "A complex terpene with floral, herbal, and piney notes, associated with uplifting effects and found in many sativa strains.",
    definition: "Terpinolene is a terpene with a complex aroma profile featuring floral, herbal, piney, and slightly citrusy notes. While not typically dominant, it's present in many cannabis strains, particularly sativas.\n\nResearch suggests terpinolene may have sedative effects at high concentrations, though it's generally associated with uplifting, creative strains. It has demonstrated antioxidant, antibacterial, and potential anticancer properties in preliminary studies.\n\nTerpinolene is found in apples, cumin, lilacs, and tea tree. It's commonly used in soaps and perfumes. Strains like Jack Herer and Ghost Train Haze are known for notable terpinolene content.",
    synonyms: ["α-Terpinolene", "Delta-Terpinene"]
  },
  {
    term: "Bisabolol",
    display_name: "α-Bisabolol (Alpha-Bisabolol)",
    slug: "bisabolol",
    category: "terpenes",
    short_definition: "A floral, honey-scented terpene from chamomile with anti-inflammatory and skin-healing properties.",
    definition: "Alpha-bisabolol (α-bisabolol) is a terpene with a subtle, sweet, floral aroma reminiscent of chamomile and honey. It's a primary component of chamomile essential oil and is found in various cannabis strains.\n\nBisabolol is well-known for its skin-healing properties and is widely used in cosmetics. Research indicates it has anti-inflammatory, antimicrobial, and antioxidant effects. It may enhance the absorption of other compounds through the skin.\n\nIn cannabis, bisabolol contributes to gentle, calming effects. It's considered very gentle and is often used in products for sensitive skin. Its anti-inflammatory properties may complement the therapeutic effects of cannabinoids.",
    synonyms: ["α-Bisabolol", "Alpha-Bisabolol", "Levomenol"]
  },
  {
    term: "Ocimene",
    display_name: "Ocimene",
    slug: "ocimene",
    category: "terpenes",
    short_definition: "A sweet, herbaceous terpene with woody undertones, known for antifungal and decongestant properties.",
    definition: "Ocimene is a terpene with a sweet, herbaceous, and woody aroma with citrus undertones. It's found in various cannabis strains and is common in plants as a natural defense against pests.\n\nResearch suggests ocimene has antiviral, antifungal, and antibacterial properties. It may also act as a decongestant and have anti-inflammatory effects. Ocimene is often found in strains with uplifting, energetic profiles.\n\nBeyond cannabis, ocimene is found in mint, parsley, pepper, basil, mangoes, and orchids. Its pleasant aroma makes it popular in perfumery. It contributes to the fresh, green characteristics of many sativa-dominant strains.",
    synonyms: ["β-Ocimene", "Beta-Ocimene"]
  },
  {
    term: "Geraniol",
    display_name: "Geraniol",
    slug: "geraniol",
    category: "terpenes",
    short_definition: "A rose-scented terpene with neuroprotective properties, commonly used in aromatherapy and natural insect repellents.",
    definition: "Geraniol is a terpene with a sweet, floral aroma reminiscent of roses and geraniums. It's widely used in perfumery and as a natural flavoring agent, and appears in various cannabis strains.\n\nResearch indicates geraniol may have neuroprotective, antioxidant, and anti-inflammatory properties. It's being studied for potential anticancer effects and shows promise in preclinical models. Geraniol is also an effective natural insect repellent.\n\nIn cannabis, geraniol contributes to floral, sweet aromatic profiles. It's found in roses, lemongrass, and citronella. Strains containing geraniol may offer particularly pleasant aromas along with potential therapeutic benefits.",
    synonyms: ["Geranyl alcohol", "Lemonol"]
  },
  {
    term: "Eucalyptol",
    display_name: "Eucalyptol (1,8-Cineole)",
    slug: "eucalyptol",
    category: "terpenes",
    short_definition: "A cooling, minty terpene found in eucalyptus with respiratory and cognitive benefits.",
    definition: "Eucalyptol (also known as 1,8-cineole) is a terpene with a fresh, minty, cooling aroma characteristic of eucalyptus. It's found in small amounts in some cannabis strains and is the primary component of eucalyptus oil.\n\nResearch shows eucalyptol has significant respiratory benefits, acting as an expectorant and bronchodilator. It may also have cognitive-enhancing effects, improving attention and memory. Anti-inflammatory and antibacterial properties have been documented.\n\nEucalyptol is used in many over-the-counter products like cough drops and mouthwashes. In cannabis, it contributes to refreshing, clear-headed effects. It's also found in rosemary, bay leaves, and tea tree.",
    synonyms: ["1,8-Cineole", "Cineole", "Cajeputol"]
  },
  {
    term: "Camphene",
    display_name: "Camphene",
    slug: "camphene",
    category: "terpenes",
    short_definition: "An earthy, woody terpene with potential cardiovascular benefits and cholesterol-lowering properties.",
    definition: "Camphene is a terpene with an earthy, woody aroma with hints of fir needles and damp forests. It's found in various cannabis strains and has a scent profile similar to myrcene but more pungent.\n\nResearch suggests camphene may have cardiovascular benefits, potentially lowering cholesterol and triglyceride levels. It also shows promise as an antioxidant and has demonstrated pain-relieving and anti-inflammatory properties in studies.\n\nCamphene is found in cypress, camphor, nutmeg, and bergamot. Historically, it was used as lamp fuel before the discovery of petroleum. In cannabis, it contributes to herbal, forest-like aromatic profiles.",
    synonyms: ["2,2-Dimethyl-3-methylenenorbornane"]
  },
  {
    term: "Borneol",
    display_name: "Borneol",
    slug: "borneol",
    category: "terpenes",
    short_definition: "A minty, camphor-like terpene used in traditional Chinese medicine with potential analgesic effects.",
    definition: "Borneol is a terpene with a minty, camphor-like aroma with herbal undertones. It has been used in traditional Chinese medicine for centuries and appears in some cannabis strains.\n\nResearch indicates borneol may have analgesic, anti-inflammatory, and neuroprotective properties. It's been studied for its ability to enhance the absorption and effectiveness of other compounds. Traditional uses include treating pain, inflammation, and digestive issues.\n\nBorneol is found in camphor, rosemary, and mint. It's used in insect repellents and as a component in traditional medicine formulations. In cannabis, it contributes to herbal, medicinal aromatic qualities.",
    synonyms: ["Isoborneol", "Bornyl alcohol"]
  },
  {
    term: "Valencene",
    display_name: "Valencene",
    slug: "valencene",
    category: "terpenes",
    short_definition: "A citrusy terpene named after Valencia oranges with anti-inflammatory and insect-repelling properties.",
    definition: "Valencene is a terpene with a sweet, citrusy aroma reminiscent of Valencia oranges. It's relatively rare in cannabis but appears in certain strains, contributing to their fruity profiles.\n\nResearch suggests valencene may have anti-inflammatory and antiallergic properties. It's being studied for potential skin-protective effects and has shown promise as a natural insect repellent. Valencene may also have bronchodilator properties.\n\nNamed after the Valencia orange, valencene is primarily found in citrus fruits. It's used in flavoring and fragrance industries. Cannabis strains containing valencene often have bright, uplifting citrus aromas.",
    synonyms: ["D-Valencene"]
  },
  {
    term: "Nerolidol",
    display_name: "Nerolidol",
    slug: "nerolidol",
    category: "terpenes",
    short_definition: "A woody, floral terpene with sedative properties and potential antiparasitic and antifungal effects.",
    definition: "Nerolidol is a terpene with a complex woody, floral aroma with hints of citrus and fresh bark. It exists in two forms (cis and trans) and is found in various cannabis strains, particularly those with relaxing effects.\n\nResearch indicates nerolidol may have sedative, antifungal, antiparasitic, and antimicrobial properties. It's being studied for its ability to enhance skin penetration of other compounds, making it potentially valuable in transdermal applications.\n\nNerolidol is found in jasmine, tea tree, lemongrass, and ginger. It's used in perfumery and cosmetics. In cannabis, it contributes to relaxing, calming effects and pleasant floral notes.",
    synonyms: ["Peruviol", "Trans-Nerolidol"]
  },

  // MEDICAL/SCIENTIFIC TERMS (15)
  {
    term: "Endocannabinoid System",
    display_name: "Endocannabinoid System (ECS)",
    slug: "endocannabinoid-system",
    category: "medical",
    short_definition: "A biological system of receptors and endocannabinoids that regulates homeostasis throughout the body.",
    definition: "The Endocannabinoid System (ECS) is a complex cell-signaling system discovered in the early 1990s. It plays a crucial role in regulating a wide range of physiological processes including mood, appetite, sleep, pain, immune function, and memory.\n\nThe ECS consists of three main components: endocannabinoids (cannabinoids produced by the body like anandamide and 2-AG), cannabinoid receptors (CB1 and CB2), and enzymes that break down endocannabinoids.\n\nCannabinoids from cannabis interact with this system, which explains why they can affect so many different bodily functions. Understanding the ECS is key to understanding how CBD, THC, and other cannabinoids produce their effects.",
    synonyms: ["ECS", "Endocannabinoid Signaling System"]
  },
  {
    term: "CB1 Receptor",
    display_name: "CB1 Receptor",
    slug: "cb1-receptor",
    category: "medical",
    short_definition: "A cannabinoid receptor primarily found in the brain and central nervous system, responsible for psychoactive effects.",
    definition: "The CB1 receptor (Cannabinoid Receptor Type 1) is one of two primary cannabinoid receptors in the endocannabinoid system. It's predominantly found in the brain and central nervous system, though it also exists in peripheral tissues.\n\nCB1 receptors are responsible for the psychoactive effects of THC, which binds directly to these receptors. They help regulate pain perception, mood, appetite, memory, and motor control. Activation of CB1 receptors produces the characteristic 'high' associated with cannabis.\n\nCBD does not bind directly to CB1 receptors but may modulate their activity indirectly. Understanding CB1 receptors is essential for developing cannabinoid-based medicines with targeted effects.",
    synonyms: ["CNR1", "Cannabinoid Receptor 1"]
  },
  {
    term: "CB2 Receptor",
    display_name: "CB2 Receptor",
    slug: "cb2-receptor",
    category: "medical",
    short_definition: "A cannabinoid receptor primarily found in immune cells and peripheral tissues, involved in inflammation and immune response.",
    definition: "The CB2 receptor (Cannabinoid Receptor Type 2) is the second major cannabinoid receptor in the endocannabinoid system. It's primarily found in immune cells, the spleen, and peripheral tissues, with lower concentrations in the brain.\n\nCB2 receptors play a key role in regulating inflammation and immune function. Unlike CB1, activation of CB2 receptors does not produce psychoactive effects, making them an attractive target for therapeutic applications.\n\nCBD has a stronger affinity for CB2 receptors than CB1, which may explain some of its anti-inflammatory effects. Beta-caryophyllene, a terpene, also directly activates CB2 receptors.",
    synonyms: ["CNR2", "Cannabinoid Receptor 2"]
  },
  {
    term: "Anandamide",
    display_name: "Anandamide (AEA)",
    slug: "anandamide",
    category: "medical",
    short_definition: "The first discovered endocannabinoid, often called the 'bliss molecule,' involved in mood, pain, and appetite regulation.",
    definition: "Anandamide (N-arachidonoylethanolamine or AEA) is an endogenous cannabinoid neurotransmitter, meaning it's produced naturally by the body. Its name comes from the Sanskrit word 'ananda,' meaning bliss or joy.\n\nAnandamide binds primarily to CB1 receptors and plays roles in regulating mood, memory, pain perception, appetite, and even fertility. It's often called the 'bliss molecule' due to its effects on happiness and mental wellness.\n\nTHC mimics anandamide's effects by binding to the same receptors. CBD may increase anandamide levels by inhibiting the enzyme (FAAH) that breaks it down, potentially contributing to its therapeutic effects.",
    synonyms: ["AEA", "N-arachidonoylethanolamine", "Bliss Molecule"]
  },
  {
    term: "2-AG",
    display_name: "2-AG (2-Arachidonoylglycerol)",
    slug: "2-ag",
    category: "medical",
    short_definition: "The most abundant endocannabinoid in the body, involved in immune function, pain modulation, and appetite.",
    definition: "2-Arachidonoylglycerol (2-AG) is an endocannabinoid produced naturally in the body and is the most abundant endocannabinoid present. It was discovered in 1995, a few years after anandamide.\n\n2-AG binds to both CB1 and CB2 receptors and plays important roles in cardiovascular health, immune function, pain sensation, and neuroprotection. It's involved in both the central and peripheral nervous systems.\n\nUnlike anandamide, 2-AG is a full agonist at both cannabinoid receptors, meaning it fully activates them. Understanding 2-AG helps researchers develop more targeted cannabinoid therapies.",
    synonyms: ["2-Arachidonoylglycerol", "2-Arachidonyl Glycerol"]
  },
  {
    term: "Homeostasis",
    display_name: "Homeostasis",
    slug: "homeostasis",
    category: "medical",
    short_definition: "The body's ability to maintain stable internal conditions; the primary function that the endocannabinoid system helps regulate.",
    definition: "Homeostasis refers to the body's ability to maintain stable internal conditions despite changes in the external environment. It's the biological process of self-regulation that keeps things like body temperature, blood sugar, and pH levels within optimal ranges.\n\nThe endocannabinoid system plays a crucial role in maintaining homeostasis throughout the body. When systems become unbalanced, the ECS works to restore equilibrium. This is why cannabinoids can affect so many different conditions.\n\nUnderstanding homeostasis helps explain why CBD and other cannabinoids may help with diverse issues—they support the body's natural balancing mechanisms rather than targeting a single condition.",
    synonyms: ["Biological Equilibrium", "Internal Balance"]
  },
  {
    term: "Pharmacokinetics",
    display_name: "Pharmacokinetics",
    slug: "pharmacokinetics",
    category: "medical",
    short_definition: "The study of how the body absorbs, distributes, metabolizes, and eliminates drugs—crucial for CBD dosing.",
    definition: "Pharmacokinetics is the branch of pharmacology concerned with how the body processes substances over time. It encompasses four main processes: absorption, distribution, metabolism, and excretion (ADME).\n\nFor cannabinoids like CBD, pharmacokinetics explains why different consumption methods produce different effects. Oral CBD has lower bioavailability due to first-pass metabolism, while sublingual or inhaled methods bypass this process.\n\nUnderstanding pharmacokinetics helps optimize CBD dosing and timing. Factors like food intake, individual metabolism, and product formulation all affect how cannabinoids are processed in the body.",
    synonyms: ["PK", "ADME", "Drug Kinetics"]
  },
  {
    term: "Pharmacodynamics",
    display_name: "Pharmacodynamics",
    slug: "pharmacodynamics",
    category: "medical",
    short_definition: "The study of how drugs affect the body, including their mechanisms of action at the cellular level.",
    definition: "Pharmacodynamics is the study of how drugs affect the body—essentially the opposite of pharmacokinetics (how the body affects drugs). It examines the biochemical and physiological effects of substances and their mechanisms of action.\n\nFor cannabinoids, pharmacodynamics explains how CBD and THC interact with receptors, enzymes, and other molecular targets to produce their effects. CBD's pharmacodynamics are complex, involving multiple receptors beyond just CB1 and CB2.\n\nUnderstanding pharmacodynamics helps predict drug interactions and therapeutic effects. It explains why CBD can reduce anxiety (serotonin receptor activity) while also reducing inflammation (CB2 and other pathways).",
    synonyms: ["PD", "Drug Dynamics"]
  },
  {
    term: "First-pass Metabolism",
    display_name: "First-pass Metabolism",
    slug: "first-pass-metabolism",
    category: "medical",
    short_definition: "The liver's processing of orally consumed substances before they reach circulation, reducing bioavailability of CBD.",
    definition: "First-pass metabolism (or first-pass effect) refers to the phenomenon where drugs absorbed from the gastrointestinal tract are metabolized by the liver before reaching systemic circulation. This significantly reduces the amount of active drug available.\n\nFor CBD taken orally, first-pass metabolism can reduce bioavailability to as low as 6-15%. The liver converts much of the CBD to metabolites before it can produce effects. This is why oral CBD often requires higher doses.\n\nAlternative methods like sublingual administration, vaping, or transdermal patches bypass first-pass metabolism, allowing more cannabinoid to reach the bloodstream. Taking CBD with fatty foods can also improve oral absorption.",
    synonyms: ["First-pass Effect", "Presystemic Metabolism", "Hepatic First Pass"]
  },
  {
    term: "Blood-brain Barrier",
    display_name: "Blood-brain Barrier (BBB)",
    slug: "blood-brain-barrier",
    category: "medical",
    short_definition: "A selective membrane that protects the brain by controlling which substances can pass from blood into brain tissue.",
    definition: "The blood-brain barrier (BBB) is a highly selective semipermeable membrane that separates circulating blood from the brain and central nervous system. It protects the brain from pathogens, toxins, and many drugs while allowing essential nutrients to pass.\n\nCannabinoids can cross the blood-brain barrier due to their lipophilic (fat-loving) nature. THC readily crosses the BBB, which is why it produces psychoactive effects. CBD also crosses, though it doesn't produce intoxication.\n\nThe ability to cross the BBB is important for treating neurological conditions. Some terpenes like myrcene may enhance cannabinoid transport across the BBB, potentially increasing their effectiveness for brain-related conditions.",
    synonyms: ["BBB", "Brain-blood Barrier"]
  },
  {
    term: "Receptor Agonist",
    display_name: "Receptor Agonist",
    slug: "receptor-agonist",
    category: "medical",
    short_definition: "A substance that activates a receptor to produce a biological response—like THC activating CB1 receptors.",
    definition: "A receptor agonist is a substance that binds to a receptor and activates it, triggering a biological response. Agonists mimic the action of naturally occurring compounds that normally activate the receptor.\n\nTHC is a partial agonist at CB1 and CB2 receptors—it activates them but not to the full extent possible. This explains why THC produces effects similar to endocannabinoids like anandamide but with different intensity and duration.\n\nUnderstanding agonism helps explain drug effects and interactions. Full agonists produce maximum receptor activation, while partial agonists produce sub-maximal responses even at high concentrations.",
    synonyms: ["Agonist", "Receptor Activator"]
  },
  {
    term: "Receptor Antagonist",
    display_name: "Receptor Antagonist",
    slug: "receptor-antagonist",
    category: "medical",
    short_definition: "A substance that blocks a receptor, preventing activation—CBD can act as an antagonist at certain receptors.",
    definition: "A receptor antagonist is a substance that binds to a receptor but does not activate it. Instead, it blocks the receptor and prevents agonists from binding and producing their effects.\n\nCBD acts as an antagonist at GPR55 (sometimes called the 'third cannabinoid receptor') and may have antagonist properties at other receptors. This blocking action contributes to some of CBD's effects, including its ability to reduce certain actions of THC.\n\nAntagonists are important in medicine for blocking unwanted effects. The drug rimonabant was a CB1 antagonist developed for weight loss but withdrawn due to psychiatric side effects, illustrating the importance of the ECS for mental health.",
    synonyms: ["Antagonist", "Receptor Blocker"]
  },
  {
    term: "Lipophilic",
    display_name: "Lipophilic",
    slug: "lipophilic",
    category: "medical",
    short_definition: "Fat-loving or fat-soluble—a key property of cannabinoids that affects their absorption and storage in the body.",
    definition: "Lipophilic means 'fat-loving' and describes substances that dissolve in fats, oils, and lipids rather than water. Cannabinoids including CBD and THC are highly lipophilic compounds.\n\nThis lipophilic nature has several important implications: cannabinoids are better absorbed when taken with fatty foods, they can cross the blood-brain barrier easily, and they accumulate in fatty tissues throughout the body.\n\nThe lipophilic property of cannabinoids explains why they can be detected in the body for extended periods—they're stored in fat cells and released slowly. It also explains why oil-based CBD products are common and why water-soluble CBD formulations require special processing.",
    synonyms: ["Fat-soluble", "Hydrophobic", "Lipophilicity"]
  },
  {
    term: "Neurotransmitter",
    display_name: "Neurotransmitter",
    slug: "neurotransmitter",
    category: "medical",
    short_definition: "Chemical messengers that transmit signals between nerve cells; endocannabinoids function as neurotransmitters.",
    definition: "Neurotransmitters are chemical messengers that carry signals between neurons (nerve cells) across synapses. They're essential for virtually all brain functions including mood, cognition, movement, and pain perception.\n\nEndocannabinoids like anandamide and 2-AG are neurotransmitters that work somewhat differently from classical ones—they're produced on demand and work backward (retrograde signaling), regulating the release of other neurotransmitters.\n\nCannabinoids affect multiple neurotransmitter systems. CBD influences serotonin receptors (affecting mood), dopamine (affecting reward), and GABA (affecting anxiety). This multi-target action explains its broad range of potential effects.",
    synonyms: ["Chemical Messenger", "Neural Transmitter"]
  },
  {
    term: "Half-life",
    display_name: "Half-life",
    slug: "half-life",
    category: "medical",
    short_definition: "The time required for half of a substance to be eliminated from the body—important for CBD dosing schedules.",
    definition: "Half-life is the time required for the concentration of a substance in the body to decrease by half. It's a key pharmacokinetic parameter that helps determine dosing frequency and duration of effects.\n\nCBD's half-life varies based on consumption method and individual factors. Oral CBD typically has a half-life of 2-5 days, while inhaled CBD has a shorter half-life of about 31 hours. This means oral CBD stays in the system longer.\n\nUnderstanding half-life helps optimize CBD dosing schedules. Substances with longer half-lives can be taken less frequently, while those with shorter half-lives may require multiple daily doses for consistent effects.",
    synonyms: ["t½", "Elimination Half-life", "Biological Half-life"]
  },

  // PRODUCTS (10)
  {
    term: "Live Resin",
    display_name: "Live Resin",
    slug: "live-resin",
    category: "products",
    short_definition: "A cannabis concentrate made from fresh-frozen plants, preserving the full terpene and cannabinoid profile.",
    definition: "Live resin is a type of cannabis concentrate made from fresh cannabis plants that are flash-frozen immediately after harvest rather than dried and cured. This process preserves the plant's original terpene and cannabinoid profile.\n\nThe result is a highly aromatic concentrate with flavors and effects closer to the living plant. Live resin typically has a saucey, crystalline consistency and retains terpenes that would otherwise be lost during drying.\n\nLive resin is prized by connoisseurs for its superior flavor and more complete entourage effect. It's typically consumed via dabbing or vaporization and represents a premium segment of the concentrate market.",
    synonyms: ["Fresh Frozen Extract", "Live Extract"]
  },
  {
    term: "Distillate",
    display_name: "Distillate",
    slug: "distillate",
    category: "products",
    short_definition: "A highly refined cannabis extract containing isolated cannabinoids, typically 85-95% pure THC or CBD.",
    definition: "Distillate is a highly purified cannabis extract produced through a process called distillation. The result is a translucent oil that's typically 85-95% pure cannabinoid content (usually THC or CBD).\n\nThe distillation process removes almost all plant materials, waxes, terpenes, and other compounds, leaving nearly pure cannabinoid. Because terpenes are removed, distillate is often described as lacking the flavor and entourage effect of full-spectrum products.\n\nDistillate is versatile and can be consumed directly, added to edibles, or used in vape cartridges. Terpenes are sometimes re-added for flavor. It's valued for its purity and precise dosing potential.",
    synonyms: ["Cannabis Distillate", "THC Distillate", "CBD Distillate"]
  },
  {
    term: "Shatter",
    display_name: "Shatter",
    slug: "shatter",
    category: "products",
    short_definition: "A glass-like cannabis concentrate with a hard, brittle texture that 'shatters' when broken.",
    definition: "Shatter is a cannabis concentrate with a hard, glass-like texture that breaks or 'shatters' when handled. It's one of the most recognizable concentrate types due to its translucent, amber appearance.\n\nShatter is made through solvent-based extraction (typically butane or CO2) followed by a purging process that removes residual solvents. Its rigid texture results from minimal agitation during production, which keeps the molecules aligned.\n\nShatter typically contains 70-90% cannabinoids. It's consumed via dabbing or vaporization. While visually striking, it offers no significant advantage over other concentrates—texture differences are primarily aesthetic.",
    synonyms: ["BHO Shatter", "Glass"]
  },
  {
    term: "Wax",
    display_name: "Wax",
    slug: "wax",
    category: "products",
    short_definition: "A soft, opaque cannabis concentrate with a waxy texture, easier to handle than shatter.",
    definition: "Wax is a cannabis concentrate with a soft, opaque, waxy consistency. It's made through similar extraction processes as shatter but with agitation that whips air into the extract, creating its distinctive texture.\n\nThe texture of wax makes it easier to handle than shatter—it can be scooped onto a dab tool without breaking. Wax typically contains 60-80% cannabinoids and comes in varieties like crumble, budder, and honeycomb.\n\nWax is consumed via dabbing or can be added to flower in a joint or bowl. Its accessibility and ease of use make it popular among both new and experienced concentrate users.",
    synonyms: ["Cannabis Wax", "Ear Wax"]
  },
  {
    term: "Crumble",
    display_name: "Crumble",
    slug: "crumble",
    category: "products",
    short_definition: "A dry, crumbly cannabis concentrate with a honeycomb-like texture, easy to portion and handle.",
    definition: "Crumble is a cannabis concentrate with a dry, crumbly texture similar to feta cheese or honeycomb. It's a type of wax that has been processed to achieve a more brittle, easily breakable consistency.\n\nThe crumbly texture results from purging at lower temperatures over longer periods or from specific whipping techniques during extraction. This makes crumble easy to portion and handle without sticky tools.\n\nCrumble typically contains 60-90% cannabinoids. It's versatile—suitable for dabbing, vaporizing, or sprinkling on top of flower. Its ease of handling makes it popular for adding to joints or bowls.",
    synonyms: ["Honeycomb", "Crumble Wax"]
  },
  {
    term: "Budder",
    display_name: "Budder",
    slug: "budder",
    category: "products",
    short_definition: "A creamy, butter-like cannabis concentrate known for its smooth texture and terpene preservation.",
    definition: "Budder (or badder) is a cannabis concentrate with a smooth, creamy consistency similar to butter or thick cake batter. It's made by whipping the extract during the purging process.\n\nThe whipping process that creates budder's texture also helps preserve terpenes, often resulting in more flavorful concentrates. Budder typically contains 70-90% cannabinoids while maintaining a good terpene profile.\n\nBudder's consistency makes it easy to scoop and handle, falling between the stickiness of wax and the dryness of crumble. It's popular for dabbing and is often considered a good balance of potency and flavor.",
    synonyms: ["Badder", "Batter", "Cake Batter"]
  },
  {
    term: "Rosin",
    display_name: "Rosin",
    slug: "rosin",
    category: "products",
    short_definition: "A solventless cannabis concentrate made using heat and pressure, valued for its purity and safety.",
    definition: "Rosin is a solventless cannabis concentrate made by applying heat and pressure to cannabis flower or hash. This simple process squeezes out the plant's oils without using any chemical solvents.\n\nBecause no solvents are involved, rosin is considered one of the cleanest, safest concentrates available. It retains a full spectrum of cannabinoids and terpenes, providing excellent flavor and entourage effect.\n\nRosin can be made at home with a hair straightener and parchment paper, though commercial producers use specialized rosin presses. It typically contains 60-80% cannabinoids and commands premium prices for its purity.",
    synonyms: ["Solventless Hash Oil", "SHO", "Flower Rosin", "Hash Rosin"]
  },
  {
    term: "Hash",
    display_name: "Hash (Hashish)",
    slug: "hash",
    category: "products",
    short_definition: "A traditional cannabis concentrate made by collecting and pressing trichomes (resin glands) from the plant.",
    definition: "Hash (hashish) is one of the oldest cannabis concentrates, made by collecting the resin glands (trichomes) from cannabis flowers and pressing them into a solid mass. Traditional hash production dates back thousands of years.\n\nThere are many hash-making methods including dry sifting, ice water extraction (bubble hash), and hand-rolling (charas). Quality hash typically contains 40-60% cannabinoids—less than modern concentrates but with a full-spectrum profile.\n\nHash can be smoked, vaporized, or added to edibles. It produces effects often described as more rounded and body-focused than flower. Traditional hash remains popular alongside modern concentrates.",
    synonyms: ["Hashish", "Charas", "Bubble Hash", "Ice Hash"]
  },
  {
    term: "Kief",
    display_name: "Kief",
    slug: "kief",
    category: "products",
    short_definition: "The loose trichomes (resin glands) collected from cannabis flowers, a powdery precursor to hash.",
    definition: "Kief refers to the loose trichomes that fall off cannabis flowers during handling, grinding, or processing. These tiny, crystal-like particles contain high concentrations of cannabinoids and terpenes.\n\nKief is the simplest form of cannabis concentrate and the precursor to hash. It's typically collected in the bottom chamber of grinders or through dry sifting screens. Quality kief ranges from 40-70% cannabinoids.\n\nKief can be sprinkled on top of flower to increase potency, pressed into hash, or used in edibles. It's an accessible introduction to concentrates since it doesn't require special equipment to produce or consume.",
    synonyms: ["Dry Sift", "Pollen", "Crystal"]
  },
  {
    term: "Dab",
    display_name: "Dab",
    slug: "dab",
    category: "products",
    short_definition: "A method of consuming cannabis concentrates by vaporizing them on a heated surface.",
    definition: "Dabbing is a method of consuming cannabis concentrates by vaporizing them on a heated surface, typically a 'nail' or 'banger' attached to a specialized water pipe called a 'dab rig.' The term 'dab' refers to both the method and the dose of concentrate used.\n\nDabbing produces intense effects quickly because concentrates are much more potent than flower. A single dab might contain as much THC as an entire joint. The vapor is smoother than smoke but effects are stronger.\n\nDab rigs can be traditional glass pieces with torches or electronic 'e-rigs' with precise temperature control. Temperature affects flavor and harshness—lower temps preserve terpenes while higher temps produce bigger clouds.",
    synonyms: ["Dabbing", "Dab Hit"]
  },

  // CONDITIONS (10)
  {
    term: "Fibromyalgia",
    display_name: "Fibromyalgia",
    slug: "fibromyalgia",
    category: "conditions",
    short_definition: "A chronic pain condition characterized by widespread musculoskeletal pain, fatigue, and cognitive difficulties.",
    definition: "Fibromyalgia is a chronic condition characterized by widespread musculoskeletal pain, fatigue, sleep disturbances, and cognitive difficulties often called 'fibro fog.' It affects an estimated 2-4% of the population, predominantly women.\n\nThe exact cause is unknown, but fibromyalgia is believed to involve abnormal pain processing in the nervous system. Some researchers have proposed that endocannabinoid deficiency may play a role in the condition.\n\nCannabis and CBD are increasingly used by fibromyalgia patients for symptom management. Studies suggest cannabinoids may help with pain, sleep, and overall quality of life, though more research is needed. Many patients report significant relief with cannabis therapy.",
    synonyms: ["FMS", "Fibro", "Fibromyalgia Syndrome"]
  },
  {
    term: "PTSD",
    display_name: "PTSD (Post-Traumatic Stress Disorder)",
    slug: "ptsd",
    category: "conditions",
    short_definition: "A mental health condition triggered by traumatic events, characterized by flashbacks, anxiety, and sleep disturbances.",
    definition: "Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by experiencing or witnessing traumatic events. Symptoms include flashbacks, nightmares, severe anxiety, hypervigilance, and avoidance behaviors.\n\nResearch suggests the endocannabinoid system plays a role in fear and memory processing. People with PTSD often have lower levels of anandamide. This has led to interest in cannabinoid therapies for PTSD.\n\nCannabis is increasingly used by PTSD patients, particularly veterans. CBD may help with anxiety and sleep, while THC may reduce nightmares. Several US states have approved PTSD as a qualifying condition for medical cannabis programs.",
    synonyms: ["Post-Traumatic Stress Disorder", "Post-Traumatic Stress"]
  },
  {
    term: "Multiple Sclerosis",
    display_name: "Multiple Sclerosis (MS)",
    slug: "multiple-sclerosis",
    category: "conditions",
    short_definition: "An autoimmune disease affecting the central nervous system, causing muscle spasticity, pain, and mobility issues.",
    definition: "Multiple Sclerosis (MS) is a chronic autoimmune disease where the immune system attacks the protective covering of nerve fibers (myelin) in the central nervous system. This disrupts communication between the brain and body.\n\nSymptoms include muscle spasticity, pain, fatigue, mobility issues, and cognitive problems. MS affects about 2.8 million people worldwide and has no cure, though treatments can manage symptoms and slow progression.\n\nSativex (nabiximols), a cannabis-derived medication containing THC and CBD, is approved in many countries for MS-related spasticity. Many MS patients use cannabis to manage symptoms, with studies supporting benefits for spasticity and pain.",
    synonyms: ["MS", "Disseminated Sclerosis"]
  },
  {
    term: "Crohn's Disease",
    display_name: "Crohn's Disease",
    slug: "crohns-disease",
    category: "conditions",
    short_definition: "An inflammatory bowel disease causing chronic inflammation of the digestive tract with pain and digestive symptoms.",
    definition: "Crohn's disease is a type of inflammatory bowel disease (IBD) that causes chronic inflammation of the digestive tract. It can affect any part of the GI tract but most commonly affects the small intestine and colon.\n\nSymptoms include abdominal pain, severe diarrhea, fatigue, weight loss, and malnutrition. Crohn's has no cure and typically requires lifelong management with periods of remission and flares.\n\nThe gut contains many cannabinoid receptors, making it a target for cannabinoid therapy. Studies suggest cannabis may help reduce inflammation, relieve pain, and improve appetite in Crohn's patients. CBD's anti-inflammatory properties may be particularly beneficial.",
    synonyms: ["Crohn Disease", "Regional Enteritis", "IBD"]
  },
  {
    term: "Glaucoma",
    display_name: "Glaucoma",
    slug: "glaucoma",
    category: "conditions",
    short_definition: "An eye condition involving elevated pressure that can damage the optic nerve and cause vision loss.",
    definition: "Glaucoma is a group of eye conditions that damage the optic nerve, often due to abnormally high intraocular pressure (IOP). It's one of the leading causes of blindness worldwide, particularly in people over 60.\n\nCannabis was one of the first medical conditions to receive attention for cannabis therapy in the 1970s when studies showed THC could reduce eye pressure. However, the effect is short-lived (3-4 hours), requiring frequent dosing.\n\nWhile cannabis can lower IOP, most ophthalmologists don't recommend it as a primary treatment due to its short duration of action. Current glaucoma treatments (eye drops, surgery) are generally more effective. Research continues on cannabinoid-based eye drops.",
    synonyms: ["Ocular Hypertension", "Open-angle Glaucoma"]
  },
  {
    term: "Rheumatoid Arthritis",
    display_name: "Rheumatoid Arthritis",
    slug: "rheumatoid-arthritis",
    category: "conditions",
    short_definition: "An autoimmune disease causing chronic joint inflammation, pain, and potential joint damage.",
    definition: "Rheumatoid arthritis (RA) is a chronic autoimmune disease where the immune system mistakenly attacks the joints, causing inflammation, pain, swelling, and potentially permanent joint damage. Unlike osteoarthritis, it's not caused by wear and tear.\n\nRA affects about 1% of the population and is more common in women. It typically affects joints symmetrically (both hands, both knees) and can also affect other body systems including skin, eyes, and lungs.\n\nCannabinoids show promise for RA due to their anti-inflammatory and immunomodulatory properties. CB2 receptors are found in high concentrations in joint tissue. CBD in particular is being researched for its ability to reduce inflammation without psychoactive effects.",
    synonyms: ["RA", "Inflammatory Arthritis"]
  },
  {
    term: "Migraine",
    display_name: "Migraine",
    slug: "migraine",
    category: "conditions",
    short_definition: "A neurological condition causing intense, recurring headaches often accompanied by nausea and light sensitivity.",
    definition: "Migraine is a neurological condition characterized by intense, recurring headaches often affecting one side of the head. Attacks can last 4-72 hours and are frequently accompanied by nausea, vomiting, and extreme sensitivity to light and sound.\n\nMigraines affect about 12% of the population and are three times more common in women. Some researchers believe migraine may be linked to endocannabinoid deficiency, as the ECS helps regulate pain and inflammation.\n\nMany migraine sufferers use cannabis for prevention and acute treatment. Studies suggest cannabinoids may reduce migraine frequency and intensity. Both THC and CBD may be helpful, with CBD potentially preventing migraines and THC providing acute relief.",
    synonyms: ["Migraine Headache", "Vascular Headache"]
  },
  {
    term: "Neuropathy",
    display_name: "Neuropathy",
    slug: "neuropathy",
    category: "conditions",
    short_definition: "Nerve damage causing pain, numbness, and tingling, often in the hands and feet.",
    definition: "Neuropathy (peripheral neuropathy) refers to damage or dysfunction of peripheral nerves, causing symptoms like pain, numbness, tingling, and weakness, typically in the hands and feet. It affects an estimated 20 million Americans.\n\nCauses include diabetes (most common), chemotherapy, infections, autoimmune diseases, and alcoholism. Neuropathic pain is often difficult to treat with conventional painkillers.\n\nCannabinoids are considered promising for neuropathic pain. Multiple clinical trials have shown cannabis can significantly reduce neuropathic pain where other treatments fail. The endocannabinoid system's role in pain modulation makes cannabinoids well-suited for this condition.",
    synonyms: ["Peripheral Neuropathy", "Nerve Damage", "Neuropathic Pain"]
  },
  {
    term: "Insomnia",
    display_name: "Insomnia",
    slug: "insomnia",
    category: "conditions",
    short_definition: "A sleep disorder characterized by difficulty falling asleep, staying asleep, or getting restful sleep.",
    definition: "Insomnia is a common sleep disorder characterized by difficulty falling asleep, staying asleep, or waking too early and not being able to get back to sleep. It can be acute (short-term) or chronic (long-term) and significantly impacts quality of life.\n\nAn estimated 30% of adults experience insomnia symptoms, with 10% having chronic insomnia. Causes include stress, anxiety, depression, medical conditions, medications, and poor sleep habits.\n\nCannabis has long been used as a sleep aid. THC may help people fall asleep faster, while CBD may improve sleep quality and reduce anxiety that interferes with sleep. CBN is also being studied for sedative properties. Many people prefer cannabis to pharmaceutical sleep aids due to fewer side effects.",
    synonyms: ["Sleeplessness", "Sleep Disorder"]
  },
  {
    term: "CINV",
    display_name: "CINV (Chemotherapy-Induced Nausea)",
    slug: "cinv",
    category: "conditions",
    short_definition: "Severe nausea and vomiting caused by chemotherapy treatment, often inadequately controlled by standard medications.",
    definition: "Chemotherapy-Induced Nausea and Vomiting (CINV) is a common and debilitating side effect of cancer chemotherapy. Despite advances in anti-nausea medications, many patients still experience significant nausea that affects their ability to continue treatment.\n\nCINV can be acute (within 24 hours of treatment), delayed (24+ hours after), or anticipatory (before treatment due to previous experiences). It significantly impacts patients' quality of life and can lead to treatment discontinuation.\n\nCannabinoids were among the first FDA-approved uses for cannabis medicines. Dronabinol (synthetic THC) and nabilone are approved for CINV. Many patients find whole-plant cannabis more effective than pharmaceutical cannabinoids for managing their symptoms.",
    synonyms: ["Chemotherapy-Induced Nausea and Vomiting", "Chemo Nausea"]
  }
];

async function addTerms() {
  console.log(`Adding ${terms.length} glossary terms...\n`);

  // First check which terms already exist
  const response = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=slug`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const existingTerms = await response.json();
  const existingSlugs = new Set(existingTerms.map(t => t.slug));

  let added = 0;
  let skipped = 0;

  for (const term of terms) {
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
      sources: term.sources || [],
      related_terms: [],
      related_research: [],
      is_active: true
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
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/kb_glossary?select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const allTerms = await countResponse.json();

  console.log(`\n=== Summary ===`);
  console.log(`Added: ${added}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Total terms in database: ${allTerms.length}`);
}

addTerms().catch(console.error);
