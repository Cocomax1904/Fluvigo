// assets/js/favoris.js

// 1) Au chargement, on installe le listener de tri et on affiche
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sort-select")
          .addEventListener("change", renderFavorites);
  renderFavorites();
});

// 2) Cette fonction fait tout le boulot : tri, affichage, cartes, carrousel, suppression
function renderFavorites() {
  const list = document.getElementById("favorites-list");
  let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

  // Tri selon le menu déroulant
  switch (document.getElementById("sort-select").value) {
    case "date-asc":
      favoris.sort((a,b) => new Date(a.date) - new Date(b.date));
      break;
    case "date-desc":
      favoris.sort((a,b) => new Date(b.date) - new Date(a.date));
      break;
    case "name-asc":
      favoris.sort((a,b) => a.nom.localeCompare(b.nom));
      break;
    case "name-desc":
      favoris.sort((a,b) => b.nom.localeCompare(a.nom));
      break;
  }

  // On vide la liste avant de réafficher
  list.innerHTML = "";
  if (favoris.length === 0) {
    list.innerHTML = "<p>Aucun favori enregistré pour le moment.</p>";
    return;
  }

  // Boucle d’affichage
  favoris.forEach((poi, index) => {
    const mapId = `mini-map-${index}`;
    const item = document.createElement("li");
    item.classList.add("favori");

    item.innerHTML = `
      <h4>${poi.nom || "Point sans nom"}</h4>
      <p class="coords">${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}</p>
      ${poi.description ? `<p>${poi.description}</p>` : ""}
      <div class="favori-horizontal">
        <div id="${mapId}" class="favori-map"></div>
        ${poi.photos && poi.photos.length > 0
          ? `<div class="favori-carousel">
              ${poi.photos.map(src => {
                // si c’est une vidéo
                if (/^data:video|\.mp4$|\.webm$/i.test(src)) {
                  return `<div class="media-box">
                            <video src="${src}" controls></video>
                          </div>`;
                }
                return `<div class="media-box">
                          <img src="${src}" alt="Photo">
                        </div>`;
              }).join("")}
             </div>`
          : ""
        }
      </div>
      <small>Ajouté le ${new Date(poi.date).toLocaleString("fr-FR")}</small>
      <button onclick="goToPOI(${poi.lat}, ${poi.lng})">Afficher sur la carte</button>
      <button class="delete" onclick="deleteFavorite(${index})">Supprimer</button>
    `;

    list.appendChild(item);

    // Initialisation de la mini-carte
    requestAnimationFrame(() => {
      const container = document.getElementById(mapId);
      if (!container) return;
      const miniMap = L.map(mapId, {
        center: [poi.lat, poi.lng],
        zoom: 12,
        dragging: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false
      });
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "" }
      ).addTo(miniMap);
      L.marker([poi.lat, poi.lng]).addTo(miniMap);
    });
  });
}

// 3) Supprimer un favori
function deleteFavorite(index) {
  const favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  favoris.splice(index, 1);
  localStorage.setItem("favoris", JSON.stringify(favoris));
  renderFavorites();
}

// 4) Centrer sur la carte principale
function goToPOI(lat, lng) {
  localStorage.setItem("goto", JSON.stringify({ lat, lng }));
  window.location.href = "carte.html";
}
