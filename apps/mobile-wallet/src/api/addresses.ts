import { AddressBalancesSyncResult, AddressHash, AddressTokensSyncResult, client } from '@alephium/shared'
import { AddressTokenBalance, Transaction } from '@alephium/web3/dist/src/api/api-explorer'

import { Address } from '~/types/addresses'

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

export const fetchAddressesTransactionsNextPage = async (addresses: Address[], nextPage: number) => {
  let transactions: Transaction[] = []
  const args = { page: nextPage }
  const addressHashes = addresses.map((address) => address.hash)

  if (addressHashes.length === 1) {
    transactions = await client.explorer.addresses.getAddressesAddressTransactions(addressHashes[0], args)
  } else if (addressHashes.length > 1) {
    transactions = await client.explorer.addresses.postAddressesTransactions(args, addressHashes)
  }

  return transactions
}
