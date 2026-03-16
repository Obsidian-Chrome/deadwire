import * as THREE from 'three';

(() => {
  let scene, camera, renderer;
  let shaderMaterial;
  let time = 0;
  
  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let bufferLength = 0;
  let lowFreq = 0, midFreq = 0, highFreq = 0;
  let kickEnergy = 0;
  let kickDecay = 0.8;
  let isVisualizerActive = false;
  let transitionFactor = 0;
  let animationId = null;
  
  const trackDisplay = document.querySelector('[data-visualizer-track]');
  const canvasElement = document.querySelector('[data-visualizer]');

  if (!canvasElement) return;

  // Vertex shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment shader adapté pour Deadwire (rouge néon)
  const fragmentShader = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float lowFreq;
    uniform float midFreq;
    uniform float highFreq;
    uniform float kickEnergy;
    uniform float transitionFactor;
    varying vec2 vUv;

    float squared(float value) { return value * value; }

    void main() {
      vec2 p = vUv;
      
      // Fond transparent pour voir le BG du site
      vec3 bgCol = vec3(0.0);
      
      float bassPulse = squared(lowFreq) * 0.4 * transitionFactor;
      float midPulse = squared(midFreq) * 0.5 * transitionFactor;
      float kickPulse = squared(kickEnergy) * 0.6 * transitionFactor;
      
      float curve = (0.05 + 0.08 * (bassPulse + kickPulse)) * sin(6.25 * p.x + iTime);
      float audioWave = (0.1 * sin(p.x * 20.0) * bassPulse + 0.08 * sin(p.x * 30.0) * midPulse) * transitionFactor;
      
      // Rouge néon Deadwire uniquement - #FF2A3D avec variations d'intensité
      vec3 neonRed = vec3(1.0, 0.165, 0.239); // #FF2A3D
      vec3 darkRed = vec3(0.6, 0.0, 0.1);
      vec3 brightRed = vec3(1.0, 0.3, 0.4);
      
      // Ligne A (Bass/Kick) - Rouge néon vif
      float lineAY = 0.5 + curve + audioWave + 0.05 * sin(40.0 * p.x - 1.5 * iTime) * bassPulse;
      float lineADist = distance(p.y, lineAY) * 0.55;
      float lineAShape = smoothstep(1.0 - clamp(lineADist, 0.0, 1.0), 1.0, 0.99);
      vec3 lineACol = (1.0 - lineAShape) * mix(neonRed, darkRed, lineAShape);
      
      // Ligne B (Mid) - Rouge néon lumineux
      float lineBY = 0.5 + curve - audioWave * 0.7 + 0.05 * sin(50.0 * p.x + 2.0 * iTime) * midPulse;
      float lineBDist = distance(p.y, lineBY) * 0.55;
      float lineBShape = smoothstep(1.0 - clamp(lineBDist, 0.0, 1.0), 1.0, 0.99);
      vec3 lineBCol = (1.0 - lineBShape) * mix(brightRed, neonRed, lineBShape);
      
      // Ligne C (High) - Rouge néon intense
      float lineCY = 0.5 + curve * 0.7 - audioWave * 0.5 + 0.05 * sin(60.0 * p.x + 2.5 * iTime) * (midPulse + kickPulse * 0.5);
      float lineCDist = distance(p.y, lineCY) * 0.55;
      float lineCShape = smoothstep(1.0 - clamp(lineCDist, 0.0, 1.0), 1.0, 0.99);
      vec3 lineCCol = (1.0 - lineCShape) * mix(neonRed, vec3(0.8, 0.1, 0.15), lineCShape);
      
      vec3 fcolor = bgCol + lineACol + lineBCol + lineCCol;
      gl_FragColor = vec4(fcolor, 1.0);
    }
  `;

  // Initialise Three.js
  function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ 
      canvas: canvasElement,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iTime: { value: 0 },
        lowFreq: { value: 0 },
        midFreq: { value: 0 },
        highFreq: { value: 0 },
        kickEnergy: { value: 0 },
        transitionFactor: { value: 0 }
      }
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    });
  }

  // Initialise le contexte audio
  const initAudioContext = () => {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  };

  // Connecte l'audio
  const connectAudioSource = () => {
    let attemptCount = 0;
    const maxAttempts = 50;
    
    const checkAudio = setInterval(() => {
      attemptCount++;
      
      if (attemptCount > maxAttempts) {
        console.warn('Visualizer: Timeout');
        clearInterval(checkAudio);
        return;
      }
      
      if (window.deadwireRadio && window.deadwireRadio.getAudio) {
        const radioAudio = window.deadwireRadio.getAudio();
        
        if (radioAudio && radioAudio.src && !radioAudio.dataset.visualizerConnected) {
          try {
            const source = audioContext.createMediaElementSource(radioAudio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            radioAudio.dataset.visualizerConnected = 'true';
            console.log('Visualizer: Audio connecté ✓');
            clearInterval(checkAudio);
          } catch (error) {
            console.warn('Visualizer:', error);
            clearInterval(checkAudio);
          }
        }
      }
    }, 100);
  };

  // Analyse audio
  function updateFrequencies() {
    if (!isVisualizerActive || !analyser) return;

    analyser.getByteFrequencyData(dataArray);

    // Bass (20-160Hz)
    const bassSlice = dataArray.slice(1, 20);
    const bassAvg = bassSlice.reduce((sum, val) => sum + val, 0) / bassSlice.length / 255;
    lowFreq = lowFreq * 0.7 + bassAvg * 0.3;

    // Mid (160-1280Hz)
    const midSlice = dataArray.slice(20, 160);
    const midAvg = midSlice.reduce((sum, val) => sum + val, 0) / midSlice.length / 255;
    midFreq = midFreq * 0.7 + midAvg * 0.3;

    // High (1280Hz+)
    const highSlice = dataArray.slice(160, 300);
    const highAvg = highSlice.reduce((sum, val) => sum + val, 0) / highSlice.length / 255;
    highFreq = highFreq * 0.7 + highAvg * 0.3;

    // Kick detection
    const kickSlice = dataArray.slice(4, 9);
    const kickAvg = kickSlice.reduce((sum, val) => sum + val, 0) / kickSlice.length / 255;
    if (kickAvg > 0.6) {
      kickEnergy = Math.max(kickEnergy, kickAvg);
    } else {
      kickEnergy *= kickDecay;
    }

    shaderMaterial.uniforms.lowFreq.value = lowFreq;
    shaderMaterial.uniforms.midFreq.value = midFreq;
    shaderMaterial.uniforms.highFreq.value = highFreq;
    shaderMaterial.uniforms.kickEnergy.value = kickEnergy;
  }

  // Animation loop
  function animate() {
    if (!isVisualizerActive) return;
    
    animationId = requestAnimationFrame(animate);

    time += 0.01;
    shaderMaterial.uniforms.iTime.value = time;

    // Transition
    if (transitionFactor < 1.0) {
      transitionFactor = Math.min(transitionFactor + 0.03, 1.0);
      shaderMaterial.uniforms.transitionFactor.value = transitionFactor;
    }

    updateFrequencies();
    renderer.render(scene, camera);
  }

  // Met à jour le titre
  const updateTrackDisplay = () => {
    if (window.deadwireRadio && trackDisplay) {
      const { track } = window.deadwireRadio.getCurrentTrack();
      if (track) {
        const displayText = track.artist ? `${track.artist} - ${track.title}` : track.title;
        const textElement = trackDisplay.querySelector('.visualizerTrackInfo__text');
        if (textElement) {
          textElement.textContent = displayText;
        }
      }
    }
  };

  // Démarre le visualizer
  const startVisualizer = async () => {
    if (isVisualizerActive) return;

    initThree();
    initAudioContext();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const playBtn = document.querySelector('[data-radio-play]');
    if (playBtn && !playBtn.classList.contains('is-playing')) {
      playBtn.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    connectAudioSource();

    isVisualizerActive = true;
    animate();
    updateTrackDisplay();

    setInterval(() => {
      updateTrackDisplay();
      
      if (window.deadwireRadio && window.deadwireRadio.getAudio) {
        const currentAudio = window.deadwireRadio.getAudio();
        if (currentAudio && !currentAudio.dataset.visualizerConnected) {
          connectAudioSource();
        }
      }
    }, 5000);
  };

  // Démarre au premier clic/touch
  let hasStarted = false;
  
  const startEverything = () => {
    if (hasStarted) return;
    hasStarted = true;
    
    const overlay = document.querySelector('[data-start-overlay]');
    const playBtn = document.querySelector('[data-radio-play]');
    
    // Cache l'overlay immédiatement
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => overlay.remove(), 300);
    }
    
    // Démarre la radio
    if (playBtn && !playBtn.classList.contains('is-playing')) {
      playBtn.click();
    }
    
    setTimeout(() => {
      startVisualizer();
      updateTrackDisplay();
    }, 400);
  };

  // Attend le premier clic sur l'overlay
  const overlay = document.querySelector('[data-start-overlay]');
  if (overlay) {
    const handleStart = () => {
      if (window.deadwireRadio && window.deadwireRadio.getPlaylist().length > 0) {
        startEverything();
      } else {
        // Attend que la playlist soit chargée
        const checkPlaylist = setInterval(() => {
          if (window.deadwireRadio && window.deadwireRadio.getPlaylist().length > 0) {
            clearInterval(checkPlaylist);
            startEverything();
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkPlaylist), 5000);
      }
    };
    
    overlay.addEventListener('click', handleStart);
    overlay.addEventListener('touchstart', handleStart, { passive: true });
  }

  // Vérifie si l'utilisateur a déjà interagi
  const hasInteractedBefore = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  };

  // Essaye autoplay si déjà interagi, sinon attend clic
  const initAutoplay = () => {
    const overlay = document.querySelector('[data-start-overlay]');
    
    if (hasInteractedBefore()) {
      // Utilisateur a déjà interagi - essaye autoplay
      console.log('Tentative autoplay (utilisateur connu)');
      
      // Cache l'overlay par défaut
      if (overlay) {
        overlay.style.display = 'none';
      }
      
      // Essaye de démarrer automatiquement
      const tryAutoplay = () => {
        if (window.deadwireRadio && window.deadwireRadio.getPlaylist().length > 0) {
          const playBtn = document.querySelector('[data-radio-play]');
          
          if (playBtn && !playBtn.classList.contains('is-playing')) {
            playBtn.click();
            
            // Vérifie si ça a marché après un court délai
            setTimeout(() => {
              if (!playBtn.classList.contains('is-playing')) {
                // Autoplay bloqué - réaffiche l'overlay
                console.log('Autoplay bloqué, affichage overlay');
                if (overlay) {
                  overlay.style.display = 'block';
                }
              } else {
                // Autoplay réussi !
                console.log('Autoplay réussi ✓');
                setTimeout(() => {
                  startVisualizer();
                  updateTrackDisplay();
                }, 400);
              }
            }, 500);
          }
        } else {
          setTimeout(tryAutoplay, 200);
        }
      };
      
      tryAutoplay();
    } else {
      // Première visite - affiche l'overlay
      console.log('Première visite - overlay requis');
    }
  };

  // Lance le système au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoplay);
  } else {
    setTimeout(initAutoplay, 100);
  }

})();
