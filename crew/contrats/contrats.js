(async () => {
  const protectedContent = document.getElementById('protected-content');
  const loader = document.getElementById('contracts-loader');
  const app = document.getElementById('contracts-app');
  const statusTabsEl = document.getElementById('status-tabs');
  const typeFiltersEl = document.getElementById('type-filters');
  const gridEl = document.getElementById('contracts-grid');
  const emptyEl = document.getElementById('contracts-empty');
  const modal = document.getElementById('contract-modal');
  let isGM = false;
  const modalContent = document.getElementById('contract-modal__content');

  const TYPES = [
    { key: 'Tous', label: 'Tous', icon: 'fa-layer-group', code: '' },
    { key: 'Vol', label: 'Vol', icon: 'fa-mask', code: '1' },
    { key: 'SOS', label: 'SOS', icon: 'fa-triangle-exclamation', code: '2' },
    { key: 'Mercenaire', label: 'Mercenaire', icon: 'fa-crosshairs', code: '3' },
    { key: 'Sabotage', label: 'Sabotage', icon: 'fa-bomb', code: '4' },
    { key: 'Récupération', label: 'Récupération', icon: 'fa-box-archive', code: '5' },
    { key: 'Livraison', label: 'Livraison', icon: 'fa-truck-fast', code: '6' }
  ];

  let contracts = [];
  let currentStatus = 'ouvert';
  let currentType = 'Tous';

  function waitForAuth() {
    return new Promise((resolve) => {
      if (window.discordAuth) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (window.discordAuth) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      }
    });
  }

  async function checkAccess() {
    await waitForAuth();

    const isAuthenticated = await window.discordAuth.restoreSession();

    if (loader) loader.style.display = 'none';

    if (isAuthenticated) {
      const isMember = window.discordAuth.isMember;
      isGM = window.discordAuth.isGM;

      if (isMember || isGM) {
        if (protectedContent) protectedContent.style.display = 'block';
        initApp();
      } else {
        window.location.href = '/crew/';
      }
    } else {
      window.location.href = window.discordAuth.getAuthUrl();
    }
  }

  async function initApp() {
    renderStatusTabs();
    renderTypeFilters();

    try {
      const response = await fetch('contrats.json');
      if (!response.ok) throw new Error('Erreur chargement contrats');
      const data = await response.json();
      contracts = data.contrats || [];
    } catch (error) {
      console.error(error);
      if (emptyEl) {
        emptyEl.textContent = 'Impossible de charger les contrats.';
        emptyEl.style.display = 'block';
      }
      return;
    }

    renderContracts();
  }

  function renderStatusTabs() {
    if (!statusTabsEl) return;
    statusTabsEl.innerHTML = '';
    [
      { key: 'ouvert', label: 'Actifs' },
      { key: 'clos', label: 'Archives' }
    ].forEach((tab) => {
      const btn = document.createElement('button');
      btn.className = 'contracts-tab' + (tab.key === currentStatus ? ' is-active' : '');
      btn.type = 'button';
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        currentStatus = tab.key;
        renderStatusTabs();
        renderContracts();
      });
      statusTabsEl.appendChild(btn);
    });
  }

  function renderTypeFilters() {
    if (!typeFiltersEl) return;
    typeFiltersEl.innerHTML = '';
    TYPES.forEach((type) => {
      const btn = document.createElement('button');
      btn.className = 'contracts-type' + (type.key === currentType ? ' is-active' : '');
      btn.type = 'button';
      btn.innerHTML = `<i class="fa-solid ${type.icon}" aria-hidden="true"></i> ${type.label}`;
      btn.addEventListener('click', () => {
        currentType = type.key;
        renderTypeFilters();
        renderContracts();
      });
      typeFiltersEl.appendChild(btn);
    });
  }

  function renderContracts() {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const filtered = contracts.filter((c) => {
      if (c.statut !== currentStatus) return false;
      if (currentType !== 'Tous' && c.type !== currentType) return false;
      return true;
    });

    if (!filtered.length) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    filtered.forEach((c) => {
      gridEl.appendChild(createCard(c));
    });
  }

  function formatContractNumber(c) {
    const type = TYPES.find((t) => t.key === c.type) || TYPES[0];
    const padded = String(c.numero || 0).padStart(3, '0');
    return `DW-${type.code || '?'}-${padded}`;
  }

  function createCard(c) {
    const type = TYPES.find((t) => t.key === c.type) || TYPES[0];
    const article = document.createElement('article');
    article.className = 'contract-card' + (c.statut === 'clos' ? ' contract-card--closed' : '');
    article.innerHTML = `
      <div class="contract-card__header">
        <span class="contract-card__number">${escapeHtml(formatContractNumber(c))}</span>
        <span class="contract-card__meta">
          <span class="contract-card__type"><i class="fa-solid ${type.icon}" aria-hidden="true"></i> ${type.label}</span>
          <span class="contract-card__merc"><i class="fa-solid fa-users" aria-hidden="true"></i> ${escapeHtml(c.mercenaires) || '—'}</span>
        </span>
      </div>
      <h3 class="contract-card__title">${escapeHtml(c.titre)}</h3>
      <p class="contract-card__desc">${escapeHtml(c.description)}</p>
      <div class="contract-card__reward">
        <span class="reward-label">Récompense</span>
        <span class="reward-icons" title="Gils">${renderGilIcons(c.recompense?.gil)}</span>
        <span class="reward-icons reward-icons--xp" title="XP">${renderXpIcons(c.recompense?.xp)}</span>
      </div>
    `;
    article.addEventListener('click', () => openModal(c));
    return article;
  }

  function openModal(c) {
    const type = TYPES.find((t) => t.key === c.type) || TYPES[0];
    const mjToggleHtml = isGM ? `
      <label class="contracts-mj-toggle" id="modal-mj-toggle-wrap" style="margin-left: auto;">
        <input type="checkbox" id="modal-mj-toggle" />
        <span class="mj-toggle__slider"></span>
        Vision MJ
      </label>
    ` : '';

    modalContent.innerHTML = `
      <div class="contract-modal__header">
        <span class="contract-modal__number">${escapeHtml(formatContractNumber(c))}</span>
        <span class="contract-modal__status ${c.statut === 'ouvert' ? 'contract-modal__status--open' : 'contract-modal__status--closed'}">${c.statut === 'ouvert' ? 'Actif' : 'Archivé'}</span>
        <span class="contract-modal__type"><i class="fa-solid ${type.icon}" aria-hidden="true"></i> ${type.label}</span>
        <span class="contract-modal__merc"><i class="fa-solid fa-users" aria-hidden="true"></i> ${escapeHtml(c.mercenaires) || '—'}</span>
        ${mjToggleHtml}
      </div>
      <h2 class="contract-modal__title">${escapeHtml(c.titre)}</h2>
      <p class="contract-modal__desc">${escapeHtml(c.description)}</p>
      <h3 class="contract-modal__section-title">Déroulé</h3>
      <ul class="contract-modal__list">${(c.deroule || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ul>
      <div class="contract-modal__reward">
        <span class="reward-label">Récompense</span>
        <span class="reward-icons" title="Gils">${renderGilIcons(c.recompense?.gil)}</span>
        <span class="reward-icons reward-icons--xp" title="XP">${renderXpIcons(c.recompense?.xp)}</span>
      </div>
      ${isGM ? renderMJ(c.mj) : ''}
    `;

    const mjToggle = document.getElementById('modal-mj-toggle');
    if (mjToggle) {
      modalContent.classList.remove('mj-vision');
      mjToggle.addEventListener('change', () => {
        modalContent.classList.toggle('mj-vision', mjToggle.checked);
      });
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function renderMJ(mj) {
    if (!mj) return '';
    return `
      <div class="contract-modal__mj mj-only">
        <h3 class="contract-modal__section-title contract-modal__section-title--mj">Vision MJ</h3>
        <div class="mj-block">
          <h4>Informations cachées</h4>
          <p>${escapeHtml(mj.description)}</p>
        </div>
        ${mj.peripeties && mj.peripeties.length ? `
          <div class="mj-block">
            <h4>Péripéties</h4>
            <ul>${mj.peripeties.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>
        ` : ''}
        <div class="mj-block mj-reward">
          <h4>Récompense exacte</h4>
          <p>
            <span class="reward-exact reward-exact--gil">${escapeHtml(mj.gilExact) || '—'} Gils</span>
            <span class="reward-separator">·</span>
            <span class="reward-exact reward-exact--xp">${escapeHtml(mj.xpExact) || '—'} XP</span>
          </p>
        </div>
      </div>
    `;
  }

  function renderGilIcons(count) {
    const n = Math.max(0, Math.min(5, Number(count) || 0));
    if (!n) return '<span class="reward-none">—</span>';
    return Array.from({ length: n }, () => '<img src="/media/gil.webp" alt="Gil" class="reward-icon" />').join('');
  }

  function renderXpIcons(count) {
    const n = Math.max(0, Math.min(5, Number(count) || 0));
    if (!n) return '<span class="reward-none">—</span>';
    return Array.from({ length: n }, () => '<i class="fa-solid fa-bolt reward-icon reward-icon--xp" aria-hidden="true"></i>').join('');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelector('.contract-modal__close')?.addEventListener('click', closeModal);
  document.querySelector('.contract-modal__overlay')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  await checkAccess();
})();
