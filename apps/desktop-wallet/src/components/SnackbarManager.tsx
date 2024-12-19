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

import { memo, useEffect } from 'react'
import styled from 'styled-components'

import { fadeInTop, fadeOutTop } from '@/animations'
import LedgerAddressDiscoverySnackbar from '@/features/ledger/LedgerAddressDiscoverySnackbar'
import SentTransactionSnackbarPopup from '@/features/send/sentTransactions/SentTransactionSnackbarPopup'
import { selectAllSentTransactions } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import { snackbarDisplayTimeExpired } from '@/storage/global/globalActions'
import { deviceBreakPoints } from '@/style/globalStyles'
import { SnackbarMessage } from '@/types/snackbar'

const SnackbarManager = () => {
  const messages = useAppSelector((state) => state.snackbar.messages)
  const sentTxs = useAppSelector(selectAllSentTransactions)
  const isNewLedgerDevice = useAppSelector((s) => s.ledger.isNewDevice)

  return (
    <ModalPortal>
      {(messages.length > 0 || sentTxs.length > 0 || isNewLedgerDevice) && (
        <SnackbarManagerContainer>
          {sentTxs.map((sentTxs) => (
            <SentTransactionSnackbarPopup key={sentTxs.hash} txHash={sentTxs.hash} />
          ))}
          {messages.map((message) => (
            <SnackbarPopup key={message.id} message={message} />
          ))}
          {isNewLedgerDevice && <LedgerAddressDiscoverySnackbar />}
        </SnackbarManagerContainer>
      )}
    </ModalPortal>
  )
}

export default SnackbarManager

const SnackbarPopup = memo(({ message }: { message: Required<SnackbarMessage> }) => {
  const dispatch = useAppDispatch()

  // Remove snackbar popup after its duration
  useEffect(() => {
    if (message && message.duration >= 0) {
      const timer = setTimeout(() => dispatch(snackbarDisplayTimeExpired()), message.duration)

      return () => clearTimeout(timer)
    }
  }, [dispatch, message])

  return (
    <SnackbarBox {...fadeInTop} {...fadeOutTop} className={message.type}>
      <Message>{message.text}</Message>
    </SnackbarBox>
  )
})

export const SnackbarManagerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

const Message = styled.div`
  max-height: 20vh;
`
