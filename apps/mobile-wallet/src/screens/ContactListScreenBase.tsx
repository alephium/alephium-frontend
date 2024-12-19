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

import { Contact } from '@alephium/shared'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput, ViewProps } from 'react-native'
import Animated, { AnimatedProps } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import ListItem from '~/components/ListItem'
import { useAppSelector } from '~/hooks/redux'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { themes } from '~/style/themes'
import { stringToColour } from '~/utils/colors'
import { filterContacts } from '~/utils/contacts'

export interface ContactListScreenBaseProps {
  onContactPress: (contactId: Contact['id']) => void
  onNewContactPress?: () => void
  style?: AnimatedProps<ViewProps>['style']
}

const ContactListScreenBase = ({ onContactPress, onNewContactPress, ...props }: ContactListScreenBaseProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const contacts = useAppSelector(selectAllContacts)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchTerm.toLowerCase()))
  }, [contacts, searchTerm])

  return (
    <Animated.View {...props}>
      <HeaderScreenSection>
        <SearchInput
          placeholder={t('Search')}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={theme.font.tertiary}
        />
      </HeaderScreenSection>
      {contacts.length === 0 ? (
        <NoContactContainer>
          <NoContactMessageBox>
            <EmojiContainer size={60}>🤷‍♀️</EmojiContainer>
            <AppText>{t('No contact yet!')}</AppText>
            <Button title={t('Add contact')} onPress={onNewContactPress} variant="highlight" />
          </NoContactMessageBox>
        </NoContactContainer>
      ) : (
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
          {filteredContacts.length === 0 && (
            <NoContactContainer>
              <NoContactMessageBox>
                <EmojiContainer size={60}>🧐</EmojiContainer>
                <AppText>{t('No contacts found with these filtering criteria.')}</AppText>
              </NoContactMessageBox>
            </NoContactContainer>
          )}
        </ContactList>
      )}
    </Animated.View>
  )
}

export default ContactListScreenBase

const ContactList = styled.View`
  padding: 0 ${DEFAULT_MARGIN}px;
`

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
  margin-bottom: ${VERTICAL_GAP}px;
`

const SearchInput = styled(TextInput)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 9px 12px;
  border-radius: 9px;
  color: ${({ theme }) => theme.font.primary};
`

const NoContactContainer = styled.View`
  align-items: center;
  justify-content: center;
`

const NoContactMessageBox = styled(Surface)`
  padding: 25px;
  gap: ${VERTICAL_GAP}px;
  align-items: center;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const EmojiContainer = styled(AppText)``
