#!/usr/bin/env npx tsx
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const anthropic = new Anthropic();

const missing = [
  { term: "Grapefruit Interaction", lang: "no", langName: "Norwegian" },
  { term: "Grapefruit Interaction", lang: "nl", langName: "Dutch" },
  { term: "Heavy Metals Testing", lang: "it", langName: "Italian" },
  { term: "Hydrocarbon Extraction", lang: "it", langName: "Italian" },
];

async function translate() {
  for (const item of missing) {
    const { data: term } = await supabase
      .from("kb_glossary")
      .select("*")
      .eq("term", item.term)
      .single();

    if (!term) {
      console.log("Term not found:", item.term);
      continue;
    }

    console.log(`🔄 Translating: ${item.term} → ${item.langName}`);

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Translate this CBD glossary term to ${item.langName}. Return JSON with: term, definition, simple_definition (or null).

English term: ${term.term}
Definition: ${term.definition}${term.short_definition ? `\nSimple definition: ${term.short_definition}` : ""}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("Failed to parse:", text);
      continue;
    }

    const translated = JSON.parse(jsonMatch[0]);

    const { error } = await supabase.from("glossary_translations").insert({
      term_id: term.id,
      language: item.lang,
      term: translated.term,
      definition: translated.definition,
      simple_definition: translated.simple_definition || null,
      translation_quality: "ai",
    });

    if (error) {
      console.log("Insert error:", error.message);
    } else {
      console.log(`✅ Saved: ${translated.term}`);
    }
  }
}

translate().catch(console.error);
