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

import { StackScreenProps } from '@react-navigation/stack'
import { colord } from 'colord'
import { ListIcon, PlusIcon, Upload } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { RefreshControl, StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import Carousel from '~/components/Carousel'
import ScrollScreen from '~/components/layout/ScrollScreen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectAddressByHash, selectAddressIds, selectDefaultAddress, syncAddressesData } from '~/store/addressesSlice'
import { themes } from '~/style/themes'
import { AddressHash } from '~/types/addresses'

type ScreenProps = StackScreenProps<AddressTabsParamList, 'AddressesScreen'> &
  StackScreenProps<SendNavigationParamList, 'AddressesScreen'> & {
    style?: StyleProp<ViewStyle>
  }

const AddressesScreen = ({ navigation, style, route: { params } }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((s) => s.addresses.syncingAddressData)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))
  const theme = useTheme()

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

  const floatingButtonBgColor = selectedAddress.settings.color ?? theme.font.primary

  return (
    <>
      <ScrollScreenStyled
        style={style}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
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
      <FloatingButton
        Icon={Upload}
        round
        bgColor={floatingButtonBgColor}
        color={colord(floatingButtonBgColor).isDark() ? themes.light.font.contrast : themes.light.font.primary}
        onPress={() =>
          navigation.navigate('SendNavigation', {
            screen: 'DestinationScreen',
            params: { fromAddressHash: selectedAddressHash }
          })
        }
      />
    </>
  )
}

export default AddressesScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const ScreenContent = styled.View`
  padding-top: 30px;
`

const FloatingButton = styled(Button)<{ bgColor: string }>`
  position: absolute;
  bottom: 18px;
  right: 18px;
  background-color: ${({ bgColor }) => bgColor};
  width: 56px;
  height: 56px;
`
