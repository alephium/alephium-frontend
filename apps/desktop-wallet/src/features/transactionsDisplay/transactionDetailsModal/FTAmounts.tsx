import styled from 'styled-components'

import Amount from '@/components/Amount'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

const FTAmounts = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'

  return (
    <FTAmountsStyled tabIndex={0}>
      {fungibleTokens.map(({ id, amount }) => (
        <Amount key={id} tokenId={id} tabIndex={0} value={amount} highlight={!isMoved} showPlusMinus={!isMoved} />
      ))}
    </FTAmountsStyled>
  )
}

export default FTAmounts

const FTAmountsStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`
