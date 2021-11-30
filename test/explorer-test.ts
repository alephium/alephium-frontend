// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import * as explorer from '../lib/explorer'
import { addressTransactionsMockData, addressDetailsMockData } from './mocks/api-mock-data'

describe('explorer', function () {
  const client = new explorer.ExplorerClient()

  it('should get the transactions of the address', async () => {
    const mockedGetAddressesAddressTransactions = jest.fn()
    client.addresses.getAddressesAddressTransactions = mockedGetAddressesAddressTransactions
    mockedGetAddressesAddressTransactions.mockResolvedValue(addressTransactionsMockData)

    const transactions = await client.getAddressTransactions('0x0', 0)

    expect(client.addresses.getAddressesAddressTransactions).toHaveBeenCalledTimes(1)
    expect(client.addresses.getAddressesAddressTransactions).toHaveBeenCalledWith('0x0', { page: 0 })
    expect(transactions).toEqual(addressTransactionsMockData)
  })

  it('should get the details of the address', async () => {
    const mockedGetAddressesAddress = jest.fn()
    client.addresses.getAddressesAddress = mockedGetAddressesAddress
    mockedGetAddressesAddress.mockResolvedValue(addressDetailsMockData)

    const details = await client.getAddressDetails('0x0')

    expect(client.addresses.getAddressesAddress).toHaveBeenCalledTimes(1)
    expect(client.addresses.getAddressesAddress).toHaveBeenCalledWith('0x0')
    expect(details).toEqual(addressDetailsMockData)
  })
})
