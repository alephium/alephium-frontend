import { explorer as e } from '@alephium/web3'

import { isAirdrop } from '../src/transactions/transactionAmounts'

describe('isAirdrop', () => {
  const mockReferenceAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
  const mockOtherAddress1 = '16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3'
  const mockOtherAddress2 = '3cUr7V1JE8Ct3d9eTm5gewMTN1BeF8TGVz4NkLY5Bbuijob9kFY2c'
  const mockTxPartial = {
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
  const mockInputPartial = {
    outputRef: { hint: 1, key: 'input-key-1' },
    unlockScript: 'unlock-script-1',
    txHashRef: 'input-tx-hash-1',
    attoAlphAmount: '100000000000000000000',
    contractInput: false
  }
  const mockOutput1Partial = {
    hint: 1,
    key: 'output-key-1',
    attoAlphAmount: '50000000000000000000',
    spent: undefined,
    type: 'transfer',
    fixedOutput: false
  }
  const mockOutput2Partial = {
    hint: 2,
    key: 'output-key-2',
    attoAlphAmount: '50000000000000000000',
    spent: undefined,
    type: 'transfer',
    fixedOutput: false
  }

  describe('should return false when reference address does not receive ALPH and tokens', () => {
    it('should return false when reference address receives no ALPH', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            address: mockOtherAddress1,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })

    it('should return false when reference address receives no tokens', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            attoAlphAmount: '100000000000000000000',
            address: mockReferenceAddress
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })
  })

  describe('should return false when there are no output addresses without input addresses', () => {
    it('should return false when all output addresses are also input addresses', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            address: mockOtherAddress1,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })

    it('should return false when only reference address receives outputs', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            attoAlphAmount: '100000000000000000000',
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })
  })

  describe('should return false when output addresses receive different amounts', () => {
    it('should return false when other addresses receive different ALPH amounts', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '60000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token amounts', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '2000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token IDs', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-2', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })
  })

  describe('should return true for valid airdrop transactions', () => {
    it('should return true when multiple addresses receive identical amounts', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(true)
    })

    it('should return true for airdrop with multiple tokens', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [
              { id: 'token-1', amount: '1000000000000000000' },
              { id: 'token-2', amount: '2000000000000000000' }
            ]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [
              { id: 'token-1', amount: '1000000000000000000' },
              { id: 'token-2', amount: '2000000000000000000' }
            ]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(true)
    })

    it('should return true for airdrop to multiple recipients', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            hint: 3,
            key: 'output-key-3',
            attoAlphAmount: '50000000000000000000',
            address: '14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF',
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(true)
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTxPartial,
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: []
      }

      expect(isAirdrop(tx, mockReferenceAddress)).toBe(false)
    })

    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        hash: 'test-hash',
        chainFrom: 0,
        chainTo: 0,
        lastSeen: 1234567890,
        type: 'transfer',
        gasAmount: 1000,
        gasPrice: '100000000000',
        inputs: [{ ...mockInputPartial, address: mockOtherAddress1 }],
        outputs: [
          {
            ...mockOutput1Partial,
            address: mockReferenceAddress,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          },
          {
            ...mockOutput2Partial,
            attoAlphAmount: '50000000000000000000',
            address: mockOtherAddress2,
            tokens: [{ id: 'token-1', amount: '1000000000000000000' }]
          }
        ]
      }

      expect(isAirdrop(pendingTx, mockReferenceAddress)).toBe(true)
    })
  })
})
