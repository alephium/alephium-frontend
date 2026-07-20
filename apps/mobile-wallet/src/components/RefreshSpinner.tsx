import { AddressHash } from '@alephium/shared'
import { queryClient, useRefreshAddressesBalances, useUnsortedAddressesHashesSet } from '@alephium/shared-react'
import { useCallback, useState } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import { useTheme } from 'styled-components/native'

const RefreshSpinner = (props: Partial<RefreshControlProps>) => {
  const theme = useTheme()

  const { refreshData, isRefreshing } = useRefreshAddressesData()
  const refreshing = props.refreshing ?? isRefreshing
  const onRefresh = props.onRefresh ?? refreshData

  return <RefreshControl {...props} refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.font.primary} />
}

export default RefreshSpinner

const useRefreshAddressesData = () => {
  const unsortedAddressesHashesSet = useUnsortedAddressesHashesSet()
  const { refreshBalances, isFetchingBalances } = useRefreshAddressesBalances()
  const [isRefreshingData, setIsRefreshingData] = useState(false)

  const refreshData = useCallback(async () => {
    if (isRefreshingData) return

    setIsRefreshingData(true)

    try {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'address' &&
          query.queryKey[2] === 'transaction' &&
          query.queryKey[3] === 'latest' &&
          unsortedAddressesHashesSet.has(query.queryKey[1] as AddressHash)
      })

      await refreshBalances()
    } finally {
      setIsRefreshingData(false)
    }
  }, [unsortedAddressesHashesSet, isRefreshingData, refreshBalances])

  return {
    refreshData,
    // The local flag keeps the spinner up between the latest-tx check and the moment the balance queries start
    // fetching, the shared flag keeps it up until they settle.
    isRefreshing: isRefreshingData || isFetchingBalances
  }
}
