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

import { colord } from 'colord'
import { Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ScrollViewProps, StyleProp, TextInput, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ListItem from '~/components/ListItem'
import { useAppSelector } from '~/hooks/redux'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { themes } from '~/style/themes'
import { Contact } from '~/types/contacts'
import { stringToColour } from '~/utils/colors'
import { filterContacts } from '~/utils/contacts'

interface ContactListScreenBaseProps extends ScrollViewProps {
  onContactPress: (contactId: Contact['id']) => void
  onNewContactPress?: () => void
  style?: StyleProp<ViewStyle>
}

const ContactListScreenBase = ({ onContactPress, onNewContactPress, style, ...props }: ContactListScreenBaseProps) => {
  const contacts = useAppSelector(selectAllContacts)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchTerm.toLowerCase()))
  }, [contacts, searchTerm])

  return (
    <ScrollScreenStyled style={style} {...props}>
      <HeaderScreenSection>
        <SearchInput placeholder="Search" value={searchTerm} onChangeText={setSearchTerm} />
        {onNewContactPress && <Button Icon={Plus} type="transparent" variant="accent" onPress={onNewContactPress} />}
      </HeaderScreenSection>
      <ScreenSection>
        <ContactList>
          {filteredContacts.map((contact) => {
            const iconBgColor = stringToColour(contact.address)
            const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

            return (
              <ListItem
                key={contact.id}
                onPress={() => onContactPress(contact.id)}
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
}

export default ContactListScreenBase

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

const HeaderScreenSection = styled(ScreenSection)`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`

const SearchInput = styled(TextInput)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 9px 12px;
  border-radius: 9px;
`
