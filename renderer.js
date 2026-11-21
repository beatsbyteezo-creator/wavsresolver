const form = document.querySelector('#pack-form');
const input = document.querySelector('#pack-url');
const status = document.querySelector('#status');
const downloadStatus = document.querySelector('#download-status');
const downloadMessage = document.querySelector('#download-message');
const downloadProgressBar = document.querySelector('#download-progress-bar');
const cancelDownloadButton = document.querySelector('#cancel-download');
const dismissDownloadStatusButton = document.querySelector('#dismiss-download-status');
const downloadArtwork = document.querySelector('#download-artwork');
const downloadUpdateIcon = document.querySelector('#download-update-icon');
const panel = document.querySelector('#pack-panel');
const appShell = document.querySelector('.shell');
const appVersionLabel = document.querySelector('#app-version');
const appUpdateOverlay = document.querySelector('#app-update-overlay');
const appUpdateTitle = document.querySelector('#app-update-title');
const appUpdateVersion = document.querySelector('#app-update-version');
const appUpdateNotes = document.querySelector('#app-update-notes-text');
const appUpdateNotesHeading = document.querySelector('#app-update-notes-heading');
const appUpdateKicker = document.querySelector('#app-update-kicker');
const appUpdateMessage = document.querySelector('#app-update-message');
const appUpdateProgress = document.querySelector('#app-update-progress');
const appUpdateProgressWrap = document.querySelector('#app-update-progress-wrap');
const appUpdateMark = document.querySelector('.app-update-mark');
const appUpdateLaterButton = document.querySelector('#app-update-later');
const appUpdateNowButton = document.querySelector('#app-update-now');
const loadButton = document.querySelector('#load-button');
const sampleDestinationPath = document.querySelector('#sample-destination-path');
const chooseSampleDestinationButton = document.querySelector('#choose-sample-destination');
const catalogList = document.querySelector('#catalog-list');
const catalogStatus = document.querySelector('#catalog-status');
const catalogMoreButton = document.querySelector('#catalog-more');
const refreshCatalogButton = document.querySelector('#refresh-catalog');
const catalogSearchInput = document.querySelector('#catalog-search');
const creatorSearchSuggestions = document.querySelector('#creator-search-suggestions');
const catalogGenreSelect = document.querySelector('#catalog-genre');
const catalogPeriodSelect = document.querySelector('#catalog-period');
const catalogSortSelect = document.querySelector('#catalog-sort');
const catalogEmpty = document.querySelector('#catalog-empty');
const activeFilterList = document.querySelector('#active-filter-list');
const clearCatalogFiltersButton = document.querySelector('#clear-catalog-filters');
const featuredPackSection = document.querySelector('#featured-pack');
const recentShelf = document.querySelector('#recent-shelf');
const recentList = document.querySelector('#recent-list');
const recentGenres = document.querySelector('#recent-genres');
const recentPreviousButton = document.querySelector('#recent-previous');
const recentNextButton = document.querySelector('#recent-next');
let homeRevealObserver = null;
const favoritesCount = document.querySelector('#favorites-count');
const exploreNavigationButton = document.querySelector('#nav-explore');
const favoritesNavigationButton = document.querySelector('#nav-favorites');
const homeNavigationButton = document.querySelector('#nav-home');
const themeToggleButton = document.querySelector('#theme-toggle');
const catalogTitle = document.querySelector('#catalog-title');
const catalogEyebrow = document.querySelector('#catalog-eyebrow');
const catalogDescription = document.querySelector('#catalog-description');
const homeLink = document.querySelector('#home-link');
const backButton = document.querySelector('#back-button');
const creatorProfilePanel = document.querySelector('#creator-profile');
const bottomPlayer = document.querySelector('#bottom-player');
const bottomPlayerAudio = document.querySelector('#bottom-player-audio');
const bottomPlayerCover = document.querySelector('#bottom-player-cover');
const bottomPlayerCoverFallback = document.querySelector('#bottom-player-cover-fallback');
const bottomPlayerTitle = document.querySelector('#bottom-player-title');
const bottomPlayerSubtitle = document.querySelector('#bottom-player-subtitle');
const bottomPlayerDownload = document.querySelector('#bottom-player-download');
const bottomPlayerToggle = document.querySelector('#bottom-player-toggle');
const bottomPlayerPrevious = document.querySelector('#bottom-player-previous');
const bottomPlayerNext = document.querySelector('#bottom-player-next');
const bottomPlayerRepeat = document.querySelector('#bottom-player-repeat');
const bottomPlayerWaveform = document.querySelector('#bottom-player-waveform');
const bottomPlayerTime = document.querySelector('#bottom-player-time');
const bottomPlayerVolume = document.querySelector('#bottom-player-volume');
let sampleSearchInput;
let sampleFilterStatus;
let currentPack = null;
let packRequestVersion = 0;
let catalogPacks = [];
let filteredCatalogPacks = [];
let favoritePacks = [];
let catalogView = 'explore';
let sidebarSection = 'home';
let appUpdateCardDismissed = false;
let appUpdateCardMode = 'offer';
let appUpdateDownloadStarted = false;
let featuredPackIndex = 0;
const activeDownloadJobs = new Map();
const downloadPresentations = new Map();
const cancellingDownloadIds = new Set();
const packDownloadWaiters = new Map();
const completedPackDownloadEvents = new Map();
let activePackDownload = null;
let activeDownloadId = '';
let discoveryPacks = [];
let catalogRequestVersion = 0;
let globalSearchPacks = [];
let globalSearchSamples = [];
let globalSearchMode = false;
let globalSearchLoading = false;
let globalSearchError = '';
let globalSearchWarning = '';
let globalSearchPage = 0;
let globalSearchLastPage = 0;
let globalSearchCreator = null;
let globalSearchCreators = [];
let globalSearchCreatorsLoaded = false;
let globalSearchRequestVersion = 0;
let globalSearchDebounce;
let creatorSuggestionsDismissed = false;
let genreFilterLoading = false;
let genreFilterError = '';
let genreFilterId = '';
let genreFilterName = '';
let genreFilterPage = 0;
let genreFilterLastPage = 0;
let genreFilterTotal = 0;
let creatorProfileRequestVersion = 0;
let creatorProfile = null;
let creatorProfileLoading = false;
let creatorProfilePageLoading = false;
let creatorProfileError = '';
let creatorProfilePage = 1;
let creatorProfileLastPage = 1;
let visiblePackCount = 12;
let catalogPage = 1;
let catalogLastPage = 1;
let catalogTotal = 0;
let catalogPageLoading = false;
let catalogPageError = false;
let currentSamplePage = 0;
let filteredSamples = [];
let catalogRefreshInFlight = false;
let catalogRenderPending = false;
let lastCatalogRefreshAt = 0;
const catalogRefreshInterval = 60_000;
const startupPackSnapshotKey = 'wavsresolver.startup-pack-snapshot.v1';
let startupPackCheckHandled = false;
const samplePageSize = 15;
let audioContext;
let notificationAudioContext;
const waveformCache = new Map();
const waveformTaskQueue = [];
const normalizedWaveformCache = new WeakMap();
const waveformLayerCache = new WeakMap();
const packReleaseDateCache = new WeakMap();
let activeSampleIndex = -1;
let lastWaveformSampleIndex = -1;
let playerAnimationFrame = 0;
let waveformPalette;
let activeWaveformTasks = 0;
const maxConcurrentWaveformTasks = 2;
const packPreviewCache = new Map();
let packHoverRequestId = 0;
let packHoverCard = null;
let activePackPreviewCard = null;
let activePackPreviewId = null;
let playerVolumeSaveTimer;
let themeChangedBeforePreferencesLoaded = false;
let volumeChangedBeforePreferencesLoaded = false;
let downloadStatusDismissTimer;
let bottomPlayerHideTimer;

function setStatus(message, success = false) { status.textContent = message || ''; status.classList.toggle('success', success); }
function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.dataset.theme = isLight ? 'light' : 'dark';
  themeToggleButton.innerHTML = '<span aria-hidden="true">' + (isLight ? '&#9788;' : '&#9790;') + '</span>Tema ' + (isLight ? 'escuro' : 'claro');
  themeToggleButton.setAttribute('aria-label', 'Mudar para tema ' + (isLight ? 'escuro' : 'claro'));
  themeToggleButton.setAttribute('aria-pressed', String(isLight));
}
function syncCustomSelect(select) {
  const control = select?.customSelectControl;
  if (!control) return;
  const selected = [...select.options].find((option) => option.value === select.value) || select.options[0];
  control.trigger.textContent = selected?.textContent || '';
  control.options.forEach((button) => {
    const isSelected = button.dataset.value === select.value;
    button.setAttribute('aria-selected', String(isSelected));
    button.classList.toggle('is-selected', isSelected);
  });
}
function closeCustomSelect(control, returnFocus = false) {
  if (!control?.wrapper.classList.contains('is-open')) return;
  control.wrapper.classList.remove('is-open');
  control.trigger.setAttribute('aria-expanded', 'false');
  control.menu.classList.add('hidden');
  if (returnFocus) control.trigger.focus();
}
function openCustomSelect(control) {
  document.querySelectorAll('.custom-select-control.is-open').forEach((wrapper) => {
    if (wrapper !== control.wrapper) closeCustomSelect(wrapper.customSelectControl);
  });
  control.wrapper.classList.add('is-open');
  control.trigger.setAttribute('aria-expanded', 'true');
  control.menu.classList.remove('hidden');
  syncCustomSelect(control.select);
}
function enhanceSelect(select) {
  if (!select || select.classList.contains('hidden') || select.customSelectControl) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select-control';
  const trigger = document.createElement('button');
  trigger.className = 'custom-select-trigger';
  trigger.type = 'button';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', select.getAttribute('aria-label') || 'Escolher op��o');
  const menu = document.createElement('div');
  menu.className = 'custom-select-menu hidden';
  menu.id = `${select.id}-options`;
  menu.setAttribute('role', 'listbox');
  trigger.setAttribute('aria-controls', menu.id);
  const control = { select, wrapper, trigger, menu, options: [] };
  wrapper.customSelectControl = control;
  select.customSelectControl = control;
  [...select.options].forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'custom-select-option';
    button.type = 'button';
    button.id = `${menu.id}-${index}`;
    button.dataset.value = option.value;
    button.textContent = option.textContent;
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', 'false');
    button.addEventListener('click', () => {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncCustomSelect(select);
      closeCustomSelect(control, true);
    });
    control.options.push(button);
    menu.append(button);
  });
  trigger.addEventListener('click', () => {
    if (wrapper.classList.contains('is-open')) closeCustomSelect(control);
    else openCustomSelect(control);
  });
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && wrapper.classList.contains('is-open')) {
      event.preventDefault();
      closeCustomSelect(control, true);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCustomSelect(control);
      const selectedIndex = control.options.findIndex((button) => button.dataset.value === select.value);
      control.options[Math.max(0, selectedIndex)]?.focus();
    }
  });
  menu.addEventListener('keydown', (event) => {
    const currentIndex = control.options.indexOf(document.activeElement);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowDown') nextIndex = Math.min(control.options.length - 1, currentIndex + 1);
    else if (event.key === 'ArrowUp') nextIndex = Math.max(0, currentIndex - 1);
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = control.options.length - 1;
    else if (event.key === 'Escape') { event.preventDefault(); closeCustomSelect(control, true); return; }
    else return;
    event.preventDefault();
    control.options[nextIndex]?.focus();
  });
  wrapper.addEventListener('focusout', () => {
    requestAnimationFrame(() => {
      if (!wrapper.contains(document.activeElement)) closeCustomSelect(control);
    });
  });
  select.parentNode.insertBefore(wrapper, select);
  wrapper.append(trigger, menu, select);
  select.classList.add('custom-select-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.addEventListener('change', () => syncCustomSelect(select));
  syncCustomSelect(select);
}
function initializeCustomSelects() {
  enhanceSelect(catalogPeriodSelect);
  enhanceSelect(catalogSortSelect);
  document.addEventListener('pointerdown', (event) => {
    document.querySelectorAll('.custom-select-control.is-open').forEach((wrapper) => {
      if (!wrapper.contains(event.target)) closeCustomSelect(wrapper.customSelectControl);
    });
  });
}
initializeCustomSelects();
async function saveAppPreference(key, value) {
  try {
    const result = await window.wavsResolver.saveAppPreference(key, value);
    if (!result.ok) setStatus(result.message || 'N�o foi poss�vel salvar esta prefer�ncia.');
  } catch (error) {
    setStatus(error.message || 'N�o foi poss�vel salvar esta prefer�ncia.');
  }
}
function updateBackButton() {
  const creatorViewVisible = Boolean(creatorProfile || creatorProfileLoading || creatorProfileError);
  backButton.disabled = !creatorViewVisible && !history.state?.wavsResolverPackView && !history.state?.wavsResolverCreatorView;
}
function loadingIndicatorMarkup(message, className = '') {
  const spokes = Array.from({ length: 12 }, () => '<span aria-hidden="true"></span>').join('');
  return `<span class="loading-indicator ${className}" role="status"><span class="loading-spinner" aria-hidden="true">${spokes}</span><span>${escapeHtml(message)}</span></span>`;
}
function dismissDownloadStatus() {
  if (downloadStatus.classList.contains('hidden') || downloadStatus.classList.contains('is-leaving')) return;
  downloadStatus.classList.add('is-leaving');
  downloadStatusDismissTimer = setTimeout(() => {
    downloadStatus.classList.add('hidden');
    downloadStatus.classList.remove('is-leaving');
  }, 700);
}
function setDownloadStatus(message, success = false, presentation = null) {
  clearTimeout(downloadStatusDismissTimer);
  downloadStatus.classList.remove('is-leaving');
  downloadMessage.textContent = message || '';
  const isUpdate = presentation?.kind === 'update';
  downloadArtwork.classList.toggle('hidden', !presentation?.cover || isUpdate);
  downloadUpdateIcon.classList.toggle('hidden', !isUpdate);
  if (isUpdate) {
    const progress = Number.isFinite(Number(presentation.progress)) ? Math.max(0, Math.min(100, Number(presentation.progress))) : 0;
    downloadUpdateIcon.style.setProperty('--update-fill', `${progress}%`);
  }
  if (presentation?.cover) downloadArtwork.src = presentation.cover;
  downloadStatus.classList.toggle('has-artwork', Boolean(presentation?.cover));
  downloadStatus.classList.toggle('is-update', isUpdate);
  downloadStatus.classList.toggle('hidden', !message);
  downloadStatus.classList.toggle('success', success);
  downloadStatus.setAttribute('aria-busy', String(activeDownloadJobs.size > 0));
  if (message && activeDownloadJobs.size === 0 && !activePackDownload) {
    downloadStatusDismissTimer = setTimeout(dismissDownloadStatus, 3600);
  }
}
function updateDownloadStatus(data) {
  if (data.downloadId) {
    activeDownloadJobs.set(data.downloadId, data);
    activeDownloadId = data.downloadId;
  }
  const filePercent = data.total ? Math.min(1, Math.max(0, data.received / data.total)) : null;
  const isPackBatchDownload = Boolean(activePackDownload?.currentSampleUrl === data.downloadId);
  const percent = isPackBatchDownload && filePercent !== null
    ? Math.round(((activePackDownload.finishedCount + filePercent) / activePackDownload.total) * 100)
    : filePercent === null ? null : Math.round(filePercent * 100);
  downloadProgressBar.classList.remove('hidden');
  if (percent === null) downloadProgressBar.removeAttribute('value');
  else downloadProgressBar.value = percent;
  cancelDownloadButton.classList.toggle('hidden', !activeDownloadId);
  cancelDownloadButton.disabled = cancellingDownloadIds.has(activeDownloadId);
  const presentation = downloadPresentations.get(data.downloadId);
  const name = presentation?.title || String(data.filename || 'Download').replace(/\.mp3$/i, '');
  setDownloadStatus(name, false, presentation);
}
function prepareNotificationSound() {
  if (!window.AudioContext || notificationAudioContext) return;
  notificationAudioContext = new AudioContext();
  notificationAudioContext.resume().catch((error) => console.warn('N�o foi poss�vel preparar o som de conclus�o:', error));
}
function playNotificationBubble() {
  if (!notificationAudioContext) return;
  notificationAudioContext.resume().then(() => {
    const now = notificationAudioContext.currentTime;
    const master = notificationAudioContext.createGain();
    master.gain.value = 0.18;
    master.connect(notificationAudioContext.destination);
    for (const [offset, startFrequency, endFrequency, duration, level] of [
      [0, 980, 610, 0.16, 0.42],
      [0.09, 720, 1040, 0.2, 0.24]
    ]) {
      const oscillator = notificationAudioContext.createOscillator();
      const envelope = notificationAudioContext.createGain();
      const start = now + offset;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(startFrequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(level, start + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(master);
      oscillator.start(start);
      oscillator.stop(start + duration);
    }
    master.gain.setValueAtTime(0.18, now + 0.3);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
  }).catch((error) => console.warn('N�o foi poss�vel tocar o som de conclus�o:', error));
}
window.addEventListener('pointerdown', prepareNotificationSound, { once: true });
window.addEventListener('keydown', prepareNotificationSound, { once: true });
document.addEventListener('error', (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  if (image === bottomPlayerCover) {
    image.classList.add('hidden');
    bottomPlayerCoverFallback.classList.remove('hidden');
  } else if (image.classList.contains('catalog-cover')) {
    image.remove();
    image.closest('.catalog-media')?.classList.add('cover-unavailable');
  } else if (image.classList.contains('featured-cover')) {
    image.replaceWith(Object.assign(document.createElement('div'), { className: 'featured-art-fallback', textContent: 'W' }));
  } else if (image.classList.contains('pack-cover')) {
    image.replaceWith(Object.assign(document.createElement('div'), { className: 'pack-cover pack-cover-empty', textContent: 'W' }));
  } else if (image.classList.contains('sample-cover')) {
    image.replaceWith(Object.assign(document.createElement('span'), { className: 'sample-cover sample-cover-fallback', textContent: 'W' }));
  } else if (image.classList.contains('creator-profile-photo')) {
    image.replaceWith(Object.assign(document.createElement('div'), { className: 'creator-profile-photo creator-avatar-fallback', textContent: 'W' }));
  } else if (image.classList.contains('catalog-creator-avatar')) {
    image.replaceWith(Object.assign(document.createElement('span'), { className: 'catalog-creator-avatar catalog-creator-avatar-fallback', textContent: 'W' }));
  }
}, true);
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function formatDisplayVersion(version) {
  return String(version || '').replace(/^v/, '').replace(/^(\d+\.\d+)\.0$/, '$1');
}

function formatReleaseNotes(markdown) {
  let source = String(markdown || '').replace(/\uFFFD/g, '').replace(/\r/g, '');
  // Some release providers flatten newlines or return escaped HTML. Normalize
  // those forms before parsing so tags never appear literally in the update card.
  source = source
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<h[1-6]\b[^>]*>/gi, '\n## ')
    .replace(/<\/(?:li|p|h[1-6]|div|section)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/(#{1,3}\s+[^\n]+?)(?=-\s+)/g, '$1\n')
    .replace(/([.!?])\s*-\s+/g, '$1\n- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const lines = source.split('\n');
  const output = [];
  let paragraph = [];
  let bullets = [];
  const inline = (value) => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length) output.push(`<ul>${bullets.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
    bullets = [];
  };
  let bulletCount = 0;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (!line) { flushParagraph(); flushBullets(); }
    else if (heading) { flushParagraph(); flushBullets(); output.push(`<h4>${inline(heading[1])}</h4>`); }
    else if (bullet && bulletCount < 3) { flushParagraph(); bullets.push(bullet[1]); bulletCount += 1; }
    else if (bullet) { flushParagraph(); }
    else { flushBullets(); paragraph.push(line); }
  }
  flushParagraph();
  flushBullets();
  return output.join('') || '<ul><li>Corre��o de bugs visuais e de navega��o.</li><li>Upgrade no visual e na fluidez do app.</li></ul>';
}
function coverUrl(pack) { const raw = pack.thumb || pack.demo?.pack_thumb || ''; if (raw.startsWith('https://')) return raw; if (raw.startsWith('images/')) return `https://cdn.wavs.com/${raw}`; return ''; }
function sampleDetails(sample) {
  const genres = (Array.isArray(sample.genres) ? sample.genres : [])
    .map((item) => typeof item === 'string' ? item : item?.genre?.title || item?.title)
    .filter(Boolean);
  return [
    sample.tempo ? { label: 'BPM', value: `${sample.tempo}` } : null,
    sample.key_value ? { label: 'Tom', value: `${sample.key_value}${sample.key_is_minor ? ' menor' : ' maior'}` } : null,
    genres.length ? { label: 'Estilo', value: genres.join(', ') } : null
  ].filter(Boolean);
}
function plainDescription(value) {
  return String(value || 'Pack publicado no WAVS.')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\r\n\t\s]+/g, ' ')
    .trim();
}

function catalogCoverUrl(pack) {
  const raw = pack.thumb || pack.demo?.pack_thumb || '';
  if (raw.startsWith('https://')) return raw;
  if (raw.startsWith('images/')) return `https://cdn.wavs.com/${raw}`;
  return '';
}

function getCatalogGenres(packs) {
  return [...new Set(packs.flatMap((pack) => (pack.genres || [])
    .map((genre) => typeof genre === 'string' ? genre : genre?.title)
    .filter(Boolean)))].sort((a, b) => a.localeCompare(b));
}

function getPackReleaseDate(pack) {
  if (packReleaseDateCache.has(pack)) return packReleaseDateCache.get(pack);
  const releasedAt = String(pack.released_at || '').trim();
  const relativeRelease = releasedAt.match(/^(?:(\d+|a|an)\s+)?(minute|hour|day|week|month|year)s?\s+ago$/i);
  let date = null;
  if (/^(just now|moments ago)$/i.test(releasedAt)) {
    date = new Date();
  } else if (relativeRelease) {
    const amount = Number(relativeRelease[1]) || 1;
    const unitDurations = {
      minute: 60_000,
      hour: 60 * 60_000,
      day: 24 * 60 * 60_000,
      week: 7 * 24 * 60 * 60_000,
      month: 30 * 24 * 60 * 60_000,
      year: 365 * 24 * 60 * 60_000
    };
    date = new Date(Date.now() - amount * unitDurations[relativeRelease[2].toLocaleLowerCase()]);
  } else if (releasedAt) {
    const parsedRelease = new Date(releasedAt);
    if (!Number.isNaN(parsedRelease.getTime())) date = parsedRelease;
  }
  if (!date && pack.uploaded_at) {
    const uploaded = new Date(pack.uploaded_at);
    if (!Number.isNaN(uploaded.getTime())) date = uploaded;
  }
  packReleaseDateCache.set(pack, date);
  return date;
}

function formatPackDate(pack) {
  const date = getPackReleaseDate(pack);
  return date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date) : '';
}

function formatRelativeReleaseTime(pack) {
  const date = getPackReleaseDate(pack);
  if (!date) return '';
  const difference = date.getTime() - Date.now();
  const absoluteDifference = Math.abs(difference);
  if (absoluteDifference < 60_000) return 'agora mesmo';
  const units = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60_000]
  ];
  const [unit, duration] = units.find(([, unitDuration]) => absoluteDifference >= unitDuration) || units[units.length - 1];
  return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' }).format(
    Math.round(difference / duration),
    unit
  );
}

