import { AddressHash } from '@alephium/shared'
import { useTheme } from 'styled-components/native'

const ALPH_CODE = 'alph_alph'
const ONRAMPER_CLIENT_UUID = 'pk_prod_01JJSAZY2D3XSZ614FKBC5EXYE'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  // See https://docs.onramper.com/docs/supported-widget-parameters
  return (
    'https://buy.onramper.com/' +
    '?mode=buy' +
    `&onlyCryptos=${ALPH_CODE}` +
    `&successRedirectUrl=${encodeURIComponent('https://alephium.org/banxa-callback/')}` +
    `&wallets=${ALPH_CODE}:${receiveAddressHash}` +
    `&themeName=${theme.name}` +
    `&containerColor=${theme.bg.back1.slice(1)}` +
    `&primaryTextColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}` +
    `&apiKey=${ONRAMPER_CLIENT_UUID}`
  )
}

export default useOnramperUrl
