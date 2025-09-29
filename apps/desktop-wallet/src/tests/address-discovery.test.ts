/**
 * @vitest-environment node
 */

import { keyring } from '@alephium/keyring'
import { throttledClient } from '@alephium/shared'

import { discoverGroupedAddresses } from '@/api/addresses'

import derivedAddresses from './fixtures/address-discovery.json'

describe('Address discovery', () => {
  it('should discover active addresses', async () => {
    keyring.importMnemonicString(derivedAddresses.mnemonic)

    const mockedPostAddressesActive = vi.fn()
    throttledClient.explorer.addresses.postAddressesUsed = mockedPostAddressesActive

    // Scenario 1:
    // All derived addresses are inactive.
    // The API should be queried once.
    // The function should return 0 active addresses.
    mockedPostAddressesActive.mockResolvedValueOnce([
      ...[false, false, false, false, false],
      ...[false, false, false, false, false],
      ...[false, false, false, false, false],
      ...[false, false, false, false, false]
    ])

    let results = await discoverGroupedAddresses()
    expect(throttledClient.explorer.addresses.postAddressesUsed).toHaveBeenCalledTimes(1)
    expect(results).toHaveLength(0)
    mockedPostAddressesActive.mockClear()

    // Scenario 2:
    // The 5th address of group 0 is active.
    // The API should make an additional query to further investigate active addresses of group 0.
    // The function should return the 5th address of group 0.
    mockedPostAddressesActive
      .mockResolvedValueOnce([
        ...[false, false, false, false, true],
        ...[false, false, false, false, false],
        ...[false, false, false, false, false],
        ...[false, false, false, false, false]
      ])
      .mockResolvedValueOnce([false, false, false, false, false])

    results = await discoverGroupedAddresses()
    expect(throttledClient.explorer.addresses.postAddressesUsed).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(1)
    expect(results.map((a) => a.hash)).toContain(derivedAddresses.group0[4])
    mockedPostAddressesActive.mockClear()

    // Scenario 3:
    // The 5th and 8th addresses of group 0 and the 1st address of group 2 are active.
    // The API should make 2 additional queries to further investigate active addresses of group 0 and 1 additional for group 2.
    // The function should return the 5th and 8th addresses of group 0.
    mockedPostAddressesActive
      .mockResolvedValueOnce(
        // all groups, query 1
        [
          ...[false, false, false, false, true],
          ...[false, false, false, false, false],
          ...[true, false, false, false, false],
          ...[false, false, false, false, false]
        ]
      )
      // group 0, query 2
      .mockResolvedValueOnce([false, false, true, false, false])
      // group 0, query 3
      .mockResolvedValueOnce([false, false, false])
      // group 2, query 1
      .mockResolvedValueOnce([false, false, false, false, false])

    results = await discoverGroupedAddresses()
    expect(throttledClient.explorer.addresses.postAddressesUsed).toHaveBeenCalledTimes(4)
    expect(results).toHaveLength(3)
    const addresses = results.map((a) => a.hash)
    expect(addresses).toContain(derivedAddresses.group0[4])
    expect(addresses).toContain(derivedAddresses.group0[7])
    expect(addresses).toContain(derivedAddresses.group2[0])
    mockedPostAddressesActive.mockClear()
  })
})
