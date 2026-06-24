const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  getFilePath: (file) => webUtils.getPathForFile(file),
});
