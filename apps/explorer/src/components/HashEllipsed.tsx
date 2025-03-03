import { HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Ellipsed from '@/components/Ellipsed'

import ClipboardButton from './Buttons/ClipboardButton'

interface HashEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  hash: string
  copyTooltipText?: string
  disableCopy?: boolean
  className?: string
}

const HashEllipsed = ({ hash, copyTooltipText, disableCopy = false, className, ...props }: HashEllipsedProps) => {
  const { t } = useTranslation()

  return (
    <Container className={className}>
      <HashContainer>
        <Ellipsed text={hash} {...props} />
      </HashContainer>
      {!disableCopy && (
        <CopyButton
          textToCopy={hash}
          data-tooltip-id="default"
          data-tooltip-content={copyTooltipText || t('Copy hash')}
          className={className}
          hasBackground
        />
      )}
    </Container>
  )
}

export default HashEllipsed

const CopyButton = styled(ClipboardButton)`
  position: absolute;
  right: 0;
  display: none;
`

const HashContainer = styled.div`
  flex: 1;
  overflow: hidden;
`

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-family: 'Roboto Mono';
  line-height: normal;

  &:hover {
    ${CopyButton} {
      display: inline-flex;
    }

    ${HashContainer} {
      -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%);
      mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 20px, rgba(0, 0, 0, 1) 60px);
    }
  }
`
