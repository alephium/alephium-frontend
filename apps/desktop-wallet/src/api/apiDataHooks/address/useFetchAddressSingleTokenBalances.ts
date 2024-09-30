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
import { ALPH } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'

import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { addressSingleTokenBalancesQuery } from '@/api/queries/addressQueries'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { TokenId } from '@/types/tokens'

interface UseFetchAddressSingleTokenBalancesProps extends SkipProp {
  addressHash: AddressHash
  tokenId: TokenId
}

const useFetchAddressSingleTokenBalances = ({
  addressHash,
  tokenId,
  skip
}: UseFetchAddressSingleTokenBalancesProps) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const isALPH = tokenId === ALPH.id

  const { data: txs, isLoading: isLoadingTxHashes } = useQuery(
    addressLatestTransactionQuery({ addressHash, networkId, skip })
  )

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash,
    skip: !isALPH || skip
  })

  const { data: tokenBalances, isLoading: isLoadingTokenBalances } = useQuery(
    addressSingleTokenBalancesQuery({
      addressHash,
      networkId,
      tokenId,
      latestTxHash: txs?.latestTx?.hash,
      previousTxHash: txs?.previousTx?.hash,
      skip: isLoadingTxHashes || isALPH || skip
    })
  )

  return {
    data: isALPH ? alphBalances : tokenBalances?.balances,
    isLoading: isLoadingTokenBalances || isLoadingAlphBalances || isLoadingTxHashes
  }
}

export default useFetchAddressSingleTokenBalances
