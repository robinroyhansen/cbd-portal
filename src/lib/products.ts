export type ProductType = 'oils' | 'edibles' | 'topicals' | 'vapes' | 'capsules' | 'flower' | 'concentrates' | 'other';
export type ConsumptionMethod = 'sublingual' | 'oral' | 'topical' | 'inhalation' | 'transdermal';

export interface ProductCategory {
  id: ProductType;
  name: string;
  icon: string;
  description: string;
  consumptionMethod: ConsumptionMethod;
  onsetTime: string;
  duration: string;
  bioavailability: string;
  bestFor: string[];
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'oils',
    name: 'CBD Oils & Tinctures',
    icon: '🧴',
    description: 'Liquid CBD taken under the tongue for fast absorption',
    consumptionMethod: 'sublingual',
    onsetTime: '15-45 min',
    duration: '4-6 hours',
    bioavailability: '12-35%',
    bestFor: ['Precise dosing', 'Fast absorption', 'Daily use'],
    keywords: ['oil', 'tincture', 'dropper', 'drops', 'sublingual'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'edibles',
    name: 'Edibles & Gummies',
    icon: '🍬',
    description: 'CBD-infused food products including gummies, chocolates, and drinks',
    consumptionMethod: 'oral',
    onsetTime: '30-90 min',
    duration: '6-8 hours',
    bioavailability: '6-20%',
    bestFor: ['Discreet use', 'Long-lasting effects', 'Taste-sensitive users'],
    keywords: ['gummy', 'gummies', 'edible', 'chocolate', 'drink', 'beverage', 'tea', 'coffee', 'food'],
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'topicals',
    name: 'Topicals & Skincare',
    icon: '🧪',
    description: 'Creams, balms, and lotions applied directly to the skin',
    consumptionMethod: 'topical',
    onsetTime: '15-45 min',
    duration: '2-4 hours',
    bioavailability: 'Localized',
    bestFor: ['Targeted relief', 'Skin conditions', 'Muscle and joint support'],
    keywords: ['cream', 'lotion', 'balm', 'salve', 'topical', 'skincare', 'bath', 'lip'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'capsules',
    name: 'Capsules & Softgels',
    icon: '💊',
    description: 'Pre-measured CBD in pill form for consistent dosing',
    consumptionMethod: 'oral',
    onsetTime: '30-90 min',
    duration: '6-8 hours',
    bioavailability: '6-20%',
    bestFor: ['Consistent dosing', 'Travel-friendly', 'No taste concerns'],
    keywords: ['capsule', 'softgel', 'pill', 'tablet'],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'vapes',
    name: 'Vapes & Inhalables',
    icon: '💨',
    description: 'Vape pens, e-liquids, and cartridges for fast-acting effects',
    consumptionMethod: 'inhalation',
    onsetTime: '1-5 min',
    duration: '2-3 hours',
    bioavailability: '30-50%',
    bestFor: ['Immediate effects', 'High bioavailability', 'Experienced users'],
    keywords: ['vape', 'vaping', 'e-liquid', 'cartridge', 'pen', 'inhale'],
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'flower',
    name: 'Hemp Flower',
    icon: '🌿',
    description: 'Raw CBD-rich hemp buds for smoking or vaporizing',
    consumptionMethod: 'inhalation',
    onsetTime: '1-5 min',
    duration: '2-3 hours',
    bioavailability: '30-50%',
    bestFor: ['Full entourage effect', 'Traditional experience', 'Experienced users'],
    keywords: ['flower', 'bud', 'hemp flower', 'pre-roll', 'smoking'],
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'concentrates',
    name: 'Concentrates',
    icon: '💎',
    description: 'High-potency CBD extracts including wax, shatter, and distillate',
    consumptionMethod: 'inhalation',
    onsetTime: '1-5 min',
    duration: '2-4 hours',
    bioavailability: '40-60%',
    bestFor: ['High potency', 'Experienced users', 'Maximum efficiency'],
    keywords: ['concentrate', 'wax', 'shatter', 'crumble', 'distillate', 'isolate', 'hash', 'rso'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'other',
    name: 'Other Products',
    icon: '📦',
    description: 'Patches, sprays, and other CBD delivery methods',
    consumptionMethod: 'transdermal',
    onsetTime: 'Varies',
    duration: 'Varies',
    bioavailability: 'Varies',
    bestFor: ['Specific needs', 'Alternative delivery'],
    keywords: ['patch', 'spray', 'water-soluble', 'nano', 'liposomal', 'carrier'],
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
];

export const PRODUCT_CATEGORY_META: Record<ProductType, ProductCategory> = Object.fromEntries(
  PRODUCT_CATEGORIES.map(cat => [cat.id, cat])
) as Record<ProductType, ProductCategory>;

export interface CategorizedProductArticles {
  byType: Record<ProductType, any[]>;
  comparisons: any[];
  guides: any[];
}

export function categorizeProductArticles(articles: any[]): CategorizedProductArticles {
  const byType: Record<ProductType, any[]> = {
    oils: [],
    edibles: [],
    topicals: [],
    capsules: [],
    vapes: [],
    flower: [],
    concentrates: [],
    other: [],
  };

  const comparisons: any[] = [];
  const guides: any[] = [];

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    // Check for comparisons
    if (searchText.includes(' vs ') || searchText.includes('-vs-')) {
      comparisons.push(article);
      continue;
    }

    // Check for buying guides
    if (searchText.includes('guide') || searchText.includes('how to choose') || searchText.includes('buying')) {
      guides.push(article);
    }

    // Categorize by product type
    let assigned = false;
    for (const category of PRODUCT_CATEGORIES) {
      if (category.id === 'other') continue;

      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          byType[category.id].push(article);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      byType.other.push(article);
    }
  }

  return { byType, comparisons, guides };
}

export function getProductStats(categorized: CategorizedProductArticles) {
  const total = Object.values(categorized.byType).flat().length;
  return {
    total,
    comparisons: categorized.comparisons.length,
    guides: categorized.guides.length,
    byType: Object.fromEntries(
      Object.entries(categorized.byType).map(([type, articles]) => [type, articles.length])
    ) as Record<ProductType, number>,
  };
}