function updateCatalogGenreOptions() {
  const selectedGenre = catalogGenreSelect.value;
  const genres = getCatalogGenres([...catalogPacks, ...discoveryPacks, ...favoritePacks, ...globalSearchPacks]);
  catalogGenreSelect.replaceChildren(new Option('Todos os g�neros', ''));
  const genreIds = new Map();
  for (const pack of [...catalogPacks, ...discoveryPacks, ...favoritePacks, ...globalSearchPacks]) {
    for (const genre of pack.genres || []) {
      if (genre && typeof genre === 'object' && genre.id !== undefined) {
        genreIds.set(String(genre.title || ''), String(genre.id));
      }
    }
  }
  for (const genre of genres) {
    const option = new Option(genre, genre);
    if (genreIds.has(genre)) option.dataset.genreId = genreIds.get(genre);
    catalogGenreSelect.add(option);
  }
  if (genres.includes(selectedGenre)) catalogGenreSelect.value = selectedGenre;
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

function creatorAvatarUrl(creator) {
  const raw = String(creator?.thumb || '');
  const externalUrl = safeExternalUrl(raw);
  if (externalUrl) return externalUrl;
  return raw.startsWith('images/') ? `https://cdn.wavs.com/${raw}` : '';
}

function packCardMarkup(pack) {
  const cover = catalogCoverUrl(pack);
  const genres = (pack.genres || []).map((genre) => typeof genre === 'string' ? genre : genre?.title).filter(Boolean);
  const creator = pack.user?.display || pack.user?.username || 'Criador WAVS';
  const releaseDate = getPackReleaseDate(pack);
  const isNew = releaseDate && Date.now() >= releaseDate.getTime() && Date.now() - releaseDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
  const age = formatRelativeReleaseTime(pack);
  const coverMarkup = cover
    ? `<img class="catalog-cover" src="${escapeHtml(cover)}" alt="" loading="lazy">`
    : '<div class="catalog-cover catalog-cover-empty"><span>W</span></div>';
  const creatorId = pack.user?.id ?? '';
  const creatorUsername = pack.user?.username ?? '';
  const creatorAvatar = creatorAvatarUrl(pack.user);
  const creatorAvatarMarkup = creatorAvatar
    ? `<img class="catalog-creator-avatar" src="${escapeHtml(creatorAvatar)}" alt="" loading="lazy">`
    : '<span class="catalog-creator-avatar catalog-creator-avatar-fallback" aria-hidden="true">W</span>';
  const saved = favoritePacks.some((favorite) => String(favorite.id) === String(pack.id));
  const sampleCount = pack.audio_count == null ? 'Pack WAVS' : `${Number(pack.audio_count || 0)} samples`;
  return `<article class="catalog-card" data-pack-id="${escapeHtml(pack.id)}"><div class="catalog-media-shell"><button class="catalog-open catalog-cover-button" type="button" data-pack-id="${escapeHtml(pack.id)}" aria-label="Abrir pack ${escapeHtml(pack.title)}"><span class="catalog-media">${coverMarkup}<span class="catalog-card-overlay">${pack.is_free ? '<span class="catalog-badge">GR�TIS</span>' : ''}<span class="catalog-arrow" aria-hidden="true">?</span></span></span></button><button class="catalog-preview-button" type="button" data-pack-id="${escapeHtml(pack.id)}" aria-label="Ouvir pr�via de ${escapeHtml(pack.title)}" aria-pressed="false" title="Ouvir pr�via"><svg class="preview-icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg><svg class="preview-icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg></button><button class="favorite-pack-button${saved ? ' is-saved' : ''}" type="button" data-pack-id="${escapeHtml(pack.id)}" aria-label="${saved ? 'Remover dos packs salvos' : 'Salvar pack'}" aria-pressed="${saved}" title="${saved ? 'Remover dos packs salvos' : 'Salvar pack'}">${saved ? '' : '?'}</button></div><button class="catalog-open catalog-card-body" type="button" data-pack-id="${escapeHtml(pack.id)}" aria-label="Abrir pack ${escapeHtml(pack.title)}"><span class="catalog-pack-title">${escapeHtml(pack.title)}</span><span class="catalog-meta">${genres.slice(0, 2).map((genre) => `<span>${escapeHtml(genre)}</span>`).join('')}</span>${age ? `<span class="catalog-age${isNew ? ' is-new' : ''}">? ${escapeHtml(age)}</span>` : ''}</button><div class="catalog-card-footer"><div class="catalog-card-author"><button class="catalog-creator-link${isNew ? ' is-new' : ''}" type="button" data-creator-id="${escapeHtml(creatorId)}" data-creator-username="${escapeHtml(creatorUsername)}" data-creator-display="${escapeHtml(creator)}" aria-label="Abrir perfil de ${escapeHtml(creator)}">${creatorAvatarMarkup}<span>${escapeHtml(creator)}</span></button>${isNew ? '<span class="new-pack-badge">NEW</span>' : ''}</div><span>${sampleCount}</span></div></article>`;
}

function stopPackHoverPreview(card = null) {
  if (card && packHoverCard !== card && activePackPreviewCard !== card) return;
  const stopPlayer = Boolean(activePackPreviewCard && (!card || activePackPreviewCard === card));
  packHoverRequestId += 1;
  for (const previewCard of new Set([packHoverCard, activePackPreviewCard].filter(Boolean))) {
    previewCard.classList.remove('is-previewing');
    const previewButton = previewCard.querySelector('.catalog-preview-button');
    previewButton?.setAttribute('aria-pressed', 'false');
    if (previewButton) previewButton.setAttribute('aria-label', `Ouvir pr�via de ${previewCard.querySelector('.catalog-pack-title')?.textContent || 'pack'}`);
  }
  packHoverCard = null;
  activePackPreviewCard = null;
  if (stopPlayer) stopBottomPlayer();
}

function getPackPreview(packId) {
  if (!packPreviewCache.has(packId)) {
    const request = window.wavsResolver.loadPackPreview(packId).then((result) => {
      if (!result.ok) throw new Error(result.message || 'N�o foi poss�vel carregar a pr�via deste pack.');
      return result.url;
    }).catch((error) => {
      packPreviewCache.delete(packId);
      throw error;
    });
    packPreviewCache.set(packId, request);
  }
  return packPreviewCache.get(packId);
}

async function playPackHoverPreview(card) {
  if (!card.isConnected || document.visibilityState !== 'visible') return;
  const packId = String(card.dataset.packId);
  if (activePackPreviewId === packId && activePackPreviewCard === card) {
    if (bottomPlayerAudio.paused) bottomPlayerAudio.play().catch((error) => setDownloadStatus(error.message || 'N�o foi poss�vel reproduzir esta pr�via.'));
    else bottomPlayerAudio.pause();
    return;
  }
  stopPackHoverPreview();
  stopBottomPlayer();
  const requestId = ++packHoverRequestId;
  packHoverCard = card;
  const pack = [catalogPacks, discoveryPacks, globalSearchPacks, favoritePacks]
    .flat()
    .find((item) => String(item.id) === packId)
    || { id: packId, title: card.querySelector('.catalog-pack-title')?.textContent || 'Pack WAVS' };
  const creator = pack.user?.display || pack.user?.username || 'Criador WAVS';
  try {
    const url = await getPackPreview(packId);
    if (requestId !== packHoverRequestId || packHoverCard !== card || !card.isConnected) return;
    activeSampleIndex = -1;
    activePackPreviewId = packId;
    activePackPreviewCard = card;
    bottomPlayerAudio.src = url;
    bottomPlayerAudio.load();
    bottomPlayerTitle.textContent = `${pack.title || 'Pack WAVS'} � Pr�via`;
    bottomPlayerSubtitle.textContent = creator;
    const cover = catalogCoverUrl(pack);
    bottomPlayerCover.classList.toggle('hidden', !cover);
    bottomPlayerCoverFallback.classList.toggle('hidden', Boolean(cover));
    if (cover) bottomPlayerCover.src = cover;
    bottomPlayerDownload.classList.remove('hidden');
    for (const [key, value] of Object.entries({ url, title: pack.title || 'wavs-pack-preview', tempo: '', author: creator })) {
      bottomPlayerDownload.dataset[key] = String(value);
    }
    bottomPlayerWaveform.waveformPeaks = null;
    bottomPlayerWaveform.classList.add('waveform-loading');
    bottomPlayerWaveform.classList.remove('waveform-unavailable');
    showBottomPlayer();
    drawWaveform(bottomPlayerWaveform, null);
    card.classList.add('is-previewing');
    const previewButton = card.querySelector('.catalog-preview-button');
    previewButton?.setAttribute('aria-pressed', 'true');
    previewButton?.setAttribute('aria-label', `Parar pr�via de ${pack.title || 'pack'}`);
    getWaveformPeaks(url).then((peaks) => {
      if (activePackPreviewId !== packId) return;
      bottomPlayerWaveform.waveformPeaks = peaks;
      bottomPlayerWaveform.classList.remove('waveform-loading', 'waveform-unavailable');
      updateBottomPlayer();
    }).catch((error) => {
      if (activePackPreviewId !== packId) return;
      bottomPlayerWaveform.title = error.message;
      bottomPlayerWaveform.classList.remove('waveform-loading');
      bottomPlayerWaveform.classList.add('waveform-unavailable');
    });
    updateBottomPlayer();
    await bottomPlayerAudio.play();
  } catch (error) {
    if (requestId !== packHoverRequestId || packHoverCard !== card) return;
    card.classList.remove('is-previewing');
    card.querySelector('.catalog-preview-button')?.setAttribute('aria-pressed', 'false');
    activePackPreviewCard = null;
    activePackPreviewId = null;
    if (bottomPlayerAudio.src) stopBottomPlayer();
    if (error.name === 'NotAllowedError') return;
    console.error(`N�o foi poss�vel reproduzir a pr�via do pack ${packId}:`, error);
    card.classList.add('preview-unavailable');
    card.querySelector('.catalog-preview-button')?.setAttribute('title', error.message || 'Pr�via indispon�vel');
  }
}
function bindPackHoverPreview(card) {
  card.addEventListener('pointerenter', () => {
    document.querySelectorAll('.catalog-card.is-hovered').forEach((otherCard) => {
      if (otherCard !== card) otherCard.classList.remove('is-hovered', 'is-hovered-down');
    });
    const shellRect = document.querySelector('.shell')?.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    card.classList.toggle('is-hovered-down', Boolean(shellRect && cardRect.top < shellRect.top + 24));
    card.classList.add('is-hovered');
  });
  card.addEventListener('pointerleave', () => card.classList.remove('is-hovered', 'is-hovered-down'));
  card.querySelector('.catalog-preview-button')?.addEventListener('click', (event) => {
    event.stopPropagation();
    void playPackHoverPreview(card);
  });
}
function bindPackOpenButtons(container) {
  container.querySelectorAll('.catalog-card').forEach(bindPackHoverPreview);
  container.querySelectorAll('.catalog-open').forEach((button) => {
    button.addEventListener('click', () => {
      stopPackHoverPreview();
      openPackById(button.dataset.packId, true);
    });
  });
  container.querySelectorAll('.catalog-creator-link').forEach((button) => {
    button.addEventListener('click', () => {
      stopPackHoverPreview();
      openCreatorProfile({
        id: button.dataset.creatorId,
        username: button.dataset.creatorUsername,
        display: button.dataset.creatorDisplay
      });
    });
  });
  container.querySelectorAll('.favorite-pack-button').forEach((button) => {
    button.addEventListener('click', () => toggleFavoritePack(button.dataset.packId));
  });
}

function sortPacks(packs) {
  const sorted = [...packs];
  const direction = catalogSortSelect.value;
  sorted.sort((left, right) => {
    if (direction === 'title') return String(left.title || '').localeCompare(String(right.title || ''), 'pt-BR');
    if (direction === 'samples') return (Number(right.audio_count) || 0) - (Number(left.audio_count) || 0);
    const leftDate = getPackReleaseDate(left)?.getTime() ?? 0;
    const rightDate = getPackReleaseDate(right)?.getTime() ?? 0;
    return direction === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
  });
  return sorted;
}

function renderActiveFilters() {
  const filters = [];
  const query = catalogSearchInput.value.trim();
  if (query) filters.push({ key: 'search', label: `Busca: ${query}` });
  if (catalogGenreSelect.value) filters.push({ key: 'genre', label: `G�nero: ${catalogGenreSelect.value}` });
  if (catalogPeriodSelect.value) filters.push({ key: 'period', label: `Per�odo: ${catalogPeriodSelect.options[catalogPeriodSelect.selectedIndex].text}` });
  if (catalogSortSelect.value !== 'newest') filters.push({ key: 'sort', label: `Ordem: ${catalogSortSelect.options[catalogSortSelect.selectedIndex].text}` });
  activeFilterList.replaceChildren(...filters.map(({ key, label }) => {
    const chip = document.createElement('button');
    chip.className = 'active-filter-chip';
    chip.type = 'button';
    chip.dataset.filter = key;
    chip.setAttribute('aria-label', `Remover filtro ${label}`);
    chip.textContent = `${label} �`;
    chip.addEventListener('click', () => {
      if (key === 'search') {
        catalogSearchInput.value = '';
        catalogSearchInput.dispatchEvent(new Event('input'));
        return;
      }
      if (key === 'genre') {
        catalogRequestVersion += 1;
        catalogPageLoading = false;
        catalogPageError = false;
        catalogGenreSelect.value = '';
        discoveryPacks = [];
        genreFilterLoading = false;
        genreFilterId = '';
        genreFilterName = '';
        genreFilterPage = 0;
        genreFilterLastPage = 0;
        genreFilterTotal = 0;
      } else if (key === 'period') {
        catalogPeriodSelect.value = '';
      } else if (key === 'sort') {
        catalogSortSelect.value = 'newest';
      }
      renderCatalog();
    });
    return chip;
  }));
  clearCatalogFiltersButton.classList.toggle('hidden', filters.length === 0);
}

function renderCreatorSearchSuggestions() {
  const query = catalogSearchInput.value.trim();
  const shouldShow = !creatorSuggestionsDismissed && catalogView !== 'favorites' && query.length >= 2
    && (globalSearchLoading || globalSearchError || globalSearchCreatorsLoaded);
  creatorSearchSuggestions.classList.toggle('hidden', !shouldShow);
  catalogSearchInput.setAttribute('aria-expanded', String(shouldShow));
  if (!shouldShow) {
    creatorSearchSuggestions.replaceChildren();
    return;
  }
  if (globalSearchLoading && globalSearchCreators.length === 0) {
    creatorSearchSuggestions.innerHTML = '<p class="creator-search-hint" role="status">Buscando criadores.</p>';
    return;
  }
  if (globalSearchError) {
    creatorSearchSuggestions.innerHTML = `<p class="creator-search-hint">${escapeHtml(globalSearchError)}</p>`;
    return;
  }
  if (!globalSearchCreators.length) {
    const hint = globalSearchWarning.includes('busca de criadores falhou')
      ? 'N�o foi poss�vel carregar as sugest�es de criadores agora.'
      : `Nenhum criador encontrado para "${escapeHtml(query)}".`;
    creatorSearchSuggestions.innerHTML = `<p class="creator-search-hint">${hint}</p>`;
    return;
  }
  creatorSearchSuggestions.innerHTML = globalSearchCreators.map((creator) => {
    const photo = safeExternalUrl(creator.thumb);
    return `<button class="creator-suggestion" type="button" role="option" aria-selected="false" data-creator-id="${escapeHtml(creator.id)}" data-creator-username="${escapeHtml(creator.username)}" data-creator-display="${escapeHtml(creator.display)}">${photo ? `<img src="${escapeHtml(photo)}" alt="" loading="lazy">` : '<span class="creator-suggestion-avatar" aria-hidden="true">W</span>'}<span class="creator-suggestion-identity"><strong>${escapeHtml(creator.display || creator.username)}</strong><small>@${escapeHtml(creator.username)}</small></span><span class="creator-suggestion-action">Ver perfil </span></button>`;
  }).join('');
  creatorSearchSuggestions.querySelectorAll('.creator-suggestion').forEach((button) => {
    button.addEventListener('click', () => {
      creatorSuggestionsDismissed = true;
      creatorSearchSuggestions.classList.add('hidden');
      catalogSearchInput.setAttribute('aria-expanded', 'false');
      openCreatorProfile({
        id: button.dataset.creatorId,
        username: button.dataset.creatorUsername,
        display: button.dataset.creatorDisplay
      });
    });
  });
}

creatorSearchSuggestions.addEventListener('keydown', (event) => {
  const suggestions = [...creatorSearchSuggestions.querySelectorAll('.creator-suggestion')];
  const currentIndex = suggestions.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' && suggestions.length) {
    event.preventDefault();
    suggestions[(currentIndex + 1) % suggestions.length].focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (currentIndex <= 0) catalogSearchInput.focus();
    else suggestions[currentIndex - 1].focus();
  } else if (event.key === 'Escape') {
    catalogSearchInput.focus();
    creatorSuggestionsDismissed = true;
    renderCreatorSearchSuggestions();
  }
});
creatorSearchSuggestions.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.creator-suggestion')) event.preventDefault();
});

