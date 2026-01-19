// =============================================================================
// Drug Interaction Types for CBD Drug Interaction Checker
// =============================================================================

// Database enum types
export type DrugCategory =
  | 'anticoagulant'
  | 'antiepileptic'
  | 'immunosuppressant'
  | 'benzodiazepine'
  | 'antidepressant'
  | 'opioid'
  | 'statin'
  | 'beta_blocker'
  | 'calcium_channel_blocker'
  | 'antipsychotic'
  | 'proton_pump_inhibitor'
  | 'antihistamine'
  | 'nsaid'
  | 'other';

export type InteractionSeverity = 'major' | 'moderate' | 'minor' | 'unknown';

export type InteractionMechanism =
  | 'cyp3a4_inhibition'
  | 'cyp2c19_inhibition'
  | 'cyp2d6_inhibition'
  | 'cyp2c9_inhibition'
  | 'pharmacodynamic'
  | 'protein_binding'
  | 'transporter'
  | 'multiple'
  | 'unknown';

// =============================================================================
// Citation type for medical references
// =============================================================================

export interface Citation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  pmid?: string;
  url?: string;
}

// =============================================================================
// Database Row Types
// =============================================================================

export interface Drug {
  id: string;
  generic_name: string;
  slug: string;
  display_name: string | null;
  brand_names: string[];
  synonyms: string[];
  category: DrugCategory;
  drug_class: string | null;
  primary_cyp_enzymes: string[];
  secondary_cyp_enzymes: string[];
  common_uses: string[];
  rxcui: string | null;
  atc_code: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DrugInteraction {
  id: string;
  drug_id: string;
  severity: InteractionSeverity;
  mechanism: InteractionMechanism;
  mechanism_description: string | null;
  clinical_effects: string[];
  potential_outcomes: string | null;
  recommendation: string;
  monitoring_parameters: string[];
  dose_adjustment_guidance: string | null;
  onset_timeframe: string | null;
  evidence_level: string | null;
  citations: Citation[];
  special_populations_notes: string | null;
  last_reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface DrugSearchResult {
  id: string;
  generic_name: string;
  display_name: string;
  brand_names: string[];
  category: DrugCategory;
  match_type: 'generic' | 'brand' | 'synonym';
  matched_term?: string;
}

export interface SeverityInfo {
  level: InteractionSeverity;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  label: string;
  shortLabel: string;
  description: string;
}

export interface InteractionCheckResult {
  drug: {
    id: string;
    generic_name: string;
    display_name: string;
    brand_names: string[];
    category: DrugCategory;
    drug_class: string | null;
    primary_cyp_enzymes: string[];
    common_uses: string[];
  };
  interaction: {
    severity: InteractionSeverity;
    mechanism: InteractionMechanism;
    mechanism_description: string | null;
    clinical_effects: string[];
    potential_outcomes: string | null;
    recommendation: string;
    monitoring_parameters: string[];
    dose_adjustment_guidance: string | null;
    onset_timeframe: string | null;
    evidence_level: string | null;
    citations: Citation[];
    special_populations_notes: string | null;
    last_reviewed_at: string | null;
  } | null;
  severity_info: SeverityInfo | null;
  message?: string;
  general_advice?: string;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface DrugSearchInputProps {
  onSelect: (drug: DrugSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface InteractionResultCardProps {
  result: InteractionCheckResult;
}

export interface SeverityBadgeProps {
  severity: InteractionSeverity;
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Drug category display names
// =============================================================================

export const DRUG_CATEGORY_LABELS: Record<DrugCategory, string> = {
  anticoagulant: 'Blood Thinner',
  antiepileptic: 'Seizure Medication',
  immunosuppressant: 'Immunosuppressant',
  benzodiazepine: 'Benzodiazepine',
  antidepressant: 'Antidepressant',
  opioid: 'Opioid Pain Medication',
  statin: 'Cholesterol Medication',
  beta_blocker: 'Beta Blocker',
  calcium_channel_blocker: 'Calcium Channel Blocker',
  antipsychotic: 'Antipsychotic',
  proton_pump_inhibitor: 'Acid Reducer (PPI)',
  antihistamine: 'Antihistamine',
  nsaid: 'Anti-Inflammatory (NSAID)',
  other: 'Other Medication',
};

// =============================================================================
// Mechanism display names
// =============================================================================

export const MECHANISM_LABELS: Record<InteractionMechanism, string> = {
  cyp3a4_inhibition: 'CYP3A4 Enzyme Inhibition',
  cyp2c19_inhibition: 'CYP2C19 Enzyme Inhibition',
  cyp2d6_inhibition: 'CYP2D6 Enzyme Inhibition',
  cyp2c9_inhibition: 'CYP2C9 Enzyme Inhibition',
  pharmacodynamic: 'Pharmacodynamic Interaction',
  protein_binding: 'Protein Binding Competition',
  transporter: 'Drug Transporter Interaction',
  multiple: 'Multiple Mechanisms',
  unknown: 'Mechanism Not Fully Characterized',
};
