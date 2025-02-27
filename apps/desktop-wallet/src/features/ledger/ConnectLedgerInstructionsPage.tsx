import { getHumanReadableError } from '@alephium/shared'
import { Power, Unplug } from 'lucide-react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
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
    <LockedWalletLayout>
      <FloatingPanel enforceMinHeight>
        <PanelTitle centerText>{t('Connect your Ledger')}</PanelTitle>
        <InfoBoxes>
          <InfoBox align="left" Icon={Unplug}>
            {t('Plug in and unlock your Ledger device.')}
          </InfoBox>
          <InfoBox align="left" Icon={Power}>
            <Trans t={t} i18nKey="ledgerInstructionsOpenApp">
              Open the Alephium Ledger app. The Alephium app can be installed via
              <ActionLink onClick={() => openInWebBrowser(links.ledgerLive)}>Ledger Live</ActionLink>.
            </Trans>
          </InfoBox>
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
        </InfoBoxes>
        <FooterActionsContainerStyled>
          <Button onClick={() => navigate('/')} tall role="secondary">
            {t('Back')}
          </Button>
          <Button onClick={handleContinuePress} tall>
            {t('Continue')}
          </Button>
        </FooterActionsContainerStyled>
      </FloatingPanel>
    </LockedWalletLayout>
  )
}

export default ConnectLedgerInstructionsPage

const FooterActionsContainerStyled = styled(FooterActionsContainer)`
  margin-top: auto;
`

const InfoBoxes = styled.div`
  margin-top: var(--spacing-8);
`