function snapshotPack(pack) {
  return {
    ...pack,
    thumb: catalogCoverUrl(pack),
    genres: (pack.genres || []).map((genre) => typeof genre === 'string' ? genre : genre?.title).filter(Boolean),
    user: {
      id: pack.user?.id ?? '',
      username: pack.user?.username ?? '',
      display: pack.user?.display ?? '',
      thumb: pack.user?.thumb ?? ''
    }
  };
}

function findPackById(packId) {
  return [...catalogPacks, ...discoveryPacks, ...globalSearchPacks, ...favoritePacks, ...(currentPack ? [currentPack.pack] : [])]
    .find((pack) => String(pack.id) === String(packId));
}

async function toggleFavoritePack(packId) {
  const pack = findPackById(packId);
  if (!pack) {
    setStatus('N�o encontrei os dados deste pack para salvar nos favoritos.');
    return;
  }
  try {
    const result = await window.wavsResolver.toggleFavoritePack(snapshotPack(pack));
    if (!result.ok) {
      setStatus(result.message || 'N�o foi poss�vel atualizar seus packs salvos.');
      return;
    }
    favoritePacks = result.favoritePacks || [];
    favoritesCount.textContent = String(favoritePacks.length);
    updateCatalogNavigation();
    setStatus(result.saved ? 'Pack salvo neste computador.' : 'Pack removido dos salvos.', true);
    renderCatalog();
    const detailButton = panel.querySelector('.pack-favorite');
    if (detailButton) {
      const saved = favoritePacks.some((favorite) => String(favorite.id) === String(packId));
      detailButton.classList.toggle('is-saved', saved);
      detailButton.setAttribute('aria-pressed', String(saved));
      detailButton.textContent = saved ? ' Pack salvo' : '? Salvar pack';
    }
  } catch (error) {
    setStatus(error.message || 'N�o foi poss�vel atualizar seus packs salvos.');
  }
}

function observeHomePackCards(container) {
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const cards = container.querySelectorAll('.catalog-card[data-pack-id]');
  if (!cards.length) return;
  if (!homeRevealObserver) {
    homeRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('home-revealed', entry.isIntersecting));
    }, { root: appShell, threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
  }
  cards.forEach((card) => {
    card.classList.add('home-reveal-pending');
    homeRevealObserver.observe(card);
  });
}
function renderHomeHighlights() {
  const showHighlights = catalogView === 'explore' && !globalSearchMode && !creatorProfile && !creatorProfileLoading && !creatorProfileError;
  const hasPacks = showHighlights && catalogPacks.length > 0;
  featuredPackSection.classList.toggle('hidden', !hasPacks);
  recentShelf.classList.toggle('hidden', !hasPacks);
  if (!hasPacks) return;

  const featured = catalogPacks[featuredPackIndex % catalogPacks.length];
  const cover = catalogCoverUrl(featured);
  const saved = favoritePacks.some((favorite) => String(favorite.id) === String(featured.id));
  featuredPackSection.innerHTML = `
    <article class="featured-pack">
      <div class="featured-art">
        ${cover ? `<img class="featured-cover" src="${escapeHtml(cover)}" alt="" loading="eager">` : '<div class="featured-art-fallback">W</div>'}
        <div class="featured-art-shade"></div>
        <div class="featured-copy">
          <span class="featured-kicker">EM DESTAQUE � WAVS</span>
          <h2>${escapeHtml(featured.title)}</h2>
          <p>${escapeHtml(featured.user?.display || featured.user?.username || 'Criador WAVS')} � ${Number(featured.audio_count || 0)} samples</p>
          <div class="featured-actions">
            <button class="featured-open" type="button" data-pack-id="${escapeHtml(featured.id)}">Ver pack <span aria-hidden="true"></span></button>
            <button class="favorite-pack-button featured-favorite${saved ? ' is-saved' : ''}" type="button" data-pack-id="${escapeHtml(featured.id)}" aria-label="${saved ? 'Remover dos packs salvos' : 'Salvar pack'}" aria-pressed="${saved}">${saved ? '' : '?'}</button>
          </div>
        </div>
      </div>
    </article>`;
  const recent = catalogPacks.slice(0, 16);
  recentList.innerHTML = recent.map(packCardMarkup).join('');
  observeHomePackCards(recentList);
  const genres = getCatalogGenres(catalogPacks).slice(0, 8);
  recentGenres.innerHTML = `<button class="genre-pill${!catalogGenreSelect.value || genreFilterId === 'all' ? ' is-active' : ''}" type="button" data-genre="">Todos</button>${genres.map((genre) => `<button class="genre-pill${catalogGenreSelect.value === genre ? ' is-active' : ''}" type="button" data-genre="${escapeHtml(genre)}">${escapeHtml(genre)}</button>`).join('')}`;
  bindPackOpenButtons(recentList);
  featuredPackSection.querySelector('.featured-open').addEventListener('click', (event) => {
    stopPackHoverPreview();
    openPackById(event.currentTarget.dataset.packId, true);
  });
  featuredPackSection.querySelector('.favorite-pack-button').addEventListener('click', (event) => toggleFavoritePack(event.currentTarget.dataset.packId));
  recentGenres.querySelectorAll('.genre-pill').forEach((button) => {
    button.addEventListener('click', () => {
      if (!button.dataset.genre) {
        catalogGenreSelect.value = '';
        loadDiscoveryPacks('all', 'Todos os packs');
        return;
      }
      catalogGenreSelect.value = button.dataset.genre;
      catalogGenreSelect.dispatchEvent(new Event('change'));
    });
  });
}

