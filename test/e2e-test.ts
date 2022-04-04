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

import { CliqueClient } from '../lib/clique'
import { walletImport } from '../lib/wallet'

const mnemonic =
  'pilot ignore adjust ritual fiscal educate judge paper senior erosion protect expose knife transfer slim stage credit candy menu source maze bonus baby cage'
const baseUrl = 'http://127.0.0.1:22973'
const recipientAddress = '12ngYCQq7QPGEHAZSKQh5Ej9U9HqwkQyYFpVpoqkDpcmM'
const amount = '1000000000000000000'

describe('E2E tests', () => {
  let client = new CliqueClient()
  const wallet = walletImport(mnemonic)

  beforeAll(async () => {
    client = new CliqueClient({ baseUrl })
    await client.init(false)
  })

  it('can initialize client', () => {
    expect(client.baseUrl).toEqual(baseUrl)
  })

  it('can create a simple transaction', async () => {
    const { data, error } = await client.transactionCreate(wallet.address, wallet.publicKey, recipientAddress, amount)
    expect(error).toBeNull()
    expect(data.txId).toBeDefined()
    expect(data.unsignedTx).toBeDefined()
  })

  it('can create a transaction with custom gas amount and price', async () => {
    const gasAmount = 20001
    const gasPrice = '100000010000'

    const { data, error } = await client.transactionCreate(
      wallet.address,
      wallet.publicKey,
      recipientAddress,
      amount,
      undefined,
      gasAmount,
      gasPrice
    )
    expect(error).toBeNull()
    expect(data.gasAmount).toEqual(gasAmount)
    expect(data.gasPrice).toEqual(gasPrice)
  })

  it('can create sweep/consolidation transactions', async () => {
    const { data, error } = await client.transactionConsolidateUTXOs(wallet.publicKey, wallet.address, recipientAddress)
    expect(error).toBeNull()
    expect(data.unsignedTxs.length).toBeGreaterThan(0)
  })

  it('can sign transactions', async () => {
    const { data } = await client.transactionCreate(wallet.address, wallet.publicKey, recipientAddress, amount)
    const signature = client.transactionSign(data.txId, wallet.privateKey)
    expect(signature).toBeDefined()
  })

  it('can verify signatures', async () => {
    const { data } = await client.transactionCreate(wallet.address, wallet.publicKey, recipientAddress, amount)
    const signature = client.transactionSign(data.txId, wallet.privateKey)
    const isValid = client.transactionVerifySignature(data.txId, wallet.publicKey, signature)
    expect(isValid).toBeTruthy()
  })

  it('can send transactions', async () => {
    const { data } = await client.transactionCreate(wallet.address, wallet.publicKey, recipientAddress, amount)
    const signature = client.transactionSign(data.txId, wallet.privateKey)
    const result = await client.transactionSend(wallet.address, data.unsignedTx, signature)
    expect(result.error).toBeNull()
    expect(result.data.txId).toEqual(data.txId)
  })
})
