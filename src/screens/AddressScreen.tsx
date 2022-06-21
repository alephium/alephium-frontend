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
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
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
    params: { address }
  }
}: ScreenProps) => {
  const theme = useTheme()
  const activeWalletMetadataId = useAppSelector((state) => state.activeWallet.metadataId)
  const mainAddressHash = useAppSelector((state) => state.addresses.mainAddress)
  const mainAddress = useAppSelector((state) => selectAddressByHash(state, state.addresses.mainAddress))
  const isCurrentAddressMain = address.hash === mainAddressHash
  const dispatch = useAppDispatch()

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
            <ButtonStyled icon variant="contrast">
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
          <TransactionsList addresses={[address]} />
        </ScreenSection>
      </ScrollView>
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

export default AddressScreen
