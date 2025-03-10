import {
  AddressBalancesSyncResult,
  AddressHash,
  AddressTokensSyncResult,
  client,
  TRANSACTIONS_PAGE_DEFAULT_LIMIT
} from '@alephium/shared'
import { AddressTokenBalance, Transaction } from '@alephium/web3/dist/src/api/api-explorer'

const PAGE_LIMIT = 100

export const fetchAddressesTokens = async (addressHashes: AddressHash[]): Promise<AddressTokensSyncResult[]> => {
  const results = []

  for (const hash of addressHashes) {
    const addressTotalTokenBalances = [] as AddressTokenBalance[]
    let addressTokensPageResults = [] as AddressTokenBalance[]
    let page = 1

    while (page === 1 || addressTokensPageResults.length === PAGE_LIMIT) {
      addressTokensPageResults = await client.explorer.addresses.getAddressesAddressTokensBalance(hash, {
        limit: PAGE_LIMIT,
        page
      })

      addressTotalTokenBalances.push(...addressTokensPageResults)

      page += 1
    }

    results.push({
      hash,
      tokenBalances: addressTotalTokenBalances
    })
  }

  return results
}

export const fetchAddressesBalances = async (addressHashes: AddressHash[]): Promise<AddressBalancesSyncResult[]> => {
  const results = []

  for (const addressHash of addressHashes) {
    const balances = await client.explorer.addresses.getAddressesAddressBalance(addressHash)

    results.push({
      hash: addressHash,
      ...balances
    })
  }

  return results
}

export const fetchAddressesTransactionsPage = async (
  addressesHashes: AddressHash[],
  page: number
): Promise<Transaction[]> =>
  (
    await Promise.all(
      addressesHashes.map((hash) =>
        client.explorer.addresses.getAddressesAddressTransactions(hash, {
          page,
          limit: TRANSACTIONS_PAGE_DEFAULT_LIMIT
        })
      )
    )
  ).flat()
