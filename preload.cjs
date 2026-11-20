const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('wavsResolver', {
  loadPack: (link) => ipcRenderer.invoke('load-pack', link),
  loadNewPacks: () => ipcRenderer.invoke('load-new-packs'),
  loadPackPreview: (packId) => ipcRenderer.invoke('load-pack-preview', packId),
  loadGenrePacks: (genreId, page) => ipcRenderer.invoke('load-genre-packs', genreId, page),
  searchPacks: (query, page, creator) => ipcRenderer.invoke('search-packs', query, page, creator),
  loadCreatorProfile: (id, username, display, page) => ipcRenderer.invoke('load-creator-profile', id, username, display, page),
  getFavoritePacks: () => ipcRenderer.invoke('get-favorite-packs'),
  toggleFavoritePack: (pack) => ipcRenderer.invoke('toggle-favorite-pack', pack),
  getAppPreferences: () => ipcRenderer.invoke('get-app-preferences'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  installAppUpdate: () => ipcRenderer.invoke('install-app-update'),
  saveAppPreference: (key, value) => ipcRenderer.invoke('save-app-preference', key, value),
  downloadSamplePreview: (url, title, tempo, author, folderName) => ipcRenderer.invoke('download-sample-preview', url, title, tempo, author, folderName),
  cancelSamplePreviewDownload: (downloadId) => ipcRenderer.invoke('cancel-sample-preview-download', downloadId),
  getSampleDownloadDirectory: () => ipcRenderer.invoke('get-sample-download-directory'),
  chooseSampleDownloadDirectory: () => ipcRenderer.invoke('choose-sample-download-directory'),
  onDownloadProgress: (callback) => { const listener = (_event, data) => callback(data); ipcRenderer.on('download-progress', listener); return () => ipcRenderer.removeListener('download-progress', listener); },
  onDownloadFinished: (callback) => { const listener = (_event, data) => callback(data); ipcRenderer.on('download-finished', listener); return () => ipcRenderer.removeListener('download-finished', listener); },
  onAppUpdateStatus: (callback) => { const listener = (_event, data) => callback(data); ipcRenderer.on('app-update-status', listener); return () => ipcRenderer.removeListener('app-update-status', listener); }
});
