export type ArticleType =
  | 'condition'        // CBD for Anxiety, Pain, etc.
  | 'product-guide'    // Best CBD Oils, How to Choose
  | 'science-explainer' // How CBD Works, ECS Explained
  | 'beginner-guide'   // Getting Started with CBD
  | 'comparison'       // CBD vs THC, Full vs Broad Spectrum
  | 'news'             // Research news, legal updates
  | 'standard';        // General articles

export interface ArticleTemplate {
  type: ArticleType;
  name: string;
  description: string;
  icon: string;
  sections: TemplateSection[];
  suggestedTags: string[];
  seoTips: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
  wordCountGuide: { min: number; max: number };
}

export const articleTemplates: Record<ArticleType, ArticleTemplate> = {
  condition: {
    type: 'condition',
    name: 'Health Condition Article',
    description: 'In-depth guide about CBD for a specific health condition',
    icon: '🏥',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Brief overview of the condition and how CBD may help',
        required: true,
        placeholder: 'Introduce the condition and why people are interested in CBD for it...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'what-is',
        title: 'What is [Condition]?',
        description: 'Explain the condition, symptoms, and conventional treatments',
        required: true,
        placeholder: 'Describe the condition, its symptoms, prevalence, and how it affects people...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'how-cbd-helps',
        title: 'How CBD May Help',
        description: 'Mechanisms of action and potential benefits',
        required: true,
        placeholder: 'Explain how CBD interacts with the body to potentially address this condition...',
        wordCountGuide: { min: 300, max: 500 }
      },
      {
        id: 'research',
        title: 'What Does the Research Say?',
        description: 'Summary of relevant scientific studies',
        required: true,
        placeholder: 'Summarize key research studies, including methodology and findings...',
        wordCountGuide: { min: 400, max: 800 }
      },
      {
        id: 'dosage',
        title: 'Dosage Considerations',
        description: 'General dosage guidance (with disclaimers)',
        required: true,
        placeholder: 'Provide general dosage guidance while emphasizing consultation with healthcare providers...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'product-types',
        title: 'Best CBD Products for [Condition]',
        description: 'Which product types may be most suitable',
        required: false,
        placeholder: 'Discuss which CBD product types (oils, topicals, etc.) may be most effective...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'side-effects',
        title: 'Potential Side Effects & Interactions',
        description: 'Important safety information',
        required: true,
        placeholder: 'List potential side effects, drug interactions, and contraindications...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: '4-6 common questions and answers',
        required: true,
        placeholder: 'Q: Is CBD safe for [condition]?\nA: ...\n\nQ: How long until I see results?\nA: ...',
        wordCountGuide: { min: 300, max: 600 }
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        description: 'Summary and key takeaways',
        required: true,
        placeholder: 'Summarize the key points and encourage readers to consult healthcare providers...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: ['research', 'dosage', 'side-effects'],
    seoTips: [
      'Include the condition name in the title (e.g., "CBD for Anxiety")',
      'Use the condition name in the first paragraph',
      'Include related long-tail keywords',
      'Add FAQ schema for featured snippets'
    ]
  },

  'product-guide': {
    type: 'product-guide',
    name: 'Product Guide',
    description: 'Guide to choosing and using CBD products',
    icon: '🧴',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Overview of the product type and what readers will learn',
        required: true,
        placeholder: 'Introduce the product type and why this guide is valuable...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'what-is',
        title: 'What is [Product Type]?',
        description: 'Explain the product category',
        required: true,
        placeholder: 'Describe what this product type is, how it\'s made, and how it\'s used...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'benefits',
        title: 'Benefits of [Product Type]',
        description: 'Key advantages of this product format',
        required: true,
        placeholder: 'List and explain the benefits of this product type...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'how-to-choose',
        title: 'How to Choose the Best [Product]',
        description: 'Buying criteria and what to look for',
        required: true,
        placeholder: 'Explain key factors: potency, extraction method, third-party testing, ingredients...',
        wordCountGuide: { min: 300, max: 500 }
      },
      {
        id: 'how-to-use',
        title: 'How to Use [Product Type]',
        description: 'Usage instructions and tips',
        required: true,
        placeholder: 'Provide step-by-step usage instructions...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'dosage',
        title: 'Dosage Guide',
        description: 'General dosing recommendations',
        required: true,
        placeholder: 'Explain starting doses and how to adjust...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'pros-cons',
        title: 'Pros and Cons',
        description: 'Balanced view of advantages and disadvantages',
        required: true,
        placeholder: 'Pros:\n- ...\n\nCons:\n- ...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: '4-6 common questions',
        required: true,
        placeholder: 'Q: How long do effects last?\nA: ...',
        wordCountGuide: { min: 250, max: 500 }
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        description: 'Summary and recommendations',
        required: true,
        placeholder: 'Summarize key points and provide final recommendations...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: ['buying-guide', 'quality', 'dosage'],
    seoTips: [
      'Include "best" or "guide" in the title for search intent',
      'Use comparison tables where relevant',
      'Include specific product characteristics',
      'Add structured data for products'
    ]
  },

  'science-explainer': {
    type: 'science-explainer',
    name: 'Science Explainer',
    description: 'Educational content explaining CBD science',
    icon: '🔬',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Hook and overview of the topic',
        required: true,
        placeholder: 'Introduce the scientific topic and why it matters...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'basics',
        title: 'The Basics',
        description: 'Foundational concepts readers need to understand',
        required: true,
        placeholder: 'Explain the fundamental concepts in accessible language...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'how-it-works',
        title: 'How It Works',
        description: 'Detailed explanation of mechanisms',
        required: true,
        placeholder: 'Explain the mechanisms in detail, using analogies where helpful...',
        wordCountGuide: { min: 400, max: 800 }
      },
      {
        id: 'research-evidence',
        title: 'Research & Evidence',
        description: 'Scientific studies supporting the explanation',
        required: true,
        placeholder: 'Cite and summarize relevant research studies...',
        wordCountGuide: { min: 300, max: 600 }
      },
      {
        id: 'practical-implications',
        title: 'What This Means for CBD Users',
        description: 'Practical takeaways from the science',
        required: true,
        placeholder: 'Translate the science into practical advice...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'common-misconceptions',
        title: 'Common Misconceptions',
        description: 'Address myths and misunderstandings',
        required: false,
        placeholder: 'Myth: ...\nReality: ...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: '3-5 science-related questions',
        required: true,
        placeholder: 'Q: ...\nA: ...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'conclusion',
        title: 'Key Takeaways',
        description: 'Summary of main points',
        required: true,
        placeholder: 'Summarize the key scientific points readers should remember...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: ['research', 'endocannabinoid-system', 'cannabinoids'],
    seoTips: [
      'Use "explained" or "how does X work" in titles',
      'Include diagrams or infographic descriptions',
      'Link to glossary terms',
      'Cite primary research sources'
    ]
  },

  'beginner-guide': {
    type: 'beginner-guide',
    name: 'Beginner Guide',
    description: 'Introductory content for CBD newcomers',
    icon: '📚',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Welcome newcomers and set expectations',
        required: true,
        placeholder: 'Welcome readers and explain what they will learn...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'what-is-cbd',
        title: 'What is CBD?',
        description: 'Basic explanation for beginners',
        required: true,
        placeholder: 'Explain CBD in simple terms for someone who knows nothing about it...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'is-it-legal',
        title: 'Is CBD Legal?',
        description: 'Legal status overview',
        required: true,
        placeholder: 'Explain the legal status of CBD in simple terms...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'will-it-get-me-high',
        title: 'Will CBD Get Me High?',
        description: 'Address the THC concern',
        required: true,
        placeholder: 'Explain the difference between CBD and THC...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'benefits',
        title: 'Potential Benefits of CBD',
        description: 'Overview of what CBD may help with',
        required: true,
        placeholder: 'List the potential benefits people use CBD for...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'product-types',
        title: 'Types of CBD Products',
        description: 'Overview of different product formats',
        required: true,
        placeholder: 'Explain oils, capsules, topicals, edibles, etc...',
        wordCountGuide: { min: 250, max: 500 }
      },
      {
        id: 'how-to-start',
        title: 'How to Get Started',
        description: 'Step-by-step guide for beginners',
        required: true,
        placeholder: 'Step 1: ...\nStep 2: ...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'dosage',
        title: 'Beginner Dosage Tips',
        description: 'Starting dose guidance',
        required: true,
        placeholder: 'Explain the "start low, go slow" approach...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'what-to-look-for',
        title: 'What to Look for When Buying',
        description: 'Quality indicators for beginners',
        required: true,
        placeholder: 'Explain third-party testing, COAs, reputable brands...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'faq',
        title: 'Beginner FAQ',
        description: 'Common beginner questions',
        required: true,
        placeholder: 'Q: Is CBD safe?\nA: ...',
        wordCountGuide: { min: 300, max: 600 }
      },
      {
        id: 'next-steps',
        title: 'Next Steps',
        description: 'Where to go from here',
        required: true,
        placeholder: 'Point readers to more detailed resources...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: ['beginner-guide', 'how-to', 'dosage', 'buying-guide'],
    seoTips: [
      'Use "beginner" or "getting started" in the title',
      'Keep language simple and jargon-free',
      'Link to glossary for technical terms',
      'Include a clear table of contents'
    ]
  },

  comparison: {
    type: 'comparison',
    name: 'Comparison Article',
    description: 'Compare two or more CBD-related topics',
    icon: '⚖️',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Set up the comparison',
        required: true,
        placeholder: 'Introduce what you are comparing and why it matters...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'quick-comparison',
        title: 'Quick Comparison Table',
        description: 'At-a-glance comparison',
        required: true,
        placeholder: '| Feature | Option A | Option B |\n|---------|----------|----------|\n| ... | ... | ... |',
        wordCountGuide: { min: 100, max: 300 }
      },
      {
        id: 'option-a',
        title: '[Option A] Explained',
        description: 'Detailed look at first option',
        required: true,
        placeholder: 'Explain the first option in detail...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'option-b',
        title: '[Option B] Explained',
        description: 'Detailed look at second option',
        required: true,
        placeholder: 'Explain the second option in detail...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'key-differences',
        title: 'Key Differences',
        description: 'Main points of differentiation',
        required: true,
        placeholder: 'Highlight the most important differences...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'similarities',
        title: 'Similarities',
        description: 'What they have in common',
        required: false,
        placeholder: 'Explain what the options share in common...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'which-to-choose',
        title: 'Which Should You Choose?',
        description: 'Guidance based on user needs',
        required: true,
        placeholder: 'Choose [A] if you...\nChoose [B] if you...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: 'Common comparison questions',
        required: true,
        placeholder: 'Q: Can I use both?\nA: ...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        description: 'Final verdict',
        required: true,
        placeholder: 'Summarize the comparison and give final recommendations...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: [],
    seoTips: [
      'Use "vs" or "versus" in the title',
      'Include comparison table for featured snippets',
      'Address both options fairly',
      'Include clear recommendations'
    ]
  },

  news: {
    type: 'news',
    name: 'News Article',
    description: 'News about CBD research, regulations, or industry',
    icon: '📰',
    sections: [
      {
        id: 'headline-summary',
        title: 'Summary',
        description: 'Key facts in 2-3 sentences',
        required: true,
        placeholder: 'Summarize the news in 2-3 sentences...',
        wordCountGuide: { min: 50, max: 100 }
      },
      {
        id: 'what-happened',
        title: 'What Happened',
        description: 'Detailed explanation of the news',
        required: true,
        placeholder: 'Explain the news event in detail...',
        wordCountGuide: { min: 200, max: 400 }
      },
      {
        id: 'why-it-matters',
        title: 'Why It Matters',
        description: 'Significance and implications',
        required: true,
        placeholder: 'Explain why this news is important for CBD users...',
        wordCountGuide: { min: 150, max: 300 }
      },
      {
        id: 'background',
        title: 'Background',
        description: 'Context for the news',
        required: false,
        placeholder: 'Provide background context...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'what-happens-next',
        title: 'What Happens Next',
        description: 'Future implications or next steps',
        required: false,
        placeholder: 'Explain what to expect going forward...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'expert-opinion',
        title: 'Expert Analysis',
        description: 'Expert perspective on the news',
        required: false,
        placeholder: 'Provide expert analysis or commentary...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: ['news', 'research', 'legal'],
    seoTips: [
      'Include date in content for freshness',
      'Use news-style headline',
      'Cite sources clearly',
      'Update if story develops'
    ]
  },

  standard: {
    type: 'standard',
    name: 'Standard Article',
    description: 'General article without specific template',
    icon: '📄',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Article introduction',
        required: true,
        placeholder: 'Introduce the topic...',
        wordCountGuide: { min: 100, max: 200 }
      },
      {
        id: 'body',
        title: 'Main Content',
        description: 'Main article content',
        required: true,
        placeholder: 'Write the main content...',
        wordCountGuide: { min: 500, max: 2000 }
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        description: 'Summary and conclusion',
        required: true,
        placeholder: 'Conclude the article...',
        wordCountGuide: { min: 100, max: 200 }
      }
    ],
    suggestedTags: [],
    seoTips: [
      'Include primary keyword in title and first paragraph',
      'Use subheadings for readability',
      'Include internal links to related content'
    ]
  }
};

export function getTemplate(type: ArticleType): ArticleTemplate {
  return articleTemplates[type] || articleTemplates.standard;
}

export function getTemplateList(): { type: ArticleType; name: string; icon: string }[] {
  return Object.values(articleTemplates).map(t => ({
    type: t.type,
    name: t.name,
    icon: t.icon
  }));
}