import { getOnramperUrl } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { useFetchOnramperSignature } from '@alephium/shared-react'
import { useTheme } from 'styled-components/native'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()
  const { data: signature, isLoading, error } = useFetchOnramperSignature(receiveAddressHash)

  const url =
    signature && !isLoading
      ? getOnramperUrl({
          receiveAddressHash,
          signature,
          options: {
            themeName: theme.name,
            containerColor: theme.bg.back1.slice(1),
            primaryTextColor: theme.font.primary.slice(1),
            primaryColor: theme.global.accent.slice(1)
          }
        })
      : undefined

  return { url, isLoading, error }
}

export default useOnramperUrl
