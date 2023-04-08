const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onThemeChange: (callback) => ipcRenderer.on('theme-change', (ev, theme) => callback(theme)),
    onFormat: (callback) => ipcRenderer.on('format', (ev) => callback()),
    onKVSelected: (callback) => ipcRenderer.on('kv-selected', (ev, kv) => callback(kv)),
    fetchSecrets: (kv) => ipcRenderer.invoke('fetch-secrets', kv),
    fetchSecret: (secretName, kv) => ipcRenderer.invoke('fetch-secret', { secretName, kv })
});
