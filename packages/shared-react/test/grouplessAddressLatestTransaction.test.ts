import { batchers, throttledClient } from '@alephium/shared/api'
import { AddressHash } from '@alephium/shared/types'
import { ExplorerProvider } from '@alephium/web3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addressLatestTransactionQuery } from '../src/api/queries/transactionQueries'
import { queryClient } from '../src/api/queryClient'

const NETWORK_ID = 0

// The keyring derives a groupless address without a group, so this is the form the wallet stores and queries with.
const GROUPLESS_ADDRESS: AddressHash = '3cUtFAR5kbr2EBgvh2tKqgjsqysEKmEwzMsW3yJL8e9BiqZ4dsyhH'
const LATEST_TX_HASH = 'bfb641789c0beeb81c4921212f6e894c9dc0cf3c01ac4b9d574fd7dca8264373'

// Captured from POST https://backend.mainnet.alephium.org/addresses/latest-transactions asked for the address above.
// The explorer answers with the group of the latest transaction appended, which used to make the batcher resolve the
// address to undefined and the wallet read that as "no transactions", so no new transaction was ever detected.
const explorerResponse = [
  {
    address: `${GROUPLESS_ADDRESS}:3`,
    transactionInfo: {
      hash: LATEST_TX_HASH,
      blockHash: '000000000001433c7a0f3846d386df10b83362f0fdaea49751fd7e5d78fe960f',
      timestamp: 1785760806119,
      coinbase: false
    }
  }
]

describe('the latest transaction of a groupless address', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    queryClient.clear()
  })

  it('is resolved even though the explorer answers with the group appended', async () => {
    const postAddressesLatestTransactions = vi.fn(async () => explorerResponse)

    vi.spyOn(throttledClient, 'explorer', 'get').mockReturnValue({
      addresses: { postAddressesLatestTransactions }
    } as unknown as ExplorerProvider)
    batchers.init()

    const data = await queryClient.fetchQuery(
      addressLatestTransactionQuery({ addressHash: GROUPLESS_ADDRESS, networkId: NETWORK_ID, isExplorerOnline: true })
    )

    expect(postAddressesLatestTransactions).toHaveBeenCalledWith([GROUPLESS_ADDRESS])
    expect(data.latestTx?.hash).toBe(LATEST_TX_HASH)
  })
})
