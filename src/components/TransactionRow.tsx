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
import styled, { css } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import { useTransactionUI } from '~/hooks/useTransactionUI'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { BORDER_RADIUS } from '~/style/globalStyle'
import { AddressTransaction } from '~/types/transactions'
import { getTransactionInfo, isPendingTx } from '~/utils/transactions'

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
  const { assets, infoType } = getTransactionInfo(tx, showInternalInflows)
  const { Icon, iconColor, iconBgColor, label } = useTransactionUI(infoType)

  const handleOnPress = () => {
    if (!isPendingTx(tx)) navigation.navigate('TransactionScreen', { tx })
  }

  const isMoved = infoType === 'move'
  const knownAssets = assets.filter((asset) => !!asset.symbol)

  return (
    <HighlightRowStyled style={style} onPress={handleOnPress} isFirst={isFirst} isLast={isLast}>
      <Direction>
        <TransactionIcon color={iconBgColor}>
          <Icon size={16} strokeWidth={3} color={iconColor} />
        </TransactionIcon>
      </Direction>
      <Date>
        <AppText bold>{label}</AppText>
        <AppText color="tertiary">{dayjs(tx.timestamp).fromNow()}</AppText>
      </Date>
      <AssetLogos>
        {assets.map((asset) => (
          <AssetLogo assetId={asset.id} key={asset.id} size={20} />
        ))}
      </AssetLogos>
      <AmountColumn>
        {knownAssets.map(({ id, amount, decimals, symbol }) => (
          <AppText key={id}>
            <Amount
              value={amount}
              decimals={decimals}
              suffix={symbol}
              isUnknownToken={!symbol}
              highlight={!isMoved}
              showPlusMinus={!isMoved}
              bold
            />
          </AppText>
        ))}
      </AmountColumn>
    </HighlightRowStyled>
  )
}

export default memo(
  TransactionRow,
  (prevProps, nextProps) =>
    prevProps.tx.hash === nextProps.tx.hash &&
    prevProps.tx.address.hash === nextProps.tx.address.hash &&
    prevProps.isFirst === nextProps.isFirst &&
    prevProps.isLast === nextProps.isLast
)

const HighlightRowStyled = styled(HighlightRow)<{ isFirst?: boolean; isLast?: boolean }>`
  ${({ isFirst }) =>
    isFirst &&
    css`
      border-top-left-radius: ${BORDER_RADIUS}px;
      border-top-right-radius: ${BORDER_RADIUS}px;
    `}

  ${({ isLast }) =>
    isLast &&
    css`
      border-bottom-left-radius: ${BORDER_RADIUS}px;
      border-bottom-right-radius: ${BORDER_RADIUS}px;
    `}
`

const Direction = styled.View`
  align-items: center;
  flex-direction: column;
  margin-right: 20px;
`

const Date = styled.View`
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
  flex-shrink: 0;
`

const AssetLogos = styled.View`
  gap: 5px;
`
