const fs = require('fs');

// Load current Spanish locale
const currentEs = JSON.parse(fs.readFileSync('locales/es.json', 'utf8'));

function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!(key in current)) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Large comprehensive batch of Spanish translations
const largeBatch = {
  // Evidence levels
  "evidence.strongDesc": "Investigación extensa disponible",
  "evidence.moderateDesc": "Buena base de investigación", 
  "evidence.emerging": "Emergente",
  "evidence.emergingDesc": "Creciente base de evidencia",
  "evidence.limitedDesc": "Investigación en etapas tempranas",
  "evidence.preliminary": "Preliminar",
  "evidence.preliminaryDesc": "Datos muy limitados",
  
  // Research types
  "research.studySubject.human": "Estudio en Humanos",
  "research.studySubject.animal": "Estudio en Animales", 
  "research.studySubject.review": "Revisión",
  "research.studySubject.in_vitro": "In Vitro",
  
  // Glossary (large section)
  "glossary.knowledgeBase": "Base de Conocimiento",
  "glossary.cbdCannabis": "CBD y Cannabis",
  "glossary.termsExplained": "{{count}} términos explicados — desde cannabinoides y terpenos hasta terminología legal y tipos de productos.",
  "glossary.searchLabel": "Buscar términos del glosario",
  "glossary.searchTermsSynonyms": "Buscar términos, sinónimos...",
  "glossary.suggestionsFound": "{{count}} sugerencias encontradas",
  "glossary.matchedSynonym": "Sinónimo coincidente", 
  "glossary.mostPopular": "Términos Más Populares",
  "glossary.filterByLetter": "Filtrar por letra",
  "glossary.all": "Todos",
  "glossary.allCategories": "Todas las Categorías",
  "glossary.cardView": "Vista de tarjetas",
  "glossary.tableView": "Vista de tabla",
  "glossary.viewMode": "Modo de vista",
  "glossary.noTermsFound": "No se encontraron términos",
  "glossary.noResultsFor": "No hay resultados para \"{{query}}\"",
  "glossary.noTermsMatchFilters": "Ningún término del glosario coincide con tus filtros",
  "glossary.clearFilters": "Limpiar filtros",
  "glossary.term": "Término",
  "glossary.category": "Categoría",
  "glossary.definition": "Definición",
  "glossary.also": "También",
  "glossary.termCount": "{{count}} término",
  "glossary.termsCount": "{{count}} términos",
  "glossary.home": "Inicio",
  "glossary.reviewedBy": "Revisado por",
  "glossary.lastUpdated": "Última actualización",
  "glossary.calculateDosage": "Calcula Tu Dosis de CBD",
  "glossary.getDosageRecommendations": "Obtén recomendaciones de dosis personalizadas basadas en tus necesidades.",
  "glossary.tryCalculator": "Probar Calculadora →",
  "glossary.viewStudies": "Ver {{count}} estudio →",
  "glossary.viewStudiesPlural": "Ver {{count}} estudios →",
  "glossary.faq": "Preguntas Frecuentes",
  "glossary.alsoKnownAs": "También Conocido Como",
  "glossary.learnMore": "Saber Más",
  "glossary.backToGlossary": "Volver al Glosario",
  
  // Glossary categories
  "glossaryCategories.cannabinoids": "Cannabinoides",
  "glossaryCategories.cannabinoids_desc": "CBD, THC, CBG y otros compuestos del cannabis",
  "glossaryCategories.terpenes": "Terpenos",
  "glossaryCategories.terpenes_desc": "Compuestos aromáticos que afectan el aroma y los efectos",
  "glossaryCategories.products": "Productos",
  "glossaryCategories.products_desc": "Aceites, cápsulas, tópicos y otros productos de CBD",
  "glossaryCategories.extraction": "Extracción", 
  "glossaryCategories.extraction_desc": "Métodos para extraer CBD de la planta",
  "glossaryCategories.science": "Ciencia",
  "glossaryCategories.science_desc": "El sistema endocannabinoide y cómo funciona el CBD",
  "glossaryCategories.research": "Investigación",
  "glossaryCategories.research_desc": "Tipos de estudios e investigación científica",
  "glossaryCategories.legal": "Legal",
  "glossaryCategories.legal_desc": "Legislación, regulaciones y estatus legal del CBD",
  "glossaryCategories.cultivation": "Cultivo",
  "glossaryCategories.cultivation_desc": "Métodos de cultivo y producción de cannabis",
  "glossaryCategories.testing": "Análisis",
  "glossaryCategories.testing_desc": "Análisis de laboratorio y control de calidad",
  "glossaryCategories.safety": "Seguridad",
  "glossaryCategories.safety_desc": "Efectos secundarios, interacciones y seguridad",
  
  // Footer
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
  "footer.disclaimerText": "La información en este sitio web no ha sido evaluada por la FDA y no está destinada a diagnosticar, tratar, curar o prevenir ninguna enfermedad. Consulta a tu médico antes de usar productos de CBD.",
  
  // Articles page
  "articlesPage.articles": "Artículos",
  "articlesPage.topics": "Temas",
  "articlesPage.searchPlaceholder": "Buscar artículos...",
  "articlesPage.allArticles": "Todos los Artículos",
  "articlesPage.clearFilters": "Limpiar filtros",
  "articlesPage.resetFilters": "Resetear filtros",
  "articlesPage.showingOf": "Mostrando",
  "articlesPage.of": "de",
  "articlesPage.articlesIn": "artículos en",
  "articlesPage.featuredArticles": "Artículos Destacados",
  "articlesPage.featuredSubtitle": "Nuestras guías más populares",
  "articlesPage.allArticlesTitle": "Todos los Artículos",
  "articlesPage.allArticlesSubtitle": "Navega nuestra base de conocimiento completa",
  "articlesPage.exploreConditions": "Explorar Condiciones de Salud",
  "articlesPage.exploreConditionsDesc": "Navega nuestra base de datos completa de estudios de CBD revisados por expertos.",
  "articlesPage.browseConditions": "Navegar Condiciones", 
  "articlesPage.viewResearch": "Ver Investigación",
  
  // Article categories
  "articlesPage.categories.basics": "Fundamentos del CBD",
  "articlesPage.categories.dosage": "Dosis",
  "articlesPage.categories.conditions": "Condiciones",
  "articlesPage.categories.research": "Investigación",
  "articlesPage.categories.products": "Productos",
  "articlesPage.categories.legal": "Legal",
  "articlesPage.categories.pets": "Mascotas",
  "articlesPage.categories.wellness": "Bienestar",
  "articlesPage.categories.safety": "Seguridad",
  "articlesPage.categories.news": "Noticias"
};

// Apply large batch
let appliedCount = 0;
Object.keys(largeBatch).forEach(key => {
  setNestedValue(currentEs, key, largeBatch[key]);
  appliedCount++;
});

console.log(`Applied ${appliedCount} more translations to Spanish locale file`);

// Save updated file
fs.writeFileSync('locales/es.json', JSON.stringify(currentEs, null, 2));

// Count keys to verify progress
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const newEsKeys = getAllKeys(currentEs);
console.log(`New Spanish key count: ${newEsKeys.length}`);
console.log(`Progress: ${newEsKeys.length}/1667 keys (${Math.round(newEsKeys.length/1667*100)}%)`);