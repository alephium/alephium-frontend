/*
Copyright 2018 - 2022 The Alephium Authors
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

import { formatAmountForDisplay } from '@alephium/sdk'
import { FC, ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import { Currency } from '../types/settings'
import { currencies } from '../utils/currencies'
import { formatFiatAmountForDisplay } from '../utils/numbers'
import AppText from './AppText'

interface TokenSymbolProps {
  color?: string
  style?: StyleProp<ViewStyle>
}

interface AmountProps {
  value?: bigint
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
  suffix?: FC<TokenSymbolProps> | string
  fiat?: number
  fiatCurrency?: Currency
  showOnDiscreetMode?: boolean
  color?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

const Amount = ({
  value,
  style,
  fadeDecimals,
  fullPrecision = false,
  prefix,
  suffix = '',
  showOnDiscreetMode = false,
  fiatCurrency,
  fiat,
  color,
  size
}: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''
  let moneySymbol = ''
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  if (!discreetMode || showOnDiscreetMode) {
    let amount = ''

    if (fiat) {
      amount = formatFiatAmountForDisplay(fiat)
    } else if (value !== undefined) {
      amount = formatAmountForDisplay(value, fullPrecision)
    }

    if (amount) {
      if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
        moneySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
      const amountParts = amount.split('.')
      integralPart = amountParts[0]
      fractionalPart = amountParts[1]
    }
  }

  return (
    <AppText size={size} style={style}>
      {discreetMode && !showOnDiscreetMode ? (
        '•••'
      ) : integralPart ? (
        <>
          {prefix && <AppText style={{ color }}>{prefix}</AppText>}
          <AppText style={{ color }}>{integralPart}</AppText>
          <Decimals fadeDecimals={fadeDecimals} color={color}>
            .{fractionalPart}
          </Decimals>
          <Suffix {...{ suffix, moneySymbol, fiatCurrency, color }} />
        </>
      ) : (
        '-'
      )}
    </AppText>
  )
}

export default styled(Amount)`
  font-weight: 500;
`

interface SuffixProps {
  suffix: FC<TokenSymbolProps> | string
  moneySymbol?: string
  fiatCurrency?: Currency
  color?: string
}

const Suffix = ({ suffix, moneySymbol, fiatCurrency, color }: SuffixProps) => {
  const theme = useTheme()
  const TokenSymbol = suffix
  const _suffix =
    typeof TokenSymbol === 'function' ? (
      <TokenSymbol style={{ width: 15, height: 18 }} color={color ?? theme.font.secondary} />
    ) : (
      suffix
    )

  return (
    <>
      <Quantifier color={color}> {moneySymbol}</Quantifier>
      <CurrencySymbol size={1 / 2} color={color}>
        <> {_suffix || (fiatCurrency ? currencies[fiatCurrency].symbol : '')}</>
      </CurrencySymbol>
    </>
  )
}

interface DecimalsProps {
  fadeDecimals?: boolean
  color?: string
  children: ReactNode | ReactNode[]
}

const Decimals = ({ fadeDecimals, color, children }: DecimalsProps) => {
  const theme = useTheme()
  return (
    <AppText color={fadeDecimals ? theme.font.secondary : color} bold={fadeDecimals}>
      {children}
    </AppText>
  )
}

const Quantifier = styled(AppText)`
  color: ${({ theme, color }) => color ?? theme.font.secondary};
  font-weight: bold;
`

const CurrencySymbol = styled(AppText)`
  color: ${({ theme, color }) => color ?? theme.font.secondary};
  font-weight: normal;
`
