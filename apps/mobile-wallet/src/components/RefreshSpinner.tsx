import { useRefreshAddressesBalances } from '@alephium/shared-react'
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
