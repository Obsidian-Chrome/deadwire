/**
 * Gestion de l'affichage de la galerie Discord
 */

let allMedia = [];
let currentIndex = 0;
let displayedCount = 0;
const ITEMS_PER_LOAD = 20;

// Récupère les médias depuis le fichier JSON
async function fetchGalleryMedia() {
  try {
    let response = await fetch('./gallery.json');
    if (!response.ok) {
      response = await fetch('/galerie/gallery.json');
    }
    if (!response.ok) {
      throw new Error(`Erreur de chargement: ${response.status}`);
    }
    const data = await response.json();
    return data.media || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return [];
  }
}

// Crée une carte média
function createMediaCard(media, index) {
  const card = document.createElement('div');
  card.className = 'gallery-item';
  card.dataset.index = index;
  
  if (media.type === 'video') {
    card.innerHTML = `
      <video src="${media.url}" preload="metadata"></video>
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
      <img src="${media.proxyUrl || media.url}" alt="Image Discord" loading="lazy" />
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

// Charge plus d'éléments
function loadMoreItems() {
  const grid = document.getElementById('galleryGrid');
  const endIndex = Math.min(displayedCount + ITEMS_PER_LOAD, allMedia.length);
  
  for (let i = displayedCount; i < endIndex; i++) {
    const card = createMediaCard(allMedia[i], i);
    grid.appendChild(card);
  }
  
  displayedCount = endIndex;
  
  // Si tous les éléments sont chargés, retirer l'observer
  if (displayedCount >= allMedia.length) {
    observer.disconnect();
  }
}

// Intersection Observer pour le chargement infini
let observer;
function setupInfiniteScroll() {
  const sentinel = document.createElement('div');
  sentinel.id = 'sentinel';
  sentinel.style.height = '1px';
  document.querySelector('.container').appendChild(sentinel);
  
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && displayedCount < allMedia.length) {
      loadMoreItems();
    }
  }, {
    rootMargin: '200px'
  });
  
  observer.observe(sentinel);
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
  const media = allMedia[currentIndex];
  
  if (media.type === 'video') {
    content.innerHTML = `<video src="${media.url}" controls autoplay style="max-width: 100%; max-height: 90vh;"></video>`;
  } else {
    content.innerHTML = `<img src="${media.url}" alt="Image Discord" />`;
  }
  
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
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // Charger les premiers éléments
  loadMoreItems();
  
  // Configurer le scroll infini
  setupInfiniteScroll();
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
