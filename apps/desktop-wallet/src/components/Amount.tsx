/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { convertToPositive, CURRENCIES, formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/shared'
import { Optional } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import useFetchToken, { isFT } from '@/api/apiDataHooks/token/useFetchToken'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { discreetModeToggled } from '@/storage/settings/settingsActions'
import { TokenId } from '@/types/tokens'

interface AmountBaseProps {
  fadeDecimals?: boolean
  color?: string
  overrideSuffixColor?: boolean
  tabIndex?: number
  highlight?: boolean
  showPlusMinus?: boolean
  className?: string
  useTinyAmountShorthand?: boolean
}

interface TokenAmountProps extends AmountBaseProps {
  tokenId: TokenId
  value: bigint
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
}

interface FiatAmountProps extends AmountBaseProps {
  isFiat: true
  value: number
}

interface CustomAmountProps extends AmountBaseProps {
  value: number
  suffix: string
}

type AmountProps = TokenAmountProps | FiatAmountProps | CustomAmountProps

type AmountPropsWithOptionalAmount =
  | Optional<TokenAmountProps, 'value'>
  | Optional<FiatAmountProps, 'value'>
  | Optional<CustomAmountProps, 'value'>

interface LoaderProps {
  isLoading?: boolean
  loaderSizeInPx?: string
}

const Amount = ({ isLoading, loaderSizeInPx = '15', ...props }: AmountPropsWithOptionalAmount & LoaderProps) => {
  const dispatch = useAppDispatch()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const { t } = useTranslation()

  if (isLoading) return <SkeletonLoader height={`${loaderSizeInPx}px`} />

  if (props.value === undefined) return null

  // Since we checked above that value is defined it's safe to cast the type so that the stricter components can work
  const amountProps = props as AmountProps

  const { className, color, value, highlight, tabIndex, showPlusMinus } = amountProps

  const toggleDiscreetMode = () => discreetMode && dispatch(discreetModeToggled())

  return (
    <AmountStyled
      {...{ className, color, value, highlight, tabIndex: tabIndex ?? -1, discreetMode }}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
      onClick={toggleDiscreetMode}
    >
      {showPlusMinus && <span>{value < 0 ? '-' : '+'}</span>}

      {isFiat(amountProps) ? (
        <FiatAmount {...amountProps} />
      ) : isCustom(amountProps) ? (
        <CustomAmount {...amountProps} />
      ) : (
        <TokenAmount {...amountProps} />
      )}
    </AmountStyled>
  )
}

export default Amount

const TokenAmount = ({
  tokenId,
  value,
  fullPrecision,
  nbOfDecimalsToShow,
  fadeDecimals,
  overrideSuffixColor,
  color,
  useTinyAmountShorthand
}: TokenAmountProps) => {
  const { data: token } = useFetchToken(tokenId)

  const amount = isFT(token)
    ? formatAmountForDisplay({
        amount: convertToPositive(value),
        amountDecimals: token.decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision
      })
    : value.toString()

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} useTinyAmountShorthand={useTinyAmountShorthand} />

      {isFT(token) && <Suffix color={overrideSuffixColor ? color : undefined}> {token.symbol}</Suffix>}
    </>
  )
}

const FiatAmount = ({ value, fadeDecimals, overrideSuffixColor, color }: FiatAmountProps) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  const amount = formatFiatAmountForDisplay(value)

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} />

      <Suffix color={overrideSuffixColor ? color : undefined}> {CURRENCIES[fiatCurrency].symbol}</Suffix>
    </>
  )
}

const CustomAmount = ({ value, fadeDecimals, overrideSuffixColor, color, suffix }: CustomAmountProps) => {
  const amount = (value < 1 ? value * -1 : value).toString()

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} />

      <Suffix color={overrideSuffixColor ? color : undefined}> {suffix}</Suffix>
    </>
  )
}

interface AmountPartitions extends Pick<AmountBaseProps, 'fadeDecimals' | 'useTinyAmountShorthand'> {
  amount: string
}

const AmountPartitions = ({ amount, fadeDecimals, useTinyAmountShorthand }: AmountPartitions) => {
  let quantitySymbol = ''

  if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
    quantitySymbol = amount.slice(-1)
    amount = amount.slice(0, -1)
  }

  let [integralPart, fractionalPart] = amount.split('.')

  if (useTinyAmountShorthand && amount.startsWith('0.0000')) {
    integralPart = '< 0'
    fractionalPart = '0001'
  }

  return fadeDecimals ? (
    <>
      <span>{integralPart}</span>
      {fractionalPart && <Decimals>.{fractionalPart}</Decimals>}
      {quantitySymbol && <span>{quantitySymbol}</span>}
    </>
  ) : fractionalPart ? (
    `${integralPart}.${fractionalPart}`
  ) : (
    integralPart
  )
}

const isFiat = (asset: AmountProps): asset is FiatAmountProps => (asset as FiatAmountProps).isFiat === true

const isCustom = (asset: AmountProps): asset is CustomAmountProps => (asset as CustomAmountProps).suffix !== undefined

const AmountStyled = styled.div<Pick<AmountProps, 'color' | 'highlight' | 'value'> & { discreetMode: boolean }>`
  color: ${({ color, highlight, value, theme }) =>
    color
      ? color
      : highlight && value !== undefined
        ? value < 0
          ? theme.font.highlight
          : theme.global.valid
        : 'inherit'};
  display: inline-flex;
  white-space: pre;
  font-weight: var(--fontWeight-bold);
  font-feature-settings: 'tnum' on;
  ${({ discreetMode }) =>
    discreetMode &&
    css`
      filter: blur(10px);
      max-width: 100px;
      overflow: hidden;
      cursor: pointer;
    `}
`

const Decimals = styled.span`
  opacity: 0.7;
`

const Suffix = styled.span<{ color?: string }>`
  color: ${({ color, theme }) => color ?? theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`
