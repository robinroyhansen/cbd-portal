import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSeverityInfo } from '@/lib/interactions/severity-config';
import type {
  InteractionCheckResult,
  DrugCategory,
  InteractionSeverity,
  InteractionMechanism,
  Citation,
} from '@/types/drug-interactions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drugId: string }> }
) {
  try {
    const { drugId } = await params;

    if (!drugId) {
      return NextResponse.json({ error: 'Drug ID required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch drug with its interaction in a single query
    const { data: drug, error: drugError } = await supabase
      .from('kb_drugs')
      .select(
        `
        id,
        generic_name,
        slug,
        display_name,
        brand_names,
        synonyms,
        category,
        drug_class,
        primary_cyp_enzymes,
        secondary_cyp_enzymes,
        common_uses,
        is_published
      `
      )
      .eq('id', drugId)
      .eq('is_published', true)
      .single();

    if (drugError || !drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Fetch interaction separately (cleaner than join for this case)
    const { data: interaction, error: interactionError } = await supabase
      .from('kb_drug_interactions')
      .select('*')
      .eq('drug_id', drugId)
      .single();

    // Build response
    const result: InteractionCheckResult = {
      drug: {
        id: drug.id,
        generic_name: drug.generic_name,
        display_name: drug.display_name || drug.generic_name,
        brand_names: drug.brand_names || [],
        category: drug.category as DrugCategory,
        drug_class: drug.drug_class,
        primary_cyp_enzymes: drug.primary_cyp_enzymes || [],
        common_uses: drug.common_uses || [],
      },
      interaction: null,
      severity_info: null,
    };

    if (!interactionError && interaction) {
      // Has known interaction
      result.interaction = {
        severity: interaction.severity as InteractionSeverity,
        mechanism: interaction.mechanism as InteractionMechanism,
        mechanism_description: interaction.mechanism_description,
        clinical_effects: interaction.clinical_effects || [],
        potential_outcomes: interaction.potential_outcomes,
        recommendation: interaction.recommendation,
        monitoring_parameters: interaction.monitoring_parameters || [],
        dose_adjustment_guidance: interaction.dose_adjustment_guidance,
        onset_timeframe: interaction.onset_timeframe,
        evidence_level: interaction.evidence_level,
        citations: (interaction.citations as Citation[]) || [],
        special_populations_notes: interaction.special_populations_notes,
        last_reviewed_at: interaction.last_reviewed_at,
      };
      result.severity_info = getSeverityInfo(
        interaction.severity as InteractionSeverity
      );
    } else {
      // No known interaction
      result.message = `No significant CBD interaction has been documented for ${drug.display_name || drug.generic_name}.`;
      result.general_advice =
        'While no major interaction is documented, always inform your healthcare provider about all supplements you take, including CBD. Individual responses can vary, and new research may reveal interactions not currently known.';
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=600' }, // 10 min cache
    });
  } catch (error) {
    console.error('[Interaction Lookup] Error:', error);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
