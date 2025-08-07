import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import TokenBadge from '@/components/TokenBadge'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const FTAmounts = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, referenceAddress)
  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view })

  return fungibleTokens.map(({ id, amount }) => (
    <TokenBadge key={id} tokenId={id} amount={amount} showAmount displaySign={infoType !== 'wallet-self-transfer'} />
  ))
}

export default FTAmounts
