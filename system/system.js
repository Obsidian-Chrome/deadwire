document.addEventListener('DOMContentLoaded', async () => {
  const authGate = document.querySelector('[data-auth-gate]');
  const systemContent = document.querySelector('[data-system-content]');
  const userInfo = document.querySelector('[data-user-info]');
  const userAvatar = document.querySelector('[data-user-avatar]');
  const userName = document.querySelector('[data-user-name]');
  const loginBtn = document.querySelector('[data-discord-login]');
  const logoutBtn = document.querySelector('[data-logout]');
  const gmOnlyBtn = document.querySelector('[data-gm-only]');

  const tabButtons = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');

  // Initialiser Supabase
  if (typeof window.initSupabase === 'function') {
    window.initSupabase();
  }

  async function checkAuth() {
    const isAuthenticated = await window.discordAuth.restoreSession();
    
    if (isAuthenticated) {
      showAuthenticatedView();
    } else {
      showAuthGate();
    }
  }

  function showAuthGate() {
    if (authGate) authGate.style.display = 'flex';
    if (systemContent) systemContent.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
  }

  function showAuthenticatedView() {
    if (authGate) authGate.style.display = 'none';
    if (systemContent) systemContent.style.display = 'block';
    if (userInfo) userInfo.style.display = 'flex';

    const user = window.discordAuth.user;
    if (userName) userName.textContent = user.username;
    if (userAvatar) userAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    // Afficher les éléments réservés aux GM sur toutes les pages
    const gmOnlyElements = document.querySelectorAll('[data-gm-only]');
    gmOnlyElements.forEach(el => {
      if (window.discordAuth.isGM) {
        el.style.display = el.tagName === 'A' ? 'block' : 'flex';
      } else {
        el.style.display = 'none';
      }
    });

    // Charger les personnages uniquement sur la page characters
    const characterList = document.querySelector('[data-character-list]');
    if (characterList) {
      loadCharacters();
    }

    // Charger tous les personnages si on est sur la page GM
    const allCharactersList = document.querySelector('[data-all-characters]');
    if (allCharactersList && window.discordAuth.isGM) {
      loadAllCharacters();
    }
  }

  loginBtn?.addEventListener('click', () => {
    const authUrl = window.discordAuth.getAuthUrl();
    window.location.href = authUrl;
  });

  logoutBtn?.addEventListener('click', () => {
    window.discordAuth.logout();
    showAuthGate();
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPanel = button.dataset.tab;

      tabButtons.forEach(btn => btn.classList.remove('systemNav__btn--active'));
      button.classList.add('systemNav__btn--active');

      panels.forEach(panel => {
        if (panel.dataset.panel === targetPanel) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });

      if (targetPanel === 'gm') {
        loadAllCharacters();
      }
    });
  });

  async function loadCharacters() {
    const characterList = document.querySelector('[data-character-list]');
    
    if (!window.discordAuth.canCreateCharacter) {
      characterList.innerHTML = `
        <div class="emptyState">
          <i class="fa-solid fa-lock" style="font-size: 3em; opacity: 0.3; margin-bottom: 16px;"></i>
          <h3 style="margin-bottom: 12px;">Accès limité</h3>
          <p>Vous devez avoir le rôle <strong>Joueur</strong> ou <strong>MJ</strong> sur le serveur Discord pour créer et gérer des fiches personnages.</p>
          <p style="margin-top: 12px; opacity: 0.7; font-size: 0.9em;">Contactez un administrateur du serveur pour obtenir l'accès.</p>
        </div>
      `;
      return;
    }
    
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase non initialisé. Vérifiez la configuration.');
      }

      const characters = await window.CharacterAPI.getMyCharacters(window.discordAuth.user.id);

      if (characters.length === 0) {
        characterList.innerHTML = `
          <div class="emptyState">
            <i class="fa-solid fa-user-plus" style="font-size: 3em; opacity: 0.3; margin-bottom: 16px;"></i>
            <p>Vous n'avez pas encore de personnage</p>
            <button class="btn btn--secondary" data-create-character>
              <i class="fa-solid fa-plus"></i> Créer un personnage
            </button>
          </div>
        `;
      } else {
        characterList.innerHTML = characters.map(char => renderCharacterCard(char)).join('');
      }

      const createBtn = characterList.querySelector('[data-create-character]');
      if (createBtn) {
        createBtn.addEventListener('click', openCharacterCreator);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
      characterList.innerHTML = `
        <div class="emptyState">
          <p style="color: rgba(255, 42, 61, 0.8);">Erreur lors du chargement des personnages</p>
          <p style="opacity: 0.6; font-size: 0.9em; margin-top: 8px;">${error.message}</p>
        </div>
      `;
    }
  }

  async function loadAllCharacters() {
    const allCharactersList = document.querySelector('[data-all-characters]');
    
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase non initialisé. Vérifiez la configuration.');
      }

      const characters = await window.CharacterAPI.getAllCharacters();

      if (characters.length === 0) {
        allCharactersList.innerHTML = '<p class="loading">Aucun personnage créé</p>';
      } else {
        allCharactersList.innerHTML = characters.map(char => `
          <div class="characterCard">
            ${renderCharacterCard(char)}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <small style="opacity: 0.6;">Joueur : ${char.player_name}</small>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading all characters:', error);
      allCharactersList.innerHTML = `<p style="color: rgba(255, 42, 61, 0.8);">Erreur lors du chargement : ${error.message}</p>`;
    }
  }

  function renderCharacterCard(character) {
    return `
      <div class="characterCard" data-character-id="${character.id}">
        <div class="characterCard__name">${character.name}</div>
        <div class="characterCard__class">${character.class || 'Classe inconnue'}</div>
        <div class="characterCard__stats">
          <div class="characterCard__stat">
            <span class="characterCard__stat-label">Niveau</span>
            <span class="characterCard__stat-value">${character.level || 1}</span>
          </div>
          <div class="characterCard__stat">
            <span class="characterCard__stat-label">PV</span>
            <span class="characterCard__stat-value">${character.hp || 0}</span>
          </div>
        </div>
      </div>
    `;
  }

  function openCharacterCreator() {
    alert('Création de personnage - À implémenter avec la documentation');
  }

  // Character Sheet Toggle
  const newCharacterBtn = document.querySelector('[data-new-character]');
  const characterListView = document.querySelector('[data-character-list-view]');
  const characterSheetView = document.querySelector('[data-character-sheet]');
  const backToListButtons = document.querySelectorAll('[data-back-to-list]');

  if (newCharacterBtn) {
    newCharacterBtn.addEventListener('click', () => {
      if (characterListView) characterListView.style.display = 'none';
      if (characterSheetView) characterSheetView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (backToListButtons.length > 0) {
    backToListButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (characterSheetView) characterSheetView.style.display = 'none';
        if (characterListView) characterListView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Character Tabs
  const characterTabButtons = document.querySelectorAll('[data-tab]');
  const characterTabPanels = document.querySelectorAll('[data-panel]');

  characterTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update active tab button
      characterTabButtons.forEach(btn => btn.classList.remove('characterTabs__tab--active'));
      button.classList.add('characterTabs__tab--active');
      
      // Update active panel
      characterTabPanels.forEach(panel => {
        if (panel.getAttribute('data-panel') === targetTab) {
          panel.classList.add('characterTabs__panel--active');
        } else {
          panel.classList.remove('characterTabs__panel--active');
        }
      });
    });
  });

  // Attribute Calculations
  function updateAttributeResult(attrName) {
    const attrInput = document.querySelector(`[data-attr="${attrName}"]`);
    const attrBonus = document.querySelector(`[data-attr-bonus="${attrName}"]`);
    const attrResult = document.querySelector(`[data-attr-result="${attrName}"]`);
    
    if (attrInput && attrBonus && attrResult) {
      const value = parseInt(attrInput.value) || 0;
      const bonus = parseInt(attrBonus.value) || 0;
      attrResult.textContent = value + bonus;
    }
  }

  function updateAttributeEpicResult(attrName) {
    const epicInput = document.querySelector(`[data-attr-epic="${attrName}"]`);
    const epicBonus = document.querySelector(`[data-attr-epic-bonus="${attrName}"]`);
    const epicResult = document.querySelector(`[data-attr-epic-result="${attrName}"]`);
    
    if (epicInput && epicBonus && epicResult) {
      const value = parseInt(epicInput.value) || 0;
      const bonus = parseInt(epicBonus.value) || 0;
      epicResult.textContent = value + bonus;
    }
  }

  // Listen to all attribute inputs
  const allAttrInputs = document.querySelectorAll('[data-attr]');
  const allAttrBonuses = document.querySelectorAll('[data-attr-bonus]');
  const allEpicInputs = document.querySelectorAll('[data-attr-epic]');
  const allEpicBonuses = document.querySelectorAll('[data-attr-epic-bonus]');

  allAttrInputs.forEach(input => {
    const attrName = input.getAttribute('data-attr');
    input.addEventListener('input', () => updateAttributeResult(attrName));
  });

  allAttrBonuses.forEach(input => {
    const attrName = input.getAttribute('data-attr-bonus');
    input.addEventListener('input', () => updateAttributeResult(attrName));
  });

  allEpicInputs.forEach(input => {
    const attrName = input.getAttribute('data-attr-epic');
    input.addEventListener('input', () => updateAttributeEpicResult(attrName));
  });

  allEpicBonuses.forEach(input => {
    const attrName = input.getAttribute('data-attr-epic-bonus');
    input.addEventListener('input', () => updateAttributeEpicResult(attrName));
  });

  // Wound Status System
  function updateWoundStatus() {
    const hpCurrent = parseInt(document.querySelector('[data-hp-current]')?.value) || 0;
    const hpMax = parseInt(document.querySelector('[data-hp-max]')?.textContent) || 1;
    const woundStatus = document.querySelector('[data-wound-status]');
    const woundText = document.querySelector('[data-wound-text]');
    const woundTooltip = document.querySelector('[data-wound-tooltip]');

    if (!woundStatus || !woundText || !woundTooltip) return;

    const percentage = (hpCurrent / hpMax) * 100;

    if (percentage >= 100) {
      // Full HP - hide wound status
      woundStatus.style.display = 'none';
    } else if (percentage <= 33) {
      // Grave wounds - 1 tier remaining
      woundStatus.style.display = 'flex';
      woundText.textContent = 'Blessures graves';
      woundTooltip.textContent = 'Votre personnage a subi des blessures graves (plaies ouvertes, os cassé, saignement interne...).';
    } else if (percentage <= 66) {
      // Moderate wounds - 2 tiers remaining
      woundStatus.style.display = 'flex';
      woundText.textContent = 'Blessures modérées';
      woundTooltip.textContent = 'Votre personnage a subi des blessures modérées (taillades, hématomes...).';
    } else {
      // Light wounds - any HP lost
      woundStatus.style.display = 'flex';
      woundText.textContent = 'Blessures légères';
      woundTooltip.textContent = 'Votre personnage a subi des blessures légères (coupures, éraflures, bleus...).';
    }
  }

  // Initialize wound status on load
  updateWoundStatus();

  // Skill Calculations
  function updateSkillResult(skillName) {
    const skillInput = document.querySelector(`[data-skill="${skillName}"]`);
    const skillBonus = document.querySelector(`[data-skill-bonus="${skillName}"]`);
    const skillResult = document.querySelector(`[data-skill-result="${skillName}"]`);
    
    if (skillInput && skillBonus && skillResult) {
      const value = parseInt(skillInput.value) || 0;
      const bonus = parseInt(skillBonus.value) || 0;
      skillResult.textContent = value + bonus;
    }
  }

  // Listen to all skill inputs
  const allSkillInputs = document.querySelectorAll('[data-skill]');
  const allSkillBonuses = document.querySelectorAll('[data-skill-bonus]');

  allSkillInputs.forEach(input => {
    const skillName = input.getAttribute('data-skill');
    input.addEventListener('input', () => updateSkillResult(skillName));
  });

  allSkillBonuses.forEach(input => {
    const skillName = input.getAttribute('data-skill-bonus');
    input.addEventListener('input', () => updateSkillResult(skillName));
  });

  // Avatar Preview
  const previewAvatarBtn = document.querySelector('[data-preview-avatar]');
  const avatarUrlInput = document.querySelector('[data-char-avatar-url]');
  const avatarImg = document.querySelector('[data-avatar-img]');
  const avatarPlaceholder = document.querySelector('[data-avatar-placeholder]');

  if (previewAvatarBtn && avatarUrlInput && avatarImg && avatarPlaceholder) {
    previewAvatarBtn.addEventListener('click', () => {
      const url = avatarUrlInput.value.trim();
      
      if (!url) {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
        return;
      }

      // Vérifier si l'URL se termine par .jpg, .jpeg ou .png
      const validExtensions = /\.(jpg|jpeg|png)$/i;
      if (!validExtensions.test(url)) {
        alert('L\'URL doit se terminer par .jpg, .jpeg ou .png');
        return;
      }

      // Afficher l'image
      avatarImg.src = url;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';

      // Gérer les erreurs de chargement
      avatarImg.onerror = () => {
        alert('Impossible de charger l\'image. Vérifiez l\'URL.');
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'block';
      };
    });
  }

  // HP inputs (declare once)
  const hpCurrentInput = document.querySelector('[data-hp-current]');
  const hpMaxDisplay = document.querySelector('[data-hp-max]');

  // HP Max Auto-calculation: (Vigueur + Vigueur épique + Athlétisme + Niveau) x2
  function updateHpMax() {
    const vigueurInput = document.querySelector('[data-attr="vigueur"]');
    const vigueurEpicInput = document.querySelector('[data-attr-epic="vigueur"]');
    const athletismeInput = document.querySelector('[data-skill="athletisme"]');
    const levelInput = document.querySelector('[data-char-level]');

    if (vigueurInput && vigueurEpicInput && athletismeInput && levelInput && hpMaxDisplay && hpCurrentInput) {
      const vigueur = parseInt(vigueurInput.value) || 0;
      const vigueurEpic = parseInt(vigueurEpicInput.value) || 0;
      const athletisme = parseInt(athletismeInput.value) || 0;
      const level = parseInt(levelInput.value) || 0;

      const hpMax = (vigueur + vigueurEpic + athletisme + level) * 2;
      hpMaxDisplay.textContent = hpMax;

      // Initialize current HP to max if empty
      if (!hpCurrentInput.value || parseInt(hpCurrentInput.value) > hpMax) {
        hpCurrentInput.value = hpMax;
      }

      updateWoundStatus();
    }
  }

  // Listen to changes that affect HP max
  const vigueurInput = document.querySelector('[data-attr="vigueur"]');
  const vigueurEpicInput = document.querySelector('[data-attr-epic="vigueur"]');
  const athletismeInput = document.querySelector('[data-skill="athletisme"]');
  const levelInput = document.querySelector('[data-char-level]');

  if (vigueurInput) vigueurInput.addEventListener('input', updateHpMax);
  if (vigueurEpicInput) vigueurEpicInput.addEventListener('input', updateHpMax);
  if (athletismeInput) athletismeInput.addEventListener('input', updateHpMax);
  if (levelInput) levelInput.addEventListener('input', updateHpMax);

  // Initialize HP max on load
  updateHpMax();

  // Listen to manual HP current changes
  if (hpCurrentInput) {
    hpCurrentInput.addEventListener('input', updateWoundStatus);
  }

  // HP Controls (+/-)
  const hpDecreaseBtn = document.querySelector('[data-hp-decrease]');
  const hpIncreaseBtn = document.querySelector('[data-hp-increase]');
  const hpDeltaInput = document.querySelector('[data-hp-delta]');

  if (hpDecreaseBtn && hpIncreaseBtn && hpDeltaInput && hpCurrentInput && hpMaxDisplay) {
    hpDecreaseBtn.addEventListener('click', () => {
      const delta = parseInt(hpDeltaInput.value) || 1;
      const current = parseInt(hpCurrentInput.value) || 0;
      const newValue = Math.max(0, current - delta);
      hpCurrentInput.value = newValue;
      updateWoundStatus();
    });

    hpIncreaseBtn.addEventListener('click', () => {
      const delta = parseInt(hpDeltaInput.value) || 1;
      const current = parseInt(hpCurrentInput.value) || 0;
      const max = parseInt(hpMaxDisplay.textContent) || 0;
      const newValue = Math.min(max, current + delta);
      hpCurrentInput.value = newValue;
      updateWoundStatus();
    });
  }

  await checkAuth();
});
