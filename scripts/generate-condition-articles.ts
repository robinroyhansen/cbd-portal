/**
 * Script to generate comprehensive articles for all conditions with research
 * Run with: npx ts-node scripts/generate-condition-articles.ts
 */

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

interface ConditionStatus {
  slug: string;
  name: string;
  hasContent: boolean;
  researchCount: number;
}

interface GenerationResult {
  condition: string;
  success: boolean;
  error?: string;
}

async function getConditions(): Promise<ConditionStatus[]> {
  const res = await fetch(`${BASE_URL}/api/admin/conditions/generate-content`);
  const data = await res.json();
  return data.conditions || [];
}

async function generateContent(slug: string): Promise<GenerationResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/conditions/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conditionSlug: slug, preview: false })
    });

    const data = await res.json();

    if (!res.ok) {
      return { condition: slug, success: false, error: data.error };
    }

    return { condition: data.condition, success: true };
  } catch (error) {
    return {
      condition: slug,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function main() {
  console.log('🚀 Starting condition article generation...\n');

  // Get all conditions
  const conditions = await getConditions();

  // Filter to conditions that need content and have research
  const needsContent = conditions
    .filter(c => !c.hasContent && c.researchCount > 0)
    .sort((a, b) => b.researchCount - a.researchCount);

  console.log(`📊 Found ${needsContent.length} conditions with research that need content\n`);

  // Process conditions one at a time (to avoid rate limiting)
  const results: GenerationResult[] = [];

  for (let i = 0; i < needsContent.length; i++) {
    const condition = needsContent[i];
    console.log(`[${i + 1}/${needsContent.length}] Generating: ${condition.name} (${condition.researchCount} studies)...`);

    const result = await generateContent(condition.slug);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ Success`);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }

    // Small delay between requests to avoid rate limiting
    if (i < needsContent.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(50));
  console.log(`📈 Generation Complete`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('='.repeat(50));
}

main().catch(console.error);
