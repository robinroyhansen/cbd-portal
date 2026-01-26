/**
 * Guided Flows for CBD Chat
 * Structured conversation flows for dosage and drug interactions
 */

export interface GuidedFlowStep {
  id: string;
  question: string;
  options: Array<{ label: string; value: string; icon?: string }>;
  allowCustom?: boolean;
}

export interface GuidedFlow {
  id: string;
  name: string;
  triggerKeywords: string[];
  steps: GuidedFlowStep[];
  generateResponse: (answers: Record<string, string>) => string;
}

/**
 * Dosage Calculator Flow
 * Helps users find their recommended starting CBD dosage
 */
export const DOSAGE_FLOW: GuidedFlow = {
  id: 'dosage',
  name: 'Dosage Calculator',
  triggerKeywords: [
    'dosage', 'dose', 'how much', 'how many', 'mg', 'milligram',
    'starting dose', 'recommended dose', 'how much cbd', 'what dose',
    'dosering', 'hvor meget', 'hvor mye', 'hur mycket', 'wieviel', 'combien'
  ],
  steps: [
    {
      id: 'purpose',
      question: 'What are you hoping CBD helps with?',
      options: [
        { label: 'Sleep', value: 'sleep', icon: '🌙' },
        { label: 'Anxiety', value: 'anxiety', icon: '😌' },
        { label: 'Pain', value: 'pain', icon: '💪' },
        { label: 'General wellness', value: 'wellness', icon: '🌿' },
        { label: 'Other', value: 'other', icon: '✨' },
      ],
    },
    {
      id: 'weight',
      question: "What's your approximate weight?",
      options: [
        { label: 'Under 130 lbs (60 kg)', value: 'light', icon: '🪶' },
        { label: '130-200 lbs (60-90 kg)', value: 'medium', icon: '⚖️' },
        { label: 'Over 200 lbs (90 kg)', value: 'heavy', icon: '🏋️' },
      ],
    },
    {
      id: 'experience',
      question: 'Have you used CBD before?',
      options: [
        { label: 'New to CBD', value: 'new', icon: '🌱' },
        { label: 'Some experience', value: 'some', icon: '🌿' },
        { label: 'Regular user', value: 'regular', icon: '🌳' },
      ],
    },
  ],
  generateResponse: (answers: Record<string, string>) => {
    const { purpose, weight, experience } = answers;

    // Base dosage calculation (in mg)
    let baseDose = 15; // Starting point

    // Adjust for weight
    switch (weight) {
      case 'light':
        baseDose = 10;
        break;
      case 'medium':
        baseDose = 15;
        break;
      case 'heavy':
        baseDose = 20;
        break;
    }

    // Adjust for experience
    let experienceMultiplier = 1;
    switch (experience) {
      case 'new':
        experienceMultiplier = 0.5;
        break;
      case 'some':
        experienceMultiplier = 1;
        break;
      case 'regular':
        experienceMultiplier = 1.5;
        break;
    }

    // Adjust for purpose (some conditions typically need higher doses)
    let purposeMultiplier = 1;
    let purposeNote = '';
    switch (purpose) {
      case 'sleep':
        purposeMultiplier = 1.2;
        purposeNote = 'For sleep, take CBD 30-60 minutes before bedtime.';
        break;
      case 'anxiety':
        purposeNote = 'For anxiety, you may split the dose between morning and evening.';
        break;
      case 'pain':
        purposeMultiplier = 1.3;
        purposeNote = 'For pain, consistency is key. Take at regular intervals.';
        break;
      case 'wellness':
        purposeNote = 'For general wellness, morning dosing works well for most people.';
        break;
      default:
        purposeNote = 'Start low and adjust based on how you feel.';
    }

    const suggestedDose = Math.round(baseDose * experienceMultiplier * purposeMultiplier);
    const lowRange = Math.max(5, suggestedDose - 5);
    const highRange = suggestedDose + 10;

    return `## Your Suggested Starting Dose

Based on your answers, I recommend starting with **${suggestedDose} mg of CBD per day**.

### Dosage Range
- **Starting dose:** ${suggestedDose} mg/day
- **Adjustment range:** ${lowRange}-${highRange} mg/day

### How to Adjust
1. Start with ${suggestedDose} mg for the first week
2. If you don't feel effects, increase by 5 mg
3. Find your "sweet spot" where you feel benefits
4. More isn't always better - find your optimal dose

### Timing Tips
${purposeNote}

### Important Notes
- Everyone responds differently to CBD
- Effects may take 1-2 weeks of consistent use
- Quality matters - use products with third-party lab testing
- Consult your doctor if you take other medications

*This is a general guideline, not medical advice. Individual needs vary.*`;
  },
};

/**
 * Drug Interaction Flow
 * Helps users understand CBD interactions with medications
 */
