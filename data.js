/* =========================================================================
   KAVARNA VISOKO — podatkovni sloj (ponudba & dogodki)
   -------------------------------------------------------------------------
   Ta datoteka poskrbi, da se ponudba (cenik s hišno posebnostjo) in
   kartice dogodkov izrišejo vedno po enaki predlogi (template), ne glede na to, ali podatki prihajajo iz Supabase
   (ki jih admin ureja prek admin.html) ali iz spodnjih rezervnih (SEED)
   podatkov.

   DOKLER SUPABASE NI NASTAVLJEN: stran prikaže spodnje SEED podatke, tako
   da lahko website takoj predstaviš — nič ni "prazno" ali pokvarjeno.

   KO NASTAVIŠ SUPABASE (glej NAVODILA-ADMIN.md): vstavi svoj URL in anon
   ključ spodaj, in ponudba/dogodki se bodo od takrat brali iz baze, ki jo
   urejaš prek admin.html.
   ========================================================================= */

// === 1) VSTAVI SVOJE SUPABASE PODATKE TUKAJ (glej navodila) ===
const SUPABASE_URL = "https://zjpwbwyssgtzkhwgpzde.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LwM-wi3fizD2C9IHtr4R_Q_Bqo-MtMq";

let sb = null;
let sbReady = false;

function initSupabase() {
  if (sbReady) return true;
  if (typeof supabase === "undefined") return false;
  if (SUPABASE_URL === "VSTAVI_SVOJ_SUPABASE_URL") return false; // še ni nastavljeno
  try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    sbReady = true;
    return true;
  } catch (e) {
    console.warn("Supabase se ni uspel inicializirati, prikazujem privzete podatke.", e);
    return false;
  }
}

// === 2) REZERVNI (SEED) PODATKI — prikazani, dokler Supabase ni nastavljen ali prazen ===
// Polja ponudbe: naziv, opis, cena (besedilo, npr. "2,60 €"), kategorija,
// posebnost (true = prikazano v pasici »Hišna posebnost« na vrhu strani), slika.
// OPOMBA: cene spodaj so okvirne in jih je treba popraviti v skrbništvu.
const KATEGORIJE_PONUDBE = ["Kava", "Topli napitki", "Hladni napitki", "Sladice"];

const SEED_PONUDBA = [
  { naziv: "Metina tortica", kategorija: "Sladice", cena: "4,50 €", posebnost: true, slika: "",
    opis: "Hišna tortica, poimenovana po Meti iz Tavčarjevega Cvetja v jeseni – rahel orehov biskvit, kremna skuta in med z domačega čebelnjaka." },
  { naziv: "Espresso", kategorija: "Kava", cena: "1,80 €", opis: "Kratka, polna kava iz skrbno izbranih zrn.", slika: "" },
  { naziv: "Kapučino", kategorija: "Kava", cena: "2,60 €", opis: "Espresso z žametno mlečno peno.", slika: "" },
  { naziv: "Bela kava", kategorija: "Kava", cena: "2,40 €", opis: "Espresso z več toplega mleka.", slika: "" },
  { naziv: "Filter kava", kategorija: "Kava", cena: "2,80 €", opis: "Počasi pripravljena, mehka in aromatična.", slika: "" },
  { naziv: "Vroča čokolada", kategorija: "Topli napitki", cena: "3,20 €", opis: "Gosta, temna čokolada, po želji s smetano.", slika: "" },
  { naziv: "Zeliščni čaj z vrta", kategorija: "Topli napitki", cena: "2,50 €", opis: "Mešanica zelišč iz vrta ob dvorcu.", slika: "" },
  { naziv: "Matcha latte", kategorija: "Topli napitki", cena: "3,90 €", opis: "Topla matcha z mlečno peno, po želji z okusom – za okuse vprašajte osebje.", slika: "" },
  { naziv: "Domača limonada", kategorija: "Hladni napitki", cena: "3,50 €", opis: "Z zelišči z našega vrta.", slika: "" },
  { naziv: "Ice matcha latte", kategorija: "Hladni napitki", cena: "4,20 €", opis: "Matcha z mlekom na ledu, po želji z okusom.", slika: "" },
  { naziv: "Ledena kava", kategorija: "Hladni napitki", cena: "3,40 €", opis: "Espresso na ledu z mlekom.", slika: "" },
  { naziv: "Domača torta dneva", kategorija: "Sladice", cena: "3,90 €", opis: "Vsak dan druga – povprašajte pri šanku.", slika: "" },
  { naziv: "Jabolčni zavitek", kategorija: "Sladice", cena: "3,50 €", opis: "Po receptu, ki diši po kmečki jedilnici izpred dveh stoletij.", slika: "" }
];

