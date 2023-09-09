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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { TextInput } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import { TabBarPageProps } from '~/components/layout/TabBarPager'
import ListItem from '~/components/ListItem'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { themes } from '~/style/themes'
import { Contact } from '~/types/contacts'
import { stringToColour } from '~/utils/colors'
import { filterContacts } from '~/utils/contacts'

export interface ContactListScreenBaseProps extends TabBarPageProps {
  onContactPress: (contactId: Contact['id']) => void
  onNewContactPress?: () => void
}

// TODO: Should be converted to a FlatList

const ContactListScreenBase = ({
  onContactPress,
  onNewContactPress,
  contentStyle,
  ...props
}: ContactListScreenBaseProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const contacts = useAppSelector(selectAllContacts)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchTerm.toLowerCase()))
  }, [contacts, searchTerm])

  return (
    <ScreenContent style={contentStyle}>
      {filteredContacts.length === 0 ? (
        <NoContactContainer>
          <NoContactMessageBox>
            <EmojiContainer size={60}>🤷‍♀️</EmojiContainer>
            <AppText>No contact yet!</AppText>
            <Button title="Add contact" onPress={() => navigation.navigate('NewContactScreen')} />
          </NoContactMessageBox>
        </NoContactContainer>
      ) : (
        <>
          <HeaderScreenSection>
            <SearchInput
              placeholder="Search"
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={theme.font.tertiary}
            />
            {onNewContactPress && (
              <Button
                iconProps={{ name: 'add-outline' }}
                type="transparent"
                variant="accent"
                onPress={onNewContactPress}
              />
            )}
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
        </>
      )}
    </ScreenContent>
  )
}

export default ContactListScreenBase

const ScreenContent = styled(Animated.View)``

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
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 9px 12px;
  border-radius: 9px;
  color: ${({ theme }) => theme.font.primary};
`

const NoContactContainer = styled.View`
  align-items: center;
  justify-content: center;
`

const NoContactMessageBox = styled(BoxSurface)`
  padding: 25px;
  gap: ${VERTICAL_GAP}px;
  align-items: center;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const EmojiContainer = styled(AppText)``
