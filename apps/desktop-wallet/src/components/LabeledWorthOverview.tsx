import { ReactNode } from 'react'
import styled from 'styled-components'

import NetworkSwitch from '@/components/NetworkSwitch'

interface LabeledWorthOverviewProps {
  label: string
  children: ReactNode
  className?: string
}

const LabeledWorthOverview = ({ label, children, className }: LabeledWorthOverviewProps) => (
  <LabeledWorthOverviewStyled className={className}>
    <Surtitle>
      <Label>{label}</Label>
      <NetworkSwitch />
    </Surtitle>

    {children}
  </LabeledWorthOverviewStyled>
)

export default LabeledWorthOverview

const LabeledWorthOverviewStyled = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  * {
    font-feature-settings: 'tnum' off;
  }
`

const Surtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
`

const Label = styled.span`
  white-space: nowrap;
  color: ${({ theme }) => theme.font.tertiary};
  padding-left: 3px;
`
