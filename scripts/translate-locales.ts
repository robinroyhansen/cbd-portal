#!/usr/bin/env npx tsx
/**
 * Translate UI locale files to all supported languages
 *
 * Usage:
 *   npx tsx scripts/translate-locales.ts --lang=da
 *   npx tsx scripts/translate-locales.ts --lang=all
 *   npx tsx scripts/translate-locales.ts --lang=da,sv,no
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Languages to translate to
const TARGET_LANGUAGES = {
  da: { name: 'Danish', nativeName: 'Dansk' },
  sv: { name: 'Swedish', nativeName: 'Svenska' },
  no: { name: 'Norwegian', nativeName: 'Norsk' },
  de: { name: 'German', nativeName: 'Deutsch' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
  fi: { name: 'Finnish', nativeName: 'Suomi' },
  fr: { name: 'French', nativeName: 'Français' },
  it: { name: 'Italian', nativeName: 'Italiano' },
} as const;

type LangCode = keyof typeof TARGET_LANGUAGES;

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const EN_LOCALE_PATH = path.join(LOCALES_DIR, 'en.json');

// Translation context
const TRANSLATION_CONTEXT = `You are translating UI strings for a CBD health information website.

Guidelines:
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for the target country
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Preserve any template variables like {{count}}, {{year}}, {{minutes}} exactly
- Keep the JSON structure and keys unchanged
- Only translate the string VALUES, not the keys
- For short UI text, keep translations concise
- Use native medical terminology where appropriate`;

async function translateLocale(
  client: Anthropic,
  sourceLocale: Record<string, unknown>,
  langCode: LangCode
): Promise<Record<string, unknown>> {
  const langInfo = TARGET_LANGUAGES[langCode];

  console.log(`\n📝 Translating to ${langInfo.name} (${langInfo.nativeName})...`);

  // Split into chunks to avoid token limits
  // Translate section by section for better accuracy
  const sections = Object.keys(sourceLocale);
  const translatedLocale: Record<string, unknown> = {};

  for (const section of sections) {
    const sectionData = sourceLocale[section];

    console.log(`   - Translating section: ${section}...`);

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${TRANSLATION_CONTEXT}

Translate this JSON section from English to ${langInfo.name} (${langInfo.nativeName}).
Keep ALL keys unchanged, only translate string values.

Section: "${section}"

JSON to translate:
${JSON.stringify(sectionData, null, 2)}

Respond with ONLY the translated JSON object, no explanations:`,
        },
      ],
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';

    // Extract JSON from response
    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      translatedLocale[section] = JSON.parse(jsonStr);
    } catch (error) {
      console.error(`   ❌ Failed to parse section ${section}:`, error);
      console.error(`   Response was: ${jsonStr.substring(0, 200)}...`);
      // Use original if translation fails
      translatedLocale[section] = sectionData;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return translatedLocale;
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const langArg = args.find((a) => a.startsWith('--lang='));

  if (!langArg) {
    console.log('Usage: npx tsx scripts/translate-locales.ts --lang=da|sv|no|de|nl|fi|fr|it|all');
    process.exit(1);
  }

  const langValue = langArg.replace('--lang=', '');
  let targetLangs: LangCode[];

  if (langValue === 'all') {
    targetLangs = Object.keys(TARGET_LANGUAGES) as LangCode[];
  } else {
    targetLangs = langValue.split(',') as LangCode[];
    // Validate languages
    for (const lang of targetLangs) {
      if (!(lang in TARGET_LANGUAGES)) {
        console.error(`Unknown language: ${lang}`);
        console.log(`Available: ${Object.keys(TARGET_LANGUAGES).join(', ')}`);
        process.exit(1);
      }
    }
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    console.log('Run: export ANTHROPIC_API_KEY=your-api-key');
    process.exit(1);
  }

  // Load English locale
  console.log('📖 Loading English locale...');
  const enLocale = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf-8'));

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log(`\n🌍 Will translate to: ${targetLangs.join(', ')}`);

  // Translate each language
  for (const langCode of targetLangs) {
    try {
      const translated = await translateLocale(client, enLocale, langCode);

      // Save translated locale
      const outputPath = path.join(LOCALES_DIR, `${langCode}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2) + '\n');

      console.log(`✅ Saved: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to translate ${langCode}:`, error);
    }
  }

  console.log('\n🎉 Translation complete!');

  // Update the locales/index.ts to include new locales
  console.log('\n📝 Updating locales/index.ts...');

  const indexPath = path.join(LOCALES_DIR, 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Add imports for new locales
  const newImports: string[] = [];
  for (const lang of targetLangs) {
    const importLine = `import ${lang}Locale from './${lang}.json';`;
    if (!indexContent.includes(importLine)) {
      newImports.push(importLine);
    }
  }

  if (newImports.length > 0) {
    // Add imports after the English import
    indexContent = indexContent.replace(
      "import enLocale from './en.json';",
      `import enLocale from './en.json';\n${newImports.join('\n')}`
    );

    // Update cache initialization
    const cacheUpdate = targetLangs.map((lang) => `  ${lang}: ${lang}Locale,`).join('\n');
    indexContent = indexContent.replace(
      'const localeCache: Partial<Record<LanguageCode, LocaleStrings>> = {\n  en: enLocale,\n};',
      `const localeCache: Partial<Record<LanguageCode, LocaleStrings>> = {\n  en: enLocale,\n${cacheUpdate}\n};`
    );

    // Update getAvailableLocales
    const availableLocales = ['en', ...targetLangs].map((l) => `'${l}'`).join(', ');
    indexContent = indexContent.replace(
      "const available: LanguageCode[] = ['en'];",
      `const available: LanguageCode[] = [${availableLocales}];`
    );

    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Updated locales/index.ts');
  }

  console.log('\n✨ All done! You can now use translated locales in your app.');
}

main().catch(console.error);
