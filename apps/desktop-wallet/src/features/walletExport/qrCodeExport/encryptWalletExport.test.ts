import { createDecipheriv, pbkdf2Sync, webcrypto } from 'node:crypto'

import { encryptWalletExport } from '@/features/walletExport/qrCodeExport/encryptWalletExport'

// The desktop QR export runs in the Electron renderer, which provides Web Crypto. jsdom does not implement
// SubtleCrypto, so we expose Node's Web Crypto as the global `crypto` used by encryptWalletExport.
vi.stubGlobal('crypto', webcrypto)

const AUTH_TAG_LENGTH = 16

// Mirrors the mobile wallet's decrypt (AES-256-GCM + PBKDF2 sha512). Proves the QR export stays decryptable on mobile.
const decryptLikeMobile = (password: string, payloadRaw: string): string => {
  const { version, salt, iv, encrypted } = JSON.parse(payloadRaw)

  if (version !== 1) throw new Error(`Invalid version: got ${version}, expected: 1`)

  const key = pbkdf2Sync(Buffer.from(password, 'utf8'), Buffer.from(salt, 'hex'), 10000, 32, 'sha512')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'))
  const data = Buffer.from(encrypted, 'hex')
  decipher.setAuthTag(data.subarray(data.length - AUTH_TAG_LENGTH))

  return Buffer.concat([decipher.update(data.subarray(0, data.length - AUTH_TAG_LENGTH)), decipher.final()]).toString(
    'utf8'
  )
}

// A payload produced by the original @alephium/shared-crypto encrypt(..., 'sha512'). The QR wire format is frozen so
// that mobile wallet versions already in the field can still import wallets exported by newer desktop versions.
const LEGACY_PASSWORD = 'correct horse battery staple'
const LEGACY_PLAINTEXT =
  '{"mnemonic":"vault alarm sad mass witness property virus style good flower rice alpha","addresses":[],"contacts":[]}'
const LEGACY_PAYLOAD =
  '{"iv":"0f041c42afd3156d400e8e18d55f155a19d1f1f5811541dc999e9a56e37b154b136a5dfdae967d0565d5455eeba31b1b444f10f0133e6d675fbb33164b3bc65a","encrypted":"d9589c8fbb30c2ba7032881724057c1f8f99409c23282f3a633f43a78c8516cd36868a21d795763f5b11d35246d72814b95e6644e41bf458369a6014f5333c63091859e00114e7e826b49f8c523ecd62a40d723e41bfd6223a59ccfb8685146211a9ccb0c4be26a82f97e8ad12d43bfb465b0dfef1bd07b72bc0b62c4664f6d59d0a1923","salt":"81b35180af4bf3110d5f6fda8af4c293fe43cbe498a9137e1435e3dc297e0b41fd1b62eab1be44b29a1b0e06a1e0300ef0d78645f8ff7a59cd32bdf5b5f0fb55","version":1}'

describe('encryptWalletExport', () => {
  it('produces the legacy version:1 payload shape', async () => {
    const payload = JSON.parse(await encryptWalletExport('password', 'some wallet data'))

    expect(payload.version).toBe(1)
    expect(payload.iv).toMatch(/^[0-9a-f]+$/)
    expect(payload.salt).toMatch(/^[0-9a-f]+$/)
    expect(payload.encrypted).toMatch(/^[0-9a-f]+$/)
  })

  it('produces output that the mobile (PBKDF2-sha512) algorithm can decrypt', async () => {
    const password = 'super secret password'
    const data = '{"mnemonic":"one two three four","addresses":[],"contacts":[]}'

    expect(decryptLikeMobile(password, await encryptWalletExport(password, data))).toBe(data)
  })

  it('stays compatible with the frozen legacy golden vector', () => {
    expect(decryptLikeMobile(LEGACY_PASSWORD, LEGACY_PAYLOAD)).toBe(LEGACY_PLAINTEXT)
  })
})
