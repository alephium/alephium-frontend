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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Portal } from 'react-native-portalize'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { css, useTheme } from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { TabBarPageProps } from '~/components/layout/TabBarPager'
import RefreshSpinner from '~/components/RefreshSpinner'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import EditAddressModal from '~/screens/Address/EditAddressModal'
import {
  selectAddressByHash,
  selectAddressIds,
  selectAllAddresses,
  selectDefaultAddress,
  syncAddressesData
} from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { AddressHash } from '~/types/addresses'

const AddressesScreen = ({ onScroll, contentStyle, ...props }: BottomBarScrollScreenProps & TabBarPageProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const posthog = usePostHog()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const isLoading = useAppSelector((s) => s.addresses.syncingAddressData)
  const addresses = useAppSelector(selectAllAddresses)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const [isQuickSelectionModalOpen, setIsQuickSelectionModalOpen] = useState(false)
  const [isAddressSettingsModalOpen, setIsAddressSettingsModalOpen] = useState(false)

  const [heightCarouselItem, setHeightCarouselItem] = useState(220)
  const [scrollToCarouselPage, setScrollToCarouselPage] = useState<number>()

  useEffect(() => {
    if (defaultAddress?.hash) {
      setSelectedAddressHash(defaultAddress.hash)
      setScrollToCarouselPage(0)
    }
  }, [addressHashes, defaultAddress?.hash])

  const onAddressCardsScrollEnd = (index: number) => {
    if (index < addressHashes.length) {
      setSelectedAddressHash(addressHashes[index])
      setScrollToCarouselPage(index)
    }
  }

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height)} key={item}>
      <AddressCard addressHash={item} onSettingsPress={() => setIsAddressSettingsModalOpen(true)} />
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
        onScroll={onScroll}
        hasBottomBar
        {...props}
      >
        <Content style={contentStyle}>
          <Carousel
            data={addressHashes}
            renderItem={renderAddressCard}
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
                  color={theme.global.accent}
                  compact
                />
              </>
            }
          />
          {selectedAddress && <AddressesTokensList addressHash={selectedAddress.hash} style={{ paddingBottom: 50 }} />}
        </Content>
      </BottomBarScrollScreen>

      <Portal>
        <BottomModal
          isOpen={isQuickSelectionModalOpen}
          onClose={() => setIsQuickSelectionModalOpen(false)}
          scrollableContent
          Content={(props) => (
            <ModalContent {...props}>
              <FlatList
                data={addresses}
                style={{ marginBottom: insets.bottom + insets.top }}
                keyExtractor={(item) => item.hash}
                contentContainerStyle={{ gap: VERTICAL_GAP }}
                canCancelContentTouches={true}
                renderItem={({ item: address, index }) => (
                  <AddressBoxStyled
                    key={address.hash}
                    addressHash={address.hash}
                    isFirst={index === 0}
                    isLast={index === addresses.length - 1}
                    onPress={() => {
                      setSelectedAddressHash(address.hash)
                      setScrollToCarouselPage(addressHashes.findIndex((hash) => hash === address.hash))
                      props.onClose && props.onClose()
                      posthog?.capture('Used address quick navigation')
                    }}
                  />
                )}
              />
            </ModalContent>
          )}
        />

        <BottomModal
          isOpen={isAddressSettingsModalOpen}
          onClose={() => setIsAddressSettingsModalOpen(false)}
          scrollableContent
          Content={(props) => <EditAddressModal addressHash={selectedAddress.hash} {...props} />}
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

const AddressBoxStyled = styled(AddressBox)`
  margin: 10px 20px;

  ${({ isFirst }) =>
    isFirst &&
    css`
      margin-top: 20px;
    `}

  ${({ isLast }) =>
    isLast &&
    css`
      margin-bottom: 40px;
    `}
`
