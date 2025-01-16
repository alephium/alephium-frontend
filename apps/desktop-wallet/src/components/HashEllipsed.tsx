import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ClipboardButton from '@/components/Buttons/ClipboardButton'
import Ellipsed from '@/components/Ellipsed'

interface HashEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  hash: string
  tooltipText?: string
  disableA11y?: boolean
  disableCopy?: boolean
  className?: string
  showSnackbarOnCopied?: boolean
}

const HashEllipsed = ({
  hash,
  disableA11y = false,
  disableCopy = false,
  tooltipText,
  className,
  showSnackbarOnCopied = true,
  ...props
}: HashEllipsedProps) => {
  const { t } = useTranslation()

  return disableCopy ? (
    <Container className={className}>
      <Ellipsed text={hash} {...props} />
    </Container>
  ) : (
    <ClipboardButtonStyled
      textToCopy={hash}
      tooltip={tooltipText ?? t('Copy address')}
      disableA11y={disableA11y}
      className={className}
      showSnackbarOnCopied={showSnackbarOnCopied}
    >
      <Ellipsed text={hash} {...props} />
    </ClipboardButtonStyled>
  )
}

export default HashEllipsed

const Container = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
`

const ClipboardButtonStyled = styled(ClipboardButton)`
  position: absolute;
  right: 6px;
`
