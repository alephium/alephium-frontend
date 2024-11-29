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

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import styled, { css } from 'styled-components'

interface PanelTitleProps {
  color?: string
  onBackButtonClick?: () => void
  size?: 'small' | 'big'
  useLayoutId?: boolean
  isSticky?: boolean
  centerText?: boolean
}

const PanelTitle: FC<PanelTitleProps> = ({
  color,
  children,
  onBackButtonClick,
  size,
  useLayoutId = true,
  isSticky = false,
  centerText = false
}) => {
  const { scrollY } = useScroll()

  const titleScale = useTransform(scrollY, [0, 50], [1, 0.6])

  return (
    <TitleContainer layoutId={useLayoutId ? 'sectionTitle' : ''} isSticky={isSticky} centerText={centerText}>
      {onBackButtonClick && (
        <BackArrow
          onClick={onBackButtonClick}
          onKeyDown={onBackButtonClick}
          strokeWidth={3}
          role="button"
          tabIndex={0}
        />
      )}
      <H1 color={color} size={size} style={isSticky ? { scale: titleScale, originX: 0 } : {}}>
        {children}
      </H1>
    </TitleContainer>
  )
}

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
      background-color: ${({ theme }) => theme.bg.background1};
      border-bottom: 1px solid ${({ theme }) => theme.border.primary};
    `}
`

const BackArrow = styled(ArrowLeft)`
  height: 47px;
  width: var(--spacing-4);
  margin-right: var(--spacing-4);
  cursor: pointer;
`

const H1 = styled(motion.h1)<PanelTitleProps>`
  flex: 1;
  margin: 0;
  color: ${({ theme, color }) => (color ? color : theme.font.primary)};
  font-size: ${({ size }) => (size === 'small' ? '21px' : size === 'big' ? '38px' : 'revert')};
  font-weight: var(--fontWeight-semiBold);
`
