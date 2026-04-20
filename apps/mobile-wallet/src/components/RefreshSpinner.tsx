import { queryClient, useUnsortedAddressesHashes } from '@alephium/shared-react'
import { useCallback, useState } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import { useTheme } from 'styled-components/native'

const RefreshSpinner = (props: Partial<RefreshControlProps>) => {
  const theme = useTheme()

  const { refreshBalances, isFetchingBalances } = useRefreshAddressesBalances()
  const refreshing = props.refreshing ?? isFetchingBalances
  const onRefresh = props.onRefresh ?? refreshBalances

  return <RefreshControl {...props} refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.font.primary} />
}

export default RefreshSpinner

const useRefreshAddressesBalances = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const [isFetchingBalances, setIsFetchingBalances] = useState(false)

  const refreshBalances = useCallback(async () => {
    if (isFetchingBalances) return

    setIsFetchingBalances(true)

    try {
      await Promise.all(
        addressHashes.map((addressHash) =>
          queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
        )
      )
    } finally {
      setIsFetchingBalances(false)
    }
  }, [addressHashes, isFetchingBalances])

  return {
    refreshBalances,
    isFetchingBalances
  }
}
