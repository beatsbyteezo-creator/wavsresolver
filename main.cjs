const { app, BrowserWindow, Menu, dialog, session, shell, ipcMain, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

app.setName('WavsResolver');
const windowsAppUserModelId = 'com.nyoandwhite.wavsresolver';
if (process.platform === 'win32') app.setAppUserModelId(windowsAppUserModelId);

let downloadDirectory;
let sampleDownloadDirectory;
let settingsPath;
let appSettings = {};
let wavsSession;
const API_BASE = 'https://api.wavs.com';
// Public client identifier shipped in the WAVS web client.
const API_CLIENT_SESSION = '116c0a73f6cae0c07cf9c9f99fc8bdcfd316ed31859f95fc16bd3a9ffb24561b';
let mainWindow;
let appUpdateCheckTimer;
let lastAppUpdateErrorAt = 0;
let appUpdateAvailable = false;
let appUpdateDownloadStarted = false;
let appUpdateDownloaded = false;
let appUpdateReleaseInfo = null;
let appUpdateNoticePath;
let appUpdateNoticePending = false;
const reservedPaths = new Set();
const requestedDownloads = new Map();
const activeDownloads = new Map();

function getAppIconPath() {
  return path.join(app.isPackaged ? process.resourcesPath : __dirname, 'wavs.ico');
}

function getAppWindowIconPath() {
  return path.join(app.isPackaged ? process.resourcesPath : __dirname, 'wavs.png');
}

function getAppIcon() {
  const icon = nativeImage.createFromPath(getAppWindowIconPath());
  if (icon.isEmpty()) throw new Error(`Não foi possível carregar o ícone do app: ${getAppIconPath()}`);
  return icon;
}

function registerDownloadRequest(url, request) {
  if (requestedDownloads.has(url)) throw new Error('Este download já está sendo iniciado.');
  const record = { ...request };
  record.timeout = setTimeout(() => {
    if (requestedDownloads.get(url) !== record) return;
    requestedDownloads.delete(url);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-finished', {
        downloadId: url,
        filename: record.filename || 'prévia WAVS',
        state: 'não iniciado'
      });
    }
  }, 30_000);
  requestedDownloads.set(url, record);
  return record;
}

function clearDownloadRequest(url, request) {
  if (!request || requestedDownloads.get(url) !== request) return;
  clearTimeout(request.timeout);
  requestedDownloads.delete(url);
}

function persistAppSettings(updates) {
  const nextSettings = { ...appSettings, ...updates };
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(nextSettings, null, 2), 'utf8');
  } catch (error) {
    return { ok: false, message: `Não foi possível salvar suas preferências: ${error.message}` };
  }
  appSettings = nextSettings;
  return { ok: true };
}

function openExternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
    shell.openExternal(url.href).catch((error) => console.error('Não foi possível abrir o link externo:', error));
  } catch (error) {
    console.error('O app bloqueou um link externo inválido:', error);
  }
}

function isTemporaryPath(target) {
  const temporaryDirectory = path.resolve(app.getPath('temp'));
  const relativePath = path.relative(temporaryDirectory, path.resolve(target));
  return relativePath === '' || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath));
}

function registerWindowsNotificationShortcut() {
  if (process.platform !== 'win32') return;
  const portableExecutable = process.env.PORTABLE_EXECUTABLE_FILE;
  const developmentLaunch = !app.isPackaged && !portableExecutable;
  const target = portableExecutable || process.execPath;
  const iconDirectory = path.join(app.getPath('userData'), 'icons');
  const notificationIconPath = path.join(iconDirectory, 'wavs.png');
  const shortcutDirectory = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs');
  const shortcutPath = path.join(shortcutDirectory, 'WavsResolver.lnk');
  fs.mkdirSync(iconDirectory, { recursive: true });
  const notificationIcon = getAppIcon().resize({ width: 44, height: 44 });
  if (notificationIcon.isEmpty()) throw new Error('Não foi possível gerar o ícone das notificações do WavsResolver.');
  fs.writeFileSync(notificationIconPath, notificationIcon.toPNG());
  const appUserModelIdKey = `HKCU\\Software\\Classes\\AppUserModelId\\${windowsAppUserModelId}`;
  execFileSync('reg.exe', ['add', appUserModelIdKey, '/v', 'DisplayName', '/t', 'REG_SZ', '/d', 'WavsResolver', '/f'], { windowsHide: true, stdio: 'ignore' });
  execFileSync('reg.exe', ['add', appUserModelIdKey, '/v', 'IconUri', '/t', 'REG_SZ', '/d', notificationIconPath, '/f'], { windowsHide: true, stdio: 'ignore' });
  if (app.isPackaged && (!fs.existsSync(target) || isTemporaryPath(target))) {
    throw new Error('O app foi iniciado da pasta temporária; abra o executável portátil original para registrar um atalho permanente.');
  }
  fs.mkdirSync(shortcutDirectory, { recursive: true });
  const shortcutCreated = shell.writeShortcutLink(shortcutPath, 'create', {
    target,
    args: developmentLaunch ? app.getAppPath() : '',
    cwd: path.dirname(target),
    description: 'WavsResolver',
    icon: getAppIconPath(),
    iconIndex: 0,
    appUserModelId: windowsAppUserModelId
  });
  if (!shortcutCreated) throw new Error('O Windows não conseguiu registrar o atalho de notificações do WavsResolver.');
}

