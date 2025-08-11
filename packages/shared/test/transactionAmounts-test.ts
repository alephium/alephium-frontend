import { explorer as e } from '@alephium/web3'

import { isAirdrop, isBidirectionalTransfer } from '../src/transactions/transactionAmounts'

const ONE = '1000000000000000000'
const TWO = '2000000000000000000'
const THREE = '2000000000000000000'
const ONE_HUNDRED = '100000000000000000000'
const FORTY = '40000000000000000000'
const FIFTY = '50000000000000000000'
const SIXTY = '60000000000000000000'
const referenceAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const otherAddress1 = '16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3'
const otherAddress2 = '3cUr7V1JE8Ct3d9eTm5gewMTN1BeF8TGVz4NkLY5Bbuijob9kFY2c'
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
const input = {
  outputRef: { hint: 1, key: 'input-key-1' },
  unlockScript: 'unlock-script-1',
  txHashRef: 'input-tx-hash-1',
  contractInput: false
}
const output = {
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
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })

    it('should return false when reference address receives no tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return false when there are no output addresses without input addresses', () => {
    it('should return false when all output addresses are also input addresses', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })

    it('should return false when only reference address receives outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return false when output addresses receive different amounts', () => {
    it('should return false when other addresses receive different ALPH amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: TWO }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FORTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress2,
            attoAlphAmount: SIXTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: THREE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [{ id: 'token-1', amount: TWO }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })

    it('should return false when other addresses receive different token IDs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [{ id: 'token-2', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return true for valid airdrop transactions', () => {
    it('should return true when multiple addresses receive identical amounts', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: TWO }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(true)
    })

    it('should return true for airdrop with multiple tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: TWO },
              { id: 'token-2', amount: TWO }
            ]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(true)
    })

    it('should return true for airdrop to multiple recipients', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: THREE,
            tokens: [{ id: 'token-1', amount: THREE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: ONE,
            address: otherAddress2,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: ONE,
            address: '14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF',
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(true)
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: []
      }

      expect(isAirdrop(tx, referenceAddress)).toBe(false)
    })

    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: TWO }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            attoAlphAmount: FIFTY,
            address: otherAddress2,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isAirdrop(pendingTx, referenceAddress)).toBe(true)
    })
  })
})

// ... existing code ...

describe('isBidirectionalTransfer', () => {
  describe('should return false when all amounts are positive', () => {
    it('should return false when only ALPH amount is positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should return false when only token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should return false when both ALPH and token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return false when all amounts are negative', () => {
    it('should return false when only ALPH amount is negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY
          },
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should return false when only token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should return false when both ALPH and token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return false when there are no amount deltas', () => {
    it('should return false when ALPH delta is zero and no tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should return false when ALPH delta is zero and tokens delta is zero', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })
  })

  describe('should return true for bidirectional transfers', () => {
    it('should return true when ALPH amount is positive and token amount is negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(true)
    })

    it('should return true when ALPH amount is negative and token amount is positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          },
          {
            ...input,
            address: otherAddress1,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY
          },
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(true)
    })

    it('should return true when ALPH amount is positive and some token amounts are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          },
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-2', amount: TWO }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(true)
    })

    it('should return true when ALPH amount is negative and some token amounts are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED
          },
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-2', amount: TWO }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(true)
    })

    it('should return true when some token amounts are positive and some are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: TWO }
            ]
          },
          {
            ...input,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-3', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE },
              { id: 'token-3', amount: ONE }
            ]
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-2', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: []
      }

      expect(isBidirectionalTransfer(tx, referenceAddress)).toBe(false)
    })

    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: referenceAddress,
            attoAlphAmount: FIFTY
          },
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: FIFTY,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(pendingTx, referenceAddress)).toBe(false)
    })

    it('should handle mempool transactions', () => {
      const mempoolTx: e.MempoolTransaction = {
        hash: 'test-hash',
        chainFrom: 0,
        chainTo: 0,
        lastSeen: 1234567890,
        gasAmount: 1000,
        gasPrice: '100000000000',
        inputs: [
          {
            ...input,
            address: referenceAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ],
        outputs: [
          {
            ...output,
            address: otherAddress1,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [{ id: 'token-1', amount: ONE }]
          }
        ]
      }

      expect(isBidirectionalTransfer(mempoolTx, referenceAddress)).toBe(false)
    })
  })
})
