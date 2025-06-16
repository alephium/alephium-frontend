import { AddressHash, selectAddressByHash } from '@alephium/shared'
import { useURL } from 'expo-linking'
import { dismissBrowser, openBrowserAsync } from 'expo-web-browser'
import { memo, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import LinkToWeb from '~/components/text/LinkToWeb'
import useOnramperUrl from '~/features/buy/useOnramperUrl'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { useAppSelector } from '~/hooks/redux'

export interface BuyModalProps {
  receiveAddressHash: AddressHash
}

const CLOSE_ONRAMP_TAB_DEEP_LINK = 'alephium://close-onramp-tab'

const BuyModal = memo<BuyModalProps & ModalBaseProp>(({ id, receiveAddressHash }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const receiveAddress = useAppSelector((s) => selectAddressByHash(s, receiveAddressHash))
  const providerUrl = useOnramperUrl(receiveAddressHash)
  const deeplink = useURL()
  const { dismissModal, onDismiss } = useModalDismiss({ id })

  useEffect(() => {
    if (deeplink?.includes(CLOSE_ONRAMP_TAB_DEEP_LINK)) {
      dismissModal()
      dismissBrowser()
    }
  }, [deeplink, dismissModal])

  const openProviderUrl = async () => {
    receiveAddress &&
      openBrowserAsync(providerUrl, {
        createTask: false, // Android: the browser opens within our app without a new task in the task manager
        toolbarColor: theme.bg.back1, // TODO: Wanted to use theme.bg.primary, but in light theme it's rgba and it looks black, not white
        controlsColor: theme.global.accent // iOS: color of button texts
      })

    dismissModal()
  }

  return (
    <BottomModal2 onDismiss={onDismiss} notScrollable modalId={id} title={t('Disclaimer')}>
      <AppText>
        <Trans
          t={t}
          i18nKey="banxaDisclaimer"
          components={{
            1: <LinkToWeb url="https://www.onramper.com" />
          }}
        >
          {
            'You are about to access 3rd party services provided by <1>Onramper.com</1> through an in-app browser. Alephium does not control Onramper’s services. Onramper’s terms and conditions will apply, so please read and understand them before proceeding.'
          }
        </Trans>
      </AppText>

      <BottomButtons fullWidth backgroundColor="back1">
        <Button title={t('I understand')} onPress={openProviderUrl} variant="highlight" />
      </BottomButtons>
    </BottomModal2>
  )
})

export default BuyModal
