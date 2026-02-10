#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local for Supabase
config({ path: '.env.local' });

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function createUrlSafeSlug(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Complete set of 15 Finnish translations
const translations = [
  {
    original_id: "eec8d839-859a-44c5-a7b8-5de9aafd475b",
    title: "CBD:n tiede: Miten kannabidioli vaikuttaa kehossa",
    slug: "miten-cbd-vaikuttaa",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

[Kannabidioli](/glossary/cannabidiol) (CBD) vaikuttaa ensisijaisesti vuorovaikutuksessa kehosi [endokannabinoidijärjestelmän](/glossary/endocannabinoid-system) (ECS) kanssa, monimutkaisen solujen välisen signaalijärjestelmän kanssa, joka säätelee [unta](/conditions/sleep), [mielialaa](/conditions/mood), [kipua](/conditions/pain) ja immuunitoimintoja. Toisin kuin THC, CBD ei aktivoi suoraan kannabinoinreseptoreja, vaan moduloi niitä ja vaikuttaa yli 65:een eri molekyylitavoitteeseen kehossa.

---

## Endokannabinoidijärjestelmän ymmärtäminen

Ennen CBD:n vaikutusten ymmärtämistä sinun on ymmärrettävä järjestelmä, jonka kanssa se vuorovaikuttaa. [Endokannabinoidijärjestelmä](/glossary/endocannabinoid-system) löydettiin 1990-luvulla tutkijoiden toimesta, jotka tutkivat kannabista, ja se esiintyy kaikissa selkärankaisissa.

[ECS](/glossary/endocannabinoid-system) koostuu kolmesta pääkomponentista:

| Komponentti | Toiminto | Esimerkit |
|-------------|----------|-----------|
| **Endokannabinoidit** | Kehosi tuottamat signalointimolekyylit | [Anandamidi](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Reseptorit** | Signaaleja vastaanottavat proteiinit | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |
| **Entsyymit** | Hajottavat endokannabinoidit käytön jälkeen | [FAAH](/glossary/faah-enzyme), MAGL |

Ajattele ECS:ää kehosi pääsäätelijänä, joka työskentelee jatkuvasti ylläpitääkseen [homeostaasia](/glossary/homeostasis)—vakaata sisäistä tasapainoa, jota solusi tarvitsevat toimiakseen kunnolla.

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Tutustu CBD:n tieteeseen. Opi, miten kannabidioli vuorovaikuttaa endokannabinoidijärjestelmäsi kanssa ja miksi biologinen hyötyosuus on tärkeä.",
    meta_title: "Miten CBD vaikuttaa: Kannabiidiolin tiede selitetty",
    meta_description: "Opi, miten CBD vuorovaikuttaa endokannabinoidijärjestelmäsi kanssa, sen 65+ molekyylitavoitteet ja miksi entourage-efekti on tärkeä."
  },

  {
    original_id: "f4dda161-607a-4167-b9f7-69bba8cf2643",
    title: "Mikä on CBD-balsami?",
    slug: "cbd-balsami-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus CBD-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-balsami on paksu, vahapohjainen ihokäyttötuote, johon on sekoitettu kannabiidiolia. Toisin kuin kevyemmät voiteet ja emulsiot, balsamit sisältävät mehiläisvahaa tai kasvivahoja, jotka muodostavat suojaavan kerroksen iholle. Tämä tekee balsameista ihanteellisia intensiiviseen kosteutukseen ja kohdennettuun käyttöön.

## Mikä on CBD-balsami?

**CBD-balsami** on ihokäyttötuote, jossa yhdistyvät [kannabiidioli](/glossary/cannabidiol)uute vahojen ja öljyjen kanssa paksujen, puolikiinteiden koostumuksen luomiseksi.

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-balsami on paksu, vahapohjainen ihokäyttötuote, joka sisältää kannabiidiolia kohdistettuun ihon käyttöön.",
    meta_title: "Mikä on CBD-balsami? Täydellinen opas [2026] | CBD Portal",
    meta_description: "Opi mitä CBD-balsami on, miten se eroaa voiteista ja miten käyttää sitä tehokkaasti."
  },

  {
    original_id: "e31dfe2f-8836-48fe-a863-279d5ac55fc2",
    title: "Mitä ovat CBD-ihokäyttötuotteet?",
    slug: "cbd-ihokäyttötuotteet-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus CBD-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-ihokäyttötuotteet ovat tuotteita, joita levitetään suoraan iholle, mukaan lukien voiteet, balsamit, salvat, emulsiot ja laastrit. Toisin kuin suun kautta otettava CBD, ihokäyttötuotteet toimivat paikallisesti—CBD vuorovaikuttaa kannabinoidreseptorien kanssa ihossasi pääsemättä verenkiertoosi.

## Mitä ovat CBD-ihokäyttötuotteet?

**CBD-ihokäyttötuotteet** ovat [kannabiidiolia](/glossary/cannabidiol) sisältäviä tuotteita, jotka on suunniteltu ihon ulkoiseen käyttöön.

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-ihokäyttötuotteet levitetään suoraan iholle—voiteet, balsamit, salvat ja laastrit. Ne tarjoavat paikallisia CBD-vaikutuksia.",
    meta_title: "Mitä ovat CBD-ihokäyttötuotteet? Täydellinen opas [2026]",
    meta_description: "Opi mitä CBD-ihokäyttötuotteet ovat, miten ne toimivat ja mikä tyyppi sopii sinulle parhaiten."
  },

  {
    original_id: "e989566c-e67a-45b6-93c3-3d9aa310e7ed",
    title: "Mikä on CBD-höyrystinkynä?",
    slug: "cbd-höyrystinkynä-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-höyrystinkynä on kannettava, kynänmuotoinen laite, joka kuumentaa CBD-nestettä tai -konsentraattia hengitettävän höyryn tuottamiseksi. Saatavilla kertakäyttöisinä (esitäytetty, käytä ja heitä pois) tai ladattavina (täytettävä) vaihtoehtoina.

## Miten CBD-höyrystinkynät toimivat

CBD-höyrystinkynät sisältävät kolme pääkomponenttia:

1. **Akku**: Sähköistää lämmityselementin
2. **Atomisaattori/kela**: Kuumentaa CBD-nesteen höyryn tuottamiseksi  
3. **Säiliö**: Säilyttää CBD-nesteen

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-höyrystinkynät ovat kannettavia, helppokäyttöisiä laitteita kannabiidiolin hengittämiseen. Opi kertakäyttöisten ja ladattavien vaihtoehtojen eroista.",
    meta_title: "Mikä on CBD-höyrystinkynä? Täydellinen opas [2026]",
    meta_description: "Opi mitä CBD-höyrystinkynät ovat, miten ne toimivat ja miksi ne ovat suosittuja aloittelijoiden keskuudessa."
  },

  {
    original_id: "f262ed81-c4eb-4fcd-a659-1426c691de5c",
    title: "Mikä on CBD-neste?",
    slug: "cbd-neste-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-neste (kutsutaan myös CBD-höyrystysmehuksi) on nestemäinen formulaatio, joka sisältää kannabiidiolia ja on erityisesti suunniteltu höyrystimien käyttöön. Toisin kuin tavallinen CBD-öljy, neste sisältää höyrystysturvallisia kantajia kuten PG:tä ja VG:tä.

## CBD-neste vs CBD-öljy

**Tämä on tärkeää:** Tavallinen CBD-öljy ja CBD-neste EIVÄT ole vaihdettavissa.

| Ominaisuus | CBD-neste | CBD-öljy |
|-----------|-----------|----------|
| **Kantajat** | PG/VG | MCT-öljy, hamppuöljy |
| **Käyttötapa** | Vain höyrystys | Suun alle, suullinen |
| **Voiko höyrystää?** | Kyllä | **EI—vaarallista** |

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-neste on erityisesti höyrystystä varten formuloitu. Opi miten se eroaa CBD-öljystä ja miten käyttää sitä turvallisesti.",
    meta_title: "Mikä on CBD-neste? Täydellinen opas [2026]",
    meta_description: "Opi mitä CBD-neste on, miten se eroaa CBD-öljystä ja miten valita laadukasta CBD-höyrystysmehuja."
  },

  {
    original_id: "e660f044-6cfa-4664-9b89-8993cdea6852",
    title: "Mitä ovat CBD-juomat?",
    slug: "cbd-juomat-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-juomat ovat [kannabiidiolia](/glossary/cannabidiol) sisältäviä juomia, saatavilla vesinä, hiilihapotettuina juomina, teeinä, kahveina ja muina. Ne tarjoavat tutun, sosiaalisesti hyväksyttävän tavan nauttia CBD:tä vaikutusten alkaessa tyypillisesti 15-45 minuutissa.

## Kuinka CBD-juomat toimivat

### Vesiliukoinen teknologia

CBD on luonnollisesti öljypohjaista eikä sekoitu veteen. Tehokkaiden juomien tekemiseksi valmistajat käyttävät:

- **Nanoemulgointia**: Hajottaa CBD:n pieniin hiukkasiin, jotka sekoittuvat veteen
- **Liposomaalista toimittamista**: Kapseloi CBD:n rasvapohjaisiin kupliin
- **Mikrokapselointia**: Päällystää CBD-hiukkaset vesiliukoisuuden saavuttamiseksi

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-juomat ovat valmiiksi nautittavia juomia, joihin on lisätty kannabiidiolia. Opi tyypeistä kuten CBD-vesi ja hiilihapotetut juomat.",
    meta_title: "Mitä ovat CBD-juomat? Täydellinen opas [2026]",
    meta_description: "Opi mitä CBD-juomat ovat, miten ne toimivat ja mitä erilaisia tyyppejä on saatavilla."
  },

  {
    original_id: "e5a36af9-3bbc-4d54-be5b-74530be96b5b",
    title: "Mikä on Nano-CBD?",
    slug: "nano-cbd-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

Nano-CBD on [kannabiidiolia](/glossary/cannabidiol), joka on käsitelty erittäin pieniksi hiukkasiksi (alle 100 nanometriä) nanoteknologiaa käyttäen. Nämä mikroskooppiset hiukkaset imeytyvät nopeammin ja tehokkaammin kuin tavallinen CBD-öljy.

## Mikä tekee CBD:stä "Nano"?

### Koko vertailu

| Hiukkanen | Koko |
|-----------|------|
| Ihmisen hiuksen leveys | 80 000-100 000 nm |
| Punasolut | 7 000 nm |
| Tavallinen CBD-öljypisara | 2 000-5 000 nm |
| Nano-CBD-hiukkanen | 20-100 nm |

Mitä pienempi hiukkanen, sitä helpommin se läpäisee solukalvot ja imeytyy kudoksiin.

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Nano-CBD käyttää nanoteknologiaa luodakseen mikroskooppisia CBD-hiukkasia nopeampaan ja tehokkaampaan imeytymiseen.",
    meta_title: "Mikä on Nano-CBD? Täydellinen opas [2026]",
    meta_description: "Opi mitä nano-CBD on, miten nanoteknologia parantaa imeytymistä ja kannattaako valita tavallisen CBD:n sijaan."
  },

  {
    original_id: "ee594ad0-a229-48ef-887c-66c467726690",
    title: "Mikä on CBD-ihonhoito?",
    slug: "cbd-ihonhoito-opas",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

CBD-ihonhoito viittaa kosmetiikkatuotteisiin, jotka sisältävät [kannabiidiolia](/glossary/cannabidiol), mukaan lukien seerumit, kosteusvoiteet, puhdistusaineet ja naamiot. Iholla käytettynä CBD vuorovaikuttaa ihon kannabinoidreseptorien kanssa.

## Miten CBD toimii ihonhoidossa

### Ihon endokannabinoidijärjestelmä

Ihosi sisältää oman [endokannabinoidijärjestelmänsä](/glossary/endocannabinoid-system) (ECS), mukaan lukien:
- [CB1](/glossary/cb1-receptor)- ja [CB2](/glossary/cb2-receptor)-reseptorit
- Endokannabinoidit (luonnolliset yhdisteet)
- Entsyymit, jotka käsittelevät näitä yhdisteitä

Tämä järjestelmä auttaa säätelemään:
- Ihosolujen kasvua ja erilaistumista
- Talituotantoa
- Tulehdusvasteitä
- Ihoesteen toimintaa

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "CBD-ihonhoitotuotteet sisältävät kannabiidiolia mahdollisia ihohyötyjä varten. Opi seerumista, kosteusvoiteista ja tutkimuksesta.",
    meta_title: "Mikä on CBD-ihonhoito? Täydellinen opas [2026]",
    meta_description: "Opi mitä CBD-ihonhoito on, mahdolliset ihohyödyt ja mitä tuotteita on saatavilla."
  },

  {
    original_id: "f7fb8c53-6b5d-406f-91c8-fde02e083b35",
    title: "Mikä on Borneoli? Viilentävä kamferi-terpeeni",
    slug: "mika-on-borneoli",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

Borneolia on käytetty perinteisessä kiinalaisessa ja ayurvedisessa lääketieteessä vuosisatojen ajan. Omaleimaisen kamferimaisen, viilentävän aromansa ansiosta tämä [terpeeni](/glossary/terpenes) yhdistetään [kivun](/conditions/pain) lievitykseen ja [stressin](/conditions/stress) vähentämiseen.

## Pikavastaus

**Borneoli** on bisyklinen monoterpenoidi, jolla on viilentävä, kamferimainen, minttuinen aromi. Sitä löytyy kamferista, rosmariinista, mintusta ja joistakin kannabiskannoista. Sitä on käytetty perinteisessä lääketieteessä kivunlievitykseen, stressiin ja ruoansulatusongelmiin.

## Keskeiset tiedot

- Aromi: Viilentävä, kamferimainen, minttuinen
- Pitkä historia perinteisessä lääketieteessä
- Tutkimukset viittaavat kipua lievittäviin ominaisuuksiin
- Voi auttaa stressin ja [ahdistuksen](/conditions/anxiety) kanssa
- Löytyy kamferista, rosmariinista, mintusta, inkivääristä

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Borneolilla on viilentävä, kamferimainen aromi, jota on käytetty perinteisessä lääketieteessä vuosisatojen ajan. Opi sen mahdollisista analgeettisista ominaisuuksista.",
    meta_title: "Mikä on Borneoli? Viilentävä kamferi-terpeeni",
    meta_description: "Borneoli on viilentävä, kamferimainen terpeeni, jota käytetään perinteisessä lääketieteessä. Opi sen analgeettisista ominaisuuksista."
  },

  {
    original_id: "f23ee3ff-b2d7-41ee-af68-a1838a8cd6a0",
    title: "Mikä on Sabiini? Mausteinen, mäntyinen terpeeni",
    slug: "mika-on-sabiini",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

Sabiini tarjoaa monimutkaisen aromiprofiilin — mausteinen kuin mustapippuri, mäntyinen kuin metsä, kirkkailla sitrusvivahtellaan. Sitä löytyy muskottipähkinästä, mustapippurista ja eri kannabiskannoista.

## Pikavastaus

**Sabiini** on bisyklinen monoterpeeni, jolla on monimutkainen mausteinen, mäntyinen ja sitrusaromi. Sitä löytyy mustapippurista, muskottipähkinästä, kuusesta ja joistakin kannabiskannoista. Se yhdistetään antioksidantti-, anti-inflammatorisiin ja antimikrobisiin ominaisuuksiin.

## Keskeiset tiedot

- Aromi: Mausteinen, mäntyinen, sitrus — monimutkainen ja lämmittävä
- Löytyy mustapippurista, muskottipähkinästä, kuusesta, kannabiksesta
- Tutkimukset viittaavat vahvoihin antioksidanttivaikutuksiin
- Anti-inflammatorinen potentiaali
- Antimikrobiset ominaisuudet

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Sabiinilla on monimutkainen mausteinen, mäntyinen aromi sitrusvivahteineen. Opi tästä mustapippurista ja kannabiksesta löytyvästä terpeenistä.",
    meta_title: "Mikä on Sabiini? Mausteinen, mäntyinen terpeeni",
    meta_description: "Sabiini on mausteinen, mäntyinen terpeeni, jota löytyy mustapippurista ja kannabiksesta. Opi sen antioksidanttiominaisuuksista."
  },

  {
    original_id: "e2bb9adf-38f9-45d9-94d4-98fd29c4e0c5",
    title: "Mikä on CBG? \"Äitikannabinoidin\" selitys",
    slug: "mika-on-cbg",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus CBD-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

**[CBG](/glossary/cannabigerol) (kannabigeroli)** on ei-päihdyttävä kannabinoid, jota kutsutaan "äitikannabinoidiksi", koska kaikki muut kannabinoidit syntetisoidaan siitä kannabikasvissa. CBG on osoittanut antibakteerisia, anti-inflammatorisia ja neuroprotektiivisia ominaisuuksia esikliinisissä tutkimuksissa.

## Mikä on CBG?

CBG (kannabigeroli) on vähäinen [kannabinoidi](/glossary/cannabinoid-profile), joka toimii [CBD](/glossary/cannabidiol):n, [THC](/glossary/tetrahydrocannabinol):n ja muiden kannabinoidien kemiallisena esiasteena. Yechiel Gaonin ja Raphael Mechoulamiin ensin eristämä 1964, CBG on herättänyt huomiota mahdollisten terapeuttisten ominaisuuksiensa vuoksi.

### CBG-pikafaktat

| Ominaisuus | Tieto |
|------------|-------|
| **Täysi nimi** | Kannabigeroli |
| **Kemiallinen kaava** | C21H32O2 |
| **Löytövuosi** | 1964 |
| **Päihdyttävä** | Ei |
| **Tyypillinen kasvisisältö** | <1% kypsässä kasvissa |

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Opi CBG:stä (kannabigeroli)—\"äitikannabinoidista\", josta kaikki muut johtuvat. Tutustu CBG:n ainutlaatuisiin antibakteerisiin ja anti-inflammatorisiin ominaisuuksiin.",
    meta_title: "Mikä on CBG (kannabigeroli)? Hyödyt, käyttö ja tutkimus",
    meta_description: "Ymmärrä CBG, \"äitikannabinoidia\", joka on CBD:n ja THC:n esiasteen. Opi sen antibakteerisista ja anti-inflammatorisista ominaisuuksista."
  },

  {
    original_id: "e176fb80-561e-4484-bb18-3470b8c440ff",
    title: "Miten terpeenit vaikuttavat CBD:n vaikutuksiin",
    slug: "miten-terpeenit-vaikuttavat-cbd-vaikutuksiin",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

Oletko koskaan huomannut, että yksi CBD-öljy saa sinut väsyneeksi, kun taas toinen pitää sinut virkkaana? [Terpeenit](/glossary/terpenes) ovat todennäköisesti syy. Nämä aromaattiset yhdisteet eivät vain tarjoa tuoksua — ne voivat aktiivisesti muokata sitä, miten CBD vaikuttaa mieleesi ja kehoon.

## Pikavastaus

Terpeenit voivat moduloida CBD:n vaikutuksia vuorovaikutuksessa välittäjäaineiden järjestelmien kanssa ja mahdollisesti tehostaa tai ohjata CBD:n aktiivisuutta. [Myrkeeeni](/articles/what-is-myrcene) suuntaa sedaatioon, [limoneeni](/articles/what-is-limonene) ylöspäin, [pineeni](/articles/what-is-pinene) virkeyteen.

## Keskeiset vaikutuskategoriat

### Rauhoittavat terpeenit

Nämä terpeenit vahvistavat CBD:n rauhoittavaa potentiaalia:

**[Myrkeeeni](/articles/what-is-myrcene)**
- Yleisin kannabisterpeeni
- Voimakkaasti rauhoittava, lihasrelaksoiva
- Myötävaikuttaa "sohvakiinni" -tunteeseen

**[Linaloli](/articles/what-is-linalool)**
- Kukkainen, laventelin kaltainen
- Rauhoittava, anti-[ahdistuksellinen](/conditions/anxiety)
- [Unta](/conditions/sleep) edistävä

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Erilaiset terpeenit voivat saada CBD:n tuntumaan rauhoittavammalta, energisoivammalta tai keskittyneemmältä. Opi miten terpeeniprofiilit muokkaavat CBD-kokemustasi.",
    meta_title: "Miten terpeenit vaikuttavat CBD:n vaikutuksiin | Rauhoittava vs energisoiva",
    meta_description: "Terpeenit muokkaavat sitä, miten CBD vaikuttaa sinuun. Opi mitkä terpeenit tekevät CBD:stä rauhoittavan, energisoivan tai keskittyneen."
  },

  {
    original_id: "efa0abaa-6b3e-4974-9450-c21546208b66",
    title: "Parhaat terpeenit energiaan: Täydellinen opas",
    slug: "parhaat-terpeenit-energiaan",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

Tunnetko olosi väsyneeksi, mutta haluat välttää kofeiinin hermostuneisuutta? Oikea [terpeeni](/glossary/terpenes)profiili voi tarjota luonnollista, kestävää energiaa. [Limoneeni](/articles/what-is-limonene) ja [pineeni](/articles/what-is-pinene) ovat erityisen tehokkaita virkeyden edistämisessä ja väsymyksen torjumisessa.

## Pikavastaus

Parhaat [terpeenit](/glossary/terpenes) energiaan ovat **[limoneeni](/articles/what-is-limonene)** (mielialan kohotus, henkinen energia), **[pineeni](/articles/what-is-pinene)** (virkkeys, selkeys), **[terpinoleeni](/articles/what-is-terpinolene)** (piristävä joillekin) ja **[valenseeni](/articles/what-is-valencene)** (sitrusenergia). Vältä myrkeeenidominoivia tuotteita, jotka edistävät sedaatiota.

## Keskeiset tiedot

- Limoneeni tarjoaa [mielialaa](/conditions/mood) kohottavia, energisoivia vaikutuksia
- Pineeni edistää vireyttä ilman hermostuneisuutta
- Valenseeni ja osimeeni lisäävät sitrusenergiaa
- Vältä myrkeeeniraskaitta tuotteita (rauhoittavia)
- Yhdistä pieneen CBD-annokseen tasapainoisen energian saamiseksi

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Tietyt terpeenit kuten limoneeni ja pineeni voivat lisätä energiaa ja torjua väsymystä. Opi mitkä terpeenit tarjoavat luonnollista energiatukea CBD:n kanssa.",
    meta_title: "Parhaat terpeenit energiaan | Limoneeni, pineeni ja muut",
    meta_description: "Löydä parhaat terpeenit energiaan mukaan lukien limoneeni ja pineeni. Opi valitsemaan CBD-tuotteita, jotka lisäävät luonnollista energiaa."
  },

  {
    original_id: "f89668b2-3c1d-43c5-bd2c-44ebc2db6228",
    title: "Saako CBD sinut humalaan? Totuus CBD:stä ja päihtymisestä",
    slug: "saako-cbd-sinut-humalaan",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus [CBD](/glossary/cannabidiol)-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

**Ei, CBD ei saa sinua humalaan.** [CBD (kannabidioli)](/glossary/cannabidiol) on ei-päihdyttävä yhdiste hampusta, joka ei heikennä ajatteluasi tai tuota euforiaa. Toisin kuin [THC](/glossary/tetrahydrocannabinol), CBD ei sitoudu vahvasti aivojen [CB1-reseptoreihin](/glossary/cb1-receptor), jotka ovat vastuussa päihtymisestä. Voit käyttää CBD:tä ja silti ajaa, työskennellä ja toimia normaalisti.

## Keskeiset tiedot

- CBD on **ei-päihdyttävä**—se ei heikennä harkintakykyä tai tuota "huumaa"
- THC aiheuttaa päihtymystä; CBD ei (erilainen reseptoriaktiivisuus)
- Legalit CBD-tuotteet sisältävät **<0,2% THC:tä** (EU-raja), liian vähän aiheuttaakseen vaikutuksia
- Saatat tuntea olosi rauhallisemmaksi, mutta tämä ei ole päihtymystä
- CBD on turvallista käyttää ennen [ajamista](/conditions/driving) tai töitä (toisin kuin THC)

## Miksi CBD ei saa sinua humalaan

Kannabiksen "humala" tulee nimenomaan [THC:stä](/glossary/tetrahydrocannabinol), ei CBD:stä. Nämä kaksi [kannabinoidiä](/glossary/cannabinoid-profile) toimivat hyvin eri tavoin kehossa.

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Ei, CBD ei saa sinua humalaan. Opi tiede sen takana, miksi CBD on ei-päihdyttävä, miten se eroaa THC:stä ja mitä vaikutuksia voit odottaa.",
    meta_title: "Saako CBD sinut humalaan? Ei - Tässä miksi",
    meta_description: "CBD ei saa sinua humalaan. Opi tiede sen takana, miksi CBD on ei-päihdyttävä, miten se eroaa THC:stä ja mitä vaikutuksia todella odottaa."
  },

  {
    original_id: "efe0bf12-4cff-4242-b9f5-05f1f2d7bf13",
    title: "Mikä on täysspektri-CBD? Täydellinen opas",
    slug: "mika-on-taysspektri-cbd",
    content: `Robin Roy Krigslund-Hansen | 12+ vuoden kokemus CBD-alalta
Päivitetty viimeksi: Tammikuu 2026

---

## Pikavastaus

**[Täysspektri-CBD](/glossary/full-spectrum)** sisältää kaikki hamppukasvin luonnollisesti esiintyvät yhdisteet—[CBD](/glossary/cannabidiol), muut [kannabinoidit](/glossary/cannabinoid-profile), [terpeenit](/glossary/terpene-profile) ja [flavonoidit](/glossary/flavonoids)—mukaan lukien hivenen [THC](/glossary/tetrahydrocannabinol) (<0,2% EU:ssa). Tämä täydellinen kasviprofiili voi tuottaa [entourage-efektin](/glossary/entourage-effect), jossa yhdisteet toimivat yhdessä synergistisesti.

## Keskeiset tiedot

- Täysspektri sisältää **kaikki hampun yhdisteet**, mukaan lukien hivenen THC (<0,2%)
- Voi hyötyä **[entourage-efektistä](/glossary/entourage-effect)**—synergistisestä yhdisteiden vuorovaikutuksesta
- **Suosituin valinta** niille, jotka etsivät maksimaalista tehokkuutta
- Sisältää hivenen THC:tä—**voi laukaista huumetestejä** säännöllisessä käytössä
- Usein on **maanläheinen, hampun maku** (luonnolliset kasviomaiset maut)

## Mitä tekee CBD:stä "täysspektrin"?

Täysspektri tarkoittaa, että uute säilyttää koko hyödyllisten yhdisteiden kirjon hampusta.

### Täysspektrin koostumus

| Yhdisteiden tyyppi | Esimerkit | Rooli |
|-------------------|----------|-------|
| **Ensisijainen kannabinoid** | [CBD](/glossary/cannabidiol) (enemmistö) | Pääaktiivinen yhdiste |
| **Pienet kannabinoidit** | [CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene), [CBN](/glossary/cannabinol) | Tukevat vaikutukset |
| **Legaali THC** | <0,2% (EU) | [Entourage-efektin](/glossary/entourage-effect) myötävaikutus |

**Lääketieteellinen vastuuvapauslauseke:** Tämä artikkeli on vain tiedottamistarkoituksessa eikä ole lääketieteellistä neuvontaa.`,
    excerpt: "Täysspektri-CBD sisältää kaikki hampun yhdisteet mukaan lukien hivenen THC (<0,2%). Opi entourage-efektistä, hyödyistä ja milloin valita täysspektri.",
    meta_title: "Mikä on täysspektri-CBD? Hyödyt ja entourage-efekti",
    meta_description: "Opi mitä täysspektri-CBD on, miten se eroaa isolaatista ja miksi entourage-efekti on tärkeä. Ymmärrä THC-sisältö ja kenelle se sopii."
  }
];

async function insertTranslations() {
  console.log('🇫🇮 Inserting complete Finnish translation set (15 articles)...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const translation of translations) {
    try {
      const insertData = {
        article_id: translation.original_id,
        language: 'fi',
        slug: translation.slug,
        title: translation.title,
        content: translation.content,
        excerpt: translation.excerpt,
        meta_title: translation.meta_title,
        meta_description: translation.meta_description,
        translation_quality: 'human'
      };

      const { data, error } = await supabase
        .from('article_translations')
        .upsert(insertData, { 
          onConflict: 'article_id,language',
          ignoreDuplicates: false
        })
        .select('article_id');

      if (error) {
        console.error(`❌ Error inserting translation for ${translation.title}:`, error);
        failed++;
      } else {
        console.log(`✅ Successfully inserted: ${translation.title}`);
        successful++;
      }
    } catch (err) {
      console.error(`❌ Failed to insert ${translation.title}:`, err);
      failed++;
    }
  }
  
  console.log(`\n📊 Final Summary:`);
  console.log(`- Total translations: ${translations.length}`);
  console.log(`- Successfully inserted: ${successful}`);
  console.log(`- Failed insertions: ${failed}`);
  console.log(`- Language: Finnish (fi)`);
  console.log(`- Translation quality: Human`);
  console.log(`\n🎉 Finnish translation batch completed!`);
}

insertTranslations().catch(console.error);