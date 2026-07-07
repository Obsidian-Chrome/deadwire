// Navigation dynamique du système
(() => {
  const initSystemNav = () => {
    const navButtons = document.querySelectorAll('[data-section]');
    const sections = document.querySelectorAll('[data-content]');
    const copyButtons = document.querySelectorAll('[data-copy]');
    const internalLinks = document.querySelectorAll('.system-link[data-section]');

    if (!navButtons.length || !sections.length) {
      setTimeout(initSystemNav, 100);
      return;
    }

    // Fonction pour changer de section
    const changeSection = (targetSection, shouldScroll = false) => {
      // Mettre à jour les boutons actifs
      navButtons.forEach(btn => btn.classList.remove('is-active'));
      const targetButton = Array.from(navButtons).find(btn => btn.dataset.section === targetSection);
      if (targetButton) {
        targetButton.classList.add('is-active');
      }

      // Afficher la section correspondante
      sections.forEach(section => {
        if (section.dataset.content === targetSection) {
          section.classList.add('is-active');
        } else {
          section.classList.remove('is-active');
        }
      });

      // Scroll vers le haut si demandé
      if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Navigation entre sections (sidebar)
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        changeSection(button.dataset.section);
      });
    });

    // Liens internes dans le contenu
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        changeSection(link.dataset.section, true); // Scroll activé pour les liens
      });
    });

    // Boutons de copie
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const inputId = button.dataset.copy;
        const input = document.getElementById(inputId);
        
        if (input) {
          input.select();
          input.setSelectionRange(0, 99999); // Mobile
          
          navigator.clipboard.writeText(input.value).then(() => {
            const icon = button.querySelector('i');
            const originalClass = icon.className;
            
            // Feedback visuel
            icon.className = 'fa-solid fa-check';
            button.style.color = '#00ff88';
            
            setTimeout(() => {
              icon.className = originalClass;
              button.style.color = '';
            }, 2000);
          }).catch(err => {
            console.error('Erreur copie:', err);
          });
        }
      });
    });

    console.log('System navigation initialized');
  };

  // Démarrer
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSystemNav);
  } else {
    initSystemNav();
  }
})();
