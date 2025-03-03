import { createContext, ReactNode, useContext, useMemo } from 'react'

import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { ApiContextProps } from '@/api/apiTypes'
import { useAppSelector } from '@/hooks/redux'
import { ApiBalances, ListedFT, TokenId, UnlistedToken } from '@/types/tokens'

type Data = {
  listedFts: Array<ListedFT & ApiBalances & { id: TokenId }>
  unlistedTokens: Array<UnlistedToken & ApiBalances & { id: TokenId }>
  unlistedFtIds: Array<TokenId>
  nftIds: Array<TokenId>
  nstIds: Array<TokenId>
}

const DataContext = createContext<ApiContextProps<Data>>({
  data: {
    listedFts: [],
    unlistedTokens: [],
    unlistedFtIds: [],
    nftIds: [],
    nstIds: []
  },
  isLoading: false,
  isFetching: false,
  error: false
})

const UseFetchWalletTokensByTypeContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletBalancesTokensArray()

  const allTokensBalances = useMergeAllTokensBalances({ includeAlph: true, alphBalances, tokensBalances })
  const { data, isLoading } = useFetchTokensSeparatedByType(allTokensBalances)

  const value = useMemo(
    () => ({
      data,
      isLoading: isLoading || isLoadingTokensBalances || isLoadingAlphBalances
    }),
    [data, isLoading, isLoadingTokensBalances, isLoadingAlphBalances]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

interface UseFetchWalletTokensByTypeProps {
  includeHidden: boolean
}

const useFetchWalletTokensByType = ({ includeHidden }: UseFetchWalletTokensByTypeProps) => {
  const contextData = useContext(DataContext)
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)
  const isNotHiddenTokenId = (tokenId: TokenId) => !hiddenTokenIds.includes(tokenId)
  const isNotHiddenToken = (token: { id: TokenId }) => isNotHiddenTokenId(token.id)

  return includeHidden
    ? contextData
    : {
        ...contextData,
        data: {
          listedFts: contextData.data.listedFts.filter(isNotHiddenToken),
          unlistedTokens: contextData.data.unlistedTokens.filter(isNotHiddenToken),
          unlistedFtIds: contextData.data.unlistedFtIds.filter(isNotHiddenTokenId),
          nftIds: contextData.data.nftIds.filter(isNotHiddenTokenId),
          nstIds: contextData.data.nstIds.filter(isNotHiddenTokenId)
        }
      }
}

export default useFetchWalletTokensByType

export { UseFetchWalletTokensByTypeContextProvider }
