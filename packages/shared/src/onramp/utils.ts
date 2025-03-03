import { AddressHash } from '@/types'

const ALPH_CODE = 'alph_alph'
const ONRAMPER_CLIENT_UUID = 'pk_prod_01JJSAZY2D3XSZ614FKBC5EXYE'
export const ONRAMP_TARGET_LOCATION = 'https://alephium.org/onramp-callback/'

interface OnramperUrlThemeOptions {
  themeName: string
  containerColor?: string
  primaryTextColor?: string
  primaryColor?: string
}

// See https://docs.onramper.com/docs/supported-widget-parameters
export const getOnramperUrl = (receiveAddressHash: AddressHash, options: OnramperUrlThemeOptions) =>
  'https://buy.onramper.com/' +
  '?mode=buy' +
  `&onlyCryptos=${ALPH_CODE}` +
  `&successRedirectUrl=${encodeURIComponent(ONRAMP_TARGET_LOCATION)}` +
  `&wallets=${ALPH_CODE}:${receiveAddressHash}` +
  `&apiKey=${ONRAMPER_CLIENT_UUID}` +
  `&themeName=${options.themeName}` +
  (options.containerColor ? `&containerColor=${options.containerColor}` : '') +
  (options.primaryTextColor ? `&primaryTextColor=${options.primaryTextColor}` : '') +
  (options.primaryColor ? `&primaryColor=${options.primaryColor}` : '')
