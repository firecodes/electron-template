const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openChild: () => ipcRenderer.send('open-child'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
})