const SEED_DOGODKI = [
  {
    naziv: "Adventni sejem na Dvorcu Visoko",
    datum: "Nedelja, 13. 12. 2026, 14.00–18.00",
    opis: "Unikatni izdelki, ročno izdelana darila, praznične dekoracije in domače dobrote lokalnih ustvarjalcev, s prazničnimi delavnicami in glasbo. Razstavljavci se lahko prijavijo do 26. 10. 2026 pri Zavodu Poljanska dolina.",
    slika: "slike/dvorec main.png"
  },
  {
    naziv: "Tenis v belem",
    datum: "Vsako leto junija",
    opis: "Letos smo uspešno izpeljali že 5. Tenis v belem na travnatem igrišču pri Dvorcu Visoko – dan s kosilom, izločilnimi dvoboji in finalom v tradicionalni beli opravi z lesenimi loparji, v sodelovanju s Teniškim klubom Gorenja vas.",
    slika: "slike/tenis v belem main.png"
  },
  {
    naziv: "Poroke pod kozolcem",
    datum: "Vse leto",
    opis: "Poročni obred v zunanjem paviljonu z razgledom na baročno cerkev sv. Volbenka, v Visoškem toplarju ali v poročni dvorani z zgodovinskimi poslikavami, slavje pa v Dvorani pod velbi za do 200 gostov.",
    slika: "slike/kozolec.png"
  }
];

// === 3) POMOŽNE FUNKCIJE ===
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// === 4) PREDLOGA (TEMPLATE) ZA PONUDBO ===
function isPosebnost(item) {
  return item.posebnost === true || item.posebnost === "true";
}

// pasica »Hišna posebnost« na vrhu strani
function posebnostHTML(item) {
  const hasImg = item.slika && item.slika.trim() !== "";
  return `<div class="wrap special-inner${hasImg ? " has-image" : ""}">
    <div class="special-text">
      <p class="special-eyebrow">Hišna posebnost</p>
      <h1>${escapeHTML(item.naziv)}</h1>
      <p class="special-desc">${escapeHTML(item.opis)}</p>
      ${item.cena ? `<p class="special-price">${escapeHTML(item.cena)}</p>` : ""}
    </div>
    ${hasImg ? `<div class="special-image"><img src="${escapeHTML(item.slika)}" alt="${escapeHTML(item.naziv)}"></div>` : ""}
  </div>`;
}

// ena vrstica cenika
function menuRowHTML(item) {
  return `<li class="menu-row">
    <div class="menu-row-head">
      <h3>${escapeHTML(item.naziv)}${isPosebnost(item) ? ' <span class="menu-badge">Hišna posebnost</span>' : ""}</h3>
      ${item.cena ? `<span class="menu-price">${escapeHTML(item.cena)}</span>` : ""}
    </div>
    ${item.opis ? `<p>${escapeHTML(item.opis)}</p>` : ""}
  </li>`;
}

// seznam, razdeljen po kategorijah (neznane kategorije se izpišejo na koncu)
function menuListHTML(items) {
  const groups = {};
  items.forEach(item => {
    const kat = (item.kategorija || "").trim() || "Ponudba";
    (groups[kat] = groups[kat] || []).push(item);
  });
  const order = KATEGORIJE_PONUDBE.filter(k => groups[k])
    .concat(Object.keys(groups).filter(k => !KATEGORIJE_PONUDBE.includes(k)));
  return order.map(kat => `<section class="menu-group">
      <h2 class="menu-group-title">${escapeHTML(kat)}</h2>
      <ul class="menu-list">${groups[kat].map(menuRowHTML).join("")}</ul>
    </section>`).join("");
}

// === 5) PREDLOGA (TEMPLATE) ZA KARTICO DOGODKA ===
function eventCardHTML(item, index) {
  const hasImg = item.slika && item.slika.trim() !== "";
  const reverseClass = (hasImg && index % 2 === 1) ? " reverse" : "";
  if (hasImg) {
    return `<article class="event-card${reverseClass} reveal is-visible">
      <div class="event-card-image"><img src="${escapeHTML(item.slika)}" alt="${escapeHTML(item.naziv)}"></div>
      <div class="event-card-body">
        <p class="eyebrow">${escapeHTML(item.datum || "Dogodek")}</p>
        <h2>${escapeHTML(item.naziv)}</h2>
        <p>${escapeHTML(item.opis)}</p>
      </div>
    </article>`;
  }
  return `<article class="event-card no-image reveal is-visible">
    <div class="event-card-body">
      <p class="eyebrow">${escapeHTML(item.datum || "Dogodek")}</p>
      <h2>${escapeHTML(item.naziv)}</h2>
      <p>${escapeHTML(item.opis)}</p>
    </div>
  </article>`;
}

// === 6) IZRIS NA STRANI ===
async function renderPonudba(containerId, specialId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let items = SEED_PONUDBA;
  if (initSupabase()) {
    try {
      const { data, error } = await sb.from("ponudba").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      if (data && data.length) items = data;
    } catch (e) {
      console.warn("Ponudbe ni bilo mogoče naložiti iz Supabase, prikazujem privzete.", e);
    }
  }
  const special = items.find(isPosebnost);
  const specialEl = specialId && document.getElementById(specialId);
  if (specialEl) {
    if (special) specialEl.innerHTML = posebnostHTML(special);
    else specialEl.hidden = true;
  }
  el.innerHTML = menuListHTML(items);
}

async function renderDogodki(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let items = SEED_DOGODKI;
  if (initSupabase()) {
    try {
      const { data, error } = await sb.from("dogodki").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      if (data && data.length) items = data;
    } catch (e) {
      console.warn("Dogodkov ni bilo mogoče naložiti iz Supabase, prikazujem privzete.", e);
    }
  }
  el.innerHTML = items.map(eventCardHTML).join("");
}
