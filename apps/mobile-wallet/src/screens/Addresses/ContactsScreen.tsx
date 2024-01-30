/*
Copyright 2018 - 2024 The Alephium Authors
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

import { NavigationProp, useNavigation } from '@react-navigation/native'

import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RootStackParamList from '~/navigation/rootStackRoutes'
import ContactListScreenBase from '~/screens/ContactListScreenBase'
import { Contact } from '~/types/contacts'

const ContactsScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <BottomBarScrollScreen hasBottomBar {...props}>
      <ContactListScreenBase
        onContactPress={(contactId: Contact['id']) => navigation.navigate('ContactScreen', { contactId })}
        onNewContactPress={() => navigation.navigate('NewContactScreen')}
        style={contentStyle}
      />
    </BottomBarScrollScreen>
  )
}

export default ContactsScreen