function renderCatalog() {
  catalogRenderPending = false;
  syncCustomSelect(catalogPeriodSelect);
  syncCustomSelect(catalogSortSelect);
  stopPackHoverPreview();
  const query = catalogSearchInput.value.trim().toLocaleLowerCase();
  const selectedGenre = catalogGenreSelect.value.toLocaleLowerCase();
  const periodDays = Number(catalogPeriodSelect.value) || null;
  const cutoff = periodDays ? Date.now() - periodDays * 24 * 60 * 60 * 1000 : null;
  const isFavoritesView = catalogView === 'favorites';
  const discoveryView = Boolean(genreFilterId && !isFavoritesView);
  const genreView = discoveryView && genreFilterId !== 'all';
  const allPacksView = discoveryView && genreFilterId === 'all';
  const catalogSource = isFavoritesView ? favoritePacks : globalSearchMode ? globalSearchPacks : discoveryView ? discoveryPacks : catalogPacks;
  filteredCatalogPacks = sortPacks(catalogSource.filter((pack) => {
    const genres = (pack.genres || []).map((genre) => typeof genre === 'string' ? genre : genre?.title).filter(Boolean);
    const creator = pack.user?.display || pack.user?.username || '';
    const searchText = [pack.title, creator, ...genres].join(' ').toLocaleLowerCase();
    const date = getPackReleaseDate(pack);
    return ((!globalSearchMode || isFavoritesView) && query ? searchText.includes(query) : true)
      && (!selectedGenre || genres.some((genre) => genre.toLocaleLowerCase() === selectedGenre))
      && (!cutoff || (date && date.getTime() >= cutoff));
  }));
  const visiblePacks = isFavoritesView || globalSearchMode || discoveryView
    ? filteredCatalogPacks
    : filteredCatalogPacks.slice(0, visiblePackCount);
  const showSkeletons = filteredCatalogPacks.length === 0 && (
    globalSearchLoading || genreFilterLoading
    || (catalogRefreshInFlight && !catalogPacks.length && !isFavoritesView && !globalSearchMode)
  );
  catalogList.innerHTML = showSkeletons
    ? Array.from({ length: 6 }, () => '<article class="catalog-skeleton" aria-hidden="true"><div class="catalog-skeleton-cover"></div><div class="catalog-skeleton-lines"><span></span><span></span><span></span></div></article>').join('')
    : visiblePacks.map(packCardMarkup).join('');
  const canLoadSearchPage = globalSearchMode && globalSearchPage < globalSearchLastPage;
  const canLoadGenrePage = discoveryView && genreFilterPage < genreFilterLastPage;
  const canRevealCatalogPacks = !isFavoritesView && !globalSearchMode && !discoveryView && visiblePackCount < filteredCatalogPacks.length;
  const canLoadCatalogPage = !isFavoritesView && !globalSearchMode && !discoveryView && catalogPage < catalogLastPage;
  catalogMoreButton.classList.toggle('hidden', globalSearchMode
    ? !canLoadSearchPage
    : discoveryView ? !canLoadGenrePage : !(canRevealCatalogPacks || canLoadCatalogPage));
  catalogMoreButton.disabled = globalSearchLoading || genreFilterLoading || catalogPageLoading;
  if (globalSearchLoading || genreFilterLoading || catalogPageLoading) {
    catalogMoreButton.innerHTML = loadingIndicatorMarkup('Carregando.', 'loading-indicator-compact');
  } else {
    catalogMoreButton.textContent = catalogPageError && !discoveryView ? 'Tentar novamente' : globalSearchMode || genreView ? 'Carregar mais resultados' : 'Ver mais';
  }
  catalogEmpty.textContent = globalSearchMode
    ? globalSearchCreators.length
      ? `Nenhum pack encontrado para "${catalogSearchInput.value.trim()}". Para buscar por criador, selecione uma sugest�o antes de pressionar Enter.`
      : `Nenhum pack ou criador encontrado para "${catalogSearchInput.value.trim()}".`
    : isFavoritesView && favoritePacks.length === 0
    ? 'Seus packs salvos aparecem aqui. Use o cora��o nos cards para guardar um pack.'
    : isFavoritesView
      ? 'Nenhum pack salvo combina com esses filtros.'
      : 'Nenhum pack encontrado. Tente mudar os filtros.';
  const shouldShowEmpty = !globalSearchLoading && !globalSearchError && !genreFilterLoading && !genreFilterError && filteredCatalogPacks.length === 0
    && (globalSearchMode || isFavoritesView || catalogPacks.length > 0);
  catalogEmpty.classList.toggle('hidden', !shouldShowEmpty);
  catalogTitle.textContent = isFavoritesView ? 'Seus packs salvos.'
    : globalSearchMode ? 'Resultados da busca.'
      : genreView ? `Packs de ${genreFilterName}.`
        : 'Todos os Packs';
  catalogEyebrow.textContent = isFavoritesView ? 'SUA COLE��O � NESTE COMPUTADOR' : 'DESCOBRIR � WAVS';
  catalogDescription.textContent = isFavoritesView
    ? 'Packs guardados localmente para encontrar depois.'
    : globalSearchMode
      ? 'Pesquise packs e criadores em todo o cat�logo p�blico do WAVS.'
    : 'Explore packs novos, filtre por g�nero e abra para ouvir as pr�vias.';
  if (globalSearchLoading) {
    catalogStatus.innerHTML = loadingIndicatorMarkup(`Buscando packs e criadores para "${catalogSearchInput.value.trim()}" no WAVS.`);
    catalogStatus.setAttribute('aria-busy', 'true');
  } else if (globalSearchError) {
    catalogStatus.textContent = globalSearchError;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (globalSearchMode) {
    catalogStatus.textContent = `${filteredCatalogPacks.length} packs encontrados para "${catalogSearchInput.value.trim()}"${globalSearchWarning ? ` � ${globalSearchWarning}` : ''}`;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (query && query.length < 2 && catalogView !== 'favorites') {
    catalogStatus.textContent = 'Digite pelo menos 2 caracteres para buscar no cat�logo WAVS.';
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (genreFilterLoading) {
    catalogStatus.innerHTML = loadingIndicatorMarkup(allPacksView
      ? 'Carregando todos os packs recentes do WAVS.'
      : `Buscando todos os packs de ${genreFilterName} no WAVS.`);
    catalogStatus.setAttribute('aria-busy', 'true');
  } else if (genreFilterError) {
    catalogStatus.textContent = genreFilterError;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (catalogPageError && !isFavoritesView && !discoveryView && !globalSearchMode) {
    catalogStatus.textContent = 'N\u00e3o foi poss\u00edvel carregar mais packs. Tente novamente.';
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (catalogRefreshInFlight && !catalogPacks.length && !isFavoritesView) {
    catalogStatus.innerHTML = loadingIndicatorMarkup('Carregando packs do WAVS.');
    catalogStatus.setAttribute('aria-busy', 'true');
  } else if (genreView) {
    catalogStatus.textContent = `${filteredCatalogPacks.length} de ${genreFilterTotal} packs de ${genreFilterName}`;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (allPacksView) {
    catalogStatus.textContent = `${filteredCatalogPacks.length} de ${genreFilterTotal} packs � mais recentes primeiro`;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (isFavoritesView) {
    catalogStatus.textContent = `${filteredCatalogPacks.length} de ${favoritePacks.length} packs salvos`;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else if (catalogPacks.length) {
    catalogStatus.textContent = `${filteredCatalogPacks.length} de ${catalogPacks.length} packs${filteredCatalogPacks.length === 1 ? '' : ' encontrados'}`;
    catalogStatus.setAttribute('aria-busy', 'false');
  } else {
    catalogStatus.textContent = 'Nenhum pack novo encontrado.';
    catalogStatus.setAttribute('aria-busy', 'false');
  }
  bindPackOpenButtons(catalogList);
  renderActiveFilters();
  renderHomeHighlights();
  if (catalogView === 'explore' && !globalSearchMode && !creatorProfile && !creatorProfileLoading && !creatorProfileError) {
    observeHomePackCards(catalogList);
  }
}

function renderCreatorProfile() {
  const visible = Boolean(creatorProfile || creatorProfileLoading || creatorProfileError);
  updateBackButton();
  catalogList.closest('#packs-view').classList.toggle('hidden', visible);
  document.querySelector('.catalog-heading').classList.toggle('hidden', visible);
  refreshCatalogButton.classList.toggle('hidden', visible);
  renderHomeHighlights();
  document.body.classList.toggle('creator-profile-active', visible && Boolean(currentPack));
  if (visible && currentPack) panel.classList.add('hidden');
  else if (!visible && currentPack) panel.classList.remove('hidden');
  if (!visible) {
    creatorProfilePanel.replaceChildren();
    creatorProfilePanel.classList.add('hidden');
    return;
  }
  creatorProfilePanel.classList.remove('hidden');
  if (creatorProfileLoading) {
    creatorProfilePanel.innerHTML = loadingIndicatorMarkup('Carregando perfil e packs do criador.', 'loading-indicator-card');
    creatorProfilePanel.setAttribute('aria-busy', 'true');
    return;
  }
  creatorProfilePanel.setAttribute('aria-busy', 'false');
  if (creatorProfileError || !creatorProfile) {
    creatorProfilePanel.innerHTML = `<button class="back-home-button creator-back" type="button"> ${currentPack ? 'Voltar ao pack' : 'Voltar aos packs'}</button><p class="creator-profile-message">${escapeHtml(creatorProfileError || 'N�o foi poss�vel carregar este perfil.')}</p>`;
    creatorProfilePanel.querySelector('.creator-back').textContent = 'Voltar';
    creatorProfilePanel.querySelector('.creator-back').addEventListener('click', navigateBack);
    return;
  }
  const creator = creatorProfile.creator;
  const photo = safeExternalUrl(creator.thumb);
  const credits = Array.isArray(creator.production_credits) ? creator.production_credits : [];
  const social = creator.social && typeof creator.social === 'object' ? creator.social : {};
  const socialLinks = [
    ['website', creator.website],
    ...Object.entries(social).map(([name, url]) => [name, url])
  ].filter(([, url]) => safeExternalUrl(url));
  const startPack = creatorProfile.totalPacks ? (creatorProfilePage - 1) * 30 + 1 : 0;
  const endPack = Math.min(creatorProfilePage * 30, creatorProfile.totalPacks);
  const profilePagination = creatorProfileLastPage > 1
    ? `<nav class="creator-profile-pagination" aria-label="Pagina��o dos packs do criador"><span>${creatorProfilePageLoading ? 'Carregando p�gina.' : `Mostrando ${startPack}-${endPack} de ${creatorProfile.totalPacks} packs`}</span><div><button class="creator-page-previous" type="button" ${creatorProfilePage <= 1 || creatorProfilePageLoading ? 'disabled' : ''}> Anterior</button><span>P�gina ${creatorProfilePage} de ${creatorProfileLastPage}</span><button class="creator-page-next" type="button" ${creatorProfilePage >= creatorProfileLastPage || creatorProfilePageLoading ? 'disabled' : ''}>Pr�xima </button></div></nav>`
    : `<p class="creator-packs-count">${creatorProfile.totalPacks} packs encontrados</p>`;
  const profileMarkup = `<div class="creator-profile-heading"><button class="back-home-button creator-back" type="button"> ${currentPack ? 'Voltar ao pack' : 'Voltar aos packs'}</button><div class="creator-profile-main">${photo ? `<img class="creator-profile-photo" src="${escapeHtml(photo)}" alt="Foto de ${escapeHtml(creator.display || creator.username || 'criador')}" loading="lazy">` : '<div class="creator-profile-photo creator-avatar-fallback">W</div>'}<div class="creator-profile-identity"><p class="catalog-eyebrow">PERFIL DO CRIADOR</p><h2>${escapeHtml(creator.display || creator.username || 'Criador WAVS')}</h2><p class="creator-username">@${escapeHtml(creator.username || '')}</p></div></div><p class="creator-bio">${escapeHtml(creator.bio || 'Este criador ainda n�o adicionou uma biografia.')}</p>${credits.length ? `<p class="creator-credits"><strong>Cr�ditos de produ��o</strong><span>${credits.map(escapeHtml).join(' � ')}</span></p>` : ''}<div class="creator-profile-meta"><span>${creatorProfile.totalPacks} packs</span><span>${Number(creator.audio_count || 0)} samples</span>${creator.is_top_seller ? '<span>Criador em destaque</span>' : ''}</div>${socialLinks.length ? `<nav class="creator-social" aria-label="Links do criador">${socialLinks.map(([name, url]) => `<a href="${escapeHtml(safeExternalUrl(url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(String(name).replace(/_/g, ' '))} ?</a>`).join('')}</nav>` : ''}</div><h3 class="creator-packs-heading">Packs de ${escapeHtml(creator.display || creator.username || 'este criador')}</h3><div class="catalog-list creator-packs">${creatorProfile.packs.map(packCardMarkup).join('')}</div>${creatorProfile.packs.length ? profilePagination : '<p class="catalog-empty">Este criador ainda n�o tem packs publicados.</p>'}`;
  creatorProfilePanel.innerHTML = profileMarkup;
  creatorProfilePanel.querySelector('.creator-back').textContent = 'Voltar';
  creatorProfilePanel.querySelector('.creator-back').addEventListener('click', navigateBack);
  creatorProfilePanel.querySelector('.creator-page-previous')?.addEventListener('click', () => openCreatorProfile(creator, creatorProfilePage - 1));
  creatorProfilePanel.querySelector('.creator-page-next')?.addEventListener('click', () => openCreatorProfile(creator, creatorProfilePage + 1));
  bindPackOpenButtons(creatorProfilePanel);
}

function closeCreatorProfile() {
  creatorProfileRequestVersion += 1;
  creatorProfile = null;
  creatorProfileLoading = false;
  creatorProfilePageLoading = false;
  creatorProfileError = '';
  creatorProfilePage = 1;
  creatorProfileLastPage = 1;
  renderCreatorProfile();
}

async function openCreatorProfile(creator, page = 1, updateHistory = true) {
  const requestVersion = ++creatorProfileRequestVersion;
  const isExistingProfile = Boolean(creatorProfile && String(creatorProfile.creator.id) === String(creator.id));
  if (updateHistory && !isExistingProfile) {
    if (history.state?.wavsResolverPackView || history.state?.wavsResolverCreatorView) {
      history.replaceState({ ...history.state, wavsResolverScrollY: appShell.scrollTop }, '', location.hash || '#top');
    }
    if (!history.state?.wavsResolverPackView || history.state?.wavsResolverCreatorView) {
      history.replaceState({ ...history.state, wavsResolverPreviousView: capturePreviousView() }, '', location.hash || '#top');
    }
    const creatorState = {
      wavsResolverCreatorView: true,
      creator: { id: creator.id, username: creator.username, display: creator.display },
      creatorPage: page
    };
    history.pushState(creatorState, '', `#creator-${encodeURIComponent(creator.username || creator.id)}`);
  } else if (updateHistory && isExistingProfile && history.state?.wavsResolverCreatorView) {
    history.replaceState({ ...history.state, creatorPage: page }, '', `#creator-${encodeURIComponent(creator.username || creator.id)}`);
  }
  creatorSuggestionsDismissed = true;
  renderCreatorSearchSuggestions();
  const isPageChange = isExistingProfile;
  if (!isPageChange) creatorProfile = null;
  creatorProfileLoading = !isPageChange;
  creatorProfilePageLoading = isPageChange;
  creatorProfileError = '';
  renderCreatorProfile();
  try {
    const result = await window.wavsResolver.loadCreatorProfile(creator.id, creator.username, creator.display, page);
    if (requestVersion !== creatorProfileRequestVersion) return;
    if (!result.ok) throw new Error(result.message || 'N�o consegui carregar o perfil deste criador.');
    creatorProfile = {
      ...result,
      packs: Array.isArray(result.packs) ? result.packs : []
    };
    creatorProfilePage = Number(result.page) || page;
    creatorProfileLastPage = Number(result.lastPage) || creatorProfilePage;
    creatorProfile.totalPacks = Number(result.totalPacks) || creatorProfile.packs.length;
  } catch (error) {
    if (requestVersion !== creatorProfileRequestVersion) return;
    creatorProfileError = error.message || 'N�o consegui carregar o perfil deste criador.';
  } finally {
    if (requestVersion === creatorProfileRequestVersion) {
      creatorProfileLoading = false;
      creatorProfilePageLoading = false;
      renderCreatorProfile();
      updateBackButton();
      const restoreY = history.state?.wavsResolverCreatorView
        ? Math.max(0, Number(history.state.wavsResolverScrollY) || 0)
        : 0;
      appShell.scrollTo({ top: restoreY, behavior: 'smooth' });
    }
  }
}

async function searchWavsPacks(query, page = 1, append = false) {
  const requestVersion = ++globalSearchRequestVersion;
  globalSearchLoading = true;
  globalSearchError = '';
  renderCatalog();
  renderCreatorSearchSuggestions();
  try {
    const creator = append ? globalSearchCreator : null;
    const result = await window.wavsResolver.searchPacks(query, page, creator);
    if (requestVersion !== globalSearchRequestVersion || catalogSearchInput.value.trim() !== query) return;
    if (!result.ok) throw new Error(result.message || 'N�o consegui pesquisar no WAVS.');
    const newPacks = Array.isArray(result.packs) ? result.packs : [];
    const packsById = new Map((append ? globalSearchPacks : []).map((pack) => [String(pack.id), pack]));
    for (const pack of newPacks) {
      if (pack?.id !== undefined && pack?.id !== null) packsById.set(String(pack.id), pack);
    }
    globalSearchPacks = [...packsById.values()];
    const samplesById = new Map((append ? globalSearchSamples : []).map((sample) => [String(sample.id || sample.mp3), sample]));
    for (const sample of Array.isArray(result.samples) ? result.samples : []) {
      samplesById.set(String(sample.id || sample.mp3), sample);
    }
    globalSearchSamples = [...samplesById.values()];
    globalSearchCreator = result.creator || globalSearchCreator;
    globalSearchPage = Number(result.page) || page;
    globalSearchLastPage = Number(result.lastPage) || globalSearchPage;
    globalSearchWarning = result.warning || '';
    if (!append) {
      globalSearchCreators = Array.isArray(result.creators) ? result.creators : [];
      globalSearchCreatorsLoaded = true;
    }
    updateCatalogGenreOptions();
  } catch (error) {
    if (requestVersion !== globalSearchRequestVersion) return;
    globalSearchError = `A busca no WAVS falhou: ${error.message || 'erro desconhecido'}.`;
    if (!append) globalSearchPacks = [];
    if (!append) globalSearchSamples = [];
    globalSearchCreatorsLoaded = true;
  } finally {
    if (requestVersion === globalSearchRequestVersion) {
      globalSearchLoading = false;
      renderCatalog();
      renderCreatorSearchSuggestions();
    }
  }
}

function formatPortugueseNameList(names) {
  if (names.length < 2) return names[0] || '';
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

function handleStartupPackUpdates(packs) {
  const currentPacks = (Array.isArray(packs) ? packs : []).filter((pack) => pack?.id !== undefined);
  let previousSnapshot = null;
  try {
    previousSnapshot = JSON.parse(localStorage.getItem(startupPackSnapshotKey) || 'null');
  } catch {}

  const hasPreviousSnapshot = previousSnapshot?.version === 1 && Array.isArray(previousSnapshot.ids);
  const previousIds = new Set(hasPreviousSnapshot ? previousSnapshot.ids.map(String) : []);
  const isStartupCheck = !startupPackCheckHandled;
  const newlyPublished = isStartupCheck && hasPreviousSnapshot
    ? currentPacks.filter((pack) => !previousIds.has(String(pack.id)))
    : [];

  if (isStartupCheck) {
    try {
      localStorage.setItem(startupPackSnapshotKey, JSON.stringify({
        version: 1,
        ids: currentPacks.map((pack) => String(pack.id))
      }));
    } catch {}
  }
  startupPackCheckHandled = true;

  if (!newlyPublished.length) return;

  const creators = [...new Set(newlyPublished.map((pack) =>
    pack.user?.display || pack.user?.username || 'Um criador'
  ))];
  const creatorNames = creators.slice(0, 3);
  if (creators.length > creatorNames.length) creatorNames.push(`mais ${creators.length - creatorNames.length}`);
  const titles = newlyPublished.slice(0, 3).map((pack) => pack.title || 'Pack sem t�tulo');
  if (newlyPublished.length > titles.length) titles.push(`mais ${newlyPublished.length - titles.length}`);
  const titleList = formatPortugueseNameList(titles);
  const creatorList = formatPortugueseNameList(creatorNames);
  const message = creators.length === 1
    ? `${creatorList} postou ${newlyPublished.length === 1 ? 'um pack novo' : 'packs novos'}: ${titleList}`
    : `${creatorList} postaram packs novos: ${titleList}`;
  const firstPack = newlyPublished[0];
  setDownloadStatus(message, true, { title: firstPack.title || 'Pack novo', cover: catalogCoverUrl(firstPack) });
}

async function loadNewPacks({ quiet = false } = {}) {
  if (catalogRefreshInFlight) return;
  catalogRefreshInFlight = true;
  refreshCatalogButton.disabled = true;
  refreshCatalogButton.innerHTML = loadingIndicatorMarkup('Atualizando.', 'loading-indicator-compact');
  if (!quiet && canShowCatalogRefreshStatus()) {
    if (!catalogPacks.length) renderCatalog();
    else {
      catalogStatus.innerHTML = loadingIndicatorMarkup('Carregando packs novos do WAVS.');
      catalogStatus.setAttribute('aria-busy', 'true');
    }
  }
  try {
    const result = await window.wavsResolver.loadNewPacks();
    if (!result.ok) {
      if (canShowCatalogRefreshStatus()) {
        catalogStatus.textContent = catalogPacks.length
          ? `N�o foi poss�vel atualizar o cat�logo; mantendo os packs carregados. ${result.message || ''}`.trim()
          : result.message || 'N�o consegui carregar os packs novos.';
        catalogStatus.setAttribute('aria-busy', 'false');
      }
      return;
    }
    handleStartupPackUpdates(result.packs);
    const previousIds = new Set(catalogPacks.map((pack) => String(pack.id)));
    const addedCount = result.packs.filter((pack) => !previousIds.has(String(pack.id))).length;
    if (catalogPage > 1) {
      const refreshedIds = new Set(result.packs.map((pack) => String(pack.id)));
      catalogPacks = [...result.packs, ...catalogPacks.filter((pack) => !refreshedIds.has(String(pack.id)))];
    } else {
      catalogPacks = result.packs;
    }
    catalogPage = Math.max(catalogPage, Number(result.page) || 1);
    catalogLastPage = Number(result.lastPage) || catalogLastPage || catalogPage;
    catalogTotal = Number(result.total) || catalogPacks.length;
    catalogPageError = false;
    updateCatalogGenreOptions();
    if (addedCount > 0) {
      if (canShowCatalogRefreshStatus() && appShell.scrollTop <= 2) renderCatalog();
      else catalogRenderPending = true;
    }
    const updatedAt = new Date();
    if (canShowCatalogRefreshStatus()) {
      catalogStatus.textContent = `${filteredCatalogPacks.length} de ${catalogPacks.length} packs � atualizado �s ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${addedCount ? ` � ${addedCount} novo${addedCount === 1 ? '' : 's'}` : ''}`;
      catalogStatus.setAttribute('aria-busy', 'false');
    }
    lastCatalogRefreshAt = Date.now();
  } catch (error) {
    if (canShowCatalogRefreshStatus()) {
      catalogStatus.textContent = catalogPacks.length
        ? `N�o foi poss�vel atualizar o cat�logo; mantendo os packs carregados. ${error.message || ''}`.trim()
        : error.message || 'N�o consegui carregar os packs novos do WAVS.';
      catalogStatus.setAttribute('aria-busy', 'false');
    }
  } finally {
    catalogRefreshInFlight = false;
    if (!catalogPacks.length && !globalSearchMode && catalogView !== 'favorites' && !genreFilterLoading) {
      catalogList.replaceChildren();
    }
    refreshCatalogButton.disabled = false;
    refreshCatalogButton.textContent = '? Atualizar';
  }
}

function canShowCatalogRefreshStatus() {
  return catalogView !== 'favorites'
    && !globalSearchMode
    && !genreFilterId
    && !creatorProfile
    && !creatorProfileLoading
    && !creatorProfileError
    && !currentPack;
}

async function loadCatalogPage(page) {
  if (catalogPageLoading || page <= catalogPage || page > catalogLastPage) return;
  const requestVersion = catalogRequestVersion;
  catalogPageLoading = true;
  catalogPageError = false;
  renderCatalog();
  try {
    const result = await window.wavsResolver.loadGenrePacks('all', page);
    if (requestVersion !== catalogRequestVersion) return;
    if (!result.ok) throw new Error(result.message || 'N\u00e3o consegui carregar mais packs do WAVS.');
    const existingIds = new Set(catalogPacks.map((pack) => String(pack.id)));
    const newPacks = result.packs.filter((pack) => pack?.id !== undefined && !existingIds.has(String(pack.id)));
    catalogPacks = [...catalogPacks, ...newPacks];
    catalogPage = Number(result.page) || page;
    catalogLastPage = newPacks.length ? Number(result.lastPage) || catalogPage + 1 : catalogPage;
    catalogTotal = Number(result.total) || catalogPacks.length;
    updateCatalogGenreOptions();
  } catch (error) {
    if (requestVersion === catalogRequestVersion) catalogPageError = true;
  } finally {
    if (requestVersion === catalogRequestVersion) {
      catalogPageLoading = false;
      renderCatalog();
    }
  }
}

async function loadDiscoveryPacks(filterId, filterName, page = 1, append = false) {
  if (!append) {
    catalogRequestVersion += 1;
    catalogPageLoading = false;
    catalogPageError = false;
    discoveryPacks = [];
    genreFilterId = filterId;
    genreFilterName = filterName;
    genreFilterPage = 0;
    genreFilterLastPage = 0;
    genreFilterTotal = 0;
  }
  const requestVersion = catalogRequestVersion;
  genreFilterLoading = true;
  genreFilterError = '';
  renderCatalog();
  try {
    const result = await window.wavsResolver.loadGenrePacks(filterId, page);
    if (requestVersion !== catalogRequestVersion || genreFilterId !== filterId) return;
    if (!result.ok) throw new Error(result.message || `N�o consegui carregar os packs de ${filterName}.`);
    if (append) {
      const existingIds = new Set(discoveryPacks.map((pack) => String(pack.id)));
      const newPacks = result.packs.filter((pack) => pack?.id !== undefined && !existingIds.has(String(pack.id)));
      discoveryPacks = [...discoveryPacks, ...newPacks];
      if (!newPacks.length) result.lastPage = result.page;
    } else {
      discoveryPacks = result.packs;
    }
    genreFilterPage = Number(result.page) || page;
    genreFilterLastPage = Number(result.lastPage) || genreFilterPage;
    genreFilterTotal = Number(result.total) || discoveryPacks.length;
    updateCatalogGenreOptions();
  } catch (error) {
    if (requestVersion !== catalogRequestVersion || genreFilterId !== filterId) return;
    genreFilterError = error.message || (filterId === 'all'
      ? 'N�o consegui carregar o cat�logo completo.'
      : `N�o consegui carregar os packs de ${filterName}.`);
    if (!append) discoveryPacks = [];
  } finally {
    if (requestVersion === catalogRequestVersion && genreFilterId === filterId) {
      genreFilterLoading = false;
      renderCatalog();
    }
  }
}

function clearPackView() {
  packRequestVersion += 1;
  stopBottomPlayer();
  panel.replaceChildren();
  panel.classList.add('hidden');
  document.body.classList.remove('pack-view-active');
  currentPack = null;
  setStatus('');
}

function resetCatalogFilters() {
  catalogRequestVersion += 1;
  catalogPageLoading = false;
  catalogPageError = false;
  globalSearchRequestVersion += 1;
  clearTimeout(globalSearchDebounce);
  catalogSearchInput.value = '';
  creatorProfileRequestVersion += 1;
  catalogGenreSelect.value = '';
  catalogPeriodSelect.value = '';
  catalogSortSelect.value = 'newest';
  creatorProfile = null;
  creatorProfileLoading = false;
  creatorProfilePageLoading = false;
  creatorProfileError = '';
  creatorProfilePage = 1;
  creatorProfileLastPage = 1;
  visiblePackCount = 12;
  globalSearchPacks = [];
  globalSearchSamples = [];
  globalSearchMode = false;
  globalSearchLoading = false;
  globalSearchError = '';
  globalSearchWarning = '';
  globalSearchPage = 0;
  globalSearchLastPage = 0;
  globalSearchCreator = null;
  globalSearchCreators = [];
  globalSearchCreatorsLoaded = false;
  creatorSuggestionsDismissed = true;
  creatorSearchSuggestions.classList.add('hidden');
  catalogSearchInput.setAttribute('aria-expanded', 'false');
  discoveryPacks = [];
  genreFilterLoading = false;
  genreFilterError = '';
  genreFilterId = '';
  genreFilterName = '';
  genreFilterPage = 0;
  genreFilterLastPage = 0;
  genreFilterTotal = 0;
  renderCreatorProfile();
  updateCatalogGenreOptions();
  if (catalogView === 'favorites') renderCatalog();
  else loadDiscoveryPacks('all', 'Todos os packs');
}

function updateCatalogNavigation() {
  const favoritesView = catalogView === 'favorites';
  const homeView = !favoritesView && sidebarSection === 'home';
  const exploreView = !favoritesView && !homeView;
  homeNavigationButton.classList.toggle('is-active', homeView);
  exploreNavigationButton.classList.toggle('is-active', exploreView);
  favoritesNavigationButton.classList.toggle('is-active', favoritesView);
  homeView ? homeNavigationButton.setAttribute('aria-current', 'page') : homeNavigationButton.removeAttribute('aria-current');
  exploreView ? exploreNavigationButton.setAttribute('aria-current', 'page') : exploreNavigationButton.removeAttribute('aria-current');
  favoritesView ? favoritesNavigationButton.setAttribute('aria-current', 'page') : favoritesNavigationButton.removeAttribute('aria-current');
  favoritesNavigationButton.setAttribute('aria-label', `Packs salvos, ${favoritePacks.length}`);
}

function setCatalogView(view) {
  catalogView = view === 'favorites' ? 'favorites' : 'explore';
  sidebarSection = catalogView === 'favorites' ? 'favorites' : 'explore';
  if (history.state?.wavsResolverPackView || history.state?.wavsResolverCreatorView) history.replaceState(null, '', '#top');
  clearPackView();
  resetCatalogFilters();
  updateCatalogNavigation();
  updateBackButton();
  appShell.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToHome() {
  navigateBack();
}

function capturePreviousView() {
  if (creatorProfile?.creator) {
    const { id, username, display } = creatorProfile.creator;
    return {
      type: 'creator-profile',
      creator: { id, username, display },
      page: creatorProfilePage
    };
  }
  return {
    type: 'catalog',
    catalogView,
    sidebarSection,
    scrollY: appShell.scrollTop
  };
}

function navigateBack() {
  if (history.state?.wavsResolverPackView || history.state?.wavsResolverCreatorView) {
    history.back();
    return;
  }
  if (creatorProfile || creatorProfileLoading || creatorProfileError || currentPack) {
    clearPackView();
    closeCreatorProfile();
    appShell.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigateHome() {
  history.replaceState(null, '', '#top');
  creatorProfileRequestVersion += 1;
  closeCreatorProfile();
  clearPackView();
  catalogView = 'explore';
  sidebarSection = 'home';
  resetCatalogFilters();
  updateCatalogNavigation();
  homeNavigationButton.blur();
  appShell.scrollTo({ top: 0, behavior: 'smooth' });
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

backButton.addEventListener('click', navigateBack);

window.addEventListener('popstate', (event) => {
  updateBackButton();
  if (event.state?.wavsResolverPackView && event.state.packId) {
    openPackById(event.state.packId, true, false);
    return;
  }
  if (event.state?.wavsResolverCreatorView && event.state.creator?.id) {
    clearPackView();
    openCreatorProfile(event.state.creator, event.state.creatorPage || 1, false);
    return;
  }
  clearPackView();
  const previousView = event.state?.wavsResolverPreviousView;
  if (previousView?.type === 'creator-profile' && previousView.creator?.id) {
    openCreatorProfile(previousView.creator, previousView.page || 1, false);
    return;
  }
  if (previousView?.catalogView) {
    catalogView = previousView.catalogView;
    sidebarSection = previousView.sidebarSection || (catalogView === 'favorites' ? 'favorites' : 'explore');
    updateCatalogNavigation();
  }
  closeCreatorProfile();
  renderCatalog();
  requestAnimationFrame(() => appShell.scrollTo(0, Math.max(0, Number(previousView?.scrollY) || 0)));
});

async function openPack(link, scrollToPack = false, updateHistory = true) {
  stopPackHoverPreview();
  const requestVersion = ++packRequestVersion;
  const previousView = history.state?.wavsResolverPackView
    ? history.state.wavsResolverPreviousView
    : capturePreviousView();
  const loadButtonLabel = 'Mostrar pack ';
  if (creatorProfile || creatorProfileLoading || creatorProfileError) closeCreatorProfile();
  input.value = link;
  loadButton.disabled = true;
  loadButton.innerHTML = loadingIndicatorMarkup('Carregando.', 'loading-indicator-compact');
  stopBottomPlayer();
  panel.innerHTML = loadingIndicatorMarkup('Carregando o pack e a lista de samples.', 'loading-indicator-card');
  panel.setAttribute('aria-busy', 'true');
  panel.classList.remove('hidden');
  document.body.classList.add('pack-view-active');
  setStatus('');
  try {
    const result = await window.wavsResolver.loadPack(link);
    if (requestVersion !== packRequestVersion) return;
    if (!result.ok) {
      panel.classList.add('hidden');
      panel.setAttribute('aria-busy', 'false');
      document.body.classList.remove('pack-view-active');
      setStatus(result.message);
      if (scrollToPack) catalogStatus.textContent = result.message;
      return;
    }
    if (updateHistory) {
      const packState = { ...history.state, wavsResolverPackView: true, packId: String(result.packId) };
      if (history.state?.wavsResolverPackView) {
        history.replaceState(packState, '', `#pack-${result.packId}`);
      } else {
        history.replaceState({ ...history.state, wavsResolverPreviousView: previousView, wavsResolverScrollY: appShell.scrollTop }, '');
        history.pushState(packState, '', `#pack-${result.packId}`);
      }
    }
    updateBackButton();
    renderPack(result);
    panel.setAttribute('aria-busy', 'false');
    setStatus('');
    // Open newly selected packs at the top instead of inheriting the home
    // catalog's scroll offset. History restoration keeps its saved position.
    if (scrollToPack || updateHistory) {
      const restoreY = !updateHistory && history.state?.wavsResolverPackView
        ? Math.max(0, Number(history.state.wavsResolverScrollY) || 0)
        : 0;
      appShell.scrollTop = restoreY;
    }
  } catch (error) {
    if (requestVersion !== packRequestVersion) return;
    panel.classList.add('hidden');
    panel.setAttribute('aria-busy', 'false');
    document.body.classList.remove('pack-view-active');
    const message = error.message || 'N�o consegui carregar o pack.';
    setStatus(message);
    if (scrollToPack) catalogStatus.textContent = message;
  } finally {
    if (requestVersion === packRequestVersion) {
      loadButton.disabled = false;
      loadButton.textContent = loadButtonLabel;
    }
  }
}

function openPackById(packId, scrollToPack = false, updateHistory = true) {
  return openPack(`https://wavs.com/packs/${packId}`, scrollToPack, updateHistory);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function drawWaveform(canvas, peaks, progress = 0) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * scale));
  const height = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext('2d');
  if (!context) return;
  const clampedProgress = progress < 0 ? -1 : Math.min(1, Math.max(0, progress));
  const progressPixel = clampedProgress < 0 ? -1 : Math.floor(width * clampedProgress);
  const hoverState = canvas.matches(':hover');
  const layerKey = `${width}x${height}`;
  const sameBase = canvas._waveformPeaks === peaks
    && canvas._waveformLayerKey === layerKey
    && canvas._waveformHoverState === hoverState;
  if (sameBase && canvas._waveformProgressPixel === progressPixel) return;
  if (!peaks?.length) {
    context.clearRect(0, 0, width, height);
    canvas._waveformPeaks = peaks;
    canvas._waveformLayerKey = layerKey;
    canvas._waveformHoverState = hoverState;
    canvas._waveformProgressPixel = progressPixel;
    return;
  }
  let normalized = normalizedWaveformCache.get(peaks);
  if (!normalized) {
    let maxPeak = 0.001;
    for (const peak of peaks) maxPeak = Math.max(maxPeak, peak);
    normalized = peaks.map((peak) => Math.max(0.012, peak / maxPeak));
    normalizedWaveformCache.set(peaks, normalized);
  }
  if (!waveformPalette) {
    const rootStyle = getComputedStyle(document.documentElement);
    waveformPalette = {
      idle: rootStyle.getPropertyValue('--waveform-idle').trim(),
      start: rootStyle.getPropertyValue('--waveform-active-start').trim(),
      mid: rootStyle.getPropertyValue('--waveform-active-mid').trim(),
      end: rootStyle.getPropertyValue('--waveform-active-end').trim()
    };
  }
  let layersBySize = waveformLayerCache.get(peaks);
  if (!layersBySize) {
    layersBySize = new Map();
    waveformLayerCache.set(peaks, layersBySize);
  }
  let layers = layersBySize.get(layerKey);
  if (!layers) {
    const center = height / 2;
    const drawShape = (layerContext, padding = 0) => {
      layerContext.beginPath();
      layerContext.moveTo(padding, center + padding);
      for (let index = 0; index < normalized.length; index += 1) {
        const x = index / (normalized.length - 1) * width + padding;
        layerContext.lineTo(x, center + padding - Math.max(1, normalized[index] * height * 0.48));
      }
      for (let index = normalized.length - 1; index >= 0; index -= 1) {
        const x = index / (normalized.length - 1) * width + padding;
        layerContext.lineTo(x, center + padding + Math.max(1, normalized[index] * height * 0.48));
      }
      layerContext.closePath();
    };
    const idle = document.createElement('canvas');
    idle.width = width;
    idle.height = height;
    const idleContext = idle.getContext('2d');
    if (!idleContext) return;
    drawShape(idleContext);
    idleContext.fillStyle = waveformPalette.idle;
    idleContext.fill();

    const active = document.createElement('canvas');
    active.width = width;
    active.height = height;
    const activeContext = active.getContext('2d');
    if (!activeContext) return;
    drawShape(activeContext);
    const gradient = activeContext.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, waveformPalette.start);
    gradient.addColorStop(0.58, waveformPalette.mid);
    gradient.addColorStop(1, waveformPalette.end);
    activeContext.fillStyle = gradient;
    activeContext.fill();

    // Give the canvas shadow room beyond the waveform's near-edge peaks, then erase
    // its solid center so only a soft, contour-following halo remains.
    const glowPadding = Math.ceil(12 * scale);
    const glow = document.createElement('canvas');
    glow.width = width + glowPadding * 2;
    glow.height = height + glowPadding * 2;
    const glowContext = glow.getContext('2d');
    if (!glowContext) return;
    drawShape(glowContext, glowPadding);
    glowContext.fillStyle = '#fff';
    glowContext.shadowColor = 'rgba(255,255,255,.9)';
    glowContext.shadowBlur = 8 * scale;
    glowContext.fill();
    glowContext.globalCompositeOperation = 'destination-out';
    glowContext.shadowBlur = 0;
    drawShape(glowContext, glowPadding);
    glowContext.fill();

    layers = { idle, active, glow, glowPadding };
    layersBySize.set(layerKey, layers);
  }
  const previousProgressPixel = sameBase ? canvas._waveformProgressPixel : -1;
  const needsFullRedraw = !sameBase || progressPixel < previousProgressPixel;
  if (needsFullRedraw) {
    context.clearRect(0, 0, width, height);
    context.drawImage(layers.idle, 0, 0);
  }
  const activeStart = needsFullRedraw ? 0 : Math.max(0, previousProgressPixel);
  const activeEnd = Math.max(0, progressPixel);
  if (progressPixel >= 0 && activeEnd > activeStart) {
    context.save();
    context.beginPath();
    context.rect(activeStart, 0, activeEnd - activeStart, height);
    context.clip();
    const glowActiveSegment = hoverState;
    if (glowActiveSegment) {
      context.drawImage(layers.glow, -layers.glowPadding, -layers.glowPadding);
    }
    context.drawImage(layers.active, 0, 0);
    context.restore();
  }
  canvas._waveformPeaks = peaks;
  canvas._waveformLayerKey = layerKey;
  canvas._waveformHoverState = hoverState;
  canvas._waveformProgressPixel = progressPixel;
}

function getWaveformPeaks(url) {
  if (!waveformCache.has(url)) {
    const waveform = new Promise((resolve, reject) => {
      waveformTaskQueue.push(async () => {
        try {
          const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
          if (!response.ok) throw new Error(`O WAVS respondeu ${response.status} ao carregar a pr�via.`);
          const audioData = await response.arrayBuffer();
          audioContext ||= new AudioContext();
          const decoded = await audioContext.decodeAudioData(audioData);
          const channels = Array.from({ length: decoded.numberOfChannels }, (_, index) => decoded.getChannelData(index));
          const bucketCount = 360;
          resolve(Array.from({ length: bucketCount }, (_, bucket) => {
            const start = Math.floor(bucket * decoded.length / bucketCount);
            const end = Math.max(start + 1, Math.floor((bucket + 1) * decoded.length / bucketCount));
            const stride = Math.max(1, Math.floor((end - start) / 32));
            let energy = 0;
            let frameCount = 0;
            for (const channel of channels) {
              for (let frame = start + Math.floor(stride / 2); frame < end; frame += stride) {
                energy += channel[frame] ** 2;
                frameCount += 1;
              }
            }
            return frameCount ? Math.sqrt(energy / frameCount) : 0;
          }));
        } catch (error) {
          reject(error);
        } finally {
          activeWaveformTasks -= 1;
          processWaveformQueue();
        }
      });
      processWaveformQueue();
    });
    waveformCache.set(url, waveform);
  }
  return waveformCache.get(url);
}

function processWaveformQueue() {
  while (activeWaveformTasks < maxConcurrentWaveformTasks && waveformTaskQueue.length) {
    const task = waveformTaskQueue.shift();
    activeWaveformTasks += 1;
    task();
  }
}

function setupSamplePlayers(samples) {
  for (const sample of samples) {
    const playButton = sample.querySelector('.sample-play');
    if (playButton) playButton.addEventListener('click', () => playSample(Number(playButton.dataset.sampleIndex)));
    const waveform = sample.querySelector('.sample-waveform');
    if (!waveform) continue;
    const redrawWaveformHover = () => {
      if (!waveform.waveformPeaks) return;
      const isActive = Number(waveform.dataset.sampleIndex) === activeSampleIndex;
      const duration = Number.isFinite(bottomPlayerAudio.duration) ? bottomPlayerAudio.duration : 0;
      drawWaveform(waveform, waveform.waveformPeaks, isActive && duration
        ? bottomPlayerAudio.currentTime / duration
        : -1);
    };
    waveform.addEventListener('pointerenter', redrawWaveformHover);
    waveform.addEventListener('pointerleave', redrawWaveformHover);
    waveform.addEventListener('click', (event) => {
      const sampleIndex = Number(waveform.dataset.sampleIndex);
      if (sampleIndex !== activeSampleIndex || !Number.isFinite(bottomPlayerAudio.duration)) return;
      const bounds = waveform.getBoundingClientRect();
      if (!bounds.width) return;
      const progress = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      bottomPlayerAudio.currentTime = progress * bottomPlayerAudio.duration;
      updateBottomPlayer();
    });
    waveform.addEventListener('keydown', (event) => {
      const sampleIndex = Number(waveform.dataset.sampleIndex);
      if (sampleIndex !== activeSampleIndex) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (bottomPlayerAudio.paused) playSample(sampleIndex);
        else bottomPlayerAudio.pause();
        return;
      }
      if (!Number.isFinite(bottomPlayerAudio.duration)
        || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') bottomPlayerAudio.currentTime = 0;
      else if (event.key === 'End') bottomPlayerAudio.currentTime = bottomPlayerAudio.duration;
      else bottomPlayerAudio.currentTime = Math.min(bottomPlayerAudio.duration, Math.max(0,
        bottomPlayerAudio.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
      updateBottomPlayer();
    });
    getWaveformPeaks(waveform.dataset.url).then((peaks) => {
      if (!waveform.isConnected) return;
      waveform.waveformPeaks = peaks;
      waveform.classList.remove('waveform-loading');
      waveform.classList.add('waveform-ready');
      const progress = Number(waveform.dataset.sampleIndex) === activeSampleIndex && Number.isFinite(bottomPlayerAudio.duration)
        ? bottomPlayerAudio.currentTime / bottomPlayerAudio.duration
        : -1;
      drawWaveform(waveform, peaks, progress);
    }).catch((error) => {
      if (!waveform.isConnected) return;
      waveform.classList.remove('waveform-loading');
      waveform.classList.add('waveform-unavailable');
      waveform.title = error.message || 'A waveform desta pr�via est� indispon�vel.';
    });
  }
}

function findAdjacentPlayableSample(direction) {
  if (activeSampleIndex < 0) return -1;
  for (let index = activeSampleIndex + direction; index >= 0 && index < filteredSamples.length; index += direction) {
    if (filteredSamples[index]?.mp3) return index;
  }
  return -1;
}

function updateBottomPlayer() {
  const duration = Number.isFinite(bottomPlayerAudio.duration) ? bottomPlayerAudio.duration : 0;
  const progress = duration ? bottomPlayerAudio.currentTime / duration : 0;
  drawWaveform(bottomPlayerWaveform, bottomPlayerWaveform.waveformPeaks, bottomPlayerWaveform.waveformPeaks ? progress : -1);
  const timeText = `${formatTime(bottomPlayerAudio.currentTime)} / ${formatTime(duration)}`;
  if (bottomPlayerTime.textContent !== timeText) bottomPlayerTime.textContent = timeText;
  const progressValue = String(Math.round(progress * 100));
  if (bottomPlayerWaveform.getAttribute('aria-valuenow') !== progressValue) {
    bottomPlayerWaveform.setAttribute('aria-valuenow', progressValue);
  }
  bottomPlayerToggle.classList.toggle('is-playing', !bottomPlayerAudio.paused);
  bottomPlayerToggle.setAttribute('aria-label', bottomPlayerAudio.paused ? 'Reproduzir pr�via' : 'Pausar pr�via');
  bottomPlayerRepeat.classList.toggle('is-active', bottomPlayerAudio.loop);
  bottomPlayerRepeat.setAttribute('aria-pressed', String(bottomPlayerAudio.loop));
  bottomPlayerPrevious.disabled = Boolean(activePackPreviewId) || findAdjacentPlayableSample(-1) < 0;
  bottomPlayerNext.disabled = Boolean(activePackPreviewId) || findAdjacentPlayableSample(1) < 0;
  if (activePackPreviewCard) {
    const previewButton = activePackPreviewCard.querySelector('.catalog-preview-button');
    activePackPreviewCard.classList.toggle('is-previewing', !bottomPlayerAudio.paused);
    previewButton?.setAttribute('aria-pressed', String(!bottomPlayerAudio.paused));
  }
  for (const button of panel.querySelectorAll('.sample-play')) {
    const isActive = Number(button.dataset.sampleIndex) === activeSampleIndex && !bottomPlayerAudio.paused;
    button.closest('.sample')?.classList.toggle('sample-current', Number(button.dataset.sampleIndex) === activeSampleIndex);
    button.textContent = isActive ? '?' : '?';
    button.setAttribute('aria-label', isActive ? 'Pausar pr�via' : 'Reproduzir pr�via');
  }
  for (const waveform of panel.querySelectorAll('.sample-waveform')) {
    const isActive = Number(waveform.dataset.sampleIndex) === activeSampleIndex;
    waveform.setAttribute('aria-disabled', String(!isActive || !duration));
    waveform.tabIndex = isActive && duration ? 0 : -1;
    waveform.setAttribute('aria-valuenow', String(isActive ? Math.round(progress * 100) : 0));
  }
  if (lastWaveformSampleIndex !== activeSampleIndex) {
    const previousWaveform = panel.querySelector(`.sample-waveform[data-sample-index="${lastWaveformSampleIndex}"]`);
    if (previousWaveform?.waveformPeaks) drawWaveform(previousWaveform, previousWaveform.waveformPeaks, -1);
    lastWaveformSampleIndex = activeSampleIndex;
  }
  const activeWaveform = panel.querySelector(`.sample-waveform[data-sample-index="${activeSampleIndex}"]`);
  if (activeWaveform?.waveformPeaks) drawWaveform(activeWaveform, activeWaveform.waveformPeaks, duration ? progress : -1);
  if (bottomPlayerAudio.paused) {
    cancelAnimationFrame(playerAnimationFrame);
    playerAnimationFrame = 0;
  } else if (!playerAnimationFrame) playerAnimationFrame = requestAnimationFrame(animatePlayerFrame);
}

function animatePlayerFrame(timestamp) {
  playerAnimationFrame = 0;
  if (bottomPlayerAudio.paused || !bottomPlayerAudio.src || document.visibilityState !== 'visible') return;
  const duration = Number.isFinite(bottomPlayerAudio.duration) ? bottomPlayerAudio.duration : 0;
  const progress = duration ? bottomPlayerAudio.currentTime / duration : 0;
  drawWaveform(bottomPlayerWaveform, bottomPlayerWaveform.waveformPeaks, bottomPlayerWaveform.waveformPeaks ? progress : -1);
  const activePackWaveform = panel.querySelector(`.sample-waveform[data-sample-index="${activeSampleIndex}"]`);
  if (activePackWaveform?.waveformPeaks) {
    drawWaveform(activePackWaveform, activePackWaveform.waveformPeaks, progress);
    activePackWaveform.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }
  const timeText = `${formatTime(bottomPlayerAudio.currentTime)} / ${formatTime(duration)}`;
  if (bottomPlayerTime.textContent !== timeText) bottomPlayerTime.textContent = timeText;
  const progressValue = String(Math.round(progress * 100));
  if (bottomPlayerWaveform.getAttribute('aria-valuenow') !== progressValue) {
    bottomPlayerWaveform.setAttribute('aria-valuenow', progressValue);
  }
  playerAnimationFrame = requestAnimationFrame(animatePlayerFrame);
}

function showBottomPlayer() {
  clearTimeout(bottomPlayerHideTimer);
  bottomPlayer.classList.remove('is-hiding', 'hidden');
  document.body.classList.add('player-active');
}

function stopBottomPlayer() {
  activePackPreviewCard?.classList.remove('is-previewing');
  activePackPreviewCard?.querySelector('.catalog-preview-button')?.setAttribute('aria-pressed', 'false');
  activePackPreviewCard = null;
  activePackPreviewId = null;
  bottomPlayerAudio.pause();
  bottomPlayerAudio.loop = false;
  bottomPlayerAudio.removeAttribute('src');
  bottomPlayerAudio.load();
  activeSampleIndex = -1;
  if (!bottomPlayer.classList.contains('hidden')) {
    clearTimeout(bottomPlayerHideTimer);
    bottomPlayer.classList.add('is-hiding');
    bottomPlayerHideTimer = setTimeout(() => {
      bottomPlayer.classList.add('hidden');
      bottomPlayer.classList.remove('is-hiding');
      document.body.classList.remove('player-active');
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 25 : 610);
  } else {
    document.body.classList.remove('player-active');
  }
  bottomPlayerDownload.classList.add('hidden');
  bottomPlayerWaveform.waveformPeaks = null;
  drawWaveform(bottomPlayerWaveform, null);
  updateBottomPlayer();
}

async function playSample(index) {
  const sample = filteredSamples[index];
  if (!sample?.mp3 || !currentPack) return;
  stopPackHoverPreview();
  if (activeSampleIndex === index && !bottomPlayerAudio.paused) {
    bottomPlayerAudio.pause();
    return;
  }
  const isNewSample = activeSampleIndex !== index;
  activePackPreviewId = null;
  activeSampleIndex = index;
  showBottomPlayer();
  bottomPlayerTitle.textContent = sample.title || 'Pr�via WAVS';
  bottomPlayerSubtitle.textContent = `${currentPack.pack.title || 'Pack WAVS'} � ${sample.user_display || sample.user_username || currentPack.pack.user?.display || currentPack.pack.user?.username || 'Criador WAVS'}`;
  const cover = coverUrl(currentPack.pack);
  bottomPlayerCover.classList.toggle('hidden', !cover);
  bottomPlayerCoverFallback.classList.toggle('hidden', Boolean(cover));
  if (cover) bottomPlayerCover.src = cover;
  bottomPlayerDownload.classList.remove('hidden');
  for (const [key, value] of Object.entries({
    url: sample.mp3,
    title: sample.title || 'wavs-sample',
    tempo: sample.tempo || '',
    author: sample.user_display || sample.user_username || currentPack.pack.user?.display || currentPack.pack.user?.username || ''
  })) bottomPlayerDownload.dataset[key] = String(value);

  if (isNewSample || bottomPlayerAudio.src !== sample.mp3) {
    bottomPlayerAudio.pause();
    bottomPlayerAudio.src = sample.mp3;
    bottomPlayerAudio.load();
    bottomPlayerWaveform.waveformPeaks = null;
    bottomPlayerWaveform.classList.add('waveform-loading');
    drawWaveform(bottomPlayerWaveform, null);
    getWaveformPeaks(sample.mp3).then((peaks) => {
      if (activeSampleIndex !== index) return;
      bottomPlayerWaveform.waveformPeaks = peaks;
      bottomPlayerWaveform.classList.remove('waveform-loading', 'waveform-unavailable');
      updateBottomPlayer();
    }).catch((error) => {
      if (activeSampleIndex !== index) return;
      bottomPlayerWaveform.title = error.message;
      bottomPlayerWaveform.classList.remove('waveform-loading');
      bottomPlayerWaveform.classList.add('waveform-unavailable');
    });
  }
  updateBottomPlayer();
  try {
    await bottomPlayerAudio.play();
  } catch (error) {
    setDownloadStatus(error.message || 'N�o foi poss�vel reproduzir esta pr�via.', false, presentation);
  }
}

function renderSample(sample, pack, index) {
  const details = sampleDetails(sample);
  const detailsMarkup = details.length
    ? details.map(({ label, value }) => `<span class="sample-detail"><span>${escapeHtml(label)}</span>${escapeHtml(value)}</span>`).join('')
    : '<span class="sample-meta">BPM, tom e estilo indispon�veis</span>';
  const author = sample.user_display || sample.user_username || pack.user?.display || pack.user?.username || '';
  const cover = coverUrl(pack);
  const coverMarkup = cover
    ? `<img class="sample-cover" src="${escapeHtml(cover)}" alt="" loading="lazy">`
    : '<span class="sample-cover sample-cover-fallback" aria-hidden="true">W</span>';
  const waveform = sample.mp3
     ? `<canvas class="sample-waveform waveform-loading" data-url="${escapeHtml(sample.mp3)}" data-sample-index="${index}" role="slider" aria-label="Posi��o da pr�via da sample" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-disabled="true" tabindex="-1"></canvas>`
    : '<span class="sample-waveform-empty">Sem pr�via</span>';
  const player = sample.mp3
    ? `<button class="sample-download" type="button" data-url="${escapeHtml(sample.mp3)}" data-title="${escapeHtml(sample.title)}" data-tempo="${escapeHtml(sample.tempo || '')}" data-author="${escapeHtml(author)}">Baixar MP3</button>`
    : '<span class="sample-meta">Pr�via indispon�vel</span>';
  return `<article class="sample${index === activeSampleIndex ? ' sample-current' : ''}"><button class="sample-play" type="button" data-sample-index="${index}" aria-label="Reproduzir pr�via" ${sample.mp3 ? '' : 'disabled'}>${index === activeSampleIndex && !bottomPlayerAudio.paused ? '?' : '?'}</button>${coverMarkup}<div class="sample-waveform-wrap">${waveform}</div><div class="sample-content"><div class="sample-title" title="${escapeHtml(sample.title)}">${escapeHtml(sample.title)}</div><div class="sample-details">${detailsMarkup}</div></div>${player}</article>`;
}

function renderSamplePage() {
  if (!currentPack) return;
  const start = currentSamplePage * samplePageSize;
  const end = Math.min(start + samplePageSize, filteredSamples.length);
  const sampleList = panel.querySelector('.sample-list');
  const pageSamples = filteredSamples.slice(start, end);
  sampleList.innerHTML = pageSamples.map((sample, offset) => renderSample(sample, currentPack.pack, start + offset)).join('');
  setupSamplePlayers([...sampleList.querySelectorAll('.sample')]);
  sampleList.querySelectorAll('.sample-download').forEach((button) => {
    button.disabled = Boolean(activePackDownload);
    button.addEventListener('click', () => downloadSample(button));
  });
  const pageCount = Math.ceil(filteredSamples.length / samplePageSize);
  const pagination = panel.querySelector('#samples-pagination');
  pagination.classList.toggle('hidden', pageCount <= 1);
  panel.querySelector('#samples-previous').disabled = currentSamplePage <= 0;
  panel.querySelector('#samples-next').disabled = currentSamplePage >= pageCount - 1;
  panel.querySelector('#samples-page-status').textContent = `${currentSamplePage + 1} / ${pageCount}`;
}

function changeSamplePage(delta) {
  const pageCount = Math.ceil(filteredSamples.length / samplePageSize);
  currentSamplePage = Math.min(pageCount - 1, Math.max(0, currentSamplePage + delta));
  renderSamplePage();
  panel.querySelector('.sample-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterPackSamples() {
  if (!currentPack) return;
  const query = sampleSearchInput.value.trim().toLocaleLowerCase();
  const sampleList = panel.querySelector('.sample-list');
  currentSamplePage = 0;
  stopBottomPlayer();
  sampleList.replaceChildren();
  filteredSamples = currentPack.samples.filter((sample) => {
    const title = String(sample.title || '').toLocaleLowerCase();
    return !query || title.includes(query);
  });
  sampleFilterStatus.textContent = `${filteredSamples.length} de ${currentPack.samples.length} samples`;
  if (filteredSamples.length === 0) {
    sampleList.innerHTML = '<p class="sample-empty">Nenhuma sample combina com esses filtros.</p>';
    panel.querySelector('#samples-pagination').classList.add('hidden');
    return;
  }
  renderSamplePage();
}

function renderPack(result) {
  stopBottomPlayer();
  const pack = result.pack;
  currentPack = result;
  currentSamplePage = 0;
  const cover = coverUrl(pack);
  const creator = pack.user || {};
  const genres = (pack.genres || []).map((genre) => typeof genre === 'string' ? genre : genre?.title).filter(Boolean);
  const saved = favoritePacks.some((favorite) => String(favorite.id) === String(pack.id));
  panel.innerHTML = `<div class="pack-navigation"><button id="back-home" class="back-home-button" type="button"> Voltar � home</button></div><div class="pack-head">${cover ? `<img class="pack-cover" src="${escapeHtml(cover)}" alt="Capa de ${escapeHtml(pack.title)}">` : '<div class="pack-cover"></div>'}<div class="pack-info"><button class="pack-creator" type="button" data-creator-id="${escapeHtml(creator.id ?? '')}" data-creator-username="${escapeHtml(creator.username ?? '')}" data-creator-display="${escapeHtml(creator.display || creator.username || 'Criador WAVS')}">${escapeHtml(creator.display || creator.username || 'Criador WAVS')}</button><h2 class="pack-title">${escapeHtml(pack.title)}</h2><p class="pack-description">${escapeHtml(plainDescription(pack.description))}</p><div class="chips">${genres.map((genre) => `<span class="chip">${escapeHtml(genre)}</span>`).join('')}<span class="chip">${escapeHtml(formatPackDate(pack))}</span>${pack.is_free ? '<span class="chip">Gratuito</span>' : ''}</div><div class="pack-actions"><span class="sample-count">${Number(result.sampleCount || result.samples.length)} samples</span><button class="back-home-button pack-favorite${saved ? ' is-saved' : ''}" type="button" aria-pressed="${saved}">${saved ? ' Pack salvo' : '? Salvar pack'}</button></div></div></div><div class="samples-head"><span>Samples do pack</span><span>Pr�via � BPM � tom � estilo</span></div><div class="sample-toolbar"><label class="sample-search"><span aria-hidden="true">?</span><input id="sample-search" type="search" placeholder="Buscar por nome." autocomplete="off" aria-label="Buscar samples por nome"></label><span id="sample-filter-status" class="sample-filter-status"></span></div><div class="sample-list"></div><nav id="samples-pagination" class="samples-pagination hidden" aria-label="Pagina��o das samples"><button id="samples-previous" type="button" aria-label="P�gina anterior"> Anterior</button><span id="samples-page-status"></span><button id="samples-next" type="button" aria-label="Pr�xima p�gina">Pr�xima </button></nav>`;
  panel.classList.remove('hidden');
  const packBackButton = panel.querySelector('#back-home');
  packBackButton.textContent = 'Voltar';
  packBackButton.addEventListener('click', returnToHome);
  const packActions = panel.querySelector('.pack-actions');
  const packDownloadButton = document.createElement('button');
  packDownloadButton.className = 'sample-download pack-download';
  packDownloadButton.type = 'button';
  packDownloadButton.textContent = activePackDownload ? 'Download em andamento' : 'Baixar pack';
  packDownloadButton.disabled = Boolean(activePackDownload) || !result.samples.some((sample) => sample?.mp3);
  packDownloadButton.dataset.loading = String(Boolean(activePackDownload));
  packDownloadButton.setAttribute('aria-label', `Baixar todas as pr�vias MP3 de ${pack.title}`);
  packDownloadButton.title = 'Baixar as pr�vias dispon�veis em uma pasta com o nome do pack';
  packDownloadButton.addEventListener('click', () => downloadEntirePack(packDownloadButton));
  packActions.insertBefore(packDownloadButton, panel.querySelector('.pack-favorite'));
  panel.querySelector('.pack-favorite').addEventListener('click', () => toggleFavoritePack(pack.id));
  panel.querySelector('.pack-creator').addEventListener('click', (event) => {
    const button = event.currentTarget;
    openCreatorProfile({
      id: button.dataset.creatorId,
      username: button.dataset.creatorUsername,
      display: button.dataset.creatorDisplay
    });
  });
  panel.querySelector('#samples-previous').addEventListener('click', () => changeSamplePage(-1));
  panel.querySelector('#samples-next').addEventListener('click', () => changeSamplePage(1));
  sampleSearchInput = panel.querySelector('#sample-search');
  sampleFilterStatus = panel.querySelector('#sample-filter-status');
  sampleSearchInput.addEventListener('input', filterPackSamples);
  filterPackSamples();
}

async function downloadSample(button) {
  if (activePackDownload) return;
  button.disabled = true;
  const sampleCover = button.closest('.sample')?.querySelector('.sample-cover');
  const presentation = {
    title: String(button.dataset.title || 'Sample').replace(/\.(?:mp3|wav)$/i, ''),
    cover: sampleCover?.src || bottomPlayerCover.src || ''
  };
  try {
    const result = await window.wavsResolver.downloadSamplePreview(button.dataset.url, button.dataset.title, button.dataset.tempo, button.dataset.author);
    if (result.status === 'started') {
      activeDownloadId = result.downloadId;
      downloadPresentations.set(result.downloadId, presentation);
      activeDownloadJobs.set(result.downloadId, { downloadId: result.downloadId, filename: result.filename, received: 0, total: 0 });
      updateDownloadStatus(activeDownloadJobs.get(result.downloadId));
      return;
    }
    if (result.status === 'already-exists') {
      playNotificationBubble();
      setDownloadStatus(presentation.title, true, presentation);
      return;
    }
    setDownloadStatus(result.message || 'N�o consegui baixar esta pr�via MP3.', false, presentation);
  } catch (error) {
    setDownloadStatus(error.message || 'N�o consegui baixar esta pr�via MP3.', false, presentation);
  } finally {
    button.disabled = false;
  }
}

function waitForPackDownload(downloadId) {
  const completed = completedPackDownloadEvents.get(downloadId);
  if (completed) {
    completedPackDownloadEvents.delete(downloadId);
    return Promise.resolve(completed);
  }
  return new Promise((resolve) => packDownloadWaiters.set(downloadId, resolve));
}

async function downloadEntirePack(button) {
  if (!currentPack || activePackDownload) return;
  const pack = currentPack.pack;
  const cover = coverUrl(pack);
  const samples = Array.isArray(currentPack.samples) ? currentPack.samples : [];
  const downloadable = samples.filter((sample) => sample?.mp3);
  if (!downloadable.length) {
    setDownloadStatus('Este pack n�o tem pr�vias MP3 para baixar.', false, { title: pack.title, cover });
    return;
  }

  const task = {
    packId: String(pack.id),
    total: downloadable.length,
    finishedCount: 0,
    currentDownloadId: '',
    currentSampleUrl: '',
    cancelled: false
  };
  activePackDownload = task;
  const previousFolderButtonDisabled = chooseSampleDestinationButton.disabled;
  const unavailableCount = samples.length - downloadable.length;
  button.disabled = true;
  button.textContent = 'Baixando pack...';
  button.dataset.loading = 'true';
  panel.querySelectorAll('.sample-download:not(.pack-download)').forEach((sampleButton) => { sampleButton.disabled = true; });
  bottomPlayerDownload.disabled = true;
  chooseSampleDestinationButton.disabled = true;
  const seenNames = new Map();
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  try {
    for (let index = 0; index < downloadable.length; index += 1) {
      if (task.cancelled) break;
      const sample = downloadable[index];
      try {
        const sampleUrl = new URL(sample.mp3);
        sampleUrl.hash = '';
        task.currentSampleUrl = sampleUrl.href;
      } catch {
        task.currentSampleUrl = sample.mp3;
      }
      const author = sample.user_display || sample.user_username || pack.user?.display || pack.user?.username || '';
      const title = String(sample.title || `Sample ${index + 1}`);
      const nameKey = `${title.trim().toLocaleLowerCase()}|${sample.tempo || ''}|${author.trim().toLocaleLowerCase()}`;
      const occurrence = (seenNames.get(nameKey) || 0) + 1;
      seenNames.set(nameKey, occurrence);
      const tail = [sample.tempo ? `${sample.tempo} BPM` : '', author || 'autor desconhecido'].filter(Boolean).join(' - ');
      const maxTitleLength = Math.max(12, 120 - tail.length - (tail ? 3 : 0));
      const duplicateSuffix = occurrence > 1 ? ` (${occurrence})` : '';
      const filenameTitle = occurrence > 1
        ? `${title.slice(0, Math.max(1, maxTitleLength - duplicateSuffix.length)).trimEnd()}${duplicateSuffix}`
        : title;
      const presentation = { title: `${index + 1}/${downloadable.length} - ${title}`, cover };
      clearTimeout(downloadStatusDismissTimer);
      setDownloadStatus(presentation.title, false, presentation);
      clearTimeout(downloadStatusDismissTimer);
      downloadStatus.setAttribute('aria-busy', 'true');
      downloadProgressBar.classList.remove('hidden');
      downloadProgressBar.value = Math.round((task.finishedCount / task.total) * 100);

      let result;
      try {
        result = await window.wavsResolver.downloadSamplePreview(
          sample.mp3, filenameTitle, sample.tempo || '', author, pack.title || 'WAVS Pack'
        );
      } catch (error) {
        task.currentSampleUrl = '';
        failed += 1;
        task.finishedCount += 1;
        setDownloadStatus(`${presentation.title} - ${error.message || 'falhou'}`, false, presentation);
        continue;
      }

      if (result.status === 'already-exists') {
        task.currentSampleUrl = '';
        skipped += 1;
        task.finishedCount += 1;
        downloadProgressBar.value = Math.round((task.finishedCount / task.total) * 100);
        continue;
      }
      if (result.status !== 'started') {
        task.currentSampleUrl = '';
        failed += 1;
        task.finishedCount += 1;
        continue;
      }

      task.currentDownloadId = result.downloadId;
      task.currentSampleUrl = result.downloadId;
      activeDownloadId = result.downloadId;
      downloadPresentations.set(result.downloadId, presentation);
      activeDownloadJobs.set(result.downloadId, {
        downloadId: result.downloadId,
        filename: result.filename,
        received: 0,
        total: 0
      });
      updateDownloadStatus(activeDownloadJobs.get(result.downloadId));
      if (task.cancelled) void window.wavsResolver.cancelSamplePreviewDownload(result.downloadId);
      const completion = await waitForPackDownload(result.downloadId);
      activeDownloadJobs.delete(result.downloadId);
      downloadPresentations.delete(result.downloadId);
      cancellingDownloadIds.delete(result.downloadId);
      if (activeDownloadId === result.downloadId) activeDownloadId = [...activeDownloadJobs.keys()].pop() || '';
      task.currentDownloadId = '';
      task.currentSampleUrl = '';
      task.finishedCount += 1;
      if (completion.state === 'completed') downloaded += 1;
      else if (completion.state === 'cancelled') {
        task.cancelled = true;
      } else failed += 1;
    }

    const folder = String(pack.title || 'WAVS Pack');
    const summary = task.cancelled
      ? `Download interrompido - ${downloaded}/${task.total} samples baixadas`
      : `Pack organizado na pasta ${folder} - ${downloaded} baixadas${skipped ? `, ${skipped} ja existentes` : ''}${failed ? `, ${failed} com falha` : ''}${unavailableCount ? `, ${unavailableCount} sem MP3` : ''}`;
    downloadProgressBar.classList.add('hidden');
    cancelDownloadButton.classList.add('hidden');
    cancelDownloadButton.disabled = false;
    activePackDownload = null;
    if (!task.cancelled && downloaded > 0) playNotificationBubble();
    setDownloadStatus(summary, !task.cancelled && failed === 0, { title: folder, cover });
  } catch (error) {
    downloadProgressBar.classList.add('hidden');
    cancelDownloadButton.classList.add('hidden');
    activePackDownload = null;
    setDownloadStatus(error.message || 'N�o consegui baixar o pack inteiro.', false, { title: pack.title, cover });
  } finally {
    if (activePackDownload === task) activePackDownload = null;
    chooseSampleDestinationButton.disabled = previousFolderButtonDisabled;
    if (button.isConnected) {
      button.disabled = false;
      button.textContent = 'Baixar pack';
      button.dataset.loading = 'false';
    }
    const visiblePackButton = panel.querySelector('.pack-download');
    if (visiblePackButton) {
      visiblePackButton.disabled = !currentPack?.samples?.some((sample) => sample?.mp3);
      visiblePackButton.textContent = 'Baixar pack';
      visiblePackButton.dataset.loading = 'false';
    }
    panel.querySelectorAll('.sample-download:not(.pack-download)').forEach((sampleButton) => { sampleButton.disabled = false; });
    bottomPlayerDownload.disabled = false;
    completedPackDownloadEvents.clear();
  }
}

async function updateSampleDownloadDirectory() {
  sampleDestinationPath.innerHTML = loadingIndicatorMarkup('Carregando pasta.', 'loading-indicator-compact');
  sampleDestinationPath.setAttribute('aria-busy', 'true');
  sampleDestinationPath.textContent = await window.wavsResolver.getSampleDownloadDirectory();
  sampleDestinationPath.setAttribute('aria-busy', 'false');
}
chooseSampleDestinationButton.addEventListener('click', async () => {
  const originalLabel = chooseSampleDestinationButton.textContent;
  chooseSampleDestinationButton.disabled = true;
  chooseSampleDestinationButton.innerHTML = loadingIndicatorMarkup('Abrindo.', 'loading-indicator-compact');
  try {
    const result = await window.wavsResolver.chooseSampleDownloadDirectory();
    if (result.error) {
      setStatus(result.error);
      return;
    }
    sampleDestinationPath.textContent = result.path;
    if (!result.cancelled) setStatus('Pasta das samples atualizada.', true);
  } catch (error) {
    setStatus(error.message || 'N�o foi poss�vel escolher a pasta das samples.');
  } finally {
    chooseSampleDestinationButton.disabled = false;
    chooseSampleDestinationButton.textContent = originalLabel;
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await openPack(input.value.trim(), false);
});
refreshCatalogButton.addEventListener('click', () => loadNewPacks());
homeLink.addEventListener('click', (event) => {
  event.preventDefault();
  navigateHome();
});
catalogSearchInput.addEventListener('input', () => {
  visiblePackCount = 12;
  catalogRequestVersion += 1;
  catalogPageLoading = false;
  catalogPageError = false;
  globalSearchRequestVersion += 1;
  clearTimeout(globalSearchDebounce);
  globalSearchPacks = [];
  globalSearchSamples = [];
  globalSearchCreators = [];
  globalSearchCreatorsLoaded = false;
  creatorSuggestionsDismissed = false;
  globalSearchMode = catalogView !== 'favorites' && catalogSearchInput.value.trim().length >= 2;
  globalSearchLoading = globalSearchMode;
  globalSearchError = '';
  globalSearchWarning = '';
  globalSearchPage = 0;
  globalSearchLastPage = 0;
  globalSearchCreator = null;
  genreFilterLoading = false;
  genreFilterError = '';
  genreFilterId = '';
  genreFilterName = '';
  genreFilterPage = 0;
  genreFilterLastPage = 0;
  genreFilterTotal = 0;
  const query = catalogSearchInput.value.trim();
  renderCatalog();
  renderCreatorSearchSuggestions();
  if (globalSearchMode) {
    globalSearchDebounce = window.setTimeout(() => searchWavsPacks(query), 350);
  } else if (catalogView !== 'favorites') {
    loadDiscoveryPacks('all', 'Todos os packs');
  }
});
catalogSearchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    creatorSuggestionsDismissed = true;
    renderCreatorSearchSuggestions();
    clearTimeout(globalSearchDebounce);
    const query = catalogSearchInput.value.trim();
    if (query.length >= 2 && catalogView !== 'favorites') searchWavsPacks(query);
  } else if (event.key === 'Escape') {
    creatorSuggestionsDismissed = true;
    renderCreatorSearchSuggestions();
  } else if (event.key === 'ArrowDown') {
    const firstSuggestion = creatorSearchSuggestions.querySelector('.creator-suggestion');
    if (firstSuggestion) {
      event.preventDefault();
      firstSuggestion.focus();
    }
  }
});
catalogSearchInput.addEventListener('focus', () => {
  creatorSuggestionsDismissed = false;
  renderCreatorSearchSuggestions();
});
catalogSearchInput.addEventListener('blur', (event) => {
  if (event.relatedTarget?.closest('.creator-search-suggestions')) return;
  creatorSuggestionsDismissed = true;
  renderCreatorSearchSuggestions();
});
catalogGenreSelect.addEventListener('change', () => {
  visiblePackCount = 12;
  if (globalSearchMode) {
    renderCatalog();
    return;
  }
  const selectedOption = catalogGenreSelect.selectedOptions[0];
  const genreId = selectedOption?.dataset.genreId || '';
  genreFilterError = '';
  if (!catalogGenreSelect.value && catalogView !== 'favorites') {
    loadDiscoveryPacks('all', 'Todos os packs');
    return;
  }
  if (!catalogGenreSelect.value || catalogView === 'favorites' || !genreId) {
    genreFilterId = '';
    genreFilterName = '';
    genreFilterPage = 0;
    genreFilterLastPage = 0;
    genreFilterTotal = 0;
    if (catalogGenreSelect.value && catalogView !== 'favorites' && !genreId) {
      genreFilterError = 'N�o encontrei o identificador deste g�nero no cat�logo. Atualize os packs e tente novamente.';
    }
    renderCatalog();
    return;
  }
  loadDiscoveryPacks(genreId, catalogGenreSelect.value);
});
catalogPeriodSelect.addEventListener('change', () => {
  visiblePackCount = 12;
  renderCatalog();
});
catalogSortSelect.addEventListener('change', () => {
  visiblePackCount = 12;
  renderCatalog();
});
clearCatalogFiltersButton.addEventListener('click', () => {
  resetCatalogFilters();
  updateCatalogNavigation();
});
exploreNavigationButton.addEventListener('click', () => setCatalogView('explore'));
favoritesNavigationButton.addEventListener('click', () => setCatalogView('favorites'));
homeNavigationButton.addEventListener('click', navigateHome);
recentPreviousButton.addEventListener('click', () => recentList.scrollBy({ left: -recentList.clientWidth * 0.82, behavior: 'smooth' }));
recentNextButton.addEventListener('click', () => recentList.scrollBy({ left: recentList.clientWidth * 0.82, behavior: 'smooth' }));
let outsideWheelDelta = 0;
let outsideWheelFrame = 0;
function forwardOutsideWheel(event) {
  if (!event.deltaY || event.ctrlKey || event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  if (event.target.closest?.('#bottom-player input[type="range"]')) return;
  const delta = event.deltaMode === 1
    ? event.deltaY * 16
    : event.deltaMode === 2
      ? event.deltaY * appShell.clientHeight
      : event.deltaY;
  event.preventDefault();
  outsideWheelDelta += delta;
  if (outsideWheelFrame) return;
  outsideWheelFrame = requestAnimationFrame(() => {
    appShell.scrollTop += outsideWheelDelta;
    outsideWheelDelta = 0;
    outsideWheelFrame = 0;
  });
}
document.querySelector('.app-sidebar').addEventListener('wheel', forwardOutsideWheel, { passive: false });
bottomPlayer.addEventListener('wheel', forwardOutsideWheel, { passive: false });
appShell.addEventListener('scroll', () => {
  if (catalogRenderPending && appShell.scrollTop <= 2 && canShowCatalogRefreshStatus()) renderCatalog();
}, { passive: true });
catalogMoreButton.addEventListener('click', () => {
  if (globalSearchMode && globalSearchPage < globalSearchLastPage) {
    searchWavsPacks(catalogSearchInput.value.trim(), globalSearchPage + 1, true);
    return;
  }
  if (genreFilterId && genreFilterPage < genreFilterLastPage) {
    loadDiscoveryPacks(genreFilterId, genreFilterName, genreFilterPage + 1, true);
    return;
  }
  if (!genreFilterId && catalogPageError && catalogPage < catalogLastPage) {
    loadCatalogPage(catalogPage + 1);
    return;
  }
  if (visiblePackCount < filteredCatalogPacks.length) {
    visiblePackCount += 12;
    renderCatalog();
    return;
  }
  if (!genreFilterId && catalogPage < catalogLastPage) loadCatalogPage(catalogPage + 1);
});
window.setInterval(() => {
  if (document.visibilityState === 'visible') loadNewPacks({ quiet: true });
}, catalogRefreshInterval);
window.addEventListener('focus', () => {
  if (Date.now() - lastCatalogRefreshAt >= 30_000) loadNewPacks({ quiet: true });
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') {
    stopPackHoverPreview();
    cancelAnimationFrame(playerAnimationFrame);
    playerAnimationFrame = 0;
  } else if (!bottomPlayerAudio.paused && bottomPlayerAudio.src && !playerAnimationFrame) {
    playerAnimationFrame = requestAnimationFrame(animatePlayerFrame);
  }
  if (document.visibilityState === 'visible' && Date.now() - lastCatalogRefreshAt >= 30_000) {
    loadNewPacks({ quiet: true });
  }
});

function syncPlayerVolumeControl() {
  const volume = Math.max(0, Math.min(1, Number(bottomPlayerVolume.value) || 0));
  bottomPlayerVolume.style.setProperty('--volume-level', `${volume * 100}%`);
}
bottomPlayerAudio.volume = Number(bottomPlayerVolume.value);
syncPlayerVolumeControl();
themeToggleButton.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  themeChangedBeforePreferencesLoaded = true;
  applyTheme(nextTheme);
  void saveAppPreference('theme', nextTheme);
});
function savePlayerVolumePreference() {
  clearTimeout(playerVolumeSaveTimer);
  const volume = Number(bottomPlayerVolume.value);
  playerVolumeSaveTimer = window.setTimeout(() => {
    void saveAppPreference('playerVolume', volume);
  }, 250);
}
bottomPlayerVolume.addEventListener('input', () => {
  bottomPlayerAudio.volume = Number(bottomPlayerVolume.value);
  syncPlayerVolumeControl();
  volumeChangedBeforePreferencesLoaded = true;
  savePlayerVolumePreference();
});
bottomPlayerVolume.addEventListener('change', () => {
  clearTimeout(playerVolumeSaveTimer);
  void saveAppPreference('playerVolume', Number(bottomPlayerVolume.value));
});
window.wavsResolver.getAppPreferences().then((preferences) => {
  if (!volumeChangedBeforePreferencesLoaded && Number.isFinite(preferences.playerVolume)) {
    bottomPlayerVolume.value = String(preferences.playerVolume);
    bottomPlayerAudio.volume = preferences.playerVolume;
    syncPlayerVolumeControl();
  }
  if (!themeChangedBeforePreferencesLoaded) applyTheme(preferences.theme);
}).catch((error) => {
  setStatus(error.message || 'N�o foi poss�vel carregar as prefer�ncias do app.');
});
bottomPlayerToggle.addEventListener('click', () => {
  if (!bottomPlayerAudio.src) return;
  if (bottomPlayerAudio.paused) bottomPlayerAudio.play().catch((error) => setDownloadStatus(error.message || 'N�o foi poss�vel reproduzir esta pr�via.'));
  else bottomPlayerAudio.pause();
});
bottomPlayerPrevious.addEventListener('click', () => {
  const previousIndex = findAdjacentPlayableSample(-1);
  if (previousIndex >= 0) playSample(previousIndex);
});
bottomPlayerNext.addEventListener('click', () => {
  const nextIndex = findAdjacentPlayableSample(1);
  if (nextIndex >= 0) playSample(nextIndex);
});
bottomPlayerRepeat.addEventListener('click', () => {
  bottomPlayerAudio.loop = !bottomPlayerAudio.loop;
  updateBottomPlayer();
  setStatus(bottomPlayerAudio.loop ? 'Repeti��o da sample ativada.' : 'Repeti��o da sample desativada.', true);
});
bottomPlayerAudio.addEventListener('play', updateBottomPlayer);
bottomPlayerAudio.addEventListener('pause', updateBottomPlayer);
bottomPlayerAudio.addEventListener('ended', updateBottomPlayer);
bottomPlayerAudio.addEventListener('loadedmetadata', updateBottomPlayer);
bottomPlayerAudio.addEventListener('timeupdate', updateBottomPlayer);
bottomPlayerAudio.addEventListener('error', () => setDownloadStatus('Esta pr�via MP3 est� indispon�vel.'));
bottomPlayerWaveform.addEventListener('click', (event) => {
  if (!Number.isFinite(bottomPlayerAudio.duration)) return;
  const bounds = bottomPlayerWaveform.getBoundingClientRect();
  bottomPlayerAudio.currentTime = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)) * bottomPlayerAudio.duration;
  updateBottomPlayer();
});
bottomPlayerWaveform.addEventListener('keydown', (event) => {
  if (!Number.isFinite(bottomPlayerAudio.duration) || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') bottomPlayerAudio.currentTime = 0;
  else if (event.key === 'End') bottomPlayerAudio.currentTime = bottomPlayerAudio.duration;
  else bottomPlayerAudio.currentTime = Math.min(bottomPlayerAudio.duration, Math.max(0, bottomPlayerAudio.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
  updateBottomPlayer();
});
window.addEventListener('keydown', (event) => {
  if (!bottomPlayerAudio.src || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select, button, a'))) return;
  if (target === bottomPlayerWaveform || target.matches('.sample-waveform')) return;
  if (event.code === 'Space') {
    event.preventDefault();
    if (bottomPlayerAudio.paused) bottomPlayerAudio.play().catch((error) => setDownloadStatus(error.message || 'N�o foi poss�vel reproduzir esta pr�via.'));
    else bottomPlayerAudio.pause();
  } else if (event.altKey && event.key === 'ArrowLeft' && findAdjacentPlayableSample(-1) >= 0) {
    event.preventDefault();
    playSample(findAdjacentPlayableSample(-1));
  } else if (event.altKey && event.key === 'ArrowRight' && findAdjacentPlayableSample(1) >= 0) {
    event.preventDefault();
    playSample(findAdjacentPlayableSample(1));
  } else if (!event.altKey && event.key === 'ArrowLeft' && Number.isFinite(bottomPlayerAudio.duration)) {
    event.preventDefault();
    bottomPlayerAudio.currentTime = Math.max(0, bottomPlayerAudio.currentTime - 5);
    updateBottomPlayer();
  } else if (!event.altKey && event.key === 'ArrowRight' && Number.isFinite(bottomPlayerAudio.duration)) {
    event.preventDefault();
    bottomPlayerAudio.currentTime = Math.min(bottomPlayerAudio.duration, bottomPlayerAudio.currentTime + 5);
    updateBottomPlayer();
  } else if (event.key.toLocaleLowerCase() === 'r') {
    bottomPlayerAudio.loop = !bottomPlayerAudio.loop;
    updateBottomPlayer();
  }
});
bottomPlayerDownload.addEventListener('click', () => downloadSample(bottomPlayerDownload));
dismissDownloadStatusButton.addEventListener('click', () => {
  clearTimeout(downloadStatusDismissTimer);
  dismissDownloadStatus();
});
cancelDownloadButton.addEventListener('click', async () => {
  if (activePackDownload) activePackDownload.cancelled = true;
  const downloadId = activePackDownload ? activePackDownload.currentDownloadId : activeDownloadId;
  if (!downloadId) return;
  if (cancellingDownloadIds.has(downloadId)) return;
  const presentation = downloadPresentations.get(downloadId);
  cancellingDownloadIds.add(downloadId);
  cancelDownloadButton.disabled = true;
  const job = activeDownloadJobs.get(downloadId);
  if (job) updateDownloadStatus(job);
  try {
    const result = await window.wavsResolver.cancelSamplePreviewDownload(downloadId);
    if (!result.ok) {
      if (activePackDownload) activePackDownload.cancelled = false;
      cancellingDownloadIds.delete(downloadId);
      setDownloadStatus(result.message || 'N�o foi poss�vel cancelar este download.', false, presentation);
      cancelDownloadButton.disabled = false;
    }
  } catch (error) {
    if (activePackDownload) activePackDownload.cancelled = false;
    cancellingDownloadIds.delete(downloadId);
    setDownloadStatus(error.message || 'N�o foi poss�vel cancelar este download.', false, presentation);
    cancelDownloadButton.disabled = false;
  }
});
window.wavsResolver.onDownloadProgress((data) => {
  updateDownloadStatus(data);
});
window.wavsResolver.onDownloadFinished((data) => {
  const isPackBatchItem = Boolean(activePackDownload?.currentSampleUrl === data.downloadId);
  if (isPackBatchItem && data.downloadId) {
    const waiter = packDownloadWaiters.get(data.downloadId);
    if (waiter) {
      packDownloadWaiters.delete(data.downloadId);
      waiter(data);
    } else completedPackDownloadEvents.set(data.downloadId, data);
  }
  const presentation = downloadPresentations.get(data.downloadId);
  const name = presentation?.title || String(data.filename || 'Download').replace(/\.mp3$/i, '');
  if (data.downloadId) {
    activeDownloadJobs.delete(data.downloadId);
    cancellingDownloadIds.delete(data.downloadId);
    downloadPresentations.delete(data.downloadId);
  }
  if (activeDownloadId === data.downloadId) activeDownloadId = [...activeDownloadJobs.keys()].pop() || '';
  if (isPackBatchItem) {
    cancelDownloadButton.classList.add('hidden');
    return;
  }
  if (activeDownloadJobs.size) {
    const latestJob = activeDownloadJobs.get(activeDownloadId);
    if (latestJob) {
      updateDownloadStatus(latestJob);
      return;
    }
  }
  downloadProgressBar.classList.add('hidden');
  cancelDownloadButton.classList.add('hidden');
  cancelDownloadButton.disabled = false;
  if (data.state === 'completed') playNotificationBubble();
  setDownloadStatus(name, data.state === 'completed', presentation);
});
window.wavsResolver.onAppUpdateStatus((data) => {
  if (data.state === 'available') {
    appUpdateCardMode = 'offer';
    appUpdateDownloadStarted = false;
    appUpdateCardDismissed = false;
    appUpdateTitle.textContent = 'Atualiza��o dispon�vel';
    appUpdateKicker.textContent = 'ATUALIZA��O';
    appUpdateVersion.textContent = 'Vers�o ' + formatDisplayVersion(data.version || 'nova');
    appUpdateNotesHeading.textContent = 'Novidades';
    appUpdateNotes.innerHTML = formatReleaseNotes(data.releaseNotes);
    appUpdateProgress.value = 0;
    appUpdateProgressWrap.classList.add('hidden');
    appUpdateMark.style.setProperty('--update-fill', '0%');
    appUpdateMessage.textContent = 'Escolha quando deseja atualizar.';
    appUpdateLaterButton.classList.remove('hidden');
    appUpdateLaterButton.disabled = false;
    appUpdateLaterButton.textContent = 'Mais tarde';
    appUpdateNowButton.disabled = false;
    appUpdateNowButton.textContent = 'Atualizar agora';
    appUpdateOverlay.classList.remove('hidden');
    appUpdateOverlay.setAttribute('aria-hidden', 'false');
    appUpdateLaterButton.focus();
  } else if (data.state === 'download-started') {
    appUpdateDownloadStarted = true;
    appUpdateProgressWrap.classList.remove('hidden');
    appUpdateMessage.textContent = 'Baixando a atualiza��o em segundo plano.';
    appUpdateLaterButton.textContent = 'Ocultar';
    appUpdateNowButton.disabled = true;
    appUpdateNowButton.textContent = 'Baixando.';
  } else if (data.state === 'progress') {
    const percent = Math.max(0, Math.min(100, Number(data.percent) || 0));
    appUpdateProgressWrap.classList.remove('hidden');
    appUpdateProgress.value = percent;
    appUpdateMark.style.setProperty('--update-fill', `${percent}%`);
    appUpdateMessage.textContent = 'Baixando a atualiza��o � ' + Math.round(percent) + '%';
    appUpdateLaterButton.textContent = 'Ocultar';
    appUpdateNowButton.disabled = true;
    appUpdateNowButton.textContent = 'Baixando.';
  } else if (data.state === 'downloaded') {
    appUpdateMark.style.setProperty('--update-fill', '100%');
    appUpdateProgress.value = 100;
    appUpdateMessage.textContent = 'Download conclu�do. Reiniciando para aplicar a atualiza��o.';
    appUpdateNowButton.disabled = true;
    appUpdateNowButton.textContent = 'Reiniciando.';
    appUpdateLaterButton.disabled = true;
    appUpdateLaterButton.classList.add('hidden');
  } else if (data.state === 'applied') {
    appUpdateCardMode = 'whats-new';
    appUpdateCardDismissed = false;
    appUpdateTitle.textContent = 'Atualiza��o conclu�da';
    appUpdateKicker.textContent = 'NOVIDADES';
    appUpdateVersion.textContent = 'Vers�o ' + formatDisplayVersion(data.version || 'atual');
    appUpdateNotesHeading.textContent = 'O que h� de novo';
    appUpdateNotes.innerHTML = formatReleaseNotes(data.releaseNotes);
    appUpdateProgressWrap.classList.add('hidden');
    appUpdateLaterButton.classList.add('hidden');
    appUpdateNowButton.disabled = false;
    appUpdateNowButton.textContent = 'Entendi';
    appUpdateOverlay.classList.remove('hidden');
    appUpdateOverlay.setAttribute('aria-hidden', 'false');
    appUpdateNowButton.focus();
  } else if (data.state === 'error') {
    if (!appUpdateOverlay.classList.contains('hidden') && !appUpdateCardDismissed) {
      appUpdateDownloadStarted = false;
      appUpdateMessage.textContent = 'N�o consegui baixar a atualiza��o. Voc� pode tentar novamente.';
      appUpdateLaterButton.disabled = false;
      appUpdateLaterButton.textContent = 'Mais tarde';
      appUpdateNowButton.disabled = false;
      appUpdateNowButton.textContent = 'Tentar novamente';
    } else {
      setDownloadStatus('N�o foi poss�vel verificar atualiza��es. Confira sua conex�o e tente novamente mais tarde.', false, { kind: 'update' });
    }
  } else if (data.state === 'manual') {
    setDownloadStatus('Esta vers�o port�til precisa ser atualizada manualmente.', false, { kind: 'update' });
  }
});

function dismissAppUpdateCard() {
  appUpdateCardDismissed = true;
  appUpdateOverlay.classList.add('hidden');
  appUpdateOverlay.setAttribute('aria-hidden', 'true');
  if (appUpdateCardMode === 'whats-new') window.wavsResolver.acknowledgeAppUpdate().catch(() => {});
}

appUpdateLaterButton.addEventListener('click', dismissAppUpdateCard);
appUpdateNowButton.addEventListener('click', async () => {
  if (appUpdateCardMode === 'whats-new') {
    dismissAppUpdateCard();
    return;
  }
  if (appUpdateNowButton.disabled || appUpdateDownloadStarted) return;
  appUpdateNowButton.disabled = true;
  appUpdateNowButton.textContent = 'Iniciando.';
  appUpdateProgressWrap.classList.remove('hidden');
  appUpdateMessage.textContent = 'Preparando o download da atualiza��o.';
  try {
    const result = await window.wavsResolver.downloadAppUpdate();
    if (!result?.ok) throw new Error(result?.message || 'N�o foi poss�vel iniciar o download.');
  } catch (error) {
    appUpdateDownloadStarted = false;
    appUpdateMessage.textContent = error.message || 'N�o foi poss�vel iniciar o download.';
    appUpdateNowButton.disabled = false;
    appUpdateNowButton.textContent = 'Tentar novamente';
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !appUpdateOverlay.classList.contains('hidden')) dismissAppUpdateCard();
});
window.wavsResolver.getAppVersion().then((version) => {
  appVersionLabel.textContent = `v${formatDisplayVersion(version)}`;
}).catch(() => {
  appVersionLabel.textContent = 'Vers�o indispon�vel';
});
updateSampleDownloadDirectory().catch((error) => {
  sampleDestinationPath.textContent = 'Pasta indispon�vel';
  sampleDestinationPath.setAttribute('aria-busy', 'false');
  setStatus(error.message || 'N�o foi poss�vel carregar a pasta das samples.');
});
window.wavsResolver.getFavoritePacks().then((packs) => {
  favoritePacks = Array.isArray(packs) ? packs.filter((pack) => pack && typeof pack.id === 'string' && pack.title) : [];
  favoritesCount.textContent = String(favoritePacks.length);
  updateCatalogNavigation();
  updateCatalogGenreOptions();
  renderCatalog();
}).catch((error) => setStatus(error.message || 'N�o foi poss�vel carregar os packs salvos.'));
loadNewPacks();
loadDiscoveryPacks('all', 'Todos os packs');





