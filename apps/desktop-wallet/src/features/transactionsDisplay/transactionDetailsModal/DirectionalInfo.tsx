import { isConfirmedTx, selectPendingSentTransactionByHash } from '@alephium/shared'
import { useTransactionDirection } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import { useAppSelector } from '@/hooks/redux'

const DirectionalInfo = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const direction = useTransactionDirection(tx, refAddressHash)
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  return (
    <DirectionalInfoStyled>
      <AddressesInvolved>
        {direction === 'swap' ? (
          <>
            <AddressBadge addressHash={refAddressHash} truncate withBorders isShort />
            <FromIn>{t('and')}</FromIn>
            <SwapPartnerAddress>
              <IOList
                currentAddress={refAddressHash}
                isOut={false}
                outputs={tx.outputs}
                inputs={tx.inputs}
                timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
                linkToExplorer
              />
            </SwapPartnerAddress>
          </>
        ) : pendingSentTx ? (
          <PendingSentAddressBadge tx={tx} refAddressHash={refAddressHash} />
        ) : (
          <IOList
            currentAddress={refAddressHash}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={isConfirmedTx(tx) ? tx.timestamp : undefined}
            truncate
          />
        )}
      </AddressesInvolved>
    </DirectionalInfoStyled>
  )
}

export default DirectionalInfo

const DirectionalInfoStyled = styled.div`
  display: flex;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
`

const AddressesInvolved = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 100%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const SwapPartnerAddress = styled.div``
