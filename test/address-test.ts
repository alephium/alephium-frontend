/*
Copyright 2018 - 2022 The Alephium Authors
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

import { ExplorerClient, walletImport } from '../lib'
import { addressToGroup, discoverActiveAddresses, isAddressValid } from '../lib/address'
import wallets from './fixtures/wallets.json'
import derivedAddresses from './fixtures/address-discovery.json'

describe('address', function () {
  it('should derive group', async () => {
    function check(address: string, expected: number) {
      const group = addressToGroup(address, 4)
      expect(group).toEqual(expected)
    }

    check('12psscGPMgdqctaeCA37HYAkpVBFX1LbN4dSvjyxbDyKk', 1)
    check('16TGLiD3fqyuGFRFHffh58BC3okYCbjRH1WHPzeSp39Wi', 2)
    check('15aTcpJfCX9akQqYuRMMgun6Mv6ek8bigB98VTUFMwKYA', 1)
    check('164ejvnxGYRPUt3tYwJrMxBLLmeag2WACH4GfcsRUN3W7', 2)
    check('15p5vK921GnxFSQgXZo8Wceg6EvwcXZ9rCQxE2SeXc1s5', 1)
    check('1HSLAetSuMTKPHukvXYg6yaDuUJ67vxGashzFLEuu6qV6', 1)
    check('1HbU1TDiUMAj33Cp5cA2xc9uTqp1bjWa5UvkeGLm4bDbE', 2)
    check('13zn4s3fb5Q9d8rtszYdmYVpQ3MM9VM2xLBe9rMhcNxjd', 0)
    check('1DdQwce5ZzFrEYyz1H5KU9v8hRpoTbq5i7zE5Nu5k4ope', 2)
    check('19hpcUVGzdpWRD8yVUyP9pJwwxD6P5ixGUgSmVPbhBAVX', 2)
    check('1DpNeY8uutS1FRW7D565WjUgu5HcKSYAMqZNWgUJWggWZ', 0)
    check('1G1gjpt4mxij7JwP5SpX6ScwQHisWN3V5WBtFfWKtc3vo', 3)
    check('19XyGb6f1upjvQAG4vexB1EmY3pU8G2VN5gM267Pdhogg', 3)
    check('1H5YniQrUqxJY9ShTjMeX6DMgjPpYfdFqDvTgBYv6h1iz', 1)
    check('18Ca9jZDqRcxTfdNr2hq5KBJjf7PJLA5PXMjRoeB83JNv', 3)
    check('15XyPNJuZ85wyUMs4mwn98LLPMjiwUSCuTmR74NuxpwXT', 0)
    check('1F6ssQRwH1p1omaoQR3eirFrycHC3mUr3Vw9pLcgEe33W', 1)
    check('19JtVnQ4YLcA9mWPafnLmtWarAjdaLR3d7R5RAUjxHbe1', 3)
  })

  it('is valid', async () => {
    expect(isAddressValid('16sR3EMn2BdFgENRhz6N2TJ78nfaADdv3prKXUQMaB6m3')).toBeTruthy()
    expect(isAddressValid('19XWyoWy6DjrRp7erWqPfBnh7HL1Sb2Ub8SVjux2d71Eb')).toBeTruthy()
    expect(isAddressValid('1CsutTzw8WVhqr1PB6F1tYinuLihAsAm9FxE7rVkC3Z2u')).toBeTruthy()
    expect(isAddressValid('1CwD52BrUj9e4WDJSZ7RXLU2A8us4ZFSmYBDKu98p7szi')).toBeTruthy()
    expect(isAddressValid('1BHSQ8JMeYHZe2kj3KmLjuQCSM3mvzYjNutz14uRPbxZM')).toBeTruthy()
    expect(isAddressValid('')).toBeFalsy()
    expect(isAddressValid('123')).toBeFalsy()
  })

  it('discovers active addresses', async () => {
    const seed = walletImport(wallets.wallets[0].mnemonic).seed
    const client = new ExplorerClient()
    const mockedPostAddressesActive = jest.fn()
    client.addressesActive.postAddressesActive = mockedPostAddressesActive

    /*
    // The addresses in fixtures/address-discovery.json were generated using:

    const skipAddressIndexes: number[] = []

    for (let group = 0; group < 4; group++) {
      const addresses: string[] = []

      for (let j = 0; j < 100; j++) {
        const newAddress = deriveNewAddressData(seed, group, undefined, skipAddressIndexes)
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
    mockedPostAddressesActive.mockResolvedValueOnce({
      data: [
        ...[false, false, false, false, false],
        ...[false, false, false, false, false],
        ...[false, false, false, false, false],
        ...[false, false, false, false, false]
      ]
    })

    let results = await discoverActiveAddresses(seed, client)
    expect(client.addressesActive.postAddressesActive).toBeCalledTimes(1)
    expect(results).toHaveLength(0)
    mockedPostAddressesActive.mockClear()

    // Scenario 2:
    // The 5th address of group 0 is active.
    // The API should make an additional query to further investigate active addresses of group 0.
    // The function should return the 5th address of group 0.
    mockedPostAddressesActive
      .mockResolvedValueOnce({
        data: [
          ...[false, false, false, false, true],
          ...[false, false, false, false, false],
          ...[false, false, false, false, false],
          ...[false, false, false, false, false]
        ]
      })
      .mockResolvedValueOnce({
        data: [false, false, false, false, false]
      })

    results = await discoverActiveAddresses(seed, client)
    expect(client.addressesActive.postAddressesActive).toBeCalledTimes(2)
    expect(results).toHaveLength(1)
    expect(results.map((a) => a.address)).toContain(derivedAddresses.group0[4])
    mockedPostAddressesActive.mockClear()

    // Scenario 3:
    // The 5th and 8th addresses of group 0 and the 1st address of group 2 are active.
    // The API should make 2 additional queries to further investigate active addresses of group 0 and 1 additional for group 2.
    // The function should return the 5th and 8th addresses of group 0.
    mockedPostAddressesActive
      .mockResolvedValueOnce({
        // all groups, query 1
        data: [
          ...[false, false, false, false, true],
          ...[false, false, false, false, false],
          ...[true, false, false, false, false],
          ...[false, false, false, false, false]
        ]
      })
      // group 0, query 2
      .mockResolvedValueOnce({
        data: [false, false, true, false, false]
      })
      // group 0, query 3
      .mockResolvedValueOnce({
        data: [false, false, false]
      })
      // group 2, query 1
      .mockResolvedValueOnce({
        data: [false, false, false, false, false]
      })

    results = await discoverActiveAddresses(seed, client)
    expect(client.addressesActive.postAddressesActive).toBeCalledTimes(4)
    expect(results).toHaveLength(3)
    const addresses = results.map((a) => a.address)
    expect(addresses).toContain(derivedAddresses.group0[4])
    expect(addresses).toContain(derivedAddresses.group0[7])
    expect(addresses).toContain(derivedAddresses.group2[0])
    mockedPostAddressesActive.mockClear()
  })
})
