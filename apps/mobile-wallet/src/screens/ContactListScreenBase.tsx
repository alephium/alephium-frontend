import { Contact } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { colord } from 'colord'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewProps } from 'react-native'
import Animated, { AnimatedProps } from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import ListItem from '~/components/ListItem'
import SearchInput from '~/components/SearchInput'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAllContacts } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { themes } from '~/style/themes'
import { stringToColour } from '~/utils/colors'
import { filterContacts } from '~/utils/contacts'

export interface ContactListScreenBaseProps {
  onContactPress: (contactId: Contact['id']) => void
  onNewContactPress: () => void
  style?: AnimatedProps<ViewProps>['style']
}

const ContactListScreenBase = ({ onContactPress, onNewContactPress, ...props }: ContactListScreenBaseProps) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const contacts = useAppSelector(selectAllContacts)

  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [searchTerm, setSearchTerm] = useState('')

  const handleNewContactPress = () => {
    navigation.navigate('NewContactScreen')

    onNewContactPress()
  }

  useEffect(() => {
    setFilteredContacts(filterContacts(contacts, searchTerm.toLowerCase()))
  }, [contacts, searchTerm])

  return (
    <Animated.View {...props}>
      {contacts.length > 4 && (
        <HeaderScreenSection>
          <SearchInput value={searchTerm} onChangeText={setSearchTerm} />
        </HeaderScreenSection>
      )}
      {contacts.length === 0 ? (
        <EmptyPlaceholder>
          <EmojiContainer size={32}>🤷‍♀️</EmojiContainer>
          <AppText>{t('No contact yet!')}</AppText>
          <Button title={t('Add contact')} onPress={handleNewContactPress} variant="contrast" short />
        </EmptyPlaceholder>
      ) : (
        <ContactList>
          {filteredContacts.map((contact, i) => {
            const iconBgColor = stringToColour(contact.address)
            const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

            return (
              <ListItem
                key={contact.id}
                onPress={() => onContactPress(contact.id)}
                title={contact.name}
                subtitle={contact.address}
                isLast={i === filteredContacts.length - 1}
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
