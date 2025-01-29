import { colord } from 'colord'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import Button from '@/components/Button'
import ScrollbarCustom from '@/components/Scrollbar'
import { closeModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import ModalContainer, { ModalContainerProps } from '@/modals/ModalContainer'

interface SideModalProps extends ModalContainerProps {
  title: string
  header?: ReactNode
  width?: number
  hideHeader?: boolean
}

const SideModal = ({ id, onClose, children, title, header, width = 500, hideHeader }: SideModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const elRef = useFocusOnMount<HTMLDivElement>()
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0)

  const _onClose = id ? () => dispatch(closeModal({ id })) : onClose

  const handleScroll = (scrollTop: number) => {
    const maxScroll = 100
    const newOpacity = Math.min(scrollTop / maxScroll, 1)
    setHeaderBgOpacity(newOpacity)
  }

  return (
    <ModalContainer id={id} onClose={_onClose}>
      <Sidebar width={width} className="open" role="dialog" aria-label={title} exit={{ x: 10, opacity: 0 }}>
        <ScrollbarCustom onScroll={handleScroll}>
          <ContentContainer ref={elRef} tabIndex={0}>
            {children}
          </ContentContainer>
        </ScrollbarCustom>

        {!hideHeader && (
          <ModalHeader>
            <ModalHeaderBackground style={{ opacity: headerBgOpacity }} />
            <ModalHeaderContent>
              <HeaderColumn>{header ?? <Title>{title}</Title>}</HeaderColumn>
              <CloseButton aria-label={t('Close')} circle role="secondary" onClick={_onClose} Icon={X} tiny />
            </ModalHeaderContent>
          </ModalHeader>
        )}
      </Sidebar>
    </ModalContainer>
  )
}

export default SideModal

const sideModalEnterAnimation = keyframes`
  0% {
    transform: translateX(10px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`

const Sidebar = styled(motion.div)<{ width: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ width }) => width}px;
  max-height: 95vh;
  background-color: ${({ theme }) => theme.bg.background1};
  position: relative;
  margin: 25px 20px 25px auto;
  border-radius: var(--radius-huge);
  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  overflow: hidden;

  &.open {
    animation: ${sideModalEnterAnimation} 0.2s ease;
  }
`

const ModalHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1;
`

const ModalHeaderBackground = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: ${({ theme }) => `linear-gradient(
    to bottom,
    ${colord(theme.bg.background2).toHex()} 55%,
    transparent
  )`};
`

const ModalHeaderContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 10px 16px 20px;
  height: 70px;
  z-index: 1;
`

const HeaderColumn = styled.div`
  flex-grow: 1;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  flex-shrink: 0;
`

const Title = styled.div`
  font-weight: var(--fontWeight-semiBold);
  font-size: 15px;
`

const ContentContainer = styled.div`
  padding-top: 70px;
`
