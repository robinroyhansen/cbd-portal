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

// Final large push for Spanish - focusing on major remaining sections
const finalPush = {
  // Cookie
  "cookie.notice": "Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de cookies.",
  
  // Chat/AI assistant (22 keys)
  "chat.title": "Asistente CBD",
  "chat.placeholder": "Pregunta sobre CBD...",
  "chat.askQuestion": "Hacer una pregunta",
  "chat.send": "Enviar",
  "chat.typing": "Escribiendo...",
  "chat.error": "Error al cargar respuesta",
  "chat.disclaimer": "Este asistente proporciona información educativa general y no debe utilizarse como sustituto del consejo médico profesional.",
  "chat.examples.title": "Preguntas de ejemplo:",
  "chat.examples.dosage": "¿Cuánto CBD debo tomar?",
  "chat.examples.effects": "¿Cuáles son los efectos del CBD?", 
  "chat.examples.legal": "¿Es legal el CBD?",
  "chat.examples.anxiety": "¿Puede el CBD ayudar con la ansiedad?",
  "chat.examples.pain": "¿Funciona el CBD para el dolor?",
  "chat.examples.sleep": "¿Puede el CBD ayudar a dormir?",
  "chat.powered": "Impulsado por",
  "chat.sources": "Fuentes",
  "chat.viewSource": "Ver fuente",
  "chat.reset": "Nueva conversación",
  "chat.copied": "Copiado",
  "chat.copy": "Copiar",
  "chat.share": "Compartir",
  "chat.feedback": "¿Fue útil esta respuesta?",
  "chat.thumbsUp": "Sí",
  "chat.thumbsDown": "No",
  
  // Accessibility  
  "accessibility.skipToContent": "Saltar al contenido",
  "accessibility.mainNavigation": "Navegación principal",
  
  // Tools page
  "toolsPage.title": "Herramientas CBD",
  "toolsPage.description": "Calculadoras, herramientas y recursos para ayudarte a encontrar las dosis correctas y productos apropiados.",
  "toolsPage.featured": "Herramientas Destacadas",
  
  // Pets page
  "petsPage.petTypes.dogs": "Perros",
  "petsPage.petTypes.dogs_desc": "Guías de CBD para compañeros caninos - desde cachorros hasta perros mayores",
  "petsPage.petTypes.cats": "Gatos", 
  "petsPage.petTypes.cats_desc": "Información sobre CBD para amigos felinos - consideraciones especiales para gatos",
  "petsPage.petTypes.horses": "Caballos",
  "petsPage.petTypes.horses_desc": "CBD para la salud equina - apoyando rendimiento y recuperación",
  "petsPage.petTypes.birds": "Aves",
  "petsPage.petTypes.birds_desc": "Orientación sobre CBD para mascotas aviares - loros, canarios y más",
  "petsPage.petTypes.small-pets": "Mascotas Pequeñas",
  "petsPage.petTypes.small-pets_desc": "CBD para conejos, cobayas, hurones, hámsters y otros animales pequeños",
  
  // Research filters (large section - 60 keys)
  "researchFilters.condition": "Condición",
  "researchFilters.clear": "Limpiar",
  "researchFilters.showAllConditions": "Mostrar todas las {{count}} condiciones...",
  "researchFilters.showLess": "Mostrar menos",
  "researchFilters.mostResearched": "Más investigadas",
  "researchFilters.publicationYear": "Año de Publicación",
  "researchFilters.qualityScore": "Puntuación de Calidad",
  "researchFilters.subjectType": "Tipo de Sujeto",
  "researchFilters.all": "Todos",
  "researchFilters.human": "Humano",
  "researchFilters.animal": "Animal",
  "researchFilters.advanced": "Avanzado",
  "researchFilters.qualityTiers": "Niveles de Calidad",
  "researchFilters.excellent": "Excelente",
  "researchFilters.good": "Bueno", 
  "researchFilters.moderate": "Moderado",
  "researchFilters.limited": "Limitado",
  "researchFilters.veryLimited": "Muy Limitado",
  "researchFilters.studyType": "Tipo de Estudio",
  "researchFilters.randomizedTrial": "Ensayo Aleatorizado",
  "researchFilters.cohortStudy": "Estudio de Cohorte",
  "researchFilters.caseControl": "Casos y Controles",
  "researchFilters.crossSectional": "Transversal",
  "researchFilters.systematicReview": "Revisión Sistemática",
  "researchFilters.metaAnalysis": "Metaanálisis",
  "researchFilters.animalStudy": "Estudio Animal",
  "researchFilters.inVitro": "In Vitro",
  "researchFilters.caseReport": "Reporte de Caso",
  "researchFilters.sampleSize": "Tamaño de Muestra",
  "researchFilters.large": "Grande (1000+)",
  "researchFilters.medium": "Mediano (100-999)",
  "researchFilters.small": "Pequeño (10-99)",
  "researchFilters.verySmall": "Muy Pequeño (<10)",
  "researchFilters.duration": "Duración",
  "researchFilters.longTerm": "Largo plazo (12+ semanas)",
  "researchFilters.mediumTerm": "Mediano plazo (4-12 semanas)",
  "researchFilters.shortTerm": "Corto plazo (1-4 semanas)",
  "researchFilters.acute": "Agudo (<1 semana)",
  "researchFilters.dosage": "Dosis",
  "researchFilters.high": "Alta",
  "researchFilters.low": "Baja",
  "researchFilters.variable": "Variable",
  "researchFilters.unknown": "Desconocida",
  "researchFilters.cannabinoid": "Cannabinoide",
  "researchFilters.cbd": "CBD",
  "researchFilters.thc": "THC", 
  "researchFilters.cbg": "CBG",
  "researchFilters.cbn": "CBN",
  "researchFilters.fullSpectrum": "Espectro Completo",
  "researchFilters.isolate": "Aislado",
  "researchFilters.synthetic": "Sintético",
  "researchFilters.yearRange": "Rango de Años",
  "researchFilters.lastYear": "Último año",
  "researchFilters.last5Years": "Últimos 5 años",
  "researchFilters.last10Years": "Últimos 10 años",
  "researchFilters.allYears": "Todos los años",
  "researchFilters.resetFilters": "Resetear filtros",
  "researchFilters.applyFilters": "Aplicar filtros",
  "researchFilters.resultsFound": "{{count}} resultados encontrados",
  "researchFilters.noResults": "No se encontraron resultados",
  "researchFilters.adjustFilters": "Ajusta tus filtros para ver más resultados",
  "researchFilters.sortBy": "Ordenar por",
  "researchFilters.relevance": "Relevancia",
  "researchFilters.dateNewest": "Más reciente",
  "researchFilters.dateOldest": "Más antiguo",
  "researchFilters.qualityHighest": "Mejor calidad",
  "researchFilters.qualityLowest": "Menor calidad",
  "researchFilters.sampleSizeLargest": "Muestra más grande",
  "researchFilters.sampleSizeSmallest": "Muestra más pequeña",
  
  // Research conditions
  "researchConditions.all": "Todas las condiciones",
  "researchConditions.mostStudied": "Más estudiadas",
  "researchConditions.trending": "Tendencia", 
  "researchConditions.recentlyAdded": "Añadidas recientemente",
  "researchConditions.byEvidence": "Por nivel de evidencia",
  "researchConditions.strongEvidence": "Evidencia sólida",
  "researchConditions.moderateEvidence": "Evidencia moderada",
  "researchConditions.emergingEvidence": "Evidencia emergente",
  "researchConditions.limitedEvidence": "Evidencia limitada",
  "researchConditions.searchConditions": "Buscar condiciones...",
  "researchConditions.noConditionsFound": "No se encontraron condiciones",
  "researchConditions.clearSearch": "Limpiar búsqueda",
  "researchConditions.showingResults": "Mostrando {{count}} resultados",
  "researchConditions.sortBy": "Ordenar por",
  "researchConditions.name": "Nombre",
  "researchConditions.studyCount": "Número de estudios",
  "researchConditions.evidenceLevel": "Nivel de evidencia",
  "researchConditions.alphabetical": "Alfabético",
  "researchConditions.studyCountDesc": "Más estudios primero",
  "researchConditions.evidenceLevelDesc": "Mejor evidencia primero",
  "researchConditions.condition": "Condición",
  "researchConditions.studies": "Estudios",
  "researchConditions.evidence": "Evidencia",
  "researchConditions.viewCondition": "Ver condición",
  "researchConditions.viewStudies": "Ver estudios"
};

// Apply final push
let appliedCount = 0;
Object.keys(finalPush).forEach(key => {
  setNestedValue(currentEs, key, finalPush[key]);
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
console.log(`Remaining: ${1667 - newEsKeys.length} keys`);