document.addEventListener('DOMContentLoaded', () => {
  const eltiaName = document.querySelector('[data-eltia]');
  
  if (!eltiaName) return;
  
  let isPlaying = false;
  
  eltiaName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    if (!window.easterEggLock.acquire('Eltia')) {
      return;
    }
    
    isPlaying = true;
    
    const beerOverlay = document.createElement('div');
    beerOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      right: -600px;
      transform: translateY(-50%);
      z-index: 99999;
      pointer-events: none;
    `;
    
    const video = document.createElement('video');
    video.src = '../media/eltia.webm';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.cssText = `
      width: 500px;
      height: auto;
      filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
    `;
    
    beerOverlay.appendChild(video);
    document.body.appendChild(beerOverlay);
    
    video.play().catch(err => console.log('Video playback failed:', err));
    
    const targetCenter = window.innerWidth / 2 - 250;
    
    const slideInKeyframes = `
      @keyframes slideInWithTilt {
        0% {
          right: -600px;
          transform: translateY(-50%) rotate(15deg);
        }
        60% {
          transform: translateY(-50%) rotate(-8deg);
        }
        100% {
          right: ${targetCenter}px;
          transform: translateY(-50%) rotate(0deg);
        }
      }
    `;
    
    const slideOutKeyframes = `
      @keyframes slideOutWithTilt {
        0% {
          right: ${targetCenter}px;
          transform: translateY(-50%) rotate(0deg);
        }
        40% {
          transform: translateY(-50%) rotate(8deg);
        }
        100% {
          right: ${window.innerWidth + 600}px;
          transform: translateY(-50%) rotate(-15deg);
        }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = slideInKeyframes + slideOutKeyframes;
    document.head.appendChild(style);
    
    const slideSound = new Audio('../media/eltia.mp3');
    slideSound.volume = 0.5;
    slideSound.play().catch(err => console.log('Slide sound failed:', err));
    
    setTimeout(() => {
      beerOverlay.style.animation = 'slideInWithTilt 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }, 500);
    
    setTimeout(() => {
      setTimeout(() => {
        beerOverlay.style.animation = 'slideOutWithTilt 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
        
        setTimeout(() => {
          beerOverlay.remove();
          isPlaying = false;
          window.easterEggLock.release();
        }, 1000);
      }, 2000);
    }, 800);
  });
});
