// == 1) Variables globales ==
let map;
let userMarker;
let lastCoords = null;
let isFollowing = false;

// Calques sous forme de tableaux de Markers
const portsLayer    = [];
const parkingsLayer = [];
const locksLayer    = [];

// == 2) Fonction initMap (callback Google) ==
function initMap() {
  // 2.1) Création de la map centrée initialement
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 48.5734, lng: 7.7521 },
    zoom: 13,
    disableDefaultUI: true
  });

  // 2.2) Bouton “Me centrer”
  document.getElementById('center-btn').addEventListener('click', centerOnMe);

  // 2.3) Boutons toggle calques
  document.getElementById('toggle-ports')   .addEventListener('click', () => toggleLayer(portsLayer,   map));
  document.getElementById('toggle-parkings').addEventListener('click', () => toggleLayer(parkingsLayer,map));
  document.getElementById('toggle-locks')   .addEventListener('click', () => toggleLayer(locksLayer,   map));

  // 2.4) Lancer la géoloc
  initGeolocation();

  // 2.5) Charger tes données métier (remplace par tes propres URL/objets)
  loadGeoJSON('data/ports.geojson',    portsLayer,    'icons/port.png');
  loadGeoJSON('data/parkings.geojson', parkingsLayer, 'icons/parking.png');
  loadGeoJSON('data/locks.geojson',    locksLayer,    'icons/lock.png');
}

// == 3) Géo de l’utilisateur ==
function initGeolocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    lastCoords = { lat: latitude, lng: longitude };
    userMarker = new google.maps.Marker({
      position: lastCoords,
      map, icon: 'icons/pin-red.png', title: 'Vous êtes ici'
    });
  }, err => console.warn(err), { enableHighAccuracy: true });
}

// == 4) Centre la carte ==
function centerOnMe() {
  if (!lastCoords) return alert('Position non dispo.');
  map.setCenter(lastCoords);
  map.setZoom(15);
  userMarker && userMarker.setMap(map);
  isFollowing = true;
  document.getElementById('center-btn').classList.add('active');
}

// == 5) Toggle d’un calque ==
function toggleLayer(layerArray, mapInstance) {
  const visible = layerArray.length && layerArray[0].getMap() !== null;
  layerArray.forEach(m => m.setMap(visible ? null : mapInstance));
  // optionnel : changer style du bouton
}

// == 6) Charger un GeoJSON en markers ==
function loadGeoJSON(url, layerArray, iconUrl) {
  fetch(url).then(r => r.json()).then(geojson => {
    geojson.features.forEach(f => {
      const [lng, lat] = f.geometry.coordinates;
      const m = new google.maps.Marker({
        position: { lat, lng },
        map: null,           // cache au chargement
        icon: iconUrl,
        title: f.properties.name || ''
      });
      layerArray.push(m);
    });
  });
}

// == 7) Expose initMap à Google ==
window.initMap = initMap;
