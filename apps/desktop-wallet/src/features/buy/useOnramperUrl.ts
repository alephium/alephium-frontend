import { AddressHash, getOnramperUrl } from '@alephium/shared'
import { useTheme } from 'styled-components'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  return getOnramperUrl(receiveAddressHash, {
    themeName: theme.name,
    containerColor: theme.bg.background1.slice(1),
    primaryTextColor: theme.font.primary.slice(1),
    primaryColor: theme.global.accent.slice(1)
  })
}

export default useOnramperUrl
