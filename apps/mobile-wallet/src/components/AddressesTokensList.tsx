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

import { AddressHash, Asset } from '@alephium/shared'
import { Skeleton } from 'moti/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native'
import { Portal } from 'react-native-portalize'
import Animated, { CurvedTransition } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import BottomModal from '~/components/layout/BottomModal'
import NFTsGrid from '~/components/NFTsGrid'
import TabBar, { TabItem } from '~/components/TabBar'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs
} from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addressHash?: AddressHash
  isRefreshing?: boolean
  style?: StyleProp<ViewStyle>
}

type LoadingIndicator = {
  isLoadingTokens: boolean
}

type TokensRow = Asset | UnknownTokensEntry | LoadingIndicator

const AddressesTokensList = ({ addressHash, isRefreshing, style }: AddressesTokensListProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const isLoadingTokenBalances = useAppSelector((s) => s.loaders.loadingTokens)
  const isLoadingUnverified = useAppSelector((s) => s.fungibleTokens.loadingUnverified)
  const isLoadingVerified = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const isLoadingNfts = useAppSelector((s) => s.nfts.loading)
  const theme = useTheme()
  const { t } = useTranslation()

  const showTokensSkeleton = isLoadingTokenBalances || isLoadingUnverified || isLoadingVerified || isLoadingTokenTypes
  const showNFTListLoading = showTokensSkeleton || isLoadingNfts
  const showTokensSpinner = showTokensSkeleton || showNFTListLoading

  const [tokenRows, setTokenRows] = useState<TokensRow[]>([])
  const [isNftsModalOpen, setIsNftsModalOpen] = useState(false)

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        value: 'tokens',
        label: (
          <>
            <AppText semiBold>{t('Tokens')}</AppText>
            <Badge rounded>
              {showTokensSpinner ? <AssetNumberLoader /> : knownFungibleTokens.length + unknownTokens.length}
            </Badge>
          </>
        )
      },
      {
        value: 'nfts',
        label: (
          <>
            <AppText semiBold>{t('NFTs')}</AppText>
            <Badge rounded>{showNFTListLoading ? <AssetNumberLoader /> : nfts.length}</Badge>
          </>
        )
      }
    ],
    [knownFungibleTokens.length, nfts.length, showNFTListLoading, showTokensSpinner, t, unknownTokens.length]
  )

  const [activeTab, setActiveTab] = useState(tabItems[0])

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
      ...(showTokensSkeleton ? [{ isLoadingTokens: true }] : [])
    ]

    setTokenRows(entries)
  }, [addressHash, showTokensSkeleton, knownFungibleTokens, unknownTokens.length])

  const handleTabChange = (tab: TabItem) => {
    if (tab.value === 'nfts' && !showNFTListLoading) {
      setIsNftsModalOpen(true)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <ListContainer style={style} layout={CurvedTransition}>
      <TabBarStyled items={tabItems} onTabChange={handleTabChange} activeTab={activeTab} />
      {
        {
          tokens: (
            <>
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
            </>
          ),
          nfts: null
        }[activeTab.value]
      }
      {isRefreshing && (
        <>
          <LoadingOverlay />
          <Loader>
            <ActivityIndicator size={72} color={theme.font.tertiary} />
          </Loader>
        </>
      )}
      <Portal>
        <BottomModal
          Content={(props) => <NFTsGrid addressHash={addressHash} {...props} />}
          isOpen={isNftsModalOpen}
          onClose={() => setIsNftsModalOpen(false)}
        />
      </Portal>
    </ListContainer>
  )
}

const AssetNumberLoader = () => (
  <AssetNumberLoaderContainer>
    <ActivityIndicator style={{ transform: [{ scale: 0.6 }] }} />
  </AssetNumberLoaderContainer>
)

export default styled(AddressesTokensList)`
  padding-top: 5px;
  padding-bottom: 10px;
`

const LoadingRow = styled.View`
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  padding-top: 15px;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const TabBarStyled = styled(TabBar)`
  padding: 10px 15px 10px;
`

const ListContainer = styled(Animated.View)`
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  position: relative;
`

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg.back1};
  opacity: 0.8;
`

const Loader = styled.View`
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  align-items: center;
`

const AssetNumberLoaderContainer = styled.View`
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;
`

const isAsset = (item: TokensRow): item is Asset => (item as Asset).id !== undefined

const isUnknownTokens = (item: TokensRow): item is UnknownTokensEntry =>
  (item as UnknownTokensEntry).numberOfUnknownTokens !== undefined
