document.addEventListener('DOMContentLoaded', () => {
  const sosynName = document.querySelector('[data-sosyn]');
  
  if (!sosynName) return;
  
  let isPlaying = false;
  let stopButton = null;
  
  sosynName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    if (!window.easterEggLock.acquire('Sosyn')) {
      return;
    }
    
    isPlaying = true;
    
    const audio = new Audio('../media/sosyn.mp3');
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
    
    // Bouton stop
    stopButton = document.createElement('button');
    stopButton.textContent = '⏹';
    stopButton.style.cssText = `
      margin-left: 10px;
      padding: 4px 8px;
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid rgba(168, 85, 247, 0.5);
      border-radius: 4px;
      color: rgba(168, 85, 247, 1);
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    `;
    stopButton.onmouseover = () => {
      stopButton.style.background = 'rgba(168, 85, 247, 0.4)';
      stopButton.style.borderColor = 'rgba(168, 85, 247, 0.8)';
    };
    stopButton.onmouseout = () => {
      stopButton.style.background = 'rgba(168, 85, 247, 0.2)';
      stopButton.style.borderColor = 'rgba(168, 85, 247, 0.5)';
    };
    
    sosynName.parentElement.appendChild(stopButton);
    
    // Fond disco animé
    const discoBackground = document.createElement('div');
    discoBackground.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -2;
      pointer-events: none;
      background: linear-gradient(45deg, #a855f7, #ff2a3d, #8b5cf6, #ff6b6b, #c084fc, #ff4556);
      background-size: 400% 400%;
      animation: sosynDisco 3s ease infinite;
      opacity: 0;
      transition: opacity 0.5s;
    `;
    
    // Keyframes pour l'effet disco
    const discoKeyframes = `
      @keyframes sosynDisco {
        0% { background-position: 0% 50%; }
        25% { background-position: 100% 50%; }
        50% { background-position: 100% 100%; }
        75% { background-position: 50% 0%; }
        100% { background-position: 0% 50%; }
      }
    `;
    const discoStyle = document.createElement('style');
    discoStyle.textContent = discoKeyframes;
    document.head.appendChild(discoStyle);
    
    document.body.appendChild(discoBackground);
    
    // Fade in du fond disco
    setTimeout(() => {
      discoBackground.style.opacity = '0.4';
    }, 100);
    
    // Conteneur pour les particules (au-dessus du fond disco)
    const particlesContainer = document.createElement('div');
    particlesContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99998;
      pointer-events: none;
      overflow: hidden;
    `;
    document.body.appendChild(particlesContainer);
    
    // Fonction pour créer des particules
    const particles = [];
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('img');
      const useImage1 = Math.random() > 0.5;
      particle.src = useImage1 ? '../media/sosyn_1.png' : '../media/sosyn_2.png';
      
      const animName = `sosynParticle${i}`;
      const startX = Math.random() * 120 - 10;
      const startY = Math.random() * 120 - 10;
      const midX = Math.random() * 120 - 10;
      const midY = Math.random() * 120 - 10;
      const endX = Math.random() * 120 - 10;
      const endY = Math.random() * 120 - 10;
      const duration = 10 + Math.random() * 8;
      const delay = Math.random() * 3;
      const rotationSpeed = 2 + Math.random() * 3;
      
      particle.style.cssText = `
        position: absolute;
        width: 120px;
        height: 120px;
        object-fit: contain;
        opacity: 0;
        animation: ${animName} ${duration}s ease-in-out ${delay}s infinite, sosynRotate ${rotationSpeed}s linear infinite;
        filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.6));
      `;
      
      const keyframes = `
        @keyframes ${animName} {
          0% {
            left: ${startX}%;
            top: ${startY}%;
            opacity: 0;
            transform: scale(0.8);
          }
          10% {
            opacity: 0.9;
            transform: scale(1);
          }
          33% {
            left: ${midX}%;
            top: ${midY}%;
            opacity: 0.95;
          }
          66% {
            left: ${endX}%;
            top: ${endY}%;
            opacity: 0.9;
          }
          90% {
            opacity: 0.85;
            transform: scale(0.9);
          }
          100% {
            left: ${startX}%;
            top: ${startY}%;
            opacity: 0;
            transform: scale(0.7);
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      particlesContainer.appendChild(particle);
      particles.push(particle);
    }
    
    // Animation de rotation continue
    const rotationKeyframes = `
      @keyframes sosynRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    const rotationStyle = document.createElement('style');
    rotationStyle.textContent = rotationKeyframes;
    document.head.appendChild(rotationStyle);
    
    // Fonction d'arrêt
    const stopEverything = () => {
      let currentVolume = audio.volume;
      const fadeOutInterval = setInterval(() => {
        if (currentVolume > 0) {
          currentVolume -= 0.05;
          audio.volume = Math.max(currentVolume, 0);
        } else {
          clearInterval(fadeOutInterval);
          audio.pause();
        }
      }, 20);
      
      discoBackground.style.transition = 'opacity 0.5s';
      discoBackground.style.opacity = '0';
      particlesContainer.style.transition = 'opacity 0.5s';
      particlesContainer.style.opacity = '0';
      
      if (stopButton && stopButton.parentElement) {
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
        discoBackground.remove();
        particlesContainer.remove();
        isPlaying = false;
        window.easterEggLock.release();
      }, 500);
    };
    
    stopButton.onclick = stopEverything;
    
    audio.addEventListener('ended', stopEverything);
  });
});
