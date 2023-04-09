const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    fetchEditingData: () => ipcRenderer.invoke('get-editing-data'),
    saveKV: (editingData) => ipcRenderer.send('save-kv', editingData),
    cancelEditing: () => ipcRenderer.send('cancel-editing'),
});