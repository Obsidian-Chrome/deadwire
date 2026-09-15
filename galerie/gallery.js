/**
 * Gestion de l'affichage de la galerie Discord
 */

let allMedia = [];
let mediaByDate = {}; // Médias groupés par date
let dateGroups = []; // Liste des dates dans l'ordre
let currentIndex = 0;
let displayedDateIndex = 0; // Index de la dernière date affichée
const ITEMS_PER_LOAD = 50;

// Récupère les médias depuis le fichier JSON
async function fetchGalleryMedia() {
  try {
    console.log('Tentative de chargement: ./gallery.json');
    let response = await fetch('./gallery.json');
    if (!response.ok) {
      console.log('Échec, tentative: /galerie/gallery.json');
      response = await fetch('/galerie/gallery.json');
    }
    if (!response.ok) {
      throw new Error(`Erreur de chargement: ${response.status}`);
    }
    const data = await response.json();
    console.log('Données chargées:', data);
    console.log('Nombre de médias:', data.media ? data.media.length : 0);
    return data.media || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return [];
  }
}

// Groupe les médias par date
function groupMediaByDate(media) {
  const grouped = {};
  const dates = [];
  
  media.forEach(item => {
    const date = new Date(item.timestamp);
    const dateKey = date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
      dates.push(dateKey);
    }
    
    grouped[dateKey].push(item);
  });
  
  return { grouped, dates };
}

// Obtient l'URL à utiliser (avec fallback en cascade)
function getMediaUrl(media, useProxy = true) {
  // Priorité 1: WebP local (le plus léger et rapide)
  if (media.localWebp) {
    return media.localWebp;
  }
  
  // Priorité 2: Original local
  if (media.localOriginal) {
    return media.localOriginal;
  }
  
  // Priorité 3: Ancienne structure (rétrocompatibilité)
  if (media.localUrl) {
    return media.localUrl;
  }
  
  // Priorité 4: URL Discord (proxy ou directe)
  if (useProxy && media.proxyUrl) {
    return media.proxyUrl;
  }
  
  return media.url;
}

// Obtient l'URL de fallback
function getFallbackUrl(media) {
  if (media.localOriginal) return media.localOriginal;
  if (media.localUrl) return media.localUrl;
  return media.url;
}

// Crée une carte média
function createMediaCard(media, index) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  card.dataset.index = index;
  
  const mediaUrl = getMediaUrl(media, true);
  const fallbackUrl = getFallbackUrl(media);
  
  if (media.type === 'video') {
    card.innerHTML = `
      <video src="${mediaUrl}" preload="metadata" onerror="this.src='${fallbackUrl}'"></video>
      <div class="gallery-item__video-icon">
        <i class="fa-solid fa-play"></i>
      </div>
      <div class="gallery-item__overlay">
        <div class="gallery-item__author">
          <i class="fa-solid fa-camera"></i>
          <span>${media.author.username}</span>
        </div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <img src="${mediaUrl}" alt="Image Discord" loading="lazy" onerror="this.src='${fallbackUrl}'" />
      <div class="gallery-item__overlay">
        <div class="gallery-item__author">
          <i class="fa-solid fa-camera"></i>
          <span>${media.author.username}</span>
        </div>
      </div>
    `;
  }
  
  card.addEventListener('click', () => openLightbox(index));
  
  return card;
}

// Crée un séparateur de date
function createDateSeparator(dateStr) {
  const separator = document.createElement('div');
  separator.className = 'gallery-date-separator';
  separator.innerHTML = `
    <hr class="gallery-date-line" />
    <span class="gallery-date-text">${dateStr}</span>
    <hr class="gallery-date-line" />
  `;
  return separator;
}

