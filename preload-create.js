const { contextBridge, ipcRenderer } = require('electron');
const { globalParams } = require('./global-params');

contextBridge.exposeInMainWorld('globalParams', {
    getSelectedKeyVault: () => ({ ...globalParams.selectedKV }),
    getAllVaults: () => [...globalParams.allVaults.map(kv => ({ ...kv }))],
    isEditingKVNew: () => globalParams.isEditingNew
});