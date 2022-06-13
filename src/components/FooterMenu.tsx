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
import {
  ArrowLeftRight as ArrowsIcon,
  LayoutTemplate as LayoutTemplateIcon,
  List as ListIcon
} from 'lucide-react-native'
import React from 'react'
import { StyleProp, Text, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface FooterMenuProps {
  style?: StyleProp<ViewStyle>
}

const FooterMenu = ({ style }: FooterMenuProps) => {
  const navigation = useNavigation()

  return (
    <View style={style}>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('DashboardScreen')}>
        <OverviewTab>
          <LayoutTemplateIcon color="black" size={24} />
          <TabText>Overview</TabText>
        </OverviewTab>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback onPress={() => navigation.navigate('AddressesScreen')}>
        <Tab>
          <ListIcon color="black" size={24} />
          <TabText>Addressess</TabText>
        </Tab>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback>
        <TransferTab>
          <ArrowsIcon color="black" size={24} />
          <TabText>Transfer</TabText>
        </TransferTab>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default styled(FooterMenu)`
  flex-direction: row;
  justify-content: center;
  position: absolute;
  bottom: 35px;
  width: 100%;
  padding: 0 55px;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
`

const Tab = styled(View)`
  background-color: white;
  padding: 10px;
  align-items: center;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.border.secondary};
`

const OverviewTab = styled(Tab)`
  border-left-width: 1px;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
`

const TransferTab = styled(Tab)`
  border-right-width: 1px;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
`

const TabText = styled(Text)`
  font-weight: 700;
`
