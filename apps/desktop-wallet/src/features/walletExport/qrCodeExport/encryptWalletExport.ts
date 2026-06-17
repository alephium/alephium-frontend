const SALT_BYTE_LENGTH = 64
const IV_BYTE_LENGTH = 64
const ITERATIONS = 10000
const KEY_BIT_LENGTH = 256

// Encrypts the wallet export payload with AES-256-GCM + PBKDF2 (SHA-512), producing the legacy "version: 1" format
// that used to be provided by @alephium/shared-crypto. The mobile wallet — including versions already released —
// decrypts this exact format when importing a wallet via QR code, so the format is frozen for cross-version
// compatibility (do not change the algorithm, digest or payload shape).
export const encryptWalletExport = async (password: string, data: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTE_LENGTH))

  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveKey'
  ])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-512' },
    baseKey,
    { name: 'AES-GCM', length: KEY_BIT_LENGTH },
    false,
    ['encrypt']
  )
  // Web Crypto appends the 16-byte GCM auth tag to the ciphertext, matching the legacy payload layout.
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(data))
  )

  return JSON.stringify({
    iv: toHex(iv),
    encrypted: toHex(encrypted),
    salt: toHex(salt),
    version: 1
  })
}

const toHex = (bytes: Uint8Array): string => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
