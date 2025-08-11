import { explorer as e } from '@alephium/web3'

import { isAirdrop, isBidirectionalTransfer } from '@/transactions/transactionInfoType'

import { getTransactionInfoType } from '../src/transactions'
import transactions from './fixtures/transactions.json'

const ONE = '1000000000000000000'
const TWO = '2000000000000000000'
const THREE = '2000000000000000000'
const ONE_HUNDRED = '100000000000000000000'
const FORTY = '40000000000000000000'
const FIFTY = '50000000000000000000'
const SIXTY = '60000000000000000000'
const refAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const addressOne = '16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3'
const addressTwo = '3cUr7V1JE8Ct3d9eTm5gewMTN1BeF8TGVz4NkLY5Bbuijob9kFY2c'
const addressThr = '14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF'
const mockTx = {
  hash: 'test-hash',
  blockHash: 'test-block-hash',
  timestamp: 1234567890,
  scriptExecutionOk: true,
  coinbase: false,
  version: 1,
  networkId: 0,
  gasAmount: 1000,
  gasPrice: '100000000000'
}
const mockPendingTx = {
  hash: 'test-hash',
  chainFrom: 0,
  chainTo: 0,
  lastSeen: 1234567890,
  type: 'transfer',
  gasAmount: 1000,
  gasPrice: '100000000000'
}
const mockMempoolTx = {
  hash: 'test-hash',
  chainFrom: 0,
  chainTo: 0,
  lastSeen: 1234567890,
  gasAmount: 1000,
  gasPrice: '100000000000'
}
const input = {
  outputRef: { hint: 1, key: 'input-key-1' },
  unlockScript: 'unlock-script-1',
  txHashRef: 'input-tx-hash-1',
  contractInput: false
}
const outp = {
  hint: 1,
  key: 'output-key-1',
  spent: undefined,
  type: 'transfer',
  fixedOutput: false
}

describe('isAirdrop', () => {
  describe('should return false when reference address does not receive ALPH and tokens', () => {
    it('should return false when reference address receives no ALPH', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })

    it('should return false when reference address receives no tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED }]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })
  })

  describe('should return false when there are no output addresses without input addresses', () => {
    it('should return false when all output addresses are also input addresses', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: TWO }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })

    it('should return false when only reference address receives outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED }]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })
  })

  describe('should return false when output addresses receive different amounts', () => {
    it('should return false when other addresses receive different ALPH amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: TWO }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FORTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressTwo, attoAlphAmount: SIXTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: THREE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressTwo, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: TWO }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token IDs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: addressOne,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, attoAlphAmount: FIFTY, address: addressTwo, tokens: [{ id: 'token-2', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(false)
    })
  })

  describe('should return true for valid airdrop transactions', () => {
    it('should return true when multiple addresses receive identical amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: TWO }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, attoAlphAmount: FIFTY, address: addressTwo, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(true)
    })

    it('should return true for airdrop with multiple tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: addressOne,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: TWO },
              { id: 'token-2', amount: TWO }
            ]
          }
        ],
        outputs: [
          {
            ...outp,
            address: refAddress,
            attoAlphAmount: FIFTY,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          },
          {
            ...outp,
            attoAlphAmount: FIFTY,
            address: addressTwo,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(true)
    })

    it('should return true for airdrop to multiple recipients', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: THREE, tokens: [{ id: 'token-1', amount: THREE }] }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: ONE, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressTwo, attoAlphAmount: ONE, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressThr, attoAlphAmount: ONE, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(tx, refAddress)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, attoAlphAmount: FIFTY, address: addressTwo, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(() => isAirdrop(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: []
      }

      expect(() => isAirdrop(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: TWO }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, attoAlphAmount: FIFTY, address: addressTwo, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isAirdrop(pendingTx, refAddress)).toBe(true)
    })
  })
})

