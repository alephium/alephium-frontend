import { memo, useEffect } from 'react'
import styled from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import SentTransactionSnackbarPopup from '@/features/send/sentTransactions/SentTransactionSnackbarPopup'
import { selectAllSentTransactions } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import { snackbarDisplayTimeExpired } from '@/storage/global/globalActions'
import { deviceBreakPoints, walletSidebarWidthPx } from '@/style/globalStyles'
import { SnackbarMessage } from '@/types/snackbar'

const SnackbarManager = () => {
  const messages = useAppSelector((state) => state.snackbar.messages)
  const sentTxs = useAppSelector(selectAllSentTransactions)

  return (
    <ModalPortal>
      {(messages.length > 0 || sentTxs.length > 0) && (
        <SnackbarManagerContainer>
          {sentTxs.map((sentTxs) => (
            <SentTransactionSnackbarPopup key={sentTxs.hash} txHash={sentTxs.hash} />
          ))}
          {messages.map((message) => (
            <SnackbarPopup key={message.id} message={message} />
          ))}
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
    <SnackbarBox {...fadeInBottom} {...fadeOut} className={message.type} style={{ textAlign: 'center' }}>
      <Message>{message.text}</Message>
    </SnackbarBox>
  )
})

export const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: ${walletSidebarWidthPx}px;
  z-index: 3;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

const Message = styled.div`
  max-height: 20vh;
`
