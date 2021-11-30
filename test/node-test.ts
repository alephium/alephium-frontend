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

import * as node from '../lib/node'
import balanceMockData from './fixtures/balance.json'
import transactionMockData from './fixtures/transaction.json'

describe('node', function () {
  const client = new node.NodeClient()

  it('should get the address balance', async () => {
    const mockedGetAddressesAddressBalance = jest.fn()
    client.addresses.getAddressesAddressBalance = mockedGetAddressesAddressBalance
    mockedGetAddressesAddressBalance.mockResolvedValue(balanceMockData)

    const balance = await client.getBalance('0x0')

    expect(client.addresses.getAddressesAddressBalance).toHaveBeenCalledTimes(1)
    expect(balance).toEqual(balanceMockData)
  })

  it('should build a transaction', async () => {
    const mockedPostTransactionsBuild = jest.fn()
    client.transactions.postTransactionsBuild = mockedPostTransactionsBuild
    mockedPostTransactionsBuild.mockResolvedValue({ data: transactionMockData.created })

    const transaction = await client.transactionCreate('fromPublicKey', 'toAddress', 'amount')

    expect(client.transactions.postTransactionsBuild).toHaveBeenCalledTimes(1)
    expect(client.transactions.postTransactionsBuild).toHaveBeenLastCalledWith({
      fromPublicKey: 'fromPublicKey',
      destinations: [{ address: 'toAddress', amount: 'amount', lockTime: undefined }]
    })
    expect(transaction).toEqual({ data: transactionMockData.created })
  })

  it('should submit a transaction', async () => {
    const mockedPostTransactionsSubmit = jest.fn()
    client.transactions.postTransactionsSubmit = mockedPostTransactionsSubmit
    mockedPostTransactionsSubmit.mockResolvedValue({ data: transactionMockData.submitted })

    const transaction = await client.transactionSend('tx', 'signature')

    expect(client.transactions.postTransactionsSubmit).toHaveBeenCalledTimes(1)
    expect(client.transactions.postTransactionsSubmit).toHaveBeenLastCalledWith({
      unsignedTx: 'tx',
      signature: 'signature'
    })
    expect(transaction).toEqual({ data: transactionMockData.submitted })
  })
})
