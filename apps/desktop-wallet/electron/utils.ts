import { app, WebFrameMain } from 'electron'

import { DEPRECATED_APP_PROTOCOL } from './appProtocol'

export const isMac = process.platform === 'darwin'

export const isWindows = process.platform === 'win32'

export const CURRENT_VERSION = app.getVersion()

export const IS_RC = CURRENT_VERSION.includes('-rc.')

// See: https://www.electronjs.org/docs/latest/tutorial/security#17-validate-the-sender-of-all-ipc-messages
export const isIpcSenderValid = (frame: WebFrameMain | null) => {
  if (frame) {
    const url = new URL(frame.url)

    return (
      url.protocol === `${DEPRECATED_APP_PROTOCOL}:` || // for production builds
      url.host === 'localhost:3000' // for dev environment
    )
  } else {
    return false
  }
}

// Schemes we are willing to hand to the OS via shell.openExternal. Everything else (file:, smb:,
// javascript:, custom app protocols, ...) is rejected so an attacker-influenced URL (e.g. on-chain
// NFT/token metadata, the announcement feed) cannot reach the OS shell with a dangerous scheme.
// See: https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:'])

export const isAllowedExternalUrl = (url: string) => {
  try {
    return ALLOWED_EXTERNAL_PROTOCOLS.has(new URL(url).protocol)
  } catch {
    return false
  }
}
