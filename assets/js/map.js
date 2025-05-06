// 1) Déclarations globales
let map;
let userMarker;
let clickMarker = null;
let selectedPhotos = [];
let selectedLatLng = null;

let isFollowing = false;  // mode « suivi » activé ?
let lastCoords = null;    // dernière position connue
let watchId = null;

// 1bis) Fonction de compression (inchangée)
function compressImage(dataUrl, maxW, maxH, quality, callback) {
  const img = new Image();
  img.onload = () => {
    let [w, h] = [img.width, img.height];
    if (w > maxW) { h *= maxW / w; w = maxW; }
    if (h > maxH) { w *= maxH / h; h = maxH; }
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL("image/jpeg", quality));
  };
  img.src = dataUrl;
}

// 2) Icônes
const userIcon = L.icon({
  iconUrl: 'assets/img/pin-red.png',
  iconSize:    [50, 50],
  iconAnchor:  [25, 40],
  popupAnchor: [0, -50]
});
const clickIcon = L.icon({
  iconUrl: 'assets/img/pin-red.png',
  iconSize:    [50, 50],
  iconAnchor:  [25, 40],
  popupAnchor: [0, -50]
});

// 3) Initialisation géoloc avec mémorisation
async function initGeolocation() {
  if (!navigator.geolocation) return;

  // Détermination du state de permission
  let permState = 'prompt';
  if (navigator.permissions) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      permState = status.state; // 'granted'|'prompt'|'denied'
    } catch {
      // Permissions API dispo mais query échoue
      permState = localStorage.getItem('geoAsked') ? 'granted' : 'prompt';
    }
  } else {
    // Pas d'API Permissions → on se fie à notre drapeau
    permState = localStorage.getItem('geoAsked') ? 'granted' : 'prompt';
  }

  if (permState === 'prompt') {
    // Première fois : on marque qu'on a demandé et on appelle getCurrentPosition
    localStorage.setItem('geoAsked', 'true');
    navigator.geolocation.getCurrentPosition(
      pos => {
        onPositionUpdate(pos.coords);
        startWatch();
      },
      err => console.warn("Géoloc initiale refusée ou erreur :", err.message),
      { enableHighAccuracy: true }
    );
  }
  else if (permState === 'granted') {
    // Déjà accordée → on démarre directement le watch sans popup
    startWatch();
  }
  else {
    // Refusée → on n'y revient pas
    console.warn("Géolocalisation refusée, suivi désactivé.");
  }
}

function startWatch() {
  watchId = navigator.geolocation.watchPosition(
    pos => onPositionUpdate(pos.coords),
    err => console.warn("watchPosition erreur :", err.message),
    { enableHighAccuracy: true, maximumAge: 0 }
  );
}

function onPositionUpdate({ latitude, longitude }) {
  const coords = [latitude, longitude];
  lastCoords = coords;

  if (userMarker) {
    userMarker.setLatLng(coords);
  } else {
    userMarker = L.marker(coords, { icon: userIcon })
      .addTo(map)
      .bindPopup("Vous êtes ici");
  }

  if (isFollowing) {
    map.setView(coords, map.getZoom(), { animate: true });
    userMarker.openPopup();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 4) Initialisation de la carte
  map = L.map("map").setView([48.5734,7.7521], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // 5) Clic utilisateur : pin sélectionné
  map.on('click', e => {
    selectedLatLng = e.latlng;
    if (clickMarker) map.removeLayer(clickMarker);
    clickMarker = L.marker(selectedLatLng, { icon: clickIcon })
      .addTo(map)
      .bindPopup("Point sélectionné")
      .openPopup();
  });

  // 6) Centrage si on vient d’un favori
  const target = JSON.parse(localStorage.getItem("goto"));
  if (target) {
    map.setView([target.lat,target.lng],17);
    L.marker([target.lat,target.lng])
      .addTo(map)
      .bindPopup("Point ciblé")
      .openPopup();
    localStorage.removeItem("goto");
  }

  // 7) Import de photos locales
  document.getElementById("poi-photos").addEventListener("change", function(){
    selectedPhotos = [];
    const preview = document.getElementById("photo-preview");
    preview.innerHTML = "";
    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => compressImage(e.target.result,400,400,0.7(res=>{
        selectedPhotos.push(res);
        const img = document.createElement("img");
        img.src = res; preview.appendChild(img);
      }));
      reader.readAsDataURL(file);
    });
  });

  // 8) Désactive le suivi dès qu’on bouge la carte
  map.on('movestart', () => {
    if(isFollowing){
      isFollowing = false;
      document.getElementById('center-btn')?.classList.remove('active');
    }
  });

  // 9) On lance la géoloc une fois
  initGeolocation();
});

// 10) Bouton « Me centrer »
function centerOnMe() {
  if (!lastCoords) {
    return alert("Position non disponible pour le moment.");
  }
  // Recentrage unique au zoom 15
  map.setView(lastCoords, 15);
  userMarker?.openPopup();

  // Activation du suivi continu
  isFollowing = true;
  document.getElementById('center-btn')?.classList.add('active');
}

// 11) Stubs
function openMapSettings(){ console.log("Settings"); }
function openFilter(){ console.log("Filter"); }
function openNearbyList(){ console.log("Nearby"); }

// 12) Modal Favoris
function openPOIModal(){
  if(!selectedLatLng) return alert("Cliquez sur la carte.");
  document.getElementById("poi-modal").classList.remove("hidden");
}
function closePOIModal(){
  document.getElementById("poi-modal").classList.add("hidden");
}
function submitPOI(){
  if(!selectedLatLng) return alert("Position inconnue.");
  const latlng = selectedLatLng;
  const nom = document.getElementById("poi-nom").value.trim();
  if(!nom) return alert("Donnez un nom.");
  const description = document.getElementById("poi-description").value.trim();
  const poi = {
    lat: latlng.lat,
    lng: latlng.lng,
    nom,
    description,
    photos: selectedPhotos,
    date: new Date().toISOString()
  };
  const favoris = JSON.parse(localStorage.getItem("favoris"))||[];
  favoris.push(poi);
  localStorage.setItem("favoris",JSON.stringify(favoris));
  alert("Favori enregistré !");
  closePOIModal();
  if(clickMarker) map.removeLayer(clickMarker);
  selectedLatLng = null;
  clickMarker = null;
  selectedPhotos = [];
  document.getElementById("poi-nom").value = "";
  document.getElementById("poi-description").value = "";
  document.getElementById("poi-photos").value = "";
  document.getElementById("photo-preview").innerHTML = "";
}
