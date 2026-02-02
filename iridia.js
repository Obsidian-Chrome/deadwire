document.addEventListener('DOMContentLoaded', () => {
  const iridiaName = document.querySelector('[data-iridia]');
  
  if (!iridiaName) return;
  
  let isPlaying = false;
  let stopButton = null;
  
  iridiaName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    if (!window.easterEggLock.acquire('Iridia')) {
      return;
    }
    
    isPlaying = true;
    
    const audio = new Audio('../media/neonveins.mp3');
    audio.volume = 0;
    audio.play().catch(err => console.log('Audio playback failed:', err));
    
    let currentVolume = 0;
    const targetVolume = 0.25;
    const fadeInInterval = setInterval(() => {
      if (currentVolume < targetVolume) {
        currentVolume += 0.01;
        audio.volume = Math.min(currentVolume, targetVolume);
      } else {
        clearInterval(fadeInInterval);
      }
    }, 20);
    
    stopButton = document.createElement('button');
    stopButton.textContent = '⏹';
    stopButton.style.cssText = `
      margin-left: 10px;
      padding: 4px 8px;
      background: rgba(142, 68, 173, 0.2);
      border: 1px solid rgba(155, 89, 182, 0.5);
      border-radius: 4px;
      color: rgba(155, 89, 182, 1);
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    `;
    stopButton.onmouseover = () => {
      stopButton.style.background = 'rgba(142, 68, 173, 0.4)';
      stopButton.style.borderColor = 'rgba(155, 89, 182, 0.8)';
    };
    stopButton.onmouseout = () => {
      stopButton.style.background = 'rgba(142, 68, 173, 0.2)';
      stopButton.style.borderColor = 'rgba(155, 89, 182, 0.5)';
    };
    
    iridiaName.parentElement.appendChild(stopButton);
    
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    const videoOverlay = document.createElement('div');
    videoOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${pageHeight}px;
      z-index: -1;
      pointer-events: none;
      overflow: hidden;
      opacity: 0;
      transition: opacity 0.5s;
    `;
    
    const video = document.createElement('video');
    video.src = '../media/fond_iridia.webm';
    video.loop = true;
    video.muted = true;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    
    videoOverlay.appendChild(video);
    
    const elementsToFilter = document.querySelectorAll('.topbar, main, .footer');
    elementsToFilter.forEach(el => {
      el.style.filter = 'hue-rotate(270deg) saturate(1.5)';
    });
    
    document.body.appendChild(videoOverlay);
    
    video.play().catch(err => console.log('Video playback failed:', err));
    
    setTimeout(() => {
      videoOverlay.style.opacity = '1';
    }, 50);
    
    const stopEverything = () => {
      const fadeOutInterval = setInterval(() => {
        if (audio.volume > 0.01) {
          audio.volume = Math.max(audio.volume - 0.01, 0);
        } else {
          clearInterval(fadeOutInterval);
          audio.pause();
        }
      }, 20);
      
      videoOverlay.style.transition = 'opacity 0.5s';
      videoOverlay.style.opacity = '0';
      
      elementsToFilter.forEach(el => {
        el.style.transition = 'filter 0.5s';
        el.style.filter = '';
      });
      
      if (stopButton) {
        stopButton.style.transition = 'opacity 0.3s';
        stopButton.style.opacity = '0';
        setTimeout(() => {
          if (stopButton && stopButton.parentElement) {
            stopButton.remove();
          }
          stopButton = null;
        }, 300);
      }
      
      setTimeout(() => {
        video.pause();
        videoOverlay.remove();
        isPlaying = false;
        window.easterEggLock.release();
      }, 500);
    };
    
    stopButton.onclick = stopEverything;
    
    const autoStopTimeout = setTimeout(stopEverything, 169000);
  });
});
