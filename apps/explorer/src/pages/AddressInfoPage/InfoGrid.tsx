import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { deviceBreakPoints } from '@/styles/globalStyles'

interface InfoGridProps {
  children: ReactNode
  className?: string
}

const InfoGrid = ({ children, className }: InfoGridProps) => <div className={className}>{children}</div>

// Subcomponent declaration

interface GridCellProps {
  label: string | ReactNode
  value?: ReactNode
  sublabel?: ReactNode
  className?: string
}

const GridCell = ({ label, value, sublabel, className }: GridCellProps) => (
  <CellContainer className={className}>
    <Label>{label}</Label>
    {value !== undefined ? (
      <Value initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {value}
      </Value>
    ) : (
      <SkeletonLoader height="27px" width="100px" />
    )}
    {sublabel && <Sublabel>{sublabel}</Sublabel>}
  </CellContainer>
)

// Subcomponent assignement

InfoGrid.Cell = GridCell

export default styled(InfoGrid)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 6px;
  flex: 1;
  border-radius: 8px;

  @media ${deviceBreakPoints.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CellContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 0px 20px;
  border-radius: 8px;
`

const Label = styled.label`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
  margin-bottom: 8px;

  @media ${deviceBreakPoints.tiny} {
    font-size: 12px;
  }
`

const Value = styled(motion.div)`
  font-size: 22px;
  font-weight: 500;

  @media ${deviceBreakPoints.tiny} {
    font-size: 18px;
  }
`

const Sublabel = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.font.tertiary};
`
