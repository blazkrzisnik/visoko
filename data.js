/* =========================================================================
   KAVARNA VISOKO — podatkovni sloj (ponudba & dogodki)
   -------------------------------------------------------------------------
   Ta datoteka poskrbi, da se kartice na straneh "Ponudba" in "Dogodki"
   izrišejo vedno po enaki predlogi (template), ne glede na to, ali imajo
   sliko ali ne, in ne glede na to, ali podatki prihajajo iz Supabase
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
const SEED_PONUDBA = [
  { naziv: "Kava", opis: "Espresso, kapučino in filter kava iz skrbno izbranih zrn, postrežena v tišini stoletne veže.", slika: "" },
  { naziv: "Domače sladice", opis: "Torte in peciva iz naše kuhinje, pečena po receptih, ki dišijo po kmečki jedilnici izpred dveh stoletij.", slika: "" },
  { naziv: "Zeliščni napitki & matcha", opis: "Limonade in čaji z zelišči iz vrta ob dvorcu, poleti pa tudi topla ali ice matcha latte, po želji z okusi.", slika: "" },
  { naziv: "Poletna terasa", opis: "Miza pod kostanjem, pogled na kozolec in dolino — najboljši prostor za počasno popoldne.", slika: "" }
];

const SEED_DOGODKI = [
  {
    naziv: "Tenis v belem",
    datum: "Vsako leto junija",
    opis: "Letos smo uspešno izpeljali že 5. Tenis v belem na travnatem igrišču pri Dvorcu Visoko — dan s kosilom, izločilnimi dvoboji in finalom v tradicionalni beli opravi z lesenimi loparji, v sodelovanju s Teniškim klubom Gorenja vas.",
    slika: "slike/tenis v belem main.png"
  },
  {
    naziv: "Poroke pod kozolcem",
    datum: "Vse leto",
    opis: "Skozi poletje na Visokem gostimo civilne poroke v poročnem paviljonu pred dvorcem in slavja v prenovljeni dvorani v štali.",
    slika: "slike/paviljon.jpeg"
  }
];

// === 3) POMOŽNE FUNKCIJE ===
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function defaultCupIconSVG() {
  return '<svg viewBox="0 0 48 48"><path d="M10 18h22v10a11 11 0 0 1-11 11 11 11 0 0 1-11-11z"/><path d="M32 20h4a5 5 0 0 1 0 10h-4"/></svg>';
}

// === 4) PREDLOGA (TEMPLATE) ZA KARTICO PONUDBE ===
function menuCardHTML(item) {
  const hasImg = item.slika && item.slika.trim() !== "";
  if (hasImg) {
    return `<article class="menu-card menu-card-image reveal is-visible">
      <img src="${escapeHTML(item.slika)}" alt="${escapeHTML(item.naziv)}">
      <div class="menu-card-body">
        <h3>${escapeHTML(item.naziv)}</h3>
        <p>${escapeHTML(item.opis)}</p>
      </div>
    </article>`;
  }
  return `<article class="menu-card reveal is-visible">
    <div class="menu-icon" aria-hidden="true">${defaultCupIconSVG()}</div>
    <h3>${escapeHTML(item.naziv)}</h3>
    <p>${escapeHTML(item.opis)}</p>
  </article>`;
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
async function renderPonudba(containerId) {
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
  el.innerHTML = items.map(menuCardHTML).join("");
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
