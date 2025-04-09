import { removeSentTransaction, selectSentTransactionByHash, SentTransaction } from '@alephium/shared'
import { useInterval, usePendingTxPolling } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { t } from 'i18next'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import CircularProgress from '@/components/CircularProgress'
import HashEllipsed from '@/components/HashEllipsed'
import { openModal } from '@/features/modals/modalActions'
import { selectTopModal } from '@/features/modals/modalSelectors'
import ToastBox from '@/features/toastMessages/ToastBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

interface SentTransactionSnackbarPopupProps {
  txHash: e.Transaction['hash']
  className?: string
}

const SentTransactionToastBox = memo(({ txHash, className }: SentTransactionSnackbarPopupProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const [hide, setHide] = useState(false)
  const dispatch = useAppDispatch()
  // The snackbar component is a transaction-specific component that is always mounted when a tx is being sent, so it's
  // the most appropriate place for polling.
  usePendingTxPolling(txHash)

  const closeToast = useCallback(() => setHide(true), [])

  useEffect(() => {
    if (sentTx?.status === 'confirmed') {
      setTimeout(() => {
        closeToast()
        dispatch(removeSentTransaction(txHash))
      }, 5000)
    }
  }, [sentTx?.status, closeToast, dispatch, txHash])

  if (!sentTx || hide) return null

  const message = {
    sent: `${t('Transaction was sent...')} 💸`,
    mempooled: t('Transaction is about to be included in the blockchain...'),
    confirmed: `${t('Transaction is now part of the blockchain')} 🎉`
  }[sentTx.status]

  return (
    <ToastBox
      className={className}
      type={sentTx.status === 'confirmed' ? 'success' : 'info'}
      onClose={closeToast}
      title={message}
      LeftContent={<Progress status={sentTx.status} />}
    >
      <HashAndDetails>
        <HashEllipsed hash={txHash} tooltipText={t('Copy hash')} showSnackbarOnCopied={false} truncate />
        {sentTx.status !== 'sent' && <DetailsLink hash={txHash} />}
      </HashAndDetails>
    </ToastBox>
  )
})

export default SentTransactionToastBox

const Progress = ({ status }: Pick<SentTransaction, 'status'>) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === 'sent') {
      setProgress(0.1)
    } else if (status === 'mempooled') {
      setProgress((prevValue) => (prevValue < 0.25 ? 0.25 : prevValue))
    } else if (status === 'confirmed') {
      setProgress(1)
    }
  }, [status])

  useInterval(() => setProgress((prevValue) => prevValue + 0.015), 1000, status === 'confirmed' || progress > 0.9)

  return <CircularProgressStyled value={progress} />
}

const DetailsLink = ({ hash }: Pick<SentTransaction, 'hash'>) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const topModal = useAppSelector(selectTopModal)

  const openTransactionDetailsModal = () => {
    // Do not open the same transaction details modal if it's the current top one
    if (topModal && topModal.params.name === 'TransactionDetailsModal' && topModal.params.props.txHash === hash) return

    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash: hash } }))
  }

  return <DetailsLinkStyled onClick={openTransactionDetailsModal}>{t('See more')}</DetailsLinkStyled>
}

const HashAndDetails = styled.div`
  display: flex;
  gap: 5px;
`

const CircularProgressStyled = styled(CircularProgress)`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`

const DetailsLinkStyled = styled(ActionLink)`
  margin: 0;
`
