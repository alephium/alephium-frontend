import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const FTAmounts = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  const isMoved = infoType === 'move'

  const assetAmounts = fungibleTokens.map(({ id, amount }) => ({ id, amount }))

  return <TokenAmountsBox assetAmounts={assetAmounts} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default FTAmounts
