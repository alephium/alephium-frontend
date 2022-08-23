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

import { calAmountDelta } from '@alephium/sdk'
import { useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Arrow from '../images/Arrow'
import { DisplayTx } from '../types/transactions'
import Amount from './Amount'
import HighlightRow from './HighlightRow'

dayjs.extend(relativeTime)

interface TransactionRowProps {
  tx: DisplayTx
  isFirst?: boolean
  isLast?: boolean
  style?: StyleProp<ViewStyle>
}

const TransactionRow = ({ tx, isFirst, isLast, style }: TransactionRowProps) => {
  const theme = useTheme()
  const navigation = useNavigation()

  let amount = calAmountDelta(tx, tx.address.hash)
  const isOut = amount < 0
  amount = isOut ? amount * BigInt(-1) : amount

  return (
    <HighlightRow
      style={style}
      hasBottomBorder={!isLast}
      isBottomRounded={isLast}
      isTopRounded={isFirst}
      onPress={() => navigation.navigate('TransactionScreen', { tx, isOut, amount })}
    >
      <Direction>
        {isOut ? (
          <Arrow direction="up" color={theme.font.secondary} />
        ) : (
          <Arrow direction="down" color={theme.global.valid} />
        )}
      </Direction>
      <Date>{dayjs(tx.timestamp).fromNow()}</Date>
      <AddressHash numberOfLines={1} ellipsizeMode="middle">
        {tx.address.hash}
      </AddressHash>
      <AmountStyled prefix={isOut ? '- ' : '+ '} value={amount} fadeDecimals />
    </HighlightRow>
  )
}

export default memo(TransactionRow, (prevProps, nextProps) => {
  return prevProps.tx.hash === nextProps.tx.hash && prevProps.tx.address.hash === nextProps.tx.address.hash
})

const Item = styled.Text`
  font-weight: bold;
`

const Direction = styled.View`
  width: 15%;
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
  font-weight: bold;
`
