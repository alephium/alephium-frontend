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

import { isConfirmedTx } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import { selectPendingSentTransactionByHash } from '@/features/sentTransactions/sentTransactionsSelectors'
import PendingSentAddressBadge from '@/features/transactionsDisplay/transactionDetailsModal/PendingSentAddressBadge'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useTransactionDirection from '@/features/transactionsDisplay/useTransactionDirection'
import { useAppSelector } from '@/hooks/redux'

const DirectionalInfo = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const direction = useTransactionDirection(tx, refAddressHash)
  const { t } = useTranslation()
  const pendingSentTx = useAppSelector((s) => selectPendingSentTransactionByHash(s, tx.hash))

  return (
    <DirectionalInfoStyled>
      <AddressesInvolved>
        <FromIn>
          {
            {
              in: t('from'),
              out: t('to'),
              swap: t('between')
            }[direction]
          }
        </FromIn>
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
  flex-direction: column;
  align-items: center;
  width: 90%;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: var(--spacing-5);
  margin-bottom: var(--spacing-5);
`

const AddressesInvolved = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 80%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const SwapPartnerAddress = styled.div`
  max-width: 120px;
`
