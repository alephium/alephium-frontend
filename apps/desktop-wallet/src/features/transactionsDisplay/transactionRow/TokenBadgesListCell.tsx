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

import { ALPH } from '@alephium/token-list'
import styled from 'styled-components'

import TokenBadge from '@/components/TokenBadge'
import { TransactionRowProps, TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionAmountDeltas from '@/features/transactionsDisplay/useTransactionAmountDeltas'
import { deviceBreakPoints } from '@/style/globalStyles'

const TokenBadgesListCell = ({ tx, refAddressHash, compact }: TransactionRowSectionProps) => {
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, refAddressHash)

  return (
    <TokenBadgesListCellStyled compact={compact}>
      <AssetBadges>
        {alphAmount !== undefined && <TokenBadge tokenId={ALPH.id} />}
        {tokenAmounts.map(({ id }) => (
          <TokenBadge tokenId={id} key={id} />
        ))}
      </AssetBadges>
    </TokenBadgesListCellStyled>
  )
}

export default TokenBadgesListCell

const TokenBadgesListCellStyled = styled.div<Pick<TransactionRowProps, 'compact'>>`
  flex-shrink: 0;
  width: ${({ compact }) => (compact ? '80px' : '180px')};
  margin-right: var(--spacing-4);

  @media ${deviceBreakPoints.desktop} {
    width: 80px;
  }
`

const AssetBadges = styled.div`
  display: flex;
  gap: 10px;
  row-gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`
