/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import dayjs from 'dayjs'
import { memo } from 'react'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import ListItem, { ListItemProps } from '~/components/ListItem'
import { useTransactionUI } from '~/features/transactionsDisplay/useTransactionUI'
import { AddressTransaction } from '~/types/transactions'
import { getTransactionInfo, isPendingTx } from '~/utils/transactions'

interface TransactionListItemProps extends Partial<ListItemProps> {
  tx: AddressTransaction
  showInternalInflows?: boolean
}

const TransactionListItem = memo(({ tx, showInternalInflows = false, ...props }: TransactionListItemProps) => {
  const { assets, infoType } = getTransactionInfo(tx, showInternalInflows)
  const isFailedScriptTx = !isPendingTx(tx) && !tx.scriptExecutionOk
  const { Icon, iconColor, iconBgColor, label } = useTransactionUI({ infoType, isFailedScriptTx })

  const isMoved = infoType === 'move'
  const knownAssets = assets.filter((asset) => !!asset.symbol)

  return (
    <ListItem
      {...props}
      title={label}
      subtitle={dayjs(tx.timestamp).fromNow()}
      expandedSubtitle
      icon={
        <TransactionIcon color={iconBgColor}>
          <Icon size={16} strokeWidth={3} color={iconColor} />
          {isFailedScriptTx && (
            <FailedTXBubble>
              <FailedTXBubbleText>!</FailedTXBubbleText>
            </FailedTXBubble>
          )}
        </TransactionIcon>
      }
      rightSideContent={
        <AmountColumn>
          {knownAssets.map(({ id, amount, decimals, symbol }) => (
            <AssetAmountWithLogo key={id} assetId={id} amount={amount} showPlusMinus={!isMoved} logoPosition="right" />
          ))}
        </AmountColumn>
      }
    />
  )
})

export default TransactionListItem

const TransactionIcon = styled.View<{ color?: string }>`
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
`

const AssetLogos = styled.View`
  flex-shrink: 0;
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 5px;
`

const AmountStyled = styled(Amount)`
  text-align: right;
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
