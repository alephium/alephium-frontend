import { AddressHash } from '@alephium/shared'
import { useTheme } from 'styled-components/native'

const useBanxaUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  return (
    'https://alephium.banxa.com/' +
    `?walletAddress=${receiveAddressHash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` + // TODO: In light theme it's rgba, removing the first char is problematic
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`
  )
}

export default useBanxaUrl
