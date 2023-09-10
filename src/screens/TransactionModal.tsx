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

import dayjs from 'dayjs'
import { openBrowserAsync } from 'expo-web-browser'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import IOList from '~/components/IOList'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenHeader, BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Row from '~/components/Row'
import { useAppSelector } from '~/hooks/redux'
import { AddressConfirmedTransaction } from '~/types/transactions'
import { getTransactionInfo } from '~/utils/transactions'

interface TransactionModalProps extends ModalContentProps {
  tx: AddressConfirmedTransaction
}

const TransactionModal = ({ tx, ...props }: TransactionModalProps) => {
  const explorerBaseUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const { direction, infoType, assets } = getTransactionInfo(tx)
  const explorerTxUrl = `${explorerBaseUrl}/transactions/${tx.hash}`
  const isOut = direction === 'out'
  const isMoved = infoType === 'move'

  return (
    <ModalContent {...props} verticalGap>
      <BottomModalScreenHeader>
        <BottomModalScreenTitle>Transaction</BottomModalScreenTitle>
        <Button
          iconProps={{ name: 'exit-outline' }}
          onPress={() => openBrowserAsync(explorerTxUrl)}
          round
          variant="accent"
          compact
        />
      </BottomModalScreenHeader>

      <BoxSurface type="highlight">
        <Row title="Amount" noMaxWidth transparent>
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
        </Row>
        <Row title="Timestamp" transparent>
          <AppTextStyled semiBold>{dayjs(tx.timestamp).toDate().toUTCString()}</AppTextStyled>
        </Row>
        <Row title="Status" transparent>
          <AppText semiBold>{tx.blockHash ? 'Confirmed' : 'Pending'}</AppText>
        </Row>
        <Row title="From" transparent>
          {isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
        </Row>
        <Row title="To" transparent>
          {!isOut ? <AddressBadge addressHash={tx.address.hash} /> : <IOList isOut={isOut} tx={tx} />}
        </Row>
        <Row title="Fee" transparent isLast>
          <Amount
            value={BigInt(tx.gasPrice) * BigInt(tx.gasAmount)}
            fadeDecimals
            fullPrecision
            bold
            showOnDiscreetMode
          />
        </Row>
      </BoxSurface>
    </ModalContent>
  )
}

export default TransactionModal

const AmountStyled = styled(Amount)`
  text-align: right;
`

const AppTextStyled = styled(AppText)`
  text-align: right;
`
