import { decrypt } from '~/utils/crypto'

// react-native-quick-crypto is a native module that can't load under Node, but it mirrors the Node crypto API, so we
// back it with Node's crypto to exercise the real decrypt logic.
vi.mock('react-native-quick-crypto', async () => {
  const { createDecipheriv, pbkdf2Sync } = await import('node:crypto')

  // crypto.ts reads Buffer off the quick-crypto module; Node's global Buffer is API-compatible for the test.
  return { default: { createDecipheriv, pbkdf2Sync, Buffer } }
})

// A payload produced by the original @alephium/shared-crypto encrypt(..., 'sha512') — the format produced by the
// desktop QR export and by deprecated (v1) mobile wallets, which must remain decryptable.
const LEGACY_PASSWORD = 'correct horse battery staple'
const LEGACY_PLAINTEXT =
  '{"mnemonic":"vault alarm sad mass witness property virus style good flower rice alpha","addresses":[],"contacts":[]}'
const LEGACY_PAYLOAD =
  '{"iv":"0f041c42afd3156d400e8e18d55f155a19d1f1f5811541dc999e9a56e37b154b136a5dfdae967d0565d5455eeba31b1b444f10f0133e6d675fbb33164b3bc65a","encrypted":"d9589c8fbb30c2ba7032881724057c1f8f99409c23282f3a633f43a78c8516cd36868a21d795763f5b11d35246d72814b95e6644e41bf458369a6014f5333c63091859e00114e7e826b49f8c523ecd62a40d723e41bfd6223a59ccfb8685146211a9ccb0c4be26a82f97e8ad12d43bfb465b0dfef1bd07b72bc0b62c4664f6d59d0a1923","salt":"81b35180af4bf3110d5f6fda8af4c293fe43cbe498a9137e1435e3dc297e0b41fd1b62eab1be44b29a1b0e06a1e0300ef0d78645f8ff7a59cd32bdf5b5f0fb55","version":1}'

// A deprecated (v1) mobile wallet PIN-encrypted with PIN "123456". Unlike the QR payload, the plaintext is the
// DeprecatedEncryptedMnemonicStoredAsString shape ({ version, mnemonic }) that DeprecatedAuthenticationModal expects.
const DEPRECATED_PIN = '123456'
const DEPRECATED_PIN_MNEMONIC =
  'vault alarm sad mass witness property virus style good flower rice alpha viable evidence run glare pretty scout evil judge enroll refuse another lava'
const DEPRECATED_PIN_BLOB =
  '{"iv":"adbd5cc3632591113913dbd6899941c33b145e433e3c6eac797b474ef99e54245c59e761e68ee2549411b5117293403da6d3e4bd06aadffb03df99349e6df0c0","encrypted":"51833644f901111965abc8eee1beb7941a02f45813e207259ab5f150d4fd4496949602a95f26861922fef13601c07143f09168b8ef7ad799fb718aaf87fab388479084e5094862a26fadc49e8ce78523f63a58571bf3b67e43985c32483f46490b3562dc1458a9a8a63a9de209e488ac461d430fe0bae8e00f9f34921f8706112bd46bf5cb24f51e8fa9128bbc250138dd9a82ac6f73e62243187e54de06918c41694ddcfad495a29e054f17fce1eb73cac7549d4943312da2ee56c4088fe992","salt":"309209ec91d3a01b8f0f6732e33d097b712fe36c1d47f6e901d16edf2e99e0fa36c0615fe69bac0b257bec638fefd3d0a16acecc0e09a800a956581a005e9136","version":1}'

describe('decrypt', () => {
  it('decrypts the legacy AES-256-GCM + PBKDF2 (sha512) golden vector', () => {
    expect(decrypt(LEGACY_PASSWORD, LEGACY_PAYLOAD)).toBe(LEGACY_PLAINTEXT)
  })

  it('decrypts a deprecated PIN-encrypted wallet (DeprecatedAuthenticationModal path)', () => {
    // Mirrors DeprecatedAuthenticationModal.decryptDeprecatedMnemonic
    const { version, mnemonic } = JSON.parse(decrypt(DEPRECATED_PIN, DEPRECATED_PIN_BLOB))

    expect(version).toBe(1)
    expect(mnemonic).toBe(DEPRECATED_PIN_MNEMONIC)
  })

  it('throws on a wrong password (auth tag mismatch)', () => {
    expect(() => decrypt('wrong password', LEGACY_PAYLOAD)).toThrow()
  })

  it('throws on an unsupported payload version', () => {
    expect(() => decrypt(LEGACY_PASSWORD, JSON.stringify({ version: 2 }))).toThrow('Invalid version')
  })
})
