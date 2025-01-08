import { AddressHash } from '@alephium/shared'
import { openBrowserAsync } from 'expo-web-browser'
import { Trans, useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import ScreenTitle from '~/components/layout/ScreenTitle'
import LinkToWeb from '~/components/text/LinkToWeb'
import { closeBanxaTabOnDeepLink } from '~/features/buy/buyUtils'
import useBanxaUrl from '~/features/buy/useBanxaUrl'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface BuyModalProps {
  receiveAddressHash: AddressHash
}

const BuyModal = withModal<BuyModalProps>(({ id, receiveAddressHash }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const receiveAddress = useAppSelector((s) => selectAddressByHash(s, receiveAddressHash))
  const banxaUrl = useBanxaUrl(receiveAddressHash)

  const openBanxaUrl = async () => {
    if (receiveAddress) {
      Linking.addEventListener('url', closeBanxaTabOnDeepLink)

      openBrowserAsync(banxaUrl, {
        createTask: false, // Android: the browser opens within our app without a new task in the task manager
        toolbarColor: theme.bg.back1, // TODO: Wanted to use theme.bg.primary, but in light theme it's rgba and it looks black, not white
        controlsColor: theme.global.accent // iOS: color of button texts
      }).finally(() => {
        Linking.removeAllListeners('url')
      })
    }

    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Buy')} maximisedContent noPadding contentContainerStyle={{ flex: 1 }}>
      <DisclaimerContent>
        <ScreenTitle title={t('Disclaimer')} />
        <TextContainer>
          <AppText>
            <Trans
              t={t}
              i18nKey="banxaDisclaimer"
              components={{
                1: <LinkToWeb url="https://www.banxa.com" />
              }}
            >
              {
                'You are about to access 3rd party services provided by <1>Banxa.com</1> through an in-app browser. Alephium does not control Banxa’s services. Banxa’s terms and conditions will apply, so please read and understand them before proceeding.'
              }
            </Trans>
          </AppText>
        </TextContainer>
        <BottomButtons fullWidth>
          <Button
            title={t('I understand')}
            onPress={openBanxaUrl}
            variant="highlight"
            style={{ marginBottom: insets.bottom }}
          />
        </BottomButtons>
      </DisclaimerContent>
    </BottomModal>
  )
})

export default BuyModal

const DisclaimerContent = styled.View`
  flex: 1;
  padding: ${DEFAULT_MARGIN}px;
`

const TextContainer = styled.View`
  flex: 1;
`
