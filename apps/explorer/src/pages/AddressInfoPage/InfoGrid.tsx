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
  label: string
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
  background-color: ${({ theme }) => theme.border.secondary};
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1px;
  flex: 1;

  @media ${deviceBreakPoints.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CellContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px 20px;
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
  font-size: 24px;
  font-weight: 600;

  @media ${deviceBreakPoints.tiny} {
    font-size: 18px;
  }
`

const Sublabel = styled.div`
  margin-top: 8px;
`
