import { useTransactionAmountDeltas, useTransactionInfoType } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import { TransactionSummaryProps } from '@/features/transactionsDisplay/transactionDisplayTypes'

const TransactionAmounts = ({ tx, referenceAddress }: TransactionSummaryProps) => {
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, referenceAddress)
  const assetAmounts = useMemo(
    () => (alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ...tokenAmounts] : tokenAmounts),
    [alphAmount, tokenAmounts]
  )

  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view: 'wallet' })

  const isMoved = infoType === 'wallet-self-transfer'

  return <TokenAmountsBox assetAmounts={assetAmounts} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default TransactionAmounts
