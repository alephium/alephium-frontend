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

import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useScrollEventHandler } from '~/contexts/ScrollContext'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import ContactListScreenBase from '~/screens/ContactListScreenBase'
import { Contact } from '~/types/contacts'

interface ScreenProps
  extends ScrollViewProps,
    StackScreenProps<AddressTabsParamList & RootStackParamList, 'ContactsScreen'>,
    ScrollScreenProps {}

const ContactsScreen = ({ navigation, style, ...props }: ScreenProps) => {
  const scrollHandler = useScrollEventHandler()

  return (
    <ContactListScreenBase
      onContactPress={(contactId: Contact['id']) => navigation.navigate('ContactScreen', { contactId })}
      onNewContactPress={() => navigation.navigate('NewContactScreen')}
      onScroll={scrollHandler}
      {...props}
    />
  )
}

export default ContactsScreen
