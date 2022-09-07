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

import { FC, useEffect, useState } from 'react'
import { ActivityIndicator, LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import Alef from '../images/icons/Alef'
import Alph from '../images/tokens/Alph'
import UndefinedSymbol from '../images/tokens/UndefinedSymbol'
import { Address, selectAllAddresses } from '../store/addressesSlice'
import { ALEPHIUM_TOKEN_ID, Token, Worth } from '../types/tokens'
import Amount from './Amount'
import AppText from './AppText'
import Carousel from './Carousel'
import HighlightRow from './HighlightRow'

type TickerSymbol = 'ALPH' | 'THO' | 'WSOL'

interface TokenResource {
  name: string
  visualSymbol: FC<{ style: StyleProp<ViewStyle> }>
  suffix: FC | string
}

const PAGE_SIZE = 3

const tokenIdToTickerSymbol: Record<string, TickerSymbol> = {
  [ALEPHIUM_TOKEN_ID]: 'ALPH',
  e7f681d3a85531e9f33771404bd96a0fa753cd11db9061b545add5058884428f: 'THO',
  '2': 'WSOL'
}

const tokensResources: Record<TickerSymbol, TokenResource> = {
  ALPH: {
    name: 'Alephium',
    visualSymbol: Alph,
    suffix: Alef
  },
  THO: {
    name: 'Thomacoin',
    visualSymbol: UndefinedSymbol,
    suffix: 'THO'
  },
  WSOL: {
    name: 'Wrapped SOL',
    visualSymbol: UndefinedSymbol,
    suffix: 'WSOL'
  }
}

const sortByWorthThenName = (a: Token, b: Token) => {
  if (a.worth !== undefined && b.worth !== undefined) {
    return (b.worth?.amount ?? 0) - (a.worth?.amount ?? 0)
  }

  const tokenASymbol = tokenIdToTickerSymbol[a.id]
  const tokenBSymbol = tokenIdToTickerSymbol[b.id]
  if (!tokenASymbol || !tokenBSymbol) {
    return a.id.localeCompare(b.id)
  }

  const tokenAName = tokensResources[tokenASymbol].name
  const tokenBName = tokensResources[tokenBSymbol].name
  return tokenAName.localeCompare(tokenBName)
}

const TokensList = () => {
  const price = useAppSelector((state) => state.price)
  const addresses = useAppSelector(selectAllAddresses)
  const addressDataStatus = useAppSelector((state) => state.addresses.status)
  const isLoading = price.status === 'uninitialized' || addressDataStatus === 'uninitialized'
  const fiatCurrency = useAppSelector((state) => state.settings.currency)
  const [tokensChunked, setTokensChunked] = useState<Token[][]>([])
  const [heightCarouselItem, setHeightCarouselItem] = useState(200)
  const theme = useTheme()

  useEffect(() => {
    if (addressDataStatus === 'uninitialized') return

    const totalBalance = addresses.reduce(
      (acc, address) => acc + BigInt(address.networkData.details.balance),
      BigInt(0)
    )

    const alephiumToken = { id: ALEPHIUM_TOKEN_ID, balance: totalBalance.toString(), lockedBalance: '0' }

    setTokensChunked(
      addresses
        .flatMap((address: Address) => address.tokens)
        .concat([alephiumToken])
        .filter((t?: Token) => t !== undefined)
        .map((t: Token) => ({
          ...t,
          // For now, only Alephium has any fiat/alternative prices.
          worth:
            t.id == ALEPHIUM_TOKEN_ID
              ? {
                  amount: price.value,
                  currency: fiatCurrency
                }
              : undefined
        }))
        .sort(sortByWorthThenName)
        .reduce((acc: Token[][], cur: Token, index: number) => {
          // If reached page size or is starting, create a new page
          if (index % PAGE_SIZE === 0) {
            acc.push([cur])
            // Otherwise push to the current page of tokens
          } else {
            acc[acc.length - 1].push(cur)
          }
          return acc
        }, [])
    )
  }, [addressDataStatus, addresses, price, fiatCurrency])

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    setHeightCarouselItem(event.nativeEvent.layout.height)
  }

  const toCarouselItem = ({ item }: { item: Token[] }) => (
    <View onLayout={onLayoutCarouselItem} style={{ marginRight: tokensChunked.length == 1 ? 0 : 16 }}>
      {item.map((token, index, arr) => (
        <HighlightRow
          key={token.id}
          isTopRounded={index === 0}
          isBottomRounded={index === arr.length - 1}
          hasBottomBorder={arr.length > 1}
        >
          <TokenInfo id={token.id} amount={BigInt(token.balance)} isLoading={isLoading} worth={token.worth} />
        </HighlightRow>
      ))}
    </View>
  )

  return addressDataStatus === 'uninitialized' ? (
    <ActivityIndicator size="large" color={theme.font.primary} />
  ) : (
    <Carousel
      data={tokensChunked}
      renderItem={toCarouselItem}
      offsetX={tokensChunked.length == 1 ? 0 : 24}
      height={heightCarouselItem}
    />
  )
}

export default TokensList

interface TokenInfoProps {
  id: string
  amount?: bigint
  worth?: Worth
  isLoading?: boolean
  style?: StyleProp<ViewStyle>
}

let TokenInfo = ({ id, amount, worth, isLoading, style }: TokenInfoProps) => {
  const theme = useTheme()

  const token = tokenIdToTickerSymbol[id]
  const tokenResource = tokensResources[token]
  const VisualSymbol = tokenResource?.visualSymbol ?? UndefinedSymbol
  const name = tokenResource?.name ?? id
  const suffix = tokenResource?.suffix ?? ''

  return (
    <>
      <TokenInfoIconName>
        <VisualSymbol style={{ width: 45, height: 46 }} />
        <AppText bold leftPadding size={1} numberOfLines={1} style={{ flexShrink: 1 }}>
          {name}
        </AppText>
      </TokenInfoIconName>
      <TokenInfoPrices>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.font.primary} />
        ) : (
          <>
            <Amount size={1} value={amount} fadeDecimals suffix={suffix} />
            {worth?.amount && (
              <Amount value={amount} fadeDecimals fiat={worth?.amount} fiatCurrency={worth?.currency} />
            )}
          </>
        )}
      </TokenInfoPrices>
    </>
  )
}

TokenInfo = styled(TokenInfo)`
  flex-direction: row;
`

const TokenInfoIconName = styled(View)`
  flex: 1;
  align-items: center;
  flex-direction: row;
  margin-right: 8px;
`

const TokenInfoPrices = styled(View)`
  flex-direction: column;
  justify-content: center;
  text-align: right;
  align-items: flex-end;
`
