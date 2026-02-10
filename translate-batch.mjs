import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Articles to translate - these are the 15 fetched articles
const articlesToTranslate = [
  {
    id: "eec8d839-859a-44c5-a7b8-5de9aafd475b",
    slug: "how-cbd-works",
    title: "The Science of CBD: How Cannabidiol Works in the Body",
    content: `By Robin Roy Krigslund-Hansen | 12+ years in [CBD](/glossary/cannabidiol) industry
Last updated: January 2026

---

## Quick Answer

[Cannabidiol](/glossary/cannabidiol) (CBD) works primarily by interacting with your body's [endocannabinoid system](/glossary/endocannabinoid-system) (ECS), a complex cell-signaling network that regulates [sleep](/conditions/sleep), [mood](/conditions/mood), [pain](/conditions/pain), and immune function. Unlike THC, CBD doesn't directly activate cannabinoid receptors but instead modulates them and influences over 65 different molecular targets throughout the body.

---

## Understanding the Endocannabinoid System

Before understanding how CBD works, you need to understand the system it interacts with. The [endocannabinoid system](/glossary/endocannabinoid-system) was discovered in the 1990s by researchers studying cannabis, and it exists in all vertebrates.

The [ECS](/glossary/endocannabinoid-system) consists of three main components:

| Component | Function | Examples |
|-----------|----------|----------|
| **Endocannabinoids** | Signaling molecules produced by your body | [Anandamide](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Receptors** | Proteins that receive signals | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |
| **Enzymes** | Break down endocannabinoids after use | [FAAH](/glossary/faah-enzyme), MAGL |

Think of the ECS as your body's master regulator, constantly working to maintain [homeostasis](/glossary/homeostasis)—the stable internal balance your cells need to function properly.`,
    excerpt: "Discover the science behind CBD. Learn how cannabidiol interacts with your endocannabinoid system, its multiple receptor targets, and why bioavailability matters for therapeutic effects.",
    meta_title: "How CBD Works: The Science of Cannabidiol Explained",
    meta_description: "Learn how CBD interacts with your endocannabinoid system, its 65+ molecular targets, bioavailability by delivery method, and why the entourage effect matters."
  }
];

async function translateAndInsert() {
  let successCount = 0;
  
  for (const article of articlesToTranslate) {
    try {
      console.log(`Translating article: ${article.title}`);
      
      // Finnish translations
      const finnishTranslation = {
        article_id: article.id,
        language: 'fi',
        title: 'CBD:n tiede: Kuinka kannabidioli vaikuttaa kehossa',
        slug: article.slug,
        content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol) teollisuudessa
Päivitetty viimeksi: tammikuu 2026

---

## Nopea vastaus

[Kannabidioli](/glossary/cannabidiol) (CBD) toimii pääasiassa vuorovaikutuksessa kehosi [endokannabinoidijärjestelmän](/glossary/endocannabinoid-system) (ECS) kanssa, joka on monimutkainen solujen välinen viestintäverkosto, joka säätelee [unta](/conditions/sleep), [mielialaa](/conditions/mood), [kipua](/conditions/pain) ja immuunijärjestelmän toimintaa. Toisin kuin THC, CBD ei suoraan aktivoi kannabinoidisireseptoreita, vaan moduloi niitä ja vaikuttaa yli 65 erilaiseen molekyylimaaliin koko kehossa.

---

## Endokannabinoidijärjestelmän ymmärtäminen

Ennen kuin ymmärrät kuinka CBD toimii, sinun tulee ymmärtää järjestelmä, jonka kanssa se on vuorovaikutuksessa. [Endokannabinoidijärjestelmä](/glossary/endocannabinoid-system) löydettiin 1990-luvulla tutkijoiden toimesta, jotka tutkivat kannabista, ja se esiintyy kaikissa selkärankaisissa.

[ECS](/glossary/endocannabinoid-system) koostuu kolmesta pääkomponentista:

| Komponentti | Toiminto | Esimerkit |
|-----------|----------|----------|
| **Endokannabinoidi** | Kehon tuottamat signaalimolekyylit | [Anandamidi](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Reseptorit** | Signaaleja vastaanottavat proteiinit | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |
| **Entsyymit** | Hajottavat endokannabinoidit käytön jälkeen | [FAAH](/glossary/faah-enzyme), MAGL |

Ajattele ECS:ää kehosi pääsäätelijänä, joka työskentelee jatkuvasti ylläpitääkseen [homeostaasin](/glossary/homeostasis)—vakaan sisäisen tasapainon, jota solusi tarvitsevat toimiakseen kunnolla.`,
        excerpt: 'Tutustu CBD:n tieteeseen. Opi kuinka kannabidioli toimii endokannabinoidijärjestelmäsi kanssa, sen useita reseptoritavoitteita ja miksi biosaatavuus merkitsee terapeuttisille vaikutuksille.',
        meta_title: 'Kuinka CBD toimii: Kannabidiolin tiede selitettynä',
        meta_description: 'Opi kuinka CBD toimii endokannabinoidijärjestelmäsi kanssa, sen 65+ molekyylitavoitteita ja miksi seurueefekti merkitsee.'
      };
      
      const { error } = await sb
        .from('article_translations')
        .upsert(finnishTranslation, { 
          onConflict: 'article_id,language' 
        });
      
      if (error) {
        console.error(`Error inserting translation for article ${article.id}:`, error);
      } else {
        console.log(`✓ Successfully translated: ${finnishTranslation.title}`);
        successCount++;
      }
      
    } catch (err) {
      console.error(`Failed to translate article ${article.id}:`, err);
    }
  }
  
  console.log(`\nCompleted: ${successCount} articles successfully translated and inserted.`);
}

translateAndInsert();