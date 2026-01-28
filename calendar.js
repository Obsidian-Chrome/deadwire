// Configuration Google Calendar API
const CALENDAR_CONFIG = {
  apiKey: 'AIzaSyCtxOjsUfFxtxKpwdh2eJz4CS1x3eshS-w',
  calendarId: 'deadwire01@gmail.com',
  maxResults: 50
};

// Récupère les événements de la semaine en cours
async function fetchWeekEvents() {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

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

// Groupe les événements par jour de la semaine
function groupEventsByDay(events) {
  const daysMap = {
    1: [], // Lundi
    2: [], // Mardi
    3: [], // Mercredi
    4: [], // Jeudi
    5: [], // Vendredi
    6: [], // Samedi
    0: []  // Dimanche
  };

  events.forEach(event => {
    const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
    const dayOfWeek = start.getDay();
    daysMap[dayOfWeek].push({
      title: event.summary || 'Sans titre',
      description: event.description || '',
      start: start,
      end: event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date),
      isAllDay: !event.start.dateTime
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
    
    // Ajuste l'index pour commencer à lundi (1) au lieu de dimanche (0)
    const dayIndex = index === 6 ? 0 : index + 1;
    currentDate.setDate(startOfWeek.getDate() + index);

    const dayEvents = eventsByDay[dayIndex];
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
      
      if (event.description && event.description.includes('+++')) {
        textElement.style.display = 'none';
        textElement.textContent = '';
      } else {
        textElement.style.display = '';
        textElement.textContent = event.description || 'Aucune description disponible';
        
        if (dayEvents.length > 1) {
          textElement.textContent += ` (+${dayEvents.length - 1} autre${dayEvents.length > 2 ? 's' : ''} événement${dayEvents.length > 2 ? 's' : ''})`;
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

// Initialise le calendrier
async function initCalendar() {
  console.log('Chargement des événements Google Calendar...');
  const events = await fetchWeekEvents();
  console.log(`${events.length} événement(s) trouvé(s)`);
  populateEvents(events);
}

// Lance l'initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCalendar);
} else {
  initCalendar();
}
