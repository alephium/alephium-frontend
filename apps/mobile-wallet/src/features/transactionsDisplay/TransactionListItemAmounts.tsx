import { SentTransaction } from '@alephium/shared'
import { useFetchTransactionTokens, useTransactionInfoType } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Badge from '~/components/Badge'
import { ConfirmedTransactionListItemSubcomponentProps } from '~/features/transactionsDisplay/transactionListItemTypes'

interface TransactionListItemAmountsProps
  extends Pick<ConfirmedTransactionListItemSubcomponentProps, 'refAddressHash'> {
  tx: ConfirmedTransactionListItemSubcomponentProps['tx'] | SentTransaction
}

const TransactionListItemAmounts = ({ tx, refAddressHash }: TransactionListItemAmountsProps) => {
  const { t } = useTranslation()
  const {
    data: { fungibleTokens, nfts, nsts }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  return (
    <TransactionListItemAmountsStyled>
      {fungibleTokens.map(({ id, amount }) => (
        <AssetAmountWithLogo
          key={id}
          assetId={id}
          amount={amount}
          showPlusMinus={infoType !== 'move'}
          logoPosition="right"
        />
      ))}
      {nfts.length > 0 && (
        <Badge>
          <AppText>
            {nfts.length} {t('NFTs')}
          </AppText>
        </Badge>
      )}
      {nsts.length > 0 && (
        <Badge light>
          <AppText color="tertiary">{t('unknownTokensKey', { count: nsts.length })}</AppText>
        </Badge>
      )}
    </TransactionListItemAmountsStyled>
  )
}

export default TransactionListItemAmounts

const TransactionListItemAmountsStyled = styled.View`
  flex: 1;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 6px;
`
