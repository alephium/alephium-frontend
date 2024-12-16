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

import { ONE_DAY_MS } from '@alephium/shared'
import { ALPH, getTokensURL, mainnet, testnet, TokenList } from '@alephium/token-list'
import { skipToken, useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

import { getQueryConfig } from './getQueryConfig'

export interface FTList {
  data: TokenList['tokens'] | undefined
  isLoading: boolean
}

type FTListProps = {
  skip: boolean
}

const useFetchFtList = (props?: FTListProps): FTList => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const network = networkId === 0 ? 'mainnet' : networkId === 1 ? 'testnet' : networkId === 4 ? 'devnet' : undefined

  const { data, isLoading } = useQuery({
    queryKey: ['tokenList', { networkId }],
    // The token list is essential for the whole app so we don't want to ever delete it. Even if we set a lower gcTime,
    // it will never become inactive (since it's always used by a mount component).
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
    queryFn:
      !network || props?.skip
        ? skipToken
        : () =>
            network === 'devnet'
              ? [ALPH]
              : axios.get(getTokensURL(network)).then(({ data }) => (data as TokenList)?.tokens),
    placeholderData: network === 'mainnet' ? mainnet.tokens : network === 'testnet' ? testnet.tokens : []
  })

  // TODO: Maybe return an object instead of an array for faster search?
  return {
    data,
    isLoading
  }
}

export default useFetchFtList
