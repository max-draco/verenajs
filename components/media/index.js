/**
 * verenajs Media Components
 * Video player, audio player, image gallery, and more
 */

import styles from './styles.module.css';

// ============================================================================
// Video Player
// ============================================================================

export function createVideoPlayer(props = {}) {
  const {
    src = '',
    poster = null,
    autoplay = false,
    muted = false,
    loop = false,
    controls = true,
    width = '100%',
    height = 'auto',
    aspectRatio = '16/9',
    onPlay = null,
    onPause = null,
    onEnded = null,
    onTimeUpdate = null,
    onProgress = null,
    quality = [], // [{ label: '1080p', src: '...' }, ...]
    subtitles = [], // [{ label: 'English', src: '...', lang: 'en' }]
    chapters = [] // [{ title: '...', time: 0 }]
  } = props;

  const container = document.createElement('div');
  container.className = styles.videoPlayer || 'video-player';
  container.style.cssText = `
    position: relative;
    width: ${width};
    ${height === 'auto' ? `aspect-ratio: ${aspectRatio};` : `height: ${height};`}
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  `;

  // Video element
  const video = document.createElement('video');
  video.src = src;
  video.poster = poster;
  video.autoplay = autoplay;
  video.muted = muted;
  video.loop = loop;
  video.playsInline = true;
  video.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';

  // Subtitles
  subtitles.forEach(sub => {
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = sub.label;
    track.srclang = sub.lang;
    track.src = sub.src;
    video.appendChild(track);
  });

  container.appendChild(video);

  // State
  let state = {
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: muted,
    fullscreen: false,
    buffered: 0,
    quality: quality[0]?.src || src
  };

  // Custom controls
  if (controls) {
    const controlsEl = document.createElement('div');
    controlsEl.className = styles.controls || 'video-controls';
    controlsEl.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      padding: 40px 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s;
    `;

    // Progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      position: relative;
      height: 4px;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      cursor: pointer;
    `;

    const bufferedBar = document.createElement('div');
    bufferedBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: rgba(255,255,255,0.5);
      border-radius: 2px;
      width: 0;
    `;
    progressContainer.appendChild(bufferedBar);

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: #ef4444;
      border-radius: 2px;
      width: 0;
    `;
    progressContainer.appendChild(progressBar);

    const progressHandle = document.createElement('div');
    progressHandle.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      left: 0;
      opacity: 0;
      transition: opacity 0.2s;
    `;
    progressContainer.appendChild(progressHandle);

    progressContainer.addEventListener('mouseenter', () => progressHandle.style.opacity = '1');
    progressContainer.addEventListener('mouseleave', () => progressHandle.style.opacity = '0');

    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    });

    controlsEl.appendChild(progressContainer);

    // Bottom controls row
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    // Play/Pause button
    const playBtn = document.createElement('button');
    playBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
    `;
    playBtn.innerHTML = '▶️';
    playBtn.addEventListener('click', () => {
      if (video.paused) video.play();
      else video.pause();
    });
    bottomRow.appendChild(playBtn);

    // Volume control
    const volumeContainer = document.createElement('div');
    volumeContainer.style.cssText = 'display: flex; align-items: center; gap: 4px;';

    const volumeBtn = document.createElement('button');
    volumeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    `;
    volumeBtn.innerHTML = '🔊';
    volumeBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      state.muted = video.muted;
      volumeBtn.innerHTML = video.muted ? '🔇' : '🔊';
    });
    volumeContainer.appendChild(volumeBtn);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.value = video.volume;
    volumeSlider.style.cssText = 'width: 60px; cursor: pointer;';
    volumeSlider.addEventListener('input', () => {
      video.volume = volumeSlider.value;
      state.volume = video.volume;
    });
    volumeContainer.appendChild(volumeSlider);

    bottomRow.appendChild(volumeContainer);

    // Time display
    const timeDisplay = document.createElement('span');
    timeDisplay.style.cssText = 'color: white; font-size: 13px; font-family: monospace;';
    timeDisplay.textContent = '0:00 / 0:00';
    bottomRow.appendChild(timeDisplay);

    // Spacer
    bottomRow.appendChild(document.createElement('div'));
    bottomRow.lastChild.style.flex = '1';

    // Quality selector
    if (quality.length > 0) {
      const qualityBtn = document.createElement('button');
      qualityBtn.style.cssText = `
        background: none;
        border: 1px solid rgba(255,255,255,0.5);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      `;
      qualityBtn.textContent = quality[0].label || 'HD';
      // TODO: Quality menu
      bottomRow.appendChild(qualityBtn);
    }

    // Subtitles button
    if (subtitles.length > 0) {
      const subsBtn = document.createElement('button');
      subsBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
      `;
      subsBtn.innerHTML = '💬';
      // TODO: Subtitles menu
      bottomRow.appendChild(subsBtn);
    }

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    `;
    fullscreenBtn.innerHTML = '⛶';
    fullscreenBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    });
    bottomRow.appendChild(fullscreenBtn);

    controlsEl.appendChild(bottomRow);
    container.appendChild(controlsEl);

    // Show/hide controls
    let hideTimeout;
    container.addEventListener('mousemove', () => {
      controlsEl.style.opacity = '1';
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        if (!video.paused) controlsEl.style.opacity = '0';
      }, 2500);
    });

    container.addEventListener('mouseleave', () => {
      if (!video.paused) controlsEl.style.opacity = '0';
    });

    // Big play button overlay
    const bigPlay = document.createElement('div');
    bigPlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background: rgba(0,0,0,0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    `;
    bigPlay.innerHTML = '▶️';
    bigPlay.addEventListener('click', () => {
      video.play();
      bigPlay.style.display = 'none';
    });
    bigPlay.addEventListener('mouseenter', () => {
      bigPlay.style.transform = 'translate(-50%, -50%) scale(1.1)';
      bigPlay.style.background = 'rgba(0,0,0,0.8)';
    });
    bigPlay.addEventListener('mouseleave', () => {
      bigPlay.style.transform = 'translate(-50%, -50%) scale(1)';
      bigPlay.style.background = 'rgba(0,0,0,0.6)';
    });
    container.appendChild(bigPlay);

    // Event handlers
    video.addEventListener('play', () => {
      state.playing = true;
      playBtn.innerHTML = '⏸️';
      bigPlay.style.display = 'none';
      if (onPlay) onPlay();
    });

    video.addEventListener('pause', () => {
      state.playing = false;
      playBtn.innerHTML = '▶️';
      bigPlay.style.display = 'flex';
      controlsEl.style.opacity = '1';
      if (onPause) onPause();
    });

    video.addEventListener('ended', () => {
      state.playing = false;
      playBtn.innerHTML = '▶️';
      bigPlay.style.display = 'flex';
      if (onEnded) onEnded();
    });

    video.addEventListener('loadedmetadata', () => {
      state.duration = video.duration;
    });

    video.addEventListener('timeupdate', () => {
      state.currentTime = video.currentTime;
      const percent = (video.currentTime / video.duration) * 100;
      progressBar.style.width = `${percent}%`;
      progressHandle.style.left = `${percent}%`;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      if (onTimeUpdate) onTimeUpdate(video.currentTime);
    });

    video.addEventListener('progress', () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        bufferedBar.style.width = `${percent}%`;
        state.buffered = bufferedEnd;
        if (onProgress) onProgress(bufferedEnd);
      }
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // API
  container.play = () => video.play();
  container.pause = () => video.pause();
  container.seek = (time) => { video.currentTime = time; };
  container.setVolume = (vol) => { video.volume = vol; };
  container.setSrc = (newSrc) => { video.src = newSrc; };
  container.getState = () => ({ ...state });
  container.getVideoElement = () => video;

  return container;
}

