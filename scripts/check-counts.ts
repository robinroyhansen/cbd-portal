#!/usr/bin/env npx tsx
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function check() {
  // Get glossary counts by language (use range to get all)
  const { count: glossTotalCount } = await supabase
    .from("glossary_translations")
    .select("*", { count: "exact", head: true });

  // Get all data with pagination
  let allGlossData: { language: string }[] = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data } = await supabase
      .from("glossary_translations")
      .select("language")
      .range(offset, offset + pageSize - 1);
    if (!data || data.length === 0) break;
    allGlossData = allGlossData.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  const counts: Record<string, number> = {};
  allGlossData.forEach(r => {
    counts[r.language] = (counts[r.language] || 0) + 1;
  });

  console.log("GLOSSARY translations by language:");
  Object.entries(counts).sort().forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count}`);
  });
  console.log(`  TOTAL: ${Object.values(counts).reduce((a, b) => a + b, 0)} (count: ${glossTotalCount})`);

  // Get condition counts with pagination
  let allCondData: { language: string }[] = [];
  offset = 0;
  while (true) {
    const { data: condData } = await supabase
      .from("condition_translations")
      .select("language")
      .range(offset, offset + pageSize - 1);
    if (!condData || condData.length === 0) break;
    allCondData = allCondData.concat(condData);
    if (condData.length < pageSize) break;
    offset += pageSize;
  }

  const condCounts: Record<string, number> = {};
  allCondData.forEach(r => {
    condCounts[r.language] = (condCounts[r.language] || 0) + 1;
  });

  console.log("\nCONDITION translations by language:");
  Object.entries(condCounts).sort().forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count}`);
  });
  console.log(`  TOTAL: ${Object.values(condCounts).reduce((a, b) => a + b, 0)}`);

  // Get source table counts
  const { count: condCount } = await supabase.from("kb_conditions").select("*", { count: "exact", head: true });
  const { count: glossCount } = await supabase.from("kb_glossary").select("*", { count: "exact", head: true });

  console.log(`\nSource tables:`);
  console.log(`  kb_conditions: ${condCount}`);
  console.log(`  kb_glossary: ${glossCount}`);
  console.log(`\nExpected (8 languages):`);
  console.log(`  Conditions: ${(condCount || 0) * 8}`);
  console.log(`  Glossary: ${(glossCount || 0) * 8}`);
}

check().catch(console.error);
