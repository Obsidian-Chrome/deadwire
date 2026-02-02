let preloadedVideo = null;

document.addEventListener('DOMContentLoaded', () => {
  preloadedVideo = document.createElement('video');
  preloadedVideo.src = '../media/chanclas.webm';
  preloadedVideo.preload = 'auto';
  preloadedVideo.style.display = 'none';
  document.body.appendChild(preloadedVideo);
  
  const ahmeName = document.querySelector('[data-ahme]');
  
  if (!ahmeName) return;
  
  ahmeName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!window.easterEggLock.acquire('Ahme')) {
      return;
    }
    
    const videoOverlay = document.createElement('div');
    videoOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
    `;
    
    const video = document.createElement('video');
    video.src = '../media/chanclas.webm';
    video.autoplay = true;
    video.loop = false;
    video.muted = false;
    video.volume = 0.5;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: contrast(1.15) brightness(1.05) saturate(1.1);
      mix-blend-mode: screen;
    `;
    
    videoOverlay.appendChild(video);
    document.body.appendChild(videoOverlay);
    
    video.play().catch(err => console.log('Video playback failed:', err));
    
    const removeOverlay = () => {
      videoOverlay.style.transition = 'opacity 0.5s';
      videoOverlay.style.opacity = '0';
      
      setTimeout(() => {
        videoOverlay.remove();
        window.easterEggLock.release();
      }, 500);
    };
    
    video.addEventListener('ended', removeOverlay);
    
    videoOverlay.addEventListener('click', (e) => {
      if (e.target === videoOverlay) {
        removeOverlay();
      }
    });
  });
});
