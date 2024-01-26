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

import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Portal } from 'react-native-portalize'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import BottomModal from '~/components/layout/BottomModal'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SelectAddressModal from '~/screens/SendReceive/Send/SelectAddressModal'
import {
  selectAddressByHash,
  selectAddressIds,
  selectAllAddresses,
  selectDefaultAddress,
  syncAddressesData
} from '~/store/addressesSlice'

const AddressesScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const isLoading = useAppSelector((s) => s.addresses.syncingAddressData)
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const [isQuickSelectionModalOpen, setIsQuickSelectionModalOpen] = useState(false)

  const [heightCarouselItem, setHeightCarouselItem] = useState(235)
  const [scrollToCarouselPage, setScrollToCarouselPage] = useState<number>()
  const [isSwiping, setIsSwiping] = useState(false)

  useEffect(() => {
    if (defaultAddress?.hash) {
      setSelectedAddressHash(defaultAddress.hash)
      setScrollToCarouselPage(0)
    }
  }, [addressHashes, defaultAddress?.hash])

  const onAddressCardsScrollEnd = (index: number) => {
    Haptics.selectionAsync()

    if (index < addressHashes.length) {
      setSelectedAddressHash(addressHashes[index])
      setScrollToCarouselPage(index)
      setIsSwiping(false)
    }
  }

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height + 15)} key={item}>
      <AddressCard
        addressHash={item}
        onSettingsPress={() => navigation.navigate('EditAddressScreen', { addressHash: item })}
      />
    </View>
  )

  const refreshData = () => {
    if (!isLoading) dispatch(syncAddressesData(addressHashes))
  }

  if (!selectedAddress) return null

  return (
    <>
      <BottomBarScrollScreen
        refreshControl={<RefreshSpinner refreshing={isLoading} onRefresh={refreshData} progressViewOffset={190} />}
        hasBottomBar
        {...props}
      >
        <Content style={contentStyle}>
          <Carousel
            data={addressHashes}
            renderItem={renderAddressCard}
            onSwipingStart={() => setIsSwiping(true)}
            onScrollEnd={onAddressCardsScrollEnd}
            padding={20}
            distance={10}
            height={heightCarouselItem}
            scrollTo={scrollToCarouselPage}
            FooterComponent={
              <>
                {addresses.length > 2 && (
                  <Button
                    onPress={() => setIsQuickSelectionModalOpen(true)}
                    iconProps={{ name: 'list-outline' }}
                    round
                    compact
                  />
                )}
                <Button
                  onPress={() => navigation.navigate('NewAddressScreen')}
                  iconProps={{ name: 'add-outline' }}
                  title="New address"
                  variant="highlightedIcon"
                  compact
                  style={{ marginLeft: addresses.length <= 2 ? 'auto' : undefined }}
                />
              </>
            }
          />
          {selectedAddress && <AddressesTokensList addressHash={selectedAddress.hash} isRefreshing={isSwiping} />}
        </Content>
      </BottomBarScrollScreen>

      <Portal>
        <BottomModal
          isOpen={isQuickSelectionModalOpen}
          onClose={() => setIsQuickSelectionModalOpen(false)}
          maximisedContent
          Content={(props) => (
            <SelectAddressModal
              onAddressPress={(addressHash) => {
                setSelectedAddressHash(addressHash)
                setScrollToCarouselPage(addressHashes.findIndex((hash) => hash === addressHash))
                props.onClose && props.onClose()
                sendAnalytics('Used address quick navigation')
              }}
              {...props}
            />
          )}
        />
      </Portal>
    </>
  )
}

export default AddressesScreen

const Content = styled(Animated.View)`
  flex: 1;
  gap: 10px;
`
