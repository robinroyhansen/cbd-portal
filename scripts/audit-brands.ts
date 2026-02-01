import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function audit() {
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug, country_code, website, description')
    .order('name')

  if (!brands) return

  // Group by normalized name to find duplicates
  const byName = new Map<string, typeof brands>()
  for (const b of brands) {
    const key = b.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push(b)
  }

  console.log('=== POTENTIAL DUPLICATES ===')
  for (const [key, list] of byName) {
    if (list.length > 1) {
      console.log(`\n"${list[0].name}" appears ${list.length}x:`)
      for (const b of list) {
        console.log(`  - ${b.country_code} | ${b.website} | id:${b.id}`)
      }
    }
  }

  console.log('\n\n=== ALL BRANDS BY COUNTRY ===')
  const byCountry = new Map<string, typeof brands>()
  for (const b of brands) {
    if (!byCountry.has(b.country_code)) byCountry.set(b.country_code, [])
    byCountry.get(b.country_code)!.push(b)
  }
  
  for (const [cc, list] of [...byCountry].sort((a,b) => b[1].length - a[1].length)) {
    console.log(`\n${cc} (${list.length}):`)
    for (const b of list) {
      console.log(`  - ${b.name} | ${b.website}`)
    }
  }
}

audit()
