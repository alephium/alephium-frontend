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

import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import Button from '@/components/Button'
import { userWasAskedToDiscoverAddresses } from '@/features/ledger/ledgerActions'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import { useAppDispatch } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'

const LedgerAddressDiscoverySnackbar = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { discoverAndSaveUsedAddresses } = useAddressGeneration()

  const handleCloseClick = () => {
    dispatch(userWasAskedToDiscoverAddresses())
  }

  const handleScanClick = () => {
    discoverAndSaveUsedAddresses()
    dispatch(userWasAskedToDiscoverAddresses())
  }

  return (
    <SentTransactionSnackbarPopupStyled {...fadeInBottom} {...fadeOut} className="info">
      <Columns>
        <Messages>
          <Message>{t('Welcome to your Ledger!') + ' 👋'}</Message>
          <div>{t('Would you like to scan for active addresses?')}</div>
        </Messages>
        <Button short borderless role="secondary" onClick={handleScanClick}>
          {t('Scan')}
        </Button>
        <Button aria-label={t('Close')} circle role="secondary" onClick={handleCloseClick} borderless transparent>
          <X />
        </Button>
      </Columns>
    </SentTransactionSnackbarPopupStyled>
  )
}

export default LedgerAddressDiscoverySnackbar

const SentTransactionSnackbarPopupStyled = styled(SnackbarBox)`
  display: flex;
  gap: 20px;
  min-width: 400px;
`

const Columns = styled.div`
  flex: 1;
  display: flex;
  gap: 30px;
  align-items: center;
`

const Message = styled.span`
  font-weight: bold;
`

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
