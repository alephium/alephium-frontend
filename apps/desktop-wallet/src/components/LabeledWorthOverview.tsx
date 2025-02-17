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
  align-items: center;
  position: relative;
  margin: var(--spacing-4);
  gap: var(--spacing-2);
`

const Surtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
`

const Label = styled.span`
  flex: 1;
  white-space: nowrap;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 18px;
  padding-left: 5px;
`
