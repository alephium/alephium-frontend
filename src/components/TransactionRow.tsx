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
import { Transaction } from '@alephium/sdk/api/explorer'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import Arrow from '../images/Arrow'
import { Address } from '../store/addressesSlice'
import Amount from './Amount'

dayjs.extend(relativeTime)

interface TransactionRowProps {
  tx: Transaction & { address: Address }
  style?: StyleProp<ViewStyle>
  isLast?: boolean
}

const TransactionRow = ({ tx, style }: TransactionRowProps) => {
  const amount = calAmountDelta(tx, tx.address.hash)
  const amountIsBigInt = typeof amount === 'bigint'
  const isOut = amountIsBigInt && amount < 0
  const theme = useTheme()

  return (
    <View style={style}>
      <Direction>
        {isOut ? (
          <Arrow direction="up" color={theme.font.secondary} />
        ) : (
          <Arrow direction="down" color={theme.global.valid} />
        )}
      </Direction>
      <Date>{dayjs(tx.timestamp).fromNow()}</Date>
      <AddressHash numberOfLines={1}>{tx.address.hash}</AddressHash>
      <AmountStyled
        prefix={isOut ? '- ' : '+ '}
        value={BigInt(amountIsBigInt && amount < 0 ? (amount * -1n).toString() : amount.toString())}
        fadeDecimals
      />
    </View>
  )
}

export default styled(TransactionRow)`
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 20px 15px;

  ${({ isLast, theme }) =>
    !isLast &&
    css`
      border-bottom-color: ${({ theme }) => theme.border.secondary};
      border-bottom-width: 1px;
    `};
`

const Item = styled(Text)`
  font-weight: bold;
`

const Direction = styled(View)`
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
