import { AddressHash } from '@alephium/shared'
import { useTheme } from 'styled-components'

const ALPH_CODE = 'alph_alph'
const ONRAMPER_CLIENT_UUID = 'pk_prod_01JJSAZY2D3XSZ614FKBC5EXYE'
export const ONRAMP_TARGET_LOCATION = 'https://alephium.org/onramp-callback/'

const useOnramperUrl = (receiveAddressHash: AddressHash) => {
  const theme = useTheme()

  // See https://docs.onramper.com/docs/supported-widget-parameters
  return (
    'https://buy.onramper.com/' +
    '?mode=buy' +
    `&onlyCryptos=${ALPH_CODE}` +
    `&successRedirectUrl=${encodeURIComponent(ONRAMP_TARGET_LOCATION)}` +
    `&wallets=${ALPH_CODE}:${receiveAddressHash}` +
    `&themeName=${theme.name}` +
    `&containerColor=${theme.bg.background1.slice(1)}` +
    `&primaryTextColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&apiKey=${ONRAMPER_CLIENT_UUID}`
  )
}

export default useOnramperUrl
