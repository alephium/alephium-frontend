import { AddressHash } from '@alephium/shared'
import { useTheme } from 'styled-components/native'

const useBanxaUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  return (
    'https://alephium.banxa.com/' +
    `?walletAddress=${receiveAddressHash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.back1.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`
  )
}

export default useBanxaUrl
