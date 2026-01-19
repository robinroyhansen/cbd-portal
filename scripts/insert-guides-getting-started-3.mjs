import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv() {
  const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      envVars[match[1].trim()] = value;
    }
  });
  return envVars;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const GUIDES_CATEGORY_ID = 'bfd651e6-7fb3-4756-a19d-7ad2ab98a2d2';

const articles = [
  {
    slug: 'keep-cbd-journal',
    title: 'How to Keep a CBD Journal: Document Your Experience',
    excerpt: 'A CBD journal helps you track effects, optimise your routine, and determine if CBD is working. Learn what to record and how to maintain an effective journal.',
    meta_title: 'How to Keep a CBD Journal: Track Your Progress',
    meta_description: 'Learn how to keep a CBD journal that helps you track effects, find optimal dosing, and evaluate effectiveness. Includes templates and examples.',
    reading_time: 8,
    content: `## Quick Answer

**A CBD journal is a daily record of your CBD use, how you feel, and relevant factors that helps you objectively evaluate effectiveness and optimise your routine.** Record your dose, timing, ratings for your primary concern, sleep quality, and any notable observations. Review weekly to identify patterns and make informed adjustments.

---

## Key Takeaways

- **Write daily**—memory isn't reliable enough for subtle effects
- **Keep it simple**—complex systems get abandoned
- **Track your primary goal** with a consistent rating scale
- **Note external factors** that might influence how you feel
- **Review weekly** rather than obsessing over daily changes
- **Use your journal data** to make informed adjustments

---

## Why Keep a CBD Journal

### Benefits of Journaling

| Benefit | How It Helps |
|---------|--------------|
| **Objective assessment** | Know if CBD actually helps, not just feel like it might |
| **Pattern identification** | See what affects your response |
| **Dose optimisation** | Find your minimum effective dose |
| **Recall accuracy** | Don't rely on memory for subtle effects |
| **Doctor discussions** | Provide concrete information if asked |
| **Motivation** | See progress over time |

---

## What to Include

### Essential Daily Entries

| Element | Why It Matters |
|---------|----------------|
| **Date and time** | Track when you take CBD |
| **Dose (mg)** | Know exactly what you took |
| **Product used** | Important if switching products |
| **Primary concern rating (1-10)** | Measure your main goal |
| **Overall wellbeing (1-10)** | Catch secondary effects |
| **Sleep quality (1-10)** | CBD often affects sleep |
| **Notable observations** | Anything significant |

### Optional Additions

| Element | When to Include |
|---------|-----------------|
| **Mood rating** | If emotional balance is a goal |
| **Energy level** | If fatigue or alertness matters |
| **Physical comfort** | If discomfort is a concern |
| **Exercise** | If you want to track correlation |
| **Diet notes** | If you suspect food interactions |
| **Stress events** | Context for difficult days |

---

## Journal Format Options

### Option 1: Minimalist (1 minute/day)

**Daily entry:**
\`\`\`
Date: ___
CBD: ___mg at ___
Main concern: _/10
Sleep: _/10
Note: ___
\`\`\`

**Best for:** Busy people, those who want basic tracking

### Option 2: Standard (2-3 minutes/day)

**Daily entry:**
\`\`\`
Date: ___________
Morning mood: _/10
CBD dose: ___mg  Time: ___
Taken with: food / empty stomach
Afternoon check-in: _/10
Evening rating: _/10
Sleep quality: _/10
Energy today: _/10
Side effects: ___
Notes: ___
\`\`\`

**Best for:** Most people, good balance of data and effort

### Option 3: Comprehensive (5 minutes/day)

**Best for:** Those wanting detailed analysis, researchers, complex situations

Includes all of the above plus:
- Multiple check-in times
- External factor logging
- Detailed symptom tracking
- Correlation analysis

---

## Setting Up Your Journal

### Choose Your Medium

| Medium | Pros | Cons |
|--------|------|------|
| **Paper notebook** | Tactile, no tech needed | Can't search, no graphs |
| **Phone notes** | Always available | Can be cluttered |
| **Spreadsheet** | Easy analysis, graphs | Requires computer/tablet |
| **Dedicated app** | Designed for purpose | May have learning curve |

### What Makes a Good CBD Journal

| Characteristic | Why It Matters |
|----------------|----------------|
| **Accessible** | If it's not handy, you won't use it |
| **Simple** | Complex systems get abandoned |
| **Consistent** | Same format each day |
| **Private** | Feel comfortable being honest |
| **Reviewable** | Easy to look back at |

---

## Sample Journal Entries

### Week 1 Example

**Day 1 (Monday)**
\`\`\`
CBD: 15mg at 8:00am with breakfast
Before: Stress 7/10
End of day: Stress 6/10
Sleep: 6/10
Note: First day, no obvious effects
\`\`\`

**Day 3 (Wednesday)**
\`\`\`
CBD: 15mg at 8:00am with breakfast
Before: Stress 6/10
End of day: Stress 5/10
Sleep: 7/10 - fell asleep faster
Note: Possibly sleeping better, too early to tell
\`\`\`

**Day 7 (Sunday)**
\`\`\`
CBD: 15mg at 8:00am with breakfast
Before: Stress 5/10
End of day: Stress 4/10
Sleep: 7/10
Note: Week 1 complete. Slight improvement? Will continue.
\`\`\`

### Weekly Summary Example

\`\`\`
Week 1 Summary:
- Average stress: 5.6/10 (started at 7)
- Average sleep: 6.4/10
- Side effects: None
- Trend: Slight improvement
- Plan: Continue same dose for week 2
\`\`\`

---

## Rating Scale Guidelines

### Establishing Consistent Ratings

| Rating | General Meaning |
|--------|-----------------|
| **1-2** | Excellent—negligible issue |
| **3-4** | Good—mild, occasional |
| **5-6** | Moderate—noticeable, affects life |
| **7-8** | Significant—frequently problematic |
| **9-10** | Severe—major impact |

### Calibrate Your Scale

Before starting, write down what each number means for YOUR primary concern:

**Example for stress:**
- **10:** Can't function, overwhelming panic
- **7:** Very stressed, difficulty concentrating
- **5:** Moderately stressed, manageable but noticeable
- **3:** Mild tension, doesn't affect my day much
- **1:** Completely calm, relaxed

Refer to this when rating to maintain consistency.

---

## Weekly Reviews

### What to Analyse Weekly

| Question | What to Look For |
|----------|------------------|
| What was my average rating? | Overall trend |
| Best day? What was different? | Success factors |
| Worst day? What contributed? | Problem factors |
| Any patterns with timing? | Optimal timing |
| Side effects? | Tolerability |
| Sleep changes? | Secondary effects |

### Weekly Review Template

\`\`\`
Week of: ___________

Averages:
- Primary concern: _/10
- Sleep quality: _/10
- Energy: _/10

Highlights:
- Best day: ___ because ___
- Most difficult day: ___ because ___

Patterns noticed:
___

Side effects this week:
___

Adjustment for next week:
___

Overall assessment:
[ ] Improving [ ] Same [ ] Worse
\`\`\`

---

## Common Journaling Mistakes

### Mistakes to Avoid

| Mistake | Why It's a Problem | Solution |
|---------|-------------------|----------|
| **Starting too complex** | Overwhelm leads to quitting | Start minimal, add later |
| **Skipping days** | Gaps create incomplete picture | Set a daily reminder |
| **Inconsistent timing** | Harder to compare | Log at same time |
| **Rating by memory** | Less accurate | Rate in the moment |
| **Only tracking good days** | Biased data | Track every day |
| **Never reviewing** | Missing the point | Weekly review habit |

---

## Using Journal Data

### Making Adjustments

Based on 2+ weeks of data:

| Pattern | Possible Action |
|---------|-----------------|
| Improving steadily | Continue current routine |
| No change | Consider increasing dose |
| Better on certain days | Analyse what differs |
| Side effects | Reduce dose or change timing |
| Variable results | Look for external factors |

### When to Share Your Journal

Consider sharing journal summaries with:

- **Your doctor** if discussing CBD use
- **Yourself in 6 months** to see long-term trends
- **Support communities** (anonymised) for perspective

---

## Digital vs. Paper Journaling

### Paper Journal

| Pros | Cons |
|------|------|
| No technology needed | Can't create graphs |
| Tactile and personal | Can't search entries |
| No app crashes | Easy to lose |
| Private by default | Harder to review patterns |

### Digital Options

| Option | Best For |
|--------|----------|
| **Notes app** | Quick daily entries |
| **Spreadsheet** | Data analysis, graphs |
| **Health apps** | Integration with other tracking |
| **Dedicated CBD apps** | Purpose-built features |

---

## Long-Term Journaling

### After the First Month

Once you've established your routine:

| Timeframe | Journaling Approach |
|-----------|---------------------|
| **Month 1** | Daily detailed tracking |
| **Months 2-3** | Daily simple tracking |
| **Month 4+** | Weekly check-ins may suffice |
| **Ongoing** | Note any changes or adjustments |

### When to Return to Daily Tracking

- Changing products
- Adjusting dose
- New health concerns
- Feeling like effects changed
- Doctor requested

---

## Frequently Asked Questions

### Do I really need to journal?

Journaling significantly improves your ability to evaluate CBD objectively. Memory is unreliable for subtle, gradual effects. Even minimal tracking helps you know if CBD is actually working.

### What if I miss a day?

Just continue the next day. Don't try to fill in from memory—just mark it as missed. A few gaps won't ruin your data. If you're missing many days, simplify your tracking system.

### How long should I keep journaling?

Active daily tracking for at least 4-8 weeks while establishing your routine. After that, weekly summaries may be sufficient unless you're making changes.

### Should my journal be private?

Yes, keep it private so you feel comfortable being completely honest. Sharing sanitised summaries is fine, but your raw journal should be for your eyes only.

---

## Quick-Start Journal Template

**Copy this to start tomorrow:**

\`\`\`
Date: ___/___/___

CBD: ___mg at ___:___
With food: Y / N

Morning rating: ___/10
Evening rating: ___/10

Sleep last night: ___/10
Energy today: ___/10

Side effects: ___

One sentence summary:
___________________________
\`\`\`

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    slug: 'talk-to-doctor-about-cbd',
    title: 'How to Talk to Your Doctor About CBD',
    excerpt: 'Learn how to discuss CBD with your healthcare provider. Includes when to bring it up, what information to share, questions to ask, and handling different responses.',
    meta_title: 'How to Talk to Your Doctor About CBD: A Guide',
    meta_description: 'Want to discuss CBD with your doctor? Learn when to bring it up, what to share, questions to ask, and how to handle various responses professionally.',
    reading_time: 9,
    content: `## Quick Answer

**Tell your doctor about CBD use, especially if you take medications, have health conditions, or are using CBD for specific concerns.** Approach the conversation professionally: explain why you're interested, what you've researched, and ask about potential interactions. Even if your doctor is unfamiliar with CBD, they can monitor for interactions and track your health.

---

## Key Takeaways

- **Always disclose CBD use** to your healthcare providers
- **Medication interactions** are the primary medical concern
- **Prepare for the conversation** with specific information
- **Doctors may not be CBD experts**—that's okay
- **Focus on collaboration**, not seeking approval
- **Document your use** for your medical record

---

## Why You Should Talk to Your Doctor

### Important Reasons

| Reason | Why It Matters |
|--------|----------------|
| **Drug interactions** | CBD can affect how medications work |
| **Health monitoring** | Doctor can track any changes |
| **Medical record** | Complete picture of what you take |
| **Professional guidance** | Expert perspective on your situation |
| **Safety** | Catches potential issues early |
| **Treatment coordination** | Integrates with your overall care |

### When It's Essential

Talk to your doctor before using CBD if you:

| Situation | Risk Level |
|-----------|------------|
| Take prescription medications | High—interactions possible |
| Have liver conditions | High—CBD metabolised by liver |
| Are pregnant or breastfeeding | High—safety unknown |
| Have upcoming surgery | Medium—stop CBD beforehand |
| Have heart conditions | Medium—discuss carefully |
| Take blood thinners | High—interaction risk |
| Have seizure disorders | Medium—discuss with neurologist |

---

## When to Bring It Up

### Best Times for the Conversation

| Timing | Approach |
|--------|----------|
| **Regular check-up** | "I wanted to mention I'm considering trying CBD" |
| **Medication review** | "I should tell you I've started using CBD" |
| **Before starting** | "I'm researching CBD—can we discuss it?" |
| **New symptoms** | "I started CBD recently—could this be related?" |

### What Not to Do

| Avoid | Why |
|-------|-----|
| Hiding CBD use | Doctor can't help without full information |
| Only mentioning after problems | Earlier disclosure prevents issues |
| Assuming it doesn't matter | Interactions are real |
| Waiting until asked | Be proactive about your health |

---

## Preparing for the Conversation

### Information to Have Ready

| Information | Why Doctor Needs It |
|-------------|---------------------|
| **Product type** | Oil, gummies, capsules, etc. |
| **CBD content (mg)** | Know your actual dose |
| **Spectrum type** | Full, broad, or isolate |
| **How often you take it** | Usage pattern |
| **Why you're using it** | Your goals |
| **How long you've used it** | Timeline |
| **Effects you've noticed** | Positive and negative |

### Prepare Your Key Points

Write down:
1. Why you're interested in/using CBD
2. What product you're using or considering
3. Specific questions you have
4. Your current medications (list)

---

## Having the Conversation

### Opening the Discussion

**Direct approach:**
> "I wanted to discuss CBD with you. I've been researching it for [stress/sleep/etc.] and wanted to get your perspective, especially regarding my current medications."

**If already using:**
> "I want to be transparent with you—I started using CBD [timeframe] ago for [reason]. I wanted to make sure you knew and to discuss any concerns."

### Key Points to Communicate

| Share | How to Say It |
|-------|---------------|
| **Your reason** | "I'm interested in CBD for managing daily stress" |
| **Your research** | "I've read that CBD may help with [X] and wanted to discuss" |
| **Your concerns** | "I'm specifically wondering about interactions with my medications" |
| **Your openness** | "I value your input and want to make an informed decision" |

---

## Questions to Ask Your Doctor

### About Safety

- "Are there any interactions between CBD and my current medications?"
- "Given my health history, are there specific concerns I should know about?"
- "What side effects should I watch for?"
- "Should I get any additional monitoring while using CBD?"

### About Usage

- "What dose would you consider reasonable to start with?"
- "When should I take it relative to my medications?"
- "How long should I try it before evaluating?"
- "What would make you concerned about my CBD use?"

### About Monitoring

- "Should I schedule a follow-up to discuss how it's going?"
- "What changes in my health should I report immediately?"
- "Do you want me to track anything specific?"

---

## Understanding Drug Interactions

### How CBD Interacts with Medications

CBD is processed by liver enzymes (particularly CYP450), the same enzymes that process many medications:

| Interaction Type | What Happens |
|------------------|--------------|
| **CBD inhibits enzyme** | Medication levels may increase |
| **Medication inhibits enzyme** | CBD effects may increase |
| **Competition for processing** | Both may be affected |

### Medications to Discuss

| Medication Type | Interaction Concern |
|-----------------|---------------------|
| **Blood thinners** (warfarin) | CBD may increase blood thinner effects |
| **Some seizure medications** | Complex interactions |
| **Certain heart medications** | May affect levels |
| **Some sedatives** | Combined drowsiness |
| **Medications with grapefruit warnings** | Often share same enzyme pathway |

Ask specifically about each medication you take.

---

## Handling Different Responses

### If Your Doctor Is Supportive

| Response | Your Action |
|----------|-------------|
| "I think you can try it" | Discuss monitoring plan |
| "Let me know how it goes" | Schedule follow-up |
| "Here's my recommendation" | Follow their guidance |

### If Your Doctor Is Unfamiliar

| Response | Your Approach |
|----------|---------------|
| "I don't know much about CBD" | "Would you be willing to research it?" |
| "I can't advise on that" | "Can you at least check for interactions?" |
| "Ask a specialist" | "Who would you recommend?" |

### If Your Doctor Is Sceptical

| Response | Appropriate Reply |
|----------|-------------------|
| "There's no evidence" | "I understand research is ongoing. Can we discuss safety?" |
| "I don't recommend it" | "I respect that. Can you tell me your specific concerns?" |
| "It's just a fad" | "I'd still like you to know I'm using it for monitoring purposes" |

### If Your Doctor Is Opposed

| Situation | Your Options |
|-----------|--------------|
| Strong advice against | Understand their reasoning |
| Medical concerns | Take seriously, reconsider |
| Personal belief | Respectfully note for records |
| Requests you stop | Discuss why, consider alternatives |

Remember: You make final decisions about your body, but medical advice exists for good reasons.

---

## Documenting for Your Medical Record

### Ensure Documentation

Ask that your CBD use be noted in your medical record:
- Product type
- Dose
- Frequency
- Reason for use

This ensures:
- Future providers know
- Interactions can be checked
- Complete medical history

### What to Record Yourself

Keep your own notes about:
- What you discussed
- Doctor's recommendations
- Any concerns raised
- Follow-up plans

---

## Special Situations

### Multiple Healthcare Providers

Inform ALL your healthcare providers:
- Primary care physician
- Specialists
- Pharmacist
- Dentist (especially before procedures)
- Mental health providers

### Before Surgery

| Timeline | Action |
|----------|--------|
| **When scheduled** | Mention CBD use to surgeon |
| **1-2 weeks before** | Stop CBD (discuss with doctor) |
| **Day of surgery** | Confirm you've stopped |
| **After recovery** | Discuss when to resume |

### If Using CBD for Specific Conditions

If you're using CBD for a diagnosed condition:
- Discuss with the relevant specialist
- Don't replace prescribed treatments without guidance
- Consider CBD as complementary, not alternative

---

## Frequently Asked Questions

### What if my doctor doesn't know about CBD?

That's common—CBD is relatively new in medical contexts. They can still check for drug interactions and monitor your health. Consider asking if they'd be willing to learn more, or ask for a referral to someone more familiar.

### Should I tell my doctor even if I don't take medications?

Yes. Your doctor should have a complete picture of what you put in your body. It becomes part of your medical history and can be relevant for future care decisions.

### What if I'm embarrassed to bring it up?

CBD is a legitimate wellness product used by millions. Approach it as you would any supplement. If you're uncomfortable, try: "I know this might not be your area, but I wanted to mention..."

### Can my doctor refuse to treat me if I use CBD?

Highly unlikely. Doctors are required to continue providing care. They may express concerns or recommendations, but CBD use alone wouldn't typically be grounds for discontinuing care.

### Should I bring the product to show my doctor?

It can be helpful—the doctor can see exactly what you're taking. At minimum, bring a photo of the label or have the product information ready on your phone.

---

## Conversation Checklist

Before your appointment, prepare:

- [ ] List of current medications
- [ ] CBD product details (type, dose, frequency)
- [ ] Your reason for using CBD
- [ ] Questions you want to ask
- [ ] Timeline of CBD use
- [ ] Any effects you've noticed

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Always consult healthcare professionals about your specific situation, especially regarding medications and health conditions.*`
  },
  {
    slug: 'tell-family-about-cbd',
    title: 'How to Tell Family About Using CBD',
    excerpt: 'Discussing CBD with family can feel uncomfortable due to cannabis stigma. Learn how to have productive conversations, address concerns, and share information.',
    meta_title: 'How to Tell Family About CBD: Conversation Guide',
    meta_description: 'Need to tell family about your CBD use? Learn how to have productive conversations, address concerns, clarify misconceptions, and share reliable information.',
    reading_time: 7,
    content: `## Quick Answer

**When telling family about CBD, focus on education first—explain that CBD is non-intoxicating (won't get you high), is legal, and is used by millions for wellness purposes.** Address likely concerns proactively, share why you're using it, and provide reliable information sources. Be patient with misconceptions rooted in cannabis stigma.

---

## Key Takeaways

- **Lead with education**—many people don't understand CBD
- **CBD is not marijuana**—clarify this clearly
- **Explain your reasoning**—why you chose to try it
- **Anticipate concerns**—prepare for common misconceptions
- **Share information**—have resources ready
- **Be patient**—changing perceptions takes time

---

## Understanding Family Concerns

### Why Family Might React Negatively

| Concern Source | Underlying Worry |
|----------------|------------------|
| **Cannabis stigma** | Association with drug use |
| **Lack of information** | Don't understand CBD vs THC |
| **Generational views** | Grew up with "just say no" |
| **Safety concerns** | Worried about your health |
| **Legal confusion** | Unsure if it's legal |
| **Media influence** | Conflicting information |

---

## Deciding Whether to Tell

### When to Share

| Situation | Recommendation |
|-----------|----------------|
| Live with family | Best to be open |
| Family sees you regularly | Consider sharing |
| Family is health-focused | May be receptive |
| Children ask questions | Age-appropriate honesty |
| Already good communication | Easier conversation |

### When Sharing May Be Optional

| Situation | Consideration |
|-----------|---------------|
| Very occasional contact | May not need to discuss |
| Known hostile views | Weigh benefits vs. conflict |
| Private wellness choices | Personal decision |

---

## Preparing for the Conversation

### Information to Have Ready

| Topic | Key Points |
|-------|------------|
| **What CBD is** | Natural compound from hemp |
| **What CBD isn't** | Not intoxicating, not "marijuana" |
| **Legality** | Legal in EU when THC <0.2% |
| **Why you use it** | Your specific reason |
| **Safety** | Generally well-tolerated |
| **Common uses** | Wellness, stress, sleep |

### Anticipate Their Questions

| Likely Question | Prepared Answer |
|-----------------|-----------------|
| "Isn't that marijuana?" | "No, CBD is a different compound that doesn't get you high" |
| "Is it legal?" | "Yes, CBD from hemp is legal" |
| "Is it safe?" | "Research shows it's generally well-tolerated" |
| "Why do you need it?" | [Your specific reason] |
| "What does it do?" | "It supports my wellness by [your experience]" |

---

## The Conversation

### Opening the Topic

**Casual approach:**
> "I wanted to mention something—I've started using CBD for [reason]. I know there can be confusion about what it is, so I wanted to explain."

**Educational approach:**
> "Have you heard about CBD? It's been growing in popularity for wellness. I've done some research and wanted to share what I've learned since I'm trying it."

### Key Points to Make

| Point | How to Express It |
|-------|-------------------|
| **CBD vs THC** | "CBD is different from THC—it doesn't cause any high or intoxication" |
| **Legal status** | "It's completely legal here because it comes from hemp" |
| **Common use** | "Millions of people use it for wellness—stress, sleep, general health" |
| **Your experience** | "For me, I've noticed [your specific benefit]" |
| **Safety** | "It's generally considered safe and well-researched" |

---

## Addressing Specific Concerns

### "I Don't Want Drugs in My House"

> "I understand that concern. CBD isn't a recreational drug—it doesn't cause any mental effects or high. It's more like a herbal supplement. It's legal and sold in health shops. I'd be happy to show you the research."

### "What Will People Think?"

> "CBD has become mainstream—it's sold in pharmacies and health stores. It's not the same as cannabis and doesn't carry the same stigma. Many professionals and everyday people use it for wellness."

### "Is This a Gateway to Harder Drugs?"

> "CBD doesn't cause intoxication or any 'high' feeling—there's nothing addictive about the experience. It's used for wellness, like someone might use herbal tea or supplements."

### "Have You Talked to a Doctor?"

> "That's a good point. I've [researched it carefully / discussed with my doctor / will mention it at my next appointment]. I appreciate you being concerned about my health."

### "I Just Don't Feel Comfortable With It"

> "I understand it's new to you. I'm not asking you to change your mind immediately—just to understand why I've made this choice for my wellness. I'm happy to share information if you're ever curious."

---

## Tips for Different Family Members

### Parents (Older Generation)

| Approach | Why It Works |
|----------|--------------|
| Lead with health reasons | They care about your wellbeing |
| Emphasise it's not "getting high" | Addresses primary concern |
| Compare to supplements | Familiar context |
| Show reputable sources | They trust authority |

### Partner/Spouse

| Approach | Why It Works |
|----------|--------------|
| Discuss openly and early | Partnership communication |
| Explain your reasoning | They understand your situation |
| Address shared concerns | Budget, household, etc. |
| Involve in research | Shared decision |

### Children

| Age | Approach |
|-----|----------|
| **Young children** | "It's a plant medicine for adults" |
| **Pre-teens** | "It's like a vitamin that helps me feel better" |
| **Teens** | Age-appropriate explanation of CBD vs THC, why you use it |

### Siblings

| Approach | Why It Works |
|----------|--------------|
| Casual sharing | Less formal relationship |
| Share your experience | Peer-level conversation |
| Offer information | They may be curious |

---

## If the Conversation Goes Poorly

### Handling Negative Reactions

| Reaction | Response |
|----------|----------|
| **Anger** | "I understand this is surprising. Let's talk when you've had time to think" |
| **Disappointment** | "I'm sorry you feel that way. I hope you'll learn more about it" |
| **Ultimatums** | "I respect your feelings. This is my choice for my health" |
| **Ignoring** | Give space, revisit later if appropriate |

### Setting Boundaries

- You don't need approval for your wellness choices
- You can share information without seeking permission
- Respectful disagreement is okay
- Your health decisions are ultimately yours

---

## Resources to Share

### For Curious Family Members

| Resource Type | Suggestion |
|---------------|------------|
| **Reputable websites** | Share links to educational content |
| **News articles** | Mainstream coverage of CBD |
| **Product information** | Show what you actually use |
| **Research summaries** | Academic findings made accessible |

### Helpful Talking Points

Share these facts:
- CBD is one of 100+ compounds in cannabis plants
- Hemp (the CBD source) is not marijuana
- CBD products are legally required to have <0.2% THC
- CBD is sold in pharmacies and health shops throughout Europe
- Millions of Europeans use CBD for wellness purposes

---

## Frequently Asked Questions

### What if family never accepts my CBD use?

You can maintain a relationship while disagreeing. If CBD helps your wellbeing, you don't need their approval. Focus on boundary-setting while being respectful of their views.

### Should I hide my CBD from family?

In most cases, honesty is better for relationships. However, your wellness choices are personal. Consider: Will hiding it cause more stress than having the conversation?

### How do I explain CBD to elderly relatives?

Use familiar comparisons: "It's a plant extract, like St. John's Wort or valerian, that helps with [your reason]." Emphasise it's not the same as marijuana and doesn't cause intoxication.

### What if my spouse is opposed?

For household partners, open communication is important. Try: understanding their specific concerns, sharing information gradually, suggesting they research independently, and finding compromise (like keeping it in a specific area).

### Should I tell extended family?

This is personal. Close family you see regularly—probably wise to share. Extended family—depends on your relationship and their likely reaction. You're not obligated to disclose.

---

## Key Messages Summary

What to communicate:

1. **CBD is not marijuana** and doesn't cause intoxication
2. **It's legal** and widely available
3. **Millions use it** for wellness purposes
4. **I chose it thoughtfully** for specific reasons
5. **I'm happy to share information** if you're curious
6. **This is my wellness choice** and I hope for your understanding

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  },
  {
    slug: 'first-week-on-cbd',
    title: 'Your First Week on CBD: What to Expect Day by Day',
    excerpt: 'Starting CBD this week? Our day-by-day guide covers what to expect, how to track your experience, common first-week patterns, and when to make adjustments.',
    meta_title: 'Your First Week on CBD: Day-by-Day Guide',
    meta_description: 'Just starting CBD? Our guide walks you through what to expect day by day during your first week, including common experiences and tracking tips.',
    reading_time: 10,
    content: `## Quick Answer

**In your first week on CBD, expect subtle effects at most—don't anticipate dramatic changes.** Focus on establishing a consistent routine (same time, same dose daily), tracking how you feel with simple ratings, and resisting the urge to increase your dose too quickly. Most people need 2-4 weeks to notice meaningful benefits.

---

## Key Takeaways

- **Most people notice little in week one**—this is normal
- **Consistency matters more than dose** initially
- **Take at the same time daily** with food
- **Track your experience** from day one
- **Resist over-adjusting** based on single days
- **Patience is essential**—CBD often builds over time

---

## Before Day 1: Setting Up for Success

### Preparation Checklist

| Task | Purpose |
|------|---------|
| **Set your starting dose** | Typically 10-20mg based on weight |
| **Choose your timing** | Morning or evening, consistently |
| **Prepare tracking method** | Journal, app, or notes |
| **Rate your baseline** | How do you feel before starting? |
| **Know your goals** | What are you hoping CBD helps with? |
| **Read product instructions** | Understand proper usage |

### Establish Your Baseline

Before taking your first dose, rate:

| Metric | Your Rating (1-10) |
|--------|-------------------|
| Primary concern (stress, sleep, etc.) | ___ |
| Energy level | ___ |
| Sleep quality (last night) | ___ |
| Overall mood | ___ |

Write these down—you'll compare later.

---

## Day 1: Getting Started

### What to Do

| Time | Action |
|------|--------|
| **Morning or evening** | Take your first dose (10-20mg) |
| **With food** | Improves absorption |
| **Under tongue** | Hold 60-90 seconds if using oil |
| **Note the time** | Record in your journal |

### What to Expect

| Reality | Common Experience |
|---------|-------------------|
| **Most likely** | Nothing noticeable |
| **Possible** | Subtle calm, slight relaxation |
| **Unlikely** | Dramatic effects |
| **If any side effects** | Mild drowsiness, dry mouth possible |

### Day 1 Tracking

\`\`\`
Day 1
Dose: ___mg at ___:___
With food: Y/N
Mood before: _/10
Mood after (2 hrs): _/10
End of day: _/10
Sleep: _/10
Notes: First day, how I felt:
\`\`\`

---

## Day 2: Building Routine

### What to Do

- Take the same dose as Day 1
- Same time of day
- Same method (with food, sublingual)
- Continue tracking

### What to Expect

| Day 2 Pattern | What It Means |
|---------------|---------------|
| Still nothing | Completely normal |
| Slight change in sleep | CBD often affects sleep first |
| Feel more relaxed | Could be CBD or placebo—keep watching |
| Side effect | Note it, usually mild and temporary |

### Common Day 2 Thoughts

> "I don't feel anything—is this working?"

**Response:** Too early to tell. CBD often has cumulative effects. Continue the routine.

> "I feel slightly different—is it working already?"

**Response:** Maybe—keep tracking to confirm. Could be placebo initially.

---

## Day 3: Staying Consistent

### What to Do

- Same dose, same time, same routine
- Continue tracking
- Notice any patterns beginning

### Common Day 3 Observations

| Observation | What to Do |
|-------------|------------|
| Better sleep noted | Keep tracking sleep quality |
| Still nothing | Normal—continue |
| Mild side effect | Usually subsides, continue unless concerning |
| Temptation to increase dose | Resist—give it time |

---

## Day 4: Early Midweek Check

### Reflection Point

Four days is enough to notice:
- Any side effects (usually appear early)
- Sleep changes (often first noticeable effect)
- Adjustment to routine

### Questions to Ask Yourself

| Question | Purpose |
|----------|---------|
| Am I remembering to take it? | Consistency check |
| Am I taking it at the same time? | Routine check |
| Any side effects? | Safety monitoring |
| Any early signals of change? | Pattern identification |

---

## Day 5: Continuing On

### What to Do

- Maintain exact routine
- Continue daily tracking
- Note any patterns

### Common Day 5 Experiences

| Experience | Interpretation |
|------------|----------------|
| Sleep improving slightly | Common early sign |
| Feel calmer sometimes | Possible early effect |
| Still no clear effect | Still normal—continue |
| Variable day to day | External factors matter |

---

## Day 6: Approaching End of Week 1

### Check-In

| Assessment | Your Answer |
|------------|-------------|
| Side effects this week? | |
| Any positive signs? | |
| Routine working well? | |
| Any adjustments needed? | |

### Resist the Urge To:

- Dramatically increase dose
- Judge CBD as "not working" yet
- Skip doses because "nothing is happening"
- Try a different product already

---

## Day 7: Week 1 Complete

### Week 1 Review

Calculate your averages:

| Metric | Day 1 | Day 7 | Change |
|--------|-------|-------|--------|
| Primary concern | _/10 | _/10 | |
| Sleep quality | _/10 | _/10 | |
| Energy | _/10 | _/10 | |
| Overall | _/10 | _/10 | |

### What Your Week 1 Data Means

| Pattern | Interpretation | Week 2 Action |
|---------|----------------|---------------|
| No change | Normal—too early | Continue same dose |
| Slight improvement | Promising sign | Continue same dose |
| Sleep better | Common first effect | Continue same dose |
| Feeling worse | Check other factors | Continue, monitor |
| Side effects | Usually mild | May reduce dose slightly |

---

## Common First Week Patterns

### Pattern 1: Nothing Noticeable

**Experience:** No obvious changes
**How common:** Most common (60-70%)
**What it means:** CBD often needs more time
**Action:** Continue for at least 3 more weeks

### Pattern 2: Subtle Sleep Improvement

**Experience:** Falling asleep easier, sleeping better
**How common:** Fairly common (20-30%)
**What it means:** Sleep effects often appear first
**Action:** Continue, monitor if other benefits emerge

### Pattern 3: Mild Relaxation

**Experience:** Feeling slightly calmer
**How common:** Some people (10-20%)
**What it means:** Early response, may build
**Action:** Continue current routine

### Pattern 4: Variable Effects

**Experience:** Better some days, nothing on others
**How common:** Common
**What it means:** Many factors affect daily experience
**Action:** Focus on weekly averages, not daily

### Pattern 5: Side Effects

**Experience:** Drowsiness, dry mouth, digestive changes
**How common:** Occasional (5-15%)
**What it means:** Usually mild and temporary
**Action:** Reduce dose if bothersome, otherwise continue

---

## What NOT to Do in Week 1

### First Week Mistakes

| Mistake | Why It's a Problem |
|---------|-------------------|
| **Increasing dose too fast** | Haven't given starting dose a chance |
| **Judging effectiveness** | Week 1 is too early |
| **Skipping days** | Disrupts potential cumulative effects |
| **Changing products** | Can't evaluate what works |
| **Not tracking** | No data to evaluate |
| **Taking inconsistently** | Different times, with/without food |

---

## Preparing for Week 2

### Week 2 Plan

| Element | Plan |
|---------|------|
| **Dose** | Same unless side effects warrant change |
| **Timing** | Keep consistent |
| **Tracking** | Continue daily |
| **Expectations** | May start seeing more patterns |
| **Review point** | End of week 2 for next assessment |

### When to Consider Changes

| Situation | Consider |
|-----------|----------|
| **Side effects persist** | Reduce dose by 5-10mg |
| **Drowsiness problematic** | Shift to evening dosing |
| **No side effects, no benefits** | May increase slightly week 3-4 |
| **Positive early signs** | Continue current dose |

---

## Frequently Asked Questions

### Nothing happened in week 1—should I stop?

No. Week 1 is primarily for establishing routine and checking for side effects. Most people need 2-4 weeks of consistent use to notice meaningful benefits. Continue for at least 4 weeks total before evaluating.

### Should I increase my dose after week 1?

Generally no. Give your starting dose at least 2 weeks before increasing. The exception: if you're taking a very low dose (under 10mg) and experiencing no effects or side effects, a modest increase is reasonable.

### My sleep improved but nothing else—is that normal?

Yes. Sleep is often the first area where people notice changes. Continue your routine and other benefits may emerge over the coming weeks.

### I felt something on day 1 but not since—what happened?

This is common and could be placebo effect initially, or simply variation in daily factors. Focus on weekly patterns rather than individual days.

### Is it normal to feel absolutely nothing?

Yes. Many people feel nothing in the first week. CBD effects are often subtle and cumulative. The absence of immediate effects doesn't predict long-term effectiveness.

---

## Your Week 1 Checklist

Daily:
- [ ] Take CBD at consistent time
- [ ] Take with food
- [ ] Record dose and time
- [ ] Rate primary concern (1-10)
- [ ] Note sleep quality
- [ ] Record any observations

End of Week:
- [ ] Calculate weekly averages
- [ ] Note any patterns
- [ ] Assess side effects
- [ ] Plan week 2 (usually: continue same routine)

---

## Looking Ahead

| Week | Focus |
|------|-------|
| **Week 1 (now)** | Establish routine, baseline tracking |
| **Week 2** | Continue consistency, watch for patterns |
| **Week 3** | Consider modest dose adjustment if needed |
| **Week 4** | Primary evaluation point—is CBD helping? |

**Remember:** The goal of week 1 is consistency and observation, not dramatic results. You're building a foundation for evaluating CBD's effect on your wellbeing over the coming weeks.

---

*Medical Disclaimer: This article is for informational purposes only and does not constitute medical advice. Consult a healthcare professional before using CBD, especially if you have a medical condition or take medications.*`
  }
];

async function main() {
  console.log('Inserting Getting Started guides (batch 3)...\n');

  for (const article of articles) {
    const { data, error } = await supabase.from('kb_articles').insert({
      ...article,
      status: 'published',
      featured: false,
      article_type: 'educational-guide',
      category_id: GUIDES_CATEGORY_ID,
      language: 'en',
      published_at: new Date().toISOString()
    }).select('slug').single();

    if (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
    } else {
      console.log(`✅ ${data.slug}`);
    }
  }

  console.log('\nBatch 3 complete. Getting Started guides complete (12/12)!');
}
main();
