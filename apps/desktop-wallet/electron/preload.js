/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  theme: {
    setNativeTheme: (theme) => ipcRenderer.invoke('theme:setNativeTheme', theme),
    getNativeTheme: () => ipcRenderer.invoke('theme:getNativeTheme'),
    onGetNativeTheme: (callback) => {
      // See: https://www.electronjs.org/docs/latest/tutorial/ipc#2-expose-ipcrendereron-via-preload
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('theme:getNativeTheme', callbackWithEventArg)
      return () => ipcRenderer.removeListener('theme:getNativeTheme', callbackWithEventArg)
    },
    onShouldUseDarkColors: (callback) => {
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('theme:shouldUseDarkColors', callbackWithEventArg)
      return () => ipcRenderer.removeListener('theme:shouldUseDarkColors', callbackWithEventArg)
    }
  },
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('updater:checkForUpdates'),
    startUpdateDownload: () => ipcRenderer.invoke('updater:startUpdateDownload'),
    onUpdateDownloadProgress: (callback) => {
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('updater:download-progress', callbackWithEventArg)
      return () => ipcRenderer.removeListener('updater:download-progress', callbackWithEventArg)
    },
    onUpdateDownloaded: (callback) => {
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('updater:updateDownloaded', callbackWithEventArg)
      return () => ipcRenderer.removeListener('updater:updateDownloaded', callbackWithEventArg)
    },
    quitAndInstallUpdate: () => ipcRenderer.invoke('updater:quitAndInstallUpdate'),
    onError: (callback) => {
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('updater:error', callbackWithEventArg)
      return () => ipcRenderer.removeListener('updater:error', callbackWithEventArg)
    }
  },
  walletConnect: {
    onConnect: (callback) => {
      const callbackWithEventArg = (_, arg2) => callback(arg2)
      ipcRenderer.on('wc:connect', callbackWithEventArg)
      return () => ipcRenderer.removeListener('wc:connect', callbackWithEventArg)
    },
    resetDeepLinkUri: () => ipcRenderer.invoke('wc:resetDeepLinkUri'),
    getDeepLinkUri: () => ipcRenderer.invoke('wc:getDeepLinkUri')
  },
  app: {
    hide: () => ipcRenderer.invoke('app:hide'),
    show: () => ipcRenderer.invoke('app:show'),
    getSystemLanguage: () => ipcRenderer.invoke('app:getSystemLanguage'),
    getSystemRegion: () => ipcRenderer.invoke('app:getSystemRegion'),
    setProxySettings: (proxySettings) => ipcRenderer.invoke('app:setProxySettings', proxySettings),
    restart: () => ipcRenderer.invoke('app:restart')
  }
})
