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
