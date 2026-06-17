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

// http is allowed only for loopback (localhost / 127.0.0.0/8 / ::1) and RFC-1918 private + link-local
// ranges, so devnet (http://localhost:23000) and self-hosted LAN nodes keep working. Public http is
// rejected.
const isLoopbackOrPrivateHost = (hostname: string) => {
  if (hostname === 'localhost' || hostname === '::1') return true

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(hostname)
  if (!ipv4) return false

  const a = Number(ipv4[1])
  const b = Number(ipv4[2])

  return (
    a === 127 || // loopback 127.0.0.0/8
    a === 10 || // private 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) || // private 172.16.0.0/12
    (a === 192 && b === 168) || // private 192.168.0.0/16
    (a === 169 && b === 254) // link-local 169.254.0.0/16
  )
}

// Decide whether a URL is safe to hand to the OS via shell.openExternal: https/mailto always, http
// only for loopback/private hosts (devnet + LAN). Everything else (file:, smb:, javascript:, custom
// app protocols, public http, ...) is rejected so an attacker-influenced URL (e.g. on-chain
// NFT/token metadata, the announcement feed) cannot reach the OS shell with a dangerous scheme.
// See: https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-shellopenexternal-with-untrusted-content
export const isAllowedExternalUrl = (url: string) => {
  try {
    const { protocol, hostname } = new URL(url)

    if (protocol === 'https:' || protocol === 'mailto:') return true
    if (protocol === 'http:') return isLoopbackOrPrivateHost(hostname)

    return false
  } catch {
    return false
  }
}