function getPackId(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !(url.hostname === 'wavs.com' || url.hostname.endsWith('.wavs.com'))) return null;
    const match = url.pathname.match(/^\/packs\/(\d+)(?:\/|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function apiRequest(pathname, { method = 'GET', token = null, body } = {}) {
  const headers = { Accept: 'application/json', 'X-Client-Session': API_CLIENT_SESSION };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const maxRetries = method === 'GET' ? 2 : 0;
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetch(`${API_BASE}${pathname}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000),
        cache: pathname.startsWith('/api/home/whats-new') ? 'no-store' : 'default'
      });
    } catch (error) {
      if (attempt < maxRetries && (error.name === 'TimeoutError' || error.name === 'TypeError')) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        continue;
      }
      throw error;
    }
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw || response.statusText }; }
    if (!response.ok) {
      const error = new Error(data.message || data.error || `WAVS respondeu ${response.status}.`);
      error.status = response.status;
      error.data = data;
      if (attempt < maxRetries && (response.status === 429 || response.status >= 500)) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? Math.min(retryAfter * 1000, 2000)
          : 300 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
    return data;
  }
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/\br\s*&\s*b\b/g, 'rnb')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchesSearchQuery(query, values) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;
  const normalizedText = values.map(normalizeSearchText).filter(Boolean).join(' ');
  if (!normalizedText) return false;
  const queryTokens = normalizedQuery.split(/\s+/);
  const textTokens = new Set(normalizedText.split(/\s+/));
  return normalizedText.includes(normalizedQuery)
    || queryTokens.every((token) => textTokens.has(token));
}

function uniqueDownloadPath(filename, directory = downloadDirectory) {
  const originalName = path.basename(filename || 'wavs-pack.zip');
  const ext = path.extname(originalName);
  const stem = path.basename(originalName, ext);
  let destination = path.join(directory, originalName);
  let suffix = 2;
  while (fs.existsSync(destination) || reservedPaths.has(pathReservationKey(destination))) {
    destination = path.join(directory, `${stem} (${suffix++})${ext}`);
  }
  reservedPaths.add(pathReservationKey(destination));
  return destination;
}

function pathReservationKey(filePath) {
  const normalizedPath = path.resolve(filePath);
  return process.platform === 'win32' ? normalizedPath.toLowerCase() : normalizedPath;
}

function startSamplePreviewDownload(rawUrl, rawTitle, rawTempo, rawAuthor, rawFolderName = '') {
  let url;
  try { url = new URL(rawUrl); } catch { throw new Error('O link da prévia MP3 é inválido.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.wavs.com' || !url.pathname.toLowerCase().endsWith('.mp3')) {
    throw new Error('A prévia não é um arquivo MP3 válido do WAVS.');
  }
  if (!mainWindow || mainWindow.isDestroyed()) throw new Error('A janela do app não está aberta.');
  url.hash = '';
  let targetDirectory = sampleDownloadDirectory;
  if (rawFolderName) {
    let folderName = String(rawFolderName)
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/[. ]+$/g, '')
      .slice(0, 100);
    if (!folderName) folderName = 'WAVS Pack';
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(folderName)) folderName = `_${folderName}`;
    const baseDirectory = path.resolve(sampleDownloadDirectory);
    targetDirectory = path.resolve(baseDirectory, folderName);
    if (path.dirname(targetDirectory) !== baseDirectory) throw new Error('Nome inv\u00e1lido para a pasta do pack.');
    fs.mkdirSync(targetDirectory, { recursive: true });
  }
  try {
    fs.accessSync(targetDirectory, fs.constants.W_OK);
  } catch {
    throw new Error('A pasta escolhida não está acessível para gravação. Escolha outra pasta para as samples.');
  }
  const filename = [rawTitle || 'wavs-sample', rawTempo ? `${rawTempo} BPM` : '', rawAuthor || 'autor desconhecido']
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(' - ')
    .replace(/\.wav(?= - |$)/i, '')
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, '_')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 120) || 'wavs-sample';
  const downloadFilename = `${filename}.mp3`;
  const expectedPath = path.join(targetDirectory, downloadFilename);
  const alreadyExists = fs.existsSync(expectedPath);
  const alreadyInProgress = reservedPaths.has(pathReservationKey(expectedPath)) || [...requestedDownloads.values()].some((request) =>
    request.directory === targetDirectory && request.filename === downloadFilename
  );
  if (alreadyExists || alreadyInProgress) {
    return { status: 'already-exists', filename: downloadFilename, path: targetDirectory, alreadyInProgress };
  }
  const request = registerDownloadRequest(url.href, { filename: `${filename}.mp3`, directory: targetDirectory });
  try {
    mainWindow.webContents.downloadURL(url.href);
  } catch (error) {
    clearDownloadRequest(url.href, request);
    throw error;
  }
  return { filename: `${filename}.mp3`, downloadId: url.href };
}

function normalizeFavoritePack(pack) {
  if (!pack || typeof pack !== 'object' || !/^\d+$/.test(String(pack.id ?? '')) || !String(pack.title ?? '').trim()) return null;
  const genres = Array.isArray(pack.genres)
    ? pack.genres.map((genre) => typeof genre === 'string' ? genre : genre?.title).filter((genre) => typeof genre === 'string').slice(0, 12)
    : [];
  const user = pack.user && typeof pack.user === 'object' ? {
    id: String(pack.user.id ?? '').slice(0, 80),
    username: String(pack.user.username ?? '').slice(0, 100),
    display: String(pack.user.display ?? '').slice(0, 150),
    thumb: typeof pack.user.thumb === 'string' && pack.user.thumb.startsWith('https://') ? pack.user.thumb.slice(0, 1000) : ''
  } : {};
  return {
    id: String(pack.id),
    title: String(pack.title).trim().slice(0, 300),
    thumb: typeof pack.thumb === 'string' && pack.thumb.startsWith('https://') ? pack.thumb.slice(0, 1000) : '',
    released_at: typeof pack.released_at === 'string' ? pack.released_at.slice(0, 50) : '',
    uploaded_at: typeof pack.uploaded_at === 'string' ? pack.uploaded_at.slice(0, 50) : '',
    is_free: Boolean(pack.is_free),
    audio_count: Math.max(0, Number(pack.audio_count) || 0),
    genres,
    user
  };
}

function createWindow() {
  const appIcon = getAppIcon();
  mainWindow = new BrowserWindow({
    width: 1600, height: 1000, minWidth: 640, minHeight: 560, backgroundColor: '#000000', title: 'WavsResolver', autoHideMenuBar: true,
    icon: getAppWindowIconPath(),
    webPreferences: { partition: 'persist:wavs-personal', preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  mainWindow.setIcon(appIcon);
  mainWindow.maximize();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.once('did-finish-load', startAppUpdater);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: 'deny' };
  });
  const appPageUrl = pathToFileURL(path.join(__dirname, 'index.html')).href;
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(appPageUrl)) return;
    event.preventDefault();
    openExternalUrl(url);
  });
  return mainWindow;
}

function sendAppUpdateStatus(data) {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('app-update-status', data);
  }
}

function reportAppUpdateError(error) {
  const now = Date.now();
  if (now - lastAppUpdateErrorAt < 15_000) return;
  lastAppUpdateErrorAt = now;
  if (!appUpdateDownloadStarted) appUpdateAvailable = false;
  appUpdateDownloadStarted = false;
  appUpdateDownloaded = false;
  console.warn('Falha ao buscar ou baixar uma atualização:', error.message || error);
  sendAppUpdateStatus({ state: 'error' });
}

function startAppUpdater() {
  if (!app.isPackaged || process.platform !== 'win32' || appUpdateCheckTimer) return;
  if (process.env.PORTABLE_EXECUTABLE_FILE) {
    sendAppUpdateStatus({ state: 'manual' });
    return;
  }
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoRunAppAfterInstall = true;
  let initialCheckReported = false;
  let checkInFlight = false;
  autoUpdater.on('update-available', (info) => {
    appUpdateAvailable = true;
    appUpdateDownloadStarted = false;
    appUpdateDownloaded = false;
    let releaseNotes = Array.isArray(info.releaseNotes)
      ? info.releaseNotes.map((item) => item?.note).filter(Boolean).join('\n\n')
      : typeof info.releaseNotes === 'string' ? info.releaseNotes : '';
    const notesContainEncodingErrors = releaseNotes.includes('\uFFFD');
    releaseNotes = releaseNotes
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<li\b[^>]*>/gi, '\n- ')
      .replace(/<h[1-6]\b[^>]*>/gi, '\n## ')
      .replace(/<\/(?:li|p|h[1-6]|div|section)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, ' ')
      .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (notesContainEncodingErrors || !releaseNotes) {
      releaseNotes = '## Novidades\n- Correção de bugs visuais e de navegação.\n- Upgrade no visual e na fluidez do app.';
    }
    appUpdateReleaseInfo = { version: info.version, releaseNotes: releaseNotes.slice(0, 12000) };
    sendAppUpdateStatus({ state: 'available', ...appUpdateReleaseInfo });
  });
  autoUpdater.on('update-not-available', (info) => {
    if (initialCheckReported) return;
    initialCheckReported = true;
    sendAppUpdateStatus({ state: 'current', version: info.version || app.getVersion() });
  });
  autoUpdater.on('download-progress', (progress) => sendAppUpdateStatus({ state: 'progress', percent: progress.percent }));
  autoUpdater.on('update-downloaded', (info) => {
    appUpdateDownloaded = true;
    const notice = {
      version: info.version || appUpdateReleaseInfo?.version || '',
      releaseNotes: appUpdateReleaseInfo?.releaseNotes || '',
      downloadedAt: Date.now()
    };
    try {
      fs.writeFileSync(appUpdateNoticePath, JSON.stringify(notice), 'utf8');
    } catch (error) {
      console.error('Não foi possível salvar as novidades da atualização:', error);
    }
    sendAppUpdateStatus({ state: 'downloaded', version: notice.version });
    // Apply the NSIS update silently, then relaunch WavsResolver.
    const installTimer = setTimeout(() => autoUpdater.quitAndInstall(true, true), 1100);
    installTimer.unref?.();
  });
  autoUpdater.on('error', reportAppUpdateError);

  const checkForUpdates = () => {
    if (checkInFlight || appUpdateAvailable || appUpdateDownloaded || appUpdateNoticePending) return;
    checkInFlight = true;
    autoUpdater.checkForUpdates()
      .catch(reportAppUpdateError)
      .finally(() => { checkInFlight = false; });
  };
  const initialCheck = setTimeout(checkForUpdates, 1000);
  initialCheck.unref?.();
  appUpdateCheckTimer = setInterval(checkForUpdates, 60 * 1000);
  appUpdateCheckTimer.unref?.();

  try {
    const notice = JSON.parse(fs.readFileSync(appUpdateNoticePath, 'utf8'));
    if (notice?.version && notice.version === app.getVersion()) {
      appUpdateNoticePending = true;
      sendAppUpdateStatus({ state: 'applied', version: notice.version, releaseNotes: String(notice.releaseNotes || '').slice(0, 12000) });
    } else {
      fs.unlinkSync(appUpdateNoticePath);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Não foi possível carregar as novidades da atualização:', error);
  }
}

ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('download-app-update', async () => {
  if (!appUpdateAvailable) return { ok: false, message: 'Não há uma atualização disponível agora.' };
  if (appUpdateDownloaded) return { ok: true, ready: true };
  if (appUpdateDownloadStarted) return { ok: true, downloading: true };
  appUpdateDownloadStarted = true;
  sendAppUpdateStatus({ state: 'download-started', version: appUpdateReleaseInfo?.version || '' });
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true, downloading: true };
  } catch (error) {
    appUpdateDownloadStarted = false;
    console.warn('Não foi possível iniciar o download da atualização:', error.message || error);
    sendAppUpdateStatus({ state: 'error' });
    return { ok: false, message: error.message || 'Não foi possível iniciar o download.' };
  }
});
ipcMain.handle('acknowledge-app-update', () => {
  try {
    if (appUpdateNoticePath && fs.existsSync(appUpdateNoticePath)) fs.unlinkSync(appUpdateNoticePath);
    appUpdateNoticePending = false;
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
});
ipcMain.handle('load-pack', async (_event, link) => {
  const packId = getPackId(link);
  if (!packId) return { ok: false, message: 'Cole um link WAVS no formato https://wavs.com/packs/ID.' };
  try {
    const [packResponse, audioResponse] = await Promise.all([
      apiRequest(`/api/pack/${packId}`), apiRequest(`/api/pack/${packId}/audio?perpage=all`)
    ]);
    const pack = packResponse.pack;
    const samples = audioResponse.samples?.data;
    if (!pack || !Array.isArray(samples)) return { ok: false, message: 'Não encontrei esse pack no catálogo do WAVS.' };
    return { ok: true, packId, pack, samples, sampleCount: audioResponse.samples.total ?? samples.length, sampleTypes: audioResponse.sample_type_counts ?? {} };
  } catch (error) {
    return { ok: false, message: error.message || 'Não consegui carregar este pack agora.' };
  }
});

ipcMain.handle('load-new-packs', async () => {
  try {
    const response = await apiRequest('/api/home/whats-new?genre_id=');
    const pageData = response.packs ?? {};
    const packs = pageData.data;
    if (!Array.isArray(packs)) return { ok: false, message: 'O WAVS não retornou uma lista de packs.' };
    const currentPage = Number(pageData.current_page ?? pageData.currentPage) || 1;
    const total = Number(pageData.total) || packs.length;
    const perPage = Number(pageData.per_page ?? pageData.perPage) || 0;
    const reportedLastPage = Number(pageData.last_page ?? pageData.lastPage);
    const lastPage = reportedLastPage > 0 ? reportedLastPage : perPage > 0 ? Math.ceil(total / perPage) : packs.length ? currentPage + 1 : currentPage;
    return { ok: true, packs, page: currentPage, lastPage, total };
  } catch (error) {
    return { ok: false, message: error.message || 'Não consegui carregar os packs novos do WAVS.' };
  }
});

ipcMain.handle('load-pack-preview', async (_event, rawPackId) => {
  const packId = String(rawPackId ?? '').trim();
  if (!/^\d+$/.test(packId)) return { ok: false, message: 'O pack selecionado não tem um identificador válido.' };
  try {
    const response = await apiRequest(`/api/pack/${packId}/audio?perpage=all`);
    const samples = response.samples?.data;
    if (!Array.isArray(samples)) return { ok: false, message: 'O WAVS não retornou prévias válidas para este pack.' };
    const preview = samples.find((sample) => {
      if (typeof sample?.mp3 !== 'string') return false;
      try {
        const url = new URL(sample.mp3);
        return url.protocol === 'https:' && url.hostname === 'cdn.wavs.com' && url.pathname.toLowerCase().endsWith('.mp3');
      } catch {
        return false;
      }
    });
    if (!preview) return { ok: false, message: 'Este pack não tem uma prévia MP3 disponível.' };
    return { ok: true, url: preview.mp3 };
  } catch (error) {
    return { ok: false, message: error.message || 'Não consegui carregar a prévia deste pack.' };
  }
});

ipcMain.handle('load-genre-packs', async (_event, rawGenreId, rawPage) => {
  const genreId = String(rawGenreId ?? '').trim();
  const page = Number(rawPage);
  if (genreId !== 'all' && !/^\d+$/.test(genreId)) return { ok: false, message: 'O gênero selecionado não tem um identificador válido.' };
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) return { ok: false, message: 'Página de gênero inválida.' };
  try {
    const response = genreId === 'all'
      ? await apiRequest(`/api/packs/search-by-title?${new URLSearchParams({ page: String(page), search_title: '' })}`)
      : await apiRequest(`/api/home/whats-new?${new URLSearchParams({ genre_id: genreId, page: String(page) })}`);
    const pageData = genreId === 'all' ? response : response.packs ?? response.data ?? response;
    const pagination = pageData.meta ?? pageData.pagination ?? response.meta ?? response.pagination ?? {};
    const packs = Array.isArray(pageData.data) ? pageData.data : Array.isArray(pageData) ? pageData : null;
    if (!Array.isArray(packs)) return { ok: false, message: genreId === 'all'
      ? 'O WAVS não retornou uma lista válida do catálogo completo.'
      : 'O WAVS não retornou uma lista válida para este gênero.' };
    const currentPage = Number(pageData.current_page ?? pageData.currentPage ?? pagination.current_page ?? pagination.currentPage ?? response.current_page) || page;
    const total = Number(pageData.total ?? pagination.total ?? response.total) || 0;
    const perPage = Number(pageData.per_page ?? pageData.perPage ?? pagination.per_page ?? pagination.perPage ?? response.per_page ?? response.perPage) || 0;
    const reportedLastPage = Number(pageData.last_page ?? pageData.lastPage ?? pagination.last_page ?? pagination.lastPage ?? response.last_page ?? response.lastPage);
    const lastPage = reportedLastPage > 0 ? reportedLastPage : total > 0 && perPage > 0 ? Math.ceil(total / perPage) : packs.length > 0 ? currentPage + 1 : currentPage;
    return {
      ok: true,
      packs,
      page: currentPage,
      lastPage,
      total: total || packs.length
    };
  } catch (error) {
    return { ok: false, message: error.message || (genreId === 'all'
      ? 'Não consegui carregar o catálogo completo do WAVS.'
      : 'Não consegui carregar os packs deste gênero no WAVS.') };
  }
});

ipcMain.handle('load-creator-profile', async (_event, rawId, rawUsername, rawDisplay, rawPage) => {
  const id = String(rawId ?? '').trim();
  const username = String(rawUsername ?? '').trim();
  const display = String(rawDisplay ?? '').trim();
  const page = Number(rawPage ?? 1);
  if ((id && !/^\d+$/.test(id)) || (username && !/^[\p{L}\p{N}._-]+$/u.test(username))
    || (!username && display.length < 2) || !Number.isSafeInteger(page) || page < 1 || page > 1000) {
    return { ok: false, message: 'O criador selecionado não tem um identificador válido.' };
  }
  try {
    let profileUsername = username;
    if (!profileUsername) {
      const query = display || id;
      const params = new URLSearchParams({ search: query, page: '1', perpage: '30', order: 'relevancy' });
      const searchResponse = await apiRequest(`/api/producers?${params}`);
      const sellers = searchResponse.sellers?.data;
      if (!Array.isArray(sellers)) return { ok: false, message: 'O WAVS não retornou resultados de criador válidos.' };
      const normalizedQuery = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      const match = sellers.find((seller) => (id && String(seller.id) === id) || [
        seller.display,
        seller.username
      ].some((name) => String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase() === normalizedQuery));
      if (!match?.username) return { ok: false, message: 'Não encontrei esse criador no WAVS.' };
      if (id && String(match.id) !== id) return { ok: false, message: 'O perfil deste criador não está disponível no WAVS.' };
      profileUsername = match.username;
    }
    const profileResponse = await apiRequest(`/api/producer/${encodeURIComponent(profileUsername)}?redirect=true`);
    const creator = profileResponse.seller;
    if (!creator || (id && String(creator.id) !== id)) {
      return { ok: false, message: 'O perfil deste criador não está disponível no WAVS.' };
    }
    if (!/^\d+$/.test(String(creator.id ?? ''))) {
      return { ok: false, message: 'O perfil deste criador não tem um identificador válido para carregar os packs.' };
    }
    const params = new URLSearchParams({ page: String(page), perpage: '30' });
    const packsResponse = await apiRequest(`/api/producer/${encodeURIComponent(creator.id)}/packs?${params}`);
    if (!Array.isArray(packsResponse.data)) {
      return { ok: false, message: 'O perfil foi carregado, mas o WAVS não retornou os packs deste criador.' };
    }
    const creatorSummary = {
      id: creator.id,
      display: creator.display || creator.username,
      username: creator.username,
      thumb: creator.thumb
    };
    const packs = packsResponse.data.map((pack) => ({ ...pack, user: pack.user || creatorSummary }));
    return {
      ok: true,
      creator,
      packs,
      totalPacks: Number(packsResponse.total) || packs.length,
      page: Number(packsResponse.current_page) || page,
      lastPage: Number(packsResponse.last_page || packsResponse.lastPage) || Math.max(1, Math.ceil((Number(packsResponse.total) || packs.length) / 30))
    };
  } catch (error) {
    return { ok: false, message: error.message || 'Não consegui carregar o perfil deste criador.' };
  }
});

ipcMain.handle('get-favorite-packs', () => appSettings.favoritePacks || []);
ipcMain.handle('get-app-preferences', () => ({
  theme: appSettings.theme === 'light' ? 'light' : 'dark',
  playerVolume: Number.isFinite(appSettings.playerVolume) && appSettings.playerVolume >= 0 && appSettings.playerVolume <= 1
    ? appSettings.playerVolume
    : null
}));
ipcMain.handle('save-app-preference', (_event, rawKey, rawValue) => {
  const key = String(rawKey ?? '');
  if (key === 'theme') {
    if (rawValue !== 'dark' && rawValue !== 'light') return { ok: false, message: 'O tema selecionado é inválido.' };
    return persistAppSettings({ theme: rawValue });
  }
  if (key === 'playerVolume') {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0 || value > 1) return { ok: false, message: 'O volume precisa estar entre 0 e 1.' };
    return persistAppSettings({ playerVolume: value });
  }
  return { ok: false, message: 'Esta preferência não pode ser alterada.' };
});
ipcMain.handle('toggle-favorite-pack', (_event, rawPack) => {
  const pack = normalizeFavoritePack(rawPack);
  if (!pack) return { ok: false, message: 'Não foi possível salvar este pack: os dados recebidos são inválidos.' };
  const favorites = appSettings.favoritePacks || [];
  const alreadySaved = favorites.some((favorite) => favorite.id === pack.id);
  const nextFavorites = alreadySaved
    ? favorites.filter((favorite) => favorite.id !== pack.id)
    : [pack, ...favorites];
  const result = persistAppSettings({ favoritePacks: nextFavorites });
  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, favoritePacks: nextFavorites, saved: !alreadySaved };
});

ipcMain.handle('search-packs', async (_event, rawQuery, rawPage, rawCreator) => {
  const query = String(rawQuery ?? '').trim();
  const page = Number(rawPage);
  const creatorId = String(rawCreator?.id ?? '').trim();
  if (query.length < 2) return { ok: false, message: 'Digite pelo menos 2 caracteres para buscar packs.' };
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) return { ok: false, message: 'Página de busca inválida.' };
  if (creatorId && !/^\d+$/.test(creatorId)) return { ok: false, message: 'Criador de busca inválido.' };
  try {
    const loadCreatorPacks = async (creator, requestedPage) => {
      const params = new URLSearchParams({ page: String(requestedPage), perpage: '30' });
      const creatorResponse = await apiRequest(`/api/producer/${encodeURIComponent(creator.id)}/packs?${params}`);
      if (!Array.isArray(creatorResponse.data)) return { ok: false, message: `O WAVS encontrou o criador ${creator.display}, mas não retornou a lista de packs.` };
      const total = Number(creatorResponse.total) || creatorResponse.data.length;
      const lastPage = Number(creatorResponse.last_page || creatorResponse.lastPage) || Math.max(1, Math.ceil(total / 30));
      return {
        ok: true,
        kind: 'creator',
        creator,
        packs: creatorResponse.data.map((pack) => ({ ...pack, user: { ...creator, ...(pack.user || {}) } })),
        page: Number(creatorResponse.current_page) || requestedPage,
        lastPage,
        total
      };
    };

    const loadGenrePacks = async (requestedPage) => {
      const genreResponse = await apiRequest('/api/genres');
      if (!Array.isArray(genreResponse.data)) throw new Error('O WAVS não retornou uma lista válida de gêneros.');
      const genres = genreResponse.data
        .filter((genre) => matchesSearchQuery(query, [genre.title]))
        .slice(0, 3);
      if (!genres.length) return { packs: [], lastPage: requestedPage, total: 0 };
      const genreResults = await Promise.all(genres.map(async (genre) => {
        const params = new URLSearchParams({ genre_id: String(genre.id), page: String(requestedPage) });
        const response = await apiRequest(`/api/home/whats-new?${params}`);
        const pageData = response.packs;
        if (!Array.isArray(pageData?.data)) throw new Error(`O WAVS não retornou packs de ${genre.title}.`);
        return {
          packs: pageData.data,
          lastPage: Number(pageData.last_page) || requestedPage,
          total: Number(pageData.total) || pageData.data.length
        };
      }));
      return {
        packs: genreResults.flatMap((result) => result.packs),
        lastPage: Math.max(...genreResults.map((result) => result.lastPage)),
        total: genreResults.reduce((sum, result) => sum + result.total, 0)
      };
    };

    const loadSearchSamples = async (requestedPage) => {
      const params = new URLSearchParams({
        search: query,
        order: 'relevancy',
        page: String(requestedPage),
        perpage: '50'
      });
      const response = await apiRequest(`/api/sounds?${params}`);
      const pageData = response.samples;
      if (!Array.isArray(pageData?.data)) throw new Error('O WAVS não retornou samples válidas para esta busca.');
      const samples = pageData.data.flatMap((sample) => {
        let mp3 = typeof sample.mp3 === 'string' ? sample.mp3 : '';
        try {
          const url = new URL(mp3);
          if (url.protocol !== 'https:' || url.hostname !== 'cdn.wavs.com' || !url.pathname.toLowerCase().endsWith('.mp3')) mp3 = '';
        } catch {
          mp3 = '';
        }
        const pack = sample.pack || {};
        const packId = String(sample.pack_id || pack.id || '');
        if (!mp3 || !/^\d+$/.test(packId)) return [];
        const genres = Array.isArray(sample.genres)
          ? sample.genres.map((item) => item?.genre?.title || item?.title).filter(Boolean)
          : [];
        const user = pack.user || {
          id: sample.user_id || '',
          display: sample.user_display || '',
          username: sample.user_username || '',
          thumb: sample.user_thumb || ''
        };
        return [{
          ...sample,
          mp3,
          pack_id: packId,
          pack_title: sample.pack_title || pack.title || '',
          pack_thumb: sample.pack_thumb || pack.thumb || '',
          user_display: sample.user_display || user.display || '',
          user_username: sample.user_username || user.username || '',
          pack: {
            ...pack,
            id: packId,
            title: sample.pack_title || pack.title || '',
            thumb: sample.pack_thumb || pack.thumb || '',
            genres: Array.isArray(pack.genres) && pack.genres.length ? pack.genres : genres,
            audio_count: pack.audio_count ?? sample.pack_audio_count ?? null,
            user
          }
        }];
      });
      return {
        samples,
        packs: samples.map((sample) => sample.pack),
        page: Number(pageData.current_page) || requestedPage,
        lastPage: samples.length
          ? Number(pageData.last_page) || requestedPage
          : requestedPage,
        total: Number(pageData.total) || samples.length
      };
    };

    const warnings = [];
    let creators = [];
    let creator = creatorId ? {
      id: creatorId,
      display: String(rawCreator.display ?? '').trim().slice(0, 100) || 'Criador WAVS',
      username: String(rawCreator.username ?? '').trim().slice(0, 100)
    } : null;
    if (!creator && page === 1) {
      let producerResponse;
      const producerQuery = query.replace(/^@/, '').trim();
      try {
        const producerParams = new URLSearchParams({ search: producerQuery, page: '1', perpage: '10', order: 'relevancy' });
        producerResponse = await apiRequest(`/api/producers?${producerParams}`);
      } catch (error) {
        warnings.push(`A busca de criadores falhou: ${error.message || 'erro desconhecido'}.`);
      }
      const producers = producerResponse?.sellers?.data;
      if (producerResponse && !Array.isArray(producers)) {
        warnings.push('O WAVS não retornou resultados de criadores válidos.');
      }
      const normalizedQuery = normalizeSearchText(producerQuery);
      creators = (producers || [])
        .filter((producer) => /^\d+$/.test(String(producer?.id ?? '')) && typeof producer?.username === 'string' && /^[\p{L}\p{N}._-]+$/u.test(producer.username))
        .map((producer) => ({
          id: String(producer.id),
          display: String(producer.display || producer.username).slice(0, 100),
          username: producer.username.slice(0, 100),
          thumb: typeof producer.thumb === 'string' ? producer.thumb : ''
        }))
        .sort((left, right) => {
          const leftNames = [left.display, left.username].map(normalizeSearchText);
          const rightNames = [right.display, right.username].map(normalizeSearchText);
          const leftExact = leftNames.includes(normalizedQuery);
          const rightExact = rightNames.includes(normalizedQuery);
          return Number(rightExact) - Number(leftExact);
        });
      const exactProducer = creators.find((producer) => [
        producer.display,
        producer.username
      ].some((name) => normalizeSearchText(name) === normalizedQuery));
      const matchedProducer = exactProducer || (producers || []).find((producer) =>
        matchesSearchQuery(producerQuery, [producer.display, producer.username]));
      if (matchedProducer?.id) {
        creator = {
          id: String(matchedProducer.id),
          display: matchedProducer.display || matchedProducer.username,
          username: matchedProducer.username,
          thumb: matchedProducer.thumb
        };
      }
    }

    const [titleResult, genreResult, creatorResult, sampleSearchResult] = await Promise.allSettled([
      apiRequest(`/api/packs/search-by-title?${new URLSearchParams({ page: String(page), search_title: query })}`),
      loadGenrePacks(page),
      creator ? loadCreatorPacks(creator, page) : Promise.resolve(null),
      loadSearchSamples(page)
    ]);
    const titleResponse = titleResult.status === 'fulfilled' ? titleResult.value : null;
    if (titleResponse && !Array.isArray(titleResponse.data)) {
      warnings.push('O WAVS não retornou resultados de packs válidos.');
    } else if (titleResult.status === 'rejected') {
      warnings.push(`A busca por nome de pack falhou: ${titleResult.reason.message || 'erro desconhecido'}.`);
    }
    const genreData = genreResult.status === 'fulfilled' ? genreResult.value : { packs: [], lastPage: page, total: 0 };
    if (genreResult.status === 'rejected') {
      warnings.push(`A busca por gênero falhou: ${genreResult.reason.message || 'erro desconhecido'}.`);
    }
    const creatorData = creatorResult.status === 'fulfilled' ? creatorResult.value : null;
    if (creatorResult.status === 'rejected') {
      warnings.push(`A busca pelos packs do criador falhou: ${creatorResult.reason.message || 'erro desconhecido'}.`);
    }
    const sampleSearchData = sampleSearchResult.status === 'fulfilled' ? sampleSearchResult.value : null;
    if (sampleSearchResult.status === 'rejected') {
      warnings.push(`A busca de samples falhou: ${sampleSearchResult.reason.message || 'erro desconhecido'}.`);
    }
    const titlePacks = titleResponse?.data || [];
    const packsById = new Map();
    for (const pack of [...(sampleSearchData?.packs || []), ...titlePacks, ...(creatorData?.packs || []), ...genreData.packs]) {
      if (pack?.id === undefined || pack?.id === null) continue;
      const id = String(pack.id);
      const previous = packsById.get(id) || {};
      const genres = Array.isArray(pack.genres) && pack.genres.length
        ? pack.genres
        : Array.isArray(previous.genres) ? previous.genres : [];
      packsById.set(id, {
        ...previous,
        ...pack,
        title: pack.title || previous.title,
        thumb: pack.thumb || previous.thumb,
        genres,
        user: { ...(previous.user || {}), ...(pack.user || {}) }
      });
    }
    const packs = [...packsById.values()];
    if (!titleResponse && !genreData.packs.length && !creatorData?.packs.length && !sampleSearchData) {
      return { ok: false, message: warnings.join(' ') || 'Não consegui pesquisar no WAVS.' };
    }
    const samplesById = new Map();
    for (const sample of sampleSearchData?.samples || []) {
      samplesById.set(String(sample.id || sample.mp3), sample);
    }
    const samples = [...samplesById.values()];
    const lastPage = Math.max(
      titlePacks.length ? Number(titleResponse?.last_page) || page : page,
      genreData.packs.length ? genreData.lastPage : page,
      creatorData?.packs.length ? Number(creatorData.lastPage) || page : page,
      samples.length ? Number(sampleSearchData?.lastPage) || page : page
    );
    return {
      ok: true,
      kind: 'mixed',
      packs,
      samples,
      creator,
      creators,
      page,
      lastPage,
      total: packs.length,
      warning: warnings.join(' ')
    };
  } catch (error) {
    return { ok: false, message: error.message || 'Não consegui pesquisar os packs no WAVS.' };
  }
});

ipcMain.handle('download-sample-preview', async (_event, url, title, tempo, author, folderName) => {
  try {
    const download = startSamplePreviewDownload(url, title, tempo, author, folderName);
    return { status: 'started', ...download };
  } catch (error) {
    return { status: 'error', message: error.message || 'Não consegui iniciar o download da prévia.' };
  }
});
ipcMain.handle('cancel-sample-preview-download', (_event, rawDownloadId) => {
  let url;
  try { url = new URL(rawDownloadId); } catch { return { ok: false, message: 'O identificador do download é inválido.' }; }
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.wavs.com' || !url.pathname.toLowerCase().endsWith('.mp3')) {
    return { ok: false, message: 'O download solicitado não é uma prévia MP3 válida do WAVS.' };
  }
  const request = requestedDownloads.get(url.href);
  const item = activeDownloads.get(url.href);
  if (!request && !item) return { ok: false, message: 'Este download não está mais ativo.' };
  if (request) request.cancelled = true;
  if (item) item.cancel();
  return { ok: true };
});

ipcMain.handle('get-sample-download-directory', () => sampleDownloadDirectory);
ipcMain.handle('choose-sample-download-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Escolher pasta para as samples',
    defaultPath: sampleDownloadDirectory,
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled || !result.filePaths[0]) return { cancelled: true, path: sampleDownloadDirectory };
  const selectedDirectory = result.filePaths[0];
  const settingsResult = persistAppSettings({ sampleDownloadDirectory: selectedDirectory });
  if (!settingsResult.ok) return { cancelled: false, error: settingsResult.message };
  sampleDownloadDirectory = selectedDirectory;
  return { cancelled: false, path: sampleDownloadDirectory };
});

app.whenReady().then(() => {
  try {
    registerWindowsNotificationShortcut();
  } catch (error) {
    console.error('Não foi possível registrar a identidade das notificações do WavsResolver:', error);
  }
  wavsSession = session.fromPartition('persist:wavs-personal');
  downloadDirectory = app.getPath('downloads');
  sampleDownloadDirectory = downloadDirectory;
  settingsPath = path.join(app.getPath('userData'), 'settings.json');
  appUpdateNoticePath = path.join(app.getPath('userData'), 'pending-update-notice.json');
  try {
    const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    appSettings = savedSettings && typeof savedSettings === 'object' && !Array.isArray(savedSettings) ? savedSettings : {};
    appSettings.favoritePacks = Array.isArray(appSettings.favoritePacks)
      ? appSettings.favoritePacks.map(normalizeFavoritePack).filter(Boolean)
      : [];
    const savedDirectory = appSettings.sampleDownloadDirectory;
    if (typeof savedDirectory === 'string' && path.isAbsolute(savedDirectory) && fs.existsSync(savedDirectory) && fs.statSync(savedDirectory).isDirectory()) {
      sampleDownloadDirectory = savedDirectory;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Não foi possível carregar a pasta de samples salva:', error);
  }
  fs.mkdirSync(downloadDirectory, { recursive: true });
  wavsSession.on('will-download', (_event, item) => {
    const itemUrl = item.getURL();
    const request = requestedDownloads.get(itemUrl);
    if (request) clearTimeout(request.timeout);
    activeDownloads.set(itemUrl, item);
    const targetDirectory = request?.directory || downloadDirectory;
    const destination = uniqueDownloadPath(request?.filename || item.getFilename(), targetDirectory);
    item.setSavePath(destination);
    item.on('updated', (_event, state) => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('download-progress', { downloadId: itemUrl, filename: path.basename(destination), received: item.getReceivedBytes(), total: item.getTotalBytes(), state });
    });
    item.once('done', (_event, state) => {
      reservedPaths.delete(pathReservationKey(destination));
      activeDownloads.delete(itemUrl);
      clearDownloadRequest(itemUrl, request);
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('download-finished', { downloadId: itemUrl, filename: path.basename(destination), state, path: destination });
    });
    if (request?.cancelled) item.cancel();
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'WavsResolver', submenu: [
      { label: 'Início', click: () => mainWindow?.loadFile(path.join(__dirname, 'index.html')) },
      { label: 'Explorar packs novos', click: () => shell.openExternal('https://wavs.com/explore') },
      { label: 'Abrir pasta de downloads', click: () => shell.openPath(downloadDirectory) },
      { type: 'separator' }, { role: 'quit', label: 'Sair' }
    ] },
    { label: 'Navegação', submenu: [ { role: 'reload', label: 'Recarregar app' }, { type: 'separator' }, { role: 'toggleDevTools', label: 'Ferramentas do desenvolvedor' } ] }
  ]));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

\n