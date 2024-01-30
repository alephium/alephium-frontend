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

import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useContext } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
import styled from 'styled-components'

interface DetailsRowProps {
  openCondition: boolean
}

interface AnimatedCellProps {
  colSpan?: number
  alignItems?: 'left' | 'right'
  className?: string
}

interface DetailToggleProps {
  isOpen: boolean
}

export const TableDetailsRow: FC<DetailsRowProps> = ({ children, openCondition }) => (
  <OpenConditionContext.Provider value={openCondition}>
    <tr className="details">{children}</tr>
  </OpenConditionContext.Provider>
)

export const AnimatedCell: FC<AnimatedCellProps> = ({ children, className, colSpan, alignItems = 'left' }) => {
  const condition = useContext(OpenConditionContext)

  return (
    <td colSpan={colSpan}>
      <AnimatePresence>
        {condition && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className={className}
          >
            <AnimatedCellContainer alignItems={alignItems}>{children}</AnimatedCellContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </td>
  )
}

export const DetailToggle = ({ isOpen }: DetailToggleProps) => (
  <span style={{ padding: 0, textAlign: 'center', overflow: 'hidden' }}>
    <DetailToggleWrapper animate={isOpen ? 'open' : 'closed'} variants={variants}>
      <RiArrowDownSLine size={20} />
    </DetailToggleWrapper>
  </span>
)

const variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
}

const OpenConditionContext = createContext(false)

const DetailToggleWrapper = styled(motion.div)`
  cursor: pointer;
  color: ${({ theme }) => theme.font.tertiary};
`

const AnimatedCellContainer = styled(motion.div)<{ alignItems: 'left' | 'right' }>`
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: ${({ alignItems }) => (alignItems === 'left' ? 'flex-start' : 'flex-end')};
`
