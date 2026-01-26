// Navigation item type definitions and configuration

export interface NavChild {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  researchHref?: string;
}

export interface MegaMenuConfig {
  featured?: NavChild[];
  categories?: { title: string; items: NavChild[] }[];
  footer?: { label: string; href: string };
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavChild[];
  megaMenu?: MegaMenuConfig;
}

// Translation function type
type TranslateFunction = (key: string, params?: Record<string, string>) => string;

/**
 * Builds navigation items with translations
 * @param t - Translation function from useLocale hook
 * @returns Array of navigation items with translated labels
 */
export function buildNavItems(t: TranslateFunction): NavItem[] {
  return [
    {
      label: t('nav.healthTopics'),
      href: '/conditions',
      icon: '\u{1F3E5}',
      megaMenu: {
        featured: [
          { label: t('conditions.anxiety') || 'Anxiety', href: '/conditions/anxiety', description: `353 ${t('common.studies')}`, icon: '\u{1F630}', researchHref: '/research/anxiety' },
          { label: t('conditions.sleep') || 'Sleep & Insomnia', href: '/conditions/sleep', description: `287 ${t('common.studies')}`, icon: '\u{1F634}', researchHref: '/research/sleep' },
          { label: t('conditions.chronicPain') || 'Chronic Pain', href: '/conditions/chronic_pain', description: `412 ${t('common.studies')}`, icon: '\u{1F4AA}', researchHref: '/research/chronic_pain' },
          { label: t('conditions.depression') || 'Depression', href: '/conditions/depression', description: `198 ${t('common.studies')}`, icon: '\u{1F614}', researchHref: '/research/depression' },
          { label: t('conditions.epilepsy') || 'Epilepsy', href: '/conditions/epilepsy', description: t('evidence.clinicallyProven'), icon: '\u{26A1}', researchHref: '/research/epilepsy' },
          { label: t('conditions.inflammation') || 'Inflammation', href: '/conditions/inflammation', description: `267 ${t('common.studies')}`, icon: '\u{1F525}', researchHref: '/research/inflammation' },
        ],
        categories: [
          {
            title: t('nav.browseByBodySystem'),
            items: [
              { label: t('navCategories.mentalHealth'), href: '/conditions?category=mental_health', icon: '\u{1F9E0}' },
              { label: t('navCategories.painDiscomfort'), href: '/conditions?category=pain', icon: '\u{1F4AA}' },
              { label: t('navCategories.neurological'), href: '/conditions?category=neurological', icon: '\u{26A1}' },
              { label: t('navCategories.digestiveHealth'), href: '/conditions?category=gastrointestinal', icon: '\u{1F343}' },
              { label: t('navCategories.skinConditions'), href: '/conditions?category=skin', icon: '\u{2728}' },
              { label: t('navCategories.cardiovascular'), href: '/conditions?category=cardiovascular', icon: '\u{2764}\u{FE0F}' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllConditions'), href: '/conditions' }
      }
    },
    {
      label: t('nav.learn'),
      href: '/articles',
      icon: '\u{1F4DA}',
      megaMenu: {
        featured: [
          { label: t('navLearn.cbdBasics'), href: '/categories/cbd-basics', description: t('navLearn.cbdBasicsDesc'), icon: '\u{1F331}' },
          { label: t('navLearn.scienceResearch'), href: '/categories/science', description: t('navLearn.scienceResearchDesc'), icon: '\u{1F52C}' },
          { label: t('navLearn.guidesHowTo'), href: '/categories/guides', description: t('navLearn.guidesHowToDesc'), icon: '\u{1F4D6}' },
          { label: t('navLearn.productsFormats'), href: '/categories/products', description: t('navLearn.productsFormatsDesc'), icon: '\u{1F48A}' },
          { label: t('navLearn.legalSafety'), href: '/categories/legal', description: t('navLearn.legalSafetyDesc'), icon: '\u{2696}\u{FE0F}' },
        ],
        categories: [
          {
            title: t('nav.quickAccess'),
            items: [
              { label: t('nav.glossary'), href: '/glossary', description: t('navLearn.termsDefinedCount', { count: '263' }), icon: '\u{1F4D6}' },
              { label: t('nav.allArticles'), href: '/articles', description: t('navLearn.articlesCount', { count: '1,000' }), icon: '\u{1F4C4}' },
              { label: t('nav.authors'), href: '/authors', description: t('navLearn.meetExperts'), icon: '\u{1F468}\u{200D}\u{2695}\u{FE0F}' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllArticles'), href: '/articles' }
      }
    },
    {
      label: t('nav.research'),
      href: '/research',
      icon: '\u{1F52C}'
    },
    {
      label: t('nav.tools'),
      href: '/tools',
      icon: '\u{1F9EE}',
      megaMenu: {
        featured: [
          { label: t('navTools.dosageCalculator'), href: '/tools/dosage-calculator', description: t('navTools.dosageCalculatorDesc'), icon: '\u{1F48A}' },
          { label: t('navTools.interactionChecker'), href: '/tools/interactions', description: t('navTools.interactionCheckerDesc'), icon: '\u{26A0}\u{FE0F}' },
          { label: t('navTools.costCalculator'), href: '/tools/cost-calculator', description: t('navTools.costCalculatorDesc'), icon: '\u{1F4B0}' },
          { label: t('navTools.strengthCalculator'), href: '/tools/strength-calculator', description: t('navTools.strengthCalculatorDesc'), icon: '\u{1F4CA}' },
        ],
        categories: [
          {
            title: t('nav.comingSoon'),
            items: [
              { label: t('navTools.productComparison'), href: '/tools', description: t('navTools.productComparisonDesc'), icon: '\u{1F4CB}' },
              { label: t('navTools.labReportDecoder'), href: '/tools', description: t('navTools.labReportDecoderDesc'), icon: '\u{1F50D}' },
              { label: t('navTools.toleranceCalculator'), href: '/tools', description: t('navTools.toleranceCalculatorDesc'), icon: '\u{1F4C8}' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllTools'), href: '/tools' }
      }
    },
    {
      label: t('nav.pets'),
      href: '/pets',
      icon: '\u{1F43E}',
      megaMenu: {
        featured: [
          { label: t('navPets.dogs'), href: '/pets/dogs', description: t('navPets.dogsDesc'), icon: '\u{1F415}' },
          { label: t('navPets.cats'), href: '/pets/cats', description: t('navPets.catsDesc'), icon: '\u{1F408}' },
          { label: t('navPets.horses'), href: '/pets/horses', description: t('navPets.horsesDesc'), icon: '\u{1F434}' },
          { label: t('navPets.smallPets'), href: '/pets/small-pets', description: t('navPets.smallPetsDesc'), icon: '\u{1F430}' },
          { label: t('navPets.birds'), href: '/pets/birds', description: t('navPets.birdsDesc'), icon: '\u{1F99C}' },
        ],
        categories: [
          {
            title: t('nav.petTools'),
            items: [
              { label: t('navPets.petDosageCalculator'), href: '/tools/animal-dosage-calculator', description: t('navPets.petDosageCalculatorDesc'), icon: '\u{1F48A}' },
            ]
          },
          {
            title: t('nav.quickLinks'),
            items: [
              { label: t('navPets.allPetArticles'), href: '/pets', description: t('navPets.allPetArticlesCount', { count: '78' }), icon: '\u{1F4C4}' },
              { label: t('navPets.petResearch'), href: '/research?topic=veterinary', description: t('navPets.petResearchDesc'), icon: '\u{1F52C}' },
            ]
          }
        ],
        footer: { label: t('nav.viewAllPetGuides'), href: '/pets' }
      }
    },
    {
      label: t('nav.reviews'),
      href: '/reviews',
      icon: '\u{2B50}'
    }
  ];
}

/**
 * Gets the column header text based on nav item label
 * @param itemLabel - The label of the nav item
 * @param t - Translation function
 * @returns The appropriate column header translation
 */
export function getColumnHeader(itemLabel: string, t: TranslateFunction): string {
  if (itemLabel === t('nav.healthTopics')) return t('nav.popularConditions');
  return t('nav.categories');
}