// Charge plus d'éléments (par groupes de dates)
function loadMoreItems() {
  const grid = document.getElementById('galleryGrid');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  
  let itemsLoaded = 0;
  let startDateIndex = displayedDateIndex;
  let globalIndex = 0;
  
  // Calculer l'index global de départ
  for (let i = 0; i < displayedDateIndex; i++) {
    globalIndex += mediaByDate[dateGroups[i]].length;
  }
  
  // Charger des dates jusqu'à atteindre environ ITEMS_PER_LOAD images
  while (displayedDateIndex < dateGroups.length && itemsLoaded < ITEMS_PER_LOAD) {
    const currentDate = dateGroups[displayedDateIndex];
    const mediaForDate = mediaByDate[currentDate];
    
    // Ajouter le séparateur de date
    const separator = createDateSeparator(currentDate);
    grid.appendChild(separator);
    
    // Ajouter toutes les images de cette date
    mediaForDate.forEach(media => {
      const card = createMediaCard(media, globalIndex);
      grid.appendChild(card);
      globalIndex++;
    });
    
    itemsLoaded += mediaForDate.length;
    displayedDateIndex++;
  }
  
  console.log(`Chargé ${itemsLoaded} images de ${startDateIndex} à ${displayedDateIndex - 1}`);
  
  // Cacher le bouton si toutes les dates sont chargées
  if (displayedDateIndex >= dateGroups.length) {
    loadMoreBtn.style.display = 'none';
  }
}

// Configuration du bouton de chargement
function setupLoadMoreButton() {
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  
  loadMoreBtn.addEventListener('click', () => {
    // Afficher le loading
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    
    // Simuler un petit délai pour voir le loading
    setTimeout(() => {
      loadMoreItems();
      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    }, 300);
  });
  
  // Afficher le bouton seulement s'il y a plus de dates à charger
  if (displayedDateIndex >= dateGroups.length) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'inline-flex';
  }
}

// Ouvre la lightbox
function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Ferme la lightbox
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
  
  // Pause les vidéos
  const videos = document.querySelectorAll('#lightboxContent video');
  videos.forEach(video => video.pause());
}

// Met à jour le contenu de la lightbox
function updateLightbox() {
  const content = document.getElementById('lightboxContent');
  const authorName = document.getElementById('lightboxAuthorName');
  const media = allMedia[currentIndex];
  
  const mediaUrl = getMediaUrl(media, false);
  const fallbackUrl = media.localUrl || media.url;
  
  if (media.type === 'video') {
    content.innerHTML = `<video src="${mediaUrl}" controls autoplay onerror="this.src='${fallbackUrl}'"></video>`;
  } else {
    content.innerHTML = `<img src="${mediaUrl}" alt="Image Discord" onerror="this.src='${fallbackUrl}'" />`;
  }
  
  // Afficher le nom de l'auteur
  authorName.textContent = media.author.username;
  
  // Gérer les boutons de navigation
  document.getElementById('lightboxPrev').style.display = currentIndex > 0 ? 'flex' : 'none';
  document.getElementById('lightboxNext').style.display = currentIndex < allMedia.length - 1 ? 'flex' : 'none';
}

// Navigation lightbox
function navigateLightbox(direction) {
  const newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < allMedia.length) {
    currentIndex = newIndex;
    updateLightbox();
  }
}

// Remplit la galerie
async function populateGallery() {
  const grid = document.getElementById('galleryGrid');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  
  loadingState.style.display = 'block';
  
  allMedia = await fetchGalleryMedia();
  
  loadingState.style.display = 'none';
  
  if (allMedia.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  // Grouper les médias par date
  const { grouped, dates } = groupMediaByDate(allMedia);
  mediaByDate = grouped;
  dateGroups = dates;
  
  console.log(`${dateGroups.length} dates trouvées:`, dateGroups);
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // Charger les premiers éléments
  loadMoreItems();
  
  // Configurer le bouton de chargement
  setupLoadMoreButton();
}

// Initialisation
async function initGallery() {
  await populateGallery();
  
  // Events lightbox
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));
  
  // Fermer avec Echap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
  
  // Fermer en cliquant sur le fond
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
}

// Lance l'initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGallery);
} else {
  initGallery();
}
