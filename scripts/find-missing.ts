#!/usr/bin/env npx tsx
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const LANGUAGES = ['da', 'sv', 'no', 'de', 'nl', 'fi', 'fr', 'it'];

async function findMissing() {
  // Get all glossary terms
  const { data: terms } = await supabase
    .from("kb_glossary")
    .select("id, term")
    .order("term");

  if (!terms) {
    console.log("No terms found");
    return;
  }

  console.log(`Total glossary terms: ${terms.length}\n`);

  // Get all existing translations
  const { data: translations } = await supabase
    .from("glossary_translations")
    .select("term_id, language");

  // Build a set of existing translations
  const existing = new Set<string>();
  translations?.forEach(t => {
    existing.add(`${t.term_id}:${t.language}`);
  });

  // Find missing
  const missing: { term: string; languages: string[] }[] = [];

  for (const term of terms) {
    const missingLangs: string[] = [];
    for (const lang of LANGUAGES) {
      if (!existing.has(`${term.id}:${lang}`)) {
        missingLangs.push(lang);
      }
    }
    if (missingLangs.length > 0) {
      missing.push({ term: term.term, languages: missingLangs });
    }
  }

  if (missing.length === 0) {
    console.log("No missing translations!");
  } else {
    console.log(`Missing translations for ${missing.length} terms:\n`);
    missing.forEach(m => {
      console.log(`  "${m.term}" missing: ${m.languages.join(', ')}`);
    });
  }
}

findMissing().catch(console.error);
