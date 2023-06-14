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
import { colord } from 'colord'
import { sortBy } from 'lodash'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ListItem from '~/components/ListItem'
import { AddressTabsParamList } from '~/navigation/AddressesTabNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { themes } from '~/style/themes'
import { stringToColour } from '~/utils/colors'

interface ScreenProps extends StackScreenProps<AddressTabsParamList & RootStackParamList, 'ContactsScreen'> {
  style?: StyleProp<ViewStyle>
}

const contacts = [
  { id: '1', name: 'John Doe', address: '14hNXtwvFtdiawc16gYpXytcoUwkh6Ap9XARRBoa1S6tb' },
  { id: '2', name: 'Mary Poppins', address: '125orKZtvWeoWqbrHy7vHZQvpLfAaGkU5Tn91KzZqQzot' },
  { id: '3', name: 'Feta min', address: '1B6fZTrzmszem8WsHFt2jsH6paANFZv4TFp3Lv1FuP1UL' },
  { id: '4', name: 'James Brown', address: '13QNhnQcveVYD8zpinyRd4yfkTXBMANs4fzGdY8BoaA2J' }
]

const ContactsScreen = ({ navigation, style }: ScreenProps) => (
  <ScrollScreenStyled style={style}>
    <ScreenSection>
      <ContactList>
        {sortBy(contacts, ({ name }) => name.toLowerCase()).map((contact) => {
          const iconBgColor = stringToColour(contact.address)
          const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

          return (
            <ListItem
              key={contact.id}
              onPress={() => console.log('Navigate to contact screen')}
              title={contact.name}
              subtitle={contact.address}
              icon={
                <ContactIcon color={iconBgColor}>
                  <AppText color={textColor} semiBold size={21}>
                    {contact.name[0].toUpperCase()}
                  </AppText>
                </ContactIcon>
              }
            />
          )
        })}
      </ContactList>
    </ScreenSection>
  </ScrollScreenStyled>
)

export default ContactsScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const ContactList = styled.View``

const ContactIcon = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  border-radius: 38px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
