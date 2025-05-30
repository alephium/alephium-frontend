import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import TokenBadge from '@/components/TokenBadge'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const FTAmounts = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash, isInAddressDetailsModal)

  return fungibleTokens.map(({ id, amount }) => (
    <TokenBadge key={id} tokenId={id} amount={amount} showAmount displaySign={infoType !== 'move'} />
  ))
}

export default FTAmounts
