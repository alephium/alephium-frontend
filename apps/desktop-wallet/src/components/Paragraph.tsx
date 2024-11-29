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

import { HTMLMotionProps, motion } from 'framer-motion'
import styled, { css } from 'styled-components'

import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'

interface ParagraphProps {
  centered?: boolean
  secondary?: boolean
}

const Paragraph: FC<HTMLMotionProps<'p'> & ParagraphProps> = ({
  centered,
  secondary,
  children,
  className,
  style,
  ...props
}) => (
  <StyledParagraph
    variants={sectionChildrenVariants}
    className={className}
    centered={centered}
    secondary={secondary}
    style={style}
    {...props}
  >
    {children}
  </StyledParagraph>
)

export default Paragraph

const StyledParagraph = styled(motion.p)<ParagraphProps>`
  font-size: 16px;
  white-space: pre-wrap;
  font-weight: var(--fontWeight-medium);
  width: 100%;
  line-height: 1.5em;
  max-width: 400px;

  ${({ centered }) =>
    centered &&
    css`
      text-align: center;
      align-self: center;
    `}

  ${({ secondary, theme }) =>
    secondary &&
    css`
      color: ${theme.font.secondary};
    `}
`
