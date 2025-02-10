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
        onOnRampTargetLocationReached: (callback: () => void) => () => void
        restart: () => void
      }
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
        onMaximizedChange: (callback: (maximized: boolean) => void) => () => void
      }
    }
  }
}
