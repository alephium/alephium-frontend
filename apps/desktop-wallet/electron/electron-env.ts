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

import { ProxySettings } from '@alephium/shared'
import { NativeTheme } from 'electron/main'
import { ProgressInfo, UpdateDownloadedEvent } from 'electron-updater'

import { ThemeSettings } from '@/features/theme/themeTypes'

declare global {
  interface Window {
    electron?: {
      theme: {
        setNativeTheme: (theme: ThemeSettings) => void
        getNativeTheme: () => void
        onGetNativeTheme: (callback: (nativeTheme: NativeTheme) => void) => () => void
        onShouldUseDarkColors: (callback: (useDark: boolean) => void) => () => void
      }
      updater: {
        checkForUpdates: () => Promise<string>
        startUpdateDownload: () => void
        onUpdateDownloadProgress: (callback: (info: ProgressInfo) => void) => () => void
        onUpdateDownloaded: (callback: (updateDownloadedEvent: UpdateDownloadedEvent) => void) => () => void
        quitAndInstallUpdate: () => void
        onError: (callback: (error: Error) => void) => () => void
      }
      walletConnect: {
        onConnect: (callback: (uri: string) => Promise<void>) => () => void
        resetDeepLinkUri: () => void
        getDeepLinkUri: () => Promise<string | null>
      }
      app: {
        hide: () => void
        show: () => void
        getSystemLanguage: () => Promise<string | undefined>
        getSystemRegion: () => Promise<string>
        setProxySettings: (proxySettings: ProxySettings) => Promise<void>
        openOnRampServiceWindow: ({ url, targetLocation }: { url: string; targetLocation: string }) => void
        onOnRampTargetLocationReached: (callback: () => void) => () => Electron.IpcRenderer
        restart: () => void
      }
    }
  }
}
