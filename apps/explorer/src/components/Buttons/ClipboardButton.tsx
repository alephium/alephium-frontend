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

import { MouseEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri'
import styled, { css } from 'styled-components'

import { useSnackbar } from '@/hooks/useSnackbar'

interface ClipboardButtonProps {
  textToCopy: string
  tooltip?: string
  hasBackground?: boolean
  className?: string
}

const ClipboardButton = ({ textToCopy, tooltip, className }: ClipboardButtonProps) => {
  const { t } = useTranslation()
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { displaySnackbar } = useSnackbar()

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard
      .writeText(textToCopy)
      .catch((e) => {
        throw e
      })
      .then(() => {
        setHasBeenCopied(true)
      })
  }

  useEffect(() => {
    // Reset icon after copy
    let interval: ReturnType<typeof setInterval>

    if (hasBeenCopied) {
      displaySnackbar({ text: t('Copied to clipboard.'), type: 'info' })

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [displaySnackbar, hasBeenCopied, t])

  return (
    <div className={className}>
      {!hasBeenCopied ? (
        <StyledClipboardIcon
          data-tooltip-id="default"
          data-tooltip-content={tooltip || t('Copy to clipboard')}
          onClick={handleClick}
        />
      ) : (
        <StyledCheckIcon />
      )}
    </div>
  )
}

export default styled(ClipboardButton)`
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  cursor: pointer;

  & svg {
    width: 1em;
    height: 1em;
  }

  ${({ hasBackground }) =>
    hasBackground &&
    css`
      background-color: ${({ theme }) => theme.bg.accent};
      padding: 3px;
      border-radius: 4px;

      & svg {
        width: 0.8em;
        height: 0.8em;
      }
    `}
`

const StyledClipboardIcon = styled(RiFileCopyLine)`
  stroke: currentColor;
`

const StyledCheckIcon = styled(RiCheckLine)`
  color: ${({ theme }) => theme.global.valid};
`