export const INTERACTION_FLOW: GuidedFlow = {
  id: 'interaction',
  name: 'Drug Interaction Checker',
  triggerKeywords: [
    'interaction', 'medication', 'medicine', 'drug', 'interact', 'safe to take',
    'can i take', 'together with', 'prescription', 'blood thinner', 'warfarin',
    'antidepressant', 'ssri', 'benzo', 'interaktion', 'medicin', 'medikament',
    'kombination', 'samtidig', 'zusammen'
  ],
  steps: [
    {
      id: 'medication_type',
      question: 'What type of medication are you asking about?',
      options: [
        { label: 'Blood thinners', value: 'blood_thinners', icon: '💉' },
        { label: 'Anti-anxiety medications', value: 'anti_anxiety', icon: '😌' },
        { label: 'Antidepressants', value: 'antidepressants', icon: '💊' },
        { label: 'Pain medication', value: 'pain', icon: '💪' },
        { label: 'Other medication', value: 'other', icon: '🏥' },
      ],
    },
    {
      id: 'current_use',
      question: 'Are you currently taking this medication?',
      options: [
        { label: 'Yes, currently taking', value: 'yes', icon: '✅' },
        { label: 'Planning to start', value: 'planning', icon: '📅' },
        { label: 'Just researching', value: 'researching', icon: '🔍' },
      ],
    },
  ],
  generateResponse: (answers: Record<string, string>) => {
    const { medication_type, current_use } = answers;

    let interactionInfo = '';
    let riskLevel = '';

    switch (medication_type) {
      case 'blood_thinners':
        riskLevel = '**HIGH**';
        interactionInfo = `### Blood Thinners & CBD

CBD can **significantly interact** with blood thinners like warfarin, heparin, and newer anticoagulants.

**Why it matters:**
- CBD inhibits the CYP450 enzyme system in your liver
- This can increase blood thinner levels in your body
- May lead to increased bleeding risk

**What research shows:**
Studies have documented cases where warfarin dosage needed adjustment when patients started CBD.`;
        break;

      case 'anti_anxiety':
        riskLevel = '**MODERATE**';
        interactionInfo = `### Anti-Anxiety Medications & CBD

CBD may interact with benzodiazepines (Xanax, Valium, Ativan) and other anxiety medications.

**Why it matters:**
- Both CBD and these medications have sedative effects
- Combined use may increase drowsiness
- CBD may affect how quickly your body processes these drugs

**What to watch for:**
Increased sedation, dizziness, or changes in how your medication feels.`;
        break;

      case 'antidepressants':
        riskLevel = '**MODERATE**';
        interactionInfo = `### Antidepressants & CBD

CBD may interact with SSRIs (Prozac, Zoloft, Lexapro) and other antidepressants.

**Why it matters:**
- CBD affects the same liver enzymes that process many antidepressants
- This could change medication levels in your blood
- Some early research suggests CBD might complement antidepressant therapy, but more studies are needed

**What to watch for:**
Changes in mood, increased side effects, or feeling like your medication is stronger/weaker.`;
        break;

      case 'pain':
        riskLevel = '**MODERATE to LOW**';
        interactionInfo = `### Pain Medications & CBD

CBD may interact with certain pain medications, especially opioids and NSAIDs.

**Why it matters:**
- CBD may enhance the effects of opioid pain medications
- With NSAIDs (ibuprofen, naproxen), interactions are generally mild
- CBD itself may provide pain relief, potentially reducing need for other medications

**What to watch for:**
Increased sedation with opioids, or any unusual side effects.`;
        break;

      default:
        riskLevel = '**VARIES**';
        interactionInfo = `### Other Medications & CBD

CBD can potentially interact with many medications because it affects the liver's CYP450 enzyme system.

**Medications that commonly interact with CBD:**
- Blood pressure medications
- Immunosuppressants
- Steroids
- Antihistamines
- Proton pump inhibitors

**The "Grapefruit Rule":**
If your medication has a grapefruit warning, it likely interacts with CBD too, as both affect the same enzymes.`;
    }

    const urgencyNote = current_use === 'yes'
      ? '**Since you\'re currently taking this medication, please discuss with your doctor before starting or continuing CBD.**'
      : current_use === 'planning'
        ? 'Before starting this medication, have a conversation with your prescribing doctor about your CBD use.'
        : 'This information can help guide your conversation with a healthcare provider.';

    return `## CBD Drug Interaction Information

**Risk Level:** ${riskLevel}

${interactionInfo}

---

### Your Situation

${urgencyNote}

### Important Recommendations

1. **Talk to your doctor or pharmacist** - They can review your specific medications and health conditions
2. **Don't stop medications** - Never stop prescribed medications without medical guidance
3. **Start low if approved** - If your doctor approves CBD, start with a low dose
4. **Monitor closely** - Watch for any changes in how you feel or how your medications work
5. **Time your doses** - Taking CBD and medications at different times may reduce interactions

### Resources

- Talk to your prescribing doctor
- Consult with a pharmacist
- [Check our drug interaction guide](/conditions/drug-interactions)

---

**Disclaimer:** This information is educational and not a substitute for professional medical advice. Always consult with a healthcare provider about potential drug interactions.`;
  },
};

/**
 * All available guided flows
 */
export const GUIDED_FLOWS: GuidedFlow[] = [DOSAGE_FLOW, INTERACTION_FLOW];

/**
 * Detect if a message should trigger a guided flow
 */
export function detectGuidedFlow(message: string): GuidedFlow | null {
  const lowerMessage = message.toLowerCase();

  for (const flow of GUIDED_FLOWS) {
    for (const keyword of flow.triggerKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return flow;
      }
    }
  }

  return null;
}

/**
 * Get a flow by ID
 */
export function getFlowById(flowId: string): GuidedFlow | undefined {
  return GUIDED_FLOWS.find(flow => flow.id === flowId);
}
