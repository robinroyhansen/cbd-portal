#!/usr/bin/env npx tsx
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAllRows(table: string): Promise<{ language: string }[]> {
  let allData: { language: string }[] = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from(table)
      .select("language")
      .range(offset, offset + pageSize - 1);
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return allData;
}

async function main() {
  console.log("=== TRANSLATION VALIDATION ===\n");

  // Condition translations breakdown with pagination
  const condData = await getAllRows("condition_translations");
  const condByLang: Record<string, number> = {};
  condData.forEach(row => { condByLang[row.language] = (condByLang[row.language] || 0) + 1; });

  console.log("CONDITION TRANSLATIONS BY LANGUAGE:");
  let condTotal = 0;
  Object.keys(condByLang).sort().forEach(lang => {
    console.log(`  ${lang}: ${condByLang[lang]}`);
    condTotal += condByLang[lang];
  });
  console.log(`  TOTAL: ${condTotal}`);

  // Glossary translations breakdown with pagination
  const glossData = await getAllRows("glossary_translations");
  const glossByLang: Record<string, number> = {};
  glossData.forEach(row => { glossByLang[row.language] = (glossByLang[row.language] || 0) + 1; });

  console.log("\nGLOSSARY TRANSLATIONS BY LANGUAGE:");
  let glossTotal = 0;
  Object.keys(glossByLang).sort().forEach(lang => {
    console.log(`  ${lang}: ${glossByLang[lang]}`);
    glossTotal += glossByLang[lang];
  });
  console.log(`  TOTAL: ${glossTotal}`);

  // Coverage check
  const { count: totalConditions } = await supabase.from("kb_conditions").select("*", { count: "exact", head: true });
  const { count: totalGlossary } = await supabase.from("kb_glossary").select("*", { count: "exact", head: true });

  const expectedCond = (totalConditions || 0) * 8;
  const expectedGloss = (totalGlossary || 0) * 8;

  console.log("\n=== COVERAGE SUMMARY ===");
  console.log(`Conditions: ${condTotal} / ${expectedCond} (${Math.round(condTotal / expectedCond * 100)}%)`);
  console.log(`Glossary: ${glossTotal} / ${expectedGloss} (${Math.round(glossTotal / expectedGloss * 100)}%)`);

  // Sample translations to verify quality
  console.log("\n=== SAMPLE TRANSLATIONS ===");

  const { data: sample1 } = await supabase
    .from("condition_translations")
    .select("language, name, display_name")
    .limit(5);
  console.log("\nCondition samples:");
  sample1?.forEach(s => console.log(`  [${s.language}] ${s.name}`));

  const { data: sample2 } = await supabase
    .from("glossary_translations")
    .select("language, term")
    .limit(5);
  console.log("\nGlossary samples:");
  sample2?.forEach(s => console.log(`  [${s.language}] ${s.term}`));
}

main().catch(console.error);
