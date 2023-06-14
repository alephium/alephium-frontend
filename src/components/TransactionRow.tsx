/*
Copyright 2018 - 2022 The Alephium Authors
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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import { useTransactionUI } from '~/hooks/useTransactionUI'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { AddressTransaction } from '~/types/transactions'
import { getTransactionInfo, isPendingTx } from '~/utils/transactions'

dayjs.extend(relativeTime)

interface TransactionRowProps {
  tx: AddressTransaction
  isLast?: boolean
  showInternalInflows?: boolean
  style?: StyleProp<ViewStyle>
}

const TransactionRow = ({ tx, isLast, showInternalInflows = false, style }: TransactionRowProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { assets, infoType } = getTransactionInfo(tx, showInternalInflows)
  const { Icon, iconColor, iconBgColor, label } = useTransactionUI(infoType)

  const handleOnPress = () => {
    if (!isPendingTx(tx)) navigation.navigate('TransactionScreen', { tx })
  }

  const isMoved = infoType === 'move'
  const knownAssets = assets.filter((asset) => !!asset.symbol)

  return (
    <ListItem
      style={style}
      onPress={handleOnPress}
      isLast={isLast}
      title={label}
      subtitle={dayjs(tx.timestamp).fromNow()}
      icon={
        <TransactionIcon color={iconBgColor}>
          <Icon size={16} strokeWidth={3} color={iconColor} />
        </TransactionIcon>
      }
      rightSideContent={
        <>
          <AssetLogos>
            {assets.map((asset) => (
              <AssetLogo assetId={asset.id} key={asset.id} size={20} />
            ))}
          </AssetLogos>
          <AmountColumn>
            {knownAssets.map(({ id, amount, decimals, symbol }) => (
              <Amount
                key={id}
                value={amount}
                decimals={decimals}
                suffix={symbol}
                isUnknownToken={!symbol}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
                bold
              />
            ))}
          </AmountColumn>
        </>
      }
    />
  )
}

export default memo(
  TransactionRow,
  (prevProps, nextProps) =>
    prevProps.tx.hash === nextProps.tx.hash &&
    prevProps.tx.address.hash === nextProps.tx.address.hash &&
    prevProps.isLast === nextProps.isLast
)

const TransactionIcon = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  border-radius: 34px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const AmountColumn = styled.View`
  flex: 1;
  align-items: flex-end;
  flex-shrink: 0;
`

const AssetLogos = styled.View`
  gap: 5px;
`
