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
import { usePostHog } from 'posthog-react-native'

import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import ContactListScreenBase from '~/screens/ContactListScreenBase'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { Contact } from '~/types/contacts'

type ScreenProps = StackScreenProps<RootStackParamList, 'SelectContactScreen'> &
  StackScreenProps<SendNavigationParamList, 'SelectContactScreen'>

interface SelectContactScreenProps extends ScreenProps, ScrollScreenProps {}

const SelectContactScreen = ({ navigation, route: { params }, ...props }: SelectContactScreenProps) => {
  const contacts = useAppSelector(selectAllContacts)
  const posthog = usePostHog()

  const handleContactPress = (contactId: Contact['id']) => {
    const contact = contacts.find((c) => c.id === contactId)

    if (contact) {
      posthog?.capture('Send: Selected contact to send funds to')

      navigation.navigate('SendNavigation', {
        screen: params.nextScreen,
        params: { toAddressHash: contact.address }
      })
    }
  }

  return <ContactListScreenBase onContactPress={handleContactPress} {...props} />
}

export default SelectContactScreen
