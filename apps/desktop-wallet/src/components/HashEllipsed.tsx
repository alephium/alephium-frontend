import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ClipboardButton from '@/components/Buttons/ClipboardButton'
import Ellipsed from '@/components/Ellipsed'
import Truncate from '@/components/Truncate'

interface HashEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  hash: string
  tooltipText?: string
  disableA11y?: boolean
  disableCopy?: boolean
  className?: string
  showSnackbarOnCopied?: boolean
  truncate?: boolean
  maxWidth?: number
}

const HashEllipsed = ({
  hash,
  disableA11y = false,
  disableCopy = false,
  tooltipText,
  className,
  showSnackbarOnCopied = true,
  truncate = true,
  maxWidth = 100,
  ...props
}: HashEllipsedProps) => {
  const { t } = useTranslation()

  const content = disableCopy ? (
    <Ellipsed text={hash} {...props} />
  ) : (
    <ClipboardButtonStyled
      textToCopy={hash}
      tooltip={tooltipText ?? t('Copy address')}
      disableA11y={disableA11y}
      showSnackbarOnCopied={showSnackbarOnCopied}
    >
      <Ellipsed className={className} text={hash} {...props} />
    </ClipboardButtonStyled>
  )

  return (
    <Container className={className}>
      {truncate ? <Truncate style={{ maxWidth }}>{content}</Truncate> : content}
    </Container>
  )
}

export default HashEllipsed

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
`

const ClipboardButtonStyled = styled(ClipboardButton)`
  position: absolute;
  right: 6px;
`
