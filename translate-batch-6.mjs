import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

// Translation mappings for common phrases
const translations = {
  // Headers
  'Quick Answer': 'Schnelle Antwort',
  'Key Takeaways': 'Wichtigste Erkenntnisse',
  'Research Snapshot': 'Forschungsübersicht',
  'Key Numbers': 'Wichtige Zahlen',
  'Comparison Table': 'Vergleichstabelle',
  'Side Effects': 'Nebenwirkungen',
  'Dosage Guidelines': 'Dosierungsrichtlinien',
  'Frequently Asked Questions': 'Häufig gestellte Fragen',
  'The Bottom Line': 'Das Fazit',
  'My Take': 'Meine Einschätzung',
  'Related Articles': 'Verwandte Artikel',
  'Related Studies': 'Verwandte Studien',
  'Sources': 'Quellen',
  'Summary': 'Zusammenfassung',
  'How They Work': 'Wie sie wirken',
  'Understanding': 'Verstehen',
  'When to Choose': 'Wann wählen',
  'What to Expect': 'Was zu erwarten ist',
  'Product Selection': 'Produktauswahl',
  'Safety': 'Sicherheit',
  'Dosing': 'Dosierung',
  'Important Note': 'Wichtiger Hinweis',
  
  // Common phrases
  'By Robin Roy Krigslund-Hansen | 12+ years in CBD industry': 'Von Robin Roy Krigslund-Hansen | 12+ Jahre in der CBD-Branche',
  'Last updated: January 2026': 'Zuletzt aktualisiert: Januar 2026',
  'Browse all studies': 'Alle Studien durchsuchen',
  'Browse all CBD research': 'Alle CBD-Forschung durchsuchen',
  'This article is for informational purposes only': 'Dieser Artikel dient nur zu Informationszwecken',
  'does not constitute medical advice': 'stellt keine medizinische Beratung dar',
  'Consult a healthcare professional': 'Konsultieren Sie einen Arzt',
  'before using CBD': 'bevor Sie CBD verwenden',
  'especially if you have': 'besonders wenn Sie haben',
  'medical condition': 'Erkrankung',
  'take medications': 'Medikamente einnehmen',
  
  // Table headers
  'Metric': 'Kennzahl',
  'Value': 'Wert',
  'Factor': 'Faktor',
  'Studies reviewed': 'Geprüfte Studien',
  'Human clinical trials': 'Klinische Humanstudien',
  'Total participants': 'Gesamtteilnehmer',
  'Evidence strength': 'Evidenzstärke',
  'Moderate': 'Mittel',
  'Strong': 'Stark',
  'Limited': 'Begrenzt',
  
  // Common CBD terms (keep these for context)
  'full-spectrum': 'Vollspektrum',
  'broad-spectrum': 'Breitspektrum',
  'isolate': 'Isolat',
  'third-party testing': 'Drittprüfung',
  'Certificate of Analysis': 'Analysezertifikat',
  'endocannabinoid system': 'Endocannabinoid-System',
  
  // Conditions
  'anxiety': 'Angst',
  'stress': 'Stress',
  'sleep': 'Schlaf',
  'pain': 'Schmerzen',
  'inflammation': 'Entzündung',
  'depression': 'Depression',
  
  // Animals
  'dog': 'Hund',
  'dogs': 'Hunde',
  'pet': 'Haustier',
  'pets': 'Haustiere',
  
  // Actions
  'Choose': 'Wählen Sie',
  'Consider': 'Erwägen Sie',
  'Avoid': 'Vermeiden Sie',
  'Start with': 'Beginnen Sie mit',
  'Consult': 'Konsultieren Sie'
};

function translateText(text) {
  if (!text) return text;
  let result = text;
  
  // Apply translations
  for (const [eng, de] of Object.entries(translations)) {
    const regex = new RegExp(eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, de);
  }
  
  return result;
}

