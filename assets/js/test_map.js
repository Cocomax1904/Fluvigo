let map;

async function initMap() {
  // Empêche de réinitialiser la carte si elle est déjà créée
  if (map) return;

  map = new google.maps.Map(document.getElementById("map"), {
  center: { lat: 48.8566, lng: 2.3522 },
  zoom: 12,
  });

}

// Lance l'initialisation une fois que le DOM est prêt
window.addEventListener("DOMContentLoaded", initMap);

// Bouton de recentrage manuel
document.addEventListener("DOMContentLoaded", () => {
  const centerBtn = document.getElementById("center-btn");

  if (centerBtn) {
    centerBtn.addEventListener("click", () => {
      if (map) {
        map.setCenter({ lat: -34.397, lng: 150.644 }); // Peut être remplacé par la position actuelle de l’utilisateur
      }
    });
  }
});