describe('isBidirectionalTransfer', () => {
  describe('should return false when all amounts are positive', () => {
    it('should return false when only ALPH amount is positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED }]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })

    it('should return false when only token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })

    it('should return false when both ALPH and token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })
  })

  describe('should return false when all amounts are negative', () => {
    it('should return false when only ALPH amount is negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FIFTY }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })

    it('should return false when only token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: refAddress, attoAlphAmount: FIFTY }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })

    it('should return false when both ALPH and token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: refAddress, attoAlphAmount: FIFTY }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })
  })

  describe('should return false when there are no amount deltas', () => {
    it('should return false when ALPH delta is zero and no tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY }]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })

    it('should return false when ALPH delta is zero and tokens delta is zero', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(false)
    })
  })

  describe('should return true for bidirectional transfers', () => {
    it('should return true when ALPH amount is positive and token amount is negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(true)
    })

    it('should return true when ALPH amount is negative and token amount is positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED },
          { ...input, address: addressOne, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(true)
    })

    it('should return true when ALPH amount is positive and some token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: refAddress,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          },
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-2', amount: TWO }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(true)
    })

    it('should return true when ALPH amount is negative and some token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED },
          {
            ...input,
            address: addressOne,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-2', amount: TWO }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(true)
    })

    it('should return true when some token amounts are positive and some are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: refAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          },
          { ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-3', amount: ONE }] }
        ],
        outputs: [
          {
            ...outp,
            address: refAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE },
              { id: 'token-3', amount: ONE }
            ]
          },
          { ...outp, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-2', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(tx, refAddress)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(() => isAirdrop(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: []
      }

      expect(() => isAirdrop(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(pendingTx, refAddress)).toBe(false)
    })

    it('should handle mempool transactions', () => {
      const mempoolTx: e.MempoolTransaction = {
        ...mockMempoolTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(isBidirectionalTransfer(mempoolTx, refAddress)).toBe(false)
    })
  })
})

const expectExplorerGrouplessAddressPage = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType({
      tx,
      referenceAddress,
      internalAddresses: []
    })
  )

const expectExplorerGroupedAddressPage = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType({
      tx,
      referenceAddress,
      internalAddresses: []
    })
  )

const expectWalletAddressModal = expectExplorerGroupedAddressPage
const expectExplorerGrouplessSubaddressPage = expectExplorerGroupedAddressPage
const expectWalletActivityScreenWithSingleAddressAsInternal = (tx: e.Transaction, referenceAddress: string) =>
  expect(
    getTransactionInfoType({
      tx,
      referenceAddress,
      internalAddresses: [referenceAddress]
    })
  )

const makeExpectWalletActivityScreenWithAllAddressesAsInternal =
  (address1: string, address2: string) => (tx: e.Transaction, referenceAddress: string) =>
    expect(
      getTransactionInfoType({
        tx,
        referenceAddress,
        internalAddresses: [address1, address2]
      })
    )

// grouped address A to groupless subaddress B:X
// https://testnet.alephium.org/transactions/13b9b04bfffed88dddb00001cfc6daaea997ab6fc69f3bf071198b7a44f9127e
it('should get the correct transaction type for grouped to groupless address transfer', () => {
  const tx = transactions.transferFromGroupedToGroupless as e.Transaction
  const fromGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'
  const toGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const toGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGroupedAddress,
    toGrouplessAddress
  )

  expectWalletAddressModal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGrouplessAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGrouplessAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGroupedAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGrouplessAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, fromGroupedAddress).toEqual('outgoing')
  expectExplorerGrouplessAddressPage(tx, toGrouplessAddress).toEqual('incoming')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress).toEqual('incoming')
})

// groupless subaddress A:X to groupless subaddress A:Y
// https://testnet.alephium.org/transactions/8addfdaf65b6c4625790e00719e1fcc5fe97a437ea92969b8b97795d207eb409
it('should get the correct transaction type for groupless internal group transfer', () => {
  const tx = transactions.transferFromGrouplessToSameGrouplessDifferentSubaddress as e.Transaction
  const grouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const fromGrouplessSubaddress1 = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGrouplessSubaddress2 = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:1'

  expectWalletAddressModal(tx, grouplessAddress).toEqual('address-group-transfer')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, grouplessAddress).toEqual('address-group-transfer')

  expectExplorerGrouplessAddressPage(tx, grouplessAddress).toEqual('address-group-transfer')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress1).toEqual('address-group-transfer')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress2).toEqual('address-group-transfer')
})

// groupless subaddress A:X to grouped address B
// https://testnet.alephium.org/transactions/0c7b62713ab0423fca296f1da75f99f78472ad121d9c5f7d45137f0d9a9b97ab
it('should get the correct transaction type for groupless to grouped address transfer', () => {
  const tx = transactions.transfeFromGrouplessToGrouped as e.Transaction
  const fromGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const fromGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGrouplessAddress,
    toGroupedAddress
  )

  expectWalletAddressModal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGroupedAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGroupedAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGrouplessAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGroupedAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, toGroupedAddress).toEqual('incoming')
  expectExplorerGrouplessAddressPage(tx, fromGrouplessAddress).toEqual('outgoing')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress).toEqual('outgoing')
})

