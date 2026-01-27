import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function check() {
  // Check if article_translations table exists and get counts
  const { count: articleCount } = await supabase
    .from("kb_articles")
    .select("*", { count: "exact", head: true });

  console.log("Source articles:", articleCount);
  console.log();

  // Get article translation counts by language
  let allData: { language: string }[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("article_translations")
      .select("language")
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.log("Error or no article_translations table:", error.message);
      console.log("\nARTICLE translations: 0 (table may be empty or not exist)");
      return;
    }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  if (allData.length === 0) {
    console.log("ARTICLE translations: 0 (no translations yet)");
    console.log("\nDanish articles translated: 0 of", articleCount);
    return;
  }

  const counts: Record<string, number> = {};
  allData.forEach(r => {
    counts[r.language] = (counts[r.language] || 0) + 1;
  });

  console.log("ARTICLE translations by language:");
  Object.entries(counts).sort().forEach(([lang, count]) => {
    console.log("  " + lang + ": " + count);
  });
  console.log("  TOTAL:", allData.length);
  console.log();
  console.log("Danish (da) articles translated:", counts["da"] || 0, "of", articleCount);
}

check().catch(console.error);
