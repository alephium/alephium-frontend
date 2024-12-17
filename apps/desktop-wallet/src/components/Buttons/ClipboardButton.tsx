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

import { Check, Copy } from 'lucide-react'
import { SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppDispatch } from '@/hooks/redux'
import { copiedToClipboard } from '@/storage/global/globalActions'

interface ClipboardButtonProps {
  textToCopy: string
  disableA11y?: boolean
  tooltip?: string
  className?: string
  showSnackbarOnCopied?: boolean
}

const ClipboardButton: FC<ClipboardButtonProps> = ({
  tooltip,
  textToCopy,
  children,
  className,
  disableA11y = false,
  showSnackbarOnCopied = true
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [hasBeenCopied, setHasBeenCopied] = useState(false)

  const handleInput = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()

      navigator.clipboard
        .writeText(textToCopy)
        .catch((e) => {
          throw e
        })
        .then(() => {
          setHasBeenCopied(true)
        })
    },
    [setHasBeenCopied, textToCopy]
  )

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    // Reset icon after copy
    if (hasBeenCopied) {
      if (showSnackbarOnCopied) dispatch(copiedToClipboard())

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [dispatch, hasBeenCopied, showSnackbarOnCopied])

  return (
    <ClipboardButtonStyled>
      <ClipboardContent>{children}</ClipboardContent>
      <ClipboardIcon
        data-tooltip-content={!hasBeenCopied ? tooltip ?? t('Copy to clipboard') : t('Copied')}
        data-tooltip-id="copy"
        className={className}
      >
        {!hasBeenCopied ? (
          <Copy
            className="clipboard"
            onClick={handleInput}
            onKeyDown={handleInput}
            onMouseDown={handleInput}
            role="button"
            aria-label={disableA11y ? undefined : t('Copy to clipboard')}
            tabIndex={disableA11y ? undefined : 0}
          />
        ) : (
          <Check className="check" />
        )}
      </ClipboardIcon>
    </ClipboardButtonStyled>
  )
}

export default ClipboardButton

const ClipboardContent = styled.div`
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const ClipboardIcon = styled.div`
  opacity: 0;
  z-index: 1;

  & > .clipboard {
    cursor: pointer;
    color: ${({ theme }) => theme.font.secondary};

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: auto;
    }
  }

  & > .check {
    color: ${({ theme }) => theme.global.valid};
  }

  & > .clipboard,
  & > .check {
    width: 1em;
    height: 1em;
  }
`

const ClipboardButtonStyled = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;

  ${ClipboardIcon} {
    transform: translateY(1px);
  }

  &:hover > ${ClipboardIcon} {
    opacity: 1;
  }

  &:hover > ${ClipboardContent} {
    -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 20px, rgba(0, 0, 0, 1) 40px);
  }
`
