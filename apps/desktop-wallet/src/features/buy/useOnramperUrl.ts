import { AddressHash, getOnramperUrl } from '@alephium/shared'
import { useTheme } from 'styled-components'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  return getOnramperUrl(receiveAddressHash, { themeName: theme.name })
}

export default useOnramperUrl
