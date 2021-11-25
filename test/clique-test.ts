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

import * as clique from '../dist/lib/clique'

import EC from 'elliptic'
import assert from 'assert'
import WS from 'jest-websocket-mock'

import selfCliqueMockData from './self-clique.json'
import {
  balanceMockData,
  transactionCreatedMockData,
  transactionSubmittedMockData,
  errorMockData
} from './mocks/api-mock-data'

describe('clique', function () {
  it('should verify signature', () => {
    const txHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const pubKey = '02625b26ae1c5f7986475009e4037b3e6fe6320fde3c3f3332bea11ecadc35dd13'
    const txSig =
      '78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc'
    const unnormalizedSig =
      '78471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9cbd24040b318c14973a1f299edd14da2bcecd0d48775953ec71582fb97254ff85'
    const wrongSig =
      '88471e7c97e558c98ac307ef699ed535ece319102fc69ea416dbb44fbb3cbf9c42dbfbf4ce73eb68c5e0d66122eb25d2ebe1cf9e37ef4c4f4e7a2ed35de141bc'

    const client = new clique.CliqueClient()
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, txSig), true)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, unnormalizedSig), false)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, wrongSig), false)
  })

  it('should sign and verify signature', () => {
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex')
    const publicKey = key.getPublic().encode('hex', true)

    const client = new clique.CliqueClient()
    const txHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const signature = client.transactionSign(txHash, privateKey)
    assert.strictEqual(client.transactionVerifySignature(txHash, publicKey, signature), true)
  })

  describe('', function () {
    const client = new clique.CliqueClient()
    const mockedGetInfosSelfClique = jest.fn()
    client.infos.getInfosSelfClique = mockedGetInfosSelfClique
    mockedGetInfosSelfClique.mockResolvedValue(selfCliqueMockData)

    it('should return information about the self clique', async () => {
      const info = await client.selfClique()
      expect(client.infos.getInfosSelfClique).toHaveBeenCalledTimes(1)
      expect(info).toEqual(selfCliqueMockData)
    })

    it('should create a single node client', async () => {
      const isMultiNodesClique = false

      await client.init(isMultiNodesClique)
      expect(client.clients.length).toBe(1)
      expect(client.clients[0].baseUrl).toBe(client.baseUrl)
    })

    it('should create multiple node clients', async () => {
      const isMultiNodesClique = true

      await client.init(isMultiNodesClique)
      expect(client.clients[0].baseUrl).toBe('http://127.0.0.1:12973')
    })

    it("should return a websocket to the clique's node", async () => {
      await client.init(true)

      new WS('ws://127.0.0.1:11973/events')
      const websocket = await client.getWebSocket(0)
      expect(websocket?.url).toBe('ws://127.0.0.1:11973/events')
    })
  })

  it('should get the correct index of the clique', async () => {
    const testCases = [
      {
        numberOfNodes: 1,
        expectedIndexValues: [0, 0, 0, 0]
      },
      {
        numberOfNodes: 2,
        expectedIndexValues: [0, 1, 0, 1]
      },
      {
        numberOfNodes: 3,
        expectedIndexValues: [0, 1, 2, 0]
      },
      {
        numberOfNodes: 4,
        expectedIndexValues: [0, 1, 2, 3]
      },
      {
        numberOfNodes: 0
      }
    ]

    testCases.forEach(async (testCase) => {
      const client = new clique.CliqueClient()
      const mockedGetInfosSelfClique = jest.fn()
      client.infos.getInfosSelfClique = mockedGetInfosSelfClique
      mockedGetInfosSelfClique.mockResolvedValue({
        data: {
          nodes: Array.from({ length: testCase.numberOfNodes }, () => ({ address: 'x', restPort: 'y' }))
        }
      })
      await client.init(testCase.numberOfNodes > 1)

      if (testCase.numberOfNodes > 0 && testCase.expectedIndexValues) {
        const mockedGetAddressesAddressGroup = jest.fn()
        client.addresses.getAddressesAddressGroup = mockedGetAddressesAddressGroup
        mockedGetAddressesAddressGroup
          .mockResolvedValueOnce({ data: { group: 0 } })
          .mockResolvedValueOnce({ data: { group: 1 } })
          .mockResolvedValueOnce({ data: { group: 2 } })
          .mockResolvedValueOnce({ data: { group: 3 } })

        let index = await client.getClientIndex('0x0')
        expect(index).toBe(testCase.expectedIndexValues[0])
        index = await client.getClientIndex('0x0')
        expect(index).toBe(testCase.expectedIndexValues[1])
        index = await client.getClientIndex('0x0')
        expect(index).toBe(testCase.expectedIndexValues[2])
        index = await client.getClientIndex('0x0')
        expect(index).toBe(testCase.expectedIndexValues[3])
      } else {
        client.clients = []
        expect(client.getClientIndex('0x0')).rejects.toEqual(new Error('Unknown error (no nodes in the clique)'))
      }
    })
  })

  describe('', () => {
    const client = new clique.CliqueClient()
    const mockedGetInfosSelfClique = jest.fn()
    client.infos.getInfosSelfClique = mockedGetInfosSelfClique
    mockedGetInfosSelfClique.mockResolvedValue(selfCliqueMockData)
    const mockedGetAddressesAddressGroup = jest.fn()
    client.addresses.getAddressesAddressGroup = mockedGetAddressesAddressGroup
    mockedGetAddressesAddressGroup.mockResolvedValue({ data: { group: 0 } })

    beforeAll(() => {
      return client.init(false)
    })

    it('should get the balance of an address', async () => {
      const mockedGetBalance = jest.fn()
      client.clients[0].getBalance = mockedGetBalance
      mockedGetBalance.mockResolvedValue(balanceMockData)

      const balance = await client.getBalance('0x0')

      expect(client.clients[0].getBalance).toHaveBeenCalledTimes(1)
      expect(balance).toEqual(balanceMockData)
    })

    it('should create a transaction', async () => {
      const mockedTransactionCreate = jest.fn()
      client.clients[0].transactionCreate = mockedTransactionCreate
      mockedTransactionCreate.mockResolvedValue(transactionCreatedMockData)

      const transaction = await client.transactionCreate('fromAddress', 'fromKey', 'toAdress', 'amount')

      expect(client.clients[0].transactionCreate).toHaveBeenCalledTimes(1)
      expect(transaction).toEqual(transactionCreatedMockData)
    })

    it('should send a transaction', async () => {
      const mockedTransactionSend = jest.fn()
      client.clients[0].transactionSend = mockedTransactionSend
      mockedTransactionSend.mockResolvedValue(transactionSubmittedMockData)

      const transaction = await client.transactionSend('fromAddress', 'tx', 'signature')

      expect(client.clients[0].transactionSend).toHaveBeenCalledTimes(1)
      expect(transaction).toEqual(transactionSubmittedMockData)
    })
  })
})
