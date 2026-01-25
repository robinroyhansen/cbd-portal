/**
 * HowTo Schema Generator for SEO
 * Generates JSON-LD structured data for tool pages
 * https://schema.org/HowTo
 */

export interface HowToStep {
  name: string;
  text: string;
}

export interface HowToSchemaData {
  title: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration format, e.g., "PT5M" for 5 minutes
}

export interface HowToSchema {
  '@context': 'https://schema.org';
  '@type': 'HowTo';
  name: string;
  description: string;
  step: {
    '@type': 'HowToStep';
    position: number;
    name: string;
    text: string;
  }[];
  totalTime?: string;
}

/**
 * Generates a HowTo schema object for SEO structured data
 * @param data - The HowTo data including title, description, steps, and optional totalTime
 * @returns A JSON-LD compatible HowTo schema object
 */
export function generateHowToSchema(data: HowToSchemaData): HowToSchema {
  const schema: HowToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.title,
    description: data.description,
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  if (data.totalTime) {
    schema.totalTime = data.totalTime;
  }

  return schema;
}
