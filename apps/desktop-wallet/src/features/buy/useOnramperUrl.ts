import { AddressHash, getOnramperUrl } from '@alephium/shared'
import { useFetchOnramperSignature } from '@alephium/shared-react'
import { useTheme } from 'styled-components'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()
  const { data: signature, isLoading } = useFetchOnramperSignature(receiveAddressHash)

  if (signature && !isLoading) {
    return getOnramperUrl({ receiveAddressHash, signature, options: { themeName: theme.name } })
  }

  return undefined
}

export default useOnramperUrl
