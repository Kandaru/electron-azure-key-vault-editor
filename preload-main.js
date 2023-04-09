const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onThemeChange: (callback) => ipcRenderer.on('theme-change', (ev, theme) => callback(theme)),
    onFormat: (callback) => ipcRenderer.on('format', (ev) => callback()),
    onKVSelected: (callback) => ipcRenderer.on('kv-selected', (ev, kv) => callback(kv)),
    onSecretFunction: (callback) => ipcRenderer.on('secret-function', (ev, functionName) => callback(functionName)),
    fetchSecrets: (kv) => ipcRenderer.invoke('fetch-secrets', kv),
    fetchSecret: (secretName, kv) => ipcRenderer.invoke('fetch-secret', { secretName, kv }),
    saveSecret: (kv, secretName, secretContent) => ipcRenderer.invoke('save-secret', { kv, secretName, secretContent }),
    deleteSecret: (kv, secretName) => ipcRenderer.invoke('delete-secret', { kv, secretName }),
});
