document.addEventListener('DOMContentLoaded', () => {
  const bunbunName = document.querySelector('[data-bunbun]');
  
  if (!bunbunName) return;
  
  bunbunName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!window.easterEggLock.acquire('Bunbun')) {
      return;
    }
    
    const audio = new Audio('../media/bunbun.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio playback failed:', err));
    
    const overlay = document.createElement('div');
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${pageHeight}px;
      z-index: 9999;
      pointer-events: none;
      overflow: hidden;
    `;
    
    const bunnyCount = 15;
    const bunnies = [];
    
    for (let i = 0; i < bunnyCount; i++) {
      const bunny = document.createElement('div');
      const animName = `bunnyJump${i}`;
      bunny.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 40 + 30}px;
        animation: ${animName} ${Math.random() * 2 + 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 0.2}s;
        left: ${Math.random() * 100}%;
        top: -100px;
        filter: hue-rotate(290deg) saturate(2) brightness(1.2) drop-shadow(0 0 12px rgba(255, 105, 180, 0.9));
      `;
      bunny.textContent = '🐰';
      
      const keyframes = `
        @keyframes ${animName} {
          0%, 100% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(${pageHeight / 2}px) rotate(${Math.random() * 360}deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(${pageHeight + 100}px) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      overlay.appendChild(bunny);
      bunnies.push(bunny);
    }
    
    document.body.style.filter = 'hue-rotate(320deg) saturate(1.5)';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s';
      overlay.style.opacity = '0';
      document.body.style.transition = 'filter 0.5s';
      document.body.style.filter = '';
      
      setTimeout(() => {
        overlay.remove();
        window.easterEggLock.release();
      }, 500);
    }, 3500);
  });
});