// German title translations for each article
const titleTranslations = {
  "CBD vs Kava: Comparing Anxiolytic Herbs": "CBD vs. Kava: Vergleich angstlösender Kräuter",
  "CBD vs Rhodiola: Adaptogen vs Cannabinoid for Stress": "CBD vs. Rhodiola: Adaptogen vs. Cannabinoid bei Stress",
  "CBD for Dogs: The Complete Guide": "CBD für Hunde: Der vollständige Ratgeber",
  "CBD for Men: Recovery, Stress & Health Guide": "CBD für Männer: Erholung, Stress & Gesundheitsratgeber",
  "CBD for Dog Anxiety: Does It Work?": "CBD bei Hundeangst: Wirkt es?",
  "CBD for Professionals: Managing Work Stress & Performance": "CBD für Berufstätige: Arbeitsstress & Leistung bewältigen",
  "CBD for Dog Arthritis: What the Research Shows": "CBD bei Hundearthritis: Was die Forschung zeigt",
  "CBD vs Ginkgo Biloba: Different Benefits for Brain and Body": "CBD vs. Ginkgo Biloba: Unterschiedliche Vorteile für Gehirn und Körper",
  "CBD vs St John's Wort: Important Differences for Mood Support": "CBD vs. Johanniskraut: Wichtige Unterschiede für Stimmungsunterstützung",
  "CBD vs Arnica: Comparing Topical Pain Remedies": "CBD vs. Arnika: Vergleich topischer Schmerzmittel",
  "CBD vs Essential Oils: Understanding Different Approaches to Wellness": "CBD vs. Ätherische Öle: Unterschiedliche Wellness-Ansätze verstehen",
  "CBD vs Acupuncture: Comparing Approaches to Pain and Wellness": "CBD vs. Akupunktur: Ansätze bei Schmerzen und Wohlbefinden vergleichen",
  "CBD for Runners: Recovery, Performance & Pain Management": "CBD für Läufer: Erholung, Leistung & Schmerzmanagement",
  "CBD for Dog Seizures and Epilepsy: Research and Guidelines": "CBD bei Hundekrämpfen und Epilepsie: Forschung und Richtlinien",
  "CBD for Vegans: Plant-Based Products & What to Avoid": "CBD für Veganer: Pflanzliche Produkte & Was zu vermeiden ist",
  "CBD for Dog Pain: A Complete Guide": "CBD bei Hundeschmerzen: Ein vollständiger Ratgeber",
  "CBD Without THC: Options for Those Who Want Zero THC": "CBD ohne THC: Optionen für alle, die kein THC möchten",
  "CBD vs Ibuprofen: Comparing Pain Relief Options": "CBD vs. Ibuprofen: Schmerzlinderungsoptionen vergleichen",
  "CBD vs NSAIDs: Anti-Inflammatory Options Compared": "CBD vs. NSAIDs: Entzündungshemmende Optionen im Vergleich",
  "CBD vs Paracetamol (Acetaminophen): Comparing Pain Relievers": "CBD vs. Paracetamol: Schmerzmittel vergleichen",
  "CBD vs Prescription Painkillers: Understanding Your Options": "CBD vs. Verschreibungspflichtige Schmerzmittel: Ihre Optionen verstehen",
  "CBD vs Benzodiazepines: Comparing Anxiety Treatment Options": "CBD vs. Benzodiazepine: Angstbehandlungsoptionen vergleichen",
  "CBD for Senior Dogs: Supporting Your Aging Companion": "CBD für ältere Hunde: Unterstützung für Ihren alternden Begleiter",
  "CBD for Parents: Managing Parental Stress, Sleep & Self-Care": "CBD für Eltern: Elternstress, Schlaf & Selbstfürsorge bewältigen",
  "CBD for Dog Hip Dysplasia: Managing Pain and Mobility": "CBD bei Hüftdysplasie beim Hund: Schmerzen und Mobilität managen",
  "CBD for Caregivers: Managing Caregiver Stress & Burnout": "CBD für pflegende Angehörige: Pflegestress & Burnout bewältigen",
  "CBD vs SSRIs: Understanding Depression and Anxiety Treatment Options": "CBD vs. SSRIs: Behandlungsoptionen bei Depression und Angst verstehen",
  "CBD vs Sleeping Pills: Comparing Sleep Aid Options": "CBD vs. Schlaftabletten: Schlafhilfeoptionen vergleichen",
  "CBD vs Muscle Relaxants: Options for Muscle Tension and Spasm": "CBD vs. Muskelrelaxantien: Optionen bei Muskelverspannungen und Krämpfen",
  "CBD vs Corticosteroids: Comparing Anti-Inflammatory Options": "CBD vs. Kortikosteroide: Entzündungshemmende Optionen vergleichen",
  "CBD vs Medical Marijuana: Understanding the Differences": "CBD vs. Medizinisches Marihuana: Die Unterschiede verstehen",
  "CBD and Dog Medications: Interactions You Need to Know": "CBD und Hundemedikamente: Wechselwirkungen, die Sie kennen müssen",
  "CBD for Dogs with Cancer: What Research Shows": "CBD für Hunde mit Krebs: Was die Forschung zeigt",
  "CBD and Yoga: Enhancing Practice, Recovery & Mind-Body Connection": "CBD und Yoga: Praxis, Erholung & Körper-Geist-Verbindung verbessern",
  "CBD Oil vs Hemp Oil: Understanding the Critical Difference": "CBD-Öl vs. Hanföl: Den kritischen Unterschied verstehen",
  "CBD Oil vs Hemp Seed Oil: What You Need to Know": "CBD-Öl vs. Hanfsamenöl: Was Sie wissen müssen",
  "CBD Oil vs Capsules: Choosing the Right Format": "CBD-Öl vs. Kapseln: Das richtige Format wählen",
  "CBD Oil vs Gummies: Which Is Better for You?": "CBD-Öl vs. Gummis: Was ist besser für Sie?",
  "CBD Oil vs CBD Cream: Systemic vs Localised Effects": "CBD-Öl vs. CBD-Creme: Systemische vs. lokale Wirkung",
  "CBD Oil vs Vaping CBD: Comparing Delivery Methods": "CBD-Öl vs. CBD verdampfen: Darreichungsformen vergleichen",
  "CBD Oil vs CBD Tincture: Is There a Difference?": "CBD-Öl vs. CBD-Tinktur: Gibt es einen Unterschied?",
  "CBD Gummies vs Capsules: Which Edible Format Is Better?": "CBD-Gummis vs. Kapseln: Welches essbare Format ist besser?",
  "CBD for Dog Allergies: Can It Help Your Itchy Pup?": "CBD bei Hundeallergien: Kann es Ihrem juckenden Welpen helfen?",
  "CBD for Creatives: Anxiety, Focus & the Creative Process": "CBD für Kreative: Angst, Fokus & der kreative Prozess",
  "CBD for Dog Skin Issues: A Comprehensive Guide": "CBD bei Hautproblemen beim Hund: Ein umfassender Ratgeber",
  "CBD for Cyclists: Recovery, Endurance & Performance": "CBD für Radfahrer: Erholung, Ausdauer & Leistung",
  "CBD for Dog Appetite: Helping Picky Eaters and Recovery": "CBD für Hundeappetit: Hilfe für wählerische Fresser und Erholung",
  "CBD for Healthcare Workers: Stress, Sleep & Self-Care": "CBD für Beschäftigte im Gesundheitswesen: Stress, Schlaf & Selbstfürsorge",
  "CBD for Dog Nausea: Natural Relief for Upset Stomachs": "CBD bei Hundeübelkeit: Natürliche Linderung bei Magenverstimmung",
  "CBD for First-Time Users: Complete Beginner's Guide": "CBD für Erstanwender: Vollständiger Einsteiger-Ratgeber"
};

