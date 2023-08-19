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

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useHeaderHeight } from '@react-navigation/elements'
import { StackScreenProps } from '@react-navigation/stack'
import { ListIcon, PlusIcon } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { RefreshControl, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useScrollEventHandler } from '~/contexts/ScrollContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectAddressByHash, selectAddressIds, selectDefaultAddress, syncAddressesData } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

type ScreenProps = StackScreenProps<AddressTabsParamList, 'AddressesScreen'> &
  StackScreenProps<SendNavigationParamList, 'AddressesScreen'> & {
    style?: StyleProp<ViewStyle>
  }

const AddressesScreen = ({ navigation, style, route: { params } }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const scrollHandler = useScrollEventHandler()
  const headerHeight = useHeaderHeight()
  const bottomTabBarHeight = useBottomTabBarHeight()

  const isLoading = useAppSelector((s) => s.addresses.syncingAddressData)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const [heightCarouselItem, setHeightCarouselItem] = useState(200)
  const [scrollToCarouselPage, setScrollToCarouselPage] = useState<number>()

  useEffect(() => {
    if (params?.addressHash) {
      setSelectedAddressHash(params.addressHash)
      setScrollToCarouselPage(addressHashes.findIndex((hash) => hash === params.addressHash))
    } else if (defaultAddress) {
      setSelectedAddressHash(defaultAddress.hash)
    }
  }, [addressHashes, defaultAddress, params?.addressHash])

  const onAddressCardsScrollEnd = (index: number) => {
    if (index < addressHashes.length) setSelectedAddressHash(addressHashes[index])
  }

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height)} key={item}>
      <AddressCard addressHash={item} />
    </View>
  )

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  if (!selectedAddress) return null

  return (
    <ScrollScreenStyled
      style={[style, { paddingTop: headerHeight, paddingBottom: bottomTabBarHeight }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
      onScroll={scrollHandler}
      alwaysBounceVertical={false}
    >
      <ScreenContent>
        <Carousel
          data={addressHashes}
          renderItem={renderAddressCard}
          onScrollEnd={onAddressCardsScrollEnd}
          padding={30}
          distance={20}
          height={heightCarouselItem}
          scrollTo={scrollToCarouselPage}
          FooterComponent={
            <>
              <Button
                onPress={() => navigation.navigate('AddressQuickNavigationScreen')}
                Icon={ListIcon}
                type="transparent"
              />
              <Button
                onPress={() => navigation.navigate('NewAddressNavigation')}
                Icon={PlusIcon}
                title="New address"
                color={theme.global.accent}
                compact
              />
            </>
          }
        />
        {selectedAddress && <AddressesTokensList addressHash={selectedAddress.hash} style={{ paddingBottom: 50 }} />}
      </ScreenContent>
    </ScrollScreenStyled>
  )
}

export default AddressesScreen

const ScrollScreenStyled = styled(ScrollScreen)``

const ScreenContent = styled.View`
  padding-top: 15px;
`
