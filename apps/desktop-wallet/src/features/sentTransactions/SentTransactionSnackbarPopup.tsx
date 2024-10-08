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

import { useInterval } from '@alephium/shared-react'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { t } from 'i18next'
import { X } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import Button from '@/components/Button'
import HashEllipsed from '@/components/HashEllipsed'
import usePendingTxPolling from '@/features/dataPolling/usePendingTxPolling'
import { openModal } from '@/features/modals/modalActions'
import { selectTopModal } from '@/features/modals/modalSelectors'
import { selectSentTransactionByHash } from '@/features/sentTransactions/sentTransactionsSelectors'
import SnackbarBox from '@/features/snackbar/SnackbarBox'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { SentTransaction } from '@/types/transactions'

interface SentTransactionSnackbarPopupProps {
  txHash: Transaction['hash']
}

const SentTransactionSnackbarPopup = memo(({ txHash }: SentTransactionSnackbarPopupProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const [hide, setHide] = useState(false)

  usePendingTxPolling(txHash)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (sentTx?.status === 'confirmed') {
      timer = setTimeout(() => setHide(true), 5000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [sentTx?.status])

  if (!sentTx || hide) return null

  return (
    <SentTransactionSnackbarPopupStyled {...fadeInBottom} {...fadeOut} className="info">
      <Columns>
        <Rows>
          <Message status={sentTx.status} />

          <HashEllipsedStyled hash={txHash} tooltipText={t('Copy hash')} showSnackbarOnCopied={false} />

          <Progress status={sentTx.status} />
        </Rows>
        <ButtonsRow>
          {sentTx.status !== 'sent' && <DetailsButton hash={txHash} />}

          <Button aria-label={t('Close')} squared role="secondary" onClick={() => setHide(true)} borderless transparent>
            <X />
          </Button>
        </ButtonsRow>
      </Columns>
    </SentTransactionSnackbarPopupStyled>
  )
})

export default SentTransactionSnackbarPopup

const SentTransactionSnackbarPopupStyled = styled(SnackbarBox)`
  min-width: 400px;
`

const Message = ({ status }: Pick<SentTransaction, 'status'>) => {
  const { t } = useTranslation()

  if (status === 'sent') return `${t('Transaction was sent...')} 💸`

  if (status === 'mempooled') return `${t('Transaction is about to be included in the blockchain...')} ⏳⛓️`

  if (status === 'confirmed') return `${t('Transaction is now part of the blockchain')} 🎉`
}

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

  return <ProgressBar value={progress} />
}

const DetailsButton = ({ hash }: Pick<SentTransaction, 'hash'>) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const topModal = useAppSelector(selectTopModal)

  const openTransactionDetailsModal = () => {
    // Do not open the same transaction details modal if it's the current top one
    if (topModal && topModal.params.name === 'TransactionDetailsModal' && topModal.params.props.txHash === hash) return

    dispatch(openModal({ name: 'TransactionDetailsModal', props: { txHash: hash } }))
  }

  return (
    <Button role="secondary" short borderless onClick={openTransactionDetailsModal}>
      {t('See more')}
    </Button>
  )
}

const HashEllipsedStyled = styled(HashEllipsed)`
  width: 100%;
  max-width: 150px;
  color: ${({ theme }) => theme.font.highlight};
`

const ProgressBar = styled.progress`
  width: 100%;
  -webkit-appearance: none;
  border-radius: var(--radius-medium);

  &::-webkit-progress-bar {
    border-radius: var(--radius-medium);
    background-color: ${({ theme }) => (theme.name === 'dark' ? theme.bg.primary : theme.bg.contrast)};
  }

  &::-webkit-progress-value {
    transition: all 0.5s;
    border-radius: var(--radius-medium);
    background-color: ${({ theme, value }) =>
      parseInt((value ?? 0)?.toString()) < 1 ? theme.global.accent : theme.global.valid};
  }
`

const Rows = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Columns = styled.div`
  display: flex;
  gap: 30px;
  align-items: center;
`

const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`
