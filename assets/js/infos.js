document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetchTerritories(),
    fetchStations(),
    fetchObservations(),
    fetchPrevisions(),
    fetchVNF()
  ]);
});

/* ——— VIGICRUES ——— */

// 1) Territoires de vigilance depuis le fichier local
async function fetchTerritories() {
  const c = document.getElementById("ter-data");
  try {
    const res = await fetch("assets/data/territoires.json");
    const json = await res.json();

    // On prend bien ListEntVigiCru
    const list = json.ListEntVigiCru || [];
    console.log("🔍 Liste territoires:", list);

    if (list.length === 0) {
      c.innerHTML = "<p>Aucun territoire trouvé.</p>";
      return;
    }

    c.innerHTML = `
      <ul class="crue-list">
        ${list
          .map(t => {
            // Pour debug : vérifie que t.LbEntVigiCru et t.CdEntVigiCru existent
            console.log("⚙️ Territoire:", t);
            return `<li>
                      <strong>${t.LbEntVigiCru}</strong>
                      (${t.CdEntVigiCru})
                    </li>`;
          })
          .join("")}
      </ul>`;
  } catch (err) {
    console.error(err);
    c.innerHTML = `<p class="error">Impossible de charger les territoires.</p>`;
  }
}


// 2) Stations de vigilance via l’API Hubeau (CORS OK)
async function fetchStations() {
  const c = document.getElementById("stations-data");
  try {
    // On prend les 5 premières stations Hubeau
    const res = await fetch(
      "https://hubeau.eaufrance.fr/api/v1/crue/station?size=5"
    );
    const json = await res.json();
    const list = json.data || [];
    if (list.length === 0) {
      c.innerHTML = "<p>Aucune station trouvée.</p>";
      return;
    }
    c.innerHTML = `
      <ul class="crue-list">
        ${list
          .map(
            s =>
              `<li><strong>${s.libelle_station}</strong> (${s.code_station})</li>`
          )
          .join("")}
      </ul>`;
  } catch (err) {
    console.error(err);
    c.innerHTML = `<p class="error">Impossible de charger les stations.</p>`;
  }
}



// 3) Observations réelles
async function fetchObservations() {
  const c = document.getElementById("obs-data");
  try {
    const res = await fetch(
      "https://hubeau.eaufrance.fr/api/v1/crue/station?code_station=H2010010&size=5"
    );
    const json = await res.json();
    const obs = json.data || [];
    if (!obs.length) {
      c.innerHTML = "<p>Aucune observation disponible.</p>";
      return;
    }
    c.innerHTML = `
      <ul class="crue-list">
        ${obs.map(o =>
          `<li>
             <strong>${o.libelle_station}</strong> :
             ${o.niveau} m
             <small>(${new Date(o.date_mesure).toLocaleString("fr-FR")})</small>
           </li>`
        ).join("")}
      </ul>`;
  } catch {
    c.innerHTML = `<p class="error">Impossible de charger les observations.</p>`;
  }
}

// 4) Prévisions
async function fetchPrevisions() {
  const c = document.getElementById("previsions-data");
  try {
    // change code_station et size selon ta station cible
    const res = await fetch(
      "https://hubeau.eaufrance.fr/api/v1/crue/prevision?code_station=H2010010&size=5"
    );
    const json = await res.json();
    const prev = json.data || [];
    if (!prev.length) {
      c.innerHTML = "<p>Aucune prévision disponible.</p>";
      return;
    }
    c.innerHTML = `
      <ul class="crue-list">
        ${prev.map(p =>
          `<li>
             <strong>${new Date(p.date_prevision).toLocaleString("fr-FR")}</strong> :
             ${p.niveau_prevu} m
           </li>`
        ).join("")}
      </ul>`;
  } catch {
    c.innerHTML = `<p class="error">Impossible de charger les prévisions.</p>`;
  }
}

/* ——— VNF (OpenDataSoft) ——— */

async function fetchVNF() {
  const c = document.getElementById("vnf-data");
  try {
    const base = 
      "https://data.opendatasoft.com/api/records/1.0/search/"+
      "?dataset=equipements-des-canaux-a-toulouse%40toulouse-metropole";
    const [eclusesRes, pontsRes] = await Promise.all([
      fetch(base + "&refine.type_ouvrage=Ecluse&rows=5"),
      fetch(base + "&refine.type_ouvrage=Pont&rows=5")
    ]);
    const [eJ, pJ] = await Promise.all([eclusesRes.json(), pontsRes.json()]);
    const ecluses = eJ.records || [], ponts = pJ.records || [];

    let html = "";

    html += "<h3>Écluses</h3>";
    html += ecluses.length
      ? `<ul class="vnf-list">${
          ecluses.map(r => {
            const f = r.fields;
            return `<li>
                      <strong>${f.nom_ouvrage || f.code_ouvrage || "—"}</strong>
                      ${f.commune_ouvrage ? "– " + f.commune_ouvrage : ""}
                    </li>`;
          }).join("")
        }</ul>`
      : "<p>Aucune écluse trouvée.</p>";

    html += "<h3>Ponts</h3>";
    html += ponts.length
      ? `<ul class="vnf-list">${
          ponts.map(r => {
            const f = r.fields;
            return `<li>
                      <strong>${f.nom_ouvrage || f.code_ouvrage || "—"}</strong>
                      ${f.commune_ouvrage ? "– " + f.commune_ouvrage : ""}
                    </li>`;
          }).join("")
        }</ul>`
      : "<p>Aucun pont trouvé.</p>";

    c.innerHTML = html;
  } catch {
    c.innerHTML = `<p class="error">Impossible de charger les données VNF.</p>`;
  }
}
