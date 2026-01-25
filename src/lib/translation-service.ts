import Anthropic from '@anthropic-ai/sdk';

// Language configuration
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', domain: 'cbdportal.com' },
  da: { name: 'Danish', nativeName: 'Dansk', domain: 'cbd.dk' },
  sv: { name: 'Swedish', nativeName: 'Svenska', domain: 'cbd.se' },
  no: { name: 'Norwegian', nativeName: 'Norsk', domain: 'cbd.no' },
  de: { name: 'German', nativeName: 'Deutsch', domain: 'cbd.de' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', domain: 'cbdportaal.nl' },
  fi: { name: 'Finnish', nativeName: 'Suomi', domain: 'cbd.fi' },
  fr: { name: 'French', nativeName: 'Français', domain: 'cbdportail.fr' },
  it: { name: 'Italian', nativeName: 'Italiano', domain: 'cbd.it' },
  pt: { name: 'Portuguese', nativeName: 'Português', domain: 'cbd.pt' },
  ro: { name: 'Romanian', nativeName: 'Română', domain: 'cbdportal.ro' },
  es: { name: 'Spanish', nativeName: 'Español', domain: 'cbdportal.es' },
  'de-CH': { name: 'Swiss German', nativeName: 'Schweizerdeutsch', domain: 'cbdportal.ch' },
  'fr-CH': { name: 'Swiss French', nativeName: 'Français Suisse', domain: 'cbdportal.ch' },
  'it-CH': { name: 'Swiss Italian', nativeName: 'Italiano Svizzero', domain: 'cbdportal.ch' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  tokensUsed?: number;
}

export interface ArticleTranslation {
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
}

export interface ConditionTranslation {
  name: string;
  displayName?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface GlossaryTranslation {
  term: string;
  definition: string;
  simpleDefinition?: string;
}

// Translation context for better accuracy
const CBD_TRANSLATION_CONTEXT = `You are translating CBD health content for a medical/health information website.

Guidelines:
- Maintain medical accuracy - do not change the meaning
- Use formal but accessible language appropriate for the target country
- Keep these terms unchanged: CBD, THC, CBG, CBN, CBDA, mg, ml, %
- Keep brand names unchanged
- Preserve all markdown formatting
- Keep internal links unchanged (e.g., /conditions/anxiety stays as /conditions/anxiety)
- Keep measurement units unchanged (mg, ml, etc.)
- Use native medical terminology where appropriate
- For Swiss variants (de-CH, fr-CH, it-CH), use Swiss-specific terminology
- Preserve any HTML tags exactly as they appear
- Do not translate URLs or code blocks`;

class TranslationService {
  private client: Anthropic;
  private model = 'claude-3-haiku-20240307'; // Fast and cost-effective for translations

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Translate a single text string
   */
  async translateText(
    text: string,
    targetLanguage: LanguageCode,
    context?: string
  ): Promise<TranslationResult> {
    if (targetLanguage === 'en') {
      return {
        translatedText: text,
        sourceLanguage: 'en',
        targetLanguage: 'en',
      };
    }

    const langInfo = SUPPORTED_LANGUAGES[targetLanguage];
    const additionalContext = context ? `\n\nAdditional context: ${context}` : '';

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${CBD_TRANSLATION_CONTEXT}${additionalContext}

Translate the following text from English to ${langInfo.name} (${langInfo.nativeName}):

${text}

Provide ONLY the translated text, no explanations or notes.`,
        },
      ],
    });

    const translatedText = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : '';

    return {
      translatedText,
      sourceLanguage: 'en',
      targetLanguage,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  /**
   * Translate a JSON object of UI strings (preserving keys)
   */
  async translateUIStrings(
    strings: Record<string, unknown>,
    targetLanguage: LanguageCode
  ): Promise<Record<string, unknown>> {
    if (targetLanguage === 'en') {
      return strings;
    }

    const langInfo = SUPPORTED_LANGUAGES[targetLanguage];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `${CBD_TRANSLATION_CONTEXT}

Translate the following JSON object from English to ${langInfo.name} (${langInfo.nativeName}).
IMPORTANT: Keep all JSON keys unchanged, only translate the string values.
Preserve any template variables like {{count}}, {{year}}, {{minutes}}, etc.

Input JSON:
${JSON.stringify(strings, null, 2)}

Output ONLY valid JSON with translated values:`,
        },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : '{}';

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse translated JSON:', error);
      throw new Error('Translation produced invalid JSON');
    }
  }

  /**
   * Translate a full article
   */
  async translateArticle(
    article: {
      title: string;
      content: string;
      metaDescription?: string;
      slug: string;
    },
    targetLanguage: LanguageCode
  ): Promise<ArticleTranslation> {
    if (targetLanguage === 'en') {
      return {
        title: article.title,
        content: article.content,
        excerpt: article.metaDescription,
        metaTitle: article.title,
        metaDescription: article.metaDescription,
        slug: article.slug,
      };
    }

    const langInfo = SUPPORTED_LANGUAGES[targetLanguage];

    // Translate title and meta separately for accuracy
    const [titleResult, contentResult, metaResult] = await Promise.all([
      this.translateText(article.title, targetLanguage, 'This is an article title'),
      this.translateText(article.content, targetLanguage, 'This is article content in markdown format'),
      article.metaDescription
        ? this.translateText(article.metaDescription, targetLanguage, 'This is a meta description for SEO (max 160 characters)')
        : Promise.resolve({ translatedText: '' }),
    ]);

    return {
      title: titleResult.translatedText,
      content: contentResult.translatedText,
      excerpt: metaResult.translatedText || undefined,
      metaTitle: titleResult.translatedText,
      metaDescription: metaResult.translatedText || undefined,
      slug: article.slug, // Keep original slug
    };
  }

  /**
   * Translate a condition
   */
  async translateCondition(
    condition: {
      name: string;
      displayName?: string;
      shortDescription?: string;
      metaTitle?: string;
      metaDescription?: string;
    },
    targetLanguage: LanguageCode
  ): Promise<ConditionTranslation> {
    if (targetLanguage === 'en') {
      return {
        name: condition.name,
        displayName: condition.displayName,
        shortDescription: condition.shortDescription,
        metaTitle: condition.metaTitle,
        metaDescription: condition.metaDescription,
      };
    }

    const langInfo = SUPPORTED_LANGUAGES[targetLanguage];

    // Batch translate all fields
    const toTranslate = {
      name: condition.name,
      displayName: condition.displayName || condition.name,
      shortDescription: condition.shortDescription || '',
      metaTitle: condition.metaTitle || '',
      metaDescription: condition.metaDescription || '',
    };

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${CBD_TRANSLATION_CONTEXT}

Translate these medical condition fields from English to ${langInfo.name} (${langInfo.nativeName}):

name: ${toTranslate.name}
displayName: ${toTranslate.displayName}
shortDescription: ${toTranslate.shortDescription}
metaTitle: ${toTranslate.metaTitle}
metaDescription: ${toTranslate.metaDescription}

Respond in this exact JSON format:
{
  "name": "translated name",
  "displayName": "translated display name",
  "shortDescription": "translated short description",
  "metaTitle": "translated meta title",
  "metaDescription": "translated meta description"
}`,
        },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : '{}';

    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse condition translation:', error);
      throw new Error('Condition translation produced invalid JSON');
    }
  }

  /**
   * Translate a glossary term
   */
  async translateGlossaryTerm(
    term: {
      term: string;
      definition: string;
      simpleDefinition?: string;
    },
    targetLanguage: LanguageCode
  ): Promise<GlossaryTranslation> {
    if (targetLanguage === 'en') {
      return {
        term: term.term,
        definition: term.definition,
        simpleDefinition: term.simpleDefinition,
      };
    }

    const langInfo = SUPPORTED_LANGUAGES[targetLanguage];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${CBD_TRANSLATION_CONTEXT}

Translate this glossary term from English to ${langInfo.name} (${langInfo.nativeName}):

Term: ${term.term}
Definition: ${term.definition}
Simple Definition: ${term.simpleDefinition || 'N/A'}

Respond in this exact JSON format:
{
  "term": "translated term",
  "definition": "translated definition",
  "simpleDefinition": "translated simple definition or null if not applicable"
}`,
        },
      ],
    });

    const responseText = response.content[0].type === 'text'
      ? response.content[0].text.trim()
      : '{}';

    let jsonStr = responseText;
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse glossary translation:', error);
      throw new Error('Glossary translation produced invalid JSON');
    }
  }

  /**
   * Translate a research plain summary
   */
  async translateResearchSummary(
    summary: string,
    targetLanguage: LanguageCode
  ): Promise<string> {
    if (targetLanguage === 'en') {
      return summary;
    }

    const result = await this.translateText(
      summary,
      targetLanguage,
      'This is a plain-language summary of a scientific research study about CBD'
    );

    return result.translatedText;
  }
}

// Singleton instance
let translationService: TranslationService | null = null;

export function getTranslationService(): TranslationService {
  if (!translationService) {
    translationService = new TranslationService();
  }
  return translationService;
}

export { TranslationService };
