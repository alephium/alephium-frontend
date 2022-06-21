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

import { useNavigation } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import dayjs from 'dayjs'
import {
  Clipboard as ClipboardIcon,
  Pencil as PencilIcon,
  QrCode as QrCodeIcon,
  Star as StarIcon
} from 'lucide-react-native'
import { Plus as PlusIcon } from 'lucide-react-native'
import { useLayoutEffect } from 'react'
import { Pressable, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '../components/Amount'
import FooterMenu from '../components/FooterMenu'
import Screen from '../components/layout/Screen'
import { useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { Address, selectAllAddresses } from '../store/addressesSlice'
import { copyAddressToClipboard, getAddressDisplayName } from '../utils/addresses'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddressesScreen'>

const AddressesScreen = ({ navigation }: ScreenProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const theme = useTheme()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: `Addresses (${addresses.length})`,
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('NewAddressScreen')}>
          <PlusIcon size={24} color={theme.global.accent} style={{ marginRight: 20 }} />
        </Pressable>
      )
    })
  })

  console.log('AddressesScreen renders')

  return (
    <Screen>
      <ScrollView>
        <ScreenSection>
          {addresses.map((address) => (
            <Pressable onPress={() => navigation.navigate('AddressScreen', { address })} key={address.hash}>
              <AddressRow address={address} />
            </Pressable>
          ))}
        </ScreenSection>
      </ScrollView>
      <FooterMenu />
    </Screen>
  )
}

interface AddressProps {
  address: Address
  style?: StyleProp<ViewStyle>
}

let AddressRow = ({ style, address }: AddressProps) => {
  const theme = useTheme()
  const lastUsed =
    address.networkData.transactions.confirmed.length > 0
      ? dayjs(address.networkData.transactions.confirmed[0].timestamp).fromNow()
      : 'Never used'
  const navigation = useNavigation()

  return (
    <View style={style}>
      <Header>
        <Name color={address.settings.color}>{getAddressDisplayName(address)}</Name>
        <Actions>
          <Pressable>
            <Icon>
              <StarIcon fill={address.settings.isMain ? '#FFD66D' : theme.bg.tertiary} size={22} />
            </Icon>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('EditAddressScreen', { address })}>
            <Icon>
              <PencilIcon color={theme.font.primary} size={20} />
            </Icon>
          </Pressable>
          <Pressable onPress={() => copyAddressToClipboard(address)}>
            <Icon>
              <ClipboardIcon color={theme.font.primary} size={20} />
            </Icon>
          </Pressable>
          <Pressable>
            <Icon style={{ marginRight: 12 }}>
              <QrCodeIcon color={theme.font.primary} size={20} />
            </Icon>
          </Pressable>
        </Actions>
      </Header>
      <AmountStyled value={BigInt(address.networkData.details.balance)} fadeDecimals />
      <LastUsed>{lastUsed}</LastUsed>
    </View>
  )
}

const ScreenSection = styled(View)`
  padding: 22px 20px 120px;
`

AddressRow = styled(AddressRow)`
  background-color: white;
  border-radius: 12px;
  margin-bottom: 15px;
`

const Header = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  max-width: 100%;
`

const Actions = styled(View)`
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  justify-content: flex-end;
`

const Name = styled(Text)<{ color?: string }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme, color }) => color || theme.font.primary};
  padding: 17px 28px;
  flex-shrink: 1;
`

const Icon = styled(View)`
  padding: 18px 12px;
`

const AmountStyled = styled(Amount)`
  font-weight: 700;
  font-size: 26px;
  margin-left: 28px;
`

const LastUsed = styled(Text)`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.tertiary};
  text-align: right;
  margin-right: 16px;
  margin-bottom: 12px;
`

export default AddressesScreen
