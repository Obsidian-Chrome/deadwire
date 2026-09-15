/**
 * Protection GM pour le dossier system-v1
 * Redirige vers /crew si l'utilisateur n'est pas GM
 */
(function() {
  'use strict';

  let hasChecked = false;

  // Vérifier si l'utilisateur est GM
  async function checkGMAccess() {
    // Attendre que auth.js soit chargé
    if (!window.discordAuth) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.discordAuth) {
            clearInterval(checkInterval);
            resolve(performCheck());
          }
        }, 50);
      });
    }
    
    return performCheck();
  }

  async function performCheck() {
    if (hasChecked) return true;
    hasChecked = true;
    
    // Restaurer la session
    const isAuthenticated = await window.discordAuth.restoreSession();
    
    if (!isAuthenticated) {
      window.location.href = '/crew';
      return false;
    }
    
    // Vérifier le rôle GM
    const isGM = window.discordAuth.isGM;
    
    if (!isGM) {
      window.location.href = '/crew';
      return false;
    }
    
    // Accès autorisé
    document.documentElement.style.visibility = 'visible';
    return true;
  }

  // Vérifier dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkGMAccess);
  } else {
    checkGMAccess();
  }
})();
