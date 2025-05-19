import { useTransactionAmountDeltas } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import styled from 'styled-components'

import { TableCell } from '@/components/Table'
import TokenBadge from '@/components/TokenBadge'
import { TransactionRowProps, TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
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

const TokenBadgesListCellStyled = styled(TableCell)<Pick<TransactionRowProps, 'compact'>>`
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  width: ${({ compact }) => (compact ? '80px' : '180px')};

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
