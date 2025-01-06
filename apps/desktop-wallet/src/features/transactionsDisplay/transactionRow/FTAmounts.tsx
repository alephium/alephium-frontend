import Amount from '@/components/Amount'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

const FTAmounts = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash, isInAddressDetailsModal)

  return fungibleTokens.map(({ id, amount }) => (
    <Amount key={id} tokenId={id} value={amount} highlight={infoType !== 'move'} showPlusMinus={infoType !== 'move'} />
  ))
}

export default FTAmounts
