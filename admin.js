/* =========================================================================
   KAVARNA VISOKO — admin.js
   Prijava (Supabase Auth) + urejanje ponudbe (cena, kategorija, hišna
   posebnost) in dogodkov (Supabase baza).
   Deluje samo, če je SUPABASE_URL / SUPABASE_ANON_KEY v data.js pravilno
   nastavljen.
   ========================================================================= */

const loginScreen = document.getElementById("loginScreen");
const adminScreen = document.getElementById("adminScreen");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const logoutBtn = document.getElementById("logoutBtn");

function showLoginError(msg) {
  loginStatus.hidden = false;
  loginStatus.textContent = msg;
  loginStatus.className = "admin-status admin-status-error";
}

async function refreshAuthUI() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    loginScreen.hidden = true;
    adminScreen.hidden = false;
    loadPonudbaList();
    loadDogodkiList();
  } else {
    loginScreen.hidden = false;
    adminScreen.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!initSupabase()) {
    showLoginError("Supabase še ni nastavljen v data.js – glej NAVODILA-ADMIN.md.");
    return;
  }

  refreshAuthUI();
  sb.auth.onAuthStateChange(() => refreshAuthUI());

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    loginStatus.hidden = false;
    loginStatus.textContent = "Prijavljam …";
    loginStatus.className = "admin-status";
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      showLoginError("Napačen e-naslov ali geslo.");
    } else {
      loginStatus.hidden = true;
    }
  });

  logoutBtn.addEventListener("click", () => sb.auth.signOut());

  document.getElementById("pSlika").addEventListener("change", (e) => {
    const name = e.target.files[0] ? e.target.files[0].name : "Ni izbrane slike";
    document.getElementById("pSlikaName").textContent = name;
  });
  document.getElementById("dSlika").addEventListener("change", (e) => {
    const name = e.target.files[0] ? e.target.files[0].name : "Ni izbrane slike";
    document.getElementById("dSlikaName").textContent = name;
  });

  document.getElementById("ponudbaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("pSubmit");
    const id = document.getElementById("pId").value;
    const naziv = document.getElementById("pNaziv").value.trim();
    const opis = document.getElementById("pOpis").value.trim();
    const cena = document.getElementById("pCena").value.trim();
    const kategorija = document.getElementById("pKategorija").value;
    const posebnost = document.getElementById("pPosebnost").checked;
    const file = document.getElementById("pSlika").files[0];
    const slikaURL = document.getElementById("pSlikaURL").value.trim();
    if (!naziv || !opis) return;

    submitBtn.disabled = true;
    submitBtn.textContent = id ? "Shranjujem …" : "Dodajam …";
    try {
      const slika = file ? await uploadSlika(file) : slikaURL;
      const row = { naziv, opis, cena, kategorija, posebnost, slika };
      const { error } = id
        ? await sb.from("ponudba").update(row).eq("id", id)
        : await sb.from("ponudba").insert(row);
      if (error) throw error;
      resetPonudbaForm();
      loadPonudbaList();
    } catch (err) {
      alert("Napaka pri shranjevanju: " + err.message +
        (/column/i.test(err.message) ? "\n\nV tabeli ponudba manjkajo novi stolpci – glej NAVODILA-ADMIN.md, korak 2." : ""));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = document.getElementById("pId").value ? "Shrani spremembe" : "Dodaj v ponudbo";
    }
  });

  document.getElementById("pCancel").addEventListener("click", resetPonudbaForm);

  document.getElementById("dogodekForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const naziv = document.getElementById("dNaziv").value.trim();
    const datum = document.getElementById("dDatum").value.trim();
    const opis = document.getElementById("dOpis").value.trim();
    const file = document.getElementById("dSlika").files[0];
    const slikaURL = document.getElementById("dSlikaURL").value.trim();
    if (!naziv || !opis) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Dodajam …";
    try {
      const slika = file ? await uploadSlika(file) : slikaURL;
      const { error } = await sb.from("dogodki").insert({ naziv, datum, opis, slika });
      if (error) throw error;
      e.target.reset();
      document.getElementById("dSlikaName").textContent = "Ni izbrane slike";
      loadDogodkiList();
    } catch (err) {
      alert("Napaka pri dodajanju: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Dodaj dogodek";
    }
  });
});

