import { describe, expect, it } from 'vitest'

import { isDappMessageHasherAllowed, SAFE_DAPP_MESSAGE_HASHER } from './hasher'

describe('isDappMessageHasherAllowed (dApp signMessage policy)', () => {
  it("accepts only the domain-separated 'alephium' hasher", () => {
    expect(SAFE_DAPP_MESSAGE_HASHER).toBe('alephium')
    expect(isDappMessageHasherAllowed('alephium')).toBe(true)
  })

  it('rejects every other hasher a dApp could request', () => {
    expect(isDappMessageHasherAllowed('identity')).toBe(false)
    expect(isDappMessageHasherAllowed('sha256')).toBe(false)
    expect(isDappMessageHasherAllowed('blake2b')).toBe(false)
  })
})