// ============================================================================
// Audio Player
// ============================================================================

export function createAudioPlayer(props = {}) {
  const {
    src = '',
    title = '',
    artist = '',
    cover = null,
    autoplay = false,
    showWaveform = false,
    showPlaylist = false,
    playlist = [], // [{ src, title, artist, cover }]
    onPlay = null,
    onPause = null,
    onEnded = null,
    onNext = null,
    onPrev = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.audioPlayer || 'audio-player';
  container.style.cssText = `
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;

  // Audio element
  const audio = document.createElement('audio');
  audio.src = src;
  audio.autoplay = autoplay;

  let state = {
    playing: false,
    currentTime: 0,
    duration: 0,
    currentTrack: 0
  };

  // Current track info
  const trackInfo = document.createElement('div');
  trackInfo.style.cssText = 'display: flex; align-items: center; gap: 16px;';

  // Cover art
  const coverEl = document.createElement('div');
  coverEl.style.cssText = `
    width: 64px;
    height: 64px;
    border-radius: 8px;
    background: ${cover ? `url(${cover}) center/cover` : '#f3f4f6'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #9ca3af;
    flex-shrink: 0;
  `;
  if (!cover) coverEl.innerHTML = '🎵';
  trackInfo.appendChild(coverEl);

  // Title and artist
  const textInfo = document.createElement('div');
  textInfo.style.cssText = 'flex: 1; min-width: 0;';

  const titleEl = document.createElement('div');
  titleEl.style.cssText = `
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  titleEl.textContent = title || 'Unknown Track';
  textInfo.appendChild(titleEl);

  const artistEl = document.createElement('div');
  artistEl.style.cssText = `
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  artistEl.textContent = artist || 'Unknown Artist';
  textInfo.appendChild(artistEl);

  trackInfo.appendChild(textInfo);
  container.appendChild(trackInfo);

  // Progress bar
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';

  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: relative;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    cursor: pointer;
    overflow: hidden;
  `;

  const progress = document.createElement('div');
  progress.style.cssText = `
    height: 100%;
    background: #3b82f6;
    border-radius: 3px;
    width: 0;
    transition: width 0.1s;
  `;
  progressBar.appendChild(progress);

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  });

  progressContainer.appendChild(progressBar);

  // Time display
  const timeRow = document.createElement('div');
  timeRow.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; color: #6b7280;';

  const currentTimeEl = document.createElement('span');
  currentTimeEl.textContent = '0:00';
  timeRow.appendChild(currentTimeEl);

  const durationEl = document.createElement('span');
  durationEl.textContent = '0:00';
  timeRow.appendChild(durationEl);

  progressContainer.appendChild(timeRow);
  container.appendChild(progressContainer);

  // Controls
  const controls = document.createElement('div');
  controls.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 16px;';

  const createControlBtn = (icon, size, onClick) => {
    const btn = document.createElement('button');
    btn.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: none;
      background: ${size > 40 ? '#3b82f6' : 'transparent'};
      color: ${size > 40 ? 'white' : '#374151'};
      font-size: ${size * 0.4}px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    `;
    btn.innerHTML = icon;
    btn.addEventListener('click', onClick);
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
    return btn;
  };

  // Previous
  if (playlist.length > 0) {
    const prevBtn = createControlBtn('⏮️', 36, () => {
      if (state.currentTrack > 0) {
        loadTrack(state.currentTrack - 1);
        if (onPrev) onPrev(state.currentTrack);
      }
    });
    controls.appendChild(prevBtn);
  }

  // Play/Pause
  const playBtn = createControlBtn('▶️', 48, () => {
    if (audio.paused) audio.play();
    else audio.pause();
  });
  controls.appendChild(playBtn);

  // Next
  if (playlist.length > 0) {
    const nextBtn = createControlBtn('⏭️', 36, () => {
      if (state.currentTrack < playlist.length - 1) {
        loadTrack(state.currentTrack + 1);
        if (onNext) onNext(state.currentTrack);
      }
    });
    controls.appendChild(nextBtn);
  }

  container.appendChild(controls);

  // Volume
  const volumeRow = document.createElement('div');
  volumeRow.style.cssText = 'display: flex; align-items: center; gap: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6;';

  const volumeIcon = document.createElement('span');
  volumeIcon.style.cssText = 'font-size: 16px;';
  volumeIcon.textContent = '🔊';
  volumeRow.appendChild(volumeIcon);

  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = '0';
  volumeSlider.max = '1';
  volumeSlider.step = '0.05';
  volumeSlider.value = '1';
  volumeSlider.style.cssText = 'flex: 1; cursor: pointer;';
  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value;
    volumeIcon.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
  });
  volumeRow.appendChild(volumeSlider);

  container.appendChild(volumeRow);

  // Playlist
  if (showPlaylist && playlist.length > 0) {
    const playlistEl = document.createElement('div');
    playlistEl.style.cssText = `
      max-height: 200px;
      overflow-y: auto;
      border-top: 1px solid #f3f4f6;
      padding-top: 12px;
      margin-top: 4px;
    `;

    playlist.forEach((track, i) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
        ${i === state.currentTrack ? 'background: #eff6ff;' : ''}
      `;

      item.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: ${track.cover ? `url(${track.cover}) center/cover` : '#f3f4f6'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">${!track.cover ? '🎵' : ''}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${track.title || 'Unknown'}</div>
          <div style="font-size: 11px; color: #6b7280;">${track.artist || ''}</div>
        </div>
      `;

      item.addEventListener('click', () => loadTrack(i));
      item.addEventListener('mouseenter', () => item.style.background = '#f3f4f6');
      item.addEventListener('mouseleave', () => {
        item.style.background = i === state.currentTrack ? '#eff6ff' : 'transparent';
      });

      playlistEl.appendChild(item);
    });

    container.appendChild(playlistEl);
  }

  // Load track function
  function loadTrack(index) {
    const track = playlist[index] || { src, title, artist, cover };
    state.currentTrack = index;

    audio.src = track.src;
    titleEl.textContent = track.title || 'Unknown Track';
    artistEl.textContent = track.artist || 'Unknown Artist';
    coverEl.style.background = track.cover ? `url(${track.cover}) center/cover` : '#f3f4f6';
    if (!track.cover) coverEl.innerHTML = '🎵';
    else coverEl.innerHTML = '';

    audio.play();
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Event handlers
  audio.addEventListener('play', () => {
    state.playing = true;
    playBtn.innerHTML = '⏸️';
    if (onPlay) onPlay();
  });

  audio.addEventListener('pause', () => {
    state.playing = false;
    playBtn.innerHTML = '▶️';
    if (onPause) onPause();
  });

  audio.addEventListener('ended', () => {
    state.playing = false;
    playBtn.innerHTML = '▶️';

    // Auto-play next track
    if (playlist.length > 0 && state.currentTrack < playlist.length - 1) {
      loadTrack(state.currentTrack + 1);
    }

    if (onEnded) onEnded();
  });

  audio.addEventListener('loadedmetadata', () => {
    state.duration = audio.duration;
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    state.currentTime = audio.currentTime;
    const percent = (audio.currentTime / audio.duration) * 100;
    progress.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  // API
  container.play = () => audio.play();
  container.pause = () => audio.pause();
  container.seek = (time) => { audio.currentTime = time; };
  container.setVolume = (vol) => { audio.volume = vol; };
  container.loadTrack = loadTrack;
  container.getState = () => ({ ...state });

  return container;
}

// ============================================================================
// Image Gallery
// ============================================================================

export function createImageGallery(props = {}) {
  const {
    images = [], // [{ src, thumb, alt, caption }]
    columns = 3,
    gap = 8,
    lightbox = true,
    lazy = true,
    masonry = false,
    onImageClick = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.imageGallery || 'image-gallery';
  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap}px;
    ${masonry ? 'grid-auto-rows: 10px;' : ''}
  `;

  let currentImages = [...images];
  let lightboxEl = null;
  let currentIndex = 0;

  function render() {
    container.innerHTML = '';

    currentImages.forEach((image, index) => {
      const item = document.createElement('div');
      item.className = styles.galleryItem || 'gallery-item';
      item.style.cssText = `
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        cursor: pointer;
        ${masonry ? `grid-row-end: span ${Math.ceil(Math.random() * 20 + 15)};` : 'aspect-ratio: 1;'}
      `;

      const img = document.createElement('img');
      img.src = image.thumb || image.src;
      img.alt = image.alt || '';
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      `;

      if (lazy) {
        img.loading = 'lazy';
      }

      item.appendChild(img);

      // Hover overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
      `;
      overlay.innerHTML = `<span style="font-size: 32px;">🔍</span>`;
      item.appendChild(overlay);

      item.addEventListener('mouseenter', () => {
        overlay.style.opacity = '1';
        img.style.transform = 'scale(1.05)';
      });

      item.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
        img.style.transform = 'scale(1)';
      });

      item.addEventListener('click', () => {
        if (lightbox) {
          openLightbox(index);
        }
        if (onImageClick) onImageClick(image, index);
      });

      container.appendChild(item);
    });
  }

  function openLightbox(index) {
    currentIndex = index;

    lightboxEl = document.createElement('div');
    lightboxEl.className = styles.lightbox || 'lightbox';
    lightboxEl.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    `;

    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      position: relative;
    `;

    const img = document.createElement('img');
    img.src = currentImages[currentIndex].src;
    img.alt = currentImages[currentIndex].alt || '';
    img.style.cssText = `
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    `;
    imageContainer.appendChild(img);

    // Caption
    if (currentImages[currentIndex].caption) {
      const caption = document.createElement('div');
      caption.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        padding: 20px;
        color: white;
        text-align: center;
      `;
      caption.textContent = currentImages[currentIndex].caption;
      imageContainer.appendChild(caption);
    }

    lightboxEl.appendChild(imageContainer);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: white;
      font-size: 32px;
      cursor: pointer;
    `;
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', closeLightbox);
    lightboxEl.appendChild(closeBtn);

    // Navigation
    if (currentImages.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.style.cssText = `
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 16px;
        border-radius: 50%;
        cursor: pointer;
      `;
      prevBtn.innerHTML = '◀';
      prevBtn.addEventListener('click', () => navigate(-1));
      lightboxEl.appendChild(prevBtn);

      const nextBtn = document.createElement('button');
      nextBtn.style.cssText = `
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        padding: 16px;
        border-radius: 50%;
        cursor: pointer;
      `;
      nextBtn.innerHTML = '▶';
      nextBtn.addEventListener('click', () => navigate(1));
      lightboxEl.appendChild(nextBtn);

      // Counter
      const counter = document.createElement('div');
      counter.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 14px;
      `;
      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      counter.className = 'lightbox-counter';
      lightboxEl.appendChild(counter);
    }

    // Close on background click
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });

    // Keyboard navigation
    const handleKeydown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    document.addEventListener('keydown', handleKeydown);
    lightboxEl.dataset.keydownHandler = handleKeydown;

    document.body.appendChild(lightboxEl);
    document.body.style.overflow = 'hidden';
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
    const img = lightboxEl.querySelector('img');
    img.src = currentImages[currentIndex].src;
    img.alt = currentImages[currentIndex].alt || '';

    const counter = lightboxEl.querySelector('.lightbox-counter');
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }
  }

  function closeLightbox() {
    if (lightboxEl) {
      lightboxEl.style.animation = 'fadeOut 0.3s';
      setTimeout(() => {
        lightboxEl.remove();
        lightboxEl = null;
      }, 300);
      document.body.style.overflow = '';
    }
  }

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  `;
  container.appendChild(style);

  render();

  // API
  container.setImages = (newImages) => {
    currentImages = [...newImages];
    render();
  };

  container.addImage = (image) => {
    currentImages.push(image);
    render();
  };

  container.openLightbox = openLightbox;
  container.closeLightbox = closeLightbox;

  return container;
}

// ============================================================================
// Image Cropper
// ============================================================================

export function createImageCropper(props = {}) {
  const {
    src = '',
    aspectRatio = null, // null for free, or number like 16/9, 1, 4/3
    minWidth = 50,
    minHeight = 50,
    onCrop = null
  } = props;

  const container = document.createElement('div');
  container.className = styles.imageCropper || 'image-cropper';
  container.style.cssText = `
    position: relative;
    width: 100%;
    max-width: 600px;
    background: #1f2937;
    border-radius: 8px;
    overflow: hidden;
  `;

  // Image container
  const imageWrapper = document.createElement('div');
  imageWrapper.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'max-width: 100%; max-height: 400px; display: block;';
  imageWrapper.appendChild(img);

  // Crop area
  let cropArea = {
    x: 50,
    y: 50,
    width: 200,
    height: aspectRatio ? 200 / aspectRatio : 150
  };

  const cropBox = document.createElement('div');
  cropBox.style.cssText = `
    position: absolute;
    border: 2px solid white;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
    cursor: move;
  `;

  const updateCropBox = () => {
    cropBox.style.left = `${cropArea.x}px`;
    cropBox.style.top = `${cropArea.y}px`;
    cropBox.style.width = `${cropArea.width}px`;
    cropBox.style.height = `${cropArea.height}px`;
  };

  updateCropBox();

  // Resize handles
  const handles = ['nw', 'ne', 'sw', 'se'];
  handles.forEach(pos => {
    const handle = document.createElement('div');
    handle.dataset.handle = pos;
    handle.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      ${pos.includes('n') ? 'top: -5px;' : 'bottom: -5px;'}
      ${pos.includes('w') ? 'left: -5px;' : 'right: -5px;'}
      cursor: ${pos}-resize;
    `;
    cropBox.appendChild(handle);
  });

  imageWrapper.appendChild(cropBox);
  container.appendChild(imageWrapper);

  // Drag functionality
  let isDragging = false;
  let isResizing = false;
  let activeHandle = null;
  let startX, startY, startCrop;

  cropBox.addEventListener('mousedown', (e) => {
    if (e.target.dataset.handle) {
      isResizing = true;
      activeHandle = e.target.dataset.handle;
    } else {
      isDragging = true;
    }
    startX = e.clientX;
    startY = e.clientY;
    startCrop = { ...cropArea };
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging && !isResizing) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (isDragging) {
      cropArea.x = Math.max(0, startCrop.x + dx);
      cropArea.y = Math.max(0, startCrop.y + dy);
    } else if (isResizing) {
      if (activeHandle.includes('e')) {
        cropArea.width = Math.max(minWidth, startCrop.width + dx);
      }
      if (activeHandle.includes('w')) {
        cropArea.width = Math.max(minWidth, startCrop.width - dx);
        cropArea.x = startCrop.x + dx;
      }
      if (activeHandle.includes('s')) {
        cropArea.height = aspectRatio ? cropArea.width / aspectRatio : Math.max(minHeight, startCrop.height + dy);
      }
      if (activeHandle.includes('n')) {
        cropArea.height = aspectRatio ? cropArea.width / aspectRatio : Math.max(minHeight, startCrop.height - dy);
        if (!aspectRatio) cropArea.y = startCrop.y + dy;
      }

      if (aspectRatio) {
        cropArea.height = cropArea.width / aspectRatio;
      }
    }

    updateCropBox();
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    activeHandle = null;
  });

  // Controls
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid #374151;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = `
    flex: 1;
    padding: 10px;
    background: #374151;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  `;
  cancelBtn.textContent = 'Cancel';
  controls.appendChild(cancelBtn);

  const cropBtn = document.createElement('button');
  cropBtn.style.cssText = `
    flex: 1;
    padding: 10px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  `;
  cropBtn.textContent = 'Crop';
  cropBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;

    const imgRect = img.getBoundingClientRect();
    const boxRect = cropBox.getBoundingClientRect();

    const relX = (boxRect.left - imgRect.left) * scaleX;
    const relY = (boxRect.top - imgRect.top) * scaleY;

    ctx.drawImage(
      img,
      relX, relY,
      cropArea.width * scaleX, cropArea.height * scaleY,
      0, 0,
      canvas.width, canvas.height
    );

    const croppedUrl = canvas.toDataURL('image/png');
    if (onCrop) onCrop(croppedUrl, { ...cropArea });
  });
  controls.appendChild(cropBtn);

  container.appendChild(controls);

  // API
  container.setSrc = (newSrc) => {
    img.src = newSrc;
  };

  container.getCropArea = () => ({ ...cropArea });

  return container;
}

// Export all
export default {
  createVideoPlayer,
  createAudioPlayer,
  createImageGallery,
  createImageCropper
};
