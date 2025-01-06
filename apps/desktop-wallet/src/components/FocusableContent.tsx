import { AnimatePresence } from 'framer-motion'
import { ChevronsDownUp } from 'lucide-react'
import { KeyboardEvent, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInOutFast } from '@/animations'
import Button from '@/components/Button'
import { ModalBackdrop } from '@/modals/ModalContainer'

interface FocusableContentProps {
  isFocused: boolean
  className?: string
  onClose: () => void
}

const FocusableContent: FC<FocusableContentProps> = ({ className, children, isFocused, onClose }) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  const handleEscapeKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (isFocused) modalRef.current?.focus()
  }, [isFocused, modalRef])

  return (
    <div className={className} ref={modalRef} onKeyDown={handleEscapeKeyPress} tabIndex={0}>
      <AnimatePresence>{isFocused && <ModalBackdrop {...fadeInOutFast} onClick={onClose} />}</AnimatePresence>
      <Content>
        {children}

        {isFocused && (
          <CollapseRow onClick={onClose}>
            <Button role="secondary" onClick={onClose} Icon={ChevronsDownUp} short>
              {t('Close')}
            </Button>
          </CollapseRow>
        )}
      </Content>
    </div>
  )
}

const Content = styled.div`
  height: 100%;
`

export default styled(FocusableContent)`
  &:focus {
    outline: none;
  }

  ${ModalBackdrop} {
    z-index: 2;
  }

  ${({ isFocused }) =>
    isFocused &&
    css`
      ${Content} {
        z-index: 2;
        position: relative;
      }
    `}
`

const CollapseRow = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  bottom: -60px;
`
