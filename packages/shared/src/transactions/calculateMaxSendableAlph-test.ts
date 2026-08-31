import { node } from '@alephium/web3'
import { describe, expect, it } from 'vitest'

import { calculateMaxSendableAlph } from './calculateMaxSendableAlph'

const utxo = (amount: string, opts: Partial<node.UTXO> = {}): node.UTXO => ({
  ref: { hint: 0, key: 'ref' },
  amount,
  ...opts
})

const ONE_ALPH = 10n ** 18n
const DUST = ONE_ALPH / 1000n
const FEE = ONE_ALPH / 500n // 0.002 ALPH, matches MINIMAL_GAS_AMOUNT * MINIMAL_GAS_PRICE
const NOW = 1_700_000_000_000
const IN_THE_PAST = NOW - 60_000
const IN_THE_FUTURE = NOW + 60_000

describe('calculateMaxSendableAlph', () => {
  it('subtracts only the fee when the address has no token-holding UTXOs', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 10n * ONE_ALPH,
      utxos: [utxo((10n * ONE_ALPH).toString())],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(10n * ONE_ALPH - FEE)
  })

  it('reserves the full ALPH amount of a token-holding UTXO', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 10n * ONE_ALPH,
      utxos: [
        utxo((10n * ONE_ALPH - DUST).toString()),
        utxo(DUST.toString(), { tokens: [{ id: 'tok', amount: '100' }] })
      ],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(10n * ONE_ALPH - DUST - FEE)
  })

  it('sums the reserved ALPH across every token-holding UTXO', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 10n * ONE_ALPH,
      utxos: [
        utxo((5n * ONE_ALPH).toString()),
        utxo((2n * ONE_ALPH).toString(), { tokens: [{ id: 'a', amount: '1' }] }),
        utxo((3n * ONE_ALPH).toString(), {
          tokens: [
            { id: 'b', amount: '2' },
            { id: 'c', amount: '3' }
          ]
        })
      ],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(10n * ONE_ALPH - 2n * ONE_ALPH - 3n * ONE_ALPH - FEE)
  })

  it('treats a UTXO with an empty tokens array as pure ALPH', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 5n * ONE_ALPH,
      utxos: [utxo((5n * ONE_ALPH).toString(), { tokens: [] })],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(5n * ONE_ALPH - FEE)
  })

  it('skips locked token-holding UTXOs because their ALPH is not in availableBalance', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 5n * ONE_ALPH,
      utxos: [
        utxo((5n * ONE_ALPH).toString()),
        utxo((2n * ONE_ALPH).toString(), {
          tokens: [{ id: 'tok', amount: '1' }],
          lockTime: IN_THE_FUTURE
        })
      ],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(5n * ONE_ALPH - FEE)
  })

  it('treats a token-holding UTXO whose lockTime has passed as unlocked', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 5n * ONE_ALPH,
      utxos: [
        utxo((3n * ONE_ALPH).toString()),
        utxo((2n * ONE_ALPH).toString(), {
          tokens: [{ id: 'tok', amount: '1' }],
          lockTime: IN_THE_PAST
        })
      ],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(5n * ONE_ALPH - 2n * ONE_ALPH - FEE)
  })

  it('clamps to zero when the trapped amount plus fee exceeds availableBalance', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: ONE_ALPH,
      utxos: [utxo((2n * ONE_ALPH).toString(), { tokens: [{ id: 'tok', amount: '1' }] })],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(0n)
  })

  it('returns availableBalance minus fee when the UTXO list is empty', () => {
    const result = calculateMaxSendableAlph({
      availableBalance: 3n * ONE_ALPH,
      utxos: [],
      feeEstimate: FEE,
      now: NOW
    })

    expect(result).toBe(3n * ONE_ALPH - FEE)
  })
})
