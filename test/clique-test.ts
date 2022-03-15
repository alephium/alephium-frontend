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

import EC from 'elliptic'
import assert from 'assert'
import WS from 'jest-websocket-mock'

import { CliqueClient } from '../lib'

import selfCliqueMockData from './fixtures/self-clique.json'
import balanceMockData from './fixtures/balance.json'
import transactionMockData from './fixtures/transaction.json'
import addressMockData from './fixtures/address.json'

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

    const client = new CliqueClient()
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, txSig), true)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, unnormalizedSig), false)
    assert.strictEqual(client.transactionVerifySignature(txHash, pubKey, wrongSig), false)
  })

  it('should sign and verify signature', () => {
    const ec = new EC.ec('secp256k1')
    const key = ec.genKeyPair()
    const privateKey = key.getPrivate().toString('hex')
    const publicKey = key.getPublic().encode('hex', true)

    const client = new CliqueClient()
    const txHash = '8fc5f0d120b730f97f6cea5f02ae4a6ee7bf451d9261c623ea69d85e870201d2'
    const signature = client.transactionSign(txHash, privateKey)
    assert.strictEqual(client.transactionVerifySignature(txHash, publicKey, signature), true)
  })

  describe('', function () {
    const client = new CliqueClient()
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
      const client = new CliqueClient()
      const mockedGetInfosSelfClique = jest.fn()
      client.infos.getInfosSelfClique = mockedGetInfosSelfClique
      mockedGetInfosSelfClique.mockResolvedValue({
        data: {
          nodes: Array.from({ length: testCase.numberOfNodes }, () => ({ address: 'x', restPort: 'y' }))
        }
      })
      await client.init(testCase.numberOfNodes > 1)

      if (testCase.numberOfNodes > 0 && testCase.expectedIndexValues) {
        let index = client.getClientIndex('1DpNeY8uutS1FRW7D565WjUgu5HcKSYAMqZNWgUJWggWZ') // group of address: 0
        expect(index).toBe(testCase.expectedIndexValues[0])
        index = client.getClientIndex('12psscGPMgdqctaeCA37HYAkpVBFX1LbN4dSvjyxbDyKk') // group of address: 1
        expect(index).toBe(testCase.expectedIndexValues[1])
        index = client.getClientIndex('16TGLiD3fqyuGFRFHffh58BC3okYCbjRH1WHPzeSp39Wi') // group of address: 2
        expect(index).toBe(testCase.expectedIndexValues[2])
        index = client.getClientIndex('1G1gjpt4mxij7JwP5SpX6ScwQHisWN3V5WBtFfWKtc3vo') // group of address: 3
        expect(index).toBe(testCase.expectedIndexValues[3])
      } else {
        client.clients = []
        expect(() => client.getClientIndex(addressMockData.hash)).toThrow('No nodes in the clique')
      }
    })
  })

  describe('', () => {
    const client = new CliqueClient()
    const mockedGetInfosSelfClique = jest.fn()
    client.infos.getInfosSelfClique = mockedGetInfosSelfClique
    mockedGetInfosSelfClique.mockResolvedValue(selfCliqueMockData)

    beforeAll(() => {
      return client.init(false)
    })

    it('should get the balance of an address', async () => {
      const mockedGetBalance = jest.fn()
      client.clients[0].getBalance = mockedGetBalance
      mockedGetBalance.mockResolvedValue(balanceMockData)

      const balance = await client.getBalance(addressMockData.hash)

      expect(client.clients[0].getBalance).toHaveBeenCalledTimes(1)
      expect(balance).toEqual(balanceMockData)
    })

    it('should create a transaction', async () => {
      const mockedTransactionCreate = jest.fn()
      client.clients[0].transactionCreate = mockedTransactionCreate
      mockedTransactionCreate.mockResolvedValue({ data: transactionMockData.created })

      const transaction = await client.transactionCreate(
        '19XWyoWy6DjrRp7erWqPfBnh7HL1Sb2Ub8SVjux2d71Eb',
        '03d3400977a9dabf737714ce672dd60e3e74afc7f9d61fa6a6d74f3e2909f7dc00',
        '1CsutTzw8WVhqr1PB6F1tYinuLihAsAm9FxE7rVkC3Z2u',
        '100000000000000',
        undefined,
        20000,
        '1000000000'
      )

      expect(client.clients[0].transactionCreate).toHaveBeenCalledTimes(1)
      expect(transaction).toEqual({ data: transactionMockData.created })
    })

    it('should send a transaction', async () => {
      const mockedTransactionSend = jest.fn()
      client.clients[0].transactionSend = mockedTransactionSend
      mockedTransactionSend.mockResolvedValue({ data: transactionMockData.submitted })

      const transaction = await client.transactionSend(
        '19XWyoWy6DjrRp7erWqPfBnh7HL1Sb2Ub8SVjux2d71Eb',
        'tx',
        'signature'
      )

      expect(client.clients[0].transactionSend).toHaveBeenCalledTimes(1)
      expect(transaction).toEqual({ data: transactionMockData.submitted })
    })
  })
})
