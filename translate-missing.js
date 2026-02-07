const fs = require('fs');

// Load files
const en = require('./locales/en.json');

// Translation dictionaries for key terms
const translations = {
  fi: { // Finnish
    // Common terms
    'Health Condition': 'Terveystila',
    'Last reviewed and updated': 'Viimeksi tarkistettu ja päivitetty',
    'Updated': 'Päivitetty', 
    'Close menu': 'Sulje valikko',
    'Research backed': 'Tutkimustaustainen',
    'Hero title': 'Pääotsikko',
    'Hero description': 'Pääkuvaus',
    'Search placeholder': 'Hakukenttä',
    'Grid': 'Ruudukko',
    'List A-Z': 'Lista A-Ö',
    'All conditions': 'Kaikki tilat',
    'Showing': 'Näytetään',
    'of': 'ja',
    'in': 'kohteessa',
    'matching': 'vastaavaa',
    'Clear filters': 'Tyhjennä suodattimet',
    'No results': 'Ei tuloksia',
    'No results description': 'Ei tuloksia kuvaukselle',
    'Strongest evidence': 'Vahvin näyttö',
    'Find by area': 'Etsi alueen mukaan',
    'Search results': 'Hakutulokset',
    
    // Categories
    'Mental health': 'Mielenterveys',
    'Mental health desc': 'CBD:n tutkimukset mielenterveysongelmissa',
    'Pain': 'Kipu',
    'Pain desc': 'CBD:n tutkimukset kipuongelmissa',
    'Neurological': 'Neurologinen',
    'Neurological desc': 'CBD:n tutkimukset neurologisissa sairauksissa',
    'Skin': 'Iho',
    'Skin desc': 'CBD:n tutkimukset ihosairauksissa',
    'Gastrointestinal': 'Ruoansulatuskanava',
    'Gastrointestinal desc': 'CBD:n tutkimukset ruoansulatusongelmissa',
    'Cardiovascular': 'Sydän- ja verisuonisto',
    'Cardiovascular desc': 'CBD:n tutkimukset sydän- ja verisuonisairauksissa',
    'Cancer': 'Syöpä',
    'Cancer desc': 'CBD:n tutkimukset syöpähoidossa',
    'Metabolic': 'Aineenvaihdunta',
    'Metabolic desc': 'CBD:n tutkimukset aineenvaihduntahäiriöissä',
    'Pets': 'Lemmikit',
    'Pets desc': 'CBD:n tutkimukset eläinten terveydessä',
    'Other': 'Muu',
    'Other desc': 'Muut CBD-tutkimukset',
    
    // Evidence levels
    'Strong desc': 'Vahva tieteellinen näyttö useista tutkimuksista',
    'Moderate desc': 'Kohtalainen näyttö rajoitetusta määrästä tutkimuksia',
    'Emerging': 'Nouseva',
    'Emerging desc': 'Lupaavia alustavia tuloksia, tarvitaan lisää tutkimusta',
    'Limited desc': 'Rajallinen näyttö, tarvitaan paljon lisää tutkimusta'
  },
  
  fr: { // French
    'Health Condition': 'Condition de Santé',
    'Last reviewed and updated': 'Dernière révision et mise à jour',
    'Updated': 'Mis à jour',
    'Close menu': 'Fermer le menu',
    'Research backed': 'Soutenu par la recherche',
    'Hero title': 'Titre principal',
    'Hero description': 'Description principale',
    'Search placeholder': 'Champ de recherche',
    'Grid': 'Grille',
    'List A-Z': 'Liste A-Z',
    'All conditions': 'Toutes les conditions',
    'Showing': 'Affichage',
    'of': 'de',
    'in': 'dans',
    'matching': 'correspondant',
    'Clear filters': 'Effacer les filtres',
    'No results': 'Aucun résultat',
    'No results description': 'Aucune description de résultat',
    'Strongest evidence': 'Preuves les plus solides',
    'Find by area': 'Rechercher par zone',
    'Search results': 'Résultats de recherche',
    
    // Categories  
    'Mental health': 'Santé mentale',
    'Mental health desc': 'Recherche sur le CBD pour les problèmes de santé mentale',
    'Pain': 'Douleur',
    'Pain desc': 'Recherche sur le CBD pour la gestion de la douleur',
    'Neurological': 'Neurologique',
    'Neurological desc': 'Recherche sur le CBD pour les troubles neurologiques',
    'Skin': 'Peau',
    'Skin desc': 'Recherche sur le CBD pour les affections cutanées',
    'Gastrointestinal': 'Gastro-intestinal',
    'Gastrointestinal desc': 'Recherche sur le CBD pour les troubles digestifs',
    'Cardiovascular': 'Cardiovasculaire',
    'Cardiovascular desc': 'Recherche sur le CBD pour les maladies cardiovasculaires',
    'Cancer': 'Cancer',
    'Cancer desc': 'Recherche sur le CBD dans le traitement du cancer',
    'Metabolic': 'Métabolique',
    'Metabolic desc': 'Recherche sur le CBD pour les troubles métaboliques',
    'Pets': 'Animaux de compagnie',
    'Pets desc': 'Recherche sur le CBD pour la santé des animaux',
    'Other': 'Autre',
    'Other desc': 'Autres recherches sur le CBD',
    
    // Evidence levels
    'Strong desc': 'Preuves scientifiques solides de multiples études',
    'Moderate desc': 'Preuves modérées d\'un nombre limité d\'études',
    'Emerging': 'Émergent',
    'Emerging desc': 'Résultats préliminaires prometteurs, plus de recherche nécessaire',
    'Limited desc': 'Preuves limitées, beaucoup plus de recherche nécessaire'
  },
  
  it: { // Italian
    'Health Condition': 'Condizione di Salute',
    'Last reviewed and updated': 'Ultima revisione e aggiornamento',
    'Updated': 'Aggiornato',
    'Close menu': 'Chiudi menu',
    'Research backed': 'Supportato dalla ricerca',
    'Hero title': 'Titolo principale',
    'Hero description': 'Descrizione principale',
    'Search placeholder': 'Campo di ricerca',
    'Grid': 'Griglia',
    'List A-Z': 'Lista A-Z',
    'All conditions': 'Tutte le condizioni',
    'Showing': 'Visualizzazione',
    'of': 'di',
    'in': 'in',
    'matching': 'corrispondente',
    'Clear filters': 'Cancella filtri',
    'No results': 'Nessun risultato',
    'No results description': 'Nessuna descrizione del risultato',
    'Strongest evidence': 'Evidenza più forte',
    'Find by area': 'Cerca per area',
    'Search results': 'Risultati di ricerca',
    
    // Categories
    'Mental health': 'Salute mentale',
    'Mental health desc': 'Ricerca sul CBD per problemi di salute mentale',
    'Pain': 'Dolore',
    'Pain desc': 'Ricerca sul CBD per la gestione del dolore',
    'Neurological': 'Neurologico',
    'Neurological desc': 'Ricerca sul CBD per disturbi neurologici',
    'Skin': 'Pelle',
    'Skin desc': 'Ricerca sul CBD per condizioni della pelle',
    'Gastrointestinal': 'Gastrointestinale',
    'Gastrointestinal desc': 'Ricerca sul CBD per disturbi digestivi',
    'Cardiovascular': 'Cardiovascolare',
    'Cardiovascular desc': 'Ricerca sul CBD per malattie cardiovascolari',
    'Cancer': 'Cancro',
    'Cancer desc': 'Ricerca sul CBD nel trattamento del cancro',
    'Metabolic': 'Metabolico',
    'Metabolic desc': 'Ricerca sul CBD per disturbi metabolici',
    'Pets': 'Animali domestici',
    'Pets desc': 'Ricerca sul CBD per la salute degli animali',
    'Other': 'Altro',
    'Other desc': 'Altre ricerche sul CBD',
    
    // Evidence levels
    'Strong desc': 'Evidenza scientifica forte da più studi',
    'Moderate desc': 'Evidenza moderata da un numero limitato di studi',
    'Emerging': 'Emergente',
    'Emerging desc': 'Risultati preliminari promettenti, serve più ricerca',
    'Limited desc': 'Evidenza limitata, serve molta più ricerca'
  }
};

