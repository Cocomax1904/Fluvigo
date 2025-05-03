// 1) Déclarations globales (en-tête du fichier)
let map;
let userMarker;
let lockMarkers = [];
let bridgeMarkers = [];
let selectedPhotos = [];      // Stocke les images choisies
let selectedLatLng = null;    // Position cliquée
let clickMarker = null;       // Marqueur de sélection

// 1bis) Fonction de compression côté client
function compressImage(dataUrl, maxW, maxH, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let [w, h] = [img.width, img.height];
    if (w > maxW) { h *= maxW / w; w = maxW; }
    if (h > maxH) { w *= maxH / h; h = maxH; }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL("image/jpeg", quality);
    callback(compressed);
  };
  img.src = dataUrl;
}

// 2) Icônes personnalisées
const lockIcon = L.icon({
  iconUrl: 'assets/img/lock.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
const bridgeIcon = L.icon({
  iconUrl: 'assets/img/bridge.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

document.addEventListener("DOMContentLoaded", () => {
  // 3) Initialisation de la carte
  map = L.map("map").setView([48.5734, 7.7521], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // 4) Clic utilisateur : poser un pin n'importe où
  map.on('click', e => {
    selectedLatLng = e.latlng;
    if (clickMarker) map.removeLayer(clickMarker);
    clickMarker = L.marker(selectedLatLng).addTo(map)
      .bindPopup("Point sélectionné")
      .openPopup();
  });

  // 5) Centrage si on vient d’un favori
  const target = JSON.parse(localStorage.getItem("goto"));
  if (target) {
    map.setView([target.lat, target.lng], 17);
    L.marker([target.lat, target.lng])
      .addTo(map)
      .bindPopup("Point ciblé")
      .openPopup();
    localStorage.removeItem("goto");
  }

  // 6) Géolocalisation utilisateur
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      userMarker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Vous êtes ici")
        .openPopup();
      map.setView([latitude, longitude], 15);
    });
  }

  // 7) Import de photos locales avec compression
  document.getElementById("poi-photos").addEventListener("change", function () {
    selectedPhotos = [];
    const preview = document.getElementById("photo-preview");
    preview.innerHTML = "";

    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        // compresse à 400×400 px, qualité 0.7
        compressImage(e.target.result, 400, 400, 0.7, compressed => {
          selectedPhotos.push(compressed);
          const img = document.createElement("img");
          img.src = compressed;
          preview.appendChild(img);
        });
      };
      reader.readAsDataURL(file);
    });
  });
});

// 8) Fonctions utilitaires

function centerOnMe() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (userMarker) userMarker.setLatLng([latitude, longitude]);
    else {
      userMarker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Vous êtes ici");
    }
    map.setView([latitude, longitude], 15);
  });
}

function toggleLocks() {
  if (lockMarkers.length === 0) {
    const locks = [[48.578, 7.75],[48.567, 7.76]];
    locks.forEach(coord => {
      const m = L.marker(coord, { icon: lockIcon })
        .addTo(map)
        .bindPopup("Écluse");
      lockMarkers.push(m);
    });
  } else {
    lockMarkers.forEach(m => map.removeLayer(m));
    lockMarkers = [];
  }
}

function toggleBridges() {
  if (bridgeMarkers.length === 0) {
    const bridges = [[48.574, 7.74],[48.57, 7.755]];
    bridges.forEach(coord => {
      const m = L.marker(coord, { icon: bridgeIcon })
        .addTo(map)
        .bindPopup("Pont");
      bridgeMarkers.push(m);
    });
  } else {
    bridgeMarkers.forEach(m => map.removeLayer(m));
    bridgeMarkers = [];
  }
}

function openPOIModal() {
  if (!selectedLatLng) {
    return alert("Cliquez sur la carte pour choisir un emplacement.");
  }
  document.getElementById("poi-modal").classList.remove("hidden");
}

function closePOIModal() {
  document.getElementById("poi-modal").classList.add("hidden");
}

function submitPOI() {
  if (!selectedLatLng) return alert("Position inconnue !");
  const latlng = selectedLatLng;

  const nom = document.getElementById("poi-nom").value.trim();
  const description = document.getElementById("poi-description").value.trim();
  if (!nom) return alert("Merci de donner un nom au point.");

  const poi = {
    lat: latlng.lat,
    lng: latlng.lng,
    nom,
    description,
    photos: selectedPhotos,
    date: new Date().toISOString()
  };

  const favoris = JSON.parse(localStorage.getItem("favoris")) || [];
  favoris.push(poi);
  localStorage.setItem("favoris", JSON.stringify(favoris));

  alert("Favori enregistré !");
  closePOIModal();
  if (clickMarker) map.removeLayer(clickMarker);
  selectedLatLng = null;
  clickMarker = null;
  document.getElementById("poi-nom").value = "";
  document.getElementById("poi-description").value = "";
  document.getElementById("poi-photos").value = "";
  document.getElementById("photo-preview").innerHTML = "";
  selectedPhotos = [];
}
