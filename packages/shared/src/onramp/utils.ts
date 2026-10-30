export const ONRAMP_TARGET_LOCATION = 'https://alephium.org/onramp-callback/'

export type OnramperSignedParams = Record<string, string>

interface OnramperUrlThemeOptions {
  themeName: string
  containerColor?: string
  primaryTextColor?: string
  primaryColor?: string
}

interface OnramperSignatureOptions {
  signature: OnramperSignedParams
  options: OnramperUrlThemeOptions
}

export const getOnramperUrl = ({ signature, options }: OnramperSignatureOptions) => {
  const params = new URLSearchParams(signature)

  params.set('themeName', options.themeName)
  if (options.containerColor) params.set('containerColor', options.containerColor)
  if (options.primaryTextColor) params.set('primaryTextColor', options.primaryTextColor)
  if (options.primaryColor) params.set('primaryColor', options.primaryColor)

  return `https://buy.onramper.com/?${params}`
}
