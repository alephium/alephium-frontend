import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import useFetchAddressBalancesAlph from '@/api/apiDataHooks/address/useFetchAddressBalancesAlph'
import useFetchAddressBalancesTokens from '@/api/apiDataHooks/address/useFetchAddressBalancesTokens'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'

interface UseFetchAddressBalancesProps extends UseFetchAddressProps {
  includeAlph?: boolean
}

const useFetchAddressBalances = ({ addressHash, skip, includeAlph = true }: UseFetchAddressBalancesProps) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchAddressBalancesAlph({
    addressHash,
    skip
  })
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchAddressBalancesTokens({
    addressHash,
    skip
  })
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph,
    alphBalances,
    tokensBalances
  })

  return {
    data: allTokensBalances,
    isLoading: isLoadingTokensBalances || (includeAlph ? isLoadingAlphBalances : false)
  }
}

export default useFetchAddressBalances
