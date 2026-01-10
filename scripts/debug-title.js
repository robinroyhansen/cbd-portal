// Test the new title generation logic

function generateReadableTitle(scientificTitle, studyType) {
  const title = scientificTitle;

  // Detect study type from title
  let type = studyType || 'Study';
  if (/randomized.*controlled.*trial|RCT/i.test(title)) {
    type = 'Clinical Trial';
  } else if (/systematic review/i.test(title)) {
    type = 'Systematic Review';
  } else if (/meta-analysis/i.test(title)) {
    type = 'Meta-Analysis';
  } else if (/pilot study/i.test(title)) {
    type = 'Pilot Study';
  } else if (/case report/i.test(title)) {
    type = 'Case Report';
  } else if (/cohort/i.test(title)) {
    type = 'Cohort Study';
  } else if (/in vitro|cell line/i.test(title)) {
    type = 'Lab Study';
  } else if (/mice|mouse|rat|animal/i.test(title)) {
    type = 'Animal Study';
  }

  // Try to extract condition/topic from title
  let condition = null;

  const patterns = [
    /(?:treatment|therapy)\s+(?:of|for)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
    /\bfor\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
    /\bin\s+([A-Z][a-zA-Z\s]+?(?:disorder|disease|syndrome|condition|pain|epilepsy|anxiety|depression)s?)(?:\s*[:(]|\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const extracted = match[1].trim();
      if (!/^(cannabidiol|cbd|cannabis|hemp|thc)$/i.test(extracted)) {
        condition = extracted;
        break;
      }
    }
  }

  if (condition && condition.length > 3 && condition.length < 50) {
    condition = condition.replace(/\s+/g, ' ').trim();
    const hasCBD = /cannabidiol|cbd/i.test(title);
    if (hasCBD) {
      return `CBD for ${condition}: ${type} Results`;
    }
    return `${condition}: ${type} Results`;
  }

  // Fallback
  let readable = title;
  readable = readable.replace(/^(A |An |The )/i, '');
  readable = readable.replace(/^randomized,?\s*/i, '');
  readable = readable.replace(/^double-blind,?\s*/i, '');
  readable = readable.replace(/^placebo-controlled,?\s*/i, '');
  readable = readable.replace(/^controlled\s+trial\s+(of|to|for)\s*/i, '');
  readable = readable.replace(/^trial\s+(of|to|for)\s*/i, '');
  readable = readable.replace(/\s*\([A-Z0-9]+\)\s*$/i, '');

  if (readable.length > 85) {
    readable = readable.substring(0, 82).replace(/\s+\S*$/, '');
  }

  readable = readable.charAt(0).toUpperCase() + readable.slice(1);
  return readable;
}

// Test cases
const tests = [
  "Randomized Placebo-controlled Trial to Determine the Biological Signature of Cannabidiol as a Treatment for Social Anxiety Disorder (R61)",
  "A Randomized, Double-Blind, Placebo-Controlled, Multi-Centre Study of CBD for Chronic Pain",
  "Systematic Review of Cannabidiol for Epilepsy Treatment",
  "Meta-analysis of CBD Effects on Sleep Disorders",
  "Pilot Study: CBD Oil for Arthritis Pain Relief",
  "The Effects of Cannabis on Memory in Healthy Adults",
  "Reducing Pain and Opioid Use With CBD",
  "Cannabidiol treatment for anxiety disorders",
  "CBD for depression: a systematic review",
];

console.log("=== Title Generation Test ===\n");
tests.forEach((title, i) => {
  const result = generateReadableTitle(title);
  console.log(`${i+1}. ORIGINAL: ${title}`);
  console.log(`   READABLE: ${result}`);
  console.log('');
});
