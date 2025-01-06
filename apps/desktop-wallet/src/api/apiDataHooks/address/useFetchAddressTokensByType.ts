import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import useFetchAddressBalances from '@/api/apiDataHooks/address/useFetchAddressBalances'
import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'

interface UseFetchAddressTokensByType extends UseFetchAddressProps {
  includeAlph: boolean
}

const useFetchAddressTokensByType = (props: UseFetchAddressTokensByType) => {
  const { data: allTokensBalances, isLoading: isLoadingBalances } = useFetchAddressBalances(props)
  const { data, isLoading } = useFetchTokensSeparatedByType(allTokensBalances)

  return {
    data,
    isLoading: isLoading || isLoadingBalances
  }
}

export default useFetchAddressTokensByType