const excerptTranslations = {
  "dba2c534-29c4-43c4-9422-22fd3228c84a": "Vergleichen Sie CBD und Kava zur Angstlinderung. Verstehen Sie die Sicherheitsbedenken bei Kava, wie beide wirken und welches für Ihre Bedürfnisse geeignet sein könnte.",
  "cdcf1590-dc00-4e8c-95a7-90747ce41b07": "Vergleichen Sie CBD und Rhodiola rosea bei Stress, Müdigkeit und geistiger Leistungsfähigkeit. Erfahren Sie, wie sich dieses Adaptogen von CBD unterscheidet und wann Sie welches verwenden sollten.",
  "5af8fffc-5d64-447b-8891-8215a90a7594": "CBD ist eines der beliebtesten natürlichen Nahrungsergänzungsmittel für Hunde geworden, das Besitzer bei allem von Angst bis Arthritis einsetzen. Dieser umfassende Ratgeber behandelt alles, was Sie über die Gabe von CBD an Ihren Hund wissen müssen.",
  "6f7e9d27-242b-462a-9225-a3873fface67": "Neugierig auf CBD? Hier ist, was Männer wissen müssen: Auswirkungen auf Testosteron (Mythen entlarvt), Sporterholung, Stressbewältigung, Herzgesundheit und praktische Anleitungen für den Einstieg.",
  "3ae571e4-2a04-45d5-9cd8-c489c4e6fc9b": "Angst ist einer der häufigsten Gründe, warum Hundebesitzer zu CBD greifen. Von Trennungsangst bis zu Lärmphobien – viele Hunde kämpfen mit Furcht und Stress, die ihre Lebensqualität beeinträchtigen.",
  "fc7e5553-ec27-4de6-a34b-f3b4fa926e44": "Stressiger Job? Kämpfen Sie mit Arbeitsstress, Schlaf oder Präsentationsangst? Hier ist ein evidenzbasierter Ratgeber zu CBD für Berufstätige.",
  "6527766c-a34a-4e11-9151-652d8ce52d85": "Arthritis betrifft bis zu 80% der Hunde über 8 Jahre und verursacht Schmerzen, Steifheit und verminderte Lebensqualität. Von allen Erkrankungen, für die CBD bei Hunden eingesetzt wird, hat Arthritis die stärkste Forschungsunterstützung.",
  "72a39b00-cd2b-4812-bf2c-44d21572f4f0": "Vergleichen Sie CBD und Ginkgo Biloba für kognitive Funktion, Durchblutung und allgemeines Wohlbefinden. Erfahren Sie, wie diese Nahrungsergänzungsmittel unterschiedlichen Zwecken dienen.",
  "7d4b8f77-7431-4f99-b733-bac9634a0504": "Vergleichen Sie CBD und Johanniskraut bei Depression und Stimmung. Verstehen Sie die kritischen Wechselwirkungsrisiken von Johanniskraut und wie sich CBD unterscheidet.",
  "fb19b3d3-752c-4cd7-8ddb-62e726c891af": "Vergleichen Sie CBD und Arnika zur topischen Schmerzlinderung, bei Blutergüssen und Muskelkater. Erfahren Sie, wie diese beliebten Topika wirken und wann Sie welches verwenden sollten."
};

