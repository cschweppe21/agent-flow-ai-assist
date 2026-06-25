const { contextBridge, ipcRenderer, webUtils } = require('electron');

// Load contact data synchronously before React initializes
let initialData = null;
try {
  initialData = ipcRenderer.sendSync('load-data-sync');
} catch (e) {}

contextBridge.exposeInMainWorld('electronAPI', {
  initialData,
  saveData: (json) => ipcRenderer.invoke('save-data', json),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  getFilePath: (file) => webUtils.getPathForFile(file),
});
