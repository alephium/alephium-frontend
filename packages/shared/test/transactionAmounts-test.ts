import { explorer as e } from '@alephium/web3'

import {
  calcTxAmountsDeltaForAddress,
  isAirdrop,
  isBidirectionalTransfer
} from '../src/transactions/transactionAmounts'

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

describe('calcTxAmountsDeltaForAddress', () => {
  describe('should throw error when transaction details are missing', () => {
    it('should throw error when inputs are missing', () => {
      const tx: e.Transaction = {
        ...mockTx,
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY }]
      }

      expect(() => calcTxAmountsDeltaForAddress(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should throw error when outputs are missing', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }]
      }

      expect(() => calcTxAmountsDeltaForAddress(tx, refAddress)).toThrow('Missing transaction details')
    })
  })

  describe('should handle self-transfer transactions (all addresses are same base address)', () => {
    it('should calculate fee when all addresses are the same', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should handle self-transfer with multiple inputs and outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED },
          { ...input, address: refAddress, attoAlphAmount: FIFTY }
        ],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: ONE_HUNDRED }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.tokenAmounts).toEqual([])
    })
  })

  describe('should calculate deltas for regular transactions', () => {
    it('should calculate positive ALPH delta when receiving ALPH', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should calculate negative ALPH delta when sending ALPH', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FIFTY }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should calculate token deltas when receiving tokens', () => {
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

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.tokenAmounts).toEqual([{ id: 'token-1', amount: BigInt(ONE) }])
    })

    it('should calculate token deltas when sending tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [{ ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.tokenAmounts).toEqual([{ id: 'token-1', amount: BigInt(`-${ONE}`) }])
    })

    it('should handle multiple token types', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...input, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-2', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-2', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.tokenAmounts).toEqual([
        { id: 'token-2', amount: BigInt(ONE) },
        { id: 'token-1', amount: BigInt(`-${ONE}`) }
      ])
    })

    it('should calculate net token deltas when both sending and receiving same token', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...input, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should filter out zero token deltas', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.tokenAmounts).toEqual([])
    })
  })

  describe('should handle edge cases', () => {
    it('should handle transactions with no inputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }]
      }

      expect(() => calcTxAmountsDeltaForAddress(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: []
      }

      expect(() => calcTxAmountsDeltaForAddress(tx, refAddress)).toThrow('Missing transaction details')
    })

    it('should handle inputs/outputs with undefined addresses', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: undefined, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.tokenAmounts).toEqual([])
    })
  })

  describe('should work with different transaction types', () => {
    it('should work with pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(pendingTx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should work with mempool transactions', () => {
      const mempoolTx: e.MempoolTransaction = {
        ...mockMempoolTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: addressOne, attoAlphAmount: FIFTY }]
      }

      const result = calcTxAmountsDeltaForAddress(mempoolTx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.tokenAmounts).toEqual([])
    })
  })
})