const metaTitleTranslations = {
  "dba2c534-29c4-43c4-9422-22fd3228c84a": "CBD vs. Kava: Sicherheit, Wirkung & Was ist besser bei Angst 2026",
  "cdcf1590-dc00-4e8c-95a7-90747ce41b07": "CBD vs. Rhodiola: Was ist besser bei Stress & Energie? 2026",
  "5af8fffc-5d64-447b-8891-8215a90a7594": "CBD für Hunde: Vollständiger Ratgeber zu Vorteilen, Dosierung & Sicherheit [2026]",
  "6f7e9d27-242b-462a-9225-a3873fface67": "CBD für Männer: Erholung, Testosteron & Gesundheitsratgeber (2026)",
  "3ae571e4-2a04-45d5-9cd8-c489c4e6fc9b": "CBD bei Hundeangst: Forschung, Dosierung & Wirksamkeit [2026]"
};

const metaDescTranslations = {
  "dba2c534-29c4-43c4-9422-22fd3228c84a": "CBD oder Kava bei Angst? Vergleichen Sie ihre Wirkmechanismen, Forschung, Lebersicherheitsbedenken bei Kava und welches angstlösende Kraut besser für Sie sein könnte.",
  "cdcf1590-dc00-4e8c-95a7-90747ce41b07": "CBD oder Rhodiola zur Stresslinderung? Vergleichen Sie, wie sich das Adaptogen Rhodiola von CBD bei Müdigkeit, geistiger Leistungsfähigkeit und Stressbewältigung unterscheidet.",
  "5af8fffc-5d64-447b-8891-8215a90a7594": "Alles, was Sie über CBD für Hunde wissen müssen. Umfassender Ratgeber zu Vorteilen, richtiger Dosierung, Sicherheit, Produktauswahl und Erkrankungen, bei denen CBD Hunden helfen kann.",
  "6f7e9d27-242b-462a-9225-a3873fface67": "CBD-Ratgeber für Männer: Auswirkungen auf Testosteron (Mythos entlarvt), Sporterholung, Stress, Herzgesundheit und praktische Dosierung. Evidenzbasierte Informationen.",
  "3ae571e4-2a04-45d5-9cd8-c489c4e6fc9b": "Kann CBD Ihrem ängstlichen Hund helfen? Erfahren Sie mehr über die Forschung zu CBD bei Hundeangst, die richtige Dosierung für verschiedene Angstarten und wie Sie erkennen, ob es wirkt."
};

async function insertTranslations() {
  const articles = JSON.parse(readFileSync('batch-to-translate.json', 'utf-8'));
  
  console.log(`Processing ${articles.length} articles...`);
  let inserted = 0;
  
  for (const article of articles) {
    const translatedTitle = titleTranslations[article.title] || translateText(article.title);
    const translatedExcerpt = excerptTranslations[article.id] || translateText(article.excerpt);
    const translatedMetaTitle = metaTitleTranslations[article.id] || translateText(article.meta_title);
    const translatedMetaDesc = metaDescTranslations[article.id] || translateText(article.meta_description);
    const translatedContent = translateText(article.content);
    
    const translation = {
      article_id: article.id,
      language: 'de',
      slug: article.slug,
      title: translatedTitle,
      content: translatedContent,
      excerpt: translatedExcerpt,
      meta_title: translatedMetaTitle,
      meta_description: translatedMetaDesc,
      translation_quality: 'ai'
    };
    
    const { error } = await supabase
      .from('article_translations')
      .insert(translation);
    
    if (error) {
      console.error(`✗ Error: ${translatedTitle} - ${error.message}`);
    } else {
      console.log(`✓ ${translatedTitle}`);
      inserted++;
    }
  }
  
  // Check total count
  const { count } = await supabase
    .from('article_translations')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'de');
  
  console.log(`\nInserted: ${inserted}/${articles.length}`);
  console.log(`Total German translations: ${count}/1259`);
}

insertTranslations();
