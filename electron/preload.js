import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (path) => ipcRenderer.invoke('open-file', path),
});
