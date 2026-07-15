import { explorer } from '@alephium/web3'

import { computeConfirmations } from './confirmations'

const blockAtHeight = (height: number): explorer.BlockEntryLite => ({
  hash: '0000000000000000000000000000000000000000000000000000000000000001',
  timestamp: 1784035982281,
  chainFrom: 0,
  chainTo: 1,
  height,
  txNumber: 1,
  mainChain: true,
  hashRate: '5175173459918688'
})

const chainAtHeight = (height: number): explorer.PerChainHeight => ({
  chainFrom: 0,
  chainTo: 1,
  height,
  value: height
})

it('counts a tx in the tip block as 1 confirmation, not 0', () => {
  expect(computeConfirmations(blockAtHeight(7140547), chainAtHeight(7140547))).toEqual(1)
})

it('counts a tx N blocks below the tip as N + 1 confirmations', () => {
  expect(computeConfirmations(blockAtHeight(7140547), chainAtHeight(7140548))).toEqual(2)
  expect(computeConfirmations(blockAtHeight(7140547), chainAtHeight(7140557))).toEqual(11)
})

it('never reports fewer than 1 confirmation for a tx that is already in a block', () => {
  // A stale chain height can lag behind the block the tx was just mined into. The tx is in a
  // block, so it has at least 1 confirmation: reporting 0 or a negative count is never truthful.
  expect(computeConfirmations(blockAtHeight(7140547), chainAtHeight(7140546))).toEqual(1)
  expect(computeConfirmations(blockAtHeight(7140547), chainAtHeight(7140540))).toEqual(1)
})

it('falls back to 1 confirmation when the chain height is unknown', () => {
  expect(computeConfirmations(blockAtHeight(7140547), undefined)).toEqual(1)
})

it('reports 0 confirmations when the block is unknown', () => {
  expect(computeConfirmations(undefined, chainAtHeight(7140547))).toEqual(0)
  expect(computeConfirmations(undefined, undefined)).toEqual(0)
})

it('reports 0 confirmations when the block height is missing', () => {
  const blockWithoutHeight = { ...blockAtHeight(7140547), height: undefined as unknown as number }

  expect(computeConfirmations(blockWithoutHeight, chainAtHeight(7140547))).toEqual(0)
})
