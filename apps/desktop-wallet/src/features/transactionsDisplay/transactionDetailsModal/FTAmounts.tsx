import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const FTAmounts = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'

  return <TokenAmountsBox assetAmounts={fungibleTokens} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default FTAmounts
