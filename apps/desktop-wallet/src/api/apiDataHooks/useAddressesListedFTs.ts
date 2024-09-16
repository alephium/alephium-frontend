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

import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'

import useAddressesTokensBalances, { AddressesTokensBalances } from '@/api/apiDataHooks/useAddressesTokensBalances'
import useFTList, { FTList } from '@/api/apiDataHooks/useFTList'
import { ListedFT, TokenId } from '@/types/tokens'

interface AddressesListedFTs {
  data: ListedFT[]
  unknownTypeTokenIds: TokenId[]
  isLoading: boolean
}

// TODO: Delete in favor of new hooks
const useAddressesListedFTs = (addressHash?: AddressHash): AddressesListedFTs => {
  const { data: fungibleTokenList, isLoading: isLoadingFTList } = useFTList()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useAddressesTokensBalances(addressHash)

  const { listedFTs, unknownTypeTokenIds } = useMemo(
    () => separateTokens(tokensBalances, fungibleTokenList),
    [fungibleTokenList, tokensBalances]
  )

  return {
    data: listedFTs,
    unknownTypeTokenIds,
    isLoading: isLoadingFTList || isLoadingTokensBalances
  }
}

export default useAddressesListedFTs

const separateTokens = (tokensBalances: AddressesTokensBalances['data'], fungibleTokenList: FTList['data']) =>
  Object.values(tokensBalances).reduce(
    (acc, addressTokensBalances) => {
      addressTokensBalances?.map(({ id }) => {
        const listedFungibleToken = fungibleTokenList?.find((token) => token.id === id)

        if (listedFungibleToken) {
          const alreadyAddedToArray = acc.listedFTs.some((token) => token.id === listedFungibleToken?.id)

          if (!alreadyAddedToArray) acc.listedFTs.push(listedFungibleToken)
        } else {
          acc.unknownTypeTokenIds.push(id)
        }
      })
      return acc
    },
    {
      listedFTs: [] as ListedFT[],
      unknownTypeTokenIds: [] as TokenId[]
    }
  )
