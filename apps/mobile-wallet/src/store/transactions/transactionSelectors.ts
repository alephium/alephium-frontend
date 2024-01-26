/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Asset } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { createSelector } from '@reduxjs/toolkit'

import { makeSelectAddresses } from '~/store/addressesSlice'
import { selectAllFungibleTokens, selectNFTIds } from '~/store/assets/assetsSelectors'
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

const extractTokenIds = (
  tokenIds: Asset['id'][],
  ios: explorer.Transaction['inputs'] | explorer.Transaction['outputs']
) => {
  ios?.forEach((io) => {
    io.tokens?.forEach((token) => {
      if (!tokenIds.includes(token.id)) {
        tokenIds.push(token.id)
      }
    })
  })
}
