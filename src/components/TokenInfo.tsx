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
import { convertSetToAlph, NUM_OF_ZEROS_IN_QUINTILLION, produceZeros } from '@alephium/sdk'
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AlephiumLogo from '../images/logos/AlephiumLogo'
import { AddressToken, ALEPHIUM_TOKEN_ID, TokenMetadata } from '../types/tokens'
import { currencies } from '../utils/currencies'
import Amount from './Amount'
import AppText from './AppText'

interface TokenInfoProps extends AddressToken, Partial<TokenMetadata> {
  id: string
  isLoading?: boolean
  style?: StyleProp<ViewStyle>
}

// TODO: Use official Alephium tokens-meta repo
const TOKEN_IMAGE_URL = 'https://raw.githubusercontent.com/nop33/token-meta/master/images/'

const TokenInfo = ({ id, name, balances, worth, isLoading, image, symbol, decimals, style }: TokenInfoProps) => {
  const theme = useTheme()
  const trailingZeros = produceZeros(NUM_OF_ZEROS_IN_QUINTILLION - (decimals ?? 0))
  const tokenBalance = convertSetToAlph(BigInt(balances.balance + trailingZeros))
  const fiatValue = worth?.price ? parseFloat(tokenBalance) * worth.price : undefined
  const isAlph = id === ALEPHIUM_TOKEN_ID

  return (
    <View style={style}>
      <LeftGroup>
        <TokenIcon>
          {isAlph ? <AlephiumLogo /> : image && <TokenLogo source={{ uri: `${TOKEN_IMAGE_URL}${image}` }} />}
        </TokenIcon>
        <AppText bold numberOfLines={1} style={{ flexShrink: 1 }}>
          {name ?? id}
        </AppText>
      </LeftGroup>
      <Amounts>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.font.primary} />
        ) : (
          <>
            <AmountToken value={BigInt(balances.balance)} fadeDecimals suffix={symbol} />
            {fiatValue !== undefined && worth && (
              <Amount value={fiatValue} isFiat suffix={currencies[worth.currency].symbol} fadeDecimals />
            )}
          </>
        )}
      </Amounts>
    </View>
  )
}

export default styled(TokenInfo)`
  flex-direction: row;
`

const LeftGroup = styled.View`
  flex: 1;
  align-items: center;
  flex-direction: row;
  margin-right: 10px;
`

const Amounts = styled.View`
  flex-direction: column;
  justify-content: center;
  text-align: right;
  align-items: flex-end;
`

const TokenIcon = styled.View`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  border-width: 1px;
  padding: 7px;
  margin-right: 10px;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const TokenLogo = styled.Image`
  width: 100%;
  height: 100%;
`

const AmountToken = styled(Amount)`
  font-weight: 700;
`
