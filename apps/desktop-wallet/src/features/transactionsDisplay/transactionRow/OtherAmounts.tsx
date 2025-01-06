import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import Amount from '@/components/Amount'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

interface TransactionOtherTokenAmountsProps extends TransactionRowSectionProps {
  type: 'nfts' | 'nsts'
}

const OtherAmounts = ({ tx, refAddressHash, isInAddressDetailsModal, type }: TransactionOtherTokenAmountsProps) => {
  const {
    data: { [type]: tokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash, isInAddressDetailsModal)
  const { t } = useTranslation()

  const { nbOfTokensReceived, nbOfTokensSent } = useMemo(
    () =>
      tokens.reduce(
        (acc, { amount }) => {
          if (amount > 0) {
            acc.nbOfTokensReceived += 1
          } else {
            acc.nbOfTokensSent += 1
          }

          return acc
        },
        {
          nbOfTokensReceived: 0,
          nbOfTokensSent: 0
        }
      ),
    [tokens]
  )

  const props = { highlighted: infoType !== 'move', showPlusMinus: infoType !== 'move' }
  const suffix = type === 'nfts' ? t('NFTs') : t('Unknown')

  return (
    <>
      {nbOfTokensReceived > 0 && <Amount suffix={suffix} value={nbOfTokensReceived} {...props} />}
      {nbOfTokensSent > 0 && <Amount suffix={suffix} value={-nbOfTokensSent} {...props} />}
    </>
  )
}

export default OtherAmounts
