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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import IOList from '@/components/IOList'
import { TransactionDetailsModalSectionProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import { useTransactionDirection } from '@/utils/transactions'

const DirectionalInfo = ({ tx, addressHash }: TransactionDetailsModalSectionProps) => {
  const direction = useTransactionDirection(tx, addressHash)
  const { t } = useTranslation()

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
            <AddressBadge addressHash={addressHash} truncate withBorders isShort />
            <FromIn>{t('and')}</FromIn>
            <SwapPartnerAddress>
              <IOList
                currentAddress={addressHash}
                isOut={false}
                outputs={tx.outputs}
                inputs={tx.inputs}
                timestamp={tx.timestamp}
                linkToExplorer
              />
            </SwapPartnerAddress>
          </>
        ) : (
          <IOList
            currentAddress={addressHash}
            isOut={direction === 'out'}
            outputs={tx.outputs}
            inputs={tx.inputs}
            timestamp={tx.timestamp}
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
