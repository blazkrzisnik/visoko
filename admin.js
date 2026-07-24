/* =========================================================================
   KAVARNA VISOKO — admin.js
   Prijava (Firebase Auth) + urejanje ponudbe in dogodkov (Firestore).
   Deluje samo, če je FIREBASE_CONFIG v data.js pravilno nastavljen.
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

document.addEventListener("DOMContentLoaded", () => {
  if (!initFirebase()) {
    showLoginError("Firebase še ni nastavljen v data.js — glej NAVODILA-ADMIN.md.");
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      loginScreen.hidden = true;
      adminScreen.hidden = false;
      loadPonudbaList();
      loadDogodkiList();
    } else {
      loginScreen.hidden = false;
      adminScreen.hidden = true;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    loginStatus.hidden = false;
    loginStatus.textContent = "Prijavljam …";
    loginStatus.className = "admin-status";
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      loginStatus.hidden = true;
    } catch (err) {
      showLoginError("Napačen e-naslov ali geslo.");
    }
  });

  logoutBtn.addEventListener("click", () => firebase.auth().signOut());

  document.getElementById("ponudbaForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const naziv = document.getElementById("pNaziv").value.trim();
    const opis = document.getElementById("pOpis").value.trim();
    const slika = document.getElementById("pSlika").value.trim();
    if (!naziv || !opis) return;
    await fbDb.collection("ponudba").add({
      naziv, opis, slika,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    e.target.reset();
    loadPonudbaList();
  });

  document.getElementById("dogodekForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const naziv = document.getElementById("dNaziv").value.trim();
    const datum = document.getElementById("dDatum").value.trim();
    const opis = document.getElementById("dOpis").value.trim();
    const slika = document.getElementById("dSlika").value.trim();
    if (!naziv || !opis) return;
    await fbDb.collection("dogodki").add({
      naziv, datum, opis, slika,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    e.target.reset();
    loadDogodkiList();
  });
});

async function loadPonudbaList() {
  const el = document.getElementById("ponudbaList");
  el.innerHTML = '<p class="admin-list-empty">Nalagam …</p>';
  const snap = await fbDb.collection("ponudba").orderBy("createdAt", "asc").get();
  if (snap.empty) {
    el.innerHTML = '<p class="admin-list-empty">Ni še nobene postavke — dodajte prvo zgoraj.</p>';
    return;
  }
  el.innerHTML = "";
  snap.forEach(doc => {
    const d = doc.data();
    el.appendChild(adminListRow(d.naziv, d.opis, doc.id, "ponudba"));
  });
}

async function loadDogodkiList() {
  const el = document.getElementById("dogodkiList");
  el.innerHTML = '<p class="admin-list-empty">Nalagam …</p>';
  const snap = await fbDb.collection("dogodki").orderBy("createdAt", "asc").get();
  if (snap.empty) {
    el.innerHTML = '<p class="admin-list-empty">Ni še nobenega dogodka — dodajte prvega zgoraj.</p>';
    return;
  }
  el.innerHTML = "";
  snap.forEach(doc => {
    const d = doc.data();
    const label = d.datum ? `${d.naziv} — ${d.datum}` : d.naziv;
    el.appendChild(adminListRow(label, d.opis, doc.id, "dogodki"));
  });
}

function adminListRow(title, desc, docId, collection) {
  const row = document.createElement("div");
  row.className = "admin-list-row";
  row.innerHTML = `
    <div class="admin-list-text">
      <strong>${escapeHTML(title)}</strong>
      <span>${escapeHTML(desc)}</span>
    </div>
    <button class="admin-delete-btn" title="Izbriši">Izbriši</button>
  `;
  row.querySelector(".admin-delete-btn").addEventListener("click", async () => {
    if (!confirm(`Izbrišem "${title}"?`)) return;
    await fbDb.collection(collection).doc(docId).delete();
    if (collection === "ponudba") loadPonudbaList(); else loadDogodkiList();
  });
  return row;
}
