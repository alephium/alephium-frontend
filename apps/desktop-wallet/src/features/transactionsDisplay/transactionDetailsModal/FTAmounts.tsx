import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const FTAmounts = ({ tx, referenceAddress }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, referenceAddress)
  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view: 'wallet' })

  const isMoved = infoType === 'wallet-self-transfer'

  return <TokenAmountsBox assetAmounts={fungibleTokens} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default FTAmounts
