document.addEventListener("DOMContentLoaded", () => {
  console.log("🔧 main.js chargé");
  const btn      = document.getElementById("burger-button");
  const menu     = document.getElementById("side-menu");
  const closeBtn = document.getElementById("menu-close");
  const overlay  = document.getElementById("menu-overlay");

  // Préloader de l'image de fond
  const img = new Image();
  img.src = 'assets/img/fond.png';
  img.onload = () => {
    const loader = document.getElementById('hero-loader');
    if (loader) loader.classList.add('hidden');
  };

  console.log({ btn, menu, closeBtn, overlay });
  if (!btn || !menu || !closeBtn || !overlay) {
    console.warn("⚠️ Burger : éléments introuvables");
    return;
  }

  const openMenu = () => {
    menu.classList.remove("hidden");
    menu.classList.add("open");
    overlay.classList.remove("hidden");
  };
  const closeMenu = () => {
    menu.classList.remove("open");
    overlay.classList.add("hidden");
    setTimeout(() => menu.classList.add("hidden"), 300);
  };

  btn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);
});

// === Point 5 PWA: enregistrement du Service Worker ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('✅ Service Worker enregistré avec succès :', reg.scope))
      .catch(err => console.error('❌ Échec de l’enregistrement du SW :', err));
  });
}
