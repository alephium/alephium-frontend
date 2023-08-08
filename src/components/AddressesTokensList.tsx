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

import { Asset } from '@alephium/sdk'
import { Skeleton } from 'moti/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import NFTsGrid from '~/components/NFTsGrid'
import TabBar from '~/components/TabBar'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs
} from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

import { ScreenSection } from './layout/Screen'
import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addressHash?: AddressHash
  style?: StyleProp<ViewStyle>
}

type LoadingIndicator = {
  isLoadingTokens: boolean
}

type TokensRow = Asset | UnknownTokensEntry | LoadingIndicator

const tabItems = [
  {
    value: 'tokens',
    label: 'Tokens'
  },
  {
    value: 'nfts',
    label: 'NFTs'
  }
]

const AddressesTokensList = ({ addressHash, style }: AddressesTokensListProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const isLoadingTokenBalances = useAppSelector((s) => s.addresses.loadingTokens)
  const isLoadingTokensMetadata = useAppSelector((s) => s.assetsInfo.loading)
  const theme = useTheme()

  const [tokenRows, setTokenRows] = useState<TokensRow[]>([])
  const [activeTab, setActiveTab] = useState(tabItems[0])

  const isLoading = isLoadingTokenBalances || isLoadingTokensMetadata

  useEffect(() => {
    const entries: TokensRow[] = [
      ...knownFungibleTokens,
      ...(unknownTokens.length > 0
        ? [
            {
              numberOfUnknownTokens: unknownTokens.length,
              addressHash
            }
          ]
        : []),
      ...(isLoading ? [{ isLoadingTokens: true }] : [])
    ]

    setTokenRows(entries)
  }, [addressHash, isLoading, knownFungibleTokens, unknownTokens.length])

  return (
    <View style={style}>
      <TabBar items={tabItems} onTabChange={setActiveTab} activeTab={activeTab} />
      {
        {
          tokens: (
            <ScreenSection>
              {tokenRows.map((entry, index) =>
                isAsset(entry) ? (
                  <TokenListItem
                    key={entry.id}
                    asset={entry}
                    hideSeparator={index === knownFungibleTokens.length - 1 && unknownTokens.length === 0}
                  />
                ) : isUnknownTokens(entry) ? (
                  <UnknownTokensListItem entry={entry} key="unknown-tokens" />
                ) : (
                  <LoadingRow key="loading">
                    <Skeleton show colorMode={theme.name} width={36} height={36} radius="round" />
                    <Skeleton show colorMode={theme.name} width={200} height={36} />
                  </LoadingRow>
                )
              )}
            </ScreenSection>
          ),
          nfts: <NFTsGrid nfts={nfts} isLoading={isLoading} />
        }[activeTab.value]
      }
    </View>
  )
}

export default AddressesTokensList

const LoadingRow = styled.View`
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  padding-top: 16px;
`

const isAsset = (item: TokensRow): item is Asset => (item as Asset).id !== undefined

const isUnknownTokens = (item: TokensRow): item is UnknownTokensEntry =>
  (item as UnknownTokensEntry).numberOfUnknownTokens !== undefined
