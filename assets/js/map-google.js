// == 0) Import Google Maps JS API Loader ==
import { Loader } from "https://unpkg.com/@googlemaps/js-api-loader@1.15.2/dist/index.esm.js";

// == 1) Variables globales ==
let map;
let userMarker;
let lastCoords = null;
let isFollowing = true;

const portsLayer = [];
const parkingsLayer = [];
const locksLayer = [];

let portsCluster, parkingsCluster, locksCluster;

// == 2) Initialisation de Google Maps ==
const loader = new Loader({
  apiKey: "AIzaSyD5j7Wnn9jvvqBUZMv2ianfTF1K3ui-h9M",
  version: "weekly",
  libraries: ["marker"]
});

loader.load().then(() => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 48.5734, lng: 7.7521 },
    zoom: 13,
    mapTypeId: 'roadmap',
    gestureHandling: 'greedy',
    clickableIcons: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    zoomControl: true,
    tilt: 0,
    styles: []
  });

  map.addListener("dragstart", () => { isFollowing = false; });

  window.addEventListener("resize", () => {
    google.maps.event.trigger(map, "resize");
  });

  document.getElementById('center-btn')?.addEventListener('click', () => {
    if (userMarker) {
      isFollowing = true;
      map.panTo(userMarker.position);
    }
  });

  document.getElementById('settings-btn')?.addEventListener('click', () => toggleCluster(portsCluster, portsLayer));
  document.getElementById('filter-btn')?.addEventListener('click', () => toggleCluster(parkingsCluster, parkingsLayer));
  document.getElementById('nearby-btn')?.addEventListener('click', () => toggleCluster(locksCluster, locksLayer));
  document.getElementById('favorites-btn')?.addEventListener('click', openPOIModal);

  initGeolocation();
  loadGeoJSON('data/ports.geojson', portsLayer, 'icons/port.png', 'ports');
  loadGeoJSON('data/parkings.geojson', parkingsLayer, 'icons/parking.png', 'parkings');
  loadGeoJSON('data/locks.geojson', locksLayer, 'icons/lock.png', 'locks');
}).catch(e => {
  console.error("Erreur de chargement Google Maps :", e);
});

// == 3) Géolocalisation ==
function initGeolocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(pos => {
    const { latitude, longitude } = pos.coords;
    lastCoords = { lat: latitude, lng: longitude };

    if (!userMarker) {
      const markerContent = document.createElement('div');
      markerContent.innerHTML = '<div style="width: 16px; height: 16px; background: #4285F4; border-radius: 50%; border: 2px solid white;"></div>';

      userMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: lastCoords,
        title: 'Vous êtes ici',
        content: markerContent
      });
    } else {
      userMarker.position = lastCoords;
    }

    if (isFollowing) {
      map.panTo(lastCoords);
    }
  }, err => {
    console.warn('Erreur géolocalisation :', err);
  }, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  });
}

// == 4) Recentrage ==
function centerOnMe() {
  if (!lastCoords) {
    alert('Position non disponible.');
    return;
  }
  map.panTo(lastCoords);
  map.setZoom(15);
  if (userMarker) userMarker.map = map;
  isFollowing = true;
  document.getElementById('center-btn')?.classList.add('active');
}

// == 5) Clustering toggle ==
function toggleCluster(clusterer, markers) {
  if (!clusterer) return;
  const visible = clusterer.getMarkers().length > 0;
  if (visible) {
    clusterer.clearMarkers();
  } else {
    clusterer.addMarkers(markers);
  }
}

// == 6) Charger GeoJSON ==
function loadGeoJSON(url, layerArray, iconUrl, name) {
  fetch(url)
    .then(r => r.json())
    .then(geojson => {
      const markers = geojson.features.map(f => {
        const [lng, lat] = f.geometry.coordinates;

        const content = document.createElement('div');
        content.innerHTML = `<img src="${iconUrl}" style="width: 24px;">`;

        return new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: f.properties.name || '',
          content: content
        });
      });

      layerArray.push(...markers);

      const clusterOpts = {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
      };

      if (name === 'ports') {
        portsCluster = new MarkerClusterer(map, layerArray, clusterOpts);
      } else if (name === 'parkings') {
        parkingsCluster = new MarkerClusterer(map, layerArray, clusterOpts);
      } else if (name === 'locks') {
        locksCluster = new MarkerClusterer(map, layerArray, clusterOpts);
      }
    })
    .catch(err => console.error(`Erreur chargement ${name}:`, err));
}

// == 7) Modale favoris ==
function openPOIModal() {
  document.getElementById("poi-modal")?.classList.remove("hidden");
}
function closePOIModal() {
  document.getElementById("poi-modal")?.classList.add("hidden");
}
function submitPOI() {
  // Ton code...
}
