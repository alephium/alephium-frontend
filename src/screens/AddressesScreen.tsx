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
import { ArrowDown, ArrowUp } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { RefreshControl, StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AddressCard from '~/components/AddressCard'
import AddressesTokensList from '~/components/AddressesTokensList'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import Carousel from '~/components/Carousel'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import QRCodeModal from '~/components/QRCodeModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressByHash, selectAddressIds, selectDefaultAddress, syncAddressesData } from '~/store/addressesSlice'
import { AddressHash } from '~/types/addresses'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'AddressesScreen'> {
  style?: StyleProp<ViewStyle>
}

const AddressesScreen = ({ navigation, style }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector((s) => s.addresses.loading)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const selectedAddress = useAppSelector((s) => selectAddressByHash(s, selectedAddressHash))

  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)
  const [heightCarouselItem, setHeightCarouselItem] = useState(200)

  useEffect(() => {
    if (defaultAddress) setSelectedAddressHash(defaultAddress.hash)
  }, [defaultAddress])

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
    <ScrollScreen style={style} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}>
      <Carousel
        data={addressHashes}
        renderItem={renderAddressCard}
        onScrollEnd={onAddressCardsScrollEnd}
        padding={30}
        distance={20}
        height={heightCarouselItem}
      />
      <ScreenSection>
        <ButtonsRowStyled>
          <Button
            title="Send"
            Icon={ArrowUp}
            onPress={() => navigation.navigate('SendScreen', { addressHash: selectedAddressHash })}
            circular
          />
          <Button
            title="Receive"
            Icon={ArrowDown}
            onPress={() => navigation.navigate('ReceiveScreen', { addressHash: selectedAddressHash })}
            circular
          />
        </ButtonsRowStyled>
      </ScreenSection>
      {selectedAddress && <AddressesTokensList addresses={[selectedAddress]} />}
      <QRCodeModal
        addressHash={selectedAddressHash}
        isOpen={isQrCodeModalOpen}
        onClose={() => setIsQrCodeModalOpen(false)}
      />
    </ScrollScreen>
  )
}

export default AddressesScreen

const ButtonsRowStyled = styled(ButtonsRow)`
  margin: 0 20px;
`