// groupless subaddress A:X to groupless subaddress B:Y
// https://testnet.alephium.org/transactions/c3fdb69b0c21fbad14d438eee2d68a0234c23b7038a79f2657cdbf2379d3f5c1
it('should get the correct transaction type for groupless to different groupless address transfer', () => {
  const tx = transactions.transferFromGrouplessToDifferentGroupless as e.Transaction
  const fromGrouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const toGrouplessAddress = '3cUt1QzEpcqsbTxrBfxTas6iXzNdWqnoAKeeXpsuai4cHoG5N4ZND'
  const fromGrouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:3'
  const toGrouplessSubaddress = '3cUt1QzEpcqsbTxrBfxTas6iXzNdWqnoAKeeXpsuai4cHoG5N4ZND:2'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGrouplessAddress,
    toGrouplessAddress
  )

  expectWalletAddressModal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGrouplessAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGrouplessAddress).toEqual('outgoing')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, toGrouplessAddress).toEqual('incoming')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGrouplessAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGrouplessAddress).toEqual('wallet-self-transfer')

  expectExplorerGrouplessAddressPage(tx, fromGrouplessAddress).toEqual('outgoing')
  expectExplorerGrouplessAddressPage(tx, toGrouplessAddress).toEqual('incoming')
  expectExplorerGrouplessSubaddressPage(tx, fromGrouplessSubaddress).toEqual('outgoing')
  expectExplorerGrouplessSubaddressPage(tx, toGrouplessSubaddress).toEqual('incoming')
})

it('should get the correct transaction type for grouped to the different grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToDifferentGrouped as e.Transaction
  const fromGroupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'
  const toGroupedAddress = '1ChU9K7vgDak4rLVY1DsNqE5E3tpABYPHaWSo9CFuJayb'

  const expectWalletActivityScreenWithAllAddressesAsInternal = makeExpectWalletActivityScreenWithAllAddressesAsInternal(
    fromGroupedAddress,
    toGroupedAddress
  )

  expectWalletAddressModal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletAddressModal(tx, toGroupedAddress).toEqual('incoming')

  expectWalletActivityScreenWithSingleAddressAsInternal(tx, fromGroupedAddress).toEqual('outgoing')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, fromGroupedAddress).toEqual('wallet-self-transfer')
  expectWalletActivityScreenWithAllAddressesAsInternal(tx, toGroupedAddress).toEqual('wallet-self-transfer')

  expectExplorerGroupedAddressPage(tx, fromGroupedAddress).toEqual('outgoing')
  expectExplorerGroupedAddressPage(tx, toGroupedAddress).toEqual('incoming')
})

it('should get the correct transaction type for grouped to the same grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToSameGrouped as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('address-self-transfer')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('address-self-transfer')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('address-self-transfer')
})

it('should get the correct transaction type for groupless to the same groupless same subaddress transfer', () => {
  const tx = transactions.transferFromGrouplessToSameGrouplessSameSubaddress as e.Transaction
  const grouplessAddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU'
  const grouplessSubaddress = '3cUqXKSg1iw7hgv4dRgR1VNFhqXSwNSNMnBC6om2A2UkZM4TYTNUU:1'

  expectWalletAddressModal(tx, grouplessAddress).toEqual('address-self-transfer')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, grouplessAddress).toEqual('address-self-transfer')
  expectExplorerGrouplessAddressPage(tx, grouplessAddress).toEqual('address-self-transfer')
  expectExplorerGrouplessSubaddressPage(tx, grouplessSubaddress).toEqual('address-self-transfer')
})

it('should get the correct transaction type for grouped to contract transfer', () => {
  const tx = transactions.transferFromGroupedToContract as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('dApp')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('dApp')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('dApp')
})

it('should get the correct transaction type for contract to grouped address transfer', () => {
  const tx = transactions.transferFromGroupedToContractToGrouped as e.Transaction
  const groupedAddress = '1DZiFFX6fnSHuLnnmtBMUWeELWvnhRudYfzb17HYuV9aW'

  expectWalletAddressModal(tx, groupedAddress).toEqual('bidirectional-transfer')
  expectWalletActivityScreenWithSingleAddressAsInternal(tx, groupedAddress).toEqual('bidirectional-transfer')
  expectExplorerGroupedAddressPage(tx, groupedAddress).toEqual('bidirectional-transfer')
})
