document.addEventListener('DOMContentLoaded', () => {
  const selimName = document.querySelector('[data-selim]');
  
  if (!selimName) return;
  
  let isPlaying = false;
  
  selimName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    isPlaying = true;
    
    const videoOverlay = document.createElement('div');
    videoOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
    `;
    
    const video = document.createElement('video');
    video.src = '../media/selim.webm';
    video.autoplay = true;
    video.loop = false;
    video.muted = true;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    
    videoOverlay.appendChild(video);
    document.body.appendChild(videoOverlay);
    
    video.play().catch(err => console.log('Video playback failed:', err));
    
    let audio = null;
    let audioTimeout = null;
    
    setTimeout(() => {
      audio = new Audio('../media/selim.mp3');
      audio.volume = 0;
      audio.play().catch(err => console.log('Audio playback failed:', err));
      
      let currentVolume = 0;
      const targetVolume = 0.125;
      const fadeInInterval = setInterval(() => {
        if (currentVolume < targetVolume) {
          currentVolume += 0.01;
          audio.volume = Math.min(currentVolume, targetVolume);
        } else {
          clearInterval(fadeInInterval);
        }
      }, 20);
      
      audio.addEventListener('ended', () => {
        isPlaying = false;
      });
    }, 1500);
    
    video.addEventListener('ended', () => {
      videoOverlay.remove();
      
      const flashOverlay = document.createElement('div');
      flashOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99998;
        background: white;
        pointer-events: none;
        animation: flashbang 1s ease-out forwards;
      `;
      
      const flashKeyframes = `
        @keyframes flashbang {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = flashKeyframes;
      document.head.appendChild(style);
      
      document.body.appendChild(flashOverlay);
      
      setTimeout(() => {
        flashOverlay.remove();
      }, 1000);
    });
  });
});
