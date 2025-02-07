import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

interface PanelTitleProps {
  color?: string
  onBackButtonClick?: () => void
  size?: 'small' | 'big'
  isSticky?: boolean
  centerText?: boolean
  children?: ReactNode
}

const PanelTitle = ({
  color,
  children,
  onBackButtonClick,
  size,
  isSticky = false,
  centerText = false
}: PanelTitleProps) => (
  <TitleContainer isSticky={isSticky} centerText={centerText}>
    {onBackButtonClick && (
      <BackArrow onClick={onBackButtonClick} onKeyDown={onBackButtonClick} strokeWidth={3} role="button" tabIndex={0} />
    )}
    <H1 color={color} size={size}>
      {children}
    </H1>
  </TitleContainer>
)

export default PanelTitle

export const TitleContainer = styled(motion.div)<Pick<PanelTitleProps, 'isSticky' | 'centerText'>>`
  display: flex;
  align-items: center;
  top: 0;

  ${({ centerText }) => centerText && 'text-align: center'};

  ${({ isSticky }) =>
    isSticky &&
    css`
      position: sticky;
      padding: var(--spacing-8) 0 var(--spacing-4) 0;
      border-bottom: 1px solid ${({ theme }) => theme.border.primary};
    `}
`

const BackArrow = styled(ArrowLeft)`
  height: 47px;
  width: var(--spacing-4);
  margin-right: var(--spacing-4);
  cursor: pointer;
`

const H1 = styled.h1<PanelTitleProps>`
  flex: 1;
  color: ${({ theme, color }) => (color ? color : theme.font.primary)};
  font-size: ${({ size }) => (size === 'small' ? '16px' : size === 'big' ? '32px' : '28px')};
  font-weight: var(--fontWeight-semiBold);
  margin: 0;
`
