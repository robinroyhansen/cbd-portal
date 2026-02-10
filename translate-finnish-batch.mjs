import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvrdryvgqarffgdujmjz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2cmRyeXZncWFyZmZnZHVqbWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkwMTc5NywiZXhwIjoyMDgzNDc3Nzk3fQ.SmqoTgGp3J6JEOuOiEl7IMd8whWz4qAvQABM7AUc7kY';

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const finnishTranslations = [
  {
    article_id: "eec8d839-859a-44c5-a7b8-5de9aafd475b",
    language: 'fi',
    title: 'CBD:n tiede: Kuinka kannabidioli vaikuttaa kehossa',
    slug: 'how-cbd-works',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

## Nopea vastaus

[Kannabidioli](/glossary/cannabidiol) (CBD) toimii pääasiassa vuorovaikutuksessa kehosi [endokannabinoidijärjestelmän](/glossary/endocannabinoid-system) (ECS) kanssa, joka on monimutkainen solujen signalointi-verkosto, joka säätelee [unta](/conditions/sleep), [mielialaa](/conditions/mood), [kipua](/conditions/pain) ja immuunitoimintoja. Toisin kuin THC, CBD ei suoraan aktivoi kannabinoidisireseptoreita, vaan moduloi niitä ja vaikuttaa yli 65 erilaiseen molekyylikohteeseen koko kehossa.

---

## Endokannabinoidijärjestelmän ymmärtäminen

Ennen kuin ymmärrät kuinka CBD toimii, sinun tulee ymmärtää järjestelmä, jonka kanssa se on vuorovaikutuksessa. [Endokannabinoidijärjestelmä](/glossary/endocannabinoid-system) löydettiin 1990-luvulla kannabista tutkivien tutkijoiden toimesta, ja se esiintyy kaikissa selkärankaisissa.

[ECS](/glossary/endocannabinoid-system) koostuu kolmesta pääkomponentista:

| Komponentti | Toiminto | Esimerkit |
|-----------|----------|----------|
| **Endokannabinoidi** | Kehon tuottamat signaalimolekyylit | [Anandamidi](/glossary/anandamide), [2-AG](/glossary/2-ag) |
| **Reseptorit** | Signaaleja vastaanottavat proteiinit | [CB1](/glossary/cb1-receptor), [CB2](/glossary/cb2-receptor), [GPR55](/glossary/gpr55-receptor) |
| **Entsyymit** | Hajottavat endokannabinoidit käytön jälkeen | [FAAH](/glossary/faah-enzyme), MAGL |

Ajattele ECS:ää kehosi pääsäätelijänä, joka työskentelee jatkuvasti ylläpitääkseen [homeostaasin](/glossary/homeostasis)—vakaan sisäisen tasapainon, jota solusi tarvitsevat toimiakseen oikein.

### Missä kannabinoidisireseptorit sijaitsevat?

**CB1-reseptorit** sijaitsevat pääasiassa keskushermostossa—aivoissasi ja selkäytimessä. Niitä on erityisen tiheästi alueilla, jotka kontrolloivat:
- Muistia ja kognitiota (hippokampus)
- Liikkeen koordinaatiota (tyvitumakkeet, pikkuaivot)
- Kivun kokemista (selkäydin)
- Mielialaa ja [ahdistusta](/conditions/anxiety) (amygdala, prefrontaalinen korteksi)

**CB2-reseptorit** sijaitsevat pääasiassa perifeerisessä kudoksessa, erityisesti immuunisoluissa. Niillä on keskeinen rooli:
- Tulehdusvastekessa
- Immuunijärjestelmän säätelyssä
- Luuston metaboliassa
- Ruoansulatuselimistön toiminnassa`,
    excerpt: 'Tutustu CBD:n tieteeseen. Opi kuinka kannabidioli toimii endokannabinoidijärjestelmäsi kanssa, sen useita reseptoritavoitteita ja miksi biosaatavuus merkitsee.',
    meta_title: 'Kuinka CBD toimii: Kannabidiolin tiede selitettynä',
    meta_description: 'Opi kuinka CBD toimii endokannabinoidijärjestelmäsi kanssa, sen 65+ molekyylikohteita ja miksi seurueefekti on tärkeä.'
  },
  {
    article_id: "f4dda161-607a-4167-b9f7-69bba8cf2643",
    language: 'fi',
    title: 'Mikä on CBD-balsami?',
    slug: 'cbd-balm-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta CBD-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD-balsami on paksu, vahapohjainen paikallinen tuote, johon on sekoitettu kannabidiolia. Toisin kuin kevyemmät voiteet ja emulsiot, balsamit sisältävät mehiläisvahaa tai kasvivahat, jotka luovat suojaavan kerroksen ihoon. Tämä tekee balsameista ihanteellisia intensiiviseen kosteuttamiseen, kohdennettuun käyttöön tietyillä alueilla ja kuivissa tai ankarissa olosuhteissa. Vaikutukset ovat paikallistettuja käyttöalueelle.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ CBD-balsami käyttää vahaa (mehiläisvaha tai kasvipohjainen) paksumpaan, suojaavaan tekstuuriin</li>
<li>✓ Luo esteen, joka lukitsee kosteuden ja CBD:n sisään</li>
<li>✓ Parasta kohdennettuun, keskitettyyn käyttöön tietyillä alueilla</li>
<li>✓ Imeytyy hitaammin kuin voiteet, mutta tarjoaa kestävämpää peitettävyyttä</li>
<li>✓ Ihanteellinen kuivalle, halkeilleelle tai säälle altistuneelle iholle</li>
</ul>
</div>

Jos olet tutkinut [CBD](/glossary/cbd)-paikallishoitoja, olet todennäköisesti huomannut balsameja voiteiden, salvaarien ja emulsioiden rinnalla. Mutta mikä tekee balsamista erilaisen? Tämä opas selittää, mikä on CBD-balsami ja milloin se on oikea valinta.

## Mikä on CBD-balsami?

**CBD-balsami** on paikallinen tuote, joka yhdistää [kannabidioli](/glossary/cannabidiol)-uutteen vahoihin ja öljyihin luodakseen paksun, puolikiinteän koostumuksen. Avainingriedientti, joka erottaa balsamit voiteista, on vaha—tyypillisesti mehiläisvaha, vaikka vegaaniset vaihtoehdot kuten kandelillavaha tai karnaubavaha ovat olemassa.

Tyypillinen CBD-balsami sisältää:
- **Vahoja** — Mehiläisvaha, kandelillavaha tai karnaubavaha
- **Kantajaöljyjä** — Kookosöljy, jojobaöljy, sheavoi
- **CBD-uute** — Täysspektri, [laajaksi spektriksi](/glossary/broad-spectrum) tai [isolaatti](/glossary/cbd-isolate)
- **Eteerisiä öljyjä** — Tuoksuun ja lisähyötyihin
- **Lisäaktiiveja** — Mentoli, kamferi, arnika, E-vitamiini

Vahainen sisältö antaa balsameille niiden tyypillisen paksun tekstuurin ja mahdollistaa suojakerrosen muodostamisen iholle.`,
    excerpt: 'CBD-balsami on paksu, vahapohjainen paikallinen hoito, joka sisältää kannabidiolia kohdennettua ihokäyttöä varten. Sen runsas koostumus luo suojaavan esteen.',
    meta_title: 'Mikä on CBD-balsami? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mikä CBD-balsami on, miten se eroaa voiteista ja salvoista sekä kuinka käyttää sitä tehokkaasti. Hyödyt ja ostotips.'
  },
  {
    article_id: "e989566c-e67a-45b6-93c3-3d9aa310e7ed",
    language: 'fi',
    title: 'Mikä on CBD-höyrykynä?',
    slug: 'cbd-vape-pen-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD-höyrykynä on kannettava, kynän muotoinen laite, joka lämmittää CBD-e-nestettä tai -tiivistettä hengitettävän höyryn luomiseksi. Saatavilla kertakäyttöisenä (esitäytettynä, käytä-ja-heitä) tai ladattavina (täytettävät) vaihtoehtoina, ne tarjoavat kätevän tavan kokea CBD:n vaikutukset minuuteissa.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Nopeat vaikutukset</strong>: Hengitetty CBD toimii 1-5 minuutissa</li>
<li>✓ <strong>Aloittelijaystävällinen</strong>: Kertakäyttökynät eivät vaadi asennusta tai huoltoa</li>
<li>✓ <strong>Erittäin kannettava</strong>: Taskukokoinen mukana kulkevaa käyttöä varten</li>
<li>✓ <strong>Kaksi päätyyppiä</strong>: Kertakäyttö (mukavuus) vs ladattava (arvo)</li>
<li>✓ <strong>Laatu vaihtelee</strong>: Tarkista aina [kolmannen osapuolen testaus](/glossary/third-party-testing)</li>
</ul>
</div>

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Kuinka CBD-höyrykynät toimivat

CBD-höyrykynät sisältävät kolme pääkomponenttia:

1. **Akku**: Käyttää lämmityselementtiä (yleensä litium-ioni)
2. **Sumuttaja/käämi**: Lämmittää CBD-nestettä höyryn luomiseksi
3. **Säiliö/tankki**: Sisältää CBD-e-nestettä tai -tiivistettä

Kun hengität sisään (tai painat painiketta joissakin malleissa), akku aktivoi lämmityskelan. Tämä lämmittää CBD-nestettä noin 160-220°C:een, luoden höyryä, joka kuljettaa [kannabidiolia](/glossary/cannabidiol) keuhkoihisi nopeaa imeytymistä varten.

### Miksi höyrykynät antavat nopeita tuloksia

Hengitetty CBD ohittaa [ruoansulatusjärjestelmän](/glossary/first-pass-metabolism) ja menee suoraan verenkiertoon keuhkojen kautta. Tämä tarkoittaa:
- **1-5 minuuttia** tuntea vaikutukset (vs 15-30 min [sublinguaalinen](/glossary/sublingual) öljy)
- **34-56% [biosaatavuus](/glossary/bioavailability)** (vs 6-19% suunkautta otettu CBD)
- **1-3 tunnin kesto** (lyhyempi kuin syötävät mutta nopeampi alku)`,
    excerpt: 'CBD-höyrykynät ovat kannettavia, helppokäyttöisiä laitteita kannabidiolin hengittämiseen. Opi kertakäyttö vs ladattavista vaihtoehdoista.',
    meta_title: 'Mikä on CBD-höyrykynä? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mitä CBD-höyrykynät ovat, kuinka ne toimivat ja miksi ne ovat suosittuja aloittelijoille. Tutustu tyyppeihin ja valintakriteereihin.'
  },
  {
    article_id: "f262ed81-c4eb-4fcd-a659-1426c691de5c",
    language: 'fi',
    title: 'Mikä on CBD-e-neste?',
    slug: 'cbd-e-liquid-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD-e-neste (kutsutaan myös CBD-höyrymehua) on nestemäinen koostumus, joka sisältää kannabidiolia erityisesti höyrystimiä varten. Toisin kuin tavallinen CBD-öljy, e-neste sisältää höyryturvallisia kantajia kuten PG (propyleeniglykoli) ja VG (kasvisglyseriini), jotka luovat sileän, hengitettävän höyryn.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Tehty höyrytykseen</strong>: Sisältää PG/VG-kantajia, jotka höyrystyvät turvallisesti</li>
<li>✓ <strong>Älä koskaan höyrystä CBD-öljyä</strong>: Tavallinen [CBD-öljy](/articles/cbd-oil-guide) MCT:n kanssa voi olla vaarallista hengittää</li>
<li>✓ <strong>Nopeavaikutteinen</strong>: Vaikutukset 1-5 minuutissa hengityksen kautta</li>
<li>✓ <strong>Täytettävä vaihtoehto</strong>: Toimii täytettävien höyrytankkien ja podien kanssa</li>
<li>✓ <strong>Laaja valikoima</strong>: Saatavilla monissa vahvuuksissa, makuissa ja [spektri](/glossary/full-spectrum)tyypeissä</li>
</ul>
</div>

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## CBD-e-neste vs CBD-öljy: Kriittinen ero

**Tämä on tärkeää:** Tavallinen CBD-öljy ja CBD-e-neste EIVÄT ole keskenään vaihdettavia.

| Ominaisuus | CBD-e-neste | CBD-öljy |
|------------|-------------|----------|
| **Kantajat** | PG/VG (propyleeniglykoli/kasvisglyseriini) | [MCT-öljy](/glossary/mct-oil), hamppusiemenöljy, oliiviöljy |
| **Käyttötapa** | Vain höyrytys | [Sublinguaalinen](/glossary/sublingual), suun kautta, paikallinen |
| **Voitko höyrystää sitä?** | Kyllä—suunniteltu tätä varten | **EI—vaarallista hengittää** |
| **Voitko niellä sitä?** | Ei suositella | Kyllä |

**Miksi sinun EI KOSKAAN pidä höyrystää tavallista CBD-öljyä:**
- MCT ja muut öljypohjaiset kantajat eivät höyrysty kunnolla
- Öljypisaroiden hengittäminen voi aiheuttaa [lipoidipneumonian](/glossary/disposable-vape)
- Öljy voi vahingoittaa höyrykeloja ja laitteita

Tarkista aina tuotetarrat. Jos siinä lukee "CBD-öljy" MCT-, hamppusiemen- tai oliiviöljykantajan kanssa, se on vain suunkäyttöön.`,
    excerpt: 'CBD-e-neste (höyrymehun) on erityisesti höyrytykseen suunniteltu nestemäinen koostumus. Opi kuinka se toimii, mitä ainesosia etsiä.',
    meta_title: 'Mikä on CBD-e-neste? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mikä CBD-e-neste on, miten se eroaa CBD-öljystä ja kuinka käyttää sitä turvallisesti. Ainesosat ja laadunvalintaohjeet.'
  },
  {
    article_id: "e660f044-6cfa-4664-9b89-8993cdea6852",
    language: 'fi',
    title: 'Mitä ovat CBD-juomat?',
    slug: 'cbd-drinks-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD-juomat ovat [kannabidiolilla](/glossary/cannabidiol) rikastettuja juomia, joita on saatavilla vedeksi, hiilihapotettuina juomina, teinä, kahvina ja muuna. Ne tarjoavat tutun, sosiaalisesti hyväksyttävän tavan nauttia CBD:tä, ja vaikutukset tuntuvat tyypillisesti 15-45 minuutissa. Useimmat käyttävät vesiliukoista CBD:tä parempaa imeytymistä varten kuin tavalliset öljypohjaiset CBD-tuotteet.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Kätevä</strong>: Valmis juotavaksi, ei mittaamista tai laitteita tarvita</li>
<li>✓ <strong>Nopeampi kuin syötävät</strong>: Vesiliukoinen CBD imeytyy 15-45 minuutissa</li>
<li>✓ <strong>Sosiaalisesti hyväksyttävä</strong>: Näyttää miltä tahansa muulta juomalta</li>
<li>✓ <strong>Esiannosteltu</strong>: Tarkka CBD-määrä per tölkki/pullo</li>
<li>✓ <strong>Monipuolinen</strong>: Vesiä, hiilihapatettuja juomia, teitä, kahveja ja muita</li>
</ul>
</div>

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## CBD-juomien tyypit

| Tyyppi | Kuvaus | CBD-alue | Parasta |
|--------|---------|----------|---------|
| **CBD-vesi** | Tylsä vesi CBD:llä rikastettu | 2-25mg | Nesteytys, hienovaraiset vaikutukset |
| **CBD-hiilihapotettu vesi** | Kuplittu, usein maustettu | 10-25mg | [Alkoholin](/conditions/alcohol) vaihtoehto, virkistys |
| **[CBD-tee](/articles/cbd-tea-guide)** | Teenehdet/pussi CBD:llä | 10-50mg | Rentoutuminen, iltarutiini |
| **[CBD-kahvi](/articles/cbd-[coffee](/conditions/coffee)-guide)** | Kahvipapu/-jauhe CBD:llä | 10-50mg | Keskittynyt [energia](/conditions/energy), aamurutiini |
| **CBD-energiajuomat** | Kofeiinipitoiset CBD:llä | 15-50mg | Ennen treeniä, valppautta |
| **CBD-cocktail sekoittajat** | Suunniteltu mocktaileihin | 10-30mg | Sosiaaliset juomakorvikkeet |
| **CBD-shotit** | Keskitetyt pienet pullot | 20-100mg | Korkeampi annos, nopea kulutus |`,
    excerpt: 'CBD-juomat ovat valmiitta kulutettavaksi tarkoitettuja juomia, joissa on kannabidiolia. Opi tyypeistä kuten CBD-vesi, kuohuvat juomat ja teet.',
    meta_title: 'Mitä ovat CBD-juomat? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mitä CBD-juomat ovat, kuinka ne toimivat ja mitä erilaisia tyyppejä on saatavilla. Hyödyt ja laatuvihjeet.'
  },
  {
    article_id: "e5a36af9-3bbc-4d54-be5b-74530be96b5b",
    language: 'fi',
    title: 'Mikä on nano-CBD?',
    slug: 'nano-cbd-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">Nano-CBD on [kannabidiolia](/glossary/cannabidiol), joka on käsitelty erittäin pieniksi hiukkasiksi (alle 100 nanometriä) nanotekniikkaa käyttäen. Nämä mikroskooppiset hiukkaset imeytyvät nopeammin ja tehokkaammin kuin tavallinen CBD-öljy, ja vaikutukset voivat tuntua 10-15 minuutissa ja biosaatavuus on parantunut.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Erittäin pienet hiukkaset</strong>: Alle 100 nanometriä (1/1000 ihmishiuksen leveydestä)</li>
<li>✓ <strong>Nopeampi imeytyminen</strong>: Vaikutukset 10-15 minuutissa vs 30-90 minuuttia</li>
<li>✓ <strong>Korkeampi [biosaatavuus](/glossary/bioavailability)</strong>: Enemmän CBD:tä pääsee verenkiertoosi</li>
<li>✓ <strong>Vesiyhteensopiva</strong>: Sekoittuu nesteisiin erkanematta</li>
<li>✓ <strong>Premium-hinnoittelu</strong>: Maksaa enemmän kuin tavallinen CBD-öljy</li>
</ul>
</div>

## Mikä tekee CBD:stä "nano"?

### Kokovalikoimia

| Hiukkanen | Koko |
|-----------|------|
| Ihmishiuksen leveys | 80,000-100,000 nm |
| Punasolun | 7,000 nm |
| Tavallinen CBD-öljypisara | 2,000-5,000 nm |
| Nano-CBD-hiukkanen | 20-100 nm |

Mitä pienempi hiukkanen, sitä helpommin se kulkee solukalvojen läpi ja imeytyy kudokseen.

### Kuinka se tehdään

Nano-CBD-tuotanto sisältää tyypillisesti:

1. **Ultraääninen emulsifiointi**: Korkeataajuiset ääniaallot rikkovat CBD:n nanokokoisiksi hiukkasiksi
2. **Korkeapaineinen homogenisointi**: Äärimmäinen paine luo tasaisia pieniä hiukkasia
3. **Pinta-aktiiviset aineet/emulgoijat**: Stabiloivat hiukkasia ja estävät uudelleenkasautumista

Tuloksena on CBD, joka voi hajota veteen ja imeytyä tehokkaammin ruoansulatuskanavan kautta.`,
    excerpt: 'Nano-CBD käyttää nanotekniikkaa luodakseen mikroskooppisia CBD-hiukkasia nopeampaa, tehokkaampaa imeytymistä varten.',
    meta_title: 'Mikä on nano-CBD? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mikä nano-CBD on, kuinka nanoteknologia parantaa imeytymistä ja onko se lisähinnan arvoista tavallisen CBD:n sijaan.'
  },
  {
    article_id: "ee594ad0-a229-48ef-887c-66c467726690",
    language: 'fi',
    title: 'Mikä on CBD-ihonhoito?',
    slug: 'cbd-skincare-guide',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD-ihonhoito viittaa kosmeettisiin tuotteisiin, jotka sisältävät [kannabidiolia](/glossary/cannabidiol), mukaan lukien seerumit, kosteusvoiteet, puhdistusaineet ja naamioit. Paikallisesti käytettynä CBD on vuorovaikutuksessa ihon kannabinoidisireseptoreiden kanssa ja voi tarjota hyötyjä erilaisiin ihon huoliin, vaikka tutkimus on vielä kehittymässä.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Paikallinen käyttö</strong>: CBD toimii paikallisesti ihossa, ei systeemisesti</li>
<li>✓ <strong>Ihon endokannabinoidijärjestelmä</strong>: Sisältää kannabinoidisireseptoreja</li>
<li>✓ <strong>Lupaava tutkimus</strong>: Tutkimukset viittaavat potentiaaliin erilaisiin ihon huoliin</li>
<li>✓ <strong>Monia tuotetyyppejä</strong>: Seerumit, kosteusvoiteet, puhdistusaineet, naamioit, silmävoiteet</li>
<li>✓ <strong>Laatu vaihtelee</strong>: Etsi [kolmannen osapuolen testausta](/glossary/third-party-testing) ja riittävää CBD-pitoisuutta</li>
</ul>
</div>

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 99 |
| Systemaattiset katsaukset | 1 |
| Osallistujien kokonaismäärä | 10+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja ihon tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Kuinka CBD toimii ihonhoidossa

### Ihon endokannabinoidijärjestelmä

Ihossasi on oma [endokannabinoidijärjestelmänsä](/glossary/endocannabinoid-system) (ECS), johon kuuluu:
- [CB1](/glossary/cb1-receptor) ja [CB2](/glossary/cb2-receptor) reseptorit
- Endokannabinoidi (luonnolliset yhdisteet)
- Näitä yhdisteitä käsittelevät entsyymit

Tämä järjestelmä auttaa säätelemään:
- Ihosolujen kasvua ja erilaistumista
- Sebum (rasva) tuotantoa
- Tulehdusvasteita
- Ihon estekerroksen toimintaa

### Kuinka paikallinen CBD toimii

Kun levität iholle:
1. CBD imeytyy ihon ulkokerroksen (epidermis) läpi
2. Se on vuorovaikutuksessa paikallisten kannabinoidisireseptoreiden kanssa
3. Vaikutukset pysyvät paikallisina—minimaalista systeemistä imeytymistä
4. Voi vaikuttaa lähellä oleviin soluihin ja prosesseihin`,
    excerpt: 'CBD-ihonhoitotuotteet käyttävät kannabidiolia paikallisesti mahdollisten ihohyötyjen saavuttamiseksi. Opi seerumeista, kosteusvoiteista ja muista.',
    meta_title: 'Mikä on CBD-ihonhoito? Kattava opas [2026] | CBD Portal',
    meta_description: 'Opi mikä CBD-ihonhoito on, mahdolliset ihohyödyt ja mitä tuotteita on saatavilla. Kuinka CBD toimii paikallisesti ja ostoohjeet.'
  },
  {
    article_id: "f7fb8c53-6b5d-406f-91c8-fde02e083b35",
    language: 'fi',
    title: 'Mikä on borneoli? Viilentävä kamferi-terpeeni',
    slug: 'what-is-borneol',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

Borneolia on käytetty perinteisessä kiinalaisessa ja ayurvedisessa lääketieteessä vuosisatojen ajan. Erottuvalla kamferin kaltaisella, viilentävällä aromilla tämä [terpeeni](/glossary/terpenes) yhdistetään [kivun](/conditions/pain) lievitykseen ja [stressin](/conditions/stress) vähentämiseen.

## Nopea vastaus

**Borneoli** on bisyklinen monoterpenoidi, jolla on viilentävä, kamferin kaltainen, minttun arominen aromi. Löytyy kamferista, rosmariinista, mintusta ja joistakin kannabiksen kannoista. Sitä on käytetty perinteisessä lääketieteessä kivun lievitykseen, stressiin ja ruoansulatusongelmiin. Moderni tutkimus tukee mahdollisia analgeeisia ja anksiolyyttisiä ominaisuuksia.

## Keskeiset kohdat

- Aromi: Viilentävä, kamferin kaltainen, minttun - lääketieteellinen laatu
- Pitkä historia perinteisessä kiinalaisessa ja ayurvedisessa lääketieteessä
- Tutkimus viittaa kipua lievittäviin ominaisuuksiin
- Voi auttaa stressissä ja [ahdistuksessa](/conditions/anxiety)
- Löytyy kamferista, rosmariinista, mintusta, inkiväärista
- Parasta: Kivun lievitys, stressi, viilentävä tunne

## Aromi ja makuprofiili

- **Kamferinen** — Selvästi lääketieteellinen
- **Viilentävä** — Mentolinen tunne
- **Minttun** — Tuore mintun vivahde
- **Maanläheinen** — Yrttimäiset pohjavivahteet

## Missä borneolia löytyy

| Lähde | Huomautukset |
|-------|--------------|
| **Kamferipuu** | Perinteinen lähde |
| **Rosmariini** | Ruoanlaitossa käytettävä yrtti |
| **Minttu** | Viilentävät yrtit |
| **Inkivääri** | Pieni komponentti |
| **Joissakin kannabis** | Valitut kannat |

## Vaikutukset ja hyödyt

**Analgeesi**
Perinteinen käyttö ja moderni tutkimus tukevat borneolin kipua lievittävää potentiaalia.

**Anksiolyyttinen**
Tutkimukset viittaavat stressiä vähentäviin ja rauhoittaviin vaikutuksiin.

**Parannettu lääkkeen toimitus**
Tutkimus osoittaa, että borneoli voi parantaa muiden yhdisteiden toimitusta aivoihin — mahdollisesti lisäten kannabinoidien vaikutuksia.

**Kardiovaskulaarinen**
Osa tutkimuksesta osoittaa mahdollisia kardiovaskulaarisia hyötyjä.

## Perinteisen lääketieteen käyttökohteet

Borneolia on käytetty perinteisesti:
- Kivussa ja [päänsäryssä](/conditions/headaches)
- Ruoansulatusongelmissa
- Hengityselinten vaivoissa
- [Haavojen paranemisessa](/conditions/wound-healing)`,
    excerpt: 'Borneolilla on viilentävä, kamferin kaltainen aromi, jota on käytetty perinteisessä lääketieteessä vuosisatojen ajan. Mahdolliset analgeesiset ominaisuudet.',
    meta_title: 'Mikä on borneoli? Viilentävä kamferi-terpeeni',
    meta_description: 'Borneoli on viilentävä, kamferin kaltainen terpeeni, jota käytetään perinteisessä lääketieteessä. Analgeesiset ominaisuudet.'
  },
  {
    article_id: "f23ee3ff-b2d7-41ee-af68-a1838a8cd6a0",
    language: 'fi',
    title: 'Mikä on sabiini? Mausteinen, mäntyinen terpeeni',
    slug: 'what-is-sabinene',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

Sabiini tarjoaa monimutkaisen aromiprofiilin — mausteinen kuin mustapippuri, mäntyinen kuin metsä, kirkkailla sitrusvivahteilla. Löytyy muskottipähkinästä, mustapippurista ja erilaisista kannabiksen kannoista. Tämä [terpeeni](/glossary/terpenes) tarjoaa sekä aromaattista kiinnostusta että mahdollisia terveystieteellisia hyötyjä.

## Nopea vastaus

**Sabiini** on bisyklinen monoterpeeni, jolla on monimutkainen mausteinen, mäntyinen ja sitrusaromi. Löytyy mustapippurista, muskottipähkinästä, Norjan kuusesta ja joistakin kannabiksen kannoista. Se yhdistetään antioksidantti-, tulehduksenvastaisia ja antimikrobisia ominaisuuksia. Sabiini edistää tiettyjen kantojen lämmittävää, mausteista luonnetta.

## Keskeiset kohdat

- Aromi: Mausteinen, mäntyinen, sitrus — monimutkainen ja lämmittävä
- Löytyy mustapippurista, muskottipähkinästä, kuusesta, kannabista
- Tutkimus viittaa vahvoihin antioksidanttivaikutuksiin
- Tulehduksenvastainen potentiaali
- Antimikrobiaalisia ominaisuuksia
- Pieni terpeeni useimmissa kannabiksen kannoissa
- Parasta: Antioksidanttituki, aromaattinen monimutkaisuus

## Aromi ja makuprofiili

- **Mausteinen** — Mustapippurin lämpö
- **Mäntyinen** — Tuore havukasvien vivahteet
- **Sitrus** — Appelsiinin kaltainen kirkkaus
- **Puumainen** — Hienovarainen metsäpohja

## Missä sabinia löytyy

| Lähde | Huomautukset |
|-------|--------------|
| **Mustapippuri** | Merkittävä komponentti |
| **Muskottipähkinä** | Osa mausteluonnetta |
| **Norjan kuusi** | Havukasvilähde |
| **Porkkanan siemen** | Öljykomponentti |
| **Joissakin kannabis** | Pieni terpeeni |

## Vaikutukset ja hyödyt

**Antioksidantti**
Tutkimukset osoittavat sabinilla olevan huomattavaa antioksidanttitoimintaa, joka suojaa soluja oksidatiiviselta [stressiltä](/conditions/stress).

**Tulehduksenvastainen**
Tutkimus viittaa tulehduksenvasteenvaikutuksiin.

**Antimikrobinen**
Osoittaa aktiivisuutta tiettyjä bakteereja ja sieniä vastaan.

## Sabiini vs samankaltaiset terpeepit

| Terpeeni | Aromi | Päämerkki |
|----------|-------|-----------|
| Sabiini | Mausteinen-mänty-sitrus | Antioksidantti |
| [Pineeni](/articles/what-is-pinene) | Puhdas mänty | Valppautta |
| [Karyofylleni](/articles/what-is-caryophyllene) | Mausteinen pippuri | Tulehduksenvastainen |`,
    excerpt: 'Sabinilla on monimutkainen mausteinen, mäntyinen aromi sitrusvivahteilla. Opi tästä mustapippurista ja kannabista löytyvästä terpeenistä.',
    meta_title: 'Mikä on sabiini? Mausteinen, mäntyinen terpeeni',
    meta_description: 'Sabiini on mausteinen, mäntyinen terpeeni, jota löytyy mustapippurista ja kannabista. Antioksidanttiominaisuudet.'
  },
  {
    article_id: "efa0abaa-6b3e-4974-9450-c21546208b66",
    language: 'fi',
    title: 'Parhaat terpeepit energiaan: Kattava opas',
    slug: 'best-terpenes-for-energy',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

Tunnetko olosi väsyneeksi mutta haluat välttää kofeiinin hermostuneisuutta? Oikea [terpeeni](/glossary/terpenes)profiili voi tarjota luonnollista, kestävää energiaa. [Limoneeni](/articles/what-is-limonene) ja [pineeni](/articles/what-is-pinene) ovat erityisen tehokkaita edistämään valppautta ja taistelemaan väsymystä vastaan.

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 27 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 27 |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja terpeenien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Nopea vastaus

Parhaat [terpeepit](/glossary/terpenes) energiaan ovat **[limoneeni](/articles/what-is-limonene)** (mielialan kohoaminen, henkinen energia), **[pineeni](/articles/what-is-pinene)** (valppautta, selvyyttä), **[terpinoleeni](/articles/what-is-terpinolene)** (piristävä joillekin) ja **[valencene](/articles/what-is-valencene)** (sitrusenergia). Vältä myrcene-valtaisia tuotteita, jotka edistävät rauhoittumista. Etsi "sativa" tai "päiväajat" CBD-formuloituja.

## Keskeiset numerot: Terpeepit energiaan

| Mittari | Arvo |
|---------|------|
| Kirjoittajan alan kokemus | 12+ vuotta |
| Tunnistettuja energiaterpeeneihin | 5 päälajiketta |
| Vältettäviä terpeeneihin | 3 rauhoittavaa tyyppiä |
| Suositeltuja terpeeniprofiilikomponentteja | 5 kohdistettua tasoa |

Tämä opas perustuu yli vuosikymmenen CBD-alan asiantuntemukseen tunnistaakseen tehokkaimmat terpeeniyhdistelmät luonnollisen energian lisäämiseen.

## Keskeiset kohdat

- Limoneeni tarjoaa [mielialaa](/conditions/mood) kohottavia, energisoivia vaikutuksia
- Pineeni edistää valppautta ilman hermostuneisuutta
- Valencene ja ocimene lisäävät sitrusenergiaa
- Vältä myrcene-raskaita tuotteita (rauhoittavia)
- Yhdistä pieneen CBD-annokseen tasapainoisen energian saamiseksi

## Parhaat terpeepit energiaan

### 1. Limoneeni — Sitrusenergisöija

**Miksi se toimii:** Limoneeni luonnollisesti kohottaa mielialaa ja tarjoaa henkistä energiaa. Se voi lisätä [dopamiinia](/conditions/dopamine) ja [serotoninia](/conditions/serotonin) — välittäjäaineita, jotka liittyvät motivaatioon ja hyvinvointiin.

**Tutkimus:** Tutkimukset osoittavat mielialaa kohottavia ja [stressiä](/conditions/stress) vähentäviä vaikutuksia, jotka voivat taistella väsymystä vastaan.

**Aromi:** Kirkas, tuore sitrus — kuin appelsiinin kuoriminen

**Löytyy myös:** Sitrushedelmät, kataja

[Lue lisää: Mikä on limoneeni? →](/articles/what-is-limonene)

### 2. Pineeni — Luonnollinen piristin

**Miksi se toimii:** Pineeni edistää valppautta ja henkistä selvyyttä. Toisin kuin kofeiini, se ei aiheuta hermostuneisuutta — vain puhdasta, keskittynyttä energiaa.

**Tutkimus:** Yhdistetään parantuneeseen valppauteen ja voi parantaa muistia.

**Aromi:** Tuore mänty metsä

**Löytyy myös:** Männyn neulaset, rosmariini, basilika

[Lue lisää: Mikä on pineeni? →](/articles/what-is-pinene)

### 3. Terpinoleeni — Kohoaminen (joskus)

**Miksi se toimii:** Terpinollenilla on monimutkaiset vaikutukset — kohottava ja energisoiva monille ihmisille, vaikka rauhoittava joillekin. Kun se toimii, se tarjoaa miellyttävää stimulaatiota.

**Tutkimus:** Löytyy pääasiassa energisöivistä kannabislajikkeista.

**Aromi:** Monimutkainen — kukkainen, yrttimäinen, mäntyinen, hieman sitrusmainen

**Löytyy myös:** Syrenit, muskottipähkinä, omenat

[Lue lisää: Mikä on terpinoleeni? →](/articles/what-is-terpinolene)`,
    excerpt: 'Tietyt terpeepit kuten limoneeni ja pineeni voivat lisätä energiaa ja taistella väsymystä vastaan. Opi mitkä terpeepit tarjoavat luonnollista energiatukea CBD:n kanssa.',
    meta_title: 'Parhaat terpeepit energiaan | Limoneeni, pineeni ja muut',
    meta_description: 'Löydä parhaat energiaterpeepit mukaan lukien limoneeni ja pineeni. Opi valitsemaan CBD-tuotteita, jotka lisäävät luonnollista energiaa.'
  },
  {
    article_id: "f89668b2-3c1d-43c5-bd2c-44ebc2db6228",
    language: 'fi',
    title: 'Saako CBD sinut huumausainehumalaan? Totuus CBD:stä ja päihtymisestä',
    slug: 'does-cbd-get-you-high',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Nopea vastaus

**Ei, CBD ei saa sinua huumausainehumalaan.** [CBD (kannabidioli)](/glossary/cannabidiol) on ei-päihdyttävä yhdiste hampusta, joka ei heikennä ajatteluasi tai tuota euforiaa. Toisin kuin [THC](/glossary/tetrahydrocannabinol), CBD ei sido voimakkaasti aivojen [CB1-reseptoreita](/glossary/cb1-receptor), jotka ovat vastuussa päihtymisestä. Voit käyttää CBD:tä ja silti ajaa, työskennellä ja toimia normaalisti.

---

## Keskeiset numerot: CBD vs THC päihtyminen

| Mittari | Arvo |
|---------|------|
| EU:n laillinen THC-raja CBD-tuotteissa | <0.2% |
| USA:n laillinen THC-raja CBD-tuotteissa | <0.3% |
| Sveitsin laillinen THC-raja | <1.0% |
| THC-sisältö tyypillisessä CBD-öljy annoksessa (50mg) | ~0.1mg |
| Kertaa vähemmän THC:ta kuin päihdyttävä annos | 50-100x vähemmän |

Nämä jäämäthc-määrät laillisissa CBD-tuotteissa ovat paljon alle tasojen, joita tarvitaan psykoaktiivisiin vaikutuksiin, mikä selittää miksi CBD pysyy ei-päihdyttävänä huolimatta minimaalisesta THC:sta.

## Keskeiset kohdat

- CBD on **ei-päihdyttävä**—se ei heikennä harkintakykyä tai tuota "humalaa"
- THC aiheuttaa päihtymistä; CBD ei (erilainen reseptoritoiminta)
- Lailliset CBD-tuotteet sisältävät **<0,2% THC:ta** (EU-raja), aivan liian vähän vaikutusten aiheuttamiseen
- Saatat tuntea olosi rauhallisemmaksi tai rentoutuneemmaksi, mutta tämä ei ole päihtymistä
- CBD on turvallista käyttää ennen [ajamista](/conditions/driving) tai työskentelyä (toisin kuin THC)

---

## Miksi CBD ei saa sinua huumausainehumalaan

"Humala" kannabista johtuu erityisesti [THC:sta](/glossary/tetrahydrocannabinol), ei CBD:stä. Nämä kaksi [kannabinoidia](/glossary/cannabinoid-profile) toimivat hyvin eri tavalla kehossa.

### Kuinka THC luo humalan

| Tekijä | THC | CBD |
|--------|-----|-----|
| **[CB1-reseptorin](/glossary/cb1-receptor) sitominen** | Vahva agonisti | Heikko/ei suoraa sitomista |
| **Psykoaktiivinen** | Kyllä | Ei |
| **Euforia** | Kyllä | Ei |
| **Heikentyminen** | Kyllä | Ei |
| **Vaikuttaa koordinaatioon** | Kyllä | Ei |
| **Laillinen asema** | Säännelty | Yleisesti laillinen |

THC tuottaa päihtymistä aktivoimalla voimakkaasti aivojen [CB1](/glossary/cb1-receptor)-reseptoreja. CBD ei aktivoi näitä reseptoreja samalla tavalla—itse asiassa se voi jopa vähentää THC:n vaikutuksia, kun molempia on läsnä.`,
    excerpt: 'Ei, CBD ei saa sinua huumausainehumalaan. Opi miksi CBD on ei-päihdyttävä, miten se eroaa THC:sta ja mitä voit odottaa CBD-tuotteista.',
    meta_title: 'Saako CBD sinut huumausainehumalaan? Ei - Tässä miksi',
    meta_description: 'CBD ei saa sinua huumausainehumalaan. Opi tiede siitä, miksi CBD on ei-päihdyttävä, miten se eroaa THC:sta ja mitä vaikutuksia voit odottaa.'
  },
  {
    article_id: "efe0bf12-4cff-4242-b9f5-05f1f2d7bf13",
    language: 'fi',
    title: 'Mikä on täyspektri-CBD? Kattava opas',
    slug: 'what-is-full-spectrum-cbd',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta CBD-alalla
Päivitetty viimeksi: tammikuu 2026

---

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Nopea vastaus

**[Täyspektri-CBD](/glossary/full-spectrum)** sisältää kaikki luonnollisesti esiintyvät yhdisteet hampputkasvista—[CBD](/glossary/cannabidiol), muut [kannabinoidi](/glossary/cannabinoid-profile), [terpeepit](/glossary/terpene-profile) ja [flavonoidit](/glossary/flavonoids)—mukaan lukien jäämä [THC](/glossary/tetrahydrocannabinol) (<0,2% EU laillinen). Tämä täydellinen kasviprofiili voi tuottaa [seurueefektin](/glossary/entourage-effect), jossa yhdisteet työskentelevät yhdessä synergistisesti. [Täyspektriä](/glossary/full-spectrum) pidetään usein tehokkaimpana CBD-tyyppinä.

---

## Keskeiset numerot: Täyspektri-CBD:n koostumus

| Mittari | Arvo |
|---------|------|
| CBD-sisältöalue | 40-70% |
| EU:n laillinen THC-raja | <0,2% |
| CBG tyypillinen alue | 0,5-3% |
| CBD-isolaatin puhtaus | 99%+ |
| Kirjoittajan alan kokemus | 12+ vuotta |

Nämä prosentit kuvastavat täyspektri CBD-tuotteiden tyypillistä kannabinoidisiprofiilia, jossa CBD on hallitseva yhdiste ja jäämämääriä muita hyödyllisiä kannabinoidejä.

## Keskeiset kohdat

- Täyspektri sisältää **kaikki hampun yhdisteet**, mukaan lukien jäämä THC (<0,2%)
- Voi hyötyä **[seurueefektistä](/glossary/entourage-effect)**—synergistinen yhdisteiden vuorovaikutus
- **Suosituin valinta** niille, jotka hakevat maksimaalista tehokkuutta
- Sisältää jäämä THC:ta—**voi laukaista huumetestejä** säännöllisessä käytössä
- Usein on **maanläheinen, hampun maku** (luonnolliset kasvinmaut)

---

## Mikä tekee CBD:stä "täyspektrin"?

Täyspektri tarkoittaa, että uute säilyttää hampun hyödyllisten yhdisteiden täydellisen valikoiman.

### Täyspektrin koostumus

| Yhdistyhmä | Esimerkit | Rooli |
|------------|-----------|-------|
| **Ensisijainen kannabinnoidi** | [CBD](/glossary/cannabidiol) (enemmistö) | Pääaktiivinen yhdiste |
| **Sivukannabinoidi** | [CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene), [CBN](/glossary/cannabinol) | Tukivaikutukset |
| **Laillinen THC** | <0,2% (EU) | [Seurueefektin](/glossary/entourage-effect) panos |
| **Terpeepit** | [Myrcene](/glossary/myrcene), [limoneeni](/glossary/limonene), [linalool](/glossary/linalool) | Aromi, vaikutukset |
| **Flavonoidit** | Kannaflaviinit, kversetiini | Antioksidantit, väri |
| **Kasvimateriaali** | Vahakset, klorofylli | Sivukomponentteja |`,
    excerpt: 'Täyspektri-CBD sisältää kaikki hampun yhdisteet mukaan lukien jäämä THC (<0,2%). Opi seurueefektistä, hyödyistä ja milloin valita täyspektri.',
    meta_title: 'Mikä on täyspektri-CBD? Hyödyt ja seurueefekti',
    meta_description: 'Opi mikä täyspektri-CBD on, miten se eroaa isolaatista ja miksi seurueefekti merkitsee. Ymmärrä THC-sisältö ja kenelle se sopii.'
  },
  {
    article_id: "f3761c08-394e-4c48-8903-dbdd67fb9254",
    language: 'fi',
    title: 'Mikä on laajaksi spektri-CBD? THC-vapaa vaihtoehto selitettynä',
    slug: 'what-is-broad-spectrum-cbd',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta CBD-alalla
Päivitetty viimeksi: tammikuu 2026

---

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Nopea vastaus

**[Laajaksi spektri-CBD](/glossary/broad-spectrum)** sisältää useita hampun yhdisteitä—[CBD](/glossary/cannabidiol), muut [kannabinoidi](/glossary/cannabinoid-profile) ja [terpeepit](/glossary/terpene-profile)—mutta [THC](/glossary/tetrahydrocannabinol) on poistettu tai vähennetty havaitsemattomiin tasoihin. Se tarjoaa keskitien [täyspektrin](/glossary/full-spectrum) ja [isolaatin](/glossary/cbd-isolate) välillä: osittaiset [seurueefektin](/glossary/entourage-effect) hyödyt ilman THC-huolia. Ihanteellinen niille, jotka haluavat enemmän kuin isolaatin mutta eivät voi käyttää THC:ta.

---

## Keskeiset numerot: Laajaksi spektri-CBD:n koostumus

| Mittari | Arvo |
|---------|------|
| CBD-pitoisuus | 50-80% |
| CBG tyypillinen alue | 0,5-3% |
| CBC tyypillinen alue | 0,1-1% |
| THC-sisältö | <0,01% tai ei havaittavissa |

Nämä prosentit edustavat laajaksi spektri-CBD-tuotteiden tyypillistä kannabinoidisiprofiilia THC:n poistokäsittelyn jälkeen.

## Keskeiset kohdat

- [Laajaksi spektri](/glossary/broad-spectrum) = täyspektri **miinus THC**
- Sisältää CBD:n, muut kannabinoidi ([CBG](/glossary/cannabigerol), [CBC](/glossary/cannabichromene)) ja terpeepit
- **THC poistettu tai ei havaittavissa** (ei aina nolla—tarkista laboraportteja)
- Voi tarjota **osittaisen seurueefektin** hyötyja
- **Pienempi huumetestiriski** kuin täyspektri
- Hyvä **THC-herkille henkilöille** tai huumetesteille

---

## Mikä tekee CBD:stä "laajaksi spektrin"?

Laajaksi spektri sijoittuu täyspektrin ja isolaatin välillä käsittelyasteikolla.

### Laajaksi spektrin koostumus

| Yhdistyhmä | Läsnä? | Huomautuksia |
|------------|--------|-------------|
| **CBD** | Kyllä | Ensisijainen kannabinnoidi |
| **Sivukannabinoidi** | Kyllä | CBG, CBC, CBN, jne. |
| **THC** | Poistettu/ei havaittavissa | Keskeinen ero täyspektriin |
| **Terpeepit** | Yleensä | Voi olla vähennetty THC:n poiston aikana |
| **Flavonoidit** | Yleensä | Osittainen säilyvyys |`,
    excerpt: 'Laajaksi spektri-CBD sisältää useita hampun yhdisteitä mutta ei THC:ta. Opi miten se eroaa täyspektristä ja isolaatista, kenelle se sopii parhaiten.',
    meta_title: 'Mikä on laajaksi spektri-CBD? Hyödyt ja kenelle se sopii',
    meta_description: 'Opi mikä laajaksi spektri-CBD on, kuinka THC poistetaan ja kenen pitäisi valita se. Ymmärrä ero täyspektristä ja isolaatista.'
  },
  {
    article_id: "f7ebcbe0-7751-4887-8db8-4f79d28d7ecb",
    language: 'fi',
    title: 'Mikä on CBD-isolaatti? Puhdas CBD selitettynä',
    slug: 'what-is-cbd-isolate',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta CBD-alalla
Päivitetty viimeksi: tammikuu 2026

---

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Systemaattiset katsaukset | 1 |
| Prekliiniset tutkimukset | 1 |
| Osallistujien kokonaismäärä | 163+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja kannabinoidien tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Nopea vastaus

**[CBD-isolaatti](/glossary/cbd-isolate)** on puhdas [kannabidioli](/glossary/cannabidiol)—99%+ [CBD](/glossary/cannabidiol) ilman muita kannabinoideja, [terpeeneja](/glossary/terpene-profile) tai [THC:ta](/glossary/tetrahydrocannabinol). Se on tyypillisesti valkoinen kiteinen jauhe tai kiinteä, joka on mautonta ja hajutonta. [Isolaatti](/glossary/cbd-isolate) tarjoaa tarkkaa annostelua ja nolla THC-riskiä, mikä tekee siitä ihanteellisen huumetesteille henkilöille, vaikka se ei sisälläkään täys- tai laajaksi spektrin [seurueefektin](/glossary/entourage-effect) hyötyjä.

---

## Keskeiset numerot: CBD-isolaatin puhtaus ja koostumus

| Mittari | Arvo |
|---------|------|
| CBD-puhtaus | 99%+ |
| THC-sisältö | 0% |
| CBD-sisältö laajaksi spektrissä | 50-80% |
| CBD-sisältö täyspektrissä | 40-70% |
| Hampun THC laillinen raja | <0,2% |

Nämä numerot korostavat CBD-isolaatin määrittelevää ominaisuutta puhtaimpana saatavilla olevana kannabidiolin muotona, maksimaalinen CBD-pitoisuus ja nolla THC-riski verrattuna muihin spektrityyppeihin.

## Keskeiset kohdat

- CBD-isolaatti on **99%+ puhdasta CBD:tä**—ei mitään muuta
- **Nolla THC:ta**—turvallisin vaihtoehto huumetesteille
- **Ei seurueefektiä**—CBD toimii yksinään
- **Mauton ja hajuton**—helppo käyttää missä tahansa muodossa
- Usein **edullisin** per milligramma CBD:tä
- **Tarkka, johdonmukainen annostelu**—sama joka kerta

---

## Mikä on CBD-isolaatti?

CBD-isolaatti on kaupallisesti saatavilla oleva puhtain kannabidiolin muoto.

### Koostumus

| Komponentti | Sisältö |
|-------------|---------|
| **CBD** | 99%+ |
| **Muut kannabinoidi** | Ei mitään |
| **THC** | Ei mitään (0%) |
| **Terpeepit** | Ei mitään |
| **Flavonoidit** | Ei mitään |
| **Kasvimateriaali** | Ei mitään |

### Fysikaaliset ominaisuudet

| Ominaisuus | Kuvaus |
|-----------|----------|
| **Ulkonäkö** | Valkoinen kiteinen jauhe tai kiinteä |
| **Maku** | Mauton |
| **Haju** | Hajuton |
| **Liukoisuus** | Rasva liukoinen |
| **Rakenne** | Hieno jauhe tai kiteet |`,
    excerpt: 'CBD-isolaatti on 99%+ puhdasta CBD:tä ilman THC:ta, terpeeneja tai muita kannabinoideja. Opi kenelle se sopii parhaiten, miten se vertautuu täysspektriin.',
    meta_title: 'Mikä on CBD-isolaatti? Puhtaan CBD:n hyödyt ja käyttö',
    meta_description: 'Opi mikä CBD-isolaatti on, miten se tehdään ja kenen pitäisi käyttää sitä. Ymmärrä kaupankäynti täysspektriin verrattuna ja milloin puhdas CBD on oikea valinta.'
  },
  {
    article_id: "c9c4aac9-685c-4627-8775-459ce1cf3f03",
    language: 'fi',
    title: 'CBD ja kehosi: Kattava katsaus vaikutuksista ja järjestelmistä',
    slug: 'cbd-and-your-body',
    content: `Robin Roy Krigslund-Hansen | 12+ vuotta [CBD](/glossary/cannabidiol)-alalla
Päivitetty viimeksi: tammikuu 2026

---

<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
<p class="font-semibold text-green-800 mb-2">Nopea vastaus</p>
<p class="text-green-900">CBD on vuorovaikutuksessa reseptoreiden kanssa koko kehossasi endokannabinoidijärjestelmän (ECS) kautta. Tämä järjestelmä vaikuttaa aivoihisi (mieliala, kognitio), immuunitoimintaan, ihoon, ruoansulatusjärjestelmään ja muuhun. CBD:n vaikutukset ovat hienovaraisia ja vaihtelevat yksilöllisesti, jatkuvan tutkimuksen tutkiessa sen täyttä potentiaalia.</p>
</div>

<div class="bg-gray-50 border border-gray-200 p-4 mb-8 rounded-lg">
<p class="font-semibold text-gray-800 mb-3">Keskeiset kohdat</p>
<ul class="space-y-2 text-gray-700">
<li>✓ <strong>Koko kehon järjestelmä</strong>: [ECS](/glossary/endocannabinoid-system):ssä on reseptoreja koko kehossasi</li>
<li>✓ <strong>Aivovaikutukset</strong>: CBD vaikuttaa [mielialaan](/conditions/mood), [stressireaktioihin](/conditions/stress) ja [uni](/conditions/sleep)-valvesykleihin</li>
<li>✓ <strong>Immuunimodulaatio</strong>: CBD on vuorovaikutuksessa immuunisolujen ja tulehdusteiden kanssa</li>
<li>✓ <strong>Ihon vuorovaikutus</strong>: Kannabinoidisireseptoreita on ihokudoksessa</li>
<li>✓ <strong>Suolistoyhteys</strong>: ECS:llä on rooli ruoansulatustoiminnassa</li>
<li>✓ <strong>Yksilöllinen vaihtelu</strong>: Vaikutukset riippuvat ainutlaatuisesta biologiastasi</li>
</ul>
</div>

---

## Tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltujen tutkimusten määrä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Prekliiniset tutkimukset | 2 |
| Osallistujien kokonaismäärä | 781+ |
| Todisteiden vahvuus | ●●●○○ Kohtalainen |

*CBD:n ja ms:n tutkimus kehittyy jatkuvasti. [Selaa kaikkia tutkimuksia](/research)*

## Keskeiset numerot: CBD-tutkimuksen yhteenveto

| Mittari | Arvo |
|---------|------|
| Tarkasteltuja tutkimuksia yhteensä | 100 |
| Ihmisillä tehtyjä kliinisiä tutkimuksia | 98 |
| Tutkimusosallistujia yhteensä | 781+ |
| Todisteiden vahvuusluokitus | 3/5 (Kohtalainen) |

Tämä tutkimuksen yhteenveto kuvastaa CBD-tutkimusten nykytilaa, jossa valtaosa on ihmisillä tehtyjä kliinisiä tutkimuksia pikemminkin kuin prekliinisiä eläinkokeita.

## Koko kehon endokannabinoidijärjestelmä

Ymmärtääksesi kuinka CBD vaikuttaa kehoosi, sinun täytyy ymmärtää [endokannabinoidijärjestelmä](/glossary/endocannabinoid-system) (ECS)—biologinen verkko, joka ulottuu lähes jokaiseen elimeen ja kudokseen.

### ECS:n jakauma

| Kehoalue | ECS:n läsnäolo | Ensisijainen toiminto |
|----------|----------------|----------------------|
| **Aivot** | Korkea (CB1) | Mieliala, muisti, kognitio |
| **Selkäydin** | Korkea (CB1) | [Kivun](/conditions/pain) prosessointi |
| **Immuunisolut** | Korkea (CB2) | Immuunisäätelyy |
| **Suolisto** | Kohtalainen (CB1/CB2) | Ruoansulatus, motiliteetti |
| **Iho** | Kohtalainen (CB1/CB2) | Estekerroksen toiminta, aistimus |
| **Sydän** | Kohtalainen | Kardiovaskulaarinen säätely |
| **Luut** | Matala-kohtalainen (CB2) | Luumetabolia |
| **Lisääntymiselmet** | Kohtalainen | Hedelmällisyys, lisääntyminen |

ECS ylläpitää [homeostaasia](/glossary/homeostasis)—pitää kehosi tasapainossa sisäisistä ja ulkoisista muutoksista huolimatta.`
  }
];

async function translateAndInsert() {
  let successCount = 0;
  
  console.log('Starting Finnish translation batch...');
  
  for (const translation of finnishTranslations) {
    try {
      console.log(`Inserting translation: ${translation.title}`);
      
      const { error } = await sb
        .from('article_translations')
        .upsert(translation, { 
          onConflict: 'article_id,language' 
        });
      
      if (error) {
        console.error(`❌ Error inserting translation for article ${translation.article_id}:`, error);
      } else {
        console.log(`✅ Successfully inserted: ${translation.title}`);
        successCount++;
      }
      
    } catch (err) {
      console.error(`❌ Failed to process article ${translation.article_id}:`, err);
    }
  }
  
  console.log(`\n🎉 Completed: ${successCount} out of ${finnishTranslations.length} articles successfully translated and inserted.`);
}

translateAndInsert();