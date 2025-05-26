import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useContext } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
import styled, { css } from 'styled-components'

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
    <RowContainer className="details" open={openCondition}>
      {children}
    </RowContainer>
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

const RowContainer = styled.tr<{ open: boolean }>`
  position: relative;

  ${({ open }) =>
    open &&
    css`
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 12px;
        right: 12px;
        border-top: 1px solid ${({ theme }) => theme.border.secondary};
      }
    `}
`

const AnimatedCellContainer = styled(motion.div)<{ alignItems: 'left' | 'right' }>`
  height: 100%;
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: ${({ alignItems }) => (alignItems === 'left' ? 'flex-start' : 'flex-end')};
`
