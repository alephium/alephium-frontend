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
