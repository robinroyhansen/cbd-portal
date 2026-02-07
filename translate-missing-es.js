const fs = require('fs');
const path = require('path');

// Load missing keys for Spanish
const missingKeys = JSON.parse(fs.readFileSync('missing-keys-es.json', 'utf8'));
const currentEs = JSON.parse(fs.readFileSync('locales/es.json', 'utf8'));

// High-quality Spanish translations
const translations = {
  "common.healthCondition": "Condición de Salud",
  "common.lastReviewedAndUpdated": "Última revisión y actualización:",
  "common.updated": "Actualizado",
  "nav.closeMenu": "Cerrar menú",
  "conditions.researchBacked": "Información Respaldada por Investigación",
  "conditions.heroTitle": "CBD y Condiciones de Salud",
  "conditions.heroDescription": "Explora investigación basada en evidencia sobre cómo el CBD puede ayudar con {{count}} condiciones de salud. Cada tema incluye estudios científicos, orientación sobre dosis y perspectivas de expertos.",
  "conditions.searchPlaceholder": "Buscar condiciones (ej: ansiedad, dolor, sueño)...",
  "conditions.grid": "Cuadrícula",
  "conditions.listAZ": "A-Z",
  "conditions.allConditions": "Todas las Condiciones",
  "conditions.showing": "Mostrando",
  "conditions.of": "de",
  "conditions.in": "en",
  "conditions.matching": "que coinciden",
  "conditions.clearFilters": "Limpiar filtros",
  "conditions.noResults": "No se Encontraron Condiciones",
  "conditions.noResultsDescription": "Intenta ajustar tu búsqueda o filtro de categoría para ver más resultados.",
  "conditions.strongestEvidence": "Condiciones con la evidencia científica más sólida",
  "conditions.findByArea": "Encuentra condiciones organizadas por área afectada",
  "conditions.searchResults": "Resultados de Búsqueda",
  "conditions.categories.mental_health": "Salud Mental",
  "conditions.categories.mental_health_desc": "Ansiedad, depresión, TEPT, estrés y trastornos del estado de ánimo",
  "conditions.categories.pain": "Dolor e Incomodidad",
  "conditions.categories.pain_desc": "Dolor crónico, artritis, fibromialgia y neuropatía",
  "conditions.categories.neurological": "Neurológicos",
  "conditions.categories.neurological_desc": "Epilepsia, Parkinson, esclerosis múltiple y salud cerebral",
  "conditions.categories.skin": "Condiciones de la Piel",
  "conditions.categories.skin_desc": "Acné, eccema, psoriasis y dermatitis"
};

// Add more extensive translations - this is just the beginning
// I'll continue with more sections...

const moreTranslations = {
  "conditions.categories.sleep": "Sueño",
  "conditions.categories.sleep_desc": "Insomnio, apnea del sueño y trastornos del ciclo circadiano",
  "conditions.categories.autoimmune": "Autoinmunes",
  "conditions.categories.autoimmune_desc": "Artritis reumatoide, enfermedad de Crohn y lupus",
  "conditions.categories.cancer": "Relacionadas con Cáncer",
  "conditions.categories.cancer_desc": "Efectos secundarios de quimioterapia, náuseas y manejo del dolor",
  "conditions.categories.digestive": "Sistema Digestivo",
  "conditions.categories.digestive_desc": "SII, enfermedad inflamatoria intestinal y náuseas",
  "conditions.browseByCategoryHeader": "Explorar por Categoría",
  "conditions.browseByCategoryDescription": "Encuentra condiciones de salud organizadas por sistemas corporales y tipos de síntomas",
  "conditions.categoryNotFound": "Categoría no encontrada",
  "conditions.categoryNotFoundDescription": "La categoría solicitada no existe o ha sido movida.",
  "footer.sections.company": "Empresa",
  "footer.sections.resources": "Recursos",
  "footer.sections.legal": "Legal",
  "footer.sections.community": "Comunidad",
  "footer.sections.newsletter": "Boletín",
  "footer.sections.social": "Social",
  "footer.links.about": "Acerca de",
  "footer.links.contact": "Contacto",
  "footer.links.careers": "Carreras",
  "footer.links.press": "Prensa",
  "footer.links.partnerships": "Asociaciones",
  "footer.links.research": "Investigación",
  "footer.links.articles": "Artículos",
  "footer.links.glossary": "Glosario",
  "footer.links.faq": "Preguntas Frecuentes",
  "footer.links.tools": "Herramientas",
  "footer.links.privacy": "Privacidad",
  "footer.links.terms": "Términos",
  "footer.links.cookies": "Cookies",
  "footer.links.medical": "Descargo de Responsabilidad Médica",
  "footer.links.accessibility": "Accesibilidad",
  "footer.links.newsletter": "Boletín",
  "footer.links.forum": "Foro",
  "footer.links.facebook": "Facebook",
  "footer.links.twitter": "Twitter",
  "footer.links.instagram": "Instagram",
  "footer.links.youtube": "YouTube",
  "footer.links.linkedin": "LinkedIn",
  "footer.copyright": "© {{year}} CBDportal.com. Todos los derechos reservados.",
  "footer.newsletterTitle": "Mantente Informado",
  "footer.newsletterDescription": "Recibe las últimas investigaciones y artículos sobre CBD directamente en tu bandeja de entrada.",
  "footer.newsletterPlaceholder": "Ingresa tu email",
  "footer.disclaimerTitle": "Descargo de Responsabilidad Médica",
  "footer.disclaimerText": "La información en este sitio web no ha sido evaluada por la FDA y no está destinada a diagnosticar, tratar, curar o prevenir ninguna enfermedad. Consulta a tu médico antes de usar productos de CBD."
};

// Combine all translations
const allTranslations = { ...translations, ...moreTranslations };

console.log('Created', Object.keys(allTranslations).length, 'translations for Spanish');

// Save the translations to a file for review
fs.writeFileSync('spanish-translations.json', JSON.stringify(allTranslations, null, 2));
console.log('Spanish translations saved to spanish-translations.json');

console.log('\nFirst 10 translations:');
Object.entries(allTranslations).slice(0, 10).forEach(([key, value]) => {
  console.log(`${key}: "${value}"`);
});