document.addEventListener('DOMContentLoaded', () => {
  const haydenName = document.querySelector('[data-hayden]');
  
  if (!haydenName) return;
  
  let isPlaying = false;
  
  haydenName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    if (!window.easterEggLock.acquire('Hayden')) {
      return;
    }
    
    isPlaying = true;
    
    // Joue hayden1.mp3 au lancement
    const audio1 = new Audio('../media/hayden1.mp3');
    audio1.volume = 0.15;
    audio1.play().catch(err => console.log('Audio playback failed:', err));
    
    // Première vidéo glitch en plein écran
    const glitchOverlay1 = document.createElement('div');
    glitchOverlay1.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
    `;
    
    const glitchVideo1 = document.createElement('video');
    glitchVideo1.src = '../media/glitch_hayden.webm';
    glitchVideo1.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    glitchVideo1.autoplay = true;
    glitchVideo1.muted = false;
    glitchVideo1.volume = 0.5;
    
    glitchOverlay1.appendChild(glitchVideo1);
    document.body.appendChild(glitchOverlay1);
    
    // Lance immédiatement hayden.webm en arrière-plan avec wrapper fixe
    const videoWrapper = document.createElement('div');
    videoWrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
    `;
    
    const backgroundVideo = document.createElement('video');
    backgroundVideo.src = '../media/hayden.webm';
    backgroundVideo.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    backgroundVideo.autoplay = true;
    backgroundVideo.muted = false;
    backgroundVideo.volume = 0.5;
    backgroundVideo.loop = false;
    
    videoWrapper.appendChild(backgroundVideo);
    document.body.appendChild(videoWrapper);
    
    // Crée un overlay de filtre rouge
    const filterOverlay = document.createElement('div');
    filterOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99998;
      pointer-events: none;
      background: rgba(255, 42, 61, 0.15);
      mix-blend-mode: multiply;
      opacity: 0;
      transition: opacity 0.8s ease-in-out;
    `;
    document.body.appendChild(filterOverlay);
    
    // Fade in après un court délai
    setTimeout(() => {
      videoWrapper.style.opacity = '1';
      filterOverlay.style.opacity = '1';
    }, 50);
      
    // Retire le premier glitch après un court moment
    setTimeout(() => {
      glitchOverlay1.remove();
    }, 500);
    
    // 10s après le début, lance le second glitch
    setTimeout(() => {
      // Fade out de la vidéo de fond et du filtre
      videoWrapper.style.opacity = '0';
      filterOverlay.style.opacity = '0';
      
      // Joue hayden2.mp3 au second glitch
      const audio2 = new Audio('../media/hayden2.mp3');
      audio2.volume = 0.15;
      audio2.play().catch(err => console.log('Audio playback failed:', err));
      
      const glitchOverlay2 = document.createElement('div');
      glitchOverlay2.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
      `;
      
      const glitchVideo2 = document.createElement('video');
      glitchVideo2.src = '../media/glitch_hayden.webm';
      glitchVideo2.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
      glitchVideo2.autoplay = true;
      glitchVideo2.muted = false;
      glitchVideo2.volume = 0.5;
      
      glitchOverlay2.appendChild(glitchVideo2);
      document.body.appendChild(glitchOverlay2);
      
      // Quand le second glitch se termine, nettoie tout
      glitchVideo2.addEventListener('ended', () => {
        setTimeout(() => {
          glitchOverlay2.remove();
          videoWrapper.remove();
          filterOverlay.remove();
          isPlaying = false;
          window.easterEggLock.release();
        }, 200);
      });
    }, 10000);
  });
});
