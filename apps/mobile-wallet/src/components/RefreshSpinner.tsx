import { queryClient, useUnsortedAddressesHashes } from '@alephium/shared-react'
import { useCallback, useState } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import { useTheme } from 'styled-components/native'

const RefreshSpinner = (props: Partial<RefreshControlProps>) => {
  const theme = useTheme()

  const { refreshBalances, isFetchingBalances } = useRefreshAddressesBalances()

  return (
    <RefreshControl
      {...props}
      refreshing={isFetchingBalances}
      onRefresh={refreshBalances}
      tintColor={theme.font.primary}
    />
  )
}

export default RefreshSpinner

const useRefreshAddressesBalances = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const [isFetchingBalances, setIsFetchingBalances] = useState(false)

  const refreshBalances = useCallback(async () => {
    if (isFetchingBalances) return

    await Promise.all(
      addressHashes.map((addressHash) =>
        queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'transaction', 'latest'] })
      )
    )

    setIsFetchingBalances(false)
  }, [addressHashes, isFetchingBalances])

  return {
    refreshBalances,
    isFetchingBalances
  }
}
