import { useInterval } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { colord } from 'colord'
import { t } from 'i18next'
import { X } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import CircularProgress from '@/components/CircularProgress'
import HashEllipsed from '@/components/HashEllipsed'
import usePendingTxPolling from '@/features/dataPolling/usePendingTxPolling'
import { openModal } from '@/features/modals/modalActions'
import { selectTopModal } from '@/features/modals/modalSelectors'
import { selectSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { SentTransaction } from '@/types/transactions'

interface SentTransactionSnackbarPopupProps {
  txHash: e.Transaction['hash']
}

const SentTransactionSnackbarPopup = memo(({ txHash }: SentTransactionSnackbarPopupProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const [hide, setHide] = useState(false)

  // The snackbar component is a transaction-specific component that is always mounted when a tx is being sent, so it's
  // the most appropriate place for polling.
  usePendingTxPolling(txHash)

  useEffect(() => {
    if (sentTx?.status === 'confirmed') {
      setTimeout(() => setHide(true), 5000)
    }
  }, [sentTx?.status])

  if (!sentTx || hide) return null

  const message = {
    sent: `${t('Transaction was sent...')} 💸`,
    mempooled: `${t('Transaction is about to be included in the blockchain...')} ⏳⛓️`,
    confirmed: `${t('Transaction is now part of the blockchain')} 🎉`
  }[sentTx.status]

  return (
    <SentTransactionSnackbarPopupStyled {...fadeInBottom} {...fadeOut} className="info">
      <Columns>
        <Progress status={sentTx.status} />
        <Rows>
          <Message>{message}</Message>
          <HashAndDetails>
            <HashEllipsedStyled hash={txHash} tooltipText={t('Copy hash')} showSnackbarOnCopied={false} />
            {sentTx.status !== 'sent' && <DetailsLink hash={txHash} />}
          </HashAndDetails>
        </Rows>
        <Button aria-label={t('Close')} circle role="secondary" onClick={() => setHide(true)} transparent>
          <X />
        </Button>
      </Columns>
    </SentTransactionSnackbarPopupStyled>
  )
})

export default SentTransactionSnackbarPopup

const SentTransactionSnackbarPopupStyled = styled(SnackbarBox)`
  display: flex;
  gap: 20px;
  min-width: 400px;
`

const Progress = ({ status }: Pick<SentTransaction, 'status'>) => {
  const [progress, setProgress] = useState(0)
  const theme = useTheme()

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

  return (
    <CircularProgressStyled
      value={progress}
      railColor={theme.name === 'dark' ? theme.bg.primary : colord(theme.bg.contrast).lighten(0.1).toHex()}
    />
  )
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

const HashEllipsedStyled = styled(HashEllipsed)`
  width: 100%;
  max-width: 150px;
  color: ${({ theme }) => theme.font.highlight};
`

const HashAndDetails = styled.div`
  display: flex;
  gap: 5px;
`

const CircularProgressStyled = styled(CircularProgress)`
  width: 48px;
  height: 48px;
`

const Rows = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
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

const DetailsLinkStyled = styled(ActionLink)`
  margin: 0;
`
