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

import { StackScreenProps } from '@react-navigation/stack'
import dayjs from 'dayjs'
import { openBrowserAsync } from 'expo-web-browser'
import { ChevronRight as ChevronRightIcon } from 'lucide-react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import HighlightRow from '~/components/HighlightRow'
import IOList from '~/components/IOList'
import BoxSurface from '~/components/layout/BoxSurface'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getTransactionInfo } from '~/utils/transactions'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'TransactionScreen'>, ScrollScreenProps {}

const TransactionScreen = ({
  navigation,
  route: {
    params: { tx }
  },
  ...props
}: ScreenProps) => {
  const theme = useTheme()
  const { direction, infoType, assets } = getTransactionInfo(tx)
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const explorerTxUrl = `${explorerBaseUrl}/transactions/${tx.hash}`
  const isOut = direction === 'out'
  const isMoved = infoType === 'move'

  return (
    <ScrollScreen {...props}>
      <ScreenSectionRow>
        <BottomModalScreenTitle>Transaction</BottomModalScreenTitle>
        <ExplorerLink onPress={() => openBrowserAsync(explorerTxUrl)}>
          <ExplorerLinkText>See in explorer</ExplorerLinkText>
          <ChevronRightIcon size={24} color={theme.global.accent} />
        </ExplorerLink>
      </ScreenSectionRow>
      <ScreenSection>
        <BoxSurface>
          <HighlightRow title="Amount" noMaxWidth>
            {assets.map(({ id, amount, decimals, symbol }) => (
              <AmountStyled
                key={id}
                value={amount}
                decimals={decimals}
                suffix={symbol}
                isUnknownToken={!symbol}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
                fullPrecision
                bold
              />
            ))}
          </HighlightRow>
          <HighlightRow title="Timestamp">
            <AppTextStyled semiBold>{dayjs(tx.timestamp).toDate().toUTCString()}</AppTextStyled>
          </HighlightRow>
          <HighlightRow title="Status">
            <AppText semiBold>{tx.blockHash ? 'Confirmed' : 'Pending'}</AppText>
          </HighlightRow>
          <HighlightRow title="From">
            {isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
          </HighlightRow>
          <HighlightRow title="To">
            {!isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
          </HighlightRow>
          <HighlightRow title="Fee">
            <Amount
              value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)}
              fadeDecimals
              fullPrecision
              bold
              showOnDiscreetMode
            />
          </HighlightRow>
        </BoxSurface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default TransactionScreen

const ScreenSectionRow = styled(ScreenSection)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ExplorerLink = styled.Pressable`
  flex-direction: row;
`

const ExplorerLinkText = styled(AppText)`
  color: ${({ theme }) => theme.global.accent};
  font-size: 16px;
  font-weight: 700;
  margin-right: 10px;
`

const AmountStyled = styled(Amount)`
  text-align: right;
`

const AppTextStyled = styled(AppText)`
  text-align: right;
`
