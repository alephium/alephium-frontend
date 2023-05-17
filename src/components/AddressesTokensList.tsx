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

import { chunk } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import useTokenMetadata from '../hooks/useTokenMetadata'
import { makeSelectTokens, selectAllAddresses } from '../store/addressesSlice'
import { selectIsPriceUninitialized } from '../store/priceSlice'
import { Address } from '../types/addresses'
import { AddressToken, ALEPHIUM_TOKEN_ID, TokenMetadata } from '../types/tokens'
import Carousel from './Carousel'
import HighlightRow from './HighlightRow'
import { ScreenSection, ScreenSectionTitle } from './layout/Screen'
import TokenInfo from './TokenInfo'

const PAGE_SIZE = 3

interface AddressesTokensListProps {
  addresses?: Address[]
}

const AddressesTokensList = ({ addresses: addressesParam }: AddressesTokensListProps) => {
  const allAddresses = useAppSelector(selectAllAddresses)
  const isPriceUninitialized = useAppSelector(selectIsPriceUninitialized)
  const price = useAppSelector((s) => s.price.value)
  const addressDataStatus = useAppSelector((s) => s.addresses.status)
  const fiatCurrency = useAppSelector((s) => s.settings.currency)
  const addresses = addressesParam ?? allAddresses
  const selectTokens = useMemo(makeSelectTokens, [])
  const tokens = useAppSelector((s) => selectTokens(s, addresses))
  const tokenMetadata = useTokenMetadata()

  const [carouselItemHeight, setCarouselItemHeight] = useState(258)
  const [isCarouselItemHeightAdapted, setIsCarouselItemHeightAdapted] = useState(false)
  const [tokensChunked, setTokensChunked] = useState<AddressToken[][]>([])

  const isLoading = isPriceUninitialized || addressDataStatus === 'uninitialized'

  tokens.forEach((token) => {
    token.worth = {
      // TODO: Fetch token prices
      price: undefined,
      currency: fiatCurrency
    }
  })

  const sortByWorthThenName = useCallback(
    (tokenA: AddressToken, tokenB: AddressToken) => {
      if (tokenA.worth?.price !== undefined && tokenB.worth?.price !== undefined) {
        return (tokenB.worth.price ?? 0) - (tokenA.worth.price ?? 0)
      }

      if (!tokenMetadata) {
        return tokenA.id.localeCompare(tokenB.id)
      }

      const tokenAName = tokenMetadata[tokenA.id]?.name
      const tokenBName = tokenMetadata[tokenB.id]?.name

      if (!tokenAName || !tokenBName) {
        return tokenA.id.localeCompare(tokenB.id)
      }

      return tokenAName.localeCompare(tokenBName)
    },
    [tokenMetadata]
  )

  useEffect(() => {
    if (addressDataStatus === 'uninitialized') return

    const alephiumToken: AddressToken = {
      id: ALEPHIUM_TOKEN_ID,
      balances: {
        balance: addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0)).toString(),
        lockedBalance: addresses.reduce((acc, address) => acc + BigInt(address.lockedBalance), BigInt(0)).toString()
      },
      worth: {
        price,
        currency: fiatCurrency
      }
    }

    setTokensChunked(chunk(tokens.concat([alephiumToken]).sort(sortByWorthThenName), PAGE_SIZE))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressDataStatus, addresses, fiatCurrency, price, sortByWorthThenName])

  const onLayoutCarouselItem = (event: LayoutChangeEvent) => {
    const newCarouselItemHeight = event.nativeEvent.layout.height

    if (!isCarouselItemHeightAdapted || (isCarouselItemHeightAdapted && newCarouselItemHeight > carouselItemHeight)) {
      setCarouselItemHeight(newCarouselItemHeight)
      setIsCarouselItemHeightAdapted(true)
    }
  }

  const renderCarouselItem = ({ item }: { item: AddressToken[] }) => (
    <View onLayout={onLayoutCarouselItem}>
      {item.map((token) => {
        const metadata =
          token.id === ALEPHIUM_TOKEN_ID
            ? ({
                name: 'Alephium',
                decimals: 18
              } as TokenMetadata)
            : tokenMetadata
            ? tokenMetadata[token.id]
            : undefined

        return (
          <HighlightRow key={token.id}>
            <TokenInfo {...{ ...token, ...metadata }} isLoading={isLoading} />
          </HighlightRow>
        )
      })}
    </View>
  )

  return (
    <>
      {tokensChunked.length > 1 && (
        <>
          <ScreenSectionTitleStyled>Assets</ScreenSectionTitleStyled>
          <Carousel
            data={tokensChunked}
            renderItem={renderCarouselItem}
            padding={20}
            distance={10}
            height={carouselItemHeight}
          />
        </>
      )}
      {tokensChunked.length === 1 && (
        <ScreenSection>
          <ScreenSectionTitle>Assets</ScreenSectionTitle>
          {renderCarouselItem({ item: tokensChunked[0] })}
        </ScreenSection>
      )}
    </>
  )
}

export default AddressesTokensList

const ScreenSectionTitleStyled = styled(ScreenSectionTitle)`
  margin-left: 28px;
`
