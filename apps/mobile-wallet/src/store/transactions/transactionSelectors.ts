import { Asset, extractTokenIds, selectAllFungibleTokens, selectNFTIds } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

import { makeSelectAddresses } from '~/store/addressesSlice'
import { selectAllConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { selectAllPendingTransactions } from '~/store/pendingTransactionsSlice'

export const makeSelectAddressesHashesWithPendingTransactions = () =>
  createSelector([selectAllPendingTransactions, makeSelectAddresses()], (allPendingTransactions, addresses) =>
    addresses
      .filter(({ hash }) =>
        allPendingTransactions.some(
          (tx) => tx.fromAddress === hash || (tx.type === 'transfer' && tx.toAddress) === hash
        )
      )
      .map(({ hash }) => hash)
  )

export const selectTransactionUnknownTokenIds = createSelector(
  [selectAllFungibleTokens, selectNFTIds, selectAllConfirmedTransactions],
  (fungibleTokens, nftIds, allConfirmedTransactions) => {
    const transactionTokenIds = allConfirmedTransactions.reduce(
      (acc, transaction) => {
        extractTokenIds(acc, transaction.inputs)
        extractTokenIds(acc, transaction.outputs)

        return acc
      },
      [] as Asset['id'][]
    )

    const tokensWithoutMetadata = transactionTokenIds.reduce(
      (acc, tokenId) => {
        const hasTokenMetadata = !!fungibleTokens.find((t) => t.id === tokenId)
        const hasNFTMetadata = nftIds.includes(tokenId)

        if (!hasTokenMetadata && !hasNFTMetadata) {
          acc.push(tokenId)
        }

        return acc
      },
      [] as Asset['id'][]
    )

    return tokensWithoutMetadata
  }
)