// naloži izbrano sliko v Supabase Storage (bucket "slike") in vrni javno povezavo
async function uploadSlika(file) {
  const cleanName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const path = `${Date.now()}-${cleanName}`;
  const { error: uploadError } = await sb.storage.from("slike").upload(path, file);
  if (uploadError) throw uploadError;
  const { data } = sb.storage.from("slike").getPublicUrl(path);
  return data.publicUrl;
}

let ponudbaRows = [];

function resetPonudbaForm() {
  const form = document.getElementById("ponudbaForm");
  form.reset();
  document.getElementById("pId").value = "";
  document.getElementById("pSlikaName").textContent = "Ni izbrane slike";
  document.getElementById("pSubmit").textContent = "Dodaj v ponudbo";
  document.getElementById("pCancel").hidden = true;
}

function editPonudba(row) {
  document.getElementById("pId").value = row.id;
  document.getElementById("pNaziv").value = row.naziv || "";
  document.getElementById("pOpis").value = row.opis || "";
  document.getElementById("pCena").value = row.cena || "";
  document.getElementById("pKategorija").value = KATEGORIJE_PONUDBE.includes(row.kategorija) ? row.kategorija : KATEGORIJE_PONUDBE[0];
  document.getElementById("pPosebnost").checked = isPosebnost(row);
  document.getElementById("pSlikaURL").value = row.slika || "";
  document.getElementById("pSubmit").textContent = "Shrani spremembe";
  document.getElementById("pCancel").hidden = false;
  document.getElementById("ponudbaForm").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadPonudbaList() {
  const el = document.getElementById("ponudbaList");
  el.innerHTML = '<p class="admin-list-empty">Nalagam …</p>';
  const { data, error } = await sb.from("ponudba").select("*").order("created_at", { ascending: true });
  if (error) {
    el.innerHTML = `<p class="admin-list-empty">Napaka pri nalaganju: ${escapeHTML(error.message)}</p>`;
    return;
  }
  if (!data || !data.length) {
    el.innerHTML = '<p class="admin-list-empty">Ni še nobene postavke – dodajte prvo zgoraj.</p>';
    return;
  }
  ponudbaRows = data;
  el.innerHTML = "";
  data.forEach(row => {
    const parts = [row.naziv, row.cena, row.kategorija].filter(Boolean);
    const label = (isPosebnost(row) ? "★ " : "") + parts.join(" · ");
    el.appendChild(adminListRow(label, row.opis, row.id, "ponudba", () => editPonudba(row)));
  });
}

async function loadDogodkiList() {
  const el = document.getElementById("dogodkiList");
  el.innerHTML = '<p class="admin-list-empty">Nalagam …</p>';
  const { data, error } = await sb.from("dogodki").select("*").order("created_at", { ascending: true });
  if (error) {
    el.innerHTML = `<p class="admin-list-empty">Napaka pri nalaganju: ${escapeHTML(error.message)}</p>`;
    return;
  }
  if (!data || !data.length) {
    el.innerHTML = '<p class="admin-list-empty">Ni še nobenega dogodka – dodajte prvega zgoraj.</p>';
    return;
  }
  el.innerHTML = "";
  data.forEach(row => {
    const label = row.datum ? `${row.naziv} – ${row.datum}` : row.naziv;
    el.appendChild(adminListRow(label, row.opis, row.id, "dogodki"));
  });
}

function adminListRow(title, desc, rowId, table, onEdit) {
  const row = document.createElement("div");
  row.className = "admin-list-row";
  row.innerHTML = `
    <div class="admin-list-text">
      <strong>${escapeHTML(title)}</strong>
      <span>${escapeHTML(desc)}</span>
    </div>
    <div class="admin-list-actions">
      ${onEdit ? '<button class="admin-edit-btn" title="Uredi">Uredi</button>' : ""}
      <button class="admin-delete-btn" title="Izbriši">Izbriši</button>
    </div>
  `;
  if (onEdit) row.querySelector(".admin-edit-btn").addEventListener("click", onEdit);
  row.querySelector(".admin-delete-btn").addEventListener("click", async () => {
    if (!confirm(`Želite izbrisati »${title}«?`)) return;
    const { error } = await sb.from(table).delete().eq("id", rowId);
    if (error) { alert("Napaka pri brisanju: " + error.message); return; }
    if (table === "ponudba") loadPonudbaList(); else loadDogodkiList();
  });
  return row;
}