// Function to get value by path from English
function getValueByPath(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    return current;
}

// Function to set value by path in target language
function setValueByPath(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
            current[part] = {};
        }
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}

// Simple translation function using our dictionaries and context
function translateText(text, lang, context = '') {
    if (!text || typeof text !== 'string') return text;
    
    const dict = translations[lang];
    if (!dict) return text;
    
    // First check for exact matches in our dictionary
    if (dict[text]) return dict[text];
    
    // Check for partial matches and common patterns
    let translated = text;
    
    // Replace known terms
    Object.keys(dict).forEach(term => {
        if (text.includes(term)) {
            translated = translated.replace(new RegExp(term, 'gi'), dict[term]);
        }
    });
    
    // If no translation found, return a placeholder that indicates manual translation needed
    if (translated === text) {
        console.log(`Manual translation needed for ${lang}: "${text}" (context: ${context})`);
        return text; // Keep original for now, will need manual translation
    }
    
    return translated;
}

// Main translation function
function translateMissingKeys(lang) {
    console.log(`\n=== Translating missing keys for ${lang} ===`);
    
    const missingKeysFile = `missing-keys-${lang}.json`;
    if (!fs.existsSync(missingKeysFile)) {
        console.log(`Missing keys file not found: ${missingKeysFile}`);
        return;
    }
    
    const missingData = JSON.parse(fs.readFileSync(missingKeysFile, 'utf8'));
    const langFile = require(`./locales/${lang}.json`);
    
    let translatedCount = 0;
    let manualCount = 0;
    
    for (const keyPath of missingData.missingKeys) {
        const englishValue = getValueByPath(en, keyPath);
        if (englishValue && typeof englishValue === 'string') {
            const translated = translateText(englishValue, lang, keyPath);
            if (translated !== englishValue) {
                setValueByPath(langFile, keyPath, translated);
                translatedCount++;
            } else {
                // Keep English for manual translation later
                setValueByPath(langFile, keyPath, englishValue);
                manualCount++;
            }
        }
    }
    
    // Save updated language file
    fs.writeFileSync(`./locales/${lang}.json`, JSON.stringify(langFile, null, 2));
    
    console.log(`${lang}: Translated ${translatedCount} keys automatically, ${manualCount} need manual translation`);
    
    return { translated: translatedCount, manual: manualCount };
}

// Run translations for all target languages
const targetLanguages = ['fi', 'fr', 'it'];

targetLanguages.forEach(lang => {
    translateMissingKeys(lang);
});

console.log('\nInitial translations complete. Swiss variants will be created next...');