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
    <div className={className}>
      <ClipboardContent>{children}</ClipboardContent>
      <ClipboardIcon
        data-tooltip-content={!hasBeenCopied ? tooltip ?? t('Copy to clipboard') : t('Copied')}
        data-tooltip-id="copy"
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
    </div>
  )
}

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

const ClipboardContent = styled.div`
  margin-right: -0.5em;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
`

export default styled(ClipboardButton)`
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
    -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 0px, rgba(0, 0, 0, 0) 10px, rgba(0, 0, 0, 1) 30px);
  }
`
