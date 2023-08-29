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

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { ParamListBase } from '@react-navigation/native'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import BaseHeader from '~/components/headers/BaseHeader'
import TopTabBar from '~/components/TopTabBar'
import AddressesScreen from '~/screens/Addresses/AddressesScreen'
import ContactsScreen from '~/screens/Addresses/ContactsScreen'
import { AddressHash } from '~/types/addresses'
import { useScroll } from '~/utils/scroll'

export interface AddressTabsParamList extends ParamListBase {
  AddressesScreen: {
    addressHash?: AddressHash
  }
  ContactsScreen: undefined
}

const AddressesTabNavigation = () => {
  const { handleScroll, scrollY } = useScroll()
  const theme = useTheme()

  return (
    <>
      <PagerView initialPage={0} style={{ flex: 1, backgroundColor: theme.bg.back2 }}>
        <AddressesScreen key="1" onScroll={handleScroll} />
        <ContactsScreen key="2" onScroll={handleScroll} />
      </PagerView>
      <HeaderContainer>
        <BaseHeader HeaderLeft={<TopTabBar />} scrollY={scrollY} />
      </HeaderContainer>
    </>
  )
}

const HeaderContainer = styled.View`
  position: absolute;
  right: 0;
  left: 0;
`

export default AddressesTabNavigation
