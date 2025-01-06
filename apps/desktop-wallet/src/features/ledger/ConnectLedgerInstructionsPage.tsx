import { getHumanReadableError } from '@alephium/shared'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { fadeInSlowly } from '@/animations'
import ActionLink from '@/components/ActionLink'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { FloatingPanel, FooterActionsContainer } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import useInitializeAppWithLedgerData from '@/features/ledger/useInitializeAppWithLedgerData'
import { LedgerAlephium } from '@/features/ledger/utils'
import { useAppDispatch } from '@/hooks/redux'
import LockedWalletLayout from '@/pages/LockedWalletLayout'
import { toggleAppLoading } from '@/storage/global/globalActions'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const ConnectLedgerInstructionsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string>()
  const initializeAppWithLedgerData = useInitializeAppWithLedgerData()

  const handleContinuePress = async () => {
    setError(undefined)
    dispatch(toggleAppLoading(true))

    try {
      const alephiumLedgerApp = await LedgerAlephium.create()
      const deviceInfo = await alephiumLedgerApp.getDeviceInfo()
      const initialAddress = await alephiumLedgerApp.generateInitialAddress()

      await initializeAppWithLedgerData(deviceInfo.deviceModal ?? 'Ledger', initialAddress)
    } catch (error) {
      console.error(error)
      setError(getHumanReadableError(error, 'Error connecting to your Ledger device'))
    } finally {
      dispatch(toggleAppLoading(false))
    }
  }

  return (
    <LockedWalletLayout {...fadeInSlowly}>
      <FloatingPanel enforceMinHeight>
        <PanelTitle onBackButtonClick={() => navigate('/')}>{t('Connect your Ledger')}</PanelTitle>
        <ol>
          <li>{t('Plug in and unlock your Ledger device.')}</li>
          <li>
            <Trans t={t} i18nKey="ledgerInstructionsOpenApp">
              Open the Alephium Ledger app. The Alephium app can be installed via
              <ActionLink onClick={() => openInWebBrowser(links.ledgerLive)}>Ledger Live</ActionLink>.
            </Trans>
          </li>
        </ol>
        {error && (
          <>
            <InfoBox importance="warning">
              <div>{t('Is your device plugged in and the Alephium app open?')}</div>
            </InfoBox>
            <InfoBox importance="alert">
              <div>{error}</div>
            </InfoBox>
          </>
        )}
        <FooterActionsContainer>
          <Button onClick={handleContinuePress}>{t('Continue')}</Button>
        </FooterActionsContainer>
      </FloatingPanel>

      <AppHeader />
    </LockedWalletLayout>
  )
}

export default ConnectLedgerInstructionsPage
