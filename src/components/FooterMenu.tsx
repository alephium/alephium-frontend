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

import { useNavigation, useRoute } from '@react-navigation/native'
import {
  ArrowLeftRight as ArrowsIcon,
  LayoutTemplate as LayoutTemplateIcon,
  List as ListIcon
} from 'lucide-react-native'
import React from 'react'
import { StyleProp, Text, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

interface FooterMenuProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ style }: FooterMenuProps) => {
  const navigation = useNavigation()
  const route = useRoute()
  const theme = useTheme()

  return (
    <View style={style}>
      <MenuItems>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('DashboardScreen')}>
          <OverviewTab>
            <LayoutTemplateIcon
              color={route.name === 'DashboardScreen' ? theme.font.primary : theme.font.tertiary}
              size={24}
            />
            <TabText isActive={route.name === 'DashboardScreen'}>Overview</TabText>
          </OverviewTab>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => navigation.navigate('AddressesScreen')}>
          <Tab>
            <ListIcon color={route.name === 'AddressesScreen' ? theme.font.primary : theme.font.tertiary} size={24} />
            <TabText isActive={route.name === 'AddressesScreen'}>Addresses</TabText>
          </Tab>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback>
          <TransferTab>
            <ArrowsIcon color={route.name === 'TransferScreen' ? theme.font.primary : theme.font.tertiary} size={24} />
            <TabText isActive={route.name === 'TransferScreen'}>Transfer</TabText>
          </TransferTab>
        </TouchableWithoutFeedback>
      </MenuItems>
    </View>
  )
}

export default styled(FooterMenu)`
  position: absolute;
  bottom: 35px;
  width: 100%;
  padding: 0 55px;
`

const MenuItems = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 12px;
  ${({ theme }) => theme.shadow.secondary};
  padding: 9px 12px;
`

const Tab = styled(View)`
  align-items: center;
`

const OverviewTab = styled(Tab)`
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
`

const TransferTab = styled(Tab)`
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
`

const TabText = styled(Text)<{ isActive?: boolean }>`
  font-weight: 700;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.tertiary)};
`
