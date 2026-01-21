/**
 * Batch Content Generation Script
 *
 * Generates meta titles, findings, and country data for all studies missing them.
 *
 * Usage:
 *   npx tsx scripts/batch-generate-content.ts
 *   npx tsx scripts/batch-generate-content.ts --meta-only
 *   npx tsx scripts/batch-generate-content.ts --country-only
 *   npx tsx scripts/batch-generate-content.ts --batch-size=20
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Configuration
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '10', 10);
const META_ONLY = process.argv.includes('--meta-only');
const COUNTRY_ONLY = process.argv.includes('--country-only');
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches
const DELAY_BETWEEN_API_CALLS = 1500; // 1.5 seconds between individual API calls

// Country detection patterns
const COUNTRY_PATTERNS: Record<string, RegExp[]> = {
  US: [
    /\b(United States|USA|U\.S\.A\.|U\.S\.|American)\b/i,
    /\b(NIH|FDA|CDC|Veterans Affairs)\b/,
    /\b(University of California|Harvard|Stanford|Johns Hopkins|Mayo Clinic|UCLA|NYU|MIT|Yale|Columbia University|Cornell|Duke|University of Michigan|University of Pennsylvania|University of Texas|University of Florida|University of Colorado|University of Washington|Cleveland Clinic)\b/i,
    /\b(California|New York|Texas|Florida|Massachusetts|Colorado|Washington DC|Maryland|Pennsylvania|Illinois|Ohio|Michigan|Arizona|Georgia)\b/,
  ],
  GB: [
    /\b(United Kingdom|UK|U\.K\.|Britain|British|England|Scotland|Wales)\b/i,
    /\b(NHS|University of Oxford|Cambridge University|Imperial College|King's College|UCL|University College London|Edinburgh|Manchester University|University of Birmingham|University of Bristol|GW Pharmaceuticals)\b/i,
    /\b(London|Oxford|Cambridge|Edinburgh|Manchester|Birmingham|Bristol|Liverpool|Leeds|Glasgow)\b/,
  ],
  CA: [
    /\b(Canada|Canadian)\b/i,
    /\b(University of Toronto|McGill|University of British Columbia|UBC|McMaster|University of Alberta|University of Calgary|University of Montreal)\b/i,
    /\b(Toronto|Vancouver|Montreal|Calgary|Ottawa|Alberta|Ontario|Quebec|British Columbia)\b/,
  ],
  AU: [
    /\b(Australia|Australian)\b/i,
    /\b(University of Sydney|University of Melbourne|Monash|University of Queensland|UNSW|University of New South Wales)\b/i,
    /\b(Sydney|Melbourne|Brisbane|Perth|Adelaide|Queensland|Victoria|New South Wales)\b/,
  ],
  DE: [
    /\b(Germany|German|Deutschland)\b/i,
    /\b(Charité|University of Munich|LMU|Heidelberg University|University of Cologne|Max Planck)\b/i,
    /\b(Berlin|Munich|Hamburg|Frankfurt|Cologne|Heidelberg|Dresden|Leipzig)\b/,
  ],
  IL: [
    /\b(Israel|Israeli)\b/i,
    /\b(Hebrew University|Tel Aviv University|Technion|Weizmann|Ben-Gurion|Hadassah|Sheba Medical|Rambam)\b/i,
    /\b(Tel Aviv|Jerusalem|Haifa|Beer Sheva)\b/,
  ],
  NL: [
    /\b(Netherlands|Dutch|Holland)\b/i,
    /\b(University of Amsterdam|Leiden University|Utrecht University|Erasmus|VU Amsterdam|Maastricht University)\b/i,
    /\b(Amsterdam|Rotterdam|Utrecht|Leiden|Maastricht|The Hague)\b/,
  ],
  CH: [
    /\b(Switzerland|Swiss)\b/i,
    /\b(ETH Zurich|University of Zurich|University of Geneva|University of Bern|University of Basel|EPFL)\b/i,
    /\b(Zurich|Geneva|Basel|Bern|Lausanne)\b/,
  ],
  BR: [
    /\b(Brazil|Brazilian|Brasil)\b/i,
    /\b(University of São Paulo|USP|UNICAMP|Federal University|UFRJ)\b/i,
    /\b(São Paulo|Rio de Janeiro|Brasilia|Belo Horizonte)\b/,
  ],
  CN: [
    /\b(China|Chinese|PRC)\b/i,
    /\b(Peking University|Tsinghua|Fudan|Shanghai Jiao Tong|Zhejiang University|Chinese Academy)\b/i,
    /\b(Beijing|Shanghai|Guangzhou|Shenzhen|Hangzhou|Nanjing|Wuhan)\b/,
  ],
  JP: [
    /\b(Japan|Japanese)\b/i,
    /\b(University of Tokyo|Kyoto University|Osaka University|Tohoku University|Keio|Waseda)\b/i,
    /\b(Tokyo|Osaka|Kyoto|Nagoya|Yokohama|Sapporo|Fukuoka)\b/,
  ],
  IT: [
    /\b(Italy|Italian|Italia)\b/i,
    /\b(University of Milan|University of Rome|La Sapienza|University of Bologna|Università)\b/i,
    /\b(Rome|Milan|Florence|Venice|Naples|Turin|Bologna)\b/,
  ],
  FR: [
    /\b(France|French)\b/i,
    /\b(Sorbonne|University of Paris|INSERM|CNRS|Institut Pasteur|Université)\b/i,
    /\b(Paris|Lyon|Marseille|Bordeaux|Toulouse|Lille|Strasbourg)\b/,
  ],
  ES: [
    /\b(Spain|Spanish|España)\b/i,
    /\b(University of Barcelona|University of Madrid|Universidad Complutense|Universidad Autónoma)\b/i,
    /\b(Madrid|Barcelona|Valencia|Sevilla|Bilbao|Malaga)\b/,
  ],
  SE: [
    /\b(Sweden|Swedish)\b/i,
    /\b(Karolinska|Uppsala University|Lund University|University of Gothenburg|Stockholm University)\b/i,
    /\b(Stockholm|Gothenburg|Malmö|Uppsala|Lund)\b/,
  ],
  DK: [
    /\b(Denmark|Danish)\b/i,
    /\b(University of Copenhagen|Aarhus University|Technical University of Denmark|DTU)\b/i,
    /\b(Copenhagen|Aarhus|Odense|Aalborg)\b/,
  ],
  KR: [
    /\b(South Korea|Korean|Korea)\b/i,
    /\b(Seoul National University|Yonsei|Korea University|KAIST|Sungkyunkwan)\b/i,
    /\b(Seoul|Busan|Incheon|Daegu)\b/,
  ],
  IN: [
    /\b(India|Indian)\b/i,
    /\b(AIIMS|IIT|Indian Institute|University of Delhi|NIMHANS)\b/i,
    /\b(Delhi|Mumbai|Bangalore|Chennai|Kolkata|Hyderabad|Pune)\b/,
  ],
  PL: [
    /\b(Poland|Polish)\b/i,
    /\b(University of Warsaw|Jagiellonian|Medical University of Warsaw)\b/i,
    /\b(Warsaw|Krakow|Wrocław|Gdańsk|Poznań)\b/,
  ],
  AT: [
    /\b(Austria|Austrian)\b/i,
    /\b(University of Vienna|Medical University of Vienna|University of Innsbruck)\b/i,
    /\b(Vienna|Salzburg|Innsbruck|Graz)\b/,
  ],
  BE: [
    /\b(Belgium|Belgian)\b/i,
    /\b(KU Leuven|Ghent University|Université Libre de Bruxelles)\b/i,
    /\b(Brussels|Antwerp|Ghent|Leuven|Liège)\b/,
  ],
  IE: [
    /\b(Ireland|Irish)\b/i,
    /\b(Trinity College Dublin|University College Dublin|UCD|National University of Ireland)\b/i,
    /\b(Dublin|Cork|Galway|Limerick)\b/,
  ],
  NZ: [
    /\b(New Zealand|NZ)\b/i,
    /\b(University of Auckland|University of Otago|Victoria University of Wellington)\b/i,
    /\b(Auckland|Wellington|Christchurch|Dunedin)\b/,
  ],
  PT: [
    /\b(Portugal|Portuguese)\b/i,
    /\b(University of Lisbon|University of Porto|University of Coimbra)\b/i,
    /\b(Lisbon|Porto|Coimbra)\b/,
  ],
  NO: [
    /\b(Norway|Norwegian)\b/i,
    /\b(University of Oslo|Norwegian University|NTNU|University of Bergen)\b/i,
    /\b(Oslo|Bergen|Trondheim|Stavanger)\b/,
  ],
  CZ: [
    /\b(Czech|Czechia|Czech Republic)\b/i,
    /\b(Charles University|Masaryk University|Czech Technical University)\b/i,
    /\b(Prague|Brno|Ostrava)\b/,
  ],
  MX: [
    /\b(Mexico|Mexican)\b/i,
    /\b(UNAM|Universidad Nacional|Instituto Politécnico)\b/i,
    /\b(Mexico City|Guadalajara|Monterrey)\b/,
  ],
  AR: [
    /\b(Argentina|Argentine)\b/i,
    /\b(University of Buenos Aires|UBA)\b/i,
    /\b(Buenos Aires|Córdoba|Rosario)\b/,
  ],
  ZA: [
    /\b(South Africa|South African)\b/i,
    /\b(University of Cape Town|University of Witwatersrand|Stellenbosch)\b/i,
    /\b(Cape Town|Johannesburg|Pretoria|Durban)\b/,
  ],
};

function detectCountry(text: string): string | null {
  if (!text) return null;

  const scores: Record<string, number> = {};

  for (const [code, patterns] of Object.entries(COUNTRY_PATTERNS)) {
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern, 'gi'));
      if (matches) {
        scores[code] = (scores[code] || 0) + matches.length;
      }
    }
  }

  let maxScore = 0;
  let detectedCountry: string | null = null;

  for (const [code, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedCountry = code;
    }
  }

  // Only return if we have reasonable confidence (at least 2 matches)
  return maxScore >= 2 ? detectedCountry : null;
}

interface StudyData {
  id: string;
  title: string;
  year?: number;
  relevant_topics?: string[];
  plain_summary?: string;
  abstract?: string;
}

interface GeneratedContent {
  display_title: string;
  key_findings: Array<{ type: string; text: string }>;
  limitations: Array<{ type: string; text: string }>;
  meta_title: string;
  meta_description: string;
}

function truncateContent(content: GeneratedContent): GeneratedContent {
  return {
    ...content,
    display_title: content.display_title?.slice(0, 250) || '',
    meta_title: content.meta_title?.slice(0, 60) || '',
    meta_description: content.meta_description?.slice(0, 155) || '',
  };
}

async function generateStudyContent(
  study: StudyData,
  apiKey: string,
  maxRetries: number = 3
): Promise<GeneratedContent> {
  const topics = study.relevant_topics?.join(', ') || 'CBD research';

  const prompt = `You are generating SEO content for a CBD research study page.

STUDY DATA:
Title: ${study.title}
Year: ${study.year || 'Unknown'}
Topics: ${topics}
Summary: ${study.plain_summary || 'Not available'}
Abstract: ${study.abstract || 'Not available'}

Generate the following:

1. DISPLAY_TITLE (readable H1, max 80 chars)
Format: "CBD for [Condition]: [Year] [Study Type] Results"

2. KEY_FINDINGS (3-5 findings as JSON array)
Each finding: { "type": "finding", "text": "..." }
Focus on: methodology, dosage, sample size, outcomes

3. LIMITATIONS (2-3 limitations as JSON array)
Each limitation: { "type": "limitation", "text": "..." }

4. META_TITLE (50-60 characters max)
Format: "CBD for [Condition]: [Year] [Type] | CBD Portal"

5. META_DESCRIPTION (145-155 characters max)
Include: study type, sample size if known, key finding

Return as JSON only, no markdown code blocks:
{
  "display_title": "...",
  "key_findings": [...],
  "limitations": [...],
  "meta_title": "...",
  "meta_description": "..."
}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000 * attempt;
        console.log(`  ⏳ Rate limited, waiting ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text?.trim();

      if (!content) throw new Error('No content generated');

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not extract JSON');

      const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;
      return truncateContent(parsed);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        console.log(`  ⚠️ Attempt ${attempt} failed, retrying...`);
        await new Promise(r => setTimeout(r, 2000 * attempt));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

async function main() {
  console.log('\n🚀 CBD Portal Batch Content Generator\n');
  console.log('Configuration:');
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Mode: ${META_ONLY ? 'Meta only' : COUNTRY_ONLY ? 'Country only' : 'Both meta and country'}\n`);

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!COUNTRY_ONLY && !anthropicKey) {
    console.error('❌ Missing ANTHROPIC_API_KEY (required for meta generation)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get initial stats
  const { count: totalApproved } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: needsMeta } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .or('key_findings.is.null,key_findings.eq.[]');

  const { count: needsCountry } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .is('country', null);

  console.log('📊 Current Status:');
  console.log(`  Total approved studies: ${totalApproved}`);
  console.log(`  Needs meta & findings: ${needsMeta}`);
  console.log(`  Needs country data: ${needsCountry}\n`);

  // Process Meta & Findings
  if (!COUNTRY_ONLY && needsMeta && needsMeta > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 GENERATING META TITLES & FINDINGS');
    console.log('═══════════════════════════════════════════════════════════\n');

    let processed = 0;
    let successful = 0;
    let failed = 0;
    let remaining = needsMeta;

    while (remaining > 0) {
      console.log(`\n🔄 Processing batch (${processed}/${needsMeta} done, ${remaining} remaining)...\n`);

      // Fetch batch
      const { data: studies, error: fetchError } = await supabase
        .from('kb_research_queue')
        .select('id, title, year, relevant_topics, plain_summary, abstract')
        .eq('status', 'approved')
        .or('key_findings.is.null,key_findings.eq.[]')
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .limit(BATCH_SIZE);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError.message);
        break;
      }

      if (!studies || studies.length === 0) {
        console.log('✅ All studies have meta content!');
        break;
      }

      for (const study of studies) {
        const shortTitle = study.title?.substring(0, 50) || study.id;
        process.stdout.write(`  • ${shortTitle}... `);

        try {
          const content = await generateStudyContent(study as StudyData, anthropicKey!);

          const { error: updateError } = await supabase
            .from('kb_research_queue')
            .update({
              display_title: content.display_title,
              key_findings: content.key_findings,
              limitations: content.limitations,
              meta_title: content.meta_title,
              meta_description: content.meta_description,
            })
            .eq('id', study.id);

          if (updateError) throw new Error(updateError.message);

          console.log('✅');
          successful++;
        } catch (error) {
          console.log(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
          failed++;
        }

        processed++;
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_API_CALLS));
      }

      // Update remaining count
      const { count } = await supabase
        .from('kb_research_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .or('key_findings.is.null,key_findings.eq.[]');

      remaining = count || 0;

      if (remaining > 0) {
        console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('\n📊 Meta Generation Results:');
    console.log(`  ✅ Successful: ${successful}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  📝 Total processed: ${processed}\n`);
  }

  // Process Country Data
  if (!META_ONLY && needsCountry && needsCountry > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌍 DETECTING & ASSIGNING COUNTRY DATA');
    console.log('═══════════════════════════════════════════════════════════\n');

    let processed = 0;
    let detected = 0;
    let undetected = 0;
    let offset = 0;

    while (true) {
      // Fetch batch
      const { data: studies, error: fetchError } = await supabase
        .from('kb_research_queue')
        .select('id, title, abstract')
        .eq('status', 'approved')
        .is('country', null)
        .order('relevance_score', { ascending: false, nullsFirst: false })
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError.message);
        break;
      }

      if (!studies || studies.length === 0) {
        break;
      }

      console.log(`\n🔄 Processing batch ${Math.floor(offset / BATCH_SIZE) + 1} (${studies.length} studies)...\n`);

      for (const study of studies) {
        const text = `${study.title || ''} ${study.abstract || ''}`;
        const country = detectCountry(text);
        const shortTitle = study.title?.substring(0, 50) || study.id;

        if (country) {
          process.stdout.write(`  • ${shortTitle}... `);

          const { error: updateError } = await supabase
            .from('kb_research_queue')
            .update({ country })
            .eq('id', study.id);

          if (updateError) {
            console.log(`❌ ${updateError.message}`);
          } else {
            console.log(`✅ ${country}`);
            detected++;
          }
        } else {
          undetected++;
        }

        processed++;
      }

      // Don't increment offset - we're always fetching studies with null country
      // So processed ones won't appear in next fetch

      // Check if there are more
      const { count: remaining } = await supabase
        .from('kb_research_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .is('country', null);

      if (!remaining || remaining === 0) {
        break;
      }

      console.log(`\n  📊 Progress: ${detected} detected, ${undetected} undetected, ${remaining} remaining`);
    }

    console.log('\n📊 Country Detection Results:');
    console.log(`  ✅ Detected & saved: ${detected}`);
    console.log(`  ❓ Could not detect: ${undetected}`);
    console.log(`  📝 Total processed: ${processed}\n`);
  }

  // Final stats
  const { count: finalMeta } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('meta_title', 'is', null)
    .not('key_findings', 'is', null);

  const { count: finalCountry } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .not('country', 'is', null);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 FINAL STATUS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Meta & Findings: ${finalMeta}/${totalApproved} (${Math.round(((finalMeta || 0) / (totalApproved || 1)) * 100)}%)`);
  console.log(`  Country Data: ${finalCountry}/${totalApproved} (${Math.round(((finalCountry || 0) / (totalApproved || 1)) * 100)}%)`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
