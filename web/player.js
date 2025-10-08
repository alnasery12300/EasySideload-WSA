const video = document.getElementById('web-player');
const selector = document.querySelector('[data-role="source-selector"]');
const messageEl = document.getElementById('player-message');

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.hidden = false;
  video.setAttribute('aria-hidden', 'true');
}

function hideMessage() {
  messageEl.hidden = true;
  video.removeAttribute('aria-hidden');
}

function guessMediaType(source) {
  if (source.type) {
    return source.type;
  }

  const url = source.src || '';

  if (url.includes('.m3u8')) {
    return 'application/x-mpegURL';
  }

  if (url.includes('.mpd')) {
    return 'application/dash+xml';
  }

  if (url.match(/\.mp4($|\?)/)) {
    return 'video/mp4';
  }

  if (url.match(/\.webm($|\?)/)) {
    return 'video/webm';
  }

  return '';
}

function canPlaySource(type) {
  if (!type) {
    return false;
  }

  if (type === 'application/x-mpegURL') {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      return true;
    }
    return Boolean(window.Hls && window.Hls.isSupported());
  }

  if (type === 'application/dash+xml') {
    return 'MediaSource' in window;
  }

  return video.canPlayType(type) !== '';
}

function configureSelector(sources, active) {
  selector.innerHTML = '';
  sources.forEach((source, index) => {
    const option = document.createElement('option');
    option.value = index.toString();
    option.textContent = source.label || source.type || `Source ${index + 1}`;
    if (source === active) {
      option.selected = true;
    }
    selector.append(option);
  });
}

function setVideoSource(source) {
  const type = guessMediaType(source);
  if (!canPlaySource(type)) {
    throw new Error(`Browser cannot play source type: ${type || 'unknown'}`);
  }

  hideMessage();
  video.pause();

  if (window.hlsInstance) {
    window.hlsInstance.destroy();
    window.hlsInstance = undefined;
  }

  if (type === 'application/x-mpegURL' && window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls();
    hls.loadSource(source.src);
    hls.attachMedia(video);
    window.hlsInstance = hls;
  } else {
    video.src = source.src;
    if (type) {
      video.type = type;
    }
  }

  if (source.poster) {
    video.poster = source.poster;
  }

  const autoplay = source.autoplay ?? false;
  if (autoplay) {
    video.play().catch(() => {
      showMessage('Autoplay was blocked by the browser. Press play to start the video.');
    });
  }
}

async function loadConfig() {
  try {
    const response = await fetch('./player-config.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    showMessage(`Unable to load player configuration: ${error.message}`);
    throw error;
  }
}

function pickInitialSource(config) {
  const sources = config.sources || [];
  if (!sources.length) {
    showMessage('Player configuration does not define any sources.');
    return null;
  }

  const url = new URL(window.location.href);
  const sourceLabel = url.searchParams.get('quality');
  const srcUrl = url.searchParams.get('src');

  if (srcUrl) {
    return { src: srcUrl, label: 'Custom', type: guessMediaType({ src: srcUrl }) };
  }

  if (sourceLabel) {
    const matching = sources.find((source) => source.label === sourceLabel);
    if (matching && canPlaySource(guessMediaType(matching))) {
      return matching;
    }
  }

  return sources.find((source) => canPlaySource(guessMediaType(source)));
}

async function bootstrap() {
  const config = await loadConfig();
  if (!config) {
    return;
  }

  const playableSource = pickInitialSource(config);

  if (!playableSource) {
    showMessage('No playable sources were found. Please update player-config.json.');
    return;
  }

  configureSelector(config.sources, playableSource);
  setVideoSource(playableSource);

  selector.addEventListener('change', (event) => {
    const index = Number.parseInt(event.target.value, 10);
    const selectedSource = config.sources[index];
    try {
      setVideoSource(selectedSource);
    } catch (error) {
      showMessage(error.message);
      selector.value = config.sources.indexOf(playableSource).toString();
    }
  });
}

bootstrap();
