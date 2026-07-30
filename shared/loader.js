// Chargeur de composants partagés (navbar et footer)
(async function() {
  async function loadComponent(url, targetSelector) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      const html = await response.text();
      
      if (targetSelector === 'prepend') {
        document.body.insertAdjacentHTML('afterbegin', html);
      } else if (targetSelector === 'append') {
        document.body.insertAdjacentHTML('beforeend', html);
      }
    } catch (error) {
      console.error('Error loading component:', error);
    }
  }

  // Charger navbar et footer
  await loadComponent('/shared/navbar.html', 'prepend');
  await loadComponent('/shared/footer.html', 'append');
  
  // Déclencher un événement pour signaler que les composants sont chargés
  document.dispatchEvent(new Event('componentsLoaded'));
})();
