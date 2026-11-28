
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function section(filename, start, end) {
  const source = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, 'Trecho de código ausente: ' + start);
  return source.slice(from, to);
}

test('o player informa a falha de reprodução da sample ativa', async () => {
  const audio = {
    paused: true,
    src: 'https://cdn.wavs.com/test.mp3',
    play: async () => { throw new Error('Prévia indisponível'); }
  };
  const element = { classList: { toggle() {}, remove() {} }, dataset: {} };
  const messages = [];
  const player = section('renderer.js', 'async function playSample(', 'function renderSample(');
  await vm.runInNewContext(player + '\nplaySample(0)', {
    filteredSamples: [{ mp3: audio.src }],
    currentPack: { pack: {} },
    activeSampleIndex: 0,
    activePackPreviewId: null,
    stopPackHoverPreview() {},
    bottomPlayerAudio: audio,
    showBottomPlayer() {},
    bottomPlayerTitle: element,
    bottomPlayerSubtitle: element,
    coverUrl: () => '',
    bottomPlayerCover: element,
    bottomPlayerCoverFallback: element,
    bottomPlayerDownload: element,
    updateBottomPlayer() {},
    setDownloadStatus: (message) => messages.push(message)
  });
  assert.deepEqual(messages, ['Prévia indisponível']);
});

test('sair do pack restaura o botão mesmo com uma requisição pendente', async () => {
  const loadButton = {};
  let resolvePack;
  const loadPack = () => new Promise((resolve) => { resolvePack = resolve; });
  const attributes = {};
  const classList = { add() {}, remove() {} };
  const ctx = vm.createContext({
    packRequestVersion: 0,
    activePackPreviewId: null,
    currentPack: null,
    stopBottomPlayer() {},
    stopPackHoverPreview() {},
    history: {},
    capturePreviousView() {},
    creatorProfile: null,
    creatorProfileLoading: false,
    creatorProfileError: '',
    input: {},
    loadButton,
    loadingIndicatorMarkup: (text) => text,
    panel: {
      classList,
      replaceChildren() {},
      setAttribute: (name, value) => { attributes[name] = value; }
    },
    document: { body: { classList } },
    setStatus() {},
    window: { wavsResolver: { loadPack } }
  });
  const close = section('renderer.js', 'function clearPackView()', 'function resetCatalogFilters()');
  const open = section('renderer.js', 'async function openPack(', 'function openPackById(');
  const pending = vm.runInContext(close + open + '\nopenPack("test")', ctx);
  assert.equal(loadButton.disabled, true);
  vm.runInContext('clearPackView()', ctx);
  assert.equal(loadButton.disabled, false);
  assert.equal(attributes['aria-busy'], 'false');
  resolvePack({ ok: true });
  await pending;
  assert.equal(loadButton.disabled, false);
});

test('a busca mantém samples quando as respostas de título e criadores são inválidas', async () => {
  let search;
  const ipcMain = { handle: (_name, handler) => { search = handler; } };
  const apiRequest = async (url) => {
    if (url.startsWith('/api/producers?')) return { sellers: { data: {} } };
    if (url.startsWith('/api/packs/search-by-title?')) return { data: {} };
    if (url === '/api/genres') return { data: [] };
    if (url.startsWith('/api/sounds?')) {
      return { samples: { data: [
        { id: 1, title: 'Kick', pack_id: 42, pack_title: 'Drums', mp3: 'https://cdn.wavs.com/test.mp3' }
      ] } };
    }
    throw new Error('Endpoint inesperado: ' + url);
  };
  const matching = section('main.cjs', 'function normalizeSearchText(', 'function uniqueDownloadPath(');
  const handler = section('main.cjs', "ipcMain.handle('search-packs'", "ipcMain.handle('download-sample-preview'");
  vm.runInNewContext(matching + handler, { ipcMain, apiRequest, URL, URLSearchParams });
  const result = await search(null, 'kick', 1);
  assert.equal(result.ok, true);
  assert.equal(result.samples[0].title, 'Kick');
  assert.equal(result.packs[0].id, '42');
  assert.match(result.warning, /criadores/);
  assert.match(result.warning, /packs/);
});

test('a checagem obrigatória começa sem atraso e permite tentar novamente após erro', async () => {
  const { EventEmitter } = require('node:events');
  const autoUpdater = new EventEmitter();
  const messages = [];
  const handlers = new Map();
  let attempts = 0;
  autoUpdater.checkForUpdates = async () => {
    if (++attempts === 1) throw new Error('Sem conexão');
    autoUpdater.emit('update-available', { version: '1.2.8', releaseNotes: '- Atualização de teste' });
    return {};
  };
  const code = section('main.cjs', 'function reportCurrentVersion()', "ipcMain.handle('get-app-version'");
  const closure = [
    "let appUpdateStatus = { state: 'checking' };",
    'let appUpdateCheckInFlight = false, appUpdateAvailable = false, appUpdateDownloaded = false;',
    'let appUpdateDownloadStarted = false, appUpdateNotice = null, appUpdateReleaseInfo = null;',
    "let appUpdateNoticePath = 'pending-update-notice.json', appUpdateCheckTimer;",
    'function sendAppUpdateStatus(data) { appUpdateStatus = data; record(data); }'
  ].join('\n');
  const ctx = vm.createContext({
    app: { getVersion: () => '1.2.7', isPackaged: true },
    process: { platform: 'win32', env: {} },
    fs: { readFileSync() { throw Object.assign(new Error(), { code: 'ENOENT' }); } },
    autoUpdater,
    console: { warn() {} },
    ipcMain: { handle: (name, handler) => handlers.set(name, handler) },
    setInterval: () => ({}),
    record: (data) => messages.push(data.state)
  });
  vm.runInContext(closure + '\n' + code + '\nstartAppUpdater()', ctx);
  assert.equal(attempts, 1);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(messages, ['checking', 'check-error']);
  await handlers.get('retry-app-update-check')();
  assert.deepEqual(messages, ['checking', 'check-error', 'checking', 'available']);
});

test('o catálogo inicia durante a verificação silenciosa e não reinicia após confirmação', () => {
  const layout = { inert: true };
  let catalogRequests = 0;
  const code = section('renderer.js', 'function openCatalogAfterUpdateCheck()', 'window.wavsResolver.onAppUpdateStatus(');
  const overlay = { dataset: {}, classList: { add() {} }, setAttribute() {} };
  const ctx = vm.createContext({
    appLayout: layout,
    appUpdateOverlay: overlay,
    appUpdateState: 'checking',
    appUpdatePreviousFocus: null,
    catalogStarted: false,
    loadNewPacks: () => { catalogRequests++; },
    loadDiscoveryPacks: () => { catalogRequests++; }
  });
  vm.runInContext(code, ctx);
  assert.equal(layout.inert, true);
  assert.equal(catalogRequests, 0);
  vm.runInContext("renderAppUpdateStatus({ state: 'checking' }); renderAppUpdateStatus({ state: 'current' });", ctx);
  assert.equal(layout.inert, false);
  assert.equal(catalogRequests, 2);
});
