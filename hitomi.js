document.addEventListener('DOMContentLoaded', () => {
  const hitomiName = document.querySelector('[data-hitomi]');
  
  if (!hitomiName) return;
  
  let isPlaying = false;
  let stopButton = null;
  
  hitomiName.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (isPlaying) return;
    
    if (!window.easterEggLock.acquire('Hitomi')) {
      return;
    }
    
    isPlaying = true;
    
    const audio = new Audio('../media/hitomi.mp3');
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
      background: rgba(74, 158, 255, 0.2);
      border: 1px solid rgba(74, 158, 255, 0.5);
      border-radius: 4px;
      color: rgba(74, 158, 255, 1);
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    `;
    stopButton.onmouseover = () => {
      stopButton.style.background = 'rgba(74, 158, 255, 0.4)';
      stopButton.style.borderColor = 'rgba(74, 158, 255, 0.8)';
    };
    stopButton.onmouseout = () => {
      stopButton.style.background = 'rgba(74, 158, 255, 0.2)';
      stopButton.style.borderColor = 'rgba(74, 158, 255, 0.5)';
    };
    
    hitomiName.parentElement.appendChild(stopButton);
    
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    const emojiOverlay = document.createElement('div');
    emojiOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: ${pageHeight}px;
      z-index: 9999;
      pointer-events: none;
      overflow: hidden;
    `;
    
    const cuteKaomoji = [
      '⸜(｡˃ ᵕ ˂ )⸝♡',
      'ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧',
      '(˶ᵔ ᵕ ᵔ˶)',
      '✧｡٩(ˊᗜˋ )و✧*｡',
      '₍₍⚞(˶˃ ꒳ ˂˶)⚟⁾⁾',
      '(˶˃ ᵕ ˂˶)',
      '(˶ᵔ ᵕ ᵔ˶) ‹𝟹',
      'ᕙ( •̀ ᗜ •́ )ᕗ',
      '◝(ᵔᗜᵔ)◜',
      'ദ്ദി ˉ͈̀꒳ˉ͈́ )✧',
      '(˶ˆᗜˆ˵)',
      '(..◜ᴗ◝..)',
      '( ꈍ◡ꈍ)',
      '≽(•⩊ •マ≼',
      '(づ> v <)づ♡'
    ];
    const kaomojiCount = 30;
    const kaomojis = [];
    
    for (let i = 0; i < kaomojiCount; i++) {
      const kaomoji = document.createElement('div');
      const randomKaomoji = cuteKaomoji[Math.floor(Math.random() * cuteKaomoji.length)];
      const animName = `kaomojiMove${i}`;
      const colorAnimName = `kaomojiColor${i}`;
      const randomY = Math.random() * 100;
      const duration = Math.random() * 10 + 8;
      const delay = Math.random() * 6;
      
      kaomoji.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 16}px;
        left: -200px;
        top: ${randomY}%;
        animation: ${animName} ${duration}s linear infinite, ${colorAnimName} 3s linear infinite;
        animation-delay: ${delay}s;
        font-weight: bold;
        text-shadow: 0 0 10px currentColor;
        white-space: nowrap;
      `;
      kaomoji.textContent = randomKaomoji;
      
      const keyframes = `
        @keyframes ${animName} {
          0% {
            left: -200px;
          }
          100% {
            left: calc(100% + 200px);
          }
        }
        @keyframes ${colorAnimName} {
          0% {
            color: #ff0080;
          }
          14% {
            color: #ff8000;
          }
          28% {
            color: #ffff00;
          }
          42% {
            color: #00ff00;
          }
          57% {
            color: #00ffff;
          }
          71% {
            color: #0080ff;
          }
          85% {
            color: #8000ff;
          }
          100% {
            color: #ff0080;
          }
        }
      `;
      
      const style = document.createElement('style');
      style.textContent = keyframes;
      document.head.appendChild(style);
      
      emojiOverlay.appendChild(kaomoji);
      kaomojis.push(kaomoji);
    }
    
    document.body.appendChild(emojiOverlay);
    
    const elementsToFilter = document.querySelectorAll('.topbar, main, .footer');
    let hueValue = 0;
    
    const colorChangeInterval = setInterval(() => {
      hueValue = (hueValue + 2) % 360;
      elementsToFilter.forEach(el => {
        el.style.filter = `hue-rotate(${hueValue}deg) saturate(1.5)`;
      });
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
      
      clearInterval(colorChangeInterval);
      
      elementsToFilter.forEach(el => {
        el.style.transition = 'filter 0.5s';
        el.style.filter = '';
      });
      
      emojiOverlay.style.transition = 'opacity 0.5s';
      emojiOverlay.style.opacity = '0';
      
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
        emojiOverlay.remove();
        isPlaying = false;
        window.easterEggLock.release();
      }, 500);
    };
    
    stopButton.onclick = stopEverything;
    
    const autoStopTimeout = setTimeout(stopEverything, 374000);
  });
});
