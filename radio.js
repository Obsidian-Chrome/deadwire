(() => {
  let playlist = [];
  let currentTrackIndex = -1;
  let audio = null;
  let isPlaying = false;
  let volume = 0.2;
  let totalPlaylistDuration = 0;
  let shouldLoop = true;

  const playPauseBtn = document.querySelector('[data-radio-play]');
  const volumeSlider = document.querySelector('[data-radio-volume]');
  const trackTitle = document.querySelector('[data-radio-title]');
  const radioBar = document.querySelector('[data-radio-bar]');
  const toggleBtn = document.querySelector('[data-radio-toggle]');

  if (!playPauseBtn || !volumeSlider || !trackTitle || !radioBar || !toggleBtn) return;

  const isRootPath = () => {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html' || !path.includes('/');
  };

  const loadPlaylist = async () => {
    try {
      const playlistPath = isRootPath() ? 'playlist.json' : '../playlist.json';
      const response = await fetch(playlistPath);
      const data = await response.json();
      
      const pathPrefix = isRootPath() ? '' : '../';
      playlist = data.tracks.map(track => ({
        ...track,
        file: pathPrefix + track.file
      }));
      shouldLoop = data.loop !== false;
      
      totalPlaylistDuration = playlist.reduce((sum, track) => sum + track.duration, 0);
      
      console.log(`Radio: ${playlist.length} pistes chargées (${totalPlaylistDuration}s) - Loop: ${shouldLoop}`);
      return true;
    } catch (error) {
      console.error('Erreur chargement playlist:', error);
      return false;
    }
  };

  const getCurrentTrackByUTC = () => {
    if (!shouldLoop && playlist.length === 1) {
      return { index: 0, offset: 0 };
    }

    const now = Date.now() / 1000;
    const cyclePosition = now % totalPlaylistDuration;
    
    let accumulatedTime = 0;
    for (let i = 0; i < playlist.length; i++) {
      const track = playlist[i];
      if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + track.duration) {
        const offsetInTrack = cyclePosition - accumulatedTime;
        return { index: i, offset: offsetInTrack };
      }
      accumulatedTime += track.duration;
    }
    
    return { index: 0, offset: 0 };
  };

  const updateTrackDisplay = (track) => {
    if (trackTitle) {
      const displayText = track.artist ? `${track.artist} - ${track.title}` : track.title;
      trackTitle.textContent = displayText;
    }
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Titre inconnu',
        artist: track.artist || 'Artiste inconnu',
        album: 'Deadwire Radio'
      });
    }
  };

  const updateProgress = () => {
    if (audio && trackTitle && isPlaying) {
      const progress = (audio.currentTime / audio.duration) * 100;
      trackTitle.style.setProperty('--progress', `${progress}%`);
    }
    if (isPlaying) {
      requestAnimationFrame(updateProgress);
    }
  };

  const syncPlayback = async () => {
    if (!isPlaying || playlist.length === 0) return;

    const { index, offset } = getCurrentTrackByUTC();
    const track = playlist[index];

    if (index !== currentTrackIndex) {
      currentTrackIndex = index;
      
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      audio = new Audio(track.file);
      audio.volume = volume;
      audio.currentTime = offset;
      audio.loop = shouldLoop && playlist.length === 1;
      
      updateTrackDisplay(track);
      
      audio.play().catch(err => {
        console.warn('Lecture automatique bloquée:', err);
      });

      audio.addEventListener('ended', () => {
        if (shouldLoop) {
          syncPlayback();
        } else {
          stopRadio();
        }
      });
    } else {
      const currentTime = audio ? audio.currentTime : 0;
      const drift = Math.abs(currentTime - offset);
      
      if (drift > 2 && audio) {
        audio.currentTime = offset;
        console.log(`Resync: ${drift.toFixed(1)}s drift`);
      }
      
      if (audio && audio.paused) {
        audio.play().catch(err => {
          console.warn('Lecture automatique bloquée:', err);
        });
      }
    }
  };

  const startRadio = async () => {
    if (playlist.length === 0) {
      const loaded = await loadPlaylist();
      if (!loaded) return;
    }

    isPlaying = true;
    playPauseBtn?.classList.add('is-playing');
    radioBar?.classList.add('is-playing');
    const icon = playPauseBtn?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
    }
    
    await syncPlayback();
    updateProgress();
    
    setInterval(() => {
      if (isPlaying) syncPlayback();
    }, 30000);
  };

  const stopRadio = () => {
    isPlaying = false;
    playPauseBtn?.classList.remove('is-playing');
    radioBar?.classList.remove('is-playing');
    const icon = playPauseBtn?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
    }
    
    if (audio) {
      audio.pause();
    }
    
    if (trackTitle) {
      trackTitle.style.setProperty('--progress', '0%');
    }
  };

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopRadio();
    } else {
      startRadio();
    }
  });

  toggleBtn.addEventListener('click', () => {
    radioBar.classList.toggle('is-expanded');
    toggleBtn.classList.toggle('is-active');
  });

  volumeSlider.addEventListener('input', (e) => {
    volume = parseFloat(e.target.value);
    if (audio) {
      audio.volume = volume;
    }
  });

  loadPlaylist();

  window.deadwireRadio = {
    getCurrentTrack: () => {
      const { index, offset } = getCurrentTrackByUTC();
      return { track: playlist[index], offset };
    },
    getPlaylist: () => playlist,
    sync: syncPlayback
  };

})();
