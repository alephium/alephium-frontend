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
