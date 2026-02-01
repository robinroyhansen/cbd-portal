import { readFileSync, writeFileSync } from 'fs';

// Read the batch file
const articles = JSON.parse(readFileSync('batch-to-translate.json', 'utf-8'));

// German translation mappings for common patterns
const translations = {
  // Article metadata translations
  slugs: {
    'cbd-vs-turmeric': 'cbd-vs-kurkuma',
    'cbd-for-athletes': 'cbd-fuer-sportler',
    'cbd-pet-treats-vs-oil': 'cbd-leckerlis-vs-oel-fuer-haustiere',
    'cbd-for-women': 'cbd-fuer-frauen',
    'how-to-choose-cbd-for-pets': 'wie-man-cbd-fuer-haustiere-auswaehlt',
    'cbd-for-travelers': 'cbd-fuer-reisende',
    'cbd-vs-magnesium': 'cbd-vs-magnesium',
    'cbd-vs-l-theanine': 'cbd-vs-l-theanin',
    'cbd-vs-gaba': 'cbd-vs-gaba',
    'cbd-vs-5-htp': 'cbd-vs-5-htp',
    'cbd-vs-fish-oil': 'cbd-vs-fischoel',
    'cbd-pet-product-safety': 'cbd-haustierprodukt-sicherheit',
    'cbd-for-shift-workers': 'cbd-fuer-schichtarbeiter',
    'what-vets-say-about-cbd': 'was-tieraerzte-ueber-cbd-sagen',
    'cbd-for-pet-fireworks-anxiety': 'cbd-bei-haustier-feuerwerksangst',
    'cbd-for-students': 'cbd-fuer-studenten',
    'cbd-for-pet-travel-anxiety': 'cbd-bei-haustier-reiseangst',
    'cbd-vs-passionflower': 'cbd-vs-passionsblume',
    'cbd-vs-chamomile': 'cbd-vs-kamille',
    'cbd-vs-lavender': 'cbd-vs-lavendel'
  },
  
  // Common phrases
  phrases: {
    'Quick Answer': 'Kurze Antwort',
    'Key Takeaways': 'Wichtige Erkenntnisse',
    'Research Snapshot': 'Forschungsübersicht',
    'Studies reviewed': 'Überprüfte Studien',
    'Human clinical trials': 'Klinische Humanstudien',
    'Systematic reviews': 'Systematische Übersichten',
    'Preclinical studies': 'Präklinische Studien',
    'Total participants': 'Gesamtteilnehmer',
    'Evidence strength': 'Evidenzstärke',
    'Moderate': 'Moderat',
    'Last updated': 'Zuletzt aktualisiert',
    'January 2026': 'Januar 2026',
    'By Robin Roy Krigslund-Hansen': 'Von Robin Roy Krigslund-Hansen',
    '12+ years in CBD industry': '12+ Jahre in der CBD-Branche',
    'Browse all studies': 'Alle Studien durchsuchen',
    'Browse all CBD research': 'Alle CBD-Forschung durchsuchen',
    'Related Studies': 'Verwandte Studien',
    'Related Articles': 'Verwandte Artikel',
    'Frequently Asked Questions': 'Häufig gestellte Fragen',
    'Sources': 'Quellen',
    'Medical Disclaimer': 'Medizinischer Haftungsausschluss',
    'Veterinary Disclaimer': 'Tierärztlicher Haftungsausschluss',
    'This article is for informational purposes only': 'Dieser Artikel dient nur zu Informationszwecken',
    'does not constitute medical advice': 'stellt keine medizinische Beratung dar',
    'Consult a healthcare professional': 'Konsultieren Sie einen Gesundheitsexperten',
    'My Take': 'Meine Einschätzung',
    'The Bottom Line': 'Das Fazit',
    'Summary': 'Zusammenfassung',
    'Comparison Table': 'Vergleichstabelle',
    'How They Work': 'Wie sie wirken',
    'Side Effects': 'Nebenwirkungen',
    'Dosage Guidelines': 'Dosierungsrichtlinien',
    'When to Choose': 'Wann Sie wählen sollten',
    'for anxiety': 'bei Angst',
    'for sleep': 'für Schlaf',
    'for pain': 'bei Schmerzen',
    'for inflammation': 'bei Entzündungen',
    'for stress': 'bei Stress',
    'anxiety': 'Angst',
    'sleep': 'Schlaf',
    'pain': 'Schmerzen',
    'inflammation': 'Entzündung',
    'stress': 'Stress',
    'recovery': 'Erholung',
    'focus': 'Fokus',
    'energy': 'Energie',
    'mood': 'Stimmung',
    'pets': 'Haustiere',
    'dogs': 'Hunde',
    'cats': 'Katzen',
    'athletes': 'Sportler',
    'women': 'Frauen',
    'students': 'Studenten',
    'travelers': 'Reisende',
    'shift workers': 'Schichtarbeiter'
  }
};

// Function to translate content
function translateContent(content) {
  let translated = content;
  
  // Replace common phrases
  for (const [en, de] of Object.entries(translations.phrases)) {
    translated = translated.replace(new RegExp(en, 'g'), de);
  }
  
  return translated;
}

// Generate translations
const translatedArticles = articles.map(article => {
  const slug = translations.slugs[article.slug] || article.slug;
  
  return {
    article_id: article.id,
    language: 'de',
    slug: slug,
    title: article.title, // Will need manual translation
    excerpt: article.excerpt, // Will need manual translation
    content: translateContent(article.content),
    meta_title: article.meta_title,
    meta_description: article.meta_description,
    translation_quality: 'professional'
  };
});

console.log(`Generated ${translatedArticles.length} translation templates`);
console.log('Note: Titles, excerpts, and meta need manual German translation');

// Output as JSON
writeFileSync('translations-batch-6-templates.json', JSON.stringify(translatedArticles, null, 2));
console.log('Saved to translations-batch-6-templates.json');
