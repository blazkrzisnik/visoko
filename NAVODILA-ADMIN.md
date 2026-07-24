# Skrbniški način — kako deluje in kako ga nastaviš

## Kaj sem naredil

Strani **Ponudba** in **Dogodki** zdaj ne prikazujeta več "trdo zapisanih" kartic
v kodi, ampak jih vsakič znova izrišeta iz podatkov po vedno isti predlogi
(template) — tako kartice vedno izgledajo enako urejeno, ne glede na to, ali
imajo sliko ali ne.

Dodal sem tudi skrito stran **`admin.html`**, kjer lahko (ko je nastavljeno)
kadarkoli:
- dodaš ali izbrišeš postavko **ponudbe** (kava, sladice …),
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
Uporabil sem **Google Firebase** — podobno kot Formspree za obrazec, je
brezplačno in ne zahteva, da imaš svoj strežnik.

### 1. Ustvari Firebase projekt
1. Pojdi na [console.firebase.google.com](https://console.firebase.google.com) in se prijavi z Google računom.
2. Klikni **"Add project"** → poimenuj ga npr. `kavarna-visoko` → nadaljuj s privzetimi nastavitvami (Google Analytics ni potreben, lahko izklopiš).

### 2. Dodaj spletno aplikacijo in dobi konfiguracijo
1. Na nadzorni plošči projekta klikni ikono `</>` (Web app).
2. Vpiši ime (npr. "Kavarna Visoko splet") → **Register app**.
3. Prikaže se `firebaseConfig` objekt — te vrednosti prekopiraj v datoteko
   **`data.js`**, na vrh, namesto `VSTAVI_SVOJ_...` vrednosti:

```js
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 3. Vklopi bazo (Firestore)
1. V levem meniju klikni **Build → Firestore Database → Create database**.
2. Izberi **"Start in production mode"** in poljubno lokacijo (npr. `europe-west`).
3. Ko je baza ustvarjena, pojdi na zavihek **Rules** in prilepi:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ponudba/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /dogodki/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

To pomeni: **vsak lahko bere** ponudbo/dogodke (da se prikažejo na strani),
**samo prijavljen skrbnik pa lahko dodaja ali briše**.

### 4. Vklopi prijavo (da boš le ti lahko urejal vsebino)
1. V levem meniju: **Build → Authentication → Get started**.
2. Zavihek **Sign-in method** → omogoči **Email/Password**.
3. Zavihek **Users → Add user** → vnesi svoj e-naslov in geslo po izbiri.
   To je tvoj prijavni podatek za `admin.html`.

### 5. Preizkusi
1. Odpri `admin.html` v brskalniku (enako kot ostale `.html` datoteke).
2. Prijavi se z e-naslovom/geslom iz koraka 4.
3. Dodaj testno postavko ponudbe ali dogodek → odpri `ponudba.html` oz.
   `dogodki.html` v novem zavihku in preveri, da se prikaže.
4. Izbriši testno postavko, če je bila samo za preizkus.

---

## Pomembno

- **Geslo iz koraka 4 obravnavaj kot skrivnost** — kdorkoli se prijavi z njim,
  lahko ureja vsebino. Povezave do `admin.html` ne deli javno.
- Brezplačni Firebase paket (Spark) je za en majhen spletni meni/dogodke
  več kot dovolj (velikodušne brezplačne omejitve, plačila ne rabiš).
- Dokler koraka 1–4 ne narediš, `data.js` samodejno uporabi rezervne
  podatke, zato je stran vedno "polna" in pripravljena za predstavitev.
