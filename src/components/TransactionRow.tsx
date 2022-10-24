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

import { useTransactionInfo } from '../hooks/useTransactionalInfo'
import { useTransactionUI } from '../hooks/useTransactionUI'
import RootStackParamList from '../navigation/rootStackRoutes'
import { AddressTransaction } from '../types/transactions'
import { isPendingTx } from '../utils/transactions'
import Amount from './Amount'
import AppText from './AppText'
import HighlightRow from './HighlightRow'

dayjs.extend(relativeTime)

interface TransactionRowProps {
  tx: AddressTransaction
  isFirst?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
}

const TransactionRow = ({ tx, isFirst, isLast, style }: TransactionRowProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const { amount, infoType } = useTransactionInfo(tx, tx.address.hash)
  const { amountSign, Icon, iconColor } = useTransactionUI(infoType)

  const handleOnPress = () => {
    if (!isPendingTx(tx)) navigation.navigate('TransactionScreen', { tx })
  }

  return (
    <HighlightRow
      style={style}
      hasBottomBorder={!isLast}
      isBottomRounded={isLast}
      isTopRounded={isFirst}
      onPress={handleOnPress}
    >
      <Direction>
        <Icon size={16} strokeWidth={3} color={iconColor} />
      </Direction>
      <Date>{dayjs(tx.timestamp).fromNow()}</Date>
      <AddressHash numberOfLines={1} ellipsizeMode="middle">
        {tx.address.hash}
      </AddressHash>
      <AmountStyled prefix={amountSign} value={amount} fadeDecimals bold />
    </HighlightRow>
  )
}

export default memo(TransactionRow, (prevProps, nextProps) => {
  return (
    prevProps.tx.hash === nextProps.tx.hash &&
    prevProps.tx.address.hash === nextProps.tx.address.hash &&
    prevProps.isFirst === nextProps.isFirst &&
    prevProps.isLast === nextProps.isLast
  )
})

const Item = styled(AppText)`
  font-weight: bold;
`

const Direction = styled.View`
  align-items: center;
  flex-direction: column;
  margin-right: 20px;
`

const Date = styled(Item)`
  width: 25%;
  padding-right: 10px;
`

const AddressHash = styled(Item)`
  width: 35%;
  padding-right: 10px;
`

const AmountStyled = styled(Amount)`
  width: 25%;
  text-align: right;
`
