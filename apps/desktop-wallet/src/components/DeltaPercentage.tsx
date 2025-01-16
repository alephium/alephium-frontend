import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import Badge from '@/components/Badge'
import { useAppSelector } from '@/hooks/redux'

interface DeltaPercentageProps {
  initialValue: number
  latestValue: number
  className?: string
}

const DeltaPercentage = ({ initialValue, latestValue, className }: DeltaPercentageProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  const percentage = Math.round(((latestValue - initialValue) / initialValue) * 10000) / 100
  const isUp = percentage >= 0
  const color = discreetMode ? theme.font.primary : isUp ? theme.global.valid : theme.global.alert

  const DirectionArrow = percentage >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <DeltaPercentageStyled
      className={className}
      color={color}
      discreetMode={discreetMode}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
    >
      <DirectionArrow color={color} />
      {percentage}%
    </DeltaPercentageStyled>
  )
}

export default DeltaPercentage

const DeltaPercentageStyled = styled(Badge)<{ discreetMode: boolean }>`
  display: flex;
  align-items: center;
  height: 24px;

  ${({ discreetMode }) =>
    discreetMode &&
    css`
      filter: blur(10px);
      overflow: hidden;
      cursor: pointer;
    `}
`
