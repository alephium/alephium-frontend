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

import { ParamListBase } from '@react-navigation/native'
import { useTheme } from 'styled-components'

import TabBarScreen from '~/components/layout/TabBarScreen'
import useVerticalScroll from '~/hooks/layout/useVerticalScroll'
import AddressesScreen from '~/screens/Addresses/AddressesScreen'
import ContactsScreen from '~/screens/Addresses/ContactsScreen'
import { AddressHash } from '~/types/addresses'

export interface AddressTabsParamList extends ParamListBase {
  AddressesScreen: {
    addressHash?: AddressHash
  }
  ContactsScreen: undefined
}

const AddressesTabNavigation = () => {
  const { handleScroll, scrollY } = useVerticalScroll()
  const theme = useTheme()

  return (
    <TabBarScreen
      initialPage={0}
      headerTitle="Addresses"
      tabLabels={['Your addresses', 'Contacts']}
      style={{ flex: 1, backgroundColor: theme.bg.back2 }}
      scrollY={scrollY}
    >
      <AddressesScreen key="1" onScroll={handleScroll} />
      <ContactsScreen key="2" onScroll={handleScroll} />
    </TabBarScreen>
  )
}

export default AddressesTabNavigation
