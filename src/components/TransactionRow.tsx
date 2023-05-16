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

import { calculateAmountWorth } from '@alephium/sdk'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import { useTransactionInfo } from '../hooks/useTransactionalInfo'
import { useTransactionUI } from '../hooks/useTransactionUI'
import RootStackParamList from '../navigation/rootStackRoutes'
import { AddressTransaction } from '../types/transactions'
import { currencies } from '../utils/currencies'
import { isPendingTx } from '../utils/transactions'
import Amount from './Amount'
import AppText from './AppText'
import HighlightRow from './HighlightRow'

dayjs.extend(relativeTime)

interface TransactionRowProps {
  tx: AddressTransaction
  isFirst?: boolean
  isLast?: boolean
  showInternalInflows?: boolean
  style?: StyleProp<ViewStyle>
}

const TransactionRow = ({ tx, isFirst, isLast, showInternalInflows = false, style }: TransactionRowProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const [price, currency] = useAppSelector((s) => [s.price, s.settings.currency])
  const { amount, infoType } = useTransactionInfo(tx, tx.address.hash, showInternalInflows)
  const { amountSign, Icon, iconColor, iconBgColor, label } = useTransactionUI(infoType)

  const fiatValue = price.value !== undefined && amount !== undefined ? calculateAmountWorth(amount, price.value) : 0

  const handleOnPress = () => {
    if (!isPendingTx(tx)) navigation.navigate('TransactionScreen', { tx })
  }

  return (
    <HighlightRow style={style} onPress={handleOnPress}>
      <Direction>
        <TransactionIcon color={iconBgColor}>
          <Icon size={16} strokeWidth={3} color={iconColor} />
        </TransactionIcon>
      </Direction>
      <TokenAndDate>
        <AppText bold>{label} ALPH</AppText>
        <AppText color="tertiary">{dayjs(tx.timestamp).fromNow()}</AppText>
      </TokenAndDate>
      <AmountColumn>
        <AppText>
          <AppText bold>{amountSign}</AppText>
          <Amount value={amount} fadeDecimals bold />
        </AppText>
        <FiatValue>
          <AppText bold color="tertiary">
            {amountSign}
          </AppText>
          <Amount isFiat value={fiatValue} bold suffix={currencies[currency].symbol} color="tertiary" />
        </FiatValue>
      </AmountColumn>
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

const Direction = styled.View`
  align-items: center;
  flex-direction: column;
  margin-right: 20px;
`

const TokenAndDate = styled.View`
  flex: 1;
  padding-right: 10px;
`

const TransactionIcon = styled.View<{ color?: string }>`
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`

const AmountColumn = styled.View`
  flex: 1;
  align-items: flex-end;
`

const FiatValue = styled(AppText)`
  font-size: 12px;
`
