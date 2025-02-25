import styled from 'styled-components'

import AutoUpdateToastMessages from '@/features/autoUpdate/AutoUpdateToastMessages'
import LedgerToastMessages from '@/features/ledger/LedgerToastMessages'
import SentTransactionsToastMessages from '@/features/send/sentTransactions/SentTransactionsToastMessages'
import ToastMessages from '@/features/toastMessages/ToastMessages'
import ModalPortal from '@/modals/ModalPortal'
import { appHeaderHeightPx, deviceBreakPoints } from '@/style/globalStyles'

const ToastMessagesModal = () => (
  <ModalPortal>
    <ToastMessagesModalContainer>
      <AutoUpdateToastMessages />
      <LedgerToastMessages />
      <SentTransactionsToastMessages />
      <ToastMessages />
    </ToastMessagesModalContainer>
  </ModalPortal>
)

export default ToastMessagesModal

const ToastMessagesModalContainer = styled.div`
  position: fixed;
  top: ${appHeaderHeightPx / 2}px;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  pointer-events: none;

  app-region: no-drag;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`
