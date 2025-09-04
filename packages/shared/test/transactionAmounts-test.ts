import { explorer as e } from '@alephium/web3'

import {
  addressHasOnlyNegativeAmountDeltas,
  addressHasOnlyPositiveAmountDeltas,
  calcTxAmountsDeltaForAddress
} from '../src/transactions/transactionAmounts'
import transactions from './fixtures/transactions.json'

const ONE = '1000000000000000000'
const ONE_HUNDRED = '100000000000000000000'
const FORTY_NINE = '49000000000000000000'
const FIFTY = '50000000000000000000'
const NINENTY_NINE = '99000000000000000000'
const refAddress = '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH'
const addressOne = '16VPvbF1ShQsj8TappJWtoW6gRM1AEQXYqwo5rQ7BiAy3'
const mockTx = {
  hash: 'test-hash',
  blockHash: 'test-block-hash',
  timestamp: 1234567890,
  scriptExecutionOk: true,
  coinbase: false,
  version: 1,
  networkId: 0,
  gasAmount: 1000,
  gasPrice: '1000000000000000'
}
const mockPendingTx = {
  hash: 'test-hash',
  chainFrom: 0,
  chainTo: 0,
  lastSeen: 1234567890,
  type: 'transfer',
  gasAmount: 1000,
  gasPrice: '1000000000000000'
}
const mockMempoolTx = {
  hash: 'test-hash',
  chainFrom: 0,
  chainTo: 0,
  lastSeen: 1234567890,
  gasAmount: 1000,
  gasPrice: '1000000000000000'
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

describe('calcTxAmountsDeltaForAddress', () => {
  describe('when something is missing', () => {
    it('should return zero amounts when inputs are missing', () => {
      const tx: e.Transaction = {
        ...mockTx,
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FIFTY }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.tokenAmounts).toEqual([])
      expect(result.fee).toBe(BigInt(ONE))
    })

    it('should return zero amounts when outputs are missing', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FORTY_NINE}`))
      expect(result.tokenAmounts).toEqual([])
      expect(result.fee).toBe(BigInt(ONE))
    })
  })

  describe('should handle self-transfer transactions (all addresses are same base address)', () => {
    it('should calculate fee when all addresses are the same', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should handle self-transfer with multiple inputs and outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: FIFTY },
          { ...input, address: refAddress, attoAlphAmount: FIFTY }
        ],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: NINENTY_NINE }]
      }

      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.fee).toBe(BigInt(ONE))
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
          { ...outp, address: addressOne, attoAlphAmount: FORTY_NINE }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should calculate negative ALPH delta when sending ALPH', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FIFTY}`))
      expect(result.fee).toBe(BigInt(ONE))
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
          { ...outp, address: addressOne, attoAlphAmount: FORTY_NINE }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([{ id: 'token-1', amount: BigInt(ONE) }])
    })

    it('should calculate token deltas when sending tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FORTY_NINE}`))
      expect(result.fee).toBe(BigInt(ONE))
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
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-2', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.fee).toBe(BigInt(ONE))
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
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should filter out zero token deltas', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(0))
      expect(result.fee).toBe(BigInt(ONE))
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
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.tokenAmounts).toEqual([])
    })
    it('should handle transactions with no outputs', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: []
      }
      const result = calcTxAmountsDeltaForAddress(tx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FORTY_NINE}`))
      expect(result.tokenAmounts).toEqual([])
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
          { ...outp, address: addressOne, attoAlphAmount: FORTY_NINE }
        ]
      }

      const result = calcTxAmountsDeltaForAddress(pendingTx, refAddress)
      expect(result.alphAmount).toBe(BigInt(FIFTY))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([])
    })

    it('should work with mempool transactions', () => {
      const mempoolTx: e.MempoolTransaction = {
        ...mockMempoolTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: addressOne, attoAlphAmount: FORTY_NINE }]
      }

      const result = calcTxAmountsDeltaForAddress(mempoolTx, refAddress)
      expect(result.alphAmount).toBe(BigInt(`-${FORTY_NINE}`))
      expect(result.fee).toBe(BigInt(ONE))
      expect(result.tokenAmounts).toEqual([])
    })
  })
})

it('should calculate the amount delta between the inputs and outputs of an address in a transaction', () => {
  expect(
    calcTxAmountsDeltaForAddress(transactions.oneInputOneOutput, transactions.oneInputOneOutput.inputs[0].address)
      .alphAmount
  ).toEqual(BigInt('-49993194000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsOneOutput, transactions.twoInputsOneOutput.inputs[0].address)
        .alphAmount
    ).toEqual(BigInt('-149993194000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsZeroOutput, transactions.twoInputsZeroOutput.inputs[0].address)
        .alphAmount
    ).toEqual(BigInt('-199993194000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.missingInputs, transactions.missingInputs.outputs[0].address).alphAmount
    ).toEqual(BigInt('150000000000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.missingOutputs, transactions.missingOutputs.inputs[0].address)
        .alphAmount
    ).toEqual(BigInt('-199993194000000000000'))
})

describe('addressHasOnlyNegativeAmountDeltas and addressHasOnlyPositiveAmountDeltas', () => {
  describe('when there are no amount deltas', () => {
    it('when no ALPH delta and no token deltas', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: FIFTY }],
        outputs: [{ ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(false)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })
  })

  describe('when only ALPH delta is negative', () => {
    it('when ALPH amount is negative and no tokens', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })

    it('when ALPH amount is negative and tokens delta is zero', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })
  })

  describe('when only token deltas are negative', () => {
    it('when no ALPH delta and tokens are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...input, address: addressOne, attoAlphAmount: FIFTY }
        ],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })
  })

  describe('when both ALPH and token deltas are negative', () => {
    it('when ALPH is negative and tokens are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED, tokens: [{ id: 'token-1', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })

    it('when ALPH is negative and multiple tokens are negative', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          {
            ...input,
            address: refAddress,
            attoAlphAmount: ONE_HUNDRED,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          }
        ],
        outputs: [
          {
            ...outp,
            address: addressOne,
            attoAlphAmount: FIFTY,
            tokens: [
              { id: 'token-1', amount: ONE },
              { id: 'token-2', amount: ONE }
            ]
          },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })
  })

  describe('when there are positive deltas', () => {
    it('when ALPH is positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FIFTY },
          { ...outp, address: addressOne, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(false)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(true)
    })

    it('when tokens are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [{ ...input, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(false)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(true)
    })

    it('when some tokens are positive', () => {
      const tx: e.Transaction = {
        ...mockTx,
        inputs: [
          { ...input, address: refAddress, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] },
          { ...input, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-2', amount: ONE }] }
        ],
        outputs: [
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE, tokens: [{ id: 'token-2', amount: ONE }] },
          { ...outp, address: addressOne, attoAlphAmount: FIFTY, tokens: [{ id: 'token-1', amount: ONE }] }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(tx, refAddress)).toBe(false)
      expect(addressHasOnlyPositiveAmountDeltas(tx, refAddress)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle pending transactions', () => {
      const pendingTx: e.PendingTransaction = {
        ...mockPendingTx,
        inputs: [{ ...input, address: refAddress, attoAlphAmount: ONE_HUNDRED }],
        outputs: [
          { ...outp, address: addressOne, attoAlphAmount: FIFTY },
          { ...outp, address: refAddress, attoAlphAmount: FORTY_NINE }
        ]
      }

      expect(addressHasOnlyNegativeAmountDeltas(pendingTx, refAddress)).toBe(true)
      expect(addressHasOnlyPositiveAmountDeltas(pendingTx, refAddress)).toBe(false)
    })
  })
})
