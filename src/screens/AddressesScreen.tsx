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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowDown, ArrowUp, Settings2 } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressCard from '../components/AddressCard'
import AddressesTokensList from '../components/AddressesTokensList'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import Carousel from '../components/Carousel'
import InWalletTransactionsFlatList from '../components/layout/InWalletTransactionsFlatList'
import { ScreenSection } from '../components/layout/Screen'
import QRCodeModal from '../components/QRCodeModal'
import { useAppSelector } from '../hooks/redux'
import InWalletTabsParamList from '../navigation/inWalletRoutes'
import RootStackParamList from '../navigation/rootStackRoutes'
import { selectAddressByHash, selectAddressIds, selectDefaultAddress } from '../store/addressesSlice'
import { selectAddressesConfirmedTransactions } from '../store/confirmedTransactionsSlice'
import { selectAddressesPendingTransactions } from '../store/pendingTransactionsSlice'
import { AddressHash } from '../types/addresses'

interface ScreenProps extends StackScreenProps<InWalletTabsParamList & RootStackParamList, 'AddressesScreen'> {
  style?: StyleProp<ViewStyle>
}

const AddressesScreen = ({ navigation }: ScreenProps) => {
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [selectedAddressHash, setSelectedAddressHash] = useState(defaultAddress?.hash ?? '')
  const [selectedAddress, selectedAddressConfirmedTransactions, selectedAddressPendingTransactions] = useAppSelector(
    (s) => [
      selectAddressByHash(s, selectedAddressHash),
      selectAddressesConfirmedTransactions(s, [selectedAddressHash]),
      selectAddressesPendingTransactions(s, [selectedAddressHash])
    ]
  )

  const theme = useTheme()

  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false)
  const [heightCarouselItem, setHeightCarouselItem] = useState(200)

  useFocusEffect(
    useCallback(() => {
      if (selectedAddressHash) setAreButtonsDisabled(false)
    }, [selectedAddressHash])
  )

  useEffect(() => {
    if (defaultAddress) setSelectedAddressHash(defaultAddress.hash)
  }, [defaultAddress])

  const onAddressCardsScrollEnd = (index: number) => {
    if (index < addressHashes.length) setSelectedAddressHash(addressHashes[index])
    setAreButtonsDisabled(false)
  }

  const onAddressCardsScrollStart = () => setAreButtonsDisabled(true)

  const renderAddressCard = ({ item }: { item: string }) => (
    <View onLayout={(event) => setHeightCarouselItem(event.nativeEvent.layout.height)} key={item}>
      <AddressCard addressHash={item} />
    </View>
  )

  if (!selectedAddress) return null

  return (
    <InWalletTransactionsFlatList
      confirmedTransactions={selectedAddressConfirmedTransactions}
      pendingTransactions={selectedAddressPendingTransactions}
      addressHashes={[selectedAddressHash]}
      haveAllPagesLoaded={selectedAddress.allTransactionPagesLoaded}
      initialNumToRender={5}
      showInternalInflows
      ListHeaderComponent={
        <>
          <Carousel
            data={addressHashes}
            renderItem={renderAddressCard}
            onScrollStart={onAddressCardsScrollStart}
            onScrollEnd={onAddressCardsScrollEnd}
            padding={30}
            distance={20}
            height={heightCarouselItem}
          />
          <ScreenSection>
            <ButtonsRowStyled>
              <Button
                title="Send"
                icon={<ArrowUp size={24} color={theme.font.contrast} />}
                onPress={() => navigation.navigate('SendScreen', { addressHash: selectedAddressHash })}
                disabled={areButtonsDisabled}
                circular
              />
              <Button
                title="Receive"
                icon={<ArrowDown size={24} color={theme.font.contrast} />}
                onPress={() => navigation.navigate('ReceiveScreen', { addressHash: selectedAddressHash })}
                disabled={areButtonsDisabled}
                circular
              />
              <Button
                title="Settings"
                icon={<Settings2 size={24} color={theme.font.contrast} />}
                onPress={() => navigation.navigate('EditAddressScreen', { addressHash: selectedAddressHash })}
                disabled={areButtonsDisabled}
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
        </>
      }
    />
  )
}

export default AddressesScreen

const ButtonsRowStyled = styled(ButtonsRow)`
  margin: 0 20px;
`
