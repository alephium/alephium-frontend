import styled from 'styled-components'

import { TableCell } from '@/components/Table'
import TimeSince from '@/components/TimeSince'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const TimestampCell = (props: TransactionRowSectionProps) => {
  const { label } = useTransactionIconLabel(props)

  return (
    <TimestampCellStyled>
      <LabelTime>
        <DirectionLabel>{label}</DirectionLabel>

        <AssetTime>
          <TimeSince timestamp={props.tx.timestamp} faded />
        </AssetTime>
      </LabelTime>
    </TimestampCellStyled>
  )
}

export default TimestampCell

const TimestampCellStyled = styled(TableCell)`
  display: flex;
  text-align: left;
  gap: 20px;
`

const LabelTime = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const DirectionLabel = styled.span`
  color: ${({ theme }) => theme.font.primary};
  font-size: 13px;
`

const AssetTime = styled.div`
  font-size: 12px;
  max-width: 120px;
`
