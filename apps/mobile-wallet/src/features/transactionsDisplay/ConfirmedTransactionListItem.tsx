import { findTransactionReferenceAddress } from '@alephium/shared'
import { useUnsortedAddressesHashes } from '@alephium/shared-react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat' // ES 2015
import { memo } from 'react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import ListItem, { ListItemProps } from '~/components/ListItem'
import TransactionIconStyled from '~/features/transactionsDisplay/TransactionIcon'
import TransactionListItemAmounts from '~/features/transactionsDisplay/TransactionListItemAmounts'
import {
  ConfirmedTransactionListItemBaseProps,
  ConfirmedTransactionListItemSubcomponentProps
} from '~/features/transactionsDisplay/transactionListItemTypes'
import useTransactionIconLabel from '~/features/transactionsDisplay/useTransactionIconLabel'

dayjs.extend(localizedFormat)

type ConfirmedTransactionListItemProps = Partial<ListItemProps> & ConfirmedTransactionListItemBaseProps

const ConfirmedTransactionListItem = memo(({ tx, referenceAddress, ...props }: ConfirmedTransactionListItemProps) => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const referenceAddressHash = referenceAddress ?? findTransactionReferenceAddress(allAddressHashes, tx)

  if (!referenceAddressHash) return null

  const commonProps = { tx, referenceAddress: referenceAddressHash }

  return (
    <ListItem
      {...props}
      title={<TransactionLabel {...commonProps} />}
      subtitle={<TransactionTimestamp {...commonProps} />}
      icon={<TransactionIcon {...commonProps} />}
      rightSideContent={<TransactionListItemAmounts {...commonProps} />}
      expandedSubtitle
    />
  )
})

export default ConfirmedTransactionListItem

const TransactionLabel = ({ tx, referenceAddress }: ConfirmedTransactionListItemSubcomponentProps) => {
  const { label } = useTransactionIconLabel(tx, referenceAddress)

  return label
}

const TransactionTimestamp = ({ tx }: ConfirmedTransactionListItemSubcomponentProps) => (
  <AppText color="tertiary" size={12} style={{ marginTop: 5 }}>
    {dayjs(tx.timestamp).format('lll')}
  </AppText>
)

const TransactionIcon = ({ tx, referenceAddress }: ConfirmedTransactionListItemSubcomponentProps) => {
  const { iconBgColor, iconColor, Icon } = useTransactionIconLabel(tx, referenceAddress)

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
