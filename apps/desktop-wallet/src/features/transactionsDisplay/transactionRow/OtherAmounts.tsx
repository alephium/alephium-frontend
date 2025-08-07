import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

interface TransactionOtherTokenAmountsProps extends TransactionRowSectionProps {
  type: 'nfts' | 'nsts'
}

const OtherAmounts = ({ tx, referenceAddress, view, type }: TransactionOtherTokenAmountsProps) => {
  const {
    data: { [type]: tokens }
  } = useFetchTransactionTokens(tx, referenceAddress)
  const infoType = useTransactionInfoType({ tx, referenceAddress: referenceAddress, view })
  const { t } = useTranslation()
  const theme = useTheme()

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

  const props = { highlighted: infoType !== 'wallet-self-transfer', showPlusMinus: infoType !== 'wallet-self-transfer' }
  const suffix = type === 'nfts' ? t('NFTs') : t('Unknown')

  if (nbOfTokensReceived === 0 && nbOfTokensSent === 0) return null

  return (
    <BadgeStyled
      short
      border={type === 'nfts'}
      transparent={type !== 'nfts'}
      color={
        infoType !== 'wallet-self-transfer'
          ? nbOfTokensReceived > 0
            ? theme.global.valid
            : nbOfTokensSent > 0
              ? theme.font.highlight
              : undefined
          : undefined
      }
    >
      {nbOfTokensReceived > 0 && <Amount suffix={suffix} value={nbOfTokensReceived} {...props} />}
      {nbOfTokensSent > 0 && <Amount suffix={suffix} value={-nbOfTokensSent} {...props} />}
    </BadgeStyled>
  )
}

export default OtherAmounts

const BadgeStyled = styled(Badge)`
  margin-top: 8px;
`
