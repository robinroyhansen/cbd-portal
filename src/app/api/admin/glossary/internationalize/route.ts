import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-api-auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Glossary entries that need internationalization
const updates = [
  {
    slug: 'cgmp',
    short_definition: 'Pharmaceutical manufacturing standards ensuring product quality and consistency.',
    definition: `cGMP (Current Good Manufacturing Practice) represents pharmaceutical manufacturing standards ensuring product quality and consistency. These standards originated with the FDA in the US but are recognized internationally, with similar frameworks in the EU (GMP), UK (MHRA), and other regulatory bodies.

cGMP covers: facility design/maintenance, equipment calibration, personnel training, ingredient sourcing, production procedures, quality testing, packaging, labeling, and record-keeping.

For CBD, cGMP certification indicates the manufacturer follows pharmaceutical-grade procedures even though CBD supplements don't require it in most jurisdictions. It's a mark of quality commitment and reduces contamination/mislabeling risks.`
  },
  {
    slug: 'chemotherapy-induced-nausea',
    short_definition: 'Treatment-related nausea where cannabinoids are approved antiemetics in several countries.',
    definition: `Chemotherapy-induced nausea and vomiting (CINV) is one of the most distressing side effects of cancer treatment. It can be acute (within 24 hours) or delayed (days after treatment).

Cannabinoids were among the first approved medications for CINV. Synthetic cannabinoids like dronabinol and nabilone are approved in multiple countries (US, Canada, parts of Europe) for CINV when other treatments fail. Research shows THC and CBD work through CB1 receptors in the brain's vomiting center. Many cancer patients find cannabis more effective than prescription anti-nausea drugs.`
  },
  {
    slug: 'ethanol-extraction',
    definition: `Ethanol extraction uses food-grade ethyl alcohol to dissolve cannabinoids and terpenes from hemp. It's an efficient, scalable method common in the CBD industry.

Hemp is soaked in ethanol, which strips cannabinoids from the plant material. The ethanol is then evaporated, leaving behind the extract. Cold ethanol extraction better preserves terpenes and reduces chlorophyll extraction.

Advantages: efficient, scalable, safe solvent (evaporates completely), approved for food use by regulatory agencies worldwide. Disadvantages: may extract chlorophyll (green color, bitter taste), requires careful purging. Well-executed ethanol extraction produces quality CBD.`
  },
  {
    slug: 'liver-enzymes',
    definition: `Elevated liver enzymes (ALT, AST) have been observed in some clinical trials of high-dose CBD (particularly Epidiolex at 10-20mg/kg/day). This suggests potential liver stress.

At typical supplement doses (under 100mg daily), liver enzyme elevation is rare. However, those with liver disease or taking hepatotoxic medications should be cautious and may need monitoring.

Regulatory agencies recommend baseline liver enzyme testing before starting prescription CBD (Epidiolex) and periodic monitoring. For CBD supplements, those with liver concerns should consult their doctor and consider periodic testing if using higher doses.`
  },
  {
    slug: 'cbd',
    definition: `Cannabidiol (CBD) is one of over 100 cannabinoids found in the cannabis plant. Unlike THC, CBD does not produce intoxicating effects. It interacts with the body's endocannabinoid system and has been studied for various potential therapeutic applications including anxiety, pain, inflammation, and epilepsy.

Epidiolex, a CBD-based medication, is approved by regulatory agencies in multiple countries (including the US, EU, UK, and Australia) for certain types of epilepsy including Dravet syndrome, Lennox-Gastaut syndrome, and tuberous sclerosis complex.`
  }
];

export async function POST(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  // Verify admin secret
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${process.env.ADMIN_API_SECRET}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: { slug: string; status: string; error?: string }[] = [];

  for (const update of updates) {
    try {
      const updateData: Record<string, string> = {};
      if (update.short_definition) updateData.short_definition = update.short_definition;
      if (update.definition) updateData.definition = update.definition;

      const { error } = await supabase
        .from('kb_glossary')
        .update(updateData)
        .eq('slug', update.slug);

      if (error) {
        results.push({ slug: update.slug, status: 'error', error: error.message });
      } else {
        results.push({ slug: update.slug, status: 'updated' });
      }
    } catch (err) {
      results.push({
        slug: update.slug,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    message: 'Glossary internationalization complete',
    results
  });
}

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  return NextResponse.json({
    message: 'POST to this endpoint to update glossary entries with international content',
    entries_to_update: updates.map(u => u.slug)
  });
}
