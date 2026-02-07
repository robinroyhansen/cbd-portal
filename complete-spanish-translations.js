const fs = require('fs');

// Load missing keys and existing translations
const missingKeys = JSON.parse(fs.readFileSync('missing-keys-es.json', 'utf8'));
const existingTranslations = JSON.parse(fs.readFileSync('comprehensive-spanish-translations.json', 'utf8'));

// Extended Spanish translations
const extendedTranslations = {
  ...existingTranslations,
  
  // Glossary categories (continued)
  "glossaryCategories.research_desc": "Tipos de estudios e investigación científica",
  "glossaryCategories.legal": "Legal",
  "glossaryCategories.legal_desc": "Legislación, regulaciones y estatus legal del CBD",
  "glossaryCategories.cultivation": "Cultivo",
  "glossaryCategories.cultivation_desc": "Métodos de cultivo y producción de cannabis",
  "glossaryCategories.testing": "Análisis",
  "glossaryCategories.testing_desc": "Análisis de laboratorio y control de calidad",
  "glossaryCategories.safety": "Seguridad",
  "glossaryCategories.safety_desc": "Efectos secundarios, interacciones y seguridad",
  
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
  "articlesPage.categories.news": "Noticias",
  
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
  
  // Research filters
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
  
  // Browse categories
  "conditions.browseByCategoryHeader": "Explorar por Categoría",
  "conditions.browseByCategoryDescription": "Encuentra condiciones de salud organizadas por sistemas corporales y tipos de síntomas",
  "conditions.categoryNotFound": "Categoría no encontrada",
  "conditions.categoryNotFoundDescription": "La categoría solicitada no existe o ha sido movida.",
  
  // More specific health categories
  "conditions.categories.sleep": "Sueño",
  "conditions.categories.sleep_desc": "Insomnio, apnea del sueño y trastornos del ciclo circadiano",
  "conditions.categories.autoimmune": "Autoinmunes",
  "conditions.categories.autoimmune_desc": "Artritis reumatoide, enfermedad de Crohn y lupus",
  "conditions.categories.inflammation": "Inflamación",
  "conditions.categories.inflammation_desc": "Inflamación crónica y trastornos inflamatorios"
};

console.log('Extended translations to', Object.keys(extendedTranslations).length, 'Spanish translations');
console.log('Still need to translate:', 722 - Object.keys(extendedTranslations).length, 'more terms');

// Save extended translations
fs.writeFileSync('extended-spanish-translations.json', JSON.stringify(extendedTranslations, null, 2));
console.log('Extended Spanish translations saved');