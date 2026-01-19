import { InteractionSeverity, SeverityInfo } from '@/types/drug-interactions';

// =============================================================================
// Severity Configuration
// =============================================================================

export const SEVERITY_CONFIG: Record<InteractionSeverity, SeverityInfo> = {
  major: {
    level: 'major',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
    label: 'Major Interaction',
    shortLabel: 'Major',
    description:
      'Avoid this combination unless under close medical supervision. Significant risk of adverse effects or altered drug effectiveness. Consult your doctor before using CBD with this medication.',
  },
  moderate: {
    level: 'moderate',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
    label: 'Moderate Interaction',
    shortLabel: 'Moderate',
    description:
      'Use with caution. Monitor for side effects and consider timing separation or dose adjustments. Discuss with your healthcare provider before combining.',
  },
  minor: {
    level: 'minor',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
    label: 'Minor Interaction',
    shortLabel: 'Minor',
    description:
      'Low risk interaction. Be aware of potential effects but generally considered safe with normal CBD use. Inform your healthcare provider you are using CBD.',
  },
  unknown: {
    level: 'unknown',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-800',
    iconColor: 'text-gray-600',
    label: 'Unknown Interaction',
    shortLabel: 'Unknown',
    description:
      'Insufficient research data available. Exercise caution and consult your healthcare provider before combining CBD with this medication.',
  },
};

/**
 * Get severity info for a given severity level
 */
export function getSeverityInfo(severity: InteractionSeverity): SeverityInfo {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.unknown;
}

/**
 * Get all severity levels in order of risk (highest to lowest)
 */
export function getSeverityLevels(): InteractionSeverity[] {
  return ['major', 'moderate', 'minor', 'unknown'];
}

/**
 * Compare two severity levels
 * Returns negative if a is more severe, positive if b is more severe, 0 if equal
 */
export function compareSeverity(
  a: InteractionSeverity,
  b: InteractionSeverity
): number {
  const order: Record<InteractionSeverity, number> = {
    major: 0,
    moderate: 1,
    minor: 2,
    unknown: 3,
  };
  return order[a] - order[b];
}

// =============================================================================
// CYP Enzyme Information
// =============================================================================

export const CYP_ENZYME_INFO: Record<
  string,
  { name: string; description: string; percentage: string }
> = {
  CYP3A4: {
    name: 'CYP3A4',
    description:
      'The most abundant cytochrome P450 enzyme, responsible for metabolizing approximately 50% of all medications.',
    percentage: '~50% of drugs',
  },
  CYP2C19: {
    name: 'CYP2C19',
    description:
      'Important for metabolizing many psychiatric medications, proton pump inhibitors, and antiplatelet drugs.',
    percentage: '~10% of drugs',
  },
  CYP2D6: {
    name: 'CYP2D6',
    description:
      'Metabolizes many antidepressants, opioids, and antipsychotics. Shows significant genetic variation.',
    percentage: '~25% of drugs',
  },
  CYP2C9: {
    name: 'CYP2C9',
    description:
      'Critical for metabolizing warfarin, NSAIDs, and some oral hypoglycemics.',
    percentage: '~15% of drugs',
  },
  CYP1A2: {
    name: 'CYP1A2',
    description:
      'Metabolizes caffeine, theophylline, and some antipsychotics. Activity affected by smoking.',
    percentage: '~5% of drugs',
  },
};

/**
 * Get CYP enzyme display information
 */
export function getCypEnzymeInfo(enzyme: string) {
  return CYP_ENZYME_INFO[enzyme] || null;
}

// =============================================================================
// Mechanism Explanations
// =============================================================================

export const MECHANISM_EXPLANATIONS: Record<string, string> = {
  cyp3a4_inhibition:
    'CBD inhibits the CYP3A4 enzyme, which can slow down how your body processes this medication. This may lead to higher levels of the medication in your blood, potentially increasing both its effects and side effects.',
  cyp2c19_inhibition:
    'CBD inhibits the CYP2C19 enzyme, affecting how your body breaks down this medication. This can result in elevated drug levels and prolonged effects.',
  cyp2d6_inhibition:
    'CBD can inhibit the CYP2D6 enzyme, which may slow the metabolism of this medication and increase its blood levels.',
  cyp2c9_inhibition:
    'CBD inhibits the CYP2C9 enzyme, which can significantly affect how your body processes this medication, particularly warfarin and related drugs.',
  pharmacodynamic:
    'CBD and this medication may have additive or synergistic effects on the body, potentially enhancing therapeutic effects but also side effects like sedation.',
  protein_binding:
    'Both CBD and this medication compete for binding sites on blood proteins, which may affect how much active drug is available in your system.',
  transporter:
    'CBD may affect drug transporters that move this medication in and out of cells, potentially altering its distribution and effectiveness.',
  multiple:
    'CBD interacts with this medication through multiple mechanisms, making the interaction more complex and potentially more significant.',
  unknown:
    'The exact mechanism of interaction is not fully understood. The interaction may involve CYP enzymes, transporters, or other pathways.',
};

/**
 * Get explanation for a given mechanism
 */
export function getMechanismExplanation(mechanism: string): string {
  return (
    MECHANISM_EXPLANATIONS[mechanism] ||
    MECHANISM_EXPLANATIONS.unknown
  );
}
