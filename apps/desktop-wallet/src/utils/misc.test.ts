import { isAllowedExternalUrl as isAllowedExternalUrlMainProcess } from '../../electron/utils'
import { isAllowedExternalUrl, openInWebBrowser } from './misc'

// electron/utils.ts (via its appProtocol/paths imports) touches the electron runtime at module load.
// Stub those so the main-process copy can be imported here for the parity check below.
vi.mock('electron', () => ({ app: { getVersion: () => '0.0.0-test' }, net: {}, protocol: {} }))
vi.mock('electron-is-dev', () => ({ default: false }))

// URLs that may be handed to shell.openExternal / window.open.
const ALLOWED = [
  'https://explorer.alephium.org/addresses/abc',
  'https://example.com',
  'HtTpS://Example.com/Path', // scheme + host are normalised by URL
  'mailto:support@alephium.org',
  'http://localhost:23000',
  'http://LOCALHOST:23000/addresses/x', // host lowercased by URL
  'http://127.0.0.1:9090',
  'http://127.5.5.5', // 127.0.0.0/8
  'http://[::1]:23000', // IPv6 loopback (URL reports host as '[::1]')
  'http://10.0.0.5:8080', // 10.0.0.0/8
  'http://172.16.0.1', // 172.16.0.0/12 lower bound
  'http://172.31.255.255', // 172.16.0.0/12 upper bound
  'http://192.168.1.5:9090', // 192.168.0.0/16
  'http://169.254.10.10' // 169.254.0.0/16 link-local
]

const REJECTED = [
  '', // empty
  'not a url', // new URL throws
  '//evil.com', // protocol-relative, new URL throws
  'http://example.com', // public http
  'http://8.8.8.8', // public IP over http
  'http://172.15.0.1', // just below 172.16.0.0/12
  'http://172.32.0.1', // just above 172.16.0.0/12
  'http://192.169.0.1', // not 192.168.x
  'http://169.255.0.1', // not 169.254.x
  'http://localhost.attacker.com', // sub-domain trick
  'http://127.0.0.1.evil.com', // suffix trick
  'file:///etc/passwd',
  'file://attacker/share/setup.exe',
  'smb://attacker/share',
  'ms-msdt:/id PCWDiagnostic',
  'vbscript:msgbox(1)',
  'javascript:alert(document.cookie)',
  'data:text/html,<script>alert(1)</script>',
  'data:image/png;base64,iVBORw0KGgo=',
  'alephium://wc?uri=wc:abc@2' // custom app protocol
]

describe('isAllowedExternalUrl', () => {
  it.each(ALLOWED)('allows %s', (url) => {
    expect(isAllowedExternalUrl(url)).toBe(true)
  })

  it.each(REJECTED)('rejects %s', (url) => {
    expect(isAllowedExternalUrl(url)).toBe(false)
  })
})

// The renderer guard (misc.ts) is a deliberate duplicate of the authoritative main-process guard
// (electron/utils.ts) — they cannot share a module without risking bundling shared into the Node
// main process. This guards them against drifting apart.
describe('isAllowedExternalUrl parity: renderer (misc.ts) === main process (electron/utils.ts)', () => {
  it.each([...ALLOWED, ...REJECTED])('agrees on %s', (url) => {
    expect(isAllowedExternalUrlMainProcess(url)).toBe(isAllowedExternalUrl(url))
  })
})

describe('openInWebBrowser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens an allowed URL in a noopener/noreferrer tab', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    openInWebBrowser('https://explorer.alephium.org')
    expect(open).toHaveBeenCalledWith('https://explorer.alephium.org', '_blank', 'noopener,noreferrer')
  })

  it('opens devnet/LAN http', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    openInWebBrowser('http://localhost:23000/addresses/x')
    expect(open).toHaveBeenCalledWith('http://localhost:23000/addresses/x', '_blank', 'noopener,noreferrer')
  })

  it('does not open dangerous schemes, public http, or empty input', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    openInWebBrowser('file:///etc/passwd')
    openInWebBrowser('smb://attacker/share')
    openInWebBrowser('data:text/html,<script>alert(1)</script>')
    openInWebBrowser('http://example.com')
    openInWebBrowser('')
    expect(open).not.toHaveBeenCalled()
  })
})
