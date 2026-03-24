import { AddressHash, getOnramperUrl } from '@alephium/shared'
import { useFetchOnramperSignature } from '@alephium/shared-react'
import { useTheme } from 'styled-components/native'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()
  const { data: signature, isLoading } = useFetchOnramperSignature(receiveAddressHash)

  if (signature && !isLoading) {
    return getOnramperUrl({
      receiveAddressHash,
      signature,
      options: {
        themeName: theme.name,
        containerColor: theme.bg.back1.slice(1),
        primaryTextColor: theme.font.primary.slice(1),
        primaryColor: theme.global.accent.slice(1)
      }
    })
  }

  return undefined
}

export default useOnramperUrl
