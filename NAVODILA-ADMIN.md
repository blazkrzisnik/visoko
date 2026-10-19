# Skrbniški način — kako deluje in kako ga nastaviš (Supabase)

## Kaj sem naredil

Strani **Ponudba** (cenik po kategorijah) in **Dogodki** ne prikazujeta
"trdo zapisane" vsebine v kodi, ampak jo vsakič znova izrišeta iz podatkov po vedno isti
predlogi (template) — tako kartice vedno izgledajo enako urejeno, ne glede
na to, ali imajo sliko ali ne.

Dodal sem tudi skrito stran **`admin.html`**, kjer lahko (ko je nastavljeno)
kadarkoli:
- dodaš, urediš ali izbrišeš postavko **ponudbe** (naziv, opis, cena,
  kategorija) in označiš **hišno posebnost**, ki se prikaže v pasici na vrhu
  strani Ponudba,
- dodaš nov **dogodek** ali izbrišeš tistega, ki je že mimo,
- za vsako postavko po želji priložiš sliko — če je ne priložiš, se kartica
  vseeno lepo prikaže (samo z ikono namesto s fotografijo).

Ta stran **ni povezana nikjer v meniju** — normalen obiskovalec je ne bo
nikoli naletel nanjo, ker do nje ne vodi noben klik na strani. Za pravo
zaščito (da je nihče ne more urejati, tudi če pozna povezavo) pa je
potrebna prijava z geslom — glej korak 4 spodaj.

**Dokler spodnjega ne nastaviš, strani še vedno delujeta** — prikazujeta
trenutno ponudbo in dogodke kot doslej (t. i. "rezervni" podatki v `data.js`),
zato lahko website mirno predstaviš že zdaj.

---

## Kaj moraš narediti, da bo skrbništvo dejansko delovalo

Za to, da lahko dodajaš/brišeš vsebino tako, da jo vidijo **vsi obiskovalci**
(ne le ti na svojem računalniku), potrebuješ brezplačno bazo v ozadju.
Uporabil sem **Supabase** — podobno kot Formspree za obrazec, je brezplačno
in ne zahteva, da imaš svoj strežnik.

### 1. Ustvari Supabase projekt
1. Pojdi na [supabase.com](https://supabase.com) → **Start your project** →
   prijavi se (najlažje z GitHub ali Google računom).
2. Klikni **"New project"**.
3. Vpiši ime (npr. `kavarna-visoko`), izberi geslo za bazo (shrani si ga
   nekam, ga pa v tem primeru ne boš več rabil) in regijo, ki je blizu
   (npr. Frankfurt) → **Create new project**. Počakaj minuto, da se pripravi.

### 2. Ustvari dve tabeli (Ponudba in Dogodki)
1. V levem meniju klikni **Table editor** → **New table**.
2. Ime: `ponudba`. Pusti privzeta stolpca `id` in `created_at`. Dodaj še:
   - `naziv` — tip **text**
   - `opis` — tip **text**
   - `slika` — tip **text** (lahko prazno)
   - `cena` — tip **text** (npr. `2,60 €`, lahko prazno)
   - `kategorija` — tip **text** (Kava, Topli napitki, Hladni napitki ali Sladice)
   - `posebnost` — tip **bool**, privzeto `false` (označi hišno posebnost za
     temno pasico na vrhu strani Ponudba)
3. Shrani.
4. Ustvari še tabelo `dogodki` s stolpci `naziv`, `opis`, `slika` (vsi
   **text**) in:
   - `datum` — tip **text** (lahko prazno)

> **Tabela `ponudba` že obstaja?** Nove stolpce dodaš najhitreje v
> **SQL Editor** → New query → prilepi in klikni **Run**:
> ```sql
> alter table ponudba add column if not exists cena text;
> alter table ponudba add column if not exists kategorija text;
> alter table ponudba add column if not exists posebnost boolean default false;
> ```
> Če imaš pravilo za pisanje že nastavljeno samo za INSERT in DELETE, mu
> dodaj še **UPDATE** (Authentication → Policies).
>
> Nato se v `admin.html` prijavi in pri vsaki postavki klikni **Uredi**, da
> vpišeš ceno in kategorijo. Dokler stolpcev ni, dodajanje v ponudbo javi napako.

### 3. Vklopi varnostna pravila (Row Level Security)
1. Pri vsaki tabeli (`ponudba` in `dogodki`) klikni **RLS** stikalo, da
   ga vklopiš ("Enable RLS").
2. Nato klikni **New Policy** → **"Get started quickly"** → izberi predlogo
   **"Enable read access for everyone"** → shrani. To omogoči, da vsak
   obiskovalec strani lahko *bere* ponudbo/dogodke.
3. Dodaj še eno pravilo za pisanje: **New Policy** → "Create policy from
   scratch" → ime npr. `dovoli pisanje prijavljenim` → Operation: vključi
   **INSERT**, **UPDATE** in **DELETE** (UPDATE rabi gumb »Uredi«) → v polje "USING/WITH CHECK expression" vpiši:
   ```
   auth.role() = 'authenticated'
   ```
   → Save. To pomeni: dodajati/brisati lahko samo prijavljen skrbnik.
4. Enako ponovi za drugo tabelo.

### 3b. Ustvari prostor za slike (Storage)
Ker admin zdaj sliko izbere kar iz računalnika (namesto da vpiše povezavo),
rabimo v Supabase še "mapo" za shranjevanje teh slik:
1. Levi meni → **Storage** → **New bucket**.
2. Ime: `slike` (točno tako, malo tiskano).
3. Vklopi stikalo **"Public bucket"** → Create bucket. To pomeni, da so
   naložene slike javno vidne na strani (kot je treba za spletno stran).

### 4. Dobi API ključe in jih vstavi v kodo
1. V levem meniju: **Settings (zobnik) → API**.
2. Skopiraj **Project URL** in **anon public** ključ.
3. Odpri datoteko **`data.js`** in ju vstavi na vrh, namesto
   `VSTAVI_SVOJ_...` vrednosti:
```js
const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOi...";
```
   *(Ali mi ju pošlji v pogovor in ti to takoj urejem sam.)*

### 5. Vklopi prijavo (da boš le ti lahko urejal vsebino)
1. V levem meniju: **Authentication → Users → Add user → Create new user**.
2. Vnesi svoj e-naslov in geslo po izbiri. To je tvoj prijavni podatek za
   `admin.html`.
3. (Authentication → Providers → Email mora biti privzeto že vklopljen —
   ni ti treba ničesar dodatno spreminjati.)

### 6. Preizkusi
1. Odpri `admin.html` v brskalniku (enako kot ostale `.html` datoteke).
2. Prijavi se z e-naslovom/geslom iz koraka 5.
3. Dodaj testno postavko ponudbe ali dogodek → odpri `ponudba.html` oz.
   `dogodki.html` v novem zavihku in preveri, da se prikaže.
4. Izbriši testno postavko, če je bila samo za preizkus.

---

## Pomembno

- **Geslo iz koraka 5 obravnavaj kot skrivnost** — kdorkoli se prijavi z
  njim, lahko ureja vsebino. Povezave do `admin.html` ne deli javno.
- Brezplačni Supabase paket je za en majhen spletni meni/dogodke več kot
  dovolj (plačila ne rabiš).
- Dokler korakov 1–5 ne narediš, `data.js` samodejno uporabi rezervne
  podatke, zato je stran vedno "polna" in pripravljena za predstavitev.
