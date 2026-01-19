const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const foundationsBasicsSlugs = [
  'introduction-to-cbd', 'beginners-guide-to-cbd', 'how-cbd-works', 'endocannabinoid-system',
  'history-of-cbd', 'cbd-buying-guide', 'understanding-cbd-quality', 'cbd-and-your-body',
  'what-is-cbd', 'what-is-hemp', 'hemp-vs-marijuana', 'what-is-cannabis',
  'what-is-full-spectrum-cbd', 'what-is-broad-spectrum-cbd', 'what-is-cbd-isolate',
  'full-spectrum-vs-broad-spectrum-vs-isolate', 'entourage-effect', 'what-are-cannabinoids',
  'what-are-terpenes', 'what-are-flavonoids', 'phytocannabinoids-vs-endocannabinoids',
  'hemp-extract-vs-cbd', 'cannabis-sativa-indica-ruderalis',
  'cb1-receptors', 'cb2-receptors', 'what-is-anandamide', 'what-is-2-ag',
  'gpr55-receptor', 'trpv-receptors', 'what-is-faah', 'endocannabinoid-deficiency',
  'support-endocannabinoid-system', 'ecs-and-homeostasis',
  'does-cbd-get-you-high', 'is-cbd-psychoactive', 'what-does-cbd-feel-like',
  'is-cbd-natural', 'where-does-cbd-come-from', 'how-is-cbd-made', 'is-cbd-a-drug',
  'is-cbd-medicine', 'can-anyone-take-cbd', 'age-to-buy-cbd', 'is-cbd-halal',
  'is-cbd-kosher', 'is-cbd-vegan', 'cbd-myths-debunked', 'cbd-terminology-glossary',
  'cbd-skeptics', 'why-people-use-cbd'
];

(async () => {
  const { data, error } = await supabase
    .from('kb_articles')
    .select('slug')
    .in('slug', foundationsBasicsSlugs);

  if (error) {
    console.error(error);
    return;
  }

  const existingSlugs = new Set(data.map(a => a.slug));
  const missingSlugs = foundationsBasicsSlugs.filter(s => existingSlugs.has(s) === false);

  console.log('Existing articles:', data.length + '/50');
  console.log('Missing slugs (' + missingSlugs.length + '):');
  missingSlugs.forEach(s => console.log('- ' + s));
})();
