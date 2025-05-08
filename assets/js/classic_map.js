let map;

function initMap() {
  // Initialisation de la carte centrée sur Paris
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.8566, lng: 2.3522 },
    zoom: 12,
  });

  // Préchargement de tuiles de Paris à différents niveaux de zoom
  preloadParisTiles();
}

function preloadParisTiles() {
  const center = { lat: 48.8566, lng: 2.3522 };
  const zoomLevels = [12, 14, 16];

  let i = 0;

  const nextZoom = () => {
    if (i < zoomLevels.length) {
      map.setZoom(zoomLevels[i]);
      map.setCenter(center);
      i++;
      setTimeout(nextZoom, 500); // petit délai pour charger les tuiles
    } else {
      map.setZoom(12); // revenir au zoom par défaut
    }
  };

  nextZoom();
}

// Gestion du bouton "me centrer"
document.addEventListener("DOMContentLoaded", () => {
  const centerBtn = document.getElementById("center-btn");

  if (centerBtn) {
    centerBtn.addEventListener("click", () => {
      if (!map) return;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(userPos);
            // Ajouter un marqueur optionnel :
            new google.maps.Marker({
              position: userPos,
              map: map,
              title: "Vous êtes ici",
            });
          },
          () => {
            alert("Impossible de récupérer votre position.");
          }
        );
      } else {
        alert("Géolocalisation non supportée.");
      }
    });
  }
});
