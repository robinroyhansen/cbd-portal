#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// German translations for cookiePolicy section
const translations = {
  cookiePolicy: {
    pageTitle: "Cookie-Richtlinie | CBD Portal",
    metaTitle: "Cookie-Richtlinie | CBD Portal",
    pageDescription: "Erfahren Sie, wie wir Cookies verwenden und wie Sie Ihre Einstellungen verwalten können.",
    metaDescription: "Erfahren Sie, wie wir Cookies verwenden und wie Sie Ihre Einstellungen verwalten können.",
    title: "Cookie-Richtlinie",
    lastUpdated: "Zuletzt aktualisiert: 15. Januar 2025",
    intro: "Diese Cookie-Richtlinie erklärt, was Cookies sind und wie wir sie verwenden, welche Arten von Cookies wir verwenden, d.h. welche Informationen wir mit Hilfe von Cookies sammeln und wie diese Informationen verwendet werden, und wie Sie die Cookie-Einstellungen steuern können.",
    whatAreCookies: "Was sind Cookies?",
    cookiesExplanation: "Cookies sind kleine Textdateien, die verwendet werden, um kleine Informationen zu speichern. Sie werden auf Ihrem Gerät gespeichert, wenn die Website in Ihrem Browser geladen wird. Diese Cookies helfen uns dabei, die Website ordnungsgemäß funktionsfähig zu machen, sie sicherer zu machen, eine bessere Benutzererfahrung zu bieten und zu verstehen, wie die Website funktioniert und zu analysieren, was funktioniert und wo sie verbessert werden muss.",
    howWeUseCookies: "Wie verwenden wir Cookies?",
    cookieUsageExplanation: "Wie die meisten Online-Dienste verwendet unsere Website Erstanbieter- und Drittanbieter-Cookies für verschiedene Zwecke. Erstanbieter-Cookies sind meist notwendig für das ordnungsgemäße Funktionieren der Website und sammeln keine Ihrer persönlich identifizierbaren Daten.",
    thirdPartyCookies: "Drittanbieter-Cookies, die auf unserer Website verwendet werden, dienen hauptsächlich dazu zu verstehen, wie die Website funktioniert, wie Sie mit unserer Website interagieren, unsere Dienste sicher zu halten, Ihnen relevante Werbung anzubieten und insgesamt eine bessere und verbesserte Benutzererfahrung zu bieten und dabei zu helfen, Ihre zukünftigen Interaktionen mit unserer Website zu beschleunigen.",
    typesOfCookies: "Welche Arten von Cookies verwenden wir?",
    essential: "Wesentlich",
    essentialDesc: "Diese Cookies sind unbedingt erforderlich, um Ihnen über unsere Website verfügbare Dienste bereitzustellen und einige ihrer Funktionen zu nutzen. Sie helfen bei der Authentifizierung von Benutzern und verhindern betrügerische Nutzung von Benutzerkonten. Ohne diese Cookies können die von Ihnen angeforderten Dienste nicht bereitgestellt werden, und wir verwenden diese Cookies nur, um Ihnen diese Dienste bereitzustellen.",
    analytics: "Analytik",
    analyticsDesc: "Diese Cookies speichern Informationen wie die Anzahl der Besucher der Website, die Anzahl der eindeutigen Besucher, welche Seiten der Website besucht wurden, die Quelle des Besuchs usw. Diese Daten helfen uns zu verstehen und zu analysieren, wie gut die Website funktioniert und wo sie verbessert werden muss.",
    functional: "Funktional",
    functionalDesc: "Dies sind die Cookies, die bestimmte nicht-wesentliche Funktionalitäten auf unserer Website unterstützen. Diese Funktionalitäten umfassen das Einbetten von Inhalten wie Videos oder das Teilen von Inhalten der Website auf Social Media-Plattformen.",
    advertising: "Werbung",
    advertisingDesc: "Diese Cookies werden verwendet, um Ihnen Werbeanzeigen zu personalisieren, die für Sie und Ihre Interessen relevant sind. Sie werden auch verwendet, um die Anzahl der Werbeanzeigen zu begrenzen, die Sie sehen, sowie dabei zu helfen, die Wirksamkeit der Werbekampagne zu messen.",
    preferences: "Präferenzen",
    preferencesDesc: "Diese Cookies helfen uns dabei, Ihre Einstellungen und Browsing-Präferenzen wie Sprachpräferenzen zu speichern, damit Sie eine bessere und effizientere Erfahrung bei zukünftigen Besuchen der Website haben.",
    controlCookies: "Wie kann ich die Cookie-Einstellungen steuern?",
    controlCookiesExplanation: "Wenn Sie Ihre Einstellungen später ändern möchten, können Sie auf Ihrem Bildschirm auf die Registerkarte \"Datenschutz & Cookie-Richtlinie\" klicken. Dadurch wird die Zustimmungsnotiz erneut angezeigt, so dass Sie Ihre Einstellungen ändern oder Ihre Zustimmung vollständig widerrufen können.",
    browserSettings: "Browsereinstellungen",
    browserSettingsDesc: "Darüber hinaus bieten verschiedene Browser unterschiedliche Methoden zum Blockieren und Löschen von Cookies, die von Websites verwendet werden. Sie können die Einstellungen Ihres Browsers ändern, um die Cookies zu blockieren/löschen. Nachfolgend finden Sie Links zu den Supportdokumenten zur Verwaltung und Löschung von Cookies aus den wichtigsten Webbrowsern.",
    chromeLink: "Chrome",
    firefoxLink: "Firefox",
    safariLink: "Safari",
    edgeLink: "Microsoft Edge",
    operaLink: "Opera",
    moreInfo: "Weitere Informationen",
    moreInfoDesc: "Wenn Sie weitere Informationen über Cookies, deren Verwendung und Verwaltung wünschen, können Sie die folgenden Ressourcen besuchen:",
    allAboutCookiesLink: "AllAboutCookies.org",
    aboutCookiesLink: "AboutCookies.org",
    cookieCentralLink: "CookieCentral.com",
    contact: "Kontakt",
    contactDesc: "Wenn Sie Fragen zu dieser Cookie-Richtlinie haben, können Sie uns kontaktieren unter:",
    email: "E-Mail: privacy@cbdportal.com",
    lastModified: "Diese Richtlinie wurde zuletzt geändert am: 15. Januar 2025"
  }
};

try {
  const dePath = path.join(__dirname, '../locales/de.json');
  const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));
  
  // Merge translations
  deData.cookiePolicy = { ...deData.cookiePolicy, ...translations.cookiePolicy };
  
  // Write updated German translations
  fs.writeFileSync(dePath, JSON.stringify(deData, null, 2));
  
  console.log('✅ Cookie Policy section translated:');
  console.log(`- cookiePolicy: ${Object.keys(translations.cookiePolicy).length} keys added`);
  
} catch (error) {
  console.error('❌ Error updating translations:', error.message);
  process.exit(1);
}