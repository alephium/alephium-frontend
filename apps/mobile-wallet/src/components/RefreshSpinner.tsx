import { AddressHash } from '@alephium/shared'
import {
  queryClient,
  refreshWalletTransactionsFromCache,
  useNetworkId,
  useRefreshAddressesBalances,
  useUnsortedAddressesHashes,
  useUnsortedAddressesHashesSet
} from '@alephium/shared-react'
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
  const unsortedAddressesHashes = useUnsortedAddressesHashes()
  const unsortedAddressesHashesSet = useUnsortedAddressesHashesSet()
  const networkId = useNetworkId()
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

      // Nothing else brings new transactions into the mobile list, so the pull has to load them itself.
      await refreshWalletTransactionsFromCache(unsortedAddressesHashes, networkId)

      await refreshBalances()
    } finally {
      setIsRefreshingData(false)
    }
  }, [unsortedAddressesHashesSet, unsortedAddressesHashes, networkId, isRefreshingData, refreshBalances])

  return {
    refreshData,
    // The local flag keeps the spinner up between the latest-tx check and the moment the balance queries start
    // fetching, the shared flag keeps it up until they settle.
    isRefreshing: isRefreshingData || isFetchingBalances
  }
}
