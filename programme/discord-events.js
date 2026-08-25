/**
 * Gestion de l'affichage des événements Discord sur la page programme
 */

// Récupère les événements depuis le fichier JSON
async function fetchDiscordEvents() {
  try {
    // Essayer d'abord le chemin relatif (local), puis absolu (production)
    let response = await fetch('./events.json');
    if (!response.ok) {
      response = await fetch('/programme/events.json');
    }
    if (!response.ok) {
      throw new Error(`Erreur de chargement: ${response.status}`);
    }
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return [];
  }
}

// Filtre les événements à venir (max 4)
function getUpcomingEvents(events) {
  const now = new Date();
  return events
    .filter(event => new Date(event.startTime) >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 4);
}

// Formate la date en français
function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Formate l'heure
function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Crée et affiche la modal pour les détails de l'événement
function showEventModal(event) {
  const existingModal = document.querySelector('.event-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  
  const modal = document.createElement('div');
  modal.className = 'event-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
    overflow-y: auto;
    padding: 20px;
  `;
  
  const content = document.createElement('div');
  content.className = 'event-modal__content';
  content.style.cssText = `
    max-width: 800px;
    width: 100%;
    background: rgba(10, 0, 12, 0.95);
    border: 1px solid rgba(255, 42, 61, 0.3);
    border-radius: 12px;
    padding: 0;
    position: relative;
    animation: scaleIn 0.3s ease;
    box-shadow: 0 10px 50px rgba(255, 42, 61, 0.3);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'event-modal__close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 100001;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 42, 61, 0.3);
    background: rgba(10, 0, 12, 0.9);
    color: rgba(247, 233, 239, 0.9);
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  let contentHTML = '';
  
  const modalBannerUrl = event.coverUrl || '/media/discordevent_deadwire.png';
  contentHTML += `
    <div style="width: 100%; aspect-ratio: 800 / 320; overflow: hidden; border-radius: 12px 12px 0 0; background: rgba(10, 0, 12, 0.8); display: flex; align-items: center; justify-content: center;">
      <img src="${modalBannerUrl}" alt="${escapeHtml(event.name)}" style="width: 100%; height: 100%; object-fit: contain; object-position: center center;" />
    </div>
  `;
  
  contentHTML += `
    <div style="padding: 32px;">
      <h2 style="font-size: 2rem; color: rgba(247, 233, 239, 0.95); margin: 0 0 16px 0; font-weight: 600;">
        ${escapeHtml(event.name)}
      </h2>
      
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; font-size: 0.95rem;">
        <div style="display: flex; align-items: center; gap: 8px; color: rgba(247, 233, 239, 0.7);">
          <i class="fa-solid fa-calendar" aria-hidden="true" style="color: rgba(255, 42, 61, 0.8);"></i>
          <span>${formatDate(start)}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px; color: rgba(247, 233, 239, 0.7);">
          <i class="fa-solid fa-clock" aria-hidden="true" style="color: rgba(255, 42, 61, 0.8);"></i>
          <span>${formatTime(start)}${end ? ' - ' + formatTime(end) : ''}</span>
        </div>
        
        ${event.location && event.location !== 'Non spécifié' ? `
        <div style="display: flex; align-items: center; gap: 8px; color: rgba(247, 233, 239, 0.7);">
          <i class="fa-solid fa-location-dot" aria-hidden="true" style="color: rgba(255, 42, 61, 0.8);"></i>
          <span>${escapeHtml(event.location)}</span>
        </div>
        ` : ''}
        
        ${event.interestedCount > 0 ? `
        <div style="display: flex; align-items: center; gap: 8px; color: rgba(247, 233, 239, 0.7);">
          <i class="fa-solid fa-users" aria-hidden="true" style="color: rgba(255, 42, 61, 0.8);"></i>
          <span>${event.interestedCount} intéressé${event.interestedCount > 1 ? 's' : ''}</span>
        </div>
        ` : ''}
      </div>
      
      ${event.description ? `
      <div style="color: rgba(247, 233, 239, 0.8); line-height: 1.6; white-space: pre-wrap;">
        ${escapeHtml(event.description)}
      </div>
      ` : ''}
    </div>
  `;
  
  content.innerHTML = contentHTML;
  content.appendChild(closeBtn);
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  if (!document.querySelector('#event-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'event-modal-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .event-modal__close:hover {
        border-color: rgba(255, 42, 61, 0.6);
        background: rgba(10, 0, 12, 1);
        box-shadow: 0 4px 14px rgba(255, 42, 61, 0.4);
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }
  
  const close = () => {
    modal.style.animation = 'fadeIn 0.2s ease reverse';
    setTimeout(() => modal.remove(), 200);
  };
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      close();
    }
  });
  
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Échappe le HTML pour éviter les injections
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Crée une carte d'événement
function createEventCard(event) {
  const card = document.createElement('article');
  card.className = 'event-card';
  card.onclick = () => showEventModal(event);
  
  const start = new Date(event.startTime);
  const end = event.endTime ? new Date(event.endTime) : null;
  
  const bannerUrl = event.coverUrl || '/media/discordevent_deadwire.png';
  const bannerHTML = `<div class="event-card__banner"><img src="${bannerUrl}" alt="${escapeHtml(event.name)}" /></div>`;
  
  const timeHTML = end 
    ? `${formatTime(start)} - ${formatTime(end)}`
    : formatTime(start);
  
  const locationHTML = event.location && event.location !== 'Non spécifié'
    ? `<div class="event-card__meta-item">
         <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
         <span>${escapeHtml(event.location)}</span>
       </div>`
    : '';
  
  card.innerHTML = `
    ${bannerHTML}
    <div class="event-card__content">
      <h3 class="event-card__title">${escapeHtml(event.name)}</h3>
      <div class="event-card__meta">
        <div class="event-card__meta-item">
          <i class="fa-solid fa-calendar" aria-hidden="true"></i>
          <span>${formatDate(start)}</span>
        </div>
        <div class="event-card__meta-item">
          <i class="fa-solid fa-clock" aria-hidden="true"></i>
          <span>${timeHTML}</span>
        </div>
        ${locationHTML}
      </div>
    </div>
  `;
  
  return card;
}

// Remplit la grille d'événements
function populateEvents(events) {
  const grid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('emptyState');
  
  const upcomingEvents = getUpcomingEvents(events);
  
  if (upcomingEvents.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  grid.style.display = 'flex';
  emptyState.style.display = 'none';
  grid.innerHTML = '';
  
  upcomingEvents.forEach(event => {
    const eventData = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      coverUrl: event.coverUrl,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      interestedCount: event.interestedCount
    };
    
    const card = createEventCard(eventData);
    grid.appendChild(card);
  });
}

// Initialise l'affichage des événements
async function initDiscordEvents() {
  const events = await fetchDiscordEvents();
  populateEvents(events);
}

// Lance l'initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiscordEvents);
} else {
  initDiscordEvents();
}
