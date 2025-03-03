import { isConfirmedTx } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TableCell } from '@/components/Table'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const IconLabelTimeCell = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const { Icon, iconColor, iconBgColor } = useTransactionIconLabel(tx, refAddressHash, isInAddressDetailsModal)

  return (
    <DirectionIconCellStyled fixedWidth={50} noBorder>
      <TransactionIcon color={iconBgColor}>
        <Icon size={15} strokeWidth={2} color={iconColor} />

        {isConfirmedTx(tx) && !tx.scriptExecutionOk && (
          <FailedTXBubble data-tooltip-id="default" data-tooltip-content={t('Script execution failed')}>
            !
          </FailedTXBubble>
        )}
      </TransactionIcon>
    </DirectionIconCellStyled>
  )
}

export default IconLabelTimeCell

const DirectionIconCellStyled = styled(TableCell)``

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
  width: 28px;
  height: 28px;
  position: relative;
  border-radius: 28px;
  background-color: ${({ color, theme }) => color || theme.font.primary};
`
