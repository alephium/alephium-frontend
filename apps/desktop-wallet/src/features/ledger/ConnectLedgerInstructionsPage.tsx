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
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { FloatingPanel, FooterActionsContainer } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import useInitializeAppWithLedgerData from '@/features/ledger/useInitializeAppWithLedgerData'
import { useAppDispatch } from '@/hooks/redux'
import LockedWalletLayout from '@/pages/LockedWalletLayout'
import { toggleAppLoading } from '@/storage/global/globalActions'
import { electron } from '@/utils/misc'

// TODO: Translate strings

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
      if (!electron) return

      const response = await electron.ledger.connectViaUsb()

      if (response.success) {
        await initializeAppWithLedgerData(response.deviceModel, response.initialAddress)
      } else {
        setError(response.error.message)
      }
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
        <PanelTitle onBackButtonClick={() => navigate('/')}>Connect your Ledger</PanelTitle>
        <Paragraph secondary>1. Plug in and unlock your Ledger device.</Paragraph>
        <Paragraph secondary>
          2. Open the Alephium Ledger app. The Alephium app can be installed via Ledger Live.
        </Paragraph>
        {error && (
          <>
            <InfoBox importance="warning">
              <div>Is your device plugged in and the Alephium app open?</div>
              <div>Your Ledger should say "Alephium is ready".</div>
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
