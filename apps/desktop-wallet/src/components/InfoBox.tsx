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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import styled, { css, DefaultTheme, useTheme } from 'styled-components'

import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'

type InfoBoxImportance = 'default' | 'accent' | 'alert' | 'warning'

export interface InfoBoxProps {
  text?: string
  Icon?: LucideIcon
  label?: string
  importance?: InfoBoxImportance
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
  small?: boolean
  short?: boolean
  contrast?: boolean
  noBorders?: boolean
  className?: string
}

const InfoBox: FC<InfoBoxProps> = ({
  Icon,
  text,
  label,
  importance = 'default',
  className,
  ellipsis,
  wordBreak,
  onClick,
  short,
  children,
  contrast,
  noBorders
}) => {
  const theme = useTheme()

  return (
    <div className={className} onClick={onClick}>
      {label && <Label variants={sectionChildrenVariants}>{label}</Label>}
      <StyledBox
        variants={sectionChildrenVariants}
        importance={importance}
        short={short}
        contrast={contrast}
        noBorders={noBorders}
      >
        {Icon && (
          <IconContainer>
            <Icon color={getImportanceColor(theme, importance)} strokeWidth={1.5} />
          </IconContainer>
        )}
        <TextContainer wordBreak={wordBreak} ellipsis={ellipsis}>
          {text || children}
        </TextContainer>
      </StyledBox>
    </div>
  )
}

const getImportanceColor = (theme: DefaultTheme, importance?: InfoBoxImportance) =>
  importance
    ? {
        default: theme.font.secondary,
        alert: theme.global.alert,
        warning: theme.global.highlight,
        accent: theme.global.accent
      }[importance]
    : theme.global.accent

export default styled(InfoBox)`
  width: 100%;
  margin: 0 auto var(--spacing-4) auto;
  margin-top: var(--spacing-2);
  max-width: ${({ small }) => (small ? '300px' : 'initial')};
  line-height: 1.5em;
`

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const TextContainer = styled.div<{ wordBreak?: boolean; ellipsis?: boolean }>`
  flex: 2;
  font-weight: var(--fontWeight-semiBold);
  word-break: ${({ wordBreak }) => (wordBreak ? 'break-all' : 'initial')};
  text-align: left;

  ${({ ellipsis }) =>
    ellipsis
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
        `
      : css`
          overflow-wrap: anywhere;
        `}
`

const StyledBox = styled(motion.div)<{
  importance?: InfoBoxImportance
  short?: boolean
  contrast?: boolean
  noBorders?: boolean
}>`
  padding: var(--spacing-3);
  height: ${({ short }) => (short ? 'var(--inputHeight)' : 'auto')};
  background-color: ${({ theme, contrast, importance }) =>
    contrast
      ? theme.bg.secondary
      : importance
        ? colord(getImportanceColor(theme, importance)).alpha(0.15).toHex()
        : theme.bg.primary};

  display: flex;
  border-radius: var(--radius-big);
  align-items: center;
  gap: 15px;

  ${({ theme, importance, noBorders }) =>
    !noBorders &&
    css`
      border: 1px solid ${colord(getImportanceColor(theme, importance)).alpha(0.2).toHex()};
    `}
`

const Label = styled(motion.label)`
  display: block;
  width: 100%;
  margin-left: var(--spacing-3);
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-semiBold);
`
