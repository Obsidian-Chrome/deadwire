// Configuration Google Calendar API
const CALENDAR_CONFIG = {
  apiKey: 'AIzaSyCtxOjsUfFxtxKpwdh2eJz4CS1x3eshS-w',
  calendarId: 'deadwire01@gmail.com',
  maxResults: 50
};

// Récupère les événements des 2 prochaines semaines
async function fetchWeekEvents() {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 14);

  const timeMin = startOfWeek.toISOString();
  const timeMax = endOfWeek.toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_CONFIG.calendarId)}/events?key=${CALENDAR_CONFIG.apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&maxResults=${CALENDAR_CONFIG.maxResults}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return [];
  }
}

// Obtient le lundi de la semaine en cours
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste pour que lundi = début de semaine
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Formate la date en français
function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Formate l'heure
function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Extrait l'URL du cover depuis la description
function extractCover(description) {
  if (!description) return null;
  
  const coverMatch = description.match(/cover="([^"]+)"/i);
  return coverMatch ? coverMatch[1] : null;
}

// Groupe les événements par date absolue
function groupEventsByDay(events) {
  const daysMap = {};

  events.forEach(event => {
    const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    // Crée une clé basée sur la date absolue (YYYY-MM-DD)
    const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    
    if (!daysMap[dateKey]) {
      daysMap[dateKey] = [];
    }
    
    daysMap[dateKey].push({
      title: event.summary || 'Sans titre',
      description: event.description || '',
      start: start,
      end: event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
      isAllDay: !event.start.dateTime,
      coverUrl: extractCover(event.description)
    });
  });

  return daysMap;
}

// Remplit les cartes d'événements dans le HTML
function populateEvents(events) {
  const eventsByDay = groupEventsByDay(events);
  const eventCards = document.querySelectorAll('.event');
  const startOfWeek = getStartOfWeek(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  eventCards.forEach((card, index) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + index);
    
    // Crée la clé de date pour rechercher les événements
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    const dayEvents = eventsByDay[dateKey];
    const dateElement = card.querySelector('.event__date');
    const hoursElement = card.querySelector('.event__hours');
    const titleElement = card.querySelector('.event__title');
    const textElement = card.querySelector('.event__text');

    // Vérifie si c'est le jour actuel
    if (currentDate.getTime() === today.getTime()) {
      card.classList.add('event--today');
    } else {
      card.classList.remove('event--today');
    }

    // Affiche toujours la date
    dateElement.textContent = formatDate(currentDate);

    if (dayEvents && dayEvents.length > 0) {
      // Prend le premier événement du jour
      const event = dayEvents[0];
      
      if (event.isAllDay) {
        hoursElement.textContent = 'Toute la journée';
      } else {
        hoursElement.textContent = `${formatTime(event.start)} - ${formatTime(event.end)}`;
      }
      
      titleElement.textContent = event.title;
      
      // Stocke l'URL du cover dans la carte pour un accès facile
      if (event.coverUrl) {
        card.dataset.coverUrl = event.coverUrl;
      } else {
        delete card.dataset.coverUrl;
      }
      
      if (event.coverUrl) {
        // Affiche un lien pour voir l'image
        textElement.style.display = '';
        textElement.innerHTML = '<a href="#" class="cover-link" style="color: rgba(255, 42, 61, 0.9); text-decoration: underline; cursor: pointer; font-weight: 500;">Voir l\'image</a>';
        
        // Ajoute un event listener sur le lien
        const coverLink = textElement.querySelector('.cover-link');
        if (coverLink) {
          coverLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showCoverModal(event.coverUrl);
          });
        }
      } else if (event.description && event.description.includes('+++')) {
        textElement.style.display = 'none';
        textElement.textContent = '';
      } else {
        if (event.description) {
          textElement.style.display = '';
          textElement.textContent = event.description;
          
          if (dayEvents.length > 1) {
            textElement.textContent += ` (+${dayEvents.length - 1} autre${dayEvents.length > 2 ? 's' : ''} événement${dayEvents.length > 2 ? 's' : ''})`;
          }
        } else {
          // Pas de description : masque l'élément
          textElement.style.display = 'none';
          textElement.textContent = '';
        }
      }

      card.classList.add('event--active');
    } else {
      hoursElement.textContent = '—';
      titleElement.textContent = 'Aucun événement';
      textElement.textContent = 'Pas d\'événement prévu ce jour-là.';
      card.classList.remove('event--active');
    }
  });
}

// Formate une plage de dates
function formatDateRange(startDate, endDate) {
  const start = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const end = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  return `${start} au ${end}`;
}

// Met à jour les titres de semaine avec les plages de dates
function updateWeekTitles() {
  const startOfWeek = getStartOfWeek(new Date());
  
  // Semaine 1
  const week1Start = new Date(startOfWeek);
  const week1End = new Date(startOfWeek);
  week1End.setDate(week1Start.getDate() + 6);
  
  const week1Title = document.querySelector('[data-week="1"]');
  if (week1Title) {
    week1Title.textContent = formatDateRange(week1Start, week1End);
  }
  
  // Semaine 2
  const week2Start = new Date(startOfWeek);
  week2Start.setDate(startOfWeek.getDate() + 7);
  const week2End = new Date(week2Start);
  week2End.setDate(week2Start.getDate() + 6);
  
  const week2Title = document.querySelector('[data-week="2"]');
  if (week2Title) {
    week2Title.textContent = formatDateRange(week2Start, week2End);
  }
}

// Crée et affiche la modal de l'image cover
function showCoverModal(imageUrl) {
  // Retire toute modal existante
  const existingModal = document.querySelector('.cover-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Crée la modal
  const modal = document.createElement('div');
  modal.className = 'cover-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  `;
  
  // Bouton de fermeture
  const closeBtn = document.createElement('button');
  closeBtn.className = 'cover-modal__close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 100001;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 42, 61, 0.3);
    background: rgba(10, 0, 12, 0.7);
    color: rgba(247, 233, 239, 0.9);
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    box-shadow: 0 10px 50px rgba(255, 42, 61, 0.3);
    border-radius: 8px;
    animation: scaleIn 0.3s ease;
    cursor: default;
  `;
  
  // Ajoute les keyframes pour les animations
  if (!document.querySelector('#cover-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'cover-modal-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .cover-modal__close:hover {
        border-color: rgba(255, 42, 61, 0.6);
        background: rgba(10, 0, 12, 0.9);
        box-shadow: 0 4px 14px rgba(255, 42, 61, 0.4);
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }
  
  modal.appendChild(closeBtn);
  modal.appendChild(img);
  document.body.appendChild(modal);
  
  // Fonction de fermeture
  const close = () => {
    modal.style.animation = 'fadeIn 0.2s ease reverse';
    setTimeout(() => modal.remove(), 200);
  };
  
  // Ferme au clic sur le bouton
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });
  
  // Ferme au clic sur le fond (mais pas sur l'image)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      close();
    }
  });
  
  // Empêche la fermeture au clic sur l'image
  img.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Ferme avec Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Fonction supprimée - les listeners sont maintenant directement sur les liens "Voir l'image"
function setupCoverListeners() {
  // Cette fonction n'est plus nécessaire car les event listeners
  // sont ajoutés directement dans populateEvents()
}

// Initialise le calendrier
async function initCalendar() {
  console.log('Chargement des événements Google Calendar...');
  updateWeekTitles();
  const events = await fetchWeekEvents();
  console.log(`${events.length} événement(s) trouvé(s)`);
  populateEvents(events);
  setupCoverListeners();
}

// Lance l'initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalendar);
} else {
  initCalendar();
}
