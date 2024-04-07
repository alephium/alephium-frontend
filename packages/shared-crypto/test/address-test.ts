/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ExplorerProvider } from '@alephium/web3'

import { walletImport } from '../lib'
import { discoverActiveAddresses } from '../lib/address'
import derivedAddresses from './fixtures/address-discovery.json'
import wallets from './fixtures/wallets.json'

describe('address', function () {
  it('discovers active addresses', async () => {
    const masterKey = walletImport(wallets.wallets[0].mnemonic).masterKey
    const client = new ExplorerProvider('')
    const mockedPostAddressesActive = jest.fn()
    client.addresses.postAddressesUsed = mockedPostAddressesActive

    /*
    // The addresses in fixtures/address-discovery.json were generated using:

    const skipAddressIndexes: number[] = []

    for (let group = 0; group < 4; group++) {
      const addresses: string[] = []

      for (let j = 0; j < 100; j++) {
        const newAddress = deriveNewAddressData(masterKey, group, undefined, skipAddressIndexes)
        addresses.push(newAddress.address)
        skipAddressIndexes.push(newAddress.addressIndex)
      }

      console.log(`GROUP: ${group}`, addresses)
    }
    */

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

    let results = await discoverActiveAddresses(masterKey, client)
    expect(client.addresses.postAddressesUsed).toBeCalledTimes(1)
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

    results = await discoverActiveAddresses(masterKey, client)
    expect(client.addresses.postAddressesUsed).toBeCalledTimes(2)
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

    results = await discoverActiveAddresses(masterKey, client)
    expect(client.addresses.postAddressesUsed).toBeCalledTimes(4)
    expect(results).toHaveLength(3)
    const addresses = results.map((a) => a.hash)
    expect(addresses).toContain(derivedAddresses.group0[4])
    expect(addresses).toContain(derivedAddresses.group0[7])
    expect(addresses).toContain(derivedAddresses.group2[0])
    mockedPostAddressesActive.mockClear()
  })
})
