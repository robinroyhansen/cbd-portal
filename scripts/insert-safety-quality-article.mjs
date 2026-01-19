import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvrdryvgqarffgdujmjz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY'
);

const CATEGORY_ID = '2d7e1eac-f000-433c-8fca-e8bd3d4b9477';

const article = {
  title: 'Who Should Not Take CBD: Contraindications & Precautions',
  slug: 'who-should-not-take-cbd',
  excerpt: "While CBD is generally well tolerated, certain groups should avoid it or use it only under medical supervision. Learn who should not take CBD and why.",
  content: `CBD is generally considered safe and well tolerated by most adults. But "generally safe" doesn't mean "safe for everyone." Certain conditions, medications, and circumstances mean CBD should be avoided entirely or used only with careful medical supervision. Here's who should be cautious — and who should skip CBD altogether.

## Quick Answer

**Most healthy adults can use CBD safely, but it's not appropriate for everyone.** Pregnant and breastfeeding women should avoid CBD. Those taking certain medications — especially blood thinners, some heart medications, and drugs metabolised by CYP450 liver enzymes — need medical guidance. People with severe liver disease, certain mental health conditions, or scheduled for surgery should also be cautious or avoid CBD entirely.

## Key Takeaways

- CBD is safe for most healthy adults
- Pregnant and breastfeeding women should avoid it
- Multiple medication categories interact with CBD
- Liver disease is a significant contraindication
- Pre-surgery patients should stop CBD temporarily
- Some psychiatric conditions require extra caution
- Children should only use CBD under medical supervision
- "Natural" doesn't mean "safe for everyone"
- When in doubt, consult your doctor
- Many people can use CBD safely with proper precautions

## Absolute Contraindications

These groups should avoid CBD entirely unless under direct medical supervision:

### Pregnant Women

**Why to avoid:**
- CBD crosses the placental barrier
- Unknown effects on fetal development
- Animal studies show some concerning signals
- No safety data exists for human pregnancy
- FDA specifically warns against CBD during pregnancy

**The science:**
Animal research suggests CBD may affect fetal brain development and reproductive system development. While we can't directly study this in pregnant humans, the precautionary principle applies strongly here.

**Bottom line:**
Do not use CBD if pregnant. The potential risks are unknown, and no benefit justifies exposing a developing fetus to an unstudied compound.

### Breastfeeding Women

**Why to avoid:**
- CBD transfers into breast milk
- Unknown effects on nursing infants
- Infants cannot metabolise cannabinoids effectively
- No safety data for breastfed babies

**The concern:**
CBD's effects on an infant's developing brain are unknown. The endocannabinoid system plays a role in neurodevelopment, and external cannabinoids could theoretically interfere with this process.

**Bottom line:**
Do not use CBD while breastfeeding. Wait until you've finished nursing to consider CBD.

### People with Severe Liver Disease

**Why problematic:**
- CBD is extensively metabolised by the liver
- Damaged livers process CBD poorly
- Blood levels can become unpredictably high
- Risk of further liver damage

**Conditions of concern:**
- Cirrhosis
- Severe hepatitis
- Liver failure
- Decompensated liver disease

**What happens:**
When the liver can't properly metabolise CBD, it accumulates in the body. This can lead to higher-than-expected blood levels and potentially worsen liver function.

**Note:** Mild liver issues may not preclude CBD use, but require medical guidance and possible dose adjustments.

## Medications That Interact with CBD

CBD affects the CYP450 enzyme system in the liver — the same system that metabolises many medications. This can change how drugs work in your body.

### Blood Thinners (Critical Interaction)

**Affected medications:**
- Warfarin (most significant)
- Apixaban, rivaroxaban, dabigatran
- Clopidogrel

**What happens:**
CBD can increase warfarin blood levels, increasing bleeding risk. This is a serious interaction that has caused clinically significant problems.

**If you take blood thinners:**
- Do not start CBD without medical supervision
- If using CBD and warfarin, INR must be monitored closely
- Dose adjustments to warfarin may be needed

### Anti-Epileptic Medications

**Affected medications:**
- Clobazam (increases sedation)
- Valproate (may increase liver toxicity risk)
- Phenytoin, carbamazepine (complex interactions)

**Irony:**
CBD is approved for epilepsy (Epidiolex), but its interactions with other seizure medications require careful management by specialists.

**If you take anti-epileptics:**
- Only use CBD under neurologist supervision
- Medication levels may need monitoring
- Dosage adjustments may be required

### Benzodiazepines and Sedatives

**Affected medications:**
- Diazepam, lorazepam, alprazolam
- Zolpidem, zopiclone
- Other sedative-hypnotics

**What happens:**
CBD may enhance sedation, increasing drowsiness and potentially fall risk. The combination can cause excessive sedation.

**If you take sedatives:**
- Use CBD cautiously if at all
- Start with very low doses
- Be alert for excessive drowsiness
- Don't drive or operate machinery

### Heart Medications

**Beta-blockers:**
- CBD may enhance blood pressure-lowering effects
- Potential for excessive hypotension

**Calcium channel blockers:**
- Similar concern with blood pressure
- Interaction potential

**Antiarrhythmics:**
- Some may have interactions
- Amiodarone particularly concerning

**If you take heart medications:**
- Consult cardiologist before using CBD
- Monitor blood pressure when starting
- Watch for dizziness, especially when standing

### Immunosuppressants

**Affected medications:**
- Tacrolimus
- Cyclosporine
- Everolimus, sirolimus

**Why concerning:**
These drugs have narrow therapeutic windows — small changes in blood levels can cause toxicity or rejection (in transplant patients).

**If you take immunosuppressants:**
- Avoid CBD unless approved by your transplant team
- Blood level monitoring is essential if used
- Risk may outweigh any benefit

### Chemotherapy Drugs

**Concern:**
Many chemotherapy agents are metabolised by CYP450 enzymes.

**Potential problems:**
- Changed drug levels
- Altered efficacy or toxicity
- Unpredictable interactions

**If undergoing chemotherapy:**
- Do not use CBD without oncologist approval
- Inform your cancer care team about any CBD use
- Timing relative to treatment matters

### Antidepressants and Antipsychotics

**SSRIs (sertraline, fluoxetine, etc.):**
- Some interactions possible
- Generally less severe than above categories
- May affect drug levels

**Tricyclics:**
- Potential for interaction
- May increase sedation

**Antipsychotics:**
- Complex interactions possible
- Some evidence CBD may help, but needs medical supervision

**If you take psychiatric medications:**
- Discuss with your psychiatrist
- Don't adjust medications based on CBD effects without guidance
- Monitor for changes in mood or symptoms

## Health Conditions Requiring Caution

### Low Blood Pressure (Hypotension)

**Why concerning:**
CBD can lower blood pressure. If your blood pressure is already low, this could cause:
- Dizziness
- Lightheadedness
- Fainting
- Falls (especially in elderly)

**If you have hypotension:**
- Start with very low doses
- Monitor blood pressure
- Rise slowly from sitting or lying
- Consider if CBD is appropriate for you

### Parkinson's Disease

**The complexity:**
Research on CBD and Parkinson's is mixed:
- Some studies suggest potential benefits
- Others show worsening of tremors at high doses
- Individual responses vary significantly

**If you have Parkinson's:**
- Only use under neurologist supervision
- Start very low and increase cautiously
- Monitor symptoms carefully
- Be prepared to discontinue if symptoms worsen

### Psychotic Disorders

**The nuance:**
- Some research suggests CBD may have antipsychotic properties
- But cannabinoids are contraindicated in psychosis risk
- Individual responses unpredictable
- Full-spectrum products contain THC, which can worsen psychosis

**If you have schizophrenia or psychotic symptoms:**
- Do not self-treat with CBD
- Only use under psychiatric supervision
- Avoid full-spectrum products entirely
- CBD isolate only, if at all

### History of Addiction

**The consideration:**
- CBD itself has low addiction potential
- But rituals around substance use can trigger relapse
- Some in recovery avoid all psychoactive substances

**If you're in recovery:**
- Consider your personal triggers
- Discuss with addiction counsellor
- Know that CBD isn't intoxicating
- Make informed choice based on your situation

## Situational Cautions

### Pre-Surgery

**Why to stop CBD before surgery:**
- May interact with anaesthesia
- Could affect bleeding
- May interact with post-operative pain medications
- Surgeons prefer a "clean" baseline

**Recommendation:**
Stop CBD at least 1-2 weeks before scheduled surgery. Inform your surgical team about any CBD use.

### Before Medical Tests

**Certain tests may require stopping CBD:**
- Liver function tests (CBD can elevate liver enzymes)
- Drug tests (full-spectrum may cause positive THC results)
- Tests requiring fasting

### When Starting New Medications

**Best practice:**
- Establish baseline on new medication first
- Wait until stable before introducing CBD
- Makes it easier to identify what's causing any effects

## Age-Related Considerations

### Children

**General rule:**
Children should not use over-the-counter CBD products. Medical CBD (Epidiolex) is approved for specific paediatric conditions under specialist supervision.

**Why caution:**
- Developing brains may be affected differently
- Dosing is more critical and complex
- Limited safety data in children
- Should be reserved for specific medical needs

**When appropriate:**
Under specialist supervision for:
- Treatment-resistant epilepsy
- Certain other conditions with medical oversight

### Elderly

**Not contraindicated, but requires adjustment:**
- Lower starting doses needed
- More sensitive to side effects
- More likely to have interacting medications
- Fall risk concerns

See our article on CBD for seniors for detailed guidance.

## When to Consult a Doctor First

Always consult a healthcare provider before using CBD if you:

| Category | Reason |
|----------|--------|
| Take any prescription medications | Interaction screening |
| Have liver disease | Processing concerns |
| Have a heart condition | BP and heart rhythm considerations |
| Have a psychiatric diagnosis | Complex interactions |
| Are pregnant or breastfeeding | Safety unknown |
| Have had organ transplant | Immunosuppressant interactions |
| Are preparing for surgery | Pre-operative concerns |
| Are elderly with multiple medications | Complex interaction potential |
| Have low blood pressure | Hypotension risk |

## What If My Doctor Doesn't Know About CBD?

This is common. Many physicians haven't been trained on cannabinoids.

**Options:**
1. Bring information to share (reputable sources, not marketing)
2. Ask for a referral to someone with cannabinoid knowledge
3. Seek an integrative medicine specialist
4. Find a cannabis-trained clinician

**What not to do:**
- Use CBD secretly while on medications
- Dismiss legitimate medical concerns
- Stop prescription medications to use CBD instead

## Risk Assessment Framework

Use this to assess your situation:

### Low Risk (Most can use CBD safely)
- No chronic medications
- No liver or heart disease
- Not pregnant/breastfeeding
- No psychiatric history
- Not elderly

### Moderate Risk (Use with caution/consultation)
- One or two medications (non-interacting)
- Well-controlled chronic conditions
- Elderly but otherwise healthy
- History of anxiety/depression (stable)

### High Risk (Medical supervision required)
- Multiple medications
- Blood thinners
- Heart disease
- Liver issues
- Psychiatric conditions
- Immunosuppression

### Very High Risk (Generally avoid)
- Pregnant or breastfeeding
- Severe liver disease
- Multiple high-risk factors
- Transplant recipients
- Active psychosis

## Frequently Asked Questions

### Can I use CBD if I take blood pressure medication?

It depends on the medication and your blood pressure control. CBD may lower blood pressure, potentially enhancing your medication's effects. This could be beneficial or problematic depending on your situation. Consult your cardiologist, monitor blood pressure when starting CBD, and watch for dizziness.

### Is CBD safe during pregnancy if I have severe nausea?

No. While CBD may help nausea in some people, it has not been studied for safety during pregnancy and should not be used. The FDA specifically warns against CBD use during pregnancy. Discuss safe anti-nausea options with your obstetrician.

### My doctor doesn't know much about CBD. Should I still ask?

Yes. Even doctors unfamiliar with CBD can help by reviewing your medications for potential interactions, monitoring relevant health parameters, and referring you to someone with more knowledge if needed. It's better to have this conversation than to use CBD secretly.

### Can children with anxiety use CBD?

Not without medical supervision. Over-the-counter CBD products aren't appropriate for children. While some research suggests CBD may help anxiety in adolescents, this should only be considered under specialist guidance, with appropriate dosing and monitoring.

### I take warfarin. Is CBD absolutely off-limits?

Not absolutely, but it requires careful medical management. CBD increases warfarin levels, which increases bleeding risk. If you and your doctor decide CBD is worth trying, your INR must be monitored closely, and warfarin doses may need adjustment. Never start CBD while on warfarin without medical supervision.

### What if I have both low blood pressure and anxiety?

This requires careful consideration. CBD might help anxiety but could worsen low blood pressure. If you proceed, start with very low doses, monitor blood pressure, and be alert for dizziness. Lifestyle measures for blood pressure may be needed. This is a case where medical guidance is particularly valuable.

## Summary

While CBD is safe for most healthy adults, it's not for everyone. Pregnant and breastfeeding women should avoid it completely. Those with severe liver disease, on blood thinners, or taking medications metabolised by CYP450 enzymes need medical guidance. Various health conditions require caution, and the elderly need adjusted dosing.

The key principle is informed decision-making. If you fall into any risk category, don't simply avoid CBD — but don't use it without appropriate medical consultation either. Many people with chronic conditions can use CBD safely with proper oversight.

When in doubt, consult a healthcare provider. "Natural" doesn't mean universally safe, and CBD is a biologically active compound that interacts with your body's systems. Respect its potential while recognising that for most people, CBD can be used safely with appropriate precautions.

---

## Sources

1. FDA. (2019). What You Should Know About Using Cannabis, Including CBD, When Pregnant or Breastfeeding. U.S. Food and Drug Administration.

2. Brown JD, Winterstein AG. (2019). Potential Adverse Drug Events and Drug-Drug Interactions with Medical and Consumer Cannabidiol (CBD) Use. *Journal of Clinical Medicine*, 8(7), 989.

3. Epidiolex (cannabidiol) Prescribing Information. Greenwich Biosciences, Inc.

4. Nasrin S, et al. (2021). Cannabinoid Metabolites as Inhibitors of Major Hepatic CYP450 Enzymes. *Drug Metabolism and Disposition*, 49(4), 261-268.

5. Chesney E, et al. (2020). Adverse effects of cannabidiol: a systematic review and meta-analysis. *Neuropsychopharmacology*, 45(11), 1799-1806.

---

*Last updated: January 2026*`,
  article_type: 'educational-guide',
  category_id: CATEGORY_ID,
  reading_time: 12,
  status: 'published',
  published_at: new Date().toISOString(),
  meta_title: "Who Should Not Take CBD: Contraindications & Safety Guide (2026)",
  meta_description: "Not everyone should use CBD. Learn who should avoid CBD, medication interactions, health conditions requiring caution, and when to consult a doctor.",
  language: 'en'
};

async function run() {
  const { data, error } = await supabase
    .from('kb_articles')
    .insert(article)
    .select('id, slug, title')
    .single();

  if (error) {
    if (error.code === '23505') {
      console.log(`Already exists: ${article.slug}`);
    } else {
      console.error(`Error inserting ${article.slug}:`, error.message);
    }
  } else {
    console.log(`Created: ${data.slug}`);
  }

  // Update category count
  const { count } = await supabase
    .from('kb_articles')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', CATEGORY_ID)
    .eq('status', 'published');

  await supabase
    .from('kb_categories')
    .update({ article_count: count || 0 })
    .eq('id', CATEGORY_ID);

  console.log(`Safety & Quality category now has ${count} articles`);
}

run();
