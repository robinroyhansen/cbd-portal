export type PetType = 'dogs' | 'cats' | 'horses' | 'birds' | 'small-pets' | 'general';

export interface PetCategory {
  id: PetType;
  name: string;
  icon: string;
  description: string;
  safetyNote: string;
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PET_CATEGORIES: PetCategory[] = [
  {
    id: 'dogs',
    name: 'Dogs',
    icon: '🐕',
    description: 'CBD guides for canine companions - from puppies to senior dogs',
    safetyNote: 'Always consult your veterinarian before giving CBD to your dog',
    keywords: ['dog', 'canine', 'puppy', 'puppies'],
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'cats',
    name: 'Cats',
    icon: '🐈',
    description: 'CBD information for feline friends - special considerations for cats',
    safetyNote: 'Cats metabolize CBD differently than dogs - use cat-specific products',
    keywords: ['cat', 'feline', 'kitten'],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'horses',
    name: 'Horses',
    icon: '🐴',
    description: 'CBD for equine health - supporting performance and recovery',
    safetyNote: 'Check competition regulations before using CBD with sport horses',
    keywords: ['horse', 'equine', 'equestrian'],
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'birds',
    name: 'Birds',
    icon: '🦜',
    description: 'CBD guidance for avian pets - parrots, finches, and more',
    safetyNote: 'Birds are highly sensitive - start with very low doses',
    keywords: ['bird', 'avian', 'parrot', 'feather'],
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'small-pets',
    name: 'Small Pets',
    icon: '🐰',
    description: 'CBD for rabbits, guinea pigs, ferrets, hamsters, and other small animals',
    safetyNote: 'Dosing for small animals requires extra precision due to their size',
    keywords: ['rabbit', 'guinea pig', 'ferret', 'hamster', 'small animal', 'small pet'],
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  {
    id: 'general',
    name: 'General Pet CBD',
    icon: '🐾',
    description: 'General information about CBD for pets - safety, dosing, and product selection',
    safetyNote: 'Never give human CBD products to pets without consulting a vet',
    keywords: ['pet', 'animal', 'veterinary', 'vet'],
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
];

export const PET_CATEGORY_META: Record<PetType, PetCategory> = Object.fromEntries(
  PET_CATEGORIES.map(cat => [cat.id, cat])
) as Record<PetType, PetCategory>;

export interface CategorizedPetArticles {
  dogs: any[];
  cats: any[];
  horses: any[];
  birds: any[];
  'small-pets': any[];
  general: any[];
}

export function categorizePetArticles(articles: any[]): CategorizedPetArticles {
  const categorized: CategorizedPetArticles = {
    dogs: [],
    cats: [],
    horses: [],
    birds: [],
    'small-pets': [],
    general: [],
  };

  for (const article of articles) {
    const titleLower = article.title.toLowerCase();
    const slugLower = article.slug.toLowerCase();
    const searchText = `${titleLower} ${slugLower}`;

    let assigned = false;

    // Check each pet category (excluding general)
    for (const category of PET_CATEGORIES) {
      if (category.id === 'general') continue;

      for (const keyword of category.keywords) {
        if (searchText.includes(keyword)) {
          categorized[category.id].push(article);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }

    // If not assigned to a specific pet type, add to general
    if (!assigned) {
      categorized.general.push(article);
    }
  }

  return categorized;
}

export function getPetCategoryStats(categorized: CategorizedPetArticles) {
  return {
    total: Object.values(categorized).flat().length,
    dogs: categorized.dogs.length,
    cats: categorized.cats.length,
    horses: categorized.horses.length,
    birds: categorized.birds.length,
    smallPets: categorized['small-pets'].length,
    general: categorized.general.length,
  };
}
