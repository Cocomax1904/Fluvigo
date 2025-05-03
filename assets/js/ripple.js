// ripple.js

// Sélectionne tous les éléments avec la classe .btn
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Crée l’élément <span> qui servira d’onde
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    // Calcule la position du clic relative au bouton
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;

    // Ajoute l’onde au bouton et la supprime après animation
    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600); // Doit correspondre à la durée de l'animation CSS
  });
});
