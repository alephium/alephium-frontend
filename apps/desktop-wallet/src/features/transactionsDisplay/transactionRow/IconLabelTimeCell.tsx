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

import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TimeSince from '@/components/TimeSince'
import { isPendingTx } from '@/features/transactionsDisplay/transactionDisplayUtils'
import { TransactionRowProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const IconLabelTimeCell = ({ tx, addressHash, isInAddressDetailsModal }: TransactionRowProps) => {
  const { t } = useTranslation()
  const { label, Icon, iconColor, iconBgColor } = useTransactionIconLabel(tx, addressHash, isInAddressDetailsModal)

  return (
    <IconLabelTimeCellStyled>
      <div>
        <TransactionIcon color={iconBgColor}>
          <Icon size={13} strokeWidth={3} color={iconColor} />

          {!isPendingTx(tx) && !tx.scriptExecutionOk && (
            <FailedTXBubble data-tooltip-id="default" data-tooltip-content={t('Script execution failed')}>
              !
            </FailedTXBubble>
          )}
        </TransactionIcon>
      </div>
      <LabelTime>
        <DirectionLabel>{label}</DirectionLabel>

        <AssetTime>
          <TimeSince timestamp={tx.timestamp} faded />
        </AssetTime>
      </LabelTime>
    </IconLabelTimeCellStyled>
  )
}

export default IconLabelTimeCell

const IconLabelTimeCellStyled = styled.div`
  display: flex;
  align-items: center;
  margin-right: 28px;
  text-align: left;
  width: 25%;
  gap: 20px;
`

const LabelTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const DirectionLabel = styled.span`
  color: ${({ theme }) => theme.font.primary};
  font-weight: var(--fontWeight-medium);
  font-size: 14px;
`

const AssetTime = styled.div`
  font-size: 12px;
  max-width: 120px;
`

const FailedTXBubble = styled.div`
  position: absolute;
  height: 14px;
  width: 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.global.alert};
  color: white;
  top: -5px;
  right: -5px;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
`

const TransactionIcon = styled.span<{ color?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  position: relative;
  border-radius: 30px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
  border: 1px solid
    ${({ color, theme }) =>
      colord(color || theme.font.primary)
        .alpha(0.15)
        .toHex()};
`
