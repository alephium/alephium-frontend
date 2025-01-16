import { ProxySettings } from '@alephium/shared'
import { IpcRendererEvent, NativeTheme } from 'electron/main'
import { ProgressInfo, UpdateDownloadedEvent } from 'electron-updater'

import { ThemeSettings } from '@/features/theme/themeTypes'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  theme: {
    setNativeTheme: (theme: ThemeSettings) => ipcRenderer.invoke('theme:setNativeTheme', theme),
    getNativeTheme: () => ipcRenderer.invoke('theme:getNativeTheme'),
    onGetNativeTheme: (callback: (nativeTheme: NativeTheme) => void) => {
      // See: https://www.electronjs.org/docs/latest/tutorial/ipc#2-expose-ipcrendereron-via-preload
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: NativeTheme) => callback(arg2)
      ipcRenderer.on('theme:getNativeTheme', (_, arg2) => callback(arg2))

      return () => ipcRenderer.removeListener('theme:getNativeTheme', callbackWithEventArg)
    },
    onShouldUseDarkColors: (callback: (useDark: boolean) => void) => {
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: boolean) => callback(arg2)
      ipcRenderer.on('theme:shouldUseDarkColors', callbackWithEventArg)

      return () => ipcRenderer.removeListener('theme:shouldUseDarkColors', callbackWithEventArg)
    }
  },
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('updater:checkForUpdates'),
    startUpdateDownload: () => ipcRenderer.invoke('updater:startUpdateDownload'),
    onUpdateDownloadProgress: (callback: (info: ProgressInfo) => void) => {
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: ProgressInfo) => callback(arg2)
      ipcRenderer.on('updater:download-progress', callbackWithEventArg)

      return () => ipcRenderer.removeListener('updater:download-progress', callbackWithEventArg)
    },
    onUpdateDownloaded: (callback: (updateDownloadedEvent: UpdateDownloadedEvent) => void) => {
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: UpdateDownloadedEvent) => callback(arg2)
      ipcRenderer.on('updater:updateDownloaded', callbackWithEventArg)

      return () => ipcRenderer.removeListener('updater:updateDownloaded', callbackWithEventArg)
    },
    quitAndInstallUpdate: () => ipcRenderer.invoke('updater:quitAndInstallUpdate'),
    onError: (callback: (error: Error) => void) => {
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: Error) => callback(arg2)
      ipcRenderer.on('updater:error', callbackWithEventArg)

      return () => ipcRenderer.removeListener('updater:error', callbackWithEventArg)
    }
  },
  walletConnect: {
    onConnect: (callback: (uri: string) => Promise<void>) => {
      const callbackWithEventArg = (_: IpcRendererEvent, arg2: string) => callback(arg2)
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
    openOnRampServiceWindow: ({ url, targetLocation }: { url: string; targetLocation: string }) =>
      ipcRenderer.invoke('app:openOnRampServiceWindow', { url, targetLocation }),
    onOnRampTargetLocationReached: (callback: () => void) => {
      ipcRenderer.on('target-location-reached', callback)

      return () => ipcRenderer.removeListener('target-location-reached', callback)
    },
    setProxySettings: (proxySettings: ProxySettings) => ipcRenderer.invoke('app:setProxySettings', proxySettings),
    restart: () => ipcRenderer.invoke('app:restart')
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    onMaximizedChange: (callback: (maximized: boolean) => void) => {
      const subscription = (_event: IpcRendererEvent, maximized: boolean) => callback(maximized)
      ipcRenderer.on('window:maximized', subscription)
      return () => ipcRenderer.removeListener('window:maximized', subscription)
    }
  }
})
