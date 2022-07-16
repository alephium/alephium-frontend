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
import { Clipboard as ClipboardIcon, QrCode as QrCodeIcon, Star as StarIcon } from 'lucide-react-native'
import React, { useState } from 'react'
import { Modal, ScrollView, Text, View } from 'react-native'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import Badge from '../components/Badge'
import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import List, { ListItem } from '../components/List'
import TransactionsList from '../components/TransactionsList'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { storeAddressMetadata } from '../storage/wallets'
import { mainAddressChanged, selectAddressByHash } from '../store/addressesSlice'
import { copyAddressToClipboard, getAddressDisplayName } from '../utils/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddressScreen'>

const AddressScreen = ({
  navigation,
  route: {
    params: { addressHash }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash))
  const mainAddress = useAppSelector((state) => selectAddressByHash(state, state.addresses.mainAddress))
  const mainAddressHash = useAppSelector((state) => state.addresses.mainAddress)
  const activeWalletMetadataId = useAppSelector((state) => state.activeWallet.metadataId)
  const isCurrentAddressMain = addressHash === mainAddressHash
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)

  if (!address) return null

  const makeAddressMain = async () => {
    if (address.settings.isMain) return

    dispatch(mainAddressChanged(address))

    if (activeWalletMetadataId) {
      if (mainAddress) {
        await storeAddressMetadata(activeWalletMetadataId, {
          index: mainAddress.index,
          ...mainAddress.settings,
          isMain: false
        })
      }
      await storeAddressMetadata(activeWalletMetadataId, {
        index: address.index,
        ...address.settings,
        isMain: true
      })
    }
  }

  console.log('AddressScreen renders')

  return (
    <Screen>
      <ScrollView>
        <Header>
          <BadgeStyled rounded border color={address.settings.color}>
            <BadgeText>{getAddressDisplayName(address)}</BadgeText>
          </BadgeStyled>
          <Actions>
            <ButtonStyled icon variant="contrast" onPress={makeAddressMain} disabled={isCurrentAddressMain}>
              <StarIcon fill={isCurrentAddressMain ? '#FFD66D' : theme.bg.tertiary} size={22} />
            </ButtonStyled>
            <ButtonStyled icon variant="contrast" onPress={() => copyAddressToClipboard(address)}>
              <ClipboardIcon color={theme.font.primary} size={20} />
            </ButtonStyled>
            <ButtonStyled icon variant="contrast" onPress={() => setIsQrCodeModalOpen(true)}>
              <QrCodeIcon color={theme.font.primary} size={20} />
            </ButtonStyled>
          </Actions>
        </Header>
        <ScreenSection>
          <List>
            <ListItemStyled>
              <Label>Address</Label>
              <View>
                <Text>{address.hash.substring(0, 20)}...</Text>
              </View>
            </ListItemStyled>
            <ListItemStyled>
              <Label>Number of transactions</Label>
              <View>
                <NumberOfTxs>{address.networkData.details.txNumber}</NumberOfTxs>
              </View>
            </ListItemStyled>
            <ListItemStyled>
              <Label>Locked ALPH balance</Label>
              <View>
                <Badge border light>
                  <Amount value={BigInt(address.networkData.details.lockedBalance)} fadeDecimals />
                </Badge>
              </View>
            </ListItemStyled>
            <ListItemStyled>
              <Label>Total ALPH balance</Label>
              <View>
                <Badge light>
                  <Amount value={BigInt(address.networkData.details.balance)} fadeDecimals />
                </Badge>
              </View>
            </ListItemStyled>
          </List>
        </ScreenSection>
        <ScreenSection>
          <TransactionsList addressHashes={[address.hash]} />
        </ScreenSection>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isQrCodeModalOpen}
        onRequestClose={() => {
          setIsQrCodeModalOpen(!isQrCodeModalOpen)
        }}
      >
        <ModalContent>
          <QRCodeContainer>
            <QRCode size={256} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} value={address.hash} />
          </QRCodeContainer>
        </ModalContent>
      </Modal>
    </Screen>
  )
}

const ScreenSection = styled(View)`
  padding: 20px;
`

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin: 40px 20px;
  max-width: 100%;
`

const Actions = styled(View)`
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
`

const ButtonStyled = styled(Button)`
  margin-left: 20px;
`

const Label = styled(Text)`
  color: ${({ theme }) => theme.font.secondary};
`

const ListItemStyled = styled(ListItem)`
  justify-content: space-between;
  padding: 14px 20px;
  min-height: 55px;
`

const BadgeText = styled(Text)`
  font-weight: 700;
  font-size: 18px;
`

const NumberOfTxs = styled(Text)`
  font-weight: 700;
`

const BadgeStyled = styled(Badge)`
  flex-shrink: 1;
`

const ModalContent = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const QRCodeContainer = styled(View)`
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 10px;
  padding: 20px;
  align-items: center;
  ${({ theme }) => theme.shadow.primary}
`

export default AddressScreen
