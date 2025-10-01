import { NOCACHE_PREFIX, useTransactionAmountDeltas, useTransactionInfoType } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import { TransactionDisplayProps } from '@/features/transactionsDisplay/transactionDisplayTypes'

const TransactionAmounts = ({
  tx,
  referenceAddress,
  skipCaching
}: TransactionDisplayProps & { skipCaching?: boolean }) => {
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, referenceAddress)
  const assetAmounts = useMemo(() => {
    const _tokenAmounts = tokenAmounts.map((t) => ({ ...t, id: skipCaching ? `${NOCACHE_PREFIX}${t.id}` : t.id }))
    return alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ..._tokenAmounts] : _tokenAmounts
  }, [alphAmount, skipCaching, tokenAmounts])

  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view: 'wallet' })

  const isMoved = infoType === 'wallet-self-transfer'

  return <TokenAmountsBox assetAmounts={assetAmounts} highlight={!isMoved} showPlusMinus={!isMoved} />
}

export default TransactionAmounts
