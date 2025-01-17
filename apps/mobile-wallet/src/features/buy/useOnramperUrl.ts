import { AddressHash } from '@alephium/shared'
import { useTheme } from 'styled-components/native'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  // See https://docs.onramper.com/docs/supported-widget-parameters
  return (
    'https://buy.onramper.com/' +
    '?mode=buy' +
    '&onlyCryptos=ALPH' +
    '&successRedirectUrl=https://alephium.com/banxa-callback/' +
    `&wallets=ALPH:${receiveAddressHash}` +
    `&themeName=${theme.name}` +
    `&containerColor=${theme.bg.back1.slice(1)}` +
    `&primaryTextColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`
  )
}

export default useOnramperUrl
