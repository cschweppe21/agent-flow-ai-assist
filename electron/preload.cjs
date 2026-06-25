const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  getFilePath: (file) => webUtils.getPathForFile(file),
});
