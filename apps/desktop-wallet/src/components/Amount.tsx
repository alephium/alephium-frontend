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
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import useToken, { isFT } from '@/api/apiDataHooks/useToken'
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

type AmountProps = TokenAmountProps | FiatAmountProps

const Amount = (props: AmountProps) => {
  const dispatch = useAppDispatch()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const { t } = useTranslation()

  const { className, color, value, highlight, tabIndex, showPlusMinus } = props

  const toggleDispatchMode = () => discreetMode && dispatch(discreetModeToggled())

  return (
    <AmountStyled
      {...{ className, color, value, highlight, tabIndex: tabIndex ?? -1, discreetMode }}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
      onClick={toggleDispatchMode}
    >
      {showPlusMinus && <span>{value < 0 ? '-' : '+'}</span>}

      {isFiat(props) ? <FiatAmount {...props} /> : <TokenAmount {...props} />}
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
  color
}: TokenAmountProps) => {
  const { data: token } = useToken(tokenId)

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
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} />

      {isFT(token) && <Suffix color={overrideSuffixColor ? color : undefined}> {token.symbol}</Suffix>}
    </>
  )
}

const FiatAmount = ({ value, fadeDecimals, showPlusMinus, overrideSuffixColor, color }: FiatAmountProps) => {
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)

  const amount = formatFiatAmountForDisplay(value)

  return (
    <>
      <AmountPartitions amount={amount} fadeDecimals={fadeDecimals} />

      <Suffix color={overrideSuffixColor ? color : undefined}> {CURRENCIES[fiatCurrency].symbol}</Suffix>
    </>
  )
}

interface AmountPartitions extends Pick<AmountBaseProps, 'fadeDecimals'> {
  amount: string
}

const AmountPartitions = ({ amount, fadeDecimals }: AmountPartitions) => {
  let quantitySymbol = ''

  if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
    quantitySymbol = amount.slice(-1)
    amount = amount.slice(0, -1)
  }

  const [integralPart, fractionalPart] = amount.split('.')

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

const isFiat = (asset: FiatAmountProps | TokenAmountProps): asset is FiatAmountProps =>
  (asset as FiatAmountProps).isFiat === true

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
