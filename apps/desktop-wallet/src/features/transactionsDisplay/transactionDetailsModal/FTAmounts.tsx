import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const FTAmounts = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'

  return <CheckAmountsBox assetAmounts={fungibleTokens} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default FTAmounts
