import { AddressHash, findTransactionReferenceAddress } from '@alephium/shared'
import { useFetchTransactionTokens, useTransactionInfoType, useUnsortedAddressesHashes } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat' // ES 2015
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Badge from '~/components/Badge'
import ListItem, { ListItemProps } from '~/components/ListItem'
import useTransactionIconLabel from '~/features/transactionsDisplay/useTransactionIconLabel'

dayjs.extend(localizedFormat)

type TransactionListItemBaseProps = {
  tx: e.Transaction
  refAddressHash?: AddressHash
}

type TransactionListItemProps = Partial<ListItemProps> & TransactionListItemBaseProps

const TransactionListItem = memo(({ tx, refAddressHash, ...props }: TransactionListItemProps) => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const referenceAddressHash = refAddressHash ?? findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddressHash) return null

  const commonProps = { tx, refAddressHash: referenceAddressHash }

  return (
    <ListItem
      {...props}
      title={<TransactionLabel {...commonProps} />}
      subtitle={<TransactionTimestamp {...commonProps} />}
      icon={<TransactionIcon {...commonProps} />}
      rightSideContent={<TransactionAmounts {...commonProps} />}
      expandedSubtitle
    />
  )
})

export default TransactionListItem

type TransactionListItemSubcomponentProps = Required<TransactionListItemBaseProps>

const TransactionLabel = ({ tx, refAddressHash }: TransactionListItemSubcomponentProps) => {
  const { label } = useTransactionIconLabel(tx, refAddressHash)

  return label
}

const TransactionTimestamp = ({ tx }: TransactionListItemSubcomponentProps) => (
  <AppText color="tertiary" size={12} style={{ marginTop: 5 }}>
    {dayjs(tx.timestamp).format('lll')}
  </AppText>
)

const TransactionIcon = ({ tx, refAddressHash }: TransactionListItemSubcomponentProps) => {
  const { iconBgColor, iconColor, Icon } = useTransactionIconLabel(tx, refAddressHash)

  return (
    <TransactionIconStyled color={iconBgColor}>
      <Icon size={16} strokeWidth={3} color={iconColor} />

      {!tx.scriptExecutionOk && (
        <FailedTXBubble>
          <FailedTXBubbleText>!</FailedTXBubbleText>
        </FailedTXBubble>
      )}
    </TransactionIconStyled>
  )
}

const TransactionAmounts = ({ tx, refAddressHash }: TransactionListItemSubcomponentProps) => {
  const { t } = useTranslation()
  const {
    data: { fungibleTokens, nfts, nsts }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)

  return (
    <AmountColumn>
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
    </AmountColumn>
  )
}

const TransactionIconStyled = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  border-radius: 34px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  position: relative;
`

const AmountColumn = styled.View`
  flex: 1;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 6px;
`

const FailedTXBubble = styled.View`
  position: absolute;
  height: 14px;
  width: 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.global.alert};
  top: -5px;
  right: -5px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`

const FailedTXBubbleText = styled.Text`
  font-size: 10px;
  font-weight: 800;
  color: white;
`
