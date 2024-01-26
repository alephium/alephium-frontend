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

import { StackScreenProps } from '@react-navigation/stack'
import { colord } from 'colord'
import { Clipboard, LucideProps, Share2Icon, Upload } from 'lucide-react-native'
import { useMemo, useRef } from 'react'
import { PressableProps, Share } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import StackHeader from '~/components/headers/StackHeader'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import TransactionsFlatList from '~/components/layout/TransactionsFlatList'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { makeSelectContactConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { makeSelectContactPendingTransactions } from '~/store/pendingTransactionsSlice'
import { themes } from '~/style/themes'
import { copyAddressToClipboard } from '~/utils/addresses'
import { stringToColour } from '~/utils/colors'

type ContactScreenProps = StackScreenProps<SendNavigationParamList, 'ContactScreen'> &
  StackScreenProps<RootStackParamList, 'ContactScreen'> &
  ScreenProps

const ContactScreen = ({ navigation, route: { params }, style }: ContactScreenProps) => {
  const listRef = useRef(null)
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const contactAddressHash = contact?.address ?? ''
  const selectContactConfirmedTransactions = useMemo(makeSelectContactConfirmedTransactions, [])
  const selectContactPendingTransactions = useMemo(makeSelectContactPendingTransactions, [])
  const confirmedTransactions = useAppSelector((s) => selectContactConfirmedTransactions(s, contactAddressHash))
  const pendingTransactions = useAppSelector((s) => selectContactPendingTransactions(s, contactAddressHash))

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  if (!contact) return null

  const handleShareContactPress = () => {
    Share.share({
      title: 'Share contact',
      message: `${contact.name}\n${contact.address}`
    })

    sendAnalytics('Contact: Shared contact')
  }

  const handleSendFundsPress = () => {
    sendAnalytics('Contact: Pressed send funds')

    navigation.navigate('SendNavigation', {
      screen: 'OriginScreen',
      params: { toAddressHash: contact.address }
    })
  }

  const handleCopyAddressPress = () => {
    sendAnalytics('Copied address', { note: 'Contact' })

    copyAddressToClipboard(contact.address)
  }

  const iconBgColor = stringToColour(contact.address)
  const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

  return (
    <>
      <StackHeader
        options={{
          headerRight: () => (
            <Button
              title="Edit"
              onPress={() => navigation.navigate('EditContactScreen', { contactId: params.contactId })}
              type="transparent"
              variant="accent"
            />
          )
        }}
        goBack={navigation.canGoBack() ? navigation.goBack : undefined}
        scrollY={screenScrollY}
      />
      <TransactionsFlatList
        confirmedTransactions={confirmedTransactions}
        pendingTransactions={pendingTransactions}
        initialNumToRender={8}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={screenScrollHandler}
        ref={listRef}
        ListHeaderComponent={
          <>
            <CenteredSection>
              <ContactIcon color={iconBgColor}>
                <AppText semiBold size={32} color={textColor}>
                  {contact.name[0].toUpperCase()}
                </AppText>
              </ContactIcon>
              <ContactName semiBold size={28}>
                {contact.name}
              </ContactName>
              <ContactAddress medium size={16} color="secondary" numberOfLines={1} ellipsizeMode="middle">
                {contact.address}
              </ContactAddress>
              <ButtonsRow>
                <ContactButton Icon={Upload} title="Send funds" onPress={handleSendFundsPress} />
                <ContactButton Icon={Clipboard} title="Copy address" onPress={handleCopyAddressPress} />
                <ContactButton Icon={Share2Icon} title="Share" onPress={handleShareContactPress} />
              </ButtonsRow>
            </CenteredSection>
            <TransactionsHeaderRow>
              <ScreenSection>
                <AppText size={18} semiBold>
                  Transactions
                </AppText>
              </ScreenSection>
            </TransactionsHeaderRow>
          </>
        }
      />
    </>
  )
}

export default ContactScreen

interface ContactButtonProps extends PressableProps {
  title: string
  Icon?: (props: LucideProps) => JSX.Element
}

const ContactButton = ({ Icon, title, children, ...props }: ContactButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonStyled {...props}>
      {Icon && <Icon size={20} color={theme.global.accent} />}
      <ButtonText medium color="accent">
        {title}
      </ButtonText>
    </ButtonStyled>
  )
}

const CenteredSection = styled(ScreenSection)`
  align-items: center;
  margin-bottom: 25px;
`

const ContactIcon = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 95px;
  height: 95px;
  border-radius: 95px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const ContactName = styled(AppText)`
  margin-top: 30px;
`

const ContactAddress = styled(AppText)`
  margin-top: 15px;
  max-width: 140px;
`

const ButtonsRow = styled.View`
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  margin-top: 40px;
`

const ButtonStyled = styled.Pressable`
  padding: 12px 6px;
  background-color: ${({ theme }) => theme.button.primary};
  border-radius: 9px;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex: 1;
`

const ButtonText = styled(AppText)`
  text-align: center;
`

const TransactionsHeaderRow = styled.View`
  margin-bottom: 15px;
`
