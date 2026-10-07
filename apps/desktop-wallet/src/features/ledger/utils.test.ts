import { describe, expect, it, vi } from 'vitest'

import { LedgerAlephium } from '@/features/ledger/utils'

// Group of the address derived at each HD index on the mocked device
const groupOfIndex = [1, 2, 3, 0, 0, 1, 2, 3, 0, 1]

vi.mock('@ledgerhq/hw-transport-webhid', () => ({
  default: { create: vi.fn(async () => ({ close: vi.fn() })) }
}))

vi.mock('@ledgerhq/hw-transport-webusb', () => ({
  default: { create: vi.fn() }
}))

// Mimics the device: when a target group is given, it scans forward from the requested index until it finds an
// address in that group and returns it along with the index it stopped at. It knows nothing about used indexes.
vi.mock('@alephium/ledger-app', () => ({
  AlephiumApp: class {
    getVersion = async () => '0.6.0'
    close = async () => {}
    getAccount = async (path: string, targetGroup?: number) => {
      let index = Number(path.split('/').at(-1))

      if (targetGroup !== undefined) while (groupOfIndex[index] !== targetGroup) index++

      return [
        {
          address: `address-${index}`,
          publicKey: `public-key-${index}`,
          group: groupOfIndex[index],
          keyType: 'default'
        },
        index
      ] as const
    }
  }
}))

describe('LedgerAlephium.generateAddress', () => {
  it('does not return an address whose index is already used', async () => {
    const app = await LedgerAlephium.create()

    // The wallet already has the addresses at index 0 (group 1) and index 3 (group 0)
    const address = await app.generateAddress({ group: 0, skipAddressIndexes: [0, 3], keyType: 'default' })

    expect(address.index).toBe(4)
    expect(address.group).toBe(0)
  })

  it('skips every used index the device lands on', async () => {
    const app = await LedgerAlephium.create()

    const address = await app.generateAddress({ group: 0, skipAddressIndexes: [0, 3, 4], keyType: 'default' })

    expect(address.index).toBe(8)
    expect(address.group).toBe(0)
  })

  it('returns the first address in the requested group when no index is used', async () => {
    const app = await LedgerAlephium.create()

    const address = await app.generateAddress({ group: 2, keyType: 'default' })

    expect(address.index).toBe(1)
    expect(address.group).toBe(2)
  })
})
