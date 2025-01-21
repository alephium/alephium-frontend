import { StackScreenProps } from '@react-navigation/stack'
import { colord } from 'colord'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Share } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import Button from '~/components/buttons/Button'
import StackHeader from '~/components/headers/StackHeader'
import Screen, { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import TransactionsFlashList from '~/components/layout/TransactionsFlashList'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectContactById } from '~/store/addresses/addressesSelectors'
import { makeSelectContactConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { makeSelectContactPendingTransactions } from '~/store/pendingTransactionsSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { themes } from '~/style/themes'
import { copyAddressToClipboard } from '~/utils/addresses'
import { stringToColour } from '~/utils/colors'

type ContactScreenProps = StackScreenProps<SendNavigationParamList, 'ContactScreen'> &
  StackScreenProps<RootStackParamList, 'ContactScreen'> &
  ScreenProps

const ContactScreen = ({ navigation, route: { params } }: ContactScreenProps) => {
  const listRef = useRef(null)
  const contact = useAppSelector((s) => selectContactById(s, params.contactId))
  const contactAddressHash = contact?.address ?? ''
  const selectContactConfirmedTransactions = useMemo(makeSelectContactConfirmedTransactions, [])
  const selectContactPendingTransactions = useMemo(makeSelectContactPendingTransactions, [])
  const confirmedTransactions = useAppSelector((s) => selectContactConfirmedTransactions(s, contactAddressHash))
  const pendingTransactions = useAppSelector((s) => selectContactPendingTransactions(s, contactAddressHash))
  const { t } = useTranslation()

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  if (!contact) return null

  const handleShareContactPress = () => {
    Share.share({
      title: t('Share contact'),
      message: `${contact.name}\n${contact.address}`
    })

    sendAnalytics({ event: 'Contact: Shared contact' })
  }

  const handleSendFundsPress = () => {
    sendAnalytics({ event: 'Contact: Pressed send funds' })

    navigation.navigate('SendNavigation', {
      screen: 'OriginScreen',
      params: { toAddressHash: contact.address }
    })
  }

  const handleCopyAddressPress = () => {
    sendAnalytics({ event: 'Copied address', props: { note: 'Contact' } })

    copyAddressToClipboard(contact.address)
  }

  const iconBgColor = stringToColour(contact.address)
  const textColor = themes[colord(iconBgColor).isDark() ? 'dark' : 'light'].font.primary

  return (
    <Screen>
      <StackHeader
        options={{
          headerTitle: contact.name,
          headerRight: () => (
            <Button
              title={t('Edit')}
              onPress={() => navigation.navigate('EditContactScreen', { contactId: params.contactId })}
              type="transparent"
              variant="accent"
              compact
            />
          )
        }}
        onBackPress={navigation.canGoBack() ? navigation.goBack : undefined}
        scrollY={screenScrollY}
      />
      <TransactionsFlashList
        confirmedTransactions={confirmedTransactions}
        pendingTransactions={pendingTransactions}
        onScroll={screenScrollHandler}
        ref={listRef}
        ListHeaderComponent={
          <>
            <CenteredSection style={{ marginTop: 140 }}>
              <ContactIcon color={iconBgColor}>
                <AppText semiBold size={32} color={textColor}>
                  {contact.name[0].toUpperCase()}
                </AppText>
              </ContactIcon>
              <ContactName semiBold size={28}>
                {contact.name}
              </ContactName>
              <ContactAddress truncate medium size={16} color="secondary" ellipsizeMode="middle">
                {contact.address}
              </ContactAddress>
            </CenteredSection>
            <ButtonsRow>
              <ActionCardButton iconProps={{ name: 'upload' }} title={t('Send funds')} onPress={handleSendFundsPress} />
              <ActionCardButton
                iconProps={{ name: 'clipboard' }}
                title={t('Copy address')}
                onPress={handleCopyAddressPress}
              />
              <ActionCardButton iconProps={{ name: 'share-2' }} title={t('Share')} onPress={handleShareContactPress} />
            </ButtonsRow>
            <TransactionsHeaderRow>
              <AppText size={18} semiBold>
                {t('Transactions')}
              </AppText>
            </TransactionsHeaderRow>
          </>
        }
      />
    </Screen>
  )
}

export default ContactScreen

const CenteredSection = styled(ScreenSection)`
  align-items: center;
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
  margin: ${VERTICAL_GAP}px 0;
`

const TransactionsHeaderRow = styled.View`
  margin-bottom: 15px;
`
