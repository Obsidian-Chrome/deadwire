(() => {
  // Configuration JSONBin
  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/6960bf05d0ea881f405f2865/latest';
  
  const timeline = document.querySelector('[data-events-timeline]');
  if (!timeline) return;

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    return {
      day: days[date.getDay()],
      date: `${date.getDate()} ${months[date.getMonth()]}`,
      time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    };
  };

  // Fonction pour créer un article d'événement
  const createEventElement = (event) => {
    const article = document.createElement('article');
    article.className = 'event';
    
    const dateInfo = formatDate(event.scheduled_start_time);
    
    article.innerHTML = `
      <div class="event__when">
        <div class="event__day">${dateInfo.day}</div>
        <div class="event__date">${dateInfo.date}</div>
        <div class="event__hours">${dateInfo.time}</div>
      </div>
      <div class="event__body">
        <h3 class="event__title">${event.name}</h3>
        ${event.description ? `<p class="event__text">${event.description}</p>` : ''}
      </div>
    `;
    
    return article;
  };

  // Fonction pour créer un événement vide (jour sans événement)
  const createEmptyDayElement = (dayName) => {
    const article = document.createElement('article');
    article.className = 'event';
    
    article.innerHTML = `
      <div class="event__when">
        <div class="event__day">${dayName}</div>
        <div class="event__date"></div>
        <div class="event__hours"></div>
      </div>
      <div class="event__body">
        <p class="event__status"></p>
      </div>
    `;
    
    return article;
  };

  // Fonction pour organiser les événements par jour de la semaine
  const organizeEventsByWeekday = (events) => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const eventsByDay = {};
    
    days.forEach(day => {
      eventsByDay[day] = [];
    });
    
    events.forEach(event => {
      const dateInfo = formatDate(event.scheduled_start_time);
      if (eventsByDay[dateInfo.day]) {
        eventsByDay[dateInfo.day].push(event);
      }
    });
    
    return eventsByDay;
  };

  // Fonction principale pour charger les événements
  const loadDiscordEvents = async () => {
    try {
      // Vérifier si l'URL est configurée
      if (JSONBIN_URL === 'YOUR_JSONBIN_URL_HERE') {
        console.log('📌 JSONBin URL non configurée. Affichage du calendrier vide par défaut.');
        return;
      }

      const response = await fetch(JSONBIN_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Structure attendue: { record: { events: [...] } } ou { events: [...] }
      const events = data.record?.events || data.events || [];
      
      if (!events || events.length === 0) {
        console.log('Aucun événement Discord trouvé.');
        return;
      }

      // Organiser les événements par jour
      const eventsByDay = organizeEventsByWeekday(events);
      
      // Vider la timeline existante
      timeline.innerHTML = '';
      
      // Créer les articles pour chaque jour de la semaine
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      days.forEach(day => {
        const dayEvents = eventsByDay[day];
        
        if (dayEvents.length > 0) {
          // Afficher tous les événements du jour
          dayEvents.forEach(event => {
            timeline.appendChild(createEventElement(event));
          });
        } else {
          // Afficher un jour vide
          timeline.appendChild(createEmptyDayElement(day));
        }
      });
      
      console.log(`✅ ${events.length} événement(s) Discord chargé(s)`);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des événements Discord:', error);
      // En cas d'erreur, garder l'affichage par défaut
    }
  };

  // Charger les événements au chargement de la page
  loadDiscordEvents();

  // Optionnel: Recharger les événements toutes les 5 minutes
  setInterval(loadDiscordEvents, 5 * 60 * 1000);

})();
