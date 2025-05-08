let map;

async function initMap() {
  if (map) return; // Empêche toute réinitialisation

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
    zoom: 12,
  });
}

window.addEventListener("DOMContentLoaded", initMap);

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
