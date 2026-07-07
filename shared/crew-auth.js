// Script pour gérer l'authentification Crew depuis la navbar
(function() {
  // Charger auth.js immédiatement
  const authScript = document.createElement('script');
  authScript.src = '/crew/auth.js';
  document.head.appendChild(authScript);

  // Fonction pour initialiser l'auth
  async function initAuth() {
    const navAuth = document.querySelector('.nav__auth');
    if (!navAuth) {
      setTimeout(initAuth, 25); // Réduit à 25ms pour plus de réactivité
      return;
    }

    // Vérifier si l'utilisateur est connecté (depuis localStorage d'abord pour plus de rapidité)
    const cachedUser = localStorage.getItem('discord_user');
    const cachedToken = localStorage.getItem('discord_token');
    const cachedExpiry = localStorage.getItem('discord_token_expiry');
    
    // Affichage rapide basé sur le cache
    if (cachedUser && cachedToken && cachedExpiry && Date.now() < parseInt(cachedExpiry)) {
      const user = JSON.parse(cachedUser);
      const isMember = localStorage.getItem('discord_is_member') === 'true';
      const isGM = localStorage.getItem('discord_is_gm') === 'true';
      
      const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
        : '/media/Deadwire_Logo_Neon.png';

      navAuth.innerHTML = `
        <div class="nav__user">
          <img src="${avatarUrl}" alt="${user.username}" class="nav__avatar" />
          <span class="nav__username">${user.username}</span>
          ${isMember || isGM ? `<a href="/crew" class="nav__link nav__link--crew-access"><i class="fa-solid fa-users-gear"></i></a>` : ''}
          <button class="nav__logout" title="Se déconnecter"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      `;

      // Gérer la déconnexion
      const logoutBtn = navAuth.querySelector('.nav__logout');
      logoutBtn.addEventListener('click', function() {
        if (window.discordAuth) {
          window.discordAuth.logout();
        } else {
          localStorage.clear();
        }
        window.location.reload();
      });
      
      // Vérifier en arrière-plan si la session est toujours valide
      if (window.discordAuth) {
        window.discordAuth.restoreSession().then(isValid => {
          if (!isValid) {
            window.location.reload();
          }
        });
      }
    } else {
      // Pas de cache ou expiré - afficher le bouton login immédiatement
      navAuth.innerHTML = `
        <a class="nav__link nav__link--crew" href="#" data-crew-login aria-label="Se connecter avec Discord">
          <i class="fa-solid fa-user-lock" aria-hidden="true"></i>
        </a>
      `;

      // Gérer le clic sur le bouton login
      const loginBtn = navAuth.querySelector('[data-crew-login]');
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.discordAuth) {
          window.location.href = window.discordAuth.getAuthUrl();
        }
      });
      
      // Vérifier en arrière-plan avec auth.js
      if (window.discordAuth) {
        const isAuthenticated = await window.discordAuth.restoreSession();

        if (isAuthenticated) {
          // Mettre à jour avec les vraies données
          const user = window.discordAuth.user;
          const isMember = window.discordAuth.isMember;
          const isGM = window.discordAuth.isGM;

          const avatarUrl = user.avatar 
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
            : '/media/Deadwire_Logo_Neon.png';

          navAuth.innerHTML = `
            <div class="nav__user">
              <img src="${avatarUrl}" alt="${user.username}" class="nav__avatar" />
              <span class="nav__username">${user.username}</span>
              ${isMember || isGM ? `<a href="/crew" class="nav__link nav__link--crew-access"><i class="fa-solid fa-users-gear"></i></a>` : ''}
              <button class="nav__logout" title="Se déconnecter"><i class="fa-solid fa-right-from-bracket"></i></button>
            </div>
          `;

          // Gérer la déconnexion
          const logoutBtn = navAuth.querySelector('.nav__logout');
          logoutBtn.addEventListener('click', function() {
            window.discordAuth.logout();
            window.location.reload();
          });
        }
      }
    }
  }

  // Démarrer l'initialisation immédiatement
  initAuth();
})();
