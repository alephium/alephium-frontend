import { isConfirmedTx } from '@alephium/shared'
import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TimeSince from '@/components/TimeSince'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const IconLabelTimeCell = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const { label, Icon, iconColor, iconBgColor } = useTransactionIconLabel(tx, refAddressHash, isInAddressDetailsModal)

  return (
    <IconLabelTimeCellStyled>
      <div>
        <TransactionIcon color={iconBgColor}>
          <Icon size={13} strokeWidth={3} color={iconColor} />

          {isConfirmedTx(tx) && !tx.scriptExecutionOk && (
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
