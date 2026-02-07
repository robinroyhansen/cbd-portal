const fs = require('fs');

// Load existing progress
const existingTranslations = JSON.parse(fs.readFileSync('extended-spanish-translations.json', 'utf8'));

// Continue with many more sections
const bulkTranslations = {
  ...existingTranslations,
  
  // Chat/AI assistant
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
  
  // Cookie banner
  "cookie.notice": "Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de cookies.",
  
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
  "researchConditions.viewStudies": "Ver estudios",
  
  // Research card
  "researchCard.published": "Publicado",
  "researchCard.subjects": "Sujetos",
  "researchCard.duration": "Duración",
  "researchCard.dosage": "Dosis",
  "researchCard.viewStudy": "Ver estudio",
  "researchCard.quality": "Calidad",
  "researchCard.fullText": "Texto completo",
  "researchCard.abstract": "Resumen",
  
  // Search bar
  "searchBar.searchPlaceholder": "Buscar condiciones, estudios, artículos...",
  "searchBar.quickFilters": "Filtros rápidos",
  "searchBar.allContent": "Todo el contenido",
  "searchBar.studies": "Estudios",
  "searchBar.articles": "Artículos",
  "searchBar.conditions": "Condiciones",
  "searchBar.suggestions": "Sugerencias",
  "searchBar.noResults": "Sin resultados",
  
  // Tools showcase
  "toolsShowcase.title": "Herramientas y Calculadoras CBD",
  "toolsShowcase.subtitle": "Recursos profesionales para ayudarte a tomar decisiones informadas sobre el CBD",
  "toolsShowcase.dosageCalculator.title": "Calculadora de Dosis",
  "toolsShowcase.dosageCalculator.description": "Encuentra la dosis de CBD adecuada para tu peso, condición y experiencia",
  "toolsShowcase.interactionChecker.title": "Verificador de Interacciones",
  "toolsShowcase.interactionChecker.description": "Verifica posibles interacciones entre CBD y medicamentos",
  "toolsShowcase.productFinder.title": "Buscador de Productos",
  "toolsShowcase.productFinder.description": "Encuentra el mejor tipo de producto CBD para tus necesidades",
  "toolsShowcase.strainGuide.title": "Guía de Variedades",
  "toolsShowcase.strainGuide.description": "Explora diferentes variedades de cannabis y sus perfiles de terpenos",
  "toolsShowcase.labTestDecoder.title": "Decodificador de Análisis",
  "toolsShowcase.labTestDecoder.description": "Entiende los resultados de análisis de laboratorio de productos CBD",
  "toolsShowcase.symptomTracker.title": "Rastreador de Síntomas",
  "toolsShowcase.symptomTracker.description": "Rastrea tus síntomas y respuesta al CBD a lo largo del tiempo",
  "toolsShowcase.tryTool": "Probar herramienta",
  "toolsShowcase.comingSoon": "Próximamente",
  "toolsShowcase.beta": "Beta",
  "toolsShowcase.new": "Nuevo",
  
  // Cannabinoid hub
  "cannabinoidHub.title": "Centro de Cannabinoides",
  "cannabinoidHub.description": "Aprende sobre CBD, THC, CBG y otros cannabinoides",
  "cannabinoidHub.exploreAll": "Explorar todos",
  "cannabinoidHub.mostPopular": "Más populares"
};

console.log('Bulk translations now at', Object.keys(bulkTranslations).length, 'Spanish translations');
console.log('Still need to translate:', 722 - Object.keys(bulkTranslations).length, 'more terms');

// Save bulk translations
fs.writeFileSync('bulk-spanish-translations.json', JSON.stringify(bulkTranslations, null, 2));
console.log('Bulk Spanish translations saved');