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
import { ScrollViewProps } from 'react-native'

import BaseHeader from '~/components/headers/BaseHeader'
import ScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import TopTabBar from '~/components/TopTabBar'
import useCustomHeader from '~/hooks/layout/useCustomHeader'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import ContactListScreenBase from '~/screens/ContactListScreenBase'
import { Contact } from '~/types/contacts'
import { useScroll } from '~/utils/scroll'

interface ScreenProps
  extends ScrollViewProps,
    StackScreenProps<AddressTabsParamList & RootStackParamList, 'ContactsScreen'>,
    ScrollScreenProps {}

const ContactsScreen = ({ navigation, style, ...props }: ScreenProps) => {
  const { handleScroll, scrollY } = useScroll()
  return (
    <ScrollScreen {...props} onScroll={handleScroll} hasHeader>
      <ContactListScreenBase
        onContactPress={(contactId: Contact['id']) => navigation.navigate('ContactScreen', { contactId })}
        onNewContactPress={() => navigation.navigate('NewContactScreen')}
      />
    </ScrollScreen>
  )
}

export default ContactsScreen
