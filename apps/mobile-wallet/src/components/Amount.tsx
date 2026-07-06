import { convertToPositive, formatAmountForDisplay, formatLocalizedFiatAmount } from '@alephium/shared/numbers'
import { Optional } from '@alephium/web3'
import { useState } from 'react'
import { StyleProp, TextStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

import AppText, { AppTextProps } from './AppText'

export interface AmountBaseProps extends AppTextProps {
  highlight?: boolean
  showPlusMinus?: boolean
  showOnDiscreetMode?: boolean
  fadeSuffix?: boolean
  useTinyAmountShorthand?: boolean
  style?: StyleProp<TextStyle>
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
}

interface TokenAmountProps extends AmountBaseProps {
  value: bigint
  decimals?: number
  isUnknownToken?: boolean
}

interface FiatAmountProps extends AmountBaseProps {
  isFiat: true
  value: number
  fiatPrefix?: string
}

interface CustomAmountProps extends AmountBaseProps {
  value: bigint
  suffix: string
  decimals?: number
}

type AmountProps = TokenAmountProps | FiatAmountProps | CustomAmountProps

type AmountPropsWithOptionalAmount =
  | Optional<TokenAmountProps, 'value'>
  | Optional<FiatAmountProps, 'value'>
  | Optional<CustomAmountProps, 'value'>

const Amount = (inputProps: AmountPropsWithOptionalAmount) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const region = useAppSelector((state) => state.settings.region)
  const fiatCurrency = useAppSelector((state) => state.settings.currency)

  const [tappedToDisableDiscreetMode, setTappedToDisableDiscreetMode] = useState(false)

  const {
    value,
    style,
    color,
    highlight,
    showPlusMinus,
    showOnDiscreetMode = false,
    fullPrecision = false,
    fadeSuffix,
    useTinyAmountShorthand,
    ..._appTextProps
  } = inputProps

  const appTextProps = _appTextProps as AppTextProps
  const hideAmount = discreetMode && !showOnDiscreetMode && !tappedToDisableDiscreetMode

  const handleTappedToDisableDiscreetMode = discreetMode
    ? () => setTappedToDisableDiscreetMode(!tappedToDisableDiscreetMode)
    : undefined

  const textColor =
    color ?? (highlight && value !== undefined && value < 0 ? 'send' : highlight ? 'receive' : 'primary')

  if (value === undefined) {
    return (
      <AppText {...appTextProps} style={style} onPress={handleTappedToDisableDiscreetMode}>
        -
      </AppText>
    )
  }

  const amountProps = inputProps as AmountProps

  if (isFiat(amountProps)) {
    const amount = formatLocalizedFiatAmount(amountProps.value, region, fiatCurrency)

    return (
      <AppText {...appTextProps} {...{ color: textColor, style }} onPress={handleTappedToDisableDiscreetMode}>
        {hideAmount ? '•••' : amountProps.fiatPrefix ? `${amountProps.fiatPrefix} ${amount}` : amount}
      </AppText>
    )
  }

  const suffix = isCustom(amountProps) ? amountProps.suffix : 'ALPH'
  const isNegative = amountProps.value < BigInt(0)

  let amount = ''
  let tinyAmount = ''

  if (!isCustom(amountProps) && amountProps.isUnknownToken) {
    amount = convertToPositive(amountProps.value).toString()
  } else {
    amount = formatAmountForDisplay({
      amount: convertToPositive(amountProps.value),
      amountDecimals: amountProps.decimals,
      displayDecimals: amountProps.nbOfDecimalsToShow,
      fullPrecision,
      region,
      useSubscriptNotation: true
    })

    const amountIsTooSmall = amount.startsWith('0.0000')

    tinyAmount =
      useTinyAmountShorthand && amountIsTooSmall
        ? formatAmountForDisplay({ amount: BigInt(1), amountDecimals: 4, region })
        : ''
  }

  const isUnknownToken = !isCustom(amountProps) && amountProps.isUnknownToken

  return (
    <AppText {...appTextProps} {...{ color: textColor, style }} onPress={handleTappedToDisableDiscreetMode}>
      {hideAmount ? (
        '•••'
      ) : amount ? (
        <>
          {showPlusMinus && (
            <AppText {...appTextProps} color={textColor}>
              {isNegative ? '-' : '+'}
            </AppText>
          )}
          <AppText {...appTextProps} color={textColor}>
            {tinyAmount ? `< ${tinyAmount}` : amount}
          </AppText>
          {!isUnknownToken && (
            <AppText {...appTextProps} color={fadeSuffix ? 'secondary' : textColor}>{` ${suffix}`}</AppText>
          )}
        </>
      ) : (
        '-'
      )}
    </AppText>
  )
}

export default Amount

const isFiat = (asset: AmountProps): asset is FiatAmountProps => (asset as FiatAmountProps).isFiat === true

const isCustom = (asset: AmountProps): asset is CustomAmountProps => (asset as CustomAmountProps).suffix !== undefined
