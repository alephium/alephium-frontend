import { useMemo } from 'react'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { useFetchAddressBalancesTokens } from '@/api/apiDataHooks/address/useFetchAddressBalancesTokens'
import { useSharedSelector } from '@/redux'

export const useFetchAddressHiddenTokens = ({ addressHash }: UseFetchAddressProps) => {
  const hiddenTokensIds = useSharedSelector((s) => s.hiddenTokens.hiddenTokensIds)
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchAddressBalancesTokens({ addressHash })

  const addressHiddenTokens = useMemo(
    () => tokensBalances?.filter(({ id }) => hiddenTokensIds.includes(id)).map(({ id }) => id),
    [tokensBalances, hiddenTokensIds]
  )

  return {
    data: addressHiddenTokens,
    isLoading: isLoadingTokensBalances
  }
}
