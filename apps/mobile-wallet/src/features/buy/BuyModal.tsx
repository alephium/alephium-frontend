import { AnalyticsEvent, BuyOrigin } from '@alephium/shared'
import { selectAddressByHash } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { openBrowserAsync } from 'expo-web-browser'
import { memo, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import LinkToWeb from '~/components/text/LinkToWeb'
import useOnramperUrl from '~/features/buy/useOnramperUrl'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppSelector } from '~/hooks/redux'

interface BuyModalProps {
  receiveAddressHash: AddressHash
  origin: BuyOrigin
}

const BuyModal = memo<BuyModalProps>(({ receiveAddressHash, origin }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const receiveAddress = useAppSelector((s) => selectAddressByHash(s, receiveAddressHash))
  const { url: providerUrl, isLoading, error } = useOnramperUrl(receiveAddressHash)
  const { dismissModal } = useModalContext()

  useEffect(() => {
    sendAnalytics({ event: AnalyticsEvent.BUY_DISCLAIMER_SHOWN, props: { origin, provider: 'onramper' } })
  }, [origin])

  const openProviderUrl = async () => {
    if (!receiveAddress || !providerUrl) return

    sendAnalytics({ event: AnalyticsEvent.BUY_PROVIDER_OPENED, props: { origin, provider: 'onramper' } })

    openBrowserAsync(providerUrl, {
      createTask: false, // Android: the browser opens within our app without a new task in the task manager
      toolbarColor: theme.bg.back1, // TODO: Wanted to use theme.bg.primary, but in light theme it's rgba and it looks black, not white
      controlsColor: theme.global.accent // iOS: color of button texts
    })

    dismissModal()
  }

  return (
    <BottomModal notScrollable title={t('Disclaimer')} contentVerticalGap>
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

      {error && <AppText color="alert">{t('Could not reach the payment provider. Please try again later.')}</AppText>}

      <BottomButtons fullWidth backgroundColor="back1">
        <Button
          title={t('I understand')}
          onPress={openProviderUrl}
          variant="highlight"
          loading={isLoading}
          disabled={!providerUrl}
        />
      </BottomButtons>
    </BottomModal>
  )
})

export default BuyModal
