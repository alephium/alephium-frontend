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
  flex-grow: 1;
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
